-- Vibe PM Database Schema for Supabase
-- Run this in the Supabase SQL Editor to set up your database

-- Tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  due_date DATE,
  status TEXT CHECK (status IN ('todo', 'in-progress', 'complete')) DEFAULT 'todo',
  position INTEGER DEFAULT 0,
  work_date DATE DEFAULT CURRENT_DATE,
  is_achievement BOOLEAN DEFAULT FALSE,
  rolled_past_due BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Todos table
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table (one per user per day for daily reflections)
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT DEFAULT '',
  work_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, work_date)
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can CRUD own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own todos" ON todos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own notes" ON notes
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_work_date ON tasks(work_date);
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_work_date ON notes(work_date);
CREATE INDEX idx_tasks_is_achievement ON tasks(is_achievement);

-- Subtasks table (checklists within tasks)
CREATE TABLE subtasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own subtasks" ON subtasks
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX idx_subtasks_user_id ON subtasks(user_id);

-- Migration: Add rolled_past_due column to existing tasks table
-- ALTER TABLE tasks ADD COLUMN rolled_past_due BOOLEAN DEFAULT FALSE;

-- Enable realtime for all tables (optional, for live updates)
-- Run these in Supabase Dashboard > Database > Replication if needed:
-- ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
-- ALTER PUBLICATION supabase_realtime ADD TABLE todos;
-- ALTER PUBLICATION supabase_realtime ADD TABLE notes;
-- ALTER PUBLICATION supabase_realtime ADD TABLE subtasks;
