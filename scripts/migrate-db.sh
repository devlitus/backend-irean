#!/bin/bash

# Script de migración de datos de dev a prod en Railway
# Uso: ./scripts/migrate-db.sh

set -e

echo "================================"
echo "Migration: Dev → Prod (Railway)"
echo "================================"

# Validar variables de entorno
if [ -z "$DATABASE_URL_DEV" ]; then
    echo "❌ Error: DATABASE_URL_DEV no está configurada"
    exit 1
fi

if [ -z "$DATABASE_URL_PROD" ]; then
    echo "❌ Error: DATABASE_URL_PROD no está configurada"
    exit 1
fi

BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
TEMP_DIR="/tmp/db-migrations"

mkdir -p "$TEMP_DIR"

echo ""
echo "📊 Paso 1: Generando backup de desarrollo..."
pg_dump "$DATABASE_URL_DEV" > "$TEMP_DIR/$BACKUP_FILE" 2>/dev/null
BACKUP_SIZE=$(du -h "$TEMP_DIR/$BACKUP_FILE" | cut -f1)
echo "✅ Backup creado: $BACKUP_FILE ($BACKUP_SIZE)"

echo ""
echo "📤 Paso 2: Validando conexión a producción..."
pg_isready -d "$DATABASE_URL_PROD" > /dev/null 2>&1 || {
    echo "❌ Error: No se puede conectar a BD de producción"
    rm "$TEMP_DIR/$BACKUP_FILE"
    exit 1
}
echo "✅ Conexión a producción validada"

echo ""
echo "⚠️  Paso 3: Limpiando BD de producción..."
psql "$DATABASE_URL_PROD" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" 2>/dev/null
echo "✅ BD de producción limpiada"

echo ""
echo "📥 Paso 4: Restaurando datos en producción..."
psql "$DATABASE_URL_PROD" < "$TEMP_DIR/$BACKUP_FILE" 2>/dev/null
echo "✅ Datos restaurados en producción"

echo ""
echo "🧹 Paso 5: Limpiando archivos temporales..."
rm "$TEMP_DIR/$BACKUP_FILE"
echo "✅ Archivos limpios"

echo ""
echo "================================"
echo "✨ Migración completada exitosamente"
echo "================================"
