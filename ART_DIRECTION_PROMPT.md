# Steward art-direction exploration prompt

You are a senior product art director and interaction designer. Explore four genuinely different art directions for **Steward**, a private, local-first morning briefing for a creator's Mac.

Before designing, read:

- `PRODUCT.md`
- `DESIGN.md`
- `index.html`
- `src/styles.css`
- `public/data/lessons.json`

Do not change the production interface. Produce an isolated design study so the directions can be compared before one is selected.

## Product intent

Steward turns storage changes and repeated work into a concise daily story. It should feel observant, composed, and characterful. Character means an authored point of view, recognizable language, visual judgment, and a memorable way of explaining things—not a mascot or chat assistant. Keep character visibly in the foreground and automation quiet underneath.

Its **Learn** area is a short daily visual lesson about how computers work. It should feel like an excellent small blog or field guide: approachable to anyone, technically correct, visually rich, and worth returning to without streaks or gamification.

Each lesson should take roughly 2–5 minutes and include:

- A plain-language opening connected to ordinary life
- One clear mental model or analogy
- One interactive visual that reveals cause and effect
- Correct technical terms introduced after the idea is understood
- A relatable example
- One common misconception
- A concise takeaway
- A visible distinction between simulated examples and data measured on this Mac
- Access to earlier lessons without becoming a feed of identical cards

Use this first lesson so all directions can be compared fairly:

**Title:** RAM is your desk. Storage is your cabinet.

**Core idea:** A file rests on SSD storage. Opening it loads the working parts into RAM. When RAM becomes crowded, macOS may compress memory or use swap space on the SSD. Closing an app can free RAM, but it does not delete the stored file. Deleting a file can free storage, but it does not add RAM.

**Required vocabulary:** RAM, volatile memory, storage, SSD, working set, memory pressure, compression, and swap.

**Relatable scenario:** Move from a browser workload to design work and then a large video workload. Let the learner see RAM fill and swap appear.

The interactive example must never masquerade as live device data.

## Explore four structural directions

Use these seeds, but reinterpret them with conviction:

1. **The Illustrated Field Guide** — precise editorial plates and annotated visual essays.
2. **The House With Two Rooms** — RAM and storage explained through a navigable spatial metaphor.
3. **The Daily Instrument** — a causal simulator where users change inputs and watch the computer respond.
4. **The Museum of Ordinary Computing** — one familiar object becomes the exhibit that explains one technical idea.

The four concepts must differ in composition, navigation, material language, typography, visualization, interaction, motion, density, and voice cadence. Do not produce four white dashboards with different palettes.

For each direction, deliver:

1. Name and one-sentence thesis
2. A physical scene: who uses it, where, in what light, and in what mood
3. Signature composition and navigation model
4. Material, typography, palette, iconography, diagram style, and image treatment
5. How Steward's character appears without becoming a mascot
6. How automation stays present but subordinate
7. How Today leads naturally into Learn
8. A 1440 × 1000 dashboard frame
9. A 1440 × 1000 lesson frame with the RAM/storage interaction
10. A 390 × 844 mobile lesson frame
11. One expanded technical-term state and one completed interaction state
12. Three purposeful motion notes with duration and easing
13. A reduced-motion equivalent
14. Keyboard, screen-reader, zoom, and touch behavior
15. Risks, implementation complexity, and possible gimmicks
16. A small token sample for color, typography, spacing, radius, and motion

## Trust and accessibility constraints

- Meet WCAG 2.2 AA.
- Use visible focus, semantic structure, keyboard-operable interactions, screen-reader labels, and approximately 44 px touch targets.
- Never communicate important state through color or motion alone.
- Keep reading text around 65–75 characters per line.
- Preserve meaning with reduced motion.
- Keep personal data local and never imply that Steward reads file contents.
- Never delete, move, install, or clean anything without explicit approval.
- Distinguish measured, inferred, unavailable, too-early-to-call, and simulated data.
- Avoid opaque health scores, unsupported predictions, fear-based warnings, and gamification.
- Preserve the distinction between memory and storage throughout.

Avoid generic SaaS card grids, cute mascots, fake terminals, sterile macOS imitation, cream-as-editorial shorthand, glassmorphism, gradient text, decorative side stripes, wide ambient shadows, excessive rounding, decorative page-load choreography, and diagrams that impress without teaching.

## Comparison

End with a decision matrix scoring each direction from 1–5, with a short justification for:

- Steward character and recognizability
- Learning clarity and technical credibility
- Relatability
- Trust and privacy communication
- Integration with live storage data
- Desktop scanability and mobile reading quality
- Accessibility and interaction value
- Content scalability
- Implementation effort and performance
- Long-term visual distinctiveness

Recommend one direction. Name the strongest element worth borrowing from every rejected direction, and identify combinations that would create an incoherent hybrid. Do not converge the concepts prematurely.
