import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

// Content is stored as src/content/<collection>/<lang>/<slug>.md
// (the layout Decap CMS uses with `structure: multiple_folders`).
// Image fields hold paths like "/uploads/photo.jpg" (files in public/uploads/).
// Empty image fields are fine: the site shows a styled placeholder instead.

const image = z.string().trim().optional().nullable().transform((v) => v || undefined);

// Entry id = "<lang>/<file name>", e.g. "ru/about".
const md = (dir: string) =>
  glob({ pattern: '**/*.md', base: `./src/content/${dir}`, generateId: ({ entry }) => entry.replace(/\.md$/, '') });

const home = defineCollection({
  loader: md('home'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    hero_title: z.string(),
    hero_subtitle: z.string(),
    hero_image: image,
    hero_primary: z.object({ label: z.string(), link: z.string() }),
    hero_secondary: z.object({ label: z.string(), link: z.string() }).optional(),
    stats: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    highlights_title: z.string(),
    highlights: z
      .array(z.object({ title: z.string(), text: z.string(), link: z.string().optional() }))
      .default([]),
    welcome_title: z.string(),
    welcome_author: z.string(),
    welcome_role: z.string(),
    welcome_image: image,
    cta_title: z.string(),
    cta_text: z.string(),
    cta_label: z.string(),
    cta_link: z.string(),
  }),
});

const pages = defineCollection({
  loader: md('pages'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    hero_image: image,
    updated: z.coerce.date().optional(),
  }),
});

const news = defineCollection({
  loader: md('news'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    cover: image,
    draft: z.boolean().default(false),
  }),
});

const events = defineCollection({
  loader: md('events'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    end_date: z.coerce.date().optional().nullable(),
    location: z.string(),
    cover: image,
    draft: z.boolean().default(false),
  }),
});

const staff = defineCollection({
  loader: md('staff'),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    group: z.enum(['leadership', 'teachers', 'support']),
    order: z.number().default(100),
    photo: image,
    email: z.string().optional().nullable(),
  }),
});

const gallery = defineCollection({
  loader: md('gallery'),
  schema: z.object({
    title: z.string(),
    description: z.string().optional().default(''),
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
