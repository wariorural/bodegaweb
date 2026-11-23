# /utleie — utleieside med skjema til mail

Låst med Mario 02.10.26: ekte endepunkt via Resend, to designretninger til
gjennomsyn, utstyrsliste og bilder kommer fra Mario.

## 23.11 — lenket fra forsiden, synlig i søk

«Leie / booking →» står i bunnteksten der e-postadressen sto (Marios valg:
erstatte mailen, ikke legge til en tredje linje), og `robots: noindex` er
fjernet fra `/utleie`. Footeren har fortsatt to linjer per kolonne, så
`--footer-h` er uendret. Sjekket på 375 px: footer 80 = body-padding 80.

## Status 02.10 — LIVE på bodega.part.no/utleie

Retning B «Lokalet» valgt. `noindex, nofollow`, ikke lenket fra forsiden.
Commit `bd6de40`. Verifisert mot live: 200, noindex i head, forsidens footer
uendret.

## Dagslogg 02.10

LIVE på bodega.part.no/utleie, noindex, ikke lenket fra forsiden. Fire commits.
Retning B «Lokalet» valgt. Skjemaet verifisert mot prod (200). Fire ekte bilder
inne. 2 500-alternativet fjernet fra både siden og fakta.md. Bodega/ ligger nå på
det private repoet wariorural/bodega-kunnskap.

## Dagslogg 06.10 — Antons fire punkter

Anton ba (mail 02.10) om utstyrsliste, kart over lokalet, navn A/B på de to
punktene, og en meldingsboks om foredrag. Tre av fire er bygget:

- Avkrysning «Utstyr dere ønsker» i skjemaet, drevet av samme `TEKNISK`-liste
  som Teknisk-seksjonen. Én liste å vedlikeholde.
- Avkrysning «Foredrag eller innlegg» med `PUNKTER` — punkt A ved projektoren,
  punkt B i vindushjørnet — og forklaringen i `PUNKT_NOTE`.
- Fritekstfelt «Om foredraget» rett under.
- Begge grupper havner i mailen (`Ønsket utstyr`, `Foredrag ved`, `Om foredraget`).

Utstyrslista kom fra Mario samme dag og er inne — seks enheter, både som tags i
Teknisk-seksjonen og som avkrysning i skjemaet. `fakta.md` i bodega-kunnskap er
rettet tilsvarende (ikke committet der).

Plantegningen venter på fila. A/B-navnene står allerede i `innhold.ts` og skal
stemme med merkingen på tegningen når den kommer.

Verifisert 06.10: `npm run build` grønn, 1440px og 375px uten horisontal scroll,
ingen console-feil, avkrysningene 20×44 (firkant mot radioens oval), payload
sender begge grupper kommaseparert. Mailkroppen er ikke sett — lokal
`RESEND_API_KEY` er ugyldig, så ruten stopper på 502 før utsending.

## Intro-teksten 06.10

Mario viste teksten fra part.no: Bodega er «en møteplass for byens design- og
arkitekturfelt». Utleiesidens INTRO lovet noe annet — bursdager og firmafester
først. Omskrevet til rekkefølgen hva Bodega er → hva det leies til → hva dere
får. De praktiske tallene (67 plasser, bar, scene, projektor) flyttet til siste
setning, ingen fakta tapt. Teksten fra part.no ligger nå i `fakta.md`, så
mail-utkastene bruker samme ramme.

## Avhengig av Mario

- [x] ~~Vibbebilder~~ → fire inne, beskåret 4:5
- [x] ~~**Plantegning**~~ → `public/plantegning.svg`, live med A og B merket
- [x] ~~**Utstyrsliste**~~ → Mario 06.10: projektor og lerret, stor TV,
      2 mikrofoner, lydanlegg, Pioneer XDJ-RX3 og en liten miksepult. Inne i
      `TEKNISK`, og `fakta.md` rettet tre steder (lyd/lys-linja, FAQ-svaret og
      svarmalen). Mario skrev «1 mikrofon» to ganger — lest som to mikrofoner,
      bekreft.
- [x] ~~fakta.md oppgir 2 500 som generelt alternativ~~ → fjernet fire steder,
      og lagt inn igjen som «Ikke offentlig — kun fagforeninger»
