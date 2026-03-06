# astro-mvp-multitenant

Proyecto Astro 5 multi-tenant SSR que sirve landing pages para diferentes clientes (restaurantes, contadores, negocios custom) usando templates y datos JSON locales.

## Arquitectura

```
src/
├── components/           # Componentes compartidos
│   └── PreviewListener.astro  # Listener postMessage para el editor
├── data/
│   ├── tenants-index.json     # Índice subdomain → slug
│   └── tenants/               # Datos JSON de cada tenant
├── layouts/
│   └── BaseLayout.astro       # Layout base con SEO completo
├── lib/
│   ├── types.ts               # Tipos TypeScript
│   ├── tenant.ts              # Resolución de tenant
│   ├── tenant-store.ts        # Cache de tenants (TTL 5min)
│   └── template-registry.ts  # Auto-discovery de templates
├── middleware/
│   └── index.ts               # Resuelve tenant una vez por request
├── pages/
│   ├── index.astro            # Página principal
│   ├── [page].astro           # Páginas dinámicas
│   ├── preview.astro          # Vista previa para el editor
│   ├── sitemap.xml.ts         # Sitemap dinámico
│   ├── robots.txt.ts          # robots.txt dinámico
│   └── api/
│       ├── health.ts          # Health check
│       └── cache/
│           └── invalidate.ts  # Invalidación de cache
├── styles/
│   └── global.css
└── templates/
    ├── _shared/               # Componentes compartidos entre templates
    ├── default/               # Landing por defecto (sin tenant)
    ├── restaurantes/
    │   ├── template-elegante/
    │   └── template-casual/
    ├── contadores/
    │   └── template-profesional/
    └── customs/               # Templates personalizados
```

## Cómo correr localmente

```bash
npm install
npm run dev
```

Por defecto el servidor arranca en `http://localhost:4321`.

### Probar un tenant específico

Usa el query param `?tenant=<slug>`:

```
http://localhost:4321/?tenant=la-bella-italia
http://localhost:4321/menu?tenant=la-bella-italia
http://localhost:4321/?tenant=cp-martinez
```

Slugs disponibles: `la-bella-italia`, `burger-house`, `cp-martinez`, `tacos-don-pepe`.

## Resolución de tenant

El middleware (`src/middleware/index.ts`) resuelve el tenant **una sola vez** por request y lo almacena en `Astro.locals`:

1. **Query param** (desarrollo/testing): `?tenant=<slug>`
2. **Subdomain** (producción): `slug.dominio.com` o `slug.localhost`

Las páginas leen el tenant de `Astro.locals.tenant` y `Astro.locals.tenantSlug` sin llamar `resolveTenant()` nuevamente.

## Templates disponibles

| Template | Categoría | Páginas |
|---|---|---|
| `restaurantes/template-elegante` | Restaurantes | Home, Menu, Contact |
| `restaurantes/template-casual` | Restaurantes | Home |
| `contadores/template-profesional` | Contadores | Home |

### Añadir un nuevo template genérico

1. Crear directorio `src/templates/<categoria>/<template-slug>/pages/`
2. Añadir componentes Astro (e.g., `Home.astro`, `Menu.astro`)
3. Cada componente debe aceptar `{ tenant: TenantData, pageData: PageData, request: Request }` como props
4. El template-registry lo descubrirá automáticamente

### Añadir un template custom

Igual que el genérico, pero bajo `src/templates/customs/<nombre-cliente>/pages/`.

## Añadir un nuevo cliente

1. Crear `src/data/tenants/<slug>.json` con la estructura:
   ```json
   {
     "subdomain": "mi-subdominio",
     "template": "restaurantes/template-elegante",
     "config": { ... },
     "pages": { "/": { ... } }
   }
   ```
2. Registrar en `src/data/tenants-index.json`:
   ```json
   { "mi-slug": { "subdomain": "mi-subdominio" } }
   ```

## Preview endpoint

`GET /preview?tenant=<slug>`

Renderiza la página de inicio del tenant sin resolver por subdomain. Diseñado para ser embebido en un iframe por el editor futuro. Incluye `PreviewListener` que:

- Envía `{ type: 'PREVIEW_READY' }` al parent al cargar
- Escucha mensajes `UPDATE_COLORS`, `UPDATE_COMPONENT`, `TOGGLE_COMPONENT`

## API endpoints

### Health check

```
GET /api/health
```

Respuesta:
```json
{ "status": "healthy", "timestamp": "2025-01-01T00:00:00.000Z" }
```

### Invalidación de cache

```
POST /api/cache/invalidate
Authorization: Bearer <ADMIN_API_KEY>
Content-Type: application/json

{}                          // limpia todo el cache
{ "subdomain": "mi-slug" } // limpia solo ese tenant
```

### Sitemap

```
GET /sitemap.xml
```

Genera un sitemap XML con todas las páginas de todos los tenants.

### robots.txt

```
GET /robots.txt
```

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```bash
cp .env.example .env
```

| Variable | Por defecto | Descripción |
|---|---|---|
| `ADMIN_API_KEY` | `dev-secret` | Clave para la API de invalidación de cache |

## Comandos

```bash
npm run dev       # Desarrollo con hot reload
npm run build     # Build de producción
npm run preview   # Preview del build local
```

## Producción

El proyecto está configurado con `output: 'server'` y adapter `@astrojs/node` en modo standalone.

```bash
npm run build
node dist/server/entry.mjs
```
