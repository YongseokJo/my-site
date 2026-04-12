# Domain Pitfalls

**Domain:** Hybrid academic website (Hugo migration + BaaS backend)
**Researched:** 2026-04-12

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Supabase Free-Tier Project Pausing Kills Production

**What goes wrong:** Supabase automatically pauses free-tier projects after 7 days of inactivity. For an academic website where the project management features may go unused during semester breaks or between collaboration cycles, this means the backend silently goes offline. Users hit the site, auth fails, project management returns errors, and the site owner may not even know until someone complains.

**Why it happens:** Supabase pauses inactive free projects to conserve shared resources. Academic sites have inherently bursty traffic -- heavy during collaboration periods, dead during breaks. Seven days of low activity is common.

**Consequences:** All dynamic features (auth, project proposals, issue tracking) break simultaneously. Data is retained but inaccessible until manual unpause from the Supabase dashboard. Users see cryptic errors. Collaborators lose trust in the platform.

**Prevention:**
- Set up a GitHub Actions cron job to ping the Supabase database daily (simplest, most reliable workaround)
- Alternatively, deploy a Supabase Edge Function with an external cron trigger (cron-job.org) to keep the project alive
- Design the frontend to degrade gracefully: static content must always render regardless of backend status
- Add a health-check endpoint and monitor it with a free uptime service

**Detection:** Backend API calls returning connection errors or timeouts. Auth redirects failing silently. The Supabase dashboard showing "Paused" status.

**Relevant phase:** Infrastructure setup phase -- must be configured before any dynamic features go live.

**Confidence:** HIGH -- this is documented by Supabase and widely reported by developers.

### Pitfall 2: Boiling the Ocean -- Building a Full Project Management System

**What goes wrong:** The project requirements list simulation project management (proposals, issue tracking, developer management, user accounts). This is essentially building a mini-Jira/GitHub Issues inside a personal academic website. The scope balloons from "a nice academic site" to "a custom SaaS product" and either never ships or ships half-broken.

**Why it happens:** The site owner envisions a central hub for everything. Each feature seems small in isolation (just a form! just a list!) but the aggregate complexity of auth + roles + CRUD + notifications + permissions is enormous. Academic projects also have unique workflow needs that resist off-the-shelf patterns.

**Consequences:** The entire site launch is delayed waiting for the project management features. The professional presence (the actual primary value) never goes live. The PM features, when they do ship, are worse than existing free tools (GitHub Issues, Notion, Linear).

**Prevention:**
- Ship the static professional site first, completely independent of dynamic features
- For project management MVP, start with just a proposal submission form that emails the site owner -- not a full dashboard
- Use existing tools (link to GitHub Issues for the simulation package) rather than rebuilding them
- Cap the PM feature set: proposal form, simple status list, contact form. No role-based dashboards in v1
- Define a hard "done" line for each phase before starting it

**Detection:** Phase planning that blocks the static site on backend features. Requirement lists growing between phases. Spending more than 2 weeks on auth/roles infrastructure.

**Relevant phase:** Planning and scoping phase -- must be addressed before any development begins.

**Confidence:** HIGH -- scope creep affects 52% of projects per PMI data, and this project has a particularly wide scope surface.

### Pitfall 3: Hugo Template Logic Has No Migration Path to Astro

**What goes wrong:** Hugo uses Go templating with features like `{{ with }}`, `{{ range }}`, shortcodes, and partials. Astro uses JSX-like component syntax. There is zero automated conversion between them. Developers attempt to "port" templates line-by-line, producing fragile Astro components that don't follow Astro patterns and are harder to maintain than starting fresh.

**Why it happens:** The mental model is "migration" (preserve and convert) rather than "rebuild" (use existing content, new structure). Hugo's Go templates look simple but embed logic (conditionals, loops, data lookups) that maps poorly to component-based architectures.

**Consequences:** Weeks spent on template conversion that produces worse code than writing from scratch. The publication rendering logic (which has hard-coded author name matching, per CONCERNS.md) gets ported with its existing bugs. CSS cascade conflicts from the current site get carried over.

