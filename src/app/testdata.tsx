'use client';

// Kun dev: knapperad som bytter mellom testsettene i testsett.ts.

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
