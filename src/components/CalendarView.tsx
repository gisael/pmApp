'use client';

import { useState, useMemo } from 'react';
import { useTasksRange } from '@/hooks/useTasksRange';
import { CalendarDayCell } from './CalendarDayCell';

interface CalendarViewProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function getMonthDays(year: number, month: number): { date: string; dayNumber: number; isCurrentMonth: boolean }[] {
  const days: { date: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

  // First day of the month
  const firstDay = new Date(year, month, 1);
  const startingDayOfWeek = firstDay.getDay();

  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(year, month - 1, day);
    days.push({
      date: date.toISOString().split('T')[0],
      dayNumber: day,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({
      date: date.toISOString().split('T')[0],
      dayNumber: day,
      isCurrentMonth: true,
    });
  }

  // Next month days to complete the grid (6 rows = 42 cells)
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    days.push({
      date: date.toISOString().split('T')[0],
      dayNumber: day,
      isCurrentMonth: false,
    });
  }

  return days;
}

export function CalendarView({ selectedDate, onDateSelect }: CalendarViewProps) {
  const today = new Date().toISOString().split('T')[0];
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const days = useMemo(
    () => getMonthDays(viewDate.year, viewDate.month),
    [viewDate.year, viewDate.month]
  );

  // Get date range for fetching tasks
  const startDate = days[0].date;
  const endDate = days[days.length - 1].date;
  const { tasksByDate, loading } = useTasksRange(startDate, endDate);

  const monthName = new Date(viewDate.year, viewDate.month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const goToPrevMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const goToNextMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  const goToToday = () => {
    const now = new Date();
    setViewDate({ year: now.getFullYear(), month: now.getMonth() });
    onDateSelect(today);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-muted)]">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPrevMonth}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="font-mono text-sm font-semibold tracking-wider text-[var(--text-primary)] min-w-[180px] text-center uppercase">
            {monthName}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-3 py-1.5 font-mono text-[10px] tracking-wider border border-[var(--border-muted)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
        >
          TODAY
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-4 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="font-mono text-xs text-[var(--text-muted)] tracking-wider">
              LOADING CALENDAR...
            </span>
          </div>
        ) : (
          <>
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="p-2 text-center font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)]"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => (
                <CalendarDayCell
                  key={day.date}
                  date={day.date}
                  dayNumber={day.dayNumber}
                  isCurrentMonth={day.isCurrentMonth}
                  isToday={day.date === today}
                  isSelected={day.date === selectedDate}
                  tasks={tasksByDate.get(day.date) || []}
                  onClick={() => onDateSelect(day.date)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer Legend */}
      <div className="px-4 py-2 border-t border-[var(--border-muted)]">
        <div className="flex items-center justify-center gap-4">
          <span className="font-mono text-[10px] text-[var(--text-muted)]">
            CLICK A DAY TO VIEW TASKS
          </span>
        </div>
      </div>
    </div>
  );
}
