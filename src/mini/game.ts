// MINI FIGHTER — l'easter egg del mini-me.
//
// Parte scuotendo forte il mini-me (o col comando "fight" nel terminale). Si fanno punti
// lanciandolo in giro: tempo in volo, giri su se stesso, muri, soffitto, rimbalzi, atterraggi
// sulle card e soprattutto i bug da colpire. Se lo lasci stare per qualche secondo: K.O.
// Il modulo si carica solo quando parte il gioco.

import '@fontsource/press-start-2p';
import { H } from './sprite';
import type { Mini, FightHooks } from './mini';

const FONT = '"Press Start 2P", monospace';
const YELLOW = '#ffd23f';
const RED = '#e63946';
const INK = '#0b0b0b';
const REST_TIME = 4; // secondi da fermo prima del K.O.

type Pop = { x: number; y: number; text: string; color: string; life: number; size: number };
type Part = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number };
type Bug = { x: number; y: number; vx: number; phase: number; hue: string };

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

// bug in pixel art: 11×8, due fotogrammi per le zampe
const BUG = [
  [
    '..a.....a..',
    '...a...a...',
    '..bbbbbbb..',
    '.bbebbbebb.',
    'lbbbbbbbbbl',
    '.bbbbbbbbb.',
    'l.bbbbbbb.l',
    '.l.......l.',
  ],
  [
    '..a.....a..',
    '...a...a...',
    '..bbbbbbb..',
    '.bbebbbebb.',
    '.bbbbbbbbb.',
    'lbbbbbbbbbl',
    '.lbbbbbbbl.',
    'l.........l',
  ],
];

class Fight implements FightHooks {
  mini: Mini;
  root = document.createElement('div');
  canvas = document.createElement('canvas');
  ctx = this.canvas.getContext('2d')!;
  closeBtn = document.createElement('button');
  soundBtn = document.createElement('button');
  hint = document.createElement('p');

  phase: 'intro' | 'play' | 'ko' = 'intro';
  t = 0;
  phaseT = 0;
  score = 0;
  shown = 0;
  best = Number(store.get('fight-best') ?? 0);
  combo = 1;
  energy = 1;
  airT = 0;
  airPts = 0;
  spin = 0;
  lastTheta = 0;
  bugs: Bug[] = [];
  bugTimer = 1.2;
  pops: Pop[] = [];
  parts: Part[] = [];
  shake = 0;
  flash = 0;
  record = false;
  lastPlatform = 0;

  sound = store.get('fight-sound') === 'on';
  audio: AudioContext | null = null;

  w = 0;
  h = 0;
  dpr = Math.min(devicePixelRatio || 1, 2);
  k = 1; // scala dell'interfaccia (più piccola su telefono)
  raf = 0;
  last = performance.now();
  lang = document.documentElement.lang === 'en' ? 'en' : 'it';
  prevOverflow = '';

  constructor(mini: Mini) {
    this.mini = mini;
    this.root.className = 'fight';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-label', 'Mini Fighter');
    this.closeBtn.className = 'fight-btn fight-close';
    this.closeBtn.textContent = '✕';
    this.closeBtn.setAttribute('aria-label', this.lang === 'it' ? 'Esci dal gioco' : 'Quit game');
    this.soundBtn.className = 'fight-btn fight-sound';
    this.hint.className = 'fight-hint';
    this.hint.textContent = this.lang === 'it' ? 'lancialo in giro · colpisci i bug' : 'throw him around · hit the bugs';
    this.updateSoundBtn();
    this.root.append(this.canvas, this.hint, this.soundBtn, this.closeBtn);
    document.body.append(this.root);

    this.closeBtn.addEventListener('click', () => this.end());
    // niente selezione del testo della pagina trascinando sull'overlay
    this.root.addEventListener('pointerdown', (e) => {
      if (e.target === this.root || e.target === this.canvas) e.preventDefault();
    });
    this.soundBtn.addEventListener('click', () => {
      this.sound = !this.sound;
      store.set('fight-sound', this.sound ? 'on' : 'off');
      this.updateSoundBtn();
      if (this.sound) this.sfx('combo');
    });
    addEventListener('resize', this.resize);
    addEventListener('keydown', this.onKey);
    this.resize();
  }

