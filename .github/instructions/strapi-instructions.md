---
applyTo: "src/api/**/*.{ts,js}"
---

# Strapi 5.30+ Backend Development Best Practices

## 📂 Estructura de Content-Type

```
src/api/[content-type-name]/
  ├── content-types/
  │   └── [content-type-name]/
  │       └── schema.json
  ├── controllers/
  │   └── [content-type-name].ts
  ├── services/
  │   └── [content-type-name].ts
  └── routes/
      └── [content-type-name].ts
```

**Project's actual content types**: `product`, `category`, `subcategory`, `order`

## ⚠️ Cambios Importantes en Strapi v5 (desde v4)

### Entity Service → Document Service API

En Strapi v5, el **Entity Service API está deprecado** y ha sido reemplazado por el **Document Service API**. Los cambios principales son:

```typescript
// ❌ STRAPI V4 - Entity Service (DEPRECATED)
const product = await strapi.entityService.findOne("api::product.product", id);

// ✅ STRAPI V5.30+ - Document Service API (RECOMENDADO)
const product = await strapi.documents("api::product.product").findOne(id);
```

### Diferencias clave:

| Aspecto                           | Entity Service (v4)           | Document Service (v5.30+)                    |
| --------------------------------- | ----------------------------- | -------------------------------------------- |
| **Método de búsqueda individual** | `findOne(id)`                 | `findOne(documentId)`                        |
| **Búsqueda múltiple**             | `findMany(params)`            | `findMany(params)`                           |
| **Single types**                  | `findOne()` retorna un item   | `findOne()` retorna un item                  |
| **Parámetro ID**                  | `id`                          | `documentId`                                 |
| **Estado de publicación**         | `publicationState: 'preview'` | `status: 'draft'` \| `'published'`           |
| **Nuevos métodos**                | N/A                           | `publish()`, `unpublish()`, `discardDraft()` |
| **Eliminación**                   | Retorna un item               | Retorna un array                             |
| **Carga de archivos**             | Soportado                     | ❌ No soportado                              |

### Validación y Sanitización - Cambios en v5

En Strapi v5, **la validación de entrada es automática** por defecto en controllers:

```typescript
// Strapi v4 - validación manual
import { validate, sanitize } from "@strapi/utils";
validate.contentAPI.xxx();
sanitize.contentAPI.xxx();

// Strapi v5 - validación automática + acceso via strapi
// Aún necesitas llamar a sanitizeQuery y sanitizeOutput
const sanitizedQueryParams = await this.sanitizeQuery(ctx);
const sanitizedResults = await this.sanitizeOutput(results, ctx);
```

## 🎯 Controllers

### Core Controller Pattern

```typescript
import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::product.product",
  ({ strapi }) => ({
    // Método 1: Action completamente personalizado
    async customAction(ctx) {
      try {
        const data = await strapi.service("api::product.product").customLogic();
        ctx.body = { data };
      } catch (err) {
        ctx.badRequest("Error en customAction", { error: err.message });
      }
    },

    // Método 2: Wrapping de core action (mantiene lógica base)
    async find(ctx) {
      // some custom logic here
      ctx.query = { ...ctx.query, local: "en" };

      // Calling the default core action
      const { data, meta } = await super.find(ctx);

      // some more custom logic
      meta.date = Date.now();

      return { data, meta };
    },

    // Método 3: Reemplazar completamente un core action con sanitización
    async find(ctx) {
      // validateQuery (optional)
      // to throw an error on query params that are invalid or the user does not have access to
      await this.validateQuery(ctx);

      // sanitizeQuery to remove any query params that are invalid or the user does not have access to
      // It is strongly recommended to use sanitizeQuery even if validateQuery is used
      const sanitizedQueryParams = await this.sanitizeQuery(ctx);
      const { results, pagination } = await strapi
        .service("api::restaurant.restaurant")
        .find(sanitizedQueryParams);

      // sanitizeOutput to ensure the user does not receive any data they do not have access to
      const sanitizedResults = await this.sanitizeOutput(results, ctx);

      return this.transformResponse(sanitizedResults, { pagination });
    },
  })
);
```

### Custom Actions Best Practices

