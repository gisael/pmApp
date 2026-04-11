'use client';

import { ViewType } from '@/types';

interface ViewSelectorProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const views: { type: ViewType; label: string; icon: React.ReactNode }[] = [
  {
    type: 'kanban',
    label: 'KANBAN',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    type: 'calendar',
    label: 'CALENDAR',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    type: 'weekly',
    label: 'WEEKLY',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    type: 'agenda',
    label: 'AGENDA',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
];

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  return (
    <div className="flex items-center gap-0.5 md:gap-1 bg-[var(--bg-surface)] border border-[var(--border-muted)] p-0.5 md:p-1">
      {views.map((view) => (
        <button
          key={view.type}
          onClick={() => onViewChange(view.type)}
          className={`flex items-center gap-2 px-2 md:px-3 py-1.5 font-mono text-[10px] tracking-wider transition-all ${
            currentView === view.type
              ? 'bg-[var(--bg-elevated)] text-[var(--accent)] border border-[var(--accent)]/30'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] border border-transparent'
          }`}
          title={view.label}
        >
          {view.icon}
          <span className="hidden lg:inline">{view.label}</span>
        </button>
      ))}
    </div>
  );
}