- [x] ~~Velg retning~~ → B «Lokalet»
- [x] ~~`RESEND_API_KEY`~~ satt i Production. Testforespørsel mot prod ga 200.
      Leveringen i innboksen er ikke verifisert herfra — Gmail-koblingen er ikke
      autentisert i denne sesjonen.
- [x] ~~RESEND_API_KEY i Preview~~ — den var der hele tiden; jeg leste
      `vercel env ls production` og tolket filteret som fravær.
- [ ] **Godkjenning fra styret** på tekst og priser → så fjernes `robots` fra
      `utleie/page.tsx` og footerens «Leie Bodega?» blir lenke til `/utleie`.

## Bygget 02.10 — venter på valg

- [x] `utleie/innhold.ts` — alt tekstinnhold på ett sted, delt av begge skisser
- [x] `utleie/page.tsx` — retning A, typografisk
- [x] `utleie/bilder/page.tsx` — retning B, bildeforankret (midlertidig, slettes)
- [x] `utleie/skjema.tsx` — klient-komponent, honeypot + tidsvakt
- [x] `api/utleie/route.ts` — POST → Resend via fetch, ingen npm-pakke
- [x] CSS i `globals.css`, scopet under `.utleie`, ingen nye størrelser
- [x] Footerens døde «Leie Bodega?» blir lenke til `/utleie`

## Verifisert 02.10

| Test | Resultat |
|------|----------|
| Honeypot utfylt | 200 `{ok:true}`, ingen mail sendt |
| Under 3 s utfyllingstid | 200 `{ok:true}`, ingen mail sendt |
| Manglende melding | 400 «Navn, e-post og melding må fylles ut.» |
| Ugyldig e-post | 400 «Sjekk e-postadressen.» |
| Gyldig forespørsel | når Resend (401 uten nøkkel → 502 + fallback-tekst) |
| Ikke-JSON body | 400, ingen krasj |
| 375px / 1440px | ingen horisontal scroll, ingen nye `--size-*` |
| `npm run build` | grønn |

Feil funnet og rettet underveis: radioknappene arvet `min-height: 44px` fra
input-regelen og ble 20×44-ovaler. `:not([type='radio'])` på den regelen.

## Gjenstår før live

- [ ] `RESEND_API_KEY` i Vercel (Production + Preview) — **env krever redeploy**
- [ ] Bekreft at `utleie@send.part.no` er verifisert avsender i Resend-kontoen
- [ ] Bytt ut `public/lokalet-1..4.jpg` (nå fire utsnitt av samme skiltbilde)

## Opprinnelig verifikasjonsplan

- Skjema: POST med tom honeypot → mail i bodega@part.no, reply-to = avsender
- Skjema: utfylt honeypot → 200 uten at mail sendes (bot skal ikke lære noe)
- Skjema: manglende navn/epost/melding → 400 med feil annonsert i `role="alert"`
- Layout: 375px og 1440px, ingen horisontal scroll, ingen nye `--size-*`
- a11y: label på hvert felt, `fieldset`/`legend` på radiogruppene, tab gjennom
  hele skjemaet uten å miste fokus
- Input-font ≥ 16px på mobil (`--size-xs`-gulvet er 1rem) → ingen iOS-zoom

## Åpne spørsmål å ta med Mario før live

`fakta.md` har fire ubesvarte bookingregler: forskuddsbetaling, minimumsbeløp,
avbestillingsfrist, aldersgrense. En offentlig prisside genererer nettopp de
spørsmålene.

## Dagslogg 07.10 — fagforeningsprisen tilbake, åpent på siden

Anton (mail 07.10) ba om å beholde 2 500-tilbudet for de som står i baren selv,
med et engangsbeløp på 500 kr for opplæring og en navngitt ansvarlig. Mario
presiserte hvorfor: det er et virkemiddel overfor fagforeninger, så mer av
budsjettet kan gå til foredragsholderen. Besluttet at den står **åpent på siden**,
men merket så den ikke kan leses som en pris for alle.

- `PRIS` → `PRISER`: to kort side om side. Det nye har merkelappen «Kun for
  fagforeninger» over prisen, i full ramme (`--red`, ikke `--line`) nettopp fordi
  den må leses før tallet.
