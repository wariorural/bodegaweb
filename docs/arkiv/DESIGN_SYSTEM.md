> **Arkiv (april 2026).** Utdatert på flere punkter — fargen er nå `#D43218` og badgen
> bruker tokens. Gjeldende designsystem står i `CLAUDE.md`.

# Bodega — Designsystem

## Farger

| Token | Verdi | Bruk |
|-------|-------|------|
| `--bg` | `#E8391D` | Bakgrunnsfarge (rød) |
| `--red` | `#F7F5F0` | All tekst og streker på rød bakgrunn (krem/hvit) |
| `--black` | `#F7F5F0` | Samme som `--red` — bruk for brødtekst |
| `--line` | `rgba(247,245,240,0.3)` | Skillelinjer mellom event-rader |

Merk: `--red` og `--black` er samme farge. Variabelnavnene er historiske — tenk på dem som "forgrunnsfarge".

Badge-elementet (`event-badge`) bruker bevisst nøytrale grå-farger utenfor tokensystemet for å signalisere "lukket/nedtonet" tilstand.

---

## Typografi

**Font:** Neureal (lokal .otf), fallback Arial

### Størrelsessystem — alltid vw, aldri px

| Token | Desktop | Mobil | Bruk |
|-------|---------|-------|------|
| `--size-lg` | `5vw` | `9.5vw` | Dato, eventtittel, klokkeslett |
| `--size-md` | `4vw` | `8.5vw` | Månedsnavn, år, modaltittel |
| `--size-xs` | `1.8vw` | `4.5vw` | Arrangør, undertittel, modal-daytime |
| `--size-sm` | `1.2vw` | `3.5vw` | Nav, footer, dagsnavn, tilstandsmeldinger |

**Regel:** Bruk alltid en eksisterende variabel. Ikke legg til nye størrelser uten god grunn.

### Mobil-unntak
- `event-date-num`: `6vw` (ikke `--size-lg`) — litt mindre enn tittel for bedre balanse
- `event-time`: `6vw` — matcher dato
- `event-title`: `9.5vw` — som `--size-lg`
- `modal-title`: `9.5vw`
- `modal-body`: `4.5vw`
- `modal-daytime`: `3.5vw` (bruker `--size-sm` på mobil)

---

## Layout

### Grid — event-rader

**Desktop:** `grid-template-columns: 1fr auto 1fr` — dato venstre, tittel midtstilt, klokkeslett høyre  
**Mobil:** `grid-template-columns: auto 1fr auto` — dato venstrestilt med fast bredde  

`align-items: first baseline` på desktop (dato/tittel/tid baseline-aligner)  
`align-items: start` på mobil

### Spacing

| Token | Verdi | Bruk |
|-------|-------|------|
| `--pad-x` | `24px` | Horisontal padding overalt (16px på mobil via override) |
| `--nav-h` | `56px` | Navigasjonsbar høyde |
| `--footer-h` | `76px` | Footer høyde |
| `--stroke` | `1.5px` | Alle skillelinjer og borders |

**Regel:** Venstre og høyre padding skal alltid være `--pad-x`. Bruk aldri andre verdier for horisontal padding uten å endre begge sider.

---

## Komponenter

### Nav
- Sticky, `top: 0`, `z-index: 100`
- Tekst: `--size-sm`, farge `--red` (=krem)

### Månedsnav (month-header)
- Sticky, `top: var(--nav-h)`, `z-index: 99`
- Månedsnavn og årstall: `--size-md`, like store
- Pil-knapper: `--size-md`, min padding 8px (touch-target)

### Event-rad
Tre kolonner: dato | innhold | tid

**Dato (venstre):**
- Datotall: `--size-lg`, `line-height: 1`
- Dagsnavn: `--size-sm`, `letter-spacing: 0.05em`

**Innhold (midtstilt):**
- Tittel: `--size-lg`, sentrert
- Arrangør / host: `--size-xs`, sentrert
- Badge (Lukket etc.): `0.85vw`, grå, uppercase, `letter-spacing: 0.12em`
- Undertittel: `--size-xs`, sentrert, maks 75% bredde (100% på mobil)

**Tid (høyre):**
- `--size-lg`, høyrestilt, `justify-self: end`

### Event-tilstander

| Klasse | Utseende |
|--------|----------|
| `has-event` | Normal |
| `today` | Krem bakgrunn (`--red`), tekst rød (`--bg`) |
| `closed` | `opacity: 0.45` |
| `holiday` | `opacity: 0.75` |
| `private` | Skjult (`return null`) |
| `has-popup` | Klikkbar, hover-effekt |

### Popup-modal
- Overlay: `rgba(232,57,29,0.55)` + `backdrop-filter: blur(16px)`
- Ramme (`modal-frame`): `--red` (krem) med 3px padding, avskårede hjørner (clip-path)
- Indre: `--bg` (rød bakgrunn), max-height `80vh`, overflow-y auto
- Daytime: `--size-xs`, `letter-spacing: 0.1em`
- Tittel: `--size-lg`
- Arrangør (i header): `--size-sm`
- Brødtekst: `2.0vw` / `4.5vw` mobil, `line-height: 1.6`

### Footer
- Fast bunn, `z-index: 100`
- Tekst: `--size-sm`

---

## Responsivt

Én breakpoint: `max-width: 600px`

Alt overstyres via `:root`-variabler i media query — ingen separate stilregler for layout med unntak av padding, grid-kolonner og noen spesifikke størrelser.
