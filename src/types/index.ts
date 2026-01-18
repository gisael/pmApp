export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string; // ISO date string (YYYY-MM-DD)
  status: 'todo' | 'in-progress' | 'complete';
  position: number;
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
