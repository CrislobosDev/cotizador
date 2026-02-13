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

    // public_token is also UUID, so always try both fields.
    const { data: quote } = await supabase
      .from('quotes')
      .select('id')
      .or(`id.eq.${id},public_token.eq.${id}`)
      .single();
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
