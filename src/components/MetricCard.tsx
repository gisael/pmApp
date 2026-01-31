'use client';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  accent?: boolean;
}

export function MetricCard({ label, value, subValue, accent = false }: MetricCardProps) {
  return (
    <div className="p-4 border border-[var(--border-muted)] bg-[var(--bg-surface)]">
      <div className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider mb-2">
        {label}
      </div>
      <div className={`font-mono text-2xl font-bold ${accent ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
        {value}
      </div>
      {subValue && (
        <div className="font-mono text-xs text-[var(--text-muted)] mt-1">
          {subValue}
        </div>
      )}
    </div>
  );
}
