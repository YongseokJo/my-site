---
phase: 01-framework-migration-design-system
verified: 2026-04-12T14:40:00Z
status: human_needed
score: 14/16 must-haves verified (2 require human testing)
overrides_applied: 0
human_verification:
  - test: "Open http://localhost:4321 and verify dark space theme renders (navy background #0a0e1a, gold accent #d4a54a), dark mode toggle switches to light mode and persists on refresh, mobile hamburger works at <768px, footer copyright and 4 social icons visible"
    expected: "Dark theme renders with correct colors; toggle switches and persists; hamburger collapses nav on mobile; footer shows copyright and icons"
    why_human: "Visual appearance, dark/light CSS class toggling behavior, mobile responsive layout, localStorage persistence — all require browser testing"
  - test: "Run Lighthouse or load http://localhost:4321 and measure Time to First Contentful Paint"
    expected: "Page loads in under 2 seconds on first visit (FRMK-06)"
    why_human: "Performance timing requires browser measurement; cannot verify from static file sizes alone"
---

# Phase 1: Framework Migration + Design System Verification Report

**Phase Goal:** The site runs on Astro with a professional design system, serving existing content from Content Collections on Netlify
**Verified:** 2026-04-12T14:40:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Astro project builds successfully with `npm run build` | VERIFIED | Build completes with exit code 0; all 7 HTML pages generated in dist/ |
| 2 | Tailwind v4 utility classes render in built HTML output | VERIFIED | dist/index.html contains bg-background, text-foreground, font-sans, max-w-[700px], border-accent; compiled CSS file at dist/_astro/BaseLayout.DGITOcGz.css contains full Tailwind v4 theme tokens |
| 3 | shadcn/ui Button component is available for import | VERIFIED | src/components/ui/button.tsx exists; imported in DarkModeToggle.tsx |
| 4 | Inter font is loaded and configured as the default sans-serif | VERIFIED | BaseHead.astro imports @fontsource-variable/inter; global.css sets --font-sans: "Inter Variable"; compiled CSS @font-face rules for Inter Variable present |
| 5 | Old Hugo files (layouts/, config.yaml, data/) are untouched | VERIFIED | layouts/ directory, config.yaml, and data/ directory all present in project root |
| 6 | Top bar navigation displays brand text and 6 menu items on desktop | VERIFIED | Navigation.astro renders "Yongseok Jo" brand + all 6 hrefs: /, /research, /software, /arxiv-app, /about, /contact; confirmed in dist/index.html output |
| 7 | Hamburger menu works on mobile (< 768px) | VERIFIED (code) | Navigation.astro has id="mobile-menu-btn", inline script toggles "hidden" class, aria-expanded set; JavaScript wiring confirmed in built HTML. Visual/interactive verification requires human |
| 8 | Dark mode toggle switches between dark and light themes | VERIFIED (code) | DarkModeToggle.tsx toggles .dark/.light classes on documentElement; ThemeScript.astro reads localStorage with is:inline script. Functional behavior requires browser testing |
| 9 | Theme preference persists in localStorage across page refreshes | VERIFIED (code) | ThemeScript.astro reads localStorage.getItem("theme") in head; DarkModeToggle.tsx calls localStorage.setItem("theme", next). Persistence behavior requires browser testing |
| 10 | Footer shows copyright and 4 social icon links | VERIFIED | Footer.astro contains "(c) 2026 Yongseok Jo. All rights reserved." and 4 aria-label links (Google Scholar, ORCID, GitHub, LinkedIn) with noopener noreferrer; confirmed in dist/index.html |
| 11 | Navigation active page shows accent-colored bottom border | VERIFIED | Navigation.astro uses border-b-2 border-accent for active links; confirmed in built HTML (Home link shows border-b-2 border-accent class on index page) |
| 12 | All 11 publications (5 first-author + 6 co-author) are accessible via getCollection('publications') | VERIFIED | src/data/publications.yaml has 11 entries: 5 role: first-author, 6 role: co-author; content.config.ts uses file() loader; build validates schema; note: plan stated 12 but source YAML had 11 (SUMMARY documents this as data correction) |
| 13 | Markdown content pages are accessible via getCollection('pages') | VERIFIED | src/content/pages/ has about.md, contact.md, projects.md, publications.md; content.config.ts glob() loader configured; about.astro calls getCollection('pages') and render(); build succeeds |
| 14 | BibTeX-to-YAML script runs with Node.js (no Python dependency) | VERIFIED | scripts/bib_to_yaml.mjs is ESM module with @retorquere/bibtex-parser and js-yaml imports; node scripts/bib_to_yaml.mjs runs successfully producing "Converted 11 publications"; package.json has "bib:convert" script |
| 15 | All 6 navigation routes resolve to actual pages | VERIFIED | dist/ contains index.html, about/index.html, research/index.html, software/index.html, arxiv-app/index.html, contact/index.html, 404.html |
| 16 | Site deploys on Netlify from Astro build pipeline | VERIFIED (config) | netlify.toml contains command = "npm run build", publish = "dist", NODE_VERSION = "24"; no hugo references remain |

