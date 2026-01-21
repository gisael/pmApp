'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, Priority } from '@/types';
import { useState } from 'react';

interface KanbanCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, description?: string, priority?: Priority, dueDate?: string) => void;
  isEditing?: boolean;
  isCollapsed?: boolean;
  onEditingChange?: (id: string | null) => void;
}

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  low: { label: 'LOW', color: 'var(--text-muted)' },
  medium: { label: 'MED', color: 'var(--text-secondary)' },
  high: { label: 'HIGH', color: 'var(--accent)' },
  urgent: { label: 'URGENT', color: '#ef4444' },
};

const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];

export function KanbanCard({ task, onDelete, onEdit, isEditing: externalIsEditing, isCollapsed, onEditingChange }: KanbanCardProps) {
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

  // Collapsed view when another card is being edited
  if (isCollapsed) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="card-brutal px-4 py-2 cursor-grab active:cursor-grabbing opacity-50"
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`card-brutal p-4 cursor-grab active:cursor-grabbing group ${
        isDragging ? 'opacity-50 border-[var(--accent)]' : ''
      } ${dueDateInfo?.isOverdue ? 'border-l-2 border-l-[#ef4444]' : ''}`}
    >
      {/* Header with priority and timestamp */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className="font-mono text-[9px] font-semibold px-1.5 py-0.5 border flex-shrink-0"
            style={{ borderColor: priority.color, color: priority.color }}
          >
            {priority.label}
          </span>
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
        <p className="text-xs text-[var(--text-secondary)] mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-muted)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-[var(--accent)]" />
            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
              {task.status.replace('-', ' ')}
            </span>
          </div>
          {dueDateInfo && (
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
              setIsEditing(true);
            }}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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
