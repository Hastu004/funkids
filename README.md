# FunKids

Landing page para `FunKids` con:

- `frontend/`: Angular
- `backend/`: NestJS

## Estructura

```text
funkids/
├── frontend/   # Landing page en Angular
├── backend/    # API simple en NestJS
└── package.json
```

## Desarrollo local

Desde la raiz del proyecto:

```bash
npm run start:frontend
npm run start:backend
```

Servicios esperados:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`
- Endpoint backend: `http://localhost:3000/api/info`

## Cloudflare

Estado actual de despliegue:

- `frontend/` se despliega en `Cloudflare Pages`
- `frontend/functions/` publica la API en `Cloudflare Pages Functions`
- `backend/` queda solo para desarrollo local o referencia mientras exista la version Nest

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
- Endpoints serverless desde `frontend/functions/api/landing.ts`
- Endpoints serverless desde `frontend/functions/api/purchase.ts`

Rutas expuestas en produccion:

- `/api/landing`
- `/api/purchase`

El frontend ya viene configurado para usar:

- `http://localhost:3000/api` en desarrollo local
- `/api` cuando esta desplegado en Cloudflare

### Advertencias importantes

- No usar el flujo de `Create a Worker` para desplegar el proyecto actual completo.
- No apuntar el `Root directory` a la raiz del repo si el objetivo es publicar el frontend.
- No desplegar `backend/` en Cloudflare Pages.
- Si se cambia la estructura de carpetas, hay que actualizar esta documentacion antes de tocar la configuracion de Cloudflare.

### Que si y que no se publica hoy

Se publica:

- La landing Angular ubicada en `frontend/`
- La API serverless en `frontend/functions/`

No se publica:

- La API Nest de `backend/`

## Builds

Comandos utiles:

```bash
npm run build:frontend
npm run build:backend
```

## Siguiente paso recomendado

Para produccion real, falta conectar los endpoints `/api/purchase` a las APIs de:

- `Transbank`
- `Khipu`

Hoy el flujo ya despliega completo en Cloudflare, pero el pago sigue en modo mock.
