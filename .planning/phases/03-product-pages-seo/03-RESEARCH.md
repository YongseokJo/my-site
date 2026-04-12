# Phase 3: Product Pages & SEO - Research

**Researched:** 2026-04-12
**Domain:** Astro product pages, form services, static search (Pagefind), SEO/schema.org
**Confidence:** HIGH

## Summary

Phase 3 replaces two placeholder pages (`/software` and `/arxiv-app`) with full product landing pages for Enzo-Abyss and Readea, adds documentation sub-pages and tutorial pages, integrates Formspree for beta signup and feedback forms, adds Pagefind for site-wide search, and upgrades all pages with OpenGraph/schema.org SEO. The project already has a well-established Astro + React islands + shadcn + Tailwind v4 stack from Phases 1-2, so this phase is purely additive -- new pages, new components, new integrations.

The key technical decisions are: (1) Formspree free tier for forms (50 submissions/month, REST API, no backend needed), (2) astro-pagefind integration with a custom search UI using shadcn Dialog, and (3) schema.org ScholarlyArticle JSON-LD generated from the existing publications.yaml data. All three integrate cleanly with the static Astro build.

**Primary recommendation:** Use Formspree free tier with `@formspree/react` for forms, `astro-pagefind` for search indexing with a custom Pagefind JS API + shadcn Dialog UI, and inline JSON-LD script tags for schema.org structured data.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Enzo-Abyss: Product landing style -- not docs-style with sidebar
- **D-02:** Simple header at top (name + tagline), no large hero visual
- **D-03:** Tagline: "Cosmological simulation framework for studying first star clusters and black holes"
- **D-04:** Feature highlights section showing key capabilities
- **D-05:** Quick-start guide with code snippets / getting-started steps
- **D-06:** Sub-pages for documentation (e.g., /software/install, /software/usage) -- not all on one page
- **D-07:** No contributor list or GitHub link in Phase 3 scope
- **D-08:** Readea: Classic app landing page style -- device mockup area, feature highlights, download CTA
- **D-09:** Placeholder images for device mockups -- user will provide real screenshots later
- **D-10:** Tagline: "A modern reading experience for arXiv papers on macOS and iOS"
- **D-11:** Key feature to highlight: AI recommendation for arXiv feed
- **D-12:** CTA directs users to contact for beta access (no direct TestFlight/App Store link)
- **D-13:** Beta signup and feedback forms -- NOT Netlify Forms
- **D-14:** Step-by-step tutorial pages (separate pages per tutorial with numbered steps and screenshots)
- **D-15:** Standard SEO -- meta tags, OpenGraph on all pages, schema.org for publications
- **D-16:** Pagefind for on-site search -- Claude decides placement
- **D-17:** No special Google Scholar optimization beyond standard meta tags

