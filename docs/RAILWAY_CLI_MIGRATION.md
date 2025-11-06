# Migración de Datos con Railway CLI

Guía completa para migrar datos de desarrollo a producción usando Railway CLI.

## Requisitos Previos

### 1. Instalar Railway CLI

```bash
# Con npm
npm install -g @railway/cli

# Verificar instalación
railway version
```

### 2. Autenticarse en Railway

```bash
railway login
```

Se abrirá un navegador para conectar tu cuenta de Railway.

### 3. Tener acceso a ambos proyectos

- Proyecto de **desarrollo** (BD con datos de prueba)
- Proyecto de **producción** (BD destino)

## Obtener IDs de Proyectos

1. Ve a [Railway Dashboard](https://railway.app)
2. Abre tu proyecto de desarrollo
3. En la URL verás: `railway.app/project/**abc123def456**`
4. Copia el ID (abc123def456)
5. Repite para producción

Alternativamente, desde CLI:

```bash
railway project list
```

## Uso del Script

### Opción A: Script Automatizado

```bash
# Hacer ejecutable
chmod +x scripts/migrate-railway-cli.sh

# Ejecutar con tus IDs de proyecto
./scripts/migrate-railway-cli.sh <PROJECT_DEV_ID> <PROJECT_PROD_ID>

# Ejemplo real
./scripts/migrate-railway-cli.sh abc123def456 xyz789uvw012
```

El script:
1. ✅ Valida que Railway CLI está instalado
2. ✅ Verifica tu autenticación
3. ✅ Hace backup de desarrollo
4. ✅ Valida conexión a producción
5. ✅ Pide confirmación explícita
6. ✅ Restaura datos en producción
7. ✅ Verifica la migración
8. ✅ Limpia archivos temporales

### Opción B: Comandos Manuales

Si prefieres hacerlo paso a paso:

```bash
# 1. Hacer backup de desarrollo
railway --project <DEV_ID> run pg_dump --clean --if-exists > backup.sql

# 2. Restaurar en producción
railway --project <PROD_ID> run psql < backup.sql

# 3. Verificar
railway --project <PROD_ID> run psql -c "SELECT COUNT(*) FROM products;"
```

## Flujo de Ejecución Detallado

```
┌─────────────────────────────────────┐
│ Iniciar script                      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Validar Railway CLI instalado       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Validar autenticación               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Hacer backup de DEV                 │
│ (pg_dump)                           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Validar conexión a PROD             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ ⚠️  Pedir confirmación               │
│ (prevenir accidentes)              │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
    Sí ▼             ▼ No
     ┌──┐        ┌──────┐
     │OK│        │Abort │
     └──┘        └──────┘
        │
        ▼
┌─────────────────────────────────────┐
│ Restaurar datos en PROD             │
│ (psql < backup.sql)                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Verificar migración                 │
│ - Contar productos                  │
│ - Contar categorías                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Limpiar archivos temporales         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ ✅ Migración completada              │
└─────────────────────────────────────┘
```

## Ejemplos de Uso

### Ejemplo 1: Migración Básica

```bash
./scripts/migrate-railway-cli.sh \
  proj_abc123def456 \
  proj_xyz789uvw012
```

### Ejemplo 2: Con variables de entorno

```bash
export RAILWAY_DEV_ID="proj_abc123def456"
export RAILWAY_PROD_ID="proj_xyz789uvw012"

./scripts/migrate-railway-cli.sh $RAILWAY_DEV_ID $RAILWAY_PROD_ID
```

### Ejemplo 3: En CI/CD (GitHub Actions)

```yaml
name: Migrate to Production

on:
  workflow_dispatch:
    inputs:
      confirm:
        description: 'Escribe "confirm" para autorizar'
        required: true

jobs:
  migrate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Authenticate Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: railway login --token $RAILWAY_TOKEN

      - name: Run Migration
        if: github.event.inputs.confirm == 'confirm'
        run: |
          chmod +x scripts/migrate-railway-cli.sh
          ./scripts/migrate-railway-cli.sh \
            ${{ secrets.RAILWAY_PROJECT_DEV }} \
            ${{ secrets.RAILWAY_PROJECT_PROD }}
```

## Monitoreo Durante la Migración

Mientras se ejecuta la migración:

```bash
# En otra terminal, ver logs en tiempo real
railway --project <PROD_ID> logs --follow

# Ver estado de la BD
railway --project <PROD_ID> run psql -c "\l"

# Ver tablas
railway --project <PROD_ID> run psql -c "\dt"

# Contar registros
railway --project <PROD_ID> run psql -c "SELECT COUNT(*) FROM products;"
```

## Solución de Problemas

### Error: "unknown command"

```bash
# Railway CLI no está instalado
npm install -g @railway/cli
```

### Error: "Authentication failed"

```bash
# No estás autenticado
railway logout
railway login
```

### Error: "Project not found"

```bash
# Verifica los IDs correctos
railway project list

# Usa los IDs exactos de la lista
```

### Error: "permission denied"

```bash
# Hacer script ejecutable
chmod +x scripts/migrate-railway-cli.sh

# O ejecutar con bash explícitamente
bash scripts/migrate-railway-cli.sh <ID> <ID>
```

### BD de producción bloqueda durante migración

```bash
# Esperar a que termine
# O conectarse y matar conexiones (último recurso):
railway --project <PROD_ID> run psql -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE datname = 'postgres';
"
```

## Seguridad

### Mejores Prácticas

1. **Nunca commits tokens**: No agregues RAILWAY_TOKEN a git
2. **Usa secrets en CI/CD**: Guarda tokens en GitHub Secrets
3. **Backup antes de migrar**: Railway automáticamente crea backups
4. **Confirmar antes de ejecutar**: El script pide confirmación
5. **Verificar después**: El script verifica datos post-migración

### Secrets en GitHub

```bash
# Agregar RAILWAY_TOKEN
gh secret set RAILWAY_TOKEN --body "tu_token_aqui"

# Agregar IDs de proyectos
gh secret set RAILWAY_PROJECT_DEV --body "proj_abc123"
gh secret set RAILWAY_PROJECT_PROD --body "proj_xyz789"
```

Obtener tu RAILWAY_TOKEN:
1. Ve a [Railway Settings](https://railway.app/account/tokens)
2. Crea un nuevo token
3. Cópialo a GitHub Secrets

## Recuperación de Desastres

Si algo sale mal:

### Opción 1: Restore desde Railway Dashboard

1. Ve a tu proyecto de producción
2. Selecciona la BD PostgreSQL
3. Click en "Backups"
4. Elige el backup anterior a la migración
5. Click "Restore"

### Opción 2: Restore manual

```bash
# Listar backups disponibles
railway --project <PROD_ID> run pg_basebackup --help

# O contactar a soporte de Railway
```

## Performance Esperado

| Tamaño BD | Tiempo Estimado |
|-----------|-----------------|
| < 10 MB   | 10-30 segundos  |
| 10-100 MB | 30-2 minutos    |
| 100-500 MB | 2-5 minutos    |
| 500 MB+   | 5-15 minutos    |

## Checklist Pre-Migración

- [ ] Railway CLI instalado (`railway version`)
- [ ] Autenticado en Railway (`railway whoami`)
- [ ] IDs de proyecto obtenidos
- [ ] Backup de producción hecho (Dashboard)
- [ ] Schemas de dev y prod son idénticos
- [ ] Nadie más usando la BD
- [ ] Notificaste a tu equipo

## Checklist Post-Migración

- [ ] Conteos de registros coinciden
- [ ] URLs de API funcionan
- [ ] Datos visibles en admin panel
- [ ] No hay errores en logs
- [ ] Usuarios fueron notificados
- [ ] Documentación actualizada

## Comandos Útiles

```bash
# Ver estado de la BD
railway --project <ID> status

# Ver variables de entorno
railway --project <ID> variables

# Ver logs recientes
railway --project <ID> logs -n 50

# Ejecutar psql interactivo
railway --project <ID> run psql

# Ver archivos temporales
ls -lah /tmp/railway-migration/
```

¿Necesitas ayuda con algo específico?
