# Hugo Academic CV (from scratch)

Minimal Hugo site without a theme, tailored for an academic CV.

## Quick start

1) Install **Hugo Extended** and Git.
2) From this folder:
```bash
hugo server -D
```
Open http://localhost:1313

## Deploy to Netlify

- Push to GitHub.
- In Netlify, create a site from the repo.
- Netlify will read `netlify.toml` and build with Hugo.

## Customize

- Site title, links: `config.yaml`
- Homepage bio: `content/_index.md`
- Publications data: `data/publications.yaml`
- Publications renderer: `layouts/partials/publications.html`
- Styles: `assets/css/main.css`
- Favicon: place one at `static/favicon.ico`

## Publications

Edit `data/publications.yaml`. The list is rendered on `/publications/` via the shortcode:
```
{{< publications >}}
```
