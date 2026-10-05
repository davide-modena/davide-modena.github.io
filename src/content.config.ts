import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// I file stanno in <collezione>/<lingua>/<slug>.mdx: l'id diventa "it/arcreate".

const works = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/works' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      domain: z.string(),
      url: z.url(),
      client: z.string(),
      year: z.string(),
      role: z.array(z.string()),
      stack: z.array(z.string()),
      summary: z.string(),
      shot: image(),
      /** screenshot da telefono, per il mockup mobile */
      shotMobile: image().optional(),
      status: z.enum(['live', 'wip']).default('live'),
      order: z.number().default(99),
      ai: z.boolean().default(false),
    }),
});

const lab = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lab' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    year: z.string(),
    kind: z.enum(['web', 'app', 'bot', 'hardware', 'tool']),
    stack: z.array(z.string()),
    live: z.url().optional(),
    repo: z.url().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(99),
    /** la nota AI del Lab ora è una frase unica nell'intro; qui resta per casi particolari */
    ai: z.boolean().default(false),
    /** simbolo mostrato nella copertina generata */
    glyph: z.string().default('●'),
  }),
});

// Gli articoli sono file singoli in src/content/blog/<slug>.md (i file che iniziano con _ vengono ignorati).
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** data di pubblicazione (AAAA-MM-GG) */
    date: z.coerce.date(),
    /** da mettere se modifichi l'articolo in seguito */
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['it', 'en']).default('it'),
    /** true = visibile solo con `npm run dev`, non online */
    draft: z.boolean().default(false),
  }),
});

export const collections = { works, lab, blog };
