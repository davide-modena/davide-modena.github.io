// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://davidemodena.netlify.app',
  integrations: [mdx()],
  i18n: {
    locales: ['it', 'en'],
    defaultLocale: 'it',
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    shikiConfig: {
      themes: { dark: 'vitesse-dark', light: 'vitesse-light' },
      defaultColor: 'dark',
    },
  },
});
