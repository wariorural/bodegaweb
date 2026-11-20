'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Maned, Rad } from './kalender';

const DataToggle = dynamic(() => import('./testdata').then(m => m.DataToggle), { ssr: false });

interface Props {
  maneder: Maned[] | null;
  startIdx: number;
  iDag: string;
  apneId?: string;
}

// Programmet kommer ferdig tolket fra serveren. Det som er igjen her er det som
// bare kan skje i nettleseren: bla mellom måneder, åpne popupen, dele en lenke.
export default function Kalender({ maneder, startIdx, iDag, apneId }: Props) {
  const [idx, setIdx] = useState(startIdx);
  const [modal, setModal] = useState<Rad | null>(
    () => maneder?.[startIdx]?.rader.find(r => r.id === apneId && harPopup(r)) ?? null
  );
  const [kopiert, setKopiert] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const iDagRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const current = maneder?.[idx];
  const rader = current?.rader ?? [];
  const scrollMal = rader.findIndex(r => r.dag >= iDag);

  const closeModal = useCallback(() => {
    setModal(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has('e')) {
      url.searchParams.delete('e');
      window.history.replaceState({}, '', url);
    }
  }, []);

  const openModal = useCallback((r: Rad) => {
    setModal(r);
    setKopiert(false);
    const url = new URL(window.location.href);
    url.searchParams.set('e', r.id);
    window.history.pushState({}, '', url);
  }, []);

  const goMonth = useCallback((next: number) => {
    const m = maneder?.[next];
    if (!m) return;
    setIdx(next);
    const url = new URL(window.location.href);
    url.searchParams.set('maned', m.key);
    url.searchParams.delete('e');
    window.history.pushState({}, '', url);
  }, [maneder]);

  // På mobil åpner delingsarket; ellers kopieres lenken. Lenken har egen tittel og
  // eget delingsbilde (se generateMetadata i page.tsx).
  const del = useCallback(async (r: Rad) => {
    const url = `${window.location.origin}/?e=${r.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: r.tittel, url }); } catch {}
      return;
    }
    await navigator.clipboard.writeText(url);
    setKopiert(true);
  }, []);

  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      const i = maneder?.findIndex(m => m.key === params.get('maned')) ?? -1;
      if (i >= 0) setIdx(i);
      if (!params.get('e')) setModal(null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [maneder]);

  // <dialog> eier åpen/lukket-tilstanden sin selv, så den synkes mot React-state
  // her. showModal() gir fokusfelle, Escape, inert bakgrunn og fokus tilbake til
  // raden som åpnet den.
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (modal && !dlg.open) dlg.showModal();
    else if (!modal && dlg.open) dlg.close();
    document.body.style.overflow = modal ? 'hidden' : '';
  }, [modal]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const stickyH = (document.querySelector('nav')?.offsetHeight ?? 0) + (headerRef.current?.offsetHeight ?? 0);
      // Andre måneder enn inneværende har ingen «i dag»-rad å sikte mot; da til
      // toppen, ellers lander et bytte til en kortere måned i bunnen av den.
      const top = iDagRef.current ? iDagRef.current.getBoundingClientRect().top + window.scrollY - stickyH : 0;
      window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [idx]);

  const setRowRef = useCallback((el: HTMLElement | null) => { iDagRef.current = el; }, []);

  return (
    <>
      {current && (
        <div className="month-header" ref={headerRef}>
          <button className="month-btn" onClick={() => goMonth(idx - 1)} disabled={idx === 0} aria-label="Forrige måned">←</button>
          <div className="month-label">
            <h2 className="month-name">{current.navn}</h2>
            <span className="month-year">{current.ar}</span>
          </div>
          <button className="month-btn" onClick={() => goMonth(idx + 1)} disabled={idx === maneder!.length - 1} aria-label="Neste måned">→</button>
        </div>
      )}

      <main id="calendar-root">
        {maneder === null && <div className="state-msg">Kunne ikke hente program.</div>}
        {maneder?.length === 0 && <div className="state-msg">Ingen kommende arrangementer.</div>}
        {current && rader.length === 0 && <div className="empty-month">Ingen arrangementer denne måneden</div>}
        {rader.map((r, i) => {
          const popup = harPopup(r);
          const rowClass = [
            'event-row', r.cls,
            popup && 'has-popup',
            r.cls === 'has-event' && r.dag === iDag && 'today',
            r.dag < iDag && 'passert',
          ].filter(Boolean).join(' ');
          const ref = i === scrollMal ? setRowRef : undefined;

          const inner = (
            <>
              {r.overtittel && <div className="event-overtitle">{r.overtittel}</div>}
              <div className="event-date">
                <span className="event-date-num">{r.dato}</span>
                <span className="event-day">{r.ukedag}</span>
              </div>
              <div className="event-content">
                <div className="event-title-group">
                  <span className="event-title">{r.tittel}</span>
                  {r.lukket && <span className="event-badge">{r.lukket}</span>}
                </div>
                {/* Hint om popup: en liten + etter undertittelen, eller «Mer info +»
                    der det ikke finnes noen. Hardt mellomrom, så + aldri står alene. */}
                {r.undertittel
                  ? <div className="event-subtitle">{r.undertittel}{popup && <span aria-hidden="true">{'\u00a0+'}</span>}</div>
                  : popup && <div className="event-subtitle" aria-hidden="true">Mer info +</div>}
              </div>
              <div className="event-time">{r.tid}</div>
            </>
          );

          // En rad som åpner popup er en knapp, ikke en div med onClick — det er
          // det som gjør arrangementene nåbare med tastatur.
          return popup ? (
            <button key={r.id || i} type="button" ref={ref} className={rowClass} onClick={() => openModal(r)}>{inner}</button>
          ) : (
            <div key={r.id || i} ref={ref} className={rowClass}>{inner}</div>
          );
        })}
      </main>

      <dialog
        className="modal-frame"
        ref={dialogRef}
        onClose={closeModal}
        onClick={(e) => {
          const b = e.currentTarget.getBoundingClientRect();
          if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) closeModal();
        }}
        aria-labelledby="modal-title"
      >
        {modal && (
          <div className="modal">
            <div className="modal-header">
              <button className="modal-close" onClick={closeModal} aria-label="Lukk">×</button>
              <div className="modal-daytime">{modal.ukedag} {modal.dato} · {modal.tid}</div>
              {modal.overtittel && <div className="event-overtitle modal-overtitle">{modal.overtittel}</div>}
              <h2 className="modal-title" id="modal-title">{modal.tittel}</h2>
              {modal.id && (
                <button type="button" className="modal-del" onClick={() => del(modal)} aria-live="polite">
                  {kopiert ? 'Lenke kopiert' : 'Del arrangementet'}
                </button>
              )}
            </div>
            {modal.bilde && (
              // En Drive-delingslenke er en nettside, ikke et bilde — da skjules
              // rammen i stedet for å vise et tomt 4:5-hull. key gir ny <img> per
              // bilde, så hidden ikke henger igjen til neste popup.
              <img key={modal.bilde} className="modal-image" src={modal.bilde} alt="" onError={(e) => { e.currentTarget.hidden = true; }} />
            )}
            {modal.infoHtml && <div className="modal-body" dangerouslySetInnerHTML={{ __html: modal.infoHtml }} />}
          </div>
        )}
      </dialog>

      {process.env.NODE_ENV === 'development' && <DataToggle />}
    </>
  );
}

function harPopup(r: Rad) {
  return r.cls === 'has-event' && (!!r.info || !!r.bilde);
}
