import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { defaultLocale, type Locale } from '@/i18n/ui';

type LocalizedCollection = 'home' | 'pages' | 'news' | 'events' | 'staff' | 'gallery';

export type Localized<C extends LocalizedCollection> = CollectionEntry<C> & {
  slug: string;
  lang: Locale;
  /** true when the entry has no translation in the requested language yet */
  fallback: boolean;
};

// Fields that must be filled in the default language (Uzbek). Translations may leave any field
// empty: it is then filled from the Uzbek version (photos are usually uploaded only once, too).
const REQUIRED: Record<LocalizedCollection, string[]> = {
  home: ['title', 'description', 'hero_title', 'hero_subtitle', 'hero_primary.label', 'hero_primary.link', 'highlights_title', 'welcome_title', 'cta_title', 'cta_label', 'cta_link'],
  pages: ['title', 'description'],
  news: ['title', 'description'],
  events: ['title', 'description', 'location'],
  staff: ['name', 'role'],
  gallery: ['title'],
};

const isEmpty = (v: unknown) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date);

/** Fills every empty field of a translation from the default-language version. */
function fillEmpty(data: Record<string, unknown>, base: Record<string, unknown>): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...data };
  for (const [key, baseValue] of Object.entries(base)) {
    const value = merged[key];
    if (isEmpty(value)) merged[key] = baseValue;
    else if (isPlainObject(value) && isPlainObject(baseValue)) merged[key] = fillEmpty(value, baseValue);
  }
  return merged;
}

function checkRequired(collection: LocalizedCollection, slug: string, data: Record<string, unknown>) {
  const missing = REQUIRED[collection].filter((path) =>
    isEmpty(path.split('.').reduce<unknown>((v, k) => (isPlainObject(v) ? v[k] : undefined), data)),
  );
  if (missing.length) {
    throw new Error(`src/content/${collection}/${defaultLocale}/${slug}.md: required field(s) empty in the default language: ${missing.join(', ')}`);
  }
}

function split(id: string) {
  const [lang, ...rest] = id.split('/');
  return { lang, slug: rest.join('/') };
}

/**
 * Returns every entry of a collection in the requested language.
 * If an entry is not translated yet, the default-language (Uzbek) version is used,
 * so every page exists in every language.
 */
export async function getLocalized<C extends LocalizedCollection>(collection: C, lang: Locale): Promise<Localized<C>[]> {
  const all = (await getCollection(collection)) as CollectionEntry<C>[];
  const defaults = new Map(all.filter((e) => split(e.id).lang === defaultLocale).map((e) => [split(e.id).slug, e]));
  for (const [slug, entry] of defaults) checkRequired(collection, slug, entry.data as Record<string, unknown>);

  const bySlug = new Map<string, Localized<C>>();
  for (const entry of all) {
    const { lang: entryLang, slug } = split(entry.id);
    if (entryLang !== lang) continue;
    const base = defaults.get(slug);
    if (!base || entryLang === defaultLocale) {
      bySlug.set(slug, { ...entry, slug, lang, fallback: false });
      continue;
    }
    const data = fillEmpty(entry.data as Record<string, unknown>, base.data as Record<string, unknown>);
    // An untranslated body shows the default-language text.
    const body = entry.body?.trim() ? {} : { body: base.body, rendered: base.rendered };
    bySlug.set(slug, { ...entry, ...body, data, slug, lang, fallback: false } as Localized<C>);
  }
  for (const [slug, entry] of defaults) {
    if (!bySlug.has(slug)) bySlug.set(slug, { ...entry, slug, lang: defaultLocale, fallback: true });
  }
  return [...bySlug.values()].filter((e) => !('draft' in e.data && e.data.draft));
}

export async function getLocalizedEntry<C extends LocalizedCollection>(collection: C, lang: Locale, slug: string) {
  const entries = await getLocalized(collection, lang);
  return entries.find((e) => e.slug === slug);
}

export async function getSettings() {
  const entry = await getEntry('settings', 'site');
  if (!entry) throw new Error('Missing src/content/settings/site.json');
  return entry.data;
}

export const byDateDesc = (a: { data: { date: Date } }, b: { data: { date: Date } }) =>
  b.data.date.getTime() - a.data.date.getTime();

export const byDateAsc = (a: { data: { date: Date } }, b: { data: { date: Date } }) =>
  a.data.date.getTime() - b.data.date.getTime();

/** Events that have not finished yet (compared with the build date). */
export function isUpcoming(event: CollectionEntry<'events'>, now = new Date()) {
  const end = event.data.end_date ?? event.data.date;
  const endOfDay = new Date(end);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay >= now;
}
