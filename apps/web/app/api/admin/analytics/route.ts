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

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Parallel queries for better performance
    const [
      { count: totalUsers },
      { count: creators },
      { count: consumers },
      { count: new7d },
      { count: activeSubscriptions },
      { count: trialSubscriptions },
      { count: expiredSubscriptions },
      { count: freeSubscriptions },
      { count: totalContent },
      { count: photos },
      { count: videos },
      { count: contentNew7d },
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'creator'),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'consumer'),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString()),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('subscription_status', 'trial'),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('subscription_status', 'expired'),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('subscription_status', 'free_feetfans'),
      supabaseAdmin.from('content').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('content').select('*', { count: 'exact', head: true }).eq('file_type', 'photo'),
      supabaseAdmin.from('content').select('*', { count: 'exact', head: true }).eq('file_type', 'video'),
      supabaseAdmin.from('content').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString()),
    ]);

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = (activeSubscriptions || 0) * 9; // $9/month per subscription

    // Calculate conversion rate (trial to paid)
    const totalTrialAndActive = (trialSubscriptions || 0) + (activeSubscriptions || 0);
    const conversionRate = totalTrialAndActive > 0
      ? Math.round(((activeSubscriptions || 0) / totalTrialAndActive) * 100)
      : 0;

    return NextResponse.json({
      revenue: {
        total: mrr, // Simplified - would need Stripe data for actual total
        mrr,
      },
      subscriptions: {
        active: activeSubscriptions || 0,
        trial: trialSubscriptions || 0,
        expired: expiredSubscriptions || 0,
        free: freeSubscriptions || 0,
      },
      users: {
        total: totalUsers || 0,
        creators: creators || 0,
        consumers: consumers || 0,
        new7d: new7d || 0,
      },
      conversion: {
        rate: conversionRate,
      },
      content: {
        total: totalContent || 0,
        photos: photos || 0,
        videos: videos || 0,
        new7d: contentNew7d || 0,
      },
    });
  } catch (error: any) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
