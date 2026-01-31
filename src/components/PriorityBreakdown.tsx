'use client';

import { Priority } from '@/types';

interface PriorityBreakdownProps {
  data: Record<Priority, number>;
}

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  low: { label: 'LOW', color: 'var(--text-muted)' },
  medium: { label: 'MEDIUM', color: 'var(--text-secondary)' },
  high: { label: 'HIGH', color: 'var(--accent)' },
  urgent: { label: 'URGENT', color: '#ef4444' },
};

const priorities: Priority[] = ['urgent', 'high', 'medium', 'low'];

export function PriorityBreakdown({ data }: PriorityBreakdownProps) {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  const maxCount = Math.max(...Object.values(data), 1);

  return (
    <div className="space-y-3">
      <div className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">
        TASKS BY PRIORITY
      </div>
      <div className="space-y-2">
        {priorities.map((priority) => {
          const count = data[priority];
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          const barWidth = (count / maxCount) * 100;
          const config = priorityConfig[priority];

          return (
            <div key={priority} className="space-y-1">
              <div className="flex items-center justify-between">
                <span
                  className="font-mono text-[10px] font-semibold tracking-wider"
                  style={{ color: config.color }}
                >
                  {config.label}
                </span>
                <span className="font-mono text-[10px] text-[var(--text-muted)]">
                  {count} ({percentage}%)
                </span>
              </div>
              <div className="h-2 bg-[var(--bg-elevated)] border border-[var(--border-muted)]">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: config.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
