'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PackageCard } from '@/components/results/package-card';
import { BreakdownSection } from '@/components/results/breakdown-section';
import { ThemeToggle } from '@/components/theme-toggle';
import { Quote, QuoteItem, QuoteAnswer, PackageOption, WHATSAPP_NUMBER } from '@/lib/types';
import { calculatePricing, formatPrice } from '@/lib/pricing-engine';
import { Download, MessageCircle, Loader2, CheckCircle, AlertCircle, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuoteWithRelations extends Quote {
  items: QuoteItem[];
  answers: QuoteAnswer[];
}

export default function ResultadosPage() {
  const params = useParams();
  const token = params?.token as string;
  const [quote, setQuote] = useState<QuoteWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch(`/api/quotes/${token}`);
        if (!response.ok) {
          throw new Error('Cotización no encontrada');
        }
        const data = await response.json();
        setQuote(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la cotización');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchQuote();
    }
  }, [token]);

  const handleDownloadPdf = async () => {
    if (downloadingPdf || !token) return;
    setDownloadingPdf(true);

    try {
      const response = await fetch(`/api/quotes/${token}/pdf`);
      if (!response.ok) throw new Error('Error al generar PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cotizacion-${quote?.folio ?? 'VW'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Error al descargar el PDF. Por favor, intenta de nuevo.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleWhatsApp = async () => {
    if (!quote) return;

    // Log event
    await fetch(`/api/quotes/${token}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'SENT_WHATSAPP', metadata: {} }),
    }).catch(() => {});

    const message = encodeURIComponent(
      `Hola VillaWeb, solicito información sobre la cotización ${quote.folio}. Proyecto: ${quote.project_type}, Precio estimado: ${formatPrice(quote.min_price)} - ${formatPrice(quote.max_price)}. Gracias!`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  // Reconstruct wizard data from answers
  const getWizardDataFromAnswers = () => {
    const answerMap: Record<string, string> = {};
    (quote?.answers ?? []).forEach(a => {
      answerMap[a?.key ?? ''] = a?.value ?? '';
    });

    let parsedSections: string[] = [];
    try {
      const rawSections = answerMap.siteSections;
      if (rawSections) {
        const maybeArray = JSON.parse(rawSections);
        if (Array.isArray(maybeArray)) {
          parsedSections = maybeArray.filter(Boolean);
        }
      }
    } catch {
      parsedSections = [];
    }

    if (!parsedSections.length) {
      const legacyPages = parseInt(answerMap.numPages ?? '1', 10) || 1;
      parsedSections = Array.from({ length: legacyPages }, (_, i) => `Sección ${i + 1}`);
    }

    return {
      clientName: quote?.client_name ?? '',
      clientEmail: quote?.client_email ?? '',
      clientWhatsapp: quote?.client_whatsapp ?? '',
      projectType: quote?.project_type ?? 'LANDING',
      industry: quote?.industry ?? '',
      timeline: quote?.timeline ?? '4+_WEEKS',
      siteSections: parsedSections,
      needsBlog: answerMap.needsBlog === 'true',
      multiLanguage: answerMap.multiLanguage === 'true',
      needsLogin: answerMap.needsLogin === 'true',
      externalIntegrations: answerMap.externalIntegrations === 'true',
      needsPaymentGateway: answerMap.needsPaymentGateway === 'true',
      addons: {
        seoInicial: answerMap.addon_seoInicial === 'true',
        copywriting: answerMap.addon_copywriting === 'true',
        integracionPagos: answerMap.addon_integracionPagos === 'true',
        mantenimientoMensual: answerMap.addon_mantenimientoMensual === 'true',
        dominioCorreos: answerMap.addon_dominioCorreos === 'true',
        googleAnalytics: answerMap.addon_googleAnalytics === 'true',
      },
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Cargando cotización...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Cotización no encontrada</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error ?? 'La cotización que buscas no existe o ha expirado.'}</p>
          <Link
            href="/cotizar"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Home className="w-5 h-5" />
            Crear nueva cotización
          </Link>
        </div>
      </div>
    );
  }

  const wizardData = getWizardDataFromAnswers();
  const pricing = calculatePricing(wizardData);
  const packages: PackageOption[] = [pricing.basico, pricing.pro, pricing.premium];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 dark:bg-slate-900 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-52 h-16">
              <Image
                src="/logo-villaweb.png"
                alt="VillaWeb Logo"
                fill
                className="object-contain object-left scale-[2.4] origin-left"
              />
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Success banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-8 flex items-center gap-3"
        >
          <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-emerald-800">
              ¡Cotización generada exitosamente!
            </p>
            <p className="text-emerald-700 text-sm">
              Folio: <span className="font-mono font-bold">{quote.folio}</span>
            </p>
          </div>
        </motion.div>

        {/* Header section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Elige tu paquete ideal
          </h1>
          <p className="text-gray-600 text-lg">
            Compara las opciones y selecciona la que mejor se adapte a tu proyecto
          </p>
        </div>

        {/* Packages grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {packages.map((pkg, index) => (
            <PackageCard key={pkg.name} pkg={pkg} index={index} />
          ))}
        </div>

        {/* Breakdown section */}
        <BreakdownSection items={quote.items ?? []} />

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {downloadingPdf ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generando PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Descargar PDF
              </>
            )}
          </button>

          <button
            onClick={handleWhatsApp}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-medium transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Enviar por WhatsApp
          </button>
        </motion.div>

        {/* Info text */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Esta cotización tiene validez de 7 días. Guarda tu folio: <strong>{quote.folio}</strong>
        </p>
      </main>
    </div>
  );
}
