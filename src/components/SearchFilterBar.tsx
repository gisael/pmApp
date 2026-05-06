'use client';

import { forwardRef, useRef } from 'react';
import { Priority } from '@/types';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priorityFilter: Priority | 'all';
  onPriorityFilterChange: (priority: Priority | 'all') => void;
}

const priorityConfig: Record<Priority | 'all', { label: string; color: string }> = {
  all: { label: 'ALL', color: 'var(--text-secondary)' },
  low: { label: 'LOW', color: 'var(--text-muted)' },
  medium: { label: 'MED', color: 'var(--text-secondary)' },
  high: { label: 'HIGH', color: 'var(--accent)' },
  urgent: { label: 'URG', color: '#ef4444' },
};

const priorities: (Priority | 'all')[] = ['all', 'low', 'medium', 'high', 'urgent'];

export const SearchFilterBar = forwardRef<HTMLInputElement, SearchFilterBarProps>(
  function SearchFilterBar({ searchQuery, onSearchChange, priorityFilter, onPriorityFilterChange }, ref) {
    const hasActiveFilters = searchQuery || priorityFilter !== 'all';
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape' && searchQuery) {
        e.preventDefault();
        onSearchChange('');
        (e.target as HTMLInputElement).blur();
      }
    };

    return (
      <div className="flex flex-wrap items-center gap-2 md:gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[140px] max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) ref.current = node;
            }}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tasks..."
            className="input-brutal w-full !pl-10 !pr-8 py-2 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => { onSearchChange(''); inputRef.current?.focus(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="Clear search"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1">
          <span className="font-mono text-[9px] text-[var(--text-muted)] tracking-wider mr-2">
            FILTER:
          </span>
          {priorities.map((p) => (
            <button
              key={p}
              onClick={() => onPriorityFilterChange(p)}
              className={`px-2 py-1 font-mono text-[9px] tracking-wider border transition-all ${
                priorityFilter === p
                  ? p === 'urgent'
                    ? 'border-[#ef4444] bg-[#ef4444] text-white'
                    : 'border-[var(--border)] bg-[var(--bg-surface)]'
                  : 'border-[var(--border-muted)] hover:border-[var(--border)]'
              }`}
              style={priorityFilter === p && p === 'urgent' ? {} : { color: priorityConfig[p].color }}
            >
              {priorityConfig[p].label}
            </button>
          ))}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              onSearchChange('');
              onPriorityFilterChange('all');
            }}
            className="flex items-center gap-1.5 px-2 py-1 font-mono text-[9px] tracking-wider text-[var(--text-muted)] hover:text-[var(--accent)] border border-[var(--border-muted)] hover:border-[var(--accent)] transition-all"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            CLEAR
          </button>
        )}
      </div>
    );
  }
);
