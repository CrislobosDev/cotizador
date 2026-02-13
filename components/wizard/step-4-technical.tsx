"use client";

import { WizardData } from '@/lib/types';
import { FileText, BookOpen, Languages, UserCircle, Plug, CreditCard, Minus, Plus } from 'lucide-react';

const questions = [
  { key: 'needsBlog', label: '¿Necesitas un blog?', icon: BookOpen },
  { key: 'multiLanguage', label: '¿Multi-idioma? (+20%)', icon: Languages },
  { key: 'needsLogin', label: '¿Sistema de login/usuarios?', icon: UserCircle },
  { key: 'externalIntegrations', label: '¿Integraciones externas?', icon: Plug },
  { key: 'needsPaymentGateway', label: '¿Pasarela de pagos?', icon: CreditCard },
] as const;

interface Step4Props {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

export function Step4Technical({ data, updateData }: Step4Props) {
  const handleToggle = (key: keyof Omit<WizardData, 'clientName' | 'clientEmail' | 'clientWhatsapp' | 'projectType' | 'industry' | 'timeline' | 'numPages' | 'addons'>) => {
    updateData({ [key]: !data[key] });
  };

  const adjustPages = (delta: number) => {
    const newValue = Math.max(1, Math.min(20, (data.numPages ?? 1) + delta));
    updateData({ numPages: newValue });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Detalles técnicos
        </h2>
        <p className="text-gray-600">
          Cuéntanos más sobre las funcionalidades que necesitas
        </p>
      </div>

      {/* Number of pages */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Número de páginas/secciones</p>
              <p className="text-sm text-gray-500">+$25.000 por página adicional</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => adjustPages(-1)}
              disabled={(data.numPages ?? 1) <= 1}
              className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-semibold text-lg">{data.numPages ?? 1}</span>
            <button
              type="button"
              onClick={() => adjustPages(1)}
              disabled={(data.numPages ?? 1) >= 20}
              className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Boolean questions */}
      <div className="space-y-3">
        {questions.map(q => {
          const Icon = q.icon;
          const isActive = !!data[q.key];

          return (
            <button
              key={q.key}
              type="button"
              onClick={() => handleToggle(q.key)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                isActive
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`font-medium ${isActive ? 'text-emerald-700' : 'text-gray-700'}`}>
                  {q.label}
                </span>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isActive ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                }`}
              >
                {isActive && (
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
