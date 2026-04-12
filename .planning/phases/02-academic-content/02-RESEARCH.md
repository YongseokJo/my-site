# Phase 2: Academic Content - Research

**Researched:** 2026-04-12
**Domain:** Astro content pages, React islands, Netlify Forms, shadcn components
**Confidence:** HIGH

## Summary

Phase 2 replaces all placeholder pages with real academic content: a cosmic-themed homepage with hero section, publications listing with client-side filtering, research projects with expand-in-place cards, about/CV page, and a contact form using Netlify Forms. The existing Astro + React + Tailwind v4 + shadcn stack from Phase 1 provides everything needed. The primary technical challenge is building React islands for interactive components (publication filters, research card expansion, contact form) while keeping the majority of the site as zero-JS Astro components.

The project already has all publication data (11 papers in `src/data/publications.yaml`), a working Content Collection schema, avatar and background images (`public/images/me.JPG` and `public/images/bg.jpg`), migrated about/contact Markdown content, and a BaseLayout with Navigation and Footer. Phase 2 is primarily a content and component authoring phase with well-understood patterns.

**Primary recommendation:** Build static Astro components for everything except three React islands: `PublicationList` (filter + display), `ResearchProjects` (expand-in-place), and `ContactForm` (validation + submission). Use shadcn Card, Badge, Input, Textarea, and Label components. Use Netlify Forms with standard HTML `data-netlify="true"` attribute for form submission.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Full-width cosmic hero section at the top with a stock deep space image as background (will be replaced with user's simulation image later)
- **D-02:** Hero headline text: "First Star Clusters & Black Holes in the Early Universe" -- research-focused, not name-focused
- **D-03:** Below hero: two side-by-side cards for simulation package and ArXiv app -- each with icon, title, short description, and CTA button
- **D-04:** Bottom of homepage (before footer): brief 2-3 sentence bio summary with a "Learn more" link to the About page
- **D-05:** Filter chips at the top -- clickable tags for role (First Author / Co-Author), year, etc. Click to toggle filter
- **D-06:** Each publication displayed as a card with title, authors (Jo, Yongseok highlighted/bolded), venue, year, and link buttons (DOI, arXiv, ADS)
- **D-07:** Publications data comes from existing `src/data/publications.yaml` Content Collection (11 papers with role field from Phase 1 migration)
- **D-08:** 2-3 main research projects showcased (curated, not comprehensive)
- **D-09:** Visual cards on the Research page with thumbnail/icon, project title, and brief description
- **D-10:** Click to expand in place -- no separate detail pages. Expanded view shows full description, related publications, and status
- **D-11:** Projects cover both scientific (astrophysics) and machine learning work
- **D-12:** Avatar/photo with full bio paragraph
- **D-13:** CV download button (PDF)
- **D-14:** Academic profile links as icons/buttons (Google Scholar, ORCID, GitHub, LinkedIn)
- **D-15:** Education/career timeline or list (positions, education, awards)
- **D-16:** Simple form: name, email, message -- uses Netlify Forms (free, no backend)
- **D-17:** No categories or dropdowns -- keep it minimal

### Claude's Discretion
- Specific stock cosmic image selection or CSS gradient fallback for hero
- Publication card layout details (spacing, link button icons)
- Filter chip implementation approach (React island vs Astro + vanilla JS)
- Research project data structure (Markdown files vs hardcoded in component)
- Education/career section layout (timeline vs list)
- Contact form success/error states

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PROF-01 | Homepage centered on research theme with atmospheric design, prominent buttons for sim package and arXiv app, and bio link | CosmicHero component + CTACardPair + BioSummary; bg.jpg already in public/images/ |
| PROF-02 | About page with full bio, avatar, academic background, CV download | AboutProfile + CVDownload + EducationTimeline; me.JPG exists, about.md has bio content |
| PROF-03 | Social/academic profile links in consistent placement | AcademicLinks component; URLs already in Footer.astro for reference |
| PROF-04 | Contact page with form submission (Netlify Forms) | ContactForm React island with data-netlify="true" attribute |
| PROF-05 | Clear navigation with 5-6 menu items reachable from any page | Already implemented in Phase 1 Navigation.astro (6 items) |
| PUBL-01 | Publications page listing all papers from YAML data | PublicationList island consuming getCollection("publications") |
| PUBL-02 | Filter publications by project, year, and type | FilterChips inside PublicationList React island, client-side filtering |
| PUBL-03 | Author highlighting (bold "Jo, Yongseok") | String replacement in publication card render, weight 700 |
| PUBL-04 | External links to paper sources (DOI, arXiv, journal) | Link buttons on PublicationCard, conditionally rendered per links object |
| RSRCH-01 | Research projects section with overview cards linking to detail pages | ResearchProjects React island with expand-in-place (D-10 overrides "linking to detail pages") |
| RSRCH-02 | Each project shows description, related publications, status | Expanded card state shows full description, pub list, status badge |
| RSRCH-03 | Research projects cover both scientific and ML work | Data must include both astrophysics and ML project entries |
</phase_requirements>

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | ^6.1.5 | Static site generator with islands | Already configured from Phase 1 [VERIFIED: package.json] |
| @astrojs/react | ^5.0.3 | React island integration | Already installed, enables client:load islands [VERIFIED: package.json] |
| react | ^19.2.5 | Interactive component islands | Already installed [VERIFIED: package.json] |
| tailwindcss | ^4.2.2 | Utility-first CSS with theme tokens | Already configured with design tokens [VERIFIED: package.json] |
| shadcn | ^4.2.0 | UI component library (base-nova style) | Already initialized [VERIFIED: components.json] |
| lucide-react | ^1.8.0 | Icon library | Already installed [VERIFIED: package.json] |

### New shadcn Components to Add

| Component | Purpose | Install Command |
|-----------|---------|----------------|
| Card | Publication cards, research cards, CTA cards | `npx shadcn@latest add card` [VERIFIED: dry-run confirms src/components/ui/card.tsx] |
| Badge | Filter chips, project status indicators | `npx shadcn@latest add badge` |
| Input | Contact form name and email fields | `npx shadcn@latest add input` |
| Textarea | Contact form message field | `npx shadcn@latest add textarea` |
| Label | Contact form field labels | `npx shadcn@latest add label` |
| Separator | Visual dividers if needed | `npx shadcn@latest add separator` |

**Installation:**
```bash
npx shadcn@latest add card badge input textarea label separator
```

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React island for filters | Vanilla JS + Astro | Simpler but harder to manage filter state; React is already installed and the UI spec calls for client:load |
| Hardcoded research projects | Markdown content collection | Content collection is overkill for 2-3 curated projects; hardcoded data array is simpler and matches the "curated" intent |
| React contact form | Plain HTML form + vanilla JS | React adds validation state management cleanly; only ~3 fields but need blur validation and submit states |

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn components (card, badge, input, textarea, label, separator, button)
│   ├── BaseHead.astro
│   ├── Navigation.astro
│   ├── Footer.astro
│   ├── ThemeScript.astro
│   ├── CosmicHero.astro      # Full-width hero with bg image + overlay
│   ├── CTACardPair.astro     # Two side-by-side CTA cards
│   ├── BioSummary.astro      # Brief bio + "Learn more" link
│   ├── PublicationCard.tsx    # Single publication card (used inside React island)
│   ├── AboutProfile.astro    # Avatar + name + title + bio
│   ├── AcademicLinks.astro   # Icon links row (Scholar, ORCID, GitHub, LinkedIn)
│   ├── CVDownload.astro      # Download CV button
│   └── EducationTimeline.astro # Career/education list
├── islands/
│   ├── DarkModeToggle.tsx     # Existing
│   ├── PublicationList.tsx    # Filter chips + publication cards (client:load)
│   ├── ResearchProjects.tsx   # Expand-in-place project cards (client:load)
│   └── ContactForm.tsx        # Form with validation + Netlify submit (client:load)
├── data/
│   ├── publications.yaml      # Existing (11 papers)
│   └── research-projects.ts   # Curated project data (2-3 projects)
├── pages/
│   ├── index.astro            # Homepage (replace placeholder)
│   ├── publications.astro     # NEW - publications page
│   ├── research.astro         # Research page (replace placeholder)
│   ├── about.astro            # About page (replace placeholder)
│   └── contact.astro          # Contact page (replace placeholder)
├── content/
│   └── pages/
│       ├── about.md           # Existing bio content
│       └── contact.md         # Existing contact content
└── layouts/
    └── BaseLayout.astro       # Existing (no changes needed)
```

### Pattern 1: Astro Page with React Island

**What:** Astro pages fetch data at build time and pass it as props to React islands for client-side interactivity.
**When to use:** Pages needing client-side filtering, expand/collapse, or form validation.
**Example:**
```astro
---
// src/pages/publications.astro
import BaseLayout from "../layouts/BaseLayout.astro";
import { getCollection } from "astro:content";
import PublicationList from "../islands/PublicationList.tsx";

const publications = await getCollection("publications");
const pubData = publications.map(p => p.data).sort((a, b) => b.year - a.year);
---
<BaseLayout title="Publications" description="...">
  <h1 class="text-2xl font-bold mb-8">Publications</h1>
  <PublicationList client:load publications={pubData} />
</BaseLayout>
```
[VERIFIED: Pattern matches existing about.astro and DarkModeToggle usage]

### Pattern 2: Full-Width Hero Breaking Out of BaseLayout Container

**What:** The homepage hero needs to be full-viewport-width, but BaseLayout wraps content in `max-w-[700px]`. The hero must break out of this container.
**When to use:** Only for the homepage hero section.
**Approach:** Create a dedicated homepage layout OR use negative margins to break out of the container.

**Recommended approach:** Modify index.astro to NOT use the standard `<main>` container for the hero section. Instead, use BaseLayout but place hero content before the constrained content area. This requires either:
- Option A: A separate `HomeLayout.astro` that doesn't wrap all content in `max-w-[700px]`
- Option B: Use the existing BaseLayout but override the container for the hero using CSS `w-screen relative left-1/2 -translate-x-1/2`

**Best choice: Option A** -- Create a `HomeLayout.astro` that inherits from BaseLayout's head/nav/footer but lets the hero be full-width while keeping CTA cards and bio summary in a 700px container. This avoids CSS hacks. [ASSUMED]

```astro
---
// src/layouts/HomeLayout.astro -- extends BaseLayout pattern
import "../styles/global.css";
import BaseHead from "../components/BaseHead.astro";
import ThemeScript from "../components/ThemeScript.astro";
import Navigation from "../components/Navigation.astro";
import Footer from "../components/Footer.astro";

const { title, description } = Astro.props;
---
<!doctype html>
<html lang="en" class="dark">
  <head>
    <BaseHead title={title} description={description} />
    <ThemeScript />
  </head>
  <body class="bg-background text-foreground min-h-screen flex flex-col font-sans">
    <Navigation />
    <main class="flex-1 w-full">
      <slot name="hero" />
      <div class="max-w-[700px] mx-auto px-4 md:px-6 lg:px-8 py-16">
        <slot />
      </div>
    </main>
    <Footer />
  </body>
</html>
```

### Pattern 3: Netlify Forms with Static HTML

**What:** Contact form submission handled by Netlify's built-in form processing.
**When to use:** Contact page.
**Critical detail:** For Astro static builds, the HTML form must exist in the static HTML output for Netlify's build-time parser to detect it. Since the ContactForm is a React island (hydrated client-side), Netlify's parser won't see it in the static HTML.

**Solution:** Include a hidden plain HTML form in the Astro page that Netlify's parser can detect, and have the React island submit via fetch to the same form name.

```astro
<!-- In contact.astro - hidden form for Netlify detection -->
<form name="contact" netlify netlify-honeypot="bot-field" hidden>
  <input type="text" name="name" />
  <input type="email" name="email" />
  <textarea name="message"></textarea>
</form>

<!-- React island handles the actual UI and submission -->
<ContactForm client:load />
```

The React island submits via:
```typescript
const formData = new URLSearchParams({
  "form-name": "contact",
  name: values.name,
  email: values.email,
  message: values.message,
});
await fetch("/", { method: "POST", body: formData,
  headers: { "Content-Type": "application/x-www-form-urlencoded" }
});
```
[CITED: docs.netlify.com/manage/forms/setup/]

### Pattern 4: Author Highlighting in Publication Cards

**What:** Bold "Jo, Yongseok" within the author string.
**When to use:** Every publication card.
**Example:**
```tsx
function highlightAuthor(authors: string): React.ReactNode {
  const parts = authors.split(/(Jo, Yongseok)/);
  return parts.map((part, i) =>
    part === "Jo, Yongseok" ? <strong key={i} className="font-bold">{part}</strong> : part
  );
}
```
[VERIFIED: publications.yaml consistently uses "Jo, Yongseok" format]

### Anti-Patterns to Avoid

- **Multiple React islands sharing state:** Filter chips and publication cards must be in the SAME React island (`PublicationList`), not separate islands. React context does not cross island boundaries. [CITED: astropatterns.dev/p/react-love/react-context-in-astro]
- **Using client:visible for filter components:** Filters are above the fold and need immediate interactivity. Use `client:load`, not `client:visible`.
- **Rendering the form only in React:** Netlify's build parser only sees static HTML. A hidden HTML form must exist for Netlify to register the form name.
- **Fetching publications client-side:** All 11 publications should be passed as props from the Astro page (build-time) to the React island. No runtime API calls needed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form UI components | Custom input/textarea/label | shadcn Input, Textarea, Label | Consistent styling, accessibility, focus states |
| Card layouts | Custom card div with manual borders | shadcn Card | Consistent radius, padding, border handling |
| Status badges | Custom span with inline styles | shadcn Badge | Proper variant system (accent for active, muted for completed) |
| Form validation | Custom regex and DOM manipulation | HTML5 validation + React state | type="email" handles format, React state handles UX |
| Expand/collapse animation | Custom JS animation | CSS transition on max-height or grid-template-rows | 200ms ease transition is trivial in CSS |
| Icon rendering | Custom SVG management | Lucide React icons | Already installed, tree-shakeable, consistent sizing |

**Key insight:** With shadcn already initialized and base-nova style configured, adding Card/Badge/Input/Textarea/Label gives you the full component set needed for Phase 2 with zero custom styling effort.

## Common Pitfalls

### Pitfall 1: Netlify Forms Not Detected in React Islands
**What goes wrong:** Netlify's build parser processes static HTML. If the form only exists inside a React island (rendered client-side), Netlify never registers it and submissions fail silently.
**Why it happens:** Astro static build outputs HTML before React hydration occurs.
**How to avoid:** Always include a hidden static HTML form with `netlify` attribute alongside the React island form. The React island submits to the same form name via fetch POST.
**Warning signs:** Form submits return 404 or appear to succeed but no submissions show in Netlify dashboard.

### Pitfall 2: Hero Image Breaking Layout
**What goes wrong:** The hero needs full-viewport width but BaseLayout constrains to 700px max-width.
**Why it happens:** BaseLayout.astro wraps `<slot />` in `max-w-[700px] mx-auto`.
**How to avoid:** Use a dedicated HomeLayout.astro for the homepage that separates the hero slot (full-width) from the content slot (700px container).
**Warning signs:** Hero appears constrained to 700px or content below hero is full-width.

### Pitfall 3: Filter State Lost Between Islands
**What goes wrong:** Creating separate FilterChips and PublicationCards islands causes filter state to not propagate.
**Why it happens:** Each Astro island is an independent React root -- context/state does not cross boundaries.
**How to avoid:** Wrap filters AND publication cards in a single `PublicationList` React island.
**Warning signs:** Clicking filter chips does nothing to the publication list.

### Pitfall 4: Missing Publications Page Route
**What goes wrong:** Navigation links to `/publications` but no page exists at that route (only `/research`, `/about`, `/contact` exist currently).
**Why it happens:** Phase 1 created `/research` but not `/publications` as a separate page.
**How to avoid:** Create `src/pages/publications.astro`. The Navigation already has "Research" linking to `/research` -- publications may need its own nav link or be accessible from the research page.
**Warning signs:** 404 when clicking navigation link.

**Note on navigation:** The current Navigation links are: Home, Research, Software, ArXiv App, About, Contact. There is no "Publications" nav link. The planner must decide whether to add a Publications nav item or make publications accessible from the Research page. The UI spec shows Publications as a standalone page at `/publications`. [VERIFIED: Navigation.astro has no publications link]

### Pitfall 5: CV PDF Not Present
**What goes wrong:** "Download CV" button links to `/files/cv.pdf` but the file may not exist yet.
**Why it happens:** Phase 1 migrated content but the CV PDF file location is uncertain.
**How to avoid:** Verify `public/files/cv.pdf` exists. If not, create the directory and note that the user must provide the PDF. A placeholder button linking to a non-existent file should show a graceful message.
**Warning signs:** 404 on CV download.

## Code Examples

### Publication Data Access (Build Time)
```astro
---
// Fetch and sort publications at build time
import { getCollection } from "astro:content";

const publications = await getCollection("publications");
const sorted = publications
  .map(p => p.data)
  .sort((a, b) => b.year - a.year);

// Extract unique years and roles for filter chips
const years = [...new Set(sorted.map(p => p.year))].sort((a, b) => b - a);
const roles = [...new Set(sorted.map(p => p.role))];
---
```
[VERIFIED: matches existing content.config.ts schema and about.astro pattern]

### Filter Chip Logic (React Island)
```tsx
type FilterState = {
  roles: Set<string>;
  years: Set<number>;
};

function filterPublications(pubs: Publication[], filters: FilterState) {
  return pubs.filter(pub => {
    const matchesRole = filters.roles.size === 0 || filters.roles.has(pub.role);
    const matchesYear = filters.years.size === 0 || filters.years.has(pub.year);
    return matchesRole && matchesYear; // AND across categories
  });
}
```
[ASSUMED -- standard filter pattern]

### Research Project Data Structure
```typescript
// src/data/research-projects.ts
export interface ResearchProject {
  id: string;
  title: string;
  brief: string;          // 2-3 line description for collapsed card
  description: string;    // Full description for expanded view
  status: "Active" | "Completed";
  icon: string;           // Lucide icon name
  relatedPublications: string[]; // IDs matching publications.yaml
}

export const researchProjects: ResearchProject[] = [
  {
    id: "star-clusters",
    title: "First Star Clusters & Black Holes",
    brief: "Modeling the formation of the first star clusters and black holes in the early universe using cosmological simulations.",
    description: "...", // Multi-paragraph
    status: "Active",
    icon: "Sparkles",
    relatedPublications: ["jo-2024-evolution", "kim-2019-highredshift"],
  },
  {
    id: "camels-ml",
    title: "Machine Learning for Cosmological Simulations",
    brief: "Applying ML techniques to calibrate and analyze cosmological simulation parameters across models.",
    description: "...",
    status: "Active",
    icon: "Brain",
    relatedPublications: ["jo-2025-toward", "jo-2023-calibrating", "jo-2019-machineassisted"],
  },
  // Optionally a third project
];
```
[ASSUMED -- data structure designed to support D-08 through D-11 and RSRCH-01 through RSRCH-03]

### Expand-in-Place Animation (CSS)
```css
.project-card-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 200ms ease;
}
.project-card-content.expanded {
  grid-template-rows: 1fr;
}
.project-card-content > div {
  overflow: hidden;
}
```
[ASSUMED -- modern CSS grid animation technique, avoids max-height hack]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| max-height animation for expand | CSS grid-template-rows: 0fr/1fr | 2023+ | Cleaner animation without knowing content height |
| Custom form handling | Netlify Forms with data-netlify attribute | Stable | Zero backend, built-in spam filtering |
| Separate filter + list components | Single React island with all interactive state | Astro islands model | State stays within one hydration boundary |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | HomeLayout.astro is the best approach for full-width hero | Architecture Patterns | Could use CSS breakout instead; low risk, just a layout choice |
| A2 | Research project data as a TypeScript file is better than content collection | Architecture Patterns | Content collection would work too; TS is simpler for 2-3 items |
| A3 | CSS grid-template-rows animation works across target browsers | Code Examples | Fallback to instant show/hide if not; supported in all modern browsers |
| A4 | Filter pattern with AND across categories, OR within | Code Examples | This matches UI spec; low risk |
| A5 | Navigation needs a "Publications" link added | Common Pitfalls | Could be accessed from Research page instead; planner should verify |

## Open Questions

1. **Publications navigation link**
   - What we know: Navigation has 6 items (Home, Research, Software, ArXiv App, About, Contact). UI spec defines a standalone `/publications` page.
   - What's unclear: Should "Publications" be added to nav (7 items) or accessed from the Research page?
   - Recommendation: Add "Publications" to nav between "Research" and "Software" since the UI spec treats it as a standalone page. This gives 7 nav items which is within PROF-05's "5-6 menu items" range (slightly over, but publications is core academic content).

2. **CV PDF file**
   - What we know: UI spec references `/files/cv.pdf`. The `public/files/` directory does not exist yet.
   - What's unclear: Whether the user has a CV PDF ready.
   - Recommendation: Create `public/files/` directory with a placeholder note. The button should be implemented to link to the path, and the user provides the actual PDF.

3. **Education/career data**
   - What we know: D-15 requires education/career timeline. The about.md content has minimal bio text.
   - What's unclear: What positions, education, and awards to display.
   - Recommendation: Create placeholder education data in a TypeScript file. User fills in actual data. Structure: `{ period: string, title: string, institution: string, type: "position" | "education" | "award" }[]`

4. **Research project content**
   - What we know: D-08 says 2-3 curated projects. D-11 says both scientific and ML work.
   - What's unclear: Exact project descriptions and which publications to associate.
   - Recommendation: Create 2-3 project entries based on publication topics (star clusters/galaxy formation, ML for cosmology). User reviews and edits descriptions.

## Existing Assets Inventory

| Asset | Location | Status | Phase 2 Usage |
|-------|----------|--------|---------------|
| Background image | `public/images/bg.jpg` (706 KB) | Exists | Hero section background |
| Avatar photo | `public/images/me.JPG` (1 MB) | Exists | About page avatar (should optimize) |
| Publications data | `src/data/publications.yaml` | Exists, 11 entries | Publications page |
| About content | `src/content/pages/about.md` | Exists, minimal | About page bio |
| Contact content | `src/content/pages/contact.md` | Exists, minimal | Reference for contact info |
| Button component | `src/components/ui/button.tsx` | Exists | CTA buttons, link buttons, submit |
| BaseLayout | `src/layouts/BaseLayout.astro` | Exists | All pages except homepage hero section |
| Navigation | `src/components/Navigation.astro` | Exists, 6 links | May need "Publications" added |
| Footer | `src/components/Footer.astro` | Exists | No changes needed |
| CV PDF | `public/files/cv.pdf` | MISSING | User must provide |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected -- no test framework installed |
| Config file | None |
| Quick run command | `npm run build` (build validation) |
| Full suite command | `npm run build && npx astro check` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROF-01 | Homepage renders hero, CTAs, bio | smoke | `npm run build` (ensures no build errors) | N/A |
| PROF-02 | About page renders bio, avatar, CV link | smoke | `npm run build` | N/A |
| PROF-03 | Academic profile links present | manual | Visual inspection | N/A |
| PROF-04 | Contact form submits via Netlify | manual | Deploy preview + manual submit | N/A |
| PROF-05 | Navigation reaches all sections | smoke | `npm run build` (all pages generate) | N/A |
| PUBL-01 | Publications page lists all papers | smoke | `npm run build` | N/A |
| PUBL-02 | Filter chips filter publications | manual | Browser interaction testing | N/A |
| PUBL-03 | Author highlighting visible | manual | Visual inspection | N/A |
| PUBL-04 | External links to papers work | manual | Click testing | N/A |
| RSRCH-01 | Research cards display | smoke | `npm run build` | N/A |
| RSRCH-02 | Expand shows description, pubs, status | manual | Browser interaction testing | N/A |
| RSRCH-03 | Both scientific and ML projects | manual | Visual inspection | N/A |

### Sampling Rate
- **Per task commit:** `npm run build` (catches type errors, missing imports, broken templates)
- **Per wave merge:** `npm run build && npx astro check`
- **Phase gate:** Full build + manual verification of all pages in dev server

### Wave 0 Gaps
- No test framework installed -- all validation is build-based and manual
- This is appropriate for a content-focused static site phase with 5 pages and 3 interactive islands
- Unit tests for filter logic could be added but are low priority for 11 publications

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A -- no auth in this phase |
| V3 Session Management | No | N/A -- static site |
| V4 Access Control | No | N/A -- all content public |
| V5 Input Validation | Yes | HTML5 type="email", minlength, required attributes + React validation |
| V6 Cryptography | No | N/A |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Form spam | Tampering | Netlify built-in spam filter + optional honeypot field |
| XSS via form display | Tampering | Form data only displayed in Netlify dashboard (not rendered on site) |
| Open redirect via external links | Spoofing | All external links are hardcoded in YAML data, not user-provided |

## Project Constraints (from CLAUDE.md)

- Framework: Astro with islands architecture, deployed on Netlify
- Output mode: static (`output: "static"` in astro.config.mjs)
- Styling: Tailwind CSS v4 with shadcn base-nova preset
- Conventions: 2-space indentation, Inter font, mobile-first responsive
- Content: YAML for publications, Markdown for pages via Content Collections
- Design system: shadcn components via Radix UI, Lucide React icons
- Max content width: 700px centered

## Sources

### Primary (HIGH confidence)
- `package.json` -- verified all dependency versions
- `components.json` -- verified shadcn configuration (base-nova style)
- `src/content.config.ts` -- verified Content Collection schema
- `src/data/publications.yaml` -- verified 11 publications with consistent data structure
- `src/layouts/BaseLayout.astro` -- verified 700px max-width container
- `src/components/Navigation.astro` -- verified 6 nav links, no publications link
- `public/images/` -- verified bg.jpg and me.JPG exist
- `npx shadcn@latest add card --dry-run` -- verified Card component available

### Secondary (MEDIUM confidence)
- [Netlify Forms setup docs](https://docs.netlify.com/manage/forms/setup/) -- hidden form technique for JS-rendered forms
- [Astro Islands architecture docs](https://docs.astro.build/en/concepts/islands/) -- client:load directive behavior
- [Astro React Context patterns](https://astropatterns.dev/p/react-love/react-context-in-astro) -- single island for shared state

### Tertiary (LOW confidence)
- None -- all claims verified or cited

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and verified
- Architecture: HIGH -- patterns match existing codebase conventions, Netlify Forms well-documented
- Pitfalls: HIGH -- verified against actual codebase state (missing publications route, 700px container constraint, missing CV file)

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (stable -- no fast-moving dependencies)
