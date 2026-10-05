// npm run new "Titolo dell'articolo" [--en]
// Crea src/content/blog/<slug>.md dal modello _template.md, già con titolo e data di oggi.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const en = args.includes('--en');
const title = args.filter((a) => !a.startsWith('--')).join(' ').trim();

if (!title) {
  console.error('Uso: npm run new "Titolo dell\'articolo"   (aggiungi -- --en per un articolo in inglese)');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const d = new Date();
const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const file = join(root, 'src', 'content', 'blog', `${slug}.md`);
if (existsSync(file)) {
  console.error(`Esiste già: src/content/blog/${slug}.md`);
  process.exit(1);
}

const text = readFileSync(join(root, 'src', 'content', 'blog', '_template.md'), 'utf8')
  .replaceAll('{{title}}', title.replaceAll('"', '\\"'))
  .replaceAll('{{date}}', date)
  .replaceAll('{{lang}}', en ? 'en' : 'it');
writeFileSync(file, text);

console.log(`\nCreato: src/content/blog/${slug}.md`);
console.log('Aprilo, scrivi, e guardalo con `npm run dev` su http://localhost:4321/blog/' + slug + '/');
console.log('Per pubblicarlo: draft: false, poi commit e push.\n');
