---
phase: 2
slug: academic-content
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-12
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | npm run build (Astro build validation) — no unit test framework |
| **Config file** | astro.config.mjs |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npx astro check` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npx astro check`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 02-01 | 1 | PROF-01 | — | N/A | build+grep | `npm run build && grep -l 'HomeLayout' src/layouts/HomeLayout.astro` | ✅ | ⬜ pending |
| 02-01-02 | 02-01 | 1 | PROF-01 | — | N/A | build+grep | `npm run build && grep 'First Star Clusters' dist/index.html` | ✅ | ⬜ pending |
| 02-02-01 | 02-02 | 2 | PUBL-01-04 | — | N/A | build+grep | `npm run build && grep -c 'publication' src/islands/PublicationList.tsx` | ✅ | ⬜ pending |
| 02-02-02 | 02-02 | 2 | PROF-05, PUBL-01 | — | N/A | build+grep | `npm run build && grep 'Publications' src/components/Navigation.astro` | ✅ | ⬜ pending |
| 02-03-01 | 02-03 | 2 | RSRCH-01-02 | — | N/A | build+grep | `npm run build && grep -l 'ResearchProjects' src/islands/ResearchProjects.tsx` | ✅ | ⬜ pending |
| 02-03-02 | 02-03 | 2 | RSRCH-03 | — | N/A | build+grep | `npm run build && grep 'research' dist/research/index.html` | ✅ | ⬜ pending |
| 02-04-01 | 02-04 | 2 | PROF-02-03 | — | N/A | build+grep | `npm run build && grep 'cv.pdf' dist/about/index.html` | ✅ | ⬜ pending |
| 02-04-02 | 02-04 | 2 | PROF-04 | T-02-01 | HTML form validation | build+grep | `npm run build && grep 'data-netlify' dist/contact/index.html` | ✅ | ⬜ pending |
| 02-04-03 | 02-04 | 2 | PROF-02 | — | N/A | build+grep | `npm run build && grep 'education' src/data/education.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. All validation is build-based (`npm run build`) and manual browser testing. No additional test framework needed for this content-focused phase.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Publication filter chips toggle correctly | PUBL-02 | Client-side React interaction | Click filter chips, verify list updates |
| Author "Jo, Yongseok" highlighted in cards | PUBL-03 | Visual styling verification | Check each publication card for bold author name |
| External paper links (DOI, arXiv, ADS) work | PUBL-04 | External URL validation | Click each link type, verify opens correct source |
| Research project cards expand in place | RSRCH-02 | Client-side React interaction | Click each project card, verify expanded content |
| Contact form submits via Netlify | PROF-04 | Requires deployed Netlify environment | Submit test message on deploy preview |
| Academic profile links functional | PROF-03 | External URL validation | Click Google Scholar, ORCID, GitHub, LinkedIn links |
| Homepage hero cosmic visual renders | PROF-01 | Visual design verification | Verify hero background image and text overlay |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-12
