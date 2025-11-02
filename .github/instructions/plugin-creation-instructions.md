# Creación de Plugins Locales en Strapi 5.30.0

## 📚 Propósito

Este documento proporciona una guía detallada para crear plugins locales en Strapi 5.30.0, con enfoque específico en la creación de un plugin de internacionalización (i18n).

## 🎯 ¿Cuándo crear un plugin local?

Crea un plugin local cuando necesites:

- **Funcionalidad reutilizable** que no existe en el marketplace
- **Lógica de negocio compleja** que se beneficia de una arquitectura modular
- **Extensiones personalizadas** del admin panel
- **Integraciones específicas** con servicios externos
- **Features transversales** que afectan múltiples content types

## 🗺️ Plan de Implementación por Fases

### Fase 1: MVP - Funcionalidad Core (Server)

**Objetivo**: Plugin funcional sin UI del admin, con API REST para gestionar locales.

**Archivos a crear**:

- ✅ `src/plugins/i18n/strapi-server.ts` - Entry point del server
- ✅ `src/plugins/i18n/package.json` - Metadata del plugin
- ✅ `src/plugins/i18n/server/index.ts` - Exporta módulos del server
- ✅ `src/plugins/i18n/server/content-types/locale/schema.json` - Schema del locale
- ✅ `src/plugins/i18n/server/content-types/index.ts` - Exporta content types
- ✅ `src/plugins/i18n/server/services/locales.ts` - Service CRUD de locales
- ✅ `src/plugins/i18n/server/services/index.ts` - Exporta services
- ✅ `src/plugins/i18n/server/controllers/locales.ts` - Controller de locales
- ✅ `src/plugins/i18n/server/controllers/index.ts` - Exporta controllers
- ✅ `src/plugins/i18n/server/routes/admin.ts` - Rutas del admin
- ✅ `src/plugins/i18n/server/routes/index.ts` - Exporta routes
- ✅ `src/plugins/i18n/server/bootstrap.ts` - Inicialización del plugin
- ✅ `src/plugins/i18n/server/register.ts` - Registro de permisos
- ✅ `config/plugins.ts` - Configuración del plugin en el proyecto

**Criterio de éxito**:

- El servidor arranca sin errores
- Se puede crear/leer/actualizar/eliminar locales desde Postman/REST client
- El locale por defecto se crea automáticamente en el bootstrap
- Las rutas responden correctamente: `GET /api/i18n/locales`, `POST /api/i18n/locales`, etc.

**Testing Fase 1**:

```bash
# Iniciar servidor
npm run develop

# Probar endpoints (usar REST Client o Postman)
GET http://localhost:1337/api/i18n/locales
POST http://localhost:1337/api/i18n/locales
PUT http://localhost:1337/api/i18n/locales/:id
DELETE http://localhost:1337/api/i18n/locales/:id
```

---

### Fase 2: Admin Panel UI

**Objetivo**: Interfaz de usuario para gestionar locales desde el panel de administración.

**Archivos a crear**:

- ✅ `src/plugins/i18n/strapi-admin.ts` - Entry point del admin
- ✅ `src/plugins/i18n/admin/src/index.tsx` - Registro del plugin en el admin
- ✅ `src/plugins/i18n/admin/src/pluginId.ts` - ID del plugin
- ✅ `src/plugins/i18n/admin/src/hooks/useLocales.ts` - Hook para obtener locales
- ✅ `src/plugins/i18n/admin/src/pages/Settings/index.tsx` - Página de configuración
- ✅ `src/plugins/i18n/admin/src/components/LocalePicker/index.tsx` - Selector de locale (opcional)

**Criterio de éxito**:

- El plugin aparece en Settings > Internationalization
- Se pueden ver, crear, editar y eliminar locales desde la UI
- Los permisos funcionan correctamente (solo admins pueden gestionar)
- La UI es responsive y sigue el diseño de Strapi

**Testing Fase 2**:

```bash
# Reiniciar servidor
npm run develop

# Verificar en el navegador
1. Ir a http://localhost:1337/admin
2. Navegar a Settings > Internationalization
3. Crear un nuevo locale (ej: "en", "English")
4. Editar un locale existente
5. Intentar eliminar el locale por defecto (debe fallar)
6. Eliminar un locale no-default
```

---

### Fase 3: Integración con Content Types

**Objetivo**: Permitir que los content types existentes sean localizables.

