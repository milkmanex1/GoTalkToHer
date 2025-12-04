-- Supabase Database Schema for Go Talk To Her
-- Run this SQL in your Supabase SQL Editor

-- Create user_profile table
CREATE TABLE IF NOT EXISTS user_profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age_range TEXT,
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 10),
  biggest_challenge TEXT,
  fear_type TEXT,
  preferred_environments TEXT[],
  past_successes INTEGER DEFAULT 0,
  past_rejections INTEGER DEFAULT 0,
  reframe_style TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create approach_events table
CREATE TABLE IF NOT EXISTS approach_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profile(id) ON DELETE CASCADE,
  outcome TEXT,
  notes TEXT,
  ai_feedback TEXT,
  timer_started_at TIMESTAMP WITH TIME ZONE,
  timer_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profile(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_approach_events_user_id ON approach_events(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE approach_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth setup)
-- For MVP, we'll allow all operations - you can restrict later with proper auth
CREATE POLICY "Allow all operations on user_profile" ON user_profile FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on approach_events" ON approach_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on chat_messages" ON chat_messages FOR ALL USING (true) WITH CHECK (true);

