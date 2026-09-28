import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

type Key = 'works' | 'lab';
export type Localized<K extends Key> = CollectionEntry<K> & { slug: string; fallback: boolean };

/**
 * Voci di una collezione nella lingua richiesta. Se una voce esiste solo in
 * italiano viene usata quella, segnata con `fallback` per mostrare un avviso.
 */
export async function getLocalized<K extends Key>(key: K, lang: Lang): Promise<Localized<K>[]> {
  const all = (await getCollection(key)) as CollectionEntry<K>[];
  const bySlug = new Map<string, Localized<K>>();
  for (const entry of all) {
    const [entryLang, slug] = entry.id.split('/');
    const isWanted = entryLang === lang;
    const existing = bySlug.get(slug);
    if (isWanted || (!existing && entryLang === 'it')) {
      bySlug.set(slug, { ...entry, slug, fallback: !isWanted });
    }
  }
  return [...bySlug.values()].sort((a, b) => a.data.order - b.data.order);
}
