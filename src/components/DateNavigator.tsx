'use client';

interface DateNavigatorProps {
  formattedDate: string;
  isToday: boolean;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

export function DateNavigator({
  formattedDate,
  isToday,
  onPrevDay,
  onNextDay,
  onToday,
}: DateNavigatorProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPrevDay}
        className="w-6 h-6 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded transition-colors"
        aria-label="Previous day"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 2L4 6L8 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <span className="font-mono text-xs text-[var(--text-muted)] tracking-wide min-w-0 w-[120px] lg:w-[200px] text-center truncate">
        {formattedDate}
      </span>

      <button
        onClick={onNextDay}
        className="w-6 h-6 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded transition-colors"
        aria-label="Next day"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 2L8 6L4 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {!isToday && (
        <button
          onClick={onToday}
          className="ml-2 px-2 py-1 font-mono text-[10px] tracking-wider text-[var(--accent)] border border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg-primary)] rounded transition-colors"
        >
          TODAY
        </button>
      )}

    </div>
  );
}
