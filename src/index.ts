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
    // El seed en producción debe ejecutarse manualmente cuando sea necesario
    // No ejecutar automáticamente para evitar problemas en Railway
  },
};
