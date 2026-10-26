// Disegna i blocchi ```mermaid degli articoli e delle pagine progetto.
// Mermaid è pesante: lo scarico solo nelle pagine che hanno almeno un diagramma, e lo ridisegno
// quando si cambia tema (colori presi dalle variabili CSS del sito).

const blocks = [...document.querySelectorAll<HTMLElement>('code.language-mermaid')].map((c) => c.closest('pre') ?? c);

if (blocks.length) {
  const figures = blocks.map((pre) => {
    const source = (pre.textContent ?? '').trim();
    const fig = document.createElement('figure');
    fig.className = 'mermaid-fig';
    fig.setAttribute('role', 'img');
    fig.dataset.source = source;
    pre.replaceWith(fig);
    return fig;
  });

  const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  let seq = 0;

  async function draw() {
    const { default: mermaid } = await import('mermaid');
    const dark = document.documentElement.dataset.theme !== 'light';
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      fontFamily: css('--mono') || 'ui-monospace, monospace',
      themeVariables: {
        darkMode: dark,
        background: 'transparent',
        primaryColor: css('--bg-2'),
        primaryBorderColor: css('--line-2'),
        primaryTextColor: css('--fg'),
        secondaryColor: css('--bg-3') || css('--bg-2'),
        tertiaryColor: css('--bg'),
        lineColor: css('--fg-3'),
        textColor: css('--fg-2'),
        noteBkgColor: css('--bg-2'),
        noteTextColor: css('--fg'),
        clusterBkg: 'transparent',
        clusterBorder: css('--line-2'),
        edgeLabelBackground: css('--bg'),
      },
    });
    for (const fig of figures) {
      try {
        const { svg } = await mermaid.render(`mmd-${++seq}`, fig.dataset.source!);
        fig.innerHTML = svg;
      } catch (e) {
        // sintassi sbagliata: mostro il testo così com'è invece di un riquadro vuoto
        fig.textContent = fig.dataset.source!;
        console.warn('mermaid:', e);
      }
    }
  }

  const io = new IntersectionObserver((e) => {
    if (e.some((x) => x.isIntersecting)) {
      io.disconnect();
      draw();
      // al cambio di tema si ridisegna
      new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
  }, { rootMargin: '300px' });
  figures.forEach((f) => io.observe(f));
}
