-- Migration: Add weekly_insights table
-- Run this SQL in your Supabase SQL Editor

-- Create weekly_insights table
CREATE TABLE IF NOT EXISTS weekly_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  insights TEXT NOT NULL, -- JSON array of insight strings
  challenge TEXT NOT NULL -- Recommended challenge for the user
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_weekly_insights_user_id ON weekly_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_insights_generated_at ON weekly_insights(generated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE weekly_insights ENABLE ROW LEVEL SECURITY;

-- Create policy (adjust based on your auth setup)
CREATE POLICY "Allow all operations on weekly_insights" ON weekly_insights FOR ALL USING (true) WITH CHECK (true);

