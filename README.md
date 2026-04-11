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
- `backend/` NO se despliega en Pages
- `backend/` tampoco debe desplegarse como Worker tal como esta hoy

### Configuracion correcta en Cloudflare Pages

Al conectar el repo `Hastu004/funkids`, usar exactamente:

- Project name: `funkids`
- Production branch: `main`
- Framework preset: `Angular`
- Build command: `npm run build`
- Build output directory: `dist/frontend/browser`
- Root directory: `frontend`

### Advertencias importantes

- No usar el flujo de `Create a Worker` para desplegar el proyecto actual completo.
- No apuntar el `Root directory` a la raiz del repo si el objetivo es publicar el frontend.
- No desplegar `backend/` en Cloudflare Pages.
- Si se cambia la estructura de carpetas, hay que actualizar esta documentacion antes de tocar la configuracion de Cloudflare.

### Que si y que no se publica hoy

Se publica:

- La landing Angular ubicada en `frontend/`

No se publica:

- La API Nest de `backend/`

## Builds

Comandos utiles:

```bash
npm run build:frontend
npm run build:backend
```

## Siguiente paso recomendado

Si queremos tener todo en Cloudflare sin mantener un backend Node aparte, conviene migrar la API simple de `backend/` a una de estas opciones:

- `Cloudflare Pages Functions`
- `Cloudflare Worker`

Mientras eso no ocurra, asumir siempre:

- `Pages` para Angular
- otro hosting para Nest
