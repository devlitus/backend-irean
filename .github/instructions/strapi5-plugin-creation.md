# 🎯 Plugin irean_i18n - Traducción de Productos sin Duplicación

## ✅ Caso de Uso: Irean E-commerce

Este plugin permite traducir productos a **3 idiomas** (Español, English, Català) **SIN crear 3 productos separados** en la base de datos.

### 🎁 Beneficios

| Problema                           | Solución                                       |
| ---------------------------------- | ---------------------------------------------- |
| ❌ Crear un producto 3 veces       | ✅ Crear 1 producto + traducir automáticamente |
| ❌ Mantener 3 copies sincronizadas | ✅ Una única fuente de verdad                  |
| ❌ Datos redundantes en BD         | ✅ Optimizado y escalable                      |
| ❌ Hard-coded en frontend          | ✅ API dinámica por `?locale=es\|en\|ca`       |

---

## 📂 Estructura del Plugin `irean_i18n`

```
src/plugins/irean_i18n/
├── server/
│   └── src/
│       ├── index.ts                          # Entry point
│       ├── bootstrap.ts                      # Inicialización
│       ├── register.ts                       # Registro
│       ├── config/
│       │   └── index.ts                      # Configuración (locales, diccionario)
│       ├── controllers/
│       │   ├── index.ts
│       │   └── translation.ts                # Controller de traducción
│       ├── services/
│       │   ├── index.ts
│       │   ├── translator.ts                 # Servicio de traducción
│       │   └── dictionary.ts                 # Diccionario de traducciones
│       ├── routes/
│       │   ├── index.ts
│       │   └── admin.ts                      # Rutas del plugin
│       └── tsconfig.json
├── admin/
│   └── src/
│       ├── index.ts                          # Entry point (vacío)
│       └── pluginId.ts
├── strapi-server.ts                          # ⭐ ENTRY POINT
├── strapi-admin.ts                           # ⭐ ENTRY POINT
└── package.json                              # Metadata
```

---

## 🔑 Entry Points

### 1️⃣ `src/plugins/irean_i18n/strapi-server.ts`

```typescript
/**
 * Entry point del servidor
 */
export default require("./server/src/index.ts").default;
```

### 2️⃣ `src/plugins/irean_i18n/strapi-admin.ts`

```typescript
/**
 * Entry point del admin (sin UI para este plugin)
 */
export default {
  register(app: any) {},
  bootstrap(app: any) {},
};
```

### 3️⃣ `src/plugins/irean_i18n/package.json`

```json
{
  "name": "strapi-plugin-irean-i18n",
  "version": "1.0.0",
  "description": "Plugin de internacionalización para Irean e-commerce",
  "strapi": {
    "name": "irean_i18n",
    "displayName": "Irean i18n",
    "description": "Traducción dinámica de productos (ES, EN, CA)",
    "kind": "plugin"
  }
}
```

---

## ⚙️ Implementación del Servidor

### `server/src/index.ts`

```typescript
import bootstrap from "./bootstrap";
import register from "./register";
import controllers from "./controllers";
import services from "./services";
import routes from "./routes";

export default {
  bootstrap,
  register,
  controllers,
  services,
  routes,
};
```

### `server/src/config/index.ts`

```typescript
import type { Core } from "@strapi/strapi";

export default {
  default: {
    locales: ["es", "en", "ca"],
    defaultLocale: "es",
  },
  validator: () => {},
};
```

### `server/src/bootstrap.ts`

```typescript
import type { Core } from "@strapi/strapi";

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.log.info("[irean_i18n] Plugin initialized - Supporting: ES, EN, CA");
};
```

### `server/src/register.ts`

```typescript
import type { Core } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => {
  // Registrar permisos del plugin
  strapi.admin.services.permission.actionProvider.registerMany([
    {
      section: "plugins",
      displayName: "Access translations",
      uid: "view",
      pluginName: "irean_i18n",
    },
  ]);
};
```

### `server/src/services/dictionary.ts`

