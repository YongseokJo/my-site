# Phase 2: Academic Content - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Build all real content pages for the academic website — research-themed homepage with cosmic hero, publications page with filtering, research projects section, about/CV page, and contact form. This replaces the placeholder pages from Phase 1 with full content.

</domain>

<decisions>
## Implementation Decisions

### Homepage
- **D-01:** Full-width cosmic hero section at the top with a stock deep space image as background (will be replaced with user's simulation image later)
- **D-02:** Hero headline text: "First Star Clusters & Black Holes in the Early Universe" — research-focused, not name-focused
- **D-03:** Below hero: two side-by-side cards for simulation package and ArXiv app — each with icon, title, short description, and CTA button
- **D-04:** Bottom of homepage (before footer): brief 2-3 sentence bio summary with a "Learn more" link to the About page

### Publications Page
- **D-05:** Filter chips at the top — clickable tags for role (First Author / Co-Author), year, etc. Click to toggle filter
- **D-06:** Each publication displayed as a card with title, authors (Jo, Yongseok highlighted/bolded), venue, year, and link buttons (DOI, arXiv, ADS)
- **D-07:** Publications data comes from existing `src/data/publications.yaml` Content Collection (11 papers with role field from Phase 1 migration)

### Research Projects
- **D-08:** 2-3 main research projects showcased (curated, not comprehensive)
- **D-09:** Visual cards on the Research page with thumbnail/icon, project title, and brief description
- **D-10:** Click to expand in place — no separate detail pages. Expanded view shows full description, related publications, and status
- **D-11:** Projects cover both scientific (astrophysics) and machine learning work

### About Page
- **D-12:** Avatar/photo with full bio paragraph
- **D-13:** CV download button (PDF)
- **D-14:** Academic profile links as icons/buttons (Google Scholar, ORCID, GitHub, LinkedIn)
- **D-15:** Education/career timeline or list (positions, education, awards)

### Contact Page
- **D-16:** Simple form: name, email, message — uses Netlify Forms (free, no backend)
- **D-17:** No categories or dropdowns — keep it minimal

### Claude's Discretion
- Specific stock cosmic image selection or CSS gradient fallback for hero
- Publication card layout details (spacing, link button icons)
- Filter chip implementation approach (React island vs Astro + vanilla JS)
- Research project data structure (Markdown files vs hardcoded in component)
- Education/career section layout (timeline vs list)
- Contact form success/error states

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 Design System
- `src/styles/global.css` — Tailwind v4 theme tokens (colors, spacing, typography)
- `src/layouts/BaseLayout.astro` — Base layout with Navigation, Footer, ThemeScript
- `src/components/BaseHead.astro` — Head component with Inter font and meta tags
- `.planning/phases/01-framework-migration-design-system/01-UI-SPEC.md` — UI design contract (spacing, typography, color rules)

### Content Collections
- `src/content.config.ts` — Content Collection schemas (publications via file(), pages via glob())
- `src/data/publications.yaml` — 11 publications with id, title, authors, venue, year, date, role, links
- `src/content/pages/about.md` — Migrated about page content
- `src/content/pages/contact.md` — Migrated contact page content

### Existing Pages (to be replaced)
- `src/pages/index.astro` — Current placeholder homepage
- `src/pages/about.astro` — Current placeholder about page
- `src/pages/research.astro` — Current placeholder research page
- `src/pages/contact.astro` — Current placeholder contact page

### Project Context
- `.planning/PROJECT.md` — Project vision and requirements
- `.planning/REQUIREMENTS.md` — PROF-01 to PROF-05, PUBL-01 to PUBL-04, RSRCH-01 to RSRCH-03

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BaseLayout.astro` — All new pages use this (Navigation + Footer + ThemeScript already wired)
- `src/data/publications.yaml` — Publication data ready for rendering
- `src/content/pages/*.md` — Migrated Markdown content for about and contact pages
- `src/components/ui/button.tsx` — shadcn Button component available
- Tailwind v4 theme tokens — all colors, spacing, typography already defined in `global.css`

### Established Patterns
- Astro pages import BaseLayout and pass title/description props
- Content Collections accessed via `getCollection("publications")` and `getCollection("pages")`
- Dark/light mode uses CSS custom properties — components inherit automatically
- 700px max-width prose container in BaseLayout

### Integration Points
- `src/pages/*.astro` — Replace placeholder pages with real content
- Navigation already links to all routes — pages just need content
- Publications YAML has links.arxiv, links.doi, links.ads, links.pdf fields for external links

</code_context>

<specifics>
## Specific Ideas

- Homepage hero should feel atmospheric and immersive — the research theme is the first impression
- Stock cosmic image is temporary — user will replace with their own simulation renders later
- Research projects should be curated (2-3), not comprehensive — quality over quantity
- Publications filtering via chips should feel lightweight and responsive, not like a complex data table
- About page education/career section adds credibility — important for academic audience
- Contact form must be dead simple — Netlify Forms, no backend complexity

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-academic-content*
*Context gathered: 2026-04-12*
