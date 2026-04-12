# Testing Patterns

**Analysis Date:** 2026-04-12

## Test Framework

**Status:** No testing framework detected

- No test runner present (Jest, Vitest, Go testing, etc.)
- No test configuration files (jest.config.js, vitest.config.ts, etc.)
- No test dependencies in project manifest
- No `.spec.*` or `.test.*` files found

**Build & Verification:**
- Hugo build: `hugo` command (configured in `netlify.toml`)
- Pre-publish script: `./before_publish.sh` performs cleanup and minified build
- Netlify deployment: `HUGO_VERSION = "0.152.2"` pinned in configuration

**Manual Verification Points:**
- Hugo build succeeds without errors
- Static assets (CSS, images) correctly minified and fingerprinted
- Template rendering produces valid HTML output

## Testing Strategy

**Current Approach:**
- Build-time validation: Hugo compiler catches template errors
- No unit tests
- No integration tests
- No end-to-end tests

**What Could Be Tested (If Framework Added):**
- Template rendering with various content structures
- CSS layout at different breakpoints
- JavaScript email copy functionality
- Hugo data file parsing (YAML validation)
- Link generation and URL structure

## Browser/Manual Testing Patterns

**Observed Best Practices:**
- Responsive design tested via CSS media queries (`@media (min-width: 768px)`)
- Grid layout tested with both mobile and desktop states
- JavaScript interactivity: email copy-to-clipboard feature includes success notification
- Fallback content: publications section renders empty state message

**Quality Checks:**
- `hugo --minify` produces minified CSS and HTML
- `hugo mod clean && hugo mod tidy` maintains clean module state
- Resource fingerprinting: `.fingerprint` ensures cache busting

## Template Structure

**Observation Only (No Test Framework):**

Base template structure in `layouts/_default/baseof.html`:
```html
{{ partial "emailcopy-script.html" . }}
<body>
  {{ partial "nav.html" . }}
  <main class="container">
    {{ block "main" . }}{{ end }}
  </main>
  {{ partial "footer.html" . }}
</body>
```

Content page template in `layouts/_default/single.html`:
```html
{{ define "title" }}{{ .Title }}{{ end }}
{{ define "main" }}
  <article class="prose">
    <h1>{{ .Title }}</h1>
    {{ if .Date }}<p class="meta">{{ .Date.Format "2006-01-02" }}</p>{{ end }}
    {{ .Content }}
  </article>
{{ end }}
```

Publications rendering in `layouts/partials/publications.html`:
```html
{{ $pubs := .pubs }}
{{ if $pubs }}
  <ol class="pubs">
    {{ range sort $pubs "date" "desc" }}
      <li class="pub">
        <span class="pub-title">{{ .title }}</span><br>
        {{ $authors := .authors }}
        {{ range (slice "Jo, Yongseok" "Yongseok Jo" "Jo, Y.") }}
          {{ $authors = replace $authors . "<i>Jo, Yongseok</i>" }}
        {{ end }}
        <span class="pub-authors">{{ $authors | safeHTML }}</span><br>
      </li>
    {{ end }}
  </ol>
{{ else }}
  <p>No publications found.</p>
{{ end }}
```

## JavaScript Testing Patterns

**Email Copy Feature** (`layouts/partials/emailcopy-script.html`):
```javascript
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-copy-email]").forEach(el => {
    el.addEventListener("click", e => {
      e.preventDefault();
      const email = el.getAttribute("data-copy-email");
      navigator.clipboard.writeText(email).then(() => {
        const note = document.createElement("div");
        note.textContent = "📋 Email Address Copied!";
        // ... styling ...
        document.body.appendChild(note);
        setTimeout(() => note.remove(), 1500);
      });
    });
  });
});
```

**What Would Need Testing (If Framework Present):**
- Clipboard API success/failure handling
- DOM element creation and cleanup
- Event listener attachment and cleanup
- Timeout execution (1500ms removal)
- Data attribute reading from HTML elements

## CSS Testing Patterns

**Breakpoint Testing Points:**
- Mobile (default): single-column layout, centered avatar
- Tablet/Desktop (768px+): two-column grid with left/right sections
- Responsive typography: `font-size: clamp(2.1rem, 4vw, 3rem)` scales with viewport

**Layout Components to Verify:**
- `layouts/assets/css/main.css`: Hero section grid layout
- `layouts/assets/css/custom.css`: Background image positioning
- Responsive flexbox: navigation wrapping, social button flex-wrap
- CSS Custom Properties: color scheme variables functioning

## Data Validation Patterns

**YAML Data Files** (`data/first_pub.yaml`, `data/co_pub.yaml`):
- Hugo validates YAML syntax at build time
- Template uses optional field access: `{{ with .pdf }}{{ end }}` for safe field access
- Sorting performed at runtime: `{{ range sort $pubs "date" "desc" }}`
- String replacement for author highlighting handles multiple name formats

**What Would Need Testing (If Framework Added):**
- YAML parsing correctness
- Date format handling and sorting
- Author name replacement accuracy
- Missing field graceful handling
- Publication link generation

## Coverage

**Requirements:** None enforced

**View Build Status:**
```bash
hugo                    # Build and report errors
hugo --minify          # Production build with minification
```

## Deployment Verification

**Pre-publish Checklist** (from `before_publish.sh`):
```bash
hugo mod clean          # Clean Hugo module cache
hugo mod tidy          # Tidy dependencies
rm -rf public/ resources/_gen/  # Clean build artifacts
hugo --minify          # Perform minified build
```

**Netlify Build** (from `netlify.toml`):
- Trigger: git push to main branch
- Command: `hugo`
- Output directory: `public/`
- Environment: `HUGO_ENV = "production"`

## Manual Testing Checklist (Recommended)

**Before Each Deploy:**
1. Run `./before_publish.sh` and verify no Hugo errors
2. Check `/public/index.html` renders without template errors
3. Test responsive layout at 768px breakpoint
4. Verify email copy-to-clipboard works in browser console
5. Validate publication list displays with correct sort order
6. Check CSS fingerprints changed (cache busting working)
7. Verify all external links (GitHub, Scholar, ORCID) load

**Accessibility Checks:**
- Alt text present: image tags have `alt="..."` attributes
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<footer>`, `<article>` used
- Link targets marked: `target="_blank" rel="noopener"` for external links
- ARIA labels: `aria-label="..."` on social buttons

---

*Testing analysis: 2026-04-12*
