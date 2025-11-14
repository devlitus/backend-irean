import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    // Opcional: extender funcionalidades aquí
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * Ejecuta el seed de producción automáticamente
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Solo ejecutar seed en producción
    if (process.env.NODE_ENV === 'production') {
      try {
        const seedProduction = require('../scripts/seed-production.js');
        await seedProduction();
      } catch (error) {
        console.error('Error ejecutando seed de producción:', error);
        // No bloquear el inicio de Strapi si falla el seed
      }
    }
  },
};
