import type { Core } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Obtener todos los locales
   */
  async find() {
    const locales = await strapi.db.query("plugin::irean-i18n.locale").findMany({
      orderBy: { code: "asc" },
    });

    return locales;
  },

  /**
   * Buscar locale por ID
   */
  async findById(id: string) {
    const locale = await strapi.db.query("plugin::irean-i18n.locale").findOne({
      where: { id },
    });

    return locale;
  },

  /**
   * Buscar locale por código
   */
  async findByCode(code: string) {
    const locale = await strapi.db.query("plugin::irean-i18n.locale").findOne({
      where: { code },
    });

    return locale;
  },

  /**
   * Crear nuevo locale
   */
  async create(data) {
    const { code, name, isDefault = false } = data;

    // Verificar si ya existe
    const exists = await this.findByCode(code);
    if (exists) {
      throw new Error(`Locale with code ${code} already exists`);
    }

    // Si es default, quitar default de los demás
    if (isDefault) {
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

    return locale;
  },

  /**
   * Actualizar locale existente
   */
  async update(id: string, data) {
    const { isDefault } = data;

    // Si se establece como default, quitar default de los demás
    if (isDefault) {
      await strapi.db.query("plugin::irean-i18n.locale").updateMany({
        where: { id: { $ne: id } },
        data: { isDefault: false },
      });
    }

    const locale = await strapi.db.query("plugin::irean-i18n.locale").update({
      where: { id },
      data,
    });

    return locale;
  },

  /**
   * Eliminar locale
   */
  async delete(id: string) {
    // Verificar que no sea el default
    const locale = await this.findById(id);
    if (locale?.isDefault) {
      throw new Error("Cannot delete default locale");
    }

    await strapi.db.query("plugin::irean-i18n.locale").delete({
      where: { id },
    });

    return { id };
  },

  /**
   * Obtener locale por defecto
   */
  async getDefaultLocale() {
    const locale = await strapi.db.query("plugin::irean-i18n.locale").findOne({
      where: { isDefault: true },
    });

    return locale;
  },
});
