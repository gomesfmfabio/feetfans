-- Add age verification columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_blocked BOOLEAN DEFAULT false;

-- ============================================
-- STORAGE BUCKET FOR ID DOCUMENTS
-- ============================================
-- Note: Storage buckets must be created via Supabase Dashboard or API
-- Bucket name: 'id-documents'
-- Public: false (private access only)
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, application/pdf

-- Storage policies for id-documents bucket
-- These will be applied after bucket creation

-- Users can upload their own ID documents
CREATE POLICY "Users can upload own ID documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'id-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can read their own ID documents
CREATE POLICY "Users can read own ID documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'id-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Service role can access all documents (for admin review and cleanup)
CREATE POLICY "Service role has full access to ID documents"
  ON storage.objects FOR ALL
  USING (bucket_id = 'id-documents' AND auth.role() = 'service_role');

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON COLUMN users.age_verified IS 'Whether user has completed 18+ age verification';
COMMENT ON COLUMN users.account_blocked IS 'Whether account is blocked (e.g., failed age verification)';
