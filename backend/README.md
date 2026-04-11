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

Si en el futuro se quiere alojar todo en Cloudflare, este backend deberia migrarse a:

- `Cloudflare Pages Functions`, o
- `Cloudflare Worker`

Hasta que eso ocurra, tratar este directorio como un servicio separado del frontend desplegado en Pages.
