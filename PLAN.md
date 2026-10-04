# School 28 Website: Plan

A read-only, multi-page school website. It should be fast, easy to find on search engines and simple to use, with a minimal design and light animations. The team will write the content; this plan covers the structure, the tech stack and the order of work.

Reference site: https://www.tashschool.org/

---

## 1. Recommended stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Astro** (with React "islands" where needed) | Builds every page to plain HTML at build time, so search engines see the full content. Ships almost no JavaScript by default. Can still use React components. |
| Styling | **Tailwind CSS** (or plain CSS modules) | Fast to build a consistent, minimal design system. |
| Content | **Markdown/MDX** in Astro Content Collections | Non-developers edit `.md` files, and the build checks frontmatter against a schema. |
| Animations | CSS transitions + Astro **View Transitions** for page changes. A small `IntersectionObserver` script for fade/slide-in on scroll. | Smooth without a heavy animation library. Respects `prefers-reduced-motion`. |
| Images | `astro:assets` `<Image />` | Converts images to AVIF/WebP automatically, sets responsive `srcset`, uses `loading="lazy"` and reserves width/height so the layout doesn't jump. |
| SEO | `@astrojs/sitemap`, a shared `<SEO>` head component, JSON-LD (`School` / `EducationalOrganization`) | Sitemap, canonical URLs, Open Graph/Twitter cards and structured data. |
| i18n (optional) | Astro built-in i18n routing (`/uz/`, `/ru/`, `/en/`) | Add only if more than one language is needed. |
| Hosting | Cloudflare Pages, Netlify or Vercel (free tier) | Static hosting on a CDN, with HTTPS and a preview build for every pull request. |
| Optional CMS | Decap CMS or Keystatic (git-based) | Gives staff a web form for editing content later. No server needed. |

### Why not a plain React SPA (Vite/CRA)?
A client-rendered SPA sends an empty HTML shell and fills it in with JavaScript. Search engines index that poorly, and the first load is slower. For a read-only content site, static generation is the right model.

### Alternative if the team wants "pure React"
**Next.js (App Router) with `output: 'export'`** also generates static HTML and is good for SEO. The trade-offs: more JavaScript is shipped, there are more concepts to learn, and image optimisation needs extra setup when exporting statically. Choose it only if the team already knows Next.js.

---

## 2. Site map (URL structure)

Use clean, readable, lowercase URLs with hyphens:

```
/                               Home
/about/                         About the school (overview, mission, vision, history)
/about/directors-welcome/       Director's welcome
/about/statement-of-community/  Statement of community / values
/about/employment/              Careers / vacancies
/staff-leadership/              Staff & leadership (cards with photo, name, role)
/child-protection/              Child protection / safeguarding policy
/privacy-policy/                Privacy policy
/404                            Not found page
```

Easy to add later: `/admissions/`, `/academics/`, `/news/`, `/events/`, `/contact/`, `/gallery/`.

---

## 3. Page templates (layouts)

Every page is built from a small set of layouts, so new pages need no new code:

1. **BaseLayout**: `<head>` (SEO), header with navigation, footer, skip-to-content link, view transitions.
2. **HomeLayout**: hero (image/video, headline, call to action), quick links, highlights/stats, latest news teaser, contact strip.
3. **PageLayout** (text pages): page hero/banner and breadcrumbs, then a readable content column (about 70ch), with an optional sidebar of section links. Used for About, Director's Welcome, Statement of Community, Employment, Child Protection and Privacy Policy.
4. **StaffLayout**: grid of staff cards filtered by group (Leadership / Teachers / Support). Clicking a card opens a modal or detail section with a bio.

### Shared components
`Header` (sticky; shrinks on scroll; mobile burger menu), `NavDropdown` (About → submenu), `Footer` (address, phone, email, map link, social links, policy links), `Hero`, `Breadcrumbs`, `Section`, `Card`, `StaffCard`, `CTAButton`, `RevealOnScroll`, `SEO`.

---

## 4. Content model (what the team fills in)

