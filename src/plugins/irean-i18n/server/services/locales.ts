import type { Core } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Obtener todos los locales
   */
  async find() {
    try {
      console.log("[irean-i18n] Service: find() - iniciando búsqueda de locales");
      const locales = await strapi.db.query("plugin::irean-i18n.locale").findMany({
        orderBy: { code: "asc" },
      });
      console.log("[irean-i18n] Service: find() - locales encontrados:", locales?.length, "registros");
      return locales;
    } catch (error) {
      console.error("[irean-i18n] Service: find() - ERROR:", error.message);
      throw error;
    }
  },

  /**
   * Buscar locale por ID
   */
  async findById(id: string) {
    try {
      console.log("[irean-i18n] Service: findById() - buscando locale con id:", id);
      const locale = await strapi.db.query("plugin::irean-i18n.locale").findOne({
        where: { id },
      });
      console.log("[irean-i18n] Service: findById() - resultado:", locale ? "encontrado" : "no encontrado");
      return locale;
    } catch (error) {
      console.error("[irean-i18n] Service: findById() - ERROR:", error.message);
      throw error;
    }
  },

  /**
   * Buscar locale por código
   */
  async findByCode(code: string) {
    try {
      console.log("[irean-i18n] Service: findByCode() - buscando locale con code:", code);
      const locale = await strapi.db.query("plugin::irean-i18n.locale").findOne({
        where: { code },
      });
      console.log("[irean-i18n] Service: findByCode() - resultado:", locale ? "encontrado" : "no encontrado");
      return locale;
    } catch (error) {
      console.error("[irean-i18n] Service: findByCode() - ERROR:", error.message);
      throw error;
    }
  },

  /**
   * Crear nuevo locale
   */
  async create(data) {
    try {
      const { code, name, isDefault = false } = data;
      console.log("[irean-i18n] Service: create() - iniciando con data:", { code, name, isDefault });

      // Verificar si ya existe
      const exists = await this.findByCode(code);
      if (exists) {
        console.warn("[irean-i18n] Service: create() - locale ya existe:", code);
        throw new Error(`Locale with code ${code} already exists`);
      }

      // Si es default, quitar default de los demás
      if (isDefault) {
        console.log("[irean-i18n] Service: create() - estableciendo como default");
        await strapi.db.query("plugin::irean-i18n.locale").updateMany({
          where: {},
          data: { isDefault: false },
        });
      }

      // Crear locale
      const locale = await strapi.db.query("plugin::irean-i18n.locale").create({
        data: {
          code,
          name,
          isDefault,
        },
      });

      console.log("[irean-i18n] Service: create() - locale creado con id:", locale?.id);
      return locale;
    } catch (error) {
      console.error("[irean-i18n] Service: create() - ERROR:", error.message);
      throw error;
    }
  },

  /**
   * Actualizar locale existente
   */
  async update(id: string, data) {
    try {
      console.log("[irean-i18n] Service: update() - iniciando con id:", id, "data:", data);
      const { isDefault } = data;

      // Si se establece como default, quitar default de los demás
      if (isDefault) {
        console.log("[irean-i18n] Service: update() - estableciendo como default");
        await strapi.db.query("plugin::irean-i18n.locale").updateMany({
          where: { id: { $ne: id } },
          data: { isDefault: false },
        });
      }

      const locale = await strapi.db.query("plugin::irean-i18n.locale").update({
        where: { id },
        data,
      });

      console.log("[irean-i18n] Service: update() - locale actualizado");
      return locale;
    } catch (error) {
      console.error("[irean-i18n] Service: update() - ERROR:", error.message);
      throw error;
    }
  },

  /**
   * Eliminar locale
   */
  async delete(id: string) {
    try {
      console.log("[irean-i18n] Service: delete() - iniciando con id:", id);

      // Verificar que no sea el default
      const locale = await this.findById(id);
      if (locale?.isDefault) {
        console.warn("[irean-i18n] Service: delete() - no se puede eliminar locale por defecto");
        throw new Error("Cannot delete default locale");
      }

      await strapi.db.query("plugin::irean-i18n.locale").delete({
        where: { id },
      });

      console.log("[irean-i18n] Service: delete() - locale eliminado");
      return { id };
    } catch (error) {
      console.error("[irean-i18n] Service: delete() - ERROR:", error.message);
      throw error;
    }
  },

  /**
   * Obtener locale por defecto
   */
  async getDefaultLocale() {
    try {
      console.log("[irean-i18n] Service: getDefaultLocale() - buscando locale por defecto");
      const locale = await strapi.db.query("plugin::irean-i18n.locale").findOne({
        where: { isDefault: true },
      });
      console.log("[irean-i18n] Service: getDefaultLocale() - resultado:", locale?.code || "no encontrado");
      return locale;
    } catch (error) {
      console.error("[irean-i18n] Service: getDefaultLocale() - ERROR:", error.message);
      throw error;
    }
  },
});
