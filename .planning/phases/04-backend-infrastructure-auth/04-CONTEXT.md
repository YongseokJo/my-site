# Phase 4: Backend Infrastructure & Auth - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up Supabase (free tier) backend with database schema for users/issues/proposals/feedback, email/password authentication with email verification and admin approval, Row-Level Security policies, and a GitHub Actions keep-alive cron. No UI — this is pure infrastructure for Phase 5's dynamic features.

</domain>

<decisions>
## Implementation Decisions

### Database Schema
- **D-01:** Issues table: title, description, status (open/in-progress/closed), priority (low/medium/high/critical), reporter (FK to users), assignee (FK to users), created_at, updated_at
- **D-02:** Proposals table: title, description, status (pending/approved/rejected), rationale, PI (principal investigator), scientific_mentor, position, basic_profile, submitter (FK to users), created_at, updated_at
- **D-03:** Users table (extends Supabase auth.users): display_name, role (admin/pi_mentor/developer/viewer), approved (boolean), profile fields
- **D-04:** Four-tier role system: Admin (full access, manages everything), PI/Mentor (can approve proposals), Developer (submit issues, view proposals), Viewer (read-only)
- **D-05:** Feedback table already exists via Formspree (Phase 3) — no Supabase table needed for general feedback

### Auth Flow
- **D-06:** Open signup with admin approval — anyone can create account with email/password, but account is inactive until admin approves
- **D-07:** Email verification required on signup (Supabase built-in)
- **D-08:** Flow: signup → email verification → account pending approval → admin approves → account active
- **D-09:** Session handling via Supabase Auth with httpOnly cookies (SSR-compatible)

### Security
- **D-10:** Row-Level Security (RLS) on all tables — users can only access data their role permits
- **D-11:** Admin can see/edit all data; PI/Mentors can approve proposals; Developers can submit/view issues and proposals; Viewers can only read

### Keep-Alive
- **D-12:** GitHub Actions cron job pinging Supabase every 5 days to prevent 7-day inactivity pause
- **D-13:** Simple HTTP request to Supabase REST API endpoint as the ping

### Claude's Discretion
- Exact SQL schema DDL and RLS policy definitions
- Supabase project configuration details
- Astro middleware implementation for session handling
- GitHub Actions workflow YAML specifics
- Whether to use Supabase Edge Functions for any server-side logic

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Research
- `.planning/research/STACK.md` — Supabase recommendation with free tier limits
- `.planning/research/ARCHITECTURE.md` — Hybrid architecture, RLS as authorization pattern
- `.planning/research/PITFALLS.md` — Supabase free-tier pause, auth complexity warnings

### Existing Codebase
- `astro.config.mjs` — Current Astro config (may need SSR/hybrid output mode)
- `src/layouts/BaseLayout.astro` — Layout that may need auth state awareness
- `src/components/Navigation.astro` — Nav may need login/logout links in Phase 5

### Requirements
- `.planning/REQUIREMENTS.md` — INFRA-01 to INFRA-04

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Astro SSR via `@astrojs/netlify` adapter already configured
- React islands pattern established (can be used for login/signup forms in Phase 5)

### Established Patterns
- Forms use React islands with `client:load`
- Formspree pattern for external API submission (similar pattern for Supabase)
- SEOHead component on all pages

### Integration Points
- `astro.config.mjs` — may need `output: "hybrid"` for SSR auth routes
- Supabase client library needs to be installed and configured
- Environment variables for Supabase URL and anon key

</code_context>

<specifics>
## Specific Ideas

- Proposals need academic-specific fields: PI, scientific mentor, position, basic profile — this is for a research collaboration management system
- Four-tier roles reflect academic hierarchy: Admin (you) > PI/Mentor > Developer > Viewer
- Open signup with approval prevents spam while keeping access easy for legitimate collaborators
- Keep-alive via GitHub Actions is simpler than Netlify scheduled functions and doesn't consume Netlify build minutes

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-backend-infrastructure-auth*
*Context gathered: 2026-04-13*