### Claude's Discretion
- Pagefind search placement (nav icon vs dedicated page)
- Enzo-Abyss documentation sub-page structure and routing
- Best free form service for Readea beta signup and feedback
- Device mockup placeholder design
- Specific schema.org types for publications
- Tutorial page template design

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ARXV-01 | App landing page with device mockups, feature highlights, and download/TestFlight CTA | ReadeaHero component using HomeLayout hero slot, FeatureGrid, CTA linking to /contact |
| ARXV-02 | Beta signup form collecting name and email | BetaSignupForm React island using Formspree free tier |
| ARXV-03 | Tutorials and documentation section with screenshot-based how-to guides | Content Collection for tutorials + TutorialLayout template |
| ARXV-04 | Feedback/feature-request form with category selection | FeedbackForm React island using Formspree, shadcn Select for categories |
| SIM-01 | Simulation package overview page (features, quick-start) | ProductHeader + FeatureGrid + QuickStartGuide on /software |
| SIM-02 | Installation and getting-started documentation pages | /software/install and /software/usage sub-pages with Breadcrumb |
| SIM-03 | Developer/contributor list page showing team members and roles | Out of Phase 3 scope per D-07 -- no contributor list |
| SEO-01 | Meta tags and OpenGraph data on all pages | SEOHead component extending BaseHead |
| SEO-02 | Structured data for publications (schema.org) | ScholarlyArticle JSON-LD from publications.yaml |
| SEO-03 | Client-side search across all site content (Pagefind) | astro-pagefind + custom SearchDialog with Pagefind JS API |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Framework:** Astro 5.x (currently ^6.1.5 in package.json) with React islands, deployed on Netlify
- **Styling:** Tailwind CSS v4 with shadcn (base-nova preset)
- **Output:** Static site (`output: "static"` in astro.config.mjs)
- **Linting:** Biome (installed as devDependency)
- **Node:** >= 22.12.0 (currently v24.11.1)
- **Budget:** Zero cost -- free tier only for all services
- **GSD Workflow:** Do not make direct repo edits outside a GSD workflow unless explicitly asked

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | ^6.1.5 | Static site generator | Already in use [VERIFIED: package.json] |
| @astrojs/react | ^5.0.3 | React islands | Already in use for interactive components [VERIFIED: package.json] |
| react / react-dom | ^19.2.5 | Form islands, search dialog | Already in use [VERIFIED: package.json] |
| tailwindcss | ^4.2.2 | Styling | Already in use [VERIFIED: package.json] |
| shadcn | ^4.2.0 | UI components | Already in use [VERIFIED: package.json] |
| lucide-react | ^1.8.0 | Icons | Already in use [VERIFIED: package.json] |

### New Dependencies

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro-pagefind | 1.8.6 | Pagefind search integration for Astro | Official community integration; auto-indexes at build time, serves prebuilt index in dev [VERIFIED: npm registry] |
| @formspree/react | 3.0.0 | React hooks for Formspree form submissions | Official Formspree React library; provides useForm hook with state management [VERIFIED: npm registry] |

### New shadcn Components (install via CLI)

| Component | Purpose |
|-----------|---------|
| select | Feedback form category dropdown |
| dialog | Pagefind search overlay modal |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Formspree | Formspark | Similar free tier (250 subs/month), but Formspree has better React integration and wider adoption [ASSUMED] |
| Formspree | Web3Forms | 250 subs/month free, but less polished API [ASSUMED] |
| @formspree/react | Plain fetch to Formspree endpoint | Lose built-in state management; manual implementation (but ContactForm.tsx already shows this pattern -- could replicate) |
| astro-pagefind (default UI) | Custom Pagefind JS API + shadcn Dialog | More work but matches site design exactly; UI-SPEC requires custom styled dialog, not Pagefind default CSS |

**Installation:**
```bash
npm install astro-pagefind @formspree/react
npx shadcn@latest add select dialog
```

## Architecture Patterns

### Recommended Project Structure

```
src/
  pages/
    software.astro              # Enzo-Abyss landing (replace placeholder)
    software/
      install.astro             # Installation docs
      usage.astro               # Usage guide
    arxiv-app.astro             # Readea landing (replace placeholder)
    arxiv-app/
      beta.astro                # Beta signup form page
      feedback.astro            # Feedback form page
      tutorials/
        [slug].astro            # Dynamic tutorial pages from content collection
  components/
    ProductHeader.astro         # Product name + tagline block
    FeatureCard.astro           # Icon + title + description card
    FeatureGrid.astro           # 2-col grid of FeatureCards
    QuickStartGuide.astro       # Numbered steps with CodeBlocks
    CodeBlock.astro             # Styled code block with copy button
    ReadeaHero.astro            # Full-width hero for Readea
    DeviceMockupPlaceholder.astro  # Placeholder with "Screenshot coming soon"
    TutorialLayout.astro        # Tutorial page template
    TutorialStep.astro          # Single numbered step
    TutorialNav.astro           # Previous/Next navigation
    Breadcrumb.astro            # Breadcrumb trail
    SEOHead.astro               # Extended BaseHead with OG/schema.org
    SchemaOrgPublication.astro  # JSON-LD generator per publication
  islands/
    BetaSignupForm.tsx          # React island for beta signup
    FeedbackForm.tsx            # React island for feedback
    SearchToggle.tsx            # Search icon button
    SearchDialog.tsx            # Pagefind search modal
  content/
    tutorials/                  # Tutorial markdown files
      getting-started.md
  data/
    publications.yaml           # Existing (for schema.org)
```

