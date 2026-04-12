# Phase 1: Framework Migration & Design System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 1-Framework Migration & Design System
**Areas discussed:** Visual identity, Layout structure, Dark mode design, Migration scope

---

## Visual Identity

### Color Tone

| Option | Description | Selected |
|--------|-------------|----------|
| Deep space | Dark navy/black base with cosmic accent colors (blue, purple, gold) | ✓ |
| Clean academic | White/light gray base with a single strong accent | |
| Warm scholarly | Ivory/cream base with dark text and warm accents | |

**User's choice:** Deep space
**Notes:** Fits the astrophysics research theme naturally

### Typography

| Option | Description | Selected |
|--------|-------------|----------|
| Modern sans-serif | Inter, Satoshi, or similar — clean, widely used | ✓ |
| Serif + sans mix | Serif headings, sans body — like academic journals | |
| Monospace accent | Sans body with monospace for code/data elements | |

**User's choice:** Modern sans-serif

### References

| Option | Description | Selected |
|--------|-------------|----------|
| NASA/ESA sites | Space agency visual style | |
| Academic leaders | Sites like Karpathy, LeCun | |
| No references | Let Claude design | ✓ |

**User's choice:** No references — Claude designs based on direction set

### Imagery

| Option | Description | Selected |
|--------|-------------|----------|
| Real imagery | Actual simulation renders, JWST photos | |
| Abstract cosmic | Gradient nebulae, particle effects | |
| Minimal imagery | Deep space colors only, almost no images | |

**User's choice:** Abstract cosmic or minimal — prefers simplicity, not complex. Will use own simulation images later.

### Accent Color

| Option | Description | Selected |
|--------|-------------|----------|
| Blue/cyan | Electric blue, starlight feel | |
| Gold/amber | Warm gold, starburst contrast | ✓ |
| Purple/violet | Cosmic purple, nebula-inspired | |

**User's choice:** Gold/amber

### Spacing

| Option | Description | Selected |
|--------|-------------|----------|
| Spacious | Generous whitespace, elegant | ✓ |
| Moderate | Balanced spacing | |
| Compact | Information-dense | |

**User's choice:** Spacious

---

## Layout Structure

### Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Top bar | Horizontal nav across the top | ✓ |
| Side bar | Vertical nav on the left | |
| Minimal header | Small logo + hamburger menu | |

**User's choice:** Top bar

### Content Width

| Option | Description | Selected |
|--------|-------------|----------|
| Narrow (prose) | ~700px max, optimal reading width | ✓ |
| Medium | ~900-1000px, room for cards/grids | |
| Wide | ~1200px+, full use of screen | |

**User's choice:** Narrow (prose)

### Footer

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal | Copyright + social links | ✓ |
| Informative | Quick links, contact info, affiliation | |

**User's choice:** Minimal

---

## Dark Mode Design

### Default Mode

| Option | Description | Selected |
|--------|-------------|----------|
| Dark by default | Fits deep space theme | |
| Follow system | Respect OS preference | ✓ |
| Light by default | Conventional, safe | |

**User's choice:** Follow system preference

### Light Mode Relationship

| Option | Description | Selected |
|--------|-------------|----------|
| Inverted cosmic | Light bg, keep cosmic accents | |
| Clean academic | White/light gray, traditional | ✓ |

**User's choice:** Clean academic — dark mode is the creative mode, light mode is traditional

---

## Migration Scope

### Publications Data

| Option | Description | Selected |
|--------|-------------|----------|
| Keep YAML as-is | Migrate 2 files directly | |
| Merge into one | Single collection with role field | ✓ |

**User's choice:** Merge into one collection

### BibTeX Pipeline

| Option | Description | Selected |
|--------|-------------|----------|
| Keep Python | Leave existing script as-is | |
| Rewrite to Node | Convert for unified JS toolchain | ✓ |

**User's choice:** Rewrite to Node.js

### Old Hugo Files

| Option | Description | Selected |
|--------|-------------|----------|
| Delete after | Clean up once Astro works | |
| Keep temporarily | Reference during rebuild | ✓ |

**User's choice:** Keep temporarily for reference

---

## Claude's Discretion

- Specific font choice, exact color values, Tailwind config, shadcn/ui selection, Astro project structure, Content Collection schema, Netlify adapter config

## Deferred Ideas

None — discussion stayed within phase scope
