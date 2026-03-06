import { defineMiddleware } from 'astro:middleware';
import { resolveTenant } from '../lib/tenant';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, locals, url } = context;

  // Skip API routes and static assets
  if (url.pathname.startsWith('/api/')) {
    return next();
  }

  const tenantResult = await resolveTenant(request);

  locals.tenant = tenantResult?.tenant ?? null;
  locals.tenantSlug = tenantResult?.tenantSlug ?? null;

  const response = await next();

  // Add cache headers for CDN/Front Door when there's a tenant
  if (tenantResult) {
    response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    response.headers.set('Vary', 'Host');
  }

  return response;
});
