import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { hentProgram } from '../../kalender';

const neureal = readFile(join(process.cwd(), 'public/neureal-regular.otf'));

// Delingsbildet tegnes i sidens egne farger i stedet for å beskjære et foto:
// et 1200×630-utsnitt er nesten alltid feil format for et bilde tatt på telefon,
// og en rød flate med navnet leser tydelig også som liten thumbnail i en chat.
// /bilde/standard er forsidens bilde; /bilde/<id> er ett arrangement.
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rad = id === 'standard' ? undefined : (await hentProgram())?.flatMap(m => m.rader).find(r => r.id === id);
  // Ukjent id → 404 før noe tegnes. Ellers kunne hvem som helst få serveren til å
  // tegne et nytt bilde per tilfeldig id, forbi CDN-cachen.
  if (id !== 'standard' && !rad) return new Response('Fant ikke arrangementet', { status: 404 });

  const topp = rad ? `${rad.ukedag} ${rad.dato} · ${rad.tid}`.toUpperCase() : 'PROGRAM';
  const tittel = rad?.tittel ?? 'Bodega';
  const str = tittel.length <= 10 ? 190 : tittel.length <= 20 ? 130 : tittel.length <= 40 ? 92 : 64;

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', background: '#D43218', color: '#F7F5F0',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '72px', fontFamily: 'Neureal',
      }}>
        <div style={{ fontSize: 34, letterSpacing: '0.1em' }}>{topp}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rad?.overtittel && <div style={{ fontSize: 40, marginBottom: 16 }}>{rad.overtittel}</div>}
          <div style={{ fontSize: str, lineHeight: 1.02, letterSpacing: '0.01em' }}>{tittel}</div>
        </div>
        <div style={{ fontSize: 34, letterSpacing: '0.03em' }}>
          {rad ? 'Bodega · Kong Oscars gate 23, Bergen' : 'Bar i Kong Oscars gate 23, Bergen'}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Neureal', data: await neureal, style: 'normal', weight: 400 }],
      // Ikke «immutable» (standarden): tittel og tid kan endres i kalenderen.
      // s-maxage lar Vercels CDN svare i stedet for å tegne bildet på nytt.
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=10800' },
    }
  );
}
