---
phase: 01-framework-migration-design-system
plan: "03"
subsystem: content-migration
tags: [content-collections, publications, yaml, bibtex, markdown, node-scripts]
dependency_graph:
  requires: ["01-01"]
  provides: ["publications-collection", "pages-collection", "bib-convert-script"]
  affects: ["src/data/publications.yaml", "src/content.config.ts", "src/content/pages/", "scripts/bib_to_yaml.mjs"]
tech_stack:
  added: ["@retorquere/bibtex-parser", "js-yaml"]
  patterns: ["Astro Content Layer API", "file() loader for YAML", "glob() loader for Markdown"]
key_files:
  created:
    - src/data/publications.yaml
    - src/content.config.ts
    - src/content/pages/about.md
    - src/content/pages/contact.md
    - src/content/pages/projects.md
    - src/content/pages/publications.md
    - scripts/bib_to_yaml.mjs
  modified:
    - package.json
decisions:
  - "Used actual source data count (11 publications: 5 first-author + 6 co-author) instead of plan estimate of 12"
  - "Script generates IDs from actual title content rather than hand-picked keywords"
  - "Script-generated YAML replaces manually-created version with richer data (arXiv URLs, proper Unicode accents)"
metrics:
  duration_seconds: 4839
  completed: "2026-04-12T16:40:17Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 7
  files_modified: 1
---

# Phase 01 Plan 03: Content Migration and BibTeX Pipeline Summary

Merged all publication data into a single Astro Content Collection with type-safe schema validation, migrated 4 Hugo Markdown pages with shortcode removal, and rewrote the BibTeX-to-YAML pipeline from Python to Node.js with LaTeX accent handling and arXiv URL extraction.

## Task Results

### Task 1: Merge publications YAML and define Content Collections

| Item | Status |
|------|--------|
| Commit | 850e356 |
| Files | src/data/publications.yaml, src/content.config.ts, src/content/pages/*.md |

- Merged 11 publications (5 first-author + 6 co-author) from data/first_pub.yaml and data/co_pub.yaml into src/data/publications.yaml
- Each entry has id, title, authors, venue, year, date, role, and links fields
- Sorted by date descending (2025 to 2019)
- Venue names normalized to standard abbreviations (ApJ, MNRAS, ApJS)
- Created src/content.config.ts at src/ root (not src/content/) with file() loader for publications and glob() loader for pages
- Migrated 4 Markdown pages: about, contact, projects, publications
- Replaced Hugo shortcodes ({{< param "links.scholar" >}} and {{< param "links.github" >}}) with direct URLs
- Removed Hugo-specific frontmatter (background field)
- Build validates successfully with Content Layer API

### Task 2: Rewrite BibTeX-to-YAML pipeline in Node.js

| Item | Status |
|------|--------|
| Commit | 724b605 |
| Files | scripts/bib_to_yaml.mjs, package.json, src/data/publications.yaml |

- Created scripts/bib_to_yaml.mjs as ESM module using @retorquere/bibtex-parser and js-yaml
- Implements cleanLatex() with full LaTeX accent-to-Unicode mapping
- Implements normalizeJournal() with journal macro abbreviation map
- Generates slug IDs from first-author surname + year + first significant title word
- Extracts arXiv URLs from eprint fields (improvement over manually-created YAML which had empty arxiv fields)
- Properly handles Unicode characters in author names (e.g., Angles-Alcazar -> Anglés-Alcázar)
- Added "bib:convert" npm script to package.json
- Script runs without errors and produces valid YAML that passes Content Collection schema validation
- Original Python script (scripts/bib_to_yaml.py) preserved for reference per D-17

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Data correction] Publication count is 11, not 12**
- **Found during:** Task 1
- **Issue:** Plan stated "12 publications (5 first-author + 7 co-author)" but source data contains only 11 (5 first-author + 6 co-author). The co_pub.yaml file has 6 entries, not 7.
- **Fix:** Used actual source data count of 11. All 11 entries are correctly merged.
- **Files modified:** src/data/publications.yaml

**2. [Rule 2 - Enhancement] Script-generated YAML replaced manual version**
- **Found during:** Task 2
- **Issue:** The bib_to_yaml.mjs script produces richer output than the manually-created YAML (arXiv URLs extracted from eprint fields, proper Unicode accents from LaTeX). The script output overwrites the Task 1 manual YAML.
- **Fix:** Accepted the script-generated output as authoritative since it contains strictly more information. Build still validates.
- **Files modified:** src/data/publications.yaml

**3. [Rule 1 - ID format] Generated IDs differ slightly from plan suggestions**
- **Found during:** Task 2
- **Issue:** Plan suggested IDs like "jo-2025-robustness" but the script generates from actual first significant word: "jo-2025-toward". This is correct behavior -- the script uses a consistent algorithm rather than hand-picked keywords.
- **Fix:** No fix needed. The algorithm is consistent and deterministic.

## Verification Results

- `npx astro build` exits with code 0
- src/data/publications.yaml has 11 entries with id and role fields (5 first-author, 6 co-author)
- No Hugo shortcodes ({{<) remain in migrated Markdown files
- `node scripts/bib_to_yaml.mjs` runs without errors
- package.json contains "bib:convert" script

## Self-Check: PASSED

All 7 created files verified present. Both task commits (850e356, 724b605) verified in git log.
