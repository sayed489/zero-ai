-- Agentic Sessions
CREATE TABLE IF NOT EXISTS agentic_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT UNIQUE NOT NULL,
  conversation JSONB DEFAULT '[]',
  action_history JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Long term Agentic Memory
CREATE TABLE IF NOT EXISTS agentic_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT,
  key TEXT,
  value TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for all actions the agent performs
CREATE TABLE IF NOT EXISTS agentic_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  parameters JSONB,
  result JSONB,
  success BOOLEAN,
  duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE agentic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentic_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentic_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users own agentic sessions" ON agentic_sessions;
CREATE POLICY "users own agentic sessions" ON agentic_sessions FOR ALL USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "users own agentic memory" ON agentic_memory;
CREATE POLICY "users own agentic memory" ON agentic_memory FOR ALL USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "users own agentic actions" ON agentic_actions;
CREATE POLICY "users own agentic actions" ON agentic_actions FOR ALL USING (auth.uid()::text = user_id);

-- Index for fast memory similarity search
CREATE INDEX IF NOT EXISTS agentic_memory_embedding_idx 
  ON agentic_memory USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
