"use client";

import { WizardData, Timeline } from '@/lib/types';
import { Zap, Clock, Calendar } from 'lucide-react';

const timelines: { value: Timeline; label: string; description: string; icon: typeof Clock; badge?: string }[] = [
  {
    value: '2-3_WEEKS',
    label: 'Lo necesito pronto',
    description: 'Priorizamos tu proyecto para iniciar y entregar en menor tiempo.',
    icon: Zap,
    badge: 'Prioritario',
  },
  {
    value: '4+_WEEKS',
    label: 'Tengo tiempo para planificar',
    description: 'Podemos trabajar con un calendario más flexible y ordenado.',
    icon: Calendar,
    badge: 'Recomendado',
  },
];

interface Step3Props {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
  errors: Record<string, string>;
}

export function Step3Plazo({ data, updateData, errors }: Step3Props) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ¿Para cuándo lo necesitas?
        </h2>
        <p className="text-gray-600">
          Esto nos ayuda a definir la prioridad de trabajo de forma profesional
        </p>
      </div>

      <div className="grid gap-4">
        {timelines.map(timeline => {
          const Icon = timeline.icon;
          const isSelected = data.timeline === timeline.value;

          return (
            <button
              key={timeline.value}
              type="button"
              onClick={() => updateData({ timeline: timeline.value })}
              className={`relative flex items-center gap-4 p-4 border-2 rounded-xl text-left transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
              }`}
            >
              {timeline.badge && (
                <span
                  className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full ${
                    timeline.badge === 'Prioritario'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {timeline.badge}
                </span>
              )}
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className={`font-semibold ${isSelected ? 'text-emerald-700' : 'text-gray-900'}`}>
                  {timeline.label}
                </p>
                <p className="text-sm text-gray-500">{timeline.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {errors.timeline && (
        <p className="text-sm text-red-500 text-center">{errors.timeline}</p>
      )}
    </div>
  );
}
