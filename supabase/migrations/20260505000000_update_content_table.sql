-- Update content table for Story 2.1: Content Upload
-- Add file_type, categories array, and updated_at

-- Add file_type column
ALTER TABLE content ADD COLUMN IF NOT EXISTS file_type TEXT NOT NULL DEFAULT 'photo'
  CHECK (file_type IN ('photo', 'video'));

-- Rename category to categories and change to array type
-- First add new column
ALTER TABLE content ADD COLUMN IF NOT EXISTS categories TEXT[];

-- For existing data, migrate single category to array
UPDATE content SET categories = ARRAY[category] WHERE categories IS NULL AND category IS NOT NULL;

-- Drop old column (after data migration)
ALTER TABLE content DROP COLUMN IF EXISTS category;

-- Make categories NOT NULL now that data is migrated
ALTER TABLE content ALTER COLUMN categories SET NOT NULL;

-- Add updated_at column
ALTER TABLE content ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add trigger for updated_at (reuse existing function from initial schema)
DROP TRIGGER IF EXISTS update_content_updated_at ON content;
CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update indexes
DROP INDEX IF EXISTS idx_content_category;
CREATE INDEX IF NOT EXISTS idx_content_categories ON content USING GIN(categories);

-- RLS Policies (ensure they exist)
-- Creators can insert own content
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'content' AND policyname = 'Creators can insert own content'
  ) THEN
    CREATE POLICY "Creators can insert own content"
      ON content FOR INSERT
      WITH CHECK (auth.uid() = creator_id);
  END IF;
END $$;

-- Creators can update own content
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'content' AND policyname = 'Creators can update own content'
  ) THEN
    CREATE POLICY "Creators can update own content"
      ON content FOR UPDATE
      USING (auth.uid() = creator_id);
  END IF;
END $$;

-- Creators can delete own content
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'content' AND policyname = 'Creators can delete own content'
  ) THEN
    CREATE POLICY "Creators can delete own content"
      ON content FOR DELETE
      USING (auth.uid() = creator_id);
  END IF;
END $$;

-- All authenticated users can view content
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'content' AND policyname = 'All authenticated users can view content'
  ) THEN
    CREATE POLICY "All authenticated users can view content"
      ON content FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

COMMENT ON COLUMN content.file_type IS 'Type of content: photo or video';
COMMENT ON COLUMN content.categories IS 'Array of category tags for discoverability';
COMMENT ON COLUMN content.updated_at IS 'Last update timestamp';
