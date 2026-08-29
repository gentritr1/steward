---
name: Steward // Ground Control
description: An instrument-dark flight deck for a creator's Mac — segmented LED bars, one lit dial, and a character who only says what the collector measured.
colors:
  void: "oklch(0.17 0.028 264)"
  deck: "oklch(0.225 0.032 264)"
  deck-raised: "oklch(0.27 0.034 264)"
  well: "oklch(0.145 0.025 264)"
  rule: "oklch(0.34 0.03 264)"
  rule-bright: "oklch(0.56 0.035 264)"
  text: "oklch(0.97 0.008 264)"
  text-2: "oklch(0.8 0.02 264)"
  text-3: "oklch(0.66 0.022 264)"
  signal: "oklch(0.86 0.2 130)"
  plasma: "oklch(0.8 0.14 205)"
  amber: "oklch(0.82 0.15 78)"
  coral: "oklch(0.72 0.17 25)"
  violet: "oklch(0.72 0.15 300)"
dayShift:
  void: "#f4f4ef"
  deck: "#ffffff"
  deck-raised: "#f5f5f0"
  well: "#ecece4"
  rule: "#d9d9d1"
  rule-bright: "#767c88"
  text: "#131720"
  text-2: "#3a4150"
  text-3: "#5c6472"
  signal: "#6f8f14"
  plasma: "#5b3fd6"
  amber: "#9a6a08"
  coral: "#c0392b"
  violet: "#5b3fd6"
typography:
  hero:
    fontFamily: "Space Grotesk, Inter, ui-sans-serif, sans-serif"
    fontSize: "clamp(2rem, 3.4vw, 2.9rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "Space Grotesk, Inter, ui-sans-serif, sans-serif"
    fontSize: "clamp(1.4rem, 2.2vw, 1.9rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  h3:
    fontFamily: "Space Grotesk, Inter, ui-sans-serif, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, ui-sans-serif, -apple-system, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: "Inter, ui-sans-serif, -apple-system, sans-serif"
    fontSize: "0.84rem"
    lineHeight: 1.5
  label:
    fontFamily: "JetBrains Mono, SF Mono, ui-monospace, Menlo, monospace"
    fontSize: "0.68rem"
    fontWeight: 700
    letterSpacing: "0.09em"
    textTransform: "uppercase"
  readout:
    fontFamily: "JetBrains Mono, SF Mono, ui-monospace, Menlo, monospace"
    fontSize: "clamp(2.2rem, 4.6vw, 3.4rem)"
    fontWeight: 700
    fontVariantNumeric: "tabular-nums"
rounded:
  xs: "3px"
  sm: "6px"
  md: "10px"
  pill: "999px"
  notch: "14px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  panel: "22px"
  channel: "56px"
components:
  keycap:
    backgroundColor: "{colors.deck-raised}"
    textColor: "{colors.text}"
    border: "2px solid {colors.rule-bright}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
    shadow: "0 2px 0 {colors.well}"
  chip:
    backgroundColor: "{colors.deck-raised}"
    textColor: "{colors.text-2}"
    border: "1px solid {colors.rule}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  panel:
    backgroundColor: "{colors.deck}"
    border: "1px solid {colors.rule}"
    rounded: "{rounded.md}"
    padding: "22px"
  panel-notch:
    backgroundColor: "{colors.deck}"
    border: "1px {colors.rule} via inset"
    rounded: "{rounded.md}"
    padding: "22px"
    notch: "{rounded.notch}"
  seg:
    height: "10px"
    gap: "2px"
    ramp: "0.10 / 0.30 / 0.62 / 0.85"
  risk-badge:
    rounded: "{rounded.pill}"
    padding: "4px 10px"
    fontSize: "0.62rem"
---

# Design System: Steward // Ground Control

## 1. Overview

**Creative North Star: "Ground Control"**

Steward is an instrument-dark flight deck for one machine. The deck is read, not browsed: a lit dial for the one number that matters, segmented LED bars for every other quantity, a phosphor scope for the trace over time, and a small character in the corner who reports and refuses. Nothing on the deck is decorative — every lit thing is a reading.

