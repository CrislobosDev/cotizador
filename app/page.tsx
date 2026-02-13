'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Zap, Shield, Clock, CheckCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const features = [
  {
    icon: Zap,
    title: 'Cotización Instantánea',
    description: 'Obtén un presupuesto detallado en menos de 2 minutos.',
  },
  {
    icon: FileText,
    title: 'PDF Profesional',
    description: 'Descarga tu cotización en formato PDF con todos los detalles.',
  },
  {
    icon: Shield,
    title: '3 Paquetes a Elegir',
    description: 'Básico, Pro o Premium. Encuentra el que mejor se adapte a ti.',
  },
  {
    icon: Clock,
    title: 'Precios Transparentes',
    description: 'Sin sorpresas ni costos ocultos. Todo desglosado claramente.',
  },
];

const projectTypes = [
  { name: 'Landing Page', price: 'Desde $250.000' },
  { name: 'Sitio Corporativo', price: 'Desde $500.000' },
  { name: 'E-commerce', price: 'Desde $900.000' },
  { name: 'Intranet', price: 'Desde $2.500.000' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-slate-900/90">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-52 h-16">
              <Image
                src="/logo-villaweb.png"
                alt="VillaWeb Logo"
                fill
                className="object-contain object-left scale-[2.4] origin-left"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/cotizar"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              Cotizar ahora
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-bg text-white py-20 lg:py-32">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Cotiza tu proyecto web en <span className="text-emerald-200">minutos</span>
            </h1>
            <p className="text-xl lg:text-2xl text-emerald-100 mb-8">
              Responde unas simples preguntas y recibe una cotización detallada al instante. Sin compromisos.
            </p>
            <Link
              href="/cotizar"
              className="inline-flex items-center gap-3 bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Comenzar cotización gratuita
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-gray-600 text-lg">
              Un proceso simple y transparente para obtener tu cotización
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6 card-shadow card-shadow-hover transition-all"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Tipos de proyectos
            </h2>
            <p className="text-gray-600 text-lg">
              Desarrollamos todo tipo de soluciones web a medida
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {projectTypes.map((project, index) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 card-shadow card-shadow-hover transition-all text-center"
              >
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {project.name}
                </h3>
                <p className="text-emerald-600 font-medium">{project.price}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              ¿Listo para comenzar?
            </h2>
            <p className="text-emerald-100 text-lg mb-8">
              Obtén tu cotización personalizada en menos de 2 minutos. Sin costos ni compromisos.
            </p>
            <Link
              href="/cotizar"
              className="inline-flex items-center gap-3 bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Cotizar mi proyecto
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <Image
                  src="/logo-villaweb.png"
                  alt="VillaWeb Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-bold text-white">VillaWeb</span>
                <p className="text-xs">Desarrollo de Software</p>
              </div>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} VillaWeb. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
