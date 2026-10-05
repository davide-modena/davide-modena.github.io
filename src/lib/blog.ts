import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

export type Post = CollectionEntry<'blog'> & { slug: string };

/** gli articoli (le bozze solo con `npm run dev`), dal più recente */
export async function getBlog(): Promise<Post[]> {
  const all = await getCollection('blog', (p) => import.meta.env.DEV || !p.data.draft);
  return all.map((p) => ({ ...p, slug: p.id })).sort((a, b) => +b.data.date - +a.data.date);
}

/** "5 ottobre 2026" / "5 October 2026" */
export function formatDate(d: Date, lang: Lang) {
  return d.toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function readingMinutes(body: string | undefined) {
  const words = (body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