  // --- ciclo ----------------------------------------------------------------------------------

  start() {
    this.prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.classList.add('fighting');
    getSelection()?.removeAllRanges();
    this.mini.root.classList.add('fighting');
    this.mini.game = this;
    this.sfx('fight');
    const loop = (now: number) => {
      const dt = Math.min((now - this.last) / 1000, 0.05);
      this.last = now;
      this.update(dt);
      this.draw();
      if (this.raf) this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  end() {
    if (!this.raf) return;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    removeEventListener('resize', this.resize);
    removeEventListener('keydown', this.onKey);
    document.documentElement.style.overflow = this.prevOverflow;
    document.documentElement.classList.remove('fighting');
    this.root.classList.add('out');
    setTimeout(() => this.root.remove(), 300);
    this.mini.endFight();
    active = null;
  }

  resize = () => {
    this.w = innerWidth;
    this.h = innerHeight;
    this.canvas.width = this.w * this.dpr;
    this.canvas.height = this.h * this.dpr;
    this.k = Math.min(Math.max(this.w / 900, 0.55), 1);
  };

  onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.end();
    }
  };

  update(dt: number) {
    this.t += dt;
    this.phaseT += dt;
    const m = this.mini;
    const moving = m.state === 'held' || m.state === 'air';

    if (this.phase === 'intro' && this.phaseT > 1.5) this.setPhase('play');

    if (this.phase === 'play') {
      // la barra "adrenalina": piena mentre giochi, si svuota se lo lasci stare
      if (moving) this.energy = Math.min(1, this.energy + dt * 3);
      else this.energy -= dt / REST_TIME;
      if (this.energy < 0.6) this.combo = 1;
      if (this.energy <= 0) {
        this.energy = 0;
        this.setPhase('ko');
      }

      // tempo in volo
      if (m.state === 'air' && m.tumbling) {
        this.airT += dt;
        this.airPts += dt;
        if (this.airPts > 0.25) {
          this.airPts = 0;
          this.add(10);
        }
        if (this.airT > 1.4 && this.airT - dt <= 1.4) this.pop(m.x, this.miniTop() - 20, 'AIR TIME!', YELLOW, 1, 250);
        // giri su se stesso
        this.spin += Math.abs(m.theta - this.lastTheta);
        if (this.spin > Math.PI * 2) {
          this.spin -= Math.PI * 2;
          this.pop(m.x, this.miniTop(), 'SPIN!', '#7ae7ff', 1, 200);
          this.bumpCombo();
          this.sfx('combo');
        }
      } else {
        this.airT = 0;
        this.spin = 0;
      }
      this.lastTheta = m.theta;

      // bug
      this.bugTimer -= dt;
      if (this.bugTimer <= 0 && this.bugs.length < 4) {
        this.bugTimer = rand(1.4, 2.6);
        const left = Math.random() < 0.5;
        this.bugs.push({
          x: left ? -30 : this.w + 30,
          y: rand(this.h * 0.18, this.h * 0.72),
          vx: (left ? 1 : -1) * rand(50, 130),
          phase: rand(0, 6),
          hue: Math.random() < 0.25 ? RED : '#72e06a',
        });
      }
    }

    // i bug volano e si possono colpire anche nell'intro (senza punti)
    const cx = m.x;
    const cy = m.y - (H * m.scale) / 2;
    const reach = 16 + H * m.scale * 0.32;
    for (const b of this.bugs) {
      b.x += b.vx * dt;
      b.phase += dt * 3;
      const by = b.y + Math.sin(b.phase) * 18;
      if (this.phase === 'play' && Math.hypot(b.x - cx, by - cy) < reach) {
        this.explode(b.x, by, b.hue);
        b.x = -9999; // fuori dallo schermo: il filtro sotto lo toglie
        this.pop(cx, by - 10, 'BUG FIXED!', '#72e06a', 1.2, 500);
        this.bumpCombo();
        this.shake = Math.max(this.shake, 8);
        this.sfx('bug');
        this.vibrate(40);
      }
    }
    this.bugs = this.bugs.filter((b) => b.x > -60 && b.x < this.w + 60);

    for (const p of this.parts) {
      p.vy += 900 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    this.parts = this.parts.filter((p) => p.life > 0);
    for (const p of this.pops) {
      p.y -= 40 * dt;
      p.life -= dt;
    }
    this.pops = this.pops.filter((p) => p.life > 0);

    this.shown += (this.score - this.shown) * Math.min(1, dt * 10);
    this.shake = Math.max(0, this.shake - dt * 30);
    this.flash = Math.max(0, this.flash - dt * 3);

    if (this.phase === 'ko' && this.phaseT > 3.4) this.end();
  }

  setPhase(p: Fight['phase']) {
    this.phase = p;
    this.phaseT = 0;
    if (p === 'play') {
      this.flash = 0.6;
      this.hint.classList.add('show');
      setTimeout(() => this.hint.classList.remove('show'), 3500);
    }
    if (p === 'ko') {
      this.flash = 1;
      this.shake = 14;
      this.bugs = [];
      this.sfx('ko');
      this.vibrate([60, 40, 120]);
      if (this.score > this.best) {
        this.best = this.score;
        this.record = this.score > 0;
        store.set('fight-best', String(this.score));
      }
    }
  }

  // --- punti ----------------------------------------------------------------------------------

  onEvent: FightHooks['onEvent'] = (type, value = 0) => {
    if (this.phase === 'ko') return;
    const m = this.mini;
    if (type === 'grab') this.energy = 1;
    if (this.phase !== 'play') return;
    switch (type) {
      case 'throw':
        if (value > 1800) this.pop(m.x, this.miniTop() - 10, 'YEET!', '#ff9f1c', 0.8, 0);
        break;
      case 'wall':
        this.pop(m.x, m.y - 40, 'WALL BOUNCE!', YELLOW, 1, 100);
        this.bumpCombo();
        this.hit(value);
        break;
      case 'ceiling':
        this.pop(m.x, this.miniTop() + 40, 'HEADBUTT!', RED, 1, 150);
        this.bumpCombo();
        this.hit(value);
        break;
      case 'bounce':
        this.pop(m.x, m.y - 30, 'BOUNCE!', '#ffffff', 0.7, 50);
        this.dust(m.x, m.y);
        this.hit(value);
        break;
      case 'platform':
        // un atterraggio con rimbalzi manda più eventi: conta solo il primo
        if (this.t - this.lastPlatform < 1.5) break;
        this.lastPlatform = this.t;
        this.pop(m.x, m.y - 50, 'STICK THE LANDING!', '#7ae7ff', 1.2, 300);
        this.bumpCombo();
        this.hit(value);
        break;
      case 'land':
        this.dust(m.x, m.y);
        break;
    }
  };

  add(points: number) {
    this.score += Math.round(points * this.combo);
  }

  pop(x: number, y: number, text: string, color: string, size: number, points: number) {
    if (points) {
      this.add(points);
      text += ` +${Math.round(points * this.combo)}`;
    }
    this.pops.push({ x, y, text, color, life: 1.1, size });
  }

  bumpCombo() {
    this.combo = Math.min(9, this.combo + 1);
    this.energy = 1;
  }

  hit(force: number) {
    this.shake = Math.max(this.shake, Math.min(12, force / 150));
    this.sfx('hit');
    this.vibrate(Math.min(50, force / 40));
  }

  miniTop() {
    return this.mini.y - H * this.mini.scale;
  }

  explode(x: number, y: number, color: string) {
    for (let i = 0; i < 16; i++) {
      const a = rand(0, Math.PI * 2);
      const v = rand(150, 420);
      this.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 200, life: rand(0.5, 0.9), color: i % 3 ? color : '#ffffff', size: rand(3, 7) });
    }
  }

  dust(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      this.parts.push({ x: x + rand(-20, 20), y, vx: rand(-160, 160), vy: rand(-260, -80), life: rand(0.3, 0.5), color: '#bdbdbd', size: rand(3, 5) });
    }
  }

  vibrate(pattern: number | number[]) {
    if (this.mini.compact) navigator.vibrate?.(pattern);
  }

  // --- suoni 8-bit (spenti di default) --------------------------------------------------------

  updateSoundBtn() {
    this.soundBtn.textContent = this.sound ? '♪ ON' : '♪ OFF';
    this.soundBtn.setAttribute('aria-pressed', String(this.sound));
    this.soundBtn.setAttribute('aria-label', this.lang === 'it' ? 'Suoni' : 'Sound');
  }

  tone(freq: number, dur: number, type: OscillatorType, vol = 0.06, to?: number, delay = 0) {
    if (!this.sound) return;
    this.audio ??= new AudioContext();
    const a = this.audio;
    const t0 = a.currentTime + delay;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(a.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  sfx(name: 'hit' | 'bug' | 'fight' | 'ko' | 'combo') {
    switch (name) {
      case 'hit':
        return this.tone(160, 0.12, 'square', 0.07, 60);
      case 'bug':
        [660, 880, 1320].forEach((f, i) => this.tone(f, 0.09, 'square', 0.05, undefined, i * 0.06));
        return;
      case 'combo':
        return this.tone(990, 0.07, 'square', 0.04);
      case 'fight':
        return this.tone(180, 0.5, 'sawtooth', 0.06, 900);
      case 'ko':
        return this.tone(520, 0.8, 'square', 0.07, 70);
    }
  }

  // --- disegno --------------------------------------------------------------------------------

  text(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center') {
    const c = this.ctx;
    c.font = `${Math.round(size)}px ${FONT}`;
    c.textAlign = align;
    c.textBaseline = 'middle';
    c.lineJoin = 'round';
    c.lineWidth = Math.max(4, size / 4);
    c.strokeStyle = INK;
    c.strokeText(str, x, y);
    c.fillStyle = color;
    c.fillText(str, x, y);
  }

  /** scritta grande stile arcade: ombra rossa sfalsata sotto il giallo */
  bigText(str: string, y: number, size: number, scale = 1) {
    const c = this.ctx;
    c.save();
    c.translate(this.w / 2, y);
    c.scale(scale, scale);
    this.text(str, size * 0.08, size * 0.08, size, RED);
    this.text(str, 0, 0, size, YELLOW);
    c.restore();
  }

  drawBug(b: Bug) {
    const c = this.ctx;
    const px = Math.round(4 * this.k) || 2;
    const frame = BUG[Math.floor(b.phase * 2) % 2];
    const y = b.y + Math.sin(b.phase) * 18;
    const ox = b.x - (11 * px) / 2;
    const oy = y - (8 * px) / 2;
    const flip = b.vx < 0;
    frame.forEach((row, j) =>
      [...row].forEach((ch, i) => {
        if (ch === '.') return;
        c.fillStyle = ch === 'e' ? INK : ch === 'b' ? b.hue : '#d9d9d9';
        const xi = flip ? 10 - i : i;
        c.fillRect(Math.round(ox + xi * px), Math.round(oy + j * px), px, px);
      }),
    );
  }

  draw() {
    const c = this.ctx;
    const { w, h, k } = this;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    c.imageSmoothingEnabled = false;
    if (this.shake) c.translate(rand(-this.shake, this.shake), rand(-this.shake, this.shake));

    for (const b of this.bugs) this.drawBug(b);
    for (const p of this.parts) {
      c.globalAlpha = Math.min(1, p.life * 2);
      c.fillStyle = p.color;
      c.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    c.globalAlpha = 1;
    for (const p of this.pops) {
      c.globalAlpha = Math.min(1, p.life * 2.5);
      // resta dentro lo schermo anche vicino ai bordi
      const size = 14 * k * p.size;
      c.font = `${Math.round(size)}px ${FONT}`;
      const half = c.measureText(p.text).width / 2 + 8;
      const x = Math.min(Math.max(p.x, half), w - half);
      const y = Math.min(Math.max(p.y, 120 * k), h - 60);
      this.text(p.text, x, y, size, p.color);
    }
    c.globalAlpha = 1;

    // --- interfaccia in alto: barra adrenalina a sinistra, punti a destra, combo al centro
    const top = 28 * k + 10;
    const barW = Math.min(w * 0.4, 380);
    const barH = Math.round(16 * k);
    const pad = 20;
    this.text('DAVIDE', pad, top - 4, 12 * k, '#ffffff', 'left');
    c.fillStyle = '#ffffff';
    c.fillRect(pad - 3, top + 10 * k - 3, barW + 6, barH + 6);
    c.fillStyle = '#7a0010';
    c.fillRect(pad, top + 10 * k, barW, barH);
    c.fillStyle = this.energy < 0.35 && Math.floor(this.t * 8) % 2 ? '#ffffff' : YELLOW;
    c.fillRect(pad, top + 10 * k, barW * Math.max(0, this.energy), barH);
    this.text('SCORE', w - pad, top - 4, 12 * k, '#ffffff', 'right');
    this.text(String(Math.round(this.shown)).padStart(6, '0'), w - pad, top + 10 * k + barH / 2, 18 * k, YELLOW, 'right');
    this.text(`BEST ${String(this.best).padStart(6, '0')}`, w - pad, top + 32 * k + barH, 9 * k, '#bdbdbd', 'right');
    if (this.combo > 1) {
      const pulse = 1 + Math.max(0, 0.25 - (this.t % 0.5)) * 0.8;
      // su schermi stretti la combo va sotto la barra, altrimenti ci finisce sopra
      const narrow = w < 640;
      const cx = narrow ? pad + 34 * k : w / 2;
      const cy = narrow ? top + barH + 40 * k : top + 8 * k;
      c.save();
      c.translate(cx, cy);
      c.scale(pulse, pulse);
      this.text(`x${this.combo}`, 0, 0, 30 * k, YELLOW);
      c.restore();
      this.text('COMBO', cx, cy + 28 * k, 10 * k, '#ffffff');
    }

    // --- scritte grandi
    const size = 64 * k;
    if (this.phase === 'intro') {
      if (this.phaseT < 0.8) this.bigText('ROUND 1', h * 0.42, size * 0.7, 0.6 + Math.min(1, this.phaseT * 3) * 0.4);
      else this.bigText('FIGHT!', h * 0.42, size, 1 + Math.max(0, 1 - (this.phaseT - 0.8) * 6) * 0.6);
    }
    if (this.phase === 'ko') {
      this.bigText('K.O.', h * 0.34, size * 1.3, 1 + Math.max(0, 1 - this.phaseT * 5) * 0.8);
      if (this.phaseT > 0.8) {
        this.text(`SCORE ${this.score}`, w / 2, h * 0.34 + size * 1.1, 20 * k, '#ffffff');
        this.text(`BEST ${this.best}`, w / 2, h * 0.34 + size * 1.1 + 34 * k, 12 * k, '#bdbdbd');
        if (this.record && Math.floor(this.phaseT * 4) % 2) this.text('NEW RECORD!', w / 2, h * 0.34 + size * 1.1 + 70 * k, 16 * k, YELLOW);
      }
    }

    if (this.flash) {
      c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      c.fillStyle = `rgba(255,255,255,${(this.flash * 0.6).toFixed(3)})`;
      c.fillRect(0, 0, w, h);
    }
  }
}

let active: Fight | null = null;

export async function startFight(mini: Mini) {
  if (active) return;
  // il font serve prima di disegnare la prima scritta
  try {
    await document.fonts.load(`32px ${FONT}`);
  } catch {}
  active = new Fight(mini);
  active.start();
}
