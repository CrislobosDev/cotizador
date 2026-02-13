import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id ?? '';
    const supabase = getSupabaseClient();

    // Check if id is a UUID or public_token
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase.from('quotes').select('*');
    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('public_token', id);
    }

    const { data: quote, error } = await query.single();

    if (error || !quote) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 });
    }

    // Get answers
    const { data: answers } = await supabase
      .from('quote_answers')
      .select('*')
      .eq('quote_id', quote.id);

    // Get items
    const { data: items } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quote.id);

    // Log view event
    await supabase.from('quote_events').insert({
      quote_id: quote.id,
      event: 'VIEWED',
      metadata: { source: 'public' },
    });

    return NextResponse.json({
      ...quote,
      answers: answers ?? [],
      items: items ?? [],
    });
  } catch (error) {
    console.error('Error in GET /api/quotes/[id]:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id ?? '';
    const body = await request.json();
    const supabase = getSupabaseClient();

    const { data: quote, error } = await supabase
      .from('quotes')
      .update({
        status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !quote) {
      return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
    }

    // Log event
    await supabase.from('quote_events').insert({
      quote_id: id,
      event: 'STATUS_CHANGED',
      metadata: { new_status: body.status },
    });

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error in PATCH /api/quotes/[id]:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
