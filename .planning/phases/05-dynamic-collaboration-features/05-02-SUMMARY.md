---
phase: 05-dynamic-collaboration-features
plan: 02
subsystem: collaboration-forms
tags: [issues, proposals, forms, supabase, islands, auth-guard]
dependency_graph:
  requires: [05-01]
  provides: [issue-reporting, proposal-submission]
  affects: [software-pages]
tech_stack:
  added: []
  patterns: [CustomEvent-island-communication, browser-client-supabase-crud, auth-guard-astro-page]
key_files:
  created:
    - src/islands/IssueForm.tsx
    - src/islands/IssueList.tsx
    - src/islands/ProposalForm.tsx
    - src/islands/ProposalList.tsx
    - src/pages/software/issues.astro
    - src/pages/software/proposals.astro
  modified: []
decisions:
  - Used CustomEvent pattern for cross-island communication instead of parent wrapper island
  - Used simple select query without foreign key joins for issue list (safer fallback per plan guidance)
  - Single-page scrollable form for proposals (not multi-step wizard)
metrics:
  duration: ~4 minutes
  completed: 2026-04-13T17:35:52Z
  tasks_completed: 2
  tasks_total: 2
---

# Phase 05 Plan 02: Issue Reporting + Proposal Submission Summary

Issue and proposal CRUD pages with auth-guarded Astro pages, Supabase browser client inserts/selects, and cross-island CustomEvent refresh pattern.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Issue reporting page with form and list | bedba77 | IssueForm.tsx, IssueList.tsx, issues.astro |
| 2 | Proposal submission page with form and list | 2c223f2 | ProposalForm.tsx, ProposalList.tsx, proposals.astro |

## Implementation Details

### Task 1: Issue Reporting

- **IssueForm** follows ContactForm validation pattern with title (min 5 chars), description (min 10 chars), and priority (Select component with low/medium/high/critical)
- **IssueList** fetches issues via browser client, displays in Card components with status and priority Badge variants
- **issues.astro** has auth guard (redirect to /login if unauthenticated, /pending-approval if unapproved), form hidden for viewer role
- Islands communicate via `window.dispatchEvent(new CustomEvent("issue-created"))` pattern

### Task 2: Proposal Submission

- **ProposalForm** is a single-page scrollable form with two sections: "Project Details" (title, description, rationale) and "Academic Context" (pi, scientific_mentor, position, basic_profile)
- **ProposalList** shows proposals with status badges (pending=secondary, approved=default, rejected=destructive) and review_comment in styled blockquote when available
- **proposals.astro** follows same auth guard pattern, passes userId to ProposalList for "yours" indicator
- Form includes all 7 required fields with validation

## Decisions Made

1. **CustomEvent for island communication**: Rather than wrapping both form and list in a single parent island, used browser CustomEvent dispatch/listen pattern. This keeps islands independent and follows Astro's island architecture.
2. **Simple select without joins**: Used direct field selection for IssueList instead of foreign key joins, as the plan noted FK names may differ. Can be enhanced later.
3. **Single-page proposal form**: Per plan specification D-09, used single scrollable form with section headings rather than multi-step wizard.

## Deviations from Plan

None - plan executed exactly as written.

## Threat Mitigations Applied

| Threat ID | Mitigation |
|-----------|------------|
| T-05-05 | IssueForm calls getUser() before insert; RLS enforces reporter=auth.uid() server-side |
| T-05-06 | ProposalForm calls getUser() before insert; RLS enforces submitter=auth.uid() server-side |
| T-05-07 | Issues table has CHECK constraints on status/priority; invalid values rejected by Postgres |
| T-05-08 | ProposalList relies on RLS to restrict viewer access to approved proposals only |
| T-05-09 | All user content rendered via React JSX auto-escaping; no dangerouslySetInnerHTML used |

## Verification

- `npm run build` succeeds with no errors
- All acceptance criteria patterns verified present in source files
- Auth guards redirect unauthenticated users to /login with redirect param
- Auth guards redirect unapproved users to /pending-approval
- Viewer role cannot see forms (conditional rendering in .astro template)
