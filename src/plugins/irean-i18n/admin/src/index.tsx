import { prefixPluginTranslations } from "@strapi/strapi/admin";
import pluginId from "./pluginId";
import { Earth } from "@strapi/icons";

const pluginName = "irean-i18n";

export default {
  /**
   * Registrar el plugin en el admin panel
   */
  register(app: any) {
    // Registrar link en settings
    app.addSettingsLink("global", {
      id: pluginId,
      to: `/settings/${pluginId}`,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: "Internationalization",
      },
      Component: async () => {
        const { default: SettingsPage } = await import("./pages/Settings");
        return SettingsPage;
      },
      permissions: [
        {
          action: "plugin::irean-i18n.locale.read",
          subject: null,
        },
      ],
    });

    // Registrar el plugin
    app.registerPlugin({
      id: pluginId,
      name: pluginName,
    });
  },

  /**
   * Bootstrap - ejecutado después del registro
   */
  async bootstrap(app: any) {
    // Lógica adicional si es necesaria
  },

  /**
   * Registrar traducciones
   */
  async registerTrads({ locales }: { locales: string[] }) {
    const importedTranslations = await Promise.all(
      locales.map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return importedTranslations;
  },
};
