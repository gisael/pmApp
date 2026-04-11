'use client';

import { TodoItem as TodoItemType } from '@/types';

interface TodoItemProps {
  item: TodoItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ item, onToggle, onDelete }: TodoItemProps) {
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

      {/* Text */}
      <span
        className={`flex-1 text-sm transition-all ${
          item.completed
            ? 'text-[var(--text-muted)] line-through'
            : 'text-[var(--text-primary)]'
        }`}
      >
        {item.text}
      </span>

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
