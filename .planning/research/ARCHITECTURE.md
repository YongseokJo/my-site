# Architecture Research

**Domain:** Hybrid academic website (static content + dynamic backend)
**Researched:** 2026-04-12
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Visitor's Browser                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Static Pages (CDN-cached)    │  Dynamic Islands (client-hydrated)  │
│  ┌──────────┐ ┌──────────┐   │  ┌──────────────┐ ┌─────────────┐  │
│  │ Research  │ │ Pubs     │   │  │ Auth Forms   │ │ Issue Board │  │
│  │ Pages    │ │ Listing  │   │  │ (React)      │ │ (React)     │  │
│  └──────────┘ └──────────┘   │  └──────┬───────┘ └──────┬──────┘  │
│  ┌──────────┐ ┌──────────┐   │         │                 │         │
│  │ Blog     │ │ App      │   │         │                 │         │
│  │ Posts    │ │ Landing  │   │         │                 │         │
│  └──────────┘ └──────────┘   │         │                 │         │
│                               │         │                 │         │
├───────────────────────────────┼─────────┴─────────────────┴─────────┤
│           Astro Framework (hybrid output mode)                      │
│  ┌────────────────────┐  ┌─────────────────────────────────┐       │
│  │ Static Prerender   │  │ Server Endpoints (SSR on-demand) │       │
│  │ (build-time HTML)  │  │ /api/issues, /api/proposals      │       │
│  └────────────────────┘  └──────────────┬──────────────────┘       │
├─────────────────────────────────────────┼───────────────────────────┤
│                    Supabase (BaaS)       │                           │
│  ┌──────────┐  ┌──────────┐  ┌─────────┴──┐  ┌──────────┐         │
│  │ Auth     │  │ Postgres │  │ Row-Level   │  │ Storage  │         │
│  │ (users)  │  │ Database │  │ Security    │  │ (files)  │         │
│  └──────────┘  └──────────┘  └────────────┘  └──────────┘         │
└─────────────────────────────────────────────────────────────────────┘

Deployment:
  Static pages ──→ Netlify CDN (or Vercel Edge)
  SSR endpoints ──→ Netlify Functions (or Vercel Serverless)
  Backend data  ──→ Supabase (managed, free tier)
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Static Pages | Research, publications, blog, about, CV | Astro `.astro` pages, prerendered at build time |
| App Landing Pages | ArXiv app showcase, beta signup, feedback forms | Astro pages with embedded React form islands |
| Auth System | User login/signup for simulation collaborators | Supabase Auth via SSR cookies + Astro middleware |
| Project Management | Proposals, issue tracking, developer assignment | React islands + Supabase Postgres + RLS policies |
| Content Collections | Publications (YAML), blog posts (MDX), research pages | Astro Content Collections with Zod schemas |
| API Endpoints | Server-side form handlers, protected data mutations | Astro server endpoints (`src/pages/api/`) |
| Supabase Client | Database queries, auth state, file uploads | `@supabase/supabase-js` with SSR cookie adapter |

