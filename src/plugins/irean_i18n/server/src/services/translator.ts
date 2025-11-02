import type { Core } from "@strapi/strapi";
import { getTranslation } from "./dictionary";

interface Product {
  id: string;
  documentId?: string;
  name: string;
  description?: string;
  [key: string]: any;
}

interface TranslatedProduct extends Product {
  locale: string;
  originalName?: string;
}

console.log("📦 [irean_i18n] Translator service cargando...");

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Traducir un producto a un idioma específico
   */
  translateProduct(
    product: Product,
    targetLocale: string = "es"
  ): TranslatedProduct {
    console.log(
      `🔄 [irean_i18n] Traduciendo producto "${product.name}" a ${targetLocale}`
    );

    if (!product || targetLocale === "es") {
      return {
        ...product,
        locale: targetLocale,
      };
    }

    const translatedName = getTranslation(product.name, targetLocale);
    const translatedDescription = getTranslation(
      product.description || "",
      targetLocale
    );

    console.log(`✅ [irean_i18n] "${product.name}" -> "${translatedName}"`);

    return {
      ...product,
      name: translatedName,
      description: translatedDescription || product.description,
      originalName: product.name,
      locale: targetLocale,
    };
  },

  /**
   * Traducir múltiples productos
   */
  translateProducts(
    products: Product[],
    targetLocale: string = "es"
  ): TranslatedProduct[] {
    console.log(
      `🔄 [irean_i18n] Traduciendo ${products.length} productos a ${targetLocale}`
    );
    if (!Array.isArray(products)) return [];
    return products.map((p) => this.translateProduct(p, targetLocale));
  },

  /**
   * Obtener productos traducidos desde BD
   */
  async findTranslated(
    targetLocale: string = "es",
    filters: Record<string, any> = {}
  ): Promise<TranslatedProduct[]> {
    console.log(
      `📂 [irean_i18n] Obteniendo productos de BD para traducir a ${targetLocale}`
    );
    // Obtener productos publicados
    const products = await strapi.db.query("api::product.product").findMany({
      where: {
        publishedAt: { $notNull: true },
        ...filters,
      },
      orderBy: { name: "asc" },
    });

    console.log(
      `✅ [irean_i18n] ${products.length} productos encontrados en BD`
    );
    return this.translateProducts(products, targetLocale);
  },

  /**
   * Obtener un producto traducido por ID
   */
  async findOneTranslated(
    id: string,
    targetLocale: string = "es"
  ): Promise<TranslatedProduct | null> {
    console.log(`📂 [irean_i18n] Obteniendo producto ${id} de BD`);
    const product = await strapi.db.query("api::product.product").findOne({
      where: { id },
    });

    if (!product) {
      console.warn(`⚠️ [irean_i18n] Producto ${id} no encontrado`);
      return null;
    }

    console.log(`✅ [irean_i18n] Producto ${id} encontrado: "${product.name}"`);
    return this.translateProduct(product, targetLocale);
  },

  /**
   * Validar que el locale es válido
   */
  isValidLocale(locale: string): boolean {
    const valid = ["es", "en", "ca"].includes(locale);
    console.log(
      `🔍 [irean_i18n] Validando locale "${locale}": ${valid ? "✅" : "❌"}`
    );
    return valid;
  },

  /**
   * Obtener locales soportados
   */
  getSupportedLocales(): string[] {
    console.log("📋 [irean_i18n] Locales soportados: ES, EN, CA");
    return ["es", "en", "ca"];
  },
});
