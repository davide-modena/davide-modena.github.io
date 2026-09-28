// Il mini-me in pixel art, disegnato da codice.
//
// Testa e busto sono griglie disegnate a mano; braccia e gambe sono segmenti spessi calcolati
// da poche coordinate per posa. Alla fine un contorno automatico gira attorno alla sagoma.
// La palette dipende dal tema: maglietta bianca sul tema scuro, nera su quello chiaro.
// Guarda a destra; per andare a sinistra si specchia.

export const W = 40;
/** l'ultima riga (la suola) è il punto d'appoggio della figura */
export const H = 51;

export type Theme = 'dark' | 'light';
type RGB = [number, number, number];

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

const SHARED: Record<string, string> = {
  h: '#3b2618', // capelli
  g: '#5e3f2a', // riflesso capelli
  f: '#6c4f3e', // sfumatura rasata ai lati
  s: '#edb993', // pelle
  S: '#cf9270', // pelle in ombra
  b: '#7a5541', // barba corta
  B: '#5f4131', // barba più scura (baffi)
  e: '#1b120c', // occhi
  z: '#ffffff', // luce negli occhi
  m: '#a4574a', // bocca
  j: '#78a8e0', // jeans
  J: '#5783bf', // jeans in ombra
  k: '#f3f3f3', // scarpe
  K: '#8d939c', // suola
};

const PALETTES: Record<Theme, Record<string, string>> = {
  dark: { ...SHARED, w: '#f5f5f5', W: '#c9ccd3', o: '#050505' },
  light: { ...SHARED, w: '#2a2a2a', W: '#151515', o: '#0b0908' },
};

// --- testa: 20×18, di tre quarti verso destra -------------------------------------------------
const HEAD = [
  '......hhhhhhhh......',
  '....hhhhhhhgghhh....',
  '...hhhhhhhhhhgghhh..',
  '..hhhhhhhhhhhhhhhhh.',
  '..hhhhhhhhhhhhhhhhhh',
  '.fhhhhhhhhhhhhhhhhhh',
  '.ffhhhhhhsssssssssh.',
  '.fffhhssssssssssss..',
  '.fffssssssssssssss..',
  '.ffSSsssssssssssss..',
  '.ffSsSssssssssssss..',
  '.ffSSssssssssssssS..',
  '..fSsssssssssssssS..',
  '..fbsssssssssssssb..',
  '...bbsssssssssssb...',
  '...bbbbbbbbbbbbbb...',
  '....bbbbbbbbbbbb....',
  '......bbbbbbbb......',
];
const HEAD_X = 10;
const HEAD_Y = 4;

type Face = 'normal' | 'blink' | 'happy' | 'sleep' | 'dizzy' | 'wow';
type Px = [number, number, string];

const BROWS: Px[] = [[9, 7, 'h'], [10, 7, 'h'], [11, 7, 'h'], [14, 7, 'h'], [15, 7, 'h'], [16, 7, 'h']];
const NOSE: Px[] = [[14, 11, 'S'], [14, 12, 'S'], [13, 12, 'S']];
const MUSTACHE: Px[] = [[11, 13, 'B'], [12, 13, 'B'], [13, 13, 'B'], [14, 13, 'B'], [15, 13, 'B'], [16, 13, 'B']];
const eye = (x: number): Px[] => [[x, 9, 'e'], [x + 1, 9, 'e'], [x, 10, 'e'], [x + 1, 10, 'e']];

