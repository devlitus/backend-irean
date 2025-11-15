'use strict';

/**
 * Script de seed para producción
 * Carga categorías, subcategorías y productos del e-commerce Irean
 * Se ejecuta automáticamente en el primer deploy
 *
 * Datos sincronizados:
 * - 4 Categorías (Nacimiento, Infantil, Ceremonia, Juvenil)
 * - 3 Subcategorías (Vautismo, Comunión, Acompañante)
 * - 4 Productos de ropa infantil
 * - Soporte multiidioma: ES, EN, CA
 *
 * Uso:
 * - Como bootstrap: Se ejecuta automáticamente en producción
 * - Manual: npm run seed:production
 */

// Datos de categorías con soporte multiidioma
const CATEGORIES_DATA = [
  {
    names: {
      'es-ES': 'Nacimiento',
      en: 'Birth',
      ca: 'Naixement',
    },
  },
  {
    names: {
      'es-ES': 'Infantil',
      en: 'Children',
      ca: 'Infantil',
    },
  },
  {
    names: {
      'es-ES': 'Ceremonia',
      en: 'Ceremony',
      ca: 'Cerimònia',
    },
  },
  {
    names: {
      'es-ES': 'Juvenil',
      en: 'Youth',
      ca: 'Juvenil',
    },
  },
];

// Datos de subcategorías con soporte multiidioma
const SUBCATEGORIES_DATA = [
  {
    names: {
      'es-ES': 'Vautismo',
      en: 'Autism',
      ca: 'Vautisme',
    },
    categoryName: 'Ceremonia',
  },
  {
    names: {
      'es-ES': 'Comunión',
      en: 'Communion',
      ca: 'Comunió',
    },
    categoryName: 'Ceremonia',
  },
  {
    names: {
      'es-ES': 'Acompañante',
      en: 'Companion',
      ca: 'Acompanyant',
    },
    categoryName: 'Ceremonia',
  },
];

// Datos de productos con soporte multiidioma
const PRODUCTS_DATA = [
  {
    names: {
      'es-ES': 'Chaqueta de ceremonia azul marino',
      en: 'Navy ceremony jacket',
      ca: 'Jaqueta de cerimònia blau marí',
    },
    gender: 'niño',
    type: 'chaqueta',
    price: 45.99,
    stock: 20,
  },
  {
    names: {
      'es-ES': 'Vestido de comunión blanco',
      en: 'White communion dress',
      ca: 'Vestit de comunió blanc',
    },
    gender: 'niña',
    type: 'vestido',
    price: 55.5,
    stock: 15,
  },
  {
    names: {
      'es-ES': 'Pantalón gris infantil',
      en: 'Gray children pants',
      ca: 'Pantaló gris infantil',
    },
    gender: 'niño',
    type: 'pantalón',
    price: 25.75,
    stock: 30,
  },
  {
    names: {
      'es-ES': 'Blusa rosa pálido',
      en: 'Pale pink blouse',
      ca: 'Blusa rosa pàl·lid',
    },
    gender: 'niña',
    type: 'blusa',
    price: 28.99,
    stock: 18,
  },
];

async function seedProduction() {
  const shouldSeed = await shouldRunSeed();

  if (!shouldSeed) {
    console.log(
      '⏭️  Seed de producción ya ha sido ejecutado. Omitiendo...'
    );
    return;
  }

  try {
    console.log(
      '\n🌱 Iniciando seed de producción - Irean E-commerce'
    );
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n📁 Sincronizando categorías...');
    await syncCategories();

    console.log('\n📂 Sincronizando subcategorías...');
    await syncSubcategories();

    console.log('\n📦 Sincronizando productos...');
    await syncProducts();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Seed de producción completado exitosamente\n');
  } catch (error) {
    console.error('\n❌ Error durante el seed:', error);
    throw error;
  }
}

async function shouldRunSeed() {
  try {
    const pluginStore = strapi.store({
      environment: strapi.config.environment,
      type: 'type',
      name: 'setup-ecommerce',
    });
    const hasRun = await pluginStore.get({
      key: 'seedProductionHasRun',
    });
    await pluginStore.set({
      key: 'seedProductionHasRun',
      value: true,
    });
    return !hasRun;
  } catch (error) {
    console.log('⚠️  No se pudo verificar estado del seed, continuando...');
    return true;
  }
}

async function syncCategories() {
  for (const categoryData of CATEGORIES_DATA) {
    try {
      // Verificar si la categoría ya existe en español (idioma base)
      const existing = await strapi
        .documents('api::category.category')
        .findMany({
          filters: { name: categoryData.names['es-ES'] },
          locale: 'es-ES',
        });

      if (existing.length > 0) {
        console.log(
          `  ⏭️  Categoría "${categoryData.names['es-ES']}" ya existe, omitiendo...`
        );
        continue;
      }

      // Crear la categoría en español (idioma por defecto)
      const category = await strapi
        .documents('api::category.category')
        .create(
          {
            name: categoryData.names['es-ES'],
            slug: categoryData.names['es-ES'],
            visible: true,
          },
          { locale: 'es-ES' }
        );

      console.log(`  ✅ Categoría creada: "${categoryData.names['es-ES']}"`);

      // Crear localizaciones en otros idiomas
      try {
        // Versión en inglés
        await strapi.documents('api::category.category').create(
          {
            name: categoryData.names.en,
            slug: categoryData.names.en,
            visible: true,
          },
          { documentId: category.documentId, locale: 'en' }
        );
        console.log(`    └─ Versión EN creada`);
      } catch (err) {
        console.log(`    └─ EN ya existe o error: ${err.message}`);
      }

      try {
        // Versión en catalán
        await strapi.documents('api::category.category').create(
          {
            name: categoryData.names.ca,
            slug: categoryData.names.ca,
            visible: true,
          },
          { documentId: category.documentId, locale: 'ca' }
        );
        console.log(`    └─ Versión CA creada`);
      } catch (err) {
        console.log(`    └─ CA ya existe o error: ${err.message}`);
      }
    } catch (error) {
      console.error(
        `  ❌ Error al sincronizar categoría "${categoryData.names['es-ES']}":`,
        error.message
      );
    }
  }
}