### Pattern 1: Formspree Form Submission (React Island)

**What:** Submit form data to Formspree endpoint via REST API
**When to use:** BetaSignupForm and FeedbackForm components

**Approach A -- Using @formspree/react (recommended):**
```typescript
// Source: Formspree official docs [CITED: formspree.io/docs]
import { useForm } from "@formspree/react";

function BetaSignupForm() {
  const [state, handleSubmit] = useForm("YOUR_FORM_ID");
  if (state.succeeded) return <SuccessMessage />;
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" required />
      <input type="email" name="email" required />
      <button type="submit" disabled={state.submitting}>Sign Up</button>
    </form>
  );
}
```

**Approach B -- Using plain fetch (matches existing ContactForm.tsx pattern):**
```typescript
// Source: Existing codebase pattern [VERIFIED: src/islands/ContactForm.tsx]
const response = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, email, message }),
});
```

**Recommendation:** Use plain fetch approach to stay consistent with the existing ContactForm.tsx validation pattern. The existing form already has robust validation-on-blur, error state management, and success/error UI. Replicate that pattern for BetaSignupForm and FeedbackForm rather than introducing @formspree/react's `useForm` hook which would create two different form patterns in the codebase. This means `@formspree/react` is NOT needed -- just use the Formspree REST endpoint directly.

**Revised installation (drop @formspree/react):**
```bash
npm install astro-pagefind
npx shadcn@latest add select dialog
```

### Pattern 2: Pagefind Custom Search UI

**What:** Use Pagefind JS API with shadcn Dialog for a custom search experience
**When to use:** SearchDialog component

```typescript
// Source: Pagefind API docs [CITED: pagefind.app/docs/api/]
// Lazy-load Pagefind only when search dialog opens
const pagefind = await import("/pagefind/pagefind.js");

// Debounced search
const results = await pagefind.debouncedSearch(query, {}, 300);

// Load individual result data
for (const result of results.results.slice(0, 10)) {
  const data = await result.data();
  // data.url, data.meta.title, data.excerpt, data.sub_results
}
```

**Key detail:** The astro-pagefind integration handles index generation at build time. The custom UI uses the raw Pagefind JS API (`/pagefind/pagefind.js`) rather than Pagefind's default UI component. This lets us style results with our own design tokens. [CITED: pagefind.app/docs/api/]

### Pattern 3: SEOHead Component Extension

**What:** Extend BaseHead.astro with OpenGraph and JSON-LD
**When to use:** All pages replace `<BaseHead>` with `<SEOHead>`

```astro
---
// SEOHead.astro - extends BaseHead pattern
// Source: Existing BaseHead.astro + OpenGraph standard [VERIFIED: src/components/BaseHead.astro]
interface Props {
  title: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
}
const {
  title,
  description = "Yongseok Jo - Computational Astrophysicist",
  ogImage = "/images/og-default.png",
  ogType = "website",
  canonicalUrl = Astro.url.href,
} = Astro.props;
---
<!-- Include everything BaseHead has -->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="generator" content={Astro.generator} />
<meta name="description" content={description} />
<title>{title} | Yongseok Jo</title>
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="canonical" href={canonicalUrl} />
<!-- OpenGraph -->
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content={ogType} />
<meta property="og:url" content={canonicalUrl} />
<meta property="og:image" content={ogImage} />
<!-- Twitter -->
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<!-- Slot for page-specific additions (JSON-LD) -->
<slot />
```

### Pattern 4: Schema.org ScholarlyArticle JSON-LD

**What:** Generate structured data from publications.yaml
**When to use:** Publications page