## Recommended Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── common/              # Header, Footer, Nav, SEO
│   ├── home/                # Hero section, cards
│   ├── publications/        # Publication list, filters
│   ├── research/            # Project cards, paper links
│   ├── app/                 # ArXiv app landing components
│   └── dashboard/           # Auth-gated React islands
│       ├── IssueBoard.tsx   # Issue tracker (React)
│       ├── ProposalForm.tsx # Project proposal (React)
│       └── LoginForm.tsx    # Auth form (React)
├── content/                 # Astro Content Collections
│   ├── publications/        # Publication entries (YAML or MDX)
│   ├── blog/                # Blog posts (MDX)
│   └── research/            # Research project pages (MDX)
├── data/                    # Static data files
│   └── publications.yaml   # Migrated from Hugo data/
├── layouts/                 # Astro layout components
│   ├── BaseLayout.astro     # HTML shell, head, nav, footer
│   ├── PageLayout.astro     # Standard content page
│   ├── BlogLayout.astro     # Blog post with date/tags
│   └── DashboardLayout.astro # Auth-gated layout with sidebar
├── lib/                     # Shared utilities
│   ├── supabase.ts          # Supabase client factory (browser + SSR)
│   └── auth.ts              # Auth helpers, session checking
├── middleware.ts             # Astro middleware for auth cookie handling
├── pages/                   # File-based routing
│   ├── index.astro          # Homepage (static)
│   ├── about.astro          # About page (static)
│   ├── publications/        # Publications section (static)
│   ├── research/            # Research projects (static)
│   ├── blog/                # Blog listing + posts (static)
│   ├── arxiv-app/           # App landing page (static + form islands)
│   │   ├── index.astro
│   │   ├── tutorials.astro
│   │   └── beta-signup.astro
│   ├── sim/                 # Simulation project management (SSR)
│   │   ├── index.astro      # Dashboard (auth-gated)
│   │   ├── issues.astro     # Issue tracker (auth-gated)
│   │   └── proposals.astro  # Proposals (auth-gated)
│   ├── login.astro          # Login page
│   └── api/                 # Server endpoints
│       ├── auth/
│       │   ├── signin.ts
│       │   ├── signup.ts
│       │   └── signout.ts
│       ├── issues.ts
│       └── proposals.ts
├── styles/                  # Global CSS
│   └── global.css           # Migrated from Hugo assets/css/
└── env.d.ts                 # Astro env types
```

### Structure Rationale

- **components/dashboard/**: React `.tsx` files are isolated here because only these components need client-side hydration. Everything else is Astro (zero JS).
- **content/**: Astro Content Collections replace Hugo's `content/` + `data/` directories. Zod schemas enforce frontmatter structure.
- **pages/sim/**: The simulation management section is the only SSR-rendered area. Astro's hybrid mode prerenderes everything else statically.
- **lib/**: Supabase client creation is centralized. The SSR client uses cookies; the browser client uses the anon key. This boundary is critical for security.
- **pages/api/**: Server endpoints handle auth flows and data mutations. They run as serverless functions on Netlify/Vercel.

## Architectural Patterns

### Pattern 1: Islands Architecture (Astro Islands)

**What:** Static HTML pages with selectively hydrated interactive components ("islands"). The page is server-rendered as HTML at build time; only specific components load JavaScript.

**When to use:** Any page that is mostly content (reading) but needs one or two interactive widgets. This covers 90% of the site.

**Trade-offs:** Dramatically lower JS payload vs. full SPA. Trade-off is that islands cannot easily share state with each other (use Nano Stores or URL params for cross-island communication).

**Example:**
```astro
---
// src/pages/arxiv-app/beta-signup.astro
// This page is STATIC (prerendered). Only the form hydrates.
import BaseLayout from '../../layouts/BaseLayout.astro';
import BetaSignupForm from '../../components/app/BetaSignupForm.tsx';
---
<BaseLayout title="Beta Signup - ArXiv App">
  <section class="landing-hero">
    <h1>Join the ArXiv Reader Beta</h1>
    <p>Pure static HTML content here — zero JavaScript.</p>
  </section>

  <!-- Only THIS component ships JavaScript to the browser -->
  <BetaSignupForm client:visible />
