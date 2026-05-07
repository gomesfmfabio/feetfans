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
    const { userId, banned } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Update user banned status
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ account_blocked: banned })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Log admin action
    await supabaseAdmin.from('audit_log').insert({
      event_type: banned ? 'user_banned' : 'user_unbanned',
      user_id: session.user.id,
      metadata: { target_user_id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Ban user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
