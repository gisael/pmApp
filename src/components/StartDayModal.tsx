'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { getIncompleteTasksFromDate, copyTasksToDate, rolloverTasksToToday } from '@/hooks/useTasks';

interface StartDayModalProps {
  isOpen: boolean;
  today: string;
  onClose: () => void;
  onOpenHistory: () => void;
  onTasksCopied: (count: number) => void;
  onTasksRolledOver?: (result: { rolledCount: number; pinnedCount: number }) => void;
}

function formatDateForDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getYesterday(today: string): string {
  const [year, month, day] = today.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function StartDayModal({
  isOpen,
  today,
  onClose,
  onOpenHistory,
  onTasksCopied,
  onTasksRolledOver,
}: StartDayModalProps) {
  const [yesterdayTasks, setYesterdayTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [rolloverResult, setRolloverResult] = useState<{ rolledCount: number; pinnedCount: number } | null>(null);

  const yesterday = getYesterday(today);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setRolloverResult(null);

      // Run rollover and fetch yesterday's tasks in parallel
      Promise.all([
        rolloverTasksToToday(),
        getIncompleteTasksFromDate(yesterday)
      ]).then(([rollover, tasks]) => {
        setRolloverResult(rollover);
        setYesterdayTasks(tasks);
        setLoading(false);

        // Notify parent about rollover
        if (rollover.rolledCount > 0 || rollover.pinnedCount > 0) {
          onTasksRolledOver?.(rollover);
        }
      });
    }
  }, [isOpen, yesterday, onTasksRolledOver]);

  const handleStartFresh = () => {
    onClose();
  };

  const handleContinueYesterday = async () => {
    if (yesterdayTasks.length === 0) {
      onClose();
      return;
    }

    setCopying(true);
    const taskIds = yesterdayTasks.map((t) => t.id);
    const count = await copyTasksToDate(taskIds, yesterday, today);
    setCopying(false);
    if (count > 0) {
      onTasksCopied(count);
    }
    onClose();
  };

  const handlePickFromHistory = () => {
    onOpenHistory();
  };

  if (!isOpen) return null;

  const greeting = new Date().getHours() < 12 ? 'GOOD MORNING' : new Date().getHours() < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-muted)] shadow-2xl">
        {/* Header */}
        <div className="px-8 py-6 text-center border-b border-[var(--border-muted)]">
          <h2 className="font-mono text-lg font-bold tracking-[0.2em] text-[var(--text-primary)]">
            {greeting}
          </h2>
          <p className="mt-2 font-mono text-xs text-[var(--text-muted)] tracking-wide">
            {formatDateForDisplay(today)}
          </p>
          {rolloverResult && (rolloverResult.rolledCount > 0 || rolloverResult.pinnedCount > 0) && (
            <p className="mt-3 font-mono text-[10px] text-[var(--accent)] tracking-wider">
              {rolloverResult.rolledCount > 0 && (
                <span>{rolloverResult.rolledCount} TASK{rolloverResult.rolledCount === 1 ? '' : 'S'} ROLLED FORWARD</span>
              )}
              {rolloverResult.rolledCount > 0 && rolloverResult.pinnedCount > 0 && ' • '}
              {rolloverResult.pinnedCount > 0 && (
                <span>{rolloverResult.pinnedCount} PINNED TO DUE DATE</span>
              )}
            </p>
          )}
        </div>

        {/* Options */}
        <div className="p-6 space-y-3">
          {/* Start Fresh */}
          <button
            onClick={handleStartFresh}
            className="w-full p-4 text-left border border-[var(--border-muted)] hover:border-[var(--accent)] hover:bg-[var(--bg-tertiary)] transition-all group"
          >
            <div className="font-mono text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] tracking-wide">
              START FRESH
            </div>
            <div className="mt-1 font-mono text-xs text-[var(--text-muted)]">
              Begin with an empty board
            </div>
          </button>

          {/* Continue Yesterday */}
          <button
            onClick={handleContinueYesterday}
            disabled={loading || copying}
            className="w-full p-4 text-left border border-[var(--border-muted)] hover:border-[var(--accent)] hover:bg-[var(--bg-tertiary)] transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="font-mono text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] tracking-wide">
              CONTINUE YESTERDAY
            </div>
            <div className="mt-1 font-mono text-xs text-[var(--text-muted)]">
              {loading ? (
                'Loading...'
              ) : copying ? (
                'Copying tasks...'
              ) : yesterdayTasks.length === 0 ? (
                'No incomplete tasks from yesterday'
              ) : (
                `Copy ${yesterdayTasks.length} incomplete task${yesterdayTasks.length === 1 ? '' : 's'}`
              )}
            </div>
          </button>

          {/* Pick from History */}
          <button
            onClick={handlePickFromHistory}
            className="w-full p-4 text-left border border-[var(--border-muted)] hover:border-[var(--accent)] hover:bg-[var(--bg-tertiary)] transition-all group"
          >
            <div className="font-mono text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] tracking-wide">
              PICK FROM HISTORY
            </div>
            <div className="mt-1 font-mono text-xs text-[var(--text-muted)]">
              Select from any past day
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
