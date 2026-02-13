import Image from 'next/image';
import Link from 'next/link';
import { WizardContainer } from '@/components/wizard/wizard-container';
import { ThemeToggle } from '@/components/theme-toggle';

export default function CotizarPage() {
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

      {/* Main content */}
      <main className="py-8 px-4">
        <WizardContainer />
      </main>
    </div>
  );
}
