// Effetto "decodifica": il testo passa da glifi casuali a quello vero, lettera per lettera.
const GLYPHS = '!<>-_\/[]{}—=+*^?#01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function scramble(el: HTMLElement, duration = 900) {
  const target = el.dataset.text ?? el.textContent ?? '';
  el.dataset.text = target;
  if (reduced) return;
  // larghezza bloccata, così il layout non balla durante l'animazione
  el.setAttribute('aria-label', target);
  const start = performance.now();
  const chars = [...target];
  // ogni lettera si "risolve" in un momento diverso, da sinistra a destra con un po' di caso
  const settle = chars.map((_, i) => (i / chars.length) * 0.7 + Math.random() * 0.3);
  function frame(now: number) {
    const p = Math.min((now - start) / duration, 1);
    let out = '';
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      if (c === ' ' || p >= settle[i]) out += c;
      else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = target;
  }
  requestAnimationFrame(frame);
}

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      scramble(e.target as HTMLElement);
      io.unobserve(e.target);
    }
  },
  { rootMargin: '0px 0px -10% 0px' },
);
document.querySelectorAll<HTMLElement>('[data-scramble]').forEach((el) => io.observe(el));

// al passaggio del mouse sugli elementi marcati, ripete l'effetto
document.addEventListener('mouseover', (e) => {
  const el = (e.target as HTMLElement).closest?.<HTMLElement>('[data-scramble-hover]');
  if (!el || el.dataset.busy) return;
  el.dataset.busy = '1';
  scramble(el, 500);
  setTimeout(() => delete el.dataset.busy, 600);
});
