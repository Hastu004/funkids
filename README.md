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

Valores que debes completar tu (no se pueden inferir por internet para tu cuenta):

- `PUBLIC_APP_URL`: para local, deja `http://localhost:8788`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`
- `SELLER_EMAIL`, `SELLER_PASSWORD` (opcional para rol vendedor)
- `SMTP_*`: credenciales reales de tu proveedor de correo
- `database_id` reales de D1 para `env.preview` y `env.production` en `frontend/wrangler.toml`

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

Si quieres levantar localmente con la configuracion de `env.preview`:

```bash
npm run start:functions:preview
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

### Branch control (exacto para este proyecto)

Configura en `Settings -> Builds & deployments -> Branch control`:

- Production branch: `main`
- Preview branch control: `Custom branches`
- Include branches: `dev`
- Exclude branches: (vacio, o lo que no quieras desplegar)

Con esto:

- Push a `main` -> despliegue a produccion.
- Push a `dev` -> despliegue a ambiente de desarrollo (Preview).

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

### Ambientes: desarrollo y produccion

En Cloudflare Pages, los dos ambientes oficiales de configuracion son:

- `Preview` (usalo como desarrollo/staging)
- `Production`

Este repo ya queda preparado en `frontend/wrangler.toml` con:

- `env.preview` -> DB y variables para desarrollo
- `env.production` -> DB y variables para produccion

Importante:

- En Pages, la configuracion es por `preview` y `production`, no por rama especifica.
- El branch `main` debe seguir como rama de produccion.
- Tu branch de desarrollo (por ejemplo `develop`) se desplegara como `Preview`.

### Variables requeridas en Cloudflare Pages

En `Settings -> Variables and Secrets`, define por separado para cada ambiente:

Preview (desarrollo):

```text
TRANSBANK_ENVIRONMENT=integration
PUBLIC_APP_URL=https://<tu-subdominio-preview>.pages.dev
```

En `preview/desarrollo`, Functions fuerza modo `integration` y usa credenciales oficiales de integracion, por lo que no se usan credenciales reales en ese ambiente.

Production:

```text
TRANSBANK_ENVIRONMENT=production
TRANSBANK_COMMERCE_CODE=<tu-commerce-code-produccion>
TRANSBANK_API_KEY=<tu-api-key-produccion>
PUBLIC_APP_URL=https://<tu-dominio-produccion>
```

La configuracion de D1 se toma de `frontend/wrangler.toml` en:

- `[[env.preview.d1_databases]]`
- `[[env.production.d1_databases]]`

### Migraciones por ambiente

Desde la raiz del proyecto:

```text
npm run d1:migrate:preview
npm run d1:migrate:production
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
