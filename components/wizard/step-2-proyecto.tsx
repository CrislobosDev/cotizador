"use client";

import { WizardData, ProjectType } from '@/lib/types';
import { Globe, Building2, ShoppingCart, Lock, Briefcase } from 'lucide-react';

const projectTypes: { value: ProjectType; label: string; description: string; icon: typeof Globe }[] = [
  {
    value: 'LANDING',
    label: 'Landing Page',
    description: 'Página única promocional o de conversión',
    icon: Globe,
  },
  {
    value: 'CORPORATIVA',
    label: 'Sitio Corporativo',
    description: 'Sitio web institucional con múltiples páginas',
    icon: Building2,
  },
  {
    value: 'ECOMMERCE',
    label: 'E-commerce',
    description: 'Tienda online con carrito y pagos',
    icon: ShoppingCart,
  },
  {
    value: 'INTRANET',
    label: 'Intranet/Sistema',
    description: 'Sistema web empresarial con login',
    icon: Lock,
  },
];

interface Step2Props {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
  errors: Record<string, string>;
}

export function Step2Proyecto({ data, updateData, errors }: Step2Props) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ¿Qué tipo de proyecto necesitas?
        </h2>
        <p className="text-gray-600">
          Selecciona el tipo que mejor describe tu proyecto
        </p>
      </div>

      <div className="grid gap-4">
        {projectTypes.map(type => {
          const Icon = type.icon;
          const isSelected = data.projectType === type.value;

          return (
            <button
              key={type.value}
              type="button"
              onClick={() => updateData({ projectType: type.value })}
              className={`flex items-center gap-4 p-4 border-2 rounded-xl text-left transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className={`font-semibold ${isSelected ? 'text-emerald-700' : 'text-gray-900'}`}>
                  {type.label}
                </p>
                <p className="text-sm text-gray-500">{type.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {errors.projectType && (
        <p className="text-sm text-red-500 text-center">{errors.projectType}</p>
      )}

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rubro o industria (opcional)
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={data.industry ?? ''}
            onChange={e => updateData({ industry: e.target.value })}
            placeholder="Ej: Restaurante, Abogados, Construcción..."
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
}
