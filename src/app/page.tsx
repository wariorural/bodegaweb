import type { Metadata } from 'next';
import Kalender from './kalender-visning';
import Ordmerke from './ordmerke';
import { APENT, KART, SIDE, erBildelenke, hentProgram, iDag, type Rad } from './kalender';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const tekst = (v: string | string[] | undefined) => (typeof v === 'string' ? v : undefined);

function beskrivelse(r: Rad) {
  return `${r.ukedag} ${r.dato} kl. ${r.tid} på Bodega${r.undertittel ? ` – ${r.undertittel}` : ''}`;
}

// En delt ?e=-lenke får arrangementets egen tittel og eget delingsbilde, så den
// ser ut som arrangementet i Messenger og på Instagram, ikke som forsiden.
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const e = tekst((await searchParams).e);
  if (!e) return {};
  const rad = (await hentProgram())?.flatMap(m => m.rader).find(r => r.id === e);
  if (!rad) return {};
  const title = `${rad.tittel} – Bodega`;
  const description = beskrivelse(rad);
  const images = [{ url: `/bilde/${rad.id}`, width: 1200, height: 630, alt: `${rad.tittel}, ${rad.ukedag} ${rad.dato}` }];
  return {
    title,
    description,
    openGraph: { title: rad.tittel, description, url: `/?e=${rad.id}`, siteName: 'Bodega', locale: 'nb_NO', type: 'website', images },
    twitter: { card: 'summary_large_image', title: rad.tittel, description, images },
  };
}

// schema.org/Event lar Google vise arrangementene med dato i søkeresultatene.
function strukturertData(rader: Rad[]) {
  return rader.map(r => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: r.tittel,
    startDate: r.start,
    description: r.undertittel || r.info.slice(0, 300) || undefined,
    url: `${SIDE}/?e=${r.id}`,
    image: erBildelenke(r.bilde) ? r.bilde : `${SIDE}/bilde/${r.id}`,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    organizer: { '@type': 'Organization', name: r.overtittel || 'Bodega', url: SIDE },
    location: {
      '@type': 'Place',
      name: 'Bodega',
      address: { '@type': 'PostalAddress', streetAddress: 'Kong Oscars gate 23', postalCode: '5017', addressLocality: 'Bergen', addressCountry: 'NO' },
    },
  }));
}

export default async function Home({ searchParams }: Props) {
  const sp = await searchParams;
  const e = tekst(sp.e);
  const maneder = await hentProgram(process.env.NODE_ENV === 'development' ? tekst(sp.data) : undefined);
  const dag = iDag();

  // Måned fra ?maned, så fra ?e, ellers den første som ikke er passert.
  const finn = (pred: (key: string, rader: Rad[]) => boolean) => maneder?.findIndex(m => pred(m.key, m.rader)) ?? -1;
  const ved = [
    finn(key => key === tekst(sp.maned)),
    finn((_, rader) => !!e && rader.some(r => r.id === e)),
    finn(key => key >= dag.slice(0, 7)),
  ].find(i => i >= 0);
  const startIdx = ved ?? Math.max(0, (maneder?.length ?? 1) - 1);

  const kommende = maneder?.flatMap(m => m.rader).filter(r => r.cls === 'has-event' && r.dag >= dag) ?? [];

  return (
    <>
      {kommende.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturertData(kommende)).replace(/</g, '\\u003c') }}
        />
      )}

      <nav className="nav-forside">
        <Ordmerke />
        <p className="nav-apent" aria-label={`Åpent ${APENT.join(', ')}`}>
          {APENT.map(t => <span key={t}>{t}</span>)}
        </p>
      </nav>

      <Kalender maneder={maneder} startIdx={startIdx} iDag={dag} apneId={e} rutenett={tekst(sp.visning) === 'kalender'} />

      <footer>
        <div className="footer-lease footer-left">
          <a href={KART} target="_blank" rel="noopener noreferrer" className="footer-link">Kong Oscars gate{'\u00a0'}23, 5017{'\u00a0'}Bergen</a>
          <a href="/utleie" className="footer-link">Leie / booking →</a>
        </div>
        <div className="footer-lease">
          <a href="https://instagram.com/bodega.part.no" target="_blank" rel="noopener noreferrer" className="footer-link">Instagram ↗</a>
          <a href="/compass" className="footer-link">Kompass →</a>
        </div>
      </footer>
    </>
  );
}
