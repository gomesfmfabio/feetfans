-- Create agent_assignments table for scheduled AI agent messaging
-- Each creator gets all 15 active agents assigned with randomized schedule (0-10 days)

CREATE TABLE IF NOT EXISTS agent_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  conversation_id UUID REFERENCES conversations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(creator_id, agent_id)
);

-- Indexes for efficient cron job queries
CREATE INDEX idx_agent_assignments_scheduled ON agent_assignments(scheduled_for) WHERE sent_at IS NULL;
CREATE INDEX idx_agent_assignments_creator ON agent_assignments(creator_id);
CREATE INDEX idx_agent_assignments_sent ON agent_assignments(sent_at);

-- RLS Policies
ALTER TABLE agent_assignments ENABLE ROW LEVEL SECURITY;

-- Service role has full access (for cron jobs)
CREATE POLICY "Service role has full access to agent_assignments"
  ON agent_assignments
  USING (auth.role() = 'service_role');

-- Creators cannot view their own assignments (keeps AI mystery)
CREATE POLICY "Users cannot view agent assignments"
  ON agent_assignments FOR SELECT
  USING (false);

-- Function to assign all active agents to a creator with randomized schedule
CREATE OR REPLACE FUNCTION assign_ai_agents_to_creator(p_creator_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_agent RECORD;
  v_random_days INTEGER;
  v_assigned_count INTEGER := 0;
BEGIN
  -- Assign all active AI agents
  FOR v_agent IN
    SELECT id FROM ai_agents WHERE is_active = true
  LOOP
    -- Random delay between 0 and 10 days
    v_random_days := floor(random() * 11)::INTEGER;

    INSERT INTO agent_assignments (creator_id, agent_id, scheduled_for)
    VALUES (
      p_creator_id,
      v_agent.id,
      NOW() + (v_random_days || ' days')::INTERVAL
    )
    ON CONFLICT (creator_id, agent_id) DO NOTHING;

    v_assigned_count := v_assigned_count + 1;
  END LOOP;

  RETURN v_assigned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-assign agents when creator is age-verified
CREATE OR REPLACE FUNCTION trigger_assign_agents_on_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only assign if age_verified changed from false/null to true AND user is a creator
  IF NEW.age_verified = true
     AND (OLD.age_verified IS NULL OR OLD.age_verified = false)
     AND NEW.role = 'creator'
  THEN
    PERFORM assign_ai_agents_to_creator(NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_assign_agents_after_verification
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (NEW.age_verified = true)
  EXECUTE FUNCTION trigger_assign_agents_on_verification();

-- Function for cron job to process due assignments
CREATE OR REPLACE FUNCTION process_due_agent_assignments()
RETURNS TABLE(
  assignment_id UUID,
  creator_id UUID,
  agent_id UUID,
  status TEXT
) AS $$
DECLARE
  v_assignment RECORD;
  v_conversation_id UUID;
BEGIN
  -- Find all assignments that are due and haven't been sent
  FOR v_assignment IN
    SELECT aa.id, aa.creator_id, aa.agent_id, aa.scheduled_for
    FROM agent_assignments aa
    WHERE aa.scheduled_for <= NOW()
      AND aa.sent_at IS NULL
    ORDER BY aa.scheduled_for ASC
    LIMIT 100 -- Process max 100 per run to avoid timeout
  LOOP
    BEGIN
      -- Create or get existing conversation
      INSERT INTO conversations (creator_id, consumer_id)
      VALUES (v_assignment.creator_id, v_assignment.agent_id)
      ON CONFLICT (creator_id, consumer_id) DO UPDATE
        SET creator_id = EXCLUDED.creator_id -- No-op to return existing
      RETURNING id INTO v_conversation_id;

      -- Mark assignment as sent
      UPDATE agent_assignments
      SET sent_at = NOW(), conversation_id = v_conversation_id
      WHERE id = v_assignment.id;

      -- Return success status
      assignment_id := v_assignment.id;
      creator_id := v_assignment.creator_id;
      agent_id := v_assignment.agent_id;
      status := 'conversation_created';
      RETURN NEXT;

    EXCEPTION WHEN OTHERS THEN
      -- Log error and continue with next assignment
      assignment_id := v_assignment.id;
      creator_id := v_assignment.creator_id;
      agent_id := v_assignment.agent_id;
      status := 'error: ' || SQLERRM;
      RETURN NEXT;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
