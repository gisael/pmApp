'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus, Priority } from '@/types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string, title: string, description?: string, priority?: Priority, dueDate?: string) => void;
  onTaskClick?: (task: Task) => void;
  onAddTask: () => void;
  isSortedByPriority: boolean;
  onToggleSort: () => void;
  editingTaskId: string | null;
  onEditingChange: (id: string | null) => void;
  subtaskCounts?: Map<string, { completed: number; total: number }>;
}

const statusConfig = {
  'todo': { label: '01', accent: 'var(--text-secondary)' },
  'in-progress': { label: '02', accent: 'var(--accent)' },
  'complete': { label: '03', accent: 'var(--success)' },
};

export function KanbanColumn({
  status,
  title,
  tasks,
  onDeleteTask,
  onEditTask,
  onTaskClick,
  onAddTask,
  isSortedByPriority,
  onToggleSort,
  editingTaskId,
  onEditingChange,
  subtaskCounts,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const config = statusConfig[status];

  return (
    <div className="flex flex-col flex-shrink-0 w-[85vw] md:w-auto md:flex-1 md:min-w-[280px] snap-center">
      {/* Column Header */}
      <div className="flex items-center gap-4 mb-4 pb-3 border-b border-[var(--border-muted)]">
        <span
          className="font-mono text-[10px] font-semibold px-2 py-1 border"
          style={{
            borderColor: config.accent,
            color: config.accent
          }}
        >
          {config.label}
        </span>
        <div className="flex items-center gap-3 flex-1">
          <h3 className="font-mono text-xs font-semibold tracking-[0.1em] text-[var(--text-primary)] uppercase">
            {title}
          </h3>
          <span className="font-mono text-xs text-[var(--text-muted)]">
            [{tasks.length}]
          </span>
        </div>
        {/* Sort Toggle */}
        <button
          onClick={onToggleSort}
          className={`flex items-center gap-1.5 px-2 py-1 font-mono text-[9px] tracking-wider border transition-all ${
            isSortedByPriority
              ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-glow)]'
              : 'border-[var(--border-muted)] text-[var(--text-muted)] hover:border-[var(--border)] hover:text-[var(--text-secondary)]'
          }`}
          title={isSortedByPriority ? 'Showing by priority' : 'Sort by priority'}
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeWidth={1.5}
              d="M3 4h13M3 8h9M3 12h5m4 0l4-4m0 0l4 4m-4-4v12"
            />
          </svg>
          PRI
        </button>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 transition-all duration-200 min-h-[200px] overflow-y-auto ${
          isOver
            ? 'bg-[var(--accent-glow)] border border-[var(--accent)] border-dashed'
            : 'bg-transparent border border-transparent'
        }`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="animate-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <KanbanCard
                  task={task}
                  onDelete={onDeleteTask}
                  onEdit={onEditTask}
                  onClick={onTaskClick}
                  isEditing={editingTaskId === task.id}
                  isCollapsed={editingTaskId !== null && editingTaskId !== task.id}
                  onEditingChange={onEditingChange}
                  subtaskCount={subtaskCounts?.get(task.id)}
                />
              </div>
            ))}
          </div>
        </SortableContext>

        {/* Add Task Button */}
        <button
          onClick={onAddTask}
          className="mt-4 w-full p-3 border border-dashed border-[var(--border-muted)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-200 group"
        >
          <div className="flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4 transition-transform group-hover:rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-mono text-xs tracking-wider uppercase">New Task</span>
          </div>
        </button>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 border border-dashed border-[var(--border-muted)] mt-4">
            <span className="font-mono text-xs text-[var(--text-muted)] tracking-wider">
              DROP HERE
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
