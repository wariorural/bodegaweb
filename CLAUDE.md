@AGENTS.md

# Bodega Bar — Kalenderside

## Prosjekt

Offentlig kalenderside for Bodega bar (Kong Oscars Gate 23, Bergen). Siden er live og i aktiv bruk. Henter arrangementer fra Google Calendar API på serveren og viser dem som en månedsoversikt.

## Stack

- **Next.js 16.2.1** (Turbopack) — se AGENTS.md for breaking changes
- **Google Calendar API** — hentes på serveren (`src/app/kalender.ts`) og caches i
  tre timer (fetch-tagg `program`), og på nytt ved hver deploy. Endringer gjort
  direkte i Google Kalender vises altså innen tre timer. Lagres de i
  bodegenerators programeditor, kaller den `POST /api/oppdater` (Bearer
  `OPPDATER_HEMMELIG`), som tømmer taggen med en gang. Haster det ellers: deploy.
  `/api/oppdater` trenger en Bypass-regel i Vercel-brannmuren, ellers stopper
  bot-sperra (se Deploy) kallet fra bodegenerator.
- API-nøkkelen er `GOOGLE_CALENDAR_API_KEY` (kun server, Production + Preview i
  Vercel), låst til Google Calendar API i Google Cloud. Lokalt må den ligge i
  `.env.local`; uten den viser forsiden «Kunne ikke hente program» (`?data=` virker).
- **Ren CSS** i `src/app/globals.css` — ingen Tailwind, ingen CSS-in-JS
- **Ingen Sanity** — all data kommer fra Google Calendar

## Deploy

Push til `main` → auto-deploy. URL: `bodega.part.no`.

```bash
git push origin main
```

Bruk alltid `gh auth token` for auth — PAT i remote-URL kan utløpe.

**Regn med to minutter, ikke sekunder.** Sjekker du for tidlig, ser du den gamle
siden og tror pushen ikke virket. Status uten å gjette:

```bash
npx vercel ls
```

**`curl` mot bodega.part.no svarer 403** med `x-vercel-mitigated: challenge` — en
bot-sperre som treffer hele domenet, også forsiden. Siden er ikke nede, og det er
ikke noe du har ødelagt. Verifiser i nettleser i stedet.

## Designsystem

Etablert og ikke til diskusjon — følg det, ikke erstatt det.

| Token | Verdi |
|-------|-------|
| `--bg` | `#D43218` — rød bakgrunn |
| `--red` | `#F7F5F0` — krem, all tekst og streker |
| `--black` | `#F7F5F0` — samme som `--red` |
| Font | Neureal (lokal), fallback Arial |

Navnene er historiske: siden ble invertert, variablene ble stående. Tenk på
`--red`/`--black` som «forgrunn».

**Størrelsessystem — fire trinn, `clamp()` med vw + rem (se `:root` i `globals.css`):**
- `--size-lg` — dato, eventtittel, klokkeslett
- `--size-md` — månedsheader, modaltittel
- `--size-xs` — arrangør, undertittel, modal-brødtekst
- `--size-sm` — all liten tekst (nav, footer, ukedag, «Mer info +»)

**Regel: færrest mulig distinkte størrelser.** Ny tekst skal bruke en eksisterende variabel. Ikke legg til nye størrelser uten god grunn.

## Kode-filosofi

- Ren CSS i `globals.css` — ingen inline styles, ingen ny CSS-fil
- `page.tsx` (server): nav, footer, metadata per `?e=`, schema.org/Event
- `kalender.ts` (server): henting, tolking av `[Felt]=`, gruppering i måneder
- `kalender-visning.tsx` (klient): månedsbytte, popup, del-knapp, og
  rutenettvisningen (`?visning=kalender`). Lista rendres alltid; rutenettet skjuler
  den på desktop og skjules selv under 600px, så telefonen alltid får lista.
- `bilde/[id]/route.tsx`: delingsbilde per arrangement (`/bilde/standard` for forsiden)
- Skriv minst mulig kode for å løse problemet
- Ikke legg til feilhåndtering for ting som ikke kan skje
- Ikke legg til kommentarer der koden er selvforklarende

## Kalender-regler (i `tilRad` i `kalender.ts`)

Events med disse feltene i beskrivelsen behandles spesielt:

| Felt | Oppførsel |
|-----|-----------|
| `[Privat]=ja` | Skjules helt fra siden |
| `[Lukket]=tekst` | Vises nedtonet med teksten som badge |

**Ingen helligdagslogikk** (fjernet 2026-10-21): tom kalender betyr stengt, så
siden gjetter ikke på «jul»/«påske» i titler. Ikke legg den tilbake.

> **NB — to apper deler kalenderen:** `generators/bodegenerator` henter fra samme Google
> Calendar og tolker samme `[Felt]=verdi`-konvensjon. Der ligger både lesing og
> skriving i `lib/felter.ts` — programeditoren skriver beskrivelsene. Endrer du
> feltnavn eller konvensjon her, oppdatér også `bodegenerator/lib/felter.ts`.

> **`[bilde]=URL`** i event-beskrivelsen viser et bilde øverst i popupen (`lesFelter` →
> `.modal-image`). Bodega-web viser bevisst *ikke* noe default-bilde —
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
