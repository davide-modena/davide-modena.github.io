// Oggetti di scena del mini-me, in pixel art come lui: scrivania, sedia, banco di elettronica,
// tastiera, lavagna, treno, bus, piccione, aeroplanino, la stellina di Claude.
//
// Ogni oggetto è una griglia di caratteri (uno per pixel) generata a ogni fotogramma da una
// funzione del tempo, così schermi, LED e ali si animano. Gli oggetti "a terra" hanno l'ultima
// riga appoggiata sul pavimento (la barra di stato); quelli "in volo" usano le coordinate dello schermo.

type Theme = 'dark' | 'light';

const PAL: Record<string, string> = {
  k: '#2a2c33', // struttura scura
  K: '#15161a', // tasti neri, ombre
  g: '#6b7280', // grigio
  l: '#c9ccd3', // grigio chiaro
  w: '#f5f5f5', // bianco
  b: '#9a6a44', // legno
  B: '#6b4528', // legno scuro
  s: '#0e1420', // schermo
  G: '#72e06a', // verde codice
  P: '#ff7ab6', // rosa codice
  Y: '#ffd23f', // giallo codice
  A: '#a78bfa', // viola codice
  C: '#7ae7ff', // azzurro
  m: '#ececec', // tazza
  M: '#6b3e1f', // caffè
  r: '#d71921', // rosso
  R: '#8e0f14', // rosso scuro
  y: '#ffb000', // giallo bus
  e: '#1f4d3a', // lavagna
  E: '#163a2b', // lavagna scura
  p: '#f2f2ea', // gesso, carta
  O: '#d97757', // arancio Claude
  n: '#0a66c2', // blu LinkedIn
  q: '#8d939c', // piccione
  Q: '#5c626b', // piccione scuro
  v: '#6fb58a', // riflesso sul collo del piccione
};

// --- griglie ----------------------------------------------------------------------------------

function blank(w: number, h: number) {
  return Array.from({ length: h }, () => new Array<string>(w).fill('.'));
}
const toRows = (g: string[][]) => g.map((r) => r.join(''));
function rect(g: string[][], x: number, y: number, w: number, h: number, c: string) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (g[j] && i >= 0 && i < g[j].length) g[j][i] = c;
}
function paint(g: string[][], x: number, y: number, rows: string[]) {
  rows.forEach((row, j) => [...row].forEach((c, i) => c !== '.' && g[y + j] && (g[y + j][x + i] = c)));
}
// pseudo-casuale ripetibile
const noise = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

/** scrivania con monitor (codice che scorre), tastiera e tazza di caffè */
function desk(t: number) {
  const g = blank(24, 28);
  rect(g, 2, 0, 14, 10, 'k');
  rect(g, 3, 1, 12, 8, 's');
  // righe di codice colorate che scorrono verso l'alto
  const colors = ['G', 'P', 'Y', 'A', 'C', 'l'];
  const scroll = Math.floor(t / 0.35);
  for (let row = 0; row < 8; row++) {
    const n = row + scroll;
    const indent = Math.floor(noise(n) * 3);
    const len = 2 + Math.floor(noise(n + 99) * (9 - indent));
    rect(g, 3 + indent, 1 + row, len, 1, colors[Math.floor(noise(n + 7) * colors.length)]);
  }
  // cursore che lampeggia
  if (Math.floor(t * 2) % 2) rect(g, 13, 8, 1, 1, 'w');
  rect(g, 7, 10, 4, 1, 'k');
  rect(g, 6, 11, 6, 1, 'k');
  rect(g, 0, 12, 8, 1, 'l'); // tastiera
  paint(g, 17, 9, ['mmm.', 'mMmm', 'mmm.']); // tazza
  rect(g, 0, 13, 24, 1, 'b');
  rect(g, 0, 14, 24, 1, 'B');
  rect(g, 1, 15, 2, 13, 'B');
  rect(g, 21, 15, 2, 13, 'B');
  return toRows(g);
}

/** sedia da ufficio: schienale a sinistra, seduta, colonna e ruote */
function chair() {
  const g = blank(14, 24);
  rect(g, 1, 0, 2, 13, 'k');
  rect(g, 1, 13, 12, 2, 'k');
  rect(g, 6, 15, 2, 7, 'g');
  rect(g, 3, 22, 8, 1, 'g');
  paint(g, 2, 23, ['K...KK...K']);
  return toRows(g);
}