**Prevention:**
- Treat it as a rebuild, not a migration. Only migrate content files (Markdown, YAML data)
- Start from Astro's blog template (`npm create astro@latest -- --template blog`) and build layouts from scratch
- Use the migration as an opportunity to fix the issues documented in CONCERNS.md (duplicate CSS variables, hard-coded author names, accessibility issues)
- Port content in small batches (a few pages at a time), not all at once
- Write a conversion script for Hugo shortcodes to standard Markdown before touching Astro at all

**Detection:** Finding yourself reading Go template docs while writing Astro code. Astro components that mirror Hugo's partial file structure exactly. Copy-pasting HTML from Hugo output into Astro templates.

**Relevant phase:** Framework migration phase -- this is the core activity of the migration.

**Confidence:** HIGH -- confirmed by Astro's official migration docs and multiple developer migration reports.

### Pitfall 4: Mixing Static and Dynamic Rendering Incorrectly

**What goes wrong:** In a hybrid Astro site, pages must be explicitly configured for static generation (SSG) or server-side rendering (SSR). Setting `output: 'server'` globally (required for Supabase auth) makes ALL pages server-rendered by default, losing the performance and caching benefits of static generation for content pages. Alternatively, using `output: 'hybrid'` requires explicitly marking dynamic pages.

**Why it happens:** Supabase auth requires server-side cookie handling, which needs SSR. Developers enable SSR globally and forget to mark content pages as static. Or they keep `output: 'static'` and wonder why auth doesn't work.

**Consequences:** Static content pages (publications, about, research) get server-rendered on every request instead of being served from CDN cache. This increases latency, costs Netlify function invocations, and defeats the purpose of a static-first architecture. Alternatively, auth pages silently fail because they're statically generated.

**Prevention:**
- Use Astro's `output: 'hybrid'` mode: pages are static by default, and only pages that need SSR are explicitly marked with `export const prerender = false`
- Keep a clear mental model: publications, about, projects overview = static. Auth, proposal submission, dashboards = SSR
- Test that content pages are actually being served from CDN (check response headers for cache hits)
- Document which pages are SSR vs SSG in the project README or a dev guide

**Detection:** Content pages returning `x-nf-request-id` headers (indicating function execution rather than CDN). Netlify function invocation counts higher than expected. Auth pages returning static HTML without session data.

**Relevant phase:** Framework migration phase, specifically when adding the first dynamic route.

**Confidence:** HIGH -- this is a fundamental Astro architecture decision documented in official docs.

## Moderate Pitfalls

### Pitfall 5: Supabase 500MB Database Limit Reached by File Storage Misuse

**What goes wrong:** Developers store uploaded files (PDFs, images, screenshots from issue reports) directly in Supabase database columns as binary data instead of using Supabase Storage (1GB free) or external hosting. The 500MB database fills up; the database enters read-only mode.

**Why it happens:** It's simpler to store a file as a blob in a table column than to set up a proper storage pipeline. For a project management system accepting proposals and attachments, this fills up fast.

