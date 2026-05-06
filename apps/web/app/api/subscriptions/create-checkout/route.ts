import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createStripeCustomer, createCheckoutSession } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Get session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id, email, subscription_status')
      .eq('id', session.user.id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already subscribed
    if (user.subscription_status === 'active') {
      return NextResponse.json(
        { error: 'Already subscribed', redirect: '/dashboard' },
        { status: 400 }
      );
    }

    let customerId = user.stripe_customer_id;

    // Create Stripe customer if not exists
    if (!customerId) {
      customerId = await createStripeCustomer(user.email, session.user.id);

      // Save customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', session.user.id);
    }

    // Create checkout session
    const checkoutUrl = await createCheckoutSession(
      customerId,
      session.user.id,
      user.email
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
