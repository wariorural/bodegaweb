# bodega-web — åpne saker

## Pågår: kontroll-sjekk 2026-09-28, punkt 1–19

Syv review-agenter (teknisk, UX, web-guidelines, sikkerhet, lansering, mobil,
brukerferd) gikk over live-siden og koden. Mario godkjente punkt 1–19.
Punkt 20 (mørkne rødfargen) og 21 (rette KALENDER_GUIDE.txt) venter på ham.

### Steg 1 — sletting og oppgradering
- [x] 10 Slett Sanity: `src/sanity/`, `src/app/studio/`, `sanity.config.ts`,
      `sanity.cli.ts`, så 5 pakker, så env. REKKEFØLGE KRITISK: `src/sanity/env.ts`
      kaster ved import hvis env mangler — fjerner du env først, brekker bygget.
- [x] 11 Slett `src/app/favicon.ico` (SHA256-identisk med create-next-app sin;
      app-router-konvensjonen lar den slå `public/favicon.svg`)
- [x] 12 Slett Tailwind: `postcss.config.mjs` + 2 devDeps
- [x] 13 Slett død `public/`: HEIC + 5 scaffold-SVG-er. BEHOLD `bodega-bar.jpg`
      — den blir OG-bilde i punkt 17.
- [x] 14 Fjern `fetchWithFallback` (corsproxy) → vanlig `fetch`
- [x] 15 `next` + `eslint-config-next` → 16.3.6

### Steg 2 — page.tsx (én edit)
- [x] 1 `eventClass`: `privat` sjekkes FØRST, og `jul` får ordgrense så den
      ikke treffer «juli»
- [x] 2 Rad med popup rendres som `<button type="button">`
- [x] 7 Modal → `<dialog>` + `showModal()` (gir fokusfelle, Esc, fokus-retur,
      inert bakgrunn fra nettleseren)
- [x] 8 `groupByMonth` fyller tomme måneder så pilen ikke hopper i stillhet
      (gjør samtidig `.empty-month` levende — den er død kode i dag)
- [x] 9 Scroll-effekten får `currentIdx` i deps, og faller til topp når måneden
      ikke er inneværende. Rad-lista filtreres FØR `scrollTargetIdx` regnes,
      ellers dør auto-scrollen når første kommende rad er `[Privat]`.
- [x] 16 Nav-adressen sier hva Bodega er
- [x] 18 `<h1>` (nav-logo, erstatter `href="#"`), `<h2>` (månedsnavn), `<main>`
- [x] 19 Måned + valgt arrangement i URL-en (`?maned=`, `?e=`), med `popstate`
      så tilbakeknappen virker

### Steg 3 — globals.css (én edit)
- [x] 4+5 Typografiskalaen: `vw` → `clamp(px, vw + rem, px)`. rem-leddet
      gjenoppretter nettleserzoom, px-gulvet fjerner 601–1100px-kollapsen,
      px-taket stopper 128px-titler på store skjermer. Media-queryens
      font-overstyringer (7vw m.m.) blir overflødige og fjernes; LAYOUT-delen
      av queryen blir stående.
- [x] 3 Hover: `rgba(232,57,29,0.04)` → krem. Dagens er rød på rød = usynlig.
- [x] 6 `--footer-h` fast px → clamp, og `height` → `min-height`
- [x] Styling for `button.event-row` og `dialog.modal-frame` + `::backdrop`

### Verifisering
- [x] Bygg grønt
- [x] Mobilskriptene fra kontroll-sjekk kjørt på nytt, tall vist
- [x] Før/etter-skjermbilder på 375px og 1440px
- [x] Vis Mario før commit

## Løses av punkt 4+5
- [x] ~~iPhone-test av mobil event-fontstørrelse (7vw)~~ — 7vw-overstyringene
      forsvinner når skalaen blir clamp med px-tak, så overflyt-risikoen på
      klokken går bort av seg selv.

## Ikke fra denne sesjonen, men oppdaget
- `CLAUDE.md` har lokale endringer (bytte dev1 → bodega.part.no + arbeidsregler)
  som ikke er commitet.
- Untracked: `DESIGN_REVIEW.md`, `DESIGN_SYSTEM.md`, `KALENDER_GUIDE.txt`.
  Bestem om de skal committes eller slettes.
- **Tokens-dokumentene lyver.** `CLAUDE.md` og `DESIGN.md` sier `--bg: #F7F5F0`
  / `--red: #E8391D`; koden har det motsatt. Det er rotårsaken til at hover ble
  stående rød-på-rød. `DESIGN_REVIEW.md` påstår to fikser som ikke er i koden.
  Bør bli én kilde — ikke gjort, venter på Mario.
- Trykkflater under 44×44: footer-lenkene (~16px høye, 2px gap), `.modal-close`,
  månedspilene. Krever at footeren redesignes; ikke i punkt 1–19.
- `[Privat]` skjuler kun fra nettsiden. Den offentlige ICS-feeden gir full
  beskrivelse uten nøkkel. Punkt 21.

