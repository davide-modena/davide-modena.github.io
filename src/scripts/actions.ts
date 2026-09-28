// Azioni condivise da palette, terminale e scorciatoie.
import { toast } from './toast';

export function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  setTheme(next);
  return next;
}

export function setTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;
  root.classList.add('theme-switching');
  root.dataset.theme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch {}
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
}

export const ACCENTS = ['violet', 'blue', 'azure', 'orange'] as const;
type Accent = (typeof ACCENTS)[number];

/** Imposta il colore d'accento; senza argomento passa al successivo. */
export function setAccent(accent?: Accent): Accent {
  const root = document.documentElement;
  const current = (root.dataset.accent as Accent) || 'violet';
  const next = accent ?? ACCENTS[(ACCENTS.indexOf(current) + 1) % ACCENTS.length];
  if (next === 'violet') delete root.dataset.accent;
  else root.dataset.accent = next;
  try {
    localStorage.setItem('accent', next);
  } catch {}
  return next;
}

export async function copy(text: string, message: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast(message);
  } catch {
    toast(text);
  }
}

export function runAction(name: string) {
  const data = JSON.parse(document.getElementById('palette-data')?.textContent ?? '{}');
  switch (name) {
    case 'theme':
      toggleTheme();
      break;
    case 'accent':
      setAccent();
      break;
    case 'mini': {
      let off = false;
      try {
        off = localStorage.getItem('mini') === 'off';
      } catch {}
      dispatchEvent(new CustomEvent('mini', { detail: off ? 'on' : 'off' }));
      break;
    }
    case 'copy-email':
      copy(data.email, data.copied);
      break;
    case 'terminal':
      dispatchEvent(new Event('terminal:open'));
      break;
    case 'keys':
      dispatchEvent(new Event('keys:open'));
      break;
    case 'palette':
      dispatchEvent(new Event('palette:open'));
      break;
  }
}