```typescript
/**
 * Diccionario de traducciones para productos
 */

export const TRANSLATIONS_DICT = {
  es: {
    // Nombres de categorías
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
  TRANSLATIONS_DICT.es[originalText] = originalText;
  TRANSLATIONS_DICT.en[originalText] = enText;
  TRANSLATIONS_DICT.ca[originalText] = caText;
}

/**
 * Obtener traducción de un texto
 */
export function getTranslation(text: string, locale: string = "es"): string {
  if (locale === "es" || !text) return text;
  return TRANSLATIONS_DICT[locale]?.[text] || text;
}

/**
 * Obtener diccionario completo
 */
export function getDictionary() {
  return TRANSLATIONS_DICT;
}
```

### `server/src/services/translator.ts`

```typescript
import type { Core } from "@strapi/strapi";
import { getTranslation } from "./dictionary";

interface Product {
  id: string;
  documentId?: string;
  name: string;
  description?: string;
  [key: string]: any;
}

interface TranslatedProduct extends Product {
  locale: string;
  originalName?: string;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Traducir un producto a un idioma específico
   */
  translateProduct(
    product: Product,
    targetLocale: string = "es"
  ): TranslatedProduct {
    if (!product || targetLocale === "es") {
      return {
        ...product,
        locale: targetLocale,
      };
    }

    const translatedName = getTranslation(product.name, targetLocale);
    const translatedDescription = getTranslation(
      product.description || "",
      targetLocale
    );

    return {
      ...product,
      name: translatedName,
      description: translatedDescription || product.description,
      originalName: product.name,
      locale: targetLocale,
    };
  },

  /**
   * Traducir múltiples productos
   */
  translateProducts(
    products: Product[],
    targetLocale: string = "es"
  ): TranslatedProduct[] {
    if (!Array.isArray(products)) return [];
    return products.map((p) => this.translateProduct(p, targetLocale));
  },

  /**
   * Obtener productos traducidos desde BD
   */
  async findTranslated(
    targetLocale: string = "es",
    filters: Record<string, any> = {}
  ): Promise<TranslatedProduct[]> {
    // Obtener productos publicados en español (idioma original)
    const products = await strapi.db.query("api::product.product").findMany({
      where: {
        publishedAt: { $notNull: true },
        ...filters,
      },
      orderBy: { name: "asc" },
    });

    return this.translateProducts(products, targetLocale);
  },

  /**
   * Obtener un producto traducido por ID
   */
  async findOneTranslated(
    id: string,
    targetLocale: string = "es"
  ): Promise<TranslatedProduct | null> {
    const product = await strapi.db.query("api::product.product").findOne({
      where: { id },
    });

    if (!product) return null;

    return this.translateProduct(product, targetLocale);
  },

  /**
   * Validar que el locale es válido
   */
  isValidLocale(locale: string): boolean {
    return ["es", "en", "ca"].includes(locale);
  },

  /**
   * Obtener locales soportados
   */
  getSupportedLocales(): string[] {
    return ["es", "en", "ca"];
  },
});
```

### `server/src/services/index.ts`

```typescript
import translator from "./translator";

export default {
  translator,
};
```

### `server/src/controllers/translation.ts`

