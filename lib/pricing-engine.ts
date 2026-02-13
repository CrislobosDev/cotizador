import { WizardData, PackageOption, PricingResult, ItemType } from './types';

const BASE_PRICES: Record<string, number> = {
  LANDING: 250000,
  CORPORATIVA: 500000,
  ECOMMERCE: 900000,
  INTRANET: 2500000,
};

const TIMELINE_MULTIPLIERS: Record<string, number> = {
  '7-10_DAYS': 1.4,
  '2-3_WEEKS': 1.2,
  '4+_WEEKS': 1.0,
};

const ADDONS: Record<string, { name: string; price: number; isRecurring?: boolean }> = {
  seoInicial: { name: 'SEO inicial', price: 120000 },
  copywriting: { name: 'Copywriting profesional', price: 80000 },
  integracionPagos: { name: 'Integración de pagos', price: 180000 },
  mantenimientoMensual: { name: 'Mantenimiento mensual', price: 49000, isRecurring: true },
  dominioCorreos: { name: 'Dominio + correos corporativos', price: 50000 },
  googleAnalytics: { name: 'Google Analytics', price: 30000 },
};

const EXTRA_PAGE_PRICE = 25000;

export function calculatePricing(data: WizardData): PricingResult {
  const projectType = data.projectType || 'LANDING';
  const timeline = data.timeline || '4+_WEEKS';
  
  const basePrice = BASE_PRICES[projectType] ?? 250000;
  const timelineMultiplier = TIMELINE_MULTIPLIERS[timeline] ?? 1.0;
  const multiLanguageMultiplier = data.multiLanguage ? 1.2 : 1.0;

  // Calculate extra pages cost
  const extraPages = Math.max(0, (data.numPages ?? 1) - 1);
  const extraPagesCost = extraPages * EXTRA_PAGE_PRICE;

  // Selected addons
  const selectedAddons = Object.entries(data.addons ?? {})
    .filter(([_, selected]) => selected)
    .map(([key]) => ({ key, ...ADDONS[key] }))
    .filter(addon => addon.name && !addon.isRecurring);

  const addonsCost = selectedAddons.reduce((sum, addon) => sum + (addon?.price ?? 0), 0);

  // Base calculation for each package
  const createPackage = (
    name: string,
    description: string,
    priceMultiplier: number,
    additionalFeatures: string[],
    includeAllAddons: boolean,
    additionalItems: { type: ItemType; name: string; amount: number }[] = []
  ): PackageOption => {
    const packageBase = Math.round(basePrice * priceMultiplier);
    const packageWithTime = Math.round(packageBase * timelineMultiplier);
    const packageWithLang = Math.round(packageWithTime * multiLanguageMultiplier);
    
    const items: { type: ItemType; name: string; amount: number }[] = [
      { type: 'BASE', name: `Desarrollo web ${projectType.toLowerCase()}`, amount: packageBase },
    ];

    if (timelineMultiplier > 1) {
      const urgencyAmount = Math.round(packageBase * (timelineMultiplier - 1));
      items.push({ type: 'MULTIPLIER', name: `Urgencia (${timeline?.replace('_', ' ')})`, amount: urgencyAmount });
    }

    if (multiLanguageMultiplier > 1) {
      const langAmount = Math.round(packageWithTime * 0.2);
      items.push({ type: 'MULTIPLIER', name: 'Multi-idioma (+20%)', amount: langAmount });
    }

    if (extraPages > 0) {
      items.push({ type: 'EXTRA', name: `${extraPages} página(s) adicional(es)`, amount: extraPagesCost });
    }

    items.push(...additionalItems);

    if (includeAllAddons) {
      selectedAddons.forEach(addon => {
        if (addon?.name && addon?.price) {
          items.push({ type: 'ADDON', name: addon.name, amount: addon.price });
        }
      });
    }

    const totalPrice = items.reduce((sum, item) => sum + (item?.amount ?? 0), 0);
    const minPrice = Math.round(totalPrice * 0.95);
    const maxPrice = Math.round(totalPrice * 1.05);

    const baseFeatures = getBaseFeatures(projectType, data);

    return {
      name,
      description,
      minPrice,
      maxPrice,
      features: [...baseFeatures, ...additionalFeatures],
      items,
    };
  };

  // Básico Package
  const basico = createPackage(
    'Básico',
    'Lo esencial para comenzar',
    0.8,
    [
      'Diseño responsive básico',
      'Hasta 3 secciones',
      'Formulario de contacto',
      'Entrega estándar',
    ],
    false
  );

  // Pro Package
  const pro = createPackage(
    'Pro',
    'La mejor relación calidad-precio',
    1.0,
    [
      'Diseño responsive premium',
      'Hasta 7 secciones',
      'Formulario de contacto avanzado',
      'Optimización de velocidad',
      'Google Analytics incluido',
      'Soporte 30 días',
    ],
    false,
    [{ type: 'ADDON', name: 'Google Analytics', amount: 30000 }]
  );
  pro.isRecommended = true;

  // Premium Package
  const premium = createPackage(
    'Premium',
    'Todo incluido, sin preocupaciones',
    1.3,
    [
      'Diseño responsive premium personalizado',
      'Secciones ilimitadas',
      'SEO avanzado incluido',
      'Copywriting profesional',
      'Google Analytics avanzado',
      'Optimización de velocidad',
      '2 meses de mantenimiento',
      'Soporte prioritario 60 días',
      'Todas las integraciones',
    ],
    true,
    [
      { type: 'ADDON', name: 'SEO avanzado', amount: 120000 },
      { type: 'ADDON', name: 'Copywriting profesional', amount: 80000 },
    ]
  );

  return { basico, pro, premium };
}

function getBaseFeatures(projectType: string, data: WizardData): string[] {
  const features: string[] = [];

  switch (projectType) {
    case 'LANDING':
      features.push('Landing page profesional');
      break;
    case 'CORPORATIVA':
      features.push('Sitio web corporativo completo');
      break;
    case 'ECOMMERCE':
      features.push('Tienda online completa');
      features.push('Carrito de compras');
      features.push('Gestión de inventario');
      break;
    case 'INTRANET':
      features.push('Sistema intranet empresarial');
      features.push('Panel de administración');
      features.push('Gestión de usuarios');
      break;
  }

  if (data.needsBlog) features.push('Blog integrado');
  if (data.multiLanguage) features.push('Soporte multi-idioma');
  if (data.needsLogin) features.push('Sistema de login/usuarios');
  if (data.needsPaymentGateway) features.push('Pasarela de pagos');
  if (data.externalIntegrations) features.push('Integraciones externas');

  return features;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
}
