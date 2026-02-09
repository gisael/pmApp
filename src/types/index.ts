export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string; // ISO date string (YYYY-MM-DD)
  status: 'todo' | 'in-progress' | 'complete';
  position: number;
  workDate: string; // YYYY-MM-DD - the day this task belongs to
  isAchievement?: boolean; // Mark task as an achievement for annual review
  rolledPastDue?: boolean; // Grace period used - one rollover after due date
  createdAt: number;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface AppState {
  tasks: Task[];
  todos: TodoItem[];
  notes: string;
}

export type TaskStatus = Task['status'];

export interface User {
  id: string;
  email?: string;
}

// Subtasks
export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  position: number;
}

// Analytics
export interface DailyMetrics {
  date: string;
  total: number;
  completed: number;
}

export interface AnalyticsPeriod {
  start: string;
  end: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  tasksByPriority: Record<Priority, number>;
  dailyBreakdown: DailyMetrics[];
}

// Views
export type ViewType = 'kanban' | 'calendar' | 'weekly' | 'agenda';
