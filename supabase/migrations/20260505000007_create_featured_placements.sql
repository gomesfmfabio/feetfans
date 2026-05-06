-- Featured placements for creator profile boost
-- Paid creators can purchase featured positioning in feed/discovery

CREATE TABLE IF NOT EXISTS featured_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('standard', 'premium')),
  purchased_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  payment_type TEXT CHECK (payment_type IN ('one_time', 'recurring')),
  stripe_payment_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX idx_featured_expires_at ON featured_placements(expires_at) WHERE is_active = true;
CREATE INDEX idx_featured_creator ON featured_placements(creator_id);
CREATE INDEX idx_featured_active ON featured_placements(is_active, expires_at);

-- RLS
ALTER TABLE featured_placements ENABLE ROW LEVEL SECURITY;

-- Creators can view their own placements
CREATE POLICY "Creators can view own placements"
  ON featured_placements FOR SELECT
  USING (auth.uid() = creator_id);

-- Service role has full access
CREATE POLICY "Service role has full access to featured_placements"
  ON featured_placements
  USING (auth.role() = 'service_role');

-- Function to expire featured placements
CREATE OR REPLACE FUNCTION expire_featured_placements()
RETURNS TABLE(
  placement_id UUID,
  creator_id UUID,
  tier TEXT,
  expired_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  UPDATE featured_placements
  SET is_active = false,
      updated_at = NOW()
  WHERE expires_at < NOW()
    AND is_active = true
  RETURNING id, creator_id, tier, expires_at;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_featured_placement_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_featured_placement_updated_at
  BEFORE UPDATE ON featured_placements
  FOR EACH ROW
  EXECUTE FUNCTION update_featured_placement_updated_at();
