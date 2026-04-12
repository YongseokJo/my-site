# Architecture

**Analysis Date:** 2026-04-12

## Pattern Overview

**Overall:** Hugo Static Site Generator with Theme-less Template Architecture

**Key Characteristics:**
- Server-side template rendering with Hugo's Go-based templating engine
- Minimal theme approach—no external Hugo theme dependency
- Component-based partial templates for reusable UI elements
- Data-driven content separation (YAML data files + Markdown content)
- Compile-time static HTML generation with CSS asset minification
- Mobile-first responsive design with CSS Grid/Flexbox

## Layers

**Template Layer (Hugo Templating):**
- Purpose: Define page structure, layout inheritance, and component rendering
- Location: `layouts/`
- Contains: Base templates, page-specific layouts, reusable partials, shortcodes
- Depends on: Content files (`content/`), data files (`data/`), site configuration (`config.yaml`)
- Used by: Hugo build system to generate HTML pages

**Content Layer (Markdown + YAML):**
- Purpose: Store page content, metadata, and structured data (publications)
- Location: `content/` (Markdown) and `data/` (YAML)
- Contains: Page frontmatter (title, description), body content, publication records
- Depends on: None (source of truth)
- Used by: Template layer via Hugo's context object

**Asset Layer (CSS):**
- Purpose: Define visual styling and responsive behavior
- Location: `assets/css/`
- Contains: Main stylesheet (`main.css`), custom overrides (`custom.css`)
- Depends on: None
- Used by: Base template via Hugo asset pipeline (minified + fingerprinted)

**Static Asset Layer (Images, Icons, Files):**
- Purpose: Serve static resources not processed by Hugo
- Location: `static/` (images, icons, downloads)
- Contains: Avatar image, social media icons, robots.txt, downloadable files
- Depends on: None
- Used by: Templates via absolute `/` paths

**Build/Configuration Layer:**
- Purpose: Control Hugo build process and site metadata
- Location: `config.yaml`, `netlify.toml`
- Contains: Site URL, title, menu structure, build environment variables
- Depends on: None
- Used by: Hugo CLI and Netlify CI/CD

## Data Flow

**Page Rendering Pipeline:**

1. Hugo reads `config.yaml` for site configuration (title, baseURL, menu structure)
2. Hugo discovers content in `content/` directory (Markdown files with YAML frontmatter)
3. Hugo loads data files from `data/` directory (YAML publication records)
4. Hugo selects appropriate template from `layouts/` based on content type
5. Template engine processes Markdown content and renders HTML
6. Partials are injected (navigation, publications, footer)
7. CSS assets are processed through asset pipeline (minification, fingerprinting)
8. Static assets are copied to `public/` directory (images, icons)
9. Complete HTML pages written to `public/` directory

**Publication Display Flow:**

1. Publication data stored in `data/first_pub.yaml` and `data/co_pub.yaml`
2. Content page (`content/publications/_index.md`) uses shortcode `{{< publications >}}`
3. Shortcode (`layouts/shortcodes/publications.html`) calls partial
4. Partial (`layouts/partials/publications.html`) renders publication list
5. Partial applies author highlighting (bold "Jo, Yongseok")
6. Output styled with CSS classes from `assets/css/main.css`

**State Management:**
- No dynamic state—purely static generation at build time
- Page-level state through frontmatter metadata
- Site-level state through `config.yaml` menu and parameter definitions
- User selections/interactions handled via vanilla JavaScript (`emailcopy-script.html`)

## Key Abstractions

**Base Template (Inheritance):**
- Purpose: Define HTML document structure, load CSS, inject navigation and footer
- Location: `layouts/_default/baseof.html`
- Pattern: Hugo template block system (`{{ block "main" . }}`)
- Used by: All page types extend this structure

**Page Type Templates:**
- Purpose: Define layout for specific content types
- Locations:
  - `layouts/index.html` (homepage hero layout)
  - `layouts/_default/single.html` (article/single page)
  - `layouts/_default/list.html` (section listing pages)
- Pattern: Template blocks override parent `baseof.html` blocks

**Partials (Reusable Components):**
- Purpose: Modular template fragments included across multiple pages
- Locations: `layouts/partials/`
  - `nav.html`: Navigation header with site title and menu items
  - `footer.html`: Page footer
  - `head.html`: Additional head metadata
  - `emailcopy-script.html`: Email copy-to-clipboard JavaScript
  - `publications.html`: Publications list renderer
- Pattern: Included via `{{ partial "name.html" . }}` in parent templates

**Shortcodes:**
- Purpose: Custom template tags for Markdown content
- Location: `layouts/shortcodes/publications.html`
- Pattern: Invoked inline in Markdown as `{{< publications >}}`
- Use case: Embed complex rendering logic within Markdown pages

**CSS Grid/Flexbox Layout System:**
- Purpose: Responsive component positioning
- Locations: `assets/css/main.css` (hero section, cards, chips)
- Pattern: Mobile-first CSS with `@media` breakpoints at 768px
- Components: Hero grid (1 col → 2 col), card layouts, navigation flex wrapping

## Entry Points

**Homepage:**
- Location: `layouts/index.html`
- Triggers: Hugo renders `content/_index.md` using this template
- Responsibilities: Render hero section (avatar, name, title, social buttons) and card grid (about, interests)

**List Pages (Publications, Projects, About):**
- Location: `layouts/_default/list.html`
- Triggers: Hugo renders section `_index.md` files using this template
- Responsibilities: Display section title, content description, list child pages with pagination

**Single Pages:**
- Location: `layouts/_default/single.html`
- Triggers: Hugo renders regular Markdown pages using this template
- Responsibilities: Display article title, metadata (date), and full content in prose format

**Publications Page:**
- Location: `content/publications/_index.md` + `layouts/shortcodes/publications.html`
- Triggers: Shortcode `{{< publications >}}` embedded in Markdown
- Responsibilities: Render publication list from YAML data with sorted results, author highlighting, and external links

## Error Handling

**Strategy:** No explicit error handling—Hugo build will fail if configuration or template syntax is invalid.

**Patterns:**
- Missing data files: Hugo will render empty sections gracefully (no publications list if YAML file missing)
- Broken links in templates: Hugo will not catch—manual testing required
- Invalid frontmatter: Hugo will fail to parse page and skip rendering

## Cross-Cutting Concerns

**Logging:** None—Hugo provides minimal logging during build process.

**Validation:** Frontmatter validation via Hugo schema (title, date fields). YAML syntax validated by Hugo.

**Authentication:** Not applicable—static site has no authentication layer.

**Content Rendering:** Markdown to HTML conversion handled by Hugo's Goldmark renderer. Configured via `config.yaml` parameters.

**External Data Integration:** Publication data hardcoded in YAML files. No API calls or database queries.

---

*Architecture analysis: 2026-04-12*
