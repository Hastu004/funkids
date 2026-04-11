# Backend

Backend simple en NestJS para exponer informacion basica del sitio.

## Desarrollo local

```bash
npm run start:dev
```

Backend disponible en:

- `http://localhost:3000`
- `http://localhost:3000/api/info`

## Build

```bash
npm run build
```

## Cloudflare

Este backend no debe desplegarse en `Cloudflare Pages`.

Tampoco debe asumirse que puede publicarse directamente en `Cloudflare Workers` sin adaptaciones. El proyecto actual usa Nest como backend Node tradicional.

La version que hoy se despliega en Cloudflare vive en:

- `../frontend/functions/api/landing.ts`
- `../frontend/functions/api/purchase.ts`

Este directorio queda como referencia local o base para una futura API Node separada.
