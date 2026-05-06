'use client';

import { useState, useEffect, useRef } from 'react';
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
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      // Set default due date to today
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setDueDate(`${yyyy}-${mm}-${dd}`);
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
                        ? p === 'urgent'
                          ? 'border-[#ef4444] bg-[#ef4444] text-white'
                          : 'border-[var(--border)] bg-[var(--bg-surface)]'
                        : 'border-[var(--border-muted)] hover:border-[var(--border)]'
                    }`}
                    style={priority === p && p === 'urgent' ? {} : { color: priorityConfig[p].color }}
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
                <div className="relative flex-1">
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      e.target.blur();
                    }}
                    className="input-brutal w-full opacity-0 absolute inset-0 cursor-pointer"
                  />
                  <div
                    onClick={() => dateInputRef.current?.showPicker()}
                    className="input-brutal w-full flex items-center justify-between cursor-pointer"
                  >
                    <span className="text-[var(--text-primary)]">
                      {dueDate
                        ? (() => {
                            const [yyyy, mm, dd] = dueDate.split('-');
                            return `${mm}-${dd}-${yyyy.slice(2)}`;
                          })()
                        : 'MM-DD-YY'}
                    </span>
                    <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
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
