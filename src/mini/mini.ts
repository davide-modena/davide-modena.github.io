// Il mini-me: vive sulla barra di stato in fondo alla pagina, ogni tanto salta su card e mockup,
// si può prendere e lanciare col mouse. Arriva da solo poco dopo l'apertura della pagina.
//
// Posizione: sul pavimento (la barra di stato) e in volo è "fixed", in coordinate dello schermo.
// Quando sta sopra una card diventa "absolute", in coordinate della pagina: così scorre insieme
// alla card nello stesso istante, invece di inseguirla un fotogramma dopo.
//
// Comandi (dal terminale, via evento "mini"): summon, sleep, fight, on, off, size s|m|l, status.
//
// Easter egg: se lo scuoti forte mentre lo tieni parte MINI FIGHTER (./game.ts, caricato solo allora).

import { render, W, H, SIT_ROW, SEATED, type Theme } from './sprite';
import { SCENES, SceneApi, choose, isHome, pool, type Step } from './scenes';
import type { Prop } from './props';

type State =
  | 'hidden'
  | 'enter' // entra correndo da un lato
  | 'idle'
  | 'walk' // va da qualche parte sullo stesso piano
  | 'leave' // esce dallo schermo
  | 'scrollrun' // corre mentre la pagina scorre
  | 'crouch' // si prepara al salto
  | 'air' // in volo (salto, caduta, lancio)
  | 'land'
  | 'wave'
  | 'point'
  | 'sit'
  | 'sleep'
  | 'dizzy'
  | 'bumpsit' // atterrato di sedere dopo i rimbalzi
  | 'held'
  | 'scene'; // una scenetta (./scenes.ts): scrivania, chitarra, treno…

const SIZES = { s: 1, m: 2, l: 3 } as const;
type Size = keyof typeof SIZES;
const PLATFORMS = '.lab-card, .browser, .portrait .pic, .steps li, .skill, .timeline li, .direct';
const POINTABLE = '.btn, .lab-card, .show h3 a, .next';
const GRAVITY = 2600; // px/s²
const RUN_SPEED = 230; // px/s

