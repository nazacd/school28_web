// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

// Public URL of the site. Used for canonical links, hreflang and the sitemap.
// Set it at build time: SITE_URL=https://school28.uz npm run build
const site = process.env.SITE_URL || 'http://localhost:4321';

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  // Every page is pre-rendered to static HTML at build time.
  // Only the routes that opt out (`export const prerender = false`) run on the server:
  // the contact form API, the CMS login and the language redirect on "/".
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  security: {
    // The contact endpoint checks the Origin header itself (see src/lib/origin.ts),
    // so it keeps working behind a reverse proxy.
    checkOrigin: false,
  },
  integrations: [
    sitemap({
      // "/" only redirects to a language; the editor and thank-you page are not for search engines.
      filter: (page) => {
        const path = new URL(page).pathname;
        return path !== '/' && !path.startsWith('/admin') && !path.includes('/contact/thanks/');
      },
      i18n: {
        defaultLocale: 'uz',
        locales: { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' },
      },
    }),
  ],
});
