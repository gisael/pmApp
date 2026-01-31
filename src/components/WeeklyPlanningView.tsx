'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useTasksRange } from '@/hooks/useTasksRange';
import { WeekDayColumn } from './WeekDayColumn';
import { Task, Priority } from '@/types';

interface WeeklyPlanningViewProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onTaskClick?: (task: Task) => void;
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const priorityColors: Record<Priority, string> = {
  low: 'var(--text-muted)',
  medium: 'var(--text-secondary)',
  high: 'var(--accent)',
  urgent: '#ef4444',
};

function getWeekDays(date: string): { date: string; dayLabel: string }[] {
  const d = new Date(date + 'T00:00:00');
  const dayOfWeek = d.getDay();
  const startOfWeek = new Date(d);
  startOfWeek.setDate(d.getDate() - dayOfWeek);

  const days: { date: string; dayLabel: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push({
      date: day.toISOString().split('T')[0],
      dayLabel: WEEKDAYS[i],
    });
  }

  return days;
}

export function WeeklyPlanningView({ selectedDate, onDateSelect, onTaskClick }: WeeklyPlanningViewProps) {
  const today = new Date().toISOString().split('T')[0];
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - dayOfWeek);
    return start.toISOString().split('T')[0];
  });

  const weekDays = useMemo(() => getWeekDays(weekStartDate), [weekStartDate]);
  const startDate = weekDays[0].date;
  const endDate = weekDays[6].date;

  const { tasks, tasksByDate, loading, updateTaskDate } = useTasksRange(startDate, endDate);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const weekRange = useMemo(() => {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }, [startDate, endDate]);

  const goToPrevWeek = () => {
    const d = new Date(weekStartDate + 'T00:00:00');
    d.setDate(d.getDate() - 7);
    setWeekStartDate(d.toISOString().split('T')[0]);
  };

  const goToNextWeek = () => {
    const d = new Date(weekStartDate + 'T00:00:00');
    d.setDate(d.getDate() + 7);
    setWeekStartDate(d.toISOString().split('T')[0]);
  };

  const goToThisWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    setWeekStartDate(start.toISOString().split('T')[0]);
    onDateSelect(today);
  };

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }, [tasks]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Optional: can add preview logic here
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overDate = over.id as string;

    // Check if dropped on a date column
    if (weekDays.some((d) => d.date === overDate)) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.workDate !== overDate) {
        updateTaskDate(taskId, overDate);
      }
    }
  }, [tasks, weekDays, updateTaskDate]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-muted)]">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPrevWeek}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="font-mono text-sm font-semibold tracking-wider text-[var(--text-primary)] min-w-[220px] text-center uppercase">
            {weekRange}
          </h3>
          <button
            onClick={goToNextWeek}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button
          onClick={goToThisWeek}
          className="px-3 py-1.5 font-mono text-[10px] tracking-wider border border-[var(--border-muted)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
        >
          THIS WEEK
        </button>
      </div>

      {/* Week Grid */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="font-mono text-xs text-[var(--text-muted)] tracking-wider">
              LOADING WEEK...
            </span>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex h-full divide-x divide-[var(--border-muted)]">
              {weekDays.map((day) => (
                <WeekDayColumn
                  key={day.date}
                  date={day.date}
                  dayLabel={day.dayLabel}
                  isToday={day.date === today}
                  tasks={tasksByDate.get(day.date) || []}
                  onTaskClick={onTaskClick}
                />
              ))}
            </div>
            <DragOverlay>
              {activeTask ? (
                <div className="p-2 border border-[var(--accent)] bg-[var(--bg-elevated)] shadow-lg rotate-2 scale-105">
                  <div className="flex items-start gap-2">
                    <div
                      className="w-2 h-2 mt-1 flex-shrink-0"
                      style={{ backgroundColor: priorityColors[activeTask.priority] }}
                    />
                    <h4 className="font-mono text-xs text-[var(--text-primary)] leading-tight truncate">
                      {activeTask.title}
                    </h4>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[var(--border-muted)]">
        <div className="flex items-center justify-center gap-4">
          <span className="font-mono text-[10px] text-[var(--text-muted)]">
            DRAG TASKS BETWEEN DAYS TO RESCHEDULE
          </span>
        </div>
      </div>
    </div>
  );
}
