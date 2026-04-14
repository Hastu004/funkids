# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.7.

## Cloudflare Pages

This frontend is the part of the repository that should be deployed to Cloudflare Pages.

Use these settings:

```text
Framework preset: Angular
Build command: npm run build
Build output directory: dist/frontend/browser
Root directory: frontend
```

This Pages project also includes backend endpoints through `Cloudflare Pages Functions` stored in:

- `functions/api/landing.ts`
- `functions/api/purchase.ts`
- `functions/api/admin/*`
- `functions/api/webpay/*`

When deployed, the app uses:

- `/api/landing`
- `/api/purchase`
- `/api/admin/*`
- `/api/webpay/*`

Important:

- Do not deploy the repository root as a Pages build for the frontend.
- Do not use the Worker flow for this Angular app as-is.
- The Pages Functions API is the backend used by the deployed frontend.

## Local development

This project runs locally with:

- Angular dev server on `http://localhost:4200`
- Pages Functions local server on `http://localhost:8788`
- `/api/*` proxied from Angular to `:8788` via `proxy.conf.json`

Prerequisite:

- Node.js `>=20.19.0`

### 1) Local env vars for Functions

Create `frontend/.dev.vars` from:

- `frontend/.dev.vars.example`

### 2) Local D1 migrations

Run from `frontend/`:

```bash
npm run d1:migrate:local
```

### 3) Start Functions locally

Run from `frontend/`:

```bash
npm run functions:dev
```

### 4) Start Angular dev server

Run from `frontend/`:

```bash
npm run start
```

Once running, open `http://localhost:4200/`. The app reloads automatically when source files change.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
npm run test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