/** dettagli del viso, in coordinate della testa */
const FACES: Record<Face, Px[]> = {
  normal: [...BROWS, ...eye(10), ...eye(15), ...NOSE, ...MUSTACHE, [12, 14, 'm'], [13, 14, 'm'], [14, 14, 'm']],
  blink: [...BROWS, [10, 10, 'e'], [11, 10, 'e'], [15, 10, 'e'], [16, 10, 'e'], ...NOSE, ...MUSTACHE, [12, 14, 'm'], [13, 14, 'm'], [14, 14, 'm']],
  happy: [
    ...BROWS,
    [9, 10, 'e'], [10, 9, 'e'], [11, 9, 'e'], [12, 10, 'e'], // occhi a "^"
    [14, 10, 'e'], [15, 9, 'e'], [16, 9, 'e'], [17, 10, 'e'],
    ...NOSE, ...MUSTACHE,
    [11, 14, 'm'], [12, 15, 'm'], [13, 15, 'm'], [14, 15, 'm'], [15, 14, 'm'], // sorriso
  ],
  sleep: [...BROWS, [9, 10, 'e'], [10, 10, 'e'], [11, 10, 'e'], [14, 10, 'e'], [15, 10, 'e'], [16, 10, 'e'], ...NOSE, ...MUSTACHE, [13, 14, 'm']],
  dizzy: [
    [9, 8, 'e'], [11, 8, 'e'], [10, 9, 'e'], [9, 10, 'e'], [11, 10, 'e'], // occhi a "x"
    [14, 8, 'e'], [16, 8, 'e'], [15, 9, 'e'], [14, 10, 'e'], [16, 10, 'e'],
    ...NOSE, ...MUSTACHE,
    [12, 15, 'm'], [13, 14, 'm'], [14, 15, 'm'], [15, 14, 'm'], // bocca a zig-zag
  ],
  wow: [
    [9, 6, 'h'], [10, 6, 'h'], [11, 6, 'h'], [14, 6, 'h'], [15, 6, 'h'], [16, 6, 'h'], // sopracciglia alzate
    ...eye(10), ...eye(15), [10, 11, 'e'], [11, 11, 'e'], [15, 11, 'e'], [16, 11, 'e'],
    ...NOSE, ...MUSTACHE,
    [13, 14, 'm'], [14, 14, 'm'], [13, 15, 'm'], [14, 15, 'm'], // bocca a "o"
  ],
};

// --- busto (maglietta girocollo): 12×13 --------------------------------------------------------
const TORSO = [
  'WWwwWWWWwwwW',
  'Wwwwwwwwwwww',
  'Wwwwwwwwwwww',
  'Wwwwwwwwwwww',
  'Wwwwwwwwwwww',
  'Wwwwwwwwwwww',
  'Wwwwwwwwwwww',
  'Wwwwwwwwwwww',
  'Wwwwwwwwwwww',
  'WWwwwwwwwwww',
  'WWwwwwwwwwwW',
  'JJJJJJJJJJJJ',
];
const TORSO_X = 14;
const TORSO_Y = 22;

type Pt = [number, number];
interface Pose {
  face: Face;
  /** spostamento verticale di busto e testa (le gambe si adattano) */
  dy?: number;
  /** spostamento extra solo della testa */
  hx?: number;
  hy?: number;
  /** braccia: [gomito, mano] relativi alla spalla */
  back: [Pt, Pt];
  front: [Pt, Pt];
  /** gambe: [ginocchio, piede] relativi all'anca */
  legB: [Pt, Pt];
  legF: [Pt, Pt];
}

const ARM_DOWN: [Pt, Pt] = [[0, 5], [0, 9]];
const LEG_STRAIGHT: [Pt, Pt] = [[0, 6], [0, 12]];

// ciclo di corsa: 6 fotogrammi, le gambe si scambiano a metà
const runLegs: [Pt, Pt][] = [
  [[3, 5], [6, 10]], // avanti, appoggio
  [[3, 6], [3, 12]], // sotto
  [[0, 6], [0, 12]], // passaggio
  [[-2, 6], [-6, 9]], // dietro
  [[-3, 5], [-6, 6]], // su
  [[1, 5], [0, 8]], // ritorno
];
const armFwd: [Pt, Pt] = [[3, 3], [6, 5]];
const armBack: [Pt, Pt] = [[-3, 3], [-4, 7]];
const armMid: [Pt, Pt] = [[0, 5], [1, 8]];
const runArms: [Pt, Pt][] = [armBack, armMid, armMid, armFwd, armMid, armMid];

const SIT_LEGS_A: [[Pt, Pt], [Pt, Pt]] = [[[5, 0], [5, 6]], [[6, 0], [7, 5]]];
const SIT_LEGS_B: [[Pt, Pt], [Pt, Pt]] = [[[5, 0], [6, 5]], [[6, 0], [6, 6]]];
const SIT_ARMS: [[Pt, Pt], [Pt, Pt]] = [[[-1, 5], [2, 8]], [[2, 5], [5, 7]]];

