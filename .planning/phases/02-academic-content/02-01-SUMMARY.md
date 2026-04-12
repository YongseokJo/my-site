---
phase: 02-academic-content
plan: 01
subsystem: homepage
tags: [homepage, hero, shadcn, layout, cta]
dependency_graph:
  requires: []
  provides: [HomeLayout, CosmicHero, CTACardPair, BioSummary, shadcn-card, shadcn-badge, shadcn-input, shadcn-textarea, shadcn-label, shadcn-separator]
  affects: [index.astro]
tech_stack:
  added: [shadcn/card, shadcn/badge, shadcn/input, shadcn/textarea, shadcn/label, shadcn/separator]
  patterns: [full-width-hero-slot, HomeLayout-extending-BaseLayout, inline-svg-icons]
key_files:
  created:
    - src/components/ui/card.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/input.tsx
    - src/components/ui/textarea.tsx
    - src/components/ui/label.tsx
    - src/components/ui/separator.tsx
    - src/layouts/HomeLayout.astro
    - src/components/CosmicHero.astro
    - src/components/CTACardPair.astro
    - src/components/BioSummary.astro
  modified:
    - src/pages/index.astro
decisions:
  - HomeLayout uses named slot "hero" for full-width content outside 700px container
  - Lucide icons rendered as inline SVGs to avoid React client directives in Astro components
  - Hero overlay uses hardcoded light colors (not theme tokens) to ensure always-dark appearance
metrics:
  duration: 3m
  completed: "2026-04-12"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 02 Plan 01: Homepage & Shadcn Components Summary

Homepage rebuilt with full-width cosmic hero (bg.jpg + dark gradient overlay), two CTA cards (Simulation Package linking to /software, ArXiv App linking to /arxiv-app), and bio summary with Learn more link to /about. Six shadcn UI components installed for Phase 2 use.

## Task Results

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Install shadcn components and create HomeLayout with CosmicHero | 58f0fa7 | card.tsx, badge.tsx, input.tsx, textarea.tsx, label.tsx, separator.tsx, HomeLayout.astro, CosmicHero.astro |
| 2 | Build CTACardPair, BioSummary, and wire homepage | 114e23d | CTACardPair.astro, BioSummary.astro, index.astro |

## Decisions Made

1. **HomeLayout with named hero slot**: Created a new layout variant that accepts a `slot="hero"` for full-viewport-width content while keeping default slot content within the 700px container. This avoids modifying BaseLayout which other pages depend on.

2. **Inline SVG icons instead of React Lucide imports**: Used inline SVGs for Telescope and Newspaper icons in CTACardPair.astro to avoid needing `client:load` directives. The CTA cards are entirely static.

3. **Hardcoded hero text colors**: CosmicHero uses inline `style` with `color: #e2e8f0` and `color: #94a3b8` instead of Tailwind theme tokens, ensuring the hero text is always light-on-dark regardless of site theme mode (per UI-SPEC).

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- `npm run build` completes without errors
- Built `dist/index.html` contains "First Star Clusters" headline
- Built HTML contains "Simulation Package" and "ArXiv App" CTA cards
- Built HTML contains "Learn more" bio link
- Hero section is full-viewport-width (no max-w constraint on hero)
- CTA cards and bio are within 700px container via HomeLayout default slot
