import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

// Import all template pages
import RestaurantesEleganteHome from '../templates/restaurantes/template-elegante/pages/Home.astro';
import RestaurantesEleganteMenu from '../templates/restaurantes/template-elegante/pages/Menu.astro';
import RestaurantesEleganteContact from '../templates/restaurantes/template-elegante/pages/Contact.astro';

import RestaurantesCasualHome from '../templates/restaurantes/template-casual/pages/Home.astro';
import RestaurantesCasualMenu from '../templates/restaurantes/template-casual/pages/Menu.astro';
import RestaurantesCasualDelivery from '../templates/restaurantes/template-casual/pages/Delivery.astro';

import ContadoresProfesionalHome from '../templates/contadores/template-profesional/pages/Home.astro';
import ContadoresProfesionalServices from '../templates/contadores/template-profesional/pages/Services.astro';
import ContadoresProfesionalContact from '../templates/contadores/template-profesional/pages/Contact.astro';

import TacosDonPepeHome from '../templates/customs/tacos-don-pepe/pages/Home.astro';
import TacosDonPepeSucursales from '../templates/customs/tacos-don-pepe/pages/Sucursales.astro';

type TemplateRegistry = Record<string, Record<string, AstroComponentFactory>>;

const registry: TemplateRegistry = {
  'restaurantes/template-elegante': {
    Home: RestaurantesEleganteHome,
    Menu: RestaurantesEleganteMenu,
    Contact: RestaurantesEleganteContact,
  },
  'restaurantes/template-casual': {
    Home: RestaurantesCasualHome,
    Menu: RestaurantesCasualMenu,
    Delivery: RestaurantesCasualDelivery,
  },
  'contadores/template-profesional': {
    Home: ContadoresProfesionalHome,
    Services: ContadoresProfesionalServices,
    Contact: ContadoresProfesionalContact,
  },
  'customs/tacos-don-pepe': {
    Home: TacosDonPepeHome,
    Sucursales: TacosDonPepeSucursales,
  },
};

export function getTemplateComponent(
  templatePath: string,
  pageName: string
): AstroComponentFactory | null {
  return registry[templatePath]?.[pageName] ?? null;
}
