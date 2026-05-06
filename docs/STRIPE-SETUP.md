# Stripe Integration Setup Guide

Complete guide to configure Stripe for FeetFans marketplace.

---

## Prerequisites

1. Stripe account (https://stripe.com)
2. Test mode enabled for development
3. Production mode ready for deployment

---

## Step 1: Create Stripe Product

1. Go to Stripe Dashboard → Products
2. Click "Add product"
3. Fill in:
   - **Name:** FeetFans Pro
   - **Description:** Full access to all features
   - **Pricing:** $9.00 USD / month
   - **Recurring:** Monthly
4. Click "Save product"
5. **Copy the Price ID** (starts with `price_...`)

---

## Step 2: Get API Keys

### Test Mode (Development)

1. Go to Stripe Dashboard → Developers → API keys
2. Copy:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) — Click "Reveal test key"

### Live Mode (Production)

1. Switch to Live mode (toggle in top-left)
2. Copy:
   - **Publishable key** (starts with `pk_live_...`)
   - **Secret key** (starts with `sk_live_...`) — Click "Reveal live key"

---

## Step 3: Configure Environment Variables

Add to `.env.local` (development) or Vercel Environment Variables (production):

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_PRICE_ID_PRO=price_xxxxxxxxxxxxx

# Will be configured in Step 4
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## Step 4: Setup Webhook

### Local Development (with Stripe CLI)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login:
   ```bash
   stripe login
   ```
3. Forward events to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret (starts with `whsec_...`)
5. Add to `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### Production (Vercel)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Fill in:
   - **Endpoint URL:** `https://your-domain.com/api/webhooks/stripe`
   - **Description:** FeetFans Production Webhook
4. Select events to listen:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. **Copy the Signing secret** (starts with `whsec_...`)
7. Add to Vercel Environment Variables:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

---

## Step 5: Test the Integration

### Test Cards (Test Mode Only)

| Card Number         | Behavior                          |
|---------------------|-----------------------------------|
| 4242 4242 4242 4242 | Successful payment                |
| 4000 0000 0000 9995 | Payment fails                     |
| 4000 0025 0000 3155 | 3D Secure authentication required |

Use any future expiration date, any CVC, any postal code.

### Test Flow

1. Start development server: `pnpm dev`
2. Login as a trial user
3. Go to `/checkout`
4. Click "Upgrade Now"
5. Complete Stripe checkout with test card
6. Verify:
   - Redirected to `/dashboard?upgrade=success`
   - Subscription status changed to `active`
   - Stripe customer and subscription created

### Verify Webhook Events

1. Check Stripe Dashboard → Developers → Webhooks
2. View recent events
3. Confirm all events return 200 status
4. Check Supabase database to verify user updates

---

## Step 6: Billing Portal Configuration

1. Go to Stripe Dashboard → Settings → Billing
2. Click "Customer portal"
3. Configure:
   - **Allow customers to:**
     - Update payment methods ✓
     - View invoices ✓
     - Cancel subscriptions ✓
   - **Cancellation:** Set cancellation behavior (immediate or end of period)
4. Click "Save"

---

## Step 7: Production Checklist

Before going live:

- [ ] Switch Stripe to Live mode
- [ ] Update environment variables with Live keys
- [ ] Configure production webhook endpoint
- [ ] Test with real card (small amount)
- [ ] Verify webhook events in production
- [ ] Test billing portal in production
- [ ] Enable fraud detection (Stripe Radar)
- [ ] Set up email notifications (Stripe sends receipts)

---

## Troubleshooting

### Webhook Signature Verification Failed

**Problem:** `Webhook signature verification failed`

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` is correct
2. Make sure you're using the secret for the correct environment (test vs live)
3. Check webhook endpoint URL is correct

### Subscription Not Updating

**Problem:** User subscription status not changing after payment

**Solution:**
1. Check webhook events in Stripe Dashboard
2. Verify `userId` is in subscription metadata
3. Check Supabase logs for errors
4. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly

### Checkout Session Not Creating

**Problem:** Error creating checkout session

**Solution:**
1. Verify `STRIPE_PRICE_ID_PRO` is correct
2. Check Stripe customer creation
3. Ensure `NEXT_PUBLIC_APP_URL` is set correctly
4. Check network tab for API errors

---

## Monitoring

### Stripe Dashboard

- **Payments:** View all successful/failed payments
- **Customers:** Manage customer records
- **Subscriptions:** View active subscriptions
- **Logs:** Debug webhook events
- **Reports:** Revenue analytics

### Database Monitoring

Query active subscriptions:

```sql
SELECT
  email,
  subscription_status,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_period_end
FROM users
WHERE subscription_status = 'active'
ORDER BY created_at DESC;
```

---

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Test your integration: https://stripe.com/docs/testing
