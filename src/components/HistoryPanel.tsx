'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { getTaskHistory, getTasksFromDate, copyTasksToDate } from '@/hooks/useTasks';

interface HistoryPanelProps {
  isOpen: boolean;
  today: string;
  onClose: () => void;
  onTasksCopied: (count: number) => void;
}

interface DateHistory {
  date: string;
  total: number;
  incomplete: number;
}

function formatDateForDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

const PRIORITY_COLORS = {
  low: 'var(--priority-low)',
  medium: 'var(--priority-medium)',
  high: 'var(--priority-high)',
  urgent: 'var(--priority-urgent)',
};

export function HistoryPanel({ isOpen, today, onClose, onTasksCopied }: HistoryPanelProps) {
  const [history, setHistory] = useState<DateHistory[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [copying, setCopying] = useState(false);

  // Fetch history on open
  useEffect(() => {
    if (isOpen) {
      setLoadingHistory(true);
      setSelectedDate(null);
      setTasks([]);
      setSelectedTaskIds(new Set());
      getTaskHistory().then((data) => {
        // Filter out today and sort by date descending
        const filtered = data.filter((d) => d.date !== today);
        setHistory(filtered);
        setLoadingHistory(false);
      });
    }
  }, [isOpen, today]);

  // Fetch tasks when a date is selected
  useEffect(() => {
    if (selectedDate) {
      setLoadingTasks(true);
      setSelectedTaskIds(new Set());
      getTasksFromDate(selectedDate).then((data) => {
        setTasks(data);
        setLoadingTasks(false);
      });
    }
  }, [selectedDate]);

  const handleToggleTask = (taskId: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleSelectAllIncomplete = () => {
    const incompleteIds = tasks
      .filter((t) => t.status !== 'complete')
      .map((t) => t.id);
    setSelectedTaskIds(new Set(incompleteIds));
  };

  const handleCopyToToday = async () => {
    if (selectedTaskIds.size === 0 || !selectedDate) return;

    setCopying(true);
    const count = await copyTasksToDate(Array.from(selectedTaskIds), selectedDate, today);
    setCopying(false);

    if (count > 0) {
      onTasksCopied(count);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-[var(--bg-surface)] border border-[var(--border-muted)] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-muted)]">
          <h2 className="font-mono text-sm font-bold tracking-[0.15em] text-[var(--text-primary)]">
            TASK HISTORY
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L13 13M1 13L13 1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Date List */}
          <div className="w-48 flex-shrink-0 border-r border-[var(--border-muted)] overflow-y-auto">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <span className="font-mono text-xs text-[var(--text-muted)]">
                  LOADING...
                </span>
              </div>
            ) : history.length === 0 ? (
              <div className="flex items-center justify-center h-full p-4">
                <span className="font-mono text-xs text-[var(--text-muted)] text-center">
                  NO HISTORY YET
                </span>
              </div>
            ) : (
              <div className="py-2">
                {history.map((item) => (
                  <button
                    key={item.date}
                    onClick={() => setSelectedDate(item.date)}
                    className={`w-full px-4 py-3 text-left hover:bg-[var(--bg-tertiary)] transition-colors ${
                      selectedDate === item.date
                        ? 'bg-[var(--bg-tertiary)] border-l-2 border-[var(--accent)]'
                        : ''
                    }`}
                  >
                    <div className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                      {formatDateForDisplay(item.date)}
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-[var(--text-muted)]">
                      {item.total} task{item.total === 1 ? '' : 's'}
                      {item.incomplete > 0 && (
                        <span className="text-[var(--warning)]">
                          {' '}
                          ({item.incomplete} incomplete)
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Task List */}
          <div className="flex-1 flex flex-col min-h-0">
            {!selectedDate ? (
              <div className="flex-1 flex items-center justify-center">
                <span className="font-mono text-xs text-[var(--text-muted)]">
                  SELECT A DATE TO VIEW TASKS
                </span>
              </div>
            ) : loadingTasks ? (
              <div className="flex-1 flex items-center justify-center">
                <span className="font-mono text-xs text-[var(--text-muted)]">
                  LOADING...
                </span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <span className="font-mono text-xs text-[var(--text-muted)]">
                  NO TASKS ON THIS DATE
                </span>
              </div>
            ) : (
              <>
                {/* Task Actions */}
                <div className="px-4 py-3 border-b border-[var(--border-muted)] flex items-center justify-between">
                  <button
                    onClick={handleSelectAllIncomplete}
                    className="font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                  >
                    SELECT ALL INCOMPLETE
                  </button>
                  <span className="font-mono text-[10px] text-[var(--text-muted)]">
                    {selectedTaskIds.size} SELECTED
                  </span>
                </div>

                {/* Task Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id)}
                      className={`p-3 border cursor-pointer transition-all ${
                        selectedTaskIds.has(task.id)
                          ? 'border-[var(--accent)] bg-[var(--bg-tertiary)]'
                          : 'border-[var(--border-muted)] hover:border-[var(--border-default)]'
                      } ${task.status === 'complete' ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center ${
                            selectedTaskIds.has(task.id)
                              ? 'border-[var(--accent)] bg-[var(--accent)]'
                              : 'border-[var(--border-muted)]'
                          }`}
                        >
                          {selectedTaskIds.has(task.id) && (
                            <svg
                              width="10"
                              height="8"
                              viewBox="0 0 10 8"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M1 4L3.5 6.5L9 1"
                                stroke="var(--bg-primary)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-mono text-sm ${
                              task.status === 'complete'
                                ? 'line-through text-[var(--text-muted)]'
                                : 'text-[var(--text-primary)]'
                            }`}
                          >
                            {task.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
                            />
                            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase">
                              {task.priority}
                            </span>
                            <span className="font-mono text-[10px] text-[var(--text-muted)]">
                              {task.status === 'complete'
                                ? 'DONE'
                                : task.status === 'in-progress'
                                ? 'IN PROGRESS'
                                : 'TODO'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-muted)]">
          <button
            onClick={onClose}
            className="px-4 py-2 font-mono text-xs tracking-wide text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={handleCopyToToday}
            disabled={selectedTaskIds.size === 0 || copying}
            className="px-4 py-2 font-mono text-xs tracking-wide bg-[var(--accent)] text-[var(--bg-primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {copying
              ? 'COPYING...'
              : `COPY TO TODAY${selectedTaskIds.size > 0 ? ` (${selectedTaskIds.size})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
