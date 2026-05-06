-- Add FeetFans course integration for free access
-- Graduates of FeetFans course get free subscription (free_feetfans status)

ALTER TABLE users
ADD COLUMN feetfans_course_id TEXT;

-- Table to store verified course graduates
CREATE TABLE IF NOT EXISTS course_graduates (
  email TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now(),
  granted_by TEXT, -- admin user who granted access
  notes TEXT
);

-- RLS for course_graduates
ALTER TABLE course_graduates ENABLE ROW LEVEL SECURITY;

-- Only service role can access course_graduates
CREATE POLICY "Service role has full access to course_graduates"
  ON course_graduates
  USING (auth.role() = 'service_role');

-- Function to verify and grant course access
CREATE OR REPLACE FUNCTION verify_course_access(
  p_email TEXT,
  p_course_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_graduate BOOLEAN;
  v_user_id UUID;
BEGIN
  -- Check if email is in course_graduates
  SELECT EXISTS(
    SELECT 1 FROM course_graduates
    WHERE email = p_email AND course_id = p_course_id
  ) INTO v_is_graduate;

  IF NOT v_is_graduate THEN
    RETURN FALSE;
  END IF;

  -- Get user_id by email
  SELECT id INTO v_user_id
  FROM users
  WHERE email = p_email;

  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Update user to free_feetfans status
  UPDATE users
  SET subscription_status = 'free_feetfans',
      trial_ends_at = NULL,
      feetfans_course_id = p_course_id,
      updated_at = NOW()
  WHERE id = v_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed example course graduate (for testing)
INSERT INTO course_graduates (email, course_id, notes)
VALUES ('test@feetfans.com', 'FEETFANS-2024', 'Example for testing')
ON CONFLICT (email) DO NOTHING;
