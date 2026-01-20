'use client';

import { useState, useRef, useCallback } from 'react';
import { KanbanBoard } from '@/components/KanbanBoard';
import { TodoList } from '@/components/TodoList';
import { Notes } from '@/components/Notes';
import { ShortcutsModal } from '@/components/ShortcutsModal';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { AuthButton } from '@/components/AuthButton';
import { useTasks } from '@/hooks/useTasks';
import { useTodos } from '@/hooks/useTodos';
import { useNotes } from '@/hooks/useNotes';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Priority } from '@/types';

export default function Home() {
  const [tasks, setTasks, tasksLoading] = useTasks();
  const [todos, setTodos, todosLoading] = useTodos();
  const [notes, setNotes, notesLoading] = useNotes();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleNewTask = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleFocusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleShowHelp = useCallback(() => {
    setIsShortcutsOpen(true);
  }, []);

  useKeyboardShortcuts({
    onNewTask: handleNewTask,
    onFocusSearch: handleFocusSearch,
    onShowHelp: handleShowHelp,
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'complete').length;

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] grid-bg">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[var(--border-muted)]">
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-8">
            <h1 className="font-mono text-sm font-bold tracking-[0.2em] text-[var(--text-primary)]">
              VIBE<span className="text-[var(--accent)]">_</span>PM
            </h1>
            <div className="h-4 w-px bg-[var(--border-muted)]" />
            <span className="font-mono text-xs text-[var(--text-muted)] tracking-wide">
              {currentDate.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[var(--success)] rounded-full pulse-accent" />
              <span className="font-mono text-xs text-[var(--text-secondary)]">
                {completedTasks}/{totalTasks} COMPLETE
              </span>
            </div>
            <div className="h-4 w-px bg-[var(--border-muted)]" />
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Kanban Section */}
        <main className="flex-1 flex flex-col min-h-0 border-r border-[var(--border-muted)]">
          <div className="px-8 py-4 border-b border-[var(--border-muted)]">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xs font-semibold tracking-[0.15em] text-[var(--text-secondary)]">
                PROJECT BOARD
              </h2>
              <SearchFilterBar
                ref={searchInputRef}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                priorityFilter={priorityFilter}
                onPriorityFilterChange={setPriorityFilter}
              />
            </div>
          </div>
          <div className="flex-1 p-6 overflow-hidden">
            <KanbanBoard
              tasks={tasks}
              onTasksChange={setTasks}
              isAddModalOpen={isAddModalOpen}
              onAddModalOpenChange={setIsAddModalOpen}
              searchQuery={searchQuery}
              priorityFilter={priorityFilter}
            />
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-[340px] flex-shrink-0 flex flex-col min-h-0 bg-[var(--bg-surface)]">
          {/* Todos Section */}
          <div className="flex-1 flex flex-col min-h-0 border-b border-[var(--border-muted)]">
            <div className="px-6 py-4 border-b border-[var(--border-muted)]">
              <h2 className="font-mono text-xs font-semibold tracking-[0.15em] text-[var(--text-secondary)]">
                QUICK TASKS
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <TodoList todos={todos} onTodosChange={setTodos} />
            </div>
          </div>

          {/* Notes Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-6 py-4 border-b border-[var(--border-muted)]">
              <h2 className="font-mono text-xs font-semibold tracking-[0.15em] text-[var(--text-secondary)]">
                SCRATCH PAD
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <Notes notes={notes} onNotesChange={setNotes} />
            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-[var(--border-muted)] px-8 py-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">
            <span className="text-[var(--text-secondary)]">N</span> NEW TASK •
            <span className="text-[var(--text-secondary)]"> /</span> SEARCH •
            <span className="text-[var(--text-secondary)]"> ?</span> SHORTCUTS
          </span>
          <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">
            {tasksLoading || todosLoading || notesLoading ? 'SYNCING...' : 'CLOUD SYNCED'}
          </span>
        </div>
      </footer>

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
