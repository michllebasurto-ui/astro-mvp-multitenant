const TEMPLATE_REGISTRY: Record<string, Record<string, () => Promise<any>>> = {
  "restaurantes/template-elegante": {
    Home: () =>
      import("../templates/restaurantes/template-elegante/pages/Home.astro"),
    Menu: () =>
      import("../templates/restaurantes/template-elegante/pages/Menu.astro"),
    Contact: () =>
      import("../templates/restaurantes/template-elegante/pages/Contact.astro"),
  },
  "restaurantes/template-casual": {
    Home: () =>
      import("../templates/restaurantes/template-casual/pages/Home.astro"),
    Menu: () =>
      import("../templates/restaurantes/template-casual/pages/Menu.astro"),
    Delivery: () =>
      import("../templates/restaurantes/template-casual/pages/Delivery.astro"),
  },
  "contadores/template-profesional": {
    Home: () =>
      import("../templates/contadores/template-profesional/pages/Home.astro"),
    Services: () =>
      import("../templates/contadores/template-profesional/pages/Services.astro"),
    Contact: () =>
      import("../templates/contadores/template-profesional/pages/Contact.astro"),
  },
  "customs/tacos-don-pepe": {
    Home: () => import("../templates/customs/tacos-don-pepe/pages/Home.astro"),
    Sucursales: () =>
      import("../templates/customs/tacos-don-pepe/pages/Sucursales.astro"),
  },
};

const componentCache = new Map<string, any>();

export async function getTemplateComponent(
  templatePath: string,
  pageName: string,
): Promise<any | null> {
  const cacheKey = `${templatePath}/${pageName}`;
  if (componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey);
  }
  const template = TEMPLATE_REGISTRY[templatePath];
  if (!template) return null;
  const loader = template[pageName];
  if (!loader) return null;
  const module = await loader();
  const component = module.default;
  componentCache.set(cacheKey, component);
  return component;
}

export function templateExists(
  templatePath: string,
  pageName: string,
): boolean {
  return !!TEMPLATE_REGISTRY[templatePath]?.[pageName];
}
