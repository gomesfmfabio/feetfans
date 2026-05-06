-- Add trial tracking columns to users table
-- Tracks trial period for creators and subscription status for all users

ALTER TABLE users
ADD COLUMN trial_started_at TIMESTAMPTZ,
ADD COLUMN trial_ends_at TIMESTAMPTZ,
ADD COLUMN subscription_status TEXT DEFAULT 'trial'
  CHECK (subscription_status IN ('trial', 'active', 'free_feetfans', 'expired', 'cancelled', 'consumer'));

-- Update existing users
-- Consumers don't have trials
UPDATE users
SET subscription_status = 'consumer'
WHERE role = 'consumer';

-- Existing creators without age verification remain in trial
UPDATE users
SET subscription_status = 'trial'
WHERE role = 'creator' AND age_verified = false;

-- Trigger to initialize trial when creator is age-verified
CREATE OR REPLACE FUNCTION initialize_creator_trial()
RETURNS TRIGGER AS $$
BEGIN
  -- Only initialize trial if age_verified changed from false/null to true
  -- AND user is a creator
  -- AND trial hasn't been started yet
  IF NEW.age_verified = true
     AND (OLD.age_verified IS NULL OR OLD.age_verified = false)
     AND NEW.role = 'creator'
     AND NEW.trial_started_at IS NULL
  THEN
    NEW.trial_started_at := NOW();
    NEW.trial_ends_at := NOW() + INTERVAL '7 days';
    NEW.subscription_status := 'trial';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_initialize_trial_on_verification
  BEFORE UPDATE ON users
  FOR EACH ROW
  WHEN (NEW.age_verified = true)
  EXECUTE FUNCTION initialize_creator_trial();

-- Function to expire trials (called by cron job)
CREATE OR REPLACE FUNCTION expire_trials()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  nickname TEXT,
  expired_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  UPDATE users
  SET subscription_status = 'expired',
      updated_at = NOW()
  WHERE trial_ends_at < NOW()
    AND subscription_status = 'trial'
  RETURNING id, email, nickname, trial_ends_at;
END;
$$ LANGUAGE plpgsql;

-- Create index for cron job efficiency
CREATE INDEX idx_users_trial_expiration
  ON users(trial_ends_at)
  WHERE subscription_status = 'trial';
