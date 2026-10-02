import type { Metadata } from 'next';
import { Apningstider, Fakta, Footer, Forespor, Nav, Teknisk } from './deler';
import { BILDER, INTRO, PRISER } from './innhold';

export const metadata: Metadata = {
  title: 'Leie Bodega — utleie av lokale i Bergen',
  description:
    'Bodega i Kong Oscars gate 23 leies ut til arrangementer. 67 plasser, bar, scene og projektor. Priser, åpningstider og forespørselsskjema.',
  openGraph: { url: '/utleie', title: 'Leie Bodega' },
  // Av til styret har sagt ja til tekst og priser. Siden er nåbar for den som
  // har lenken, men ikke lenket fra forsiden og ikke i søk.
  robots: { index: false, follow: false },
};

export default function Utleie() {
  return (
    <div className="u-side">
      <Nav />

      <div className="u-stripe">
        {BILDER.map(({ src, alt }) => (
          <img key={src} src={src} alt={alt} width={810} height={1012} />
        ))}
      </div>

      <header className="u-hero">
        <h1 className="u-h1">Leie Bodega</h1>
        <p className="u-intro">{INTRO}</p>
      </header>

      <section className="u-seksjon" aria-labelledby="h-pris">
        <h2 className="u-h2" id="h-pris">
          Pris
        </h2>
        <div className="u-priser">
          {PRISER.map(({ pris, tittel, detalj }) => (
            <div className="u-pris" key={tittel}>
              <span className="u-pris-tall">{pris}</span>
              <span className="u-pris-tittel">{tittel}</span>
              <span className="u-pris-detalj">{detalj}</span>
            </div>
          ))}
        </div>
      </section>

      <Fakta />
      <Apningstider />
      <Teknisk />
      <Forespor />
      <Footer />
    </div>
  );
}
