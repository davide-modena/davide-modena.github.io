// Il mini-me in pixel art, disegnato da codice.
//
// Testa e busto sono griglie disegnate a mano; braccia e gambe sono segmenti spessi calcolati
// da poche coordinate per posa. Alla fine un contorno automatico gira attorno alla sagoma.
// La palette dipende dal tema: maglietta bianca sul tema scuro, nera su quello chiaro.
// Guarda a destra; per andare a sinistra si specchia.
//
// Le pose possono avere un oggetto in mano (chitarra, libro, telefono…) e dei ritocchi
// ("mods": caschetto, fuliggine, guance rosse, sudore) che le scene accendono e spengono.

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
  z: '#ffffff', // luce, bianco
  m: '#a4574a', // bocca
  j: '#78a8e0', // jeans
  J: '#5783bf', // jeans in ombra
  k: '#f3f3f3', // scarpe
  K: '#8d939c', // suola
  // oggetti
  r: '#c98a4b', // legno chiaro (chitarra)
  R: '#8a5427', // legno scuro
  n: '#4a2e1c', // manico, archetto
  x: '#d9d9d9', // corde, metallo chiaro
  p: '#f7f3e8', // carta
  P: '#d8cfb8', // carta in ombra
  c: '#b23a48', // copertina
  v: '#6b2d8f', // uva
  V: '#a262c7', // uva chiara
  l: '#5fae4f', // foglia
  q: '#8e1b2e', // vino
  G: '#d6ecff', // vetro
  d: '#1f2127', // telefono
  L: '#8ab6ff', // schermo acceso
  y: '#ffc928', // caschetto
  Y: '#d99a00', // caschetto in ombra
  u: '#2f6fbf', // progetto (blueprint)
  U: '#cfe3ff', // linee del progetto
  i: '#7b8290', // ferro
  I: '#3e434c', // ferro scuro
  t: '#a4522c', // violino
  T: '#6b3419', // violino scuro
  a: '#3c3c3c', // fuliggine
  A: '#f28a8a', // guance rosse
  Z: '#7fd3ff', // sudore
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

type Face =
  | 'normal' | 'blink' | 'happy' | 'sleep' | 'dizzy' | 'wow'
  | 'talk' | 'look' | 'read' | 'chew' | 'sad' | 'strain';
type Px = [number, number, string];

const BROWS: Px[] = [[9, 7, 'h'], [10, 7, 'h'], [11, 7, 'h'], [14, 7, 'h'], [15, 7, 'h'], [16, 7, 'h']];
const NOSE: Px[] = [[14, 11, 'S'], [14, 12, 'S'], [13, 12, 'S']];
const MUSTACHE: Px[] = [[11, 13, 'B'], [12, 13, 'B'], [13, 13, 'B'], [14, 13, 'B'], [15, 13, 'B'], [16, 13, 'B']];
const MOUTH: Px[] = [[12, 14, 'm'], [13, 14, 'm'], [14, 14, 'm']];
const OPEN_MOUTH: Px[] = [[12, 14, 'm'], [13, 14, 'e'], [14, 14, 'm'], [13, 15, 'm']];
const eye = (x: number, y = 9): Px[] => [[x, y, 'e'], [x + 1, y, 'e'], [x, y + 1, 'e'], [x + 1, y + 1, 'e']];
const EYES = [...eye(10), ...eye(15)];
const EYES_DOWN = [...eye(10, 10), ...eye(15, 10)];