**Score:** 14/16 truths verified (2 require human browser testing for interactive/visual/performance confirmation)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `package.json` | Astro + Tailwind + React + shadcn dependencies | VERIFIED | Contains astro, tailwindcss, @tailwindcss/vite, react, @astrojs/react, @astrojs/netlify, @fontsource-variable/inter, js-yaml |
| `astro.config.mjs` | Astro config with Tailwind vite plugin and React integration | VERIFIED | Contains tailwindcss() in vite.plugins, react(), mdx(), netlify() adapter, output: "static", site: "https://yongseokjo.com" |
| `src/styles/global.css` | Tailwind v4 @theme with dark/light color tokens | VERIFIED | @import "tailwindcss" present; @theme inline block maps color tokens; :root has light values; .dark has dark values (#0a0e1a, #d4a54a); --font-sans: "Inter Variable" |
| `src/layouts/BaseLayout.astro` | Base HTML layout with Navigation, Footer, ThemeScript | VERIFIED | Imports all 4 components; structure: BaseHead + ThemeScript in head, Navigation before main, slot in main (max-w-[700px]), Footer after main |
| `src/components/BaseHead.astro` | HTML head with meta tags and font import | VERIFIED | Imports @fontsource-variable/inter; has meta charset, viewport, description, title, favicon |
| `src/components/Navigation.astro` | Horizontal nav bar with brand, links, mobile hamburger | VERIFIED | 98 lines; brand "Yongseok Jo"; 6 nav links; DarkModeToggle client:load; hamburger button with script toggle |
| `src/components/Footer.astro` | Minimal footer with copyright + social links | VERIFIED | 44 lines; 4 social links with aria-labels; copyright; noopener noreferrer |
| `src/components/ThemeScript.astro` | Inline script preventing theme flash | VERIFIED | is:inline; reads localStorage.getItem("theme"); falls back to prefers-color-scheme |
| `src/islands/DarkModeToggle.tsx` | React island for sun/moon toggle | VERIFIED | useState, useEffect, localStorage.setItem, aria-label="Toggle dark mode", h-12 w-12 (48px touch target), Sun/Moon icons |
| `src/data/publications.yaml` | Merged publication data with id and role fields | VERIFIED | 11 entries; 5 role: first-author; 6 role: co-author; all have id field; sorted date descending 2025-2019 |
| `src/content.config.ts` | Content Collection schemas for publications and pages | VERIFIED | file() loader for publications.yaml; glob() loader for pages; z.enum(["first-author", "co-author"]); export const collections |
| `src/content/pages/about.md` | About page content migrated from Hugo | VERIFIED | title: "About"; no {{< shortcodes; Hugo "background" frontmatter removed; direct URLs replace shortcodes |
| `scripts/bib_to_yaml.mjs` | Node.js BibTeX-to-YAML converter | VERIFIED | @retorquere/bibtex-parser; js-yaml; cleanLatex(); JOURNAL_MAP with ApJ, MNRAS, ApJS; role assignment; writes to src/data/publications.yaml |
| `src/pages/index.astro` | Homepage with construction message | VERIFIED | Imports BaseLayout; "Site Under Construction" message; text-primary class |
| `src/pages/about.astro` | About page using content collection | VERIFIED | getCollection("pages"); render() from astro:content; falls back to "Content coming soon." |
| `src/pages/404.astro` | Error page with UI-SPEC copy | VERIFIED | "Page Not Found" heading; "Return to the homepage to continue" text; link to / |
| `netlify.toml` | Netlify build configuration for Astro | VERIFIED | command = "npm run build"; publish = "dist"; NODE_VERSION = "24"; no hugo |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `astro.config.mjs` | `@tailwindcss/vite` | vite plugins array | VERIFIED | `tailwindcss()` in vite.plugins array confirmed |
| `src/layouts/BaseLayout.astro` | `src/styles/global.css` | CSS import | VERIFIED | `import "../styles/global.css"` in frontmatter |
| `src/layouts/BaseLayout.astro` | `src/components/ThemeScript.astro` | component import in head | VERIFIED | ThemeScript imported and rendered in `<head>` |
| `src/layouts/BaseLayout.astro` | `src/components/Navigation.astro` | component import before main | VERIFIED | Navigation imported and rendered before `<main>` |
| `src/components/Navigation.astro` | `src/islands/DarkModeToggle.tsx` | React island with client:load | VERIFIED | `<DarkModeToggle client:load />` appears twice (desktop + mobile) |
| `src/islands/DarkModeToggle.tsx` | `localStorage` | setItem/getItem | VERIFIED | localStorage.setItem("theme", next) in toggle() |
| `src/content.config.ts` | `src/data/publications.yaml` | file() loader path | VERIFIED | `file("src/data/publications.yaml")` |
| `src/content.config.ts` | `src/content/pages/` | glob() loader pattern | VERIFIED | `glob({ pattern: "**/*.md", base: "./src/content/pages" })` |
| `src/pages/about.astro` | `src/content/pages/about.md` | getCollection('pages') | VERIFIED | `getCollection("pages")` + `render(aboutPage)` with Astro 6.x API |
| `netlify.toml` | `dist/` | publish directory | VERIFIED | `publish = "dist"` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `src/pages/about.astro` | `Content` | `getCollection("pages")` + `render()` | Yes — reads from src/content/pages/about.md via Astro Content Layer | FLOWING |
| `src/islands/DarkModeToggle.tsx` | `theme` state | localStorage + documentElement.classList | Yes — reads DOM class state set by ThemeScript on load | FLOWING |
| `src/components/Navigation.astro` | `currentPath` | `Astro.url.pathname` | Yes — server-side URL prop at build/SSR time | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Astro build produces all 7 HTML pages | `npm run build && ls dist/` | All 7 pages present: index.html, about/, research/, software/, arxiv-app/, contact/, 404.html | PASS |
| `bib:convert` script runs without error | `node scripts/bib_to_yaml.mjs` | "Converted 11 publications... First-author: 5, Co-author: 6" | PASS |
| Publications YAML has correct entry count | `grep -c "^- id:" src/data/publications.yaml` | 11 | PASS |
| No Hugo shortcodes in migrated content | `grep -c "{{<" src/content/pages/*.md` | 0 in all 4 files | PASS |
| DarkModeToggle hydrated in built HTML | Inspect dist/index.html for astro-island | `<astro-island ... component-url="/_astro/DarkModeToggle..." client="load">` present | PASS |
| Dark mode toggle interactive behavior | Requires browser | Cannot verify without running server | SKIP (human needed) |
| Mobile hamburger responsive behavior | Requires browser at <768px | Cannot verify without browser | SKIP (human needed) |
| Page load under 2 seconds | Requires browser Lighthouse | Cannot verify from static files | SKIP (human needed) |

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|-------------|---------------|-------------|--------|----------|
| FRMK-01 | 01-01, 01-04 | Site rebuilt on Astro 5.x with islands architecture, deployed on Netlify | SATISFIED | Astro 6.x (compatible), React islands (DarkModeToggle client:load), @astrojs/netlify adapter, build succeeds |
| FRMK-02 | 01-03 | Existing Hugo content migrated to Astro Content Collections | SATISFIED | 11 publications in src/data/publications.yaml with file() loader; 4 Markdown pages in src/content/pages/ with glob() loader; both validated at build time |
| FRMK-03 | 01-01 | Tailwind CSS v4 design system with professional aesthetic | SATISFIED | @theme inline in global.css; dark space theme (#0a0e1a, #d4a54a gold) + light academic theme (#ffffff, #b8860b); Inter Variable font; shadcn/ui components |
| FRMK-04 | 01-02 | Dark mode toggle that persists user preference | NEEDS HUMAN | Code verified: DarkModeToggle + ThemeScript + localStorage wiring all present. Functional persistence (toggle works, survives refresh) requires browser testing |
| FRMK-05 | 01-02, 01-04 | Responsive mobile-first layout verified on phone, tablet, desktop | NEEDS HUMAN | Code verified: md: breakpoints in Navigation.astro, max-w-[700px] prose area, hamburger menu at <768px. Visual responsive behavior requires browser testing |
| FRMK-06 | 01-01, 01-04 | Page load under 2 seconds on first visit | NEEDS HUMAN | Static HTML is 15KB, CSS is 27KB, Inter Variable font files included. Actual page load timing requires browser measurement (Lighthouse or DevTools) |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| src/pages/research.astro | 6 | "Site Under Construction" placeholder content | Info | Intentional per plan — placeholder pages for future phases |
| src/pages/software.astro | - | "Site Under Construction" placeholder | Info | Intentional per plan |
| src/pages/arxiv-app.astro | - | "Site Under Construction" placeholder | Info | Intentional per plan |
| src/pages/contact.astro | - | "Site Under Construction" placeholder | Info | Intentional per plan |

No blocking anti-patterns found. All placeholder pages are documented as intentional in 01-04-SUMMARY.md ("Known Stubs" section). These pages route correctly and display UI-SPEC construction copy.

### Human Verification Required

#### 1. Dark Mode Toggle + Theme Persistence (FRMK-04)

**Test:** Start dev server with `npm run dev`, open http://localhost:4321. Click the sun/moon icon in the navigation bar.
**Expected:** Theme switches from dark (navy background) to light (white background). Refresh the page — light mode persists. Click toggle again — dark mode restores and persists on refresh.
**Why human:** CSS class toggling on `<html>` element, localStorage read/write, and visual theme transitions cannot be verified from static HTML files.

#### 2. Mobile Hamburger Menu (FRMK-05)

**Test:** With dev server running, resize browser to below 768px width (or use DevTools mobile emulation). Observe navigation bar.
**Expected:** Desktop nav links collapse and a hamburger icon appears. Clicking hamburger reveals vertical list of all 6 nav links plus the dark mode toggle.
**Why human:** CSS responsive breakpoints and JavaScript-toggled visibility require a rendered browser environment.

#### 3. Full Responsive Layout Verification (FRMK-05)

**Test:** Visit all 6 page routes (/, /research, /software, /arxiv-app, /about, /contact) at three viewport widths: 375px (mobile), 768px (tablet), 1280px (desktop).
**Expected:** Layout is usable at all breakpoints. Content stays within 700px max-width on desktop. Nav switches between hamburger and horizontal at 768px.
**Why human:** Cross-breakpoint responsive behavior requires browser rendering.

#### 4. Page Load Performance (FRMK-06)

**Test:** Run `npx lighthouse http://localhost:4321 --only-categories=performance --output=json | grep '"score"' | head -3` (after starting dev server), or use Chrome DevTools Network tab to measure Time to First Contentful Paint.
**Expected:** Performance score >= 0.9 or FCP < 2 seconds on simulated fast 3G.
**Why human:** Performance timing is a runtime measurement requiring browser execution.

### Gaps Summary

No blocking gaps found. All code artifacts are substantive, wired, and verified to exist. The two items requiring human testing (FRMK-04 dark mode persistence, FRMK-05/FRMK-06 responsive layout and performance) are behavioral confirmations of working code — not missing implementations.

**Notable deviation documented in SUMMARYs:** Plan 01-03 specified 12 publications (5 first-author + 7 co-author), but actual source YAML had 11 entries (5 first-author + 6 co-author). The SUMMARY correctly documents this as a data correction and the implementation uses the actual source count. This is not a gap.

**Task 2 of Plan 04 (checkpoint:human-verify)** is explicitly marked PENDING in 01-04-SUMMARY.md. The human verification items above fulfill and expand on that checkpoint's requirements.

---

_Verified: 2026-04-12T14:40:00Z_
_Verifier: Claude (gsd-verifier)_
