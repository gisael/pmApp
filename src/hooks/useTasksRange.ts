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
    createdAt: new Date(dbTask.created_at).getTime(),
  };
}

export function useTasksRange(startDate: string, endDate: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('work_date', startDate)
      .lte('work_date', endDate)
      .order('work_date', { ascending: true })
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching tasks range:', error);
    } else {
      setTasks((data as DbTask[]).map(mapDbTaskToTask));
    }
    setLoading(false);
  }, [supabase, startDate, endDate]);

  useEffect(() => {
    fetchTasks();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`tasks-range-${startDate}-${endDate}`)
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
  }, [supabase, startDate, endDate, fetchTasks]);

  // Group tasks by date
  const tasksByDate = new Map<string, Task[]>();
  tasks.forEach((task) => {
    const existing = tasksByDate.get(task.workDate) || [];
    existing.push(task);
    tasksByDate.set(task.workDate, existing);
  });

  // Update a task's workDate
  const updateTaskDate = useCallback(async (taskId: string, newWorkDate: string) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, workDate: newWorkDate } : t))
    );

    const { error } = await supabase
      .from('tasks')
      .update({ work_date: newWorkDate })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task date:', error);
      fetchTasks(); // Revert on error
    }
  }, [supabase, fetchTasks]);

  return {
    tasks,
    tasksByDate,
    loading,
    refetch: fetchTasks,
    updateTaskDate,
  };
}
