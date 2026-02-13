"use client";

import { useState } from 'react';
import { WizardData, ProjectType } from '@/lib/types';
import { Globe, Building2, ShoppingCart, Lock, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';

const projectTypes: {
  value: ProjectType;
  label: string;
  description: string;
  icon: typeof Globe;
  details: string;
  idealFor: string;
  examples: string[];
}[] = [
  {
    value: 'LANDING',
    label: 'Landing Page',
    description: 'Una página enfocada en captar contactos o vender una oferta puntual.',
    icon: Globe,
    details: 'Ideal para campañas, lanzamientos o validar una idea rápido.',
    idealFor: 'Emprendedores, servicios profesionales, campañas publicitarias.',
    examples: ['Campaña de Meta Ads', 'Lanzamiento de curso', 'Captación de leads inmobiliarios'],
  },
  {
    value: 'CORPORATIVA',
    label: 'Sitio Corporativo',
    description: 'Web de empresa para presentar marca, servicios y generar confianza.',
    icon: Building2,
    details: 'Permite mostrar áreas de negocio, equipo, casos de éxito y contacto.',
    idealFor: 'Pymes, consultoras, estudios, constructoras, clínicas.',
    examples: ['Web institucional', 'Perfil de empresa B2B', 'Sitio de servicios profesionales'],
  },
  {
    value: 'ECOMMERCE',
    label: 'E-commerce',
    description: 'Tienda online para vender productos con carrito y pago digital.',
    icon: ShoppingCart,
    details: 'Incluye catálogo, fichas de productos, checkout y gestión básica de pedidos.',
    idealFor: 'Tiendas retail, marcas propias, negocios que venden por Instagram/WhatsApp.',
    examples: ['Tienda de ropa', 'Catálogo con pago online', 'Venta de productos por categoría'],
  },
  {
    value: 'INTRANET',
    label: 'Intranet/Sistema',
    description: 'Plataforma interna con usuarios, permisos y procesos del negocio.',
    icon: Lock,
    details: 'Se diseña a medida para centralizar tareas, información y flujos internos.',
    idealFor: 'Empresas con procesos manuales o uso intensivo de planillas.',
    examples: ['Sistema de cotizaciones interno', 'Panel de operaciones', 'Gestión de clientes/proyectos'],
  },
];

interface Step2Props {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
  errors: Record<string, string>;
}

export function Step2Proyecto({ data, updateData, errors }: Step2Props) {
  const [expandedType, setExpandedType] = useState<ProjectType | null>(null);

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
                <span
                  role="button"
                  tabIndex={0}
                  onClick={e => {
                    e.stopPropagation();
                    setExpandedType(prev => (prev === type.value ? null : type.value));
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      setExpandedType(prev => (prev === type.value ? null : type.value));
                    }
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-800"
                >
                  {expandedType === type.value ? (
                    <>
                      Ocultar detalles <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Ver más detalles <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </span>

                {expandedType === type.value && (
                  <div className="mt-3 space-y-2 rounded-lg bg-white/80 p-3 border border-emerald-100">
                    <p className="text-sm text-gray-700">{type.details}</p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-gray-900">¿Quién lo necesita?</span> {type.idealFor}
                    </p>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Ejemplos claros:</p>
                      <ul className="list-disc pl-5 text-sm text-gray-700">
                        {type.examples.map(example => (
                          <li key={example}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
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
