// Prepara le immagini del mockup Hevy per il telefono: il Nothing Phone (3) ritagliato nella parte alta
// (fotocamere + Glyph) e la texture del pavimento della palestra. Uso: node scripts/phone-mobile.mjs <cartella-foto>
//   <cartella>/2.webp = telefono nero (trasparente), 3.webp = telefono bianco (trasparente), 4.jpg = foto palestra
import sharp from 'sharp';
import { join } from 'node:path';

const src = process.argv[2];
if (!src) {
  console.error('Uso: node scripts/phone-mobile.mjs <cartella-foto>');
  process.exit(1);
}
const out = new URL('../src/assets/mockup/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

// riquadro del telefono nell'immagine originale, e quanto ne teniamo (la parte alta)
const phones = [
  { file: '2.webp', out: 'phone-m-dark.webp', box: { left: 586, top: 134, width: 832, height: 1078 } },
  { file: '3.webp', out: 'phone-m-light.webp', box: { left: 452, top: 219, width: 450, height: 584 } },
];
for (const p of phones) {
  await sharp(join(src, p.file)).extract(p.box).resize({ width: 720 }).webp({ quality: 88, alphaQuality: 100 }).toFile(join(out, p.out));
}
await sharp(join(src, '4.jpg')).extract({ left: 0, top: 40, width: 620, height: 500 }).resize({ width: 900 }).webp({ quality: 72 }).toFile(join(out, 'floor.webp'));
console.log('ok');
