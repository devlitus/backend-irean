# 📖 API Reference - Irean Backend

> Documentación completa de los endpoints REST API de Irean

---

## 📑 Tabla de Contenidos

- [Introducción](#-introducción)
- [Autenticación](#-autenticación)
- [Estructura de Response](#-estructura-de-response)
- [Query Parameters](#-query-parameters)
- [Endpoints de Productos](#-endpoints-de-productos)
- [Endpoints de Categorías](#-endpoints-de-categorías)
- [Endpoints de Subcategorías](#-endpoints-de-subcategorías)
- [Códigos de Estado](#-códigos-de-estado)
- [Manejo de Errores](#-manejo-de-errores)
- [Ejemplos Completos](#-ejemplos-completos)

---

## 🌐 Introducción

### Base URL

| Entorno        | URL                                  |
| -------------- | ------------------------------------ |
| **Desarrollo** | `http://localhost:1337/api`          |
| **Producción** | `https://tu-backend.railway.app/api` |

### Formato de Datos

- **Content-Type**: `application/json`
- **Charset**: `UTF-8`
- **Response Format**: JSON

### Versionado

Actualmente la API está en su primera versión (v1). No hay prefijo de versión en las URLs.

---

## 🔐 Autenticación

### Endpoints Públicos vs Privados

| Método   | Acceso     | Requerimientos |
| -------- | ---------- | -------------- |
| `GET`    | 🌍 Público | Ninguno        |
| `POST`   | 🔒 Privado | JWT Token      |
| `PUT`    | 🔒 Privado | JWT Token      |
| `DELETE` | 🔒 Privado | JWT Token      |

### Obtener Token JWT

**Request:**

```http
POST /api/auth/local
Content-Type: application/json

{
  "identifier": "admin@irean.com",
  "password": "tu-password"
}
```

**Response:**

```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@irean.com",
    "confirmed": true,
    "blocked": false
  }
}
```

### Usar Token en Requests

```http
GET /api/productos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📦 Estructura de Response

Todas las responses de Strapi siguen esta estructura:

### Response Único

```json
{
  "data": {
    "id": 1,
    "attributes": {
      "nombre": "iPhone 15 Pro",
      "precio": 999.99,
      "createdAt": "2025-10-12T10:00:00.000Z",
      "updatedAt": "2025-10-12T10:00:00.000Z",
      "publishedAt": "2025-10-12T10:00:00.000Z"
    }
  },
  "meta": {}
}
```

### Response Múltiple

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        /* ... */
      }
    },
    {
      "id": 2,
      "attributes": {
        /* ... */
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 4,
      "total": 100
    }
  }
}
```

### Response con Relaciones Pobladas

```json
{
  "data": {
    "id": 1,
    "attributes": {
      "nombre": "iPhone 15 Pro",
      "precio": 999.99,
      "categoria": {
        "data": {
          "id": 5,
          "attributes": {
            "nombre": "Smartphones"
          }
        }
      },
      "imagen": {
        "data": [
          {
            "id": 10,
            "attributes": {
              "name": "iphone-15-pro.jpg",
              "url": "/uploads/iphone_15_pro_abc123.jpg",
              "width": 1200,
              "height": 800
            }
          }
        ]
      }
    }
  }
}
```

---

## 🔍 Query Parameters

### Población de Relaciones

```http
# Poblar todas las relaciones
GET /api/productos?populate=*

# Poblar relación específica
GET /api/productos?populate[categoria]=*

# Poblar relación con campos específicos
GET /api/productos?populate[categoria][fields][0]=nombre

# Poblar múltiples niveles
GET /api/productos?populate[categoria][populate][subcategorias]=*

# Poblar imágenes
GET /api/productos?populate[imagen]=*
```

### Filtrado

```http
# Igual a ($eq)
GET /api/productos?filters[vendido][$eq]=false

# Contiene ($contains)
GET /api/productos?filters[nombre][$contains]=iPhone

# Mayor que ($gt) / Mayor o igual ($gte)
GET /api/productos?filters[precio][$gte]=100

# Menor que ($lt) / Menor o igual ($lte)
GET /api/productos?filters[precio][$lte]=500

# Rango de precios (combinación)
GET /api/productos?filters[precio][$gte]=100&filters[precio][$lte]=500

# Filtros múltiples (AND lógico)
GET /api/productos?filters[vendido][$eq]=false&filters[stock][$gt]=0

# Búsqueda en relaciones
GET /api/productos?filters[categoria][nombre][$eq]=Smartphones
```

### Ordenamiento

```http
# Ascendente
GET /api/productos?sort=precio:asc

# Descendente
GET /api/productos?sort=precio:desc

# Múltiples criterios
GET /api/productos?sort[0]=precio:asc&sort[1]=createdAt:desc
```

### Paginación

```http
# Por página y tamaño
GET /api/productos?pagination[page]=1&pagination[pageSize]=25

# Por offset y limit
GET /api/productos?pagination[start]=0&pagination[limit]=25
```

### Selección de Campos

```http
# Seleccionar campos específicos
GET /api/productos?fields[0]=nombre&fields[1]=precio

# Excluir campos sensibles
GET /api/productos?fields[0]=nombre&fields[1]=precio&fields[2]=descripcion
```

### Publicación

```http
# Solo publicados (default)
GET /api/productos

# Incluir borradores (requiere autenticación)
GET /api/productos?publicationState=preview
```

### Combinación de Query Params

```http
GET /api/productos?populate[categoria]=*&populate[imagen]=*&filters[precio][$lte]=500&filters[stock][$gt]=0&sort=precio:asc&pagination[pageSize]=10
```

---

## 📱 Endpoints de Productos

### 1. Listar Todos los Productos

**Request:**

```http
GET /api/productos
```

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "nombre": "iPhone 15 Pro",
        "precio": 999.99,
        "descripcion": null,
        "vendido": false,
        "stock": 10,
        "slug": "iphone-15-pro",
        "createdAt": "2025-10-12T10:00:00.000Z",
        "updatedAt": "2025-10-12T10:00:00.000Z",
        "publishedAt": "2025-10-12T10:00:00.000Z"
      }
    },
    {
      "id": 2,
      "attributes": {
        "nombre": "MacBook Pro 16",
        "precio": 2499.99,
        "descripcion": null,
        "vendido": false,
        "stock": 5,
        "slug": "macbook-pro-16",
        "createdAt": "2025-10-12T11:00:00.000Z",
        "updatedAt": "2025-10-12T11:00:00.000Z",
        "publishedAt": "2025-10-12T11:00:00.000Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 2
    }
  }
}
```

### 2. Obtener un Producto Específico

**Request:**

```http
GET /api/productos/1
GET /api/productos/1?populate=*
```

**Response:** `200 OK`

```json
{
  "data": {
    "id": 1,
    "attributes": {
      "nombre": "iPhone 15 Pro",
      "precio": 999.99,
      "descripcion": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "El iPhone 15 Pro con chip A17 Pro y cámara de 48MP."
            }
          ]
        }
      ],
      "vendido": false,
      "stock": 10,
      "slug": "iphone-15-pro",
      "createdAt": "2025-10-12T10:00:00.000Z",
      "updatedAt": "2025-10-12T10:00:00.000Z",
      "publishedAt": "2025-10-12T10:00:00.000Z",
      "categoria": {
        "data": {
          "id": 5,
          "attributes": {
            "nombre": "Smartphones",
            "descripcion": "Teléfonos inteligentes de última generación"
          }
        }
      },
      "subcategoria": {
        "data": {
          "id": 12,
          "attributes": {
            "nombre": "iPhone",
            "descripcion": "Smartphones Apple"
          }
        }
      },
      "imagen": {
        "data": [
          {
            "id": 10,
            "attributes": {
              "name": "iphone-15-pro.jpg",
              "alternativeText": null,
              "caption": null,
              "width": 1200,
              "height": 800,
              "formats": {
                "thumbnail": {
                  "url": "/uploads/thumbnail_iphone_15_pro_abc123.jpg",
                  "width": 234,
                  "height": 156
                },
                "medium": {
                  "url": "/uploads/medium_iphone_15_pro_abc123.jpg",
                  "width": 750,
                  "height": 500
                }
              },
              "hash": "iphone_15_pro_abc123",
              "ext": ".jpg",
              "mime": "image/jpeg",
              "size": 125.45,
              "url": "/uploads/iphone_15_pro_abc123.jpg",
              "createdAt": "2025-10-12T10:00:00.000Z",
              "updatedAt": "2025-10-12T10:00:00.000Z"
            }
          }
        ]
      }
    }
  },
  "meta": {}
}
```

### 3. Crear Producto

🔒 **Requiere autenticación**

**Request:**

```http
POST /api/productos
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "data": {
    "nombre": "iPad Air M2",
    "precio": 599.99,
    "descripcion": [
      {
        "type": "paragraph",
        "children": [
          {
            "type": "text",
            "text": "iPad Air con chip M2, pantalla Liquid Retina de 11 pulgadas."
          }
        ]
      }
    ],
    "stock": 15,
    "slug": "ipad-air-m2",
    "vendido": false
  }
}
```

**Response:** `201 Created`

```json
{
  "data": {
    "id": 3,
    "attributes": {
      "nombre": "iPad Air M2",
      "precio": 599.99,
      "descripcion": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "iPad Air con chip M2, pantalla Liquid Retina de 11 pulgadas."
            }
          ]
        }
      ],
      "vendido": false,
      "stock": 15,
      "slug": "ipad-air-m2",
      "createdAt": "2025-10-12T15:30:00.000Z",
      "updatedAt": "2025-10-12T15:30:00.000Z",
      "publishedAt": null
    }
  },
  "meta": {}
}
```

### 4. Actualizar Producto

🔒 **Requiere autenticación**

**Request:**

```http
PUT /api/productos/3
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "data": {
    "precio": 549.99,
    "stock": 20
  }
}
```

**Response:** `200 OK`

```json
{
  "data": {
    "id": 3,
    "attributes": {
      "nombre": "iPad Air M2",
      "precio": 549.99,
      "descripcion": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "iPad Air con chip M2, pantalla Liquid Retina de 11 pulgadas."
            }
          ]
        }
      ],
      "vendido": false,
      "stock": 20,
      "slug": "ipad-air-m2",
      "createdAt": "2025-10-12T15:30:00.000Z",
      "updatedAt": "2025-10-12T16:00:00.000Z",
      "publishedAt": null
    }
  },
  "meta": {}
}
```

### 5. Eliminar Producto

🔒 **Requiere autenticación**

**Request:**

```http
DELETE /api/productos/3
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:** `200 OK`

