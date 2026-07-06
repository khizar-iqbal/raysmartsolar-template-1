// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Site URL — confirm the production domain before launch (see CONTENT-TODO.md)
const SITE = process.env.PUBLIC_SITE_URL || 'https://raysmartsolar.com';

export default defineConfig({
  site: SITE,
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  trailingSlash: 'never',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/api/') && !page.includes('/thanks'),
    }),
  ],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  build: {
    inlineStylesheets: 'auto',
  },
  image: {
    // sharp is the default service; explicit for clarity
    responsiveStyles: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