/** banco di elettronica: breadboard, chip, batteria, LED che lampeggia */
function bench(t: number) {
  const g = blank(22, 24);
  paint(g, 2, 0, [
    '...kk.....yyK',
    'llllllllllyyK',
    'lgglgglggllyK',
    'lkkkkkllgllyK',
    'lgglgglggl...',
  ]);
  const on = Math.floor(t * 3) % 2 === 0;
  paint(g, 17, 1, ['.' + (on ? 'r' : 'R') + '.', 'rRr', 'g.g']);
  rect(g, 0, 5, 22, 1, 'b');
  rect(g, 0, 6, 22, 1, 'B');
  rect(g, 1, 7, 2, 17, 'B');
  rect(g, 19, 7, 2, 17, 'B');
  return toRows(g);
}

/** tastiera su supporto a X */
function keyboard() {
  const g = blank(22, 21);
  rect(g, 0, 0, 22, 4, 'k');
  rect(g, 1, 1, 20, 2, 'w');
  for (const i of [2, 4, 7, 9, 11, 14, 16, 18]) rect(g, i, 1, 1, 1, 'K');
  for (let j = 0; j < 17; j++) {
    const a = Math.round(4 + (j * 13) / 16);
    const b = Math.round(17 - (j * 13) / 16);
    rect(g, a, 4 + j, 1, 1, 'g');
    rect(g, b, 4 + j, 1, 1, 'g');
  }
  return toRows(g);
}

/** lavagna su cavalletto: il gesso compare man mano (step 0→4) */
function board(step: number) {
  const g = blank(26, 40);
  rect(g, 0, 0, 26, 20, 'B');
  rect(g, 1, 1, 24, 18, 'e');
  rect(g, 1, 17, 24, 2, 'E');
  const chalk: string[][] = [
    ['p...p.ppp.p...p.', '.p.p...p..pp.pp.', '..p....p..p.p.p.'], // "<?" … diciamo HTML
    ['pppp.pp..pppp', '......p......'],
    ['pp.ppp.pppp.p'],
    ['ppp..pppp'],
  ];
  if (step > 0) paint(g, 3, 3, chalk[0]);
  if (step > 1) paint(g, 3, 8, chalk[1]);
  if (step > 2) paint(g, 3, 11, chalk[2]);
  if (step > 3) paint(g, 3, 14, chalk[3]);
  // cavalletto
  for (let j = 0; j < 20; j++) {
    rect(g, 4 - Math.floor(j / 6), 20 + j, 2, 1, 'B');
    rect(g, 20 + Math.floor(j / 6), 20 + j, 2, 1, 'B');
  }
  return toRows(g);
}

/** treno regionale, stile Trenitardo: nero, fascia rossa, finestrini a matrice */
const WHEEL = ['..ggg..', '.gKKKg.', 'gKKlKKg', 'gKlllKg', 'gKKlKKg', '.gKKKg.', '..ggg..'];
const WHEEL_B = ['..ggg..', '.gKlKg.', 'gKKlKKg', 'gllllKg', 'gKKlKKg', '.gKlKg.', '..ggg..'];

function train(t: number) {
  const g = blank(124, 44);
  rect(g, 0, 6, 118, 29, 'k');
  // muso arrotondato
  for (let j = 0; j < 23; j++) rect(g, 118, 12 + j, Math.min(6, 1 + Math.floor(j / 2)), 1, 'k');
  rect(g, 40, 3, 16, 1, 'g'); // pantografo
  rect(g, 46, 0, 2, 3, 'g');
  rect(g, 42, 4, 2, 2, 'g');
  rect(g, 52, 4, 2, 2, 'g');
  for (let i = 5; i < 104; i += 16) rect(g, i, 11, 11, 8, 'C');
  rect(g, 110, 11, 10, 9, 'C'); // parabrezza
  for (const x of [30, 78]) rect(g, x, 10, 1, 23, 'K'); // porte
  rect(g, 0, 24, 122, 4, 'r');
  rect(g, 118, 30, 4, 2, 'Y'); // faro
  rect(g, 0, 35, 120, 2, 'K');
  const w = Math.floor(t * 14) % 2 ? WHEEL : WHEEL_B;
  for (const x of [10, 22, 92, 104]) paint(g, x, 37, w);
  return toRows(g);
}

