export default async ({ strapi }: any) => {
  console.log("[irean-i18n] Bootstrap: iniciando plugin");

  // 0. Registrar middleware a nivel de aplicación Koa para permitir acceso público
  try {
    console.log("[irean-i18n] Bootstrap: registrando middleware Koa para rutas públicas");
    // Obtener la app Koa
    const app = strapi.server.app;

    // Insertar middleware al inicio (antes de otros middlewares)
    const publicRoutesMiddleware = async (ctx: any, next: any) => {
      const publicRoutes = [
        /^\/irean-i18n\/locales/,
      ];

      const isPublicRoute = publicRoutes.some(pattern => pattern.test(ctx.path));

      if (isPublicRoute) {
        console.log(`[irean-i18n] Middleware Koa: interceptando ruta pública ${ctx.method} ${ctx.path}`);

        // Pre-establecer el usuario como público ANTES de ejecutar next()
        ctx.state.user = null;
        ctx.state.isPublic = true;
        ctx.state.userAbilityProvider = {
          can: () => true,
        };

        // Ejecutar la cadena de middlewares
        await next();

        // Si aún hay error 401 después de ejecutar, reemplazar la respuesta
        if (ctx.status === 401) {
          console.log(`[irean-i18n] Middleware Koa: bypassing 401, ejecutando handler directamente`);

          // Ejecutar el controlador directamente
          if (ctx.method === 'GET' && ctx.path === '/irean-i18n/locales') {
            const localesService = strapi.plugin("irean-i18n").service("locales");
            const locales = await localesService.find();
            ctx.status = 200;
            ctx.body = { data: locales };
          }
        }
      } else {
        // Para rutas no públicas, continuar normalmente
        await next();
      }
    };

    // Insertar al inicio de los middlewares
    app.middleware.unshift(publicRoutesMiddleware);
    console.log("[irean-i18n] Bootstrap: middleware Koa registrado");
  } catch (error) {
    console.warn("[irean-i18n] Bootstrap: error al registrar middleware Koa:", error);
  }

  // 1. Verificar si existe al menos un locale
  const localesService = strapi.plugin("irean-i18n").service("locales");
  const existingLocales = await localesService.find();
  console.log("[irean-i18n] Bootstrap: locales existentes:", existingLocales.length);

  // 2. Crear locale por defecto si no existe
  if (existingLocales.length === 0) {
    const defaultLocale = strapi.config.get(
      "plugin::irean-i18n.defaultLocale",
      "es"
    );

    await localesService.create({
      code: defaultLocale,
      name: getLocaleName(defaultLocale),
      isDefault: true,
    });

    console.log(`[irean-i18n] Bootstrap: locale por defecto creado: ${defaultLocale}`);
    strapi.log.info(`[irean-i18n] Created default locale: ${defaultLocale}`);
  }

  // 3. Extender Core API para soportar localización
  const coreApiService = strapi.plugin("irean-i18n").service("core-api");
  coreApiService.extendCoreApi();

  // 4. Crear y habilitar permisos públicos para las rutas del plugin
  try {
    console.log("[irean-i18n] Bootstrap: configurando acceso público a rutas");

    // Obtener el rol "Public"
    const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'public' },
    });

    if (publicRole) {
      console.log("[irean-i18n] Bootstrap: rol público encontrado (ID:", publicRole.id, ")");

      // Definir las acciones del plugin (deben coincidir con las registradas en register.ts)
      const actions = [
        { action: 'plugin::irean-i18n.locale.read', displayName: 'Read' },
        { action: 'plugin::irean-i18n.locale.create', displayName: 'Create' },
        { action: 'plugin::irean-i18n.locale.update', displayName: 'Update' },
        { action: 'plugin::irean-i18n.locale.delete', displayName: 'Delete' },
      ];

      // Crear o actualizar cada permiso
      for (const { action, displayName } of actions) {
        // Buscar si el permiso ya existe
        const existingPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
          where: {
            action,
            role: publicRole.id,
          },
        });

        if (existingPermission) {
          // Si existe, asegurarse de que esté habilitado
          await strapi.db.query('plugin::users-permissions.permission').update({
            where: { id: existingPermission.id },
            data: { enabled: true },
          });
          console.log(`[irean-i18n] Bootstrap: permiso actualizado: ${displayName}`);
        } else {
          // Si no existe, crearlo
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: {
              action,
              role: publicRole.id,
              enabled: true,
            },
          });
          console.log(`[irean-i18n] Bootstrap: permiso creado: ${displayName}`);
        }
      }

      console.log("[irean-i18n] Bootstrap: permisos públicos configurados correctamente");
    } else {
      console.warn("[irean-i18n] Bootstrap: rol público no encontrado");
    }
  } catch (error) {
    console.error("[irean-i18n] Bootstrap: error al configurar permisos públicos:", error);
  }

  strapi.log.info("[irean-i18n] Plugin initialized successfully");
  console.log("[irean-i18n] Bootstrap: completado");
};

function getLocaleName(code: string): string {
  const names = {
    es: "Español",
    en: "English",
    ca: "Català",
  };
  return names[code] || code;
}
