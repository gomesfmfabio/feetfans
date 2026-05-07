import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { isAdmin } from '@/lib/middleware/admin-auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await isAdmin(session.user.id);

    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';

    let query = supabaseAdmin
      .from('users')
      .select('id, email, nickname, role, subscription_status, account_blocked, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    // Apply filters
    if (filter === 'creator') {
      query = query.eq('role', 'creator');
    } else if (filter === 'consumer') {
      query = query.eq('role', 'consumer');
    } else if (filter === 'active') {
      query = query.eq('subscription_status', 'active');
    } else if (filter === 'trial') {
      query = query.eq('subscription_status', 'trial');
    } else if (filter === 'banned') {
      query = query.eq('account_blocked', true);
    }

    // Apply search
    if (search) {
      query = query.or(`email.ilike.%${search}%,nickname.ilike.%${search}%`);
    }

    const { data: users, error } = await query;

    if (error) throw error;

    return NextResponse.json({ users: users || [] });
  } catch (error: any) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
