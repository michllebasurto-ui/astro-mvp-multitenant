import type { TenantData } from "./types";

interface CacheEntry {
  data: TenantData;
  timestamp: number;
}

const tenantCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let subdomainIndex: Map<string, string> | null = null;

/** Validates that a slug only contains safe characters (alphanumeric and hyphens). */
function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

async function buildSubdomainIndex(): Promise<Map<string, string>> {
  if (subdomainIndex) return subdomainIndex;
  const indexFile = await import("../data/tenants-index.json");
  subdomainIndex = new Map<string, string>();
  for (const [slug, info] of Object.entries(
    indexFile.default as Record<string, { subdomain: string }>
  )) {
    subdomainIndex.set(info.subdomain, slug);
  }
  return subdomainIndex;
}

export async function getTenantBySlug(slug: string): Promise<TenantData | null> {
  if (!isValidSlug(slug)) return null;

  const cached = tenantCache.get(slug);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  try {
    const tenantModule = await import(`../data/tenants/${slug}.json`);
    const tenantData = tenantModule.default as TenantData;
    tenantCache.set(slug, { data: tenantData, timestamp: Date.now() });
    return tenantData;
  } catch {
    return null;
  }
}

export async function getTenantBySubdomain(
  subdomain: string
): Promise<{ tenant: TenantData; slug: string } | null> {
  const index = await buildSubdomainIndex();
  const slug = index.get(subdomain);
  if (!slug) return null;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) return null;
  return { tenant, slug };
}
