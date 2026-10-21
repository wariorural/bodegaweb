'use client';

// Kun dev: ?data=verst|tom|en|500 bytter Google-svaret mot et testsett i load().
// Verdiene er realistiske, ikke tilfeldige — hver rad treffer en bestemt svakhet.
// Datoene regnes fra inneværende måned, så settet går aldri ut på dato.

type Ev = { id: string; summary: string; description?: string; start: { dateTime?: string; date?: string } };

const now = new Date();
const y = now.getFullYear();
const m = now.getMonth();
const today = now.getDate();
const lastDay = new Date(y, m + 1, 0).getDate();
const day = (d: number) => Math.min(Math.max(d, 1), lastDay);
const at = (d: number, hh: number, mm = 0, monthOffset = 0) =>
  ({ dateTime: new Date(y, m + monthOffset, d, hh, mm).toISOString() });

const LANG_INFO = [
  'Dørene åpner 19:00. Billetter 150,- &amp; <b>gratis</b> for medlemmer av Bergen Jazzforum.',
  '',
  'Billetter: https://www.ticketmaster.no/event/kaizers-orchestra-hyllest-ompa-til-du-dor-bodega-bergen-tickets/1234567890?utm_source=instagram&amp;utm_medium=story',
  '',
  ...Array.from({ length: 14 }, (_, i) => `${20 + Math.floor(i / 4)}:${['00', '15', '30', '45'][i % 4]} — Sett ${i + 1}`),
  '',
  '[Internt]=Rigg: 2 x DI, monitor på scenekant. Nøkkel hos Torgeir. SKAL IKKE VISES.',
].join('<br>');

const verst: Ev[] = [
  { id: 'v1', summary: 'Julian Berntzen', description: '[Undertittel]=Akustisk, bare piano', start: at(day(1), 20) },
  {
    id: 'v2',
    summary: 'DJ Torgeir Kvamme b2b Sofie Ellingsen-Aasheim b2b Kristoffer Haugland',
    description: '[Arrangør]=Bergen Jazzforum i samarbeid med Nattjazz, Kulturetaten i Bergen kommune og Studentersamfunnet',
    start: at(day(2), 22),
  },
  { id: 'v3', summary: 'Jo', description: '[Lukket]=Stengt fra kl. 18 – privat selskap i hele lokalet', start: at(day(3), 18) },
  { id: 'v4', summary: 'Påmelding: https://forms.gle/x8KfP2qLmN7vR3tY9wZ', start: at(day(5), 19) },
  { id: 'v5', summary: 'Quiz', start: at(day(8), 17) },
  { id: 'v6', summary: '🎤 KARAOKE!!! 🎤 med DJ Ørjan', start: at(day(8), 20) },
  { id: 'v7', summary: '', description: '[Undertittel]=Tittel mangler i kalenderen', start: at(day(8), 23, 30) },
  { id: 'v8', summary: 'Høstferie – stengt hele uka', start: { date: new Date(y, m, day(10)).toISOString().slice(0, 10) } },
  {
    id: 'v9',
    summary: 'Platemesse i samarbeid med EKKO, Apollon Platebar og Hanne Kristine Ellingsen-Aasheims samling',
    description: `[Undertittel]=Ta med egne plater for bytte.\nKaffe fra 11.\n[Info]=Se programmet under.\n[Bilde]=https://drive.google.com/file/d/1aBcD2eFgH3iJkL4mNoP5qRsT6uVwX7yZ/view?usp=sharing`,
    start: at(today, 20),
  },
  {
    id: 'v10',
    summary: 'Kaizers Orchestra-hyllest: Ompa til du dør (utsolgt – ekstrakonsert)',
    description: `[Host]=Murt &amp; Marios<br>[Info]=${LANG_INFO}`,
    start: at(day(today + 2), 22),
  },
  { id: 'v11', summary: 'Julebord Firma AS', description: '[Privat]=ja', start: at(day(today + 4), 19) },
  { id: 'v12', summary: 'Feriekolonien', description: '[Undertittel]=Releasekonsert', start: at(day(today + 5), 21) },
  { id: 'v13', summary: 'Murt &amp; Marios', start: at(day(today + 6), 20) },
  { id: 'v14', summary: 'Halloween: nattåpent til 03:00', description: '[Lukket]=Utsolgt', start: at(lastDay, 23, 59) },
  { id: 'v15', summary: 'Neste-neste måned', start: at(1, 20, 0, 2) },
];

const en: Ev[] = [{ id: 'e1', summary: 'Quiz', start: at(today, 20) }];

const titler = ['Quiz', 'Karaoke', 'DJ Ørjan', 'Platemesse', 'Jam', 'Konsert: Feriekolonien', 'Stand-up'];
const fem100: Ev[] = Array.from({ length: 500 }, (_, i) => ({
  id: `h${i}`,
  summary: `${titler[i % titler.length]} #${i + 1}`,
  start: at(1 + Math.floor(i / 2) % 28, 18 + (i % 5), 0, Math.floor(i / 56) - 3),
}));

export const TESTSETT: Record<string, Ev[]> = { verst, tom: [], en, '500': fem100 };

const VALG = [['', 'Ekte data'], ['verst', 'Worst case'], ['tom', 'Tom'], ['en', 'Én'], ['500', '500']];

export function DataToggle() {
  const valgt = new URLSearchParams(window.location.search).get('data') ?? '';
  const velg = (v: string) => {
    const url = new URL(window.location.href);
    url.searchParams.delete('maned');
    url.searchParams.delete('e');
    if (v) url.searchParams.set('data', v); else url.searchParams.delete('data');
    window.location.assign(url);
  };
  return (
    <div role="group" aria-label="Testdata" style={{
      position: 'fixed', left: '50%', bottom: 'calc(var(--footer-h) + 8px)', transform: 'translateX(-50%)',
      zIndex: 1000, display: 'flex', gap: 2, padding: 2, borderRadius: 999, background: '#d4d4d4',
      font: '12px system-ui, sans-serif',
    }}>
      {VALG.map(([v, label]) => (
        <button key={v} onClick={() => velg(v)} aria-pressed={valgt === v} style={{
          border: 0, borderRadius: 999, padding: '6px 10px', cursor: 'pointer', color: '#111',
          background: valgt === v ? '#fff' : 'transparent', font: 'inherit',
        }}>{label}</button>
      ))}
    </div>
  );
}
