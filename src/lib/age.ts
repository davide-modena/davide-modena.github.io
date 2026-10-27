// L'età si calcola ogni volta dalla data di nascita: nelle pagine si aggiorna da sola (src/scripts/age.ts),
// anche se il sito non viene ripubblicato nel giorno del compleanno.
export const BIRTHDAY = new Date('2005-07-11');

export function age(now = new Date()): number {
  let a = now.getFullYear() - BIRTHDAY.getFullYear();
  const m = now.getMonth() - BIRTHDAY.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < BIRTHDAY.getDate())) a--;
  return a;
}

/** Il numero con, al passaggio del mouse, il calcolo che lo produce (in inglese, come si scriverebbe nel codice). */
export function ageHtml(now = new Date()): string {
  return `<span class="age" data-age tabindex="0">${age(now)}<span class="age-tip mono" role="tooltip">currentYear - birthYear</span></span>`;
}
