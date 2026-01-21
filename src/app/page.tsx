'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { KanbanBoard } from '@/components/KanbanBoard';
import { TodoList } from '@/components/TodoList';
import { DailyReflection } from '@/components/DailyReflection';
import { DateNavigator } from '@/components/DateNavigator';
import { StartDayModal } from '@/components/StartDayModal';
import { HistoryPanel } from '@/components/HistoryPanel';
import { ShortcutsModal } from '@/components/ShortcutsModal';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { AuthButton } from '@/components/AuthButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTasks } from '@/hooks/useTasks';
import { useTodos } from '@/hooks/useTodos';
import { useDailyReflection } from '@/hooks/useDailyReflection';
import { useWorkDate } from '@/hooks/useWorkDate';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Priority } from '@/types';

export default function Home() {
  // Work date management
  const {
    workDate,
    today,
    isToday,
    isNewDay,
    formattedDate,
    goToPrevDay,
    goToNextDay,
    goToToday,
    markDayVisited,
  } = useWorkDate();

  // Data hooks with date filtering
  const [tasks, setTasks, tasksLoading, refetchTasks] = useTasks(workDate);
  const [todos, setTodos, todosLoading] = useTodos();
  const [reflection, setReflection, reflectionLoading] = useDailyReflection(workDate);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isStartDayModalOpen, setIsStartDayModalOpen] = useState(isNewDay);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  // Toast notification state
  const [copiedToastCount, setCopiedToastCount] = useState<number | null>(null);

  // Search and filter
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

  const handleStartDayClose = useCallback(() => {
    markDayVisited();
    setIsStartDayModalOpen(false);
  }, [markDayVisited]);

  const handleOpenHistoryFromStartDay = useCallback(() => {
    setIsStartDayModalOpen(false);
    setIsHistoryPanelOpen(true);
  }, []);

  const handleHistoryClose = useCallback(() => {
    markDayVisited();
    setIsHistoryPanelOpen(false);
  }, [markDayVisited]);

  const handleOpenHistory = useCallback(() => {
    setIsHistoryPanelOpen(true);
  }, []);

  const handleTasksCopied = useCallback((count: number) => {
    refetchTasks();
    setCopiedToastCount(count);
  }, [refetchTasks]);

  // Auto-hide copied toast after 3 seconds
  useEffect(() => {
    if (copiedToastCount !== null) {
      const timer = setTimeout(() => {
        setCopiedToastCount(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [copiedToastCount]);

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
            <DateNavigator
              formattedDate={formattedDate}
              isToday={isToday}
              onPrevDay={goToPrevDay}
              onNextDay={goToNextDay}
              onToday={goToToday}
              onOpenHistory={handleOpenHistory}
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[var(--success)] rounded-full pulse-accent" />
              <span className="font-mono text-xs text-[var(--text-secondary)]">
                {completedTasks}/{totalTasks} COMPLETE
              </span>
            </div>
            <div className="h-4 w-px bg-[var(--border-muted)]" />
            <ThemeToggle />
            <div className="h-4 w-px bg-[var(--border-muted)]" />
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Past Day Warning Banner */}
      {!isToday && (
        <div className="flex-shrink-0 px-8 py-2 bg-[var(--warning)]/10 border-b border-[var(--warning)]/30">
          <span className="font-mono text-xs text-[var(--warning)]">
            VIEWING {formattedDate} - You can still edit this day
          </span>
        </div>
      )}

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
              workDate={workDate}
            />
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-[340px] flex-shrink-0 flex flex-col min-h-0 bg-[var(--bg-surface)]">
          {/* Quick Notes Section (persistent across days) */}
          <div className="flex-1 flex flex-col min-h-0 border-b border-[var(--border-muted)]">
            <div className="px-6 py-4 border-b border-[var(--border-muted)]">
              <h2 className="font-mono text-xs font-semibold tracking-[0.15em] text-[var(--text-secondary)]">
                QUICK NOTES
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <TodoList todos={todos} onTodosChange={setTodos} />
            </div>
          </div>

          {/* Daily Reflection Section (per day) */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-6 py-4 border-b border-[var(--border-muted)]">
              <h2 className="font-mono text-xs font-semibold tracking-[0.15em] text-[var(--text-secondary)]">
                DAILY REFLECTION
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <DailyReflection reflection={reflection} onReflectionChange={setReflection} />
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
            {tasksLoading || todosLoading || reflectionLoading ? 'SYNCING...' : 'CLOUD SYNCED'}
          </span>
        </div>
      </footer>

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Start Day Modal */}
      <StartDayModal
        isOpen={isStartDayModalOpen}
        today={today}
        onClose={handleStartDayClose}
        onOpenHistory={handleOpenHistoryFromStartDay}
        onTasksCopied={handleTasksCopied}
      />

      {/* History Panel */}
      <HistoryPanel
        isOpen={isHistoryPanelOpen}
        today={today}
        onClose={handleHistoryClose}
        onTasksCopied={handleTasksCopied}
      />

      {/* Copied Tasks Toast */}
      {copiedToastCount !== null && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in">
          <div className="flex items-center gap-3 px-5 py-3 bg-[var(--bg-elevated)] border border-[var(--success)]/30 shadow-lg">
            <div className="w-6 h-6 rounded-full bg-[var(--success)]/20 flex items-center justify-center flex-shrink-0">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12L10 17L20 7"
                  stroke="var(--success)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-mono text-xs text-[var(--text-primary)]">
              {copiedToastCount} TASK{copiedToastCount === 1 ? '' : 'S'} COPIED TO TODAY
            </span>
            <button
              onClick={() => setCopiedToastCount(null)}
              className="ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
