import type { Locale, UIKey } from '@/i18n/ui';

// Where each entry of the "pages" collection is published (path after /<lang>/).
// The file name in src/content/pages/<lang>/ is the key.
export const pagePaths = {
  about: 'about',
  'directors-welcome': 'about/directors-welcome',
  'statement-of-community': 'about/statement-of-community',
  employment: 'about/employment',
  admissions: 'admissions',
  academics: 'academics',
  'child-protection': 'child-protection',
  'privacy-policy': 'privacy-policy',
} as const;

// Pages with their own route file that still take their intro text from the "pages" collection.
export const customPages = ['staff-leadership', 'contact'] as const;

export type PageId = keyof typeof pagePaths;

/** Builds a localized URL: url('ru', 'about/') -> '/ru/about/' */
export function url(lang: Locale, path = ''): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return clean ? `/${lang}/${clean}/` : `/${lang}/`;
}

/** Replaces the language prefix of a path: /uz/news/x/ -> /ru/news/x/ */
export function switchLang(pathname: string, lang: Locale): string {
  const rest = pathname.replace(/^\/(uz|ru|en)(?=\/|$)/, '');
  return `/${lang}${rest || '/'}`;
}

export interface NavItem {
  key: UIKey;
  path: string;
  children?: NavItem[];
}

export const mainNav: NavItem[] = [
  {
    key: 'nav.about',
    path: 'about',
    children: [
      { key: 'nav.about.overview', path: 'about' },
      { key: 'nav.about.welcome', path: 'about/directors-welcome' },
      { key: 'nav.about.community', path: 'about/statement-of-community' },
      { key: 'nav.about.staff', path: 'staff-leadership' },
      { key: 'nav.about.employment', path: 'about/employment' },
    ],
  },
  { key: 'nav.admissions', path: 'admissions' },
  { key: 'nav.academics', path: 'academics' },
  {
    key: 'nav.life',
    path: 'news',
    children: [
      { key: 'nav.news', path: 'news' },
      { key: 'nav.events', path: 'events' },
    ],
  },
  { key: 'nav.gallery', path: 'gallery' },
  { key: 'nav.contact', path: 'contact' },
];

export const footerLinks: NavItem[] = [
  { key: 'nav.about.overview', path: 'about' },
  { key: 'nav.admissions', path: 'admissions' },
  { key: 'nav.academics', path: 'academics' },
  { key: 'nav.news', path: 'news' },
  { key: 'nav.events', path: 'events' },
  { key: 'nav.about.employment', path: 'about/employment' },
];

export const policyLinks: NavItem[] = [
  { key: 'nav.childProtection', path: 'child-protection' },
  { key: 'nav.privacy', path: 'privacy-policy' },
  { key: 'nav.about.community', path: 'about/statement-of-community' },
];

/** Breadcrumb parent for nested pages. */
export function parentOf(path: string): NavItem | undefined {
  if (path.startsWith('about/')) return { key: 'nav.about', path: 'about' };
  if (path === 'staff-leadership') return { key: 'nav.about', path: 'about' };
  if (path.startsWith('news/')) return { key: 'nav.news', path: 'news' };
  if (path.startsWith('events/')) return { key: 'nav.events', path: 'events' };
  if (path.startsWith('gallery/')) return { key: 'nav.gallery', path: 'gallery' };
  return undefined;
}
