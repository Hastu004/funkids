# FunKids

Landing page para `FunKids` con:

- `frontend/`: Angular + Cloudflare Pages Functions

## Estructura

```text
funkids/
├── frontend/   # Landing page en Angular
└── package.json
```

## Desarrollo local

Este proyecto usa API serverless en `frontend/functions/`.

Prerequisito:

- Node.js `>=20.19.0` (Angular 21 y Wrangler 4)

### 1) Preparar variables de entorno locales

En `frontend/`, crear el archivo `.dev.vars` tomando como base:

- `frontend/.dev.vars.example`

Para Webpay en integración, el ejemplo ya viene preconfigurado con:

- `TRANSBANK_ENVIRONMENT=integration`
- `TRANSBANK_COMMERCE_CODE=597055555532`
- `TRANSBANK_API_KEY` de integración oficial

Valores que debes completar tú (no se pueden inferir por internet para tu cuenta):

- `PUBLIC_APP_URL`: tu dominio real (Cloudflare Pages o dominio propio)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`
- `SMTP_*`: credenciales reales de tu proveedor de correo
- `database_id` real de D1 en `frontend/wrangler.toml` (el repo tiene placeholder)

Si tu SMTP ya esta cargado hoy en Cloudflare Pages y funciona para confirmaciones, no necesitas cambiar `SMTP_*`.

### 2) Aplicar migraciones D1 locales

Desde la raiz del proyecto:

```bash
npm run d1:migrate:local
```

### 3) Levantar la API local (Cloudflare Pages Functions)

Desde la raiz del proyecto:

```bash
npm run start:functions
```

### 4) Levantar el frontend Angular

En otra terminal, desde la raiz:

```bash
npm run start:frontend
```

Servicios esperados en local:

- Frontend: `http://localhost:4200`
- Functions local: `http://localhost:8788`
- API desde frontend: `http://localhost:4200/api/*` (proxy a `:8788`)
- API directa: `http://localhost:8788/api/*`

## Cloudflare

Estado actual de despliegue:

- `frontend/` se despliega en `Cloudflare Pages`
- `frontend/functions/` publica la API en `Cloudflare Pages Functions`

### Configuracion correcta en Cloudflare Pages

Al conectar el repo `Hastu004/funkids`, usar exactamente:

- Project name: `funkids`
- Production branch: `main`
- Framework preset: `Angular`
- Build command: `npm run build`
- Build output directory: `dist/frontend/browser`
- Root directory: `frontend`

### API publicada en Cloudflare

Con esa configuracion, Cloudflare publica:

- Frontend Angular desde `frontend/`
- Endpoints serverless desde `frontend/functions/api/`

Rutas expuestas en produccion:

- `/api/landing`
- `/api/purchase`
- `/api/admin/*`
- `/api/webpay/*`

El frontend ya viene configurado para usar:

- `/api` cuando esta desplegado en Cloudflare

### Variables requeridas en Cloudflare Pages (integracion)

En `Settings -> Variables and Secrets`, define para `Production` y `Preview`:

```text
TRANSBANK_ENVIRONMENT=integration
TRANSBANK_COMMERCE_CODE=597055555532
TRANSBANK_API_KEY=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C
PUBLIC_APP_URL=https://funkids.cl
```

Y en `Settings -> Bindings`, conecta D1 con:

```text
Binding name: DB
Database: <tu base D1 real>
```

### Advertencias importantes

- No usar el flujo de `Create a Worker` para desplegar el proyecto actual completo.
- No apuntar el `Root directory` a la raiz del repo si el objetivo es publicar el frontend.
- Si se cambia la estructura de carpetas, hay que actualizar esta documentacion antes de tocar la configuracion de Cloudflare.

### Checklist antes de deploy

Antes de hacer clic en `Save and Deploy`, revisar esto:

- El deploy se esta haciendo en `Cloudflare Pages`, no en `Create a Worker`.
- El repo seleccionado es `Hastu004/funkids`.
- La rama de produccion es `main`.
- `Framework preset` esta en `Angular`.
- `Build command` esta en `npm run build`.
- `Build output directory` esta en `dist/frontend/browser`.
- `Root directory` esta en `frontend`.
- No hay cambios de estructura pendientes que vuelvan obsoleta esta configuracion.
- Si se tocaron endpoints, confirmar que `frontend/functions/api/` sigue incluido en el deploy.
- Si se tocaron integraciones de pago, validar que no se sobrescribieron variables o rutas criticas.

### Checklist despues de deploy

Despues del deploy, revisar esto:

- La landing carga correctamente.
- Las rutas `/api/landing` y `/api/purchase` responden.
- No hay errores de build ni de funciones en Cloudflare.
- Si algo cambio en Cloudflare, documentarlo aqui antes de olvidarlo.

### Que si y que no se publica hoy

Se publica:

- La landing Angular ubicada en `frontend/`
- La API serverless en `frontend/functions/`

## Builds

Comandos utiles:

```bash
npm run build:frontend
```

## Siguiente paso recomendado

Para produccion real, falta conectar los endpoints `/api/purchase` a las APIs de:

- `Transbank`
- `Khipu`
