import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Verify request is authorized (check for cron secret or service key)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete expired messages
    const { error, count } = await supabaseAdmin
      .from('messages')
      .delete({ count: 'exact' })
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Failed to delete expired messages:', error);
      return NextResponse.json(
        { error: 'Failed to delete expired messages', details: error },
        { status: 500 }
      );
    }

    console.log(`[Cleanup] Deleted ${count || 0} expired messages`);

    return NextResponse.json({
      success: true,
      deleted_count: count || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in POST /api/messages/cleanup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Allow GET for manual trigger (development only)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'GET method not allowed in production' },
      { status: 405 }
    );
  }

  return POST(request);
}
