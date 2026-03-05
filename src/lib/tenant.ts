import tenantsData from '../data/tenants.json';

export interface NavLink {
  label: string;
  href: string;
}

export interface TenantConfig {
  brandName: string;
  logo: string;
  primaryColor: string;
  whatsapp: string;
  navbar: {
    links: NavLink[];
  };
  footer: {
    text: string;
    links: NavLink[];
  };
}

export interface PageData {
  page: string;
  meta: {
    title: string;
    description: string;
  };
  content: Record<string, unknown>;
}

export interface TenantData {
  subdomain: string;
  template: string;
  config: TenantConfig;
  pages: Record<string, PageData>;
}

export interface ResolvedPage {
  tenant: TenantData;
  tenantSlug: string;
  pageData: PageData;
}

const tenants = tenantsData as Record<string, TenantData>;

export function resolveTenant(request: Request): { tenant: TenantData; tenantSlug: string } | null {
  const url = new URL(request.url);

  // 1. Query param (dev/testing): ?tenant=slug
  const queryTenant = url.searchParams.get('tenant');
  if (queryTenant && tenants[queryTenant]) {
    return { tenant: tenants[queryTenant], tenantSlug: queryTenant };
  }

  // 2. Subdomain (production): slug.domain.com
  const hostname = url.hostname;
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const subdomain = parts[0];
    const found = Object.entries(tenants).find(([, t]) => t.subdomain === subdomain);
    if (found) {
      return { tenant: found[1], tenantSlug: found[0] };
    }
  }

  return null;
}

export function resolveTenantAndPage(
  request: Request,
  pagePath: string
): ResolvedPage | null {
  const resolved = resolveTenant(request);
  if (!resolved) return null;

  const { tenant, tenantSlug } = resolved;
  const pageData = tenant.pages[pagePath];
  if (!pageData) return null;

  return { tenant, tenantSlug, pageData };
}

export function buildTenantUrl(request: Request, tenantSlug: string, path: string): string {
  const url = new URL(request.url);
  const queryTenant = url.searchParams.get('tenant');
  const base = `${url.protocol}//${url.host}${path}`;
  if (queryTenant) {
    return `${base}?tenant=${tenantSlug}`;
  }
  return base;
}
