# Phase 1: Framework Migration & Design System - Research

**Researched:** 2026-04-12
**Domain:** Astro 5.x static site framework, Tailwind CSS v4, Hugo-to-Astro content migration
**Confidence:** HIGH

## Summary

This phase replaces the existing Hugo static site with an Astro 5.x project, establishes a design system using Tailwind CSS v4 and shadcn/ui, migrates all existing Markdown content and YAML publication data into Astro Content Collections, and deploys to Netlify. The existing site is small (5 content pages, ~146 lines of publication YAML across 2 files, a Python BibTeX-to-YAML script, and a handful of static assets), making the migration straightforward.

The critical technical shift is that Tailwind v4 no longer uses `tailwind.config.js` -- all configuration lives in CSS via the `@theme` directive. The `@astrojs/tailwind` integration is deprecated; the correct approach is the `@tailwindcss/vite` plugin added directly to `astro.config.mjs`. For Content Collections, Astro 5.x uses the Content Layer API with `file()` and `glob()` loaders defined in `src/content.config.ts`, not the older `src/content/config.ts` pattern.

**Primary recommendation:** Scaffold a fresh Astro project from the minimal template, configure Tailwind v4 via `@tailwindcss/vite`, initialize shadcn/ui, build the base layout shell (nav, footer, dark mode), define Content Collections for publications and pages, copy content/assets, and update `netlify.toml` for the Astro build command.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Deep space color base -- dark navy/black background with cosmic feel
- **D-02:** Gold/amber accent colors against the dark base
- **D-03:** Modern sans-serif typography (e.g., Inter, Satoshi, or similar clean font)
- **D-04:** Spacious content density -- generous whitespace, breathing room between sections
- **D-05:** Subtle abstract cosmic motifs or minimal imagery -- not complex, not literal. User will add their own simulation images in later phases
- **D-06:** Overall aesthetic: professional + clean + creative + academic
- **D-07:** Top bar horizontal navigation
- **D-08:** Narrow prose-width content area (~700px max) for optimal readability
- **D-09:** Minimal footer -- copyright + social links only
- **D-10:** Navigation items: Home, Research, Software, ArXiv App, About, Contact (from research)
- **D-11:** Default to system preference on first visit (prefers-color-scheme)
- **D-12:** Dark mode = the deep space cosmic theme (primary creative expression)
- **D-13:** Light mode = clean academic look (white/light gray, traditional, readable)
- **D-14:** User toggle persists preference across sessions (localStorage)
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

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FRMK-01 | Site rebuilt on Astro 5.x with islands architecture, deployed on Netlify | Standard Stack section covers Astro 6.1.5 + @astrojs/netlify 7.0.6; Architecture Patterns section covers islands + hybrid output mode |
| FRMK-02 | Existing Hugo content (Markdown, YAML publications) migrated to Astro Content Collections | Content Migration section covers file() loader for YAML, glob() loader for Markdown, and schema definitions |
| FRMK-03 | Tailwind CSS v4 design system with professional, clean, creative, academic aesthetic | Standard Stack covers @tailwindcss/vite 4.2.2; Code Examples section provides @theme configuration matching UI-SPEC colors |
| FRMK-04 | Dark mode toggle that persists user preference across sessions | Code Examples section provides ThemeScript and DarkModeToggle patterns; Architecture section covers React island hydration |
| FRMK-05 | Responsive mobile-first layout verified on phone, tablet, and desktop | Architecture Patterns section covers breakpoints from UI-SPEC (768px, 1024px); base layout pattern |
| FRMK-06 | Page load under 2 seconds on first visit | Architecture Patterns section covers static prerendering for zero-JS pages; Don't Hand-Roll section covers font loading optimization |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | 6.1.5 | Static site generation + islands architecture | Content-first, zero-JS static pages, official Netlify adapter [VERIFIED: npm registry] |
| react | 19.2.5 | Interactive islands (dark mode toggle) | Required by shadcn/ui components [VERIFIED: npm registry] |
| react-dom | 19.2.5 | React DOM renderer | Paired with React [VERIFIED: npm registry] |
| typescript | 6.0.2 | Type safety | Type-safe Content Collections, component props [VERIFIED: npm registry] |
| @astrojs/react | 5.0.3 | Astro React integration | Enables `client:*` directives for React islands [VERIFIED: npm registry] |
| @astrojs/mdx | 5.0.3 | MDX support | Enables React components in Markdown content [VERIFIED: npm registry] |
| @astrojs/netlify | 7.0.6 | Netlify deployment adapter | SSR support + static deployment on Netlify [VERIFIED: npm registry] |

