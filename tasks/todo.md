# /utleie — utleieside med skjema til mail

Låst med Mario 02.10.26: ekte endepunkt via Resend, to designretninger til
gjennomsyn, utstyrsliste og bilder kommer fra Mario.

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

## Avhengig av Mario

- [x] ~~Vibbebilder~~ → fire inne, beskåret 4:5
- [ ] **Plantegning** — seksjonen finnes og rendrer ingenting til `PLANTEGNING`
      settes i `innhold.ts`. PDF eller bilde. Be Jørund om den som gikk til Ekko.
      A og B må merkes på tegningen, med samme navn som `PUNKTER`.
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
