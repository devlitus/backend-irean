# � Irean Backend - Strapi CMS

> API REST headless CMS construido con Strapi 5 para la plataforma e-commerce Irean

[![Strapi](https://img.shields.io/badge/Strapi-5.30-4945ff?logo=strapi)](https://strapi.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql)](https://www.postgresql.org/)

---

## 📑 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Content Types](#-content-types)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Documentación Adicional](#-documentación-adicional)

---

## 📖 Descripción

Backend API para Irean, una plataforma de e-commerce construida con **Strapi 5**, el CMS headless líder en Node.js. Proporciona una API REST completa para gestionar productos, categorías, subcategorías y contenido multimedia.

### ¿Qué es Strapi?

Strapi es un **headless CMS open-source** que permite:

- 🎨 **Panel de administración** intuitivo out-of-the-box
- 🔌 **API REST** generada automáticamente
- 🗄️ **Flexibilidad** con cualquier base de datos SQL
- 🔐 **Sistema de permisos** granular
- 📸 **Gestión de medios** integrada
- 🚀 **Fácil de extender** con plugins

---

## ✨ Características

### API Features

- ✅ **CRUD completo** para Productos, Categorías y Subcategorías
- ✅ **Relaciones** entre content types (one-to-one, one-to-many)
- ✅ **Filtrado avanzado** con query parameters
- ✅ **Paginación** y ordenamiento
- ✅ **Población** de relaciones (populate)
- ✅ **Publicación/Despublicación** de contenido (draft & publish)
- ✅ **Upload de imágenes** con gestión de medios
- ✅ **Health check endpoint** para monitoreo

### Admin Panel

- ✅ Interfaz intuitiva para gestionar contenido
- ✅ Content Type Builder visual
- ✅ Sistema de roles y permisos
- ✅ Media Library integrada
- ✅ Historial de versiones

### Seguridad

- ✅ Autenticación con JWT
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Políticas de seguridad de contenido (CSP)
- ✅ Sanitización de inputs

---

## 🛠️ Stack Tecnológico

| Tecnología     | Versión     | Propósito                  |
| -------------- | ----------- | -------------------------- |
| **Strapi**     | 5.30.0      | Headless CMS Framework     |
| **Node.js**    | 18.x - 22.x | Runtime de JavaScript      |
| **TypeScript** | 5.x         | Lenguaje tipado            |
| **PostgreSQL** | 8.8.0       | Base de datos (producción) |
| **React**      | 18.x        | Admin Panel UI             |
| **Knex.js**    | -           | Query Builder (ORM)        |

### Plugins Instalados

- `@strapi/plugin-cloud` - Integración con Strapi Cloud
- `@strapi/plugin-users-permissions` - Autenticación y permisos
- `strapi-health-plugin` - Health check endpoint

---

## ✅ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 18.x o superior ([Descargar](https://nodejs.org/))
- **npm** 6.x o superior (viene con Node.js)
- **Git** ([Descargar](https://git-scm.com/))
- **PostgreSQL** 15+ (opcional para desarrollo local, SQLite es default)

### Verificar Instalación

```bash
node --version  # Debe ser v20.x o superior
npm --version   # Debe ser v6.x o superior
```

---

## 🚀 Instalación

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/devlitus/backend-irean.git
cd backend-irean/backend
```

### 2️⃣ Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias listadas en `package.json`.

### 3️⃣ Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del directorio `backend`:

```bash
# Windows PowerShell
New-Item .env -ItemType File

# Linux/Mac
touch .env
```

Agrega las siguientes variables (ver [Configuración](#-configuración) para más detalles):

```env
# Server
HOST=0.0.0.0
PORT=1337

# Database (SQLite para desarrollo)
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# Secrets (generar con: openssl rand -base64 32)
APP_KEYS=app-key-1,app-key-2,app-key-3,app-key-4
API_TOKEN_SALT=api-token-salt
ADMIN_JWT_SECRET=admin-jwt-secret
TRANSFER_TOKEN_SALT=transfer-token-salt
JWT_SECRET=jwt-secret

# Environment
NODE_ENV=development
```

### 4️⃣ Iniciar el Servidor de Desarrollo

```bash
npm run develop
```

El servidor estará disponible en:

- 🌐 **API**: http://localhost:1337/api
- 👤 **Admin Panel**: http://localhost:1337/admin

### 5️⃣ Crear Usuario Admin

La primera vez que accedas a http://localhost:1337/admin, se te pedirá crear un usuario administrador:

1. **Nombre**: Tu nombre
2. **Email**: tu-email@example.com
3. **Password**: Una contraseña segura (mínimo 8 caracteres)

¡Listo! Ya puedes empezar a crear contenido. 🎉

---

## ⚙️ Configuración

### Variables de Entorno

#### Desarrollo Local (SQLite)

```env
# Server
HOST=0.0.0.0
PORT=1337

# Database
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# Secrets
APP_KEYS=tu-app-key-1,tu-app-key-2,tu-app-key-3,tu-app-key-4
API_TOKEN_SALT=tu-api-token-salt
ADMIN_JWT_SECRET=tu-admin-jwt-secret
TRANSFER_TOKEN_SALT=tu-transfer-token-salt
JWT_SECRET=tu-jwt-secret

# Environment
NODE_ENV=development
```

#### Producción (PostgreSQL)

```env
# Server
HOST=0.0.0.0
PORT=1337

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=your-postgres-host.railway.app
DATABASE_PORT=5432
DATABASE_NAME=railway
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
DATABASE_SSL=true

# Secrets (IMPORTANTE: cambiar en producción)
APP_KEYS=prod-key-1,prod-key-2,prod-key-3,prod-key-4
API_TOKEN_SALT=prod-token-salt
ADMIN_JWT_SECRET=prod-admin-secret
TRANSFER_TOKEN_SALT=prod-transfer-salt
JWT_SECRET=prod-jwt-secret

# URLs
PUBLIC_URL=https://tu-backend.railway.app
ADMIN_URL=https://tu-backend.railway.app/admin
CLIENT_URL=https://tu-frontend.vercel.app

# Environment
NODE_ENV=production
```

### Generar Secrets Seguros

```bash
# Linux/Mac/Git Bash
openssl rand -base64 32

# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Node.js (cualquier plataforma)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Configuración de CORS

Edita `config/middlewares.ts` para permitir tu frontend:

```typescript
export default [
  "strapi::errors",
  "strapi::security",
  {
    name: "strapi::cors",
    config: {
      enabled: true,
      origin: [
        "http://localhost:3000", // Frontend local
        "https://tu-frontend.vercel.app", // Frontend producción
      ],
      credentials: true,
    },
  },
  // ... resto de middlewares
];
```

---

## 📜 Scripts Disponibles

| Script          | Comando                | Descripción                                        |
| --------------- | ---------------------- | -------------------------------------------------- |
| **Desarrollo**  | `npm run develop`      | Inicia Strapi en modo desarrollo con auto-reload   |
| **Producción**  | `npm run start`        | Inicia Strapi en modo producción (sin auto-reload) |
| **Build**       | `npm run build`        | Compila el admin panel para producción             |
| **Console**     | `npm run console`      | Abre una consola interactiva de Strapi             |
| **Deploy**      | `npm run deploy`       | Comando para desplegar a Strapi Cloud              |
| **Seed**        | `npm run seed:example` | Ejecuta script de seed con datos de ejemplo        |
| **Upgrade**     | `npm run upgrade`      | Actualiza Strapi a la última versión               |
| **Upgrade Dry** | `npm run upgrade:dry`  | Simula actualización sin aplicar cambios           |

### Ejemplos de Uso

```bash
# Desarrollo con auto-reload
npm run develop

# Build para producción
npm run build
npm run start

# Verificar actualizaciones disponibles
npm run upgrade:dry

# Abrir consola de Strapi
npm run console
> strapi.services['api::producto.producto'].find()
```

---

## 🗄️ Content Types

### 1. Producto (`api::product.product`)

Representa un producto en el e-commerce.

**Atributos:**

| Campo             | Tipo        | Requerido | Descripción                              |
| ----------------- | ----------- | --------- | ---------------------------------------- |
| `name`            | string      | ✅ Sí     | Nombre del producto                      |
| `price`           | decimal     | ✅ Sí     | Precio del producto (mín: 0)             |
| `discount_price`  | decimal     | ❌ No     | Precio con descuento (mín: 0)            |
| `description`     | blocks      | ❌ No     | Descripción rich text                    |
| `image`           | media[]     | ✅ Sí     | Imágenes del producto (múltiples)        |
| `gender`          | enumeration | ✅ Sí     | Género: `boy`, `girl`                    |
| `tag`             | enumeration | ❌ No     | Etiqueta: `New`, `Outlet`, `Favourite`   |
| `type`            | enumeration | ❌ No     | Tipo: `outfit`, `pelele`, `dress`        |
| `visible`         | boolean     | ❌ No     | Visibilidad en el catálogo               |
| `sold`            | boolean     | ❌ No     | Si el producto está vendido (def: false) |
| `stock`           | biginteger  | ✅ Sí     | Cantidad en inventario (def: 0, mín: 0)  |
| `seo_title`       | string      | ❌ No     | Título para SEO                          |
| `seo_description` | text        | ❌ No     | Descripción meta para SEO                |
| `slug`            | uid         | ❌ No     | Slug único para URLs (generado)          |
| `categories`      | relation    | ❌ No     | Relación many-to-many con Categoría      |
| `subcategories`   | relation    | ❌ No     | Relación many-to-many con Subcategoría   |

**Ejemplo de respuesta API:**

```json
{
  "data": {
    "id": 1,
    "documentId": "abc123xyz",
    "name": "Vestido Floral",
    "price": 49.99,
    "discount_price": 39.99,
    "description": null,
    "gender": "girl",
    "tag": "New",
    "type": "dress",
    "visible": true,
    "sold": false,
    "stock": 15,
    "seo_title": "Vestido Floral para Niña | Irean",
    "seo_description": "Hermoso vestido floral para niña...",
    "slug": "vestido-floral",
    "createdAt": "2024-11-07T10:30:00.000Z",
    "updatedAt": "2024-11-07T10:30:00.000Z",
    "publishedAt": "2024-11-07T10:30:00.000Z",
    "categories": [{ "id": 2, "name": "Vestidos" }],
    "subcategories": [{ "id": 5, "name": "Vestidos Casuales" }]
  }
}
```

### 2. Categoría (`api::category.category`)

Categoría principal de productos. Soporta internacionalización (i18n).

**Atributos:**

| Campo             | Tipo     | Requerido | i18n | Descripción                            |
| ----------------- | -------- | --------- | ---- | -------------------------------------- |
| `name`            | string   | ✅ Sí     | ✅   | Nombre de la categoría                 |
| `description`     | text     | ❌ No     | ✅   | Descripción breve                      |
| `slug`            | uid      | ✅ Sí     | ❌   | Slug único para URLs (generado)        |
| `image`           | media    | ✅ Sí     | ✅   | Imagen de la categoría                 |
| `visible`         | boolean  | ✅ Sí     | ✅   | Visibilidad (def: true)                |
| `seo_title`       | string   | ❌ No     | ✅   | Título para SEO                        |
| `seo_description` | text     | ❌ No     | ✅   | Descripción meta para SEO              |
| `subcategories`   | relation | ❌ No     | ❌   | Relación one-to-many con Subcategorías |
| `products`        | relation | ❌ No     | ❌   | Relación many-to-many con Productos    |

> **Nota sobre i18n**: Los campos marcados con ✅ soportan múltiples idiomas. Usa el header `X-Locale` en requests para especificar idioma.

### 3. Subcategoría (`api::subcategory.subcategory`)

Subcategoría dentro de una categoría. Soporta internacionalización (i18n).

**Atributos:**

| Campo         | Tipo     | Requerido | i18n | Descripción                         |
| ------------- | -------- | --------- | ---- | ----------------------------------- |
| `name`        | string   | ❌ No     | ✅   | Nombre de la subcategoría           |
| `description` | text     | ❌ No     | ✅   | Descripción breve                   |
| `slug`        | uid      | ❌ No     | ❌   | Slug único para URLs (generado)     |
| `visible`     | boolean  | ❌ No     | ✅   | Visibilidad en el catálogo          |
| `category`    | relation | ❌ No     | ❌   | Relación many-to-one con Categoría  |
| `products`    | relation | ❌ No     | ❌   | Relación many-to-many con Productos |

> **Nota sobre i18n**: Los campos marcados con ✅ soportan múltiples idiomas.

### Diagrama de Relaciones

```
                    ┌──────────────┐
                    │   Producto   │
                    ├──────────────┤
                    │ id           │
                    │ name         │
                    │ price        │
                    │ gender       │
                    │ stock        │
                    └────┬──────┬──┘
                         │      │
                    M:M  │      │  M:M
                         │      │
        ┌────────────────┘      └─────────────────┐
        │                                         │
┌───────▼────────────┐                   ┌────────▼──────────┐
│   Categoría        │                   │   Subcategoría    │
├────────────────────┤       1:N         ├───────────────────┤
│ id                 │◄─────────────────┤ id                │
│ name               │                  │ name              │
│ slug               │                  │ slug              │
│ image              │                  │ category_id       │
│ visible            │                  │ visible           │
│ seo_title          │                  │ seo_title         │
└────────────────────┘                  └───────────────────┘

Relaciones:
- Categoría ◄──M:M──► Producto
- Subcategoría ◄──M:M──► Producto
- Categoría ◄──1:N──► Subcategoría
```

---

## 📁 Estructura del Proyecto

```
backend/
├── 📄 package.json           # Dependencias y scripts
├── 📄 tsconfig.json          # Configuración de TypeScript
├── 📄 railway.json           # Configuración para Railway
├── 📄 .env                   # Variables de entorno (no commitear)
├── 📄 README.md              # Este archivo
│
├── 📁 config/                # Configuración de Strapi
│   ├── admin.ts             # Config del admin panel
│   ├── api.ts               # Config de la API
│   ├── database.ts          # Config de base de datos
│   ├── middlewares.ts       # Middlewares (CORS, etc)
│   ├── plugins.ts           # Config de plugins
│   ├── server.ts            # Config del servidor
│   └── 📁 env/              # Configs específicas por entorno
│       └── 📁 production/
│           ├── admin.ts
│           └── server.ts
│
├── 📁 database/
│   └── 📁 migrations/       # Migraciones de base de datos
│
├── 📁 public/
│   ├── robots.txt
│   └── 📁 uploads/          # Archivos subidos (local)
│
├── 📁 src/
│   ├── 📄 index.ts          # Entry point de Strapi
│   │
│   ├── 📁 admin/            # Customización del admin panel
│   │   ├── app.example.tsx
│   │   ├── tsconfig.json
│   │   └── vite.config.example.ts
│   │
│   ├── 📁 api/              # Content Types API
│   │   ├── 📁 categoria/
│   │   │   ├── 📁 content-types/categoria/
│   │   │   │   └── schema.json
│   │   │   ├── 📁 controllers/
│   │   │   │   └── categoria.ts
│   │   │   ├── 📁 routes/
│   │   │   │   └── categoria.ts
│   │   │   └── 📁 services/
│   │   │       └── categoria.ts
│   │   │
│   │   ├── 📁 producto/
│   │   │   └── [misma estructura]
│   │   │
│   │   └── 📁 subcategoria/
│   │       └── [misma estructura]
│   │
│   ├── 📁 components/       # Componentes reutilizables
│   └── 📁 extensions/       # Extensiones de plugins
│
├── 📁 types/                # Tipos generados automáticamente
│   └── 📁 generated/
│       ├── components.d.ts
│       └── contentTypes.d.ts
│
└── 📁 scripts/
    └── seed.js              # Script para poblar base de datos
```

### Archivos Importantes

- **`src/index.ts`**: Entry point principal de Strapi
- **`config/database.ts`**: Configuración de conexión a base de datos
- **`config/middlewares.ts`**: Configuración de CORS y seguridad
- **`src/api/*/schema.json`**: Definición de content types
- **`src/api/*/controllers/*.ts`**: Lógica de negocio de endpoints
- **`src/api/*/services/*.ts`**: Capa de servicios para lógica compleja

---

## 🔌 API Endpoints

Strapi genera automáticamente endpoints REST para cada content type. Los endpoints usan inglés:

### Base URL

- **Desarrollo**: `http://localhost:1337/api`
- **Producción**: `https://tu-backend.railway.app/api`

### Productos

```http
GET    /api/products           # Listar todos los productos
GET    /api/products/:id       # Obtener un producto específico
POST   /api/products           # Crear nuevo producto (requiere auth)
PUT    /api/products/:id       # Actualizar producto (requiere auth)
DELETE /api/products/:id       # Eliminar producto (requiere auth)
```

### Categorías

```http
GET    /api/categories         # Listar todas las categorías
GET    /api/categories/:id     # Obtener una categoría específica
POST   /api/categories         # Crear nueva categoría (requiere auth)
PUT    /api/categories/:id     # Actualizar categoría (requiere auth)
DELETE /api/categories/:id     # Eliminar categoría (requiere auth)
```

### Subcategorías

```http
GET    /api/subcategories      # Listar todas las subcategorías
GET    /api/subcategories/:id  # Obtener una subcategoría específica
POST   /api/subcategories      # Crear nueva subcategoría (requiere auth)
PUT    /api/subcategories/:id  # Actualizar subcategoría (requiere auth)
DELETE /api/subcategories/:id  # Eliminar subcategoría (requiere auth)
```

### Health Check

```http
GET    /_health                # Verificar estado del servidor
```

### Query Parameters

```http
# Población de relaciones
?populate=*
?populate[categoria]=*
?populate[imagen]=*

# Filtrado
?filters[nombre][$contains]=iPhone
?filters[precio][$gte]=100
?filters[vendido][$eq]=false

# Ordenamiento
?sort=precio:asc
?sort=createdAt:desc

# Paginación
?pagination[page]=1
?pagination[pageSize]=25

# Combinación
?populate=*&filters[precio][$lte]=500&sort=precio:asc&pagination[pageSize]=10
```

### Ejemplos de Requests

```bash
# Obtener todos los productos con relaciones
curl http://localhost:1337/api/products?populate=*

# Obtener productos filtrados por precio
curl http://localhost:1337/api/products?filters[price][$gte]=100&filters[price][$lte]=500

# Obtener productos filtrados por género y ordenar
curl http://localhost:1337/api/products?filters[gender][$eq]=girl&sort=price:asc

# Crear un producto (requiere token JWT)
curl -X POST http://localhost:1337/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "data": {
      "name": "Vestido Floral",
      "price": 49.99,
      "stock": 15,
      "gender": "girl",
      "tag": "New",
      "type": "dress"
    }
  }'

# Obtener categorías con sus productos (populadas)
curl http://localhost:1337/api/categories?populate[products]=*&populate[subcategories]=*
```

> 📖 **Documentación completa de la API**: Ver [`API.md`](./API.md)

---

## 📚 Documentación Adicional

### Documentación del Proyecto

- 📘 [**README Principal**](../README.md) - Visión general del proyecto completo
- 🏗️ [**Arquitectura**](../docs/ARCHITECTURE.md) - Arquitectura del sistema
- 🚀 [**Guía de Despliegue**](../docs/DEPLOYMENT.md) - Deploy en Railway y otros
- 📖 [**API Reference**](./API.md) - Documentación completa de endpoints

### Documentación Oficial de Strapi

- [Strapi Documentation](https://docs.strapi.io) - Documentación oficial
- [Strapi CLI](https://docs.strapi.io/dev-docs/cli) - Referencia de CLI
- [Content Type Builder](https://docs.strapi.io/user-docs/content-type-builder) - Content Types
- [REST API](https://docs.strapi.io/dev-docs/api/rest) - API REST
- [Deployment](https://docs.strapi.io/dev-docs/deployment) - Guías de despliegue

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

**Solución:**

1. Verifica que PostgreSQL esté corriendo (si usas PostgreSQL)
2. Revisa las variables `DATABASE_*` en `.env`
3. Para desarrollo local, usa SQLite: `DATABASE_CLIENT=sqlite`

### Error: "Port 1337 already in use"

**Solución:**

```bash
# Windows
netstat -ano | findstr :1337
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :1337
kill -9 <PID>
```

O cambia el puerto en `.env`:

```env
PORT=1338
```

### Admin panel no carga

**Solución:**

1. Ejecuta: `npm run build`
2. Limpia cache: `rm -rf .cache build`
3. Reinstala dependencias: `rm -rf node_modules && npm install`

### Problemas con uploads

**Solución:**

1. Verifica permisos de carpeta `public/uploads/`
2. Aumenta límite de tamaño en `config/plugins.ts`:
   ```typescript
   export default {
     upload: {
       config: {
         sizeLimit: 10 * 1024 * 1024, // 10MB
       },
     },
   };
   ```

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](../LICENSE) para más detalles.

---

## 🙏 Recursos

- [Strapi Community](https://strapi.io/community)
- [Strapi Discord](https://discord.strapi.io)
- [Strapi Forum](https://forum.strapi.io/)
- [Awesome Strapi](https://github.com/strapi/awesome-strapi)

---

<div align="center">

**[⬆ Volver arriba](#-irean-backend---strapi-cms)**

**[📖 Ver Documentación Completa del Proyecto](../README.md)**

</div>