The product is still product software. Native disclosure, semantic headings, progress semantics, focus outlines, and keyboard operation stay familiar. What changed from the retired editorial draft is the room, not the ethics: the deck is dark and machine-legible, mono carries all machine data, and the character is allowed to be funny about its own posture but never about the numbers.

**Key Characteristics:**

- One dial, many segmented bars — quantity has exactly one visual idiom
- Machine data is always mono and always tabular
- A lit thing means a measurement, not an alarm
- Character in the form; literalism in the facts
- Observation only — the strongest gesture in the product files something for review
- Reduced motion is gentler, never blank

## 2. Colors

The deck is a night instrument panel: near-black canvas, one raised deck tone, and a small bank of phosphor signals. Colour identifies an instrument, not a severity.

### Canvas

- **Void** `oklch(0.17 0.028 264)` — the page ground and the ink cut into a lit body.
- **Deck** `oklch(0.225 0.032 264)` — every panel face.
- **Deck Raised** `oklch(0.27 0.034 264)` — chips, keycaps, the scrub chip.
- **Well** `oklch(0.145 0.025 264)` — recessed instrument beds: the dial track, the scope, transcripts, the character's body.
- **Rule** `oklch(0.34 0.03 264)` — panel borders and dividers.
- **Rule Bright** `oklch(0.56 0.035 264)` — keycap edges, tick marks, the scrub crosshair, and unlit band markers.

### Text

- **Text** `oklch(0.97 0.008 264)` — headings, readouts, primary values.
- **Text 2** `oklch(0.8 0.02 264)` — chips, the character's line, supporting prose.
- **Text 3** `oklch(0.66 0.022 264)` — metadata, axis labels, units.

### Signals

- **Signal** `oklch(0.86 0.2 130)` — the house phosphor. Free space, the dial, the scope trace, focus outlines, the observe-only seal.
- **Plasma** `oklch(0.8 0.14 205)` — the second instrument hue: disk-used bars, inline code, footer links, text actions at rest.
- **Amber** `oklch(0.82 0.15 78)` — the watch band. Band markers, watch/edge status chips, the once-only band-crossing flush.
- **Coral** `oklch(0.72 0.17 25)` — reserved. The 90 band marker, `risk-high`, and the status chip when the disk is at or past 99.5% used or the reading did not come back.
- **Violet** `oklch(0.72 0.15 300)` — the second run inside a segmented bar (the rebuildable slice) and the ceremony checkerboard.

Each signal has a `*-dim` companion at 16% (violet at 18%) used as chip and badge fill, so a coloured chip never becomes a solid block of hue.

### The Phosphor Ramp

Every lit cell on the deck reads from one four-step ramp, defined once:

```
--lit-dim: 0.10   --lit-mid: 0.30   --lit: 0.62   --lit-hi: 0.85
```

Unlit cell, second run, lit run, head cell. A tone class swaps the hue; it never touches the ramp.

### Day Shift

Day is the same deck lit from outside, not a second design. The canvas inverts to `#f4f4ef` / `#ffffff`, text to `#131720` / `#3a4150` / `#5c6472`, and the signals darken to survive a white ground: signal `#6f8f14`, plasma and violet both `#5b3fd6`, amber `#9a6a08`, coral `#c0392b`. Because a lit cell now has to fight white instead of black, the ramp climbs — `0.18 / 0.45 / 0.92 / 1` — and the ambient texture retreats: `--glow-mix` drops 60% → 14%, the sheen flips from white-on-dark to black-on-light, and the vignette all but disappears. `--on-signal` flips with the theme so ink painted on a signal fill stays legible in both.

### Named Rules

**The Hue Law.** A lit arc or bar never changes hue or opacity with its value. The hue is a property of the instrument; the reading is carried by length and by the ramp alone. Status colour lives on the chip beside the instrument, never in the stroke. Amber belongs to band markers and status chips. Coral appears only at ≥99.5% used, at the 90 band marker, on `risk-high`, or when a reading did not come back at all.

