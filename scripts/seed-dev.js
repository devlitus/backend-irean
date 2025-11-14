'use strict';

/**
 * Script de seed para desarrollo
 * Sincroniza categorías, subcategorías y productos del e-commerce desde la BD
 * Se ejecuta automáticamente al iniciar en desarrollo
 *
 * Uso:
 * - Automático: Se ejecuta al iniciar Strapi en desarrollo
 * - Manual: npm run seed:dev
 *
 * Estructura: Tienda de ropa infantil
 * - Categorías: Nacimiento, Infantil, Ceremonia, Juvenil
 * - Subcategorías: Bautismo, Comunión, Acompañante (vinculadas a Ceremonia)
 * - Productos: Ropa infantil con género (boy/girl) y tipo (outfit, pelele, dress)
 */

// Datos reales de la tienda - Categorías base (documentId, nombre en español)
const CATEGORIES_DATA = [
  {
    documentId: 'nmqhj0kl49p84tdcdm1bixc3',
    names: { 'es-ES': 'nacimiento', en: 'newborn', ca: 'naixament' },
  },
  {
    documentId: 'eydzugwmxj3ls5vj7ieoj926',
    names: { 'es-ES': 'infantil', en: 'child', ca: 'infentil' },
  },
  {
    documentId: 'q007nawhs1qzk7ccz61sk5yj',
    names: { 'es-ES': 'ceremonia', en: 'ceremony', ca: 'cerimonia' },
  },
  {
    documentId: 'b111zg7dodnv0gpqclpk0xra',
    names: { 'es-ES': 'juvenil', en: 'juvenile', ca: 'juvenil' },
  },
];

// Subcategorías reales - Solo las que tienen categoría asignada
const SUBCATEGORIES_DATA = [
  {
    documentId: 'b6nsyizbe0ywxbi7lbdmpny2',
    names: { 'es-ES': 'vautismo', en: 'baptism', ca: 'bautismo' },
    categoryName: 'ceremonia', // Vinculada a Ceremonia
  },
  {
    documentId: 'aw74feak78rgdmg152of4z0d',
    names: { 'es-ES': 'cominion', en: 'communion', ca: 'comunió' },
    categoryName: 'ceremonia', // Vinculada a Ceremonia
  },
  {
    documentId: 'd5rmnlint4swkw09uei56i6g',
    names: { 'es-ES': 'acompañante', en: 'companion', ca: 'acompanyant' },
    categoryName: 'ceremonia', // Vinculada a Ceremonia
  },
];

// Productos reales de la tienda
const PRODUCTS_DATA = [
  {
    documentId: 'tiye6harv9qprdeswtmn409o',
    names: { 'es-ES': 'Body rosa para bebé con encaje floral y diadem', en: 'Pink baby bodysuit with floral lace and headband' },
    gender: 'girl',
    type: 'outfit',
    price: 34.54,
    stock: 5,
  },
  {
    documentId: 'dpfrlyn0lrhoeo2c92sx46r2',
    names: { 'es-ES': 'Conjunto de punto para bebé azul con encaje', en: 'Blue knit set for baby with lace' },
    gender: 'boy',
    type: 'outfit',
    price: 45.00,
    stock: 5,
  },
  {
    documentId: 'iurd6s5g6k8jlugt0geslsf9',
    names: { 'es-ES': 'Traje formal infantil azul marino con corbata estampada', en: 'Navy blue formal suit for children with patterned tie' },
    gender: 'boy',
    type: null,
    price: 105.25,
    stock: 4,
  },
  {
    documentId: 'kmnsbg1f3oc4ho4fcefi0sdz',
    names: { 'es-ES': 'Vestido amarillo infantil con volantes y sombrero de paja', en: 'Yellow children dress with ruffles and straw hat' },
    gender: 'girl',
    type: 'dress',
    price: 55.00,
    stock: 3,
  },
];

async function seedDevelopment() {
  const shouldSeed = await shouldRunSeed();

  if (!shouldSeed) {
    console.log('✅ Seed de desarrollo ya ha sido ejecutado. Omitiendo...');
    return;
  }

  try {
    console.log('🌱 Iniciando sincronización de datos de desarrollo...');
    console.log('📦 Sincronizando categorías...');
    await syncCategories();
    console.log('📁 Sincronizando subcategorías...');
    await syncSubcategories();
    console.log('👕 Sincronizando productos...');
    await syncProducts();
    console.log('✅ Seed completado exitosamente');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  }
}

async function shouldRunSeed() {
  try {
    const pluginStore = strapi.store({
      environment: strapi.config.environment,
      type: 'type',
      name: 'setup-ecommerce-dev',
    });
    const hasRun = await pluginStore.get({ key: 'seedDevelopmentHasRun' });
    await pluginStore.set({ key: 'seedDevelopmentHasRun', value: true });
    return !hasRun;
  } catch (error) {
    console.log('ℹ️  No se pudo verificar estado del seed, continuando...');
    return true;
  }
}

