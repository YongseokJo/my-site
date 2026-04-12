# Technology Stack

**Analysis Date:** 2026-04-12

## Languages

**Primary:**
- HTML5 - Template markup in Hugo layouts
- CSS3 - Styling with CSS variables and responsive design
- JavaScript - Client-side interactivity for email copying and dynamic elements
- Python 3 - Build-time bibliography conversion utilities
- YAML - Configuration and data file formats

**Secondary:**
- Markdown - Content authoring for site pages
- TOML - Netlify deployment configuration
- Shell (Bash) - Build and deployment scripts

## Runtime

**Environment:**
- Hugo (Static Site Generator) - Core runtime for site generation
- Netlify - Hosting and deployment platform

**Package Manager:**
- Python pip (implicit) - Required for Python dependencies
- Hugo Modules - Dependency management for Hugo (referenced in `before_publish.sh`)

## Frameworks

**Core:**
- Hugo (Extended) 0.152.2 - Static site generator for content rendering and templating

**Build/Dev:**
- None explicitly configured - builds use native Hugo with minification

## Key Dependencies

**Critical:**
- bibtexparser (Python) - Parses BibTeX bibliography files into structured data
- PyYAML (Python) - Converts parsed bibliography data to YAML format for Hugo
- unicodedata (Python) - Handles LaTeX accent normalization in bibliography entries

**Infrastructure:**
- None detected - purely static site generation, no server-side runtime dependencies

## Configuration

**Environment:**
- Netlify environment variables: `HUGO_VERSION` (set to 0.152.2), `HUGO_ENV` (production)
- Site config: `config.yaml` - Contains site title, language, menu structure, author links
- Hugo modules configured (implied by `hugo mod clean` and `hugo mod tidy` in build script)

**Build:**
- `netlify.toml` - Netlify deployment configuration specifying Hugo as build command
- `config.yaml` - Hugo configuration for site structure and metadata
- `before_publish.sh` - Manual pre-publication build script for cleaning and minifying

## Platform Requirements

**Development:**
- Hugo Extended (any recent version, minimum 0.152.2 based on Netlify config)
- Python 3.x (for bibliography conversion scripts)
- Git (for version control)
- Bash shell (for build scripts)

**Production:**
- Netlify hosting with automatic Hugo build pipeline
- Deployment triggers on Git push to repository
- Static site delivery through Netlify CDN

---

*Stack analysis: 2026-04-12*