**The Calm Status Rule.** Red is not a mood. Growth, review, and uncertainty use ink and amber; coral means full or unreadable, and nothing else.

## 3. Typography

**Display:** Space Grotesk (700, `-0.02em`, line-height 1.1) — all of `h1`–`h4`.
**Body:** Inter (400, 1.55) — prose, controls, navigation.
**Machine:** JetBrains Mono — every label, chip, keycap, readout, path, delta and axis, always `font-variant-numeric: tabular-nums` via `.mono-num`.

**Character:** the sans is Steward explaining; the mono is the instrument reporting. A number that came off a sensor is always mono and always tabular, so digits never shift width as a value counts up.

### Scale

- **Hero** `clamp(2rem, 3.4vw, 2.9rem)` — the daily headline.
- **H2** `clamp(1.4rem, 2.2vw, 1.9rem)` — channel titles.
- **H3** `1.05rem` — subsection headings.
- **Body** `0.95rem` · **Small** `0.84rem`.
- **Label** `0.68rem`, mono, 700, uppercase, `0.09em` — mono labels; `0.07em` on chips, `0.08em` on keycaps, `0.1em` on the observe seal.
- **Readout** `clamp(2.2rem, 4.6vw, 3.4rem)` — the standalone instrument readout. Inside the dial the readout is sized against the dial itself (`clamp(1.4rem, 12.4cqw, 2rem)`) so the text-to-stroke clearance is a fixed proportion at every viewport.

### Named Rules

**Mono Is For Machines.** If a value was measured, timed, sized, or ranked, it is mono and tabular. If it was written by a person, it is Inter. Never set prose in mono to look technical.

## 4. Instruments

### The Dial

One generator draws every dial, from one geometry table — so a reticle can never drift off the stroke it caps.

- **Sweep:** 240°, `M 30.7 140 A 80 80 0 1 1 169.3 140` — r=80 about (100, 100), start 210°, viewBox `0 8 200 144`. A 360° ring variant shares the same anatomy.
- **Ticks:** 25 calibration marks under the track (`stroke-dasharray: 0.35 3.65`, opacity 0.22) so the unlit part reads as a scale, not an empty gutter.
- **Track:** `--well`, 9-wide, round caps. **Value:** the instrument hue, 9-wide, with a `--glow-mix` drop shadow.
- **Reticle:** a 4px disc whose centre is computed from the same geometry the path is drawn from, so it sits exactly on the arc's end.
- **Readout:** absolutely positioned at `inset: 0` and centred. The 240° arc spans y 20→140 and the viewBox is trimmed symmetrically about y 80, so centring the block lands the readout on the arc's own bounding-box midpoint and keeps it stable as the font clamps down.
- **No reading:** `data-empty="true"` drops the ticks to 0.12 and the track to 0.6, and draws no arc at all. Unpowered, not zero.

**The 8° Floor.** Any nonzero value draws at least 8° on a 240° sweep (12° on the ring). Low is a confident short stroke, never a faint one. A true zero draws nothing and parks the reticle at the start foot.

### The Segmented Bar

**The Seg Idiom.** Every quantity that is not the dial is a segmented LED bar: 10px tall, 2px gaps, one hue per bar, at most 48 cells (inline bars stay ≤120px at 8 cells). The lit run carries the reading; the head cell sits at `--lit-hi`; an optional second run is drawn *inside* the lit run at `--lit-mid` in violet and stops one cell short of the head. Two tones maximum. Band markers are the only place amber and coral may appear on a bar.

Fill is per-cell, not a whole-bar `scaleX`: each cell publishes its index as `--k` and the bar publishes an 18ms per-cell step as `--sd`, capped so the whole bar lands inside 400ms.

**The band-crossing flush.** When the used percentage crosses a band upward since the last visit, the used bar flushes amber once over 1.2s and then stops. Only opacity moves, and the overlay respects each cell's own ramp level, so the flush cannot rewrite the reading.