**Prevention:**
- Use Supabase Storage (separate 1GB bucket) for all file uploads
- Store only file references (URLs/paths) in database tables
- Set file size limits on upload forms (e.g., 5MB max per attachment)
- Monitor database size in Supabase dashboard regularly
- For the academic site specifically: keep publication PDFs in the static site repo (they're already there as part of the Hugo site), not in the database

**Detection:** Database approaching 400MB. Slow query performance. Supabase dashboard warnings.

**Relevant phase:** Backend integration phase -- when building proposal/issue submission forms.

**Confidence:** MEDIUM -- common pattern in BaaS abuse, documented in Supabase pricing guides.

### Pitfall 6: Netlify Serverless Function Cold Starts Degrade Auth UX

**What goes wrong:** Netlify serverless functions have cold starts of 3+ seconds. When a user visits a protected page after the function has been idle, the auth check takes noticeably long. The user sees a blank page or loading spinner for several seconds before being redirected to login or shown content.

**Why it happens:** Netlify's Lambda-based functions spin down after inactivity. Academic sites have low, bursty traffic, so cold starts happen frequently.

**Prevention:**
- Use client-side Supabase auth (supabase-js) for the initial session check, with server-side validation only for sensitive operations
- Implement optimistic UI: show a skeleton/loading state immediately, not a blank page
- Consider Netlify Edge Functions for auth middleware (faster cold starts, runs at CDN edge)
- Cache auth tokens client-side with appropriate expiry
- For the academic site: most pages are public. Only project management pages need auth, so the cold start impact is limited if the architecture is correct

**Detection:** Users reporting slow page loads on first visit. Time-to-interactive metrics above 4 seconds on dynamic pages.

**Relevant phase:** Auth implementation phase.

**Confidence:** MEDIUM -- documented in Netlify vs Vercel comparisons. Severity depends on architecture choices.

### Pitfall 7: BibTeX/YAML Publication Pipeline Breaks During Migration

**What goes wrong:** The existing Hugo site has a BibTeX-to-YAML conversion pipeline and publication templates with specific data access patterns (`{{ range }}` over YAML data files). When migrating to Astro, the data loading mechanism changes completely (Astro content collections vs Hugo data templates), and the publication rendering breaks.

**Why it happens:** Hugo loads YAML files from `data/` automatically and makes them available in templates. Astro uses content collections with explicit schema definitions. The shapes may be compatible but the access patterns are completely different.

**Prevention:**
- Map the existing YAML data structure before migration: document every field used in publication templates
- Define an Astro content collection schema that matches the existing YAML structure
- Write and test the publication data pipeline in isolation before integrating it into the full site
- Keep the BibTeX-to-YAML conversion script (Python) unchanged -- it's independent of the framework
- Fix the empty-string-for-null issue in publication YAML (documented in CONCERNS.md) during migration, not after

**Detection:** Publications page showing raw data or missing fields. Author highlighting breaking. Link fields rendering empty anchors.

**Relevant phase:** Content migration phase -- should be one of the first things validated.

**Confidence:** HIGH -- this is the most data-heavy part of the existing site and uses custom data patterns.

### Pitfall 8: CSS Architecture Debt Carried Forward

**What goes wrong:** The current site has documented CSS issues: duplicate custom properties, cascade conflicts, redundant imports (CONCERNS.md). During migration, developers copy CSS files wholesale into the new project, carrying all the debt forward into a framework that has better CSS tooling available.

**Why it happens:** CSS "works" visually even when the code is messy. Copying it over is the path of least resistance. The redesign requirement makes it tempting to defer cleanup to "later."

**Prevention:**
- Start CSS from scratch using Astro's scoped styles (component-level `<style>` tags)
- Use the existing CSS only as a visual reference, not as source code to port
- Establish a design token system (CSS custom properties, but done correctly this time) before writing any component styles
- The project requires a "complete visual redesign" anyway -- this is the natural time to rebuild CSS

**Detection:** Finding `@import` statements or `!important` declarations in the new codebase. Global CSS file growing past 200 lines.

**Relevant phase:** Design/UI phase -- addressed naturally during the visual redesign.

**Confidence:** HIGH -- directly evidenced by the current CONCERNS.md analysis.

## Minor Pitfalls

### Pitfall 9: Overcomplicating Auth for a Small User Base

**What goes wrong:** Building enterprise-grade auth (role-based access control, email verification flows, password reset, OAuth providers) for what is likely fewer than 20 collaborators.

**Prevention:**
- Start with Supabase's magic link auth (email-based, no passwords to manage)
- Implement only two roles initially: owner and collaborator
- Use Supabase Row Level Security (RLS) policies rather than application-level role checks
- Defer OAuth (GitHub login, Google login) until users actually request it

**Detection:** Auth implementation taking more than 3 days. More than 2 database tables dedicated to permissions.

**Relevant phase:** Auth implementation phase.

**Confidence:** MEDIUM -- based on the project's described user base (simulation collaborators).

### Pitfall 10: Ignoring Accessibility During Redesign

**What goes wrong:** The current site already has accessibility issues (incorrect alt text, missing rel attributes per CONCERNS.md). During a visual redesign focused on "professional + clean + creative," accessibility gets deprioritized further.

**Prevention:**
- Include accessibility checks in the component development workflow (not as a separate phase)
- Use Astro's built-in accessibility auditing or add `astro-eslint-plugin-a11y`
- Fix all current accessibility issues (CONCERNS.md) as part of migration, not as a separate task
- Test with keyboard navigation and screen reader during development, not after

**Detection:** Components without aria labels. Images without alt text. Color contrast below WCAG AA.

**Relevant phase:** Every phase -- should be a continuous concern, not a dedicated phase.

**Confidence:** HIGH -- existing accessibility issues are documented in CONCERNS.md.

### Pitfall 11: Deploying Dynamic Features Without Environment Variable Security

**What goes wrong:** Supabase keys (especially the service role key) get committed to the repo, hard-coded in client-side JavaScript, or exposed through misconfigured Netlify environment variables. The service role key bypasses Row Level Security entirely.

**Prevention:**
- Only the `anon` key goes in client-side code (it's designed to be public)
- The `service_role` key goes only in server-side functions via Netlify environment variables
- Add `.env` to `.gitignore` before creating it
- Use Netlify's environment variable UI, not `netlify.toml`, for secrets
- Audit which Supabase client instance (public vs admin) each function uses

**Detection:** `SUPABASE_SERVICE_ROLE_KEY` appearing in browser network tab or page source. `.env` files in git history.

**Relevant phase:** Infrastructure setup phase -- must be correct from the start.

**Confidence:** HIGH -- standard security practice, but frequently violated in BaaS projects.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Planning/Scoping | Scope creep into full PM system (Pitfall 2) | Define hard MVP boundaries; ship static site first |
| Framework Migration | Template porting instead of rebuilding (Pitfall 3) | Start from Astro template; migrate content only |
| Framework Migration | Rendering mode misconfiguration (Pitfall 4) | Use `output: 'hybrid'`; document SSR vs SSG pages |
| Content Migration | Publication pipeline breakage (Pitfall 7) | Map YAML schema first; test in isolation |
| Design/UI | CSS debt carryover (Pitfall 8) | Start CSS from scratch with scoped styles |
| Design/UI | Accessibility regression (Pitfall 10) | Integrate a11y checks into component workflow |
| Infrastructure Setup | Supabase pausing (Pitfall 1) | GitHub Actions keep-alive cron |
| Infrastructure Setup | Secret key exposure (Pitfall 11) | Anon key client-side only; service key in env vars |
| Auth Implementation | Over-engineering roles (Pitfall 9) | Magic link + 2 roles + RLS |
| Auth Implementation | Cold start UX (Pitfall 6) | Client-side auth check; edge functions |
| Backend Integration | Database storage abuse (Pitfall 5) | Use Supabase Storage; file refs in DB |

## Sources

- [Supabase Pricing - UI Bakery](https://uibakery.io/blog/supabase-pricing) -- free tier limits breakdown
- [Supabase Pause Prevention - GitHub](https://github.com/travisvn/supabase-pause-prevention) -- workaround for project pausing
- [Astro Hugo Migration Guide](https://docs.astro.build/en/guides/migrate-to-astro/from-hugo/) -- official migration documentation
- [Migrating from Hugo to Astro - Elio Struyf](https://www.eliostruyf.com/migration-story-hugo-astro/) -- real-world migration experience
- [Lessons from AI-assisted migration to Astro](https://bennet.org/archive/lessons-from-ai-assisted-migration-to-astro/) -- shortcode conversion challenges
- [Supabase & Astro Integration Docs](https://docs.astro.build/en/guides/backend/supabase/) -- official SSR auth setup
- [Secure SSR Auth with Supabase and Astro - freeCodeCamp](https://www.freecodecamp.org/news/build-secure-ssr-authentication-with-supabase-astro-and-cloudflare-turnstile/) -- cookie security patterns
- [Making the Most of Supabase Free Tier - Medium](https://medium.com/@reliabledataengineering/making-the-most-of-supabases-free-tier-a-practical-guide-ef4817d84a26) -- free tier optimization
- [Netlify Functions Overview](https://docs.netlify.com/build/functions/overview/) -- serverless function limits and cold starts

---

*Pitfalls audit: 2026-04-12*
