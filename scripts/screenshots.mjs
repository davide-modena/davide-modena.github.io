// Screenshot a pagina intera dei siti in "lavori", per i mockup (computer e telefono).
// Usa Edge già installato (niente download di browser): npm run shots
import { chromium } from 'playwright-core';
import sharp from 'sharp';

const SITES = {
  arcreate: 'https://arcreate.it',
  uvaedintorni: 'https://uvaedintorni.com',
  trentinoingegneria: 'https://trentinoingegneria.it',
  yammiramen: 'https://www.yammiramen.it',
};
const only = process.argv.slice(2);

const DEVICES = [
  // computer: 1440 di larghezza, salvato a 1200
  { suffix: '', viewport: { width: 1440, height: 900 }, scale: 1, out: 1200, maxH: 7000, mobile: false },
  // telefono: 390 css px a 2x, salvato a 600
  { suffix: '-mobile', viewport: { width: 390, height: 844 }, scale: 2, out: 600, maxH: 7800, mobile: true },
];

const browser = await chromium.launch({ channel: 'msedge' });

for (const dev of DEVICES) {
  const page = await browser.newPage({ viewport: dev.viewport, deviceScaleFactor: dev.scale, isMobile: dev.mobile, hasTouch: dev.mobile });
  for (const [name, url] of Object.entries(SITES)) {
    if (only.length && !only.includes(name)) continue;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      // banner cookie: si rifiuta, così non finisce nello screenshot
      const reject = page.getByRole('button', { name: /no,? grazie|rifiut|reject|decline|solo necessari/i }).first();
      if (await reject.isVisible().catch(() => false)) await reject.click().catch(() => {});
      // immagini lazy: le carico subito, così non restano vuote nello scatto
      await page.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach((i) => (i.loading = 'eager')));
      // scorre tutta la pagina per far partire lazy-load e animazioni on-scroll
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
        window.scrollTo(0, 0);
      });
      // elementi che compaiono allo scorrimento (data-reveal): li mostro tutti
      await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in')));
      await page.waitForTimeout(1500);
      // una pagina più alta di ~16000 px (in pixel reali) farebbe ripetere il contenuto: scatto solo la parte alta
      const pageH = await page.evaluate(() => document.documentElement.scrollHeight);
      const png = await page.screenshot({ fullPage: true, clip: { x: 0, y: 0, width: dev.viewport.width, height: Math.min(pageH, dev.maxH) } });
      const img = sharp(png);
      await img
        .resize(dev.out)
        .webp({ quality: 78 })
        .toFile(`src/assets/shots/${name}${dev.suffix}.webp`);
      console.log('ok', name + dev.suffix, pageH);
    } catch (e) {
      console.error('errore', name + dev.suffix, e.message);
    }
  }
  await page.close();
}
await browser.close();
