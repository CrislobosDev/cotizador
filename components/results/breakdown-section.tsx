"use client";

import { QuoteItem } from '@/lib/types';
import { formatPrice } from '@/lib/pricing-engine';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface BreakdownSectionProps {
  items: QuoteItem[];
}

export function BreakdownSection({ items }: BreakdownSectionProps) {
  const [expanded, setExpanded] = useState(false);

  // Group items by package
  const basicoItems = (items ?? []).filter(i => String(i?.name ?? '').startsWith('[Básico]'));
  const proItems = (items ?? []).filter(i => String(i?.name ?? '').startsWith('[Pro]'));
  const premiumItems = (items ?? []).filter(i => String(i?.name ?? '').startsWith('[Premium]'));

  const calculateTotal = (pkgItems: QuoteItem[]) =>
    (pkgItems ?? []).reduce((sum, i) => sum + Number(i?.amount ?? 0), 0);

  const renderPackageItems = (pkgItems: QuoteItem[], pkgName: string) => {
    if (!pkgItems?.length) return null;
    return (
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-800">{pkgName}</h4>
        {pkgItems.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-600">
              {String(item?.name ?? '').replace(`[${pkgName}] `, '')}
            </span>
            <span className="font-medium text-gray-900">
              {formatPrice(Number(item?.amount ?? 0))}
            </span>
          </div>
        ))}
        <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
          <span className="font-semibold text-gray-800">Total {pkgName}</span>
          <span className="font-bold text-emerald-600">
            {formatPrice(calculateTotal(pkgItems))}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl card-shadow p-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="text-lg font-semibold text-gray-900">Desglose detallado</h3>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {expanded && (
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {renderPackageItems(basicoItems, 'Básico')}
          {renderPackageItems(proItems, 'Pro')}
          {renderPackageItems(premiumItems, 'Premium')}
        </div>
      )}
    </div>
  );
}
