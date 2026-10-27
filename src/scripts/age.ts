// Aggiorna l'età mostrata nelle pagine con il calcolo di oggi (vedi src/lib/age.ts).
import { age } from '../lib/age';

document.querySelectorAll<HTMLElement>('[data-age]').forEach((el) => {
  const node = el.firstChild;
  if (node?.nodeType === Node.TEXT_NODE) node.textContent = String(age());
});
