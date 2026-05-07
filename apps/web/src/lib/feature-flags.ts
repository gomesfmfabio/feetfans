/**
 * Feature Flags - Control feature rollout
 * Update here to enable/disable features without code changes
 */

export const featureFlags = {
  // Payments
  stripe_integration: false,        // Enable when Stripe fully integrated
  subscription_portal: false,       // Billing management UI
  
  // Admin
  admin_dashboard: false,           // Admin moderation UI
  user_banning: false,             // Ban/unban users
  
  // Content
  video_upload: false,             // Video support
  content_analytics: false,        // View counts, engagement
  
  // Messaging
  push_notifications: false,       // Web push
  read_receipts: true,            // Message read status
  typing_indicators: false,       // "User is typing..."
  
  // AI
  ai_content_moderation: false,   // Claude vision auto-mod
  ai_conversation_memory: false,  // Remember past conversations
  
  // Monetization
  tipping: false,                 // Tip creators
  custom_requests: false,         // Request custom content
  
  // Performance
  redis_caching: false,           // Redis for hot data
  cdn_images: false,              // Cloudflare/Vercel images
} as const;

export type FeatureFlag = keyof typeof featureFlags;

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag] ?? false;
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): FeatureFlag[] {
  return Object.entries(featureFlags)
    .filter(([_, enabled]) => enabled)
    .map(([flag]) => flag as FeatureFlag);
}
