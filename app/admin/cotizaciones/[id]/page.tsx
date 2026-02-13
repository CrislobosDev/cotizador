'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Quote, QuoteAnswer, QuoteItem, QuoteEvent, QuoteStatus } from '@/lib/types';
import { formatPrice } from '@/lib/pricing-engine';
import { ThemeToggle } from '@/components/theme-toggle';
import { signOut } from 'next-auth/react';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  FileText,
  Download,
  LogOut,
  Loader2,
  Save,
  Clock,
  Eye,
  MessageCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface QuoteWithRelations extends Quote {
  answers: QuoteAnswer[];
  items: QuoteItem[];
}

const statusLabels: Record<QuoteStatus, string> = {
  DRAFT: 'Borrador',
  SENT: 'Enviada',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
};

const statusColors: Record<QuoteStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-300',
  SENT: 'bg-blue-100 text-blue-700 border-blue-300',
  ACCEPTED: 'bg-green-100 text-green-700 border-green-300',
  REJECTED: 'bg-red-100 text-red-700 border-red-300',
};

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

const eventLabels: Record<string, { label: string; icon: typeof Eye }> = {
  CREATED: { label: 'Cotización creada', icon: FileText },
  VIEWED: { label: 'Cotización vista', icon: Eye },
  PDF_DOWNLOADED: { label: 'PDF descargado', icon: Download },
  SENT_WHATSAPP: { label: 'Enviado por WhatsApp', icon: MessageCircle },
  STATUS_CHANGED: { label: 'Estado modificado', icon: CheckCircle },
};

