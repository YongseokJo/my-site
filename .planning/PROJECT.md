# Yongseok Jo — Professional Academic Website

## What This Is

A professional academic website that serves as Yongseok Jo's central hub — showcasing research (scientific + ML), a simulation package with collaborative project management, and an arXiv reading app (macOS/iOS, in closed beta). The site combines a polished professional presence with functional tools for researchers and developers.

## Core Value

One authoritative place where anyone can find Yongseok Jo's research, software, and professional identity — and where collaborators can actively engage with his projects.

## Requirements

### Validated

- ✓ Publication listing with author highlighting — existing
- ✓ Homepage with hero section (avatar, name, title, social links) — existing
- ✓ About and interests sections — existing
- ✓ Navigation with menu structure — existing
- ✓ Responsive mobile-first layout — existing
- ✓ Netlify deployment with Hugo build pipeline — existing
- ✓ BibTeX-to-YAML bibliography conversion — existing

### Active

- [x] Complete visual redesign (professional, clean, creative, academic aesthetic) — Phase 1
- [x] Modern framework (Astro 5.x replacing Hugo) — Phase 1
- [ ] Research projects section (overview + papers per project)
- [ ] Simulation package showcase page
- [ ] Simulation project management (proposals, issue tracking, developer management)
- [ ] User account management for simulation collaborators
- [ ] ArXiv app landing page (features, screenshots, download links)
- [ ] ArXiv app tutorials and documentation
- [ ] ArXiv app beta signup form
- [ ] ArXiv app error report / feature request submission
- [ ] Contact and professional networking (CV/resume, social links)

### Out of Scope

- Self-hosting everything on Ubuntu server — going hybrid (Netlify + free backend) instead
- Paid hosting or services — all infrastructure must be free tier
- Real-time chat or messaging features — not needed for a professional hub
- Mobile native app development — website only
- Video hosting — out of budget/complexity scope

## Context

- **Current state:** Astro 5.x site on Netlify with Tailwind CSS v4 design system (deep space theme + gold accents), dark mode toggle, responsive layout. Content migrated from Hugo. Phase 1 complete.
- **Brownfield:** Existing codebase mapped in `.planning/codebase/`. Custom Hugo templates (no theme dependency), CSS with variables, BibTeX conversion pipeline.
- **Simulation package:** Developed by Yongseok; other students and researchers use this code. Need project proposal submission, issue reporting, and developer/project management.
- **ArXiv app:** macOS/iOS app currently in closed beta. Site needs landing page, tutorials, beta signup, and feedback collection.
- **Research:** Scientific and machine learning projects need proper showcase with publication links.
- **Design direction:** Professional + clean + creative + academic. Not generic — distinctive and polished.

## Constraints

- **Budget**: Zero cost — free hosting (Netlify), free backend (Supabase/Firebase free tier)
- **Architecture**: Hybrid — static frontend on Netlify, dynamic backend via free BaaS
- **Framework**: Open to switching from Hugo if another framework (Astro, Next.js) better supports the hybrid approach — must deploy free
- **Content**: Existing publication data (YAML) and content (Markdown) should migrate cleanly

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hybrid architecture (Netlify + free BaaS) | Keeps hosting free, leverages CDN for static content, adds dynamic capabilities without self-hosting | — Pending |
| Open to framework switch from Hugo | Dynamic features (accounts, forms, project management) are difficult in pure Hugo; modern frameworks handle hybrid better | — Pending |
| Professional hub as primary goal | Platform features support the hub, not the other way around — design and presence come first | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-12 after initialization*
