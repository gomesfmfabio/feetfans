-- FeetFans MVP - Initial Schema
-- Generated: 2026-05-04
-- Description: Complete database schema for FeetFans marketplace MVP

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('creator', 'consumer')),
  nickname TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_ai BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CREATOR SUBSCRIPTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS creator_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(creator_id)
);

-- ============================================
-- CONTENT (PHOTOS)
-- ============================================
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  category TEXT NOT NULL,
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  moderation_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for feed queries
CREATE INDEX IF NOT EXISTS idx_content_approved ON content(moderation_status, created_at DESC) WHERE moderation_status = 'approved';
CREATE INDEX IF NOT EXISTS idx_content_creator ON content(creator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_category ON content(category, created_at DESC) WHERE moderation_status = 'approved';

-- ============================================
-- CONVERSATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consumer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(creator_id, consumer_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_creator ON conversations(creator_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_consumer ON conversations(consumer_id, updated_at DESC);

-- ============================================
-- MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at ASC);

-- ============================================
-- AI PERSONAS (3 for MVP)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  persona_name TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  personality_traits TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================
-- AI INTERACTION LOG (track which AI contacted which creator)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_interaction_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ai_user_id, creator_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_log_creator ON ai_interaction_log(creator_id, triggered_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interaction_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS POLICIES
-- ============================================

-- Public profiles are viewable by all authenticated users
CREATE POLICY "Public profiles viewable by authenticated users"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- CONTENT POLICIES
-- ============================================

-- Approved content is viewable by all
CREATE POLICY "Approved content viewable by all"
  ON content FOR SELECT
  USING (moderation_status = 'approved');

-- Creators can view their own content (any status)
CREATE POLICY "Creators can view own content"
  ON content FOR SELECT
  USING (auth.uid() = creator_id);

-- Creators can insert their own content
CREATE POLICY "Creators can insert own content"
  ON content FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Creators can delete their own content
CREATE POLICY "Creators can delete own content"
  ON content FOR DELETE
  USING (auth.uid() = creator_id);

-- ============================================
-- CREATOR SUBSCRIPTIONS POLICIES
-- ============================================

-- Creators can view their own subscription
CREATE POLICY "Creators can view own subscription"
  ON creator_subscriptions FOR SELECT
  USING (auth.uid() = creator_id);

-- Service role can manage subscriptions (for Stripe webhooks)
CREATE POLICY "Service role can manage subscriptions"
  ON creator_subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- CONVERSATIONS POLICIES
-- ============================================

-- Users can view conversations they're part of
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = creator_id OR auth.uid() = consumer_id);

-- Users can create conversations where they're a participant
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = creator_id OR auth.uid() = consumer_id);

-- ============================================
-- MESSAGES POLICIES
-- ============================================

-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE creator_id = auth.uid() OR consumer_id = auth.uid()
    )
  );

-- Users can insert messages in their conversations
CREATE POLICY "Users can insert messages in own conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM conversations
      WHERE creator_id = auth.uid() OR consumer_id = auth.uid()
    )
  );

-- ============================================
-- AI PERSONAS POLICIES
-- ============================================

-- Service role can manage AI personas
CREATE POLICY "Service role can manage AI personas"
  ON ai_personas FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- AI INTERACTION LOG POLICIES
-- ============================================

-- Service role can manage AI interaction log
CREATE POLICY "Service role can manage AI log"
  ON ai_interaction_log FOR ALL
  USING (auth.role() = 'service_role');

-- Creators can view their own AI interactions
CREATE POLICY "Creators can view own AI interactions"
  ON ai_interaction_log FOR SELECT
  USING (auth.uid() = creator_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Note: Storage buckets must be created via Supabase Dashboard or API
-- Bucket name: 'creator-photos'
-- Public: true (read), creators-only (write)
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- Storage policy will be added after bucket creation:
-- CREATE POLICY "Public photos are viewable"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'creator-photos');
--
-- CREATE POLICY "Creators can upload photos"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'creator-photos' AND
--     auth.role() = 'authenticated'
--   );
--
-- CREATE POLICY "Creators can delete own photos"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'creator-photos' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_subscriptions_updated_at
  BEFORE UPDATE ON creator_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA: 3 AI PERSONAS
-- ============================================

-- Note: AI users will be created via application code after Supabase Auth is configured
-- This is a reference for the 3 AI personas that should be created:

-- AI Persona 1: Casual Collector (Mike)
-- system_prompt: "You are a casual foot content enthusiast. You're curious and ask questions about the content. Keep messages short (1-2 sentences). Be friendly and genuine."
-- personality_traits: ["curious", "friendly", "asks questions"]

-- AI Persona 2: Regular Buyer (David)
-- system_prompt: "You are an active buyer of custom content. You show interest and sometimes request specific types of shots. Be polite and specific. Mention what you like about the creator's style."
-- personality_traits: ["interested", "specific", "polite"]

-- AI Persona 3: Premium Enthusiast (Alex)
-- system_prompt: "You are an enthusiastic fan who appreciates the artistry. You give compliments and engage frequently. Be supportive and positive. Highlight creative aspects of the content."
-- personality_traits: ["enthusiastic", "supportive", "complimentary"]

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Additional indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_subs_status ON creator_subscriptions(status, current_period_end);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE users IS 'User accounts for creators and consumers';
COMMENT ON TABLE content IS 'Photo content uploaded by creators';
COMMENT ON TABLE conversations IS '1:1 conversations between creators and consumers';
COMMENT ON TABLE messages IS 'Messages within conversations';
COMMENT ON TABLE ai_personas IS 'AI agent persona configurations';
COMMENT ON TABLE ai_interaction_log IS 'Track which AI agents contacted which creators';
COMMENT ON TABLE creator_subscriptions IS 'Stripe subscription status for creators';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Create storage bucket 'creator-photos' in Supabase Dashboard
-- 2. Seed 3 AI users via application code
-- 3. Configure Stripe webhook endpoint
-- 4. Test RLS policies with different user roles
