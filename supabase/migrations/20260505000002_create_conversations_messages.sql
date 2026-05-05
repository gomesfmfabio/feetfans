-- Create conversations and messages tables for real-time chat
-- Messages expire after 24 hours (Snapchat-style ephemeral messaging)

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consumer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(creator_id, consumer_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  read_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_conversations_creator_id ON conversations(creator_id);
CREATE INDEX idx_conversations_consumer_id ON conversations(consumer_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_expires_at ON messages(expires_at);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

-- Trigger for updated_at on conversations
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_updated_at();

-- RLS Policies for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Users can view conversations they're part of
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = creator_id OR auth.uid() = consumer_id);

-- Users can create conversations
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = creator_id OR auth.uid() = consumer_id);

-- Service role has full access
CREATE POLICY "Service role has full access to conversations"
  ON conversations
  USING (auth.role() = 'service_role');

-- RLS Policies for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND (conversations.creator_id = auth.uid() OR conversations.consumer_id = auth.uid())
    )
  );

-- Users can send messages in their conversations
CREATE POLICY "Users can send messages in own conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND (conversations.creator_id = auth.uid() OR conversations.consumer_id = auth.uid())
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to messages"
  ON messages
  USING (auth.role() = 'service_role');

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Function to delete expired messages (called by cron)
CREATE OR REPLACE FUNCTION cleanup_expired_messages()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM messages
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RAISE NOTICE 'Deleted % expired messages', deleted_count;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup to run every hour (requires pg_cron extension)
-- Uncomment and run manually in Supabase SQL Editor after enabling pg_cron:
--
-- SELECT cron.schedule(
--   'cleanup-expired-messages',
--   '0 * * * *',  -- Every hour
--   'SELECT cleanup_expired_messages();'
-- );
