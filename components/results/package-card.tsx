"use client";

import { PackageOption } from '@/lib/types';
import { formatPrice } from '@/lib/pricing-engine';
import { Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface PackageCardProps {
  pkg: PackageOption;
  index: number;
}

export function PackageCard({ pkg, index }: PackageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative bg-white rounded-2xl card-shadow overflow-hidden ${
        pkg.isRecommended ? 'ring-2 ring-emerald-500' : ''
      }`}
    >
      {pkg.isRecommended && (
        <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-center py-2 text-sm font-medium flex items-center justify-center gap-2">
          <Star className="w-4 h-4" />
          Recomendado
        </div>
      )}

      <div className={`p-6 ${pkg.isRecommended ? 'pt-14' : ''}`}>
        <h3 className="text-xl font-bold text-gray-900 mb-1">{pkg.name}</h3>
        <p className="text-gray-500 text-sm mb-4">{pkg.description}</p>

        <div className="mb-6">
          <span className="text-3xl font-bold text-emerald-600">
            {formatPrice(pkg.minPrice)}
          </span>
          <span className="text-gray-400"> - </span>
          <span className="text-2xl font-semibold text-emerald-600">
            {formatPrice(pkg.maxPrice)}
          </span>
        </div>

        <div className="space-y-3">
          {(pkg.features ?? []).slice(0, 8).map((feature, i) => (
            <div key={i} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Desglose incluido en el PDF
          </p>
        </div>
      </div>
    </motion.div>
  );
}