**Archivos a crear**:

- ✅ `src/plugins/i18n/server/services/core-api.ts` - Service para extender Core API
- ✅ Actualizar `src/plugins/i18n/server/services/index.ts` - Exportar core-api service
- ✅ Actualizar `src/plugins/i18n/server/bootstrap.ts` - Llamar a extendCoreApi()
- ✅ Actualizar `src/plugins/i18n/server/register.ts` - Extender schemas de content types
- ✅ `src/plugins/i18n/server/middlewares/locale-handler.ts` - Middleware para detectar locale
- ✅ `src/plugins/i18n/server/middlewares/index.ts` - Exportar middlewares

**Modificar content types existentes**:

- ✅ `src/api/producto/content-types/producto/schema.json` - Agregar `pluginOptions.i18n.localized`
- ✅ Marcar campos como localizados o no localizados

**Criterio de éxito**:

- Los content types con `pluginOptions.i18n.localized: true` tienen campos `locale` y `localizations`
- Se puede crear contenido en diferentes locales
- El filtrado por locale funciona: `GET /api/productos?locale=es`
- Las relaciones `localizations` vinculan correctamente las traducciones
- El middleware detecta el locale de la request

**Testing Fase 3**:

```bash
# Reiniciar servidor
npm run develop

# Probar API con locales
GET /api/productos?locale=es
GET /api/productos?locale=en
POST /api/productos (con campo locale: "es")
GET /api/productos/:id?populate[localizations]=*
```

---

### Fase 4: Refinamiento (Opcional)

**Objetivo**: Mejoras avanzadas y pulido del plugin.

**Mejoras opcionales**:

- Traducciones del admin panel (archivos i18n)
- Lifecycle hooks para validar integridad de datos
- Validaciones ISO 639-1 para códigos de locale
- Integración profunda con Content Manager
- Bulk operations (crear traducciones masivas)
- Exportar/importar traducciones
- Dashboard de completitud de traducciones

**Archivos adicionales**:

- `admin/src/translations/es.json` - Traducciones en español
- `admin/src/translations/en.json` - Traducciones en inglés
- `admin/src/translations/ca.json` - Traducciones en catalán
- `server/controllers/content-manager.ts` - Controller para Content Manager
- Lifecycle hooks personalizados

---

## 📋 Checklist de Implementación

**Fase 1 - Server MVP**:

- [ ] Crear estructura de carpetas del plugin
- [ ] Crear entry point `strapi-server.ts`
- [ ] Crear `package.json` del plugin
- [ ] Crear schema del content type `locale`
- [ ] Implementar service de locales (CRUD)
- [ ] Implementar controller de locales
- [ ] Crear rutas del admin
- [ ] Implementar bootstrap (crear locale default)
- [ ] Implementar register (permisos)
- [ ] Configurar plugin en `config/plugins.ts`
- [ ] Probar endpoints con REST client

**Fase 2 - Admin Panel**:

- [ ] Crear entry point `strapi-admin.ts`
- [ ] Implementar registro del plugin en el admin
- [ ] Crear página de Settings
- [ ] Implementar hook `useLocales`
- [ ] Crear componentes de UI (tabla, modales)
- [ ] Probar CRUD desde el admin panel
- [ ] Verificar permisos

**Fase 3 - Integración**:

- [ ] Implementar service `core-api`
- [ ] Decorar controllers de content types
- [ ] Decorar services de content types
- [ ] Extender schemas en `register`
- [ ] Crear middleware `locale-handler`
- [ ] Habilitar i18n en content type de prueba
- [ ] Crear contenido localizado de prueba
- [ ] Probar filtrado por locale
- [ ] Probar relaciones `localizations`

**Fase 4 - Refinamiento**:

- [ ] Agregar traducciones del admin
- [ ] Implementar validaciones avanzadas
- [ ] Crear lifecycle hooks
- [ ] Integración con Content Manager
- [ ] Documentar el plugin

---

## 📂 Estructura de un Plugin Local

