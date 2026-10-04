import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { defaultLocale, type Locale } from '@/i18n/ui';

type LocalizedCollection = 'home' | 'pages' | 'news' | 'events' | 'staff' | 'gallery';

export type Localized<C extends LocalizedCollection> = CollectionEntry<C> & {
  slug: string;
  lang: Locale;
  /** true when the entry has no translation in the requested language yet */
  fallback: boolean;
};

// Photos are usually uploaded once, in the default language. Translations
// without their own photo reuse the default-language one.
const MEDIA_FIELDS = ['cover', 'photo', 'hero_image', 'welcome_image', 'images'];

function withSharedMedia(data: Record<string, unknown>, base?: Record<string, unknown>) {
  if (!base) return data;
  const merged = { ...data };
  for (const key of MEDIA_FIELDS) {
    const value = merged[key];
    const empty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
    if (empty && key in base) merged[key] = base[key];
  }
  return merged;
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
  const bySlug = new Map<string, Localized<C>>();
  for (const entry of all) {
    const { lang: entryLang, slug } = split(entry.id);
    if (entryLang === lang) {
      const data = withSharedMedia(entry.data as Record<string, unknown>, defaults.get(slug)?.data as Record<string, unknown> | undefined);
      bySlug.set(slug, { ...entry, data, slug, lang, fallback: false } as Localized<C>);
    }
  }
  for (const entry of all) {
    const { lang: entryLang, slug } = split(entry.id);
    if (entryLang === defaultLocale && !bySlug.has(slug)) {
      bySlug.set(slug, { ...entry, slug, lang: defaultLocale, fallback: true });
    }
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
