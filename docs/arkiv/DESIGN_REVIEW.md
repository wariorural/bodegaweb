> **Arkiv (april 2026).** Utdatert på flere punkter — fargen er nå `#D43218` og badgen
> bruker tokens. Gjeldende designsystem står i `CLAUDE.md`.

# Bodega — Designreview (April 2026)

Review gjort med screenshots av bodega.part.no på desktop (1440px) og mobil (375px).

---

## Fikset i denne reviewen

### Typografiskala — manglende midtsteg
**Problem:** Skalaen hadde bare to reelle trinn — `--size-lg` (5vw = 72px) og `--size-sm` (1.2vw = 17px). Arrangør, undertittel og dagsnavn havnet alle på samme størrelse til tross for ulik informasjonsverdi.

**Fix:** La til `--size-xs: 1.8vw` som midtsteg. Arrangør og undertittel bruker nå `--size-xs`. Dagsnavn, nav og footer beholder `--size-sm`.

---

### Undertittel usynlig på dagens rad
**Problem:** Event-raden for «i dag» inverterer bakgrunn til krem (`--red`). Undertittelen manglet fargeoverstyre og ble usynlig (krem tekst på krem bakgrunn).

**Fix:** La til `.event-row.today .event-subtitle { color: var(--bg); }`.

---

### Undertittel lekket over sticky header på mobil
**Problem:** Når siden scrollet til today-raden, var undertittelen til forrige event delvis synlig under måneds-headeren — som frittstående tekst uten kontekst.

**Fix:** Økt `z-index` på `.month-header` fra `50` til `99` slik at den dekker innhold som scroller under.

---

### Måned og år: ulik størrelse på mobil
**Problem:** Mobiloverstyre satte `month-year` til `4.8vw` mens `month-name` brukte `--size-md: 8.5vw`. Stor visuell ulikhet mellom like elementer.

**Fix:** Fjernet `month-year`-overstyre på mobil. Begge er nå `--size-md` på alle skjermstørrelser.

---

### Modal: daytime og arrangør visuelt for like
**Problem:** `modal-daytime` (1.5vw) og arrangørfeltet (1.2vw) var nesten identiske i størrelse, uten tydelig hierarki.

**Fix:** `modal-daytime` bruker nå `--size-xs` (1.8vw). Arrangøren beholder `--size-sm` (1.2vw) via spesifikk override.

---

### Modal: brødtekst noe stor
**Problem:** `2.2vw` ga lang linjelengde i den 640px-brede modalen.

**Fix:** Redusert til `2.0vw`.

---

### Mobil: baseline-alignment på event-rader
**Problem:** `align-items: first baseline` på mobil ga uforutsigbar plassering av klokkeslett når titler brytes over to linjer.

**Fix:** Endret til `align-items: start` på mobil.

---

## Gjenstående observasjoner (ikke kritiske)

### Badge-farger utenfor tokensystemet
`.event-badge` bruker hardkodede verdier (`#ccc`, `#aaa`, `#f0f0ee`) fremfor designtokens. Dette er et bevisst valg for å gi badgen en nøytral, nedtonet karakter — men avviker fra systemet. Hvis fargepaletten noen gang endres, må badgen oppdateres manuelt.

### Undertittel max-width på desktop
`max-width: 75%` på undertittel betyr at svært korte undertitler kan se isolert ut midt i en bred rad. Fungerer godt i praksis med eksisterende innhold, men kan gi problemer med veldig kort tekst.

### Touch-target på lukk-knapp i modal
`modal-close` har `padding: 8px` på et `--size-sm`-element. På mobil kan dette komme under 44px touch-target-anbefaling. Ikke fikset siden det ikke er rapportert som problem i praksis.