```
src/plugins/
└── i18n/
    ├── server/
    │   ├── bootstrap.ts              # Lógica de inicialización
    │   ├── register.ts               # Registro de configuración
    │   ├── config/
    │   │   └── index.ts             # Configuración del plugin
    │   ├── controllers/
    │   │   ├── index.ts             # Exporta todos los controllers
    │   │   ├── locales.ts           # Controller de locales
    │   │   └── content-manager.ts   # Controller de contenido localizado
    │   ├── services/
    │   │   ├── index.ts             # Exporta todos los services
    │   │   ├── locales.ts           # Service de gestión de locales
    │   │   └── core-api.ts          # Service de extensión de Core API
    │   ├── routes/
    │   │   ├── index.ts             # Exporta todas las routes
    │   │   └── admin.ts             # Rutas del admin
    │   ├── content-types/
    │   │   ├── index.ts             # Exporta content types
    │   │   └── locale/              # Content type de locale
    │   │       └── schema.json
    │   ├── middlewares/
    │   │   ├── index.ts
    │   │   └── locale-handler.ts    # Middleware para detectar locale
    │   └── index.ts                 # Entry point del server
    ├── admin/
    │   ├── src/
    │   │   ├── index.tsx            # Entry point del admin
    │   │   ├── components/          # Componentes React
    │   │   │   ├── LocalePicker/
    │   │   │   ├── LocaleModal/
    │   │   │   └── index.ts
    │   │   ├── pages/               # Páginas del admin
    │   │   │   └── Settings/
    │   │   ├── hooks/               # Custom hooks
    │   │   │   ├── useLocales.ts
    │   │   │   └── index.ts
    │   │   └── utils/
    │   │       └── index.ts
    │   └── package.json             # Dependencias del admin
    ├── strapi-server.ts             # Entry point server (root)
    ├── strapi-admin.ts              # Entry point admin (root)
    └── package.json                 # Metadata del plugin
```

## 🔧 Configuración Inicial del Plugin

### 1. Estructura Mínima Requerida

Los archivos entry point son obligatorios:

```typescript
// src/plugins/i18n/strapi-server.ts
export { default } from "./server";
```

```typescript
// src/plugins/i18n/strapi-admin.ts
export { default } from "./admin/src";
```

### 2. Package.json del Plugin

```json
{
  "name": "strapi-plugin-i18n",
  "version": "1.0.0",
  "description": "Internationalization plugin for Strapi",
  "strapi": {
    "name": "i18n",
    "displayName": "Internationalization",
    "description": "Manage content in multiple languages",
    "kind": "plugin"
  },
  "dependencies": {},
  "peerDependencies": {
    "@strapi/strapi": "^5.0.0"
  }
}
```

### 3. Configurar el Plugin en el Proyecto

```typescript
// config/plugins.ts
export default () => ({
  i18n: {
    enabled: true,
    resolve: "./src/plugins/i18n", // Ruta al plugin local
    config: {
      defaultLocale: "es",
      locales: ["es", "en", "ca"],
    },
  },
});
```

## 🖥️ Server API

### Entry Point del Server

```typescript
// src/plugins/i18n/server/index.ts
import bootstrap from "./bootstrap";
import register from "./register";
import config from "./config";
import controllers from "./controllers";
import services from "./services";
import routes from "./routes";
import contentTypes from "./content-types";
import middlewares from "./middlewares";

export default {
  bootstrap,
  register,
  config,
  controllers,
  services,
  routes,
  contentTypes,
  middlewares,
};
```

### Bootstrap

Inicializa el plugin cuando Strapi arranca:

```typescript
// src/plugins/i18n/server/bootstrap.ts
export default async ({ strapi }) => {
  // 1. Verificar si existe al menos un locale
  const localesService = strapi.plugin("i18n").service("locales");
  const existingLocales = await localesService.find();

  // 2. Crear locale por defecto si no existe
  if (existingLocales.length === 0) {
    const defaultLocale = strapi.config.get("plugin.i18n.defaultLocale", "es");

    await localesService.create({
      code: defaultLocale,
      name: getLocaleName(defaultLocale),
      isDefault: true,
    });

    strapi.log.info(`[i18n] Created default locale: ${defaultLocale}`);
  }

  // 3. Extender Core API para soportar localización
  const coreApiService = strapi.plugin("i18n").service("core-api");
  coreApiService.extendCoreApi();

  strapi.log.info("[i18n] Plugin initialized successfully");
};

function getLocaleName(code: string): string {
  const names = {
    es: "Español",
    en: "English",
    ca: "Catalán",
  };
  return names[code] || code;
}
```

### Register

Registra configuración global del plugin:

