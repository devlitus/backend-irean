export default [
  {
    method: "GET",
    path: "/locales",
    handler: "locales.listLocales",
    config: {
      policies: [
        "admin::isAuthenticatedAdmin",
        {
          name: "admin::hasPermissions",
          config: {
            actions: ["plugin::i18n.locale.read"],
          },
        },
      ],
    },
  },
  {
    method: "POST",
    path: "/locales",
    handler: "locales.createLocale",
    config: {
      policies: [
        "admin::isAuthenticatedAdmin",
        {
          name: "admin::hasPermissions",
          config: {
            actions: ["plugin::i18n.locale.create"],
          },
        },
      ],
    },
  },
  {
    method: "PUT",
    path: "/locales/:id",
    handler: "locales.updateLocale",
    config: {
      policies: [
        "admin::isAuthenticatedAdmin",
        {
          name: "admin::hasPermissions",
          config: {
            actions: ["plugin::i18n.locale.update"],
          },
        },
      ],
    },
  },
  {
    method: "DELETE",
    path: "/locales/:id",
    handler: "locales.deleteLocale",
    config: {
      policies: [
        "admin::isAuthenticatedAdmin",
        {
          name: "admin::hasPermissions",
          config: {
            actions: ["plugin::i18n.locale.delete"],
          },
        },
      ],
    },
  },
];
