import { v4 as uuidv4 } from 'uuid';
import { SupabaseClient } from '@supabase/supabase-js';

export function generateFolio(sequenceNumber: number): string {
  const year = new Date().getFullYear();
  const paddedNumber = String(sequenceNumber).padStart(6, '0');
  return `VW-${year}-${paddedNumber}`;
}

export function generatePublicToken(): string {
  return uuidv4();
}

export async function getNextSequenceNumber(supabase: SupabaseClient): Promise<number> {
  const currentYear = new Date().getFullYear();
  const prefix = `VW-${currentYear}-`;
  
  const { data, error } = await supabase
    .from('quotes')
    .select('folio')
    .like('folio', `${prefix}%`)
    .order('folio', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return 1;
  }

  const lastFolio = (data[0] as { folio?: string })?.folio ?? '';
  const lastNumber = parseInt(lastFolio.replace(prefix, ''), 10);
  return isNaN(lastNumber) ? 1 : lastNumber + 1;
}