```typescript
// src/plugins/i18n/server/register.ts
export default ({ strapi }) => {
  // 1. Registrar permisos del plugin
  const actions = [
    {
      section: "plugins",
      displayName: "Read",
      uid: "locale.read",
      pluginName: "i18n",
    },
    {
      section: "plugins",
      displayName: "Create",
      uid: "locale.create",
      pluginName: "i18n",
    },
    {
      section: "plugins",
      displayName: "Update",
      uid: "locale.update",
      pluginName: "i18n",
    },
    {
      section: "plugins",
      displayName: "Delete",
      uid: "locale.delete",
      pluginName: "i18n",
    },
  ];

  strapi.admin.services.permission.actionProvider.registerMany(actions);

  // 2. Extender schemas para agregar campo locale
  strapi.container.get("content-types").extend((contentTypes) => {
    Object.keys(contentTypes).forEach((uid) => {
      const contentType = contentTypes[uid];

      // Solo aplicar a collection types habilitados para i18n
      if (
        contentType.kind === "collectionType" &&
        contentType.pluginOptions?.i18n?.localized === true
      ) {
        // Agregar campo locale
        contentType.attributes.locale = {
          type: "string",
          required: true,
          configurable: false,
        };

        // Agregar campo localizations (relación)
        contentType.attributes.localizations = {
          type: "relation",
          relation: "oneToMany",
          target: uid,
          configurable: false,
        };
      }
    });

    return contentTypes;
  });
};
```

### Controllers

```typescript
// src/plugins/i18n/server/controllers/locales.ts
import type { Core } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Listar todos los locales
   */
  async listLocales(ctx) {
    try {
      const locales = await strapi.plugin("i18n").service("locales").find();

      ctx.body = { data: locales };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Crear un nuevo locale
   */
  async createLocale(ctx) {
    const { body } = ctx.request;

    try {
      // Validar datos
      if (!body.code || !body.name) {
        return ctx.badRequest("Code and name are required");
      }

      // Crear locale
      const locale = await strapi
        .plugin("i18n")
        .service("locales")
        .create(body);

      ctx.body = { data: locale };
    } catch (error) {
      if (error.message.includes("already exists")) {
        return ctx.badRequest("Locale already exists");
      }
      ctx.throw(500, error);
    }
  },

  /**
   * Actualizar un locale existente
   */
  async updateLocale(ctx) {
    const { id } = ctx.params;
    const { body } = ctx.request;

    try {
      const locale = await strapi
        .plugin("i18n")
        .service("locales")
        .update(id, body);

      if (!locale) {
        return ctx.notFound("Locale not found");
      }

      ctx.body = { data: locale };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Eliminar un locale
   */
  async deleteLocale(ctx) {
    const { id } = ctx.params;

    try {
      // Verificar que no sea el locale por defecto
      const locale = await strapi
        .plugin("i18n")
        .service("locales")
        .findById(id);

      if (!locale) {
        return ctx.notFound("Locale not found");
      }

      if (locale.isDefault) {
        return ctx.badRequest("Cannot delete default locale");
      }

      await strapi.plugin("i18n").service("locales").delete(id);

      ctx.body = { data: { id } };
    } catch (error) {
      ctx.throw(500, error);
    }
  },
});
```

```typescript
// src/plugins/i18n/server/controllers/index.ts
import locales from "./locales";
import contentManager from "./content-manager";

export default {
  locales,
  "content-manager": contentManager,
};
```

### Services

