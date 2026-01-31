'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Subtask } from '@/types';

interface DbSubtask {
  id: string;
  task_id: string;
  user_id: string;
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
}

function mapDbSubtaskToSubtask(dbSubtask: DbSubtask): Subtask {
  return {
    id: dbSubtask.id,
    taskId: dbSubtask.task_id,
    title: dbSubtask.title,
    completed: dbSubtask.completed,
    position: dbSubtask.position,
  };
}

export function useSubtasks(taskId: string | null) {
  const [subtasks, setSubtasksState] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchSubtasks = useCallback(async () => {
    if (!taskId) {
      setSubtasksState([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching subtasks:', error);
    } else {
      setSubtasksState((data as DbSubtask[]).map(mapDbSubtaskToSubtask));
    }
    setLoading(false);
  }, [supabase, taskId]);

  useEffect(() => {
    fetchSubtasks();

    if (!taskId) return;

    // Subscribe to realtime changes for this task's subtasks
    const channel = supabase
      .channel(`subtasks-${taskId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subtasks', filter: `task_id=eq.${taskId}` },
        () => {
          fetchSubtasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, taskId, fetchSubtasks]);

  const addSubtask = useCallback(async (title: string) => {
    if (!taskId) return;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Error adding subtask: No authenticated user');
      return;
    }

    const newPosition = subtasks.length;
    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      taskId,
      title,
      completed: false,
      position: newPosition,
    };

    // Optimistic update
    setSubtasksState((prev) => [...prev, newSubtask]);

    const { error } = await supabase
      .from('subtasks')
      .insert({
        id: newSubtask.id,
        task_id: taskId,
        user_id: user.id,
        title,
        completed: false,
        position: newPosition,
      });

    if (error) {
      console.error('Error adding subtask:', error);
      // Revert optimistic update
      setSubtasksState((prev) => prev.filter((s) => s.id !== newSubtask.id));
    }
  }, [taskId, subtasks.length, supabase]);

  const toggleSubtask = useCallback(async (subtaskId: string) => {
    const subtask = subtasks.find((s) => s.id === subtaskId);
    if (!subtask) return;

    // Optimistic update
    setSubtasksState((prev) =>
      prev.map((s) => (s.id === subtaskId ? { ...s, completed: !s.completed } : s))
    );

    const { error } = await supabase
      .from('subtasks')
      .update({ completed: !subtask.completed })
      .eq('id', subtaskId);

    if (error) {
      console.error('Error toggling subtask:', error);
      // Revert optimistic update
      setSubtasksState((prev) =>
        prev.map((s) => (s.id === subtaskId ? { ...s, completed: subtask.completed } : s))
      );
    }
  }, [subtasks, supabase]);

  const deleteSubtask = useCallback(async (subtaskId: string) => {
    const subtask = subtasks.find((s) => s.id === subtaskId);
    if (!subtask) return;

    // Optimistic update
    setSubtasksState((prev) => prev.filter((s) => s.id !== subtaskId));

    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId);

    if (error) {
      console.error('Error deleting subtask:', error);
      // Revert optimistic update
      setSubtasksState((prev) => [...prev, subtask].sort((a, b) => a.position - b.position));
    }
  }, [subtasks, supabase]);

  const updateSubtask = useCallback(async (subtaskId: string, title: string) => {
    const subtask = subtasks.find((s) => s.id === subtaskId);
    if (!subtask) return;

    // Optimistic update
    setSubtasksState((prev) =>
      prev.map((s) => (s.id === subtaskId ? { ...s, title } : s))
    );

    const { error } = await supabase
      .from('subtasks')
      .update({ title })
      .eq('id', subtaskId);

    if (error) {
      console.error('Error updating subtask:', error);
      // Revert optimistic update
      setSubtasksState((prev) =>
        prev.map((s) => (s.id === subtaskId ? { ...s, title: subtask.title } : s))
      );
    }
  }, [subtasks, supabase]);

  const completedCount = subtasks.filter((s) => s.completed).length;
  const totalCount = subtasks.length;

  return {
    subtasks,
    loading,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    updateSubtask,
    completedCount,
    totalCount,
  };
}

// Utility function to get subtask counts for multiple tasks at once
export async function getSubtaskCounts(taskIds: string[]): Promise<Map<string, { completed: number; total: number }>> {
  if (taskIds.length === 0) return new Map();

  const supabase = createClient();
  const { data, error } = await supabase
    .from('subtasks')
    .select('task_id, completed')
    .in('task_id', taskIds);

  if (error) {
    console.error('Error fetching subtask counts:', error);
    return new Map();
  }

  const counts = new Map<string, { completed: number; total: number }>();

  for (const subtask of data) {
    const existing = counts.get(subtask.task_id) || { completed: 0, total: 0 };
    existing.total++;
    if (subtask.completed) {
      existing.completed++;
    }
    counts.set(subtask.task_id, existing);
  }

  return counts;
}
