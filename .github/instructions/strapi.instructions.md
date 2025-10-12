---
applyTo: "src/api/**/*.{ts,js}"
---

# Strapi 5.25+ Backend Development Best Practices

## 📂 Estructura de Content-Type

```
src/api/[content-type-name]/
  ├── controllers/
  │   └── [content-type-name].ts
  ├── services/
  │   └── [content-type-name].ts
  ├── routes/
  │   └── [content-type-name].ts
  └── content-types/
      └── [content-type-name]/
          └── schema.json
```

## 🎯 Controllers

### Core Controller Pattern

```typescript
import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::restaurant.restaurant",
  ({ strapi }) => ({
    // Método 1: Action completamente personalizado
    async customAction(ctx) {
      try {
        const data = await strapi
          .service("api::restaurant.restaurant")
          .customLogic();
        ctx.body = { data };
      } catch (err) {
        ctx.badRequest("Error en customAction", { error: err.message });
      }
    },

    // Método 2: Wrapping de core action (mantiene lógica base)
    async find(ctx) {
      // Validar query (opcional pero recomendado)
      await this.validateQuery(ctx);

      // Sanitizar query params
      const sanitizedQueryParams = await this.sanitizeQuery(ctx);

      // Llamar al servicio
      const { results, pagination } = await strapi
        .service("api::restaurant.restaurant")
        .find(sanitizedQueryParams);

      // Sanitizar output
      const sanitizedResults = await this.sanitizeOutput(results, ctx);

      // Lógica custom adicional
      const modifiedResults = sanitizedResults.map((result) => ({
        ...result,
        customField: "value",
      }));

      return this.transformResponse(modifiedResults, { pagination });
    },

    // Método 3: Reemplazar completamente un core action
    async findOne(ctx) {
      const { id } = ctx.params;

      await this.validateQuery(ctx);
      const sanitizedQueryParams = await this.sanitizeQuery(ctx);

      const entity = await strapi
        .documents("api::restaurant.restaurant")
        .findOne({ documentId: id, ...sanitizedQueryParams });

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

      return this.transformResponse(sanitizedEntity);
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
  const result = await strapi.service('api::restaurant.restaurant').customLogic(
    ctx.request.body
  )

  // 3. Sanitizar output
  const sanitized = await this.sanitizeOutput(result, ctx)

  // 4. Retornar response
  return this.transformResponse(sanitized)
}

// ❌ MAL: Lógica de negocio en el controller
async customAction(ctx) {
  const restaurant = await strapi.db.query('api::restaurant.restaurant').findOne({
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
  "api::restaurant.restaurant",
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
        const document = await strapi
          .documents("api::restaurant.restaurant")
          .create({
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

    // Método 3: Helper methods privados
    async processData(data) {
      // Lógica de procesamiento reutilizable
      return {
        ...data,
        processedAt: new Date().toISOString(),
      };
    },

    async getExtraData(id: string) {
      // Consultas adicionales
      return strapi.db.query("api::extra-data.extra-data").findOne({
        where: { restaurantId: id },
      });
    },
  })
);
```

### Document Service API

```typescript
// ✅ BIEN: Usar Document Service API (Strapi 5+)
const document = await strapi.documents("api::restaurant.restaurant").findOne({
  documentId: id,
  populate: ["categories", "owner"],
});

// Crear documento
const newDoc = await strapi.documents("api::restaurant.restaurant").create({
  data: {
    name: "Restaurant Name",
    description: "Description",
  },
  populate: ["categories"],
});

// Actualizar documento
const updated = await strapi.documents("api::restaurant.restaurant").update({
  documentId: id,
  data: { name: "New Name" },
});

// Eliminar documento
await strapi.documents("api::restaurant.restaurant").delete({
  documentId: id,
});

// Contar documentos
const count = await strapi.documents("api::restaurant.restaurant").count({
  filters: { published: true },
});
```

### Query Engine (Alternativa)

```typescript
// Para consultas más complejas
const restaurants = await strapi.db
  .query("api::restaurant.restaurant")
  .findMany({
    where: {
      $or: [
        { name: { $containsi: "pizza" } },
        { description: { $containsi: "pizza" } },
      ],
    },
    populate: {
      categories: true,
      owner: {
        select: ["username", "email"],
      },
    },
    orderBy: { createdAt: "desc" },
    limit: 10,
    offset: 0,
  });
```

## 🛣️ Routes

### Core Router

```typescript
import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::restaurant.restaurant", {
  prefix: "", // Custom prefix
  only: ["find", "findOne"], // Solo estos métodos
  except: ["delete"], // Excluir estos métodos
  config: {
    find: {
      auth: false, // Desactivar auth para este endpoint
      policies: [], // Aplicar policies
      middlewares: [],
    },
    findOne: {
      policies: ["is-owner"],
    },
    create: {
      middlewares: ["api::restaurant.validate-data"],
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
      path: "/restaurants/featured",
      handler: "restaurant.findFeatured",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/restaurants/:documentId/toggle-featured",
      handler: "restaurant.toggleFeatured",
      config: {
        policies: ["plugin::users-permissions.isAuthenticated"],
      },
    },
    {
      method: "GET",
      path: "/restaurants/search/:term",
      handler: "restaurant.search",
    },
    {
      method: "GET",
      path: "/restaurants/:category/:id",
      handler: "restaurant.findOneByCategory",
    },
  ],
};
```

