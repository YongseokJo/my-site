<!-- GSD:project-start source:PROJECT.md -->
## Project

**Yongseok Jo — Professional Academic Website**

A professional academic website that serves as Yongseok Jo's central hub — showcasing research (scientific + ML), a simulation package with collaborative project management, and an arXiv reading app (macOS/iOS, in closed beta). The site combines a polished professional presence with functional tools for researchers and developers.

**Core Value:** One authoritative place where anyone can find Yongseok Jo's research, software, and professional identity — and where collaborators can actively engage with his projects.

### Constraints

- **Budget**: Zero cost — free hosting (Netlify), free backend (Supabase/Firebase free tier)
- **Architecture**: Hybrid — static frontend on Netlify, dynamic backend via free BaaS
- **Framework**: Open to switching from Hugo if another framework (Astro, Next.js) better supports the hybrid approach — must deploy free
- **Content**: Existing publication data (YAML) and content (Markdown) should migrate cleanly
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- HTML5 - Template markup in Hugo layouts
- CSS3 - Styling with CSS variables and responsive design
- JavaScript - Client-side interactivity for email copying and dynamic elements
- Python 3 - Build-time bibliography conversion utilities
- YAML - Configuration and data file formats
- Markdown - Content authoring for site pages
- TOML - Netlify deployment configuration
- Shell (Bash) - Build and deployment scripts
## Runtime
- Hugo (Static Site Generator) - Core runtime for site generation
- Netlify - Hosting and deployment platform
- Python pip (implicit) - Required for Python dependencies
- Hugo Modules - Dependency management for Hugo (referenced in `before_publish.sh`)
## Frameworks
- Hugo (Extended) 0.152.2 - Static site generator for content rendering and templating
- None explicitly configured - builds use native Hugo with minification
## Key Dependencies
- bibtexparser (Python) - Parses BibTeX bibliography files into structured data
- PyYAML (Python) - Converts parsed bibliography data to YAML format for Hugo
- unicodedata (Python) - Handles LaTeX accent normalization in bibliography entries
- None detected - purely static site generation, no server-side runtime dependencies
## Configuration
- Netlify environment variables: `HUGO_VERSION` (set to 0.152.2), `HUGO_ENV` (production)
- Site config: `config.yaml` - Contains site title, language, menu structure, author links
- Hugo modules configured (implied by `hugo mod clean` and `hugo mod tidy` in build script)
- `netlify.toml` - Netlify deployment configuration specifying Hugo as build command
- `config.yaml` - Hugo configuration for site structure and metadata
- `before_publish.sh` - Manual pre-publication build script for cleaning and minifying
## Platform Requirements
- Hugo Extended (any recent version, minimum 0.152.2 based on Netlify config)
- Python 3.x (for bibliography conversion scripts)
- Git (for version control)
- Bash shell (for build scripts)
- Netlify hosting with automatic Hugo build pipeline
- Deployment triggers on Git push to repository
- Static site delivery through Netlify CDN
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- HTML templates: lowercase with hyphens (e.g., `baseof.html`, `emailcopy-script.html`)
- CSS files: lowercase (e.g., `main.css`, `custom.css`)
- Data files: lowercase with underscores (e.g., `first_pub.yaml`, `co_pub.yaml`)
- YAML configuration: lowercase (e.g., `config.yaml`)
- Multi-word classes: lowercase with hyphens (e.g., `hero-inner`, `social-circle`, `card-header`, `chip-row`)
- Utility classes: descriptive single or hyphenated words (e.g., `container`, `prose`, `list`, `pubs`)
- Component classes: semantic structure with nested naming (e.g., `.card`, `.card-header`, `.card-body`, `.card-title`)
- Two-dash prefix: `--fg`, `--bg`, `--muted`, `--link`, `--accent`, `--max`
- Color variants: `--bg-dark`, `--card-bg`, `--card-border`, `--chip-bg`, `--chip-border`
- Functional naming focused on purpose over color values
- Partial filenames: descriptive, lowercase with hyphens (`nav.html`, `footer.html`, `head.html`, `publications.html`)
- Variables: PascalCase for Hugo context (`.Site`, `.Pages`, `.Title`, `.Content`)
- Range variables: lowercase (`.pubs`, `.authors`, `$first`, `$co`)
- YAML keys: lowercase with underscores where needed (`first_pub`, `co_pub`, `pub-title`, `pub-authors`)
- Hugo Params: lowercase with dots for nested access (`.Site.Params.email`, `.Site.Params.links.github`)
## Code Style
- HTML: 2-space indentation observed in templates
- CSS: Minified for production (single line declarations)
- YAML: 2-space indentation in data files
- JavaScript: Inline in HTML templates with 2-space indentation
- No linter config detected (`.eslintrc`, `.prettierrc` absent)
- No formatting tool enforced
- Root CSS variables defined at `:root` level for theme configuration
- Utility classes follow Tailwind-like naming (container, prose, etc.)
- Responsive breakpoints: `@media (min-width: 768px)` for two-column layout switch
- Component-scoped styles grouped by visual element
## Import Organization
- Included via `{{ partial "filename.html" . }}` syntax
- Context passed explicitly: `{{ partial "publications.html" (dict "pubs" $first "page" .) }}`
- No import order convention (minimal partials)
- Single import at end of file: `@import "custom.css"`
- Located in `assets/css/` directory
- Processed by Hugo resources pipeline with minification and fingerprinting
- CSS: `resources.Get "css/main.css" | resources.Minify | resources.Fingerprint`
- Images: `/images/`, `/icons/` directories via static folder
- Scripts: Inline in `emailcopy-script.html` partial
## Code Patterns
- Event delegation: `document.querySelectorAll("[data-copy-email]")` with attribute selectors
- DOM manipulation: inline styles set via `element.style.*` property assignments
- Async operations: `navigator.clipboard.writeText()` with `.then()` promise handling
- Cleanup: `setTimeout(() => node.remove(), 1500)` for temporary DOM elements
- Conditional blocks: `{{ if condition }}...{{ end }}`
- Range iteration: `{{ range .Items }}{{ end }}` for list rendering
- Hugo data access: `site.Data.first_pub` for YAML-driven content
- String replacement: `replace $string . "<replacement>"` for author highlighting
- Safe HTML: `{{ . | safeHTML }}` for pre-formatted content
- Mobile-first: single column by default (`grid-template-columns: 1fr`)
- Responsive upgrade at 768px breakpoint
- Gap-based spacing: `gap: 2rem`, `gap: 1rem`, `gap: 0.75rem`
- Flexbox for alignment: `align-items: center`, `justify-content: center`
- Theme colors centralized in `:root` block
- Reused across components: `background: var(--card-bg)`, `border: 1px solid var(--card-border)`
- Permits easy theme switching via CSS variable override
## Comments
- Inline Hugo comments explain data source: `{{/* this is the Markdown from _index.md */}}`
- CSS comments describe layout intent: `/* 👈 one column by default (mobile) */`
- Minimal comment usage; code structure is self-documenting
- HTML/Hugo: `{{/* comment text */}}`
- CSS: `/* comment text */`
- JavaScript: `// single line` (minimal usage)
## Error Handling
- No error handling detected; Hugo build will fail on template errors
- No try-catch blocks in JavaScript
- Graceful degradation via attribute checking: `{{ with .links }}...{{ end }}`
- Silent fallback: `{{ if $first }}..{{ else }}<p>No publications found.</p>{{ end }}`
## Hugo-Specific Conventions
- Single dot (`.`) refers to current context
- Nested context: `{{ .Site.Title }}`, `{{ .Page.Title }}`
- Functions accept context explicitly in partials
- Markdown files: `content/*/\_index.md` for section pages
- Frontmatter minimal; most config in `config.yaml`
- URL structure: `/projects/`, `/publications/`, `/about/`
- Publications rendered from YAML in `data/first_pub.yaml` and `data/co_pub.yaml`
- Sorting in template: `{{ range sort $pubs "date" "desc" }}`
- Conditional rendering of optional fields: `{{ with .pdf }}...{{ end }}`
## Layout Structure
- `baseof.html`: Base layout wrapping all pages
- `_default/list.html`: Section listing template
- `_default/single.html`: Article/page template
- `index.html`: Custom homepage
- `publications/list.html`: Custom publications section
- `partials/`: Reusable component templates (nav, footer, head, publications)
- `shortcodes/`: Hugo shortcodes (minimal usage)
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Server-side template rendering with Hugo's Go-based templating engine
- Minimal theme approach—no external Hugo theme dependency
- Component-based partial templates for reusable UI elements
- Data-driven content separation (YAML data files + Markdown content)
- Compile-time static HTML generation with CSS asset minification
- Mobile-first responsive design with CSS Grid/Flexbox
## Layers
- Purpose: Define page structure, layout inheritance, and component rendering
- Location: `layouts/`
- Contains: Base templates, page-specific layouts, reusable partials, shortcodes
- Depends on: Content files (`content/`), data files (`data/`), site configuration (`config.yaml`)
- Used by: Hugo build system to generate HTML pages
- Purpose: Store page content, metadata, and structured data (publications)
- Location: `content/` (Markdown) and `data/` (YAML)
- Contains: Page frontmatter (title, description), body content, publication records
- Depends on: None (source of truth)
- Used by: Template layer via Hugo's context object
- Purpose: Define visual styling and responsive behavior
- Location: `assets/css/`
- Contains: Main stylesheet (`main.css`), custom overrides (`custom.css`)
- Depends on: None
- Used by: Base template via Hugo asset pipeline (minified + fingerprinted)
- Purpose: Serve static resources not processed by Hugo
- Location: `static/` (images, icons, downloads)
- Contains: Avatar image, social media icons, robots.txt, downloadable files
- Depends on: None
- Used by: Templates via absolute `/` paths
- Purpose: Control Hugo build process and site metadata
- Location: `config.yaml`, `netlify.toml`
- Contains: Site URL, title, menu structure, build environment variables
- Depends on: None
- Used by: Hugo CLI and Netlify CI/CD
## Data Flow
- No dynamic state—purely static generation at build time
- Page-level state through frontmatter metadata
- Site-level state through `config.yaml` menu and parameter definitions
- User selections/interactions handled via vanilla JavaScript (`emailcopy-script.html`)
## Key Abstractions
- Purpose: Define HTML document structure, load CSS, inject navigation and footer
- Location: `layouts/_default/baseof.html`
- Pattern: Hugo template block system (`{{ block "main" . }}`)
- Used by: All page types extend this structure
- Purpose: Define layout for specific content types
- Locations:
- Pattern: Template blocks override parent `baseof.html` blocks
- Purpose: Modular template fragments included across multiple pages
- Locations: `layouts/partials/`
- Pattern: Included via `{{ partial "name.html" . }}` in parent templates
- Purpose: Custom template tags for Markdown content
- Location: `layouts/shortcodes/publications.html`
- Pattern: Invoked inline in Markdown as `{{< publications >}}`
- Use case: Embed complex rendering logic within Markdown pages
- Purpose: Responsive component positioning
- Locations: `assets/css/main.css` (hero section, cards, chips)
- Pattern: Mobile-first CSS with `@media` breakpoints at 768px
- Components: Hero grid (1 col → 2 col), card layouts, navigation flex wrapping
## Entry Points
- Location: `layouts/index.html`
- Triggers: Hugo renders `content/_index.md` using this template
- Responsibilities: Render hero section (avatar, name, title, social buttons) and card grid (about, interests)
- Location: `layouts/_default/list.html`
- Triggers: Hugo renders section `_index.md` files using this template
- Responsibilities: Display section title, content description, list child pages with pagination
- Location: `layouts/_default/single.html`
- Triggers: Hugo renders regular Markdown pages using this template
- Responsibilities: Display article title, metadata (date), and full content in prose format
- Location: `content/publications/_index.md` + `layouts/shortcodes/publications.html`
- Triggers: Shortcode `{{< publications >}}` embedded in Markdown
- Responsibilities: Render publication list from YAML data with sorted results, author highlighting, and external links
## Error Handling
- Missing data files: Hugo will render empty sections gracefully (no publications list if YAML file missing)
- Broken links in templates: Hugo will not catch—manual testing required
- Invalid frontmatter: Hugo will fail to parse page and skip rendering
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
