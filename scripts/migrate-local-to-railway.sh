#!/bin/bash

# Script de migración LOCAL → RAILWAY PRODUCTION
# Migra datos de tu BD PostgreSQL local a producción en Railway
#
# Requisitos:
# - PostgreSQL local instalado (psql, pg_dump)
# - Railway CLI instalado: npm install -g @railway/cli
# - Autenticado en Railway: railway login
#
# Uso:
#   ./scripts/migrate-local-to-railway.sh <local-db-name> <project-prod-id>
#
# Ejemplo:
#   ./scripts/migrate-local-to-railway.sh backend-irean proj_xyz789uvw012

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
BACKUP_DIR="/tmp/railway-migration"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_local_$TIMESTAMP.sql"

# Validar argumentos
if [ $# -lt 2 ]; then
    echo -e "${RED}❌ Error: Faltan argumentos${NC}"
    echo ""
    echo "Uso: $0 <local-db-name> <project-prod-id>"
    echo ""
    echo "Argumentos:"
    echo "  <local-db-name>    - Nombre de la BD local"
    echo "  <project-prod-id>  - ID del proyecto Railway en producción"
    echo ""
    echo "Ejemplo:"
    echo "  $0 backend-irean proj_xyz789uvw012"
    echo ""
    echo "Para obtener el ID del proyecto:"
    echo "  1. Ve a Railway Dashboard"
    echo "  2. Abre tu proyecto de producción"
    echo "  3. El ID está en la URL: railway.app/project/<ID>"
    exit 1
fi

LOCAL_DB=$1
PROJECT_PROD=$2

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Migration: Local → Railway Prod${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Crear directorio temporal
mkdir -p "$BACKUP_DIR"

# Validar PostgreSQL local
echo -e "${YELLOW}🔐 Validando PostgreSQL local...${NC}"

if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ Error: PostgreSQL no está instalado${NC}"
    echo ""
    echo "Instalar PostgreSQL:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    echo "  Windows: Descargar de https://www.postgresql.org/download/windows/"
    exit 1
fi

# Validar que Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Error: Railway CLI no está instalado${NC}"
    echo ""
    echo "Instalar con:"
    echo "  npm install -g @railway/cli"
    exit 1
fi

# Validar autenticación
if ! railway whoami &> /dev/null; then
    echo -e "${RED}❌ Error: No estás autenticado en Railway${NC}"
    echo ""
    echo "Ejecuta: railway login"
    exit 1
fi
echo -e "${GREEN}✅ PostgreSQL y Railway CLI validados${NC}"
echo ""

# Paso 1: Validar BD local
echo -e "${YELLOW}📂 Paso 1: Validando BD local...${NC}"
echo "   Base de datos: $LOCAL_DB"

if ! psql -lqt | cut -d \| -f 1 | grep -qw "$LOCAL_DB"; then
    echo -e "${RED}❌ Error: BD local '$LOCAL_DB' no existe${NC}"
    echo ""
    echo "Bases de datos disponibles:"
    psql -lqt | cut -d \| -f 1 | grep -v '^$' | sed 's/^/  - /'
    exit 1
fi

echo -e "${GREEN}✅ BD local encontrada${NC}"
echo ""

# Paso 2: Hacer backup local
echo -e "${YELLOW}📥 Paso 2: Haciendo backup de BD local...${NC}"

if ! pg_dump "$LOCAL_DB" \
    --clean \
    --if-exists \
    --format=plain \
    --no-password > "$BACKUP_FILE" 2>/dev/null; then
    echo -e "${RED}❌ Error: No se pudo hacer backup de BD local${NC}"
    echo ""
    echo "Verifica que:"
    echo "  - El nombre de BD es correcto: psql -l"
    echo "  - PostgreSQL está corriendo"
    echo "  - Tienes permisos de lectura en la BD"
    rm -rf "$BACKUP_DIR"
    exit 1
fi

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
LINE_COUNT=$(wc -l < "$BACKUP_FILE")
echo -e "${GREEN}✅ Backup creado${NC}"
echo "   Archivo: $BACKUP_FILE"
echo "   Tamaño: $BACKUP_SIZE"
echo "   Líneas: $LINE_COUNT"
echo ""

# Paso 3: Validar conexión a Railway Prod
echo -e "${YELLOW}📤 Paso 3: Validando Railway Producción...${NC}"
echo "   Proyecto: $PROJECT_PROD"

if ! railway --project "$PROJECT_PROD" run psql -c "\l" &> /dev/null; then
    echo -e "${RED}❌ Error: No se puede conectar a Railway${NC}"
    echo "Verifica que:"
    echo "  - El ID del proyecto es correcto"
    echo "  - Tienes acceso al proyecto"
    echo "  - PostgreSQL está disponible"
    echo "  - Autenticación Railway es válida"
    rm -rf "$BACKUP_DIR"
    exit 1
fi

echo -e "${GREEN}✅ Conexión a Railway validada${NC}"
echo ""

# Paso 4: Confirmación final
echo -e "${RED}⚠️  ADVERTENCIA IMPORTANTE${NC}"
echo ""
echo "Estás a punto de REEMPLAZAR la BD de PRODUCCIÓN en Railway"
echo "con los datos de tu máquina LOCAL."
echo ""
echo "Esto:"
echo "  - Eliminará TODOS los datos actuales de producción"
echo "  - Incluirá solo datos de desarrollo local"
echo "  - No se puede deshacer fácilmente"
echo "  - ASEGÚRATE que realmente quieres hacer esto"
echo ""
echo "BD Local: $LOCAL_DB ($BACKUP_SIZE)"
echo "Destino: Railway Producción ($PROJECT_PROD)"
echo ""

read -p "¿Deseas continuar? Escribe 'sí, continuar' para confirmar: " confirmation

if [ "$confirmation" != "sí, continuar" ]; then
    echo -e "${YELLOW}❌ Migración cancelada${NC}"
    rm -rf "$BACKUP_DIR"
    exit 0
fi

echo ""

# Paso 5: Restaurar en Railway
echo -e "${YELLOW}🔄 Paso 4: Restaurando en Railway...${NC}"
echo "   (Esto puede tomar varios minutos según el tamaño)"

if ! railway --project "$PROJECT_PROD" run psql < "$BACKUP_FILE" 2>/dev/null; then
    echo -e "${RED}❌ Error: No se pudo restaurar en Railway${NC}"
    echo ""
    echo "Intenta:"
    echo "  1. Esperar unos minutos"
    echo "  2. Ejecutar de nuevo el script"
    echo "  3. Si persiste, restaura manualmente desde Railway Dashboard"
    echo ""
    echo "El backup está guardado en: $BACKUP_FILE"
    echo "Puedes restaurarlo manualmente después"
    exit 1
fi

echo -e "${GREEN}✅ Datos restaurados en Railway${NC}"
echo ""

# Paso 6: Verificación
echo -e "${YELLOW}✅ Paso 5: Verificando migración...${NC}"

PROD_COUNT=$(railway --project "$PROJECT_PROD" run psql -t -c "SELECT COUNT(*) FROM products;" 2>/dev/null | xargs)
echo "   Productos en Railway: $PROD_COUNT"

PROD_CATEGORIES=$(railway --project "$PROJECT_PROD" run psql -t -c "SELECT COUNT(*) FROM categories;" 2>/dev/null | xargs)
echo "   Categorías en Railway: $PROD_CATEGORIES"

# Verificación local
LOCAL_COUNT=$(psql "$LOCAL_DB" -t -c "SELECT COUNT(*) FROM products;" 2>/dev/null | xargs)
echo ""
echo "Comparación:"
echo "   BD Local: $LOCAL_COUNT productos"
echo "   Railway: $PROD_COUNT productos"

if [ "$LOCAL_COUNT" = "$PROD_COUNT" ]; then
    echo -e "${GREEN}✅ Conteos coinciden${NC}"
else
    echo -e "${YELLOW}⚠️  Conteos diferentes (puede ser normal si hay datos adicionales)${NC}"
fi

echo ""

# Paso 7: Limpieza
echo -e "${YELLOW}🧹 Paso 6: Limpiando archivos temporales...${NC}"
rm -rf "$BACKUP_DIR"
echo -e "${GREEN}✅ Limpieza completada${NC}"
echo ""

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✨ Migración completada exitosamente${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Resumen:"
echo "  - Origen: PostgreSQL Local ($LOCAL_DB)"
echo "  - Destino: Railway Producción ($PROJECT_PROD)"
echo "  - Datos: $LINE_COUNT líneas SQL ($BACKUP_SIZE)"
echo "  - Productos: $LOCAL_COUNT → $PROD_COUNT"
echo ""
echo "Próximos pasos:"
echo "  1. Verifica los datos en: https://railway.app/project/$PROJECT_PROD"
echo "  2. Prueba la API de producción"
echo "  3. Notifica a tu equipo del cambio"
echo ""
echo "⚠️  IMPORTANTE:"
echo "  - Los datos locales ahora están en producción"
echo "  - Crea un backup de Railway si algo sale mal"
echo "  - Considera hacer deploy después de verificar"