```json
{
  "data": {
    "id": 3,
    "attributes": {
      "nombre": "iPad Air M2",
      "precio": 549.99,
      "descripcion": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "iPad Air con chip M2, pantalla Liquid Retina de 11 pulgadas."
            }
          ]
        }
      ],
      "vendido": false,
      "stock": 20,
      "slug": "ipad-air-m2",
      "createdAt": "2025-10-12T15:30:00.000Z",
      "updatedAt": "2025-10-12T16:00:00.000Z",
      "publishedAt": null
    }
  },
  "meta": {}
}
```

---

## 📂 Endpoints de Categorías

### 1. Listar Todas las Categorías

**Request:**

```http
GET /api/categorias
GET /api/categorias?populate[subcategorias]=*
```

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "nombre": "Electrónica",
        "descripcion": "Dispositivos electrónicos y gadgets",
        "createdAt": "2025-10-01T00:00:00.000Z",
        "updatedAt": "2025-10-01T00:00:00.000Z",
        "publishedAt": "2025-10-01T00:00:00.000Z",
        "subcategorias": {
          "data": [
            {
              "id": 1,
              "attributes": {
                "nombre": "Smartphones",
                "descripcion": "Teléfonos inteligentes"
              }
            },
            {
              "id": 2,
              "attributes": {
                "nombre": "Laptops",
                "descripcion": "Computadoras portátiles"
              }
            }
          ]
        }
      }
    },
    {
      "id": 2,
      "attributes": {
        "nombre": "Hogar",
        "descripcion": "Artículos para el hogar",
        "createdAt": "2025-10-02T00:00:00.000Z",
        "updatedAt": "2025-10-02T00:00:00.000Z",
        "publishedAt": "2025-10-02T00:00:00.000Z",
        "subcategorias": {
          "data": []
        }
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 2
    }
  }
}
```

### 2. Obtener una Categoría Específica

**Request:**

```http
GET /api/categorias/1
GET /api/categorias/1?populate=*
```

**Response:** `200 OK`

```json
{
  "data": {
    "id": 1,
    "attributes": {
      "nombre": "Electrónica",
      "descripcion": "Dispositivos electrónicos y gadgets",
      "createdAt": "2025-10-01T00:00:00.000Z",
      "updatedAt": "2025-10-01T00:00:00.000Z",
      "publishedAt": "2025-10-01T00:00:00.000Z"
    }
  },
  "meta": {}
}
```

### 3. Crear Categoría

🔒 **Requiere autenticación**

**Request:**

```http
POST /api/categorias
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "data": {
    "nombre": "Moda",
    "descripcion": "Ropa y accesorios"
  }
}
```

**Response:** `201 Created`

```json
{
  "data": {
    "id": 3,
    "attributes": {
      "nombre": "Moda",
      "descripcion": "Ropa y accesorios",
      "createdAt": "2025-10-12T16:00:00.000Z",
      "updatedAt": "2025-10-12T16:00:00.000Z",
      "publishedAt": null
    }
  },
  "meta": {}
}
```

### 4. Actualizar Categoría

🔒 **Requiere autenticación**

**Request:**

```http
PUT /api/categorias/3
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "data": {
    "descripcion": "Moda y accesorios de tendencia"
  }
}
```

**Response:** `200 OK`

### 5. Eliminar Categoría

🔒 **Requiere autenticación**

**Request:**

```http
DELETE /api/categorias/3
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:** `200 OK`

