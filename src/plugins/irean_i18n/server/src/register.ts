import type { Core } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => {
  console.log("🔧 [irean_i18n] Register iniciando...");
  try {
    // Registrar permisos del plugin
    console.log("📋 [irean_i18n] Registrando permisos...");
    strapi.admin.services.permission.actionProvider.registerMany([
      {
        section: "plugins",
        displayName: "Access translations",
        uid: "view",
        pluginName: "irean_i18n",
      },
    ]);
    console.log("✅ [irean_i18n] Permisos registrados correctamente");
  } catch (error) {
    console.error("❌ [irean_i18n] Error en register:", error);
    strapi.log.error("[irean_i18n] Register error:", error);
    throw error;
  }
};
