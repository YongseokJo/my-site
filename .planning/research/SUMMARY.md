# Project Research Summary

**Project:** Yongseok Jo Professional Academic Website
**Domain:** Hybrid academic website — static content + dynamic BaaS backend
**Researched:** 2026-04-12
**Confidence:** HIGH

## Executive Summary

This is a hybrid academic website that combines three distinct concerns: a professional research presence (bio, publications, research projects), a software product portal (simulation package docs, project management for collaborators), and an app promotion page (ArXiv reader with beta signup). The expert approach for this domain is to build the entire public-facing site as a statically-generated site on a CDN, then layer in dynamic capabilities selectively where collaborator workflows require them. The recommended path is to migrate from Hugo to Astro, which provides an islands architecture capable of hosting both zero-JavaScript content pages and React-powered interactive forms within the same project and deployment.

The technology decision is clear and well-supported: Astro 5.x with React islands handles the hybrid static/dynamic requirement without the overhead of a full SPA framework like Next.js. Supabase provides auth, database, and Row Level Security for free at the scale this project will ever reach (fewer than 50 collaborators). Tailwind CSS v4 + shadcn/ui handles styling. Netlify continues as the deployment target via the first-party @astrojs/netlify adapter. The migration complexity is moderate — content files (Markdown, YAML) transfer directly, but all Hugo Go templates must be rewritten from scratch as Astro components (not ported line-by-line).

The primary risk is scope creep: this project could become a full project management SaaS product rather than a polished academic website. Research is unanimous that the professional presence (the static site) must ship first, independently of backend infrastructure. Dynamic features — issue tracker, proposal dashboard, user accounts — deliver far less value than a well-designed public site and carry 10x the implementation complexity. A second major risk is the Supabase free-tier inactivity pause, which must be mitigated via a keep-alive cron job before any dynamic features go live.

## Key Findings

### Recommended Stack

Astro 5.x is the correct framework for this project. It is content-first by design, ships zero JavaScript for static pages (ideal for publications and research content), and supports React islands for the interactive forms and dashboard features needed by collaborators. It has an official Hugo migration guide, first-class Netlify deployment support, and is now the highest-satisfaction framework in the JS ecosystem. Next.js is overkill — it ships a JS runtime on every page and is optimized for Vercel, not Netlify. Hugo cannot support dynamic features at all.

Supabase is the correct BaaS choice. PostgreSQL is the right database model for relational project management data (users, projects, issues, proposals). Free-tier limits are generous enough for a small academic collaborator base (50K MAU auth, 500MB DB). Row Level Security policies handle authorization at the database layer, eliminating the need for application-level permission logic. Tailwind v4 and shadcn/ui are the correct styling choices — Tailwind v4 has a 5x faster Rust engine, CSS-native theming, and shadcn/ui provides pre-built accessible React components.

**Core technologies:**
- **Astro 5.x**: Framework — static-first with islands for dynamic features; official Hugo migration guide
- **React 19.x**: Interactive islands — login forms, issue board, proposal forms
- **TypeScript 5.x**: Type safety — catches errors at build time, auto-generated Supabase types
- **Tailwind CSS 4.2.x**: Styling — CSS-native theming, Rust engine, first-class Astro support
- **shadcn/ui**: UI components — copy-paste accessible components, works with Tailwind v4
- **Supabase**: BaaS — PostgreSQL, auth (50K MAU free), Row Level Security
- **React Hook Form + Zod**: Forms — minimal re-renders, shared client/server validation
- **Astro Content Collections**: Content — type-safe Markdown/YAML with Zod schemas
- **Netlify + @astrojs/netlify**: Deployment — existing platform, SSR + static in one adapter

### Expected Features

**Must have (table stakes):**
- Professional bio with headshot and academic profile links (Google Scholar, ORCID, GitHub)
- Publications list with filtering by project, year, and type — with author highlighting
- Downloadable CV (PDF) linked from About page and header
- Research projects section with overview cards and linked papers
- Simulation package overview page with getting-started docs and contributor list
- ArXiv app landing page with screenshots, feature highlights, and App Store/TestFlight links
- Beta signup form (email collection for ArXiv app beta users)
- Contact form via Netlify Forms (no backend required)
- Client-side search via Pagefind (zero-cost, built at deploy time)
- SEO completion (meta tags, OpenGraph, structured data for publications)