async function syncSubcategories() {
  for (const subcategoryData of SUBCATEGORIES_DATA) {
    try {
      // Verificar si la subcategoría ya existe en español (idioma base)
      const existing = await strapi
        .documents('api::subcategory.subcategory')
        .findMany({
          filters: { name: subcategoryData.names['es-ES'] },
          locale: 'es-ES',
        });

      if (existing.length > 0) {
        console.log(
          `  ⏭️  Subcategoría "${subcategoryData.names['es-ES']}" ya existe, omitiendo...`
        );
        continue;
      }

      // Obtener la categoría padre (en español)
      const parentCategory = await strapi
        .documents('api::category.category')
        .findMany({
          filters: { name: subcategoryData.categoryName },
          locale: 'es-ES',
        });

      if (parentCategory.length === 0) {
        console.log(
          `  ⚠️  Categoría padre "${subcategoryData.categoryName}" no encontrada para subcategoría "${subcategoryData.names['es-ES']}"`
        );
        continue;
      }

      // Crear la subcategoría en español (idioma por defecto)
      const subcategory = await strapi
        .documents('api::subcategory.subcategory')
        .create(
          {
            name: subcategoryData.names['es-ES'],
            slug: subcategoryData.names['es-ES'],
            visible: true,
            category: parentCategory[0].documentId, // Vincular a la categoría padre
          },
          { locale: 'es-ES' }
        );

      console.log(
        `  ✅ Subcategoría creada: "${subcategoryData.names['es-ES']}" → "${subcategoryData.categoryName}"`
      );

      // Crear localizaciones en otros idiomas
      try {
        // Versión en inglés
        await strapi.documents('api::subcategory.subcategory').create(
          {
            name: subcategoryData.names.en,
            slug: subcategoryData.names.en,
            visible: true,
            category: parentCategory[0].documentId,
          },
          { documentId: subcategory.documentId, locale: 'en' }
        );
        console.log(`    └─ Versión EN creada`);
      } catch (err) {
        console.log(`    └─ EN ya existe o error: ${err.message}`);
      }

      try {
        // Versión en catalán
        await strapi.documents('api::subcategory.subcategory').create(
          {
            name: subcategoryData.names.ca,
            slug: subcategoryData.names.ca,
            visible: true,
            category: parentCategory[0].documentId,
          },
          { documentId: subcategory.documentId, locale: 'ca' }
        );
        console.log(`    └─ Versión CA creada`);
      } catch (err) {
        console.log(`    └─ CA ya existe o error: ${err.message}`);
      }
    } catch (error) {
      console.error(
        `  ❌ Error al sincronizar subcategoría "${subcategoryData.names['es-ES']}":`,
        error.message
      );
    }
  }
}

async function syncProducts() {
  for (const productData of PRODUCTS_DATA) {
    try {
      // Verificar si el producto ya existe en español (idioma base)
      const existing = await strapi
        .documents('api::product.product')
        .findMany({
          filters: { name: productData.names['es-ES'] },
          locale: 'es-ES',
        });

      if (existing.length > 0) {
        console.log(
          `  ⏭️  Producto "${productData.names['es-ES'].substring(0, 30)}..." ya existe, omitiendo...`
        );
        continue;
      }

      // Crear el producto en español (idioma por defecto)
      const product = await strapi
        .documents('api::product.product')
        .create(
          {
            name: productData.names['es-ES'],
            gender: productData.gender,
            type: productData.type,
            price: productData.price,
            stock: productData.stock,
            visible: true,
          },
          { locale: 'es-ES' }
        );

      console.log(
        `  ✅ Producto creado: "${productData.names['es-ES'].substring(0, 30)}..." (${productData.gender})`
      );

      // Crear localizaciones en otros idiomas
      try {
        // Versión en inglés
        await strapi.documents('api::product.product').create(
          {
            name: productData.names.en,
            gender: productData.gender,
            type: productData.type,
            price: productData.price,
            stock: productData.stock,
            visible: true,
          },
          { documentId: product.documentId, locale: 'en' }
        );
        console.log(`    └─ Versión EN creada`);
      } catch (err) {
        console.log(`    └─ EN ya existe o error: ${err.message}`);
      }

      try {
        // Versión en catalán
        await strapi.documents('api::product.product').create(
          {
            name: productData.names.ca,
            gender: productData.gender,
            type: productData.type,
            price: productData.price,
            stock: productData.stock,
            visible: true,
          },
          { documentId: product.documentId, locale: 'ca' }
        );
        console.log(`    └─ Versión CA creada`);
      } catch (err) {
        console.log(`    └─ CA ya existe o error: ${err.message}`);
      }
    } catch (error) {
      console.error(
        `  ❌ Error al sincronizar producto "${productData.names['es-ES']}":`,
        error.message
      );
    }
  }
}

module.exports = seedProduction;
