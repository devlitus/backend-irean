import type { Core } from "@strapi/strapi";
import path from "path";

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
   * Ejecuta el seed automáticamente según el entorno
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      // __dirname apunta a dist/src, necesitamos subir dos niveles a dist/ y luego acceder a scripts/
      const scriptDir = path.join(__dirname, "../../scripts");
      if (process.env.NODE_ENV === "production") {
        // Seed de producción para main/production
        const seedProduction = require(path.join(scriptDir, "seed-production.js"));
        await seedProduction();
      } else if (process.env.NODE_ENV === "development") {
        // Seed de desarrollo para dev local y Railway development
        const seedDevelopment = require(path.join(scriptDir, "seed-dev.js"));
        await seedDevelopment();
      }
    } catch (error) {
      console.error("Error ejecutando seed:", error);
      // No bloquear el inicio de Strapi si falla el seed
    }
  },
};
