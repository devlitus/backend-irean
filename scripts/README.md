# Scripts de Migración

## 📋 Descripción

Scripts automáticos para migrar datos entre entornos de desarrollo y producción en Railway.

## 📁 Archivos

### `migrate-railway-cli.sh`

Script principal para migración usando Railway CLI.

**Requisitos:**
- Railway CLI instalado
- Autenticado en Railway
- IDs de proyectos disponibles

**Uso:**
```bash
chmod +x scripts/migrate-railway-cli.sh
./scripts/migrate-railway-cli.sh <PROJECT_DEV_ID> <PROJECT_PROD_ID>
```

**Ejemplo:**
```bash
./scripts/migrate-railway-cli.sh proj_abc123 proj_xyz789
```

**Características:**
- ✅ Validación de Railway CLI
- ✅ Validación de autenticación
- ✅ Backup automático de dev
- ✅ Validación de conexión a prod
- ✅ Confirmación del usuario (safety)
- ✅ Restauración de datos
- ✅ Verificación post-migración
- ✅ Limpieza de archivos temporales
- ✅ Salida colorizada y detallada

## 🔐 Configuración

### Opción 1: Variables de Entorno

Copia `.railway-migration.env.example` a `.railway-migration.env`:

```bash
cp .railway-migration.env.example .railway-migration.env
```

Luego edita con tus valores:
```env
RAILWAY_PROJECT_DEV=proj_abc123def456
RAILWAY_PROJECT_PROD=proj_xyz789uvw012
```

### Opción 2: Argumentos Directos

Pasa los IDs como argumentos al script:

```bash
./scripts/migrate-railway-cli.sh proj_abc123 proj_xyz789
```

### Opción 3: Variables Globales (CI/CD)

En GitHub Actions o similar:

```bash
export RAILWAY_PROJECT_DEV="proj_abc123"
export RAILWAY_PROJECT_PROD="proj_xyz789"
./scripts/migrate-railway-cli.sh
```

## 📖 Documentación Detallada

Para documentación completa, guías de troubleshooting y mejores prácticas:

👉 Ver: [`docs/RAILWAY_CLI_MIGRATION.md`](../docs/RAILWAY_CLI_MIGRATION.md)

## 🚀 Quickstart

### Paso 1: Instalar Railway CLI

```bash
npm install -g @railway/cli
```

### Paso 2: Autenticarse

```bash
railway login
```

### Paso 3: Obtener IDs

Ve a https://railway.app/project/ y copia los IDs

### Paso 4: Ejecutar Migración

```bash
chmod +x scripts/migrate-railway-cli.sh
./scripts/migrate-railway-cli.sh <DEV_ID> <PROD_ID>
```

### Paso 5: Verificar

La BD de producción debería tener los datos de desarrollo.

## ⚠️ Advertencias Importantes

- **DESTRUCTIVO**: Reemplaza TODOS los datos de producción
- **SIN RETORNO**: No se puede deshacer fácilmente
- **CONFIRMACIÓN**: El script pide confirmación explícita
- **BACKUP**: Railway crea backups automáticos antes de restaurar

## 🔧 Troubleshooting

### Railway CLI no encontrado

```bash
npm install -g @railway/cli
railway version
```

### No autenticado

```bash
railway logout
railway login
```

### IDs incorrectos

```bash
railway project list
# Usa los IDs exactos de la lista
```

### Permisos insuficientes

```bash
chmod +x scripts/migrate-railway-cli.sh
```

## 📊 Monitoreo

Mientras se ejecuta la migración:

```bash
# En otra terminal
railway --project <PROD_ID> logs --follow
```

## 🔐 Seguridad

- ✅ No commits de tokens o IDs sensibles
- ✅ .railway-migration.env en .gitignore
- ✅ Backups automáticos en Railway
- ✅ Confirmación del usuario antes de ejecutar
- ✅ Limpieza de archivos temporales

## 💾 Backups

Los backups se crean automáticamente en:

- `/tmp/railway-migration/backup_YYYYMMDD_HHMMSS.sql`

Se limpian automáticamente después de la migración.

## 📞 Soporte

Para problemas:

1. Revisa [`docs/RAILWAY_CLI_MIGRATION.md`](../docs/RAILWAY_CLI_MIGRATION.md)
2. Verifica que Railway CLI está actualizado
3. Confirma permisos en Railway Dashboard
4. Contacta a Railway soporte si persiste

## 📝 Logs

El script imprime salida detallada con colores:

- 🔵 BLUE: Secciones principales
- 🟡 YELLOW: Pasos en progreso
- 🟢 GREEN: Éxito
- 🔴 RED: Errores

Ejemplo de salida:

```
================================
Migration: Dev → Prod (Railway)
================================

🔐 Validando autenticación Railway...
✅ Autenticación validada

📥 Paso 1: Haciendo backup de desarrollo...
   Proyecto: proj_abc123
✅ Backup creado
   Archivo: /tmp/railway-migration/backup_20240101_120000.sql
   Tamaño: 25.3M
   Líneas: 156340
```

---

¿Necesitas ayuda? Consulta la documentación detallada en `docs/RAILWAY_CLI_MIGRATION.md`
