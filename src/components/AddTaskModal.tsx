'use client';

import { useState, useEffect } from 'react';
import { Priority } from '@/types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, description?: string, priority?: Priority, dueDate?: string) => void;
}

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  low: { label: 'LOW', color: 'var(--text-muted)' },
  medium: { label: 'MED', color: 'var(--text-secondary)' },
  high: { label: 'HIGH', color: 'var(--accent)' },
  urgent: { label: 'URGENT', color: '#ef4444' },
};

const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];

export function AddTaskModal({ isOpen, onClose, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim(), description.trim() || undefined, priority, dueDate || undefined);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--bg-primary)] border border-[var(--border)] w-full max-w-lg animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-muted)]">
          <h2 className="font-mono text-sm font-semibold tracking-[0.1em] text-[var(--text-primary)]">
            NEW TASK
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Title Field */}
            <div>
              <label className="block font-mono text-[10px] text-[var(--text-muted)] tracking-wider mb-2">
                TITLE *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-brutal w-full"
                placeholder="What needs to be done?"
                autoFocus
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block font-mono text-[10px] text-[var(--text-muted)] tracking-wider mb-2">
                DESCRIPTION
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-brutal w-full resize-none h-24"
                placeholder="Add more details..."
              />
            </div>

            {/* Priority Field */}
            <div>
              <label className="block font-mono text-[10px] text-[var(--text-muted)] tracking-wider mb-2">
                PRIORITY
              </label>
              <div className="flex gap-1">
                {priorities.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 font-mono text-[10px] tracking-wider border transition-all ${
                      priority === p
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

            {/* Due Date Field */}
            <div>
              <label className="block font-mono text-[10px] text-[var(--text-muted)] tracking-wider mb-2">
                DUE DATE
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input-brutal flex-1"
                />
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate('')}
                    className="px-3 text-[var(--text-muted)] hover:text-[var(--accent)] border border-[var(--border-muted)] hover:border-[var(--accent)] transition-all"
                    title="Clear date"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--border-muted)]">
            <button
              type="button"
              onClick={onClose}
              className="btn-brutal flex-1"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="btn-brutal btn-brutal-accent flex-1"
            >
              CREATE TASK
            </button>
          </div>
        </form>

        {/* Keyboard Hint */}
        <div className="px-6 py-3 border-t border-[var(--border-muted)] bg-[var(--bg-surface)]">
          <span className="font-mono text-[10px] text-[var(--text-muted)]">
            PRESS <span className="text-[var(--text-secondary)]">ENTER</span> TO CREATE • <span className="text-[var(--text-secondary)]">ESC</span> TO CLOSE
          </span>
        </div>
      </div>
    </div>
  );
}
