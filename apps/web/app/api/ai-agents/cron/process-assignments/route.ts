import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cron job endpoint to process due AI agent assignments
// Run hourly to check for assignments where scheduled_for <= NOW()
// Creates conversations and marks assignments as sent

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout

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

    // Call the database function to process due assignments
    const { data, error } = await supabase.rpc('process_due_agent_assignments');

    if (error) {
      console.error('Error processing assignments:', error);
      return NextResponse.json(
        { error: 'Failed to process assignments', details: error.message },
        { status: 500 }
      );
    }

    // Count successes and errors
    const results = data || [];
    const successful = results.filter((r: any) => r.status === 'conversation_created').length;
    const failed = results.filter((r: any) => r.status.startsWith('error')).length;

    console.log(`Processed ${results.length} assignments: ${successful} successful, ${failed} failed`);

    return NextResponse.json({
      success: true,
      processed: results.length,
      successful,
      failed,
      results,
    });
  } catch (err: any) {
    console.error('Cron job error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
