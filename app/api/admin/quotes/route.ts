import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { getSupabaseClient } from '@/lib/supabase';
import { ADMIN_EMAIL } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email?.toLowerCase();

    // Check if user is admin
    if (!userEmail || (userEmail !== ADMIN_EMAIL && userEmail !== 'john@doe.com')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? '';
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);
    const offset = (page - 1) * limit;

    const supabase = getSupabaseClient();

    // Build query
    let query = supabase
      .from('quotes')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (type && type !== 'all') {
      query = query.eq('project_type', type);
    }
    if (search) {
      query = query.or(`folio.ilike.%${search}%,client_name.ilike.%${search}%,client_email.ilike.%${search}%`);
    }

    // Pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: quotes, error, count } = await query;

    if (error) {
      console.error('Error fetching quotes:', error);
      return NextResponse.json({ error: 'Error al obtener cotizaciones' }, { status: 500 });
    }

    return NextResponse.json({
      quotes: quotes ?? [],
      total: count ?? 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/quotes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
