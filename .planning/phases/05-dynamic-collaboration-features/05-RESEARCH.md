# Phase 5: Dynamic Collaboration Features - Research

**Researched:** 2026-04-12
**Domain:** Authenticated UI (forms, dashboards, role-based views) with Supabase + Astro islands
**Confidence:** HIGH

## Summary

Phase 5 builds the user-facing collaboration UI on top of the Phase 4 backend: login/signup pages, issue reporting, proposal submission with academic fields, a role-specific dashboard, and admin user approval. The backend (auth endpoints, database schema, RLS policies) is already implemented. This phase is purely frontend -- React islands for interactive forms, Astro SSR pages for protected routes, and Supabase client queries for CRUD operations.

The main technical decisions are: (1) whether to use React islands or full Astro SSR pages for each feature, (2) form validation approach, and (3) how to structure the dashboard with role-conditional rendering. The existing codebase has a clear pattern -- React islands with `client:load` for interactive components (ContactForm, BetaSignupForm) and shadcn/ui for all UI primitives. This phase follows the same pattern.

One critical gap: the proposals table lacks a `review_comment` and `reviewer` column needed for D-11 (PI/Mentor approval with required comment). A database migration is needed before the proposal approval UI can work.

**Primary recommendation:** Use React islands with `client:load` for all forms and the dashboard. Use native React state + inline validation (matching ContactForm pattern) rather than adding React Hook Form -- the forms are simple enough. Add a database migration for the missing `review_comment`/`reviewer` columns on proposals. Use Astro SSR pages (`prerender = false`) for all authenticated routes.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Dedicated pages at /login and /signup (not modals)
- **D-02:** Login/signup link only on the /software (Enzo-Abyss) page -- not in the main nav bar
- **D-03:** When logged in, show user icon/name on the Enzo-Abyss page instead of login link
- **D-04:** After signup, show message about email verification + pending admin approval
- **D-05:** Issue form visible at /software/issues -- requires login to submit
- **D-06:** Issue list also requires authentication (not public)
- **D-07:** Issue form fields: title, description, priority (low/medium/high/critical) -- from Phase 4 schema
- **D-08:** Submitted issues appear in the list with status, priority, and assignee
- **D-09:** Single page form (not multi-step wizard) -- all fields on one scrollable page
- **D-10:** Fields: title, description, rationale, PI, scientific mentor, position, basic profile -- from Phase 4 schema
- **D-11:** PI/Mentor approval with required comment explaining approve/reject decision
- **D-12:** Proposal status visible to submitter (pending -> approved/rejected with comment)
- **D-13:** Role-specific views: Admin (approve/reject pending users, view all issues and proposals, assign issues, change statuses), PI/Mentor (approve/reject proposals with required comment), Developer (view my submitted issues, view my proposals, submit new issues/proposals), Viewer (read-only list of approved proposals and open issues)
- **D-14:** Admin dashboard includes user approval list (pending signups with approve/reject)
- **D-15:** Dashboard accessible at /dashboard (requires auth)

### Claude's Discretion
- Dashboard layout and component structure
- Form validation approach (React Hook Form or native)
- Issue/proposal detail page design
- Status badge colors and styling
- Pagination for lists (if needed for small user base)
- Whether to use React islands or full Astro SSR pages for dashboard

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SIM-04 | Issue/bug reporting form for simulation users (authenticated via Supabase) | Issue form island with Supabase insert; /software/issues route with auth guard; uses existing issues table schema |
| SIM-05 | Project proposal submission form for collaborators (authenticated) | Proposal form island with academic fields; /software/proposals route; requires DB migration for review_comment column |
| SIM-06 | Developer dashboard showing assigned issues and proposal status | Dashboard page at /dashboard with role-conditional rendering; Supabase queries filtered by user/role |
| SIM-07 | Role-based access control (admin, developer, viewer) for simulation collaborators | Auth guard on SSR pages checking user + profile; RLS enforces at DB level; UI shows/hides based on role |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Budget:** Zero cost -- free hosting (Netlify), free backend (Supabase free tier)
- **Architecture:** Hybrid -- static frontend on Netlify, dynamic backend via Supabase
- **Framework:** Astro 6.1.5 with React islands, Tailwind CSS v4, shadcn/ui
- **Output mode:** `output: "static"` is correct -- Astro 5+ supports `prerender = false` per-route without needing `"hybrid"` mode [VERIFIED: docs.astro.build/en/guides/on-demand-rendering/]

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | ^2.103.0 | Database queries (CRUD for issues, proposals, profiles) | Already installed from Phase 4 [VERIFIED: package.json] |
| @supabase/ssr | ^0.10.2 | SSR cookie-based auth (createBrowserClient for islands) | Already installed from Phase 4 [VERIFIED: package.json] |
| react | ^19.2.5 | Island components for forms and dashboard | Already installed [VERIFIED: package.json] |
| tailwindcss | ^4.2.2 | Styling | Already installed [VERIFIED: package.json] |