### Styling

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| tailwindcss | 4.2.2 | Utility-first CSS | CSS-native @theme variables, Rust-based engine [VERIFIED: npm registry] |
| @tailwindcss/vite | 4.2.2 | Vite plugin for Tailwind v4 | Replaces deprecated @astrojs/tailwind integration [VERIFIED: npm registry] |
| @fontsource-variable/inter | 5.2.8 | Inter variable font | Self-hosted, no external font request, matches UI-SPEC [VERIFIED: npm registry] |
| shadcn (CLI) | 4.2.0 | Component scaffolding | Generates accessible React components with Tailwind v4 [VERIFIED: npm registry] |
| lucide-react | 1.8.0 | Icon library | Used by shadcn/ui; provides Sun/Moon icons for dark mode toggle [VERIFIED: npm registry] |

### Dev Tooling

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @biomejs/biome | 2.4.11 | Linting + formatting | Single tool replaces ESLint + Prettier [VERIFIED: npm registry] |
| @astrojs/check | 0.9.8 | Astro-specific type checking | Run alongside tsc for .astro file validation [VERIFIED: npm registry] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @tailwindcss/vite | @astrojs/tailwind | @astrojs/tailwind is deprecated for Tailwind v4; use @tailwindcss/vite directly [CITED: tailwindcss.com/docs/guides/astro] |
| shadcn/ui | Starwind UI | Starwind UI is shadcn native for Astro (no React needed) but less mature ecosystem; shadcn/ui is the established choice [ASSUMED] |
| Inter font | Satoshi, Geist | Inter has the widest support, variable font, and free hosting via fontsource [ASSUMED] |

**Installation:**
```bash
# Create Astro project (in-place, since repo already exists)
npm create astro@latest . -- --template minimal --install --no-git

# Add integrations
npx astro add react mdx netlify

# Install Tailwind v4 (NOT via astro add tailwind -- that uses deprecated integration)
npm install tailwindcss @tailwindcss/vite

# Font
npm install @fontsource-variable/inter

# Initialize shadcn/ui (after React + Tailwind configured)
npx shadcn@latest init

# Add only the Button component (Phase 1 only needs this)
npx shadcn@latest add button

# Dev tooling
npm install -D @biomejs/biome @astrojs/check
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── BaseHead.astro          # <head> metadata, font import, global CSS import
│   ├── Navigation.astro        # Top bar horizontal nav (D-07, D-10)
│   ├── Footer.astro            # Copyright + social links (D-09)
│   ├── ThemeScript.astro       # Inline <script> for flash prevention
│   └── ui/                     # shadcn/ui generated components
│       └── button.tsx          # Dark mode toggle button
├── islands/
│   └── DarkModeToggle.tsx      # React island: Sun/Moon toggle (D-11 to D-14)
├── layouts/
│   └── BaseLayout.astro        # HTML shell: <html>, BaseHead, Navigation, <slot/>, Footer
├── content/
│   └── pages/                  # Migrated Markdown pages (D-18)
│       ├── about.md
│       ├── projects.md
│       ├── contact.md
│       └── publications.md
├── data/
│   └── publications.yaml       # Merged publication data with role field (D-15)
├── pages/
│   ├── index.astro             # Homepage (placeholder for Phase 1)
│   ├── about.astro             # About page
│   ├── research.astro          # Research page (placeholder)
│   ├── software.astro          # Software page (placeholder)
│   ├── arxiv-app.astro         # ArXiv App page (placeholder)
│   ├── contact.astro           # Contact page
│   └── 404.astro               # Error page with UI-SPEC copy
├── styles/
│   └── global.css              # Tailwind v4 @import + @theme + light mode overrides
├── content.config.ts           # Content Collection definitions
└── env.d.ts                    # Astro environment types
public/
├── icons/                      # SVG social icons (from static/icons/)
├── images/                     # Avatar, backgrounds (from static/images/)
├── favicon.ico                 # From static/icons/favicon.ico
└── robots.txt                  # From static/robots.txt
```

