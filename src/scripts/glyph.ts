// Disegno della Glyph Matrix del Nothing Phone (3) per le pagine del Lab: 25×25 LED, 489 accesi, in cerchio.
// Le animazioni (public/glyph/anims.json) sono i fotogrammi veri dell'app Hevy Companion; qui ci sono le scene
// che l'app costruisce intorno (set, sabbia del riposo, fine riposo), riscritte dal motore Kotlin.

export const N = 25;
const C = 12;
export const isLed = (x: number, y: number) => Math.hypot(x - C, y - C) <= 12.5;

export const LEDS: number[] = [];
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (isLed(x, y)) LEDS.push(y * N + x);

export type Anim = { id: string; label: string; period: number; frames: string[] };

let loading: Promise<Anim[]> | null = null;
export function loadAnims(): Promise<Anim[]> {
  loading ??= fetch(`${import.meta.env.BASE_URL}glyph/anims.json`)
    .then((r) => r.json())
    .then((d) => d.anims as Anim[]);
  return loading;
}

const decoded = new Map<string, Uint8Array>();
export function frameOf(a: Anim, ms: number): Uint8Array {
  const idx = Math.floor((ms % a.period) / 50) % a.frames.length;
  const key = `${a.id}:${idx}`;
  let f = decoded.get(key);
  if (!f) {
    f = Uint8Array.from(atob(a.frames[idx]), (c) => c.charCodeAt(0));
    decoded.set(key, f);
  }
  return f;
}

/* ---------- disegno ---------- */

const LEVELS: string[] = [];
const GLOWS: string[] = [];
for (let i = 0; i < 16; i++) {
  const c = Math.round(70 + (185 * i) / 15);
  LEVELS.push(`rgb(${c},${c},${c})`);
  GLOWS.push(`rgba(255,255,255,${(0.015 + (0.065 * i) / 15).toFixed(3)})`);
}

/** Un frame come LED quadrati dentro un cerchio nero. (x, y) è l'angolo in alto a sinistra. */
export function drawMatrix(ctx: CanvasRenderingContext2D, f: ArrayLike<number>, x: number, y: number, size: number) {
  const cell = size / N;
  const rad = size / 2;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x + rad, y + rad, rad * 1.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.14)';
  ctx.lineWidth = Math.max(1, size * 0.008);
  ctx.beginPath();
  ctx.arc(x + rad, y + rad, rad * 1.04, 0, Math.PI * 2);
  ctx.stroke();
  const side = cell * 0.74;
  const pad = (cell - side) / 2;
  ctx.fillStyle = 'rgba(255,255,255,.07)';
  for (const p of LEDS) {
    if (f[p] === 0) ctx.fillRect(x + (p % N) * cell + pad, y + Math.floor(p / N) * cell + pad, side, side);
  }
  for (const p of LEDS) {
    const v = f[p];
    if (v === 0) continue;
    const px = x + (p % N) * cell + pad;
    const py = y + Math.floor(p / N) * cell + pad;
    const q = Math.min(15, Math.round(v / 17));
    ctx.fillStyle = GLOWS[q];
    ctx.fillRect(px - side * 0.3, py - side * 0.3, side * 1.6, side * 1.6);
    ctx.fillStyle = LEVELS[q];
    ctx.fillRect(px, py, side, side);
  }
}

/* ---------- le scene dell'app ---------- */

const SMALL: Record<string, string[]> = {
  '0': ['###', '#.#', '#.#', '#.#', '###'], '1': ['.#.', '##.', '.#.', '.#.', '###'],
  '2': ['###', '..#', '###', '#..', '###'], '3': ['###', '..#', '.##', '..#', '###'],
  '4': ['#.#', '#.#', '###', '..#', '..#'], '5': ['###', '#..', '###', '..#', '###'],
  '6': ['###', '#..', '###', '#.#', '###'], '7': ['###', '..#', '..#', '.#.', '.#.'],
  '8': ['###', '#.#', '###', '#.#', '###'], '9': ['###', '#.#', '###', '..#', '###'],
  '/': ['..#', '..#', '.#.', '#..', '#..'], x: ['...', '#.#', '.#.', '#.#', '...'],
  '.': ['.', '.', '.', '.', '#'], ':': ['.', '#', '.', '#', '.'],
};
const BIG: Record<string, string[]> = {
  '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  '3': ['#####', '...#.', '..#..', '...#.', '....#', '#...#', '.###.'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
};

const textWidth = (font: Record<string, string[]>, text: string) => {
  const g = [...text].map((c) => font[c]).filter(Boolean);
  return g.reduce((s, r) => s + r[0].length, 0) + Math.max(0, g.length - 1);
};
function drawText(font: Record<string, string[]>, text: string, x: number, y: number, plot: (x: number, y: number) => void) {
  let cx = x;
  for (const ch of text) {
    const g = font[ch];
    if (!g) continue;
    for (let r = 0; r < g.length; r++) for (let c = 0; c < g[r].length; c++) if (g[r][c] === '#') plot(cx + c, y + r);
    cx += g[0].length + 1;
  }
}
const ledsInRow = (y: number) => {
  let n = 0;
  for (let x = 0; x < N; x++) if (isLed(x, y)) n++;
  return n;
};

