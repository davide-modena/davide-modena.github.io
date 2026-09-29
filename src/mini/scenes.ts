// Le scenette del mini-me: ogni pagina ha le sue (in home capitano tutte, ma di rado).
//
// Una scena è un generatore che restituisce dei "passi" (vai lì, fai questa posa per N secondi);
// il mini-me li esegue uno alla volta. Se lo prendi col mouse o parte il gioco, la scena si
// interrompe e il blocco finally fa sparire gli oggetti.

import type { Mini } from './mini';
import { Prop, iconURL, ICONS, type PropName } from './props';

export type Step =
  | { kind: 'walk'; x: number; speed?: number }
  | { kind: 'pose'; pose: string; t: number; facing?: 1 | -1; until?: () => boolean; each?: (t: number) => void };
export type Scene = Generator<Step, void, void>;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const it = document.documentElement.lang !== 'en';
const L = (a: string, b: string) => (it ? a : b);

/** gli strumenti che una scena ha a disposizione */
export class SceneApi {
  props: Prop[] = [];
  constructor(public m: Mini) {}
  get s() {
    return this.m.scale;
  }

  walk(x: number, speed = 1): Step {
    return { kind: 'walk', x, speed };
  }
  pose(pose: string, t: number, extra: Omit<Extract<Step, { kind: 'pose' }>, 'kind' | 'pose' | 't'> = {}): Step {
    return { kind: 'pose', pose, t, ...extra };
  }

  /** un punto del pavimento dove c'è spazio: `right`/`left` in pixel dello sprite */
  spot(right: number, left = 8) {
    const min = this.m.half + left * this.s + 8;
    const max = innerWidth - right * this.s - 8;
    return max < min ? innerWidth / 2 : Math.min(Math.max(this.m.x, min), max);
  }

  /** mette un oggetto a `dx` pixel dello sprite dal mini-me */
  prop(name: PropName, dx: number, opts: ConstructorParameters<typeof Prop>[3] = {}) {
    const p = new Prop(name, this.s, this.m.x + dx * this.s, opts);
    this.props.push(p);
    this.m.props.push(p);
    return p;
  }
  drop(p: Prop) {
    p.remove();
    this.props = this.props.filter((x) => x !== p);
    this.m.props = this.m.props.filter((x) => x !== p);
  }
  cleanup() {
    for (const p of [...this.props]) this.drop(p);
    this.m.mods = '';
  }

  say(text: string) {
    this.m.particle(text, 'say');
  }
  note() {
    this.m.particle(pick(['♪', '♫', '♩']), 'note');
  }
  /** esegue `fn` ogni `every` secondi durante una posa (e `after` subito dopo) */
  every(every: number, fn: () => unknown, after?: () => unknown) {
    let next = 0;
    return (t: number) => {
      if (t >= next) {
        next = t + every;
        fn();
        after?.();
      }
    };
  }
}

// --- le scene ---------------------------------------------------------------------------------

type SceneDef = { weight: number; run: (a: SceneApi) => Scene };

