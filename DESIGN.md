# Bodega — designregler og kontekst

## Prosjekt
Next.js 16 app for Bodega, Kong Oscars Gate 23 Bergen.
Live: https://bodegaweb.vercel.app (deployes automatisk fra `main`-branchen)
Repo: wariorural/bodegaweb

## Stack
- Next.js 16 / React 19
- Google Calendar API (henter arrangementer)
- Egendefinert font: Neureal
- Ingen UI-bibliotek — kun custom CSS i `src/app/globals.css`

## Farger og tokens (globals.css :root)
```
--red:       #E8391D   (hovedfarge, brukes overalt)
--black:     #111111
--bg:        #F7F5F0   (bakgrunn, varm off-white)
--line:      rgba(232,57,29,0.2)  (skillelinjer i listen)
--stroke:    1.5px     (EN strektykkelse overalt — modal-ramme er 3px unntak)
--pad-x:     24px      (horisontal padding overalt)
--nav-h:     56px
--footer-h:  56px
--size-lg:   clamp(28px, 5vw, 60px)   (dato, tittel, klokkeslett)
--size-md:   clamp(28px, 4vw, 48px)   (månedsnavn, modal-tittel)
--size-sm:   14px  →  16px på mobil   (all UI-tekst)
```

## Designregler
- **Ingen caps lock** — ingen `text-transform: uppercase` noe sted
- **Tre tekststørrelser**: lg / md / sm — ikke legg til nye
- **En strektykkelse**: `var(--stroke)` = 1.5px overalt (modal-rammen er bevisst 3px)
- **Konsistent padding**: bruk `var(--pad-x)` horisontalt, 12–24px vertikalt
- **Ingen border-radius** — rette kanter, modal har 45° avskårne hjørner (clip-path)
- **Baseline-justering** i event-rader (`align-items: baseline`)
- Header og footer: `flex-end` + `padding-bottom: 10px` (tekst mot bunnen)

## Arrangementstyper (eventClass)
- `holiday`: tittel inneholder stengt / ferie / påske / jul → 75% opacity
- `closed`: tittel inneholder lukket selskap / lukket / privat → 50% opacity, alt rød tekst, ingen popup
- `has-event`: alt annet → normal visning, popup hvis beskrivelse har innhold

## Google Calendar-konvensjoner
- **Arrangør**: skriv `[Arrangørnavn]` i beskrivelsen → vises som liten rød tekst under tittelen
- **Popup-innhold**: legg til `///` i beskrivelsen — tekst etter `///` vises i popup
- **Subtitle**: bruk `//Tekst//` i beskrivelsen (før `///`) for undertittel-formatering

## Komponenter
- `src/app/page.tsx` — hele appen (client component)
- `src/app/globals.css` — all styling
- `src/app/layout.tsx` — metadata

## Modal
- Rød ramme med 45° avskårne hjørner via to lag: `.modal-frame` (rød bg) + `.modal` (innhold)
- Lukkes med Escape eller klikk utenfor
- Viser: dato/tid, tittel, arrangør (hvis satt), beskrivelsestekst

## Miljøvariabler (Vercel)
```
NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY=...
NEXT_PUBLIC_CALENDAR_ID=...
```
Husk: ingen backticks rundt verdiene i Vercel-dashboardet.

## Mobil (max-width: 600px)
- Padding: 16px horisontalt
- Månedsseksjon: 12px vertikal padding
- Tekststørrelser: lg=28px, md=32px, sm=16px
- `clamp()` i desktop-variablene sørger for jevn skalering mellom størrelsene