```typescript
// src/plugins/i18n/server/services/locales.ts
import type { Core } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Obtener todos los locales
   */
  async find() {
    const locales = await strapi.db.query("plugin::i18n.locale").findMany({
      orderBy: { code: "asc" },
    });

    return locales;
  },

  /**
   * Buscar locale por ID
   */
  async findById(id: string) {
    const locale = await strapi.db.query("plugin::i18n.locale").findOne({
      where: { id },
    });

    return locale;
  },

  /**
   * Buscar locale por código
   */
  async findByCode(code: string) {
    const locale = await strapi.db.query("plugin::i18n.locale").findOne({
      where: { code },
    });

    return locale;
  },

  /**
   * Crear nuevo locale
   */
  async create(data) {
    const { code, name, isDefault = false } = data;

    // Verificar si ya existe
    const exists = await this.findByCode(code);
    if (exists) {
      throw new Error(`Locale with code ${code} already exists`);
    }

    // Si es default, quitar default de los demás
    if (isDefault) {
      await strapi.db.query("plugin::i18n.locale").updateMany({
        where: {},
        data: { isDefault: false },
      });
    }

    // Crear locale
    const locale = await strapi.db.query("plugin::i18n.locale").create({
      data: {
        code,
        name,
        isDefault,
      },
    });

    return locale;
  },

  /**
   * Actualizar locale existente
   */
  async update(id: string, data) {
    const { isDefault } = data;

    // Si se establece como default, quitar default de los demás
    if (isDefault) {
      await strapi.db.query("plugin::i18n.locale").updateMany({
        where: { id: { $ne: id } },
        data: { isDefault: false },
      });
    }

    const locale = await strapi.db.query("plugin::i18n.locale").update({
      where: { id },
      data,
    });

    return locale;
  },

  /**
   * Eliminar locale
   */
  async delete(id: string) {
    // Verificar que no sea el default
    const locale = await this.findById(id);
    if (locale?.isDefault) {
      throw new Error("Cannot delete default locale");
    }

    await strapi.db.query("plugin::i18n.locale").delete({
      where: { id },
    });

    return { id };
  },

  /**
   * Obtener locale por defecto
   */
  async getDefaultLocale() {
    const locale = await strapi.db.query("plugin::i18n.locale").findOne({
      where: { isDefault: true },
    });

    return locale;
  },
});
```

```typescript
// src/plugins/i18n/server/services/core-api.ts
import type { Core } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Extender Core API para soportar filtrado por locale
   */
  extendCoreApi() {
    // Decorar controllers de content types localizados
    Object.entries(strapi.contentTypes).forEach(([uid, contentType]) => {
      if (this.isLocalizedContentType(contentType)) {
        this.decorateController(uid);
        this.decorateService(uid);
      }
    });
  },

  /**
   * Verificar si un content type está localizado
   */
  isLocalizedContentType(contentType) {
    return (
      contentType.kind === "collectionType" &&
      contentType.pluginOptions?.i18n?.localized === true
    );
  },

  /**
   * Decorar controller para agregar lógica de locale
   */
  decorateController(uid: string) {
    const controller = strapi.controller(uid);

    // Guardar referencia al método original
    const originalFind = controller.find;

    // Sobrescribir find para agregar filtro de locale
    controller.find = async (ctx) => {
      const { locale } = ctx.query;

      // Si se especifica locale, agregarlo al filtro
      if (locale) {
        ctx.query.filters = {
          ...ctx.query.filters,
          locale: { $eq: locale },
        };
      }

      // Llamar al método original
      return originalFind.call(controller, ctx);
    };
  },

  /**
   * Decorar service para agregar validación de locale
   */
  decorateService(uid: string) {
    const service = strapi.service(uid);

    // Guardar referencia al método original
    const originalCreate = service.create;

    // Sobrescribir create para validar locale
    service.create = async (params) => {
      const { data } = params;

      // Si no se especifica locale, usar el default
      if (!data.locale) {
        const defaultLocale = await strapi
          .plugin("i18n")
          .service("locales")
          .getDefaultLocale();

        data.locale = defaultLocale.code;
      }

      // Validar que el locale existe
      const locale = await strapi
        .plugin("i18n")
        .service("locales")
        .findByCode(data.locale);

      if (!locale) {
        throw new Error(`Locale ${data.locale} does not exist`);
      }

      // Llamar al método original
      return originalCreate.call(service, params);
    };
  },
});
```

```typescript
// src/plugins/i18n/server/services/index.ts
import locales from "./locales";
import coreApi from "./core-api";

export default {
  locales,
  "core-api": coreApi,
};
```

### Routes

```typescript
// src/plugins/i18n/server/routes/admin.ts
export default [
  {
    method: "GET",
    path: "/locales",
    handler: "locales.listLocales",
    config: {
      policies: [
        "admin::isAuthenticatedAdmin",
        {
          name: "admin::hasPermissions",
          config: {
            actions: ["plugin::i18n.locale.read"],
          },
        },
      ],
    },
  },
  {
    method: "POST",
    path: "/locales",
    handler: "locales.createLocale",
    config: {
      policies: [
        "admin::isAuthenticatedAdmin",
        {
          name: "admin::hasPermissions",
          config: {
            actions: ["plugin::i18n.locale.create"],
          },
        },
      ],
    },
  },
  {
    method: "PUT",
    path: "/locales/:id",
    handler: "locales.updateLocale",
    config: {
      policies: [
        "admin::isAuthenticatedAdmin",
        {
          name: "admin::hasPermissions",
          config: {
            actions: ["plugin::i18n.locale.update"],
          },
        },
      ],
    },
  },
  {
    method: "DELETE",
    path: "/locales/:id",
    handler: "locales.deleteLocale",
    config: {
      policies: [
        "admin::isAuthenticatedAdmin",
        {
          name: "admin::hasPermissions",
          config: {
            actions: ["plugin::i18n.locale.delete"],
          },
        },
      ],
    },
  },
];
```

