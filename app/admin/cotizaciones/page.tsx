'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Quote, QuoteStatus } from '@/lib/types';
import { formatPrice } from '@/lib/pricing-engine';
import { ThemeToggle } from '@/components/theme-toggle';
import { signOut } from 'next-auth/react';
import {
  Search,
  Filter,
  Eye,
  Download,
  Loader2,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const statusLabels: Record<QuoteStatus, string> = {
  DRAFT: 'Borrador',
  SENT: 'Enviada',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
};

const statusColors: Record<QuoteStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SENT: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const projectTypeLabels: Record<string, string> = {
  LANDING: 'Landing',
  CORPORATIVA: 'Corporativa',
  ECOMMERCE: 'E-commerce',
  INTRANET: 'Intranet',
};

const ITEMS_PER_PAGE = 20;

export default function AdminCotizacionesPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchQuotes = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (typeFilter !== 'all') params.set('type', typeFilter);
        params.set('page', String(page));
        params.set('limit', String(ITEMS_PER_PAGE));

        const response = await fetch(`/api/admin/quotes?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setQuotes(data.quotes ?? []);
          setTotal(data.total ?? 0);
        }
      } catch (err) {
        console.error('Error fetching quotes:', err);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchQuotes();
    }
  }, [status, search, statusFilter, typeFilter, page]);

  const handleDownloadPdf = async (quoteId: string, folio: string) => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}/pdf`);
      if (!response.ok) throw new Error('Error');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cotizacion-${folio}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Error al descargar el PDF');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

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
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-7 h-7 text-emerald-600" />
            Cotizaciones
          </h1>
          <p className="text-gray-500 mt-1">Gestiona todas las cotizaciones generadas</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl card-shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Buscar por folio, nombre o email..."
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value as QuoteStatus | 'all'); setPage(1); }}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="all">Todos los estados</option>
                <option value="DRAFT">Borrador</option>
                <option value="SENT">Enviada</option>
                <option value="ACCEPTED">Aceptada</option>
                <option value="REJECTED">Rechazada</option>
              </select>

              <select
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="all">Todos los tipos</option>
                <option value="LANDING">Landing</option>
                <option value="CORPORATIVA">Corporativa</option>
                <option value="ECOMMERCE">E-commerce</option>
                <option value="INTRANET">Intranet</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl card-shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
            </div>
          ) : quotes.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No se encontraron cotizaciones</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Folio</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Cliente</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Tipo</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Precio</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Estado</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Fecha</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {quotes.map(quote => (
                      <tr key={quote.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-medium text-emerald-600">
                            {quote.folio ?? '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {quote.client_name ?? '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {quote.client_email ?? '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">
                            {projectTypeLabels[quote.project_type ?? ''] ?? quote.project_type ?? '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatPrice(quote.min_price ?? 0)} - {formatPrice(quote.max_price ?? 0)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[(quote.status as QuoteStatus) ?? 'DRAFT'] ?? statusColors.DRAFT}`}
                          >
                            {statusLabels[(quote.status as QuoteStatus) ?? 'DRAFT'] ?? 'Borrador'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {quote.created_at
                            ? new Date(quote.created_at).toLocaleDateString('es-CL')
                            : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/cotizaciones/${quote.id}`}
                              className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Ver detalle"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDownloadPdf(quote.id, quote.folio ?? '')}
                              className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Descargar PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Mostrando {((page - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(page * ITEMS_PER_PAGE, total)} de {total}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 text-gray-500 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-gray-600">
                      Página {page} de {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 text-gray-500 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
