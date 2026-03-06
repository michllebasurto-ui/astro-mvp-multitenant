/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    tenant: import('./lib/types').TenantData | null;
    tenantSlug: string | null;
  }
}