/** dettagli del viso, in coordinate della testa */
const FACES: Record<Face, Px[]> = {
  normal: [...BROWS, ...EYES, ...NOSE, ...MUSTACHE, ...MOUTH],
  blink: [...BROWS, [10, 10, 'e'], [11, 10, 'e'], [15, 10, 'e'], [16, 10, 'e'], ...NOSE, ...MUSTACHE, ...MOUTH],
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
    ...EYES, [10, 11, 'e'], [11, 11, 'e'], [15, 11, 'e'], [16, 11, 'e'],
    ...NOSE, ...MUSTACHE,
    [13, 14, 'm'], [14, 14, 'm'], [13, 15, 'm'], [14, 15, 'm'], // bocca a "o"
  ],
  // parla: bocca aperta (si alterna con "normal")
  talk: [...BROWS, ...EYES, ...NOSE, ...MUSTACHE, ...OPEN_MOUTH],
  // guarda in basso (telefono, tastiera)
  look: [...BROWS, ...EYES_DOWN, ...NOSE, ...MUSTACHE, ...MOUTH],
  // legge ad alta voce: occhi in basso e bocca che si muove
  read: [...BROWS, ...EYES_DOWN, ...NOSE, ...MUSTACHE, ...OPEN_MOUTH],
  // mastica: guance piene
  chew: [
    ...BROWS, [10, 10, 'e'], [11, 10, 'e'], [15, 10, 'e'], [16, 10, 'e'], ...NOSE, ...MUSTACHE,
    [11, 14, 'm'], [12, 14, 'm'], [13, 14, 'm'], [14, 14, 'm'], [15, 14, 'm'], [16, 12, 'S'], [17, 12, 'S'],
  ],
  sad: [
    [9, 7, 'h'], [10, 7, 'h'], [11, 6, 'h'], [14, 6, 'h'], [15, 7, 'h'], [16, 7, 'h'], // sopracciglia all'insù
    ...eye(10, 10), ...eye(15, 10), ...NOSE, ...MUSTACHE,
    [12, 15, 'm'], [13, 14, 'm'], [14, 15, 'm'], // bocca all'ingiù
  ],
  // sforzo: occhi strizzati, denti stretti
  strain: [
    [9, 8, 'h'], [10, 8, 'h'], [11, 7, 'h'], [14, 7, 'h'], [15, 8, 'h'], [16, 8, 'h'],
    [9, 9, 'e'], [10, 10, 'e'], [11, 10, 'e'], [15, 10, 'e'], [16, 10, 'e'], [17, 9, 'e'],
    ...NOSE, ...MUSTACHE,
    [11, 14, 'm'], [12, 14, 'z'], [13, 14, 'z'], [14, 14, 'z'], [15, 14, 'm'],
  ],
};

// --- busto (maglietta girocollo) --------------------------------------------------------------
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

// --- oggetti tenuti in mano: griglia + punto d'aggancio ---------------------------------------
type ItemName = 'guitar' | 'violin' | 'book' | 'phone' | 'letter' | 'plane' | 'grapes' | 'glass' | 'dumbbell' | 'blueprint';
const ITEMS: Record<ItemName, { grid: string[]; anchor: [number, number] }> = {
  // chitarra acustica: cassa a "8" con la buca, manico lungo con le corde, paletta
  guitar: {
    grid: [
      '.....................nKK',
      '..................nxnn..',
      '...............nxnn.....',
      '............nxnn........',
      '..RRRR...nxnn...........',
      '.RrrrrRnxnn.............',
      'RrrrrrnxnR..............',
      'RrrKKxxxrR..............',
      'RrKKKKrrrrR.............',
      'RrrKKrrrrrR.............',
      'RrrrrrrrrrR.............',
      'RrrrrrrrrrR.............',
      '.RrrrrrrrR..............',
      '..RRRRRRR...............',
    ],
    anchor: [4, 9],
  },
  // violino: cassa a "8" con le effe, tastiera, riccio; sotto il mento
  violin: {
    grid: [
      '..TTTT............',
      '.TttttT...........',
      'TttKttTnnnnnnnnnTT',
      'TttttttnnnnnnnnnTT',
      'TttKttT...........',
      '.TttttT...........',
      '..TTTT............',
    ],
    anchor: [0, 0],
  },
  // libro aperto, pagine con le righe verso chi guarda
  book: {
    grid: [
      '.pppppp.pppppp.',
      'cpPPPpppPPPPppc',
      'cppppppcppppppc',
      'cpPPppPcpPPPppc',
      'cppppppcppppppc',
      'cpPPPppcpPPppPc',
      'ccccccccccccccc',
    ],
    anchor: [7, 6],
  },
  phone: { grid: ['ddd', 'dLd', 'dLd', 'dLd', 'ddd'], anchor: [1, 2] },
  // busta: le due diagonali della patta e il sigillo rosso
  letter: { grid: ['PpppppppP', 'pPpppppPp', 'ppPpppPpp', 'pppPcPppp', 'ppppppppp', 'ppppppppp'], anchor: [4, 3] },
  plane: { grid: ['pp....', 'pppp..', 'pPpppp', 'pp....'], anchor: [1, 2] },
  grapes: { grid: ['..l..', '.vVv.', 'vVvVv', '.vVv.', '..v..'], anchor: [2, 0] },
  glass: { grid: ['G.G', 'qqq', 'GqG', '.G.', '.G.', 'GGG'], anchor: [1, 3] },
  dumbbell: { grid: ['II...II', 'IIiiiII', 'II...II'], anchor: [3, 1] },
  blueprint: {
    grid: [
      'uuuuuuuuuuuu',
      'uUUuuuuUUUuu',
      'uUuUuuuUuUuu',
      'uUUuuUUUuUuu',
      'uuuuuUuuuuuu',
      'uUUUUUuuUUUu',
      'uuuuuuuuuuuu',
    ],
    anchor: [1, 4],
  },
};

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
  /** oggetto: agganciato a una mano o al busto; "mid" sta sotto il braccio davanti, "top" sopra tutto */
  item?: { name: ItemName; at: 'front' | 'back' | 'torso'; layer?: 'mid' | 'top'; off?: Pt };
  /** tratti sottili (archetto): da mano + a → mano + b */
  stroke?: { at: 'front' | 'back'; a: Pt; b: Pt; c: string };
  /** lampo della scossa: tutta la sagoma bianca */
  flash?: boolean;
}

