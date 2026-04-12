# Phase 1: Framework Migration & Design System - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Rebuild the site on Astro 5.x with Tailwind CSS v4, migrate all existing Hugo content (Markdown pages, YAML publications) into Astro Content Collections, establish the visual design system (colors, typography, spacing, dark mode), and deploy on Netlify. This phase produces a working Astro site with the design system applied to base layout pages — no content pages beyond what's needed to verify the migration works.

</domain>

<decisions>
## Implementation Decisions

### Visual Identity
- **D-01:** Deep space color base — dark navy/black background with cosmic feel
- **D-02:** Gold/amber accent colors against the dark base
- **D-03:** Modern sans-serif typography (e.g., Inter, Satoshi, or similar clean font)
- **D-04:** Spacious content density — generous whitespace, breathing room between sections
- **D-05:** Subtle abstract cosmic motifs or minimal imagery — not complex, not literal. User will add their own simulation images in later phases
- **D-06:** Overall aesthetic: professional + clean + creative + academic

### Layout Structure
- **D-07:** Top bar horizontal navigation
- **D-08:** Narrow prose-width content area (~700px max) for optimal readability
- **D-09:** Minimal footer — copyright + social links only
- **D-10:** Navigation items: Home, Research, Software, ArXiv App, About, Contact (from research)

### Dark Mode
- **D-11:** Default to system preference on first visit (prefers-color-scheme)
- **D-12:** Dark mode = the deep space cosmic theme (primary creative expression)
- **D-13:** Light mode = clean academic look (white/light gray, traditional, readable)
- **D-14:** User toggle persists preference across sessions (localStorage)

### Content Migration
- **D-15:** Merge `data/first_pub.yaml` and `data/co_pub.yaml` into a single Astro Content Collection with a "role" field (first-author vs co-author)
- **D-16:** Rewrite BibTeX-to-YAML Python pipeline to Node.js for unified toolchain
- **D-17:** Keep old Hugo files temporarily for reference (don't delete layouts/, config.yaml, etc. yet)
- **D-18:** Markdown content migrates directly from `content/` to Astro `src/content/`

### Claude's Discretion
- Specific font choice (within modern sans-serif family)
- Exact CSS color values for the deep space + gold palette
- Tailwind v4 configuration approach
- shadcn/ui component selection for base UI elements
- Astro project structure and Content Collection schema design
- Netlify adapter configuration

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Codebase
- `.planning/codebase/STACK.md` — Current Hugo stack and dependencies
- `.planning/codebase/ARCHITECTURE.md` — Current template structure and data flow
- `.planning/codebase/STRUCTURE.md` — Directory layout and file locations
- `.planning/codebase/CONVENTIONS.md` — Naming patterns and code style

### Research
- `.planning/research/STACK.md` — Astro 5.x + Tailwind v4 + Supabase recommendation with versions
- `.planning/research/ARCHITECTURE.md` — Islands architecture and hybrid output mode
- `.planning/research/PITFALLS.md` — Hugo migration pitfalls and prevention strategies

### Content to Migrate
- `data/first_pub.yaml` — First-author publication data
- `data/co_pub.yaml` — Co-author publication data
- `content/` — All Markdown page content
- `assets/css/main.css` — Current CSS (reference for design tokens, NOT to port)
- `config.yaml` — Hugo site config (menu structure, params to migrate)
- `scripts/` — Python BibTeX pipeline (to rewrite in Node.js)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `content/` Markdown files: migrate directly to Astro `src/content/` with minimal frontmatter changes
- `data/first_pub.yaml` and `data/co_pub.yaml`: merge into single collection
- `static/icons/`: SVG social icons can be reused as-is
- `static/images/`: avatar and background images carry over

### Established Patterns
- CSS custom properties (`:root` variables) for theming — Tailwind v4 replaces this but the concept carries over
- Component-scoped styles grouped by visual element — maps to Astro component scoping
- Mobile-first responsive design at 768px breakpoint — maintain this approach

### Integration Points
- `netlify.toml`: needs update for `@astrojs/netlify` adapter (replaces Hugo build command)
- `config.yaml` menu structure: migrate to Astro nav component props or config
- Publication shortcode: replace with Astro component
- `before_publish.sh`: may be unnecessary with Astro's build pipeline

</code_context>

<specifics>
## Specific Ideas

- Homepage should be research-theme-focused (first star clusters and black holes in the early universe) — NOT a generic hero section. Atmospheric visual design with prominent buttons for simulation package and ArXiv app. Bio at bottom or linked to About page.
- The user prefers simplicity — cosmic motifs should be subtle, not overwhelming
- User will add their own simulation render images in future phases
- The ArXiv app code is at `/Users/yongseokjo/projects/pdf_reader_for_arxiv` (separate repo, for reference when building app pages later)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-framework-migration-design-system*
*Context gathered: 2026-04-12*