**Should have (competitive differentiators — after static site ships):**
- Issue/bug reporting form for simulation package users (authenticated, Supabase)
- Project proposal submission form for simulation collaborators (authenticated)
- User authentication for simulation collaborators (Supabase Auth, magic link)
- ArXiv app feedback/feature-request form (categorized: bug, feature, general)
- ArXiv app tutorials section (Markdown-based with screenshots)
- Dark mode toggle (CSS custom properties + JS toggle)

**Defer to v2+:**
- Developer dashboard with assigned issues and proposal status (when collaborators exceed ~10)
- Role-based access control with admin panel (when dashboard exists)
- Research project visual timelines
- Static blog with Giscus comments (only if regular writing is planned)
- Email notification system for issue/proposal status updates

### Architecture Approach

The architecture is a hybrid static/SSR Astro site in `output: 'hybrid'` mode. All content pages (publications, research, about, app landing) are prerendered at build time and served from Netlify's CDN with zero JavaScript. Interactive features (login forms, proposal submission, issue tracker) are React islands that hydrate independently. The only SSR-rendered section is `/sim/*` (the simulation dashboard and auth pages). API endpoints at `/api/*` run as Netlify serverless functions. Supabase handles auth via SSR cookies and authorization via Row Level Security policies — no custom permission logic in application code.

