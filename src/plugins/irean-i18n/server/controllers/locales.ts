import type { Core } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Listar todos los locales
   */
  async listLocales(ctx) {
    try {
      console.log("[irean-i18n] Controller: listLocales - iniciando");
      const locales = await strapi.plugin("irean-i18n").service("locales").find();
      console.log("[irean-i18n] Controller: listLocales - locales encontrados:", locales);

      ctx.body = { data: locales };
    } catch (error) {
      console.error("[irean-i18n] Controller: listLocales - ERROR:", error);
      ctx.throw(500, error);
    }
  },

  /**
   * Crear un nuevo locale
   */
  async createLocale(ctx) {
    const { body } = ctx.request;

    try {
      console.log("[irean-i18n] Controller: createLocale - iniciando con body:", body);

      // Validar datos
      if (!body.code || !body.name) {
        console.warn("[irean-i18n] Controller: createLocale - validación fallida: code o name faltantes");
        return ctx.badRequest("Code and name are required");
      }

      // Crear locale
      const locale = await strapi
        .plugin("irean-i18n")
        .service("locales")
        .create(body);

      console.log("[irean-i18n] Controller: createLocale - locale creado:", locale);
      ctx.body = { data: locale };
    } catch (error) {
      console.error("[irean-i18n] Controller: createLocale - ERROR:", error.message);
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
      console.log("[irean-i18n] Controller: updateLocale - iniciando con id:", id, "body:", body);

      const locale = await strapi
        .plugin("irean-i18n")
        .service("locales")
        .update(id, body);

      if (!locale) {
        console.warn("[irean-i18n] Controller: updateLocale - locale no encontrado para id:", id);
        return ctx.notFound("Locale not found");
      }

      console.log("[irean-i18n] Controller: updateLocale - locale actualizado:", locale);
      ctx.body = { data: locale };
    } catch (error) {
      console.error("[irean-i18n] Controller: updateLocale - ERROR:", error.message);
      ctx.throw(500, error);
    }
  },

  /**
   * Eliminar un locale
   */
  async deleteLocale(ctx) {
    const { id } = ctx.params;

    try {
      console.log("[irean-i18n] Controller: deleteLocale - iniciando con id:", id);

      // Verificar que no sea el locale por defecto
      const locale = await strapi
        .plugin("irean-i18n")
        .service("locales")
        .findById(id);

      if (!locale) {
        console.warn("[irean-i18n] Controller: deleteLocale - locale no encontrado para id:", id);
        return ctx.notFound("Locale not found");
      }

      if (locale.isDefault) {
        console.warn("[irean-i18n] Controller: deleteLocale - intento de eliminar locale por defecto");
        return ctx.badRequest("Cannot delete default locale");
      }

      await strapi.plugin("irean-i18n").service("locales").delete(id);
      console.log("[irean-i18n] Controller: deleteLocale - locale eliminado");

      ctx.body = { data: { id } };
    } catch (error) {
      console.error("[irean-i18n] Controller: deleteLocale - ERROR:", error.message);
      ctx.throw(500, error);
    }
  },
});
