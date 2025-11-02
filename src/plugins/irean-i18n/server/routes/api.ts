// Rutas públicas de API para el plugin irean-i18n
export default [
  {
    method: "GET",
    path: "/locales",
    handler: "locales.listLocales",
    config: {
      auth: false,
      policies: ["plugin::irean-i18n.public"],
    },
  },
  {
    method: "POST",
    path: "/locales",
    handler: "locales.createLocale",
    config: {
      auth: false,
      policies: ["plugin::irean-i18n.public"],
    },
  },
  {
    method: "PUT",
    path: "/locales/:id",
    handler: "locales.updateLocale",
    config: {
      auth: false,
      policies: ["plugin::irean-i18n.public"],
    },
  },
  {
    method: "DELETE",
    path: "/locales/:id",
    handler: "locales.deleteLocale",
    config: {
      auth: false,
      policies: ["plugin::irean-i18n.public"],
    },
  },
];