```typescript
// ✅ BIEN: Validación y sanitización
async customAction(ctx) {
  // 1. Validar input
  if (!ctx.request.body.name) {
    return ctx.badRequest('Name is required')
  }

  // 2. Llamar al servicio (separar lógica de negocio)
  const result = await strapi.service('api::product.product').customLogic(
    ctx.request.body
  )

  // 3. Sanitizar output
  const sanitized = await this.sanitizeOutput(result, ctx)

  // 4. Retornar response
  return this.transformResponse(sanitized)
}

// ❌ MAL: Lógica de negocio en el controller
async customAction(ctx) {
  const product = await strapi.db.query('api::product.product').findOne({
    where: { name: ctx.request.body.name }
  })
  // Evitar lógica compleja aquí
}
```

## 🔧 Services

### Core Service Pattern

```typescript
import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::product.product",
  ({ strapi }) => ({
    // Método 1: Servicio completamente personalizado
    async customLogic(data) {
      try {
        // Validar datos
        if (!data.name) {
          throw new Error("Name is required");
        }

        // Lógica de negocio
        const processed = await this.processData(data);

        // Crear documento usando Document Service API
        const document = await strapi.documents("api::product.product").create({
          data: processed,
        });

        return document;
      } catch (error) {
        strapi.log.error("Error in customLogic:", error);
        throw error;
      }
    },

    // Método 2: Wrapping de core service
    async find(...args) {
      // Calling the default core service
      const { results, pagination } = await super.find(...args);

      // Lógica custom adicional
      const enrichedResults = await Promise.all(
        results.map(async (result) => {
          const extraData = await this.getExtraData(result.id);
          return {
            ...result,
            extraData,
          };
        })
      );

      return { results: enrichedResults, pagination };
    },

    // Método 3: Reemplazar completamente un core service
    async findOne(documentId, params = {}) {
      return strapi
        .documents("api::product.product")
        .findOne(documentId, this.getFetchParams(params));
    },

    // Helper methods privados
    async processData(data) {
      // Lógica de procesamiento reutilizable
      return {
        ...data,
        processedAt: new Date().toISOString(),
      };
    },

    async getExtraData(id: string) {
      // Consultas adicionales
      return strapi.db.query("api::category.category").findOne({
        where: { productId: id },
      });
    },
  })
);
```

### Document Service API

```typescript
// ✅ BIEN: Usar Document Service API (Strapi 5+)
const document = await strapi.documents("api::product.product").findOne({
  documentId: id,
  populate: ["categories", "subcategories"],
});

// Crear documento
const newDoc = await strapi.documents("api::product.product").create({
  data: {
    name: "Product Name",
    description: "Product Description",
    price: 99.99,
  },
  populate: ["categories"],
});

// Actualizar documento
const updated = await strapi.documents("api::product.product").update({
  documentId: id,
  data: { name: "New Product Name" },
});

// Eliminar documento
await strapi.documents("api::product.product").delete({
  documentId: id,
});

// Contar documentos
const count = await strapi.documents("api::product.product").count({
  filters: { published: true },
});
```

### Query Engine (Alternativa)

```typescript
// Para consultas más complejas
const products = await strapi.db.query("api::product.product").findMany({
  where: {
    $or: [
      { name: { $containsi: "dress" } },
      { description: { $containsi: "dress" } },
    ],
  },
  populate: {
    categories: true,
    subcategories: {
      select: ["name", "slug"],
    },
  },
  orderBy: { price: "asc" },
  limit: 10,
  offset: 0,
});
```

## 🛣️ Routes

### Core Router

```typescript
import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::restaurant.restaurant", {
  config: {
    find: {
      auth: false,
    },
  },
});
```

### Core Router con Policies

```typescript
import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::restaurant.restaurant", {
  config: {
    find: {
      policies: [
        // point to a registered policy
        "policy-name",

        // point to a registered policy with some custom configuration
        { name: "policy-name", config: {} },

        // pass a policy implementation directly
        (policyContext, config, { strapi }) => {
          return true;
        },
      ],
    },
  },
});
```

### Core Router con Middlewares

```typescript
import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::restaurant.restaurant", {
  config: {
    find: {
      middlewares: [
        // point to a registered middleware
        "middleware-name",

        // point to a registered middleware with some custom configuration
        { name: "middleware-name", config: {} },

        // pass a middleware implementation directly
        (ctx, next) => {
          return next();
        },
      ],
    },
  },
});
```

### Custom Routes

```typescript
export default {
  routes: [
    {
      method: "GET",
      path: "/articles/customRoute",
      handler: "api::api-name.controllerName.functionName", // or 'plugin::plugin-name.controllerName.functionName' for a plugin-specific controller
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/products/:documentId/add-to-wishlist",
      handler: "product.addToWishlist",
      config: {
        policies: ["plugin::users-permissions.isAuthenticated"],
      },
    },
  ],
};
```

