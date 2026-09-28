// Il mini-me: vive sulla barra di stato in fondo alla pagina, ogni tanto salta su card e mockup,
// si può prendere e lanciare col mouse. Arriva da solo poco dopo l'apertura della pagina.
//
// Posizione: sul pavimento (la barra di stato) e in volo è "fixed", in coordinate dello schermo.
// Quando sta sopra una card diventa "absolute", in coordinate della pagina: così scorre insieme
// alla card nello stesso istante, invece di inseguirla un fotogramma dopo.
//
// Comandi (dal terminale, via evento "mini"): summon, sleep, on, off, size s|m|l.

import { render, W, H, SIT_ROW, SEATED, type Theme } from './sprite';

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
  | 'held';

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

class Mini {
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
  /** bordo alto dello sprite sullo schermo, e ultimi stili scritti (si riscrivono solo se cambiano) */
  vTop = 0;
  /** sopra una card: posizione in coordinate della pagina, e timer del controllo della card */
  pageY = 0;
  platCheck = 0;
  written = { pos: '', tf: '', flip: '' };

  constructor() {
    this.root.className = 'mini';
    this.root.setAttribute('aria-hidden', 'true');
    this.canvas.width = W;
    this.canvas.height = H;
    this.root.append(this.canvas);
    document.body.append(this.root);
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
    addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: true });
    document.addEventListener('pointerover', (e) => this.onPointerOver(e));
    document.addEventListener('pointerdown', (e) => this.onGrab(e), true);
    addEventListener('pointerup', (e) => this.onRelease(e));
    addEventListener('mini', (e) => this.command((e as CustomEvent<string>).detail));
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.last = performance.now();
    });
  }

  // --- geometria ------------------------------------------------------------------------------

  get half() {
    return (W * this.scale) / 2;
  }
  measure() {
    this.floor = innerHeight - (document.querySelector<HTMLElement>('.statusbar')?.offsetHeight ?? 28);
    this.headerH = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 64;
  }
  /** piattaforme visibili e raggiungibili */
  platforms() {
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
        if (this.x < this.half || this.x > innerWidth - this.half) {
          this.x = clamp(this.x, this.half, innerWidth - this.half);
          this.set('idle');
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
        this.pose = this.vy < 0 ? 'jump' : 'fall';
        // soffitto sotto l'header: se lo lanci forte verso l'alto ci sbatte e ricade
        const ceiling = this.headerH + H * this.scale;
        if (this.y < ceiling && this.vy < 0) {
          this.y = ceiling;
          this.vy *= -0.35;
          this.particle('✦', 'stars', 2);
        }
        // rimbalzo sui bordi dello schermo
        if (this.x < this.half || this.x > innerWidth - this.half) {
          this.x = clamp(this.x, this.half, innerWidth - this.half);
          this.vx *= -0.55;
          this.facing = Math.sign(this.vx) || this.facing;
        }
        if (this.vy > 0) {
          // atterraggio su una piattaforma incrociata scendendo
          for (const el of this.target ? [this.target] : this.platforms()) {
            const r = el.getBoundingClientRect();
            if (prevY <= r.top + 2 && this.y >= r.top && this.x > r.left + 6 && this.x < r.right - 6) {
              return this.landOn('platform', el, r.top);
            }
          }
          if (this.y >= floor) this.landOn('floor', null, floor);
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
          if (this.compact) this.leave();
          else this.set('idle');
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
      case 'held':
        this.pose = 'held';
        break;
      case 'idle':
        this.pose = 'idle';
        this.idle();
        break;
    }

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
    if (!this.duration) this.duration = rand(4, 9);
    if (this.t < this.duration) return;
    const now = performance.now();
    if (now - this.active > 25000) return this.set('sleep');
    const visibleFor = (now - this.shownAt) / 1000;
    const r = Math.random();
    if (visibleFor > 90 && r < 0.12) return this.leave();
    if (r < 0.55) {
      const plats = this.platforms();
      if (plats.length) return this.jumpTo(plats[(Math.random() * plats.length) | 0]);
    }
    if (r < 0.8) return this.walkTo(clamp(this.x + rand(-350, 350), this.half + 20, innerWidth - this.half - 20));
    if (this.on === 'floor') return this.set('sit', rand(6, 10));
    this.set('idle', rand(2, 4));
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
    if (this.compact) return;
    // si prende una pausa e poi torna
    setTimeout(() => {
      if (this.state === 'hidden' && this.enabled) this.show();
    }, rand(20, 40) * 1000);
  }

  leave() {
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
    this.on = 'air';
    this.platform = null;
    this.target = null;
    this.vx = 0;
    this.vy = 0;
    this.set('air');
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
    this.set('land');
  }

  // --- interazione ----------------------------------------------------------------------------

  onScroll() {
    const now = performance.now();
    const v = ((scrollY - this.scrollY) / Math.max(now - this.scrollT, 1)) * 1000;
    this.scrollY = scrollY;
    this.scrollT = now;
    this.scrollStop = now;
    this.active = now;
    if (this.state === 'sleep') return this.wake();
    if (this.on !== 'floor' || !['idle', 'walk', 'scrollrun'].includes(this.state)) return;
    if (Math.abs(v) < 700) return;
    this.vx = Math.sign(v) * Math.min(Math.abs(v) * 0.22, 420);
    this.facing = Math.sign(v);
    if (this.state !== 'scrollrun') this.set('scrollrun');
  }

  onPointerMove(e: PointerEvent) {
    this.active = performance.now();
    if (e.pointerType === 'mouse') this.hover(e);
    if (this.drag) {
      const now = performance.now();
      this.drag.samples.push([e.clientX, e.clientY, now]);
      while (this.drag.samples.length > 2 && now - this.drag.samples[0][2] > 90) this.drag.samples.shift();
      this.x = e.clientX + this.drag.dx;
      this.y = e.clientY + this.drag.dy;
      return;
    }
    if (this.state === 'sleep' && Math.hypot(e.clientX - this.x, e.clientY - (this.y - 40)) < 110) this.wake();
  }

  onPointerOver(e: PointerEvent) {
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

  onGrab(e: PointerEvent) {
    if (e.pointerType !== 'mouse' || e.button !== 0 || this.state === 'hidden' || !this.hit(e.clientX, e.clientY)) return;
    e.preventDefault();
    e.stopPropagation();
    this.drag = { dx: this.x - e.clientX, dy: this.y - e.clientY, samples: [[e.clientX, e.clientY, performance.now()]] };
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
    this.drag = null;
    this.root.classList.remove('grabbed');
    document.documentElement.classList.remove('mini-grabbing');
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

  command(cmd: string) {
    const [name, arg] = cmd.split(' ');
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
    const speeds: Record<string, number> = { run: 0.075, idle: 0.6, wave: 0.22, sit: 1.4, sleep: 1, dizzy: 0.16, held: 0.18 };
    this.frameT += 1 / 60;
    if (this.frameT > (speeds[this.pose] ?? 0.2)) {
      this.frameT = 0;
      this.frame++;
      force = true;
    }
    let pose = this.pose;
    if (this.blinking > 0 && (pose === 'idle' || pose === 'point')) pose = 'blink';
    const theme: Theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    const key = `${theme}:${pose}:${this.frame % 6}`;
    if (force || key !== this.drawn) {
      let img = this.cache.get(key);
      if (!img) {
        img = new ImageData(render(pose, this.frame % 6, theme) as unknown as Uint8ClampedArray<ArrayBuffer>, W, H);
        this.cache.set(key, img);
      }
      this.ctx.putImageData(img, 0, 0);
      this.drawn = key;
    }
    const seated = SEATED.has(this.pose);
    const left = this.x - this.half;
    this.vTop = this.y - (seated ? SIT_ROW : H) * this.scale;
    // sopra una card: coordinate della pagina, così scorre insieme alla card senza ritardi
    const onPage = this.on === 'platform' && this.state !== 'held';
    const pos = onPage ? 'absolute' : 'fixed';
    const top = onPage ? this.pageY - (seated ? SIT_ROW : H) * this.scale : this.vTop;
    const tf = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
    const flip = this.facing < 0 ? 'scaleX(-1)' : '';
    if (pos !== this.written.pos) this.root.style.position = this.written.pos = pos;
    if (tf !== this.written.tf) this.root.style.transform = this.written.tf = tf;
    if (flip !== this.written.flip) this.canvas.style.transform = this.written.flip = flip;
  }
  drawn = '';

  /** cursore "mano" solo quando si è sopra di lui */
  hover(e: PointerEvent) {
    document.documentElement.classList.toggle('mini-hover', !this.drag && this.state !== 'hidden' && this.hit(e.clientX, e.clientY));
  }

  /** scritte che volano via dalla testa: zZ, stelline, punto esclamativo */
  particle(text: string, kind: string, n = 1) {
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.className = `mini-p ${kind}`;
      p.textContent = text;
      p.style.setProperty('--i', String(i));
      p.style.left = `${(W / 2 + this.facing * 5) * this.scale}px`;
      p.style.top = `${(SEATED.has(this.pose) ? 10 : 4) * this.scale}px`;
      this.root.append(p);
      setTimeout(() => p.remove(), 2200);
    }
  }
}

// --- avvio -------------------------------------------------------------------------------------

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mini = new Mini();

// arriva da solo pochi secondi dopo l'apertura di ogni pagina
// (su telefono entra, saluta e se ne va)
if (mini.enabled && !reduced) setTimeout(() => mini.state === 'hidden' && mini.show(), rand(2000, 3000));
