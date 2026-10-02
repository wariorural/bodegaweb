'use client';

import { useRef, useState } from 'react';

const TYPER = ['Lukket arrangement', 'Åpent arrangement', 'Vet ikke ennå'];

export default function Skjema() {
  const [status, setStatus] = useState<'klar' | 'sender' | 'sendt'>('klar');
  const [feil, setFeil] = useState('');
  const apnet = useRef(Date.now());
  // disabled midt i en jobb flytter fokus til <body> og gir det aldri tilbake,
  // og fjerner knappen fra tilgjengelighetstreet. Vakt + aria-busy i stedet.
  const sender = useRef(false);

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sender.current) return;
    sender.current = true;
    setStatus('sender');
    setFeil('');

    const felt = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch('/api/utleie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...felt, t: apnet.current }),
    }).catch(() => null);

    sender.current = false;

    if (res?.ok) {
      setStatus('sendt');
      return;
    }
    const svar = await res?.json().catch(() => null);
    setFeil(svar?.feil ?? 'Noe gikk galt. Send gjerne en mail til bodega@part.no.');
    setStatus('klar');
  }

  if (status === 'sendt') {
    return (
      <p className="u-sendt" role="status">
        Takk — forespørselen er sendt. Vi svarer fra bodega@part.no, vanligvis
        innen et par dager.
      </p>
    );
  }

  return (
    <form className="u-skjema" onSubmit={send} noValidate>
      <div className="u-rad">
        <label className="u-felt">
          <span>Navn</span>
          <input name="navn" required autoComplete="name" />
        </label>
        <label className="u-felt">
          <span>E-post</span>
          <input name="epost" type="email" required autoComplete="email" />
        </label>
      </div>

      <div className="u-rad">
        <label className="u-felt">
          <span>Telefon</span>
          <input name="telefon" type="tel" inputMode="tel" autoComplete="tel" />
        </label>
        <label className="u-felt">
          <span>Ønsket dato</span>
          <input name="dato" type="date" />
        </label>
        <label className="u-felt">
          <span>Antall gjester</span>
          <input name="antall" type="number" min="1" max="67" inputMode="numeric" />
        </label>
      </div>

      <fieldset className="u-valg">
        <legend>Type arrangement</legend>
        {TYPER.map((t) => (
          <label key={t}>
            <input type="radio" name="type" value={t} defaultChecked={t === TYPER[2]} />
            <span>{t}</span>
          </label>
        ))}
      </fieldset>

      <label className="u-felt">
        <span>Hva har dere lyst til å gjøre?</span>
        <textarea name="melding" rows={5} required />
      </label>

      <div className="u-honeypot" aria-hidden="true">
        <label htmlFor="firma">Firma</label>
        <input id="firma" name="firma" tabIndex={-1} autoComplete="off" />
      </div>

      {feil && (
        <p className="u-feil" role="alert">
          {feil}
        </p>
      )}

      <button type="submit" className="u-send" aria-busy={status === 'sender'}>
        {status === 'sender' ? 'Sender …' : 'Send forespørsel'}
      </button>
    </form>
  );
}
