// Un viaggio finto Trento → Verona Porta Nuova che gira in loop, uguale per tutte le ricostruzioni di
// Trenitardo nella pagina (hero, notifica, Glyph, widget): chi lo legge è sempre allo stesso punto.
// Un secondo di pagina vale un minuto di viaggio.

export const TRAIN_NUMBER = '16697';
export const ROUTE = 'Bolzano → Verona Porta Nuova';

export type Stop = { name: string; short: string };
export const STOPS: Stop[] = [
  { name: 'Trento', short: 'Trento' },
  { name: 'Rovereto', short: 'Rovereto' },
  { name: 'Mori', short: 'Mori' },
  { name: 'Peri', short: 'Peri' },
  { name: 'Domegliara', short: 'Domegliara' },
  { name: 'Verona Porta Nuova', short: 'Verona P.N.' },
];
export const DEST = STOPS[STOPS.length - 1];

const DWELL = 4; // secondi fermo in stazione
const LEG = 8; // secondi di corsa fra due stazioni
const LAST = STOPS.length - 1;
const ARRIVE = LAST * (DWELL + LEG); // 60: arriva a Verona
const END = 7; // sosta finale prima che il giro ricominci
export const CYCLE = (ARRIVE + END) * 1000;

export type Sim = {
  /** indice della stazione corrente (dove è fermo, o da cui è partito) */
  idx: number;
  moving: boolean;
  arrived: boolean;
  /** 0-1 dentro la tratta (solo in movimento) */
  leg: number;
  /** progresso totale 0-1 lungo la linea */
  progress: number;
  /** minuti all'arrivo a Verona */
  eta: number;
  delay: number;
  stopsLeft: number;
  /** ora dell'ultimo aggiornamento, "HH:MM" */
  clock: string;
};

export function state(ms: number): Sim {
  const t = (ms % CYCLE) / 1000;
  const arrived = t >= ARRIVE;
  const slot = Math.min(LAST, Math.floor(t / (DWELL + LEG)));
  const inSlot = t - slot * (DWELL + LEG);
  const moving = !arrived && inSlot >= DWELL;
  const leg = moving ? (inSlot - DWELL) / LEG : 0;
  const idx = arrived ? LAST : slot;
  const eta = arrived ? 0 : Math.max(0, Math.ceil(ARRIVE - t));
  const delay = t < 14 ? 5 : t < 38 ? 3 : 1;
  const mins = 16 * 60 + 40 + Math.floor(t);
  const clock = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  return {
    idx,
    moving,
    arrived,
    leg,
    progress: Math.min(1, (idx + leg) / LAST),
    eta,
    delay,
    stopsLeft: Math.max(0, LAST - idx),
    clock,
  };
}

/** sigla di ≤4 lettere, come nell'app: nome corto = per intero, altrimenti iniziale + consonanti */
export function sigla(name: string): string {
  const w = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
  if (!w) return '';
  if (w.length <= 4) return w.toUpperCase();
  let out = w[0];
  for (const c of w.slice(1)) {
    if (out.length >= 4) break;
    if (!'aeiou'.includes(c)) out += c;
  }
  return out.toUpperCase();
}

/** "1h 0'" / "24'" come nella hero dell'app */
export const fmtEta = (min: number) => (min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}'` : `${min}'`);