/** autobus urbano */
function bus(t: number) {
  const g = blank(92, 40);
  rect(g, 0, 4, 88, 27, 'y');
  rect(g, 2, 2, 84, 2, 'y');
  rect(g, 88, 8, 3, 23, 'y');
  for (let i = 4; i < 64; i += 14) rect(g, i, 9, 11, 9, 'C');
  rect(g, 76, 7, 13, 12, 'C'); // parabrezza
  rect(g, 64, 8, 9, 22, 'k'); // porta
  rect(g, 68, 8, 1, 22, 'g');
  rect(g, 78, 3, 9, 3, 'K'); // display della linea
  rect(g, 80, 4, 5, 1, 'Y');
  rect(g, 0, 22, 64, 2, 'r');
  rect(g, 88, 27, 3, 2, 'w'); // faro
  rect(g, 0, 31, 90, 1, 'K');
  const w = Math.floor(t * 14) % 2 ? WHEEL : WHEEL_B;
  for (const x of [12, 70]) paint(g, x, 32, w);
  return toRows(g);
}

/** piccione con due fotogrammi di ali; "letter" = porta la lettera nel becco */
function pigeon(t: number, letter = false) {
  const up = Math.floor(t * 8) % 2 === 0;
  const g = blank(19, 7);
  paint(
    g,
    0,
    0,
    up
      ? ['...QQQ.........', '..QqqqQ........', '...QqqqQ..qqq..', '....qqqqqqvKqY.', '...qqqqqqqqq...', '....QQqqqqQ....', '......Y..Y.....']
      : ['...............', '...............', '..........qqq..', '..qqqqqqqqvKqY.', '.QqqqqqqqqqQ...', 'QQ..QQqqqqQ....', '......Y..Y.....'],
  );
  if (letter) paint(g, 14, 2, ['pppp', 'pPPp']);
  return toRows(g);
}

function plane(t: number) {
  return Math.floor(t * 6) % 2 ? ['pp......', 'pppp....', 'plpppp..', 'pp......'] : ['........', 'pp......', 'pppppp..', 'plp.....'];
}

/** la stellina di Claude, con due occhietti */
function claude(t: number) {
  const blink = Math.floor(t * 2) % 7 === 0;
  return [
    '.......OOO.......',
    '.OO....OOO....OO.',
    '.OOO...OOO...OOO.',
    '..OOO..OOO..OOO..',
    '...OOO.OOO.OOO...',
    '....OOOOOOOOO....',
    'OOOOOOOOOOOOOOOOO',
    blink ? 'OOOOOOOOOOOOOOOOO' : 'OOOOOOKOOOKOOOOOO', // occhietti
    'OOOOOOOOOOOOOOOOO',
    '....OOOOOOOOO....',
    '...OOO.OOO.OOO...',
    '..OOO..OOO..OOO..',
    '.OOO...OOO...OOO.',
    '.OO....OOO....OO.',
    '.......OOO.......',
  ];
}

export const ICONS: Record<string, string[]> = {
  linkedin: ['nnnnnnn', 'nwnnnnn', 'nnnnnnn', 'nwnwwnn', 'nwnwnwn', 'nwnwnwn', 'nnnnnnn'],
  gmail: ['.......', 'rwwwwwr', 'rrwwwrr', 'rwrwrwr', 'rwwrwwr', 'rwwwwwr', '.......'],
  github: ['.K...K.', '.KKKKK.', 'KKwKwKK', 'KKKKKKK', 'KKKKKKK', '.KK.KK.', '.K...K.'],
};

export const DEFS = {
  desk: (t: number) => desk(t),
  chair: () => chair(),
  bench: (t: number) => bench(t),
  keyboard: () => keyboard(),
  board: (_t: number, step = 0) => board(step),
  train: (t: number) => train(t),
  bus: (t: number) => bus(t),
  pigeon: (t: number, withLetter = 0) => pigeon(t, !!withLetter),
  plane: (t: number) => plane(t),
  claude: (t: number) => claude(t),
};
export type PropName = keyof typeof DEFS;

// --- disegno ----------------------------------------------------------------------------------

const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

/** griglia → pixel RGBA, con contorno automatico (scuro sul chiaro, e viceversa non serve: scuro sempre) */
export function rasterize(rows: string[], theme: Theme, outline = true) {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const cell = (x: number, y: number) => (y >= 0 && y < h && x >= 0 && x < w ? rows[y][x] ?? '.' : '.');
  const out = new Uint8ClampedArray(w * h * 4);
  const edge = theme === 'dark' ? [5, 5, 5] : [11, 9, 8];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const c = cell(x, y);
      if (c !== '.') {
        out.set([...hex(PAL[c] ?? '#ff00ff'), 255], (y * w + x) * 4);
      } else if (outline && [cell(x - 1, y), cell(x + 1, y), cell(x, y - 1), cell(x, y + 1)].some((n) => n !== '.')) {
        out.set([...edge, 255], (y * w + x) * 4);
      }
    }
  return { w, h, data: out };
}

