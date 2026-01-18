'use client';

import { KanbanBoard } from '@/components/KanbanBoard';
import { TodoList } from '@/components/TodoList';
import { Notes } from '@/components/Notes';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Task, TodoItem } from '@/types';

export default function Home() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('vibe-pm-tasks', []);
  const [todos, setTodos] = useLocalStorage<TodoItem[]>('vibe-pm-todos', []);
  const [notes, setNotes] = useLocalStorage<string>('vibe-pm-notes', '');

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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Kanban Section */}
        <main className="flex-1 flex flex-col min-h-0 border-r border-[var(--border-muted)]">
          <div className="px-8 py-4 border-b border-[var(--border-muted)]">
            <h2 className="font-mono text-xs font-semibold tracking-[0.15em] text-[var(--text-secondary)]">
              PROJECT BOARD
            </h2>
          </div>
          <div className="flex-1 p-6 overflow-hidden">
            <KanbanBoard tasks={tasks} onTasksChange={setTasks} />
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
            DRAG TO MOVE • CLICK TO EDIT • ESC TO CANCEL
          </span>
          <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">
            LOCAL STORAGE ENABLED
          </span>
        </div>
      </footer>
    </div>
  );
}
