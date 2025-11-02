import type { Core } from "@strapi/strapi";

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  console.log("🔧 [irean_i18n] Bootstrap iniciando...");
  try {
    strapi.log.info("[irean_i18n] Bootstrap started");
    strapi.log.info("[irean_i18n] Plugin initialized - Supporting: ES, EN, CA");
    console.log("✅ [irean_i18n] Bootstrap completado correctamente");
  } catch (error) {
    console.error("❌ [irean_i18n] Error en bootstrap:", error);
    strapi.log.error("[irean_i18n] Bootstrap error:", error);
    throw error;
  }
};
