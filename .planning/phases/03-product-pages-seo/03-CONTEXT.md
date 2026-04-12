# Phase 3: Product Pages & SEO - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Build complete public-facing pages for Enzo-Abyss (simulation package) and Readea (arXiv app), add site-wide SEO (meta tags, OpenGraph, schema.org for publications), and integrate Pagefind for on-site search. No dynamic/backend features — those come in Phases 4-5.

</domain>

<decisions>
## Implementation Decisions

### Enzo-Abyss (Simulation Package) Page
- **D-01:** Product landing style — not docs-style with sidebar
- **D-02:** Simple header at top (name + tagline), no large hero visual
- **D-03:** Tagline: "Cosmological simulation framework for studying first star clusters and black holes"
- **D-04:** Feature highlights section showing key capabilities
- **D-05:** Quick-start guide with code snippets / getting-started steps
- **D-06:** Sub-pages for documentation (e.g., /software/install, /software/usage) — not all on one page
- **D-07:** No contributor list or GitHub link in Phase 3 scope (user didn't select these)

### Readea (ArXiv App) Page
- **D-08:** Classic app landing page style — device mockup area, feature highlights, download CTA
- **D-09:** Placeholder images for device mockups — user will provide real screenshots later
- **D-10:** Tagline: "A modern reading experience for arXiv papers on macOS and iOS"
- **D-11:** Key feature to highlight: AI recommendation for arXiv feed
- **D-12:** CTA directs users to contact for beta access (no direct TestFlight/App Store link — user manually distributes access)
- **D-13:** Beta signup and feedback forms — research best free approach (NOT Netlify Forms — user wants something different)
- **D-14:** Step-by-step tutorial pages (separate pages per tutorial with numbered steps and screenshots)

### SEO & Search
- **D-15:** Standard SEO — meta tags, OpenGraph on all pages, schema.org structured data for publications
- **D-16:** Pagefind for on-site search — Claude decides placement (nav bar or dedicated page)
- **D-17:** No special Google Scholar optimization beyond standard meta tags

### Claude's Discretion
- Pagefind search placement (nav icon vs dedicated page)
- Enzo-Abyss documentation sub-page structure and routing
- Best free form service for Readea beta signup and feedback (research alternatives to Netlify Forms)
- Device mockup placeholder design
- Specific schema.org types for publications
- Tutorial page template design

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1-2 Design System
- `src/styles/global.css` — Tailwind v4 theme tokens
- `src/layouts/BaseLayout.astro` — Standard page layout
- `src/layouts/HomeLayout.astro` — Full-width hero layout (reference for Readea landing)
- `.planning/phases/01-framework-migration-design-system/01-UI-SPEC.md` — Base design tokens
- `.planning/phases/02-academic-content/02-UI-SPEC.md` — Phase 2 UI patterns

### Existing Pages to Replace
- `src/pages/software.astro` — Current "Site Under Construction" placeholder
- `src/pages/arxiv-app.astro` — Current "Site Under Construction" placeholder

### Components Available
- `src/components/ui/card.tsx` — shadcn Card (for feature highlights)
- `src/components/ui/badge.tsx` — shadcn Badge
- `src/components/ui/button.tsx` — shadcn Button
- `src/components/ui/input.tsx` — shadcn Input (for forms)
- `src/components/ui/textarea.tsx` — shadcn Textarea
- `src/components/ui/label.tsx` — shadcn Label
- `src/components/BaseHead.astro` — Head component (add meta/OG tags here)

### Content Collections
- `src/content.config.ts` — Existing schemas (may need tutorials collection)
- `src/data/publications.yaml` — For schema.org structured data generation

### Prior Patterns
- `src/islands/ContactForm.tsx` — Netlify Forms pattern (reference, but Readea forms use different service)
- `src/components/CosmicHero.astro` — Hero pattern (reference for Readea landing)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- BaseLayout + BaseHead — all new pages use these
- shadcn Card/Badge/Button/Input/Textarea/Label — all installed
- CosmicHero pattern — can adapt for Readea landing hero
- ContactForm island — pattern reference for form React islands

### Established Patterns
- Astro pages with BaseLayout wrapper
- React islands with `client:load` for interactive components
- Content Collections for structured data
- Netlify Forms with hidden HTML form (contact page)

### Integration Points
- `src/pages/software.astro` — replace placeholder with Enzo-Abyss landing
- `src/pages/arxiv-app.astro` — replace placeholder with Readea landing
- `src/components/BaseHead.astro` — add meta/OpenGraph tags
- Navigation already has "Enzo-Abyss" and "Readea" links pointing to correct routes

</code_context>

<specifics>
## Specific Ideas

- Enzo-Abyss is a cosmological simulation framework — content should feel technical but accessible
- Readea features AI recommendation for arXiv feeds — this is the key differentiator to highlight
- Beta access is manually distributed — CTA is "Contact me for access", not a direct download link
- User will provide real device mockups and tutorial screenshots later — use placeholders now
- Forms for Readea should use a different service than Netlify Forms — researcher should investigate free alternatives (Formspree, Formspark, Google Forms embed, etc.)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-product-pages-seo*
*Context gathered: 2026-04-12*
