'use client';

import { useState, useRef, useEffect } from 'react';
import { TodoItem as TodoItemType } from '@/types';

interface TodoItemProps {
  item: TodoItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

export function TodoItem({ item, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(item.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const startEdit = () => {
    if (item.completed) return;
    setDraft(item.text);
    setIsEditing(true);
  };

  const commitEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== item.text) onEdit(item.id, trimmed);
    else setDraft(item.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') { setDraft(item.text); setIsEditing(false); }
  };

  return (
    <div className="flex items-center gap-3 group py-2 px-3 hover:bg-[var(--bg-elevated)] transition-colors">
      {/* Checkbox */}
      <button
        onClick={() => onToggle(item.id)}
        className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-all ${
          item.completed
            ? 'bg-[var(--accent)] border-[var(--accent)]'
            : 'border-[var(--border-muted)] hover:border-[var(--border)]'
        }`}
      >
        {item.completed && (
          <svg className="w-2.5 h-2.5 text-[var(--bg-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Text / inline edit */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="flex-1 text-sm bg-transparent border-b border-[var(--accent)] text-[var(--text-primary)] outline-none"
        />
      ) : (
        <span
          onDoubleClick={startEdit}
          className={`flex-1 text-sm transition-all select-none ${
            item.completed
              ? 'text-[var(--text-muted)] line-through'
              : 'text-[var(--text-primary)] cursor-text'
          }`}
        >
          {item.text}
        </span>
      )}

      {/* Delete */}
      <button
        onClick={() => onDelete(item.id)}
        className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
        title="Delete"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
