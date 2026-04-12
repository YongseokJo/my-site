# Feature Research

**Domain:** Academic professional website with research software portal and app promotion
**Researched:** 2026-04-12
**Confidence:** HIGH (well-established domain with clear conventions)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or unprofessional.

#### A. Professional Academic Presence

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Professional bio with headshot | First thing visitors look for; establishes credibility | LOW | Already partially exists. Needs polish, not rebuild |
| Publications list with filtering | Core academic currency; colleagues and hiring committees check this | LOW | Exists as YAML-driven list. Add filtering by project/year/type |
| Downloadable CV (PDF) | Hiring committees, grant reviewers, and collaborators expect one-click access | LOW | Static PDF hosted on the site, link in header/about |
| Research projects overview | Visitors need to understand what you work on at a glance | MEDIUM | Each project gets a card with summary, key papers, status |
| Contact page with form | People need a way to reach you without hunting for email | LOW | Simple form via Netlify Forms (free) or Formspree |
| Responsive mobile layout | 45-70% of academic web traffic is mobile | LOW | Already exists; verify during redesign |
| Fast page load (<2s) | Slow sites get abandoned; academics browse many pages quickly | LOW | Static site on CDN handles this naturally |
| Clear navigation (5-6 items max) | Berkeley guidelines: reach any content in 3 clicks or fewer | LOW | Menu: Home, Research, Software, ArXiv App, About, Contact |
| Social/academic profile links | Google Scholar, ORCID, GitHub, LinkedIn are expected outbound links | LOW | Already exists in hero; ensure consistent placement |
| SEO basics (meta tags, OpenGraph) | Papers and projects should be discoverable and shareable | LOW | Partially done per recent commits; complete for all pages |

#### B. Simulation Package Portal

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Package overview page | Users need to understand what the software does before engaging | LOW | Hero + feature list + quick-start |
| Installation/getting-started docs | First thing any developer looks for | MEDIUM | Markdown-based docs section, rendered as pages |
| Issue/bug reporting form | Users who hit bugs need a structured way to report them | MEDIUM | Form submission to Supabase table; admin reviews |
| Project proposal submission | Collaborators need to propose new simulation projects | MEDIUM | Authenticated form with title, description, rationale fields |
| Developer/contributor list | Shows who is involved; builds trust in the project | LOW | Static or Supabase-driven list of contributors with roles |
| Release notes / changelog | Users need to know what changed between versions | LOW | Markdown page updated with each release |

#### C. ArXiv App Promotion

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| App landing page with screenshots | Standard for any app; visitors decide in 5 seconds | MEDIUM | Hero with device mockups, feature highlights, CTA |
| Feature overview section | Users need to know what the app does before downloading | LOW | 3-4 feature cards with icons and short descriptions |
| Download / App Store links | The entire point of a landing page | LOW | Buttons linking to App Store / TestFlight |
| Beta signup form | Closed beta requires collecting interested users | LOW | Email + name form, stored in Supabase or email list |
| Basic tutorials/documentation | Beta users need help getting started | MEDIUM | Markdown-based tutorial pages with screenshots |

### Differentiators (Competitive Advantage)

Features that make this site stand out from a typical academic Hugo site or GitHub README.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Unified hub (research + software + app) | Most academics scatter presence across 5+ platforms; one authoritative place is rare and valuable | MEDIUM | Architecture challenge: cohesive design across diverse content types |
| Interactive project management dashboard | Collaborators can submit proposals, track issues, see project status -- not just read docs | HIGH | Requires auth + Supabase backend + custom UI components |
| Author-highlighted publication cards | Automatically highlight Yongseok's name in author lists; visual emphasis on contribution role | LOW | Template logic during render; already partially implemented |
| Research project timelines | Visual timeline showing project evolution, key milestones, publications | MEDIUM | Could use a simple CSS timeline component per project |
| Feedback/feature-request system for ArXiv app | Structured feedback collection (not just email) shows professionalism and builds user trust | MEDIUM | Categorized form (bug, feature request, general) stored in Supabase |
| User accounts for simulation collaborators | Developers can log in, see their assigned issues, track proposal status | HIGH | Supabase Auth with role-based access (admin, developer, viewer) |
| Dark mode toggle | Developers and academics often prefer dark mode; signals modern design sensibility | LOW | CSS custom properties + JS toggle; straightforward with any modern framework |
| Publication BibTeX export | One-click BibTeX copy for any publication; researchers love this | LOW | Generate from existing YAML data at build time or on click |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems -- especially for a solo academic on free-tier infrastructure.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time chat / forum for simulation users | "Community building" | Massive moderation burden for one person; free-tier DB limits; chat needs always-on backend | Use GitHub Discussions for the simulation repo (free, indexed, no maintenance) |
| Full-blown project management (Gantt, sprints, boards) | "We need project management" | Reinventing OpenProject/GitHub Projects; enormous scope for marginal value | Lightweight issue tracker + proposal forms only; link to GitHub for detailed PM |
| Blog with comments | "Every academic site has a blog" | Comment moderation is endless; spam is relentless; blogs require consistent content | Blog section is fine; use static comments (Giscus via GitHub Discussions) or no comments |
| AI-powered search / chatbot | Trendy in higher-ed sites | Way too complex for a personal site; API costs break free-tier constraint | Simple client-side search (Pagefind or Fuse.js) -- zero cost, works great for static sites |
| User-uploaded file attachments on proposals | "Attach supplementary materials" | Storage limits (1GB free on Supabase); security concerns with arbitrary uploads | Text-only proposals with links to external files (Google Drive, Dropbox) |
| Email notifications system | "Notify me when my issue is updated" | Requires email service (SendGrid, etc.); delivery issues; free-tier limits | Manual email from admin; or use Supabase webhooks to trigger a free-tier email service later |
| Multi-language support (i18n) | "Reach international audience" | Doubles content maintenance burden; translation quality issues | English only; academic lingua franca; add i18n only if specific demand emerges |
| Video tutorials for ArXiv app | "Video is more engaging" | Hosting costs (no free video CDN at scale); production time; maintenance when UI changes | Screenshot-based tutorials with GIF animations for key interactions |
| Countdown timer / FOMO tactics for beta | "Creates urgency" | Feels manipulative for an academic audience; erodes trust | Simple "Join the beta" with honest messaging about current status |
| SSO / OAuth with Google/GitHub for all visitors | "Easier login" | Only simulation collaborators need accounts; OAuth adds complexity for <20 users | Simple email/password auth via Supabase for the small collaborator group |