## Ferdig tidligere (2026-05-26)
- `98e8245` Slå sammen `[Host]` og `[Arrangør]` til `[Overtittel]` over tittelen.
- `1490b68` Mobil-finpuss: event-title `var(--size-md)`, `min-width: 0` defensiv.
- `4694228` Flukt event-størrelser på mobil til 7vw + `minmax(0, 1fr)`.
- bodegenerator `8d8e90d`: landingsside oppdatert med `[Overtittel]`.

---

## Resultat av punkt 1–19 (2026-09-28) — IKKE COMMITTET

Målt på ekte 375px (device-emulering; Chrome-vinduet klarer ikke under 500px)
og 1440px, mot live som «før». Kalenderdata hentet fra live og matet inn lokalt,
fordi Google-nøkkelen er referrer-låst til bodega.part.no.

| Måling | Før | Etter |
|---|---|---|
| Fokuserbare elementer (375px) | 6 | 20 |
| Arrangementer nåbare med tastatur | 0 av 23 | 15 av 15 med popup |
| `--size-sm` ved 601px | 7,2px | 13px |
| `.event-badge` ved 601px | 5,1px | 13px |
| Tekst ved 200 % forstørrelse | uendret (0 %) | dobles (13→26, 26→52px) |
| Overflyt ved 200 % tekst | — | 0 elementer |
| `<h1>` / `<main>` | 0 / 0 | 1 / 1 |
| npm audit | 34 (2 kritiske, 18 høye) | 6 (0 kritiske) |
| Desktop-typografi 1440px | sm 17,3 / md 57,6 / lg 72 | 17,5 / 57,4 / 71,4 |

Desktop-typografien er altså praktisk talt uendret — det var meningen.

**Bevist med egen testfil** (`[Privat]`-lekkasjen, kjørt mot ekte kode):
- «Julebord Firma AS» + `[Privat]=ja` → ikke i DOM-en, heller ikke `[Info]`-teksten
- «Sommerfest 5. juli» → vanlig rad, opacity 1 (var nedtonet helligdag)
- «Julebord» uten `[Privat]` → fortsatt holiday, opacity 0.75

## KORRIGERING av review-rapporten
UX-agenten meldte at footeren skjuler 7px av siste arrangement på 1440px og 21px
på 1920px. **Det stemmer ikke.** Målt på live: 0px skjult. Innholdet (44px) renner
inn i footerens 20px padding, ikke ut av footeren. Tallet var regnet, ikke målt.
Endringen til `min-height` + clamp er likevel beholdt, men begrunnelsen er en
annen: den gjør footeren robust når teksten forstørres (ved 200 % vokser den
80 → 160px i stedet for å sprenge).

## Tatt utover lista, med grunn
- `.modal-header` er `position: sticky` — i lange popups scrollet lukkeknappen og
  tittelen ut av syne (målt `top: -249` på mobil), og på telefon finnes ingen Esc.
  Tatt fordi modalen ble skrevet om uansett.
- `overscroll-behavior: contain` på `.modal` — scroll lekket til siden bak.
- `:focus-visible`-ring — punkt 2 er verdiløst uten synlig fokus.
- `.event-badge` fikk `var(--size-sm)` — den hadde `0.85vw`/`2.5vw`, som var de
  eneste størrelsene igjen utenfor skalaen da media-query-overstyringene forsvant.
  Fargene er IKKE rørt (grå på grå, 2,04:1) — det hører til punkt 20.
- `.event-title` fikk `overflow-wrap: anywhere`, som `.event-overtitle` alltid har hatt.

## Nye funn fra brukerferd-agenten — ikke fikset, ikke i punkt 1–19
- Plakatbildene i `[bilde]=` er 1,2–2,8 MB PNG, vist på 337×421. Ligger i
  kalenderen, ikke i koden. Opplasteren bør skrive WebP.
- Ingen timeout på kalenderkallet → hengende forbindelse gir evig spinner.
- Ødelagt/tregt plakat-URL gir en stor tom boks (ingen `onError`).
- Ingenting skiller fortid fra framtid i lista.
- «Lukket arrangement» (tittel) og `[Lukket]=` (felt) er to uttrykk for samme ting.
- Instagram-handles i beskrivelsen lenkes ikke (`linkify` tar bare `https?://`).
- `prefers-reduced-motion` mangler fortsatt.
- Trykkflater under 44×44 (footer-lenker, månedspiler, lukkeknapp).

## Venter på Mario
- Punkt 20: mørkne `--bg` fra `#E8391D` til ca. `#C42A12` for lesbar småtekst.
  Flytter merkevarefargen — skal vises side om side først.
- Punkt 21: rette `KALENDER_GUIDE.txt` om at `[Privat]` kun skjuler fra nettsiden.
- `public/bodega-bar.jpg` er beholdt, men er ubrukt: OG-bildet tegnes nå i kode.
- Vercel: `NEXT_PUBLIC_SANITY_DATASET` og `NEXT_PUBLIC_SANITY_PROJECT_ID` bør
  fjernes der også. Koden er slettet først, så bygget brekker ikke.