```astro
---
// SchemaOrgPublication.astro
// Source: schema.org/ScholarlyArticle [CITED: schema.org/ScholarlyArticle]
interface Props {
  title: string;
  authors: string;  // "Jo, Yongseok; Kim, Ji-hoon"
  year: number;
  venue: string;
  links: { arxiv?: string; doi?: string };
}
const { title, authors, year, venue, links } = Astro.props;

// Parse author string into Person objects
const authorList = authors.split(";").map((a) => a.trim()).map((name) => ({
  "@type": "Person",
  name,
}));

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  name: title,
  author: authorList,
  datePublished: String(year),
  ...(links.doi ? { url: links.doi } : links.arxiv ? { url: links.arxiv } : {}),
  ...(venue ? { publisher: { "@type": "Organization", name: venue } } : {}),
};
---
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

### Pattern 5: Content Collection for Tutorials

**What:** Use Astro Content Collections for tutorial pages
**When to use:** Tutorial content under /arxiv-app/tutorials/

```typescript
// Addition to src/content.config.ts
// Source: Existing content.config.ts pattern [VERIFIED: src/content.config.ts]
const tutorials = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/tutorials" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number(),  // For sorting and prev/next navigation
    screenshot: z.string().optional(),  // Placeholder path
  }),
});
```

### Pattern 6: Astro File-based Routing for Sub-pages

**What:** Use nested directory structure for /software/* and /arxiv-app/* routes
**When to use:** Documentation and tutorial sub-pages

Astro file-based routing: `src/pages/software/install.astro` maps to `/software/install`. For tutorials with dynamic content: `src/pages/arxiv-app/tutorials/[slug].astro` with `getStaticPaths()`. [VERIFIED: Astro docs standard behavior]

### Anti-Patterns to Avoid
- **Using Pagefind default UI CSS:** Override ALL default styles or build custom UI. The default Pagefind CSS will clash with the dark/light theme tokens. [CITED: UI-SPEC interaction contract #10]
- **Importing Pagefind eagerly:** Always lazy-load via dynamic `import()` on dialog open. Pagefind bundles are ~100KB+ and should not load until needed. [CITED: pagefind.app/docs/api/]
- **Putting all Enzo-Abyss docs on one page:** User explicitly chose sub-pages (D-06). Use separate .astro files under /software/.
- **Using Netlify Forms for Readea forms:** Explicitly excluded by user (D-13). Use Formspree REST endpoint.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Full-text site search | Custom search index | Pagefind via astro-pagefind | Pagefind generates optimized index at build, handles ranking, excerpts, highlighting |
| Form backend | Custom API endpoint | Formspree free tier (REST endpoint) | 50 subs/month free, spam filtering, email notifications included |
| Search UI modal | Custom modal from scratch | shadcn Dialog component | Handles focus trapping, escape key, backdrop click, aria attributes |
| Category dropdown | Custom select | shadcn Select component | Handles keyboard navigation, aria, mobile behavior |
| Syntax highlighting in code blocks | Custom highlighter | Astro's built-in Shiki | Already configured in Astro; use `<Code>` component or markdown code fences |
| Schema.org validation | Manual JSON construction | Structured JSON-LD template | Follow schema.org/ScholarlyArticle spec exactly |

## Common Pitfalls

### Pitfall 1: Pagefind Index Not Found in Development
**What goes wrong:** Search returns no results during `astro dev` because the Pagefind index only exists after a build.
**Why it happens:** Pagefind indexes are generated at `astro build` time, not during dev server.
**How to avoid:** The `astro-pagefind` integration serves the prebuilt index during dev. Run `npm run build` at least once before testing search in dev mode. [CITED: astro-pagefind README]
**Warning signs:** Console errors about `/pagefind/pagefind.js` not found, or search returning empty results.

### Pitfall 2: Pagefind CSS Overriding Theme
**What goes wrong:** Pagefind default UI styles inject colors that clash with dark/light theme.
**Why it happens:** Pagefind UI ships its own CSS with hardcoded colors.
**How to avoid:** Do NOT use Pagefind's default UI component. Build a custom search UI using the Pagefind JS API directly with shadcn Dialog + Input components. This way zero Pagefind CSS is loaded. [CITED: UI-SPEC interaction contract #10]
**Warning signs:** Search modal has white background in dark mode, or mismatched fonts.

### Pitfall 3: Formspree Form ID Exposure
**What goes wrong:** Formspree form IDs are embedded in client-side JavaScript, which is expected and normal.
**Why it happens:** Formspree endpoints are public by design (like Netlify Forms).
**How to avoid:** Enable Formspree's domain whitelist feature to restrict submissions to yongseokjo.com only. Also enable reCAPTCHA on the Formspree dashboard for spam protection. [CITED: formspree.io/plans]
**Warning signs:** Spam submissions appearing in Formspree inbox.

### Pitfall 4: SEOHead Not Replacing BaseHead Everywhere
**What goes wrong:** Some pages still use BaseHead instead of SEOHead, missing OpenGraph tags.
**Why it happens:** Forgetting to update existing layout files.
**How to avoid:** SEOHead should be a drop-in replacement for BaseHead. Update BaseLayout.astro and HomeLayout.astro to use SEOHead. Then all existing pages automatically get OG tags.
**Warning signs:** Missing og:image or og:title when sharing links on social media.

### Pitfall 5: Schema.org JSON-LD with Null Values
**What goes wrong:** Google's structured data validator rejects JSON-LD with null or empty string values.
**Why it happens:** Some publications lack DOI or other fields.
**How to avoid:** Conditionally omit properties when data is missing -- never output `"url": ""` or `"publisher": null`. [CITED: UI-SPEC SchemaOrgPublication contract #4]
**Warning signs:** Google Search Console structured data errors.

### Pitfall 6: Formspree 50 Submission Limit
**What goes wrong:** Forms stop working mid-month after 50 submissions.
**Why it happens:** Free tier limit reached; both beta signup and feedback forms share the same account quota.
**How to avoid:** Create separate Formspree forms for beta signup vs feedback so you can track usage independently. Monitor the Formspree dashboard. For a personal academic site, 50/month is likely sufficient. Upgrade to $10/month Personal plan only if needed.
**Warning signs:** Form submissions return HTTP 402 errors.

## Code Examples

### Formspree REST Endpoint (Plain Fetch, Matching Existing Pattern)
```typescript
// Source: Existing ContactForm.tsx pattern + Formspree docs [VERIFIED: src/islands/ContactForm.tsx]
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  // ... validation ...
  setStatus("submitting");
  try {
    const response = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ name: formData.name, email: formData.email }),
    });
    if (!response.ok) throw new Error("Submit failed");
    setStatus("success");
  } catch {
    setStatus("error");
  }
}
```

### Pagefind Custom Search in React
```typescript
// Source: Pagefind JS API docs [CITED: pagefind.app/docs/api/]
import { useState, useEffect, useRef } from "react";

interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
}

export function usePagefindSearch() {
  const pagefindRef = useRef<any>(null);

  async function init() {
    if (!pagefindRef.current) {
      pagefindRef.current = await import("/pagefind/pagefind.js");
      pagefindRef.current.init();
    }
  }

  async function search(query: string): Promise<SearchResult[]> {
    await init();
    const result = await pagefindRef.current.debouncedSearch(query, {}, 300);
    if (!result) return [];
    const items = await Promise.all(
      result.results.slice(0, 10).map(async (r: any) => {
        const data = await r.data();
        return { url: data.url, title: data.meta?.title ?? "", excerpt: data.excerpt ?? "" };
      })
    );
    return items;
  }

  return { search };
}
```

### Keyboard Shortcut for Search (Cmd+K)
```typescript
// Source: Standard web pattern [ASSUMED]
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen(true);
    }
  }
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, []);
```

### Breadcrumb Component Pattern
```astro
---
// Source: WAI-ARIA breadcrumb pattern [CITED: UI-SPEC accessibility requirement #6]
interface Props {
  items: { label: string; href?: string }[];
}
const { items } = Astro.props;
---
<nav aria-label="Breadcrumb">
  <ol class="flex items-center gap-2 text-sm text-muted-foreground">
    {items.map((item, i) => (
      <li class="flex items-center gap-2">
        {i > 0 && <span aria-hidden="true">/</span>}
        {item.href ? (
          <a href={item.href} class="hover:text-accent transition-colors duration-150">{item.label}</a>
        ) : (
          <span class="text-foreground" aria-current="page">{item.label}</span>
        )}
      </li>
    ))}
  </ol>
