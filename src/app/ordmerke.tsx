'use client';

import { useLayoutEffect, useRef, useState } from 'react';

// BODEGA fyller hele bredden. Blir luften mellom bokstavene for stor, får ordet
// flere av én vokal til det er fullt. Hvilken — O, E eller A — trekkes ved hver
// innlasting.
const LUFT = 0.6; // minste mellomrom mellom bokstavene, i em
const MAKS_VINKEL = 15; // hver bokstav vris tilfeldig mellom -15° og 15°

type Vokal = 'O' | 'E' | 'A';

function bokstaver(ekstra: number, vokal: Vokal) {
  const antall = (v: Vokal) => 1 + (v === vokal ? ekstra : 0);
  return ['B', ...'O'.repeat(antall('O')), 'D', ...'E'.repeat(antall('E')), 'G', ...'A'.repeat(antall('A'))];
}

export default function Ordmerke() {
  const ref = useRef<HTMLHeadingElement>(null);
  const [ekstra, setEkstra] = useState(0);
  const [vokal, setVokal] = useState<Vokal>('O');
  // Vinklene trekkes i nettleseren, ikke på serveren — ellers ville HTML-en og
  // første klientrender være uenige. Nye bokstaver får nye vinkler, de gamle beholder sine.
  const [vinkler, setVinkler] = useState<number[]>([]);

  useLayoutEffect(() => {
    const el = ref.current!;
    const ctx = document.createElement('canvas').getContext('2d')!;
    const trukket = (['O', 'E', 'A'] as const)[Math.floor(Math.random() * 3)];
    const tilpass = () => {
      const cs = getComputedStyle(el);
      const em = parseFloat(cs.fontSize);
      const bredde = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      ctx.font = `${cs.fontSize} ${cs.fontFamily}`;
      const mal = (k: number) => {
        const b = bokstaver(k, trukket);
        return b.reduce((sum, c) => sum + ctx.measureText(c).width, 0) + (b.length - 1) * LUFT * em;
      };
      let k = 0;
      while (mal(k + 1) <= bredde) k++;
      setEkstra(k);
      setVokal(trukket);
      const antall = bokstaver(k, trukket).length;
      setVinkler(v => v.length >= antall ? v : [
        ...v,
        ...Array.from({ length: antall - v.length }, () => (Math.random() * 2 - 1) * MAKS_VINKEL),
      ]);
    };
    const ro = new ResizeObserver(tilpass);
    ro.observe(el);
    document.fonts.ready.then(tilpass);
    return () => ro.disconnect();
  }, []);

  return (
    <h1 ref={ref} className="nav-ordmerke" aria-label="Bodega">
      {bokstaver(ekstra, vokal).map((b, i) => (
        <span key={i} aria-hidden="true" style={{ rotate: `${vinkler[i] ?? 0}deg` }}>{b}</span>
      ))}
    </h1>
  );
}
