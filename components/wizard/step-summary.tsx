"use client";

import { WizardData } from '@/lib/types';
import { calculatePricing, formatPrice } from '@/lib/pricing-engine';
import { User, Mail, Phone, Briefcase, Calendar, LayoutTemplate, CheckCircle } from 'lucide-react';

const projectTypeLabels: Record<string, string> = {
  LANDING: 'Landing Page',
  CORPORATIVA: 'Sitio Corporativo',
  ECOMMERCE: 'E-commerce',
  INTRANET: 'Intranet/Sistema',
};

const timelineLabels: Record<string, string> = {
  '7-10_DAYS': 'Prioridad máxima',
  '2-3_WEEKS': 'Lo necesito pronto',
  '4+_WEEKS': 'Tengo tiempo para planificar',
};

const sectionLabels: Record<string, string> = {
  hero: 'Hero / Portada principal',
  quienes_somos: 'Quiénes somos / Empresa',
  servicios: 'Servicios o soluciones',
  productos: 'Productos o catálogo',
  casos_exito: 'Casos de éxito / Portafolio',
  testimonios: 'Testimonios',
  faq: 'Preguntas frecuentes',
  blog_noticias: 'Blog o noticias',
  contacto: 'Contacto / formulario',
  agenda: 'Agenda / reservas',
};

const addonLabels: Record<string, string> = {
  seoInicial: 'SEO inicial',
  copywriting: 'Copywriting profesional',
  integracionPagos: 'Integración de pagos',
  mantenimientoMensual: 'Mantenimiento mensual',
  dominioCorreos: 'Dominio + correos',
  googleAnalytics: 'Google Analytics',
};

interface StepSummaryProps {
  data: WizardData;
}

export function StepSummary({ data }: StepSummaryProps) {
  const pricing = calculatePricing(data);
  const selectedAddons = Object.entries(data.addons ?? {})
    .filter(([_, selected]) => selected)
    .map(([key]) => addonLabels[key] ?? key);

  const features: string[] = [];
  if (data.needsBlog) features.push('Blog integrado');
  if (data.multiLanguage) features.push('Multi-idioma');
  if (data.needsLogin) features.push('Sistema de login');
  if (data.externalIntegrations) features.push('Integraciones externas');
  if (data.needsPaymentGateway) features.push('Pasarela de pagos');

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Resumen de tu cotización
        </h2>
        <p className="text-gray-600">
          Revisa los datos antes de generar tu cotización
        </p>
      </div>

      {/* Client info */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h3 className="font-semibold text-gray-900 mb-3">Datos de contacto</h3>
        <div className="flex items-center gap-3 text-gray-700">
          <User className="w-5 h-5 text-emerald-600" />
          <span>{data.clientName ?? '-'}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <Mail className="w-5 h-5 text-emerald-600" />
          <span>{data.clientEmail ?? '-'}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <Phone className="w-5 h-5 text-emerald-600" />
          <span>{data.clientWhatsapp ?? '-'}</span>
        </div>
      </div>

      {/* Project info */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h3 className="font-semibold text-gray-900 mb-3">Detalles del proyecto</h3>
        <div className="flex items-center gap-3 text-gray-700">
          <Briefcase className="w-5 h-5 text-emerald-600" />
          <span>{projectTypeLabels[data.projectType ?? ''] ?? data.projectType ?? '-'}</span>
          {data.industry && <span className="text-gray-500">({data.industry})</span>}
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <span>{timelineLabels[data.timeline ?? ''] ?? data.timeline ?? '-'}</span>
        </div>
        <div className="flex items-start gap-3 text-gray-700">
          <LayoutTemplate className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900 mb-2">Secciones solicitadas</p>
            <div className="flex flex-wrap gap-2">
              {(data.siteSections ?? []).map(section => (
                <span
                  key={section}
                  className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm"
                >
                  {sectionLabels[section] ?? section}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      {features.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Funcionalidades</h3>
          <div className="flex flex-wrap gap-2">
            {features.map(feature => (
              <span
                key={feature}
                className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add-ons */}
      {selectedAddons.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Servicios adicionales</h3>
          <div className="flex flex-wrap gap-2">
            {selectedAddons.map(addon => (
              <span
                key={addon}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                {addon}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Price preview */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <h3 className="font-semibold text-emerald-800 mb-2">Rango de precios estimado</h3>
        <p className="text-2xl font-bold text-emerald-700">
          {formatPrice(pricing.basico.minPrice)} - {formatPrice(pricing.premium.maxPrice)}
        </p>
        <p className="text-sm text-emerald-600 mt-1">
          Verás 3 opciones de paquetes al generar la cotización
        </p>
      </div>
    </div>
  );
}
