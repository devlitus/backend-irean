#!/bin/bash

# Script de migración usando Railway CLI
# Migra datos de PostgreSQL dev → prod en Railway
#
# Requisitos:
# - Railway CLI instalado: npm install -g @railway/cli
# - Autenticado en Railway: railway login
# - Tener acceso a ambos proyectos
#
# Uso:
#   ./scripts/migrate-railway-cli.sh <project-dev-id> <project-prod-id>

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
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Validar argumentos
if [ $# -lt 2 ]; then
    echo -e "${RED}❌ Error: Faltan argumentos${NC}"
    echo ""
    echo "Uso: $0 <project-dev-id> <project-prod-id>"
    echo ""
    echo "Ejemplo:"
    echo "  $0 abc123def456 xyz789uvw012"
    echo ""
    echo "Para obtener los IDs:"
    echo "  1. Ve a Railway Dashboard"
    echo "  2. Abre cada proyecto"
    echo "  3. El ID está en la URL: railway.app/project/<ID>"
    exit 1
fi

PROJECT_DEV=$1
PROJECT_PROD=$2

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Migration: Dev → Prod (Railway)${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Crear directorio temporal
mkdir -p "$BACKUP_DIR"

# Validar que Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Error: Railway CLI no está instalado${NC}"
    echo ""
    echo "Instalar con:"
    echo "  npm install -g @railway/cli"
    exit 1
fi

# Validar autenticación
echo -e "${YELLOW}🔐 Validando autenticación Railway...${NC}"
if ! railway whoami &> /dev/null; then
    echo -e "${RED}❌ Error: No estás autenticado en Railway${NC}"
    echo ""
    echo "Ejecuta: railway login"
    exit 1
fi
echo -e "${GREEN}✅ Autenticación validada${NC}"
echo ""

# Paso 1: Conectar a desarrollo y hacer backup
echo -e "${YELLOW}📥 Paso 1: Haciendo backup de desarrollo...${NC}"
echo "   Proyecto: $PROJECT_DEV"

# Cambiar a proyecto de desarrollo
if ! railway --project "$PROJECT_DEV" run pg_dump \
    --clean \
    --if-exists \
    --format=plain \
    --no-password > "$BACKUP_FILE" 2>/dev/null; then
    echo -e "${RED}❌ Error: No se pudo hacer backup de desarrollo${NC}"
    echo "Verifica que:"
    echo "  - El PROJECT_DEV es correcto"
    echo "  - Tienes acceso al proyecto"
    echo "  - PostgreSQL está disponible"
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

# Paso 2: Validar conexión a producción
echo -e "${YELLOW}📤 Paso 2: Validando producción...${NC}"
echo "   Proyecto: $PROJECT_PROD"

if ! railway --project "$PROJECT_PROD" run psql -c "\l" &> /dev/null; then
    echo -e "${RED}❌ Error: No se puede conectar a producción${NC}"
    echo "Verifica que:"
    echo "  - El PROJECT_PROD es correcto"
    echo "  - Tienes acceso al proyecto"
    echo "  - PostgreSQL está disponible"
    rm -rf "$BACKUP_DIR"
    exit 1
fi

echo -e "${GREEN}✅ Conexión a producción validada${NC}"
echo ""

# Paso 3: Confirmación final
echo -e "${RED}⚠️  ADVERTENCIA IMPORTANTE${NC}"
echo ""
echo "Estás a punto de REEMPLAZAR la BD de PRODUCCIÓN"
echo "con los datos de DESARROLLO."
echo ""
echo "Esto:"
echo "  - Eliminará TODOS los datos actuales de producción"
echo "  - No se puede deshacer fácilmente"
echo "  - Recuerda tener un backup de seguridad"
echo ""

read -p "¿Deseas continuar? Escribe 'sí, continuar' para confirmar: " confirmation

if [ "$confirmation" != "sí, continuar" ]; then
    echo -e "${YELLOW}❌ Migración cancelada${NC}"
    rm -rf "$BACKUP_DIR"
    exit 0
fi

echo ""

# Paso 4: Restaurar en producción
echo -e "${YELLOW}🔄 Paso 3: Restaurando en producción...${NC}"
echo "   (Esto puede tomar varios minutos)"

if ! railway --project "$PROJECT_PROD" run psql < "$BACKUP_FILE" 2>/dev/null; then
    echo -e "${RED}❌ Error: No se pudo restaurar los datos en producción${NC}"
    echo "Intenta:"
    echo "  1. Esperar unos minutos"
    echo "  2. Ejecutar de nuevo el script"
    echo "  3. Si persiste, restaura manualmente desde Railway Dashboard"
    rm -rf "$BACKUP_DIR"
    exit 1
fi

echo -e "${GREEN}✅ Datos restaurados en producción${NC}"
echo ""

# Paso 5: Verificación
echo -e "${YELLOW}✅ Paso 4: Verificando migración...${NC}"

PROD_COUNT=$(railway --project "$PROJECT_PROD" run psql -t -c "SELECT COUNT(*) FROM products;" 2>/dev/null | xargs)
echo "   Productos en producción: $PROD_COUNT"

PROD_CATEGORIES=$(railway --project "$PROJECT_PROD" run psql -t -c "SELECT COUNT(*) FROM categories;" 2>/dev/null | xargs)
echo "   Categorías en producción: $PROD_CATEGORIES"

echo ""

# Paso 6: Limpieza
echo -e "${YELLOW}🧹 Paso 5: Limpiando archivos temporales...${NC}"
rm -rf "$BACKUP_DIR"
echo -e "${GREEN}✅ Limpieza completada${NC}"
echo ""

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✨ Migración completada exitosamente${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Resumen:"
echo "  - Datos de desarrollo: $LINE_COUNT líneas SQL"
echo "  - Productos en producción: $PROD_COUNT"
echo "  - Categorías en producción: $PROD_CATEGORIES"
echo ""
echo "Próximos pasos:"
echo "  1. Verifica los datos en: https://railway.app"
echo "  2. Prueba la API de producción"
echo "  3. Notifica a tu equipo"
