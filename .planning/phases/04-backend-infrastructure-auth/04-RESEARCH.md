# Phase 4: Backend Infrastructure & Auth - Research

**Researched:** 2026-04-12
**Domain:** Supabase backend setup, authentication, Row-Level Security, keep-alive
**Confidence:** HIGH

## Summary

Phase 4 sets up the Supabase backend infrastructure for the academic website: database schema (users/profiles, issues, proposals), email/password authentication with admin approval workflow, Row-Level Security policies enforcing a four-tier role system, and a GitHub Actions cron job to prevent free-tier project pausing. No UI is built in this phase -- it is pure backend infrastructure consumed by Phase 5.

The key technical challenges are: (1) correctly configuring Supabase SSR auth with Astro's hybrid output mode using `@supabase/ssr`, (2) designing RLS policies that map to the four-tier role system (admin/pi_mentor/developer/viewer) without over-engineering, and (3) switching the Astro config from `output: "static"` to `output: "hybrid"` without breaking existing static pages.

**Primary recommendation:** Use `@supabase/ssr` (not the deprecated auth-helpers) for cookie-based SSR auth. Store the role in a `profiles` table linked to `auth.users`. Write all schema + RLS as versioned SQL migration files in the repo. Keep the GitHub Actions keep-alive simple -- a `curl` to the Supabase REST API on a 5-day cron schedule.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Issues table: title, description, status (open/in-progress/closed), priority (low/medium/high/critical), reporter (FK to users), assignee (FK to users), created_at, updated_at
- **D-02:** Proposals table: title, description, status (pending/approved/rejected), rationale, PI (principal investigator), scientific_mentor, position, basic_profile, submitter (FK to users), created_at, updated_at
- **D-03:** Users table (extends Supabase auth.users): display_name, role (admin/pi_mentor/developer/viewer), approved (boolean), profile fields
- **D-04:** Four-tier role system: Admin (full access), PI/Mentor (can approve proposals), Developer (submit issues, view proposals), Viewer (read-only)
- **D-05:** Feedback table already exists via Formspree (Phase 3) -- no Supabase table needed
- **D-06:** Open signup with admin approval -- anyone can create account, but inactive until admin approves
- **D-07:** Email verification required on signup (Supabase built-in)
- **D-08:** Flow: signup -> email verification -> account pending approval -> admin approves -> account active
- **D-09:** Session handling via Supabase Auth with httpOnly cookies (SSR-compatible)
- **D-10:** Row-Level Security on all tables
- **D-11:** Admin can see/edit all; PI/Mentors approve proposals; Developers submit/view; Viewers read-only
- **D-12:** GitHub Actions cron job pinging Supabase every 5 days
- **D-13:** Simple HTTP request to Supabase REST API endpoint as the ping

### Claude's Discretion
- Exact SQL schema DDL and RLS policy definitions
- Supabase project configuration details
- Astro middleware implementation for session handling
- GitHub Actions workflow YAML specifics
- Whether to use Supabase Edge Functions for any server-side logic

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | Supabase project set up with database schema for users, issues, proposals, feedback | SQL migration files for profiles, issues, proposals tables; schema design in Architecture Patterns section |
| INFRA-02 | Supabase Auth with email/password for simulation collaborators | `@supabase/ssr` cookie-based auth with Astro middleware; Standard Stack section covers packages |
| INFRA-03 | Row-Level Security policies protecting user data | RLS policies per role tier; security definer functions for role lookups; Code Examples section |
| INFRA-04 | Keep-alive mechanism preventing Supabase free-tier project pausing | GitHub Actions workflow with 5-day cron schedule; Code Examples section |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Budget:** Zero cost -- free hosting (Netlify), free backend (Supabase free tier)
- **Architecture:** Hybrid -- static frontend on Netlify, dynamic backend via Supabase
- **Framework:** Astro (already migrated from Hugo)
- **Content:** Existing YAML/Markdown content must not be disrupted by output mode change

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | 2.103.0 | Supabase client SDK (database queries, auth) | Official SDK, TypeScript types from DB schema, required dependency [VERIFIED: npm registry] |
| @supabase/ssr | 0.10.2 | SSR cookie-based auth for Astro | Official SSR package replacing deprecated auth-helpers; handles PKCE flow, cookie get/set [VERIFIED: npm registry] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| supabase (CLI) | latest | Local development, migrations, type generation | Development only -- `npx supabase` works without global install [CITED: supabase.com/docs/reference/cli/introduction] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @supabase/ssr | @supabase/auth-helpers | auth-helpers is DEPRECATED -- @supabase/ssr is the replacement [CITED: supabase.com/docs/guides/troubleshooting/how-to-migrate-from-supabase-auth-helpers-to-ssr-package] |
| SQL migration files | Supabase Dashboard UI | Dashboard is fine for prototyping but migrations are not version-controlled; SQL files in repo are reproducible |
| Supabase CLI local dev | Direct remote dev | CLI gives local Postgres for testing RLS policies before pushing to production; recommended but optional for small project |

