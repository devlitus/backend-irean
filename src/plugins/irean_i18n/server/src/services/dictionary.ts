/**
 * Diccionario de traducciones para productos y categorías
 */

export const TRANSLATIONS_DICT: Record<string, Record<string, string>> = {
  es: {
    // Nombres de categorías y productos de ejemplo
    Electrónica: "Electrónica",
    Ropa: "Ropa",
    Hogar: "Hogar",
    Deportes: "Deportes",
    Libros: "Libros",
    Alimentos: "Alimentos",
  },
  en: {
    Electrónica: "Electronics",
    Ropa: "Clothing",
    Hogar: "Home",
    Deportes: "Sports",
    Libros: "Books",
    Alimentos: "Food",
  },
  ca: {
    Electrónica: "Electrònica",
    Ropa: "Roba",
    Hogar: "Casa",
    Deportes: "Esports",
    Libros: "Llibres",
    Alimentos: "Aliments",
  },
};

/**
 * Agregar nueva traducción al diccionario
 */
export function addTranslation(
  originalText: string,
  enText: string,
  caText: string
): void {
  if (!TRANSLATIONS_DICT.es) TRANSLATIONS_DICT.es = {};
  if (!TRANSLATIONS_DICT.en) TRANSLATIONS_DICT.en = {};
  if (!TRANSLATIONS_DICT.ca) TRANSLATIONS_DICT.ca = {};

  TRANSLATIONS_DICT.es[originalText] = originalText;
  TRANSLATIONS_DICT.en[originalText] = enText;
  TRANSLATIONS_DICT.ca[originalText] = caText;
}

/**
 * Obtener traducción de un texto
 */
export function getTranslation(text: string, locale: string = "es"): string {
  if (!text || locale === "es") return text;
  return (TRANSLATIONS_DICT[locale] && TRANSLATIONS_DICT[locale][text]) || text;
}

/**
 * Obtener diccionario completo
 */
export function getDictionary() {
  return TRANSLATIONS_DICT;
}
