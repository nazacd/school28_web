# School No. 28 — website

A fast, multilingual (Uzbek / Russian / English) school website. It is built with [Astro](https://astro.build),
has a simple web editor at `/admin`, includes a contact form, and runs in Docker.

- **Pages:** Home, About, Director's welcome, Statement of community, Staff & leadership, Employment,
  Admissions, Academics, News, Events, Gallery, Contact, Child protection, Privacy policy, 404
- **Languages:** `/uz/…` (default), `/ru/…`, `/en/…`. Opening `/` sends visitors to their browser's language.
- **Search engines:** every page is pre-built HTML with a title, description, canonical URL,
  `hreflang` alternates, Open Graph tags and schema.org data. `sitemap-index.xml` and `robots.txt` are generated.
- **Performance:** no JavaScript framework is shipped to visitors. The few small scripts (menu, scroll animations,
  lightbox, form) are inlined. Images are lazy-loaded, and the Manrope font is self-hosted.

All text is placeholder content. Replace it through the editor, or by editing the Markdown files.

---

## Quick start (developers)

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # production build into dist/
npm start            # run the production build
npm run check        # type-check
```

Requires Node.js 22+.

## Project structure

```
public/
  admin/             Web editor (Decap CMS): index.html + config.yml
  uploads/           Images uploaded through the editor
src/
  content/           ← ALL TEXT CONTENT (Markdown / JSON)
    home/<lang>/index.md
    pages/<lang>/*.md        about, directors-welcome, admissions, …
    news/<lang>/*.md
    events/<lang>/*.md
    staff/<lang>/*.md
    gallery/<lang>/*.md
    settings/site.json       school name, address, phone, socials, logo
  content.config.ts  Content schemas (which fields each file needs)
  i18n/ui.ts         Interface texts (menu, buttons, labels) in 3 languages
  lib/routes.ts      URL map and navigation menus
  components/        Header, Footer, cards, …
  layouts/           BaseLayout (SEO head), PageLayout (text pages)
  pages/             Routes. [lang]/… are the localized pages; api/… are server endpoints
  styles/global.css  Design tokens (colors, spacing, fonts) and base styles
Dockerfile, docker-compose.yml, .env.example
```

### Brand colors

Defined once in `src/styles/global.css`:

| Token | Value | Use |
|---|---|---|
| `--brand` | `#6e011e` | primary (buttons, headings accents) |
| `--accent` | `#016e6a` | secondary (icons, labels, highlights) |

---

## Editing content

### Option A: the web editor (`/admin`)

1. Open `https://<your-domain>/admin/` and click **Login with GitHub**.
2. Choose a section (Pages, News, Events, Staff, Gallery, Settings).
3. Edit. Uzbek and Russian are shown side by side; switch the right column to English with **Writing in RU ▾**.
4. Click **Publish**. The change is saved to the repository, and the site shows it after the next rebuild (see *Deployment*).

Notes:
- **Uzbek is the main language.** If a translation is missing, the Uzbek text is shown in its place.
- **Photos:** upload them once, in the Uzbek column. Other languages use the same photo automatically.
  Empty photo fields show a neat branded placeholder.
- **Logo:** *Settings → School details → Logo*. Until a logo is uploaded, a "28" badge is shown.
- **Draft:** news and events have a *Draft* switch that hides them from the site.
- Upload photos at a reasonable size (about 1600 px wide, JPG/WebP, under 500 KB).

#### Editing locally without GitHub

```bash
npm run dev       # terminal 1
npm run cms       # terminal 2 (local editor backend on :8081)
# open http://localhost:4321/admin/
```

Changes are written straight to `src/content/`.

### Option B: editing the files

Each page is a Markdown file with a small header (front matter):

```markdown
---
title: "Director’s welcome"
description: "A message from the Head of School."   # shown under the title and in Google
hero_image: ""                                       # e.g. /uploads/director.jpg
---

Dear students, parents and guests, …
```

Add a news article by creating `src/content/news/uz/<slug>.md`, and the same file name in `ru/` and `en/` if you
have translations. The build stops with a clear message if a required field is missing.

Interface texts (menu items, button labels, form labels) are in `src/i18n/ui.ts`.

---

## Contact form

The form posts to `/api/contact`, which sends an email over SMTP. Configure it in `.env`:

```
SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, CONTACT_TO, CONTACT_FROM
```

Without `SMTP_HOST`, messages are only printed to the server log, which is handy for testing.
Spam protection: a hidden honeypot field, an origin check, and a limit of 5 messages per IP every 10 minutes.
The form also works with JavaScript disabled.

## Web editor login (GitHub OAuth)

Editors sign in with their GitHub account. The site itself handles the login (`/api/auth`, `/api/callback`),
so no third-party service is needed.

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**
   - Homepage URL: `https://<your-domain>`
   - Authorization callback URL: `https://<your-domain>/api/callback`
2. Put the **Client ID** and a new **Client secret** in `.env` (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`).
3. Give every editor **write access** to the `nazacd/school28_web` repository.
4. The editor saves to the `main` branch (set in `public/admin/index.html` and `public/admin/config.yml`).

---

## Deployment (Docker, own VPS)

```bash
git clone https://github.com/nazacd/school28_web.git && cd school28_web
cp .env.example .env        # edit SITE_URL, SMTP_*, GITHUB_*
docker compose up -d --build
```

The container listens on `127.0.0.1:4321`. Put a reverse proxy in front of it for the domain and HTTPS.
A minimal Nginx example:

```nginx
server {
    server_name school28.example.com;
    location / {
        proxy_pass http://127.0.0.1:4321;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    client_max_body_size 1m;
    # listen 443 ssl; … (e.g. via certbot --nginx)
}
```

**Applying content changes:** the site is pre-built, so after edits (from `/admin` or git) rebuild it:

```bash
git pull && docker compose up -d --build
```

This can be automated later with a cron job, a GitHub Actions deploy, or a webhook. That is the deployment topic
we will go through separately.
