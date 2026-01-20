'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TodoItem } from '@/types';

interface DbTodo {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  created_at: string;
}

function mapDbTodoToTodo(dbTodo: DbTodo): TodoItem {
  return {
    id: dbTodo.id,
    text: dbTodo.text,
    completed: dbTodo.completed,
  };
}

export function useTodos(): [TodoItem[], (todos: TodoItem[] | ((prev: TodoItem[]) => TodoItem[])) => void, boolean] {
  const [todos, setTodosState] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Fetch todos on mount
  useEffect(() => {
    const fetchTodos = async () => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching todos:', error);
      } else {
        setTodosState((data as DbTodo[]).map(mapDbTodoToTodo));
      }
      setLoading(false);
    };

    fetchTodos();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        () => {
          fetchTodos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const setTodos = useCallback(
    async (todosOrUpdater: TodoItem[] | ((prev: TodoItem[]) => TodoItem[])) => {
      const newTodos = typeof todosOrUpdater === 'function'
        ? todosOrUpdater(todos)
        : todosOrUpdater;

      // Optimistic update
      setTodosState(newTodos);

      // Find todos that need to be created, updated, or deleted
      const existingIds = new Set(todos.map(t => t.id));
      const newIds = new Set(newTodos.map(t => t.id));

      // Todos to create
      const toCreate = newTodos.filter(t => !existingIds.has(t.id));

      // Todos to delete
      const toDelete = todos.filter(t => !newIds.has(t.id));

      // Todos to update
      const toUpdate = newTodos.filter(t => {
        if (!existingIds.has(t.id)) return false;
        const existing = todos.find(e => e.id === t.id);
        if (!existing) return false;
        return existing.text !== t.text || existing.completed !== t.completed;
      });

      // Execute database operations
      // Create new todos
      for (const todo of toCreate) {
        const { error } = await supabase
          .from('todos')
          .insert({
            id: todo.id,
            text: todo.text,
            completed: todo.completed,
          });
        if (error) console.error('Error creating todo:', error);
      }

      // Delete todos
      for (const todo of toDelete) {
        const { error } = await supabase
          .from('todos')
          .delete()
          .eq('id', todo.id);
        if (error) console.error('Error deleting todo:', error);
      }

      // Update todos
      for (const todo of toUpdate) {
        const { error } = await supabase
          .from('todos')
          .update({
            text: todo.text,
            completed: todo.completed,
          })
          .eq('id', todo.id);
        if (error) console.error('Error updating todo:', error);
      }
    },
    [todos, supabase]
  );

  return [todos, setTodos, loading];
}
