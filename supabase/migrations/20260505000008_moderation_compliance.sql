-- Moderation & Compliance infrastructure (MVP)
-- Stories 6.1, 6.2, 6.3 - Basic structure for future enhancement

-- Content reports (user-generated flags)
CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reports_status ON content_reports(status, created_at);
CREATE INDEX idx_reports_content ON content_reports(content_id);

-- Moderation queue (auto-flagged + reported content)
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_moderation_status ON moderation_queue(status, severity, created_at);

-- Compliance audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_type ON audit_log(event_type, created_at);
CREATE INDEX idx_audit_user ON audit_log(user_id, created_at);

-- RLS
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Service role only for moderation tables
CREATE POLICY "Service role moderation access" ON content_reports USING (auth.role() = 'service_role');
CREATE POLICY "Service role moderation queue access" ON moderation_queue USING (auth.role() = 'service_role');
CREATE POLICY "Service role audit access" ON audit_log USING (auth.role() = 'service_role');
