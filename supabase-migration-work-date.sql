-- Migration: Add work_date columns for daily productivity tracking
-- Run this if you have an existing database

-- 1. Add work_date to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS work_date DATE DEFAULT CURRENT_DATE;
CREATE INDEX IF NOT EXISTS idx_tasks_work_date ON tasks(work_date);

-- 2. Modify notes table for daily entries
-- First, drop the unique constraint on user_id only
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_user_id_key;

-- Add work_date column
ALTER TABLE notes ADD COLUMN IF NOT EXISTS work_date DATE DEFAULT CURRENT_DATE;

-- Add unique constraint on user_id + work_date combination
ALTER TABLE notes ADD CONSTRAINT notes_user_id_work_date_unique UNIQUE(user_id, work_date);

-- Add index for work_date queries
CREATE INDEX IF NOT EXISTS idx_notes_work_date ON notes(work_date);
