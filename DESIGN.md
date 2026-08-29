---
name: Steward
description: A character-forward morning operations brief for a creator's Mac and repeated agent work.
colors:
  honey-signal: "oklch(0.842 0.165 91.3)"
  honey-deep: "oklch(0.52 0.13 78)"
  steward-ink: "oklch(0.20 0.03 277)"
  steward-blue: "oklch(0.32 0.105 277)"
  quiet-surface: "oklch(0.969 0.008 91.3)"
  paper-white: "oklch(1 0 0)"
  secondary-text: "oklch(0.46 0.028 277)"
  measured-green: "oklch(0.43 0.115 151)"
  review-amber: "oklch(0.50 0.125 55)"
typography:
  display:
    fontFamily: "Iowan Old Style, Charter, Bitstream Charter, Georgia, serif"
    fontSize: "5.6rem"
    fontWeight: 500
    lineHeight: 0.96
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Iowan Old Style, Charter, Bitstream Charter, Georgia, serif"
    fontSize: "3.4rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.71rem"
    fontWeight: 730
    lineHeight: 1.3
    letterSpacing: "0.035em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "20px"
  lg: "32px"
  xl: "56px"
components:
  button-secondary:
    backgroundColor: "{colors.quiet-surface}"
    textColor: "{colors.steward-ink}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  button-secondary-hover:
    backgroundColor: "{colors.steward-blue}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  signal-panel:
    backgroundColor: "{colors.honey-signal}"
    textColor: "{colors.steward-ink}"
    rounded: "{rounded.lg}"
    padding: "38px"
  steward-note:
    backgroundColor: "{colors.steward-blue}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.lg}"
    padding: "28px"
---

# Design System: Steward

## 1. Overview

**Creative North Star: "The Morning Steward"**

Steward should feel like opening a beautifully edited private briefing at the start of the day. The composition is spacious and literary where judgment matters, then compact and familiar where the user must inspect evidence. Character lives in the writing, the editorial scale shift, honey signal surfaces, and the deep blue-violet voice of Steward itself. Automation stays quiet, legible, and subordinate.

The interface is product software, not a magazine imitation. Standard navigation, details disclosure, progress semantics, focus states, tables, and buttons remain familiar. It explicitly rejects generic SaaS admin dashboards, hacker terminals, sterile macOS utility clones, cute mascots, alarming cleaner apps, and opaque health scores.

**Key Characteristics:**

- One-minute narrative before deep inspection
- True-white daylight surface with a rare honey signal
- Serif only for authored judgment and high-level numbers
- Dense evidence without identical cards
- Visible uncertainty, reversibility, and scope
- One short visual lesson that turns a familiar analogy into precise technical language

## 2. Colors

The palette pairs literal daylight white with a memorable honey signal and a grounded blue-violet voice. Honey is warm; the background is not.

### Primary

- **Honey Signal**: The one memorable brand surface. Use for available-space status, current navigation, time cues, and rare moments that deserve the user's eye.
- **Deep Honey**: Use for text accents and focus-adjacent emphasis where Honey Signal is too light.

### Secondary

- **Steward Blue**: The voice of analysis and judgment. Use for Steward's note and the active automation summary, never as decorative chrome.

### Neutral

- **Paper White**: The body background and default content canvas.
- **Quiet Surface**: Low-contrast containers, skeletons, and supporting data regions.
- **Steward Ink**: Primary text and high-contrast structure.
- **Secondary Text**: Supporting prose and metadata; it must remain readable at body sizes.

### Named Rules

**The Honey Rarity Rule.** Honey may carry one dominant surface and a small set of active signals per viewport. Its scarcity creates character.

**The White Is Daylight Rule.** The canvas is literal white. Never tint the entire interface beige to manufacture warmth.

**The Calm Status Rule.** Red is reserved for evidence-backed danger. Ordinary growth, review, and uncertainty use ink, amber, or descriptive text.

## 3. Typography

**Display Font:** Iowan Old Style, with Charter and Georgia fallbacks
**Body Font:** Inter/system UI sans
**Label/Mono Font:** SF Mono/Consolas only for exact paths and machine-readable scope

**Character:** The serif is Steward speaking; the sans is Steward working. The contrast makes authored judgment feel human without making controls unfamiliar.

### Hierarchy

