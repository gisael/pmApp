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
  const [editText, setEditText] = useState(item.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== item.text) {
      onEdit(item.id, trimmed);
    } else {
      setEditText(item.text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditText(item.text);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-3 group py-2 px-3 hover:bg-[var(--bg-elevated)] transition-colors">
      {/* Custom Checkbox */}
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

      {/* Text / Edit Input */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 text-sm bg-transparent border-b border-[var(--accent)] text-[var(--text-primary)] outline-none py-0"
        />
      ) : (
        <span
          onDoubleClick={() => { if (!item.completed) setIsEditing(true); }}
          className={`flex-1 text-sm transition-all cursor-default ${
            item.completed
              ? 'text-[var(--text-muted)] line-through'
              : 'text-[var(--text-primary)]'
          }`}
          title={item.completed ? undefined : 'Double-click to edit'}
        >
          {item.text}
        </span>
      )}

      {/* Edit Button (visible on hover, hidden when editing) */}
      {!isEditing && !item.completed && (
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-all"
          title="Edit"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      )}

      {/* Delete Button */}
      <button
        onClick={() => onDelete(item.id)}
        className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-all"
        title="Delete"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
