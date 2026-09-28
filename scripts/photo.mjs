// Genera da src/assets/davide.png la versione in bianco e nero (davide-bw.webp),
// con contrasto un po' più deciso e una vignettatura leggera.
import sharp from 'sharp';

const SRC = 'src/assets/davide.png';
const OUT = 'src/assets';

const clamp = (v) => Math.min(1, Math.max(0, v));

async function load(size) {
  const { data, info } = await sharp(SRC).resize(size, size).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  const mask = new Float32Array(n); // 1 = soggetto, 0 = sfondo
  for (let i = 0; i < n; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    // muro: blu ~25 sopra il rosso e luminosità media; la polo è più chiara e quasi neutra
    const blue = clamp((b - r - 15) / 7);
    const mid = clamp((180 - lum) / 12);
    mask[i] = 1 - blue * mid;
  }
  // un paio di passate di sfocatura per ammorbidire il bordo
  const w = info.width, h = info.height;
  for (let pass = 0; pass < 2; pass++) {
    const m = mask.slice();
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      let s = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += m[(y + dy) * w + x + dx];
      mask[y * w + x] = s / 9;
    }
  }
  const gray = new Float32Array(n);
  for (let i = 0; i < n; i++) gray[i] = 0.299 * data[i * 3] + 0.587 * data[i * 3 + 1] + 0.114 * data[i * 3 + 2];
  return { w, h, gray, mask };
}

// --- bianco e nero ---
{
  const { w, h, gray } = await load(900);
  const out = Buffer.alloc(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    // contrasto un po' più deciso e vignettatura leggera ai bordi
    const vig = 1 - 0.35 * Math.min(1, Math.hypot(x / w - 0.5, y / h - 0.42) * 1.5) ** 2;
    out[i] = Math.min(255, Math.max(0, ((gray[i] - 128) * 1.25 + 118) * vig));
  }
  await sharp(out, { raw: { width: w, height: h, channels: 1 } }).webp({ quality: 82 }).toFile(`${OUT}/davide-bw.webp`);
}

console.log('ok');
