-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Users/profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  plan TEXT DEFAULT 'nano',
  messages_today INT DEFAULT 0,
  last_reset DATE DEFAULT CURRENT_DATE,
  nano_cached BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memory
CREATE TABLE IF NOT EXISTS user_memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  fact TEXT NOT NULL,
  embedding vector(768),
  importance INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON user_memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT,
  model_tier TEXT DEFAULT 'nano',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  provider TEXT,
  model TEXT,
  tokens_used INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compare votes
CREATE TABLE IF NOT EXISTS comparison_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  prompt_hash TEXT NOT NULL,
  winner TEXT NOT NULL,
  model_a TEXT,
  model_b TEXT,
  model_c TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- App factory builds
CREATE TABLE IF NOT EXISTS app_builds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  description TEXT,
  template_used TEXT,
  files JSONB,
  stackblitz_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users UNIQUE NOT NULL,
  razorpay_subscription_id TEXT,
  razorpay_payment_id TEXT,
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Provider health tracking
CREATE TABLE IF NOT EXISTS provider_health (
  id TEXT PRIMARY KEY,
  status TEXT DEFAULT 'unknown',
  last_checked TIMESTAMPTZ,
  error_count INT DEFAULT 0,
  avg_latency_ms INT
);

-- --------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------

ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own memories" ON user_memories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users own conversations" ON conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users own messages" ON messages FOR ALL USING (
  conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())
);

-- --------------------------------------------------------
-- FUNCTIONS & RPCs
-- --------------------------------------------------------

-- Memory similarity search RPC
CREATE OR REPLACE FUNCTION match_memories(
  query_embedding vector(768),
  match_user_id UUID,
  match_count INT
) RETURNS TABLE(fact TEXT, similarity FLOAT)
LANGUAGE SQL AS $$
  SELECT fact, 1 - (embedding <=> query_embedding) AS similarity
  FROM user_memories
  WHERE user_id = match_user_id
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- --------------------------------------------------------
-- CRON JOBS
-- --------------------------------------------------------

-- Auto-reset messages_today at midnight
SELECT cron.schedule('reset-daily-counts', '0 0 * * *', $$
  UPDATE profiles SET messages_today = 0, last_reset = CURRENT_DATE
  WHERE last_reset < CURRENT_DATE;
$$);
