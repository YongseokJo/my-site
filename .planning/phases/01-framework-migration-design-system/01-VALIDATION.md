---
phase: 1
slug: framework-migration-design-system
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-12
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | npm run build (Astro build validation) — no unit test framework for Phase 1 |
| **Config file** | astro.config.mjs |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npx astro check` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npx astro check`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01-01 | 1 | FRMK-01, FRMK-03 | — | N/A | build | `npm run build 2>&1 \| tail -5` | ✅ | ⬜ pending |
| 01-01-02 | 01-01 | 1 | FRMK-03, FRMK-06 | — | N/A | build+grep | `npm run build && grep -l 'Inter' src/components/BaseHead.astro` | ✅ | ⬜ pending |
| 01-02-01 | 01-02 | 2 | FRMK-04, FRMK-05 | — | N/A | build+grep | `grep 'DarkModeToggle' src/components/Navigation.astro && npm run build` | ✅ | ⬜ pending |
| 01-02-02 | 01-02 | 2 | FRMK-04, FRMK-05 | — | N/A | build+grep | `grep -c 'ThemeScript\|Navigation\|Footer' src/layouts/BaseLayout.astro && npm run build` | ✅ | ⬜ pending |
| 01-03-01 | 01-03 | 2 | FRMK-02 | — | N/A | build+grep | `npm run build 2>&1 && grep -c 'role:' src/data/publications.yaml` | ✅ | ⬜ pending |
| 01-03-02 | 01-03 | 2 | FRMK-02 | — | N/A | script+grep | `node scripts/bib_to_yaml.mjs --help 2>&1 && grep 'bibtex' scripts/bib_to_yaml.mjs` | ✅ | ⬜ pending |
| 01-04-01 | 01-04 | 3 | FRMK-01, FRMK-05, FRMK-06 | — | N/A | build+ls | `npm run build && ls dist/index.html dist/about/index.html dist/contact/index.html` | ✅ | ⬜ pending |
| 01-04-02 | 01-04 | 3 | FRMK-05, FRMK-06 | — | N/A | manual | human checkpoint: visual verification + Lighthouse audit | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Plans use `npm run build` and `npx astro check` for validation — no additional test framework needed for Phase 1.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark mode toggle persists preference | FRMK-04 | Requires browser localStorage interaction | Toggle dark mode, refresh page, verify mode persists |
| Responsive layout on mobile/tablet/desktop | FRMK-05 | Requires visual verification across viewports | Check layout at 375px, 768px, and 1440px widths |
| Page load under 2 seconds | FRMK-06 | Requires network timing measurement | Run `npx lighthouse http://localhost:4321 --only-categories=performance --output=json \| jq '.categories.performance.score'` and verify score >= 0.9 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-12
