import type { APIRoute } from 'astro';
import { clearCache } from '../../../lib/tenant-store';

const ADMIN_API_KEY = import.meta.env.ADMIN_API_KEY ?? 'dev-secret';

export const POST: APIRoute = async ({ request }) => {
  // Validate API key
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token || token !== ADMIN_API_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { subdomain?: string } = {};
  try {
    body = await request.json();
  } catch {
    // Empty body is fine — means clear all
  }

  if (body.subdomain) {
    clearCache(body.subdomain);
    return new Response(
      JSON.stringify({ success: true, cleared: body.subdomain }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  clearCache();
  return new Response(JSON.stringify({ success: true, cleared: 'all' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
