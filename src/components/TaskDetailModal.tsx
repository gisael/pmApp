'use client';

import { useEffect, useRef, useState } from 'react';
import { Task, Priority, TaskStatus } from '@/types';
import { useSubtasks } from '@/hooks/useSubtasks';
import { SubtaskList } from './SubtaskList';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string, title: string, description?: string, priority?: Priority, dueDate?: string, isAchievement?: boolean) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  // Create mode props
  mode?: 'edit' | 'create';
  onCreate?: (title: string, description?: string, priority?: Priority, dueDate?: string, status?: TaskStatus, isAchievement?: boolean, subtasks?: string[]) => void;
  initialStatus?: TaskStatus;
}

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  low: { label: 'LOW', color: 'var(--text-muted)' },
  medium: { label: 'MED', color: 'var(--text-secondary)' },
  high: { label: 'HIGH', color: 'var(--accent)' },
  urgent: { label: 'URGENT', color: '#ef4444' },
};

const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];
const statuses: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'BACKLOG' },
  { value: 'in-progress', label: 'IN PROGRESS' },
  { value: 'complete', label: 'DONE' },
];

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  mode = 'edit',
  onCreate,
  initialStatus = 'todo'
}: TaskDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [createPriority, setCreatePriority] = useState<Priority>('medium');
  const [createStatus, setCreateStatus] = useState<TaskStatus>(initialStatus);
  const [createDueDate, setCreateDueDate] = useState('');
  const [isAchievement, setIsAchievement] = useState(false);
  const [pendingSubtasks, setPendingSubtasks] = useState<string[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const subtaskInputRef = useRef<HTMLInputElement>(null);

  const isCreateMode = mode === 'create';

  const {
    subtasks,
    loading: subtasksLoading,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    updateSubtask,
    completedCount,
    totalCount,
  } = useSubtasks(task?.id ?? null);

  // Reset editing states when task changes or modal opens
  useEffect(() => {
    if (isCreateMode && isOpen) {
      // Create mode: reset to defaults
      setEditTitle('');
      setEditDescription('');
      setCreatePriority('medium');
      setCreateStatus(initialStatus);
      setIsAchievement(false);
      setPendingSubtasks([]);
      setNewSubtaskInput('');
      // Set default due date to today
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setCreateDueDate(`${yyyy}-${mm}-${dd}`);
      setIsEditingTitle(true); // Auto-focus title in create mode
      // Focus the title input after a short delay
      setTimeout(() => titleInputRef.current?.focus(), 100);
    } else if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setIsAchievement(task.isAchievement || false);
      setIsEditingTitle(false);
      setIsEditingDescription(false);
    }
  }, [task, isOpen, isCreateMode, initialStatus]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || (!task && !isCreateMode)) return null;

  const handleSaveTitle = () => {
    if (isCreateMode) {
      setIsEditingTitle(false);
      return;
    }
    if (task && editTitle.trim() && editTitle !== task.title) {
      onEdit(task.id, editTitle.trim(), task.description, task.priority, task.dueDate, task.isAchievement);
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    if (isCreateMode) {
      setIsEditingDescription(false);
      return;
    }
    if (task && editDescription !== (task.description || '')) {
      onEdit(task.id, task.title, editDescription.trim() || undefined, task.priority, task.dueDate, task.isAchievement);
    }
    setIsEditingDescription(false);
  };

  const handlePriorityChange = (priority: Priority) => {
    if (isCreateMode) {
      setCreatePriority(priority);
    } else if (task) {
      onEdit(task.id, task.title, task.description, priority, task.dueDate, task.isAchievement);
    }
  };

  const handleDueDateChange = (dueDate: string) => {
    if (isCreateMode) {
      setCreateDueDate(dueDate);
    } else if (task) {
      onEdit(task.id, task.title, task.description, task.priority, dueDate || undefined, task.isAchievement);
    }
  };

  const handleAchievementToggle = () => {
    if (isCreateMode) {
      setIsAchievement(!isAchievement);
    } else if (task) {
      onEdit(task.id, task.title, task.description, task.priority, task.dueDate, !task.isAchievement);
    }
  };

  const handleStatusChange = (status: TaskStatus) => {
    if (isCreateMode) {
      setCreateStatus(status);
    } else if (task) {
      onStatusChange(task.id, status);
    }
  };

  const handleCreate = () => {
    if (isCreateMode && editTitle.trim() && onCreate) {
      const subtasksToCreate = newSubtaskInput.trim()
        ? [...pendingSubtasks, newSubtaskInput.trim()]
        : pendingSubtasks;
      onCreate(editTitle.trim(), editDescription.trim() || undefined, createPriority, createDueDate || undefined, createStatus, isAchievement, subtasksToCreate.length > 0 ? subtasksToCreate : undefined);
      onClose();
    }
  };

  const handleAddPendingSubtask = () => {
    if (newSubtaskInput.trim()) {
      setPendingSubtasks((prev) => [...prev, newSubtaskInput.trim()]);
      setNewSubtaskInput('');
      setTimeout(() => subtaskInputRef.current?.focus(), 0);
    }
  };

  const handleRemovePendingSubtask = (index: number) => {
    setPendingSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  const getDueDateInfo = () => {
    const dueDateToCheck = isCreateMode ? createDueDate : task?.dueDate;
    if (!dueDateToCheck) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateToCheck + 'T00:00:00');
    const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `${Math.abs(diffDays)} days overdue`, isOverdue: true, isDueSoon: false };
    }
    if (diffDays === 0) {
      return { label: 'Due today', isOverdue: false, isDueSoon: true };
    }
    if (diffDays === 1) {
      return { label: 'Due tomorrow', isOverdue: false, isDueSoon: true };
    }
    return { label: `Due in ${diffDays} days`, isOverdue: false, isDueSoon: diffDays <= 3 };
  };

  const dueDateInfo = getDueDateInfo();
  const currentPriority = isCreateMode ? createPriority : (task?.priority || 'medium');
  const currentStatus = isCreateMode ? createStatus : (task?.status || 'todo');
  const currentDueDate = isCreateMode ? createDueDate : (task?.dueDate || '');
  const priority = priorityConfig[currentPriority];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-black/60 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-[var(--bg-primary)] border border-[var(--border)] w-full max-w-2xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col rounded-t-lg md:rounded-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-muted)]">
          <div className="flex items-center gap-3">
            {isCreateMode ? (
              <span className="font-mono text-sm font-semibold tracking-[0.1em] text-[var(--text-primary)]">
                NEW TASK
              </span>
            ) : (
              <>
                <span
                  className="font-mono text-[10px] font-semibold px-2 py-1 border"
                  style={{ borderColor: priority.color, color: priority.color }}
                >
                  {priority.label}
                </span>
                <span className="font-mono text-xs text-[var(--text-muted)] uppercase">
                  {currentStatus.replace('-', ' ')}
                </span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div>
            {isEditingTitle || isCreateMode ? (
              <input
                ref={titleInputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={isCreateMode ? undefined : handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (isCreateMode) {
                      handleCreate();
                    } else {
                      handleSaveTitle();
                    }
                  }
                  if (e.key === 'Escape') {
                    if (isCreateMode) {
                      onClose();
                    } else {
                      setEditTitle(task?.title || '');
                      setIsEditingTitle(false);
                    }
                  }
                }}
                placeholder={isCreateMode ? "What needs to be done?" : undefined}
                className={`w-full bg-transparent text-xl font-medium text-[var(--text-primary)] outline-none pb-1 ${
                  isCreateMode ? 'border-b border-[var(--border-muted)] focus:border-[var(--accent)]' : 'border-b border-[var(--accent)]'
                }`}
                autoFocus
              />
            ) : task ? (
              <h2
                className="text-xl font-medium text-[var(--text-primary)] cursor-pointer hover:text-[var(--accent)] transition-colors"
                onClick={() => setIsEditingTitle(true)}
              >
                {task.title}
              </h2>
            ) : null}
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono text-[10px] text-[var(--text-muted)] tracking-wider mb-2">
              DESCRIPTION
            </label>
            {isEditingDescription || isCreateMode ? (
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onBlur={isCreateMode ? undefined : handleSaveDescription}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' && !isCreateMode) {
                    setEditDescription(task?.description || '');
                    setIsEditingDescription(false);
                  }
                }}
                placeholder="Add more details..."
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-muted)] p-3 font-mono text-sm text-[var(--text-primary)] resize-none h-24 outline-none focus:border-[var(--accent)]"
                autoFocus={!isCreateMode}
              />
            ) : (
              <div
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-muted)] p-3 min-h-[60px] cursor-pointer hover:border-[var(--border)] transition-colors"
                onClick={() => setIsEditingDescription(true)}
              >
                {task?.description ? (
                  <p className="font-mono text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                    {task.description}
                  </p>
                ) : (
                  <p className="font-mono text-sm text-[var(--text-muted)]">
                    Click to add description...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Subtasks/Checklist */}
          {isCreateMode ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">
                  CHECKLIST
                </label>
                {pendingSubtasks.length > 0 && (
                  <span className="font-mono text-xs text-[var(--text-muted)]">
                    {pendingSubtasks.length} item{pendingSubtasks.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="border border-[var(--border-muted)] divide-y divide-[var(--border-muted)]">
                {pendingSubtasks.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 py-2 px-3">
                    <div className="w-4 h-4 border border-dashed border-[var(--border-muted)] flex-shrink-0" />
                    <span className="flex-1 font-mono text-sm text-[var(--text-primary)]">{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePendingSubtask(index)}
                      className="text-[var(--text-muted)] hover:text-[#ef4444] transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-3 py-2 px-3">
                  <div className="w-4 h-4 border border-dashed border-[var(--border-muted)] flex-shrink-0" />
                  <input
                    ref={subtaskInputRef}
                    type="text"
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPendingSubtask();
                      }
                    }}
                    placeholder="Add checklist item..."
                    className="flex-1 bg-transparent font-mono text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
                  />
                  {newSubtaskInput.trim() && (
                    <button
                      type="button"
                      onClick={handleAddPendingSubtask}
                      className="font-mono text-xs text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      ADD
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <SubtaskList
              subtasks={subtasks}
              loading={subtasksLoading}
              onAdd={addSubtask}
              onToggle={toggleSubtask}
              onDelete={deleteSubtask}
              onUpdate={updateSubtask}
              completedCount={completedCount}
              totalCount={totalCount}
            />
          )}

          {/* Properties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block font-mono text-[10px] text-[var(--text-muted)] tracking-wider mb-2">
                STATUS
              </label>
              <div className="flex gap-1">
                {statuses.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => handleStatusChange(s.value)}
                    className={`flex-1 py-2 font-mono text-[10px] tracking-wider border transition-all ${
                      currentStatus === s.value
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'border-[var(--border-muted)] text-[var(--text-muted)] hover:border-[var(--border)]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block font-mono text-[10px] text-[var(--text-muted)] tracking-wider mb-2">
                PRIORITY
              </label>
              <div className="flex gap-1">
                {priorities.map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePriorityChange(p)}
                    className={`flex-1 py-2 font-mono text-[10px] tracking-wider border transition-all ${
                      currentPriority === p
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
          </div>

          {/* Due Date */}
          <div>
            <label className="block font-mono text-[10px] text-[var(--text-muted)] tracking-wider mb-2">
              DUE DATE
            </label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={currentDueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="input-brutal flex-1"
              />
              {currentDueDate && (
                <>
                  <button
                    onClick={() => handleDueDateChange('')}
                    className="px-3 py-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors border border-[var(--border-muted)]"
                    title="Clear date"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {dueDateInfo && (
                    <span
                      className={`font-mono text-xs ${
                        dueDateInfo.isOverdue
                          ? 'text-[#ef4444]'
                          : dueDateInfo.isDueSoon
                          ? 'text-[var(--accent)]'
                          : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {dueDateInfo.label}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Achievement Toggle */}
          <div>
            <button
              type="button"
              onClick={handleAchievementToggle}
              className={`w-full flex items-center gap-3 px-4 py-3 border transition-all ${
                (isCreateMode ? isAchievement : task?.isAchievement)
                  ? 'border-[var(--warning)] bg-[var(--warning)]/10'
                  : 'border-[var(--border-muted)] hover:border-[var(--border)]'
              }`}
            >
              <svg
                className={`w-5 h-5 ${
                  (isCreateMode ? isAchievement : task?.isAchievement)
                    ? 'text-[var(--warning)]'
                    : 'text-[var(--text-muted)]'
                }`}
                fill={(isCreateMode ? isAchievement : task?.isAchievement) ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <span
                className={`font-mono text-xs tracking-wider ${
                  (isCreateMode ? isAchievement : task?.isAchievement)
                    ? 'text-[var(--warning)]'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                {(isCreateMode ? isAchievement : task?.isAchievement) ? 'MARKED AS ACHIEVEMENT' : 'MARK AS ACHIEVEMENT'}
              </span>
            </button>
          </div>

          {/* Metadata - only show for existing tasks */}
          {!isCreateMode && task && (
            <div className="pt-4 border-t border-[var(--border-muted)]">
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span className="font-mono text-[10px]">
                  CREATED {new Date(task.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="font-mono text-[10px]">
                  WORK DATE: {task.workDate}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-muted)] bg-[var(--bg-surface)]">
          {isCreateMode ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 font-mono text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleCreate}
                disabled={!editTitle.trim()}
                className="px-6 py-2 font-mono text-xs text-[var(--text-primary)] bg-[var(--accent)] hover:bg-[var(--accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                CREATE TASK
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  if (task) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 font-mono text-xs text-[var(--text-muted)] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all border border-[var(--border-muted)] hover:border-[#ef4444]/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                DELETE TASK
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 font-mono text-xs text-[var(--text-primary)] bg-[var(--accent)] hover:bg-[var(--accent)]/90 transition-all"
              >
                CLOSE
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
