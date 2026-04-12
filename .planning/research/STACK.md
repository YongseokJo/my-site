# Technology Stack

**Project:** Yongseok Jo Professional Academic Website
**Researched:** 2026-04-12

## Decision: Switch from Hugo to Astro

**Verdict: Switch to Astro.** Hugo cannot support the dynamic features this project needs (user accounts, project proposals, issue tracking, beta signups). Astro is the right replacement because:

1. **Content-first by design** -- Markdown/YAML content migrates directly; Astro has an official Hugo migration guide
2. **Islands architecture** -- Static pages ship zero JS; dynamic components (login forms, issue tracker) hydrate independently
3. **React islands for dynamic features** -- Use React components with `client:load` / `client:visible` directives for interactive sections while keeping research/publications pages fully static
4. **Netlify deployment works today** -- `@astrojs/netlify` adapter supports SSR, server islands, and Netlify Image CDN
5. **Ecosystem momentum** -- #1 satisfaction, #1 interest, #2 usage in 2025 State of JS; acquired by Cloudflare Jan 2026, remains MIT-licensed

**Why NOT Next.js:** Overkill for a content-first academic site. Ships 40-50KB minimum JS runtime even for static pages. Astro ships zero JS for static pages. Next.js is better for SaaS dashboards, not hybrid academic sites.

**Why NOT stay with Hugo:** Hugo has no component model for interactive UI, no built-in way to add authenticated pages, and Go templates are painful for complex dynamic layouts. Every dynamic feature would require bolting on separate JS apps.

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Astro | 5.x (stable: ~5.18) | Static site generation + server islands | Content-first, zero-JS static pages, React islands for dynamic parts, official Netlify adapter | HIGH |
| React | 19.x | Interactive UI components (islands) | Largest ecosystem for UI components, shadcn/ui support, forms libraries | HIGH |
| TypeScript | 5.x | Type safety across components | Catches errors at build time, better DX with Supabase client types | HIGH |

### Styling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | 4.2.x | Utility-first styling | CSS-native theme variables (no config file), 5x faster builds with Rust engine, first-class Astro support | HIGH |
| shadcn/ui | latest | Pre-built accessible React components | Copy-paste components (not a dependency), works with Tailwind v4, Astro installation guide exists | HIGH |

### Backend as a Service (BaaS)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Supabase | latest | Auth, database, storage | PostgreSQL (real SQL for relational project data), 50K MAU free auth, Row Level Security, open-source | HIGH |

**Why Supabase over Firebase:**

| Criterion | Supabase | Firebase |
|-----------|----------|---------|
| Database | PostgreSQL (relational -- ideal for projects/issues/users) | Firestore (NoSQL -- awkward for relational project data) |
| Free Auth | 50K MAU | Generous but less documented limits |
| Pricing model | Predictable tiers, no per-request billing | Per-read/write billing, surprise costs at scale |
| Vendor lock-in | Standard Postgres, can migrate anywhere | Proprietary, locked to Google |
| Astro integration | Official docs guide, SSR auth examples | Community adapters only |
| Open source | Yes (MIT) | No |

**Supabase free tier limits (critical to know):**
- 500 MB database storage
- 1 GB file storage
- 5 GB egress
- 50K monthly active users (auth)
- 500K edge function invocations
- 2 active projects maximum
- **7-day inactivity pause** -- project pauses if no DB activity for 7 days. Mitigate with a scheduled ping (cron job or Netlify scheduled function).

### Forms and Validation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| React Hook Form | 7.x | Form state management | Minimal re-renders, works with shadcn/ui Field components | HIGH |
| Zod | 3.x | Schema validation | TypeScript-first, integrates with RHF via zodResolver, shared validation client+server | HIGH |

### Content Management

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Astro Content Collections | built-in | Typed Markdown/MDX content | Type-safe frontmatter, schema validation with Zod, replaces Hugo data files | HIGH |
| MDX | via @astrojs/mdx | Rich content pages | Embed React components in Markdown (replaces Hugo shortcodes) | HIGH |

### Infrastructure

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Netlify | free tier | Hosting, CDN, serverless functions | Already in use, Astro adapter is first-class, 100GB bandwidth/month free | HIGH |
| @astrojs/netlify | 6.x | SSR adapter | Enables server islands, Astro actions, sessions on Netlify | HIGH |

### Dev Tooling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Biome | 1.x | Linting + formatting | Single tool replaces ESLint + Prettier, faster (Rust-based) | MEDIUM |
| @supabase/supabase-js | 2.x | Supabase client SDK | TypeScript types auto-generated from DB schema | HIGH |

## What NOT to Use

