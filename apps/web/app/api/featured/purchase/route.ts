import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Simplified featured placement purchase (Stripe integration pending)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, duration_days } = body; // tier: 'standard' | 'premium', duration_days: 7 | 30

    // Get authenticated user
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map((c) => {
        const [key, ...v] = c.split('=');
        return [key, v.join('=')];
      })
    );

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabase = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storage: {
            getItem: (key) => cookies[key] || null,
            setItem: () => {},
            removeItem: () => {},
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate tier and duration
    if (!['standard', 'premium'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      );
    }

    if (![7, 30].includes(duration_days)) {
      return NextResponse.json(
        { error: 'Invalid duration' },
        { status: 400 }
      );
    }

    // Use service role client
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is paid creator
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('subscription_status, role')
      .eq('id', session.user.id)
      .single();

    if (!user || user.role !== 'creator') {
      return NextResponse.json(
        { error: 'Only creators can purchase featured placement' },
        { status: 400 }
      );
    }

    if (!['active', 'free_feetfans'].includes(user.subscription_status)) {
      return NextResponse.json(
        {
          error: 'Upgrade required',
          message: 'Upgrade to paid subscription to purchase featured placement',
        },
        { status: 403 }
      );
    }

    // Check if already has active placement
    const { data: existing } = await supabaseAdmin
      .from('featured_placements')
      .select('id, expires_at')
      .eq('creator_id', session.user.id)
      .eq('is_active', true)
      .single();

    if (existing) {
      return NextResponse.json(
        {
          error: 'Already featured',
          message: `You already have an active featured placement until ${new Date(existing.expires_at).toLocaleDateString()}`,
        },
        { status: 400 }
      );
    }

    // Calculate expiration
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration_days * 24 * 60 * 60 * 1000);

    // Create featured placement
    const { data: placement, error } = await supabaseAdmin
      .from('featured_placements')
      .insert({
        creator_id: session.user.id,
        tier,
        expires_at: expiresAt.toISOString(),
        payment_type: 'one_time', // Simplified
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create placement:', error);
      return NextResponse.json(
        { error: 'Failed to create featured placement' },
        { status: 500 }
      );
    }

    console.log(
      `[Featured Placement] ${session.user.id} purchased ${tier} for ${duration_days} days`
    );

    return NextResponse.json({
      success: true,
      message: "You're now featured!",
      placement,
    });
  } catch (err: any) {
    console.error('[Featured Placement] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
