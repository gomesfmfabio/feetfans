import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Simplified upgrade endpoint (Stripe integration coming later)
// Upgrades trial user to active paid subscription

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from request cookies
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

    // Use service role client for updates
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get current user info
    const { data: currentUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('subscription_status, role')
      .eq('id', session.user.id)
      .single();

    if (userError || !currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is a creator
    if (currentUser.role !== 'creator') {
      return NextResponse.json(
        { error: 'Only creators can upgrade' },
        { status: 400 }
      );
    }

    // Check if already paid
    if (['active', 'free_feetfans'].includes(currentUser.subscription_status)) {
      return NextResponse.json(
        { error: 'Already subscribed' },
        { status: 400 }
      );
    }

    // Update subscription status to active
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        subscription_status: 'active',
        trial_ends_at: null, // Clear trial expiration
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id);

    if (updateError) {
      console.error('Failed to update subscription:', updateError);
      return NextResponse.json(
        { error: 'Failed to upgrade subscription' },
        { status: 500 }
      );
    }

    console.log(
      `[Subscription Upgrade] User ${session.user.id} upgraded to active`
    );

    return NextResponse.json({
      success: true,
      message: 'Welcome to FeetFans Pro!',
    });
  } catch (err: any) {
    console.error('[Subscription Upgrade] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
