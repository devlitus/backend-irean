import type { StrapiApp } from '@strapi/strapi/admin';
import Logo from './extensions/logo_irean.png';

export default {
  config: {
      locales: ['es', 'en'],
      theme: {
        colors: {
          primary500: '#0066cc',
          dark: '#1a1a1a',
        },
     },
     auth: {
       logo: Logo,
     },
     menu: {
       logo: Logo,
     },
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};