```typescript
import type { Core } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * GET /api/irean_i18n/products/translated?locale=en
   * Obtener todos los productos traducidos
   */
  async listProducts(ctx) {
    try {
      const locale = (ctx.query.locale as string) || "es";

      // Validar locale
      if (
        !strapi.plugin("irean_i18n").service("translator").isValidLocale(locale)
      ) {
        ctx.status = 400;
        ctx.body = {
          error: "Invalid locale",
          supported: ["es", "en", "ca"],
        };
        return;
      }

      const products = await strapi
        .plugin("irean_i18n")
        .service("translator")
        .findTranslated(locale);

      ctx.status = 200;
      ctx.body = { data: products };
    } catch (error) {
      strapi.log.error("[irean_i18n] Error in listProducts:", error);
      ctx.status = 500;
      ctx.body = { error: "Internal server error" };
    }
  },

  /**
   * GET /api/irean_i18n/products/:id/translated?locale=en
   * Obtener un producto traducido
   */
  async getProduct(ctx) {
    try {
      const locale = (ctx.query.locale as string) || "es";
      const { id } = ctx.params;

      // Validar locale
      if (
        !strapi.plugin("irean_i18n").service("translator").isValidLocale(locale)
      ) {
        ctx.status = 400;
        ctx.body = {
          error: "Invalid locale",
          supported: ["es", "en", "ca"],
        };
        return;
      }

      const product = await strapi
        .plugin("irean_i18n")
        .service("translator")
        .findOneTranslated(id, locale);

      if (!product) {
        ctx.status = 404;
        ctx.body = { error: "Product not found" };
        return;
      }

      ctx.status = 200;
      ctx.body = { data: product };
    } catch (error) {
      strapi.log.error("[irean_i18n] Error in getProduct:", error);
      ctx.status = 500;
      ctx.body = { error: "Internal server error" };
    }
  },
});
```

### `server/src/controllers/index.ts`

```typescript
import translation from "./translation";

export default {
  translation,
};
```

### `server/src/routes/admin.ts`

```typescript
/**
 * Rutas del plugin irean_i18n
 * Accesibles en: GET /api/irean_i18n/products/translated?locale=en
 */
export default [
  {
    method: "GET",
    path: "/products/translated",
    handler: "translation.listProducts",
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/products/:id/translated",
    handler: "translation.getProduct",
    config: {
      auth: false,
      policies: [],
    },
  },
];
```

### `server/src/routes/index.ts`

```typescript
import admin from "./admin";

export default {
  admin: {
    type: "admin",
    routes: admin,
  },
};
```

---

## 🔌 Habilitar en `config/plugins.ts`

```typescript
export default () => ({
  irean_i18n: {
    enabled: true,
    resolve: "./src/plugins/irean_i18n",
    config: {
      locales: ["es", "en", "ca"],
      defaultLocale: "es",
    },
  },
});
```

---

## 🚀 Cómo Usarlo desde el Frontend

### Obtener TODOS los productos traducidos

```bash
# Productos en ESPAÑOL (default)
GET http://localhost:1337/api/irean_i18n/products/translated

# Productos en INGLÉS
GET http://localhost:1337/api/irean_i18n/products/translated?locale=en

# Productos en CATALÁN
GET http://localhost:1337/api/irean_i18n/products/translated?locale=ca
```

### Obtener UN producto traducido

```bash
# Producto específico en ESPAÑOL
GET http://localhost:1337/api/irean_i18n/products/1/translated?locale=es

# Producto específico en INGLÉS
GET http://localhost:1337/api/irean_i18n/products/1/translated?locale=en

# Producto específico en CATALÁN
GET http://localhost:1337/api/irean_i18n/products/1/translated?locale=ca
```

### Respuesta Ejemplo

```json
{
  "data": [
    {
      "id": "1",
      "name": "Laptop Pro",
      "description": "Laptop de última generación",
      "price": 1299.99,
      "locale": "es"
    },
    {
      "id": "2",
      "name": "iPhone 15",
      "description": "Smartphone Apple",
      "price": 999.99,
      "locale": "es"
    }
  ]
}
```

---

## 💻 Código React de Ejemplo

