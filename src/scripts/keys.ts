// Scorciatoie da tastiera globali.
import { runAction, toggleTheme } from './actions';

const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
document.querySelectorAll('[data-mod-key]').forEach((k) => (k.textContent = isMac ? '⌘ k' : 'ctrl k'));

document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  if (t.closest('[data-open-palette]')) runAction('palette');
  else if (t.closest('[data-open-terminal]')) runAction('terminal');
  else if (t.closest('[data-open-keys]')) runAction('keys');
});

const home = document.querySelector<HTMLAnchorElement>('.brand')?.getAttribute('href') ?? '/';
const navHref = (i: number) => document.querySelectorAll<HTMLAnchorElement>('.site-header nav a')[i]?.getAttribute('href');
const GOTO: Record<string, () => string | null | undefined> = {
  h: () => home,
  w: () => navHref(0),
  l: () => navHref(1),
  a: () => navHref(2),
  b: () => navHref(3),
  c: () => navHref(4),
};

let pendingG = 0;
let active = -1;

function typing(e: KeyboardEvent) {
  const el = e.target as HTMLElement;
  return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || document.querySelector('dialog[open]');
}

function move(dir: 1 | -1) {
  const items = [...document.querySelectorAll<HTMLElement>('[data-nav-item]')];
  if (!items.length) return;
  // se nessuno è selezionato parte dal primo visibile
  if (active < 0 || !items[active]) {
    const first = items.findIndex((el) => el.getBoundingClientRect().bottom > 80);
    active = dir === 1 ? Math.max(first, 0) : Math.max(first - 1, 0);
  } else active = Math.min(Math.max(active + dir, 0), items.length - 1);
  items.forEach((el, i) => el.classList.toggle('kb-active', i === active));
  items[active].scrollIntoView({ block: 'center', behavior: 'smooth' });
}

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    dispatchEvent(new Event('palette:toggle'));
    return;
  }
  if (e.key === '`' || e.code === 'Backquote') {
    if ((e.target as HTMLElement).closest?.('.terminal')) return;
    if (typing(e)) return;
    e.preventDefault();
    dispatchEvent(new Event('terminal:toggle'));
    return;
  }
  if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;

  if (pendingG && Date.now() - pendingG < 900) {
    pendingG = 0;
    const href = GOTO[e.key]?.();
    if (href) {
      e.preventDefault();
      if (href.startsWith('#')) document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      else location.href = href;
    }
    return;
  }
  switch (e.key) {
    case 'g':
      pendingG = Date.now();
      break;
    case 'j':
      move(1);
      break;
    case 'k':
      move(-1);
      break;
    case 'Enter': {
      const el = document.querySelector<HTMLElement>('[data-nav-item].kb-active');
      const a = el?.matches('a') ? (el as HTMLAnchorElement) : el?.querySelector<HTMLAnchorElement>('a[href]');
      if (a) a.click();
      break;
    }
    case 't':
      toggleTheme();
      break;
    case '?':
      runAction('keys');
      break;
    case 'Escape':
      document.querySelectorAll('.kb-active').forEach((el) => el.classList.remove('kb-active'));
      active = -1;
      break;
  }
});
