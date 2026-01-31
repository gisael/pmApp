'use client';

import { useState, useMemo } from 'react';
import { useTasksRange } from '@/hooks/useTasksRange';
import { Task, Priority } from '@/types';

interface AgendaViewProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onTaskClick?: (task: Task) => void;
}

type FilterPeriod = '7' | '14' | '30';

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  low: { label: 'LOW', color: 'var(--text-muted)' },
  medium: { label: 'MED', color: 'var(--text-secondary)' },
  high: { label: 'HIGH', color: 'var(--accent)' },
  urgent: { label: 'URGENT', color: '#ef4444' },
};

export function AgendaView({ selectedDate, onDateSelect, onTaskClick }: AgendaViewProps) {
  const today = new Date().toISOString().split('T')[0];
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('7');

  const endDate = useMemo(() => {
    const d = new Date(today + 'T00:00:00');
    d.setDate(d.getDate() + parseInt(filterPeriod) - 1);
    return d.toISOString().split('T')[0];
  }, [today, filterPeriod]);

  const { tasks, tasksByDate, loading } = useTasksRange(today, endDate);

  // Get unique dates that have tasks, sorted
  const datesWithTasks = useMemo(() => {
    const dates = Array.from(tasksByDate.keys()).sort();
    return dates;
  }, [tasksByDate]);

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const isToday = dateStr === today;
    const isTomorrow = (() => {
      const tomorrow = new Date(today + 'T00:00:00');
      tomorrow.setDate(tomorrow.getDate() + 1);
      return dateStr === tomorrow.toISOString().split('T')[0];
    })();

    if (isToday) return 'TODAY';
    if (isTomorrow) return 'TOMORROW';

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).toUpperCase();
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'complete').length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-muted)]">
        <div className="flex items-center gap-4">
          <h3 className="font-mono text-sm font-semibold tracking-wider text-[var(--text-primary)] uppercase">
            AGENDA
          </h3>
          <span className="font-mono text-xs text-[var(--text-muted)]">
            {completedTasks}/{totalTasks} TASKS
          </span>
        </div>
        {/* Period Filter */}
        <div className="flex gap-1">
          {(['7', '14', '30'] as FilterPeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setFilterPeriod(period)}
              className={`px-3 py-1.5 font-mono text-[10px] tracking-wider border transition-all ${
                filterPeriod === period
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'border-[var(--border-muted)] text-[var(--text-muted)] hover:border-[var(--border)]'
              }`}
            >
              {period}D
            </button>
          ))}
        </div>
      </div>

      {/* Agenda List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <span className="font-mono text-xs text-[var(--text-muted)] tracking-wider">
              LOADING AGENDA...
            </span>
          </div>
        ) : datesWithTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <svg className="w-12 h-12 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="font-mono text-xs text-[var(--text-muted)] tracking-wider">
              NO TASKS IN THE NEXT {filterPeriod} DAYS
            </span>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-muted)]">
            {datesWithTasks.map((date) => {
              const dateTasks = tasksByDate.get(date) || [];
              const isSelectedDate = date === selectedDate;

              return (
                <div key={date} className="p-4">
                  {/* Date Header */}
                  <button
                    onClick={() => onDateSelect(date)}
                    className={`
                      w-full text-left mb-3 pb-2 border-b border-[var(--border-muted)]
                      ${isSelectedDate ? 'border-b-[var(--accent)]' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`
                        font-mono text-xs font-semibold tracking-wider
                        ${date === today ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}
                      `}>
                        {formatDateHeader(date)}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--text-muted)]">
                        {dateTasks.filter((t) => t.status === 'complete').length}/{dateTasks.length}
                      </span>
                    </div>
                  </button>

                  {/* Tasks for this date */}
                  <div className="space-y-2">
                    {dateTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => onTaskClick?.(task)}
                        className={`
                          w-full text-left p-3 border border-[var(--border-muted)] bg-[var(--bg-surface)]
                          hover:border-[var(--border)] transition-all
                          ${task.status === 'complete' ? 'opacity-60' : ''}
                        `}
                      >
                        <div className="flex items-start gap-3">
                          {/* Status indicator */}
                          <div className={`
                            w-4 h-4 mt-0.5 flex-shrink-0 border
                            ${task.status === 'complete'
                              ? 'bg-[var(--accent)] border-[var(--accent)]'
                              : 'border-[var(--border-muted)]'
                            }
                          `}>
                            {task.status === 'complete' && (
                              <svg className="w-full h-full text-[var(--bg-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Title */}
                            <h4 className={`
                              font-mono text-sm leading-tight
                              ${task.status === 'complete'
                                ? 'text-[var(--text-muted)] line-through'
                                : 'text-[var(--text-primary)]'
                              }
                            `}>
                              {task.title}
                            </h4>

                            {/* Meta */}
                            <div className="flex items-center gap-3 mt-1">
                              <span
                                className="font-mono text-[9px] font-semibold px-1.5 py-0.5 border"
                                style={{
                                  borderColor: priorityConfig[task.priority].color,
                                  color: priorityConfig[task.priority].color,
                                }}
                              >
                                {priorityConfig[task.priority].label}
                              </span>
                              <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase">
                                {task.status.replace('-', ' ')}
                              </span>
                              {task.dueDate && (
                                <span className="font-mono text-[10px] text-[var(--text-muted)]">
                                  DUE {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              )}
                            </div>

                            {/* Description preview */}
                            {task.description && (
                              <p className="font-mono text-xs text-[var(--text-muted)] mt-1 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
