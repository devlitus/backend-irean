import type { Core } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * GET /api/irean_i18n/products/translated?locale=en
   * Obtener todos los productos traducidos
   */
  async listProducts(ctx: any) {
    console.log("🔍 [irean_i18n] listProducts called");
    console.log("📝 [irean_i18n] Query:", ctx.query);
    try {
      const locale = (ctx.query.locale as string) || "es";
      console.log(`📍 [irean_i18n] Locale solicitado: ${locale}`);

      const translator = strapi.plugin("irean-i18n").service("translator");
      console.log("✅ [irean_i18n] Translator service obtenido");

      // Validar locale
      if (!translator.isValidLocale(locale)) {
        console.warn(`⚠️ [irean_i18n] Locale inválido: ${locale}`);
        ctx.status = 400;
        ctx.body = {
          error: "Invalid locale",
          supported: ["es", "en", "ca"],
        };
        return;
      }

      console.log(`🔄 [irean_i18n] Traduciendo productos a ${locale}...`);
      const products = await translator.findTranslated(locale);
      console.log(`✅ [irean_i18n] ${products.length} productos traducidos`);

      ctx.status = 200;
      ctx.body = { data: products };
    } catch (error) {
      console.error("❌ [irean_i18n] Error en listProducts:", error);
      strapi.log.error("[irean_i18n] Error in listProducts:", error);
      ctx.status = 500;
      ctx.body = {
        error: "Internal server error",
        details: (error as any).message,
      };
    }
  },

  /**
   * GET /api/irean_i18n/products/:id/translated?locale=en
   * Obtener un producto traducido
   */
  async getProduct(ctx: any) {
    console.log("🔍 [irean_i18n] getProduct called");
    console.log("📝 [irean_i18n] Params:", ctx.params);
    console.log("📝 [irean_i18n] Query:", ctx.query);
    try {
      const locale = (ctx.query.locale as string) || "es";
      const { id } = ctx.params;
      console.log(`📍 [irean_i18n] Product ID: ${id}, Locale: ${locale}`);

      const translator = strapi.plugin("irean-i18n").service("translator");
      console.log("✅ [irean_i18n] Translator service obtenido");

      // Validar locale
      if (!translator.isValidLocale(locale)) {
        console.warn(`⚠️ [irean_i18n] Locale inválido: ${locale}`);
        ctx.status = 400;
        ctx.body = {
          error: "Invalid locale",
          supported: ["es", "en", "ca"],
        };
        return;
      }

      console.log(
        `🔄 [irean_i18n] Obteniendo producto ${id} traducido a ${locale}...`
      );
      const product = await translator.findOneTranslated(id, locale);

      if (!product) {
        console.warn(`⚠️ [irean_i18n] Producto no encontrado: ${id}`);
        ctx.status = 404;
        ctx.body = { error: "Product not found" };
        return;
      }

      console.log(`✅ [irean_i18n] Producto traducido correctamente`);
      ctx.status = 200;
      ctx.body = { data: product };
    } catch (error) {
      console.error("❌ [irean_i18n] Error en getProduct:", error);
      strapi.log.error("[irean_i18n] Error in getProduct:", error);
      ctx.status = 500;
      ctx.body = {
        error: "Internal server error",
        details: (error as any).message,
      };
    }
  },
});
