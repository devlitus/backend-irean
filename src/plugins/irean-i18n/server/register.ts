export default ({ strapi }) => {
  // 1. Registrar permisos del plugin
  const actions = [
    {
      section: "plugins",
      displayName: "Read",
      uid: "locale.read",
      pluginName: "irean-i18n",
    },
    {
      section: "plugins",
      displayName: "Create",
      uid: "locale.create",
      pluginName: "irean-i18n",
    },
    {
      section: "plugins",
      displayName: "Update",
      uid: "locale.update",
      pluginName: "irean-i18n",
    },
    {
      section: "plugins",
      displayName: "Delete",
      uid: "locale.delete",
      pluginName: "irean-i18n",
    },
  ];

  strapi.admin.services.permission.actionProvider.registerMany(actions);
};
