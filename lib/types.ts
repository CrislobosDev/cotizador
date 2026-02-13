export type ProjectType = 'LANDING' | 'CORPORATIVA' | 'ECOMMERCE' | 'INTRANET';
export type Timeline = '7-10_DAYS' | '2-3_WEEKS' | '4+_WEEKS';
export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
export type EventType = 'CREATED' | 'VIEWED' | 'PDF_DOWNLOADED' | 'SENT_WHATSAPP' | 'STATUS_CHANGED';
export type ItemType = 'BASE' | 'MULTIPLIER' | 'ADDON' | 'EXTRA';

export interface Quote {
  id: string;
  folio: string;
  client_name: string;
  client_email: string;
  client_whatsapp: string;
  project_type: ProjectType;
  industry: string | null;
  timeline: Timeline | null;
  min_price: number;
  max_price: number;
  currency: string;
  status: QuoteStatus;
  public_token: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteAnswer {
  id: string;
  quote_id: string;
  key: string;
  value: string | null;
  created_at: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  item_type: ItemType;
  name: string;
  amount: number;
  created_at: string;
}

export interface QuoteEvent {
  id: string;
  quote_id: string;
  event: EventType;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface WizardData {
  // Step 1
  clientName: string;
  clientEmail: string;
  clientWhatsapp: string;
  // Step 2
  projectType: ProjectType | '';
  industry: string;
  // Step 3
  timeline: Timeline | '';
  // Step 4
  siteSections: string[];
  needsBlog: boolean;
  multiLanguage: boolean;
  needsLogin: boolean;
  externalIntegrations: boolean;
  needsPaymentGateway: boolean;
  // Step 5
  addons: {
    seoInicial: boolean;
    copywriting: boolean;
    integracionPagos: boolean;
    mantenimientoMensual: boolean;
    dominioCorreos: boolean;
    googleAnalytics: boolean;
  };
}

export const initialWizardData: WizardData = {
  clientName: '',
  clientEmail: '',
  clientWhatsapp: '',
  projectType: '',
  industry: '',
  timeline: '',
  siteSections: [],
  needsBlog: false,
  multiLanguage: false,
  needsLogin: false,
  externalIntegrations: false,
  needsPaymentGateway: false,
  addons: {
    seoInicial: false,
    copywriting: false,
    integracionPagos: false,
    mantenimientoMensual: false,
    dominioCorreos: false,
    googleAnalytics: false,
  },
};

export interface PackageOption {
  name: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  features: string[];
  items: { type: ItemType; name: string; amount: number }[];
  isRecommended?: boolean;
}

export interface PricingResult {
  basico: PackageOption;
  pro: PackageOption;
  premium: PackageOption;
}

export const ADMIN_EMAIL = 'cristianvillalobosvv@gmail.com';
export const WHATSAPP_NUMBER = '56973283737';
