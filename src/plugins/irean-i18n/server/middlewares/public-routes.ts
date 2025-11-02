/**
 * Middleware para permitir acceso público a rutas del plugin irean-i18n
 * sin requerir autenticación ni permisos
 */
import type { Core } from "@strapi/strapi";

export default (config: any = {}, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: any) => {
    // Verificar si es una ruta pública marcada por el middleware del bootstrap
    if (ctx.state.isPublicRoute) {
      console.log(`[irean-i18n] Public route middleware: permitiendo acceso a ${ctx.method} ${ctx.path}`);
      // Setear como acceso completamente público
      ctx.state.user = null;
      ctx.state.isPublic = true;
      ctx.state.userAbilityProvider = {
        can: () => true, // Permitir todas las acciones
      };
    }

    await next();
  };
};
