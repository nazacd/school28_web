import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

// Content is stored as src/content/<collection>/<lang>/<slug>.md
// (the layout Decap CMS uses with `structure: multiple_folders`).
// Image fields hold paths like "/uploads/photo.jpg" (files in public/uploads/).
// Empty image fields are fine: the site shows a styled placeholder instead.

const image = z.string().trim().optional().nullable().transform((v) => v || undefined);
// Text that editors translate. A translation left empty is stored as "" and filled in from the
// Uzbek version at build time (src/lib/content.ts), so one missing translation can't break the site.
// Required Uzbek fields are checked there too, with a clear error naming the file.
const text = z.string().nullish().transform((v) => v?.trim() ?? '');
const link = z.object({ label: text, link: text });
// The editor saves an empty date as null or "": treat both as "no date".
const optionalDate = z.preprocess((v) => (v === null || v === '' ? undefined : v), z.coerce.date().optional());

// Entry id = "<lang>/<file name>", e.g. "ru/about".
const md = (dir: string) =>
  glob({ pattern: '**/*.md', base: `./src/content/${dir}`, generateId: ({ entry }) => entry.replace(/\.md$/, '') });

const home = defineCollection({
  loader: md('home'),
  schema: z.object({
    title: text,
    description: text,
    hero_title: text,
    hero_subtitle: text,
    hero_image: image,
    hero_primary: link.default({ label: '', link: '' }),
    hero_secondary: link.optional().nullable().transform((v) => (v?.label && v.link ? v : undefined)),
    stats: z.array(z.object({ value: text, label: text })).nullish().transform((v) => v ?? []),
    highlights_title: text,
    highlights: z
      .array(z.object({ title: text, text: text, link: z.string().nullish().transform((v) => v || undefined) }))
      .nullish()
      .transform((v) => v ?? []),
    welcome_title: text,
    welcome_author: text,
    welcome_role: text,
    welcome_image: image,
    cta_title: text,
    cta_text: text,
    cta_label: text,
    cta_link: text,
  }),
});

const pages = defineCollection({
  loader: md('pages'),
  schema: z.object({
    title: text,
    description: text,
    hero_image: image,
    updated: optionalDate,
  }),
});

const news = defineCollection({
  loader: md('news'),
  schema: z.object({
    title: text,
    description: text,
    date: z.coerce.date(),
    cover: image,
    draft: z.boolean().default(false),
  }),
});

const events = defineCollection({
  loader: md('events'),
  schema: z.object({
    title: text,
    description: text,
    date: z.coerce.date(),
    end_date: optionalDate,
    location: text,
    cover: image,
    draft: z.boolean().default(false),
  }),
});

const staff = defineCollection({
  loader: md('staff'),
  schema: z.object({
    name: text,
    role: text,
    group: z.enum(['leadership', 'teachers', 'support']),
    order: z.number().default(100),
    photo: image,
    email: z.string().optional().nullable(),
  }),
});

const gallery = defineCollection({
  loader: md('gallery'),
  schema: z.object({
    title: text,
    description: text,
    date: z.coerce.date(),
    cover: image,
    images: z
      .array(z.object({ src: z.string(), alt: z.string().default('') }))
      .nullable()
      .default([])
      .transform((v) => v ?? []),
    placeholder_count: z.number().default(6),
  }),
});

const localized = z.object({ uz: z.string(), ru: z.string(), en: z.string() });

const settings = defineCollection({
  loader: file('./src/content/settings/site.json', { parser: (text) => ({ site: JSON.parse(text) }) }),
  schema: z.object({
    name: localized,
    short_name: z.string(),
    tagline: localized,
    logo: image,
    og_image: image,
    address: localized,
    hours: localized,
    phone: z.string(),
    email: z.string(),
    map_link: z.string().optional().default(''),
    map_embed: z.string().optional().default(''),
    founded: z.string().optional().default(''),
    socials: z
      .object({
        telegram: z.string().optional().default(''),
        instagram: z.string().optional().default(''),
        facebook: z.string().optional().default(''),
        youtube: z.string().optional().default(''),
      })
      .default({ telegram: '', instagram: '', facebook: '', youtube: '' }),
  }),
});

export const collections = { home, pages, news, events, staff, gallery, settings };
