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
import { ViewSelector } from '@/components/ViewSelector';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { AchievementsPanel } from '@/components/AchievementsPanel';
import { CalendarView } from '@/components/CalendarView';
import { WeeklyPlanningView } from '@/components/WeeklyPlanningView';
import { AgendaView } from '@/components/AgendaView';
import { useTasks } from '@/hooks/useTasks';
import { useTodos } from '@/hooks/useTodos';
import { useDailyReflection } from '@/hooks/useDailyReflection';
import { useWorkDate } from '@/hooks/useWorkDate';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Priority, ViewType } from '@/types';

function formatTargetDateForToast(dateStr: string): string {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  if (dateStr === todayStr) return 'TODAY';

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === tomorrow.toISOString().split('T')[0]) return 'TOMORROW';

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

export default function Home() {
  // Work date management
  const {
    workDate,
    today,
    isToday,
    isNewDay,
    formattedDate,
    goToDate,
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
  const [isAnalyticsPanelOpen, setIsAnalyticsPanelOpen] = useState(false);
  const [isAchievementsPanelOpen, setIsAchievementsPanelOpen] = useState(false);

  // View state
  const [currentView, setCurrentView] = useState<ViewType>('kanban');

  // Mobile sidebar panel
  const [mobileSidebarPanel, setMobileSidebarPanel] = useState<'notes' | 'reflection' | null>(null);

  // Toast notification state
  const [copiedToastCount, setCopiedToastCount] = useState<number | null>(null);
  const [rolloverToastInfo, setRolloverToastInfo] = useState<{ rolledCount: number; expiredCount: number } | null>(null);

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

  const handleOpenAnalytics = useCallback(() => {
    setIsAnalyticsPanelOpen(true);
  }, []);

  const handleOpenAchievements = useCallback(() => {
    setIsAchievementsPanelOpen(true);
  }, []);

  const handleViewChange = useCallback((view: ViewType) => {
    setCurrentView(view);
  }, []);

  const handleDateSelectFromView = useCallback((date: string) => {
    // Navigate to the selected date and switch to kanban view
    goToDate(date);
    setCurrentView('kanban');
  }, [goToDate]);

  const handleTasksCopied = useCallback((count: number) => {
    refetchTasks();
    setCopiedToastCount(count);
  }, [refetchTasks]);

  const handleTasksRolledOver = useCallback((result: { rolledCount: number; expiredCount: number }) => {
    if (result.rolledCount > 0 || result.expiredCount > 0) {
      refetchTasks();
      setRolloverToastInfo(result);
    }
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

  // Auto-hide rollover toast after 4 seconds
  useEffect(() => {
    if (rolloverToastInfo !== null) {
      const timer = setTimeout(() => {
        setRolloverToastInfo(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [rolloverToastInfo]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'complete').length;

  return (
    <div className="h-screen h-dvh flex flex-col bg-[var(--bg-primary)] grid-bg overflow-hidden">
      {/* Header - Desktop */}
      <header className="flex-shrink-0 border-b border-[var(--border-muted)]">
        <div className="hidden md:flex items-center justify-between px-8 py-5">
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
            />
            <div className="h-4 w-px bg-[var(--border-muted)]" />
            <button
              onClick={handleOpenHistory}
              className="flex items-center gap-2 px-3 py-1.5 font-mono text-[10px] tracking-wider border border-[var(--border-muted)] text-[var(--text-muted)] hover:border-[var(--text-secondary)] hover:text-[var(--text-secondary)] transition-all"
              title="Task History"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8V12L15 15M3.05 11A9 9 0 1 1 3 12M3 4V11H10" />
              </svg>
              HISTORY
            </button>
          </div>
          <div className="flex items-center gap-6">
            <ViewSelector currentView={currentView} onViewChange={handleViewChange} />
            <div className="h-4 w-px bg-[var(--border-muted)]" />
            <button
              onClick={handleOpenAchievements}
              className="flex items-center gap-2 px-3 py-1.5 font-mono text-[10px] tracking-wider border border-[var(--border-muted)] text-[var(--text-muted)] hover:border-[var(--warning)] hover:text-[var(--warning)] transition-all"
              title="Achievements"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              ACHIEVEMENTS
            </button>
            <button
              onClick={handleOpenAnalytics}
              className="flex items-center gap-2 px-3 py-1.5 font-mono text-[10px] tracking-wider border border-[var(--border-muted)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
              title="Analytics"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              ANALYTICS
            </button>
            <div className="h-4 w-px bg-[var(--border-muted)]" />
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

        {/* Header - Mobile */}
        <div className="md:hidden px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="font-mono text-sm font-bold tracking-[0.2em] text-[var(--text-primary)]">
              VIBE<span className="text-[var(--accent)]">_</span>PM
            </h1>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <AuthButton />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-muted)]">
            <DateNavigator
              formattedDate={formattedDate}
              isToday={isToday}
              onPrevDay={goToPrevDay}
              onNextDay={goToNextDay}
              onToday={goToToday}
            />
            <ViewSelector currentView={currentView} onViewChange={handleViewChange} />
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
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Main Content Section */}
        <main className="flex-1 flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-[var(--border-muted)]">
          {currentView === 'kanban' && (
            <>
              <div className="px-4 md:px-8 py-3 md:py-4 border-b border-[var(--border-muted)]">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
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
              <div className="flex-1 p-3 md:p-6 overflow-hidden">
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
            </>
          )}

          {currentView === 'calendar' && (
            <CalendarView
              selectedDate={workDate}
              onDateSelect={handleDateSelectFromView}
            />
          )}

          {currentView === 'weekly' && (
            <WeeklyPlanningView
              selectedDate={workDate}
              onDateSelect={handleDateSelectFromView}
            />
          )}

          {currentView === 'agenda' && (
            <AgendaView
              selectedDate={workDate}
              onDateSelect={handleDateSelectFromView}
            />
          )}
        </main>

        {/* Sidebar - Desktop only */}
        <aside className="hidden md:flex w-[340px] flex-shrink-0 flex-col min-h-0 bg-[var(--bg-surface)]">
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

      {/* Footer - Desktop */}
      <footer className="hidden md:block flex-shrink-0 border-t border-[var(--border-muted)] px-8 py-3">
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

      {/* Mobile Bottom Bar */}
      <div className="md:hidden flex-shrink-0 border-t border-[var(--border-muted)] bg-[var(--bg-surface)]">
        <div className="flex">
          <button
            onClick={() => setMobileSidebarPanel(mobileSidebarPanel === 'notes' ? null : 'notes')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-mono text-[10px] tracking-wider transition-colors ${
              mobileSidebarPanel === 'notes'
                ? 'text-[var(--accent)] bg-[var(--accent)]/10'
                : 'text-[var(--text-muted)]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            NOTES
          </button>
          <div className="w-px bg-[var(--border-muted)]" />
          <button
            onClick={() => setMobileSidebarPanel(mobileSidebarPanel === 'reflection' ? null : 'reflection')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-mono text-[10px] tracking-wider transition-colors ${
              mobileSidebarPanel === 'reflection'
                ? 'text-[var(--accent)] bg-[var(--accent)]/10'
                : 'text-[var(--text-muted)]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            REFLECTION
          </button>
        </div>

        {/* Slide-up panel */}
        {mobileSidebarPanel && (
          <div className="border-t border-[var(--border-muted)] h-[45vh] overflow-y-auto bg-[var(--bg-surface)]">
            {mobileSidebarPanel === 'notes' && (
              <TodoList todos={todos} onTodosChange={setTodos} />
            )}
            {mobileSidebarPanel === 'reflection' && (
              <DailyReflection reflection={reflection} onReflectionChange={setReflection} />
            )}
          </div>
        )}
      </div>

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
        onTasksRolledOver={handleTasksRolledOver}
      />

      {/* History Panel */}
      <HistoryPanel
        isOpen={isHistoryPanelOpen}
        targetDate={workDate}
        onClose={handleHistoryClose}
        onTasksCopied={handleTasksCopied}
      />

      {/* Analytics Panel */}
      <AnalyticsPanel
        isOpen={isAnalyticsPanelOpen}
        onClose={() => setIsAnalyticsPanelOpen(false)}
      />

      {/* Achievements Panel */}
      <AchievementsPanel
        isOpen={isAchievementsPanelOpen}
        onClose={() => setIsAchievementsPanelOpen(false)}
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
              {copiedToastCount} TASK{copiedToastCount === 1 ? '' : 'S'} COPIED TO {formatTargetDateForToast(workDate)}
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

      {/* Rollover Tasks Toast */}
      {rolloverToastInfo !== null && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in">
          <div className="flex items-center gap-3 px-5 py-3 bg-[var(--bg-elevated)] border border-[var(--accent)]/30 shadow-lg">
            <div className="w-6 h-6 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 5l7 7-7 7M5 12h14"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-mono text-xs text-[var(--text-primary)]">
              {rolloverToastInfo.rolledCount > 0 && (
                <>{rolloverToastInfo.rolledCount} TASK{rolloverToastInfo.rolledCount === 1 ? '' : 'S'} ROLLED FORWARD</>
              )}
              {rolloverToastInfo.rolledCount > 0 && rolloverToastInfo.expiredCount > 0 && ' • '}
              {rolloverToastInfo.expiredCount > 0 && (
                <>{rolloverToastInfo.expiredCount} EXPIRED</>
              )}
            </span>
            <button
              onClick={() => setRolloverToastInfo(null)}
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