export const POSES: Record<string, Pose[]> = {
  idle: [
    { face: 'normal', back: ARM_DOWN, front: ARM_DOWN, legB: LEG_STRAIGHT, legF: LEG_STRAIGHT },
    { face: 'normal', dy: 1, back: ARM_DOWN, front: ARM_DOWN, legB: [[0, 5], [0, 11]], legF: [[0, 5], [0, 11]] },
  ],
  blink: [{ face: 'blink', back: ARM_DOWN, front: ARM_DOWN, legB: LEG_STRAIGHT, legF: LEG_STRAIGHT }],
  run: runLegs.map((_, i) => ({
    face: 'normal',
    dy: i % 3 === 1 ? 1 : 0,
    legF: runLegs[i],
    legB: runLegs[(i + 3) % 6],
    front: runArms[i],
    back: runArms[(i + 3) % 6],
  })),
  jump: [{ face: 'happy', back: [[-3, -4], [-6, -9]], front: [[4, -4], [8, -9]], legB: [[-2, 5], [-4, 8]], legF: [[4, 3], [3, 9]] }],
  fall: [{ face: 'wow', back: [[-4, -3], [-7, -7]], front: [[4, -3], [8, -7]], legB: [[-2, 6], [-3, 12]], legF: [[2, 6], [3, 12]] }],
  land: [{ face: 'normal', dy: 3, back: [[-1, 5], [0, 8]], front: [[3, 3], [6, 6]], legB: [[-3, 5], [0, 9]], legF: [[3, 5], [2, 9]] }],
  wave: [
    { face: 'happy', back: ARM_DOWN, front: [[4, -3], [7, -9]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT },
    { face: 'happy', back: ARM_DOWN, front: [[4, -3], [10, -7]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT },
  ],
  point: [{ face: 'normal', back: ARM_DOWN, front: [[5, 0], [10, -1]], legB: LEG_STRAIGHT, legF: [[1, 6], [1, 12]] }],
  // seduto su un bordo: l'anca sta sul bordo, le gambe penzolano
  sit: [
    { face: 'normal', dy: 6, back: SIT_ARMS[0], front: SIT_ARMS[1], legB: SIT_LEGS_A[0], legF: SIT_LEGS_A[1] },
    { face: 'blink', dy: 6, back: SIT_ARMS[0], front: SIT_ARMS[1], legB: SIT_LEGS_B[0], legF: SIT_LEGS_B[1] },
  ],
  sleep: [
    { face: 'sleep', dy: 6, hy: 1, back: SIT_ARMS[0], front: SIT_ARMS[1], legB: SIT_LEGS_A[0], legF: SIT_LEGS_A[1] },
    { face: 'sleep', dy: 6, hy: 2, back: SIT_ARMS[0], front: SIT_ARMS[1], legB: SIT_LEGS_A[0], legF: SIT_LEGS_A[1] },
  ],
  dizzy: [
    { face: 'dizzy', hx: -1, back: [[-3, 3], [-6, 5]], front: [[3, 3], [6, 5]], legB: [[-1, 6], [-3, 12]], legF: [[1, 6], [3, 12]] },
    { face: 'dizzy', hx: 1, back: [[-3, 3], [-6, 5]], front: [[3, 3], [6, 5]], legB: [[-1, 6], [-3, 12]], legF: [[1, 6], [3, 12]] },
  ],
  // preso col mouse: braccia su, gambe che penzolano
  held: [
    { face: 'wow', back: [[-3, -4], [-6, -11]], front: [[4, -4], [7, -11]], legB: [[-1, 6], [-1, 12]], legF: [[1, 6], [2, 12]] },
    { face: 'wow', back: [[-3, -4], [-6, -11]], front: [[4, -4], [7, -11]], legB: [[0, 6], [1, 12]], legF: [[0, 6], [-1, 12]] },
  ],
};

/** nelle pose sedute, la riga dello sprite che poggia sul bordo (sotto le cosce) */
export const SIT_ROW = 45;
export const SEATED = new Set(['sit', 'sleep']);

// --- disegno ---------------------------------------------------------------------------------

function line(put: (x: number, y: number) => void, a: Pt, b: Pt, th: number) {
  const steps = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), 1);
  const o = Math.floor((th - 1) / 2);
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(a[0] + ((b[0] - a[0]) * i) / steps);
    const y = Math.round(a[1] + ((b[1] - a[1]) * i) / steps);
    for (let dx = 0; dx < th; dx++) for (let dy = 0; dy < th; dy++) put(x + dx - o, y + dy - o);
  }
}

