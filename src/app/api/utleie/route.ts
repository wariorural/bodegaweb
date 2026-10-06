const FRA = 'Bodega utleie <utleie@send.part.no>';
const TIL = 'bodega@part.no';

// Et menneske bruker lenger enn dette på å fylle ut skjemaet.
const MIN_UTFYLLINGSTID_MS = 3000;

const FELT = [
  ['navn', 'Navn'],
  ['epost', 'E-post'],
  ['telefon', 'Telefon'],
  ['dato', 'Ønsket dato'],
  ['antall', 'Antall gjester'],
  ['type', 'Type arrangement'],
  ['utstyr', 'Ønsket utstyr'],
  ['punkt', 'Foredrag ved'],
  ['foredrag', 'Om foredraget'],
  ['melding', 'Melding'],
] as const;

function erEpost(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

export async function POST(req: Request) {
  const data = await req.json().catch(() => null);
  if (!data) return Response.json({ feil: 'Ugyldig forespørsel.' }, { status: 400 });

  const hent = (k: string) => (typeof data[k] === 'string' ? data[k].trim() : '');

  // Honeypot og tidsvakt svarer 200 med vilje: en bot som får 400 vet at den
  // ble tatt og kan prøve seg fram til hvilket felt som avslørte den.
  if (hent('firma') || Date.now() - Number(data.t) < MIN_UTFYLLINGSTID_MS) {
    return Response.json({ ok: true });
  }

  const navn = hent('navn');
  const epost = hent('epost');
  const melding = hent('melding');

  if (!navn || !epost || !melding) {
    return Response.json({ feil: 'Navn, e-post og melding må fylles ut.' }, { status: 400 });
  }
  if (!erEpost(epost)) {
    return Response.json({ feil: 'Sjekk e-postadressen.' }, { status: 400 });
  }

  const kropp = FELT
    .map(([key, label]) => [label, hent(key)])
    .filter(([, verdi]) => verdi)
    .map(([label, verdi]) => `${label}: ${verdi}`)
    .join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FRA,
      to: [TIL],
      reply_to: epost,
      subject: `Utleie — ${navn}${hent('dato') ? ` · ${hent('dato')}` : ''}`,
      text: `${kropp}\n\n—\nSendt fra skjemaet på bodega.part.no/utleie`,
    }),
  });

  if (!res.ok) {
    console.error('Resend avviste utleieforespørsel:', res.status, await res.text());
    return Response.json(
      { feil: 'Klarte ikke sende. Send gjerne en mail til bodega@part.no i stedet.' },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
