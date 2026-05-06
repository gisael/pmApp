'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Task, Priority } from '@/types';

interface AchievementsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type PeriodFilter = 'month' | 'quarter' | 'year' | 'all';

interface DbTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: string;
  due_date: string | null;
  status: string;
  position: number;
  work_date: string;
  is_achievement: boolean;
  created_at: string;
}

function mapDbTaskToTask(dbTask: DbTask): Task {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description ?? undefined,
    priority: dbTask.priority as Priority,
    dueDate: dbTask.due_date ?? undefined,
    status: dbTask.status as Task['status'],
    position: dbTask.position,
    workDate: dbTask.work_date,
    isAchievement: dbTask.is_achievement ?? false,
    createdAt: new Date(dbTask.created_at).getTime(),
  };
}

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  low: { label: 'LOW', color: 'var(--text-muted)' },
  medium: { label: 'MED', color: 'var(--text-secondary)' },
  high: { label: 'HIGH', color: 'var(--accent)' },
  urgent: { label: 'URGENT', color: '#ef4444' },
};

export function AchievementsPanel({ isOpen, onClose }: AchievementsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [achievements, setAchievements] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  const supabase = createClient();

  const getDateRange = useCallback((period: PeriodFilter): { start: string; end: string } | null => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    switch (period) {
      case 'month': {
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      }
      case 'quarter': {
        const quarterStart = Math.floor(month / 3) * 3;
        const start = new Date(year, quarterStart, 1);
        const end = new Date(year, quarterStart + 3, 0);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      }
      case 'year': {
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      }
      case 'all':
        return null; // No date filtering
    }
  }, []);

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    const dateRange = getDateRange(periodFilter);

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('is_achievement', true);

    if (dateRange) {
      query = query
        .gte('work_date', dateRange.start)
        .lte('work_date', dateRange.end);
    }

    const { data, error } = await query.order('work_date', { ascending: false });

    if (error) {
      console.error('Error fetching achievements:', error);
      // If the column doesn't exist, show a helpful message
      if (error.message?.includes('is_achievement')) {
        console.error('The is_achievement column may not exist in your database. Please run the migration: supabase-migration-achievement.sql');
      }
      setAchievements([]);
    } else {
      setAchievements((data as DbTask[]).map(mapDbTaskToTask));
    }
    setLoading(false);
  }, [supabase, periodFilter, getDateRange]);

  useEffect(() => {
    if (isOpen) {
      fetchAchievements();
    }
  }, [isOpen, fetchAchievements]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
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

  const getPeriodLabel = (period: PeriodFilter) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    switch (period) {
      case 'month':
        return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'quarter': {
        const quarter = Math.floor(month / 3) + 1;
        return `Q${quarter} ${year}`;
      }
      case 'year':
        return year.toString();
      case 'all':
        return 'all time';
    }
  };

  const completedAchievements = achievements.filter(a => a.status === 'complete');
  const inProgressAchievements = achievements.filter(a => a.status !== 'complete');

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div
        ref={panelRef}
        className="w-full max-w-lg h-full bg-[var(--bg-primary)] border-l border-[var(--border)] flex flex-col animate-in slide-in-from-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-muted)]">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-[var(--warning)]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h2 className="font-mono text-sm font-semibold tracking-[0.1em] text-[var(--text-primary)]">
              ACHIEVEMENTS
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

        {/* Period Filter */}
        <div className="px-6 py-4 border-b border-[var(--border-muted)]">
          <div className="flex gap-2">
            {(['month', 'quarter', 'year', 'all'] as PeriodFilter[]).map((period) => (
              <button
                key={period}
                onClick={() => setPeriodFilter(period)}
                className={`flex-1 py-2 font-mono text-[10px] tracking-wider border transition-all ${
                  periodFilter === period
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                    : 'border-[var(--border-muted)] text-[var(--text-muted)] hover:border-[var(--border)]'
                }`}
              >
                {period === 'month' ? 'MONTH' : period === 'quarter' ? 'QUARTER' : period === 'year' ? 'YEAR' : 'ALL'}
              </button>
            ))}
          </div>
          <p className="mt-3 font-mono text-xs text-[var(--text-muted)]">
            Showing achievements for {getPeriodLabel(periodFilter)}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <span className="font-mono text-xs text-[var(--text-muted)]">LOADING...</span>
            </div>
          ) : achievements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 px-6">
              <svg
                className="w-12 h-12 text-[var(--text-muted)] mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <p className="font-mono text-sm text-[var(--text-muted)] text-center">
                No achievements for this period
              </p>
              <p className="font-mono text-xs text-[var(--text-muted)] text-center mt-2">
                Mark tasks as achievements to track your wins
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-[var(--border-muted)] bg-[var(--bg-surface)]">
                  <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider mb-1">COMPLETED</p>
                  <p className="font-mono text-2xl text-[var(--success)]">{completedAchievements.length}</p>
                </div>
                <div className="p-4 border border-[var(--border-muted)] bg-[var(--bg-surface)]">
                  <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider mb-1">IN PROGRESS</p>
                  <p className="font-mono text-2xl text-[var(--accent)]">{inProgressAchievements.length}</p>
                </div>
              </div>

              {/* Completed Achievements */}
              {completedAchievements.length > 0 && (
                <div>
                  <h3 className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider mb-3">
                    COMPLETED ACHIEVEMENTS
                  </h3>
                  <div className="space-y-2">
                    {completedAchievements.map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                </div>
              )}

              {/* In Progress Achievements */}
              {inProgressAchievements.length > 0 && (
                <div>
                  <h3 className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider mb-3">
                    IN PROGRESS
                  </h3>
                  <div className="space-y-2">
                    {inProgressAchievements.map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-muted)] bg-[var(--bg-surface)]">
          <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">
            Use achievements to track wins for annual reviews
          </p>
        </div>
      </div>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Task }) {
  const priority = priorityConfig[achievement.priority] || priorityConfig.medium;
  const isComplete = achievement.status === 'complete';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`p-3 border ${isComplete ? 'border-[var(--success)]/30 bg-[var(--success)]/5' : 'border-[var(--border-muted)]'}`}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <svg
            className="w-4 h-4 text-[var(--warning)] flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <h4 className={`text-sm font-medium leading-tight truncate ${isComplete ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
            {achievement.title}
          </h4>
        </div>
        <span
          className="font-mono text-[9px] font-semibold px-1.5 py-0.5 border flex-shrink-0"
          style={achievement.priority === 'urgent'
            ? { borderColor: priority.color, backgroundColor: priority.color, color: '#fff' }
            : { borderColor: priority.color, color: priority.color }
          }
        >
          {priority.label}
        </span>
      </div>
      {achievement.description && (
        <p className="text-xs text-[var(--text-muted)] mb-2 line-clamp-2">
          {achievement.description}
        </p>
      )}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-[var(--text-muted)]">
          {formatDate(achievement.workDate)}
        </span>
        <span className={`font-mono text-[10px] tracking-wider ${isComplete ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
          {isComplete ? 'DONE' : achievement.status.toUpperCase().replace('-', ' ')}
        </span>
      </div>
    </div>
  );
}
