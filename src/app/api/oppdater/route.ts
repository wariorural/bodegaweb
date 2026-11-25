import { revalidateTag } from 'next/cache';
import { timingSafeEqual } from 'crypto';

// Bodegenerator kaller denne etter hver lagring i programeditoren, så endringen
// vises med en gang i stedet for innen tre timer. { expire: 0 }: neste besøk
// venter på ferske data i stedet for å få den gamle versjonen én gang til.
export async function POST(req: Request) {
  const hemmelig = process.env.OPPDATER_HEMMELIG;
  const gitt = Buffer.from(req.headers.get('authorization') ?? '');
  const ventet = Buffer.from(`Bearer ${hemmelig}`);
  if (!hemmelig || gitt.length !== ventet.length || !timingSafeEqual(gitt, ventet)) {
    return new Response(null, { status: 401 });
  }
  revalidateTag('program', { expire: 0 });
  return Response.json({ ok: true });
}
