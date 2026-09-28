// Collega lo scroll della pagina allo scroll dei siti dentro i mockup, senza bloccare la pagina.
//
// Ogni [data-scrub] ha un avanzamento p (0→1): 0 finché il suo bordo alto non sale al 45%
// dello schermo (così l'inizio della pagina mostrata si vede fermo), 1 quando il suo fondo
// arriva a metà schermo. Nello stesso tratto di scroll l'immagine [data-scrub-img] percorre
// tutta la sua altezza dentro la finestra [data-scrub-vp]: più la pagina mostrata è lunga,
// più scorre veloce rispetto alla pagina principale.
//
// Per restare leggero: le misure delle immagini si prendono solo al caricamento e al resize,
// a ogni fotogramma prima si leggono tutte le posizioni e poi si scrivono solo le trasformazioni
// (niente variabili CSS, che farebbero ricalcolare gli stili di tutto il blocco).

const clamp = (v: number) => Math.min(1, Math.max(0, v));
// ease-in-out (sinusoidale): parte e arriva dolce, senza scatti alle estremità
const ease = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

interface Track {
  el: HTMLElement;
  imgs: { img: HTMLElement; vp: HTMLElement; dist: number }[];
  stage: HTMLElement | null;
  phone: HTMLElement | null;
  bar: HTMLElement | null;
  pct: HTMLElement | null;
  last: string;
}

const tracks: Track[] = [...document.querySelectorAll<HTMLElement>('[data-scrub]')].map((el) => ({
  el,
  imgs: [...el.querySelectorAll<HTMLElement>('[data-scrub-img]')].map((img) => ({
    img,
    vp: img.closest<HTMLElement>('[data-scrub-vp]')!,
    dist: 0,
  })),
  stage: el.querySelector<HTMLElement>('[data-scrub-stage]'),
  phone: el.querySelector<HTMLElement>('[data-scrub-phone]'),
  bar: el.querySelector<HTMLElement>('[data-scrub-bar]'),
  pct: el.querySelector<HTMLElement>('[data-scrub-pct]'),
  last: '',
}));

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let queued = false;

function measure() {
  for (const t of tracks) {
    for (const i of t.imgs) i.dist = Math.max(0, i.img.offsetHeight - i.vp.clientHeight);
    t.last = '';
  }
  queue();
}

function update() {
  queued = false;
  const vh = innerHeight;
  // prima tutte le letture…
  const rects = tracks.map((t) => t.el.getBoundingClientRect());
  // …poi tutte le scritture
  tracks.forEach((t, k) => {
    const r = rects[k];
    if (r.bottom < -200 || r.top > vh + 200) return;
    const start = vh * 0.45; // il bordo alto del mockup è poco sopra metà schermo
    const end = vh * 0.5 - r.height; // il bordo basso del mockup è a metà schermo
    const p = ease(clamp((start - r.top) / (start - end)));
    const e = clamp((vh - r.top) / (vh * 0.7));
    const key = `${p.toFixed(4)}|${e.toFixed(3)}`;
    if (key === t.last) return;
    t.last = key;

    for (const i of t.imgs) i.img.style.transform = `translate3d(0, ${(-p * i.dist).toFixed(1)}px, 0)`;
    if (!reduced) {
      if (t.stage) t.stage.style.transform = `perspective(1600px) rotateX(${((1 - e) * 10).toFixed(2)}deg) scale(${(0.94 + e * 0.06).toFixed(4)})`;
      // il telefono si alza un po' più del computer: parallasse
      if (t.phone) t.phone.style.transform = `translate3d(0, ${((0.5 - p) * 60).toFixed(1)}px, 0)`;
    }
    if (t.bar) t.bar.style.transform = `scaleX(${p.toFixed(4)})`;
    if (t.pct) t.pct.textContent = `${Math.round(p * 100)}%`;
  });
}

function queue() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(update);
}

addEventListener('scroll', queue, { passive: true });
addEventListener('resize', measure);
// le immagini lazy cambiano altezza quando arrivano
for (const t of tracks) for (const i of t.imgs) i.img.addEventListener('load', measure);
measure();