### UI Components (Already Installed)

| Component | File | Used For |
|-----------|------|----------|
| Button | `src/components/ui/button.tsx` | Form submits, approve/reject actions |
| Input | `src/components/ui/input.tsx` | Text fields in login, signup, issue, proposal forms |
| Textarea | `src/components/ui/textarea.tsx` | Description, rationale, review comment fields |
| Label | `src/components/ui/label.tsx` | Form field labels |
| Select | `src/components/ui/select.tsx` | Priority dropdown, status dropdown, role selector |
| Card | `src/components/ui/card.tsx` | Issue cards, proposal cards, dashboard panels |
| Badge | `src/components/ui/badge.tsx` | Status badges (open/closed), priority badges, role badges |
| Dialog | `src/components/ui/dialog.tsx` | Approval/rejection dialog with comment field |
| Separator | `src/components/ui/separator.tsx` | Visual dividers in dashboard |

### No New Dependencies Needed

This phase requires NO new npm packages. All UI primitives (shadcn) and backend connectivity (Supabase) are already installed. Form validation will use native React state matching the existing ContactForm pattern. [VERIFIED: codebase inspection]

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native React state validation | React Hook Form | RHF adds ~12KB; overkill for 4 simple forms; ContactForm already sets the native pattern |
| React islands with client:load | Full Astro SSR pages (no JS) | SSR-only loses real-time form feedback; islands provide better UX for forms |
| Individual island per form | Single dashboard island | Single island is simpler to manage role state; individual islands have lighter initial loads |

## Architecture Patterns

### Output Mode Clarification (CRITICAL)

The Astro config has `output: "static"`. This is **correct and intentional**. In Astro 5+, `output: "static"` supports `export const prerender = false` on individual pages/endpoints. The old `"hybrid"` mode is no longer needed -- `"static"` with per-route opt-out IS the hybrid approach. [VERIFIED: docs.astro.build/en/guides/on-demand-rendering/]

The existing auth API endpoints (`/api/auth/*`) already use `prerender = false` and the build succeeds. All new Phase 5 pages that need auth will use the same pattern. [VERIFIED: build test]

### Recommended File Structure (Phase 5 additions)

```
src/
├── islands/
│   ├── LoginForm.tsx          # NEW: Email/password login form
│   ├── SignupForm.tsx         # NEW: Registration form with display_name
│   ├── IssueForm.tsx          # NEW: Issue submission form
│   ├── IssueList.tsx          # NEW: Authenticated issue list with status/priority
│   ├── ProposalForm.tsx       # NEW: Single-page proposal form (academic fields)
│   ├── ProposalList.tsx       # NEW: Proposal list with status
│   ├── Dashboard.tsx          # NEW: Role-conditional dashboard (single island)
│   └── UserMenu.tsx           # NEW: Logged-in user icon/name for Enzo-Abyss page
├── pages/
│   ├── login.astro            # NEW: Login page (prerender=false)
│   ├── signup.astro           # NEW: Signup page (prerender=false)
│   ├── dashboard.astro        # NEW: Dashboard page (prerender=false, auth required)
│   └── software/
│       ├── issues.astro       # NEW: Issue list + form page (prerender=false)
│       └── proposals.astro    # NEW: Proposal form page (prerender=false)
│   └── api/
│       ├── issues.ts          # NEW: CRUD API for issues
│       └── proposals.ts       # NEW: CRUD API for proposals
├── lib/
│   └── supabase.ts            # EXISTING: Server + browser client factories
supabase/
└── migrations/
    └── 00005_proposal_reviews.sql  # NEW: Add review_comment, reviewer columns
```

