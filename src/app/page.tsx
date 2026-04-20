'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY!;
const CALENDAR_ID = process.env.NEXT_PUBLIC_CALENDAR_ID!;

const NO_DAYS = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
const NO_MONTHS = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];

interface CalEvent {
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
}

interface MonthGroup {
  key: string;
  date: Date;
  events: { ev: CalEvent; d: Date }[];
}

interface ParsedFields {
  host: string;
  arrangør: string;
  undertittel: string;
  lukket: string;
  privat: boolean;
  info: string;
}

interface PopupData {
  title: string;
  daytime: string;
  info: string;
  host: string;
  arrangør: string;
}

function formatDate(d: Date) { return `${d.getDate()}.${d.getMonth() + 1}`; }

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
}

function parseFields(raw: string): ParsedFields {
  const cleaned = (raw || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').trim();
  const result: ParsedFields = { host: '', arrangør: '', undertittel: '', lukket: '', privat: false, info: '' };

  let currentKey: string | null = null;
  let currentLines: string[] = [];

  const commit = () => {
    if (!currentKey) return;
    const value = currentLines.join('\n').trim();
    if (currentKey === 'host' && value) result.host = value;
    else if (currentKey === 'arrangør' && value) result.arrangør = value;
    else if (currentKey === 'undertittel' && value) result.undertittel = value;
    else if (currentKey === 'lukket' && value) result.lukket = value;
    else if (currentKey === 'privat' && value) result.privat = true;
    else if (currentKey === 'info' && value) result.info = value;
    currentKey = null;
    currentLines = [];
  };

  for (const line of cleaned.split('\n')) {
    const match = line.match(/^\[([^\]]+)\]=(.*)$/);
    if (match) {
      commit();
      currentKey = match[1].toLowerCase().trim();
      const firstLine = match[2].trim();
      if (firstLine) currentLines.push(firstLine);
    } else if (currentKey !== null) {
      currentLines.push(line);
    }
  }
  commit();

  return result;
}

function eventClass(title: string, parsed: ParsedFields) {
  const t = title.toLowerCase();
  if (t.includes('stengt') || t.includes('ferie') || t.includes('påske') || t.includes('jul')) return 'holiday';
  if (parsed.privat) return 'private';
  if (parsed.lukket !== '') return 'closed';
  return 'has-event';
}

function groupByMonth(events: CalEvent[]): MonthGroup[] {
  const map = new Map<string, MonthGroup>();
  for (const ev of events) {
    const startRaw = ev.start.dateTime || ev.start.date!;
    const d = new Date(startRaw);
    const key = monthKey(d);
    if (!map.has(key)) map.set(key, { key, date: d, events: [] });
    map.get(key)!.events.push({ ev, d });
  }
  return [...map.values()];
}

