import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsConfig {
  onNewTask?: () => void;
  onFocusSearch?: () => void;
  onShowHelp?: () => void;
}

export function useKeyboardShortcuts({
  onNewTask,
  onFocusSearch,
  onShowHelp,
}: KeyboardShortcutsConfig) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isInputField) return;

      // Don't trigger if modifier keys are pressed (except shift for ?)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          onNewTask?.();
          break;
        case '/':
          e.preventDefault();
          onFocusSearch?.();
          break;
        case '?':
          e.preventDefault();
          onShowHelp?.();
          break;
      }
    },
    [onNewTask, onFocusSearch, onShowHelp]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