</nav>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pagefind default UI | Custom UI with Pagefind JS API | Pagefind v1.x (2024+) | Full control over styling; no CSS conflicts with design systems [CITED: pagefind.app/docs/api/] |
| Netlify Forms for all forms | Formspree for non-contact forms | User decision D-13 | Separates form concerns; Netlify Forms for contact, Formspree for product forms |
| Manual meta tags per page | Centralized SEOHead component | Phase 3 addition | Single source of truth for OG/meta configuration |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Formspark has 250 subs/month free tier | Alternatives Considered | Low -- Formspree is the chosen service regardless |
| A2 | Web3Forms has 250 subs/month free tier | Alternatives Considered | Low -- Formspree is the chosen service regardless |
| A3 | 50 submissions/month is sufficient for a personal academic site | Common Pitfalls | Medium -- if site gets unexpected traffic, forms will stop working; monitor usage |
| A4 | Formspree free tier does not require a credit card | Standard Stack | Low -- if it does, user can provide or switch to Web3Forms |
| A5 | Cmd+K keyboard shortcut pattern is standard | Code Examples | Very low -- widely adopted convention |

## Open Questions

1. **Formspree Form IDs**
   - What we know: Each form needs a unique Formspree form ID created via the Formspree dashboard
   - What's unclear: User needs to create a Formspree account and set up two forms (beta signup, feedback)
   - Recommendation: Document the setup steps in the plan. Use placeholder `YOUR_FORM_ID` in code and add a task for the user to replace with real IDs.

2. **OG Default Image**
   - What we know: SEOHead needs a fallback `og:image` for pages without a specific image
   - What's unclear: Whether an appropriate image already exists in `/public/images/`
   - Recommendation: Create a simple OG image (1200x630px) or use an existing one. Add as a task.

3. **Tutorial Content**
   - What we know: Tutorial pages need to exist for Readea (D-14)
   - What's unclear: What specific tutorials to create (the user will provide real screenshots later per D-09)
   - Recommendation: Create 1-2 placeholder tutorials with the correct template structure. User fills in real content later.

4. **Enzo-Abyss Feature Content**
   - What we know: Feature highlights and quick-start guide are required (D-04, D-05)
   - What's unclear: Exact feature list and code snippets for the simulation framework
   - Recommendation: Use placeholder feature descriptions that the user can refine. Focus on template/component correctness.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Everything | Yes | v24.11.1 | -- |
| npm | Package installation | Yes | (bundled with Node) | -- |
| Pagefind | SEO-03 search | Not yet installed | Will install 1.8.6 via astro-pagefind | -- |
| Formspree account | ARXV-02, ARXV-04 forms | External service | Free tier | Web3Forms as fallback |
| shadcn CLI | Adding Select, Dialog | Yes | ^4.2.0 | -- |

**Missing dependencies with no fallback:** None -- all can be installed.

