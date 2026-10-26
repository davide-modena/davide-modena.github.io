// Nelle pagine dei progetti la sezione "Cosa sa fare" è una serie di titoli (###) con una o due frasi sotto:
// qui diventano schede. Ogni titolo col suo testo finisce in un <div class="card">, tutte in un <div class="cards">
// (la griglia è in global.css). Se la sezione non è fatta così, non tocco nulla.

const SECTION = /^(cosa sa fare|what it does)$/i;

document.querySelectorAll<HTMLElement>('.prose').forEach((prose) => {
  const h2 = [...prose.children].find((el) => el.tagName === 'H2' && SECTION.test((el.textContent ?? '').trim()));
  if (!h2) return;
  const body: Element[] = [];
  for (let el = h2.nextElementSibling; el && el.tagName !== 'H2'; el = el.nextElementSibling) body.push(el);
  if (!body.length || body[0].tagName !== 'H3') return;

  const grid = document.createElement('div');
  grid.className = 'cards';
  let card: HTMLElement | null = null;
  for (const el of body) {
    if (el.tagName === 'H3') {
      card = document.createElement('div');
      card.className = 'card';
      grid.append(card);
    }
    card!.append(el);
  }
  h2.after(grid);
});
