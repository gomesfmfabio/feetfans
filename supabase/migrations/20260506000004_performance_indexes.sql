-- Performance optimization indexes for high-traffic queries

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, subscription_status)
WHERE account_blocked = false;

CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));

CREATE INDEX IF NOT EXISTS idx_users_created_at_desc ON users(created_at DESC);

-- Content table indexes
CREATE INDEX IF NOT EXISTS idx_content_creator_created ON content(creator_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_categories_gin ON content USING GIN(categories);

CREATE INDEX IF NOT EXISTS idx_content_created_at_desc ON content(created_at DESC);

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_recipient_unread ON messages(recipient_id, read_at)
WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_messages_expires_at ON messages(expires_at)
WHERE expires_at IS NOT NULL;

-- Content reports indexes
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_reports_content ON content_reports(content_id);

-- AI agents indexes
CREATE INDEX IF NOT EXISTS idx_ai_agents_active ON ai_agents(is_active)
WHERE is_active = true;

-- Featured placements indexes
CREATE INDEX IF NOT EXISTS idx_featured_active ON featured_placements(expires_at, is_active)
WHERE is_active = true;

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_created_desc ON audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_event ON audit_log(user_id, event_type);

-- Optimize RLS policies with covering indexes
CREATE INDEX IF NOT EXISTS idx_content_creator_id ON content(creator_id)
INCLUDE (file_url, file_type, created_at);

CREATE INDEX IF NOT EXISTS idx_messages_participants ON messages(sender_id, recipient_id)
INCLUDE (content, created_at, read_at);

COMMENT ON INDEX idx_users_role_status IS 'Optimize user filtering by role and status';
COMMENT ON INDEX idx_content_categories_gin IS 'Fast category-based content search using GIN index';
COMMENT ON INDEX idx_messages_conversation IS 'Optimize conversation queries';
COMMENT ON INDEX idx_messages_recipient_unread IS 'Fast unread message count';
