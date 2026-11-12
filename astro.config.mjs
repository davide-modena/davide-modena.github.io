// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://davide-modena.github.io',
  integrations: [
    mdx(),
    react(),
    // sitemap-index.xml per Google Search Console; fuori le pagine nascoste o di prova
    sitemap({
      filter: (page) => !/\/(prova-|404)|\/itt\//.test(page),
      i18n: { defaultLocale: 'it', locales: { it: 'it-IT', en: 'en-US' } },
    }),
  ],
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