## Feature Dependencies

```
[Supabase Backend Setup]
    |
    +--requires--> [User Authentication]
    |                  |
    |                  +--requires--> [Role-Based Access (admin/dev/viewer)]
    |                  |                  |
    |                  |                  +--enables--> [Project Proposal Submission]
    |                  |                  +--enables--> [Issue Reporting (authenticated)]
    |                  |                  +--enables--> [Developer Dashboard]
    |                  |
    |                  +--enables--> [Beta Signup Form (stores to Supabase)]
    |
    +--enables--> [Issue Tracking Storage]
    +--enables--> [Proposal Storage]

[Static Site Framework (Astro/Next.js/Hugo)]
    |
    +--enables--> [Publications Page (from YAML)]
    +--enables--> [Research Projects Section]
    +--enables--> [Simulation Package Docs]
    +--enables--> [ArXiv App Landing Page]
    +--enables--> [Contact Form (Netlify Forms)]
    +--enables--> [Client-Side Search]

[Visual Redesign]
    +--should-precede--> [All public-facing pages]

[Research Projects Section]
    +--enhances--> [Publications Page] (link papers to projects)

[ArXiv App Landing Page]
    +--enhanced-by--> [Beta Signup Form]
    +--enhanced-by--> [Tutorials Section]
    +--enhanced-by--> [Feedback/Feature Request Form]

[Contact Form]
    +--conflicts-with--> [Complex CRM integration] (overkill for this scale)
```

### Dependency Notes

- **User Authentication requires Supabase Backend:** All authenticated features (proposals, issues, dashboards) depend on the backend being set up first
- **Role-Based Access requires Authentication:** Cannot assign roles without user identity; this is the gating feature for all project management
- **Visual Redesign should precede public-facing pages:** Building pages on a design system that will change wastes effort; lock design first
- **Research Projects enhances Publications:** Publications can link to parent projects, but publications work standalone too
- **Beta Signup can work without Supabase initially:** A simple Netlify Forms or Google Form works as v1; migrate to Supabase later

## MVP Definition

### Launch With (v1) -- Professional Presence + Static Showcase

Minimum viable: the site looks great and covers all static content needs.

- [ ] Visual redesign with professional academic aesthetic -- the foundation everything else sits on
- [ ] Homepage with hero, brief bio, research highlights, software links
- [ ] Publications page with filtering (by project, year, type) and author highlighting
- [ ] Research projects section (overview cards linking to detail pages with related papers)
- [ ] Simulation package overview page (what it is, features, getting started, contributor list)
- [ ] ArXiv app landing page (screenshots, features, download/TestFlight link, beta signup via Netlify Forms)
- [ ] About page with full bio, CV download, academic profile links
- [ ] Contact form (Netlify Forms -- zero backend needed)
- [ ] Client-side search (Pagefind -- built at deploy time, zero cost)
- [ ] SEO completion (meta tags, OpenGraph, structured data for publications)

### Add After Validation (v1.x) -- Dynamic Features

Add once the static site is polished and the framework supports dynamic routes.

- [ ] Supabase backend integration -- when collaborators actively need to submit proposals/issues
- [ ] User authentication for simulation collaborators -- when you have 3+ active contributors
- [ ] Issue reporting form (authenticated) -- when bug reports via email become unmanageable
- [ ] Project proposal submission form -- when proposal volume justifies structured intake
- [ ] ArXiv app feedback/feature-request form -- when beta user count exceeds ~10
- [ ] ArXiv app tutorials section -- when beta users report confusion about features
- [ ] Dark mode toggle -- when redesign is stable and you have bandwidth