- `PRIS_NOTE` under kortene gjentar avgrensningen i klartekst.
- Skjemaet: avkrysning «Vi er en fagforening og vil betjene baren selv» og
  fritekstfelt «Ansvarlig for baren». Begge går i mailen (`Baren`,
  `Ansvarlig for baren`) via `FELT` i `api/utleie/route.ts`.
- `fakta.md` i bodega-kunnskap er rettet i samme økt: bulleten het «Ikke
  offentlig — kun fagforeninger … Står ikke på nettsiden. Nevn det aldri
  uoppfordret», og den regelen er nå feil. Ny bullet + svarmal for spørsmålet,
  som nå vil bli stilt siden prisen står ute. Ikke committet der.

Verifisert: `npm run build` grønn, typecheck grønn. På 1440px ligger kortene side
om side (begge 416px, samme topplinje), ingen horisontal scroll. **375px er ikke
sett med øynene** — Chrome-utvidelsen sluttet å svare midt i sjekken. Lest ut av
CSS-en i stedet: under 600px blir `.u-seksjon` én spalte og `--pad-x` 16px, så
kortene har 343px å gå på mot `minmax(16rem, …)` = 256px, og stabler seg. Bør
likevel ses før push.

## Gjenstår

### Plantegningen — inne 07.10

Arkitektens eksport (`public/bod-plan-261007-v1.svg`) var 3,7 MB og 57 602
`<line>`. `tools/bygg-plantegning.py` gjør den om til `public/plantegning.svg`
(204 KB) og kan kjøres på nytt hvis det kommer en ny versjon:

    python3 tools/bygg-plantegning.py public/bod-plan-261007-v1.svg public/plantegning.svg

