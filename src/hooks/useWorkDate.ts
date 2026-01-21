'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

const LAST_VISITED_DATE_KEY = 'vibe_pm_last_visited_date';

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getToday(): string {
  return formatDate(new Date());
}

export interface UseWorkDateReturn {
  workDate: string;
  today: string;
  isToday: boolean;
  isNewDay: boolean;
  formattedDate: string;
  dayOfWeek: string;
  goToDate: (date: string) => void;
  goToPrevDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
  markDayVisited: () => void;
}

export function useWorkDate(): UseWorkDateReturn {
  const [workDate, setWorkDate] = useState<string>(getToday());
  const [isNewDay, setIsNewDay] = useState(false);

  const today = useMemo(() => getToday(), []);

  // Check if this is a new day on mount
  useEffect(() => {
    const lastVisited = localStorage.getItem(LAST_VISITED_DATE_KEY);
    const currentToday = getToday();

    if (lastVisited && lastVisited < currentToday) {
      setIsNewDay(true);
    }
  }, []);

  const isToday = workDate === today;

  const formattedDate = useMemo(() => {
    const date = parseDate(workDate);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).toUpperCase();
  }, [workDate]);

  const dayOfWeek = useMemo(() => {
    const date = parseDate(workDate);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }, [workDate]);

  const goToDate = useCallback((date: string) => {
    setWorkDate(date);
  }, []);

  const goToPrevDay = useCallback(() => {
    const date = parseDate(workDate);
    date.setDate(date.getDate() - 1);
    setWorkDate(formatDate(date));
  }, [workDate]);

  const goToNextDay = useCallback(() => {
    const date = parseDate(workDate);
    date.setDate(date.getDate() + 1);
    setWorkDate(formatDate(date));
  }, [workDate]);

  const goToToday = useCallback(() => {
    setWorkDate(getToday());
  }, []);

  const markDayVisited = useCallback(() => {
    localStorage.setItem(LAST_VISITED_DATE_KEY, getToday());
    setIsNewDay(false);
  }, []);

  return {
    workDate,
    today,
    isToday,
    isNewDay,
    formattedDate,
    dayOfWeek,
    goToDate,
    goToPrevDay,
    goToNextDay,
    goToToday,
    markDayVisited,
  };
}
