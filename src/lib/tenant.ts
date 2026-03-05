// Re-export types from the central types module for backward compatibility
export type { NavLink, TenantConfig, PageData, TenantData, ResolvedPage } from "./types";

import type { TenantData, ResolvedPage } from "./types";
import { getTenantBySlug, getTenantBySubdomain } from "./tenant-store";

export async function resolveTenant(
  request: Request
): Promise<{ tenant: TenantData; tenantSlug: string } | null> {
  const url = new URL(request.url);

  // 1. Query param (dev/testing): ?tenant=slug
  const tenantParam = url.searchParams.get("tenant");
  if (tenantParam) {
    const tenant = await getTenantBySlug(tenantParam);
    if (tenant) return { tenant, tenantSlug: tenantParam };
  }

  // 2. Subdomain (production): slug.domain.com or slug.localhost
  const hostname = url.hostname;
  const parts = hostname.split(".");
  const hasSubdomain =
    (parts.length > 2 && parts[0] !== "www") ||
    (parts.length === 2 && hostname.includes("localhost"));

  if (hasSubdomain) {
    const result = await getTenantBySubdomain(parts[0]);
    if (result) return { tenant: result.tenant, tenantSlug: result.slug };
  }

  return null;
}

export async function resolveTenantAndPage(
  request: Request,
  pagePath: string = "/"
): Promise<ResolvedPage | null> {
  const result = await resolveTenant(request);
  if (!result) return null;

  const { tenant, tenantSlug } = result;
  const normalizedPath = pagePath === "" || pagePath === "/" ? "/" : pagePath.startsWith("/") ? pagePath : `/${pagePath}`;
  const page = tenant.pages[normalizedPath];
  if (!page) return null;

  return { tenant, tenantSlug, page };
}

export function buildTenantUrl(
  request: Request,
  tenantSlug: string,
  path: string
): string {
  const url = new URL(request.url);
  if (url.searchParams.get("tenant")) {
    return `${path}?tenant=${tenantSlug}`;
  }
  return path;
}
