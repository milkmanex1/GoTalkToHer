-- Migration: Add age_range column to user_profile table
-- Run this SQL in your Supabase SQL Editor if the column is missing

-- Add age_range column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_profile' 
        AND column_name = 'age_range'
    ) THEN
        ALTER TABLE user_profile ADD COLUMN age_range TEXT;
    END IF;
END $$;

