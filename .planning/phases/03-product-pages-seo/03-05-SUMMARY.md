---
phase: 03-product-pages-seo
plan: 05
subsystem: seo, search
tags: [schema.org, json-ld, pagefind, search, scholarly-article, structured-data]

# Dependency graph
requires:
  - phase: 03-01
    provides: "SEOHead component, shadcn Dialog, astro-pagefind integration"
  - phase: 03-02
    provides: "Enzo-Abyss pages (indexed by Pagefind)"
  - phase: 03-03
    provides: "Readea pages (indexed by Pagefind)"
  - phase: 03-04
    provides: "Readea forms pages (indexed by Pagefind)"
provides:
  - "SchemaOrgPublication component generating ScholarlyArticle JSON-LD"
  - "Pagefind search UI with SearchToggle and SearchDialog islands"
  - "Cmd+K / Ctrl+K keyboard shortcut for site-wide search"
  - "Publications page with structured data for all 11 publications"
affects: [seo, navigation, publications]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dynamic Pagefind import using variable path to avoid Rollup resolution"
    - "JSON-LD script tags in page body (valid per schema.org spec)"
    - "Conditional field omission in schema.org structured data"

key-files:
  created:
    - src/components/SchemaOrgPublication.astro
    - src/islands/SearchDialog.tsx
    - src/islands/SearchToggle.tsx
  modified:
    - src/pages/publications.astro
    - src/components/Navigation.astro

key-decisions:
  - "Placed JSON-LD script tags in page body rather than head (valid per Google guidelines, avoids BaseLayout head slot complexity)"
  - "Used dynamic variable for Pagefind import path to prevent Vite/Rollup build-time resolution errors"
  - "SearchDialog uses showCloseButton=false since Escape and backdrop click handle closing"

patterns-established:
  - "Schema.org JSON-LD via Astro component with conditional field omission"
  - "Pagefind lazy-loading pattern with @vite-ignore and dynamic path variable"

requirements-completed: [SEO-02, SEO-03]

# Metrics
duration: 5min
completed: 2026-04-13
---

# Phase 3 Plan 5: Schema.org + Pagefind Search Summary

**Schema.org ScholarlyArticle JSON-LD for all 11 publications and Pagefind site-wide search with custom shadcn Dialog UI accessible via nav icon and Cmd+K**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-13T01:27:06Z
- **Completed:** 2026-04-13T01:32:22Z
- **Tasks:** 2 of 2 auto tasks complete (1 checkpoint pending)
- **Files modified:** 5

## Accomplishments
- SchemaOrgPublication component generates ScholarlyArticle JSON-LD for each of 11 publications with conditional field omission (no empty url/publisher)
- Pagefind search dialog with lazy-loaded index, debounced search, title+excerpt results with highlighted match terms
- Search accessible from navigation bar icon and Cmd+K/Ctrl+K keyboard shortcut in both desktop and mobile nav
- Pagefind indexes 12 pages across the entire site

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SchemaOrgPublication component and add to publications page** - `6dc3378` (feat)
2. **Task 2: Create Pagefind search UI and add to navigation** - `22b0745` (feat)
3. **Task 3: Verify search and schema.org** - checkpoint:human-verify (pending)

## Files Created/Modified
- `src/components/SchemaOrgPublication.astro` - Generates ScholarlyArticle JSON-LD per publication with conditional field omission
- `src/islands/SearchDialog.tsx` - Custom Pagefind search modal using shadcn Dialog with lazy-loaded index
- `src/islands/SearchToggle.tsx` - Search icon button with Cmd+K/Ctrl+K keyboard shortcut
- `src/pages/publications.astro` - Updated to render SchemaOrgPublication for each publication
- `src/components/Navigation.astro` - Added SearchToggle in desktop and mobile nav sections

## Decisions Made
- Placed JSON-LD script tags in page body rather than head — valid per Google guidelines and schema.org spec, avoids needing to modify BaseLayout head slot mechanism
- Used dynamic variable path for Pagefind import to prevent Vite/Rollup from trying to resolve `/pagefind/pagefind.js` at build time (it only exists after build)
- Set `showCloseButton={false}` on SearchDialog since Escape key and backdrop click already handle closing per shadcn Dialog behavior

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed Pagefind import causing Rollup build failure**
- **Found during:** Task 2 (Search UI creation)
- **Issue:** Direct `import("/pagefind/pagefind.js")` caused Rollup to fail resolving the path at build time since Pagefind JS only exists after the build completes
- **Fix:** Assigned path to a variable and used `/* @vite-ignore */` comment with the variable import to prevent static analysis
- **Files modified:** src/islands/SearchDialog.tsx
- **Verification:** `npm run build` succeeds, Pagefind indexes 12 pages
- **Committed in:** 22b0745 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Standard workaround for Pagefind + Vite integration. No scope creep.

## Issues Encountered
None beyond the Pagefind import resolution documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All Phase 3 product pages and SEO infrastructure complete after human verification
- Site has structured data for publications and full-text search across all 12 pages
- Pagefind index regenerates automatically on each build

## Self-Check: PASSED

All files verified present. All commits verified in git log. All acceptance criteria confirmed.

---
*Phase: 03-product-pages-seo*
*Completed: 2026-04-13*