**Missing dependencies with fallback:**
- Formspree account requires user signup at formspree.io. If user prefers not to, Web3Forms (web3forms.com) offers a similar free REST API with 250 subs/month.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected -- no test runner installed |
| Config file | None |
| Quick run command | `npm run build` (build verification) |
| Full suite command | `npm run build` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ARXV-01 | Readea landing renders with hero, features, CTA | smoke (build) | `npm run build` | N/A -- build verification |
| ARXV-02 | Beta signup form renders, validates, submits | manual | Manual browser test | N/A |
| ARXV-03 | Tutorial pages render from content collection | smoke (build) | `npm run build` | N/A |
| ARXV-04 | Feedback form renders, validates, submits | manual | Manual browser test | N/A |
| SIM-01 | Enzo-Abyss landing renders features, quick-start | smoke (build) | `npm run build` | N/A |
| SIM-02 | Install and usage sub-pages render | smoke (build) | `npm run build` | N/A |
| SIM-03 | N/A -- deferred per D-07 | -- | -- | -- |
| SEO-01 | All pages have OG meta tags | manual | View page source / Lighthouse | N/A |
| SEO-02 | Publications page has JSON-LD | manual | Google Rich Results Test | N/A |
| SEO-03 | Pagefind search returns results | manual | Build then test in browser | N/A |

### Sampling Rate
- **Per task commit:** `npm run build` (verify no build errors)
- **Per wave merge:** `npm run build && npx astro preview` (manual visual check)
- **Phase gate:** Full build green + manual Lighthouse SEO audit

### Wave 0 Gaps
- No test framework installed. For this phase, build verification (`npm run build`) is the primary automated check. Form submissions and search require manual testing.
- Consider: `npm run build` should be run after every significant change to catch template/type errors early.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A -- no auth in Phase 3 |
| V3 Session Management | No | N/A -- static site |
| V4 Access Control | No | N/A -- all public pages |
| V5 Input Validation | Yes | Client-side validation (email format, required fields) + Formspree server-side validation |
| V6 Cryptography | No | N/A |

### Known Threat Patterns for Static Site + External Forms

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Form spam submissions | Tampering | Formspree domain whitelist + reCAPTCHA [CITED: formspree.io/plans] |
| Form endpoint abuse | Denial of Service | Formspree rate limiting (built-in) + 50 sub/month cap |
| XSS in search results | Tampering | Pagefind sanitizes excerpts; render with `dangerouslySetInnerHTML` only for Pagefind excerpts (contains `<mark>` tags for highlighting) |
| Open redirect via search | Spoofing | Only link to internal URLs from search results |

## Sources

### Primary (HIGH confidence)
- `package.json`, `astro.config.mjs`, `src/content.config.ts` -- existing project configuration [VERIFIED: codebase]
- `src/islands/ContactForm.tsx` -- existing form pattern [VERIFIED: codebase]
- `src/components/BaseHead.astro` -- existing head component [VERIFIED: codebase]
- `src/layouts/BaseLayout.astro`, `HomeLayout.astro` -- layout patterns [VERIFIED: codebase]
- npm registry -- pagefind 1.5.2, astro-pagefind 1.8.6, @formspree/react 3.0.0 [VERIFIED: npm view]

### Secondary (MEDIUM confidence)
- [Pagefind JS API docs](https://pagefind.app/docs/api/) -- custom UI implementation [CITED]
- [astro-pagefind README](https://github.com/shishkin/astro-pagefind/blob/main/README.md) -- integration setup [CITED]
- [schema.org/ScholarlyArticle](https://schema.org/ScholarlyArticle) -- JSON-LD schema [CITED]
- [Formspree plans page](https://formspree.io/plans) -- free tier limits (50 subs/month) [CITED]

### Tertiary (LOW confidence)
- Formspark and Web3Forms free tier limits -- mentioned as alternatives [ASSUMED, from training data]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all core libraries already installed, new deps verified on npm
- Architecture: HIGH -- follows established project patterns (Astro pages, React islands, shadcn components)
- Pitfalls: HIGH -- based on verified documentation and known static site patterns
- Form service: MEDIUM -- Formspree free tier limits confirmed, but account setup is external dependency
- SEO/schema.org: HIGH -- schema.org spec is stable and well-documented

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (stable stack, no fast-moving dependencies)
