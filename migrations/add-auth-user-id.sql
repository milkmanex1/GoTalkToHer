-- Migration: Add auth_user_id column to user_profile table
-- This migration adds a new column to link user_profile to Supabase Auth users
-- Run this SQL in your Supabase SQL Editor

-- Add auth_user_id column to user_profile table
ALTER TABLE user_profile 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add unique constraint to ensure one profile per auth user
ALTER TABLE user_profile 
ADD CONSTRAINT user_profile_auth_uid_unique UNIQUE (auth_user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profile_auth_user_id ON user_profile(auth_user_id);

-- Update foreign key references in other tables to use auth_user_id instead of user_profile.id
-- Note: This is a breaking change. You may need to migrate existing data first.
-- For now, we'll keep the existing foreign keys but update the app code to use auth_user_id

-- Update approach_events to reference auth_user_id (optional - can keep user_id as UUID)
-- If you want to change the foreign key, uncomment below:
-- ALTER TABLE approach_events DROP CONSTRAINT IF EXISTS approach_events_user_id_fkey;
-- ALTER TABLE approach_events ADD CONSTRAINT approach_events_user_id_fkey 
--   FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update chat_messages to reference auth_user_id (optional - can keep user_id as UUID)
-- If you want to change the foreign key, uncomment below:
-- ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey;
-- ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_user_id_fkey 
--   FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Note: The app code will use auth_user_id for user_profile queries
-- and auth.users(id) for approach_events and chat_messages user_id fields

