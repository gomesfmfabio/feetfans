// @ts-nocheck - Stripe disabled
/**
 * Stripe client configuration
 */

import Stripe from 'stripe';

// Stripe is disabled - using dummy key for build
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build_only';

export const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
});

/**
 * Product and Price configuration
 */
export const STRIPE_CONFIG = {
  products: {
    pro: {
      name: 'FeetFans Pro',
      description: 'Full access to all features',
      priceId: process.env.STRIPE_PRICE_ID_PRO || '',
      amount: 900, // $9.00 in cents
      currency: 'usd',
      interval: 'month',
    },
  },
};

/**
 * Create Stripe customer
 */
export async function createStripeCustomer(email: string, userId: string): Promise<string> {
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  return customer.id;
}

/**
 * Create checkout session
 */
export async function createCheckoutSession(
  customerId: string,
  userId: string,
  email: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: STRIPE_CONFIG.products.pro.priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?canceled=true`,
    metadata: {
      userId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
  });

  return session.url!;
}

/**
 * Create billing portal session
 */
export async function createBillingPortalSession(customerId: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  return session.url;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Reactivate subscription
 */
export async function reactivateSubscription(subscriptionId: string): Promise<void> {
  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}
