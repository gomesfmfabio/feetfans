-- Add admin role support

-- Update role enum to include admin
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('creator', 'consumer', 'admin'));

-- Create admin users table for additional admin-specific data
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  permissions TEXT[] DEFAULT ARRAY['read']::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  last_login TIMESTAMPTZ
);

COMMENT ON TABLE admin_users IS 'Additional data for admin users';
COMMENT ON COLUMN admin_users.permissions IS 'Array of admin permissions: read, moderate, manage_users, manage_content, full_access';

-- Create index for admin lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_id ON admin_users(id);

-- RLS policies for admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin_users table
CREATE POLICY "Admins can view admin_users"
ON admin_users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION has_permission(user_id UUID, permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = user_id
    AND (
      permission = ANY(permissions)
      OR 'full_access' = ANY(permissions)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
