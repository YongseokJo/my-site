---
phase: 04-backend-infrastructure-auth
plan: 01
subsystem: database-schema-rls
tags: [supabase, postgresql, rls, migrations, database-schema]
dependency_graph:
  requires: []
  provides: [profiles-table, issues-table, proposals-table, rls-policies, security-definer-functions]
  affects: [04-02, 04-03, phase-05]
tech_stack:
  added: [supabase-migrations]
  patterns: [security-definer-rls, auto-profile-trigger, four-tier-roles]
key_files:
  created:
    - supabase/migrations/00001_profiles.sql
    - supabase/migrations/00002_issues.sql
    - supabase/migrations/00003_proposals.sql
    - supabase/migrations/00004_rls_policies.sql
    - .env.example
  modified:
    - .gitignore
decisions:
  - Used SECURITY DEFINER functions for all role lookups in RLS policies to prevent circular dependency
  - Viewers restricted to approved proposals only (matching academic review workflow)
  - Added .env.example negation in .gitignore since .env.* pattern was blocking it
metrics:
  duration: 133s
  completed: 2026-04-13T04:18:41Z
  tasks_completed: 2
  tasks_total: 3
  status: checkpoint-pending
---

# Phase 4 Plan 01: DB Schema + RLS Summary

Supabase database schema with three tables (profiles, issues, proposals) and 11 RLS policies enforcing four-tier role system via SECURITY DEFINER functions, plus .env.example template.

## What Was Done

### Task 1: Create database schema migration files
- **Commit:** 7d40c65
- Created `supabase/migrations/00001_profiles.sql` -- profiles table extending auth.users with role (admin/pi_mentor/developer/viewer), approved boolean, display_name; auto-create trigger on signup; updated_at trigger
- Created `supabase/migrations/00002_issues.sql` -- issues table with status/priority CHECK constraints, reporter/assignee FK to profiles
- Created `supabase/migrations/00003_proposals.sql` -- proposals table with academic fields (pi, scientific_mentor, position, basic_profile), submitter FK
- Created `.env.example` with PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY placeholders
- Updated `.gitignore` to allow `.env.example` (negation pattern `!.env.example` added after `.env.*`)
- All three tables have RLS enabled and updated_at triggers

### Task 2: Create RLS policies with security definer functions
- **Commit:** 33010dc
- Created `supabase/migrations/00004_rls_policies.sql` with:
  - `get_user_role()` SECURITY DEFINER function -- returns role from profiles without triggering RLS
  - `is_approved()` SECURITY DEFINER function -- returns approval status with COALESCE fallback to FALSE
  - 4 profiles policies (self-read, admin-read-all, self-update, admin-update-all)
  - 4 issues policies (approved-read, developer-create, admin-update, reporter-update-own)
  - 3 proposals policies (approved-read with viewer restriction, developer-submit, pi/admin-update)
- No direct SELECT on profiles in any RLS policy -- all go through security definer functions
- All data-access policies include `is_approved()` check (T-04-01 mitigated)
- INSERT policies enforce `reporter = auth.uid()` / `submitter = auth.uid()` (T-04-05 mitigated)

### Task 0: Supabase project creation (PENDING -- checkpoint)
- User must create Supabase project and provide credentials before migrations can be applied
- .env.example template is ready; user needs to create .env with real values

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] .gitignore pattern blocking .env.example**
- **Found during:** Task 1
- **Issue:** `.env.*` pattern in .gitignore prevented committing .env.example
- **Fix:** Added `!.env.example` negation pattern after `.env.*` line
- **Files modified:** .gitignore
- **Commit:** 7d40c65

## Decisions Made

1. **SECURITY DEFINER for all role lookups** -- Every RLS policy that needs to check role or approval status uses `get_user_role()` or `is_approved()` functions rather than direct profile table queries, preventing circular RLS infinite recursion (T-04-03).
2. **Viewers see approved proposals only** -- Per Research open question #2, viewer role restricted to `status = 'approved'` proposals only, matching academic review workflow where proposals are privately reviewed.
3. **COALESCE FALSE in is_approved()** -- If no profile row exists (edge case), `is_approved()` returns FALSE rather than NULL, ensuring fail-closed behavior.

## Verification Results

- All 4 SQL migration files exist in supabase/migrations/
- Schema matches D-01, D-02, D-03 (all fields present)
- RLS enabled on all 3 tables (ALTER TABLE ... ENABLE ROW LEVEL SECURITY)
- 2 security definer functions (get_user_role, is_approved)
- 11 CREATE POLICY statements across profiles, issues, proposals
- .env.example contains both Supabase env vars
- No direct profile queries in any RLS policy

## Self-Check: PASSED

- All 5 created files found on disk
- Both task commits (7d40c65, 33010dc) found in git log
