import { decodeHTML } from 'entities';
import { APNINGSTIDER } from './utleie/innhold';

// Programmet hentes på serveren og caches i tre timer (OPPDATER_HVERT), og
// nullstilles ved hver deploy. Endringer i kalenderen dukker altså opp innen tre
// timer, ikke med en gang. Første besøk etter utløp får forrige versjon mens den
// nye hentes i bakgrunnen.
const OPPDATER_HVERT = 3 * 60 * 60;
export const SIDE = 'https://bodega.part.no';
export const KART = 'https://maps.google.com/?q=Bodega,+Kong+Oscars+gate+23,+5017+Bergen';

// ['Tor 16–22.30', 'Fre 15.30–01', 'Lør 19–01'] — lest fra utleiesidens tabell, så
// åpningstidene bare står ett sted.
export const APENT = APNINGSTIDER
  .filter(({ tid }) => tid !== 'Stengt')
  .map(({ dag, tid }) => `${dag.slice(0, 3)} ${tid}`);

const TZ = 'Europe/Oslo';
const DAGER = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
const MANEDER = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
const UKEDAG_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface GoogleEvent {
  id?: string;
  summary?: string;
  description?: string;
  start: { dateTime?: string; date?: string };
}

export interface Rad {
  id: string;
  start: string;
  dag: string;
  dato: string;
  ukedag: string;
  tid: string;
  tittel: string;
  overtittel: string;
  undertittel: string;
  lukket: string;
  info: string;
  infoHtml: string;
  bilde: string;
  cls: 'has-event' | 'closed';
}

export interface Maned {
  key: string;
  navn: string;
  ar: number;
  rader: Rad[];
}

const pad = (n: number) => String(n).padStart(2, '0');

// Serveren går i UTC. Alt som vises — dato, klokkeslett, hvilken måned et sent
// arrangement hører til, hva som er «i dag» — regnes derfor eksplisitt i norsk tid.
const delFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short',
});

function oslo(d: Date) {
  const p = Object.fromEntries(delFormat.formatToParts(d).map(x => [x.type, x.value]));
  return { y: +p.year, m: +p.month, d: +p.day, tid: `${p.hour}:${p.minute}`, ukedag: UKEDAG_EN.indexOf(p.weekday) };
}

export function iDag() {
  const o = oslo(new Date());
  return `${o.y}-${pad(o.m)}-${pad(o.d)}`;
}

interface Felter {
  overtittel: string;
  undertittel: string;
  lukket: string;
  privat: boolean;
  info: string;
  bilde: string;
}

// Google Calendar leverer summary og description HTML-escaped («Murt &amp; Marios»).
// Taggene strippes FØR dekoding — dekoder vi først, blir &lt;b&gt; til en ekte tagg
// som stripperen spiser opp. Samme konvensjon tolkes i bodegenerator.
function lesFelter(raw: string): Felter {
  const renset = (raw || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const ut: Felter = { overtittel: '', undertittel: '', lukket: '', privat: false, info: '', bilde: '' };

  let nokkel: string | null = null;
  let linjer: string[] = [];

  const lagre = () => {
    if (!nokkel) return;
    const verdi = linjer.join('\n').trim();
    // Allowlist med vilje: et felt som ikke treffer en gren under blir kastet og
    // forlater aldri serveren. [Internt]=... (utstyr, rigg, huskelapper) er tuftet
    // på dette. Skal beskrivelsen noen gang sendes i sin helhet, må [Internt]
    // strippes eksplisitt først, ellers lekker den i stillhet.
    if ((nokkel === 'overtittel' || nokkel === 'host' || nokkel === 'arrangør') && verdi && !ut.overtittel) ut.overtittel = verdi;
    else if (nokkel === 'undertittel' && verdi) ut.undertittel = verdi;
    else if (nokkel === 'lukket' && verdi) ut.lukket = verdi;
    else if (nokkel === 'privat' && verdi) ut.privat = true;
    else if (nokkel === 'info' && verdi) ut.info = verdi;
    else if (nokkel === 'bilde' && verdi) ut.bilde = verdi;
    nokkel = null;
    linjer = [];
  };

  for (const linje of decodeHTML(renset).split('\n')) {
    const treff = linje.match(/^\[([^\]]+)\]=(.*)$/);
    if (treff) {
      lagre();
      nokkel = treff[1].toLowerCase().trim();
      const forste = treff[2].trim();
      if (forste) linjer.push(forste);
    } else if (nokkel !== null) {
      linjer.push(linje);
    }
  }
  lagre();
  return ut;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}

