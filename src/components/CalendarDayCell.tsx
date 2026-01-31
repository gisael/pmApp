'use client';

import { Task, Priority } from '@/types';

interface CalendarDayCellProps {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  tasks: Task[];
  onClick: () => void;
}

const priorityColors: Record<Priority, string> = {
  low: 'var(--text-muted)',
  medium: 'var(--text-secondary)',
  high: 'var(--accent)',
  urgent: '#ef4444',
};

export function CalendarDayCell({
  date,
  dayNumber,
  isCurrentMonth,
  isToday,
  isSelected,
  tasks,
  onClick,
}: CalendarDayCellProps) {
  const completedCount = tasks.filter((t) => t.status === 'complete').length;
  const totalCount = tasks.length;

  // Get unique priorities present in tasks for dot display
  const priorities = [...new Set(tasks.map((t) => t.priority))] as Priority[];

  return (
    <button
      onClick={onClick}
      className={`
        relative p-2 min-h-[80px] border border-[var(--border-muted)] text-left transition-all
        ${isCurrentMonth ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-primary)] opacity-50'}
        ${isToday ? 'border-[var(--accent)]' : ''}
        ${isSelected ? 'bg-[var(--accent)]/10 border-[var(--accent)]' : ''}
        hover:border-[var(--accent)] hover:bg-[var(--bg-elevated)]
      `}
    >
      {/* Day Number */}
      <div className={`
        font-mono text-sm font-semibold mb-1
        ${isToday ? 'text-[var(--accent)]' : isCurrentMonth ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}
      `}>
        {dayNumber}
      </div>

      {/* Task Count */}
      {totalCount > 0 && (
        <div className="font-mono text-[10px] text-[var(--text-muted)]">
          {completedCount}/{totalCount}
        </div>
      )}

      {/* Priority Dots */}
      {priorities.length > 0 && (
        <div className="flex gap-1 mt-1 flex-wrap">
          {priorities.slice(0, 4).map((priority, index) => (
            <div
              key={index}
              className="w-2 h-2"
              style={{ backgroundColor: priorityColors[priority] }}
            />
          ))}
          {priorities.length > 4 && (
            <span className="font-mono text-[8px] text-[var(--text-muted)]">+{priorities.length - 4}</span>
          )}
        </div>
      )}

      {/* Today Indicator */}
      {isToday && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-[var(--accent)]" />
      )}
    </button>
  );
}