export const SCENES: Record<string, SceneDef> = {
  // alla scrivania che programma
  coding: {
    weight: 1,
    *run(a) {
      yield a.walk(a.spot(34));
      a.prop('chair', -1);
      a.prop('desk', 20);
      yield a.pose('type', rand(4, 6), { facing: 1 });
      for (let i = 0; i < 2; i++) {
        if (Math.random() < 0.5) yield a.pose('think', rand(1.5, 2.5), { facing: 1 });
        else a.say(pick(['git push', 'LGTM', 'npm run dev', '// TODO', 'bug?!', '✓ build']));
        yield a.pose('type', rand(3, 5), { facing: 1 });
      }
      a.say(L('✓ fatto!', '✓ done!'));
      yield a.pose('type', 1.2, { facing: 1 });
    },
  },

  // banco di elettronica: salda, prende la scossa, esce tutto nero
  circuit: {
    weight: 1,
    *run(a) {
      yield a.walk(a.spot(32));
      a.prop('bench', 19);
      yield a.pose('solder', rand(4, 6), { facing: 1 });
      a.m.particle('✦', 'spark', 3);
      yield a.pose('zap', 1.1, { facing: 1 });
      a.m.particle('', 'puff', 6);
      a.m.mods = 'soot';
      yield a.pose('dizzy', 1.8, { facing: 1 });
      a.say(L('cof cof', '*cough*'));
      yield a.pose('blink', 1.4, { facing: 1 });
    },
  },

  // la stellina di Claude passa a salutare (rara)
  claude: {
    weight: 0.3,
    *run(a) {
      const s = a.s;
      const c = a.prop('claude', 0, { mode: 'air', y: -40, front: true });
      c.x = innerWidth + 30;
      const tx = Math.min(a.m.x + 26 * s, innerWidth - 20 * s);
      c.moveTo(tx, a.m.floor - 58 * s, 420);
      yield a.pose('surprised', 3, { facing: tx > a.m.x ? 1 : -1, until: () => c.arrived });
      a.m.particle('✦', 'stars', 3);
      yield a.pose('wave', 1.6);
      a.say(pick(['pair programming?', 'LGTM ✓', L('ciao!', 'hi!')]));
      yield a.pose('jump', 0.5);
      yield a.pose('idle', 1.2);
      c.moveTo(innerWidth + 60, -60, 480);
      yield a.pose('wave', 1.4, { until: () => c.arrived });
    },
  },

  // chi sono: musica, studio, insegnamento
  guitar: {
    weight: 1,
    *run(a) {
      yield a.pose('guitar', rand(6, 9), { each: a.every(0.55, () => a.note()) });
    },
  },
  piano: {
    weight: 1,
    *run(a) {
      yield a.walk(a.spot(30));
      a.prop('keyboard', 16);
      yield a.pose('piano', rand(6, 9), { facing: 1, each: a.every(0.45, () => a.note()) });
    },
  },
  violin: {
    weight: 1,
    *run(a) {
      yield a.pose('violin', rand(6, 8), { each: a.every(0.7, () => a.note()) });
    },
  },
  study: {
    weight: 1,
    *run(a) {
      yield a.pose('read', rand(7, 10));
      a.m.particle('💡', 'idea');
      yield a.pose('surprised', 1);
      yield a.pose('jump', 0.4);
    },
  },
  teach: {
    weight: 1,
    *run(a) {
      yield a.walk(a.spot(40));
      const b = a.prop('board', 24);
      yield a.pose('teachWrite', 5, { facing: 1, each: (t) => (b.arg = Math.min(4, Math.floor(t / 1.1) + 1)) });
      a.say(L('chiaro?', 'got it?'));
      yield a.pose('teachPoint', 3, { facing: -1 });
      yield a.pose('teachPoint', 2, { facing: 1 });
    },
  },

  // contatti: telefono, chiamata, aeroplanino, piccione
  phone: {
    weight: 1,
    *run(a) {
      const icons = Object.keys(ICONS) as (keyof typeof ICONS)[];
      yield a.pose('phoneScroll', rand(6, 8), {
        each: a.every(1.1, () => a.m.particle('', 'bubble', 1, { img: iconURL(pick(icons), 3), dx: 12, dy: 18 })),
      });
    },
  },
  call: {
    weight: 1,
    *run(a) {
      a.say(L('pronto?', 'hello?'));
      yield a.pose('phoneCall', 2.5);
      a.say(pick([L('sì, un sito nuovo!', 'yes, a new website!'), L('certo, ci sentiamo!', 'sure, talk soon!')]));
      yield a.pose('phoneCall', 3);
      a.say(L('ciao!', 'bye!'));
      yield a.pose('phoneCall', 1);
    },
  },
  plane: {
    weight: 1,
    *run(a) {
      const s = a.s;
      yield a.walk(a.spot(10, 30));
      yield a.pose('letter', 1.4, { facing: 1 });
      yield a.pose('planeHold', 0.6, { facing: 1 });
      yield a.pose('throwWind', 0.35, { facing: 1 });
      const p = a.prop('plane', 12, { mode: 'air', y: a.m.floor - 44 * s, front: true });
      // vola via in alto a destra
      p.moveTo(innerWidth + 60, Math.max(80, a.m.floor - 160 * s), 380);
      yield a.pose('throwGo', 0.5, { facing: 1 });
      yield a.pose('idle', 2.5, { facing: 1, until: () => p.arrived });
    },
  },
  pigeon: {
    weight: 1,
    *run(a) {
      const s = a.s;
      yield a.walk(a.spot(12, 12));
      yield a.pose('letter', 1, { facing: 1 });
      const hand = { x: a.m.x + 10 * s, y: a.m.floor - 44 * s };
      const b = a.prop('pigeon', 0, { mode: 'air', y: -30, front: true });
      b.x = innerWidth + 40;
      b.moveTo(hand.x + 8 * s, hand.y - 4 * s, 300);
      yield a.pose('holdUp', 4, { facing: 1, until: () => b.arrived });
      b.arg = 1; // prende la lettera
      a.say(L('grazie!', 'thanks!'));
      b.moveTo(-60, -80, 340);
      yield a.pose('wave', 2.2, { facing: 1, until: () => b.arrived });
    },
  },

  // pagine dei lavori
  grapes: {
    weight: 1,
    *run(a) {
      yield a.pose('eat', rand(4, 5));
      yield a.pose('drink', 3);
      a.m.mods = 'blush';
      a.say('hic!');
      yield a.pose('idle', 1.8);
      a.say('hic!');
      yield a.pose('blink', 1.2);
    },
  },
  architect: {
    weight: 1,
    *run(a) {
      a.m.mods = 'helmet';
      a.m.particle('', 'puff', 3);
      yield a.pose('blueprint', 3.5);
      a.say(L('qui un muro', 'wall goes here'));
      yield a.pose('point', 1.6);
      yield a.pose('blueprint', 3);
      a.say(L('approvato ✓', 'approved ✓'));
      yield a.pose('idle', 1);
    },
  },
  // Trenitardo e Bustardo: il mezzo passa, lui corre, lo perde
  train: {
    weight: 1,
    *run(a) {
      yield* chase(a, 'train', L('noooo!', 'noooo!'), 900);
    },
  },
  bus: {
    weight: 1,
    *run(a) {
      yield* chase(a, 'bus', L('aspettaaa!', 'waaait!'), 620);
    },
  },
  // Hevy: curl coi manubri, conta le ripetizioni
  gym: {
    weight: 1,
    *run(a) {
      a.m.mods = 'sweat';
      // una ripetizione al secondo (la posa alterna giù/su ogni mezzo secondo), contate a voce
      let rep = 0;
      yield a.pose('curl', 8.2, { each: a.every(1, () => rep > 0 && a.m.particle(String(rep), 'rep'), () => rep++) });
      a.say('PR!');
      yield a.pose('flex', 1.6);
    },
  },
};

