import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { isAdmin } from '@/lib/middleware/admin-auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await isAdmin(session.user.id);

    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get stats using service role client
    const [
      { count: totalUsers },
      { count: activeCreators },
      { count: pendingReports },
      { count: totalContent },
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'creator')
        .eq('subscription_status', 'active'),
      supabaseAdmin
        .from('content_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabaseAdmin.from('content').select('*', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeCreators: activeCreators || 0,
      pendingReports: pendingReports || 0,
      totalContent: totalContent || 0,
    });
  } catch (error: any) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
