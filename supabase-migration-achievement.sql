-- Migration: Add achievement tracking to tasks
-- Run this in the Supabase SQL Editor to add achievement tracking

-- Add is_achievement column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_achievement BOOLEAN DEFAULT FALSE;

-- Create index for efficient achievement queries
CREATE INDEX IF NOT EXISTS idx_tasks_is_achievement ON tasks(is_achievement);
