"use client";

import { useState } from 'react';
import { WizardData, initialWizardData } from '@/lib/types';
import { StepProgress } from './step-progress';
import { Step1Datos } from './step-1-datos';
import { Step2Proyecto } from './step-2-proyecto';
import { Step3Plazo } from './step-3-plazo';
import { Step4Technical } from './step-4-technical';
import { Step5Addons } from './step-5-addons';
import { StepSummary } from './step-summary';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TOTAL_STEPS = 6;

export function WizardContainer() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialWizardData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateData = (updates: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...updates }));
    setErrors({});
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        if (!data.clientName?.trim()) newErrors.clientName = 'El nombre es requerido';
        if (!data.clientEmail?.trim()) newErrors.clientEmail = 'El email es requerido';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.clientEmail)) {
          newErrors.clientEmail = 'Email inválido';
        }
        if (!data.clientWhatsapp?.trim()) newErrors.clientWhatsapp = 'El WhatsApp es requerido';
        else if (!/^\+?[0-9]{8,15}$/.test(data.clientWhatsapp.replace(/\s/g, ''))) {
          newErrors.clientWhatsapp = 'Número inválido';
        }
        break;
      case 2:
        if (!data.projectType) newErrors.projectType = 'Selecciona un tipo de proyecto';
        break;
      case 3:
        if (!data.timeline) newErrors.timeline = 'Selecciona un plazo';
        break;
      case 4:
        if (!data.siteSections?.length) newErrors.siteSections = 'Selecciona al menos una sección';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || 'Error al crear la cotización');
      }

      const result = await response.json();
      router.push(`/cotizar/resultados/${result?.public_token ?? ''}`);
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error al crear la cotización');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Datos data={data} updateData={updateData} errors={errors} />;
      case 2:
        return <Step2Proyecto data={data} updateData={updateData} errors={errors} />;
      case 3:
        return <Step3Plazo data={data} updateData={updateData} errors={errors} />;
      case 4:
        return <Step4Technical data={data} updateData={updateData} />;
      case 5:
        return <Step5Addons data={data} updateData={updateData} />;
      case 6:
        return <StepSummary data={data} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <StepProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <div className="bg-white rounded-xl card-shadow p-6 md:p-8 mt-8">
        {renderStep()}
        {errors.siteSections && (
          <p className="text-sm text-red-500 text-center mt-4">{errors.siteSections}</p>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-5 py-2.5 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </button>

          {currentStep < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  Generar cotización
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