---

## 🏷️ Endpoints de Subcategorías

### 1. Listar Todas las Subcategorías

**Request:**

```http
GET /api/subcategorias
GET /api/subcategorias?populate[categoria]=*
```

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "nombre": "Smartphones",
        "descripcion": "Teléfonos inteligentes",
        "createdAt": "2025-10-01T00:00:00.000Z",
        "updatedAt": "2025-10-01T00:00:00.000Z",
        "publishedAt": "2025-10-01T00:00:00.000Z",
        "categoria": {
          "data": {
            "id": 1,
            "attributes": {
              "nombre": "Electrónica"
            }
          }
        }
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

### 2. Obtener una Subcategoría Específica

**Request:**

```http
GET /api/subcategorias/1
GET /api/subcategorias/1?populate=*
```

**Response:** `200 OK`

### 3. Crear Subcategoría

🔒 **Requiere autenticación**

**Request:**

```http
POST /api/subcategorias
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "data": {
    "nombre": "Tablets",
    "descripcion": "Tabletas y iPads",
    "categoria": 1
  }
}
```

**Response:** `201 Created`

### 4. Actualizar Subcategoría

🔒 **Requiere autenticación**

**Request:**

```http
PUT /api/subcategorias/2
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "data": {
    "descripcion": "Tablets y dispositivos portátiles"
  }
}
```

