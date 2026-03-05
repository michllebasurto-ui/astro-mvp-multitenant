export interface NavLink {
  label: string;
  href: string;
}

export interface TenantConfig {
  brandName: string;
  logo: string;
  primaryColor: string;
  whatsapp?: string;
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
    ogImage?: string;
  };
  content: Record<string, any>;
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
  page: PageData;
}
