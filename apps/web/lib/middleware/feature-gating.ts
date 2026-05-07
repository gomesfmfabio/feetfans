import { createClient } from '@supabase/supabase-js';

/**
 * Feature gates based on subscription status
 */
export type Feature =
  | 'upload_content'
  | 'view_feed'
  | 'view_discovery'
  | 'message_ai_agents'
  | 'message_real_users'
  | 'receive_messages'
  | 'featured_placement';

/**
 * Subscription status types
 */
export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'free_feetfans'
  | 'expired'
  | 'cancelled'
  | 'consumer';

/**
 * Check if user has access to a specific feature
 *
 * @param userId - User ID to check
 * @param feature - Feature to check access for
 * @returns Promise<boolean> - true if user has access, false otherwise
 */
export async function checkFeatureAccess(
  userId: string,
  feature: Feature
): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: user, error } = await supabase
    .from('users')
    .select('subscription_status, role')
    .eq('id', userId)
    .single();

  if (error || !user) {
    console.error('Failed to fetch user for feature gating:', error);
    return false;
  }

  const status = user.subscription_status as SubscriptionStatus;
  const isPaid = ['active', 'free_feetfans'].includes(status);
  const isTrial = status === 'trial';
  const isExpired = status === 'expired' || status === 'cancelled';
  const isConsumer = user.role === 'consumer';

  // Feature access matrix
  switch (feature) {
    case 'upload_content':
      // Trial and paid creators can upload
      // Expired creators cannot upload
      return (isTrial || isPaid) && !isConsumer;

    case 'view_feed':
    case 'view_discovery':
      // All users can view feed and discovery
      return true;

    case 'message_ai_agents':
      // Trial and paid creators can message AI agents
      // Expired cannot message
      return (isTrial || isPaid) && !isConsumer;

    case 'message_real_users':
      // Only paid creators can message real consumers
      // Trial and expired creators cannot
      return isPaid && !isConsumer;

    case 'receive_messages':
      // Trial and paid can receive messages
      // Expired creators have read-only inbox
      return (isTrial || isPaid) && !isConsumer;

    case 'featured_placement':
      // Only paid creators can purchase featured placement
      return isPaid && !isConsumer;

    default:
      return false;
  }
}

/**
 * Get subscription status for a user
 *
 * @param userId - User ID
 * @returns Promise<SubscriptionStatus | null>
 */
export async function getSubscriptionStatus(
  userId: string
): Promise<SubscriptionStatus | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: user, error } = await supabase
    .from('users')
    .select('subscription_status')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return null;
  }

  return user.subscription_status as SubscriptionStatus;
}

/**
 * Check if user is paid (active or free_feetfans)
 *
 * @param userId - User ID
 * @returns Promise<boolean>
 */
export async function isPaidUser(userId: string): Promise<boolean> {
  const status = await getSubscriptionStatus(userId);
  return status !== null && ['active', 'free_feetfans'].includes(status);
}

/**
 * Check if user is on trial
 *
 * @param userId - User ID
 * @returns Promise<boolean>
 */
export async function isTrialUser(userId: string): Promise<boolean> {
  const status = await getSubscriptionStatus(userId);
  return status === 'trial';
}

/**
 * Check if user's trial/subscription is expired
 *
 * @param userId - User ID
 * @returns Promise<boolean>
 */
export async function isExpiredUser(userId: string): Promise<boolean> {
  const status = await getSubscriptionStatus(userId);
  return status !== null && ['expired', 'cancelled'].includes(status);
}