### Pattern 1: Authenticated SSR Page with React Island

**What:** Astro SSR page that checks auth server-side, redirects unauthenticated users, and passes user data to a React island.
**When to use:** Every protected page (dashboard, issues, proposals).

```typescript
// src/pages/dashboard.astro
// Source: Pattern derived from existing middleware + ContactForm island pattern
---
export const prerender = false;
import BaseLayout from "../layouts/BaseLayout.astro";
import Dashboard from "../islands/Dashboard.tsx";

const user = Astro.locals.user;
if (!user) {
  return Astro.redirect("/login");
}

// Fetch profile server-side for role check
const supabase = Astro.locals.supabase;
const { data: profile } = await supabase
  .from("profiles")
  .select("role, approved, display_name")
  .eq("id", user.id)
  .single();

if (!profile?.approved) {
  return Astro.redirect("/login?error=pending_approval");
}
---
<BaseLayout title="Dashboard">
  <Dashboard
    client:load
    userId={user.id}
    userEmail={user.email}
    role={profile.role}
    displayName={profile.display_name}
  />
</BaseLayout>
```

### Pattern 2: Browser-Side Supabase Client in React Islands

**What:** React islands use `createSupabaseBrowserClient()` for data fetching and mutations. The browser client uses the same cookies set by the middleware, so the user's auth session is available.
**When to use:** All CRUD operations within React islands.

```typescript
// Inside a React island component
// Source: Existing createSupabaseBrowserClient in src/lib/supabase.ts
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useState, useEffect } from "react";

function IssueList() {
  const [issues, setIssues] = useState([]);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function fetchIssues() {
      const { data, error } = await supabase
        .from("issues")
        .select("*, reporter:profiles!reporter(display_name), assignee:profiles!assignee(display_name)")
        .order("created_at", { ascending: false });
      if (data) setIssues(data);
    }
    fetchIssues();
  }, []);

  // ... render issues
}
```

### Pattern 3: Form Submission to Supabase (Client-Side)

**What:** React island forms submit directly to Supabase via the browser client, not through API endpoints. RLS policies enforce authorization at the database level.
**When to use:** Issue creation, proposal submission.

```typescript
// Source: Adapted from ContactForm pattern + Supabase client pattern
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setStatus("submitting");

  const supabase = createSupabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("issues").insert({
    title: formData.title,
    description: formData.description,
    priority: formData.priority,
    reporter: user.id,
  });

  if (error) {
    setStatus("error");
    setErrorMessage(error.message);
  } else {
    setStatus("success");
  }
}
```

### Pattern 4: Role-Conditional Dashboard Rendering

**What:** A single Dashboard island receives the user's role as a prop and renders role-appropriate sections. Role is determined server-side (in the .astro page) and passed down.
**When to use:** The /dashboard page.

```typescript
// Source: Pattern recommendation based on D-13 role specifications
interface DashboardProps {
  userId: string;
  userEmail: string;
  role: "admin" | "pi_mentor" | "developer" | "viewer";
  displayName: string;
}

function Dashboard({ userId, role, displayName }: DashboardProps) {
  return (
    <div>
      <h1>Welcome, {displayName}</h1>
      {role === "admin" && <AdminPanel />}
      {(role === "admin" || role === "pi_mentor") && <ProposalReviewPanel />}
      {(role === "admin" || role === "pi_mentor" || role === "developer") && <MyIssuesPanel userId={userId} />}
      <ProposalStatusPanel userId={userId} role={role} />
    </div>
  );
}
```

### Pattern 5: Admin Actions via Supabase Client

**What:** Admin operations (user approval, issue assignment, status changes) use the browser Supabase client. RLS policies ensure only admins can perform these updates.
**When to use:** Admin dashboard panel.

