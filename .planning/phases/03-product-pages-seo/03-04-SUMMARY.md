---
phase: 03-product-pages-seo
plan: 04
subsystem: readea-forms
tags: [forms, formspree, beta-signup, feedback, react-islands]
dependency_graph:
  requires: [03-01]
  provides: [readea-beta-form, readea-feedback-form]
  affects: [arxiv-app-pages]
tech_stack:
  added: [formspree]
  patterns: [formspree-rest-api, react-island-forms, validation-on-blur, base-ui-select]
key_files:
  created:
    - src/islands/BetaSignupForm.tsx
    - src/islands/FeedbackForm.tsx
    - src/pages/arxiv-app/beta.astro
    - src/pages/arxiv-app/feedback.astro
  modified: []
decisions:
  - Used base-ui Select component API (value/onValueChange) matching the shadcn base-nova preset installed in Plan 01
  - Formspree placeholder IDs (YOUR_BETA_FORM_ID, YOUR_FEEDBACK_FORM_ID) for user replacement per user_setup
metrics:
  duration: 2m 45s
  completed: 2026-04-12
  tasks_completed: 2
  tasks_total: 2
  files_created: 4
  files_modified: 0
---

# Phase 03 Plan 04: Readea Beta Signup and Feedback Forms Summary

Readea beta signup and categorized feedback forms via Formspree REST API with validation-on-blur, success/error states, and shadcn base-ui Select for category dropdown.

## What Was Built

### Task 1: BetaSignupForm Island and Beta Page
- **Commit:** e2f3170
- **Files:** `src/islands/BetaSignupForm.tsx`, `src/pages/arxiv-app/beta.astro`
- Created React island with name/email fields following ContactForm.tsx pattern
- Form submits to Formspree REST endpoint (NOT Netlify Forms per D-13)
- Validation on blur: "Name is required.", "Please enter a valid email address."
- Success state: "You're on the List" with confirmation message
- Error state with retry messaging
- All fields have aria-describedby for accessibility
- Beta page at /arxiv-app/beta with Breadcrumb ("Readea > Beta Signup")

### Task 2: FeedbackForm Island and Feedback Page
- **Commit:** 21ce2b5
- **Files:** `src/islands/FeedbackForm.tsx`, `src/pages/arxiv-app/feedback.astro`
- Created React island with category/name/email/message fields
- Category selector uses shadcn Select (base-ui) with three options: Bug Report, Feature Request, General Feedback
- Form submits to Formspree REST endpoint (NOT Netlify Forms per D-13)
- Validation on blur: "Please select a category.", "Name is required.", "Please enter a valid email address.", "Message must be at least 10 characters."
- Success state: "Feedback Received" with confirmation message
- All fields have aria-describedby for accessibility
- Feedback page at /arxiv-app/feedback with Breadcrumb ("Readea > Feedback")

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing astro-pagefind dependency**
- **Found during:** Task 1 verification
- **Issue:** `npm run build` failed because `astro-pagefind` module was not installed despite being configured in `astro.config.mjs`
- **Fix:** Ran `npm install astro-pagefind` in the root project directory
- **Files modified:** node_modules (dependency installation)

## Known Stubs

| Stub | File | Line | Reason |
|------|------|------|--------|
| YOUR_BETA_FORM_ID | src/islands/BetaSignupForm.tsx | 63 | Placeholder for user-provided Formspree form ID (documented in plan user_setup) |
| YOUR_FEEDBACK_FORM_ID | src/islands/FeedbackForm.tsx | 82 | Placeholder for user-provided Formspree form ID (documented in plan user_setup) |

These stubs are intentional per the plan's `user_setup` section. The user must create Formspree forms and replace the placeholder IDs before deployment.

## Verification

- Build passes: 10 pages indexed (up from 9)
- /arxiv-app/beta renders BetaSignupForm with client:load
- /arxiv-app/feedback renders FeedbackForm with client:load
- Both forms use Formspree endpoints (formspree.io/f/)
- All validation messages match UI-SPEC copywriting contract exactly
- Both pages have breadcrumb navigation back to /arxiv-app

## Self-Check: PASSED

- All 4 created files exist on disk
- Both task commits (e2f3170, 21ce2b5) found in git log
