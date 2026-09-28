'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY!;
const CALENDAR_ID = process.env.NEXT_PUBLIC_CALENDAR_ID!;

// Bodega-web viser bevisst IKKE et fallback-bilde — kun events med egen [bilde]=
// får bilde i popupen. (Default-bildet er for den eksterne siden gaari.no.)
const DEFAULT_BILDE = '';

const NO_DAYS = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
const NO_MONTHS = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];

interface CalEvent {
  id?: string;
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
  overtittel: string;
  undertittel: string;
  lukket: string;
  privat: boolean;
  info: string;
  bilde: string;
}

interface Row {
  ev: CalEvent;
  d: Date;
  title: string;
  parsed: ParsedFields;
  cls: string;
}

interface PopupData {
  id: string;
  title: string;
  daytime: string;
  info: string;
  overtittel: string;
  bilde: string;
}

function formatDate(d: Date) { return `${d.getDate()}.${d.getMonth() + 1}`; }

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
}

// Nøkkelen som havner i URL-en er 1-basert, i motsetning til monthKey — «2026-09»
// skal bety september for den som leser adressefeltet.
function monthParam(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Google Calendar leverer summary og description HTML-escaped, så «Murt & Marios»
// kommer som «Murt &amp; Marios». Uten dekoding rendrer React entiteten bokstavelig.
// Dekodes ETTER at taggene er strippet — dekoder vi først, blir &lt;b&gt; til en ekte
// tagg som stripperen så spiser opp. Samme funksjon finnes i bodegenerator.
// Nettleseren kan navnetabellen selv, så vi slipper å vedlikeholde en egen —
// et håndholdt utvalg ville dekket &amp; men ikke &oslash;. Innhold i en textarea
// parses som RCDATA: tagger blir tekst, ingen elementer opprettes, ingenting kjører.
// Kalenderdata hentes klient-side, så DOM-en finnes når dette kalles.
function decodeEntities(s: string): string {
  if (typeof document === 'undefined') return s;
  const el = document.createElement('textarea');
  el.innerHTML = s;
  return el.value;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}

function parseFields(raw: string): ParsedFields {
  const cleaned = (raw || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const decoded = decodeEntities(cleaned);
  const result: ParsedFields = { overtittel: '', undertittel: '', lukket: '', privat: false, info: '', bilde: '' };

  let currentKey: string | null = null;
  let currentLines: string[] = [];

  const commit = () => {
    if (!currentKey) return;
    const value = currentLines.join('\n').trim();
    // Allowlist med vilje: et felt som ikke treffer en gren under blir kastet og
    // når aldri DOM-en. [Internt]=... (utstyr, rigg, huskelapper) er tuftet på
    // dette — det er slik teknisk info holdes ute av siden og av eventsøkene som
    // crawler oss. Skal beskrivelsen noen gang rendres i sin helhet, må [Internt]
    // strippes eksplisitt først, ellers lekker den i stillhet.
    if ((currentKey === 'overtittel' || currentKey === 'host' || currentKey === 'arrangør') && value && !result.overtittel) result.overtittel = value;
    else if (currentKey === 'undertittel' && value) result.undertittel = value;
    else if (currentKey === 'lukket' && value) result.lukket = value;
    else if (currentKey === 'privat' && value) result.privat = true;
    else if (currentKey === 'info' && value) result.info = value;
    else if (currentKey === 'bilde' && value) result.bilde = value;
    currentKey = null;
    currentLines = [];
  };

  for (const line of decoded.split('\n')) {
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

// Verdien er dekodet i parseFields, så den inneholder ekte «<» og «&». Den går inn
// i dangerouslySetInnerHTML, og må escapes før lenke-taggene injiseres — ellers blir
// «[Info]=<img onerror=…>» i kalenderen til et kjørende element.
function linkify(text: string) {
  return escapeHtml(text).replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

// «jul» skal treffe juleaften og julebord, men ikke «juli» — derfor negativt
// lookahead i stedet for includes, som gjorde «Sommerfest 5. juli» til helligdag.
const HOLIDAY_RE = /\b(?:stengt|ferie|påske|jul(?!i\b))/i;

function eventClass(title: string, parsed: ParsedFields) {
  // [Privat] avgjøres FØR helligdagsordene. Motsatt rekkefølge gjorde at et
  // lukket selskap som het «Julebord Firma AS» ble klassifisert som holiday og
  // rendret offentlig med full tittel, i stedet for å bli skjult.
  if (parsed.privat) return 'private';
  if (HOLIDAY_RE.test(title)) return 'holiday';
  if (parsed.lukket !== '') return 'closed';
  return 'has-event';
}

function groupByMonth(events: CalEvent[]): MonthGroup[] {
  const map = new Map<string, MonthGroup>();
  for (const ev of events) {
    const startRaw = ev.start.dateTime || ev.start.date!;
    const d = new Date(startRaw);
    const key = monthKey(d);
    if (!map.has(key)) map.set(key, { key, date: new Date(d.getFullYear(), d.getMonth(), 1), events: [] });
    map.get(key)!.events.push({ ev, d });
  }
  const sorted = [...map.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
  if (sorted.length < 2) return sorted;
  // Måneder uten arrangementer får en tom gruppe. Uten dem hopper pilen rett fra
  // august til oktober, og det leses som at knappen bomma — ikke som at oktober
  // er tom. Det er også dette som gjør .empty-month nåbar.
  const out: MonthGroup[] = [];
  const cursor = new Date(sorted[0].date);
  const last = sorted[sorted.length - 1].date;
  while (cursor <= last) {
    const key = monthKey(cursor);
    out.push(map.get(key) ?? { key, date: new Date(cursor), events: [] });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return out;
}

function popupFrom(r: Row): PopupData {
  const timeStr = r.ev.start.dateTime ? formatTime(r.ev.start.dateTime) : null;
  return {
    id: r.ev.id ?? '',
    title: r.title,
    daytime: `${NO_DAYS[r.d.getDay()]} ${formatDate(r.d)}${timeStr ? ' · ' + timeStr : ''}`,
    info: r.parsed.info,
    overtittel: r.parsed.overtittel,
    bilde: r.parsed.bilde,
  };
}

export default function Home() {
  const [months, setMonths] = useState<MonthGroup[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [status, setStatus] = useState<'loading' | 'error' | 'empty' | 'ok'>('loading');
  const [modal, setModal] = useState<PopupData | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const monthHeaderRef = useRef<HTMLDivElement>(null);
  const todayRowRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pendingEventId = useRef<string | null>(null);

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
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = (data.items || []).filter((ev: CalEvent) => ev.start.dateTime);
        if (!items.length) { setStatus('empty'); return; }
        const grouped = groupByMonth(items);
        const params = new URLSearchParams(window.location.search);
        const wanted = params.get('maned');
        pendingEventId.current = params.get('e');
        const fromUrl = wanted ? grouped.findIndex(m => monthParam(m.date) === wanted) : -1;
        const todayIdx = grouped.findIndex(m => m.key === monthKey(new Date()));
        setMonths(grouped);
        setCurrentIdx(fromUrl >= 0 ? fromUrl : Math.max(0, todayIdx));
        setStatus('ok');
      } catch {
        setStatus('error');
      }
    }
    load();
  }, []);

  const current = months[currentIdx];

  const rows = useMemo<Row[]>(() => {
    if (!current) return [];
    return current.events
      .map(({ ev, d }) => {
        const title = decodeEntities(ev.summary || 'Arrangement');
        const parsed = parseFields(ev.description || '');
        return { ev, d, title, parsed, cls: eventClass(title, parsed) };
      })
      // Filtreres FØR scrollTargetIdx regnes under. Regnet vi på den ufiltrerte
      // lista, ville ref-en aldri bli festet når første kommende rad er [Privat],
      // og auto-scrollen døde stille.
      .filter(r => r.cls !== 'private');
  }, [current]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const scrollTargetIdx = rows.findIndex(({ d }) => d >= todayStart);

  const setRowRef = useCallback((el: HTMLElement | null) => { todayRowRef.current = el; }, []);

  const closeModal = useCallback(() => {
    setModal(null);
    document.body.style.overflow = '';
    const url = new URL(window.location.href);
    if (url.searchParams.has('e')) {
      url.searchParams.delete('e');
      window.history.replaceState({}, '', url);
    }
  }, []);

  const openModal = useCallback((r: Row) => {
    const data = popupFrom(r);
    setModal(data);
    document.body.style.overflow = 'hidden';
    if (!data.id) return;
    const url = new URL(window.location.href);
    url.searchParams.set('e', data.id);
    window.history.pushState({}, '', url);
  }, []);

  const goMonth = useCallback((next: number) => {
    setCurrentIdx(next);
    const m = months[next];
    if (!m) return;
    const url = new URL(window.location.href);
    url.searchParams.set('maned', monthParam(m.date));
    url.searchParams.delete('e');
    window.history.pushState({}, '', url);
  }, [months]);

  // Åpner popupen for ?e=… når lenken er delt direkte. Kjøres når radene finnes,
  // og bare én gang — derfor nulles ref-en.
  useEffect(() => {
    const id = pendingEventId.current;
    if (!id || !rows.length) return;
    pendingEventId.current = null;
    const hit = rows.find(r => r.ev.id === id);
    if (!hit) return;
    setModal(popupFrom(hit));
    document.body.style.overflow = 'hidden';
  }, [rows]);

  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      const wanted = params.get('maned');
      if (wanted) {
        const i = months.findIndex(m => monthParam(m.date) === wanted);
        if (i >= 0) setCurrentIdx(i);
      }
      if (!params.get('e')) {
        setModal(null);
        document.body.style.overflow = '';
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [months]);

  // <dialog> eier åpen/lukket-tilstanden sin selv, så den synkes mot React-state
  // her. showModal() gir fokusfelle, Escape, inert bakgrunn og fokus tilbake til
  // raden som åpnet den — alt det vi ellers måtte skrevet for hånd.
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (modal && !dlg.open) dlg.showModal();
    else if (!modal && dlg.open) dlg.close();
  }, [modal]);

  useEffect(() => {
    if (status !== 'ok') return;
    const frame = requestAnimationFrame(() => {
      const stickyH = (navRef.current?.offsetHeight ?? 0) + (monthHeaderRef.current?.offsetHeight ?? 0);
      if (todayRowRef.current) {
        const top = todayRowRef.current.getBoundingClientRect().top + window.scrollY - stickyH;
        window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
      } else {
        // Andre måneder enn inneværende har ingen «i dag»-rad å sikte mot. Uten
        // dette ble scrollposisjonen stående, så et bytte til en kortere måned
        // landet deg i bunnen av den.
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [status, currentIdx]);

  return (
    <>
      <nav ref={navRef}>
        <h1 className="nav-logo">Bodega</h1>
        <span className="nav-address">Bar i Kong Oscars gate 23, Bergen</span>
      </nav>

      {status === 'ok' && current && (
        <div className="month-header" ref={monthHeaderRef}>
          <button
            className="month-btn"
            onClick={() => goMonth(currentIdx - 1)}
            disabled={currentIdx === 0}
            aria-label="Forrige måned"
          >←</button>
          <div className="month-label">
            <h2 className="month-name">{NO_MONTHS[current.date.getMonth()]}</h2>
            <span className="month-year">{current.date.getFullYear()}</span>
          </div>
          <button
            className="month-btn"
            onClick={() => goMonth(currentIdx + 1)}
            disabled={currentIdx === months.length - 1}
            aria-label="Neste måned"
          >→</button>
        </div>
      )}

      <main id="calendar-root">
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
          rows.length === 0
            ? <div className="empty-month">Ingen arrangementer denne måneden</div>
            : rows.map((r, i) => {
                const { ev, d, title, parsed, cls } = r;
                const isToday = cls === 'has-event' && d.getDate() === todayStart.getDate() && d.getMonth() === todayStart.getMonth() && d.getFullYear() === todayStart.getFullYear();
                const dayName = NO_DAYS[d.getDay()];
                const dateStr = formatDate(d);
                const timeStr = ev.start.dateTime ? formatTime(ev.start.dateTime) : null;
                const hasPopup = cls === 'has-event' && (!!parsed.info || !!parsed.bilde);
                const rowClass = `event-row ${cls} ${hasPopup ? 'has-popup' : ''} ${isToday ? 'today' : ''}`;
                const ref = i === scrollTargetIdx ? setRowRef : undefined;

                const inner = (
                  <>
                    {parsed.overtittel && <div className="event-overtitle">{parsed.overtittel}</div>}
                    <div className="event-date">
                      <span className="event-date-num">{dateStr}</span>
                      <span className="event-day">{dayName}</span>
                    </div>
                    <div className="event-content">
                      <div className="event-title-group">
                        <span className="event-title">{title}</span>
                        {parsed.lukket && <span className="event-badge">{parsed.lukket}</span>}
                      </div>
                      {parsed.undertittel && <div className="event-subtitle">{parsed.undertittel}</div>}
                    </div>
                    <div className="event-time">{timeStr || '—'}</div>
                  </>
                );

                // En rad som åpner popup er en knapp, ikke en div med onClick.
                // Det er det som gjør arrangementene nåbare med tastatur.
                return hasPopup ? (
                  <button key={i} type="button" ref={ref} className={rowClass} onClick={() => openModal(r)}>
                    {inner}
                  </button>
                ) : (
                  <div key={i} ref={ref} className={rowClass}>
                    {inner}
                  </div>
                );
              })
        )}
      </main>

      <dialog
        className="modal-frame"
        ref={dialogRef}
        onClose={closeModal}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeModal();
        }}
        aria-labelledby="modal-title"
      >
        {modal && (
          <div className="modal">
            <div className="modal-header">
              <button className="modal-close" onClick={closeModal} aria-label="Lukk">×</button>
              <div className="modal-daytime">{modal.daytime}</div>
              {modal.overtittel && <div className="event-overtitle modal-overtitle">{modal.overtittel}</div>}
              <h2 className="modal-title" id="modal-title">{modal.title}</h2>
            </div>
            {(modal.bilde || DEFAULT_BILDE) && (
              <img className="modal-image" src={modal.bilde || DEFAULT_BILDE} alt="" />
            )}
            {modal.info && (
              <div className="modal-body" dangerouslySetInnerHTML={{ __html: linkify(modal.info) }} />
            )}
          </div>
        )}
      </dialog>

      <footer>
        <div className="footer-lease footer-left">
          <a href="https://instagram.com/bodega.part.no" target="_blank" rel="noopener noreferrer" className="footer-link">@bodega.part.no</a>
          <a href="/compass" className="footer-link">Kompass →</a>
        </div>
        <div className="footer-lease">
          <span className="footer-link">Leie Bodega?</span>
          <a href="mailto:bodega@part.no" className="footer-link">bodega@part.no</a>
        </div>
      </footer>
    </>
  );
}