const ARM_DOWN: [Pt, Pt] = [[0, 5], [0, 9]];
const LEG_STRAIGHT: [Pt, Pt] = [[0, 6], [0, 12]];
const STAND = { back: ARM_DOWN, front: ARM_DOWN, legB: LEG_STRAIGHT, legF: LEG_STRAIGHT };

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
// seduto su una sedia, piedi a terra
const CHAIR_LEGS = { legB: [[5, 1], [5, 5]] as [Pt, Pt], legF: [[6, 0], [6, 5]] as [Pt, Pt] };
const BUMP = { back: [[-3, 4], [-6, 8]] as [Pt, Pt], front: [[3, 4], [6, 8]] as [Pt, Pt], legB: [[5, 1], [10, 1]] as [Pt, Pt], legF: [[6, 0], [11, -1]] as [Pt, Pt] };

export const POSES: Record<string, Pose[]> = {
  idle: [
    { face: 'normal', ...STAND },
    { face: 'normal', dy: 1, back: ARM_DOWN, front: ARM_DOWN, legB: [[0, 5], [0, 11]], legF: [[0, 5], [0, 11]] },
  ],
  blink: [{ face: 'blink', ...STAND }],
  surprised: [{ face: 'wow', ...STAND }],
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
  // caduto di sedere: gambe in avanti, mani a terra dietro
  bump: [{ face: 'wow', dy: 6, ...BUMP }],
  bumpDizzy: [{ face: 'dizzy', dy: 6, ...BUMP }],
  bumpSad: [{ face: 'sad', dy: 6, ...BUMP }, { face: 'sad', dy: 6, hy: 1, ...BUMP }],
  // preso col mouse: braccia su, gambe che penzolano
  held: [
    { face: 'wow', back: [[-3, -4], [-6, -11]], front: [[4, -4], [7, -11]], legB: [[-1, 6], [-1, 12]], legF: [[1, 6], [2, 12]] },
    { face: 'wow', back: [[-3, -4], [-6, -11]], front: [[4, -4], [7, -11]], legB: [[0, 6], [1, 12]], legF: [[0, 6], [-1, 12]] },
  ],

  // --- scene: lavoro ---------------------------------------------------------------------------
  // alla scrivania, batte sulla tastiera
  type: [
    { face: 'look', dy: 6, back: [[4, 4], [9, 4]], front: [[3, 4], [8, 3]], ...CHAIR_LEGS },
    { face: 'look', dy: 6, back: [[4, 4], [9, 5]], front: [[3, 4], [8, 2]], ...CHAIR_LEGS },
  ],
  // alla scrivania, mano sul mento
  think: [
    { face: 'normal', dy: 6, back: [[4, 4], [9, 4]], front: [[4, 1], [0, -3]], ...CHAIR_LEGS },
    { face: 'blink', dy: 6, back: [[4, 4], [9, 4]], front: [[4, 1], [0, -3]], ...CHAIR_LEGS },
  ],
  // al banco di elettronica
  // braccia in avanti all'altezza del banco (non più in basso)
  solder: [
    { face: 'look', back: [[4, 2], [10, 4]], front: [[3, 2], [9, 3]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT },
    { face: 'look', back: [[4, 2], [11, 3]], front: [[3, 2], [8, 4]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT },
  ],
  // la scossa: lampo bianco alternato
  zap: [
    { face: 'wow', back: [[-4, -3], [-7, -8]], front: [[4, -3], [8, -8]], legB: [[-2, 6], [-4, 12]], legF: [[2, 6], [4, 12]], flash: true },
    { face: 'dizzy', back: [[-4, -2], [-8, -6]], front: [[4, -2], [9, -6]], legB: [[-2, 6], [-4, 12]], legF: [[2, 6], [4, 12]] },
  ],

  // --- scene: chi sono -------------------------------------------------------------------------
  // la mano dietro sul manico, quella davanti che pennella sulla buca
  guitar: [
    { face: 'happy', back: [[7, 4], [15, 2]], front: [[0, 5], [-4, 8]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT, item: { name: 'guitar', at: 'torso', layer: 'mid', off: [-1, 5] } },
    { face: 'normal', back: [[7, 4], [15, 2]], front: [[0, 5], [-3, 10]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT, item: { name: 'guitar', at: 'torso', layer: 'mid', off: [-1, 5] } },
  ],
  piano: [
    { face: 'happy', back: [[5, 4], [12, 6]], front: [[3, 4], [8, 6]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT },
    { face: 'blink', back: [[5, 4], [11, 7]], front: [[3, 4], [9, 5]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT },
  ],
  // violino sotto il mento, mano dietro sul riccio, archetto che attraversa la cassa
  violin: [
    {
      face: 'blink', back: [[9, -2], [20, -3]], front: [[2, 4], [3, 2]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT,
      item: { name: 'violin', at: 'torso', layer: 'mid', off: [2, -9] }, stroke: { at: 'front', a: [-6, -9], b: [6, 3], c: 'n' },
    },
    {
      face: 'happy', back: [[9, -2], [20, -3]], front: [[4, 3], [7, 0]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT,
      item: { name: 'violin', at: 'torso', layer: 'mid', off: [2, -9] }, stroke: { at: 'front', a: [-10, -6], b: [3, 6], c: 'n' },
    },
  ],
  // seduto sul bordo della barra, legge ad alta voce
  read: [
    { face: 'read', dy: 6, back: [[3, 3], [8, 1]], front: [[3, 3], [6, 1]], legB: SIT_LEGS_A[0], legF: SIT_LEGS_A[1], item: { name: 'book', at: 'front', layer: 'top' } },
    { face: 'look', dy: 6, back: [[3, 3], [8, 1]], front: [[3, 3], [6, 1]], legB: SIT_LEGS_B[0], legF: SIT_LEGS_B[1], item: { name: 'book', at: 'front', layer: 'top' } },
  ],
  // alla lavagna: scrive e poi spiega
  teachWrite: [
    { face: 'normal', back: ARM_DOWN, front: [[4, -1], [9, -4]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT },
    { face: 'normal', back: ARM_DOWN, front: [[4, -1], [10, -2]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT },
  ],
  teachPoint: [
    { face: 'talk', back: ARM_DOWN, front: [[5, -2], [10, -5]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT },
    { face: 'normal', back: ARM_DOWN, front: [[5, -2], [10, -6]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT },
  ],

  // --- scene: contatti -------------------------------------------------------------------------
  phoneScroll: [
    { face: 'look', back: [[2, 5], [7, 2]], front: [[1, 5], [4, 1]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT, item: { name: 'phone', at: 'front', layer: 'top' } },
    { face: 'look', back: [[2, 5], [7, 2]], front: [[1, 5], [4, 0]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT, item: { name: 'phone', at: 'front', layer: 'top' } },
  ],
  phoneCall: [
    { face: 'talk', back: [[-3, -4], [-1, -9]], front: ARM_DOWN, legB: LEG_STRAIGHT, legF: LEG_STRAIGHT, item: { name: 'phone', at: 'back', layer: 'top' } },
    { face: 'normal', back: [[-3, -4], [-1, -9]], front: ARM_DOWN, legB: LEG_STRAIGHT, legF: [[1, 6], [1, 12]], item: { name: 'phone', at: 'back', layer: 'top' } },
  ],
  letter: [{ face: 'normal', back: ARM_DOWN, front: [[3, 3], [7, 1]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT, item: { name: 'letter', at: 'front', layer: 'top' } }],
  planeHold: [{ face: 'normal', back: ARM_DOWN, front: [[3, 3], [7, 1]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT, item: { name: 'plane', at: 'front', layer: 'top' } }],
  throwWind: [{ face: 'normal', back: [[-1, 5], [2, 8]], front: [[-2, -4], [-5, -8]], legB: [[-1, 6], [-2, 12]], legF: [[2, 6], [3, 12]], item: { name: 'plane', at: 'front', layer: 'top' } }],
  throwGo: [{ face: 'happy', back: [[-3, 3], [-5, 6]], front: [[4, -3], [9, -5]], legB: [[-2, 6], [-3, 12]], legF: [[3, 5], [5, 11]] }],
  holdUp: [{ face: 'happy', back: ARM_DOWN, front: [[3, -3], [5, -9]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT, item: { name: 'letter', at: 'front', layer: 'top' } }],

  // --- scene: lavori e progetti ----------------------------------------------------------------
  eat: [
    { face: 'chew', back: ARM_DOWN, front: [[4, -1], [-1, -6]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT, item: { name: 'grapes', at: 'front', layer: 'top' } },
    { face: 'happy', back: ARM_DOWN, front: [[4, 1], [3, -2]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT, item: { name: 'grapes', at: 'front', layer: 'top' } },
  ],
  drink: [
    { face: 'blink', back: ARM_DOWN, front: [[4, -1], [0, -6]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT, item: { name: 'glass', at: 'front', layer: 'top' } },
    { face: 'happy', back: ARM_DOWN, front: [[4, 1], [3, -3]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT, item: { name: 'glass', at: 'front', layer: 'top' } },
  ],
  blueprint: [
    { face: 'look', back: [[5, 4], [10, 3]], front: [[3, 3], [7, 2]], legB: LEG_STRAIGHT, legF: LEG_STRAIGHT, item: { name: 'blueprint', at: 'front', layer: 'top' } },
    { face: 'look', back: [[5, 4], [10, 3]], front: [[3, 3], [7, 2]], legB: LEG_STRAIGHT, legF: [[1, 6], [1, 12]], item: { name: 'blueprint', at: 'front', layer: 'top' } },
  ],
  curl: [
    { face: 'normal', back: ARM_DOWN, front: [[0, 5], [1, 10]], legB: LEG_STRAIGHT, legF: [[1, 6], [2, 12]], item: { name: 'dumbbell', at: 'front', layer: 'top' } },
    { face: 'strain', back: ARM_DOWN, front: [[0, 5], [5, 1]], legB: LEG_STRAIGHT, legF: [[1, 6], [2, 12]], item: { name: 'dumbbell', at: 'front', layer: 'top' } },
  ],
  flex: [
    { face: 'happy', back: [[-4, -1], [-3, -6]], front: [[4, -1], [3, -6]], legB: [[-1, 6], [-2, 12]], legF: [[1, 6], [2, 12]] },
    { face: 'happy', back: [[-4, -1], [-4, -6]], front: [[4, -1], [4, -6]], legB: [[-1, 6], [-2, 12]], legF: [[1, 6], [2, 12]] },
  ],
};

/** nelle pose sedute, la riga dello sprite che poggia sul bordo (sotto le cosce) */
export const SIT_ROW = 45;
export const SEATED = new Set(['sit', 'sleep', 'bump', 'bumpDizzy', 'bumpSad', 'read']);

// --- ritocchi sopra la figura ------------------------------------------------------------------

const HELMET = [
  '.....yyyyyyyyy......',
  '...yyyyyyyyyyyyy....',
  '..yyyyyyyYyyyyyyy...',
  '..yyyyyyyYyyyyyyyy..',
  '.YYYYYYYYYYYYYYYYYYY',
];

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

/**
 * Disegna un fotogramma e restituisce i pixel RGBA (W×H).
 * `mods`: ritocchi separati da virgola — helmet, soot, blush, sweat.
 */
export function render(pose: string, frame: number, theme: Theme, mods = ''): Uint8ClampedArray {
  const frames = POSES[pose] ?? POSES.idle;
  const p = frames[frame % frames.length];
  const has = (m: string) => mods.includes(m);
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
  const hands = { front: add(shoulderF, p.front[1]), back: add(shoulderB, p.back[1]), torso: [TORSO_X + 6, TORSO_Y + 6 + dy] as Pt };

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
  const drawItem = () => {
    if (!p.item) return;
    const it = ITEMS[p.item.name];
    const at = add(hands[p.item.at], p.item.off ?? [0, 0]);
    it.grid.forEach((row, y) =>
      [...row].forEach((c, x) => c !== '.' && set(c)(at[0] - it.anchor[0] + x, at[1] - it.anchor[1] + y)),
    );
  };

  // dal fondo verso il davanti
  arm(shoulderB, p.back, 'W', 'S');
  leg(hipB, p.legB, 'J');
  TORSO.forEach((row, y) => [...row].forEach((c, x) => c !== '.' && set(c)(TORSO_X + x, TORSO_Y + y + dy)));
  leg(hipF, p.legF, 'j');
  if (p.item?.layer === 'mid') drawItem();
  arm(shoulderF, p.front, 'w', 's');
  const hx = HEAD_X + (p.hx ?? 0);
  const hy = HEAD_Y + dy + (p.hy ?? 0);
  HEAD.forEach((row, y) => [...row].forEach((c, x) => c !== '.' && set(c)(hx + x, hy + y)));
  for (const [x, y, c] of FACES[p.face]) set(c)(hx + x, hy + y);
  if (p.item && p.item.layer !== 'mid') drawItem();
  if (p.stroke) line(set(p.stroke.c), add(hands[p.stroke.at], p.stroke.a), add(hands[p.stroke.at], p.stroke.b), 1);

  // ritocchi
  if (has('blush')) for (const [x, y] of [[9, 12], [10, 12], [16, 12], [17, 12]]) set('A')(hx + x, hy + y);
  if (has('sweat') && frame % 2) for (const [x, y] of [[19, 6], [19, 7], [8, 4]]) set('Z')(hx + x, hy + y);
  if (has('soot')) {
    // faccia annerita, occhi bianchi e capelli sparati per aria
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const c = grid[y * W + x];
        if (c === 's' || c === 'S' || c === 'b') grid[y * W + x] = (x + y) % 4 ? 'a' : 'S';
        else if (c === 'e') grid[y * W + x] = 'z';
        else if ((c === 'w' || c === 'W') && (x * 7 + y * 3) % 5 === 0) grid[y * W + x] = 'a';
      }
    for (const [x, y] of [[4, -1], [7, -2], [10, -1], [12, -3], [15, -1], [17, -2]]) set('h')(hx + x, hy + y);
  }
  if (has('helmet')) HELMET.forEach((row, y) => [...row].forEach((c, x) => c !== '.' && set(c)(hx + x, hy + y - 1)));

  // lampo della scossa: sagoma tutta bianca
  if (p.flash) for (let i = 0; i < grid.length; i++) if (grid[i]) grid[i] = 'z';

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
