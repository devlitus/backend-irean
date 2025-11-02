export default ({ strapi }: any) => ({
  /**
   * Extender Core API para soportar filtrado por locale
   */
  extendCoreApi() {
    strapi.log.info("[irean-i18n] Extendiendo Core API para content types localizados");

    // Decorar controllers de content types localizados
    Object.entries(strapi.contentTypes).forEach(([uid, contentType]: [string, any]) => {
      if (this.isLocalizedContentType(contentType)) {
        strapi.log.debug(`[irean-i18n] Decorating controller for ${uid}`);
        this.decorateController(uid);
        this.decorateService(uid);
      }
    });
  },

  /**
   * Verificar si un content type está localizado
   */
  isLocalizedContentType(contentType: any) {
    return (
      contentType.kind === "collectionType" &&
      contentType.pluginOptions?.["irean-i18n"]?.localized === true
    );
  },

  /**
   * Decorar controller para agregar lógica de locale
   */
  decorateController(uid: string) {
    const controller = strapi.controller(uid as any);

    if (!controller) {
      strapi.log.warn(`[irean-i18n] No controller found for ${uid}`);
      console.warn(`[irean-i18n] Decorator: no controller found for ${uid}`);
      return;
    }

    console.log(`[irean-i18n] Decorator: decorating controller for ${uid}`);

    // Guardar referencia al método original
    const originalFind = controller.find;

    // Sobrescribir find para agregar filtro de locale
    controller.find = async (ctx: any) => {
      try {
        const { locale } = ctx.query;
        console.log(`[irean-i18n] Decorator: find() called for ${uid}, locale param:`, locale);

        // Si se especifica locale, agregarlo al filtro
        if (locale) {
          console.log(`[irean-i18n] Decorator: adding locale filter for ${uid}: ${locale}`);
          ctx.query.filters = {
            ...ctx.query.filters,
            locale: { $eq: locale },
          };
          strapi.log.debug(`[irean-i18n] Filtering ${uid} by locale: ${locale}`);
        } else {
          console.log(`[irean-i18n] Decorator: no locale filter for ${uid}`);
        }

        // Llamar al método original
        const result = await originalFind.call(controller, ctx);
        console.log(`[irean-i18n] Decorator: find() for ${uid} returned successfully`);
        return result;
      } catch (error) {
        console.error(`[irean-i18n] Decorator: find() error for ${uid}:`, error.message);
        throw error;
      }
    };
  },

  /**
   * Decorar service para agregar validación de locale
   */
  decorateService(uid: string) {
    const service = strapi.service(uid as any);

    if (!service) {
      strapi.log.warn(`[irean-i18n] No service found for ${uid}`);
      console.warn(`[irean-i18n] Decorator: no service found for ${uid}`);
      return;
    }

    console.log(`[irean-i18n] Decorator: decorating service for ${uid}`);

    // Guardar referencia al método original
    const originalCreate = service.create;

    // Sobrescribir create para validar locale
    service.create = async (params: any) => {
      try {
        const { data } = params;
        console.log(`[irean-i18n] Decorator: create() called for ${uid}, data locale:`, data?.locale);

        // Si no se especifica locale, usar el default
        if (!data.locale) {
          console.log(`[irean-i18n] Decorator: no locale specified for ${uid}, getting default locale`);
          const defaultLocale = await strapi
            .plugin("irean-i18n")
            .service("locales")
            .getDefaultLocale();

          data.locale = defaultLocale.code;
          console.log(`[irean-i18n] Decorator: using default locale for ${uid}:`, data.locale);
          strapi.log.debug(`[irean-i18n] Using default locale for ${uid}: ${data.locale}`);
        }

        // Validar que el locale existe
        console.log(`[irean-i18n] Decorator: validating locale for ${uid}:`, data.locale);
        const locale = await strapi
          .plugin("irean-i18n")
          .service("locales")
          .findByCode(data.locale);

        if (!locale) {
          console.error(`[irean-i18n] Decorator: locale not found for ${uid}:`, data.locale);
          throw new Error(`Locale ${data.locale} does not exist`);
        }

        console.log(`[irean-i18n] Decorator: locale validation passed for ${uid}`);
        // Llamar al método original
        const result = await originalCreate.call(service, params);
        console.log(`[irean-i18n] Decorator: create() for ${uid} returned successfully`);
        return result;
      } catch (error) {
        console.error(`[irean-i18n] Decorator: create() error for ${uid}:`, error.message);
        throw error;
      }
    };
  },
});
