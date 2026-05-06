import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Health check endpoint for monitoring
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    // Quick DB check
    const { error } = await supabase.from('users').select('id').limit(1);

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: error ? 'unhealthy' : 'healthy',
      version: '1.0.0'
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'unhealthy', error: err.message }, { status: 503 });
  }
}
