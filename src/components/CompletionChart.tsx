'use client';

import { DailyMetrics } from '@/types';

interface CompletionChartProps {
  data: DailyMetrics[];
  period: 'week' | 'month';
}

export function CompletionChart({ data, period }: CompletionChartProps) {
  // Find max value for scaling
  const maxValue = Math.max(...data.map((d) => Math.max(d.total, d.completed)), 1);

  // Chart dimensions
  const chartHeight = 120;
  const barWidth = period === 'week' ? 32 : 8;
  const gap = period === 'week' ? 8 : 2;
  const chartWidth = data.length * (barWidth + gap);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    if (period === 'week') {
      return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    }
    return date.getDate().toString();
  };

  return (
    <div className="space-y-3">
      <div className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">
        DAILY COMPLETIONS
      </div>
      <div className="overflow-x-auto pb-2">
        <svg
          width={chartWidth}
          height={chartHeight + 24}
          className="min-w-full"
          style={{ minWidth: chartWidth }}
        >
          {/* Grid lines */}
          {[0, 0.5, 1].map((ratio) => (
            <line
              key={ratio}
              x1={0}
              y1={chartHeight * (1 - ratio)}
              x2={chartWidth}
              y2={chartHeight * (1 - ratio)}
              stroke="var(--border-muted)"
              strokeWidth={1}
              strokeDasharray={ratio === 0 ? 'none' : '4,4'}
            />
          ))}

          {/* Bars */}
          {data.map((day, index) => {
            const x = index * (barWidth + gap);
            const totalHeight = (day.total / maxValue) * chartHeight;
            const completedHeight = (day.completed / maxValue) * chartHeight;

            return (
              <g key={day.date}>
                {/* Total bar (background) */}
                <rect
                  x={x}
                  y={chartHeight - totalHeight}
                  width={barWidth}
                  height={totalHeight}
                  fill="var(--border-muted)"
                />
                {/* Completed bar (foreground) */}
                <rect
                  x={x}
                  y={chartHeight - completedHeight}
                  width={barWidth}
                  height={completedHeight}
                  fill="var(--accent)"
                />
                {/* Date label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  className="font-mono"
                  style={{ fontSize: period === 'week' ? 10 : 8 }}
                  fill="var(--text-muted)"
                >
                  {formatDate(day.date)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[var(--border-muted)]" />
          <span className="font-mono text-[10px] text-[var(--text-muted)]">TOTAL</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[var(--accent)]" />
          <span className="font-mono text-[10px] text-[var(--text-muted)]">COMPLETED</span>
        </div>
      </div>
    </div>
  );
}
