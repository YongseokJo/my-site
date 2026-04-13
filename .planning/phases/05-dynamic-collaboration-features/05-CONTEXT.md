# Phase 5: Dynamic Collaboration Features - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the authenticated UI for Enzo-Abyss collaboration: login/signup pages, issue reporting form and list, project proposal submission with academic fields, developer dashboard with role-specific views, and admin user approval. All backed by Supabase auth and database from Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Login/Signup UI
- **D-01:** Dedicated pages at /login and /signup (not modals)
- **D-02:** Login/signup link only on the /software (Enzo-Abyss) page — not in the main nav bar
- **D-03:** When logged in, show user icon/name on the Enzo-Abyss page instead of login link
- **D-04:** After signup, show message about email verification + pending admin approval

### Issue Reporting
- **D-05:** Issue form visible at /software/issues — requires login to submit
- **D-06:** Issue list also requires authentication (not public)
- **D-07:** Issue form fields: title, description, priority (low/medium/high/critical) — from Phase 4 schema
- **D-08:** Submitted issues appear in the list with status, priority, and assignee

### Proposal Submission
- **D-09:** Single page form (not multi-step wizard) — all fields on one scrollable page
- **D-10:** Fields: title, description, rationale, PI, scientific mentor, position, basic profile — from Phase 4 schema
- **D-11:** PI/Mentor approval with required comment explaining approve/reject decision
- **D-12:** Proposal status visible to submitter (pending → approved/rejected with comment)

### Dashboard
- **D-13:** Role-specific views:
  - Admin: approve/reject pending users, view all issues and proposals, assign issues, change statuses
  - PI/Mentor: approve/reject proposals with required comment
  - Developer: view my submitted issues, view my proposals, submit new issues/proposals
  - Viewer: read-only list of approved proposals and open issues
- **D-14:** Admin dashboard includes user approval list (pending signups with approve/reject)
- **D-15:** Dashboard accessible at /dashboard (requires auth)

### Claude's Discretion
- Dashboard layout and component structure
- Form validation approach (React Hook Form or native)
- Issue/proposal detail page design
- Status badge colors and styling
- Pagination for lists (if needed for small user base)
- Whether to use React islands or full Astro SSR pages for dashboard

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 4 Backend
- `src/lib/supabase.ts` — Server + browser client factories
- `src/middleware.ts` — Auth session middleware (getUser pattern)
- `src/pages/api/auth/register.ts` — Signup endpoint
- `src/pages/api/auth/signin.ts` — Login endpoint
- `src/pages/api/auth/signout.ts` — Logout endpoint
- `src/pages/api/auth/callback.ts` — Email verification callback
- `supabase/migrations/00001_profiles.sql` — Profiles table schema
- `supabase/migrations/00002_issues.sql` — Issues table schema
- `supabase/migrations/00003_proposals.sql` — Proposals table schema
- `supabase/migrations/00004_rls_policies.sql` — RLS policies (role-based access)
- `.env.example` — Environment variable template

### Design System
- `src/styles/global.css` — Theme tokens
- `src/components/ui/*.tsx` — shadcn components (Card, Badge, Button, Input, Textarea, Label, Select, Dialog)
- `.planning/phases/01-framework-migration-design-system/01-UI-SPEC.md` — Base design tokens

### Existing Patterns
- `src/islands/ContactForm.tsx` — Form island pattern with validation
- `src/islands/BetaSignupForm.tsx` — Formspree form pattern
- `src/pages/software.astro` — Enzo-Abyss landing (add login link here)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- shadcn Card/Badge/Button/Input/Textarea/Label/Select/Dialog — all installed
- Supabase client factory in `src/lib/supabase.ts`
- Auth middleware in `src/middleware.ts`
- Form island pattern from ContactForm and BetaSignupForm

### Established Patterns
- React islands with `client:load` for interactive forms
- Supabase `createServerClient` / `createBrowserClient` for server/client split
- `getUser()` for secure server-side auth checks
- RLS policies enforce access at database level

### Integration Points
- `/software` page needs login/signup link for authenticated users
- New pages: /login, /signup, /dashboard, /software/issues, /software/proposals
- Auth API endpoints already handle register/signin/signout/callback
- Database tables and RLS ready for CRUD operations

</code_context>

<specifics>
## Specific Ideas

- This is the management system for academic collaborators using Enzo-Abyss simulation code
- Proposals contain academic-specific fields (PI, scientific mentor, position) — not a generic project tool
- Admin approval is a manual gate — no automated approval
- The dashboard is the central hub for logged-in collaborators
- Keep UI consistent with the rest of the site (deep space theme, spacious layout, shadcn components)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-dynamic-collaboration-features*
*Context gathered: 2026-04-13*
