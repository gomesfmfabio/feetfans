-- Create favorites table for swipe-based discovery
-- Allows consumers to save favorite creators

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(consumer_id, creator_id)
);

-- Index for faster lookups
CREATE INDEX idx_favorites_consumer_id ON favorites(consumer_id);
CREATE INDEX idx_favorites_creator_id ON favorites(creator_id);

-- RLS Policies
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Consumers can insert their own favorites
CREATE POLICY "Consumers can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = consumer_id);

-- Consumers can view their own favorites
CREATE POLICY "Consumers can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = consumer_id);

-- Consumers can delete their own favorites
CREATE POLICY "Consumers can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = consumer_id);

-- Service role has full access
CREATE POLICY "Service role has full access"
  ON favorites
  USING (auth.role() = 'service_role');