```typescript
// Source: RLS policy "Admins update any profile" in 00004_rls_policies.sql
async function approveUser(profileId: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("profiles")
    .update({ approved: true, role: selectedRole })
    .eq("id", profileId);
  // RLS enforces only admin can do this
}
```

### Anti-Patterns to Avoid

- **NEVER check auth client-side only** -- always verify server-side in the .astro page first (redirect if unauthenticated), then let the island handle data fetching. Client-side auth checks are for UX only; server-side redirect is the security gate. [ASSUMED]
- **NEVER build separate API endpoints for simple CRUD** -- Supabase client with RLS handles authorization. API endpoints are only needed for auth flows (already built in Phase 4). [ASSUMED]
- **NEVER pass the Supabase client as a prop** -- each island creates its own browser client via `createSupabaseBrowserClient()`. The client is lightweight and shares the same session cookies. [VERIFIED: src/lib/supabase.ts uses import.meta.env]
- **NEVER hard-code role strings** -- define a shared TypeScript type for roles to prevent typos across components. [ASSUMED]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validation library | Inline validate function (ContactForm pattern) | Forms are simple (3-8 fields); ContactForm shows the exact pattern |
| Auth state management | React context/store for auth | `createSupabaseBrowserClient().auth.getUser()` | Supabase handles session via cookies; no client state needed |
| Role-based routing | Custom middleware role checks | Server-side profile query in .astro page + redirect | Astro SSR pages run server code in frontmatter; simple and direct |
| Status/priority badges | Custom badge components | shadcn Badge with variant prop + Tailwind colors | Badge component already installed; just map status to variant |
| Approval dialog | Custom modal implementation | shadcn Dialog component | Dialog already installed; handles focus trap, escape key, overlay |

## Common Pitfalls

### Pitfall 1: Missing `review_comment` Column on Proposals Table

**What goes wrong:** D-11 requires PI/Mentor approval with a required comment, and D-12 requires the submitter to see the approval/rejection comment. The current `proposals` table (migration 00003) has NO `review_comment` or `reviewer` column.
**Why it happens:** Phase 4 schema was designed before the PI approval comment requirement was locked.
**How to avoid:** Create migration `00005_proposal_reviews.sql` adding `review_comment TEXT` and `reviewer UUID REFERENCES public.profiles(id)` columns to the proposals table. Must be applied before building the approval UI.
**Warning signs:** Supabase insert/update errors when trying to save review comments. [VERIFIED: supabase/migrations/00003_proposals.sql has no review_comment column]

### Pitfall 2: Middleware Running on Static Pages (Performance)

**What goes wrong:** The current middleware calls `supabase.auth.getUser()` on EVERY request, including static pages that don't need auth. This adds a network round-trip to Supabase for every page load.
**Why it happens:** The middleware has no route filtering -- it runs unconditionally.
**How to avoid:** Add a path check in middleware to skip Supabase client creation for static pages that don't need auth (e.g., `/`, `/about`, `/publications`). Only create the client for `/dashboard`, `/software/issues`, `/software/proposals`, `/login`, `/signup`, `/api/`. [VERIFIED: src/middleware.ts runs on all routes]
**Warning signs:** Slow page loads on static pages; unnecessary Supabase API calls visible in network tab.

### Pitfall 3: Astro Islands Can't Access `Astro.locals`

**What goes wrong:** React islands (client:load) run in the browser and CANNOT access `Astro.locals.user` or `Astro.locals.supabase`. Developers try to import from Astro context inside React components.
**Why it happens:** Islands are hydrated client-side; Astro.locals is server-only.
**How to avoid:** Pass user data as props from the .astro page to the island. Inside the island, create a browser Supabase client for data fetching. [VERIFIED: this is how ContactForm works -- it receives no server context]
**Warning signs:** Build errors mentioning "Astro.locals is not defined" or hydration mismatches.

### Pitfall 4: Unapproved Users Seeing Dashboard Content