| Technology | Why Not |
|------------|---------|
| Hugo | Cannot support dynamic features; Go templates are painful for UI components |
| Next.js | Overkill; ships JS runtime on every page; Vercel-optimized (we deploy to Netlify) |
| Firebase | NoSQL is wrong fit for relational project/issue data; vendor lock-in; per-request pricing |
| Gatsby | Effectively abandoned; slow builds; GraphQL overhead for simple content |
| WordPress | Completely wrong paradigm for this use case |
| CSS Modules / Styled Components | Tailwind v4 is faster, more consistent, and pairs with shadcn/ui |
| Prisma | Unnecessary ORM layer; Supabase client SDK provides typed queries directly |
| NextAuth / Auth.js | Supabase Auth is built-in and free; no need for separate auth library |
| Drizzle ORM | Same as Prisma -- Supabase JS client is sufficient for this project's data access needs |

## Migration Path: Hugo to Astro

### What migrates directly
- **Markdown content files** -- Astro reads `.md` with YAML frontmatter natively
- **YAML data files** -- Content Collections can ingest existing publication YAML
- **Static assets** -- Images, icons, files copy to `public/` directory
- **Netlify config** -- `netlify.toml` needs minor updates for Astro build command

### What needs rewriting
- **Hugo templates** -- Rewrite as `.astro` components (cleaner syntax, similar concepts)
- **Hugo shortcodes** -- Replace with MDX components or Astro components
- **Hugo partials** -- Become Astro components (actually simpler)
- **CSS** -- Migrate from custom CSS to Tailwind v4 classes (visual redesign anyway)
- **Python BibTeX pipeline** -- Can keep as build script OR rewrite as Node script using `bibtex-parser` npm package

### Migration complexity: MODERATE
The content migration is straightforward. The template rewrite is the bulk of the work, but since a complete visual redesign is planned anyway, there is no wasted effort -- every template would be rewritten regardless.

## Installation

```bash
# Create Astro project
npm create astro@latest my-site -- --template minimal

# Core integrations
npx astro add react
npx astro add tailwind
npx astro add mdx
npx astro add netlify

# UI components (shadcn/ui)
npx shadcn@latest init

# Backend
npm install @supabase/supabase-js

# Forms and validation
npm install react-hook-form @hookform/resolvers zod

# Dev tooling
npm install -D @biomejs/biome
```

## Architecture Sketch

```
Static Pages (zero JS)          Dynamic Islands (React + Supabase)
========================         ==================================
- Homepage / Hero               - Login / Register form
- Research projects              - Project proposal submission  
- Publications list              - Issue tracker dashboard
- About / CV                    - Beta signup form
- ArXiv app landing page         - Error report form
- Tutorials / docs               - Developer management panel
```

Each dynamic island hydrates independently. A visitor reading publications loads zero JavaScript. A collaborator submitting a project proposal loads only the React components needed for that form.

## Supabase Database Schema (High-Level)

```
users (managed by Supabase Auth)
  - id, email, role (admin/developer/visitor)

projects
  - id, name, description, status, created_by, created_at

project_proposals  
  - id, title, description, status (pending/approved/rejected), submitted_by, reviewed_by

issues
  - id, project_id, title, description, priority, status, assigned_to, created_by

developers
  - id, user_id, project_id, role (lead/contributor), joined_at

beta_signups
  - id, email, platform (macOS/iOS), signed_up_at

feedback
  - id, type (bug/feature), title, description, submitted_by, created_at
```

Row Level Security (RLS) policies on every table. Admin sees all; developers see their projects; visitors can submit proposals and feedback.

## Sources

- [Astro Official Docs - Islands Architecture](https://docs.astro.build/en/concepts/islands/)
- [Astro Official Docs - Hugo Migration Guide](https://docs.astro.build/en/guides/migrate-to-astro/from-hugo/)
- [Astro Official Docs - Supabase Integration](https://docs.astro.build/en/guides/backend/supabase/)
- [Astro Official Docs - Netlify Deployment](https://docs.astro.build/en/guides/deploy/netlify/)
- [Astro 6 Beta Announcement](https://astro.build/blog/astro-6-beta/)
- [shadcn/ui Astro Installation](https://ui.shadcn.com/docs/installation/astro)
- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase vs Firebase Comparison](https://supabase.com/alternatives/supabase-vs-firebase)
- [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4)
- [Netlify Astro Adapter Docs](https://docs.netlify.com/build/frameworks/framework-setup-guides/astro/)
- [Astro vs Next.js Performance Comparison](https://eastondev.com/blog/en/posts/dev/20251202-astro-vs-nextjs-comparison/)
- [Supabase Free Tier Pricing 2026](https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance)