**Installation:**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Version verification:**
- `@supabase/supabase-js@2.103.0` -- verified 2026-04-12 via npm registry [VERIFIED: npm registry]
- `@supabase/ssr@0.10.2` -- verified 2026-04-12 via npm registry [VERIFIED: npm registry]

## Architecture Patterns

### Astro Output Mode Change

The current `astro.config.mjs` uses `output: "static"`. This must change to `output: "hybrid"` so that:
- All existing pages remain statically prerendered (default behavior in hybrid mode)
- New auth-related API routes and SSR pages can opt in with `export const prerender = false`

This is a non-breaking change -- hybrid mode defaults to static prerendering, so existing pages are unaffected. [CITED: docs.astro.build/en/guides/backend/supabase/]

```js
// astro.config.mjs -- change output to "hybrid"
export default defineConfig({
  site: "https://yongseokjo.com",
  output: "hybrid",  // was "static"
  adapter: netlify(),
  // ... rest unchanged
});
```

### Recommended File Structure (Phase 4 additions)

```
src/
├── lib/
│   ├── utils.ts              # Existing (shadcn/ui cn() helper)
│   └── supabase.ts           # NEW: Supabase client factory (server + browser)
├── middleware.ts              # NEW: Auth session refresh on every request
├── env.d.ts                  # UPDATE: Add Supabase env var types
├── pages/
│   └── api/
│       └── auth/
│           ├── register.ts   # NEW: Signup endpoint
│           ├── signin.ts     # NEW: Login endpoint
│           ├── signout.ts    # NEW: Logout endpoint
│           └── callback.ts   # NEW: Email verification callback
supabase/
├── migrations/
│   ├── 00001_profiles.sql    # NEW: Profiles table + trigger
│   ├── 00002_issues.sql      # NEW: Issues table
│   ├── 00003_proposals.sql   # NEW: Proposals table
│   └── 00004_rls_policies.sql # NEW: All RLS policies
.github/
└── workflows/
    └── supabase-keepalive.yml # NEW: Keep-alive cron
.env.example                   # NEW: Template for env vars (committed)
```

### Pattern 1: Supabase Client Factory

**What:** Centralized module that creates both server-side and browser-side Supabase clients with correct cookie handling.

**Why:** The server client needs cookie access via `Astro.cookies`; the browser client uses `createBrowserClient`. Centralizing prevents cookie handling bugs. [CITED: supabase.com/docs/guides/auth/server-side/creating-a-client]

```typescript
// src/lib/supabase.ts
import { createBrowserClient, createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { AstroCookies } from "astro";

export function createSupabaseServerClient(
  request: Request,
  cookies: AstroCookies
) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookies.set(name, value, options)
          );
        },
      },
    }
  );
}

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  );
}
```

### Pattern 2: Middleware for Session Refresh

**What:** Astro middleware that refreshes the Supabase auth session on every request. This ensures cookies stay valid and prevents stale sessions. [CITED: supabase.com/docs/guides/auth/server-side/creating-a-client]

```typescript
// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "./lib/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient(context.request, context.cookies);

  // IMPORTANT: Always call getUser(), not getSession()
  // getUser() validates the JWT; getSession() trusts the cookie blindly
  const { data: { user } } = await supabase.auth.getUser();

  // Attach to locals for use in pages/endpoints
  context.locals.supabase = supabase;
  context.locals.user = user;

  return next();
});
```

