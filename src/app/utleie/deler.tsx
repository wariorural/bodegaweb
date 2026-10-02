import Link from 'next/link';
import {
  APNINGSTIDER,
  APNINGSTIDER_NOTE,
  FAKTA,
  TEKNISK,
  TEKNISK_NOTE,
} from './innhold';
import Skjema from './skjema';

export function Nav() {
  return (
    <nav>
      <Link href="/" className="nav-logo u-tilbake">
        ← Bodega
      </Link>
      <span className="nav-address">Utleie</span>
    </nav>
  );
}

export function Fakta() {
  return (
    <section className="u-seksjon" aria-labelledby="h-fakta">
      <h2 className="u-h2" id="h-fakta">
        Det praktiske
      </h2>
      <dl className="u-liste">
        {FAKTA.map(({ label, verdi }) => (
          <div className="u-linje" key={label}>
            <dt>{label}</dt>
            <dd>{verdi}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Teknisk() {
  return (
    <section className="u-seksjon" aria-labelledby="h-teknisk">
      <h2 className="u-h2" id="h-teknisk">
        Teknisk
      </h2>
      <ul className="u-tags">
        {TEKNISK.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <p className="u-note">{TEKNISK_NOTE}</p>
    </section>
  );
}

export function Apningstider() {
  return (
    <section className="u-seksjon" aria-labelledby="h-tider">
      <h2 className="u-h2" id="h-tider">
        Åpningstider
      </h2>
      <dl className="u-liste">
        {APNINGSTIDER.map(({ dag, tid }) => (
          <div className="u-linje" key={dag}>
            <dt>{dag}</dt>
            <dd>{tid}</dd>
          </div>
        ))}
      </dl>
      <p className="u-note">{APNINGSTIDER_NOTE}</p>
    </section>
  );
}

export function Forespor() {
  return (
    <section className="u-seksjon" aria-labelledby="h-skjema">
      <h2 className="u-h2" id="h-skjema">
        Send en forespørsel
      </h2>
      <p className="u-note u-note-over">
        Fyll ut det du vet. Er dere usikre på dato eller opplegg, skriv det — vi
        finner ut av det sammen.
      </p>
      <Skjema />
    </section>
  );
}

export function Footer() {
  return (
    <footer className="u-footer">
      <div className="footer-lease footer-left">
        <a
          href="https://instagram.com/bodega.part.no"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          @bodega.part.no
        </a>
        <a href="tel:+4799112799" className="footer-link">
          99 11 27 99
        </a>
      </div>
      <div className="footer-lease">
        <a href="mailto:bodega@part.no" className="footer-link">
          bodega@part.no
        </a>
        <span className="footer-link">Kong Oscars gate 23</span>
      </div>
    </footer>
  );
}
