import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id ?? '';
    const body = await request.json();
    const supabase = getSupabaseClient();

    // First get the quote by public_token or id
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    let query = supabase.from('quotes').select('id');
    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('public_token', id);
    }

    const { data: quote } = await query.single();
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const { error } = await supabase.from('quote_events').insert({
      quote_id: quote.id,
      event: body.event,
      metadata: body.metadata ?? null,
    });

    if (error) {
      console.error('Error logging event:', error);
      return NextResponse.json({ error: 'Error logging event' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/quotes/[id]/events:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id ?? '';
    const supabase = getSupabaseClient();

    const { data: events, error } = await supabase
      .from('quote_events')
      .select('*')
      .eq('quote_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Error fetching events' }, { status: 500 });
    }

    return NextResponse.json(events ?? []);
  } catch (error) {
    console.error('Error in GET /api/quotes/[id]/events:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