### Future Consideration (v2+)

Features to defer until the core site is mature and user base grows.

- [ ] Developer dashboard (view assigned issues, proposal status) -- when collaborator count exceeds ~10
- [ ] Role-based access control (admin vs developer vs viewer) -- when dashboard exists
- [ ] Research project timelines -- nice visual but not blocking anything
- [ ] Static blog with Giscus comments -- only if you plan to write regularly
- [ ] Email notification system -- only if manual email becomes unsustainable

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Visual redesign | HIGH | MEDIUM | P1 |
| Publications with filtering | HIGH | LOW | P1 |
| Research projects section | HIGH | MEDIUM | P1 |
| Simulation package overview | HIGH | LOW | P1 |
| ArXiv app landing page | HIGH | MEDIUM | P1 |
| Contact form (Netlify Forms) | MEDIUM | LOW | P1 |
| CV download | MEDIUM | LOW | P1 |
| Client-side search | MEDIUM | LOW | P1 |
| SEO completion | MEDIUM | LOW | P1 |
| Beta signup form | MEDIUM | LOW | P1 |
| Supabase backend setup | HIGH | HIGH | P2 |
| User authentication | HIGH | HIGH | P2 |
| Issue reporting form | MEDIUM | MEDIUM | P2 |
| Proposal submission form | MEDIUM | MEDIUM | P2 |
| ArXiv feedback form | MEDIUM | MEDIUM | P2 |
| ArXiv tutorials | MEDIUM | MEDIUM | P2 |
| Dark mode | LOW | LOW | P2 |
| Developer dashboard | MEDIUM | HIGH | P3 |
| Role-based access | MEDIUM | MEDIUM | P3 |
| Project timelines | LOW | MEDIUM | P3 |
| Blog with comments | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for launch -- professional presence and static content
- P2: Should have -- dynamic features added when collaborators need them
- P3: Nice to have -- defer until user base justifies the effort

## Competitor Feature Analysis

| Feature | Hugo Academic (Wowchemy) | GitHub Pages + Jekyll | Personal Next.js Sites | Our Approach |
|---------|--------------------------|----------------------|----------------------|--------------|
| Publications | Built-in with BibTeX | Manual or plugin | Custom components | YAML-driven with filtering and author highlighting |
| Research projects | Template sections | Basic pages | Custom pages | Dedicated section with paper linkage |
| Software docs | Not built-in | Limited | Custom | Integrated docs section within the site |
| App landing page | Not built-in | Not built-in | Common pattern | Dedicated landing with beta signup |
| Dynamic features (auth, forms) | Not possible | Not possible | Full support | Hybrid: static + Supabase backend |
| Project management | Not possible | Not possible | Possible but rare | Lightweight proposals + issues (unique differentiator) |
| Design flexibility | Theme-constrained | Theme-constrained | Full control | Full control with custom design system |
| Search | Limited | None built-in | Custom | Pagefind (zero-cost, static) |
| Dark mode | Theme-dependent | Manual | Common | CSS custom properties toggle |

## Supabase Free-Tier Budget for Dynamic Features

Key constraints that shape feature design:

| Resource | Free Limit | Our Usage Estimate | Headroom |
|----------|-----------|-------------------|----------|
| Database | 500 MB | <10 MB (proposals, issues, users) | Abundant |
| Auth MAUs | 50,000 | <50 (collaborators) | Abundant |
| File storage | 1 GB | 0 (no file uploads -- by design) | N/A |
| Edge functions | 500K/month | <1K/month | Abundant |
| Egress | 5 GB | <500 MB | Comfortable |

**Verdict:** Free tier is more than sufficient for this use case. The deliberate anti-feature of avoiding file uploads keeps storage at zero.

**Warning:** Free projects pause after 1 week of inactivity. For a personal site with occasional collaborator activity, you will need to either (a) set up a cron ping to keep the project active, or (b) accept that the first request after inactivity will be slow (~10s cold start).

## Sources

- [Berkeley Townsend Center - Personal Academic Webpages Tips](https://townsendcenter.berkeley.edu/blog/personal-academic-webpages-how-tos-and-tips-better-site)
- [The Academic Designer - How to Make an Academic Website](https://theacademicdesigner.com/2023/how-to-make-an-academic-website/)
- [Winners of Best Personal Academic Websites 2025](https://theacademicdesigner.com/2025/winners-of-the-best-personal-academic-websites-contest-2025/)
- [Supabase Pricing & Free Tier Limits 2026](https://uibakery.io/blog/supabase-pricing)
- [Beta Landing Page Best Practices](https://www.vwthemes.com/blogs/all/beta-landing-page)
- [OpenProject for Universities and Research](https://www.openproject.org/project-management-universities-research/)
- [App Landing Page Examples](https://landingi.com/landing-page/app-examples/)
- [Mobile App Landing Page Best Practices](https://tyrads.com/mobile-app-landing-page/)

---
*Feature research for: Academic professional website with research software portal and app promotion*
*Researched: 2026-04-12*