```typescript
// src/plugins/i18n/server/routes/index.ts
import admin from "./admin";

export default {
  admin: {
    type: "admin",
    routes: admin,
  },
};
```

### Content Types

```json
// src/plugins/i18n/server/content-types/locale/schema.json
{
  "kind": "collectionType",
  "collectionName": "i18n_locales",
  "info": {
    "singularName": "locale",
    "pluralName": "locales",
    "displayName": "Locale",
    "description": "Internationalization locale"
  },
  "options": {
    "draftAndPublish": false
  },
  "pluginOptions": {
    "content-manager": {
      "visible": false
    },
    "content-type-builder": {
      "visible": false
    }
  },
  "attributes": {
    "code": {
      "type": "string",
      "required": true,
      "unique": true,
      "maxLength": 10
    },
    "name": {
      "type": "string",
      "required": true,
      "maxLength": 50
    },
    "isDefault": {
      "type": "boolean",
      "default": false
    }
  }
}
```

```typescript
// src/plugins/i18n/server/content-types/index.ts
import locale from "./locale/schema.json";

export default {
  locale,
};
```

### Middlewares

```typescript
// src/plugins/i18n/server/middlewares/locale-handler.ts
export default (config, { strapi }) => {
  return async (ctx, next) => {
    // Detectar locale de la request
    const locale =
      ctx.query.locale ||
      ctx.request.header["accept-language"]?.split(",")[0] ||
      config.defaultLocale ||
      "es";

    // Verificar que el locale existe
    const localeExists = await strapi
      .plugin("i18n")
      .service("locales")
      .findByCode(locale);

    // Si no existe, usar el default
    if (!localeExists) {
      const defaultLocale = await strapi
        .plugin("i18n")
        .service("locales")
        .getDefaultLocale();

      ctx.state.locale = defaultLocale.code;
    } else {
      ctx.state.locale = locale;
    }

    // Agregar locale a los headers de respuesta
    ctx.set("Content-Language", ctx.state.locale);

    await next();
  };
};
```

```typescript
// src/plugins/i18n/server/middlewares/index.ts
import localeHandler from "./locale-handler";

export default {
  "locale-handler": localeHandler,
};
```

## 🎨 Admin Panel API

### Entry Point del Admin

```typescript
// src/plugins/i18n/admin/src/index.tsx
import { prefixPluginTranslations } from "@strapi/strapi/admin";
import pluginId from "./pluginId";
import PluginIcon from "./components/PluginIcon";

const pluginName = "i18n";

export default {
  /**
   * Registrar el plugin en el admin panel
   */
  register(app: any) {
    // 1. Registrar el icono del plugin
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: "Internationalization",
      },
      permissions: [
        {
          action: "plugin::i18n.locale.read",
          subject: null,
        },
      ],
      Component: async () => {
        const { default: SettingsPage } = await import("./pages/Settings");
        return SettingsPage;
      },
    });

    // 2. Registrar link en settings
    app.addSettingsLink("global", {
      id: "i18n-settings",
      to: `/settings/${pluginId}`,
      intlLabel: {
        id: `${pluginId}.settings.title`,
        defaultMessage: "Internationalization",
      },
      permissions: [
        {
          action: "plugin::i18n.locale.read",
          subject: null,
        },
      ],
      Component: async () => {
        const { default: SettingsPage } = await import("./pages/Settings");
        return SettingsPage;
      },
    });

    // 3. Registrar el plugin
    app.registerPlugin({
      id: pluginId,
      name: pluginName,
    });
  },

  /**
   * Bootstrap - ejecutado después del registro
   */
  async bootstrap(app: any) {
    // Agregar campo de locale picker a los content types localizados
    // (lógica avanzada de extensión del Content Manager)
  },

  /**
   * Registrar traducciones
   */
  async registerTrads({ locales }: { locales: string[] }) {
    const importedTranslations = await Promise.all(
      locales.map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return importedTranslations;
  },
};
```