### Pattern 1: Tailwind v4 CSS-Only Configuration

**What:** All theme customization lives in `src/styles/global.css` using the `@theme` directive. No `tailwind.config.js` exists.
**When to use:** Always in Tailwind v4 projects.
**Example:**
```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  --font-sans: "Inter Variable", "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --color-background: #0a0e1a;
  --color-foreground: #e2e8f0;
  --color-card: #141b2d;
  --color-card-foreground: #e2e8f0;
  --color-primary: #d4a54a;
  --color-primary-foreground: #0a0e1a;
  --color-secondary: #1a2236;
  --color-secondary-foreground: #e2e8f0;
  --color-muted: #1a2236;
  --color-muted-foreground: #94a3b8;
  --color-accent: #d4a54a;
  --color-accent-foreground: #0a0e1a;
  --color-destructive: #ef4444;
  --color-border: #1e293b;
  --color-ring: #d4a54a;
  --radius-lg: 1rem;
  --radius-md: 0.75rem;
  --radius-sm: 0.5rem;
}

/* Light mode overrides */
.light {
  --color-background: #ffffff;
  --color-foreground: #0f172a;
  --color-card: #f8fafc;
  --color-card-foreground: #0f172a;
  --color-primary: #b8860b;
  --color-primary-foreground: #ffffff;
  --color-secondary: #f1f5f9;
  --color-secondary-foreground: #0f172a;
  --color-muted: #f1f5f9;
  --color-muted-foreground: #64748b;
  --color-accent: #b8860b;
  --color-accent-foreground: #ffffff;
  --color-destructive: #dc2626;
  --color-border: #e2e8f0;
  --color-ring: #b8860b;
}
```
Source: [Tailwind CSS Astro Guide](https://tailwindcss.com/docs/guides/astro) [CITED: tailwindcss.com/docs/guides/astro]

### Pattern 2: Astro Config with Tailwind v4 Vite Plugin

**What:** Register `@tailwindcss/vite` as a Vite plugin in `astro.config.mjs`, NOT via the deprecated `@astrojs/tailwind` integration.
**Example:**
```javascript
// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import netlify from "@astrojs/netlify";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://yongseokjo.com",
  output: "static",
  adapter: netlify(),
  integrations: [react(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```
Source: [Tailwind CSS Astro Guide](https://tailwindcss.com/docs/guides/astro) [CITED: tailwindcss.com/docs/guides/astro]

### Pattern 3: Content Collections with file() Loader for YAML

**What:** Use the `file()` loader for the merged publications YAML (a single file with an array of entries). Use `glob()` for Markdown page content.
**Example:**
```typescript
// src/content.config.ts
import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const publications = defineCollection({
  loader: file("src/data/publications.yaml"),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    authors: z.string(),
    venue: z.string(),
    year: z.number(),
    date: z.string(),
    role: z.enum(["first-author", "co-author"]),
    links: z.object({
      arxiv: z.string().default(""),
      doi: z.string().default(""),
      ads: z.string().default(""),
      pdf: z.string().default(""),
    }),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { publications, pages };
```
Source: [Astro Content Collections Docs](https://docs.astro.build/en/guides/content-collections/) [CITED: docs.astro.build/en/guides/content-collections/]

### Pattern 4: Dark Mode with Inline ThemeScript (No Flash)

**What:** An inline `<script>` in `<head>` that runs before first paint to read localStorage or system preference and set the theme class. This prevents FOUC (flash of unstyled content / wrong theme).
**Example:**
```astro
<!-- src/components/ThemeScript.astro -->
<script is:inline>
  (function() {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored || (prefersDark ? "dark" : "light");
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
  })();
</script>
```
Source: UI-SPEC Dark Mode Interaction Contract [VERIFIED: project file]

### Pattern 5: React Island for Dark Mode Toggle

**What:** A minimal React component hydrated with `client:load` that toggles the theme class and persists to localStorage.
**Example:**
```tsx
// src/islands/DarkModeToggle.tsx
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DarkModeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const current = document.documentElement.classList.contains("light") ? "light" : "dark";
    setTheme(current);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("light", next === "light");
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
    setTheme(next);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="h-12 w-12"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
```
Source: UI-SPEC Component Inventory + Dark Mode Interaction Contract [VERIFIED: project file]

### Anti-Patterns to Avoid

- **Using @astrojs/tailwind with Tailwind v4:** The integration is deprecated. Use `@tailwindcss/vite` as a Vite plugin directly. [CITED: tailwindcss.com/docs/guides/astro]
- **Setting `output: 'server'` globally:** Phase 1 is 100% static. Use `output: 'static'`. SSR is not needed until Phase 4+. [CITED: docs.astro.build/en/guides/content-collections/]
- **Porting Hugo Go templates line-by-line:** Treat this as a rebuild, not a translation. Only content files migrate. [CITED: .planning/research/PITFALLS.md]
- **Copying existing CSS wholesale:** Start fresh with Tailwind v4 @theme. Use old CSS as visual reference only. [CITED: .planning/research/PITFALLS.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible button/toggle | Custom button with ARIA | shadcn/ui Button component | Keyboard navigation, focus management, screen reader support built-in |
| Icon set | Custom SVG sprite system | lucide-react | Tree-shakeable, consistent sizing, works with shadcn |
| Font loading | Manual @font-face declarations | @fontsource-variable/inter | Handles variable font axes, preload hints, fallback stack |
| Dark mode flash prevention | Custom JS in layout | Inline ThemeScript pattern (above) | Must run synchronously before paint; pattern is well-established |
| CSS reset/normalization | Custom reset stylesheet | Tailwind's built-in preflight | Already included with `@import "tailwindcss"` |
| Responsive hamburger menu | Custom JS toggle logic | Astro component with CSS-only or minimal JS | Can be done with checkbox hack + CSS, or a small island |

**Key insight:** Phase 1 is a foundation phase. Every custom solution here becomes tech debt for 4 more phases. Use established tools wherever possible.

## Common Pitfalls

### Pitfall 1: Using Deprecated @astrojs/tailwind Integration

**What goes wrong:** Running `npx astro add tailwind` installs the old `@astrojs/tailwind` integration which is incompatible with Tailwind v4's CSS-first configuration.
**Why it happens:** Astro's CLI still offers this integration, and many tutorials reference it.
**How to avoid:** Install `tailwindcss` and `@tailwindcss/vite` manually. Add the Vite plugin to `astro.config.mjs`. Do NOT use `npx astro add tailwind`.
**Warning signs:** Seeing `tailwind.config.js` generated in the project root. Tailwind classes not applying.

### Pitfall 2: Wrong Content Collection Config File Location

**What goes wrong:** Astro 5.x uses `src/content.config.ts` (at the `src/` root). The older Astro 4.x pattern was `src/content/config.ts` (inside the content directory). Using the wrong path silently fails -- no schema validation, no type safety.
**Why it happens:** Many tutorials and even Astro's own older docs reference the v4 location.
**How to avoid:** Always use `src/content.config.ts` for Astro 5.x+.
**Warning signs:** `getCollection()` returns untyped data. No build-time validation errors for bad frontmatter.

### Pitfall 3: YAML file() Loader Requires id Field

**What goes wrong:** The `file()` loader for YAML arrays requires each entry to have an `id` field. The existing publication YAML files do NOT have `id` fields -- they use `title` as the de facto identifier.
**Why it happens:** Astro's Content Layer uses `id` for deduplication and querying.
**How to avoid:** When merging publication YAML files, add a unique `id` field to each entry (e.g., slugified author-year like `jo-2024-star-clusters`). Also add the `role` field per D-15.
**Warning signs:** Build error about missing `id` property. All entries overwriting each other.

### Pitfall 4: Flash of Wrong Theme (FOUC)

**What goes wrong:** Dark mode toggle works, but on page load there's a brief flash of the wrong theme (usually light mode appearing before dark mode applies).
**Why it happens:** JavaScript that sets the theme class runs after the initial paint. CSS renders before JS hydrates.
**How to avoid:** Use an inline `<script is:inline>` in `<head>` (the ThemeScript pattern above). The `is:inline` directive prevents Astro from bundling/deferring it.
**Warning signs:** Visible flash on page refresh. Users on dark mode see white flash before dark theme applies.

### Pitfall 5: Hugo Shortcodes in Markdown Content

**What goes wrong:** The existing content files use Hugo shortcodes like `{{< param "links.scholar" >}}`. These will render as literal text in Astro's Markdown pipeline.
**Why it happens:** Hugo shortcodes are Hugo-specific syntax. Astro does not recognize them.
**How to avoid:** Before migrating Markdown files, replace all Hugo shortcodes with standard Markdown links or remove them entirely. The content files are small enough to do this manually.
**Warning signs:** Literal `{{< ... >}}` text appearing on rendered pages.

### Pitfall 6: shadcn/ui Init Before Tailwind + React Configuration

**What goes wrong:** Running `npx shadcn@latest init` before React integration and Tailwind v4 are properly configured causes init to fail or generate incompatible configuration.
**Why it happens:** shadcn/ui init detects the project framework and configures accordingly. If React or Tailwind aren't set up, it makes wrong assumptions.
**How to avoid:** Follow this exact order: (1) Create Astro project, (2) Add React integration, (3) Configure Tailwind v4 via Vite plugin, (4) Set up tsconfig path aliases, (5) THEN run shadcn init.
**Warning signs:** shadcn init asking framework questions it should auto-detect. Generated components using wrong import paths.

## Code Examples

### Astro Config (Complete)

```javascript
// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import netlify from "@astrojs/netlify";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://yongseokjo.com",
  output: "static",
  adapter: netlify(),
  integrations: [react(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```
Source: [Tailwind CSS Astro Guide](https://tailwindcss.com/docs/guides/astro) + [Astro Netlify Docs](https://docs.astro.build/en/guides/deploy/netlify/) [CITED]

### BaseLayout Component

```astro
---
// src/layouts/BaseLayout.astro
import "@fontsource-variable/inter";
import "../styles/global.css";
import BaseHead from "../components/BaseHead.astro";
import Navigation from "../components/Navigation.astro";
import Footer from "../components/Footer.astro";
import ThemeScript from "../components/ThemeScript.astro";

interface Props {
  title: string;
  description?: string;
}

const { title, description = "Yongseok Jo - Computational Astrophysicist" } = Astro.props;
---
<!doctype html>
<html lang="en" class="dark">
  <head>
    <BaseHead title={title} description={description} />
    <ThemeScript />
  </head>
  <body class="bg-background text-foreground min-h-screen flex flex-col font-sans">
    <Navigation />
    <main class="flex-1 w-full max-w-[700px] mx-auto px-4 md:px-6 lg:px-8 py-16">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```
Source: UI-SPEC layout contract + Astro docs [VERIFIED: project file + CITED: docs.astro.build]

### Merged Publications YAML Structure

```yaml
# src/data/publications.yaml
# Merged from data/first_pub.yaml + data/co_pub.yaml with id and role fields added
- id: jo-2025-robustness-cosmological
  title: "Toward Robustness across Cosmological Simulation Models..."
  authors: "Jo, Yongseok; Genel, Shy; Sengupta, Anirvan; ..."
  venue: "ApJ"
  year: 2025
  date: "2025-09-01"
  role: "first-author"
  links:
    arxiv: ""
    doi: "https://doi.org/10.3847/1538-4357/adec78"
    ads: "https://ui.adsabs.harvard.edu/abs/2025ApJ...991..120J"
    pdf: ""
```
Source: Existing data/first_pub.yaml + D-15 decision [VERIFIED: project file]

### Netlify Configuration Update

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "24"
```
Source: [Netlify Astro Deployment Docs](https://docs.netlify.com/build/frameworks/framework-setup-guides/astro/) [CITED]

### BibTeX-to-YAML Node.js Conversion (D-16)

The existing Python script (`scripts/bib_to_yaml.py`) uses `bibtexparser` and `PyYAML`. The Node.js equivalent would use `@retorquere/bibtex-parser` or `bibtex-parse` from npm, plus `js-yaml`.

```bash
npm view @retorquere/bibtex-parser version  # For BibTeX parsing
npm view js-yaml version                      # For YAML output
```

The script is ~165 lines of Python handling: LaTeX accent normalization, journal abbreviation mapping, date parsing, and link extraction. A direct Node.js port is straightforward. [ASSUMED]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` | `@theme` directive in CSS | Tailwind v4.0 (Jan 2025) | No config file needed; all customization in CSS |
| `@astrojs/tailwind` integration | `@tailwindcss/vite` plugin | Tailwind v4.0 / Astro 5.2+ | Must use Vite plugin directly |
| `src/content/config.ts` | `src/content.config.ts` | Astro 5.0 (Dec 2024) | File location changed to src root |
| Content Collections (type-only) | Content Layer API with loaders | Astro 5.0 | `file()` and `glob()` loaders replace magic directory convention |
| React 18 | React 19 | Feb 2025 | New hooks, server components (not needed Phase 1) |
| shadcn/ui v2 (Tailwind v3) | shadcn/ui v4 (Tailwind v4) | 2025 | Full @theme directive support, updated component styles |

**Deprecated/outdated:**
- `@astrojs/tailwind`: Do not use with Tailwind v4. [CITED: tailwindcss.com/docs/guides/astro]
- `src/content/config.ts` location: Use `src/content.config.ts` in Astro 5.x. [CITED: docs.astro.build/en/guides/content-collections/]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Starwind UI is less mature than shadcn/ui for Astro | Alternatives Considered | Low -- shadcn/ui with React is proven; Starwind would be an alternative if React island overhead is unacceptable |
| A2 | Inter is the best font choice among modern sans-serif options | Alternatives Considered | Low -- font is easily swappable; Inter is widely used in academic/tech sites |
| A3 | Node.js BibTeX parsing with @retorquere/bibtex-parser is straightforward | Code Examples | Medium -- if the parser handles LaTeX accents differently than Python bibtexparser, output may differ |
| A4 | `npm create astro@latest . -- --template minimal` works in existing repo directory | Installation | Medium -- may need to use a temp directory and copy files if in-place creation conflicts with existing files |

## Open Questions

1. **In-place Astro project creation in existing Hugo repo**
   - What we know: The repo has Hugo files (layouts/, content/, config.yaml, etc.) that must be kept (D-17)
   - What's unclear: Whether `npm create astro@latest .` will conflict with existing files
   - Recommendation: Create Astro project in a temp directory, then copy `src/`, `astro.config.mjs`, `package.json`, `tsconfig.json` into the repo root. This avoids any conflicts with existing Hugo files.

2. **BibTeX-to-YAML Node.js library choice**
   - What we know: Python script uses bibtexparser with LaTeX accent handling
   - What's unclear: Whether @retorquere/bibtex-parser handles the same LaTeX edge cases
   - Recommendation: Test with the actual .bib files in `bib/` directory before committing to a library. Fall back to keeping the Python script if Node.js parsers don't handle accented author names correctly.

3. **shadcn/ui initialization with Tailwind v4 @theme (not @theme inline)**
   - What we know: shadcn/ui v4 supports Tailwind v4 with `@theme` directive
   - What's unclear: Whether `npx shadcn@latest init` will auto-detect the Astro + Tailwind v4 setup or require manual configuration
   - Recommendation: Follow the manual setup path from shadcn docs if auto-detection fails. The key is having tsconfig path aliases (`@/*` -> `./src/*`) configured before init.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All build tooling | Yes | 24.11.1 | -- |
| npm | Package management | Yes | 11.6.2 | -- |
| Git | Version control | Yes | (installed) | -- |
| Netlify CLI | Local deploy testing | Unknown | -- | Use `npm run build` + Netlify web UI |

**Missing dependencies with no fallback:** None -- all critical dependencies are available.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Astro built-in build validation (no unit test framework for Phase 1) |
| Config file | None -- Phase 1 validation is build success + manual visual check |
| Quick run command | `npm run build` |
| Full suite command | `npm run build && npx astro check` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FRMK-01 | Astro builds and deploys on Netlify | smoke | `npm run build` (exit code 0 = pass) | Wave 0 |
| FRMK-02 | Content Collections resolve all publications + pages | build | `npm run build` (Content Layer validates schemas) | Wave 0 |
| FRMK-03 | Tailwind classes apply (design system active) | manual | Visual inspection in `npm run dev` | N/A |
| FRMK-04 | Dark mode toggle persists preference | manual | Toggle in browser, refresh, verify localStorage | N/A |
| FRMK-05 | Responsive layout at 3 breakpoints | manual | Browser DevTools responsive mode | N/A |
| FRMK-06 | Page load under 2 seconds | manual | Lighthouse audit on built site | N/A |

### Sampling Rate

- **Per task commit:** `npm run build`
- **Per wave merge:** `npm run build && npx astro check`
- **Phase gate:** Full build + Lighthouse performance audit before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `package.json` with `build` and `dev` scripts -- created during Astro project scaffolding
- [ ] `tsconfig.json` with `@/*` path alias -- required before shadcn init
- [ ] No unit test framework needed for Phase 1 (all validation is build-time or manual)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Phase 1 has no auth |
| V3 Session Management | No | Phase 1 has no sessions |
| V4 Access Control | No | Phase 1 is fully public static |
| V5 Input Validation | No | Phase 1 has no user input |
| V6 Cryptography | No | Phase 1 has no crypto needs |

### Known Threat Patterns for Phase 1

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via Markdown content | Tampering | Astro's Markdown renderer auto-escapes HTML by default |
| Supply chain attack via npm | Tampering | Use exact versions in package-lock.json; audit with `npm audit` |
| Exposed secrets in repo | Information Disclosure | Ensure .env is in .gitignore; only public site URL in config |

Phase 1 is a static site with no user input, no auth, and no backend. Security surface is minimal.

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS Astro Installation Guide](https://tailwindcss.com/docs/guides/astro) -- Vite plugin setup, @theme directive
- [Astro Content Collections Docs](https://docs.astro.build/en/guides/content-collections/) -- file() and glob() loaders, content.config.ts
- [shadcn/ui Astro Installation](https://ui.shadcn.com/docs/installation/astro) -- Init process, component generation
- [shadcn/ui Tailwind v4 Guide](https://ui.shadcn.com/docs/tailwind-v4) -- @theme directive compatibility
- [Astro Netlify Deployment Docs](https://docs.astro.build/en/guides/deploy/netlify/) -- Adapter configuration
- npm registry -- All package versions verified via `npm view`

### Secondary (MEDIUM confidence)
- [Brian Douglass: Upgrading Astro to Tailwind v4](https://bhdouglass.com/blog/how-to-upgrade-your-astro-site-to-tailwind-v4/) -- Migration experience
- [EastonDev: Astro + Tailwind Island Styles](https://eastondev.com/blog/en/posts/dev/20260331-astro-tailwind-island-styles-en/) -- Island component styling patterns

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified against npm registry, installation patterns verified against official docs
- Architecture: HIGH -- project structure follows Astro conventions; patterns from official docs and UI-SPEC
- Pitfalls: HIGH -- pitfalls verified against official documentation and project-level research

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (30 days -- Astro and Tailwind are stable releases)