Hva skriptet gjør, og hvorfor det ser ut som det gjør:
- 55 763 elementer var skravur i nær-hvitt (#dbdbdb/#f0f0f0/#f4f4f4) — tresliten
  inni bordene og gulvmønster. Usynlig på hvitt, helt borte mot det røde.
- Måltekst (87°, 1.0, 3.0) og målsettingsapparatet utenfor bygget er ute.
  Målekryssene tas på mønster — fire korte streker fra samme punkt — ikke på
  område: inngangspartiet nede til venstre ligger midt i det som ellers ser ut
  som «utenfor», og en områderegel spiste det.
- **Klippemaskene må stå.** De settes via CSS-klasser (`.st9 { clip-path: … }`),
  ikke attributter, så det er ikke mulig å se hvilke som er i bruk. Fjernes de,
  renner de fylte flatene utover hele tegningen. Derfor legges fargereglene
  *etter* arkitektens eget stilark, ikke i stedet for.
- Flater uten `fill`-attributt arver svart. Alle formtypene må settes, ikke bare
  `rect` og `path` — ett enkelt `<polygon>` var hele fasadebjelken.

Kostnad: siden er 472 KB rå / 90 KB gzippet, fordi Next serialiserer den inlinede
SVG-en både som HTML og i RSC-payloaden. Omtrent som ett av bildene i stripa.
Alternativet er `<img>` — halverer sida, men da mister de fem romnavnene Neureal.
- ~~Fagforeningsprisen bør bekreftes med Martin~~ → fjernet fra siden 20.11.

## Dagslogg 21.10 — break-ui (worst case-test av kalenderen)

LIVE (`9c54851`, pushet sammen med utleie-commit `93a2728`). Verifisert på bodega.part.no.
Fikset: popup sentrert (lå i hjørnet siden 28.09), helligdag-regex på hele ord,
månedsheader wrap, ødelagt bilde skjules, badge på tokens, popup-tittel --size-md,
nbsp foran tankestrek, URL-brudd i popup. Testsett: `?data=verst|tom|en|500` (kun dev).

Gjenstår / ikke gjort:
- [ ] `KALENDER_GUIDE.txt` lover mer om [Privat] enn koden holder (gammelt punkt)
- [x] Helligdagslogikken fjernet helt (tom kalender = stengt)
- Bevisst droppet: heldagsarrangementer (tom kalender = stengt)

## Ønsker fra Mario 19.11.2026

### Først
- [ ] **Mailknapp** — `mailto:bodega@part.no?subject=Leie%20av%20Bodega` i
      header/footer og på `/utleie`
- [ ] **Bildearkiv** — egen side (`/arkiv`), rutenett av bilder fra kvelder,
      evt. sortert per arrangement eller måned. Kilde: delt Drive-mappe, så nye
      bilder bare legges i mappa. Samme mønster som `verktoy/charmera-galleri`
      (filmruller.vercel.app: offentlig mappe, embeddedfolderview, ingen auth)

### Forslag, ikke bestemt
- [ ] Åpningstider og adresse synlig øverst, med kartlenke
- [ ] Instagram-lenke
- [ ] Delbare lenker til enkeltarrangementer i kalenderen
- [ ] Nyhetsbrev-påmelding (henger sammen med planlagte `bodega-email-automation`)
- [ ] Delingsbilde (OG) så lenken ser bra ut i meldinger, evt. i bodegenerator-stil

## Dagslogg 20.11 — overhaling (ikke committet, venter på Mario)

Bygget lokalt, verifisert med `next build` + `next start` mot ekte kalender:
- Programmet hentes på serveren og ligger i HTML-en (34 Event-er i schema.org).
  Private arrangementer og `[Internt]` når ikke lenger nettleseren i det hele tatt.
  Henter på nytt hver tredje time (Mario 20.11), og ved hver deploy. Ingen cron.
- `?e=`-lenker får egen tittel, beskrivelse og delingsbilde (`/bilde/<id>`).
  «Del arrangementet» i popupen: delingsark på mobil, kopier lenke ellers.
- Åpningstider midt i nav (lest fra `utleie/innhold.ts`), adresse med kartlenke
  midt i footeren.
- Hint om popup: liten + etter undertittelen, eller «Mer info +» under tittelen
  der det ikke er noen undertittel.
- Passerte arrangementer tonet ned (0.55).
- Orddeling i titler: «Musikkvideo-/kveld» i stedet for «Musikkvideokvel/d».
- Footer: én mail-lenke, «Instagram ↗». `/utleie` er IKKE lenket fra forsiden
  (Mario 20.11) og fortsatt `noindex`.
- Sikkerhet: API-nøkkelen ute av klientbundelen, `/bilde/<ukjent>` → 404,
  X-Frame-Options/nosniff/Referrer-Policy, utleieskjemaet har signert tidsstempel
  (HMAC, avledet fra RESEND_API_KEY) og lengdegrenser. Testet: uten/falskt/t=0 →
  400, for raskt → stille 200, for lang → 400, gyldig → videre til Resend.

Etter push:
- [ ] Del en `?e=`-lenke i Messenger for å se delingsbildet
- [x] Firewall-regel «Utleieskjema: maks 5 per 10 min» (POST /api/utleie, per IP)
      → publisert 20.11
- [x] Ny Google-nøkkel → `GOOGLE_CALENDAR_API_KEY` (20.11), live og verifisert.
      Den GAMLE nøkkelen skal IKKE slettes: bodegenerator bruker den fra
      nettleseren. Gjenstår: fjern `NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY` fra
      bodegawebs Vercel-env (ubrukt nå), og evt. bodega.part.no fra den gamle
      nøkkelens nettstedsliste i Google Cloud.

## Dagslogg 20.11 — gjennomgang av /utleie (ikke committet)

- Fagforeningsprisen fjernet helt (Mario 20.11): kortet, notatet, «Baren» i
  skjemaet, «Ansvarlig for baren», og feltene i mailen. Én pris igjen: 3 750 kr.
  `fakta.md` sier fortsatt «Ikke offentlig — kun fagforeninger», som nå stemmer.
- Alle valg i skjemaet er Neureals ○ med • oppå, også avkrysningene (de var
  20×44-rektangler). Prikken satt skjevt fordi glyfene ikke deler senter; nå
  forskjøvet med tall målt i fontfila. Utstyr og punkt er fortsatt flervalg.
- Pushet 20.11. /utleie er live, men ikke lenket og `noindex` til styret sier ja.
- Footeren på /utleie lik forsidens: Instagram + telefon, adresse med kartlenke
  i midten, mail til høyre.
- Telefon-feltet fikk maxLength som de andre.
