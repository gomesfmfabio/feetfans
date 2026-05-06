import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cron job to expire featured placements daily
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase.rpc('expire_featured_placements');

    if (error) {
      console.error('Error expiring featured placements:', error);
      return NextResponse.json(
        { error: 'Failed to expire placements', details: error.message },
        { status: 500 }
      );
    }

    const expired = data || [];
    console.log(`[Expire Featured] Expired ${expired.length} placements`);

    return NextResponse.json({
      success: true,
      expired_count: expired.length,
      expired_placements: expired,
    });
  } catch (err: any) {
    console.error('[Expire Featured] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
