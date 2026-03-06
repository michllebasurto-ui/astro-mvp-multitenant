import type { APIRoute } from 'astro';

// Import tenants index statically so Astro can bundle it
import tenantsIndex from '../data/tenants-index.json';

async function getTenantData(slug: string): Promise<{ pages: Record<string, unknown> } | null> {
  try {
    const mod = await import(`../data/tenants/${slug}.json`);
    return mod.default;
  } catch {
    return null;
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ url }) => {
  const origin = url.origin;

  const entries: string[] = [];

  for (const [slug] of Object.entries(tenantsIndex)) {
    const tenant = await getTenantData(slug);
    if (!tenant) continue;

    for (const pagePath of Object.keys(tenant.pages)) {
      // Build URL using query param convention for sitemap
      const pageUrl =
        pagePath === '/'
          ? `${origin}/?tenant=${slug}`
          : `${origin}${pagePath}?tenant=${slug}`;

      entries.push(`  <url>\n    <loc>${escapeXml(pageUrl)}</loc>\n  </url>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml' },
  });
};
