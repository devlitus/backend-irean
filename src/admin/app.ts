import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
      locales: ['es', 'en'],
      theme: {
        colors: {
          primary500: '#0066cc',
          dark: '#1a1a1a',
        },
     },
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};
