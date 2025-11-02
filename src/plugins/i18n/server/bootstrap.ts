export default async ({ strapi }) => {
  try {
    // 1. Verificar si existe al menos un locale
    const localesService = strapi.plugin("i18n").service("locales");
    const existingLocales = await localesService.find();

    // 2. Crear locale por defecto si no existe
    if (existingLocales.length === 0) {
      // Acceder a la configuración del plugin
      const pluginConfig = strapi.config.get("plugin.i18n") || {};
      const defaultLocale = pluginConfig.defaultLocale || "es";

      await localesService.create({
        code: defaultLocale,
        name: getLocaleName(defaultLocale),
        isDefault: true,
      });

      strapi.log.info(`[i18n] Created default locale: ${defaultLocale}`);
    }

    strapi.log.info("[i18n] Plugin initialized successfully");
  } catch (error) {
    strapi.log.error("[i18n] Plugin initialization failed:", error);
  }
};

function getLocaleName(code: string): string {
  const names = {
    es: "Español",
    en: "English",
    ca: "Catalán",
  };
  return names[code] || code;
}