/** Impila le righe al centro; una riga che non entra nella parte stretta del cerchio viene scartata. */
function layout(lines: string[]) {
  const cur = lines.slice();
  for (;;) {
    const top = Math.floor((N - (cur.length * 5 + (cur.length - 1) * 2)) / 2);
    const ys = cur.map((_, i) => top + i * 7);
    let bad = -1;
    cur.forEach((t, i) => {
      if (i === 0) return;
      let min = 99;
      for (let y = ys[i]; y < ys[i] + 5; y++) min = Math.min(min, ledsInRow(Math.max(0, Math.min(N - 1, y))));
      if (textWidth(SMALL, t) > min) bad = i;
    });
    if (bad < 0) return cur.map((t, i) => ({ t, x: Math.floor((N - textWidth(SMALL, t)) / 2), y: ys[i] }));
    cur.splice(bad, 1);
  }
}

const inb = (x: number, y: number) => x >= 0 && x < N && y >= 0 && y < N;

export function setFrame(lines: string[]): Uint8Array {
  const f = new Uint8Array(N * N);
  layout(lines).forEach((p) => drawText(SMALL, p.t, p.x, p.y, (x, y) => inb(x, y) && (f[y * N + x] = 255)));
  return f;
}

const FILL_ORDER = LEDS.slice().sort(
  (a, b) => Math.floor(b / N) - Math.floor(a / N) || Math.abs((a % N) - C) - Math.abs((b % N) - C) || (a % N) - (b % N),
);

function grain(x: number, y: number) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) & 0x7fffffff;
}

/** La sabbia che sale, col conto alla rovescia in secondi o, se `lines`, i dati del prossimo set sopra la sabbia. */
export function restFrame(remainingMs: number, totalMs: number, animMs: number, lines: string[] | null): Uint8Array {
  const f = new Uint8Array(N * N);
  const frac = Math.min(1, Math.max(0, 1 - remainingMs / totalMs));
  const filled = Math.round(frac * FILL_ORDER.length);
  for (let i = 0; i < filled; i++) {
    const p = FILL_ORDER[i];
    f[p] = 120 + (grain(p % N, Math.floor(p / N)) % 50);
  }
  type Placed = { t: string; font: Record<string, string[]>; x: number; y: number; h: number };
  let placed: Placed[];
  if (lines) {
    placed = layout(lines).map((p) => ({ ...p, font: SMALL, h: 5 }));
  } else {
    const label = String(Math.ceil(remainingMs / 1000));
    const big = textWidth(BIG, label) <= 21;
    const font = big ? BIG : SMALL;
    const h = big ? 7 : 5;
    placed = [{ t: label, font, x: Math.floor((N - textWidth(font, label)) / 2), y: Math.floor((N - h) / 2), h }];
  }
  const lo = Math.min(...placed.map((p) => p.y)) - 1;
  const hi = Math.max(...placed.map((p) => p.y + p.h));
  if (filled < FILL_ORDER.length) {
    const phase = Math.floor(animMs / 70) % 3;
    let y = 0;
    while (y < N && !isLed(C, y)) y++;
    while (y < N && f[y * N + C] === 0) {
      if ((y + 3 - phase) % 3 === 0 && !(y >= lo && y <= hi)) f[y * N + C] = 200;
      y++;
    }
  }
  // il testo è ritagliato dalla sabbia e acceso dove la sabbia non c'è
  placed.forEach((p) =>
    drawText(p.font, p.t, p.x, p.y, (x, y) => {
      if (inb(x, y)) f[y * N + x] = f[y * N + x] > 0 ? 0 : 255;
    }),
  );
  return f;
}

export function alertFrame(sinceMs: number): Uint8Array {
  const f = new Uint8Array(N * N);
  if (sinceMs < 1500) {
    if (Math.floor(sinceMs / 250) % 2 === 0) LEDS.forEach((p) => (f[p] = 255));
  } else {
    const r = ((sinceMs - 1500) / 1500) * 13.5;
    LEDS.forEach((p) => {
      if (Math.abs(Math.hypot((p % N) - C, Math.floor(p / N) - C) - r) < 1.2) f[p] = 255;
    });
  }
  return f;
}

export type Phase = 'set' | 'motion' | 'rest' | 'next' | 'alert';

const SET_MS = 2500;
export const REST_MS = 9000;
const ALERT_MS = 3000;
const COUNTDOWN_MS = 3000;
const wholeCycles = (cycle: number, min: number) => cycle * Math.max(1, Math.ceil(min / cycle));

export function cycleLength(a: Anim, restMs = REST_MS) {
  return SET_MS + wholeCycles(a.period, 4000) + restMs + ALERT_MS;
}

/** Istante del giro in cui comincia il riposo. */
export const restStart = (a: Anim) => SET_MS + wholeCycles(a.period, 4000);

/** Un giro completo come nell'app: set, ripetizioni intere dello stickman, riposo (conto e prossimo set), flash. */
export function cycleFrame(a: Anim, ms: number, restMs = REST_MS): { frame: Uint8Array; phase: Phase } {
  const motion = wholeCycles(a.period, 4000);
  const t = ms % cycleLength(a, restMs);
  const lines = a.id === 'running' ? ['1/1', '0.56', '07:30'] : ['2/3', '30x15'];
  const next = a.id === 'running' ? lines : ['3/3', '30x15'];
  if (t < SET_MS) return { frame: setFrame(lines), phase: 'set' };
  if (t < SET_MS + motion) return { frame: frameOf(a, t - SET_MS), phase: 'motion' };
  const r = t - SET_MS - motion;
  if (r < restMs) {
    const data = r % (COUNTDOWN_MS + SET_MS) >= COUNTDOWN_MS;
    return { frame: restFrame(restMs - r, restMs, r, data ? next : null), phase: data ? 'next' : 'rest' };
  }
  return { frame: alertFrame(r - restMs), phase: 'alert' };
}

/** True se l'utente chiede meno movimento. */
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
