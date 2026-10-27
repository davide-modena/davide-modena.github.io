// Visualizzatore delle immagini: un clic su uno screenshot o su un'immagine di un articolo la apre a tutto
// schermo, con frecce (o tastiera ← →) per scorrere le altre della pagina, e Esc / clic fuori per chiudere.
// Le immagini "grandi" stanno in data-full; altrimenti si usa quella già caricata.

const SEL = '.shots img, .brief-shots img, .prose > p > img, .prose > img, [data-zoom] img';

const imgs = [...document.querySelectorAll<HTMLImageElement>(SEL)].filter((i) => !i.closest('a'));

if (imgs.length) {
  const dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.innerHTML = `
    <button type="button" class="lb-x mono" aria-label="Chiudi">esc</button>
    <button type="button" class="lb-nav lb-prev" aria-label="Precedente">←</button>
    <figure><img alt="" /><figcaption class="mono"></figcaption></figure>
    <button type="button" class="lb-nav lb-next" aria-label="Successiva">→</button>`;
  document.body.append(dlg);
  const big = dlg.querySelector('img')!;
  const cap = dlg.querySelector('figcaption')!;
  const prev = dlg.querySelector<HTMLElement>('.lb-prev')!;
  const next = dlg.querySelector<HTMLElement>('.lb-next')!;
  let idx = 0;

  function show(i: number) {
    idx = (i + imgs.length) % imgs.length;
    const el = imgs[idx];
    big.src = el.dataset.full || el.currentSrc || el.src;
    big.alt = el.alt;
    const text = el.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || el.alt;
    cap.textContent = text;
    cap.hidden = !text;
    const single = imgs.length < 2;
    prev.hidden = next.hidden = single;
  }

  imgs.forEach((el, i) => {
    el.classList.add('zoomable');
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    const open = () => {
      show(i);
      dlg.showModal();
    };
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });

  dlg.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t === prev || t.closest('.lb-prev')) return show(idx - 1);
    if (t === next || t.closest('.lb-next')) return show(idx + 1);
    dlg.close(); // clic sull'immagine, sullo sfondo o su "esc"
  });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
  });
}
