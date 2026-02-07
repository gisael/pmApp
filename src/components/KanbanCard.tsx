'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, Priority } from '@/types';
import { useState } from 'react';

interface KanbanCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, description?: string, priority?: Priority, dueDate?: string) => void;
  onClick?: (task: Task) => void;
  isEditing?: boolean;
  isCollapsed?: boolean;
  onEditingChange?: (id: string | null) => void;
  subtaskCount?: { completed: number; total: number };
}

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  low: { label: 'LOW', color: 'var(--text-muted)' },
  medium: { label: 'MED', color: 'var(--text-secondary)' },
  high: { label: 'HIGH', color: 'var(--accent)' },
  urgent: { label: 'URGENT', color: '#ef4444' },
};

const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];

export function KanbanCard({ task, onDelete, onEdit, onClick, isEditing: externalIsEditing, isCollapsed, onEditingChange, subtaskCount }: KanbanCardProps) {
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState<Priority>(task.priority || 'medium');
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '');

  // Use external editing state if provided, otherwise use internal
  const isEditing = externalIsEditing ?? internalIsEditing;
  const setIsEditing = (editing: boolean) => {
    setInternalIsEditing(editing);
    onEditingChange?.(editing ? task.id : null);
  };

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

  const handleSave = () => {
    if (editTitle.trim()) {
      onEdit(task.id, editTitle.trim(), editDescription.trim() || undefined, editPriority, editDueDate || undefined);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setEditPriority(task.priority || 'medium');
      setEditDueDate(task.dueDate || '');
      setIsEditing(false);
    }
  };

  const timeAgo = () => {
    const diff = Date.now() - task.createdAt;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  };

  const getDueDateInfo = () => {
    if (!task.dueDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate + 'T00:00:00');
    const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `${Math.abs(diffDays)}d overdue`, isOverdue: true, isDueSoon: false };
    }
    if (diffDays === 0) {
      return { label: 'Due today', isOverdue: false, isDueSoon: true };
    }
    if (diffDays === 1) {
      return { label: 'Due tomorrow', isOverdue: false, isDueSoon: true };
    }
    if (diffDays <= 3) {
      return { label: `Due in ${diffDays}d`, isOverdue: false, isDueSoon: true };
    }
    return { label: `Due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, isOverdue: false, isDueSoon: false };
  };

  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const dueDateInfo = getDueDateInfo();
  const isDueToday = task.dueDate && task.workDate === task.dueDate;

  // Collapsed view when another card is being edited
  if (isCollapsed) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="card-brutal px-3 py-1.5 cursor-grab active:cursor-grabbing opacity-50"
      >
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[9px] font-semibold px-1.5 py-0.5 border flex-shrink-0"
            style={{ borderColor: priority.color, color: priority.color }}
          >
            {priority.label}
          </span>
          <h4 className="text-sm text-[var(--text-secondary)] truncate">
            {task.title}
          </h4>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-[var(--bg-elevated)] border border-[var(--border)] p-4"
      >
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input-brutal w-full mb-3"
          autoFocus
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add description..."
          className="input-brutal w-full resize-none h-20 mb-3"
        />

        {/* Priority Selector */}
        <div className="mb-3">
          <label className="block font-mono text-[10px] text-[var(--text-muted)] tracking-wider mb-2">
            PRIORITY
          </label>
          <div className="flex gap-1">
            {priorities.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setEditPriority(p)}
                className={`flex-1 py-1.5 font-mono text-[10px] tracking-wider border transition-all ${
                  editPriority === p
                    ? 'border-[var(--border)] bg-[var(--bg-surface)]'
                    : 'border-[var(--border-muted)] hover:border-[var(--border)]'
                }`}
                style={{ color: priorityConfig[p].color }}
              >
                {priorityConfig[p].label}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date */}
        <div className="mb-3">
          <label className="block font-mono text-[10px] text-[var(--text-muted)] tracking-wider mb-2">
            DUE DATE
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="input-brutal flex-1"
            />
            {editDueDate && (
              <button
                type="button"
                onClick={() => setEditDueDate('')}
                className="px-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                title="Clear date"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditTitle(task.title);
              setEditDescription(task.description || '');
              setEditPriority(task.priority || 'medium');
              setEditDueDate(task.dueDate || '');
              setIsEditing(false);
            }}
            className="btn-brutal flex-1"
          >
            Cancel
          </button>
          <button onClick={handleSave} className="btn-brutal btn-brutal-accent flex-1">
            Save
          </button>
        </div>
      </div>
    );
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger click when clicking action buttons or when editing
    if ((e.target as HTMLElement).closest('button')) return;
    if (!isEditing) {
      // Click on card enables inline editing
      setIsEditing(true);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
      className={`card-brutal px-3 py-2 cursor-grab active:cursor-grabbing group ${
        isDragging ? 'opacity-50 border-[var(--accent)]' : ''
      } ${dueDateInfo?.isOverdue ? 'border-l-2 border-l-[#ef4444]' : ''} ${
        isDueToday && !dueDateInfo?.isOverdue ? 'ring-2 ring-[var(--warning)] ring-inset' : ''
      }`}
    >
      {/* Header with priority and timestamp */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className="font-mono text-[9px] font-semibold px-1.5 py-0.5 border flex-shrink-0"
            style={{ borderColor: priority.color, color: priority.color }}
          >
            {priority.label}
          </span>
          {task.isAchievement && (
            <svg
              className="w-3.5 h-3.5 text-[var(--warning)] flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          )}
          <h4 className="text-sm font-medium text-[var(--text-primary)] leading-tight truncate">
            {task.title}
          </h4>
        </div>
        <span className="font-mono text-[10px] text-[var(--text-muted)] flex-shrink-0">
          {timeAgo()}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-[var(--text-secondary)] mb-1.5 line-clamp-2 leading-snug">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[var(--border-muted)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-[var(--accent)]" />
            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
              {task.status.replace('-', ' ')}
            </span>
          </div>
          {subtaskCount && subtaskCount.total > 0 && (
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className={`font-mono text-[10px] tracking-wider ${
                subtaskCount.completed === subtaskCount.total
                  ? 'text-[var(--success)]'
                  : 'text-[var(--text-muted)]'
              }`}>
                {subtaskCount.completed}/{subtaskCount.total}
              </span>
            </div>
          )}
          {isDueToday && !dueDateInfo?.isOverdue && (
            <span className="font-mono text-[10px] tracking-wider text-[var(--warning)] font-semibold animate-pulse">
              DUE TODAY
            </span>
          )}
          {dueDateInfo && !isDueToday && (
            <span
              className={`font-mono text-[10px] tracking-wider ${
                dueDateInfo.isOverdue
                  ? 'text-[#ef4444]'
                  : dueDateInfo.isDueSoon
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              {dueDateInfo.label.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(task);
            }}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
            title="Open details"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)] transition-all"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
