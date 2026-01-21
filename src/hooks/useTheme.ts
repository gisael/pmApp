'use client';

import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem('vibe-pm-theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('vibe-pm-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return [theme, toggleTheme];
}