**What goes wrong:** A user who is authenticated (email verified) but not yet approved by admin can access the dashboard URL and see a broken/empty page.
**Why it happens:** Auth check passes (user exists) but approval check is missed.
**How to avoid:** Every protected SSR page must check BOTH `Astro.locals.user` (authenticated?) AND `profile.approved` (approved?). Redirect unapproved users to a "pending approval" page with a clear message. [VERIFIED: RLS policies include is_approved() checks, but UI must also handle this]
**Warning signs:** Authenticated but unapproved users see empty lists or error states instead of a helpful message.

### Pitfall 5: Browser Supabase Client Not Picking Up Auth Session

**What goes wrong:** `createSupabaseBrowserClient()` returns an unauthenticated client because cookies aren't being shared correctly between server and client.
**Why it happens:** The SSR middleware sets auth cookies on the response, but if the page is the first load after login, the browser may not have the cookies yet.
**How to avoid:** After login, redirect to the target page (server-side redirect via the API endpoint). The redirect response carries Set-Cookie headers, and the browser will have cookies on the subsequent page load. Do NOT try to use the Supabase browser client immediately after a client-side login without a page navigation. [ASSUMED]
**Warning signs:** Islands showing "not authenticated" despite successful login; data queries returning empty due to RLS.

### Pitfall 6: Select Component Mismatch with HTML Select

**What goes wrong:** The shadcn Select component uses Radix UI's Select primitive, which renders a custom dropdown (not a native `<select>` element). Form data extraction via `FormData` won't work with it.
**Why it happens:** Radix Select doesn't render a native form element.
**How to avoid:** Use React state to track the selected value and include it in the Supabase insert call directly (not via FormData). The ContactForm pattern already uses React state for all fields. [ASSUMED]
**Warning signs:** Priority/status dropdowns not sending values on form submission.

## Code Examples

### Login Form Island

```typescript
// src/islands/LoginForm.tsx
// Source: Adapted from existing ContactForm pattern + auth API endpoint pattern
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type FormStatus = "idle" | "submitting" | "error";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const res = await fetch("/api/auth/signin", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Login failed");
      setStatus("error");
      return;
    }

    // Redirect after successful login
    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[400px] mx-auto space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email" type="email" required
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password" type="password" required
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={status === "submitting"}>
        {status === "submitting" ? "Signing in..." : "Sign In"}
      </Button>
      <p className="text-sm text-center text-muted-foreground">
        No account? <a href="/signup" className="text-primary hover:underline">Sign up</a>
      </p>
    </form>
  );
}
```

### Issue Submission with Direct Supabase Insert

```typescript
// src/islands/IssueForm.tsx (partial - submit handler)
// Source: Supabase client pattern from src/lib/supabase.ts + issues schema from 00002_issues.sql
import { createSupabaseBrowserClient } from "@/lib/supabase";

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setStatus("submitting");

  const supabase = createSupabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    setError("You must be logged in to submit an issue");
    setStatus("error");
    return;
  }

  const { error } = await supabase.from("issues").insert({
    title: formData.title,
    description: formData.description,
    priority: formData.priority, // 'low' | 'medium' | 'high' | 'critical'
    reporter: user.id,
  });

  if (error) {
    setError(error.message);
    setStatus("error");
  } else {
    setStatus("success");
    // Refresh the issue list
    onIssueCreated?.();
  }
}
```

### Proposal Review with Required Comment

```typescript
// Source: D-11 requirement + Dialog component pattern
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase";

function ProposalReviewDialog({ proposalId, onReviewed }) {
  const [comment, setComment] = useState("");
  const [action, setAction] = useState<"approved" | "rejected" | null>(null);

  async function handleReview(decision: "approved" | "rejected") {
    if (!comment.trim()) {
      setError("A comment is required when reviewing a proposal");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("proposals")
      .update({
        status: decision,
        review_comment: comment,
        reviewer: user.id,
      })
      .eq("id", proposalId);

    if (!error) onReviewed();
  }
  // ... Dialog UI with comment textarea and approve/reject buttons
}
```

### Database Migration for Review Comments

