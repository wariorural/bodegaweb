# /utleie — utleieside med skjema til mail

Låst med Mario 02.10.26: ekte endepunkt via Resend, to designretninger til
gjennomsyn, utstyrsliste og bilder kommer fra Mario.

## Status 02.10 — LIVE på bodega.part.no/utleie

Retning B «Lokalet» valgt. `noindex, nofollow`, ikke lenket fra forsiden.
Commit `bd6de40`. Verifisert mot live: 200, noindex i head, forsidens footer
uendret.

## Avhengig av Mario

- [ ] **3–4 vibbebilder** av lokalet. Legges i `public/lokalet-1..4.jpg`.
      Skissene kjører med plassholdere til de kommer.
- [ ] **Utstyrsliste** — `fakta.md` har bare «projektor, lerret og mic».
      Står det en PA, en mikser, DJ-rigg? Fyll `TEKNISK` i `utleie/innhold.ts`.
- [x] ~~Velg retning~~ → B «Lokalet»
- [ ] **`RESEND_API_KEY`** — til den er satt svarer skjemaet «Klarte ikke
      sende. Send gjerne en mail til bodega@part.no i stedet.»
      `npx vercel env add RESEND_API_KEY production` (og `preview`), så redeploy.
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
