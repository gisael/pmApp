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
    createdAt: new Date(dbTask.created_at).getTime(),
  };
}

export function useTasks(): [Task[], (tasks: Task[] | ((prev: Task[]) => Task[])) => void, boolean] {
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
      } else {
        setTasksState((data as DbTask[]).map(mapDbTaskToTask));
      }
      setLoading(false);
    };

    fetchTasks();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('tasks-changes')
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
  }, [supabase]);

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
          existing.position !== t.position
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
          })
          .eq('id', task.id);
        if (error) console.error('Error updating task:', error);
      }
    },
    [tasks, supabase]
  );

  return [tasks, setTasks, loading];
}
