'use client';

interface DateNavigatorProps {
  formattedDate: string;
  isToday: boolean;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onOpenHistory: () => void;
}

export function DateNavigator({
  formattedDate,
  isToday,
  onPrevDay,
  onNextDay,
  onToday,
  onOpenHistory,
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

      <span className="font-mono text-xs text-[var(--text-muted)] tracking-wide min-w-[200px] text-center">
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

      {/* History Button */}
      <button
        onClick={onOpenHistory}
        className="ml-2 w-7 h-7 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded transition-colors"
        aria-label="Browse task history"
        title="Browse task history"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 8V12L15 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.05 11A9 9 0 1 1 3 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 4V11H10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