### Custom Routes con Middlewares

```typescript
export default {
  routes: [
    {
      method: "GET",
      path: "/articles/customRoute",
      handler: "api::api-name.controllerName.functionName",
      config: {
        middlewares: [
          // point to a registered middleware
          "middleware-name",

          // point to a registered middleware with some custom configuration
          { name: "middleware-name", config: {} },

          // pass a middleware implementation directly
          (ctx, next) => {
            return next();
          },
        ],
      },
    },
  ],
};
```

### Custom Routes con Policies

```typescript
export default {
  routes: [
    {
      method: "GET",
      path: "/articles/customRoute",
      handler: "api::api-name.controllerName.functionName",
      config: {
        policies: [
          // point to a registered policy
          "policy-name",

          // point to a registered policy with some custom configuration
          { name: "policy-name", config: {} },

          // pass a policy implementation directly
          (policyContext, config, { strapi }) => {
            return true;
          },
        ],
      },
    },
  ],
};
```

## 🔒 Policies

### Custom Policy

```typescript
// src/api/product/policies/is-admin.ts
export default (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;

  if (!user) {
    return false;
  }

  // Verificar si es admin
  return user.role && user.role.type === "admin";
};
```

### Aplicar Policies

```typescript
// En routes
config: {
  policies: [
    "is-owner", // Policy local
    "api::restaurant.is-owner", // Policy de otro API
    "plugin::users-permissions.isAuthenticated", // Policy de plugin
    "global::is-authenticated", // Policy global
  ];
}
```

### Policy Global

```typescript
// src/policies/is-authenticated.ts
export default (policyContext, config, { strapi }) => {
  if (policyContext.state.user) {
    // if a session is open
    // go to next policy or reach the controller's action
    return true;
  }

  return false; // If you return nothing, Strapi considers you didn't want to block the request and will let it pass
};
```

## 🎛️ Middlewares

### Custom Middleware

```typescript
// src/api/product/middlewares/validate-data.ts
export default (config, { strapi }) => {
  return async (ctx, next) => {
    const { body } = ctx.request;

    // Validación custom
    if (!body.name || body.name.length < 3) {
      return ctx.badRequest("Product name must be at least 3 characters");
    }

    if (!body.price || body.price < 0) {
      return ctx.badRequest("Price must be a positive number");
    }

    // Continuar con el siguiente middleware/controller
    await next();

    // Post-processing (opcional)
    if (ctx.response.status === 200) {
      strapi.log.info("Product data validated successfully");
    }
  };
};
```

## 📊 Schema.json Structure

```json
{
  "kind": "collectionType",
  "collectionName": "products",
  "info": {
    "singularName": "product",
    "pluralName": "products",
    "displayName": "Product",
    "description": "E-commerce product"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {},
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "price": {
      "type": "decimal",
      "required": true,
      "min": 0
    },
    "description": {
      "type": "blocks"
    },
    "categories": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::category.category",
      "inversedBy": "products"
    },
    "subcategories": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::subcategory.subcategory",
      "inversedBy": "products"
    }
  }
}
```

## 🔄 Relaciones y Populate

```typescript
// ✅ BIEN: Populate estratégico
const products = await strapi
  .documents("api::product.product")
  .findMany({
    populate: {
      categories: {
        select: ["name", "slug"],
      },
      subcategories: {
        select: ["name", "slug"],
      },
    },
  });

// ✅ BIEN: Populate profundo
populate: {
  categories: {
    select: ["name", "slug"],
    populate: {
      image: true,
    },
  },
  subcategories: {
    select: ["name", "slug"],
  }
}

// ❌ MAL: Populate todo
populate: "*"; // Evitar en producción
```

## 📝 TypeScript Types

```typescript
// Generar tipos
npm run strapi ts:generate-types

// Usar tipos generados
import type { Product, Category, Subcategory } from '../../../types/generated/contentTypes'

// En servicios
async createProduct(data: Partial<Product>): Promise<Product> {
  return await strapi.documents('api::product.product').create({
    data
  })
}
```

## 🚫 Anti-Patterns