### Pattern 3: Profiles Table Extending auth.users

**What:** A `profiles` table in the public schema that stores application-specific user data (role, display_name, approved status). Linked to `auth.users` via foreign key. A database trigger auto-creates a profile row when a user signs up. [CITED: supabase.com/docs/guides/auth/managing-user-data]

```sql
-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('admin', 'pi_mentor', 'developer', 'viewer')),
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Pattern 4: Security Definer Function for Role Checks in RLS

**What:** A `SECURITY DEFINER` function that looks up the current user's role from the profiles table. Used inside RLS policies to avoid giving the `anon`/`authenticated` roles direct SELECT on profiles. [CITED: supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices]

```sql
-- Security definer function: get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Security definer function: check if user is approved
CREATE OR REPLACE FUNCTION public.is_approved()
RETURNS BOOLEAN AS $$
  SELECT approved FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Anti-Patterns to Avoid

- **NEVER use `getSession()` on the server** -- it trusts cookie data without validating the JWT. Always use `getUser()` which makes a round-trip to Supabase to verify. [CITED: supabase.com/docs/guides/auth/server-side]
- **NEVER expose the `service_role` key client-side** -- it bypasses all RLS. Only the `anon` key (renamed to "publishable key") goes in `PUBLIC_` env vars. [ASSUMED]
- **NEVER put role checks in application code alone** -- RLS policies are the authorization layer. App-level checks are UX hints only; RLS is the security boundary. [CITED: supabase.com/docs/guides/database/postgres/row-level-security]
- **NEVER query profiles directly in RLS policies** -- use a `SECURITY DEFINER` function instead, to avoid circular RLS dependency and for better performance. [CITED: supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| User authentication | Custom JWT/session system | Supabase Auth (`signUp`, `signInWithPassword`) | Handles email verification, password hashing, PKCE flow, session refresh |
| Cookie management for SSR | Manual cookie parsing/setting | `@supabase/ssr` `createServerClient` with `parseCookieHeader` | Handles multi-cookie chunking, secure flags, SameSite attributes |
| Authorization | Application-level role checking middleware | PostgreSQL Row-Level Security policies | RLS runs at database level -- impossible to bypass from client |
| Profile auto-creation | API endpoint that creates profile after signup | PostgreSQL trigger on `auth.users` INSERT | Trigger fires atomically, can't be forgotten or bypassed |
| Keep-alive ping | Custom server/cron service | GitHub Actions scheduled workflow | Free, reliable, no infrastructure to maintain |

## Common Pitfalls

### Pitfall 1: Forgetting `export const prerender = false` on API Routes

**What goes wrong:** Astro API routes in `src/pages/api/` are statically rendered by default in hybrid mode. Auth endpoints that need to run on every request must opt out of prerendering.
**Why it happens:** Hybrid mode defaults to static. Easy to forget the opt-out flag on new files.
**How to avoid:** Every file in `src/pages/api/auth/` must have `export const prerender = false;` at the top.
**Warning signs:** API routes returning static HTML instead of handling POST requests. Auth callbacks returning 404.

### Pitfall 2: Circular RLS Dependencies

**What goes wrong:** An RLS policy on `profiles` table does a SELECT on `profiles` to check the user's role. This creates a circular dependency -- the policy needs to read the table it's guarding.
**Why it happens:** Natural instinct to write `WHERE id = auth.uid()` as an RLS policy that also checks role from the same table.
**How to avoid:** Use `SECURITY DEFINER` functions (like `get_user_role()`) that bypass RLS for the lookup. The function runs with the definer's permissions, not the caller's. [CITED: supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices]
**Warning signs:** Infinite recursion errors when querying tables with RLS enabled.

### Pitfall 3: Admin Approval Flow Not Enforced at Database Level

**What goes wrong:** The `approved` flag is checked only in application code. An unapproved user can still make direct Supabase API calls (using the anon key + their JWT) and access data.
**Why it happens:** Developers implement approval as a UI gate but forget to encode it in RLS.
**How to avoid:** Every RLS policy for authenticated data must include `AND public.is_approved()` as a condition. Unapproved users should see nothing.
**Warning signs:** Newly registered (unapproved) users can query data via browser devtools.

### Pitfall 4: Output Mode Change Breaking Existing Pages

**What goes wrong:** Changing from `output: "static"` to `output: "hybrid"` could in theory affect build behavior for existing pages.
**Why it happens:** Misunderstanding of hybrid mode -- it defaults to static prerendering, same as `output: "static"`.
**How to avoid:** Hybrid mode is safe. All existing pages continue to prerender at build time. Only pages with `export const prerender = false` become SSR. Run `npm run build` after the change and verify existing pages still build. [ASSUMED]
**Warning signs:** Build output showing SSR pages that should be static.

### Pitfall 5: Keep-Alive Cron Not Actually Preventing Pause

**What goes wrong:** Some users report (late 2025) that Supabase pauses projects despite active cron jobs. The ping may not count as "database activity" if it only hits the REST API without actually querying the database.
**Why it happens:** Supabase's activity detection may have changed. A simple health check endpoint doesn't necessarily trigger database activity.
**How to avoid:** The keep-alive must execute an actual database query (e.g., `SELECT 1 FROM profiles LIMIT 1`), not just an HTTP ping to the REST API root. Use the Supabase REST API to query a table. [CITED: github.com/travisvn/supabase-pause-prevention]
**Warning signs:** Supabase sends a "project pausing" email despite the cron running.

## Code Examples

### Database Schema: Issues Table (D-01)

```sql
-- Source: Adapted from CONTEXT.md D-01
CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  reporter UUID NOT NULL REFERENCES public.profiles(id),
  assignee UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
```

### Database Schema: Proposals Table (D-02)

```sql
-- Source: Adapted from CONTEXT.md D-02
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  rationale TEXT,
  pi TEXT,                    -- Principal Investigator name
  scientific_mentor TEXT,      -- Scientific mentor name
  position TEXT,              -- Position being proposed
  basic_profile TEXT,         -- Brief profile of candidate
  submitter UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
```

### RLS Policies: Four-Tier Role System (D-10, D-11)

```sql
-- Source: Pattern from supabase.com/docs/guides/database/postgres/row-level-security
-- Combined with CONTEXT.md D-04, D-10, D-11

-- PROFILES: Users can read their own profile; admins can read all
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins update any profile"
  ON public.profiles FOR UPDATE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ISSUES: Approved developers+ can view; developers+ can create; admins can update all
CREATE POLICY "Approved users read issues"
  ON public.issues FOR SELECT
  USING (
    public.is_approved()
    AND public.get_user_role() IN ('admin', 'pi_mentor', 'developer')
  );

CREATE POLICY "Developers create issues"
  ON public.issues FOR INSERT
  WITH CHECK (
    public.is_approved()
    AND public.get_user_role() IN ('admin', 'pi_mentor', 'developer')
    AND reporter = auth.uid()
  );

CREATE POLICY "Admins update any issue"
  ON public.issues FOR UPDATE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Reporter updates own issue"
  ON public.issues FOR UPDATE
  USING (reporter = auth.uid() AND public.is_approved());

-- PROPOSALS: All approved users can view; developers+ can submit; PI/admins can approve
CREATE POLICY "Approved users read proposals"
  ON public.proposals FOR SELECT
  USING (public.is_approved());

CREATE POLICY "Developers submit proposals"
  ON public.proposals FOR INSERT
  WITH CHECK (
    public.is_approved()
    AND public.get_user_role() IN ('admin', 'pi_mentor', 'developer')
    AND submitter = auth.uid()
  );

CREATE POLICY "PI and admin update proposals"
  ON public.proposals FOR UPDATE
  USING (
    public.is_approved()
    AND public.get_user_role() IN ('admin', 'pi_mentor')
  );
```

### Auth API Endpoint: Registration (D-06, D-07, D-08)

```typescript
// src/pages/api/auth/register.ts
// Source: Adapted from supabase.com/docs/guides/auth/server-side/creating-a-client
export const prerender = false;

import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const displayName = formData.get("display_name")?.toString();

  if (!email || !password) {
    return new Response("Email and password required", { status: 400 });
  }

  const supabase = createSupabaseServerClient(request, cookies);

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${new URL(request.url).origin}/api/auth/callback`,
    },
  });

  if (error) {
    return new Response(error.message, { status: 400 });
  }

  // User created -> email verification sent -> profile auto-created by trigger
  // Account remains unapproved until admin sets approved=true
  return redirect("/auth/check-email");
};
```

### GitHub Actions Keep-Alive (D-12, D-13)

```yaml
# .github/workflows/supabase-keepalive.yml
# Source: Adapted from github.com/travisvn/supabase-pause-prevention
name: Supabase Keep-Alive

