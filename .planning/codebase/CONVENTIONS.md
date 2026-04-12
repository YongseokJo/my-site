# Coding Conventions

**Analysis Date:** 2026-04-12

## Naming Patterns

**Files:**
- HTML templates: lowercase with hyphens (e.g., `baseof.html`, `emailcopy-script.html`)
- CSS files: lowercase (e.g., `main.css`, `custom.css`)
- Data files: lowercase with underscores (e.g., `first_pub.yaml`, `co_pub.yaml`)
- YAML configuration: lowercase (e.g., `config.yaml`)

**CSS Classes:**
- Multi-word classes: lowercase with hyphens (e.g., `hero-inner`, `social-circle`, `card-header`, `chip-row`)
- Utility classes: descriptive single or hyphenated words (e.g., `container`, `prose`, `list`, `pubs`)
- Component classes: semantic structure with nested naming (e.g., `.card`, `.card-header`, `.card-body`, `.card-title`)

**CSS Variables:**
- Two-dash prefix: `--fg`, `--bg`, `--muted`, `--link`, `--accent`, `--max`
- Color variants: `--bg-dark`, `--card-bg`, `--card-border`, `--chip-bg`, `--chip-border`
- Functional naming focused on purpose over color values

**Hugo Templates:**
- Partial filenames: descriptive, lowercase with hyphens (`nav.html`, `footer.html`, `head.html`, `publications.html`)
- Variables: PascalCase for Hugo context (`.Site`, `.Pages`, `.Title`, `.Content`)
- Range variables: lowercase (`.pubs`, `.authors`, `$first`, `$co`)

**Data Structures:**
- YAML keys: lowercase with underscores where needed (`first_pub`, `co_pub`, `pub-title`, `pub-authors`)
- Hugo Params: lowercase with dots for nested access (`.Site.Params.email`, `.Site.Params.links.github`)

## Code Style

**Formatting:**
- HTML: 2-space indentation observed in templates
- CSS: Minified for production (single line declarations)
- YAML: 2-space indentation in data files
- JavaScript: Inline in HTML templates with 2-space indentation

**Linting:**
- No linter config detected (`.eslintrc`, `.prettierrc` absent)
- No formatting tool enforced

**CSS Organization:**
- Root CSS variables defined at `:root` level for theme configuration
- Utility classes follow Tailwind-like naming (container, prose, etc.)
- Responsive breakpoints: `@media (min-width: 768px)` for two-column layout switch
- Component-scoped styles grouped by visual element

## Import Organization

**Hugo Partials:**
- Included via `{{ partial "filename.html" . }}` syntax
- Context passed explicitly: `{{ partial "publications.html" (dict "pubs" $first "page" .) }}`
- No import order convention (minimal partials)

**CSS Imports:**
- Single import at end of file: `@import "custom.css"`
- Located in `assets/css/` directory
- Processed by Hugo resources pipeline with minification and fingerprinting

**Static Resources:**
- CSS: `resources.Get "css/main.css" | resources.Minify | resources.Fingerprint`
- Images: `/images/`, `/icons/` directories via static folder
- Scripts: Inline in `emailcopy-script.html` partial

## Code Patterns

**JavaScript Patterns:**
- Event delegation: `document.querySelectorAll("[data-copy-email]")` with attribute selectors
- DOM manipulation: inline styles set via `element.style.*` property assignments
- Async operations: `navigator.clipboard.writeText()` with `.then()` promise handling
- Cleanup: `setTimeout(() => node.remove(), 1500)` for temporary DOM elements

**Template Patterns:**
- Conditional blocks: `{{ if condition }}...{{ end }}`
- Range iteration: `{{ range .Items }}{{ end }}` for list rendering
- Hugo data access: `site.Data.first_pub` for YAML-driven content
- String replacement: `replace $string . "<replacement>"` for author highlighting
- Safe HTML: `{{ . | safeHTML }}` for pre-formatted content

**CSS Grid/Flex Patterns:**
- Mobile-first: single column by default (`grid-template-columns: 1fr`)
- Responsive upgrade at 768px breakpoint
- Gap-based spacing: `gap: 2rem`, `gap: 1rem`, `gap: 0.75rem`
- Flexbox for alignment: `align-items: center`, `justify-content: center`

**CSS Custom Properties:**
- Theme colors centralized in `:root` block
- Reused across components: `background: var(--card-bg)`, `border: 1px solid var(--card-border)`
- Permits easy theme switching via CSS variable override

## Comments

**When to Comment:**
- Inline Hugo comments explain data source: `{{/* this is the Markdown from _index.md */}}`
- CSS comments describe layout intent: `/* 👈 one column by default (mobile) */`
- Minimal comment usage; code structure is self-documenting

**Comment Style:**
- HTML/Hugo: `{{/* comment text */}}`
- CSS: `/* comment text */`
- JavaScript: `// single line` (minimal usage)

## Error Handling

**Patterns:**
- No error handling detected; Hugo build will fail on template errors
- No try-catch blocks in JavaScript
- Graceful degradation via attribute checking: `{{ with .links }}...{{ end }}`
- Silent fallback: `{{ if $first }}..{{ else }}<p>No publications found.</p>{{ end }}`

## Hugo-Specific Conventions

**Context Passing:**
- Single dot (`.`) refers to current context
- Nested context: `{{ .Site.Title }}`, `{{ .Page.Title }}`
- Functions accept context explicitly in partials

**Content Organization:**
- Markdown files: `content/*/\_index.md` for section pages
- Frontmatter minimal; most config in `config.yaml`
- URL structure: `/projects/`, `/publications/`, `/about/`

**Data-Driven Content:**
- Publications rendered from YAML in `data/first_pub.yaml` and `data/co_pub.yaml`
- Sorting in template: `{{ range sort $pubs "date" "desc" }}`
- Conditional rendering of optional fields: `{{ with .pdf }}...{{ end }}`

## Layout Structure

**Template Hierarchy:**
- `baseof.html`: Base layout wrapping all pages
- `_default/list.html`: Section listing template
- `_default/single.html`: Article/page template
- `index.html`: Custom homepage
- `publications/list.html`: Custom publications section
- `partials/`: Reusable component templates (nav, footer, head, publications)
- `shortcodes/`: Hugo shortcodes (minimal usage)

---

*Convention analysis: 2026-04-12*
