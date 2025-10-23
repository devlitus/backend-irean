'use strict';

/**
 * Script de seed para producción
 * Carga categorías y subcategorías del e-commerce
 * Se ejecuta automáticamente en cada deploy
 *
 * Uso:
 * - Como bootstrap: Se ejecuta automáticamente en producción
 * - Manual: npm run seed:production
 */

// Datos de categorías y subcategorías
const CATEGORIES_DATA = [
  {
    nombre: 'Electrónica',
    descripcion: 'Productos electrónicos y tecnología',
    subcategorias: [
      { nombre: 'Computadoras', descripcion: 'Laptops, desktops y monitores' },
      { nombre: 'Móviles', descripcion: 'Smartphones y tablets' },
      { nombre: 'Accesorios', descripcion: 'Cables, cargadores y otros accesorios' },
    ],
  },
  {
    nombre: 'Ropa',
    descripcion: 'Prendas de vestir para todas las edades',
    subcategorias: [
      { nombre: 'Hombre', descripcion: 'Ropa para hombre' },
      { nombre: 'Mujer', descripcion: 'Ropa para mujer' },
      { nombre: 'Niños', descripcion: 'Ropa para niños' },
    ],
  },
  {
    nombre: 'Hogar',
    descripcion: 'Artículos para el hogar y decoración',
    subcategorias: [
      { nombre: 'Muebles', descripcion: 'Muebles y estructuras' },
      { nombre: 'Decoración', descripcion: 'Artículos decorativos' },
      { nombre: 'Cocina', descripcion: 'Artículos de cocina' },
    ],
  },
];

async function seedProduction() {
  const shouldSeed = await shouldRunSeed();

  if (!shouldSeed) {
    console.log('Seed de producción ya ha sido ejecutado. Omitiendo...');
    return;
  }

  try {
    console.log('🌱 Iniciando seed de categorías y subcategorías...');
    await createCategories();
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
      name: 'setup-ecommerce',
    });
    const hasRun = await pluginStore.get({ key: 'seedProductionHasRun' });
    await pluginStore.set({ key: 'seedProductionHasRun', value: true });
    return !hasRun;
  } catch (error) {
    console.log('No se pudo verificar estado del seed, continuando...');
    return true;
  }
}

async function createCategories() {
  for (const categoryData of CATEGORIES_DATA) {
    try {
      // Verificar si la categoría ya existe
      const existingCategory = await strapi
        .documents('api::categoria.categoria')
        .findMany({
          filters: { nombre: categoryData.nombre },
        });

      if (existingCategory.length > 0) {
        console.log(`⏭️  Categoría "${categoryData.nombre}" ya existe, omitiendo...`);
        continue;
      }

      // Crear la categoría
      const categoria = await strapi
        .documents('api::categoria.categoria')
        .create({
          data: {
            nombre: categoryData.nombre,
            descripcion: categoryData.descripcion,
            publishedAt: new Date().toISOString(), // Publicar automáticamente
          },
        });

      console.log(`✅ Categoría creada: "${categoryData.nombre}"`);

      // Crear subcategorías
      for (const subcategoriaData of categoryData.subcategorias) {
        try {
          // Verificar si la subcategoría ya existe
          const existingSubcategory = await strapi
            .documents('api::subcategoria.subcategoria')
            .findMany({
              filters: { nombre: subcategoriaData.nombre },
            });

          if (existingSubcategory.length > 0) {
            console.log(
              `  ⏭️  Subcategoría "${subcategoriaData.nombre}" ya existe, omitiendo...`
            );
            continue;
          }

          // Crear la subcategoría
          const subcategoria = await strapi
            .documents('api::subcategoria.subcategoria')
            .create({
              data: {
                nombre: subcategoriaData.nombre,
                descripcion: subcategoriaData.descripcion,
                categoria: categoria.documentId, // Vincular a la categoría
                publishedAt: new Date().toISOString(), // Publicar automáticamente
              },
            });

          console.log(
            `  ✅ Subcategoría creada: "${subcategoriaData.nombre}" -> "${categoryData.nombre}"`
          );
        } catch (error) {
          console.error(
            `  ❌ Error al crear subcategoría "${subcategoriaData.nombre}":`,
            error.message
          );
        }
      }
    } catch (error) {
      console.error(
        `❌ Error al crear categoría "${categoryData.nombre}":`,
        error.message
      );
    }
  }
}

module.exports = seedProduction;