const store = {
  get(k: string) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** quello che il gioco riceve dal mini-me: rimbalzi, muri, soffitto, lanci */
export interface FightHooks {
  onEvent(type: 'grab' | 'throw' | 'wall' | 'ceiling' | 'bounce' | 'land' | 'platform', value?: number): void;
}

export class Mini {
  root = document.createElement('div');
  canvas = document.createElement('canvas');
  ctx = this.canvas.getContext('2d')!;
  cache = new Map<string, ImageData>();

  scale: number = SIZES[(store.get('mini-size') as Size) ?? 'm'] ?? 2;
  compact = matchMedia('(max-width: 900px), (pointer: coarse)').matches;

  state: State = 'hidden';
  t = 0; // tempo passato nello stato attuale
  x = 0; // centro dei piedi, coordinate dello schermo
  y = 0;
  vx = 0;
  vy = 0;
  facing = 1;
  targetX = 0;
  on: 'floor' | 'platform' | 'air' = 'floor';
  platform: Element | null = null;
  target: Element | null = null; // piattaforma verso cui sta saltando
  next: State = 'idle'; // cosa fare dopo lo stato attuale
  duration = 0; // durata dello stato attuale (per quelli a tempo)

  pose = 'idle';
  frame = 0;
  frameT = 0;
  blinkIn = rand(2, 5);
  blinking = 0;
  shownAt = 0;
  /** ultima volta che l'utente ha mosso il mouse o scrollato: dopo un po' di calma si addormenta */
  active = performance.now();
  lastPoint = 0;
  zTimer = 0;
  raf = 0;
  last = 0;
  scrollY = scrollY;
  scrollT = performance.now();
  scrollStop = 0;
  drag: { dx: number; dy: number; samples: [number, number, number][] } | null = null;
  /** misure della pagina, prese solo al resize (leggerle a ogni fotogramma rallentava lo scroll) */
  floor = 0;
  headerH = 64;
  statusH = 28;
  /** bordo alto dello sprite sullo schermo, e ultimi stili scritti (si riscrivono solo se cambiano) */
  vTop = 0;
  /** sopra una card: posizione in coordinate della pagina, e timer del controllo della card */
  pageY = 0;
  platCheck = 0;
  written = { pos: '', tf: '', flip: '', origin: '' };

  // --- scenette -------------------------------------------------------------------------------
  scene: { name: string; gen: Generator<Step, void, void>; api: SceneApi } | null = null;
  step: Step | null = null;
  stepT = 0;
  /** niente scene prima di questo istante: in home sono rare, nelle pagine dedicate più frequenti */
  sceneCool = performance.now() + (isHome() ? 45000 : 2500);
  /** pagina con scene dedicate (lavori, lab, chi sono, contatti…): lì le scene sono il suo lavoro */
  dedicated = !isHome() && pool().length > 0;
  /** scena chiesta dal terminale ("mini scene <nome>") */
  pendingScene = '';
  /** ritocchi dello sprite accesi dalle scene: helmet, soot, blush, sweat */
  mods = '';
  /** oggetti di scena in pagina */
  props: Prop[] = [];

  // --- fisica da videogioco -------------------------------------------------------------------
  /** inclinazione (rad) e velocità angolare: oscilla come un pendolo mentre lo tieni */
  theta = 0;
  omega = 0;
  /** punto in cui l'hai preso, relativo all'angolo in alto a sinistra dello sprite */
  pivotX = 0;
  pivotY = 0;
  ptr = { x: 0, y: 0 };
  prevPx = 0;
  prevVx = 0;
  /** lanciato o caduto: rimbalza di sedere invece di atterrare in piedi */
  tumbling = false;
  bounces = 0;
  hardHit = false;
  /** schiacciamento all'impatto (1 → 0) */
  squash = 0;
  /** strato trasparente sopra la pagina mentre lo trascini: niente click sugli elementi sotto */
  layer = document.createElement('div');

  // --- gioco ------------------------------------------------------------------------------------
  game: FightHooks | null = null;
  starting = false;
  /** istanti delle inversioni di direzione veloci mentre lo tieni: 4 in poco tempo = scossa */
  shakes: number[] = [];
  lastDirX = 0;
  lastDirY = 0;
  /** su telefono: quando se ne va dopo il saluto */
  leaveAt = 0;

  constructor() {
    this.root.className = 'mini';
    this.root.setAttribute('aria-hidden', 'true');
    this.canvas.width = W;
    this.canvas.height = H;
    this.root.append(this.canvas);
    if (this.compact) this.root.classList.add('touch');
    this.layer.className = 'mini-layer';
    this.layer.hidden = true;
    document.body.append(this.layer, this.root);
    this.applySize();
    this.measure();
    this.root.hidden = true;

    new MutationObserver(() => {
      this.cache.clear();
      this.draw(true);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    addEventListener('scroll', () => this.onScroll(), { passive: true });
    addEventListener('resize', () => {
      this.measure();
      this.x = clamp(this.x, this.half, innerWidth - this.half);
    });
    // su telefono la barra degli indirizzi che compare/sparisce cambia l'altezza utile
    visualViewport?.addEventListener('resize', () => this.measure());
    addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: true });
    document.addEventListener('pointerover', (e) => this.onPointerOver(e));
    document.addEventListener('pointerdown', (e) => this.onGrab(e), true);
    addEventListener('pointerup', (e) => this.onRelease(e));
    addEventListener('pointercancel', (e) => this.onRelease(e));
    addEventListener('mini', (e) => this.command((e as CustomEvent<string>).detail, e));
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.last = performance.now();
    });
  }

  // --- geometria ------------------------------------------------------------------------------

  get half() {
    return (W * this.scale) / 2;
  }
  measure() {
    const bar = document.querySelector<HTMLElement>('.statusbar');
    this.statusH = bar?.offsetHeight ?? 28;
    this.floor = bar ? bar.getBoundingClientRect().top : innerHeight - this.statusH;
    this.headerH = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 64;
  }
  /** piattaforme visibili e raggiungibili */
  platforms() {
    if (this.game) return [];
    const top = this.headerH + 30;
    const bottom = this.floor - 90;
    return [...document.querySelectorAll(PLATFORMS)].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 70 && r.top > top && r.top < bottom && r.left > 0 && r.right < innerWidth && Math.abs(r.top - this.y) < 560;
    });
  }

  // --- ciclo principale -----------------------------------------------------------------------

  start() {
    if (this.raf) return;
    this.last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - this.last) / 1000, 0.05);
      this.last = now;
      this.update(dt);
      this.draw();
      this.raf = this.state === 'hidden' ? 0 : requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  set(state: State, duration = 0) {
    this.state = state;
    this.t = 0;
    this.duration = duration;
  }

  update(dt: number) {
    this.t += dt;
    const floor = this.floor;
    for (const p of this.props) p.update(dt);

    // sopra una piattaforma: è ancorato alla pagina; ogni tanto controlla che la card ci sia ancora
    if (this.on === 'platform' && this.platform && this.state !== 'held') {
      this.platCheck -= dt;
      if (this.platCheck <= 0) {
        this.platCheck = 0.1;
        const r = this.platform.getBoundingClientRect();
        if (r.top < this.headerH || r.top > floor - 20 || this.x < r.left - 4 || this.x > r.right + 4) {
          this.y = r.top;
          this.fall();
        } else this.pageY = r.top + scrollY;
      }
      if (this.on === 'platform') this.y = this.pageY - scrollY;
    } else if (this.on === 'floor' && this.state !== 'held') {
      this.y = floor;
    }

    switch (this.state) {
      case 'enter':
      case 'walk':
      case 'leave': {
        const d = this.targetX - this.x;
        this.facing = Math.sign(d) || this.facing;
        this.x += Math.sign(d) * Math.min(Math.abs(d), RUN_SPEED * dt * (this.state === 'walk' ? 0.8 : 1.15));
        this.pose = 'run';
        if (Math.abs(d) < 1) {
          if (this.state === 'leave') return this.hide();
          if (this.state === 'enter') this.set('wave', 1.6);
          else this.set('idle');
        }
        break;
      }
      case 'scrollrun': {
        this.pose = 'run';
        this.x += this.vx * dt;
        // arrivato al bordo: si gira e corre dall'altra parte, invece di spingere contro il muro
        if (this.x <= this.half || this.x >= innerWidth - this.half) {
          this.x = clamp(this.x, this.half, innerWidth - this.half);
          this.vx = -this.vx;
          this.facing = Math.sign(this.vx) || this.facing;
        }
        if (performance.now() - this.scrollStop > 220) this.set('idle');
        break;
      }
      case 'crouch':
        this.pose = 'land';
        if (this.t > 0.14) this.launch();
        break;
      case 'air': {
        this.vy += GRAVITY * dt;
        this.x += this.vx * dt;
        const prevY = this.y;
        this.y += this.vy * dt;
        if (this.tumbling) {
          // in volo continua a girare, frenando piano
          this.theta += this.omega * dt;
          this.omega *= Math.pow(0.5, dt);
          this.pose = this.bounces ? 'bump' : 'fall';
        } else this.pose = this.vy < 0 ? 'jump' : 'fall';
        // soffitto sotto l'header: se lo lanci forte verso l'alto ci sbatte e ricade
        const ceiling = (this.game ? 0 : this.headerH) + H * this.scale;
        if (this.y < ceiling && this.vy < 0) {
          this.y = ceiling;
          this.vy *= -0.35;
          this.particle('✦', 'stars', 2);
          this.emit('ceiling', -this.vy);
        }
        // rimbalzo sui bordi dello schermo
        if (this.x < this.half || this.x > innerWidth - this.half) {
          this.x = clamp(this.x, this.half, innerWidth - this.half);
          if (Math.abs(this.vx) > 200) this.emit('wall', Math.abs(this.vx));
          this.vx *= -0.55;
          this.facing = Math.sign(this.vx) || this.facing;
        }
        if (this.vy > 0) {
          // atterraggio su una piattaforma incrociata scendendo
          for (const el of this.target ? [this.target] : this.platforms()) {
            const r = el.getBoundingClientRect();
            if (prevY <= r.top + 2 && this.y >= r.top && this.x > r.left + 6 && this.x < r.right - 6) {
              return this.touch('platform', el, r.top);
            }
          }
          if (this.y >= floor) this.touch('floor', null, floor);
        }
        break;
      }
      case 'bumpsit': {
        // seduto per terra dopo i rimbalzi: scivola ancora un po' e si riprende
        this.pose = this.hardHit ? 'bumpDizzy' : 'bump';
        this.x = clamp(this.x + this.vx * dt, this.half, innerWidth - this.half);
        this.vx *= Math.pow(0.03, dt);
        if (this.t > this.duration) {
          this.tumbling = false;
          if (this.on === 'platform') this.set('sit', rand(5, 9));
          else this.set('idle');
        }
        break;
      }
      case 'land':
        this.pose = 'land';
        if (this.t > 0.16) this.set(this.next, this.next === 'dizzy' ? 2.2 : this.next === 'sit' ? rand(6, 12) : 0);
        break;
      case 'wave':
        this.pose = 'wave';
        if (this.t > this.duration) {
          // su telefono resta un po' sulla barra, così lo si può prendere col dito
          this.set('idle');
        }
        break;
      case 'point':
        this.pose = 'point';
        if (this.t > this.duration) this.set('idle');
        break;
      case 'dizzy':
        this.pose = 'dizzy';
        if (this.t > this.duration) this.set('idle');
        break;
      case 'sit':
        this.pose = 'sit';
        if (this.t > this.duration) this.hopDown();
        break;
      case 'sleep':
        this.pose = 'sleep';
        this.zTimer -= dt;
        if (this.zTimer <= 0) {
          this.zTimer = 1.3;
          this.particle('z', 'zz');
        }
        break;
      case 'held': {
        this.pose = 'held';
        // pendolo: l'accelerazione orizzontale del mouse lo fa oscillare, la gravità lo riporta giù
        const step = Math.max(dt, 0.001);
        const vxp = (this.ptr.x - this.prevPx) / step;
        const ax = (vxp - this.prevVx) / step;
        this.prevPx = this.ptr.x;
        this.prevVx = vxp;
        this.omega += (-42 * Math.sin(this.theta) - 3.5 * this.omega + clamp(ax, -60000, 60000) * 0.0045) * dt;
        this.theta = clamp(this.theta + this.omega * dt, -1.2, 1.2);
        // il punto preso resta sotto il puntatore
        this.x = this.ptr.x - this.pivotX + this.half;
        this.y = this.ptr.y - this.pivotY + H * this.scale;
        break;
      }
      case 'idle':
        this.pose = 'idle';
        this.idle();
        break;
      case 'scene':
        this.runScene(dt);
        break;
    }

    this.squash = Math.max(0, this.squash - dt * 4);

    // occhi: ogni tanto sbatte le palpebre
    this.blinkIn -= dt;
    if (this.blinkIn <= 0) {
      this.blinking = 0.13;
      this.blinkIn = rand(2.5, 6);
    }
    this.blinking = Math.max(0, this.blinking - dt);
  }

  /** da fermo decide cosa fare, senza fretta */
  idle() {
    if (this.game) return;
    if (this.pendingScene && this.on === 'floor') {
      this.maybeScene();
      return;
    }
    const now = performance.now();
    if (this.compact && this.leaveAt && now > this.leaveAt) {
      this.leaveAt = 0;
      return this.leave();
    }
    // nelle pagine dedicate si ferma poco: la prossima scena arriva presto
    if (!this.duration) this.duration = this.dedicated ? rand(1, 2.5) : rand(4, 9);
    if (this.t < this.duration) return;
    if (now - this.active > 25000) return this.set('sleep');
    if (this.on === 'floor' && this.maybeScene()) return;
    // sopra una card, in una pagina dedicata: scende per la prossima scena
    if (this.dedicated && this.on === 'platform' && now > this.sceneCool) return this.hopDown();
    const visibleFor = (now - this.shownAt) / 1000;
    const r = Math.random();
    if (visibleFor > 90 && r < 0.12) return this.leave();
    if (r < 0.55 && !this.dedicated) {
      const plats = this.platforms();
      if (plats.length) return this.jumpTo(plats[(Math.random() * plats.length) | 0]);
    }
    if (r < 0.8) return this.walkTo(clamp(this.x + rand(-350, 350), this.half + 20, innerWidth - this.half - 20));
    if (this.on === 'floor') return this.set('sit', rand(6, 10));
    this.set('idle', rand(2, 4));
  }

  // --- scenette ------------------------------------------------------------------------------

  /** forse parte una scena (quella chiesta, o una a caso tra quelle della pagina) */
  maybeScene() {
    const now = performance.now();
    let name = this.pendingScene;
    if (!name) {
      if (now < this.sceneCool) return false;
      // home: di rado; pagine dedicate: quasi sempre
      if (Math.random() > (this.dedicated ? 0.9 : 0.1)) {
        this.sceneCool = now + (this.dedicated ? 1000 : 8000);
        return false;
      }
      name = choose() ?? '';
    }
    this.pendingScene = '';
    if (!SCENES[name]) return false;
    const api = new SceneApi(this);
    this.scene = { name, api, gen: SCENES[name].run(api) };
    this.step = null;
    this.set('scene');
    return true;
  }

  runScene(dt: number) {
    if (!this.scene) return this.set('idle');
    if (!this.step) return this.nextStep();
    const st = this.step;
    this.stepT += dt;
    if (st.kind === 'walk') {
      const d = st.x - this.x;
      this.pose = 'run';
      if (Math.abs(d) < 1) {
        this.x = st.x;
        return this.nextStep();
      }
      this.facing = Math.sign(d);
      this.x += Math.sign(d) * Math.min(Math.abs(d), RUN_SPEED * (st.speed ?? 1) * dt);
      return;
    }
    if (this.pose !== st.pose) {
      this.pose = st.pose;
      this.frame = 0;
      this.frameT = 0;
    }
    if (st.facing) this.facing = st.facing;
    st.each?.(this.stepT);
    if (this.stepT >= st.t || st.until?.()) this.nextStep();
  }

  nextStep() {
    const r = this.scene!.gen.next();
    if (r.done) return this.endScene();
    this.step = r.value;
    this.stepT = 0;
  }

  /** chiude la scena: gli oggetti spariscono; `abort` se è stata interrotta (presa, gioco…) */
  endScene(abort = false) {
    if (!this.scene) return;
    const s = this.scene;
    this.scene = null;
    this.step = null;
    s.gen.return();
    s.api.cleanup();
    this.sceneCool = performance.now() + (this.dedicated ? rand(3, 7) : rand(90, 150)) * 1000;
    if (!abort) this.set('idle', rand(2, 4));
  }

  // --- azioni ---------------------------------------------------------------------------------

  show(fromLeft = Math.random() < 0.5) {
    this.root.hidden = false;
    this.on = 'floor';
    this.platform = null;
    this.x = fromLeft ? -this.half : innerWidth + this.half;
    this.y = this.floor;
    this.targetX = fromLeft ? rand(innerWidth * 0.15, innerWidth * 0.4) : rand(innerWidth * 0.6, innerWidth * 0.85);
    this.shownAt = performance.now();
    this.set('enter');
    this.start();
  }

  hide() {
    this.set('hidden');
    this.root.hidden = true;
    // si prende una pausa e poi torna
    setTimeout(() => {
      if (this.state === 'hidden' && this.enabled) this.show();
    }, rand(20, 40) * 1000);
  }

  leave() {
    this.endScene(true);
    if (this.on !== 'floor') return this.hopDown();
    this.targetX = this.x < innerWidth / 2 ? -this.half * 2 : innerWidth + this.half * 2;
    this.set('leave');
  }

  walkTo(x: number) {
    this.targetX = x;
    this.set('walk');
  }

  jumpTo(el: Element | null, x?: number) {
    this.target = el;
    const r = el?.getBoundingClientRect();
    this.targetX = x ?? (r ? rand(r.left + 30, r.right - 30) : this.x);
    this.targetY = r ? r.top : this.floor;
    this.set('crouch');
  }
  targetY = 0;

  /** parabola dal punto attuale al bersaglio, con un po' di slancio sopra il punto più alto */
  launch() {
    const apex = Math.min(this.y, this.targetY) - rand(60, 110);
    const up = Math.sqrt(2 * GRAVITY * Math.max(10, this.y - apex));
    const tUp = up / GRAVITY;
    const tDown = Math.sqrt((2 * Math.max(10, this.targetY - apex)) / GRAVITY);
    this.vy = -up;
    this.vx = (this.targetX - this.x) / (tUp + tDown);
    this.facing = Math.sign(this.vx) || this.facing;
    this.on = 'air';
    this.platform = null;
    this.set('air');
  }

  hopDown() {
    this.jumpTo(null, clamp(this.x + rand(-160, 160), this.half, innerWidth - this.half));
  }

  fall() {
    this.tumbling = false;
    this.on = 'air';
    this.platform = null;
    this.target = null;
    this.vx = 0;
    this.vy = 0;
    this.set('air');
  }

  /** tocca terra: se è stato lanciato rimbalza di sedere, altrimenti atterra */
  touch(on: 'floor' | 'platform', el: Element | null, y: number) {
    if (!this.tumbling) return this.landOn(on, el, y);
    if (!this.bounces) this.hardHit = this.vy > 1300;
    if (this.vy > 320) {
      this.emit(on === 'platform' ? 'platform' : 'bounce', this.vy);
      // rimbalzo: ogni volta più basso, e smette di girare
      if (!this.bounces && this.hardHit) this.particle('✦', 'stars', 3);
      this.bounces++;
      this.y = y;
      this.vy = -this.vy * 0.42;
      this.vx *= 0.7;
      this.theta = 0;
      this.omega = 0;
      this.squash = 1;
      this.target = el;
      return;
    }
    this.on = on;
    this.platform = el;
    this.target = null;
    this.y = y;
    this.pageY = y + scrollY;
    this.platCheck = 0.1;
    this.vy = 0;
    this.theta = 0;
    this.omega = 0;
    this.squash = 0.7;
    this.emit(on === 'platform' ? 'platform' : 'land');
    this.set('bumpsit', this.hardHit ? 2.2 : 0.9);
  }

  landOn(on: 'floor' | 'platform', el: Element | null, y: number) {
    const hard = this.vy > 1500;
    this.on = on;
    this.platform = el;
    this.target = null;
    this.y = y;
    this.pageY = y + scrollY;
    this.platCheck = 0.1;
    this.vx = 0;
    this.vy = 0;
    this.next = hard ? 'dizzy' : on === 'platform' && Math.random() < 0.7 ? 'sit' : 'idle';
    if (hard) this.particle('✦', 'stars', 3);
    this.squash = hard ? 1 : 0.55;
    this.set('land');
  }

  // --- interazione ----------------------------------------------------------------------------

  onScroll() {
    if (this.compact) this.measure();
    const now = performance.now();
    const v = ((scrollY - this.scrollY) / Math.max(now - this.scrollT, 1)) * 1000;
    this.scrollY = scrollY;
    this.scrollT = now;
    this.scrollStop = now;
    this.active = now;
    if (this.game || this.state === 'scene') return; // durante una scena è impegnato
    if (this.state === 'sleep') return this.wake();
    // nelle pagine dedicate lo scroll non lo distrae: continua con le sue scene
    if (this.dedicated) return;
    if (this.on !== 'floor' || !['idle', 'walk', 'scrollrun'].includes(this.state)) return;
    if (Math.abs(v) < 700) return;
    if (this.state === 'scrollrun') return; // già in corsa: mantiene la sua direzione
    // corre nel verso dello scroll, ma se lì c'è il bordo va dall'altra parte
    let dir = Math.sign(v);
    if ((dir > 0 && this.x > innerWidth - this.half - 40) || (dir < 0 && this.x < this.half + 40)) dir = -dir;
    this.vx = dir * Math.min(Math.abs(v) * 0.22, 420);
    this.facing = dir;
    this.set('scrollrun');
  }

  onPointerMove(e: PointerEvent) {
    this.active = performance.now();
    if (e.pointerType === 'mouse') this.hover(e);
    if (this.drag) {
      const now = performance.now();
      this.detectShake(e.clientX, e.clientY, now);
      this.drag.samples.push([e.clientX, e.clientY, now]);
      while (this.drag.samples.length > 2 && now - this.drag.samples[0][2] > 90) this.drag.samples.shift();
      this.ptr = { x: e.clientX, y: e.clientY };
      return;
    }
    if (this.state === 'sleep' && Math.hypot(e.clientX - this.x, e.clientY - (this.y - 40)) < 110) this.wake();
  }

  /** conta le inversioni di direzione veloci: 4 in 1,3 s fanno partire il gioco */
  detectShake(x: number, y: number, now: number) {
    const s = this.drag!.samples;
    const [px, py, pt] = s[s.length - 1];
    const dt = Math.max((now - pt) / 1000, 0.004);
    const vx = (x - px) / dt;
    const vy = (y - py) / dt;
    const dx = Math.abs(vx) > 1100 ? Math.sign(vx) : 0;
    const dy = Math.abs(vy) > 1100 ? Math.sign(vy) : 0;
    if (dx && this.lastDirX && dx !== this.lastDirX) this.shakes.push(now);
    if (dy && this.lastDirY && dy !== this.lastDirY) this.shakes.push(now);
    if (dx) this.lastDirX = dx;
    if (dy) this.lastDirY = dy;
    this.shakes = this.shakes.filter((t) => now - t < 1300);
    if (this.shakes.length >= 4 && !this.game) {
      this.shakes = [];
      this.startFight();
    }
  }

  startFight() {
    if (this.game || this.starting) return;
    this.endScene(true);
    this.starting = true;
    store.set('mini', 'on');
    if (this.state === 'hidden') this.show();
    import('./game')
      .then((m) => m.startFight(this))
      .finally(() => (this.starting = false));
  }

  /** chiamato dal gioco quando finisce */
  endFight() {
    this.game = null;
    this.root.classList.remove('fighting');
    // la pagina è appena tornata alla sua posizione: non è uno scroll dell'utente
    this.scrollY = scrollY;
    this.scrollT = performance.now();
    this.measure();
    this.leaveAt = 0;
    if (this.state === 'held' || this.state === 'air') return;
    this.on = 'floor';
    this.set('wave', 1.6);
  }

  emit(type: Parameters<FightHooks['onEvent']>[0], value?: number) {
    this.game?.onEvent(type, value);
  }

  onPointerOver(e: PointerEvent) {
    if (this.game) return;
    if (this.state !== 'idle' || this.on !== 'floor' || e.pointerType !== 'mouse') return;
    const el = (e.target as Element).closest?.(POINTABLE);
    if (!el || performance.now() - this.lastPoint < 7000) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    if (Math.abs(cx - this.x) > 700) return;
    this.lastPoint = performance.now();
    this.facing = cx > this.x ? 1 : -1;
    this.set('point', 1.3);
  }

  /** il puntatore è sopra un pixel pieno del personaggio? (calcolato, senza leggere il canvas) */
  hit(cx: number, cy: number) {
    const img = this.cache.get(this.drawn);
    if (!img) return false;
    let px = Math.floor((cx - (this.x - this.half)) / this.scale);
    const py = Math.floor((cy - this.vTop) / this.scale);
    if (px < 0 || py < 0 || px >= W || py >= H) return false;
    if (this.facing < 0) px = W - 1 - px;
    return img.data[(py * W + px) * 4 + 3] > 0;
  }

  /** col dito basta toccare dentro il riquadro dello sprite, con un po' di margine */
  hitBox(cx: number, cy: number) {
    const left = this.x - this.half;
    const m = 14;
    return cx > left - m && cx < left + W * this.scale + m && cy > this.vTop - m && cy < this.vTop + H * this.scale + m;
  }

  onGrab(e: PointerEvent) {
    if (e.button !== 0 || this.state === 'hidden') return;
    if (e.pointerType === 'mouse' ? !this.hit(e.clientX, e.clientY) : !this.hitBox(e.clientX, e.clientY)) return;
    e.preventDefault();
    e.stopPropagation();
    this.endScene(true);
    this.drag = { dx: this.x - e.clientX, dy: this.y - e.clientY, samples: [[e.clientX, e.clientY, performance.now()]] };
    // lo tieni per il punto che hai preso (lo sprite in piedi è più alto di quello seduto)
    const standTop = this.y - H * this.scale;
    this.pivotX = clamp(e.clientX - (this.x - this.half), 0, W * this.scale);
    this.pivotY = clamp(e.clientY - standTop, 0, H * this.scale);
    this.ptr = { x: e.clientX, y: e.clientY };
    this.prevPx = e.clientX;
    this.prevVx = 0;
    this.theta = 0;
    this.omega = 0;
    this.tumbling = true;
    this.bounces = 0;
    this.shakes = [];
    this.lastDirX = this.lastDirY = 0;
    this.leaveAt = 0;
    this.layer.hidden = false;
    this.emit('grab');
    this.on = 'air';
    this.platform = null;
    this.target = null;
    this.root.classList.add('grabbed');
    document.documentElement.classList.add('mini-grabbing');
    this.particle('!', 'bang');
    this.set('held');
  }

  onRelease(_e: PointerEvent) {
    if (!this.drag) return;
    const s = this.drag.samples;
    const [x0, y0, t0] = s[0];
    const [x1, y1, t1] = s[s.length - 1];
    const dt = Math.max((t1 - t0) / 1000, 0.016);
    this.vx = clamp((x1 - x0) / dt, -2600, 2600);
    this.vy = clamp((y1 - y0) / dt, -2600, 2600);
    // i lanci veloci lo fanno anche girare su se stesso
    this.omega += clamp(this.vx * 0.006, -22, 22);
    this.emit('throw', Math.hypot(this.vx, this.vy));
    this.drag = null;
    this.root.classList.remove('grabbed');
    document.documentElement.classList.remove('mini-grabbing');
    this.layer.hidden = true;
    // il click che segue il rilascio non deve arrivare agli elementi sotto
    const eat = (ev: Event) => {
      ev.preventDefault();
      ev.stopPropagation();
    };
    addEventListener('click', eat, { capture: true, once: true });
    setTimeout(() => removeEventListener('click', eat, { capture: true }), 350);
    this.set('air');
  }

  wake() {
    this.active = performance.now();
    this.particle('!', 'bang');
    this.set('dizzy', 0.5);
  }

  get enabled() {
    return store.get('mini') !== 'off';
  }

  command(cmd: string, ev?: Event) {
    const [name, arg] = cmd.split(' ');
    if (name === 'status') {
      if (ev) (ev as Event & { result?: unknown }).result = { enabled: this.enabled, state: this.state, size: this.scale };
      return;
    }
    if (name === 'off') {
      store.set('mini', 'off');
      if (this.state !== 'hidden') this.leave();
      return;
    }
    if (name === 'on') {
      store.set('mini', 'on');
      if (this.state === 'hidden') this.show();
      return;
    }
    if (name === 'size' && arg && arg in SIZES) {
      store.set('mini-size', arg);
      this.scale = SIZES[arg as Size];
      this.applySize();
      return;
    }
    if (name === 'fight') return this.startFight();
    if (name === 'scenes') {
      if (ev) (ev as Event & { result?: unknown }).result = Object.keys(SCENES);
      return;
    }
    if (name === 'scene') {
      // la scena parte appena è a terra e libero
      this.endScene(true);
      store.set('mini', 'on');
      this.pendingScene = arg && SCENES[arg] ? arg : choose(Object.keys(SCENES)) ?? '';
      if (this.state === 'hidden') return this.show();
      if (this.on !== 'floor') return this.hopDown();
      return this.set('idle');
    }
    this.endScene(true);
    if (name === 'summon') {
      store.set('mini', 'on');
      if (this.state === 'hidden') return this.show();
      if (this.on !== 'floor') return this.hopDown();
      return this.set('wave', 1.6);
    }
    if (name === 'sleep') {
      if (this.state === 'hidden') {
        this.show();
        this.x = this.targetX;
      }
      this.on = this.on === 'air' ? 'floor' : this.on;
      this.set('sleep');
    }
  }

  // --- disegno --------------------------------------------------------------------------------

  applySize() {
    this.canvas.style.width = `${W * this.scale}px`;
    this.canvas.style.height = `${H * this.scale}px`;
    this.root.style.setProperty('--s', String(this.scale));
  }

  draw(force = false) {
    if (this.state === 'hidden') return;
    // animazione: ogni posa ha il suo ritmo
    const speeds: Record<string, number> = {
      run: 0.075, idle: 0.6, wave: 0.22, sit: 1.4, sleep: 1, dizzy: 0.16, held: 0.12,
      type: 0.12, think: 1.2, solder: 0.25, zap: 0.08, guitar: 0.22, piano: 0.18, violin: 0.35,
      read: 0.28, teachWrite: 0.2, teachPoint: 0.4, phoneScroll: 0.5, phoneCall: 0.3,
      eat: 0.5, drink: 0.7, blueprint: 1.2, curl: 0.5, flex: 0.4, bumpSad: 0.8,
    };
    this.frameT += 1 / 60;
    if (this.frameT > (speeds[this.pose] ?? 0.2)) {
      this.frameT = 0;
      this.frame++;
      force = true;
    }
    let pose = this.pose;
    if (this.blinking > 0 && (pose === 'idle' || pose === 'point')) pose = 'blink';
    const theme: Theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    const key = `${theme}:${pose}:${this.frame % 6}:${this.mods}`;
    for (const p of this.props) p.draw(theme, this.statusH);
    if (force || key !== this.drawn) {
      let img = this.cache.get(key);
      if (!img) {
        img = new ImageData(render(pose, this.frame % 6, theme, this.mods) as unknown as Uint8ClampedArray<ArrayBuffer>, W, H);
        this.cache.set(key, img);
      }
      this.ctx.putImageData(img, 0, 0);
      this.drawn = key;
    }
    const seated = SEATED.has(this.pose);
    const left = this.x - this.half;
    this.vTop = this.y - (seated ? SIT_ROW : H) * this.scale;
    // tre modi di stare in pagina:
    // - sopra una card: coordinate della pagina, così scorre insieme alla card senza ritardi
    // - sul pavimento: ancorato al fondo dello schermo via CSS, come la barra di stato
    //   (su telefono la barra degli indirizzi cambia l'altezza e così restano sempre insieme)
    // - in volo o in mano: coordinate dello schermo
    const grounded = this.on === 'floor' && this.state !== 'held' && this.state !== 'air';
    const onPage = this.on === 'platform' && this.state !== 'held';
    const pos = onPage ? 'page' : grounded ? 'floor' : 'screen';
    const top = onPage
      ? this.pageY - (seated ? SIT_ROW : H) * this.scale
      : grounded
        ? this.vTop + H * this.scale - this.floor
        : this.vTop;
    const rot = Math.abs(this.theta) > 0.002 ? ` rotate(${this.theta.toFixed(3)}rad)` : '';
    const tf = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)${rot}`;
    // schiacciato all'impatto, allungato un filo mentre sale veloce
    const sq = this.squash * 0.22;
    const stretch = this.state === 'air' && this.vy < -600 ? 0.08 : 0;
    const flip = `scale(${((this.facing < 0 ? -1 : 1) * (1 + sq - stretch)).toFixed(3)}, ${(1 - sq + stretch).toFixed(3)})`;
    const origin = `${this.pivotX.toFixed(0)}px ${this.pivotY.toFixed(0)}px`;
    if (pos !== this.written.pos) {
      this.written.pos = pos;
      const st = this.root.style;
      st.position = pos === 'page' ? 'absolute' : 'fixed';
      st.top = pos === 'floor' ? 'auto' : '0';
      st.bottom = pos === 'floor' ? `${this.statusH}px` : 'auto';
      this.written.tf = ''; // cambia il riferimento delle coordinate: riscrive la trasformazione
    }
    if (origin !== this.written.origin) this.root.style.transformOrigin = this.written.origin = origin;
    if (tf !== this.written.tf) this.root.style.transform = this.written.tf = tf;
    if (flip !== this.written.flip) this.canvas.style.transform = this.written.flip = flip;
  }
  drawn = '';

  /** cursore "mano" solo quando si è sopra di lui */
  hover(e: PointerEvent) {
    document.documentElement.classList.toggle('mini-hover', !this.drag && this.state !== 'hidden' && this.hit(e.clientX, e.clientY));
  }

  /**
   * Scritte e simboli che escono dal mini-me: zZ, stelline, note, fumetti, bolle con le icone…
   * `dx`/`dy` spostano il punto di partenza (pixel dello sprite, verso lo sguardo).
   */
  particle(text: string, kind: string, n = 1, opts: { img?: string; dx?: number; dy?: number } = {}) {
    const seated = SEATED.has(this.pose);
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.className = `mini-p ${kind}`;
      if (opts.img) {
        const im = document.createElement('img');
        im.src = opts.img;
        im.alt = '';
        p.append(im);
      } else p.textContent = text;
      p.style.setProperty('--i', String(i));
      const dx = opts.dx ?? 5;
      p.style.left = `${(W / 2 + this.facing * dx) * this.scale}px`;
      p.style.top = `${(opts.dy ?? (seated ? 10 : 4)) * this.scale}px`;
      this.root.append(p);
      if (kind === 'say') {
        // tiene il fumetto dentro lo schermo
        const r = p.getBoundingClientRect();
        const over = r.right > innerWidth - 8 ? innerWidth - 8 - r.right : r.left < 8 ? 8 - r.left : 0;
        if (over) p.style.marginLeft = `${over}px`;
      }
      setTimeout(() => p.remove(), kind === 'say' ? 2600 : 2200);
    }
  }
}

// --- avvio -------------------------------------------------------------------------------------

const mini = new Mini();

// arriva da solo pochi secondi dopo l'apertura di ogni pagina (su telefono entra, saluta e se ne va).
// Compare anche con "riduci movimento" attivo nel sistema: si spegne con "mini off" o da ctrl+k.
if (mini.enabled) setTimeout(() => mini.state === 'hidden' && mini.show(), rand(2000, 3000));
