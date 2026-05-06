-- Add bio and avatar_url columns to users table for profile editing

ALTER TABLE users
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN users.bio IS 'User biography or description (max 500 chars)';
COMMENT ON COLUMN users.avatar_url IS 'URL to user profile picture';