## 🔒 Policies

### Custom Policy

```typescript
// src/api/restaurant/policies/is-owner.ts
export default (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;
  const { params } = policyContext;

  if (!user) {
    return false;
  }

  // Verificar ownership
  const restaurant = await strapi
    .documents("api::restaurant.restaurant")
    .findOne({
      documentId: params.id,
    });

  return restaurant && restaurant.owner.id === user.id;
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

## 🎛️ Middlewares

### Custom Middleware

```typescript
// src/api/restaurant/middlewares/validate-data.ts
export default (config, { strapi }) => {
  return async (ctx, next) => {
    const { body } = ctx.request;

    // Validación custom
    if (!body.name || body.name.length < 3) {
      return ctx.badRequest("Name must be at least 3 characters");
    }

    // Continuar con el siguiente middleware/controller
    await next();

    // Post-processing (opcional)
    if (ctx.response.status === 200) {
      strapi.log.info("Data validated successfully");
    }
  };
};
```

## 📊 Schema.json Structure

```json
{
  "kind": "collectionType",
  "collectionName": "restaurants",
  "info": {
    "singularName": "restaurant",
    "pluralName": "restaurants",
    "displayName": "Restaurant",
    "description": "A restaurant entity"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {},
  "attributes": {
    "name": {
      "type": "string",
      "required": true,
      "unique": true
    },
    "description": {
      "type": "text"
    },
    "categories": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::category.category",
      "inversedBy": "restaurants"
    },
    "owner": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "plugin::users-permissions.user"
    }
  }
}
```

## 🔄 Relaciones y Populate

```typescript
// ✅ BIEN: Populate estratégico
const restaurants = await strapi
  .documents("api::restaurant.restaurant")
  .findMany({
    populate: {
      categories: {
        select: ["name", "slug"],
      },
      owner: {
        select: ["username", "email"],
        populate: {
          avatar: true,
        },
      },
    },
  });

// ✅ BIEN: Populate profundo
populate: {
  categories: {
    populate: {
      subcategories: {
        populate: ["icon"];
      }
    }
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
import type { Restaurant, Category } from '../../../types/generated/contentTypes'

// En servicios
async createRestaurant(data: Partial<Restaurant>): Promise<Restaurant> {
  return await strapi.documents('api::restaurant.restaurant').create({
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
  const processed = complexProcessing(data)
  return strapi.db.query('api::restaurant.restaurant').create({ data: processed })
}

// ✅ BIEN: Lógica en el servicio
async create(ctx) {
  const result = await strapi.service('api::restaurant.restaurant').create(
    ctx.request.body
  )
  return this.transformResponse(result)
}

// ❌ MAL: Queries directas sin sanitización
async find(ctx) {
  const { results } = await strapi.service('api::restaurant.restaurant').find(ctx.query)
  return { data: results } // Inseguro!
}

// ✅ BIEN: Sanitizar siempre
async find(ctx) {
  await this.validateQuery(ctx)
  const sanitizedQueryParams = await this.sanitizeQuery(ctx)
  const { results, pagination } = await strapi
    .service('api::restaurant.restaurant')
    .find(sanitizedQueryParams)
  const sanitizedResults = await this.sanitizeOutput(results, ctx)
  return this.transformResponse(sanitizedResults, { pagination })
}
```

## 📋 Best Practices Summary

### ✅ DO

- Usar Document Service API para operaciones CRUD
- Sanitizar queries y outputs
- Separar lógica de negocio en servicios
- Usar TypeScript y generar tipos
- Implementar policies para autorización
- Usar middlewares para validación
- Loggear errores con contexto
- Populate solo lo necesario

### ❌ DON'T

- No poner lógica de negocio en controllers
- No olvidar sanitizar datos
- No usar populate: '\*' en producción
- No hacer queries sin validación
- No exponer datos sensibles
- No silenciar errores
- No usar any en TypeScript

## 🔧 CLI Commands

```bash
# Generar tipos TypeScript
npm run strapi ts:generate-types

# Generar API completa
npm run strapi generate api restaurant name:string description:text

# Generar componentes individuales
npm run strapi generate controller restaurant
npm run strapi generate service restaurant
npm run strapi generate policy is-owner
npm run strapi generate middleware validate-data

# Development
npm run develop

# Production
npm run start
```

---

**Nota**: Estas prácticas están basadas en Strapi 5.25+ con Document Service API. Esta versión incluye mejoras en performance y nuevas características de la API.
