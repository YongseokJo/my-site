# Roadmap: Yongseok Jo Professional Academic Website

## Overview

This roadmap delivers a professional academic website in five phases. The first three phases build and ship the complete static site -- framework migration, all academic content, and product pages with SEO. Only after the public site is polished and live do we add backend infrastructure (Phase 4) and dynamic collaboration features (Phase 5). This ordering ensures the primary value -- a polished professional presence -- is never held hostage to backend complexity.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Framework Migration & Design System** - Rebuild on Astro 5.x with Tailwind v4, migrate content, establish responsive layout and design tokens
- [ ] **Phase 2: Academic Content** - Homepage, about/CV, publications with filtering, research projects, contact form, navigation
- [ ] **Phase 3: Product Pages & SEO** - ArXiv app landing/tutorials/signup/feedback, simulation package overview/docs/contributors, SEO and search
- [ ] **Phase 4: Backend Infrastructure & Auth** - Supabase project, database schema, auth system, RLS policies, keep-alive mechanism
- [ ] **Phase 5: Dynamic Collaboration Features** - Authenticated issue reporting, proposal submission, developer dashboard, role-based access

## Phase Details

### Phase 1: Framework Migration & Design System
**Goal**: The site runs on Astro with a professional design system, serving existing content from Content Collections on Netlify
**Depends on**: Nothing (first phase)
**Requirements**: FRMK-01, FRMK-02, FRMK-03, FRMK-04, FRMK-05, FRMK-06
**Success Criteria** (what must be TRUE):
  1. Site deploys successfully on Netlify from Astro build pipeline
  2. All existing Hugo content (Markdown pages, YAML publications) is accessible via Astro Content Collections
  3. Dark mode toggle works and preference persists across browser sessions
  4. Site renders correctly on mobile, tablet, and desktop viewports
  5. Any page loads in under 2 seconds on first visit
**Plans:** 4 plans
Plans:
- [x] 01-01-PLAN.md -- Scaffold Astro project with Tailwind v4 design system and base layout
- [x] 01-02-PLAN.md -- Build Navigation, Footer, and dark mode toggle components
- [x] 01-03-PLAN.md -- Migrate content collections and rewrite BibTeX pipeline to Node.js
- [x] 01-04-PLAN.md -- Create page routes, update Netlify config, visual verification
**UI hint**: yes

### Phase 2: Academic Content
**Goal**: Visitors can explore Yongseok's complete academic identity -- research-themed homepage, publications, research projects, about/CV, and contact
**Depends on**: Phase 1
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04, PROF-05, PUBL-01, PUBL-02, PUBL-03, PUBL-04, RSRCH-01, RSRCH-02, RSRCH-03
**Success Criteria** (what must be TRUE):
  1. Homepage conveys the research theme (first star clusters and black holes in the early universe) with atmospheric design, prominent buttons for simulation package and arXiv app, and bio link
  2. Publications page lists all papers with filtering by project/year/type, author highlighting on "Jo, Yongseok", and links to DOI/arXiv/journal
  3. Research projects section shows overview cards linking to detail pages with descriptions, related publications, and status -- covering both scientific and ML work
  4. About page displays full bio, avatar, academic background, CV download (PDF), and social/academic profile links
  5. Contact form submits successfully and navigation reaches all main sections from any page
**Plans:** 4 plans
Plans:
- [x] 02-01-PLAN.md -- Install shadcn components, create HomeLayout, and build cosmic homepage
- [x] 02-02-PLAN.md -- Publications page with filtering, author highlighting, and navigation update
- [x] 02-03-PLAN.md -- Research projects page with expand-in-place cards
- [x] 02-04-PLAN.md -- About page with CV/academic links and contact form with Netlify Forms
**UI hint**: yes

### Phase 3: Product Pages & SEO
**Goal**: The arXiv app and simulation package have complete public-facing pages, and all site pages are discoverable via search engines and on-site search
**Depends on**: Phase 2
**Requirements**: ARXV-01, ARXV-02, ARXV-03, ARXV-04, SIM-01, SIM-02, SIM-03, SEO-01, SEO-02, SEO-03
**Success Criteria** (what must be TRUE):
  1. ArXiv app landing page shows device mockups, feature highlights, and download/TestFlight CTA
  2. Beta signup form collects name and email; feedback form accepts categorized submissions (bug, feature, general)
  3. ArXiv app tutorials section provides screenshot-based how-to guides
  4. Simulation package page shows overview, features, quick-start guide, installation docs, and contributor list with roles
  5. All pages have meta tags and OpenGraph data; publications have schema.org structured data; Pagefind search works across all content
**Plans**: TBD
**UI hint**: yes

### Phase 4: Backend Infrastructure & Auth
**Goal**: Supabase backend is operational with auth, database, and security policies ready for dynamic features
**Depends on**: Phase 3
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04
**Success Criteria** (what must be TRUE):
  1. Supabase project has database tables for users, issues, proposals, and feedback
  2. Simulation collaborators can create an account and log in with email/password
  3. Row-Level Security policies prevent users from accessing other users' data
  4. Keep-alive mechanism runs automatically and prevents Supabase free-tier project pausing

### Phase 5: Dynamic Collaboration Features
**Goal**: Simulation collaborators can submit issues, propose projects, and manage their work through authenticated workflows
**Depends on**: Phase 4
**Requirements**: SIM-04, SIM-05, SIM-06, SIM-07
**Success Criteria** (what must be TRUE):
  1. Authenticated users can submit bug/issue reports for the simulation package
  2. Authenticated collaborators can submit project proposals
  3. Developer dashboard shows a user's assigned issues and proposal statuses
  4. Role-based access (admin, developer, viewer) controls what each collaborator can see and do
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Framework Migration & Design System | 4/4 | Complete | - |
| 2. Academic Content | 0/4 | Planning complete | - |
| 3. Product Pages & SEO | 0/TBD | Not started | - |
| 4. Backend Infrastructure & Auth | 0/TBD | Not started | - |
| 5. Dynamic Collaboration Features | 0/TBD | Not started | - |
