'use client';

import { useState, useEffect, useRef } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { MetricCard } from './MetricCard';
import { CompletionChart } from './CompletionChart';
import { PriorityBreakdown } from './PriorityBreakdown';

interface AnalyticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type Period = 'week' | 'month';

export function AnalyticsPanel({ isOpen, onClose }: AnalyticsPanelProps) {
  const [period, setPeriod] = useState<Period>('week');
  const panelRef = useRef<HTMLDivElement>(null);
  const { analytics, loading, avgTasksPerDay, avgCompletedPerDay } = useAnalytics(period);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div
        ref={panelRef}
        className="absolute top-0 right-0 h-full w-full max-w-lg bg-[var(--bg-primary)] border-l border-[var(--border)] shadow-2xl animate-in overflow-hidden flex flex-col"
        style={{ '--tw-enter-translate-x': '100%' } as React.CSSProperties}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-muted)]">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="font-mono text-sm font-semibold tracking-[0.1em] text-[var(--text-primary)]">
              ANALYTICS
            </h2>
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

        {/* Period Toggle */}
        <div className="px-6 py-4 border-b border-[var(--border-muted)]">
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('week')}
              className={`flex-1 py-2 font-mono text-xs tracking-wider border transition-all ${
                period === 'week'
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'border-[var(--border-muted)] text-[var(--text-muted)] hover:border-[var(--border)]'
              }`}
            >
              THIS WEEK
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`flex-1 py-2 font-mono text-xs tracking-wider border transition-all ${
                period === 'month'
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'border-[var(--border-muted)] text-[var(--text-muted)] hover:border-[var(--border)]'
              }`}
            >
              THIS MONTH
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <span className="font-mono text-xs text-[var(--text-muted)] tracking-wider">
                LOADING ANALYTICS...
              </span>
            </div>
          ) : analytics ? (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-2 gap-4">
                <MetricCard
                  label="TOTAL TASKS"
                  value={analytics.totalTasks}
                  subValue={`~${avgTasksPerDay}/day`}
                />
                <MetricCard
                  label="COMPLETED"
                  value={analytics.completedTasks}
                  subValue={`~${avgCompletedPerDay}/day`}
                  accent
                />
                <MetricCard
                  label="COMPLETION RATE"
                  value={`${analytics.completionRate}%`}
                />
                <MetricCard
                  label="DAYS TRACKED"
                  value={analytics.dailyBreakdown.length}
                />
              </div>

              {/* Completion Chart */}
              <div className="border border-[var(--border-muted)] p-4 bg-[var(--bg-surface)]">
                <CompletionChart data={analytics.dailyBreakdown} period={period} />
              </div>

              {/* Priority Breakdown */}
              <div className="border border-[var(--border-muted)] p-4 bg-[var(--bg-surface)]">
                <PriorityBreakdown data={analytics.tasksByPriority} />
              </div>

              {/* Date Range */}
              <div className="text-center">
                <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">
                  {new Date(analytics.start + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                  {' - '}
                  {new Date(analytics.end + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48">
              <span className="font-mono text-xs text-[var(--text-muted)] tracking-wider">
                NO DATA AVAILABLE
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
