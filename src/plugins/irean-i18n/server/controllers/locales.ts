import type { Core } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Listar todos los locales
   */
  async listLocales(ctx) {
    try {
      const locales = await strapi.plugin("irean-i18n").service("locales").find();

      ctx.body = { data: locales };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Crear un nuevo locale
   */
  async createLocale(ctx) {
    const { body } = ctx.request;

    try {
      // Validar datos
      if (!body.code || !body.name) {
        return ctx.badRequest("Code and name are required");
      }

      // Crear locale
      const locale = await strapi
        .plugin("irean-i18n")
        .service("locales")
        .create(body);

      ctx.body = { data: locale };
    } catch (error) {
      if (error.message.includes("already exists")) {
        return ctx.badRequest("Locale already exists");
      }
      ctx.throw(500, error);
    }
  },

  /**
   * Actualizar un locale existente
   */
  async updateLocale(ctx) {
    const { id } = ctx.params;
    const { body } = ctx.request;

    try {
      const locale = await strapi
        .plugin("irean-i18n")
        .service("locales")
        .update(id, body);

      if (!locale) {
        return ctx.notFound("Locale not found");
      }

      ctx.body = { data: locale };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Eliminar un locale
   */
  async deleteLocale(ctx) {
    const { id } = ctx.params;

    try {
      // Verificar que no sea el locale por defecto
      const locale = await strapi
        .plugin("irean-i18n")
        .service("locales")
        .findById(id);

      if (!locale) {
        return ctx.notFound("Locale not found");
      }

      if (locale.isDefault) {
        return ctx.badRequest("Cannot delete default locale");
      }

      await strapi.plugin("irean-i18n").service("locales").delete(id);

      ctx.body = { data: { id } };
    } catch (error) {
      ctx.throw(500, error);
    }
  },
});
