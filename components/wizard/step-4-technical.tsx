"use client";

import { WizardData } from '@/lib/types';
import { LayoutTemplate, BookOpen, Languages, UserCircle, Plug, CreditCard } from 'lucide-react';

const siteSections = [
  { key: 'hero', label: 'Hero / Portada principal' },
  { key: 'quienes_somos', label: 'Quiénes somos / Empresa' },
  { key: 'servicios', label: 'Servicios o soluciones' },
  { key: 'productos', label: 'Productos o catálogo' },
  { key: 'casos_exito', label: 'Casos de éxito / Portafolio' },
  { key: 'testimonios', label: 'Testimonios de clientes' },
  { key: 'faq', label: 'Preguntas frecuentes' },
  { key: 'blog_noticias', label: 'Blog o noticias' },
  { key: 'contacto', label: 'Contacto / formulario' },
  { key: 'agenda', label: 'Agenda de reunión / reserva' },
] as const;

const questions = [
  { key: 'needsBlog', label: '¿Necesitas blog administrable?', icon: BookOpen },
  { key: 'multiLanguage', label: '¿Contenido en más de un idioma?', icon: Languages },
  { key: 'needsLogin', label: '¿Acceso con usuarios y contraseña?', icon: UserCircle },
  { key: 'externalIntegrations', label: '¿Integraciones con herramientas externas?', icon: Plug },
  { key: 'needsPaymentGateway', label: '¿Cobros o pagos online?', icon: CreditCard },
] as const;

interface Step4Props {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

export function Step4Technical({ data, updateData }: Step4Props) {
  const selectedSections = data.siteSections ?? [];

  const toggleSection = (sectionKey: string) => {
    const exists = selectedSections.includes(sectionKey);
    updateData({
      siteSections: exists
        ? selectedSections.filter(s => s !== sectionKey)
        : [...selectedSections, sectionKey],
    });
  };

  const handleToggle = (
    key: keyof Omit<WizardData, 'clientName' | 'clientEmail' | 'clientWhatsapp' | 'projectType' | 'industry' | 'timeline' | 'siteSections' | 'addons'>
  ) => {
    updateData({ [key]: !data[key] });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Estructura y funcionalidades
        </h2>
        <p className="text-gray-600">
          Selecciona qué secciones y capacidades tendrá tu proyecto
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <LayoutTemplate className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">¿Qué secciones necesita tu web?</p>
            <p className="text-sm text-gray-500">Mientras más detalle tengamos, más precisa será la propuesta.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
          {siteSections.map(section => {
            const isSelected = selectedSections.includes(section.key);
            return (
              <button
                key={section.key}
                type="button"
                onClick={() => toggleSection(section.key)}
                className={`text-left rounded-lg border px-3 py-2 text-sm transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

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
