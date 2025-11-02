import type { Core } from "@strapi/strapi";

export default (
  config: { defaultLocale?: string },
  { strapi }: { strapi: Core.Strapi }
) => {
  return async (ctx: any, next: () => void) => {
    // Detectar locale de la request
    // Prioridad: query param > header > config default > 'es'
    const locale =
      ctx.query.locale ||
      ctx.request.header["accept-language"]?.split(",")[0] ||
      config.defaultLocale ||
      "es";

    try {
      // Verificar que el locale existe en la base de datos
      const localeExists = await strapi
        .plugin("irean-i18n")
        .service("locales")
        .findByCode(locale);

      // Si no existe, usar el locale por defecto
      if (!localeExists) {
        const defaultLocale = await strapi
          .plugin("irean-i18n")
          .service("locales")
          .getDefaultLocale();

        ctx.state.locale = defaultLocale.code;
      } else {
        ctx.state.locale = locale;
      }
    } catch (error) {
      // En caso de error, usar el locale por defecto
      const defaultLocale = await strapi
        .plugin("irean-i18n")
        .service("locales")
        .getDefaultLocale();

      ctx.state.locale = defaultLocale?.code || "es";
    }

    // Agregar locale a los headers de respuesta para indicar al cliente cuál locale se está usando
    ctx.set("Content-Language", ctx.state.locale);

    await next();
  };
};