### The Scope

The free-space trace, in a `--well` bed with a 44px grid and a scanline texture.

- **Columns:** one per snapshot, gap 2px (1px past 60 readings). The column body is a signal gradient 34% → 5% top to bottom — the afterglow under the cap — and the cap is a 3px solid bar at `--lit`, rising to `--lit-hi` on the latest column. The shortest column still draws at 6% height: a reading is never invisible.
- **Now ring:** an 11px ring pinned to the latest column's value on the right edge.
- **Sweep:** one 1px signal line, top to bottom, every 3.4s. Nothing else moves.
- **Scrub:** pointer only (`hover: hover and pointer: fine`). The crosshair and chip fade in, unhovered columns drop to 0.45, and the chip reads the date, value, and signed delta of the nearest column. Coarse pointers get no scrub, and below 480px the scope is replaced by a 30-column strip carrying the same readings.
- **Two-reading minimum:** below two snapshots the scope does not render. One reading has nothing to compare itself to, and the deck says so instead of drawing a line.

## 5. The Six Channels

Six sections, numbered `CH 01`–`CH 06`. Wayfinding lives on the door and flavour lives in the room: the top nav uses literal destinations, and the channel header inside each section carries the instrument name.

| Ch | Anchor | Nav label | Section name | Title |
| -- | ------ | --------- | ------------ | ----- |
| 01 | `#today` | Today | STATUS BOARD | the daily headline |
| 02 | `#storage` | Disk | Disk | The deck plan |
| 03 | `#learn` | Academy | Academy | One useful idea each morning |
| 04 | `#routines` | Routines | Autopilot | What your work keeps asking for |
| 05 | `#timeline` | Timeline | Recorder | A record you can audit |
| 06 | `#trust` | Trust | Scope | What Steward knows — and what it does not |

Each channel header pairs a `CH nn` badge, the section name, the `h2`, and a mono subtitle stating the section's own limit (`TASK SHAPE ONLY · NEVER FILE CONTENTS`, `COVERAGE IS A MEASUREMENT · NEVER CERTAINTY`). The current channel is marked with `aria-current="page"` by an IntersectionObserver keyed on section `id`, never on link text.

## 6. The Character

Steward is a 48px badge docked bottom-right: a `--well` body, a 4×4 grid of phosphor cells on the standard ramp, two eyes deliberately off the cell rhythm so the face reads as a face, and a mouth cut as a `--void` slot that only appears in states that use it.

### Dock Tiers

- **Tier 1 — the badge.** Always present. The cell grid shows the real disk fill while resting or watching; the eyes track the pointer within ±5px, ignoring movement inside a 40px deadzone and giving up after 4s of stillness. It blinks. After 60s with no scroll, pointer, or key it falls asleep and shows a `z`.
- **Tier 2 — a word.** One mono line, ≤230px, sliding in beside the badge for 7s. On narrow screens it is one line with ellipsis, never two — anything longer belongs in the panel.
- **Tier 3 — the shell.** Pressing the badge stands it up (48 → 64) and opens the reclaim bay: the top candidates, each with `hold` and `show me`, plus the trend line and the delta since the last reading. Escape closes it.

### States

Settling states (`resting`, `watching`, `full`, `preview`, `bored`) stand on their own and become the state it returns to. Transient states (`found`, `logged`, `holding`, `refuse-scope`, `refuse-repeat`, `celebrating`) hand control back when the line expires. Each state owns a cell pattern; the rest keep whatever is on the grid.

### The Charge Gesture

`hold` is a press-and-wait: 640ms of stillness fills the key, then it arms and says `ready. let go.`. Release before it arms and nothing is filed — `nothing held. i was not finished.` A review-risk candidate cancels the ceremony at release and plays its refusal instead of the `HELD` stamp. This is the strongest gesture in the product.

### Voice

Lowercase. At most about twelve words. No exclamation marks. Bored-competent, and funnier about its own posture than about your disk. Asking the same question three times inside 10s gets `you asked that. answer has not changed.`

