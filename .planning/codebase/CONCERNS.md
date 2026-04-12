# Codebase Concerns

**Analysis Date:** 2026-04-12

## CSS Architecture Issues

**Duplicate CSS Custom Properties:**
- Issue: CSS variables (`:root` blocks) are defined twice in the same file, creating redundancy and confusion about which values are authoritative
- Files: `assets/css/main.css` (lines 1 and 31)
- Impact: First definition (compact format) is overridden by second definition; maintenance confusion; unclear which breakpoints/colors should be used
- Fix approach: Consolidate all CSS variables into a single `:root` block at the top of `main.css`. Remove duplicate declarations on lines 31-43. Verify all usages reference the consolidated variables.

**CSS Cascade Conflicts:**
- Issue: Multiple CSS rules for the same selectors (`.nav`, `.nav ul`, `.container`, etc.) appear in different parts of the file, making the cascade unpredictable
- Files: `assets/css/main.css` (lines 1-27 vs lines 30-127)
- Impact: Responsive behavior may not work as intended; hard to debug which rule is actually applied; maintenance difficulty
- Fix approach: Organize CSS into logical sections with clear ordering: base utilities, layout components, typography, card patterns, responsive overrides. Use a single definition per selector.

## Accessibility Issues

**Incorrect Alt Text on Icons:**
- Issue: Multiple social media icon links have `alt="GitHub"` on non-GitHub images (Gmail, Google Scholar, ORCID icons)
- Files: `layouts/index.html` (lines 36, 42, 45)
- Impact: Screen reader users receive incorrect/confusing information; fails WCAG 2.1 Level A standards
- Fix approach: Update alt attributes to match icon purpose: `alt="Email"` for Gmail, `alt="Google Scholar"` for Scholar icon, `alt="ORCID"` for ORCID icon

**Missing rel="noopener" on External Links:**
- Issue: Some `target="_blank"` links lack `rel="noopener"` attribute, creating a security/performance gap
- Files: `layouts/partials/footer.html` (lines 4-6), `layouts/partials/publications.html` (lines 18-21)
- Impact: Opened pages can access `window.opener` JavaScript reference; potential security vulnerability; slight performance impact
- Fix approach: Add `rel="noopener noreferrer"` to all external links with `target="_blank"`. Already done correctly in some places (e.g., `layouts/index.html` line 23).

## JavaScript Concerns

**Unsanitized DOM Manipulation:**
- Issue: `emailcopy-script.html` creates and injects DOM elements directly with user-controlled data (email address)
- Files: `layouts/partials/emailcopy-script.html` (lines 8-20)
- Impact: While email is from config (trusted source), pattern is unsafe for future similar features; uses `textContent` (safe) but dynamic styling leaves room for XSS if content source changes
- Fix approach: Consider using a template-based approach or data attributes for styling. If expanding this pattern, implement strict input validation and use `textContent` exclusively (already done correctly).

**Missing Error Handling on Clipboard API:**
- Issue: `navigator.clipboard.writeText()` promise chain doesn't have `.catch()` handler
- Files: `layouts/partials/emailcopy-script.html` (line 7)
- Impact: Silent failures; users won't know if clipboard operation failed (especially on HTTPS enforcement or restricted browsers); no fallback
- Fix approach: Add `.catch()` handler to display error message to user. Consider providing fallback for older browsers.

## Template Structure Issues

**Hard-coded Author Names in Publication Rendering:**
- Issue: Publication template has hard-coded name variants to highlight author
- Files: `layouts/partials/publications.html` (lines 10-11)
- Impact: Not DRY; difficult to maintain if author name changes; fragile string matching across variants ("Jo, Yongseok", "Yongseok Jo", "Jo, Y."); doesn't scale if other co-authors need highlighting
- Fix approach: Move author highlighting logic to data layer. Add a `highlight` boolean field to publication YAML entries or implement a more flexible template parameter system.

## Configuration & Deployment