```typescript
// ❌ MAL: Lógica de negocio en el controller
async create(ctx) {
  const data = ctx.request.body
  // Evitar procesamiento complejo aquí
  const processed = applyDiscount(data)
  return strapi.db.query('api::product.product').create({ data: processed })
}

// ✅ BIEN: Lógica en el servicio
async create(ctx) {
  const result = await strapi.service('api::product.product').create(
    ctx.request.body
  )
  return this.transformResponse(result)
}

// ❌ MAL: Queries directas sin sanitización
async find(ctx) {
  const { results } = await strapi.service('api::product.product').find(ctx.query)
  return { data: results } // Inseguro!
}

// ✅ BIEN: Sanitizar siempre
async find(ctx) {
  await this.validateQuery(ctx)
  const sanitizedQueryParams = await this.sanitizeQuery(ctx)
  const { results, pagination } = await strapi
    .service('api::product.product')
    .find(sanitizedQueryParams)
  const sanitizedResults = await this.sanitizeOutput(results, ctx)
  return this.transformResponse(sanitizedResults, { pagination })
}
```

## 📋 Best Practices Summary

### ✅ DO

- Usar Document Service API para operaciones CRUD
- Sanitizar queries y outputs (validateQuery, sanitizeQuery, sanitizeOutput)
- Separar lógica de negocio en servicios
- Usar TypeScript y generar tipos con `npm run strapi ts:generate-types`
- Implementar policies para autorización
- Usar middlewares para validación
- Loggear errores con contexto
- Populate solo lo necesario
- Usar `super.find()` para wrapping de core actions

### ❌ DON'T

- No poner lógica de negocio en controllers
- No olvidar sanitizar datos en controllers
- No usar populate: '\*' en producción
- No hacer queries sin validación
- No exponer datos sensibles
- No silenciar errores
- No usar `any` en TypeScript
- No reimplementar métodos que Strapi ya proporciona (usar factories)

## 🔧 CLI Commands

```bash
# Generar tipos TypeScript
npm run strapi ts:generate-types --debug # optional flag para logging detallado

# Generar API completa
npm run strapi generate api product name:string price:decimal

# Generar componentes individuales
npm run strapi generate controller product
npm run strapi generate service product
npm run strapi generate policy is-admin
npm run strapi generate middleware validate-data

# Development
npm run develop

# Production
npm run start
```

---

**Nota**: Estas prácticas están basadas en Strapi 5.30+ con Document Service API. Esta versión incluye mejoras en performance, mejor sanitización y nuevas características de la API.

## � Document Service Middlewares (v5.30+)

En Strapi v5, los **Entity Service Decorators** han sido reemplazados por **Document Service Middlewares**:

```typescript
// ❌ STRAPI V4 - Entity Service Decorators (DEPRECATED)
strapi.entityService.decorate((service) => {
  return Object.assign(service, {
    findOne(entityId, params = {}) {
      params.filters = { ...params.filters, deletedAt: { $notNull: true } };
      return service.findOne(entityId, params);
    },
  });
});

// ✅ STRAPI V5.30+ - Document Service Middlewares
strapi.documents.use((ctx, next) => {
  if (ctx.uid !== "api::my-content-type.my-content-type") {
    return next();
  }

  if (ctx.action === "findOne") {
    // customization
    ctx.params.filters = {
      ...ctx.params.filters,
      deletedAt: { $notNull: true },
    };
    const res = await next();
    // do something with the response if you want
    return res;
  }

  return next();
});
```

### Acciones soportadas en Document Service:

- `findOne`
- `findMany`
- `count`
- `create`
- `update`
- `delete`
- `publish` (v5+)
- `unpublish` (v5+)
- `discardDraft` (v5+)

## �📚 Referencias Oficiales

- **Strapi v5 Docs**: https://docs.strapi.io/dev-docs/intro
- **Controllers**: https://docs.strapi.io/dev-docs/backend-customization/controllers
- **Services**: https://docs.strapi.io/dev-docs/backend-customization/services
- **Routes**: https://docs.strapi.io/dev-docs/backend-customization/routes
- **Policies**: https://docs.strapi.io/dev-docs/backend-customization/policies
- **Middlewares**: https://docs.strapi.io/dev-docs/configurations/middlewares
- **TypeScript**: https://docs.strapi.io/dev-docs/typescript
- **Error Handling**: https://docs.strapi.io/dev-docs/error-handling
- **Migration v4 to v5**: https://docs.strapi.io/dev-docs/migration/v4-to-v5
- **Document Service API**: https://docs.strapi.io/dev-docs/backend-customization/document-service-api