/** un'icona come immagine (per le bolle che escono dal telefono) */
export function iconURL(name: keyof typeof ICONS, scale: number) {
  const { w, h, data } = rasterize(ICONS[name], 'dark', false);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.getContext('2d')!.putImageData(new ImageData(data as unknown as Uint8ClampedArray<ArrayBuffer>, w, h), 0, 0);
  const big = document.createElement('canvas');
  big.width = w * scale;
  big.height = h * scale;
  const ctx = big.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(c, 0, 0, w * scale, h * scale);
  return big.toDataURL();
}

// --- oggetto in pagina ------------------------------------------------------------------------

export class Prop {
  canvas = document.createElement('canvas');
  ctx = this.canvas.getContext('2d')!;
  t = 0;
  /** parametro extra per la griglia (passo della lavagna, lettera del piccione) */
  arg = 0;
  /** centro orizzontale (px schermo); per gli oggetti in volo anche y = centro verticale */
  x: number;
  y = 0;
  vx = 0;
  vy = 0;
  flip = false;
  mode: 'floor' | 'air';
  drawn = '';
  private target: { x: number; y: number; speed: number } | null = null;

  constructor(
    public name: PropName,
    public scale: number,
    x: number,
    opts: { mode?: 'floor' | 'air'; y?: number; front?: boolean; flip?: boolean } = {},
  ) {
    this.x = x;
    this.y = opts.y ?? 0;
    this.mode = opts.mode ?? 'floor';
    this.flip = !!opts.flip;
    this.canvas.className = `mini-prop${opts.front ? ' front' : ''}`;
    // dimensioni giuste da subito: il canvas nasce 300×150 e sposterebbe l'oggetto al primo frame
    const rows = (DEFS[name] as (t: number, a?: number) => string[])(0, 0);
    this.canvas.width = Math.max(...rows.map((r) => r.length));
    this.canvas.height = rows.length;
    this.canvas.style.width = `${this.canvas.width * scale}px`;
    this.canvas.style.height = `${this.canvas.height * scale}px`;
    document.body.append(this.canvas);
    // entrata: solo opacità e "scale" (proprietà separata), così non tocca la posizione
    this.canvas.animate([{ opacity: 0, scale: '0.7' }, { opacity: 1, scale: '1' }], { duration: 220 });
  }

  /** vola verso un punto a velocità costante (px/s) */
  moveTo(x: number, y: number, speed: number) {
    this.target = { x, y, speed };
  }
  get arrived() {
    return !this.target;
  }

  update(dt: number) {
    this.t += dt;
    if (this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const d = Math.hypot(dx, dy);
      const step = this.target.speed * dt;
      if (d <= step) {
        this.x = this.target.x;
        this.y = this.target.y;
        this.target = null;
      } else {
        this.x += (dx / d) * step;
        this.y += (dy / d) * step;
        if (Math.abs(dx) > 1) this.flip = dx < 0;
      }
    } else {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }
  }

  transform() {
    const w = this.canvas.width * this.scale;
    const h = this.canvas.height * this.scale;
    const left = this.x - w / 2;
    const top = this.mode === 'air' ? this.y - h / 2 : 0;
    return `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)${this.flip ? ' scaleX(-1)' : ''}`;
  }

  draw(theme: Theme, statusH: number) {
    const rows = (DEFS[this.name] as (t: number, a?: number) => string[])(this.t, this.arg);
    const key = theme + rows.join('');
    if (key !== this.drawn) {
      this.drawn = key;
      const { w, h, data } = rasterize(rows, theme);
      if (this.canvas.width !== w || this.canvas.height !== h) {
        this.canvas.width = w;
        this.canvas.height = h;
        this.canvas.style.width = `${w * this.scale}px`;
        this.canvas.style.height = `${h * this.scale}px`;
      }
      this.ctx.putImageData(new ImageData(data as unknown as Uint8ClampedArray<ArrayBuffer>, w, h), 0, 0);
    }
    const st = this.canvas.style;
    if (this.mode === 'floor') {
      st.top = 'auto';
      st.bottom = `${statusH}px`;
    } else {
      st.top = '0';
      st.bottom = 'auto';
    }
    st.transform = this.transform();
  }

  remove(poof = true) {
    if (poof) {
      const a = this.canvas.animate([{ opacity: 1 }, { opacity: 0, filter: 'blur(2px)' }], { duration: 250 });
      a.onfinish = () => this.canvas.remove();
    } else this.canvas.remove();
  }
}
