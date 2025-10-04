# Guía para Agentes de IA - Backend Irean (Strapi 5)

## Descripcion del Proyecto

Este es un backend para una web app de e-commerce llamada Irean, construida con Strapi 5 y TypeScript. Provee una API REST para gestionar productos, usuarios y pedidos, con autenticación JWT y roles de usuario. El backend está desplegado en Railway y usa SQLite en desarrollo y PostgreSQL en producción.

## Arquitectura General

Este es un backend **Strapi 5** con TypeScript, desplegado en Railway. Estructura clave:

- **API Layer**: `src/api/` - Content Types organizados por entidad (ej: `producto/`)
- **Configuration**: `config/` - Base + `config/env/production/` para overrides específicos
- **Types**: `types/generated/` - Auto-generados por Strapi, NO editar manualmente
- **Data**: SQLite en desarrollo (`data/database.sqlite`), PostgreSQL en producción

## Convenciones del Proyecto

### 1. Estructura de Content Types (Patrón Strapi MVC)

Cada Content Type sigue esta estructura en `src/api/{nombre}/`:

```
producto/
├── content-types/producto/schema.json  # Definición de campos y opciones
├── controllers/producto.ts             # Lógica de endpoints (usa factories)
├── services/producto.ts                # Lógica de negocio reutilizable
└── routes/producto.ts                  # Rutas REST (usa factories)
```

**Regla crítica**: Usar `factories.createCore*()` de Strapi para generar código base:

```typescript
// ❌ NO hacer implementaciones manuales innecesarias
export default factories.createCoreController("api::producto.producto");
export default factories.createCoreService("api::producto.producto");
export default factories.createCoreRouter("api::producto.producto");
```

Solo extender factories cuando necesites customizar:

```typescript
export default factories.createCoreController(
  "api::producto.producto",
  ({ strapi }) => ({
    async customAction(ctx) {
      // Lógica personalizada aquí
    },
  })
);
```

### 2. Naming Conventions

- **Content Types**: Singular en código (`producto`), automáticamente pluralizado en API (`/api/productos`)
- **Schema files**: Usar `collectionName` para el nombre de tabla SQL (plural): `"collectionName": "productos"`
- **TypeScript types**: Auto-generados como `ApiProductoProducto` (formato: `Api{PascalCase}{PascalCase}`)

### 3. Configuration Pattern

- **Base config**: `config/*.ts` - Usa `env()` helper para variables de entorno
- **Environment-specific**: `config/env/production/*.ts` - Override para producción
- Ejemplo crítico: `config/env/production/server.ts` tiene configuración de proxy para Railway

### 4. Database Flexibility

`config/database.ts` soporta múltiples DBs vía `DATABASE_CLIENT` env var:

- Desarrollo: `sqlite` (default, archivo en `data/database.sqlite`)
- Producción Railway: `postgres` (usa `DATABASE_URL` connection string)
- También soporta MySQL configurado pero no usado actualmente

## Workflows Clave

### Desarrollo Local

```bash
npm run develop    # Inicia con hot-reload (puerto 1337)
npm run build      # Compila admin panel
npm start          # Producción sin hot-reload
```

### Testing APIs

- Usar archivos `.rest` en `restApi/development/` (VS Code REST Client)
- Base URL desarrollo: `http://localhost:1337`
- Endpoints siguen patrón: `/api/{plural-nombre}` (ej: `/api/productos`)

### Crear Nuevo Content Type

1. **Opción recomendada**: Usar Strapi Admin UI (`/admin`) - genera todo automáticamente
2. **Manual** (solo si necesario):
   - Crear `src/api/{nombre}/content-types/{nombre}/schema.json`
   - Factories auto-generan controllers/services/routes
   - Ejecutar `npm run develop` para regenerar types en `types/generated/`

### Deploy a Railway

- **Automático**: Push a `main` o `develop` triggers deploy
- Configuración en `railway.json`:
  - Build: `npm install && npm run build`
  - Start: `npm start`
- Variables requeridas: `APP_KEYS`, `DATABASE_URL`, `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY`

## Integraciones y Plugins

### Plugins Activos

- `@strapi/plugin-users-permissions`: Autenticación JWT y roles
- `@strapi/plugin-cloud`: Integración con Strapi Cloud
- `strapi-health-plugin`: Health check endpoint `/health` para Railway

### Middleware Stack (orden importa)

Ver `config/middlewares.ts` - orden estándar de Strapi:

1. logger → errors → security → cors → poweredBy → query → body → session → favicon → public

## Patrones de Código Específicos

### TypeScript Configuration

- **Target**: ES2019, **Module**: CommonJS (requerido por Strapi)
- **Exclusiones importantes**: `src/admin/` NO se compila con el servidor (tiene su propio tsconfig)
- Strapi regenera types automáticamente en `types/generated/` - nunca modificar directamente

### Seeding Data

Script en `scripts/seed.js`:

```bash
npm run seed:example  # Importa data.json (solo primera ejecución)
```

- Verifica si ya corrió usando Strapi plugin store
- Crea permisos públicos automáticamente para APIs
- Sube archivos de `data/uploads/` a storage

### REST API Patterns

Strapi genera automáticamente:

- `GET /api/productos` - Lista (soporta filters, pagination, sort)
- `GET /api/productos/:id` - Detalle
- `POST /api/productos` - Crear
- `PUT /api/productos/:id` - Actualizar
- `DELETE /api/productos/:id` - Eliminar

Configuración global en `config/api.ts`:

```typescript
defaultLimit: 25, maxLimit: 100, withCount: true
```

## Troubleshooting Común

1. **Types desactualizados**: Ejecutar `npm run develop` regenera `types/generated/`
2. **DB locked (SQLite)**: Solo un proceso puede acceder - cerrar otras instancias
3. **Railway deployment fails**: Verificar todas las env vars están seteadas (especialmente `APP_KEYS`)
4. **CORS errors**: Configurar `config/middlewares.ts` o environment-specific config

## Referencias Rápidas

- **Strapi Docs**: https://docs.strapi.io/dev-docs/intro
- **API Reference**: https://docs.strapi.io/dev-docs/api/rest
- **TypeScript Guide**: https://docs.strapi.io/dev-docs/typescript
- **Deployment Railway**: https://docs.strapi.io/dev-docs/deployment/railway

## Reglas de Modificación

Al modificar o crear código:

1. **Respetar factories** - No reimplementar lo que Strapi provee
2. **Schemas primero** - Definir `schema.json` antes de controllers
3. **Types read-only** - Dejar que Strapi los regenere
4. **Environment-aware** - Considerar dev vs producción (DB, URLs, proxy)
5. **Naming consistency** - Singular en código, Strapi maneja pluralización
