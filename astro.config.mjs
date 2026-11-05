// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

import react from '@astrojs/react';

export default defineConfig({
  site: 'https://davide-modena.github.io',
  integrations: [mdx(), react()],
  i18n: {
    locales: ['it', 'en'],
    defaultLocale: 'it',
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    // i blocchi ```mermaid non si colorano come codice: li disegna src/scripts/mermaid.ts
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    shikiConfig: {
      themes: { dark: 'vitesse-dark', light: 'vitesse-light' },
      defaultColor: 'dark',
    },
  },
});