- **Display** (500, up to 5.6rem, 0.96): The single daily headline and the available-space number.
- **Headline** (500, up to 3.4rem, 1): Major section questions only.
- **Title** (700, 1.06rem, 1.3): Data groups, recommendations, and workflow opportunities.
- **Body** (400, 1rem, 1.55): Explanations capped near 65–70 characters where possible.
- **Label** (730, 0.71rem, 0.035em): Sparse datelines, status labels, and section names. Sentence case wins over all-caps.

### Named Rules

**The Two Voices Rule.** Serif expresses synthesis and judgment. Sans expresses evidence, controls, status, and navigation. Never use serif in a button, input, table label, or risk badge.

## 4. Elevation

Steward is flat by default. Depth comes from tonal adjacency, scale, and spacing—not floating cards. There are no ambient drop shadows on content containers. Focus uses a solid high-contrast outline; timeline markers may use inset rings because they encode event state rather than elevation.

### Named Rules

**The Flat-By-Default Rule.** If a container needs a wide soft shadow to feel separate, its spacing or tonal role is wrong.

**The State Earns Lift Rule.** Motion and visual emphasis appear only in direct response to loading, selection, expansion, or current status.

## 5. Components

### Buttons

- **Shape:** Compact and gently squared (6px radius).
- **Primary:** Steward currently has no destructive or commit-style primary button; observation is the default.
- **Hover / Focus:** Secondary controls invert to Steward Blue with white text; focus always receives a 3px Deep Honey outline.
- **Secondary:** Quiet Surface at rest with 8px × 12px padding.

### Chips

- **Style:** Full pills are reserved for risk, confidence, and lifecycle state.
- **State:** Color always accompanies explicit text such as “Needs review” or “Candidate.”

### Cards / Containers

- **Corner Style:** 10px for supporting containers, 14px for the two signature voice surfaces.
- **Background:** Quiet Surface for evidence; Honey Signal for the space pulse; Steward Blue for authored judgment.
- **Shadow Strategy:** None at rest.
- **Border:** Use dividers for tables and repeated rows; never combine a decorative border with a wide shadow.
- **Internal Padding:** 22–38px depending on hierarchy.

### Inputs / Fields

- **Style:** Draft 1 has no text-entry fields. Future inputs must use native affordances, a 6px radius, and Steward Ink text on white.
- **Focus:** A 3px Deep Honey outline outside the control.
- **Error / Disabled:** State must be named in text and never communicated by color alone.

### Navigation

The sticky top navigation uses compact sans labels and a 2px Deep Honey underline for the current section. On narrow screens it scrolls horizontally instead of collapsing into a custom menu.

### Daily Brief

The signature composition places the authored summary beside one Honey Signal panel, followed by a four-column factual ledger. On mobile the narrative leads, the signal panel follows, and facts become two or one columns.

### Evidence Disclosure

Cleanup recommendations use native `details` and `summary`. Every disclosure exposes Evidence → Expected effect → Risk → Reversibility → Exact scope before presenting the non-destructive “Add to review” action.

### Steward’s Field Guide

The daily lesson is an editorial split: the left side explains, while the right side lets the learner change one causal model. The lesson begins in plain language, introduces three exact terms, corrects one common mix-up, and ends with one sentence worth remembering. Simulations use Steward Blue as the working surface and Honey only for active signals. Every model is explicitly labeled as an example, never a live machine reading.

## 6. Do's and Don'ts

### Do:

- **Do** lead every return visit with one plain-language change story.
- **Do** reserve Honey Signal for the most important status or time cue.
- **Do** show measured, inferred, unavailable, and too-early-to-call states explicitly.
- **Do** keep controls familiar, keyboard-operable, and visibly focused.
- **Do** use Quiet Surface, 1px dividers, and spacing to organize dense information.
- **Do** preserve the distinction between observation, recommendation, review, and action.

### Don't:

- **Don't** build generic SaaS admin dashboards from identical metric cards.
- **Don't** use hacker terminals, cyber-security theatrics, or alarming red system monitors.
- **Don't** imitate sterile macOS utility clones.
- **Don't** add cute mascots or game-like streaks that trivialize personal data and system health.
- **Don't** reproduce cleaner-app urgency, hidden risk, or one-click deletion.
- **Don't** show opaque health scores or unsupported predictions.
- **Don't** use gradient text, glassmorphism, colored side-stripe borders, or decorative page-load choreography.
- **Don't** use card radii above 14px, except full pills for compact status labels.
