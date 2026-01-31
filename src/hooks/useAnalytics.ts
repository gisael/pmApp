'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AnalyticsPeriod, DailyMetrics, Priority } from '@/types';

type Period = 'week' | 'month';

interface DbTask {
  id: string;
  status: string;
  priority: string;
  work_date: string;
}

function getDateRange(period: Period): { start: string; end: string } {
  const today = new Date();
  const end = today.toISOString().split('T')[0];

  let start: Date;
  if (period === 'week') {
    start = new Date(today);
    start.setDate(start.getDate() - 6); // Last 7 days including today
  } else {
    start = new Date(today);
    start.setDate(start.getDate() - 29); // Last 30 days including today
  }

  return {
    start: start.toISOString().split('T')[0],
    end,
  };
}

function generateDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');

  while (current <= endDate) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function useAnalytics(period: Period = 'week') {
  const [analytics, setAnalytics] = useState<AnalyticsPeriod | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);

    const { start, end } = getDateRange(period);

    const { data, error } = await supabase
      .from('tasks')
      .select('id, status, priority, work_date')
      .gte('work_date', start)
      .lte('work_date', end);

    if (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
      return;
    }

    const tasks = data as DbTask[];

    // Calculate metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'complete').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Tasks by priority
    const tasksByPriority: Record<Priority, number> = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };
    tasks.forEach((t) => {
      const priority = t.priority as Priority;
      if (tasksByPriority[priority] !== undefined) {
        tasksByPriority[priority]++;
      }
    });

    // Daily breakdown
    const dateRange = generateDateRange(start, end);
    const dailyBreakdown: DailyMetrics[] = dateRange.map((date) => {
      const dayTasks = tasks.filter((t) => t.work_date === date);
      return {
        date,
        total: dayTasks.length,
        completed: dayTasks.filter((t) => t.status === 'complete').length,
      };
    });

    setAnalytics({
      start,
      end,
      totalTasks,
      completedTasks,
      completionRate,
      tasksByPriority,
      dailyBreakdown,
    });

    setLoading(false);
  }, [supabase, period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Calculate additional derived metrics
  const avgTasksPerDay = analytics
    ? Math.round((analytics.totalTasks / analytics.dailyBreakdown.length) * 10) / 10
    : 0;

  const avgCompletedPerDay = analytics
    ? Math.round((analytics.completedTasks / analytics.dailyBreakdown.length) * 10) / 10
    : 0;

  return {
    analytics,
    loading,
    refresh: fetchAnalytics,
    avgTasksPerDay,
    avgCompletedPerDay,
  };
}
