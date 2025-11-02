export default ({ strapi }) => {
  // Registrar permisos del plugin
  const actions = [
    {
      section: "plugins",
      displayName: "Read",
      uid: "locale.read",
      pluginName: "i18n",
    },
    {
      section: "plugins",
      displayName: "Create",
      uid: "locale.create",
      pluginName: "i18n",
    },
    {
      section: "plugins",
      displayName: "Update",
      uid: "locale.update",
      pluginName: "i18n",
    },
    {
      section: "plugins",
      displayName: "Delete",
      uid: "locale.delete",
      pluginName: "i18n",
    },
  ];

  strapi.admin.services.permission.actionProvider.registerMany(actions);
};
