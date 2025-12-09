-- Migration: Add progression system columns to user_profile table
-- Run this SQL in your Supabase SQL Editor

-- Add new columns for progression tracking
ALTER TABLE user_profile 
ADD COLUMN IF NOT EXISTS total_approaches INTEGER DEFAULT 0;

ALTER TABLE user_profile 
ADD COLUMN IF NOT EXISTS timer_runs INTEGER DEFAULT 0;

ALTER TABLE user_profile 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;

ALTER TABLE user_profile 
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;

ALTER TABLE user_profile 
ADD COLUMN IF NOT EXISTS last_approach_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE user_profile 
ADD COLUMN IF NOT EXISTS success_rate DOUBLE PRECISION DEFAULT 0;