### Componentes del Admin

```typescript
// src/plugins/i18n/admin/src/components/LocalePicker/index.tsx
import React from 'react';
import { Select, Option } from '@strapi/design-system';
import { useLocales } from '../../hooks/useLocales';

interface LocalePickerProps {
  value: string;
  onChange: (locale: string) => void;
}

export const LocalePicker: React.FC<LocalePickerProps> = ({ value, onChange }) => {
  const { locales, isLoading } = useLocales();

  if (isLoading) {
    return <div>Loading locales...</div>;
  }

  return (
    <Select
      label="Locale"
      value={value}
      onChange={onChange}
      placeholder="Select a locale"
    >
      {locales.map((locale) => (
        <Option key={locale.code} value={locale.code}>
          {locale.name} ({locale.code})
          {locale.isDefault && ' - Default'}
        </Option>
      ))}
    </Select>
  );
};
```

```typescript
// src/plugins/i18n/admin/src/hooks/useLocales.ts
import { useEffect, useState } from "react";
import { useFetchClient } from "@strapi/strapi/admin";
import pluginId from "../pluginId";

interface Locale {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
}

export const useLocales = () => {
  const [locales, setLocales] = useState<Locale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { get } = useFetchClient();

  useEffect(() => {
    const fetchLocales = async () => {
      try {
        setIsLoading(true);
        const { data } = await get(`/${pluginId}/locales`);
        setLocales(data.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocales();
  }, [get]);

  return { locales, isLoading, error };
};
```

### Páginas del Admin

```typescript
// src/plugins/i18n/admin/src/pages/Settings/index.tsx
import React, { useState } from 'react';
import {
  Page,
  Layouts,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@strapi/design-system';
import { Plus, Trash, Pencil } from '@strapi/icons';
import { useLocales } from '../../hooks/useLocales';

const SettingsPage = () => {
  const { locales, isLoading } = useLocales();
  const [showModal, setShowModal] = useState(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Page.Main>
      <Layouts.Header
        title="Internationalization"
        subtitle="Manage locales for your content"
        primaryAction={
          <Button
            startIcon={<Plus />}
            onClick={() => setShowModal(true)}
          >
            Add new locale
          </Button>
        }
      />
      <Layouts.Content>
        <Table>
          <Thead>
            <Tr>
              <Th>Code</Th>
              <Th>Name</Th>
              <Th>Default</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {locales.map((locale) => (
              <Tr key={locale.id}>
                <Td>{locale.code}</Td>
                <Td>{locale.name}</Td>
                <Td>{locale.isDefault ? 'Yes' : 'No'}</Td>
                <Td>
                  <Button
                    variant="ghost"
                    startIcon={<Pencil />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger-light"
                    startIcon={<Trash />}
                    disabled={locale.isDefault}
                  >
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Layouts.Content>
    </Page.Main>
  );
};

export default SettingsPage;
```

### Plugin ID

```typescript
// src/plugins/i18n/admin/src/pluginId.ts
const pluginId = "i18n";

export default pluginId;
```

## 🔌 Habilitar i18n en Content Types

Para habilitar i18n en un content type existente:

```json
// src/api/producto/content-types/producto/schema.json
{
  "kind": "collectionType",
  "collectionName": "productos",
  "info": {
    "singularName": "producto",
    "pluralName": "productos",
    "displayName": "Product"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {
    "i18n": {
      "localized": true
    }
  },
  "attributes": {
    "nombre": {
      "type": "string",
      "required": true,
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "descripcion": {
      "type": "text",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "precio": {
      "type": "decimal",
      "required": true,
      "pluginOptions": {
        "i18n": {
          "localized": false
        }
      }
    },
    "sku": {
      "type": "string",
      "unique": true,
      "pluginOptions": {
        "i18n": {
          "localized": false
        }
      }
    }
  }
}
```

**Notas importantes:**

- `"localized": true` a nivel de `pluginOptions` habilita i18n para el content type
- Cada atributo puede especificar si es localizado o no
- Campos como precios, SKUs, etc. normalmente no son localizados
- Los campos localizados se pueden traducir por idioma

## 🌐 Uso del Plugin i18n

### Crear contenido localizado

