import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'Bodega — bar og konsertlokale i Kong Oscars gate 23 i Bergen';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const neureal = await readFile(join(process.cwd(), 'public/neureal-regular.otf'));

// Delingsbildet tegnes i sidens egne farger i stedet for å beskjære et foto:
// et 1200×630-utsnitt er nesten alltid feil format for et bilde tatt på telefon,
// og en rød flate med navnet leser tydelig også som liten thumbnail i en chat.
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#D43218',
          color: '#F7F5F0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          fontFamily: 'Neureal',
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: '0.1em' }}>PROGRAM</div>
        <div style={{ fontSize: 190, lineHeight: 1, letterSpacing: '0.01em' }}>Bodega</div>
        <div style={{ fontSize: 34, letterSpacing: '0.03em' }}>
          Bar i Kong Oscars gate 23, Bergen
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Neureal', data: neureal, style: 'normal', weight: 400 }],
    }
  );
}
