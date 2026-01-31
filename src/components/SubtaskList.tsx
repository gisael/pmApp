'use client';

import { useState } from 'react';
import { Subtask } from '@/types';
import { SubtaskItem } from './SubtaskItem';

interface SubtaskListProps {
  subtasks: Subtask[];
  loading: boolean;
  onAdd: (title: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, title: string) => void;
  completedCount: number;
  totalCount: number;
}

export function SubtaskList({
  subtasks,
  loading,
  onAdd,
  onToggle,
  onDelete,
  onUpdate,
  completedCount,
  totalCount,
}: SubtaskListProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onAdd(newSubtaskTitle.trim());
      setNewSubtaskTitle('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-mono text-xs font-semibold tracking-[0.15em] text-[var(--text-secondary)]">
          CHECKLIST
        </h4>
        {totalCount > 0 && (
          <span className="font-mono text-xs text-[var(--text-muted)]">
            {completedCount}/{totalCount}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="h-1 bg-[var(--bg-surface)] border border-[var(--border-muted)]">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      )}

      {/* Subtask list */}
      {loading ? (
        <div className="py-4 text-center">
          <span className="font-mono text-xs text-[var(--text-muted)]">LOADING...</span>
        </div>
      ) : (
        <div className="border border-[var(--border-muted)] divide-y divide-[var(--border-muted)]">
          {subtasks.map((subtask) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}

          {/* Add new subtask input */}
          <div className="flex items-center gap-3 py-2 px-3">
            <div className="w-4 h-4 border border-dashed border-[var(--border-muted)] flex-shrink-0" />
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add checklist item..."
              className="flex-1 bg-transparent font-mono text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
            />
            {newSubtaskTitle.trim() && (
              <button
                onClick={handleAddSubtask}
                className="font-mono text-xs text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors"
              >
                ADD
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
