---
phase: 02-academic-content
verified: 2026-04-12T21:20:00Z
status: gaps_found
score: 3/5 must-haves verified
overrides_applied: 0
gaps:
  - truth: "Research projects section shows overview cards linking to detail pages with descriptions, related publications, and status -- covering both scientific and ML work"
    status: failed
    reason: "src/pages/research.astro renders a 'Site Under Construction' placeholder. The ResearchProjects.tsx island and research-projects.ts data file were created in an orphaned commit (ffe3547) that was never merged into the main branch. Both files are absent from the working tree."
    artifacts:
      - path: "src/islands/ResearchProjects.tsx"
        issue: "File does not exist on main branch — only in unreachable commit ffe3547"
      - path: "src/data/research-projects.ts"
        issue: "File does not exist on main branch — only in unreachable commit ffe3547"
      - path: "src/pages/research.astro"
        issue: "Contains placeholder text 'Site Under Construction' with no ResearchProjects island"
    missing:
      - "Cherry-pick or recreate src/islands/ResearchProjects.tsx from commit ffe3547"
      - "Cherry-pick or recreate src/data/research-projects.ts from commit ffe3547"
      - "Rewrite src/pages/research.astro to import and use ResearchProjects island with client:load"
  - truth: "Publications page lists all papers with filtering by project/year/type, author highlighting on 'Jo, Yongseok', and links to DOI/arXiv/journal"
    status: partial
    reason: "Publications page exists with working role and year filters, author highlighting, and external links. However, ROADMAP SC2 specifies filtering 'by project/year/type' — no project-based filter is implemented. The publications.yaml schema has no project field, and PublicationList.tsx only exposes role (first-author/co-author) and year chips. PUBL-02 requires 'filter by project, year, and type'."
    artifacts:
      - path: "src/islands/PublicationList.tsx"
        issue: "Filter state tracks role and year only; no project dimension. Publications YAML has no project field."
    missing:
      - "Either add a project field to publications.yaml schema and implement project filter chips in PublicationList.tsx, OR document that 'role' satisfies 'type' and 'project' scope is deferred with justification"
---

# Phase 2: Academic Content Verification Report