**Response:** `200 OK`

### 5. Eliminar Subcategoría

🔒 **Requiere autenticación**

**Request:**

```http
DELETE /api/subcategorias/2
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:** `200 OK`

---

## 📊 Códigos de Estado

| Código | Significado           | Descripción                                |
| ------ | --------------------- | ------------------------------------------ |
| `200`  | OK                    | Request exitoso                            |
| `201`  | Created               | Recurso creado exitosamente                |
| `204`  | No Content            | Request exitoso sin contenido en respuesta |
| `400`  | Bad Request           | Request malformado o inválido              |
| `401`  | Unauthorized          | Token JWT faltante o inválido              |
| `403`  | Forbidden             | No tienes permisos para este recurso       |
| `404`  | Not Found             | Recurso no encontrado                      |
| `500`  | Internal Server Error | Error del servidor                         |

---

## ⚠️ Manejo de Errores

### Estructura de Error

```json
{
  "error": {
    "status": 400,
    "name": "ValidationError",
    "message": "Missing required fields",
    "details": {
      "errors": [
        {
          "path": ["nombre"],
          "message": "nombre is a required field",
          "name": "ValidationError"
        }
      ]
    }
  }
}
```

### Errores Comunes

#### Error 400 - Bad Request

```json
{
  "error": {
    "status": 400,
    "name": "ValidationError",
    "message": "precio must be a number",
    "details": {}
  }
}
```

#### Error 401 - Unauthorized

```json
{
  "error": {
    "status": 401,
    "name": "UnauthorizedError",
    "message": "Missing or invalid credentials",
    "details": {}
  }
}
```

#### Error 404 - Not Found

```json
{
  "error": {
    "status": 404,
    "name": "NotFoundError",
    "message": "producto with id 999 not found",
    "details": {}
  }
}
```

---

## 💻 Ejemplos Completos

### Ejemplo 1: Obtener Productos con Filtros

**Request:**

```bash
curl -X GET \
  'http://localhost:1337/api/productos?populate[categoria]=*&populate[imagen]=*&filters[precio][$gte]=500&filters[precio][$lte]=1000&filters[stock][$gt]=0&sort=precio:asc&pagination[pageSize]=10' \
  -H 'Content-Type: application/json'
