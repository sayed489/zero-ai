-- Detailed usage tracking per tier per day
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  tier TEXT NOT NULL,
  model_used TEXT NOT NULL,
  request_count INT DEFAULT 1,
  date DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, tier, model_used, date)
);

-- Global daily budget for expensive Apex models (e.g., Gemini 2.5 Flash)
CREATE TABLE IF NOT EXISTS apex_budget (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  requests_used INT DEFAULT 0,
  max_requests INT DEFAULT 18
);

-- RPC to increment usage easily
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

-- RLS to allow users to read their own usage
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own usage" ON user_usage FOR SELECT USING (auth.uid() = user_id);