**Hard-coded Hugo Version Lock:**
- Issue: Hugo version is pinned to `0.152.2` in `netlify.toml`
- Files: `netlify.toml` (line 6)
- Impact: Security updates and bug fixes not automatically applied; site may break if Netlify removes old version; no clear update strategy
- Fix approach: Establish a regular update schedule (quarterly). Document update testing process in README. Consider using a more recent version (current is 0.152.2 as of analysis date).

**No Build Validation or Testing:**
- Issue: `netlify.toml` and `before_publish.sh` only build; no validation of output or links
- Files: `netlify.toml`, `before_publish.sh`
- Impact: Broken links, missing images, or malformed HTML could be deployed undetected
- Fix approach: Add `hugo --gc` for garbage collection. Consider adding link checking post-build or pre-deployment validation in Netlify build hooks.

## SEO & Metadata Issues

**Duplicate OG Meta Tags:**
- Issue: `og:title` uses template that may create redundant "| Yongseok Jo" suffix on homepage
- Files: `layouts/partials/head.html` (line 6)
- Impact: Social preview may show "Yongseok Jo | Yongseok Jo" on home page; inconsistent OpenGraph data
- Fix approach: Use conditional logic to detect home page and adjust OG tags accordingly. Test social card preview with sharing debugger.

**Missing og:image Tag:**
- Issue: `og:image` is commented out
- Files: `layouts/partials/head.html` (line 10)
- Impact: Social shares won't display a preview image; lower engagement on social platforms
- Fix approach: Create a share preview image and uncomment the og:image meta tag. Ensure image is high quality (1200x630px minimum).

**Incomplete Schema.org JSON-LD:**
- Issue: Schema JSON-LD has trailing comma syntax error and incomplete data
- Files: `layouts/partials/head.html` (line 22: trailing comma after "SkAI institute")
- Impact: Schema.org markup may not parse correctly; SEO tools may report validation errors; rich snippets may not display properly
- Fix approach: Remove trailing comma on line 22. Validate with Google's Schema.org validator. Consider adding more structured data (publications, research areas).

## Styling & Performance

**Inline Styles in JavaScript:**
- Issue: Email copy notification uses inline style manipulation instead of CSS classes
- Files: `layouts/partials/emailcopy-script.html` (lines 10-18)
- Impact: CSS-in-JS makes responsive design difficult; hard to maintain styling consistency; performance cost of DOM style reads/writes
- Fix approach: Create a CSS class `.notification` with responsive styling and toggle class instead of setting inline styles.

**Redundant CSS Import:**
- Issue: `custom.css` imported at end of `main.css` after all variables and rules
- Files: `assets/css/main.css` (line 287)
- Impact: If `custom.css` has rules overriding main styles, ordering is unclear; maintainability issue
- Fix approach: Move `@import "custom.css"` to the top or merge into main.css. Document the purpose of `custom.css`.

## Content & Data Issues

**Empty Links in Publication Data:**
- Issue: Publication YAML files have empty string values for optional links (pdf, arxiv)
- Files: `data/first_pub.yaml` (visible in sample output)
- Impact: Template conditionals work correctly (`{{ with .pdf }}`), but empty strings in YAML suggest incomplete data entry; unclear if links are truly unavailable or not yet added
- Fix approach: Use proper YAML `null` values instead of empty strings, or remove the field entirely. Document in README which link types are required vs. optional.

## Testing & Quality Assurance

**No Link Validation:**
- Issue: External links (Google Scholar, GitHub, ORCID, arXiv, DOI) are not validated
- Files: Multiple files with hardcoded URLs
- Impact: Broken links degrade user experience and SEO; only discovered when users report or Google crawl detects
- Fix approach: Add a build-time link checker (e.g., via Netlify plugin or scheduled GitHub Action). Document expected link formats in README.

**No Linting or Formatting Configuration:**
- Issue: No `.htmllint`, `.stylelint`, or similar config files present
- Files: N/A
- Impact: HTML/CSS quality inconsistencies; no automated style enforcement; different developers may format differently
- Fix approach: Add `.htmlvalidate.json` and `.stylelintrc` configuration. Run validation in pre-commit hook or CI.

---

*Concerns audit: 2026-04-12*
