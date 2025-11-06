# Guía de Migración de Datos (Dev → Prod)

## Requisitos Previos

- PostgreSQL client instalado (`psql`)
- Acceso a las BDs de desarrollo y producción en Railway
- Variables de entorno configuradas

## Configuración en Railway

### 1. Obtener URLs de conexión

En Railway Dashboard:

1. **Desarrollo**:
   - Ve a tu proyecto de dev
   - Selecciona la BD PostgreSQL
   - Copia `DATABASE_URL`

2. **Producción**:
   - Ve a tu proyecto de prod
   - Selecciona la BD PostgreSQL
   - Copia `DATABASE_URL`

### 2. Configurar Variables de Entorno (Local)

Crea un archivo `.env.migration`:

```env
DATABASE_URL_DEV=postgresql://user:password@host-dev:5432/database
DATABASE_URL_PROD=postgresql://user:password@host-prod:5432/database
```

## Opción A: Ejecución Local

```bash
# 1. Cargar variables
source .env.migration

# 2. Ejecutar migración
chmod +x scripts/migrate-db.sh
./scripts/migrate-db.sh
```

## Opción B: GitHub Actions (Automatizado)

### 1. Configurar Secrets en GitHub

Ve a: `Settings → Secrets and variables → Actions`

Agrega:
- `DATABASE_URL_DEV`: URL de conexión a BD dev
- `DATABASE_URL_PROD`: URL de conexión a BD prod

### 2. Ejecutar Migración

Ve a: `Actions → Migrate Database to Production`

Click en `Run workflow` → Escribe "confirm" → `Run workflow`

## Opción C: Railway Tasks (Recomendado)

En `railway.json`, puedes agregar:

```json
{
  "environments": {
    "production": {
      "services": ["api", "database"]
    },
    "development": {
      "services": ["api", "database"]
    }
  },
  "tasks": {
    "migrate:prod": "scripts/migrate-db.sh"
  }
}
```

Luego ejecutar desde Railway CLI:

```bash
railway run migrate:prod
```

## Advertencias Importantes ⚠️

- **DESTRUCTIVO**: Este script elimina todos los datos de producción antes de restaurar
- **BACKUP**: Se mantiene un backup temporal durante la ejecución
- **SINCRONIZACIÓN**: Asegúrate que los schemas de dev y prod sean idénticos
- **TIEMPO**: Espera según el tamaño de la BD

## Alternativa: Backup Manual en Railway

Si prefieres más control:

1. En Dashboard de prod: `Backup → Create Backup`
2. Descarga el archivo
3. En dev: `Backup → Restore from file`
4. Sube el archivo descargado

## Verificación Post-Migración

```bash
# Validar conexión
psql $DATABASE_URL_PROD -c "\dt"

# Contar registros
psql $DATABASE_URL_PROD -c "SELECT COUNT(*) FROM products;"
```

## Solución de Problemas

### Error: "permission denied"

```bash
# Hacer script ejecutable
chmod +x scripts/migrate-db.sh
```

### Error: "no existe la base de datos"

Verifica que las URLs de conexión sean correctas en las variables de entorno.

### Error: "connection refused"

La BD de producción puede estar inactiva. Espera 30 segundos y reintentar.

## Rollback de Emergencia

Si algo sale mal:

```bash
# Restaurar desde backup de Railway
# Ve al Dashboard → DB → Backups → Restore
```
