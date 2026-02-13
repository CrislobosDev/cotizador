import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'Cotizador Pro VillaWeb - Cotizaciones Instantáneas para tu Proyecto Web',
  description: 'Genera cotizaciones instantáneas para tu proyecto web. Landing pages, sitios corporativos, e-commerce y más. VillaWeb - Desarrollo de Software.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'Cotizador Pro VillaWeb',
    description: 'Genera cotizaciones instantáneas para tu proyecto web',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