/** Disegna un fotogramma e restituisce i pixel RGBA (W×H). */
export function render(pose: string, frame: number, theme: Theme): Uint8ClampedArray {
  const frames = POSES[pose] ?? POSES.idle;
  const p = frames[frame % frames.length];
  const grid: (string | null)[] = new Array(W * H).fill(null);
  const set = (c: string) => (x: number, y: number) => {
    if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = c;
  };
  const dy = p.dy ?? 0;

  const shoulderB: Pt = [TORSO_X + 1, TORSO_Y + 2 + dy];
  const shoulderF: Pt = [TORSO_X + 10, TORSO_Y + 2 + dy];
  const hipB: Pt = [TORSO_X + 3, TORSO_Y + 13 + dy];
  const hipF: Pt = [TORSO_X + 8, TORSO_Y + 13 + dy];
  const add = (o: Pt, d: Pt): Pt => [o[0] + d[0], o[1] + d[1]];

  const arm = (sh: Pt, [el, ha]: [Pt, Pt], sleeve: string, skin: string) => {
    const e = add(sh, el);
    const h = add(sh, ha);
    line(set(skin), sh, e, 3);
    line(set(skin), e, h, 3);
    // manica corta: il primo tratto dalla spalla
    line(set(sleeve), sh, [Math.round(sh[0] + el[0] * 0.55), Math.round(sh[1] + el[1] * 0.55)], 3);
  };
  const leg = (hip: Pt, [kn, ft]: [Pt, Pt], denim: string) => {
    const k = add(hip, kn);
    const f = add(hip, ft);
    line(set(denim), hip, k, 4);
    line(set(denim), k, f, 4);
    // scarpa: sporge in avanti, con la suola
    for (let x = -1; x < 5; x++) {
      set('k')(f[0] + x, f[1] + 2);
      set('k')(f[0] + x, f[1] + 3);
      set('K')(f[0] + x, f[1] + 4);
    }
  };

  // dal fondo verso il davanti
  arm(shoulderB, p.back, 'W', 'S');
  leg(hipB, p.legB, 'J');
  TORSO.forEach((row, y) => [...row].forEach((c, x) => c !== '.' && set(c)(TORSO_X + x, TORSO_Y + y + dy)));
  leg(hipF, p.legF, 'j');
  arm(shoulderF, p.front, 'w', 's');
  const hx = HEAD_X + (p.hx ?? 0);
  const hy = HEAD_Y + dy + (p.hy ?? 0);
  HEAD.forEach((row, y) => [...row].forEach((c, x) => c !== '.' && set(c)(hx + x, hy + y)));
  for (const [x, y, c] of FACES[p.face]) set(c)(hx + x, hy + y);

  // contorno automatico attorno alla sagoma
  const outline: number[] = [];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (grid[y * W + x]) continue;
      const n = (xx: number, yy: number) => xx >= 0 && yy >= 0 && xx < W && yy < H && grid[yy * W + xx] && grid[yy * W + xx] !== 'o';
      if (n(x - 1, y) || n(x + 1, y) || n(x, y - 1) || n(x, y + 1)) outline.push(y * W + x);
    }
  for (const i of outline) grid[i] = 'o';

  const pal = PALETTES[theme];
  const out = new Uint8ClampedArray(W * H * 4);
  grid.forEach((c, i) => {
    if (!c) return;
    const [r, g, b] = hex(pal[c]);
    out.set([r, g, b, 255], i * 4);
  });
  return out;
}
