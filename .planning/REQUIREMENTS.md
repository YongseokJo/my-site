# Requirements: Yongseok Jo Professional Academic Website

**Defined:** 2026-04-12
**Core Value:** One authoritative place where anyone can find Yongseok Jo's research, software, and professional identity — and where collaborators can actively engage with his projects.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Framework & Design

- [ ] **FRMK-01**: Site rebuilt on Astro 5.x with islands architecture, deployed on Netlify
- [ ] **FRMK-02**: Existing Hugo content (Markdown, YAML publications) migrated to Astro Content Collections
- [ ] **FRMK-03**: Tailwind CSS v4 design system with professional, clean, creative, academic aesthetic
- [ ] **FRMK-04**: Dark mode toggle that persists user preference across sessions
- [ ] **FRMK-05**: Responsive mobile-first layout verified on phone, tablet, and desktop
- [ ] **FRMK-06**: Page load under 2 seconds on first visit

### Professional Presence

- [ ] **PROF-01**: Homepage centered on research theme (first star clusters and black holes in the early universe) with visual/atmospheric design, prominent buttons for simulation package and arXiv app, and brief bio or bio link at the bottom
- [ ] **PROF-02**: About page with full bio, avatar, academic background, and CV download (PDF)
- [ ] **PROF-03**: Social/academic profile links (Google Scholar, ORCID, GitHub, LinkedIn) in consistent placement
- [ ] **PROF-04**: Contact page with form submission (Netlify Forms initially, migrate to Supabase later)
- [ ] **PROF-05**: Clear navigation with 5-6 menu items reachable from any page

### Publications

- [ ] **PUBL-01**: Publications page listing all papers from existing YAML data
- [ ] **PUBL-02**: Filter publications by project, year, and type
- [ ] **PUBL-03**: Author highlighting (bold "Jo, Yongseok" in author lists)
- [ ] **PUBL-04**: External links to paper sources (DOI, arXiv, journal)

### Research Projects

- [ ] **RSRCH-01**: Research projects section with overview cards linking to detail pages
- [ ] **RSRCH-02**: Each project detail page shows description, related publications, and status
- [ ] **RSRCH-03**: Research projects cover both scientific and machine learning work

### Simulation Package

- [ ] **SIM-01**: Simulation package overview page (what it is, features, quick-start guide)
- [ ] **SIM-02**: Installation and getting-started documentation pages
- [ ] **SIM-03**: Developer/contributor list page showing team members and roles
- [ ] **SIM-04**: Issue/bug reporting form for simulation users (authenticated via Supabase)
- [ ] **SIM-05**: Project proposal submission form for collaborators (authenticated)
- [ ] **SIM-06**: Developer dashboard showing assigned issues and proposal status
- [ ] **SIM-07**: Role-based access control (admin, developer, viewer) for simulation collaborators

### ArXiv App

- [ ] **ARXV-01**: App landing page with device mockups, feature highlights, and download/TestFlight CTA
- [ ] **ARXV-02**: Beta signup form collecting name and email
- [ ] **ARXV-03**: Tutorials and documentation section with screenshot-based how-to guides
- [ ] **ARXV-04**: Feedback/feature-request form with category selection (bug, feature request, general)

### Backend Infrastructure

- [ ] **INFRA-01**: Supabase project set up with database schema for users, issues, proposals, feedback
- [ ] **INFRA-02**: Supabase Auth with email/password for simulation collaborators
- [ ] **INFRA-03**: Row-Level Security policies protecting user data
- [ ] **INFRA-04**: Keep-alive mechanism preventing Supabase free-tier project pausing

### SEO & Search

- [ ] **SEO-01**: Meta tags and OpenGraph data on all pages
- [ ] **SEO-02**: Structured data for publications (schema.org)
- [ ] **SEO-03**: Client-side search across all site content (Pagefind)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhancements

- **ENH-01**: Research project visual timelines showing evolution and milestones
- **ENH-02**: Publication BibTeX one-click export
- **ENH-03**: Blog section with Giscus comments (GitHub Discussions)
- **ENH-04**: Email notification system for issue/proposal updates
- **ENH-05**: Multi-language support (i18n)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real-time chat / forum | Massive moderation burden for solo academic; use GitHub Discussions instead |
| Full project management (Gantt, sprints, boards) | Reinventing existing tools; lightweight issues + proposals sufficient |
| User-uploaded file attachments | Storage limits on free tier; link to external files instead |
| Video tutorials | Hosting costs; use screenshot-based guides with GIF animations |
| OAuth / SSO (Google, GitHub) | Only ~5-50 collaborators; email/password sufficient |
| AI-powered search / chatbot | Too complex; Pagefind handles static search well |
| Mobile native app for website | Website is sufficient; arXiv app is a separate project |
| Self-hosted infrastructure | Going hybrid Netlify + Supabase free tier |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| (populated by roadmapper) | | |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 0
- Unmapped: 30

---
*Requirements defined: 2026-04-12*
*Last updated: 2026-04-12 after initial definition*
