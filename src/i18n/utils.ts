import { ui, routes, defaultLang, type Lang, type UIKey, type RouteId } from './ui';

export function getLang(url: URL): Lang {
  const [, first] = url.pathname.split('/');
  return first === 'en' ? 'en' : defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UIKey, params: Record<string, string | number> = {}): string {
    let s: string = ui[lang][key] ?? ui[defaultLang][key];
    for (const [k, v] of Object.entries(params)) s = s.replace(`{${k}}`, String(v));
    return s;
  };
}

/** URL di una pagina nella lingua data; con `slug` punta al dettaglio. */
export function path(id: RouteId, lang: Lang, slug?: string): string {
  const base = routes[id][lang];
  return slug ? `${base}${slug}/` : base;
}

export const otherLang = (lang: Lang): Lang => (lang === 'it' ? 'en' : 'it');

const BIRTHDAY = new Date('2005-07-11');
export function age(now = new Date()): number {
  let a = now.getFullYear() - BIRTHDAY.getFullYear();
  const m = now.getMonth() - BIRTHDAY.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < BIRTHDAY.getDate())) a--;
  return a;
}
