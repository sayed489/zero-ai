-- ============================================================================
-- ZERO AI - COMPLETE SUPABASE SCHEMA (v2.0)
-- 6-Tier Architecture, Usage Tracking, Agentic Memory, & App Factory
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. AUTHENTICATION
-- We do not alter auth.users directly to avoid error 42501 (must be owner of table users).
-- Valid plans: free, starter, pro, ultra will be managed exclusively in public.profiles.


-- 3. CORE PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  plan TEXT DEFAULT 'free',
  last_reset DATE DEFAULT CURRENT_DATE,
  nano_cached BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);


-- 4. USAGE TRACKING (Realistic Strict Limits)
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  tier TEXT NOT NULL,       -- e.g., 'nano', 'prime', 'agentic', 'appGen'
  model_used TEXT NOT NULL, -- e.g., 'gemini-1.5-flash', 'llama4-maverick'
  request_count INT DEFAULT 1,
  date DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, tier, model_used, date)
);

CREATE TABLE IF NOT EXISTS apex_budget (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  requests_used INT DEFAULT 0,
  max_requests INT DEFAULT 20 -- Hard limit for Gemini 2.5 Flash across entire app
);

-- RLS
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own usage" ON user_usage;
CREATE POLICY "Users can view own usage" ON user_usage FOR SELECT USING (auth.uid() = user_id);

-- RPC for Tracking Usage
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID, 
  p_tier TEXT, 
  p_model TEXT, 
  p_date DATE
) RETURNS void AS $$
BEGIN
  INSERT INTO user_usage (user_id, tier, model_used, date, request_count)
  VALUES (p_user_id, p_tier, p_model, p_date, 1)
  ON CONFLICT (user_id, tier, model_used, date)
  DO UPDATE SET request_count = user_usage.request_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. CHAT HISTORY & CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT,
  model_tier TEXT DEFAULT 'nano-fast', -- The primary model used
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  provider TEXT,
  model TEXT,
  tokens_used INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users own conversations" ON conversations;
CREATE POLICY "users own conversations" ON conversations FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users own messages" ON messages;
CREATE POLICY "users own messages" ON messages FOR ALL USING (
  conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())
);


-- 6. AGENTIC MEMORY SYSTEM (Vector DB)
CREATE TABLE IF NOT EXISTS user_memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  fact TEXT NOT NULL,
  embedding vector(768),
  importance INT DEFAULT 1,
  category TEXT DEFAULT 'general', -- 'preference', 'project', 'skill', 'personal'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_memories_embedding_idx ON user_memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- RLS
ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users own memories" ON user_memories;
CREATE POLICY "users own memories" ON user_memories FOR ALL USING (auth.uid() = user_id);

-- RPC for Memory Search
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


-- 7. APP FACTORY SAVES
CREATE TABLE IF NOT EXISTS app_builds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  conversation_id UUID REFERENCES conversations,
  description TEXT,
  files JSONB,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE app_builds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users own app builds" ON app_builds;
CREATE POLICY "users own app builds" ON app_builds FOR ALL USING (auth.uid() = user_id);


-- 8. ZERO HEALTH MONITORING
CREATE TABLE IF NOT EXISTS provider_health (
  id TEXT PRIMARY KEY,
  status TEXT DEFAULT 'ok', -- 'ok', 'exhausted', 'down'
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  error_count INT DEFAULT 0,
  avg_latency_ms INT
);


-- 9. TRIGGERS & CRON JOBS
-- Trigger to auto-create profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
  assigned_plan TEXT;
BEGIN
  IF new.email = 'founderzero1@gmail.com' THEN
    assigned_plan := 'ultra';
  ELSE
    assigned_plan := 'free';
  END IF;

  INSERT INTO public.profiles (id, plan, last_reset)
  VALUES (new.id, assigned_plan, CURRENT_DATE);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger to auto-update conversation updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