```jsx
import { useState, useEffect } from "react";

function ProductList({ userLanguage = "es" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cambiar idioma dinámicamente
    fetch(
      `http://localhost:1337/api/irean_i18n/products/translated?locale=${userLanguage}`
    )
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [userLanguage]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Productos ({userLanguage.toUpperCase()})</h1>
      <div className="products">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <span>${product.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
```

---

## 🧪 Testing con REST Client

Crea `restApi/development/irean-i18n.rest`:

```http
### Variables
@baseUrl = http://localhost:1337/api

### 📌 Obtener productos en ESPAÑOL
GET {{baseUrl}}/irean_i18n/products/translated

###

### 📌 Obtener productos en INGLÉS
GET {{baseUrl}}/irean_i18n/products/translated?locale=en

###

### 📌 Obtener productos en CATALÁN
GET {{baseUrl}}/irean_i18n/products/translated?locale=ca

###

### 📌 Obtener un producto en ESPAÑOL
GET {{baseUrl}}/irean_i18n/products/1/translated?locale=es

###

### 📌 Obtener un producto en INGLÉS
GET {{baseUrl}}/irean_i18n/products/1/translated?locale=en

###
```

---

## ✨ Características Principales

✅ **Sin duplicación de datos** - Un producto = 3 idiomas
✅ **Fácil de mantener** - Edita una vez, se traduce automáticamente
✅ **Escalable** - Agrega más idiomas editando el diccionario
✅ **Performance** - Traducción en backend, no en frontend
✅ **API limpia** - Parámetro `?locale=` simple
✅ **Soporta productos y categorías** - Reutilizable

---

## 📚 Referencias

- [Strapi 5 Plugins](https://docs.strapi.io/cms/plugins-development/create-a-plugin)
- [Server API](https://docs.strapi.io/cms/plugins-development/server-api)

---

## 📂 Estructura Correcta del Plugin

```
src/plugins/translation-api/
├── server/
│   └── src/
│       ├── index.ts                 # Entry point del server
│       ├── bootstrap.ts             # Inicialización
│       ├── register.ts              # Registro de config
│       ├── controllers/
│       │   ├── index.ts
│       │   └── translation.ts
│       ├── routes/
│       │   ├── index.ts
│       │   └── admin.ts
│       ├── services/
│       │   ├── index.ts
│       │   └── translation.ts
│       └── tsconfig.json
├── admin/
│   └── src/
│       ├── index.ts                 # Entry point del admin (puede estar vacío)
│       └── pluginId.ts
├── strapi-server.ts                 # ⭐ ENTRY POINT OBLIGATORIO
├── strapi-admin.ts                  # ⭐ ENTRY POINT OBLIGATORIO
└── package.json                     # Metadata del plugin
```

---

## 🔑 Archivos Entry Point (Obligatorios)

### 1. `strapi-server.ts` (en la raíz del plugin)

```typescript
/**
 * Entry point del servidor del plugin
 */

export default require("./server/src/index.ts").default;
```

### 2. `strapi-admin.ts` (en la raíz del plugin)

```typescript
/**
 * Entry point del admin del plugin
 */

export default {
  register(app: any) {
    // No necesita UI admin para este plugin
  },
  bootstrap(app: any) {
    // No necesita bootstrap para el admin
  },
};
```

### 3. `package.json` (en la raíz del plugin)

```json
{
  "name": "strapi-plugin-translation-api",
  "version": "1.0.0",
  "description": "Plugin para traducción de contenido",
  "strapi": {
    "name": "translation-api",
    "displayName": "Translation API",
    "description": "API de traducción para categorías",
    "kind": "plugin"
  }
}
```

---

## 📝 Servidor Entry Point (`server/src/index.ts`)

Este archivo **DEBE** exportar un objeto con estas propiedades:

```typescript
import bootstrap from "./bootstrap";
import register from "./register";
import controllers from "./controllers";
import services from "./services";
import routes from "./routes";

export default {
  bootstrap, // ✅ Obligatorio
  register, // ✅ Obligatorio
  controllers, // ✅ Si tienes controllers
  services, // ✅ Si tienes services
  routes, // ✅ Si tienes rutas personalizadas
  // contentTypes, // Opcional: si defines content types
  // middlewares, // Opcional: si tienes middlewares
  // config,      // Opcional: si necesitas configuración
};
```

---

## 🔌 Habilitar el Plugin en tu Proyecto

En `config/plugins.ts`:

```typescript
export default () => ({
  "translation-api": {
    enabled: true,
    resolve: "./src/plugins/translation-api", // Ruta relativa al plugin
  },
});
```

---

## ⚙️ Estructura Correcta del Servidor

### `server/src/bootstrap.ts`

```typescript
import type { Core } from "@strapi/strapi";

/**
 * Se ejecuta después de que el plugin se haya registrado
 * Aquí inicializas datos, montas rutas adicionales, etc.
 */
export default async ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.log.info("[translation-api] Plugin initialized");
};
```

### `server/src/register.ts`

```typescript
import type { Core } from "@strapi/strapi";

