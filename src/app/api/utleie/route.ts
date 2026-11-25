import { createHmac, timingSafeEqual } from 'node:crypto';

const FRA = 'Bodega utleie <utleie@send.part.no>';
const TIL = 'bodega@part.no';

// Et menneske bruker lenger enn dette på å fylle ut skjemaet.
const MIN_UTFYLLINGSTID_MS = 3000;
const MAKS_ALDER_MS = 24 * 60 * 60 * 1000;

// Langtekst får plass til et ordentlig program; alt annet er korte felt.
const MAKS_LANG = 5000;
const MAKS_KORT = 300;
const LANGE = new Set(['melding', 'foredrag', 'utstyr']);

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

// Tidsvakten stolte på et tidsstempel nettleseren selv sendte, så en bot kunne
// bare sende «t: 0». Nå deler serveren ut stempelet (GET) med en HMAC-signatur,
// og POST godtar bare stempler den selv har signert. Nøkkelen avledes fra
// Resend-nøkkelen, så det trengs ingen ny miljøvariabel.
function signer(t: string) {
  return createHmac('sha256', `utleie-skjema:${process.env.RESEND_API_KEY ?? ''}`).update(t).digest('base64url');
}

function alder(token: unknown): number | null {
  if (typeof token !== 'string') return null;
  const [t, sig] = token.split('.');
  if (!t || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(signer(t));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return Date.now() - Number(t);
}

export function GET() {
  const t = String(Date.now());
  return Response.json({ t: `${t}.${signer(t)}` }, { headers: { 'Cache-Control': 'no-store' } });
}

function erEpost(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

export async function POST(req: Request) {
  const data = await req.json().catch(() => null);
  if (!data) return Response.json({ feil: 'Ugyldig forespørsel.' }, { status: 400 });

  const hent = (k: string) => (typeof data[k] === 'string' ? data[k].trim() : '');

  const ms = alder(data.t);
  if (ms === null || ms > MAKS_ALDER_MS) {
    return Response.json({ feil: 'Skjemaet er utløpt. Last siden på nytt og send igjen.' }, { status: 400 });
  }

  // Honeypot og tidsvakt svarer 200 med vilje: en bot som får 400 vet at den
  // ble tatt og kan prøve seg fram til hvilket felt som avslørte den.
  if (hent('firma') || ms < MIN_UTFYLLINGSTID_MS) {
    return Response.json({ ok: true });
  }

  if (FELT.some(([key]) => hent(key).length > (LANGE.has(key) ? MAKS_LANG : MAKS_KORT))) {
    return Response.json({ feil: 'Noe av teksten er for lang. Kort den ned, eller send en mail.' }, { status: 400 });
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
      subject: `Utleie – ${navn}${hent('dato') ? ` · ${hent('dato')}` : ''}`,
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
