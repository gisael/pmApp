'use client';

import { useState, useEffect } from 'react';

interface NotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function Notes({ notes, onNotesChange }: NotesProps) {
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(notes.length);
  }, [notes]);

  return (
    <div className="flex flex-col h-full">
      {/* Character Count */}
      <div className="px-6 py-2 border-b border-[var(--border-muted)] flex items-center justify-between">
        <span className="font-mono text-[10px] text-[var(--text-muted)]">
          {charCount} CHARS
        </span>
        {notes.length > 0 && (
          <button
            onClick={() => onNotesChange('')}
            className="font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Textarea */}
      <div className="flex-1 p-4">
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="// Type your notes here..."
          className="w-full h-full bg-transparent border-none text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none focus:outline-none font-mono leading-relaxed"
          style={{
            caretColor: 'var(--accent)',
          }}
        />
      </div>
    </div>
  );
}