```typescript
// Crear producto en español (locale por defecto)
const producto = await strapi.documents("api::producto.producto").create({
  data: {
    nombre: "Producto de prueba",
    descripcion: "Descripción en español",
    precio: 99.99,
    sku: "PROD-001",
    locale: "es",
  },
});

// Crear traducción al inglés
const productoEn = await strapi.documents("api::producto.producto").create({
  data: {
    nombre: "Test product",
    descripcion: "Description in English",
    precio: 99.99,
    sku: "PROD-001",
    locale: "en",
    localizations: [producto.documentId], // Vincular con la versión en español
  },
});

// Crear traducción al catalán
const productoCa = await strapi.documents("api::producto.producto").create({
  data: {
    nombre: "Test producte",
    descripcion: "Descripció en català",
    precio: 99.99,
    sku: "PROD-001",
    locale: "ca",
    localizations: [producto.documentId], // Vincular con la versión en español
  },
});
```

### Consultar contenido por locale

```typescript
// Obtener productos en español
const productosEs = await strapi.documents("api::producto.producto").findMany({
  filters: {
    locale: "es",
  },
});

// Obtener un producto con todas sus traducciones
const producto = await strapi.documents("api::producto.producto").findOne({
  documentId: id,
  populate: {
    localizations: true,
  },
});
```

### API REST con locale

```http
# Obtener productos en español
GET /api/productos?locale=es

# Obtener productos en inglés
GET /api/productos?locale=en

# Obtener producto con traducciones
GET /api/productos/123?populate[localizations]=*
```

## ✅ Best Practices

### DO ✅

- **Separar lógica server y admin** en carpetas distintas
- **Usar TypeScript** para todos los archivos del plugin
- **Validar permisos** en todas las rutas del admin
- **Documentar configuración** disponible del plugin
- **Usar Document Service API** para operaciones CRUD
- **Registrar traducciones** para el admin panel
- **Crear hooks personalizados** para lógica reutilizable en el admin
- **Testear el plugin** en diferentes escenarios antes de deployar

### DON'T ❌

- **No hardcodear configuración** - usar `strapi.config` para valores configurables
- **No exponer rutas sin autenticación** - siempre validar permisos
- **No modificar content types externos** sin verificar compatibilidad
- **No ignorar errores** - siempre loggear y manejar excepciones
- **No crear dependencias circulares** entre services
- **No usar funciones obsoletas** de Strapi 4

## 🧪 Testing del Plugin

```bash
# Desarrollo
npm run develop

# Verificar que el plugin se carga correctamente
# 1. Ir a http://localhost:1337/admin
# 2. Verificar que aparece en Settings > Internationalization
# 3. Crear un locale de prueba
# 4. Habilitar i18n en un content type
# 5. Crear contenido localizado
```

## 🐛 Troubleshooting Común

### Plugin no aparece en el admin

**Problema**: El plugin no se muestra en el menú o settings.

**Solución**:

- Verificar que `config/plugins.ts` tiene la configuración correcta
- Verificar que existen `strapi-server.ts` y `strapi-admin.ts` en la raíz del plugin
- Limpiar cache: eliminar `.cache` y `build` folders
- Reiniciar servidor en modo desarrollo

### Errores de tipos TypeScript

**Problema**: TypeScript no reconoce los tipos del plugin.

**Solución**:

```bash
# Regenerar tipos
npm run strapi ts:generate-types
```

### Content type no se localiza

**Problema**: Los campos `locale` y `localizations` no aparecen.

**Solución**:

- Verificar que `pluginOptions.i18n.localized` está en `true`
- Reiniciar servidor para que se apliquen los cambios en el schema
- Verificar que el hook `register` del plugin está extendiendo los schemas correctamente

### Permisos no funcionan

**Problema**: Los usuarios ven el plugin sin tener permisos.

**Solución**:

- Verificar que las acciones se registran en `register.ts`
- Ir a Settings > Roles and Permissions
- Asignar permisos manualmente a cada rol
- Verificar que las rutas tienen las policies correctas

## 📚 Referencias

- [Strapi Plugin SDK Documentation](https://docs.strapi.io/dev-docs/plugins-development)
- [Strapi Server API](https://docs.strapi.io/dev-docs/api/plugins/server-api)
- [Strapi Admin Panel API](https://docs.strapi.io/dev-docs/api/plugins/admin-panel-api)
- [Plugin i18n oficial de Strapi](https://github.com/strapi/strapi/tree/main/packages/plugins/i18n)

---

**Última actualización**: Compatible con Strapi 5.30.0
