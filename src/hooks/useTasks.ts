'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Task, Priority } from '@/types';

interface DbTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: string;
  due_date: string | null;
  status: string;
  position: number;
  work_date: string;
  is_achievement: boolean;
  created_at: string;
}

function mapDbTaskToTask(dbTask: DbTask): Task {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description ?? undefined,
    priority: dbTask.priority as Priority,
    dueDate: dbTask.due_date ?? undefined,
    status: dbTask.status as Task['status'],
    position: dbTask.position,
    workDate: dbTask.work_date,
    isAchievement: dbTask.is_achievement ?? false,
    createdAt: new Date(dbTask.created_at).getTime(),
  };
}

export function useTasks(workDate: string): [Task[], (tasks: Task[] | ((prev: Task[]) => Task[])) => void, boolean, () => void] {
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('work_date', workDate)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasksState((data as DbTask[]).map(mapDbTaskToTask));
    }
    setLoading(false);
  }, [supabase, workDate]);

  // Fetch tasks for the specified work date
  useEffect(() => {
    fetchTasks();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`tasks-changes-${workDate}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, workDate, fetchTasks]);

  const setTasks = useCallback(
    async (tasksOrUpdater: Task[] | ((prev: Task[]) => Task[])) => {
      const newTasks = typeof tasksOrUpdater === 'function'
        ? tasksOrUpdater(tasks)
        : tasksOrUpdater;

      // Optimistic update
      setTasksState(newTasks);

      // Find tasks that need to be created, updated, or deleted
      const existingIds = new Set(tasks.map(t => t.id));
      const newIds = new Set(newTasks.map(t => t.id));

      // Tasks to create (in newTasks but not in existing)
      const toCreate = newTasks.filter(t => !existingIds.has(t.id));

      // Tasks to delete (in existing but not in newTasks)
      const toDelete = tasks.filter(t => !newIds.has(t.id));

      // Tasks to update (in both, check if changed)
      const toUpdate = newTasks.filter(t => {
        if (!existingIds.has(t.id)) return false;
        const existing = tasks.find(e => e.id === t.id);
        if (!existing) return false;
        return (
          existing.title !== t.title ||
          existing.description !== t.description ||
          existing.priority !== t.priority ||
          existing.dueDate !== t.dueDate ||
          existing.status !== t.status ||
          existing.position !== t.position ||
          existing.isAchievement !== t.isAchievement
        );
      });

      // Execute database operations
      // Create new tasks
      for (const task of toCreate) {
        const { error } = await supabase
          .from('tasks')
          .insert({
            id: task.id,
            title: task.title,
            description: task.description || null,
            priority: task.priority,
            due_date: task.dueDate || null,
            status: task.status,
            position: task.position,
            work_date: task.workDate,
            is_achievement: task.isAchievement || false,
          });
        if (error) console.error('Error creating task:', error);
      }

      // Delete tasks
      for (const task of toDelete) {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', task.id);
        if (error) console.error('Error deleting task:', error);
      }

      // Update tasks
      for (const task of toUpdate) {
        const { error } = await supabase
          .from('tasks')
          .update({
            title: task.title,
            description: task.description || null,
            priority: task.priority,
            due_date: task.dueDate || null,
            status: task.status,
            position: task.position,
            is_achievement: task.isAchievement || false,
          })
          .eq('id', task.id);
        if (error) console.error('Error updating task:', error);
      }
    },
    [tasks, supabase]
  );

  return [tasks, setTasks, loading, fetchTasks];
}

// Utility function to copy tasks to a specific date
// Returns the number of tasks successfully copied
export async function copyTasksToDate(
  taskIds: string[],
  sourceDate: string,
  targetDate: string
): Promise<number> {
  const supabase = createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No authenticated user for copying tasks');
    return 0;
  }

  // Fetch the tasks to copy
  const { data: tasksToCopy, error: fetchError } = await supabase
    .from('tasks')
    .select('*')
    .in('id', taskIds)
    .eq('work_date', sourceDate);

  if (fetchError) {
    console.error('Error fetching tasks to copy:', fetchError);
    return 0;
  }

  if (!tasksToCopy || tasksToCopy.length === 0) {
    return 0;
  }

  // Insert as new tasks with the target date, preserving original status
  const newTasks = tasksToCopy.map((task: DbTask, index: number) => ({
    id: crypto.randomUUID(),
    user_id: user.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    due_date: task.due_date,
    status: task.status, // Preserve original status (todo/in-progress)
    position: index,
    work_date: targetDate,
    is_achievement: task.is_achievement || false,
  }));

  const { error: insertError } = await supabase
    .from('tasks')
    .insert(newTasks);

  if (insertError) {
    console.error('Error copying tasks:', insertError);
    return 0;
  }

  return newTasks.length;
}

// Utility function to get incomplete tasks from a date
export async function getIncompleteTasksFromDate(date: string): Promise<Task[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('work_date', date)
    .neq('status', 'complete')
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching incomplete tasks:', error);
    return [];
  }

  return (data as DbTask[]).map(mapDbTaskToTask);
}

// Utility function to get task history (dates with tasks)
export async function getTaskHistory(): Promise<{ date: string; total: number; incomplete: number }[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select('work_date, status')
    .order('work_date', { ascending: false });

  if (error) {
    console.error('Error fetching task history:', error);
    return [];
  }

  // Group by date
  const dateMap = new Map<string, { total: number; incomplete: number }>();
  for (const task of data) {
    const existing = dateMap.get(task.work_date) || { total: 0, incomplete: 0 };
    existing.total++;
    if (task.status !== 'complete') {
      existing.incomplete++;
    }
    dateMap.set(task.work_date, existing);
  }

  return Array.from(dateMap.entries()).map(([date, counts]) => ({
    date,
    ...counts,
  }));
}

// Utility function to get all tasks from a specific date
export async function getTasksFromDate(date: string): Promise<Task[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('work_date', date)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching tasks from date:', error);
    return [];
  }

  return (data as DbTask[]).map(mapDbTaskToTask);
}