async function syncCategories() {
  for (const categoryData of CATEGORIES_DATA) {
    try {
      // Verificar si la categoría ya existe
      const existing = await strapi
        .documents('api::category.category')
        .findMany({
          filters: { name: categoryData.names['es-ES'] },
        });

      if (existing.length > 0) {
        console.log(
          `  ⏭️  Categoría "${categoryData.names['es-ES']}" ya existe, omitiendo...`
        );
        continue;
      }

      // Crear la categoría en español
      const category = await strapi
        .documents('api::category.category')
        .create({
          data: {
            name: categoryData.names['es-ES'],
            slug: categoryData.names['es-ES'],
            visible: true,
            locale: 'es-ES',
          },
        });

      console.log(`  ✅ Categoría creada: "${categoryData.names['es-ES']}"`);

      // Crear versiones en otros idiomas (localización)
      try {
        // Versión en inglés
        await strapi.documents('api::category.category').create({
          data: {
            name: categoryData.names.en,
            slug: categoryData.names.en,
            visible: true,
            locale: 'en',
          },
          documentId: category.documentId,
        });
        console.log(`    └─ Versión EN creada`);
      } catch (err) {
        console.log(`    └─ EN ya existe o no es necesario crear`);
      }

      try {
        // Versión en catalán
        await strapi.documents('api::category.category').create({
          data: {
            name: categoryData.names.ca,
            slug: categoryData.names.ca,
            visible: true,
            locale: 'ca',
          },
          documentId: category.documentId,
        });
        console.log(`    └─ Versión CA creada`);
      } catch (err) {
        console.log(`    └─ CA ya existe o no es necesario crear`);
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
      // Verificar si la subcategoría ya existe
      const existing = await strapi
        .documents('api::subcategory.subcategory')
        .findMany({
          filters: { name: subcategoryData.names['es-ES'] },
        });

      if (existing.length > 0) {
        console.log(
          `  ⏭️  Subcategoría "${subcategoryData.names['es-ES']}" ya existe, omitiendo...`
        );
        continue;
      }

      // Obtener la categoría padre
      const parentCategory = await strapi
        .documents('api::category.category')
        .findMany({
          filters: { name: subcategoryData.categoryName },
        });

      if (parentCategory.length === 0) {
        console.log(
          `  ⚠️  Categoría padre "${subcategoryData.categoryName}" no encontrada para subcategoría "${subcategoryData.names['es-ES']}"`
        );
        continue;
      }

      // Crear la subcategoría en español
      const subcategory = await strapi
        .documents('api::subcategory.subcategory')
        .create({
          data: {
            name: subcategoryData.names['es-ES'],
            slug: subcategoryData.names['es-ES'],
            visible: true,
            category: parentCategory[0].documentId, // Vincular a la categoría padre
            locale: 'es-ES',
          },
        });

      console.log(
        `  ✅ Subcategoría creada: "${subcategoryData.names['es-ES']}" → "${subcategoryData.categoryName}"`
      );

      // Crear versiones en otros idiomas
      try {
        // Versión en inglés
        await strapi.documents('api::subcategory.subcategory').create({
          data: {
            name: subcategoryData.names.en,
            slug: subcategoryData.names.en,
            visible: true,
            category: parentCategory[0].documentId,
            locale: 'en',
          },
          documentId: subcategory.documentId,
        });
        console.log(`    └─ Versión EN creada`);
      } catch (err) {
        console.log(`    └─ EN ya existe o no es necesario crear`);
      }

      try {
        // Versión en catalán
        await strapi.documents('api::subcategory.subcategory').create({
          data: {
            name: subcategoryData.names.ca,
            slug: subcategoryData.names.ca,
            visible: true,
            category: parentCategory[0].documentId,
            locale: 'ca',
          },
          documentId: subcategory.documentId,
        });
        console.log(`    └─ Versión CA creada`);
      } catch (err) {
        console.log(`    └─ CA ya existe o no es necesario crear`);
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
      // Verificar si el producto ya existe
      const existing = await strapi
        .documents('api::product.product')
        .findMany({
          filters: { name: productData.names['es-ES'] },
        });

      if (existing.length > 0) {
        console.log(
          `  ⏭️  Producto "${productData.names['es-ES'].substring(0, 30)}..." ya existe, omitiendo...`
        );
        continue;
      }

      // Crear el producto en español
      const product = await strapi
        .documents('api::product.product')
        .create({
          data: {
            name: productData.names['es-ES'],
            gender: productData.gender,
            type: productData.type,
            price: productData.price,
            stock: productData.stock,
            visible: true,
            locale: 'es-ES',
          },
        });

      console.log(
        `  ✅ Producto creado: "${productData.names['es-ES'].substring(0, 30)}..." (${productData.gender})`
      );

      // Crear versión en inglés
      try {
        await strapi.documents('api::product.product').create({
          data: {
            name: productData.names.en,
            gender: productData.gender,
            type: productData.type,
            price: productData.price,
            stock: productData.stock,
            visible: true,
            locale: 'en',
          },
          documentId: product.documentId,
        });
        console.log(`    └─ Versión EN creada`);
      } catch (err) {
        console.log(`    └─ EN ya existe o no es necesario crear`);
      }
    } catch (error) {
      console.error(
        `  ❌ Error al sincronizar producto "${productData.names['es-ES']}":`,
        error.message
      );
    }
  }
}

module.exports = seedDevelopment;
