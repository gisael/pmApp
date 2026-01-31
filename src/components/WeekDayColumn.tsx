'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, Priority } from '@/types';

interface WeekDayColumnProps {
  date: string;
  dayLabel: string;
  isToday: boolean;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

interface WeekTaskCardProps {
  task: Task;
  onClick?: () => void;
}

const priorityColors: Record<Priority, string> = {
  low: 'var(--text-muted)',
  medium: 'var(--text-secondary)',
  high: 'var(--accent)',
  urgent: '#ef4444',
};

function WeekTaskCard({ task, onClick }: WeekTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        p-2 border border-[var(--border-muted)] bg-[var(--bg-surface)] cursor-grab
        hover:border-[var(--border)] transition-all
        ${isDragging ? 'opacity-50 border-[var(--accent)]' : ''}
        ${task.status === 'complete' ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-start gap-2">
        <div
          className="w-2 h-2 mt-1 flex-shrink-0"
          style={{ backgroundColor: priorityColors[task.priority] }}
        />
        <div className="flex-1 min-w-0">
          <h4 className={`font-mono text-xs leading-tight truncate ${
            task.status === 'complete' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
          }`}>
            {task.title}
          </h4>
        </div>
      </div>
    </div>
  );
}

export function WeekDayColumn({ date, dayLabel, isToday, tasks, onTaskClick }: WeekDayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: date,
  });

  const completedCount = tasks.filter((t) => t.status === 'complete').length;
  const totalCount = tasks.length;

  return (
    <div className="flex flex-col min-w-[140px] flex-1">
      {/* Header */}
      <div className={`
        px-2 py-3 text-center border-b border-[var(--border-muted)]
        ${isToday ? 'bg-[var(--accent)]/10 border-b-[var(--accent)]' : ''}
      `}>
        <div className={`
          font-mono text-[10px] font-semibold tracking-wider
          ${isToday ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}
        `}>
          {dayLabel}
        </div>
        <div className={`
          font-mono text-lg font-bold
          ${isToday ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}
        `}>
          {new Date(date + 'T00:00:00').getDate()}
        </div>
        {totalCount > 0 && (
          <div className="font-mono text-[10px] text-[var(--text-muted)] mt-1">
            {completedCount}/{totalCount}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 p-2 space-y-2 overflow-y-auto
          ${isOver ? 'bg-[var(--accent-glow)] border border-[var(--accent)] border-dashed' : 'bg-[var(--bg-primary)]'}
        `}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <WeekTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="h-20 flex items-center justify-center border border-dashed border-[var(--border-muted)]">
            <span className="font-mono text-[10px] text-[var(--text-muted)]">DROP</span>
          </div>
        )}
      </div>
    </div>
  );
}