```sql
-- supabase/migrations/00005_proposal_reviews.sql
-- Adds review_comment and reviewer columns required by D-11 and D-12
ALTER TABLE public.proposals
  ADD COLUMN review_comment TEXT,
  ADD COLUMN reviewer UUID REFERENCES public.profiles(id);
```

### Auth Guard Pattern for SSR Pages

```typescript
// Reusable auth guard pattern for all protected .astro pages
// Source: Derived from middleware pattern + D-15 (dashboard requires auth)
---
export const prerender = false;

const user = Astro.locals.user;
if (!user) {
  return Astro.redirect("/login?redirect=" + encodeURIComponent(Astro.url.pathname));
}

const supabase = Astro.locals.supabase;
const { data: profile } = await supabase
  .from("profiles")
  .select("role, approved, display_name")
  .eq("id", user.id)
  .single();

if (!profile?.approved) {
  return Astro.redirect("/pending-approval");
}
---
```

### User Menu for Enzo-Abyss Page

```typescript
// src/islands/UserMenu.tsx
// Source: D-02 (login link on /software only) + D-03 (show user when logged in)
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface UserMenuProps {
  initialUser: { email: string; displayName: string } | null;
}

export default function UserMenu({ initialUser }: UserMenuProps) {
  if (!initialUser) {
    return (
      <a href="/login">
        <Button variant="outline" size="sm">Login / Sign Up</Button>
      </a>
    );
  }

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">{initialUser.displayName || initialUser.email}</span>
      <a href="/dashboard"><Button variant="outline" size="sm">Dashboard</Button></a>
      <Button variant="ghost" size="sm" onClick={handleSignOut}>Sign Out</Button>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `output: "hybrid"` for mixed SSR/static | `output: "static"` with per-route `prerender = false` | Astro 5.0 (late 2024) | No need to change output mode; current config is correct [VERIFIED: docs.astro.build/en/guides/on-demand-rendering/] |
| React Hook Form for all forms | Native React state for simple forms | Ongoing | RHF only justified for complex multi-step forms; simple CRUD forms don't need it [ASSUMED] |
| Server API endpoints for every CRUD | Direct Supabase client calls with RLS | Standard Supabase pattern | RLS handles authorization at DB level; no need for intermediary API [CITED: supabase.com/docs/guides/database/postgres/row-level-security] |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Native React state validation is sufficient for 4 simple forms (no React Hook Form needed) | Standard Stack | Low -- forms have 3-8 fields; RHF can be added later if needed |
| A2 | Browser Supabase client will correctly pick up auth session from cookies after server-side login redirect | Pitfall 5 | Medium -- if cookies don't transfer, islands won't be authenticated; needs end-to-end testing |
| A3 | A single Dashboard island with role-conditional rendering is better than separate per-role pages | Architecture Patterns | Low -- can always split later; single island is simpler to start |
| A4 | shadcn Select component needs React state (not FormData) for value extraction | Pitfall 6 | Low -- Radix Select is known to not use native form elements |
| A5 | Server-side auth check in .astro frontmatter + client-side Supabase browser client is the correct pattern for protected pages | Architecture Patterns | Low -- this matches Supabase SSR documentation patterns |

## Open Questions

1. **Middleware route filtering**
   - What we know: Middleware currently runs Supabase auth on ALL routes, including static pages
   - What's unclear: Whether this causes noticeable performance impact on Netlify's edge functions
   - Recommendation: Add path-based filtering in middleware to skip auth for static routes. This is an optimization, not a blocker -- implement it during this phase.

2. **Pagination needs**
   - What we know: User base is small (~5-50 collaborators), so issue/proposal lists will be short
   - What's unclear: Whether pagination is needed at all for v1
   - Recommendation: Skip pagination for v1. Load all items. Add pagination later if lists grow beyond ~50 items.

3. **Proposal review_comment migration**
   - What we know: The proposals table needs `review_comment` and `reviewer` columns that don't exist yet
   - What's unclear: Whether to apply this migration via Supabase Dashboard SQL editor or via CLI
   - Recommendation: Add as migration file `00005_proposal_reviews.sql` in the repo and apply via Dashboard SQL editor (consistent with Phase 4 approach)

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Supabase project | All SIM requirements | Must be created by user | -- | Cannot proceed without it |
| Node.js | Build, dev server | Yes | Available | -- |
| shadcn/ui components | All UI | Yes (9 components installed) | -- | -- |
| @supabase/supabase-js | Data queries | Yes | ^2.103.0 | -- |
| @supabase/ssr | Browser client | Yes | ^0.10.2 | -- |

**Missing dependencies with no fallback:**
- Supabase project must exist with schema applied (Phase 4 prerequisite)

**Missing dependencies with fallback:**
- None -- all dependencies are already installed

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual validation + build verification (no automated test framework) |
| Config file | None |
| Quick run command | `npm run build` |
| Full suite command | `npm run build && npm run preview` + manual auth flow test |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SIM-04 | Authenticated user can submit issue via form | manual | Build + manual test: login -> /software/issues -> fill form -> verify in Supabase | N/A |
| SIM-05 | Authenticated user can submit proposal with academic fields | manual | Build + manual test: login -> /software/proposals -> fill form -> verify in Supabase | N/A |
| SIM-06 | Dashboard shows role-appropriate content | manual | Build + manual test: login as admin/developer/viewer -> verify different views | N/A |
| SIM-07 | Unapproved users cannot access protected pages | manual | Build + manual test: register new user -> try accessing /dashboard -> verify redirect | N/A |

### Sampling Rate
- **Per task:** `npm run build` to verify no breakage
- **Per phase gate:** Full manual auth flow for all 4 roles (admin, pi_mentor, developer, viewer)

### Wave 0 Gaps
- No automated test infrastructure exists; all validation is manual + build verification
- Future consideration: Playwright e2e tests for auth flows (out of scope for v1)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes | Supabase Auth (Phase 4); this phase adds UI forms that POST to existing auth endpoints |
| V3 Session Management | Yes | @supabase/ssr cookie management; middleware validates with getUser() |
| V4 Access Control | Yes | Server-side role check in .astro pages + RLS at database level |
| V5 Input Validation | Yes | Client-side validation in React islands; server-side via Supabase column constraints (CHECK clauses) |
| V6 Cryptography | No | Handled by Supabase (password hashing, JWT signing) |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Client-only auth check bypass | Elevation of Privilege | Server-side redirect in .astro frontmatter before rendering any content |
| Direct Supabase API calls by unapproved user | Elevation of Privilege | RLS policies include `is_approved()` check on all tables |
| XSS in user-submitted content (issue descriptions) | Tampering | React auto-escapes JSX; never use dangerouslySetInnerHTML for user content |
| CSRF on form submissions | Tampering | Supabase auth cookies are SameSite=Lax; POST to /api/auth/* uses form data (no CORS issues from same origin) |
| Role manipulation via client | Elevation of Privilege | Role stored in server-side profiles table; passed as prop from SSR page; client cannot modify |

## Sources

### Primary (HIGH confidence)
- [Astro On-Demand Rendering](https://docs.astro.build/en/guides/on-demand-rendering/) -- output mode behavior in Astro 5+, prerender=false with static mode
- Codebase inspection: `src/lib/supabase.ts`, `src/middleware.ts`, `src/pages/api/auth/*.ts`, `src/islands/ContactForm.tsx` -- existing patterns
- Codebase inspection: `supabase/migrations/00001-00004` -- schema and RLS policies
- Phase 4 research: `.planning/phases/04-backend-infrastructure-auth/04-RESEARCH.md` -- all backend patterns and decisions

### Secondary (MEDIUM confidence)
- [Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) -- RLS enforcement for direct client calls
- [Supabase SSR Client Guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client) -- browser client pattern

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages already installed and verified in codebase
- Architecture: HIGH -- patterns derived from existing codebase conventions (ContactForm, middleware, auth endpoints)
- Pitfalls: HIGH -- identified through direct codebase inspection (missing column, middleware scope, island limitations)
- Security: HIGH -- RLS policies verified in migration files; auth patterns from Phase 4 research

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (stable stack, no fast-moving dependencies)