### Named Rules

**The One-Motion Rule.** One `data-state` drives exactly one body animation — bob, jitter, hop, tick, stretch, wobble — so swapping state cancels the previous animation outright. Real activity cancels the idle antic instantly, mid-animation.

**The Scan-Bar Truth Rule.** The scan bar across the character's body runs only while a fetch is actually in flight, and the scope sweep is the only other ambient motion on the deck. Neither may be used to imply work that is not happening.

**The Observe-Only Seal.** Deletion never happens. A scheduled observation cannot delete, move, or upload a file, and the footer says so. Holding something for review is the ceiling.

**Evidence Before Voice.** No line may assert a cause, a folder, or a measurement the collector did not record. Only `safe`, `low`, and `rebuildable` count as reclaimable; medium, high, review, and a risk the collector never wrote are not the character's to call. With one reading it says `one reading. nothing to compare it to.` With none it says nothing at all.

## 7. Motion

```
--ease-entrance: cubic-bezier(0.23, 1, 0.32, 1)
--ease-move:     cubic-bezier(0.77, 0, 0.175, 1)
--d-fast: 120ms   --d-ui: 180ms   --d-enter: 260ms   --d-draw: 640ms
```

Entrance easing is for things arriving — reveals, the dial draw-in, the shell standing up. Move easing is for things responding — hover, colour changes, scrub. The dial draws its arc over 700ms after a 200ms delay and lands its reticle at 900ms, so the needle never appears before the stroke it caps. Keycaps press in 90ms with a 2px translate.

### Reduced Motion

Gentler, not zero. `prefers-reduced-motion: reduce` kills every ambient loop and all travel: the brand LED, status dots, the boot sweep, the scope sweep, the burst stage. What stays is everything that carries meaning. Reveals snap to their final state instead of not existing. Every seg cell arrives lit in one frame, at its correct ramp level. The band alert still says amber, it just does not travel. Scrub keeps working, because it is data inspection — only its transition is dropped. The charge fill appears at the moment it arms, never travelling, and never claiming to be armed before it is.

## 8. Layout

Content is `min(1220px, calc(100vw - 48px))`, tightening to `calc(100vw - 32px)` below 760px. Channels are separated by 56px (44px below 760px).

- **1040px** — bento panels collapse to full width, stat tiles go to two columns, the channel header stacks, and the nav wraps to its own row.
- **760px** — panel padding drops 22px → 16px, table heads and the project rack are dropped in favour of stacked rows.
- **480px** — the dock lifts above the thumb rail and grows to 56px, the character's line is capped and ellipsised, and the scope is replaced by the trend strip.

Panels are flat `--deck` faces with a 1px `--rule` border, a `--panel-sheen` inset highlight, and a 2px lift on hover — pointer-fine only. The notch panel cuts a 14px corner and prints two `--rule-bright` rivets in its lower corners.

## 9. Do's and Don'ts

### Do:

- **Do** lead every return visit with one plain-language change story.
- **Do** use one segmented-bar idiom for every quantity that is not the dial.
- **Do** keep every measured value mono and tabular.
- **Do** show measured, inferred, unavailable, and too-early-to-call states explicitly.
- **Do** let the character be playful about its own posture and literal about the data.
- **Do** keep controls familiar, keyboard-operable, and visibly focused.
- **Do** name the limit of each channel in its own header.

### Don't:

- **Don't** use alarming red system monitors, alarm theater, or manufactured urgency.
- **Don't** ship one-click deletion, hidden risk, or a gesture stronger than hold-for-review.
- **Don't** show opaque health scores or unsupported predictions.
- **Don't** let the character assert a cause, folder, or measurement the collector did not record.
- **Don't** make a mascot that trivializes risk or oversells — Steward has judgment, not enthusiasm.
- **Don't** dim, recolour, or fade an instrument to express a low value.
- **Don't** run the scan bar or the scope sweep when no work is happening.
- **Don't** build generic SaaS admin dashboards from identical metric cards.
