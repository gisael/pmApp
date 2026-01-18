'use client';

import { forwardRef } from 'react';
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

    return (
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
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
            ref={ref}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="input-brutal w-full !pl-10 pr-4 py-2 text-sm"
          />
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
                  ? 'border-[var(--border)] bg-[var(--bg-surface)]'
                  : 'border-[var(--border-muted)] hover:border-[var(--border)]'
              }`}
              style={{ color: priorityConfig[p].color }}
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
