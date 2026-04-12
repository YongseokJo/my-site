---
phase: 1
slug: framework-migration-design-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-12
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (to be installed in Wave 0) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run && npx astro check && npx astro build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run && npx astro check && npx astro build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| (populated by planner) | | | | | | | | | |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Install vitest + @astrojs/check as dev dependencies
- [ ] Create vitest.config.ts with Astro integration
- [ ] Verify `npx astro build` succeeds with base Astro project

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark mode toggle persists preference | FRMK-04 | Requires browser localStorage interaction | Toggle dark mode, refresh page, verify mode persists |
| Responsive layout on mobile/tablet/desktop | FRMK-05 | Requires visual verification across viewports | Check layout at 375px, 768px, and 1440px widths |
| Page load under 2 seconds | FRMK-06 | Requires network timing measurement | Run Lighthouse audit or check DevTools Network tab |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