```

**Equivalente en JavaScript (Fetch):**

```javascript
const fetchProducts = async () => {
  const params = new URLSearchParams({
    "populate[categoria]": "*",
    "populate[imagen]": "*",
    "filters[precio][$gte]": "500",
    "filters[precio][$lte]": "1000",
    "filters[stock][$gt]": "0",
    sort: "precio:asc",
    "pagination[pageSize]": "10",
  });

  const response = await fetch(`http://localhost:1337/api/productos?${params}`);

  const data = await response.json();
  return data;
};
```

### Ejemplo 2: Crear Producto con Imagen

**Step 1: Upload de Imagen**

```bash
curl -X POST \
  http://localhost:1337/api/upload \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -F 'files=@/path/to/product-image.jpg'
```

**Response:**

```json
[
  {
    "id": 15,
    "name": "product-image.jpg",
    "url": "/uploads/product_image_xyz789.jpg"
  }
]
```

**Step 2: Crear Producto con ID de Imagen**

```bash
curl -X POST \
  http://localhost:1337/api/productos \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "data": {
      "nombre": "Samsung Galaxy S24",
      "precio": 899.99,
      "stock": 25,
      "slug": "samsung-galaxy-s24",
      "imagen": [15]
    }
  }'
```

### Ejemplo 3: Búsqueda de Productos

**JavaScript Example:**

```javascript
const searchProducts = async (searchTerm) => {
  const params = new URLSearchParams({
    "filters[nombre][$containsi]": searchTerm,
    populate: "*",
    "pagination[pageSize]": "20",
  });

  const response = await fetch(`http://localhost:1337/api/productos?${params}`);

  if (!response.ok) {
    throw new Error("Error al buscar productos");
  }

  const data = await response.json();
  return data.data;
};

// Uso
const results = await searchProducts("iPhone");
console.log(results);
```

### Ejemplo 4: Paginación Completa

**Next.js Example:**

```typescript
interface PaginationInfo {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

const fetchProductsWithPagination = async (
  page: number = 1,
  pageSize: number = 25
) => {
  const params = new URLSearchParams({
    'pagination[page]': page.toString(),
    'pagination[pageSize]': pageSize.toString(),
    'populate': '*'
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/productos?${params}`
  );

  const data = await response.json();

  return {
    products: data.data,
    pagination: data.meta.pagination as PaginationInfo
  };
};

// Uso en componente
export default async function ProductsPage({
  searchParams
}: {
  searchParams: { page?: string }
}) {
  const currentPage = Number(searchParams.page) || 1;
  const { products, pagination } = await fetchProductsWithPagination(currentPage);

  return (
    <div>
      <h1>Productos (Página {currentPage} de {pagination.pageCount})</h1>
      {/* Renderizar productos */}
    </div>
  );
}
```

---

## 📚 Recursos Adicionales

- [Strapi REST API Docs](https://docs.strapi.io/dev-docs/api/rest)
- [Strapi Filters](https://docs.strapi.io/dev-docs/api/rest/filters-locale-publication)
- [Strapi Populate](https://docs.strapi.io/dev-docs/api/rest/populate-select)
- [Backend README](./README.md)
- [Arquitectura del Sistema](../docs/ARCHITECTURE.md)

---

<div align="center">

**[⬆ Volver arriba](#-api-reference---irean-backend)**

**[📖 Ver README del Backend](./README.md)**

</div>
