'use client';

import { useEffect, useState, useCallback } from 'react';

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

interface PopupData {
  title: string;
  daytime: string;
  desc: string;
  organizer: string | null;
}

function formatDate(d: Date) { return `${d.getDate()}.${d.getMonth() + 1}`; }

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
}

function eventClass(title: string, desc = '') {
  const t = title.toLowerCase();
  const d = desc.toLowerCase();
  if (t.includes('stengt') || t.includes('ferie') || t.includes('påske') || t.includes('jul')) return 'holiday';
  if (t.includes('[privat') || d.includes('[privat')) return 'private';
  if (t.includes('[lukket') || d.includes('[lukket')) return 'closed';
  return 'has-event';
}

function cleanTitle(title: string) {
  return title.replace(/\[(lukket|privat)[^\]]*\]/gi, '').trim();
}

function parseSubtitle(raw: string) {
  if (!raw?.trim()) return '';
  const parts = raw.split(/\/\/([^/]+)\//);
  return parts.map((part, i) => {
    if (!part.trim()) return '';
    const escaped = part.trim().replace(/\n/g, '<br>');
    return i % 2 === 0
      ? `<span class="sub-extra">${escaped}</span>`
      : `<span class="sub-main">${escaped}</span>`;
  }).join('');
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

  return (
    <>
      <nav>
        <a className="nav-logo" href="#">Bodega</a>
        <span className="nav-address">Kong Oscars Gate 23</span>
      </nav>

      {status === 'ok' && current && (
        <div className="month-header">
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
                const rawTitle = ev.summary || 'Arrangement';
                const title = cleanTitle(rawTitle);
                const rawDesc = (ev.description || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').trim();
                const organizerMatch = rawDesc.match(/\[(?!privat|lukket)([^\]]+)\]/i);
                const organizer = organizerMatch ? organizerMatch[1] : null;
                const desc = organizer ? rawDesc.replace(/\[[^\]]+\]/, '').trim() : rawDesc;
                const cls = eventClass(rawTitle, rawDesc);
                const today = new Date();
                const isToday = cls === 'has-event' && d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
                const dayName = NO_DAYS[d.getDay()];
                const dateStr = formatDate(d);
                const timeStr = ev.start.dateTime ? formatTime(ev.start.dateTime) : null;

                let subRaw = '', popupText = '';
                if (desc.includes('///')) {
                  const sepIdx = desc.indexOf('///');
                  subRaw = desc.slice(0, sepIdx).trim();
                  popupText = desc.slice(sepIdx + 3).trim();
                } else {
                  popupText = desc;
                }

                if (cls === 'private') return null;

                const hasPopup = cls === 'has-event' && !!popupText;
                const subHtml = subRaw ? parseSubtitle(subRaw) : '';

                const handleClick = hasPopup ? () => {
                  setModal({
                    title,
                    daytime: `${dayName} ${dateStr}${timeStr ? ' · ' + timeStr : ''}`,
                    desc: popupText,
                    organizer,
                  });
                  document.body.style.overflow = 'hidden';
                } : undefined;

                return (
                  <div
                    key={i}
                    className={`event-row ${cls} ${hasPopup ? 'has-popup' : ''}`}
                    onClick={handleClick}
                  >
                    <div className="event-date">
                      <span className={`event-date-num${isToday ? ' today' : ''}`}>{dateStr}</span>
                      <span className="event-day">{dayName}</span>
                    </div>
                    <div className="event-content">
                      <div className="event-title-group">
                        <span className="event-title">{title}</span>
                        <div className="event-meta">
                          {organizer && <span className="event-organizer">{organizer}</span>}
                          {cls === 'closed' && <span className="event-badge">Lukket</span>}
                        </div>
                      </div>
                      {subHtml && <div className="event-subtitle" dangerouslySetInnerHTML={{ __html: subHtml }} />}
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
              {modal.organizer && <span className="event-organizer">{modal.organizer}</span>}
            </div>
            <div className="modal-body">{modal.desc}</div>
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