```
src/content/
  pages/
    about.md
    directors-welcome.md
    statement-of-community.md
    employment.md
    child-protection.md
    privacy-policy.md
  staff/
    jane-doe.md        # name, role, group, photo, order, short bio
  settings/
    site.json          # school name, address, phone, email, socials, map URL
```

Example page frontmatter:

```yaml
---
title: "Director's Welcome"
description: "A welcome message from our director."   # used for meta description
heroImage: "../../assets/images/director.jpg"
updated: 2026-10-01
---
```

The build fails with a clear error if a required field (such as `title` or `description`) is missing. That keeps SEO metadata consistent.

---

## 5. Design direction

- **Minimal**: lots of white space, one primary brand colour plus one accent, neutral greys.
- **Typography**: a clean sans-serif for UI (Inter or Manrope) and an optional serif for headings. Self-host the fonts, with `font-display: swap`.
- **Grid**: content max-width about 1200px, an 8px spacing scale, and rounded cards with soft shadows.
- **Light animations** (all under 400ms, eased):
  - Fade or slide-up of sections as they enter the viewport.
  - Crossfade between pages (View Transitions).
  - Hover lift on cards and underline animation on links.
  - Header that shrinks and gains a background on scroll.
  - Animation is turned off under `prefers-reduced-motion: reduce`.
- **Mobile-first**: works from 360px up. Touch targets are at least 44px.
- **Dark mode**: optional. Leave it out at first unless wanted.

---

## 6. Performance, accessibility and SEO checklist

**Performance targets**: Lighthouse 95+ in every category, LCP under 2.5s, CLS under 0.1.
- Lazy-load all images below the fold. The hero image is `eager` with `fetchpriority="high"`.
- Lazy-load embedded maps or videos (click-to-load facade).
- No JavaScript framework runtime on pages that don't need it.

**Accessibility (WCAG 2.1 AA)**
- Semantic HTML: `header/nav/main/footer`, one `h1` per page, logical heading order.
- Alt text on every image, enforced by a schema field.
- Colour contrast at least 4.5:1, a visible focus ring and full keyboard navigation.

**SEO**
- A unique `<title>` and meta description on each page, plus a canonical URL.
- `sitemap.xml` and `robots.txt`.
- JSON-LD `School` schema (name, address, phone, logo, geo).
- Open Graph image for social sharing.
- Register the site in Google Search Console and add a Google Business Profile so people find it in local search.

---

## 7. Project structure

```
school28_web/
  public/              favicon, robots.txt, og-image
  src/
    assets/images/     optimised at build time
    components/
    layouts/
    content/           Markdown that the team edits
    pages/             routes (index.astro, about/[...slug].astro, ...)
    styles/
  astro.config.mjs
  package.json
```

---

## 8. Roadmap

| Phase | Deliverable |
|---|---|
| **0. Decisions** | Confirm the stack, languages, brand colours and logo, domain and hosting. |
| **1. Scaffold** | Astro + Tailwind + TypeScript, ESLint/Prettier, deploy pipeline with preview URLs. |
| **2. Design system** | Colours, typography, spacing, buttons, cards; header and footer. |
| **3. Layouts & pages** | BaseLayout, HomeLayout, PageLayout, StaffLayout; all 8 routes with placeholder content. |
| **4. Content wiring** | Content collections and schemas, `site.json` settings, staff collection. |
| **5. Motion & polish** | Scroll reveals, view transitions, hover states, mobile menu, 404 page. |
| **6. SEO & a11y pass** | Meta, sitemap, JSON-LD, Lighthouse/axe audits, fixes. |
| **7. Handover** | README with "how to edit content", optional CMS setup, go-live on the domain. |

---

## 9. Open questions

1. Which languages: Uzbek / Russian / English? This affects routing from day one.
2. Brand assets: is there a logo, colours or photos?
3. Domain name and preferred hosting?
4. Should non-technical staff edit content through a web UI (CMS), or will developers edit Markdown?
5. Are a contact form, news/events or a gallery needed later? These shape the navigation now.