// Info er dekodet, så den kan inneholde ekte «<». Den rendres som HTML og må
// escapes før lenke-taggene settes inn — ellers blir «[Info]=<img onerror=…>» i
// kalenderen et kjørende element.
function linkify(tekst: string) {
  return escapeHtml(tekst).replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

function tilRad(ev: GoogleEvent): Rad | null {
  const start = ev.start.dateTime;
  if (!start) return null;
  const f = lesFelter(ev.description || '');
  // [Privat] avgjøres først — et privat selskap med [Lukket] skal skjules, ikke
  // vises nedtonet. Det filtreres her, så det aldri sendes til nettleseren.
  if (f.privat) return null;
  const o = oslo(new Date(start));
  return {
    id: ev.id ?? '',
    start,
    dag: `${o.y}-${pad(o.m)}-${pad(o.d)}`,
    dato: `${o.d}.${o.m}`,
    ukedag: DAGER[o.ukedag],
    tid: o.tid,
    // Hardt mellomrom foran tankestreken, så den aldri står alene først på en linje.
    tittel: decodeHTML(ev.summary || 'Arrangement').trim().replace(/ ([–—]) /g, ' $1 '),
    overtittel: f.overtittel,
    undertittel: f.undertittel,
    lukket: f.lukket,
    info: f.info,
    infoHtml: f.info ? linkify(f.info) : '',
    bilde: f.bilde,
    cls: f.lukket ? 'closed' : 'has-event',
  };
}

// Vinduet rundes til hele måneder, så URL-en — og dermed cache-nøkkelen — er den
// samme hele måneden. Med klokkeslett i timeMin ble hver forespørsel en ny nøkkel.
async function hentGoogle(): Promise<GoogleEvent[]> {
  const n = new Date();
  const fra = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() - 3, 1));
  const til = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() + 7, 1));
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(process.env.NEXT_PUBLIC_CALENDAR_ID!)}/events`
    + `?key=${process.env.GOOGLE_CALENDAR_API_KEY}`
    + `&timeMin=${fra.toISOString()}&timeMax=${til.toISOString()}`
    + `&orderBy=startTime&singleEvents=true&maxResults=500`;
  // Servernøkkel uten NEXT_PUBLIC_, så den aldri havner i nettleseren. Den er
  // låst til Google Calendar API i Google Cloud, ikke til et domene.
  const res = await fetch(url, { next: { revalidate: OPPDATER_HVERT } });
  if (!res.ok) throw new Error(`Google Calendar svarte ${res.status}`);
  return (await res.json()).items ?? [];
}

// null betyr at henting feilet; [] betyr at kalenderen er tom.
export async function hentProgram(testsett?: string): Promise<Maned[] | null> {
  let items: GoogleEvent[];
  try {
    items = testsett && process.env.NODE_ENV === 'development'
      ? (await import('./testsett')).TESTSETT[testsett] ?? []
      : await hentGoogle();
  } catch {
    return null;
  }

  const map = new Map<string, Maned>();
  for (const ev of items) {
    const rad = tilRad(ev);
    if (!rad) continue;
    const key = rad.dag.slice(0, 7);
    if (!map.has(key)) map.set(key, lagManed(key));
    map.get(key)!.rader.push(rad);
  }
  const sortert = [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
  if (sortert.length < 2) return sortert;

  // Måneder uten arrangementer får en tom gruppe. Uten dem hopper pilen rett fra
  // august til oktober, og det leses som at knappen bomma.
  const ut: Maned[] = [];
  let [y, m] = sortert[0].key.split('-').map(Number);
  const siste = sortert[sortert.length - 1].key;
  for (let key = sortert[0].key; key <= siste; key = `${y}-${pad(m)}`) {
    ut.push(map.get(key) ?? lagManed(key));
    if (++m > 12) { m = 1; y++; }
  }
  return ut;
}

function lagManed(key: string): Maned {
  const [y, m] = key.split('-').map(Number);
  return { key, navn: MANEDER[m - 1], ar: y, rader: [] };
}

// En Drive-delingslenke er en nettside, ikke et bilde. Bare direkte bildelenker
// kan brukes der et annet nettsted skal hente selve bildet.
export function erBildelenke(url: string) {
  return /^https:\/\//.test(url) && !/drive\.google\.com\/(file|open)/.test(url);
}