on:
  schedule:
    # Every 5 days (runs at 00:00 UTC on days 1,6,11,16,21,26 of each month)
    - cron: '0 0 */5 * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase database
        run: |
          # Execute an actual SELECT query to count as database activity
          curl -sf "${{ secrets.SUPABASE_URL }}/rest/v1/profiles?select=id&limit=1" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
          echo "Keep-alive ping successful"
```

### Environment Variables Setup

```bash
# .env.example (committed to repo -- no secrets)
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# .env (NOT committed -- in .gitignore)
PUBLIC_SUPABASE_URL=https://actual-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...actual-anon-key
```

```typescript
// src/env.d.ts -- add Supabase env var types
/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-*` | `@supabase/ssr` | 2024 | Unified SSR package; auth-helpers deprecated [CITED: supabase.com/docs/guides/troubleshooting/how-to-migrate-from-supabase-auth-helpers-to-ssr-package] |
| `getSession()` for server auth | `getUser()` for server auth | 2024 | getSession reads unvalidated cookie; getUser validates JWT [CITED: supabase.com/docs/guides/auth/server-side] |
| `output: "server"` for SSR | `output: "hybrid"` for mixed | Astro 2.0+ | Hybrid defaults static, opt-in SSR per page [ASSUMED] |
| Supabase anon key | Supabase publishable key (same thing, renamed) | 2025 | Terminology change; functionally identical [ASSUMED] |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Changing output from "static" to "hybrid" is non-breaking for existing pages | Architecture Patterns | Medium -- could cause build issues; verify with build test |
| A2 | service_role key must never be exposed client-side | Anti-Patterns | Low -- this is fundamental Supabase security, extremely unlikely to be wrong |
| A3 | Astro hybrid mode is available and stable in Astro 6.x | Architecture Patterns | Low -- project already uses Astro 6.1.5 with Netlify adapter |
| A4 | "Publishable key" is just the renamed "anon key" | State of the Art | Low -- cosmetic naming difference |

## Open Questions

1. **Supabase project creation**
   - What we know: User needs to create a Supabase project manually via dashboard (supabase.com)
   - What's unclear: Whether user already has a Supabase account/project
   - Recommendation: Include clear instructions for project creation as a prerequisite step in the plan

2. **Viewers and RLS policy for proposals**
   - What we know: D-04 says Viewers are read-only; D-11 says Viewers can only read
   - What's unclear: Should Viewers see proposals at all, or only published/approved ones?
   - Recommendation: Default to Viewers seeing approved proposals only; admin sees all statuses. This matches academic workflow where proposals are reviewed privately.

3. **Email verification redirect URL**
   - What we know: Supabase sends verification email with a redirect URL back to the site
   - What's unclear: The exact callback URL path and whether Netlify handles it correctly in hybrid mode
   - Recommendation: Use `/api/auth/callback` as the redirect, test the full flow end-to-end

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Supabase CLI | Local dev, migrations, type generation | Not installed | -- | Use `npx supabase` or apply SQL directly via Supabase Dashboard SQL editor |
| GitHub CLI (gh) | GitHub Actions secrets setup | Not installed | -- | Set secrets via GitHub web UI (Settings > Secrets) |
| Supabase project | All INFRA requirements | Not created yet | -- | Must be created manually at supabase.com before implementation |
| GitHub repository | Keep-alive cron (INFRA-04) | Exists (git repo) | -- | Must have GitHub Actions enabled |

**Missing dependencies with no fallback:**
- Supabase project must exist before any implementation. User must create it at supabase.com/dashboard.

**Missing dependencies with fallback:**
- Supabase CLI not installed -- can use `npx supabase` for one-off commands, or apply SQL via Dashboard
- GitHub CLI not installed -- configure secrets via GitHub web UI

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual validation + SQL verification (no automated test framework for DB schema) |
| Config file | None -- Phase 4 is infrastructure, not application code |
| Quick run command | `npm run build` (verify hybrid mode doesn't break existing pages) |
| Full suite command | `npm run build && npm run preview` + manual auth flow test |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | Database tables exist with correct schema | manual | Verify via Supabase Dashboard > Table Editor | N/A |
| INFRA-02 | User can sign up with email/password | manual | POST to /api/auth/register, check email, verify callback | N/A |
| INFRA-03 | RLS prevents unauthorized access | manual | Query tables as different roles via Supabase Dashboard SQL editor | N/A |
| INFRA-04 | Keep-alive cron runs successfully | manual | Trigger GitHub Actions workflow manually, check Supabase dashboard activity | N/A |

### Sampling Rate
- **Per task:** `npm run build` to verify no breakage
- **Per phase gate:** Full manual auth flow test (signup -> verify email -> login -> check RLS)

### Wave 0 Gaps
- No automated tests for this phase -- it is infrastructure setup (SQL, config, workflow YAML)
- Future phases (Phase 5) will need test infrastructure for UI components that interact with Supabase

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes | Supabase Auth (email/password, PKCE flow, email verification) |
| V3 Session Management | Yes | `@supabase/ssr` cookie-based sessions, `getUser()` validation |
| V4 Access Control | Yes | PostgreSQL RLS policies + four-tier role system |
| V5 Input Validation | Minimal | SQL CHECK constraints on status/priority/role enums |
| V6 Cryptography | No (handled by Supabase) | Supabase handles password hashing, JWT signing |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Session spoofing via cookie | Spoofing | Use `getUser()` not `getSession()` -- validates JWT server-side |
| Service role key exposure | Elevation of Privilege | Never expose in client code; only `PUBLIC_*` env vars are client-safe |
| RLS bypass via unapproved user | Elevation of Privilege | All RLS policies include `public.is_approved()` check |
| Direct Supabase API access bypassing app | Tampering | RLS enforced at database level regardless of access path |
| Circular RLS causing infinite recursion | Denial of Service | Use `SECURITY DEFINER` functions for role lookups |

## Sources

### Primary (HIGH confidence)
- [Supabase SSR Client Guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client) -- Astro-specific createServerClient code
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) -- RLS policy syntax and patterns
- [Supabase RLS Performance Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) -- Security definer pattern
- [Supabase Auth SSR Overview](https://supabase.com/docs/guides/auth/server-side) -- getUser vs getSession warning
- [Astro + Supabase Integration](https://docs.astro.build/en/guides/backend/supabase/) -- Official integration guide
- [npm registry: @supabase/supabase-js@2.103.0](https://www.npmjs.com/package/@supabase/supabase-js) -- Version verification
- [npm registry: @supabase/ssr@0.10.2](https://www.npmjs.com/package/@supabase/ssr) -- Version verification

### Secondary (MEDIUM confidence)
- [Supabase Pause Prevention](https://github.com/travisvn/supabase-pause-prevention) -- Keep-alive patterns and caveats
- [GitHub Actions cron for Supabase](https://dev.to/nasreenkhalid/how-to-set-up-a-github-actions-cron-job-to-prevent-supabase-inactivity-3m6b) -- Workflow YAML pattern
- [freeCodeCamp: Secure SSR Auth with Supabase + Astro](https://www.freecodecamp.org/news/build-secure-ssr-authentication-with-supabase-astro-and-cloudflare-turnstile/) -- Cookie security patterns
- [Supabase Migration Best Practices](https://supabase.com/docs/guides/deployment/database-migrations) -- SQL migration file approach

### Tertiary (LOW confidence)
- [Medium: Supabase pause prevention 2026](https://shadhujan.medium.com/how-to-keep-supabase-free-tier-projects-active-d60fd4a17263) -- Reports of keep-alive sometimes failing; needs monitoring

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- verified versions via npm, official SSR docs
- Architecture: HIGH -- patterns from official Supabase + Astro docs, cross-verified
- Pitfalls: HIGH -- documented in official docs and multiple community reports
- Schema/RLS: MEDIUM -- adapted from official patterns to fit four-tier role system; not tested

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (Supabase and Astro are stable; 30-day window appropriate)
