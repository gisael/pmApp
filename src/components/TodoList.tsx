'use client';

import { useState } from 'react';
import { TodoItem as TodoItemType } from '@/types';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: TodoItemType[];
  onTodosChange: (todos: TodoItemType[]) => void;
}

export function TodoList({ todos, onTodosChange }: TodoListProps) {
  const [newTodo, setNewTodo] = useState('');

  const handleAdd = () => {
    if (newTodo.trim()) {
      const todo: TodoItemType = {
        id: crypto.randomUUID(),
        text: newTodo.trim(),
        completed: false,
      };
      onTodosChange([...todos, todo]);
      setNewTodo('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const handleToggle = (id: string) => {
    onTodosChange(
      todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const handleDelete = (id: string) => {
    onTodosChange(todos.filter((t) => t.id !== id));
  };

  const handleEdit = (id: string, text: string) => {
    onTodosChange(todos.map((t) => (t.id === id ? { ...t, text } : t)));
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="flex flex-col h-full">
      {/* Stats Bar */}
      <div className="px-6 py-2 border-b border-[var(--border-muted)] flex items-center justify-between">
        <span className="font-mono text-[10px] text-[var(--text-muted)]">
          {completedCount}/{todos.length} DONE
        </span>
        {completedCount > 0 && (
          <button
            onClick={() => onTodosChange(todos.filter(t => !t.completed))}
            className="font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            CLEAR DONE
          </button>
        )}
      </div>

      {/* Todo Items */}
      <div className="flex-1 overflow-y-auto">
        {todos.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="font-mono text-xs text-[var(--text-muted)]">NO ITEMS</span>
          </div>
        ) : (
          <div className="py-1">
            {todos.map((todo, index) => (
              <div
                key={todo.id}
                className="animate-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <TodoItem
                  item={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[var(--border-muted)]">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add quick note..."
            className="input-brutal flex-1"
          />
          <button
            onClick={handleAdd}
            disabled={!newTodo.trim()}
            className="btn-brutal btn-brutal-accent"
          >
            ADD
          </button>
        </div>
      </div>
    </div>
  );
}