function* chase(a: SceneApi, name: 'train' | 'bus', shout: string, speed: number): Scene {
  const s = a.s;
  const v = a.prop(name, 0, {});
  v.x = -70 * s;
  v.vx = speed;
  // lo vede arrivare…
  yield a.pose('surprised', 5, { facing: -1, until: () => v.x > a.m.x - 20 * s });
  // …e gli corre dietro, invano
  yield a.walk(innerWidth - a.m.half - 12, 1.9);
  a.say(shout);
  yield a.pose('bumpSad', 2.6, { facing: 1 });
  if (name === 'train') a.say(L('…era in anticipo?!', '…it was EARLY?!'));
  yield a.pose('bumpSad', 1.4, { facing: 1 });
}

// --- quale scena, su quale pagina --------------------------------------------------------------

const POOLS: [RegExp, string[]][] = [
  [/^\/(lavori|work)\/uvaedintorni\/?$/, ['grapes']],
  [/^\/(lavori|work)\/(arcreate|trentinoingegneria)\/?$/, ['architect']],
  [/^\/lab\/trenitardo\/?$/, ['train']],
  [/^\/lab\/bustardo\/?$/, ['bus']],
  [/^\/lab\/hevy-companion\/?$/, ['gym']],
  [/^\/lab\/esp32/, ['circuit', 'coding']],
  [/^\/(lavori|work)(\/|$)/, ['coding']],
  [/^\/lab(\/|$)/, ['coding', 'circuit', 'claude']],
  [/^\/(chi-sono|about)\/?$/, ['guitar', 'piano', 'violin', 'study', 'teach']],
  [/^\/(contatti|contact)\/?$/, ['phone', 'call', 'plane', 'pigeon']],
];

export function pagePath() {
  return location.pathname.replace(/^\/en(?=\/|$)/, '') || '/';
}
export const isHome = () => pagePath() === '/';

/** le scene possibili qui; in home tutte */
export function pool(): string[] {
  const path = pagePath();
  for (const [re, names] of POOLS) if (re.test(path)) return names;
  return isHome() ? Object.keys(SCENES) : [];
}

export function choose(names = pool()): string | null {
  const total = names.reduce((n, k) => n + SCENES[k].weight, 0);
  let r = Math.random() * total;
  for (const k of names) if ((r -= SCENES[k].weight) <= 0) return k;
  return names[0] ?? null;
}
