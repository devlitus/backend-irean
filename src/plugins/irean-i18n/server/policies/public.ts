/**
 * Política para permitir acceso público a las rutas del plugin irean-i18n
 * Esta política simplemente pasa la request sin validar autenticación
 */
import type { Core } from "@strapi/strapi";

export default (config: any = {}, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: any) => {
    console.log("[irean-i18n] Policy: public - permitiendo acceso público");
    // Simplemente continuar sin validar autenticación
    await next();
  };
};
