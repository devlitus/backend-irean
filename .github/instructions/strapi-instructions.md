---
applyTo: "src/api/**/*.{ts,js}"
---

# Strapi 5.25+ Backend Development Best Practices

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
        const data = await strapi
          .service("api::product.product")
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
        .service("api::product.product")
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
        .documents("api::product.product")
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
        const document = await strapi
          .documents("api::product.product")
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
const products = await strapi.db
  .query("api::product.product")
  .findMany({
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

export default factories.createCoreRouter("api::product.product", {
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
      policies: ["is-authenticated"],
    },
    create: {
      middlewares: ["api::product.validate-data"],
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
      path: "/products/on-sale",
      handler: "product.findOnSale",
      config: {
        policies: [],
        middlewares: [],
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
    {
      method: "GET",
      path: "/products/search/:term",
      handler: "product.search",
    },
    {
      method: "GET",
      path: "/products/category/:categorySlug",
      handler: "product.findByCategory",
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
  return user.role && user.role.type === 'admin';
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

**Nota**: Estas prácticas están basadas en Strapi 5.25+ con Document Service API. Esta versión incluye mejoras en performance y nuevas características de la API.
