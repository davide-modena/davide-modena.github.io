# davide-modena / portfolio

Portfolio personale. [Astro](https://astro.build) + MDX, statico, pubblicato su Netlify.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output in dist/
```

## Contenuti

| Cosa | Dove |
|---|---|
| Testi dell'interfaccia (it/en) | `src/i18n/ui.ts` |
| Esperienze, competenze, lingue, contatti | `src/data/profile.ts` |
| Siti web (case study) | `src/content/works/<lingua>/<slug>.mdx` |
| Progetti del Lab | `src/content/lab/<lingua>/<slug>.mdx` |

Una voce che esiste solo in `it/` viene mostrata anche nella versione inglese, con un avviso.
La nota sull'AI del Lab è una frase unica nell'intro (`lab.index.ai` in `ui.ts`); `ai: true` nel frontmatter
la aggiunge anche a un singolo progetto.

## Form contatti

`/contatti/` usa [Netlify Forms](https://docs.netlify.com/forms/setup/): dopo il primo deploy va attivato
*Form detection* nelle impostazioni del sito su Netlify. In locale l'invio non funziona (e il form lo dice).

## Immagini

- `npm run shots` — rifà gli screenshot a pagina intera (computer e telefono) dei siti in `src/assets/shots/`
  (usa Edge già installato). Lo showcase li fa scorrere dentro i mockup mentre si scorre la pagina.
  `npm run shots -- arcreate` per rifarne uno solo.
- `npm run photo` — rigenera da `src/assets/davide.png` la foto in bianco e nero.

## Easter egg

`ctrl k` cerca ovunque · `` ` `` apre il terminale · `j` `k` scorrono i progetti · `g` + `h/w/l/a/c` naviga · `t` tema · `?` scorciatoie.
Nel terminale `accent violet|blue|azure|orange` cambia il colore d'accento (resta salvato nel browser).