**Major components:**
1. **Static content pages** — Astro `.astro` files, prerendered at build time, CDN-cached; zero JS payload
2. **Content Collections** — Typed Markdown/YAML for publications, research pages, blog; Zod-validated at build time
3. **React islands (components/dashboard/)** — Interactive forms and boards that hydrate independently via Supabase client SDK
4. **Astro middleware** — Reads Supabase auth cookies on every SSR request; attaches user session to `Astro.locals`
5. **SSR pages (/sim/*)** — Auth-gated, rendered per-request; check `Astro.locals.user` before rendering
6. **Server API endpoints (/api/*)** — Handle auth flows and data mutations; run as Netlify serverless functions
7. **Supabase (BaaS)** — PostgreSQL with RLS policies as the authorization layer; Auth for session management

### Critical Pitfalls

1. **Supabase free-tier inactivity pause** — Free projects pause after 7 days with no DB activity; all dynamic features break simultaneously. Set up a GitHub Actions cron job to ping the DB daily. Must be in place before any dynamic features launch.

2. **Scope creep into full project management system** — Auth + roles + CRUD + permissions is equivalent to building a mini-Jira. Ship the static professional site first, completely independent of backend. For PM MVP, start with a proposal form that emails the owner, not a full dashboard.

3. **Porting Hugo templates instead of rebuilding** — Hugo Go templates have no migration path to Astro. Treat it as a rebuild, not a migration. Only migrate content files (Markdown, YAML). Start from Astro's blog template and build layouts from scratch.

4. **Mixing SSR and static rendering incorrectly** — `output: 'server'` globally makes all pages server-rendered, defeating CDN caching for content. Use `output: 'hybrid'`; mark only `/sim/*` and `/api/*` with `export const prerender = false`.

5. **Supabase service role key exposure** — The service role key bypasses Row Level Security entirely. Only the anon key goes in client-side code. Service key lives only in Netlify environment variables, never in client bundles or git history.

## Implications for Roadmap

Based on research, the architecture has clear dependency layers that dictate phase ordering. The static site must ship first — it is both the primary user value and a prerequisite mindset for scope discipline. Dynamic features are an additive layer, not the foundation.

### Phase 1: Framework Migration and Design System

**Rationale:** Hugo cannot support the planned features. This is the foundation everything else depends on. Since a full visual redesign is planned anyway, there is zero wasted effort — every template will be rewritten regardless. Migration must happen before any feature work.
**Delivers:** Astro project on Netlify, base layout, design system, global styles, Content Collections with existing Hugo content parsed and available.
**Addresses:** Navigation, responsive layout, accessibility baseline, design token system.
**Avoids:** CSS debt carryover (Pitfall 8) — start CSS from scratch; template porting trap (Pitfall 3) — rebuild, do not port.
**Research flag:** Standard — Hugo-to-Astro migration is covered by official guides and real-world reports.

### Phase 2: Static Content Pages

**Rationale:** The core academic value of the site lives here. Publications, research projects, About/CV, and contact form are the primary reason visitors come. These pages depend only on Phase 1 and have zero backend dependencies — they can and should ship before any backend work begins.
**Delivers:** Publications page with filtering and author highlighting; research projects section; About page with CV download; contact form (Netlify Forms); client-side search (Pagefind).
**Addresses:** All P1 features from the feature priority matrix.
**Avoids:** Publication pipeline breakage (Pitfall 7) — map YAML schema first, test data pipeline in isolation, fix empty-string-for-null issues in existing YAML during schema design.
**Research flag:** Standard — Astro Content Collections, Pagefind, and Netlify Forms all have clear official documentation.

### Phase 3: ArXiv App Landing Page and SEO

**Rationale:** The app landing page is a distinct content type (product marketing) that introduces the first React islands (beta signup form). It depends on Phase 1 (layout) and Phase 2 (stable design system) but not on the backend. SEO completion happens here to cover all pages before launch.
**Delivers:** ArXiv app landing page with device mockups, feature highlights, App Store/TestFlight links, beta signup form (Netlify Forms in v1), tutorials stub, SEO meta tags and OpenGraph across all pages.
**Addresses:** App landing page, beta signup, feature overview, download links.
**Avoids:** Premature Supabase dependency — use Netlify Forms for beta signup in Phase 3, migrate to Supabase table in Phase 4.
**Research flag:** Standard — landing page patterns, Pagefind, Netlify Forms are established.

### Phase 4: Supabase Infrastructure and Auth

**Rationale:** Backend setup must be done carefully and completely before any dynamic features build on top of it. Auth is a cross-cutting concern; doing it once correctly is far better than retrofitting. This phase also establishes the security posture (RLS policies, key management) before any user data flows.
**Delivers:** Supabase project, PostgreSQL schema, RLS policies, Astro middleware, login/signup pages, session handling, GitHub Actions keep-alive cron job.
**Addresses:** All prerequisites for dynamic features; security baseline; Supabase pause prevention.
**Avoids:** Service role key exposure (Pitfall 11), Supabase pause (Pitfall 1), over-engineering auth (Pitfall 9) — use magic link + 2 roles (owner + collaborator) + RLS only. Use `getUser()` not `getSession()` in server code.
**Research flag:** Needs phase research — Supabase SSR auth with Astro middleware has security-critical implementation details (getUser vs getSession distinction, cookie handling patterns, RLS policy design).

### Phase 5: Dynamic Features (Simulation Portal)

**Rationale:** With auth in place and the static site polished, dynamic features can be added incrementally. This phase should only begin when collaborators are actively waiting for these features — not speculatively.
**Delivers:** Issue/bug reporting form, project proposal submission form, contributor list, ArXiv app feedback form, tutorials section, dark mode toggle.
**Addresses:** All P2 features from the feature priority matrix.
**Avoids:** Scope creep into full PM dashboard (Pitfall 2), SSR rendering misconfiguration (Pitfall 4), DB storage misuse (Pitfall 5) — no file uploads, proposals are text-only with external links.
**Research flag:** Needs phase research — React Hook Form + Supabase mutation patterns, Netlify edge function vs serverless for auth middleware cold start mitigation.

### Phase 6: Collaborator Dashboard (v2)

**Rationale:** Only build the full dashboard when collaborator count exceeds ~10 active users and manual email becomes genuinely unmanageable. Earlier delivery is speculative scope.
**Delivers:** Developer dashboard, role-based access (admin vs developer vs viewer), project status views.
**Addresses:** P3 features: developer dashboard, RBAC, project timelines.
**Avoids:** Over-engineering for a small user base (Pitfall 9).
**Research flag:** Needs phase research — complex auth UI patterns and role-based routing in Astro + Supabase.

### Phase Ordering Rationale

- Phases 1-3 deliver a fully shippable professional website before any backend work begins. This keeps scope disciplined and ensures the primary value is not held hostage to backend complexity.
- Phase 4 (BaaS setup) is deliberately isolated as its own phase. Auth and DB schema decisions have downstream consequences for all dynamic features; getting them right once is worth the separation.
- Phase 5 is gated by real collaborator demand, not speculative need. If collaboration never materializes at scale, Phase 5 scope stays minimal.
- Astro `output: 'hybrid'` means static and SSR pages coexist without conflict across all phases.

### Research Flags

Phases needing deeper research during planning:
- **Phase 4 (BaaS + Auth):** Supabase SSR auth with Astro middleware has security-critical implementation patterns; RLS policy design for the proposed schema needs careful planning.
- **Phase 5 (Dynamic Features):** React Hook Form + Supabase mutations, Netlify edge function vs serverless cold start trade-offs.
- **Phase 6 (Dashboard):** Role-based routing in Astro + complex RLS policy combinations.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Migration):** Official Astro Hugo migration guide covers this well; rebuild approach is documented with real-world examples.
- **Phase 2 (Static Content):** Content Collections, Pagefind, and Netlify Forms all have clear official docs.
- **Phase 3 (App Landing):** Landing page patterns, anonymous Supabase inserts, SEO in Astro are standard.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technology choices have official documentation, active communities, and confirmed compatibility. Astro/Supabase/Netlify integration is documented end-to-end. |
| Features | HIGH | Academic website domain is well-studied with clear guidelines. Feature set is proportionate to scale and user base. |
| Architecture | HIGH | Islands architecture and hybrid output mode are Astro's core documented patterns. Supabase SSR patterns are officially documented with code examples. |
| Pitfalls | HIGH | All 4 critical pitfalls are confirmed by official documentation or multiple developer reports. Supabase pause behavior is a documented known issue with established workarounds. |

**Overall confidence:** HIGH

### Gaps to Address

- **Publication YAML schema mapping:** The exact field structure of the existing Hugo YAML files needs to be mapped against the Astro Content Collection Zod schema before Phase 2 begins. The CONCERNS.md issues (empty-string-for-null, hard-coded author name) should be inventoried and fixed during schema design.
- **Keep-alive cron implementation:** The GitHub Actions daily ping approach needs a specific implementation decision (what endpoint to ping, how to authenticate the cron request) before Phase 4 launches.
- **Beta signup routing decision:** Whether beta signups go to Supabase (requires Phase 4) or Netlify Forms (available in Phase 3) is open. Recommendation: Netlify Forms in Phase 3, migrate to Supabase table in Phase 4.
- **Dark mode timing:** Dark mode requires a stable design token system. Confirmed as Phase 5, not Phase 2.

## Sources

### Primary (HIGH confidence)
- [Astro Islands Architecture](https://docs.astro.build/en/concepts/islands/) — core rendering model
- [Astro Hugo Migration Guide](https://docs.astro.build/en/guides/migrate-to-astro/from-hugo/) — official migration path
- [Astro Supabase Integration](https://docs.astro.build/en/guides/backend/supabase/) — SSR auth setup
- [Astro Netlify Deployment](https://docs.astro.build/en/guides/deploy/netlify/) — adapter configuration
- [Supabase Pricing](https://supabase.com/pricing) — free tier limits confirmed
- [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4) — CSS-native theming, Rust engine
- [shadcn/ui Astro Installation](https://ui.shadcn.com/docs/installation/astro) — component integration

### Secondary (MEDIUM confidence)
- [Astro vs Next.js Comparison 2026](https://pagepro.co/blog/astro-nextjs/) — performance trade-offs
- [Supabase Free Tier Guide](https://uibakery.io/blog/supabase-pricing) — free tier operational details
- [Supabase Pause Prevention](https://github.com/travisvn/supabase-pause-prevention) — keep-alive workaround
- [Berkeley Academic Website Tips](https://townsendcenter.berkeley.edu/blog/personal-academic-webpages-how-tos-and-tips-better-site) — feature expectations

### Tertiary (LOW confidence)
- [Hugo to Astro Migration — Elio Struyf](https://www.eliostruyf.com/migration-story-hugo-astro/) — real-world template rewrite experience
- [Lessons from AI-assisted Astro migration](https://bennet.org/archive/lessons-from-ai-assisted-migration-to-astro/) — shortcode conversion challenges

---
*Research completed: 2026-04-12*
*Ready for roadmap: yes*