**Phase Goal:** Visitors can explore Yongseok's complete academic identity -- research-themed homepage, publications, research projects, about/CV, and contact
**Verified:** 2026-04-12T21:20:00Z
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths (from ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Homepage conveys the research theme (first star clusters and black holes) with atmospheric design, prominent buttons for simulation package and arXiv app, and bio link | VERIFIED | CosmicHero.astro has headline "First Star Clusters & Black Holes in the Early Universe" with bg.jpg + dark overlay. CTACardPair.astro links to /software (Enzo-Abyss) and /arxiv-app (Readea). BioSummary.astro has "Learn more" link to /about. Note: card titles were renamed from "Simulation Package"/"ArXiv App" to "Enzo-Abyss"/"Readea" via intentional commit 831080d — links and functionality are intact. |
| 2 | Publications page lists all papers with filtering by project/year/type, author highlighting on "Jo, Yongseok", and links to DOI/arXiv/journal | PARTIAL | 11 papers confirmed in publications.yaml. PublicationList.tsx has role (first-author/co-author) and year filters with AND-across/OR-within logic. Author highlighting via string split on "Jo, Yongseok" is implemented. arXiv, DOI, ADS link buttons render conditionally. MISSING: "project" filter dimension (PUBL-02 requires filtering by project; schema and island have no project field). |
| 3 | Research projects section shows overview cards linking to detail pages with descriptions, related publications, and status -- covering both scientific and ML work | FAILED | research.astro renders "Site Under Construction" placeholder text. src/islands/ResearchProjects.tsx and src/data/research-projects.ts do not exist on the main branch. These files were created in orphaned commit ffe3547 (merge of 02-03 branch) which is NOT reachable from main. Confirmed via: `git merge-base --is-ancestor ffe3547 main` returns false. |
| 4 | About page displays full bio, avatar, academic background, CV download (PDF), and social/academic profile links | VERIFIED | about.astro wires AboutProfile (avatar me.JPG + name + title + bio slot via getCollection), AcademicLinks (4 links: Google Scholar, ORCID, GitHub, LinkedIn), CVDownload (href=/files/cv.pdf with download attribute), EducationTimeline (4 entries from education.ts). All components exist and are substantive. |
| 5 | Contact form submits successfully and navigation reaches all main sections from any page | VERIFIED | contact.astro has hidden Netlify form + ContactForm island with client:load. ContactForm.tsx has full validation (name required, email regex, message min-10 chars), onBlur + onSubmit validation, fetch POST to Netlify with URLSearchParams, success/error states. Navigation.astro has 7 links including Publications. Note: 7 items exceeds PROF-05's "5-6 menu items" requirement -- the plan explicitly documents this as justified. |

**Score:** 3/5 truths verified (1 failed, 1 partial)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/ui/card.tsx` | shadcn Card component | VERIFIED | Exists, exports Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| `src/components/ui/badge.tsx` | shadcn Badge | VERIFIED | Exists |
| `src/components/ui/input.tsx` | shadcn Input | VERIFIED | Exists |
| `src/components/ui/textarea.tsx` | shadcn Textarea | VERIFIED | Exists |
| `src/components/ui/label.tsx` | shadcn Label | VERIFIED | Exists |
| `src/components/ui/separator.tsx` | shadcn Separator | VERIFIED | Exists |
| `src/layouts/HomeLayout.astro` | Full-width hero layout | VERIFIED | Has `slot name="hero"` and `max-w-[700px]` container |
| `src/components/CosmicHero.astro` | Cosmic hero with bg.jpg + headline | VERIFIED | Has bg.jpg background, rgba(10,14,26) overlay, "First Star Clusters" headline |
| `src/components/CTACardPair.astro` | Two CTA cards for sim + arXiv | VERIFIED | Has Enzo-Abyss (/software) and Readea (/arxiv-app) cards with buttons |
| `src/components/BioSummary.astro` | Bio with Learn more link | VERIFIED | Has "Learn more" href="/about" |
| `src/pages/index.astro` | Homepage using HomeLayout | VERIFIED | Imports HomeLayout, uses slot="hero" for CosmicHero |
| `src/pages/publications.astro` | Publications page at /publications | VERIFIED | Has getCollection("publications"), client:load on PublicationList |
| `src/islands/PublicationList.tsx` | React island with filter chips + cards | VERIFIED | Exports default, has activeRoles/activeYears state, author highlighting, link buttons |
| `src/components/Navigation.astro` | Nav with Publications link | VERIFIED | Has Publications link at /publications between Research and Enzo-Abyss |
| `src/data/research-projects.ts` | Research project data | MISSING | File absent from main branch (in orphaned commit ffe3547 only) |
| `src/islands/ResearchProjects.tsx` | React island with expand-in-place cards | MISSING | File absent from main branch (in orphaned commit ffe3547 only) |
| `src/pages/research.astro` | Research page at /research | STUB | File exists but renders "Site Under Construction" placeholder; no ResearchProjects import |
| `src/components/AboutProfile.astro` | Avatar, name, title, bio slot | VERIFIED | Has me.JPG, "Yongseok Jo" h1, title p, slot for Content |
| `src/components/AcademicLinks.astro` | 4 academic profile links | VERIFIED | Has Scholar, ORCID, GitHub, LinkedIn with correct URLs |
| `src/components/CVDownload.astro` | CV download button | VERIFIED | href="/files/cv.pdf" with download attribute |
| `src/components/EducationTimeline.astro` | Education/career list | VERIFIED | Imports from education.ts, renders reverse-chrono entries |
| `src/data/education.ts` | Education data | VERIFIED | Exports educationEntries with 4 entries |
| `src/pages/about.astro` | About page at /about | VERIFIED | Uses all four about components, fetches content from getCollection |
| `src/islands/ContactForm.tsx` | React contact form with Netlify | VERIFIED | Full validation, Netlify fetch POST, success/error states, aria-describedby |
| `src/pages/contact.astro` | Contact page with hidden Netlify form | VERIFIED | Has hidden form with netlify attribute, ContactForm client:load |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/pages/index.astro` | `src/layouts/HomeLayout.astro` | import + layout wrapper | WIRED | `import HomeLayout` present, used as root layout |
| `src/components/CosmicHero.astro` | `public/images/bg.jpg` | background-image CSS | WIRED | `url('/images/bg.jpg')` in style, file exists at public/images/bg.jpg |
| `src/pages/publications.astro` | `src/islands/PublicationList.tsx` | client:load directive | WIRED | `client:load` present, publications prop passed |
| `src/pages/publications.astro` | `astro:content` | getCollection('publications') | WIRED | getCollection("publications") call present |
| `src/pages/research.astro` | `src/islands/ResearchProjects.tsx` | client:load directive | NOT_WIRED | research.astro does not import ResearchProjects; island file does not exist |
| `src/pages/contact.astro` | `src/islands/ContactForm.tsx` | client:load directive | WIRED | `client:load` present on ContactForm |
| `src/pages/contact.astro` | Netlify Forms | hidden HTML form with data-netlify | WIRED | Hidden form has `netlify` attribute and `name="contact"` |
| `src/components/AboutProfile.astro` | `public/images/me.JPG` | img src | WIRED | `src="/images/me.JPG"` present, file exists |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `PublicationList.tsx` | `publications` prop | `getCollection("publications")` in publications.astro | Yes -- 11 entries from publications.yaml via content collection | FLOWING |
| `EducationTimeline.astro` | `educationEntries` | Direct import from education.ts | Yes -- 4 hardcoded entries (placeholder data, per plan) | FLOWING |
| `AboutProfile.astro` | `<slot />` (Content) | `getCollection("pages")` + render in about.astro | Yes -- markdown from about.md | FLOWING |
| `research.astro` | n/a | No island wired | n/a | DISCONNECTED (stub page) |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Build succeeds with all pages generated | `npm run build` | All 8 routes prerendered, no errors | PASS |
| dist/publications/index.html exists | File check | Present | PASS |
| dist/research/index.html exists | File check | Present (but contains placeholder, not real content) | FAIL (stub content) |
| dist/about/index.html exists | File check | Present | PASS |
| dist/contact/index.html exists | File check | Present | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| PROF-01 | 02-01 | Homepage centered on research theme with visual design, simulation/arXiv buttons, bio link | SATISFIED | CosmicHero + CTACardPair (Enzo-Abyss/Readea buttons) + BioSummary all present and wired |
| PROF-02 | 02-04 | About page with full bio, avatar, academic background, CV download | SATISFIED | about.astro uses AboutProfile + AcademicLinks + CVDownload + EducationTimeline |
| PROF-03 | 02-04 | Social/academic profile links (Scholar, ORCID, GitHub, LinkedIn) | SATISFIED | AcademicLinks.astro has all 4 links with correct URLs and noopener noreferrer |
| PROF-04 | 02-04 | Contact page with form submission (Netlify Forms) | SATISFIED | ContactForm island + hidden Netlify form, full validation implemented |
| PROF-05 | 02-02 | Clear navigation with 5-6 menu items reachable from any page | PARTIAL | Navigation has 7 items (Home, Research, Publications, Enzo-Abyss, Readea, About, Contact). Exceeds 5-6 item spec. Plan documents this as intentional. All pages are reachable. |
| PUBL-01 | 02-02 | Publications page listing all papers from YAML data | SATISFIED | publications.astro fetches from content collection, all 11 papers present |
| PUBL-02 | 02-02 | Filter publications by project, year, and type | BLOCKED | Only role (first-author/co-author) and year filters exist. No project filter. YAML schema has no project field. |
| PUBL-03 | 02-02 | Author highlighting (bold "Jo, Yongseok" in author lists) | SATISFIED | highlightAuthor function splits on "Jo, Yongseok" and wraps in `<strong>` |
| PUBL-04 | 02-02 | External links to paper sources (DOI, arXiv, journal) | SATISFIED | arXiv, DOI, ADS buttons rendered conditionally when link fields are non-empty |
| RSRCH-01 | 02-03 | Research projects section with overview cards linking to detail pages | BLOCKED | research.astro shows "Site Under Construction" placeholder. ResearchProjects.tsx absent from main. |
| RSRCH-02 | 02-03 | Each project shows description, related publications, and status | BLOCKED | No project cards exist on main branch. Files in orphaned commit ffe3547 only. |
| RSRCH-03 | 02-03 | Research projects cover both scientific and ML work | BLOCKED | No research projects page content. Blocked by RSRCH-01 failure. |

**Requirements satisfied:** 7/12  
**Requirements blocked:** 4 (PUBL-02, RSRCH-01, RSRCH-02, RSRCH-03)  
**Requirements partial:** 1 (PROF-05 — nav count)

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|---------|--------|
| `src/pages/research.astro` | 6-7 | `Site Under Construction` placeholder text | Blocker | Research page renders no project content; RSRCH-01/02/03 all fail |
| `src/data/education.ts` | all | Placeholder education data per plan notes | Warning | Data may be inaccurate (plan explicitly notes "user should verify dates") — not a functional blocker |

### Human Verification Required

#### 1. Navigation Item Count

**Test:** Open the site in a browser and count visible navigation items.
**Expected:** Plan justifies 7 items as acceptable; PROF-05 requires 5-6. Verify that 7 items don't cause overflow or UX degradation on mobile and small desktop viewports.
**Why human:** Requires visual viewport check; automated checks cannot evaluate UX quality or mobile overflow behavior.

#### 2. Contact Form Netlify Integration

**Test:** Deploy to Netlify staging, submit the contact form with valid data.
**Expected:** Form POST succeeds (response.ok = true), success state "Message Sent" renders, submission appears in Netlify Forms dashboard.
**Why human:** Cannot test Netlify Forms POST without a live Netlify deployment — the hidden form + fetch pattern requires Netlify's build-time detection and runtime handling.

#### 3. CV Download

**Test:** Navigate to /about, click "Download CV".
**Expected:** Browser prompts to download cv.pdf OR opens the PDF.
**Why human:** public/files/ directory exists (has .gitkeep) but cv.pdf file is not present. The plan notes "User must place their actual cv.pdf in this directory." Needs user action + verification.

### Gaps Summary

Two gaps block the phase goal:

**Gap 1 (Critical): Research page is a stub — RSRCH-01, RSRCH-02, RSRCH-03 all unmet.**

The 02-03 plan was executed (commits 72fdaf2 and 670041d created ResearchProjects.tsx and research-projects.ts), and the merge commit ffe3547 exists in git history, but this merge is NOT an ancestor of the current main branch. The files were lost when subsequent commits (02-04 work, fix commits 3d153c2/5936261/85b5e94) were applied to the pre-merge state. The research.astro page still shows "Site Under Construction". Recovery path: `git cherry-pick 72fdaf2 670041d` (or rebuild from the orphaned commit) to bring the research projects work onto main.

**Gap 2 (Moderate): Publications missing project filter — PUBL-02 partially unmet.**

The roadmap SC2 and PUBL-02 both specify filtering "by project, year, and type." The implementation has role (first-author/co-author) and year filters only. The publications.yaml schema has no project field, and the plan's own must_have only specifies "role and year" — suggesting this was scoped down intentionally but without updating the requirement. A decision is needed: either add project tagging to the YAML + filter, or formally accept that role satisfies "type" and project filtering is out of scope.

---

_Verified: 2026-04-12T21:20:00Z_
_Verifier: Claude (gsd-verifier)_