## Regresjon funnet og fikset (samme økt)
Mario så en klipt visning og spurte om siden var responsiv. Det bildet var et
emulert 1440px-viewport i et smalere Chrome-vindu — artefakt, ikke feil. MEN
sjekken avdekket en ekte regresjon jeg selv hadde innført:

På 768px la «Quiz med Martin Lid (AVLYST)» seg 28px oppå klokkeslettet.
Målt på live: klaringen var 4px. Min større `--size-lg` (42 mot 38px) spiste dem.

Rotårsak var ikke størrelsen, men griddet: `1fr auto 1fr` lar midtsporet vokse
til tittelens maksbredde og presse ut sidekolonnene. `min-width: 0` lå bare på
`.event-row > *`, altså `.event-content` — ikke videre ned i `.event-title-group`,
som derfor fortsatt bidro med full min-content.

Fiks: `minmax(max-content, 1fr) minmax(0, auto) minmax(max-content, 1fr)` —
dato og tid får alltid plassen de trenger, tittelen krymper og brytes. Pluss
`min-width: 0` på `.event-title-group`.

Verifisert etterpå, alle ni måneder per bredde:
- 375px (mobil-grid): 0 kollisjoner, 0 overflyt
- 620px: 0 kollisjoner, 0 overflyt
- 768px: 0 kollisjoner (var 1), tittelen brytes over to linjer
- 1440px: 0 kollisjoner, 0 overflyt, tittel 71px som før

**Lærdom verdt å ta med:** overflyt-skriptet i kontroll-sjekken måler bare mot
viewport-kanten. Det fanget ikke denne, fordi kolonnene kolliderte INNE i raden
uten at noe gikk utenfor skjermen. En kollisjonstest mellom søsken-kolonner bør
inn i skillen ved siden av overflyt-testen.

---

## Runde 2 (2026-09-28, samme dag) — punkt 20, 21 + undertittel-bug

### Undertittelen brøt seg selv
Mario så «Platemesse i samarbeid / med EKKO» delt over to linjer under en kort
tittel. `.event-subtitle` hadde `max-width: 75%`, og prosenten måles mot
midtkolonnen — som er dimensjonert etter det bredeste elementet i seg selv.
Under «Disk Mart» ble kolonnen 378px, undertittelen fikk 284px, og den trengte
378px. Kolonnen var altså bred nok; regelen strammet den inn på egen hånd.

Fiks: `max-width: min(100%, 40ch)`. Lesbar linjelengde er uavhengig av hvor
bred tittelen tilfeldigvis er. Desktop: én linje. Mobil 375px: to linjer, men
nå fordi teksten faktisk ikke får plass, ikke fordi regelen kapper den.

Dette var UX-agentens K2-korrigering, som jeg ikke hadde fulgt opp.
`DESIGN_REVIEW.md:63-64` beskriver mekanismen motsatt vei og er feil.

### Punkt 20 — farge
`--bg` fra `#E8391D` (3,83:1) til `#D43218` (4,52:1). Regnet, ikke gjettet:

| bakgrunn | kontrast mot krem | AA normal |
|---|---|---|
| #E8391D (gammel) | 3,83:1 | nei |
| #D83217 | 4,39:1 | nei |
| **#D43218 (valgt)** | **4,52:1** | **ja** |
| #C42A12 (agentenes) | 5,23:1 | ja |

Valgte minste endring som passerer: 4,6 L*-enheter mørkere mot agentenes 8,6.
`#C42A12` leser som murstein, `#D43218` beholder signalrødheten. Tre
skjermbilder vist til Mario før valget.

Byttet tre steder: `--bg`, `.modal-frame::backdrop` (rgba 232,57,29 → 212,50,24)
og `opengraph-image.tsx`.

**Badge-fargene er fortsatt ikke rørt** (grå #aaa på #f0f0ee, 2,04:1). Den er et
eget designvalg — en lys grå pille på rød flate ser uansett ut som en feil.

### Punkt 21 — KALENDER_GUIDE.txt
KORRIGERING: jeg meldte at guiden «lover mer enn koden holder». Den hadde
allerede et presist avsnitt om at kalenderen er åpen (linje 63-71). Jeg
videreformidlet sikkerhetsagentens påstand uten å lese fila.

Det som faktisk manglet: `[Privat]` sto uten forbehold i det hele tatt. Nå har
feltet en NB-linje, `[Internt]` kryssreferer, og avsnittet nederst dekker begge
felt, lister hva som aldri hører hjemme i kalenderen, og sier at genuint skjulte
arrangementer må i en egen lukket kalender.

### Vercel
`NEXT_PUBLIC_SANITY_DATASET` og `NEXT_PUBLIC_SANITY_PROJECT_ID` fjernet fra alle
tre miljøer. Bare de to Google Calendar-variablene står igjen. (Gjenopprettes om
nødvendig: projectId `1etgf2m5`, dataset `production`.)

### Utilsiktet
`pkill -f "next-server"` tok ned bodegenerator-serveren til Mario. Den var ikke
min. For bred match — bruk full sti neste gang.
