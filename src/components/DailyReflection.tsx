'use client';

import { useState, useEffect } from 'react';

interface DailyReflectionProps {
  reflection: string;
  onReflectionChange: (reflection: string) => void;
}

export function DailyReflection({ reflection, onReflectionChange }: DailyReflectionProps) {
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(reflection.length);
  }, [reflection]);

  return (
    <div className="flex flex-col h-full">
      {/* Character Count */}
      <div className="px-6 py-2 border-b border-[var(--border-muted)] flex items-center justify-between">
        <span className="font-mono text-[10px] text-[var(--text-muted)]">
          {charCount} CHARS
        </span>
        {reflection.length > 0 && (
          <button
            onClick={() => onReflectionChange('')}
            className="font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Textarea */}
      <div className="flex-1 p-4">
        <textarea
          value={reflection}
          onChange={(e) => onReflectionChange(e.target.value)}
          placeholder="// What did you accomplish today? What's on your mind?"
          className="w-full h-full bg-transparent border-none text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none focus:outline-none font-mono leading-relaxed"
          style={{
            caretColor: 'var(--accent)',
          }}
        />
      </div>
    </div>
  );
}
