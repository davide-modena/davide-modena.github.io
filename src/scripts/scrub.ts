// Collega lo scroll della pagina allo scroll dei siti dentro i mockup, senza bloccare la pagina.
//
// Ogni [data-scrub] ha un avanzamento p (0→1): 0 finché il suo bordo alto non sale al 45%
// dello schermo (così l'inizio della pagina mostrata si vede fermo), 1 quando il suo fondo
// arriva a metà schermo. Nello stesso tratto di scroll l'immagine [data-scrub-img]
// percorre tutta la sua altezza dentro la finestra [data-scrub-vp]: più la pagina mostrata è
// lunga, più scorre veloce rispetto alla pagina principale.
// Scrive anche --p (avanzamento) ed --e (entrata, per l'effetto 3D) come variabili CSS.

const tracks = [...document.querySelectorAll<HTMLElement>('[data-scrub]')];
const clamp = (v: number) => Math.min(1, Math.max(0, v));
// ease-in-out (sinusoidale): parte e arriva dolce, senza scatti alle estremità
const ease = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

let queued = false;

function update() {
  queued = false;
  const vh = innerHeight;
  for (const track of tracks) {
    const r = track.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) continue;

    const start = vh * 0.45; // il bordo alto del mockup è poco sopra metà schermo
    const end = vh * 0.5 - r.height; // il bordo basso del mockup è a metà schermo
    const p = ease(clamp((start - r.top) / (start - end)));
    const e = clamp((vh - r.top) / (vh * 0.7));

    track.style.setProperty('--p', p.toFixed(4));
    track.style.setProperty('--e', e.toFixed(4));
    const pct = track.querySelector('[data-scrub-pct]');
    if (pct) pct.textContent = `${Math.round(p * 100)}%`;

    for (const img of track.querySelectorAll<HTMLElement>('[data-scrub-img]')) {
      const vp = img.closest<HTMLElement>('[data-scrub-vp]');
      if (!vp) continue;
      const dist = Math.max(0, img.offsetHeight - vp.clientHeight);
      img.style.transform = `translate3d(0, ${(-p * dist).toFixed(1)}px, 0)`;
    }
  }
}

function queue() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(update);
}

addEventListener('scroll', queue, { passive: true });
addEventListener('resize', queue);
// le immagini lazy cambiano altezza quando arrivano
document.querySelectorAll('[data-scrub-img]').forEach((img) => img.addEventListener('load', queue));
update();