</BaseLayout>
```

### Pattern 2: Hybrid Output Mode (Static Default + SSR Opt-in)

**What:** Astro defaults to static prerendering. Individual pages opt into server-side rendering with `export const prerender = false`. This gives CDN-cached performance for content pages and dynamic rendering for authenticated pages.

**When to use:** The simulation dashboard (`/sim/*`) and API endpoints need SSR. Everything else stays static.

**Trade-offs:** Requires a hosting platform that supports both static serving and serverless functions (Netlify and Vercel both do). SSR pages have cold-start latency on serverless.

**Example:**
```astro
---
// src/pages/sim/issues.astro
// This page renders on EVERY REQUEST (not cached)
export const prerender = false;

import { createServerClient } from '../../lib/supabase';
import DashboardLayout from '../../layouts/DashboardLayout.astro';
import IssueBoard from '../../components/dashboard/IssueBoard.tsx';

const supabase = createServerClient(Astro.cookies);
const { data: { user } } = await supabase.auth.getUser();
if (!user) return Astro.redirect('/login');

const { data: issues } = await supabase
  .from('issues')
  .select('*')
  .order('created_at', { ascending: false });
---
<DashboardLayout title="Issues">
  <IssueBoard issues={issues} client:load />
</DashboardLayout>
```

### Pattern 3: Supabase Row-Level Security as the Authorization Layer

**What:** Instead of building authorization logic in your application code, define RLS policies directly in Postgres. The Supabase client automatically applies them based on the authenticated user's JWT.

**When to use:** All database access for the simulation project management. RLS ensures collaborators can only see/edit their own proposals and assigned issues.

**Trade-offs:** RLS is powerful but can be hard to debug. Requires careful policy design upfront. Testing RLS policies requires Supabase's local dev environment.

**Example:**
```sql
-- Only project members can view issues
CREATE POLICY "Members can view project issues"
ON issues FOR SELECT
USING (
  project_id IN (
    SELECT project_id FROM project_members
    WHERE user_id = auth.uid()
  )
);

-- Only project admins can assign issues
CREATE POLICY "Admins can update issues"
ON issues FOR UPDATE
USING (
  project_id IN (
    SELECT project_id FROM project_members
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

## Data Flow

### Static Content Flow (Build Time)

```
Markdown/YAML files (src/content/)
    ↓ (Astro build)
Content Collections (validated by Zod schema)
    ↓ (template rendering)
Static HTML + CSS (dist/)
    ↓ (deploy)
Netlify CDN (globally cached, instant load)
    ↓ (request)
Browser (zero JavaScript for pure content pages)
```

### Dynamic Feature Flow (Runtime)

```
Browser (React island)
    ↓ (user action: submit form, click button)
Supabase JS Client (in-browser, anon key)
    ↓ (API call with JWT in header)
Supabase Auth (validates JWT)
    ↓ (passes user context to Postgres)
Postgres + RLS Policies (filters data per user)
    ↓ (returns rows)
Supabase JS Client
    ↓ (updates React state)
Browser (re-renders island)
```

### Authentication Flow (SSR)

```
Browser: POST /api/auth/signin { email, password }
    ↓
Astro Server Endpoint (Netlify Function)
    ↓ supabase.auth.signInWithPassword()
Supabase Auth (validates credentials, returns session)
    ↓
Server Endpoint (sets auth cookies on response)
    ↓ redirect to /sim/
Browser (subsequent requests include auth cookies)
    ↓
Astro Middleware (reads cookies, creates server Supabase client)
    ↓ attaches user to Astro.locals
SSR Page (checks Astro.locals.user, renders or redirects)
```

### Key Data Flows

1. **Publication display:** YAML data in `src/content/publications/` is validated at build time, rendered to static HTML. No runtime cost.
2. **Beta signup form:** React island collects email, POSTs to Supabase `beta_signups` table directly via client SDK. No server endpoint needed (Supabase RLS allows anonymous inserts).
3. **Issue creation:** Authenticated user submits form in React island. Client SDK calls Supabase with JWT. RLS checks membership. Row inserted into `issues` table.
4. **Content updates:** Push new Markdown to git. Netlify rebuilds static pages. No backend involvement.

## Migration Path from Hugo

### What Migrates Directly

| Hugo Source | Astro Destination | Effort |
|-------------|-------------------|--------|
| `content/*.md` frontmatter + body | `src/content/*.mdx` (same frontmatter, same Markdown) | Low — copy files, adjust frontmatter to match Zod schema |
| `data/first_pub.yaml`, `data/co_pub.yaml` | `src/content/publications/` as individual entries or `src/data/publications.yaml` | Low — restructure into Content Collection entries |
| `config.yaml` menu/params | `src/components/common/Nav.astro` + env vars | Low — hardcode nav or use a config module |
| `assets/css/main.css` | `src/styles/global.css` | Low — copy directly, Astro supports plain CSS |
| `static/` (images, icons) | `public/` (Astro's static directory) | Trivial — rename folder |

### What Needs Rewriting

| Hugo Feature | Astro Replacement | Effort |
|--------------|-------------------|--------|
| `layouts/partials/*.html` (Go templates) | Astro components (`.astro` files) | Medium — rewrite template syntax |
| `layouts/shortcodes/publications.html` | Astro component or Content Collection query | Medium — replace Go range/if with Astro/JS |
| `baseof.html` block inheritance | `BaseLayout.astro` with `<slot />` | Low — straightforward mapping |
| Hugo asset pipeline (minify, fingerprint) | Astro/Vite built-in (automatic) | None — works out of the box |

### Migration Order (Build Dependencies)

1. **Base layout + global styles** — everything depends on this
2. **Homepage** — validates the layout system works
3. **Content collections + publications** — the core static content
4. **Research/projects pages** — depends on content collections
5. **Blog** — depends on content collections + layout
6. **App landing pages** — depends on layout, introduces first React islands (forms)
7. **Auth system** — depends on Supabase setup, Astro middleware
8. **Simulation dashboard** — depends on auth, introduces SSR pages + React islands

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1-50 users (collaborators) | Supabase free tier is more than sufficient. Static pages on CDN handle unlimited reads. No changes needed. |
| 50-500 users | Still fine on free tier. May need Supabase Pro ($25/mo) if project is paused due to inactivity. Consider Supabase cron to prevent pause. |
| 500+ users | Unlikely for an academic collaboration tool. If reached, Supabase Pro handles it. Static content scales infinitely on CDN. |

### Scaling Priorities

1. **First bottleneck:** Supabase free tier pauses after 7 days of inactivity. Mitigation: set up a cron ping (e.g., GitHub Actions scheduled workflow hitting a Supabase endpoint weekly), or accept the 30-second cold start on first visit after pause.
2. **Second bottleneck:** Serverless function cold starts for SSR pages. Mitigation: keep SSR surface minimal (only `/sim/*` and `/api/*`). Everything else is static.

## Anti-Patterns

### Anti-Pattern 1: Making Everything SSR

**What people do:** Set `output: 'server'` globally and render all pages on every request.
**Why it's wrong:** Kills CDN caching for content pages. Publications and research pages don't change between deploys — they should be static HTML served from CDN edge.
**Do this instead:** Use `output: 'static'` (default) and opt individual pages into SSR with `export const prerender = false`. Only the simulation dashboard and API routes need SSR.

### Anti-Pattern 2: Trusting `getSession()` on the Server

**What people do:** Use `supabase.auth.getSession()` in server endpoints to check if user is authenticated.
**Why it's wrong:** Session data comes from cookies which can be spoofed. The session is not cryptographically verified.
**Do this instead:** Use `supabase.auth.getUser()` (or `getClaims()` in newer versions) which validates the JWT signature against Supabase's public keys on every call.

### Anti-Pattern 3: Building a Custom Auth System

**What people do:** Create their own user tables, password hashing, session management.
**Why it's wrong:** Security is hard. Supabase Auth handles email/password, magic links, OAuth, JWT generation, and session management — all battle-tested.
**Do this instead:** Use Supabase Auth exclusively. Store additional user profile data in a `profiles` table linked to `auth.users` via foreign key.

### Anti-Pattern 4: Putting Dynamic Logic in Static Pages

**What people do:** Use `client:load` React components on every page to fetch data from Supabase at runtime.
**Why it's wrong:** If the data doesn't change between deploys (publications, research descriptions), fetching it at runtime adds latency and Supabase API calls for no reason.
**Do this instead:** Use Content Collections for all content that changes via git. Only use runtime Supabase queries for truly dynamic data (issues, proposals, user state).

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase Auth | SSR cookie-based sessions via `@supabase/ssr` | Use `createServerClient` on server, `createBrowserClient` on client |
| Supabase Database | Direct client SDK queries with RLS | No custom API layer needed; RLS is the authorization layer |
| Supabase Storage | File uploads for proposal attachments | Use signed URLs for private files, public bucket for avatars |
| Netlify / Vercel | Deploy adapter (`@astrojs/netlify` or `@astrojs/vercel`) | Handles static files + serverless functions automatically |
| GitHub | Content management via git push | Push Markdown, Netlify rebuilds. No CMS needed. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Static pages ↔ Dynamic islands | Props passed from Astro to React via component attributes | One-way: Astro renders, React hydrates. No back-communication. |
| React islands ↔ Supabase | Direct client SDK calls from browser | Use Supabase anon key (public). RLS protects data. |
| SSR pages ↔ Supabase | Server-side SDK with cookie-based auth | Use `createServerClient` that reads auth cookies from request. |
| Astro middleware ↔ SSR pages | `Astro.locals` object | Middleware attaches user session; pages read it. |
| Content Collections ↔ Pages | `getCollection()` / `getEntry()` queries | Type-safe, validated at build time. |

## Build Order Implications for Roadmap

The architecture has clear dependency layers that dictate phase ordering:

1. **Framework migration (foundation)** — Astro project setup, base layout, global styles, Netlify adapter. Nothing else can proceed without this.
2. **Content migration (core value)** — Content Collections for publications, research pages. This is the site's primary purpose. Must validate before adding complexity.
3. **Static feature pages** — Blog, app landing pages. These build on the content system but are independent of each other.
4. **BaaS setup (dynamic foundation)** — Supabase project, auth configuration, database schema. Required before any dynamic features.
5. **Auth system** — Login/signup, middleware, session handling. Required before the dashboard.
6. **Dynamic features** — Issue tracker, proposal system, project management. The last and most complex layer.

Each layer depends on the one above it. Crucially, layers 1-3 deliver a fully functional static website before any backend work begins. This means the site can ship value incrementally.

## Sources

- [Astro Islands Architecture Docs](https://docs.astro.build/en/concepts/islands/)
- [Astro Server Islands Docs](https://docs.astro.build/en/guides/server-islands/)
- [Astro Project Structure Docs](https://docs.astro.build/en/basics/project-structure/)
- [Migrating from Hugo to Astro - Official Guide](https://docs.astro.build/en/guides/migrate-to-astro/from-hugo/)
- [Supabase + Astro Integration Guide](https://docs.astro.build/en/guides/backend/supabase/)
- [Supabase Auth Architecture](https://supabase.com/docs/guides/auth/architecture)
- [Supabase SSR Client Guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase Pricing / Free Tier](https://supabase.com/pricing)
- [Astro vs Next.js Comparison 2026](https://pagepro.co/blog/astro-nextjs/)
- [Hugo to Astro Migration Experiences](https://www.eliostruyf.com/migration-story-hugo-astro/)

---
*Architecture research for: Hybrid academic website*
*Researched: 2026-04-12*
