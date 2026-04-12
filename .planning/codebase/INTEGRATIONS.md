# External Integrations

**Analysis Date:** 2026-04-12

## APIs & External Services

**Academic Databases:**
- Google Scholar - Search index and citation metrics
  - Integration: External links, no SDK/API consumption
  - URL: https://scholar.google.com/citations?user=MNScKpQAAAAJ&hl=en

- ORCID - Academic researcher identifier
  - Integration: External profile links
  - URL: https://orcid.org/0000-0003-3977-1761

- arXiv - Preprint repository integration via bibliography system
  - Integration: DOI and arXiv URL generation from BibTeX entries
  - Client: Python script `scripts/bib_to_yaml.py` parses arXiv identifiers
  - Links generated: https://arxiv.org/abs/{eprint}

**Professional Networks:**
- GitHub - Source code repository and profile links
  - Integration: External link only
  - URL: https://github.com/YongseokJo

- LinkedIn - Professional profile
  - Integration: External link only
  - URL: https://www.linkedin.com/in/yongseokjo

## Data Storage

**Databases:**
- None - Purely static site, no runtime database

**File Storage:**
- Local filesystem only
  - Bibliography data: `data/first_pub.yaml`, `data/co_pub.yaml` - Publication metadata
  - Source bibliography: `bib/first_pub.bib`, `bib/co_pub.bib` - BibTeX format
  - Content: `content/` directory - Markdown pages
  - Static assets: `static/` directory - Images, favicons, downloadables
  - Layout templates: `layouts/` directory - HTML templates

**Caching:**
- None detected - Static site generation does not require caching layer

## Authentication & Identity

**Auth Provider:**
- None - Public static website with no user authentication
- Email contact: `me@yongseokjo.com` (configured in `config.yaml`)

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Hugo build logs (via Netlify during deployment)
- No application-level logging in site code

## CI/CD & Deployment

**Hosting:**
- Netlify - Continuous deployment platform
  - Repository: GitHub (linked, auto-deploys on push)
  - Build command: `hugo`
  - Publish directory: `public/`
  - Build environment: `HUGO_VERSION=0.152.2`, `HUGO_ENV=production`

**CI Pipeline:**
- Netlify automatic builds triggered on Git pushes
- No explicit GitHub Actions or other CI service configured

## Environment Configuration

**Required env vars:**
- `HUGO_VERSION` - Set to 0.152.2 in `netlify.toml`
- `HUGO_ENV` - Set to production in `netlify.toml`

**Secrets location:**
- No secrets required - public static site
- Git excludes `.env` and `.env.local` files (see `.gitignore`)

## Webhooks & Callbacks

**Incoming:**
- None detected - Static site has no incoming webhooks

**Outgoing:**
- None detected - No automated notifications or callbacks

## Bibliography Processing

**BibTeX to YAML Conversion Pipeline:**
- Source: `bib/first_pub.bib`, `bib/co_pub.bib`
- Processor: `scripts/bib_to_yaml.py` (Python utility)
- Output: `data/first_pub.yaml`, `data/co_pub.yaml`
- Process:
  1. Parse BibTeX entries using bibtexparser library
  2. Extract metadata: title, authors, venue, year, dates
  3. Generate URLs for arXiv, DOI (via https://doi.org/), ADS (NASA Astrophysics Data System)
  4. Normalize journal abbreviations (ApJ, MNRAS, A&A, etc.)
  5. Clean LaTeX encoding (accents, special characters)
  6. Sort by date (reverse chronological)
  7. Export to YAML format for Hugo templates

**Publication Rendering:**
- Template: `layouts/partials/publications.html` - Renders publication list with links
- Shortcode: `layouts/shortcodes/publications.html` - Embeds publications via `{{< publications >}}`
- Display pages: `/publications/` via `content/publications/_index.md`

---

*Integration audit: 2026-04-12*
