@AGENTS.md

# Bodega Bar — Kalenderside

## Prosjekt

Offentlig kalenderside for Bodega bar (Kong Oscars Gate 23, Bergen). Siden er live og i aktiv bruk. Henter arrangementer fra Google Calendar API og viser dem som en månedsoversikt.

## Stack

- **Next.js 16.2.1** (Turbopack) — se AGENTS.md for breaking changes
- **Google Calendar API** — henter events direkte fra frontend, ingen backend
- **Ren CSS** i `src/app/globals.css` — ingen Tailwind, ingen CSS-in-JS
- **Ingen Sanity** — all data kommer fra Google Calendar

## Deploy

Push til `main` → auto-deploy. URL: `bodega.part.no`. Forvent noen sekunders delay.

```bash
git push origin main
```

Bruk alltid `gh auth token` for auth — PAT i remote-URL kan utløpe.

## Designsystem

Etablert og ikke til diskusjon — følg det, ikke erstatt det.

| Token | Verdi |
|-------|-------|
| `--red` | `#E8391D` |
| `--black` | `#111111` |
| `--bg` | `#F7F5F0` |
| Font | Neureal (lokal), fallback Arial |

**Størrelsessystem — bruk vw, ikke px:**
- `--size-lg: 5vw` — dato, eventtittel, klokkeslett
- `--size-md: 4vw` — månedsheader, modaltittel
- `--size-sm: 1.2vw` — all liten tekst
- Mobile overstyres via `:root` i media query

**Regel: færrest mulig distinkte størrelser.** Ny tekst skal bruke en eksisterende variabel. Ikke legg til nye størrelser uten god grunn.

## Kode-filosofi

- Ren CSS i `globals.css` — ingen inline styles, ingen ny CSS-fil
- Struktur i `src/app/page.tsx` (klient-komponent)
- Skriv minst mulig kode for å løse problemet
- Ikke legg til feilhåndtering for ting som ikke kan skje
- Ikke legg til kommentarer der koden er selvforklarende

## Kalender-regler (i `eventClass`)

Events med disse taggene i tittelen behandles spesielt:

| Tag | Oppførsel |
|-----|-----------|
| `[Privat]` | Skjules helt fra siden |
| `[Lukket]` | Vises grået ut med «Lukket»-badge |
| `stengt`, `ferie`, `påske`, `jul` | Vises som `holiday` (litt grået) |

Brackets strippes fra visningstittel via `cleanTitle()`.

> **NB — to apper deler kalenderen:** `generators/bodegenerator` henter fra samme Google
> Calendar og tolker samme `[Felt]=verdi`-konvensjon i sin egen `parseFields`. Endrer du
> feltnavn eller konvensjon her, oppdatér også `generators/bodegenerator/lib/calendar.ts`.

> **`[bilde]=URL`** i event-beskrivelsen viser et bilde øverst i popupen (`parseFields` →
> `.modal-image`). Bodega-web viser bevisst *ikke* noe default-bilde (`DEFAULT_BILDE = ''`) —
> kun events med egen `[bilde]=` får bilde. Bodegenerator publiserer slike URL-er, og den
> eksterne siden gaari.no plukker opp samme felt (og bruker default-bildet der).

## UX-prinsipper (relevante for dette prosjektet)

- **Baseline-alignment**: dato, tittel og klokkeslett skal alltid flukter på første tekstlinje (`align-items: first baseline`)
- **Marger**: venstre og høyre padding skal alltid være like (`var(--pad-x)`)
- **Klokkeslett**: alltid høyrestilt til høyremargen (`justify-self: end`)
- **Mobil**: `align-items: start` på event-rader, tittel venstrestilt
- **Touch-targets**: interaktive elementer minimum 44px
- Sjekk alltid mobil (375px) og desktop (1440px) ved layout-endringer

## Arbeidsregler

- Les hele filen før du redigerer. Planlegg alle endringer, gjør deretter ÉN komplett redigering. Har du redigert en fil 3+ ganger, stopp og les kravene på nytt.
- Dobbeltsjekk resultatet før du presenterer det. Verifiser at endringene faktisk svarer på det som ble spurt om.
- Når brukeren korrigerer deg, stopp og les meldingen på nytt. Gjengi hva de ba om og bekreft før du fortsetter.
- Hvert par turer, les den opprinnelige forespørselen på nytt for å unngå å miste målet.
- Etter 2 mislykkede forsøk på rad, stopp og legg om tilnærmingen helt. Forklar hva som feilet og prøv en annen strategi.
- Når du sitter fast, oppsummer hva du har prøvd og spør brukeren om veiledning i stedet for å prøve det samme igjen.