async function fetchWithFallback(url: string) {
  try {
    const res = await fetch(url);
    if (res.ok) return res.json();
  } catch (_) {}
  const proxy = 'https://corsproxy.io/?' + encodeURIComponent(url);
  const res = await fetch(proxy);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function Home() {
  const [months, setMonths] = useState<MonthGroup[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [status, setStatus] = useState<'loading' | 'error' | 'empty' | 'ok'>('loading');
  const [modal, setModal] = useState<PopupData | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const monthHeaderRef = useRef<HTMLDivElement>(null);
  const todayRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const past = new Date();
      past.setMonth(past.getMonth() - 3);
      const future = new Date();
      future.setMonth(future.getMonth() + 6);
      const calId = encodeURIComponent(CALENDAR_ID);
      const url = `https://www.googleapis.com/calendar/v3/calendars/${calId}/events`
        + `?key=${API_KEY}`
        + `&timeMin=${past.toISOString()}`
        + `&timeMax=${future.toISOString()}`
        + `&orderBy=startTime`
        + `&singleEvents=true`
        + `&maxResults=500`;
      try {
        const data = await fetchWithFallback(url);
        const items = (data.items || []).filter((ev: CalEvent) => ev.start.dateTime);
        if (!items.length) { setStatus('empty'); return; }
        const grouped = groupByMonth(items);
        const todayKey = monthKey(new Date());
        const idx = grouped.findIndex(m => m.key === todayKey);
        setMonths(grouped);
        setCurrentIdx(idx >= 0 ? idx : 0);
        setStatus('ok');
      } catch {
        setStatus('error');
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (status !== 'ok') return;
    const frame = requestAnimationFrame(() => {
      if (!todayRowRef.current) return;
      const stickyH = (navRef.current?.offsetHeight ?? 0) + (monthHeaderRef.current?.offsetHeight ?? 0);
      const top = todayRowRef.current.getBoundingClientRect().top + window.scrollY - stickyH;
      window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [status]);

  const closeModal = useCallback(() => {
    setModal(null);
    document.body.style.overflow = '';
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeModal]);

  const current = months[currentIdx];
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const scrollTargetIdx = current
    ? current.events.findIndex(({ d }) => d >= todayStart)
    : -1;

  return (
    <>
      <nav ref={navRef}>
        <a className="nav-logo" href="#">Bodega</a>
        <span className="nav-address">Kong Oscars Gate 23</span>
      </nav>

      {status === 'ok' && current && (
        <div className="month-header" ref={monthHeaderRef}>
          <button
            className="month-btn"
            onClick={() => setCurrentIdx(i => i - 1)}
            disabled={currentIdx === 0}
            aria-label="Forrige måned"
          >←</button>
          <div className="month-label">
            <span className="month-name">{NO_MONTHS[current.date.getMonth()]}</span>
            <span className="month-year">{current.date.getFullYear()}</span>
          </div>
          <button
            className="month-btn"
            onClick={() => setCurrentIdx(i => i + 1)}
            disabled={currentIdx === months.length - 1}
            aria-label="Neste måned"
          >→</button>
        </div>
      )}

      <div id="calendar-root">
        {status === 'loading' && (
          <div className="state-msg">
            <div className="spinner" />
            Henter program…
          </div>
        )}
        {status === 'error' && (
          <div className="state-msg">Kunne ikke hente program.</div>
        )}
        {status === 'empty' && (
          <div className="state-msg">Ingen kommende arrangementer.</div>
        )}
        {status === 'ok' && current && (
          current.events.length === 0
            ? <div className="empty-month">Ingen arrangementer denne måneden</div>
            : current.events.map(({ ev, d }, i) => {
                const title = ev.summary || 'Arrangement';
                const parsed = parseFields(ev.description || '');
                const cls = eventClass(title, parsed);
                const isToday = cls === 'has-event' && d.getDate() === todayStart.getDate() && d.getMonth() === todayStart.getMonth() && d.getFullYear() === todayStart.getFullYear();
                const dayName = NO_DAYS[d.getDay()];
                const dateStr = formatDate(d);
                const timeStr = ev.start.dateTime ? formatTime(ev.start.dateTime) : null;

                if (cls === 'private') return null;

                const hasPopup = cls === 'has-event' && !!parsed.info;

                const handleClick = hasPopup ? () => {
                  setModal({
                    title,
                    daytime: `${dayName} ${dateStr}${timeStr ? ' · ' + timeStr : ''}`,
                    info: parsed.info,
                    host: parsed.host,
                    arrangør: parsed.arrangør,
                  });
                  document.body.style.overflow = 'hidden';
                } : undefined;

                return (
                  <div
                    key={i}
                    ref={i === scrollTargetIdx ? todayRowRef : undefined}
                    className={`event-row ${cls} ${hasPopup ? 'has-popup' : ''} ${isToday ? 'today' : ''}`}
                    onClick={handleClick}
                  >
                    <div className="event-date">
                      <span className="event-date-num">{dateStr}</span>
                      <span className="event-day">{dayName}</span>
                    </div>
                    <div className="event-content">
                      <div className="event-title-group">
                        <span className="event-title">{title}</span>
                        <div className="event-meta">
                          {parsed.host && <span className="event-organizer">{parsed.host}</span>}
                          {parsed.arrangør && <span className="event-organizer">{parsed.arrangør}</span>}
                          {parsed.lukket && <span className="event-badge">{parsed.lukket}</span>}
                        </div>
                      </div>
                      {parsed.undertittel && <div className="event-subtitle">{parsed.undertittel}</div>}
                    </div>
                    <div className="event-time">{timeStr || '—'}</div>
                  </div>
                );
              })
        )}
      </div>

      {modal && (
        <div
          className="modal-overlay open"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="modal-frame">
          <div className="modal">
            <button className="modal-close" onClick={closeModal}>×</button>
            <div className="modal-header">
              <div className="modal-daytime">{modal.daytime}</div>
              <div className="modal-title">{modal.title}</div>
              {modal.host && <span className="event-organizer">{modal.host}</span>}
              {modal.arrangør && <span className="event-organizer">{modal.arrangør}</span>}
            </div>
            <div className="modal-body">{modal.info}</div>
          </div>
          </div>
        </div>
      )}

      <footer>
        <a href="https://instagram.com/bodega.part.no" target="_blank" rel="noopener noreferrer" className="footer-link">@bodega.part.no</a>
        <div className="footer-lease">
          <span className="footer-link">Leie Bodega?</span>
          <a href="mailto:bodega@part.no" className="footer-link">bodega@part.no</a>
        </div>
      </footer>
    </>
  );
}
