export default async ({ strapi }) => {
  // 1. Verificar si existe al menos un locale
  const localesService = strapi.plugin("irean-i18n").service("locales");
  const existingLocales = await localesService.find();

  // 2. Crear locale por defecto si no existe
  if (existingLocales.length === 0) {
    const defaultLocale = strapi.config.get("plugin::irean-i18n.defaultLocale", "es");

    await localesService.create({
      code: defaultLocale,
      name: getLocaleName(defaultLocale),
      isDefault: true,
    });

    strapi.log.info(`[irean-i18n] Created default locale: ${defaultLocale}`);
  }

  strapi.log.info("[irean-i18n] Plugin initialized successfully");
};

function getLocaleName(code: string): string {
  const names = {
    es: "Español",
    en: "English",
    ca: "Català",
  };
  return names[code] || code;
}
