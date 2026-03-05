// ═══════════════════════════════════════════════════════════════
// AUTO-DISCOVERY: Templates are discovered automatically via
// import.meta.glob(). No need to register new templates manually.
// Just create files under src/templates/{category}/{template}/pages/
// and they will be available immediately.
// ═══════════════════════════════════════════════════════════════

const templateModules = import.meta.glob<any>(
  "../templates/**/pages/*.astro",
);

// Build registry automatically from discovered modules
// Excludes _shared and default directories (they are not tenant templates)
const TEMPLATE_REGISTRY = new Map<string, Map<string, () => Promise<any>>>();

for (const [path, loader] of Object.entries(templateModules)) {
  // path example: "../templates/restaurantes/template-elegante/pages/Home.astro"
  // We want: templatePath = "restaurantes/template-elegante", pageName = "Home"
  const match = path.match(
    /\.\.\/templates\/(.+)\/pages\/(\w+)\.astro$/,
  );
  if (!match) continue;

  const [, templatePath, pageName] = match;

  // Skip _shared and default folders — they are not tenant templates
  if (templatePath.startsWith("_shared") || templatePath.startsWith("default")) continue;

  if (!TEMPLATE_REGISTRY.has(templatePath)) {
    TEMPLATE_REGISTRY.set(templatePath, new Map());
  }
  TEMPLATE_REGISTRY.get(templatePath)!.set(pageName, loader);
}

// Cache for already-loaded components (permanent — components don't change at runtime)
const componentCache = new Map<string, any>();

export async function getTemplateComponent(
  templatePath: string,
  pageName: string,
): Promise<any | null> {
  const cacheKey = `${templatePath}/${pageName}`;

  if (componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey);
  }

  const template = TEMPLATE_REGISTRY.get(templatePath);
  if (!template) return null;

  const loader = template.get(pageName);
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
  return !!TEMPLATE_REGISTRY.get(templatePath)?.has(pageName);
}
