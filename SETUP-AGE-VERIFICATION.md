# Age Verification Setup Instructions

## Story 1.5 - Manual Setup Required

The age verification system has been implemented but requires manual database setup:

### 1. Add Database Columns

Execute the following SQL in Supabase Dashboard → SQL Editor:

```sql
-- Add age verification columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_blocked BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN users.age_verified IS 'Whether user has completed 18+ age verification';
COMMENT ON COLUMN users.account_blocked IS 'Whether account is blocked (e.g., failed age verification)';
```

### 2. Create Storage Bucket (Already Done)

✅ Storage bucket `id-documents` has been created via API with:
- Public: false (private access only)
- File size limit: 10MB
- Allowed MIME types: image/jpeg, image/png, application/pdf

### 3. Apply Storage RLS Policies

Execute the following SQL in Supabase Dashboard → SQL Editor:

```sql
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
```

### 4. Age Verification Provider (Optional - Future Implementation)

The current implementation uses **mock verification** (auto-approves all uploads for MVP testing).

To integrate with a real age verification provider (Onfido/Persona/Vouched):

1. Choose provider based on cost and requirements
2. Create account and obtain API keys
3. Update `/app/api/verify-age/route.ts` to call provider API
4. Set up webhook endpoint to receive verification results
5. Add environment variables for API keys

**Recommended providers:**
- **Persona**: ~$0.50-1 per verification (cheapest US-compliant option)
- **Onfido**: ~$1-3 per verification (robust, well-established)
- **Vouched**: Competitive pricing, focused on ID verification

### 5. Verification Flow (Current MVP Implementation)

1. User uploads ID to `/verify-age`
2. File uploaded to Supabase Storage bucket `id-documents`
3. API endpoint `/api/verify-age` called
4. **Mock verification**: Immediately sets `age_verified = true`
5. User redirected to dashboard/feed based on role

**In production:**
- Replace mock verification with real provider API call
- Implement webhook handler for async verification results
- Add retry logic for failed verifications
- Implement automatic ID document deletion after 30 days

### 6. Testing the Flow

After applying the SQL migrations:

1. Sign up as a new user at `/signup`
2. Login at `/login`
3. You'll be redirected to `/verify-age`
4. Upload any image file (JPEG, PNG, PDF)
5. You'll be auto-approved and redirected to dashboard/feed

### 7. Next Steps

- Apply SQL migrations above in Supabase Dashboard
- Test the complete flow end-to-end
- Verify storage bucket policies are working
- Consider integrating real age verification provider before production launch

---

*Generated for Story 1.5 - Age Verification System*
