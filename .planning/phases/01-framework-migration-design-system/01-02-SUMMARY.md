---
phase: 01-framework-migration-design-system
plan: 02
subsystem: layout-shell
tags: [navigation, footer, dark-mode, theme, layout, astro-islands]
dependency_graph:
  requires: [01-01]
  provides: [navigation-component, footer-component, dark-mode-toggle, theme-persistence, layout-shell]
  affects: [all-pages]
tech_stack:
  added: [lucide-react]
  patterns: [astro-islands, client:load-hydration, is:inline-script, localStorage-persistence]
key_files:
  created:
    - src/components/Navigation.astro
    - src/components/Footer.astro
    - src/components/ThemeScript.astro
    - src/islands/DarkModeToggle.tsx
  modified:
    - src/layouts/BaseLayout.astro
    - package.json
decisions:
  - Used inline SVG paths for social icons rather than referencing static SVG files for better styling control
  - Used script-based mobile menu toggle instead of CSS-only details/checkbox hack for cleaner UX
  - DarkModeToggle imported directly in Navigation.astro with client:load instead of slot pattern
metrics:
  duration: 35m
  completed: 2026-04-12
---

# Phase 01 Plan 02: Layout Shell Components Summary

Navigation bar with brand text, 6 responsive nav links, mobile hamburger menu, dark mode toggle island with localStorage persistence, and footer with 4 accessible social icon links -- all wired into BaseLayout.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Build Navigation and Footer components | 2d8be3d | Navigation.astro, Footer.astro |
| 2 | Build DarkModeToggle island, ThemeScript, wire into BaseLayout | 3248fd8 | DarkModeToggle.tsx, ThemeScript.astro, BaseLayout.astro |

## Implementation Details

### Navigation (Navigation.astro)
- Brand text "Yongseok Jo" at font-weight 700 bold
- 6 nav links: Home, Research, Software, ArXiv App, About, Contact
- Desktop (>= 768px): horizontal bar with brand left, links right, DarkModeToggle far right
- Mobile (< 768px): brand left, hamburger right; toggles full-width dropdown with vertical links
- Active page detection via `Astro.url.pathname` with accent bottom border indicator
- Hover state: `hover:bg-muted` with 150ms transition
- 48px minimum touch targets on all interactive elements
- Sticky top positioning with z-50

### Footer (Footer.astro)
- Copyright: "(c) 2026 Yongseok Jo. All rights reserved."
- 4 social icon links: Google Scholar, ORCID, GitHub, LinkedIn
- Inline SVG icons at 24x24 with `fill="currentColor"` for theme compatibility
- All links: `target="_blank" rel="noopener noreferrer"` (T-01-05 mitigation)
- All links: `aria-label` matching service name for accessibility
- Icon hover: opacity 0.6 to 1.0, 150ms transition

### ThemeScript (ThemeScript.astro)
- `is:inline` script runs synchronously in `<head>` before paint
- Reads `localStorage.theme` first, falls back to `prefers-color-scheme` media query
- Toggles `dark`/`light` classes on `<html>` element

### DarkModeToggle (DarkModeToggle.tsx)
- React island hydrated via `client:load` in Navigation
- Sun icon in dark mode, Moon icon in light mode
- Persists theme preference to `localStorage` key "theme"
- Uses shadcn Button (ghost variant, icon size) with 48px touch target (h-12 w-12)
- `aria-label="Toggle dark mode"` for accessibility

### BaseLayout (BaseLayout.astro)
- Updated to import and render: ThemeScript (in head), Navigation (before main), Footer (after main)
- Maintains existing structure: BaseHead, global.css import, slot for page content

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Mobile menu uses script instead of CSS-only approach**
- **Found during:** Task 1
- **Issue:** Plan suggested `<details>` element or checkbox hack for CSS-only mobile menu, but these approaches have accessibility limitations (no proper aria-expanded state) and inconsistent cross-browser behavior
- **Fix:** Used a small inline script with proper aria-expanded toggling and hamburger/close icon switching
- **Files modified:** src/components/Navigation.astro

**2. [Rule 3 - Blocking] npm dependencies not installed in worktree**
- **Found during:** Task 1 verification
- **Issue:** `npm run build` failed because node_modules were not present in the worktree
- **Fix:** Ran `npm install` before build verification
- **Files modified:** none (node_modules is gitignored)

## Threat Flags

None found. All external links use `rel="noopener noreferrer"` as required by T-01-05.

## Known Stubs

None. All components are fully functional with real data and working interactions.

## Self-Check: PASSED

All 5 created/modified files verified on disk. Both task commits (2d8be3d, 3248fd8) verified in git log.