export default function AdminQuoteDetailPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const params = useParams();
  const quoteId = params?.id as string;

  const [quote, setQuote] = useState<QuoteWithRelations | null>(null);
  const [events, setEvents] = useState<QuoteEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState<QuoteStatus>('DRAFT');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch quote
        const quoteRes = await fetch(`/api/quotes/${quoteId}`);
        if (quoteRes.ok) {
          const quoteData = await quoteRes.json();
          setQuote(quoteData);
          setNewStatus(quoteData.status ?? 'DRAFT');
        }

        // Fetch events
        const eventsRes = await fetch(`/api/quotes/${quoteId}/events`);
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData ?? []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && quoteId) {
      fetchData();
    }
  }, [status, quoteId]);

  const handleSaveStatus = async () => {
    if (!quote || saving) return;
    setSaving(true);

    try {
      const response = await fetch(`/api/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updated = await response.json();
        setQuote(prev => prev ? { ...prev, status: updated.status } : null);
        // Refresh events
        const eventsRes = await fetch(`/api/quotes/${quoteId}/events`);
        if (eventsRes.ok) {
          setEvents(await eventsRes.json());
        }
      }
    } catch (err) {
      console.error('Error saving status:', err);
      alert('Error al guardar el estado');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!quote) return;
    try {
      const response = await fetch(`/api/quotes/${quote.id}/pdf`);
      if (!response.ok) throw new Error('Error');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cotizacion-${quote.folio}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Error al descargar el PDF');
    }
  };

  // Parse answers
  const getAnswer = (key: string): string => {
    const answer = (quote?.answers ?? []).find(a => a?.key === key);
    return answer?.value ?? '';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated' || !quote) {
    return null;
  }

  // Group items by package
  const basicoItems = (quote.items ?? []).filter(i => String(i?.name ?? '').startsWith('[Básico]'));
  const proItems = (quote.items ?? []).filter(i => String(i?.name ?? '').startsWith('[Pro]'));
  const premiumItems = (quote.items ?? []).filter(i => String(i?.name ?? '').startsWith('[Premium]'));

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 dark:bg-slate-900 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-44 h-14">
              <Image
                src="/logo-villaweb.png"
                alt="VillaWeb Logo"
                fill
                className="object-contain object-left scale-[2.4] origin-left"
              />
            </div>
            <div className="border-l border-gray-300 pl-4">
              <span className="font-bold text-emerald-700 text-lg">Panel Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/admin/cotizaciones"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a cotizaciones
        </Link>

        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-7 h-7 text-emerald-600" />
              {quote.folio}
            </h1>
            <p className="text-gray-500 mt-1">
              Creada el {new Date(quote.created_at).toLocaleString('es-CL')}
            </p>
          </div>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Download className="w-5 h-5" />
            Descargar PDF
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client info */}
            <div className="bg-white rounded-xl card-shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos del cliente</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-medium text-gray-900">{quote.client_name ?? '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{quote.client_email ?? '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm text-gray-500">WhatsApp</p>
                    <p className="font-medium text-gray-900">{quote.client_whatsapp ?? '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project info */}
            <div className="bg-white rounded-xl card-shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles del proyecto</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="font-medium text-gray-900">
                      {projectTypeLabels[quote.project_type ?? ''] ?? quote.project_type ?? '-'}
                      {quote.industry && <span className="text-gray-500"> ({quote.industry})</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm text-gray-500">Plazo</p>
                    <p className="font-medium text-gray-900">
                      {timelineLabels[quote.timeline ?? ''] ?? quote.timeline ?? '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm text-gray-500">Secciones</p>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        try {
                          const raw = getAnswer('siteSections');
                          const sections = raw ? JSON.parse(raw) : [];
                          if (Array.isArray(sections) && sections.length > 0) {
                            return sections.map((section: string) => (
                              <span key={section} className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs">
                                {sectionLabels[section] ?? section}
                              </span>
                            ));
                          }
                        } catch {}

                        const legacyPages = parseInt(getAnswer('numPages') || '1', 10) || 1;
                        return (
                          <p className="font-medium text-gray-900">
                            {legacyPages} sección(es) registradas
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-3">Funcionalidades solicitadas:</p>
                <div className="flex flex-wrap gap-2">
                  {getAnswer('needsBlog') === 'true' && (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Blog</span>
                  )}
                  {getAnswer('multiLanguage') === 'true' && (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Multi-idioma</span>
                  )}
                  {getAnswer('needsLogin') === 'true' && (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Login/Usuarios</span>
                  )}
                  {getAnswer('externalIntegrations') === 'true' && (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Integraciones</span>
                  )}
                  {getAnswer('needsPaymentGateway') === 'true' && (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Pagos</span>
                  )}
                </div>
              </div>

              {/* Add-ons */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Add-ons seleccionados:</p>
                <div className="flex flex-wrap gap-2">
                  {getAnswer('addon_seoInicial') === 'true' && (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">SEO inicial</span>
                  )}
                  {getAnswer('addon_copywriting') === 'true' && (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Copywriting</span>
                  )}
                  {getAnswer('addon_integracionPagos') === 'true' && (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Integración pagos</span>
                  )}
                  {getAnswer('addon_mantenimientoMensual') === 'true' && (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Mantenimiento</span>
                  )}
                  {getAnswer('addon_dominioCorreos') === 'true' && (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Dominio+Correos</span>
                  )}
                  {getAnswer('addon_googleAnalytics') === 'true' && (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Analytics</span>
                  )}
                </div>
              </div>
            </div>

            {/* Items breakdown */}
            <div className="bg-white rounded-xl card-shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Desglose de precios</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Básico */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Básico</h3>
                  <div className="space-y-2 text-sm">
                    {basicoItems.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-gray-600">{String(item?.name ?? '').replace('[Básico] ', '')}</span>
                        <span className="font-medium">{formatPrice(Number(item?.amount ?? 0))}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-200 font-semibold flex justify-between">
                      <span>Total</span>
                      <span className="text-emerald-600">
                        {formatPrice(basicoItems.reduce((s, i) => s + Number(i?.amount ?? 0), 0))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pro */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Pro</h3>
                  <div className="space-y-2 text-sm">
                    {proItems.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-gray-600">{String(item?.name ?? '').replace('[Pro] ', '')}</span>
                        <span className="font-medium">{formatPrice(Number(item?.amount ?? 0))}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-200 font-semibold flex justify-between">
                      <span>Total</span>
                      <span className="text-emerald-600">
                        {formatPrice(proItems.reduce((s, i) => s + Number(i?.amount ?? 0), 0))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Premium */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Premium</h3>
                  <div className="space-y-2 text-sm">
                    {premiumItems.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-gray-600">{String(item?.name ?? '').replace('[Premium] ', '')}</span>
                        <span className="font-medium">{formatPrice(Number(item?.amount ?? 0))}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-200 font-semibold flex justify-between">
                      <span>Total</span>
                      <span className="text-emerald-600">
                        {formatPrice(premiumItems.reduce((s, i) => s + Number(i?.amount ?? 0), 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status management */}
            <div className="bg-white rounded-xl card-shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado</h2>
              <div className="space-y-4">
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as QuoteStatus)}
                  className={`w-full px-4 py-3 border-2 rounded-lg font-medium transition-all ${statusColors[newStatus] ?? statusColors.DRAFT}`}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>

                <button
                  onClick={handleSaveStatus}
                  disabled={saving || newStatus === quote.status}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar cambios
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Events history */}
            <div className="bg-white rounded-xl card-shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de eventos</h2>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay eventos registrados</p>
                ) : (
                  events.map((event, i) => {
                    const eventInfo = eventLabels[event?.event ?? ''] ?? { label: event?.event ?? '-', icon: Clock };
                    const Icon = eventInfo.icon;

                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{eventInfo.label}</p>
                          <p className="text-xs text-gray-500">
                            {event?.created_at ? new Date(event.created_at).toLocaleString('es-CL') : '-'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
