import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { WizardData, ProjectType, Timeline } from '@/lib/types';
import { calculatePricing } from '@/lib/pricing-engine';
import { generateFolio, generatePublicToken, getNextSequenceNumber } from '@/lib/folio-generator';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data: WizardData = await request.json();

    // Validate required fields
    if (!data.clientName?.trim() || !data.clientEmail?.trim() || !data.clientWhatsapp?.trim()) {
      return NextResponse.json({ error: 'Datos de cliente incompletos' }, { status: 400 });
    }
    if (!data.projectType) {
      return NextResponse.json({ error: 'Tipo de proyecto requerido' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const pricing = calculatePricing(data);
    const publicToken = generatePublicToken();
    const sequenceNumber = await getNextSequenceNumber(supabase);
    const folio = generateFolio(sequenceNumber);

    // Create the quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        folio,
        client_name: data.clientName.trim(),
        client_email: data.clientEmail.trim().toLowerCase(),
        client_whatsapp: data.clientWhatsapp.trim(),
        project_type: data.projectType as ProjectType,
        industry: data.industry?.trim() || null,
        timeline: (data.timeline as Timeline) || '4+_WEEKS',
        min_price: pricing.basico.minPrice,
        max_price: pricing.premium.maxPrice,
        currency: 'CLP',
        status: 'DRAFT',
        public_token: publicToken,
      })
      .select()
      .single();

    if (quoteError || !quote) {
      console.error('Error creating quote:', quoteError);
      return NextResponse.json({ error: 'Error al crear la cotización' }, { status: 500 });
    }

    const quoteData = quote as { id: string; folio: string; public_token: string };

    // Save answers
    const answers = [
      { key: 'numPages', value: String(data.numPages ?? 1) },
      { key: 'needsBlog', value: String(data.needsBlog ?? false) },
      { key: 'multiLanguage', value: String(data.multiLanguage ?? false) },
      { key: 'needsLogin', value: String(data.needsLogin ?? false) },
      { key: 'externalIntegrations', value: String(data.externalIntegrations ?? false) },
      { key: 'needsPaymentGateway', value: String(data.needsPaymentGateway ?? false) },
      ...Object.entries(data.addons ?? {}).map(([key, value]) => ({
        key: `addon_${key}`,
        value: String(value),
      })),
    ];

    const { error: answersError } = await supabase
      .from('quote_answers')
      .insert(answers.map(a => ({ quote_id: quoteData.id, key: a.key, value: a.value })));

    if (answersError) {
      console.error('Error saving answers:', answersError);
    }

    // Save items for all packages
    const allItems: { quote_id: string; item_type: string; name: string; amount: number }[] = [];
    
    (['basico', 'pro', 'premium'] as const).forEach(packageKey => {
      const pkg = pricing[packageKey];
      pkg.items.forEach(item => {
        allItems.push({
          quote_id: quoteData.id,
          item_type: item.type,
          name: `[${pkg.name}] ${item.name}`,
          amount: item.amount,
        });
      });
    });

    const { error: itemsError } = await supabase
      .from('quote_items')
      .insert(allItems);

    if (itemsError) {
      console.error('Error saving items:', itemsError);
    }

    // Log creation event
    await supabase.from('quote_events').insert({
      quote_id: quoteData.id,
      event: 'CREATED',
      metadata: { source: 'wizard' },
    });

    return NextResponse.json({
      id: quoteData.id,
      folio: quoteData.folio,
      public_token: quoteData.public_token,
    });
  } catch (error) {
    console.error('Error in POST /api/quotes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
