/**
 * Rutas del plugin irean_i18n
 * Accesibles en: GET /api/irean-i18n/products/translated?locale=en
 */

export default [
  {
    method: "GET",
    path: "/irean-i18n/products/translated",
    handler: "translation.listProducts",
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/irean-i18n/products/:id/translated",
    handler: "translation.getProduct",
    config: {
      auth: false,
      policies: [],
    },
  },
];
