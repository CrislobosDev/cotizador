"use client";

import { WizardData } from '@/lib/types';
import { User, Mail, Phone } from 'lucide-react';

interface Step1Props {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
  errors: Record<string, string>;
}

export function Step1Datos({ data, updateData, errors }: Step1Props) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Cuéntanos sobre ti
        </h2>
        <p className="text-gray-600">
          Necesitamos algunos datos para personalizar tu cotización
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre completo *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={data.clientName ?? ''}
            onChange={e => updateData({ clientName: e.target.value })}
            placeholder="Ej: Juan Pérez"
            className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${
              errors.clientName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.clientName && (
          <p className="mt-1 text-sm text-red-500">{errors.clientName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={data.clientEmail ?? ''}
            onChange={e => updateData({ clientEmail: e.target.value })}
            placeholder="Ej: juan@empresa.cl"
            className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${
              errors.clientEmail ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.clientEmail && (
          <p className="mt-1 text-sm text-red-500">{errors.clientEmail}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          WhatsApp *
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            value={data.clientWhatsapp ?? ''}
            onChange={e => updateData({ clientWhatsapp: e.target.value })}
            placeholder="Ej: +56912345678"
            className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${
              errors.clientWhatsapp ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.clientWhatsapp && (
          <p className="mt-1 text-sm text-red-500">{errors.clientWhatsapp}</p>
        )}
      </div>
    </div>
  );
}