/**
 * Se ejecuta cuando el plugin se carga
 * Aquí registras permisos, extiendes schemas, etc.
 */
export default ({ strapi }: { strapi: Core.Strapi }) => {
  // Registrar permisos del plugin
  strapi.admin.services.permission.actionProvider.registerMany([
    {
      section: "plugins",
      displayName: "Read",
      uid: "translation.read",
      pluginName: "translation-api",
    },
  ]);
};
```

### `server/src/controllers/index.ts`

```typescript
import translation from "./translation";

export default {
  translation,
};
```

### `server/src/services/index.ts`

```typescript
import translation from "./translation";

export default {
  translation,
};
```

### `server/src/routes/index.ts`

```typescript
import admin from "./admin";

export default {
  admin: {
    type: "admin", // ⭐ Importante: routes de admin
    routes: admin,
  },
};
```

### `server/src/routes/admin.ts`

```typescript
/**
 * Rutas del plugin accesibles en /api/plugin-name/...
 */
export default [
  {
    method: "GET",
    path: "/categories/translated",
    handler: "translation.listTranslated",
    config: {
      auth: false,
      policies: [],
    },
  },
];
```

---

## ✨ Puntos Clave para Strapi 5

| Aspecto          | Detalle                                                       |
| ---------------- | ------------------------------------------------------------- |
| **Entry Points** | MUST export `strapi-server.ts` y `strapi-admin.ts` en la raíz |
| **Server Index** | Debe exportar objeto con `bootstrap`, `register`, etc.        |
| **Routes**       | Deben estar en `server/src/routes/` y exportadas por tipo     |
| **Config**       | En `config/plugins.ts`, usa `resolve` con ruta relativa       |
| **Tipos**        | Usa `import type { Core } from '@strapi/strapi'`              |
| **Rutas Admin**  | Usa `type: 'admin'` para que sean `/api/plugin-name/...`      |

---

## 🚀 Paso a Paso para tu Caso

1. **Crea la estructura de carpetas** exactamente como se especifica arriba
2. **Crea los 3 archivos entry point**:

   - `strapi-server.ts` → re-exporta `server/src/index.ts`
   - `strapi-admin.ts` → objeto con `register` y `bootstrap`
   - `package.json` → metadata

3. **Implementa `server/src/index.ts`** exportando:

   ```typescript
   export default {
     bootstrap,
     register,
     controllers,
     routes,
   };
   ```

4. **Crea rutas en `server/src/routes/`**:

   - Archivo `admin.ts` con el array de rutas
   - Archivo `index.ts` que exporta las rutas por tipo

5. **Habilita en `config/plugins.ts`**:

   ```typescript
   'translation-api': {
     enabled: true,
     resolve: './src/plugins/translation-api',
   }
   ```

6. **Reinicia**: `npm run develop`

---

## 🔍 Verificar que Funciona

```bash
# Ver en los logs al iniciar
[translation-api] Plugin initialized

# Las rutas estarán disponibles en
GET /api/plugin-name/categories/translated
```

---

## 📚 Referencias Oficiales

- [Plugin Creation - Docs Strapi 5](https://docs.strapi.io/cms/plugins-development/create-a-plugin)
- [Plugin Structure - Docs Strapi 5](https://docs.strapi.io/cms/plugins-development/plugin-structure)
- [Server API - Docs Strapi 5](https://docs.strapi.io/cms/plugins-development/server-api)
