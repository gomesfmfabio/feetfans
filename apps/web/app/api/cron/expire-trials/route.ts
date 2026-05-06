import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cron job endpoint to expire trials daily
// Run once per day to check for expired trials (trial_ends_at < NOW())

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 1 minute timeout

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the database function to expire trials
    const { data, error } = await supabase.rpc('expire_trials');

    if (error) {
      console.error('Error expiring trials:', error);
      return NextResponse.json(
        { error: 'Failed to expire trials', details: error.message },
        { status: 500 }
      );
    }

    const expiredUsers = data || [];
    console.log(`[Expire Trials] Expired ${expiredUsers.length} trials`);

    // Log expired users
    expiredUsers.forEach((user: any) => {
      console.log(
        `[Expire Trials] User ${user.nickname} (${user.email}) trial expired at ${user.expired_at}`
      );
    });

    return NextResponse.json({
      success: true,
      expired_count: expiredUsers.length,
      expired_users: expiredUsers.map((u: any) => ({
        id: u.user_id,
        nickname: u.nickname,
        email: u.email,
      })),
    });
  } catch (err: any) {
    console.error('[Expire Trials] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
