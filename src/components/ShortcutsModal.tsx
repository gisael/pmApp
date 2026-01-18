'use client';

import { useEffect } from 'react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: 'N', description: 'Create new task' },
  { key: '/', description: 'Focus search/filter' },
  { key: '?', description: 'Show this help' },
  { key: 'Esc', description: 'Close modals / Cancel' },
];

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--bg-primary)] border border-[var(--border)] w-full max-w-md animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-muted)]">
          <h2 className="font-mono text-sm font-semibold tracking-[0.1em] text-[var(--text-primary)]">
            KEYBOARD SHORTCUTS
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

        {/* Shortcuts List */}
        <div className="p-6">
          <div className="space-y-3">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.key} className="flex items-center justify-between">
                <span className="font-mono text-xs text-[var(--text-secondary)]">
                  {shortcut.description}
                </span>
                <kbd className="font-mono text-xs px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--accent)]">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border-muted)] bg-[var(--bg-surface)]">
          <span className="font-mono text-[10px] text-[var(--text-muted)]">
            PRESS <span className="text-[var(--text-secondary)]">ESC</span> TO CLOSE
          </span>
        </div>
      </div>
    </div>
  );
}
