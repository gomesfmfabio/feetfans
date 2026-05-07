import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { isAdmin } from '@/lib/middleware/admin-auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();

  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await isAdmin(session.user.id);

    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { reportId, action } = body;

    if (!reportId || !action) {
      return NextResponse.json(
        { error: 'Report ID and action required' },
        { status: 400 }
      );
    }

    // Get report
    const { data: report } = await supabaseAdmin
      .from('content_reports')
      .select('content_id')
      .eq('id', reportId)
      .single();

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    if (action === 'reject') {
      // Remove content
      await supabaseAdmin
        .from('content')
        .delete()
        .eq('id', report.content_id);

      // Update report status
      await supabaseAdmin
        .from('content_reports')
        .update({ status: 'resolved' })
        .eq('id', reportId);

      // Log action
      await supabaseAdmin.from('audit_log').insert({
        event_type: 'content_removed',
        user_id: session.user.id,
        metadata: { report_id: reportId, content_id: report.content_id },
      });
    } else {
      // Dismiss report (approve content)
      await supabaseAdmin
        .from('content_reports')
        .update({ status: 'dismissed' })
        .eq('id', reportId);

      // Log action
      await supabaseAdmin.from('audit_log').insert({
        event_type: 'report_dismissed',
        user_id: session.user.id,
        metadata: { report_id: reportId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Resolve report error:', error);
    return NextResponse.json(
      { error: 'Failed to resolve report' },
      { status: 500 }
    );
  }
}
