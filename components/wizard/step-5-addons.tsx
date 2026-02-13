"use client";

import { WizardData } from '@/lib/types';
import { Search, PenTool, CreditCard, Wrench, Globe, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface AddonItem {
  key: keyof WizardData['addons'];
  label: string;
  description: string;
  icon: LucideIcon;
}

const addons: AddonItem[] = [
  { key: 'seoInicial', label: 'SEO inicial', description: 'Optimización para buscadores', icon: Search },
  { key: 'copywriting', label: 'Copywriting profesional', description: 'Textos persuasivos para tu web', icon: PenTool },
  { key: 'integracionPagos', label: 'Integración de pagos', description: 'Webpay, Mercado Pago, etc.', icon: CreditCard },
  { key: 'mantenimientoMensual', label: 'Mantenimiento mensual', description: 'Actualizaciones y soporte continuo', icon: Wrench },
  { key: 'dominioCorreos', label: 'Dominio + correos', description: 'Tu dominio y emails corporativos', icon: Globe },
  { key: 'googleAnalytics', label: 'Google Analytics', description: 'Seguimiento de visitas y conversiones', icon: BarChart3 },
];

interface Step5Props {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

export function Step5Addons({ data, updateData }: Step5Props) {
  const toggleAddon = (key: keyof WizardData['addons']) => {
    updateData({
      addons: {
        ...(data.addons ?? {}),
        [key]: !data.addons?.[key],
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Servicios adicionales
        </h2>
        <p className="text-gray-600">
          Selecciona lo que te interesa. Los valores exactos se ajustan según alcance.
        </p>
      </div>

      <div className="grid gap-4">
        {addons.map(addon => {
          const Icon = addon.icon;
          const isSelected = !!data.addons?.[addon.key];

          return (
            <button
              key={addon.key}
              type="button"
              onClick={() => toggleAddon(addon.key)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className={`font-medium ${isSelected ? 'text-emerald-700' : 'text-gray-900'}`}>
                    {addon.label}
                  </p>
                  <p className="text-sm text-gray-500">{addon.description}</p>
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                }`}
              >
                {isSelected && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
