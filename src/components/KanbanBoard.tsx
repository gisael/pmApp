'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Task, TaskStatus, Priority } from '@/types';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { TaskDetailModal } from './TaskDetailModal';
import { getSubtaskCounts } from '@/hooks/useSubtasks';
import { createClient } from '@/lib/supabase/client';

interface KanbanBoardProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  isAddModalOpen?: boolean;
  onAddModalOpenChange?: (open: boolean) => void;
  searchQuery?: string;
  priorityFilter?: Priority | 'all';
  workDate: string;
}

const columns: { status: TaskStatus; title: string }[] = [
  { status: 'todo', title: 'Backlog' },
  { status: 'in-progress', title: 'In Progress' },
  { status: 'complete', title: 'Done' },
];

const priorityOrder: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function KanbanBoard({ tasks, onTasksChange, isAddModalOpen, onAddModalOpenChange, searchQuery = '', priorityFilter = 'all', workDate }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const [addToColumn, setAddToColumn] = useState<TaskStatus>('todo');
  const [deletedTask, setDeletedTask] = useState<Task | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [subtaskCounts, setSubtaskCounts] = useState<Map<string, { completed: number; total: number }>>(new Map());

  // Use external control if provided, otherwise use internal state
  const isModalOpen = isAddModalOpen ?? internalModalOpen;
  const setIsModalOpen = onAddModalOpenChange ?? setInternalModalOpen;

  const openedFromColumnRef = useRef(false);

  // Reset to 'todo' (backlog) when modal opens via external control (e.g., 'n' shortcut)
  useEffect(() => {
    if (isAddModalOpen) {
      if (openedFromColumnRef.current) {
        openedFromColumnRef.current = false;
      } else {
        setAddToColumn('todo');
      }
    }
  }, [isAddModalOpen]);

  const openAddModal = (status: TaskStatus = 'todo') => {
    openedFromColumnRef.current = true;
    setAddToColumn(status);
    setIsModalOpen(true);
  };

  // Undo deleted task with Cmd+Z
  const handleUndo = useCallback(() => {
    if (deletedTask) {
      onTasksChange([...tasks, deletedTask]);
      setDeletedTask(null);
      setShowUndoToast(false);
    }
  }, [deletedTask, tasks, onTasksChange]);

  // Listen for Cmd+Z / Ctrl+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && deletedTask) {
        e.preventDefault();
        handleUndo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [deletedTask, handleUndo]);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (showUndoToast) {
      const timer = setTimeout(() => {
        setShowUndoToast(false);
        setDeletedTask(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showUndoToast]);

  // Fetch subtask counts for all tasks
  const fetchSubtaskCounts = useCallback(async () => {
    const taskIds = tasks.map((t) => t.id);
    if (taskIds.length > 0) {
      const counts = await getSubtaskCounts(taskIds);
      setSubtaskCounts(counts);
    } else {
      setSubtaskCounts(new Map());
    }
  }, [tasks]);

  useEffect(() => {
    fetchSubtaskCounts();
  }, [fetchSubtaskCounts]);

  // Subscribe to realtime subtask changes to update counts
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('subtasks-changes-for-counts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subtasks' },
        () => {
          fetchSubtaskCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSubtaskCounts]);

  // Update selected task when tasks change (e.g., after edit)
  useEffect(() => {
    if (selectedTask) {
      const updatedTask = tasks.find((t) => t.id === selectedTask.id);
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    }
  }, [tasks, selectedTask]);

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);

  const handleTaskDetailClose = useCallback(() => {
    setSelectedTask(null);
    // Refresh subtask counts when modal closes (in case subtasks were modified)
    fetchSubtaskCounts();
  }, [fetchSubtaskCounts]);

  const handleStatusChange = useCallback((taskId: string, newStatus: TaskStatus) => {
    onTasksChange(
      tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  }, [tasks, onTasksChange]);

  const [sortByPriority, setSortByPriority] = useState<Record<TaskStatus, boolean>>({
    'todo': false,
    'in-progress': false,
    'complete': false,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getTasksByStatus = (status: TaskStatus) => {
    // First filter by search query and priority
    let columnTasks = tasks.filter((task) => task.status === status);

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      columnTasks = columnTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      columnTasks = columnTasks.filter((task) => task.priority === priorityFilter);
    }

    if (sortByPriority[status]) {
      // Sort by priority (urgent first)
      return [...columnTasks].sort((a, b) => {
        const aPriority = priorityOrder[a.priority] ?? priorityOrder.medium;
        const bPriority = priorityOrder[b.priority] ?? priorityOrder.medium;
        return aPriority - bPriority;
      });
    }

    // Sort by position (lowest first = top), fallback to createdAt (newest first)
    return [...columnTasks].sort((a, b) => {
      const aPos = a.position ?? a.createdAt;
      const bPos = b.position ?? b.createdAt;
      return aPos - bPos;
    });
  };

  const handleToggleSort = (status: TaskStatus) => {
    setSortByPriority((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const isOverColumn = columns.some((col) => col.status === overId);
    if (isOverColumn) {
      const newStatus = overId as TaskStatus;
      if (activeTask.status !== newStatus) {
        // Moving to new column - place at top (position 0)
        const targetColumnTasks = tasks.filter((t) => t.status === newStatus);
        const updatedTasks = tasks.map((t) => {
          if (t.id === activeId) {
            return { ...t, status: newStatus, position: 0 };
          }
          if (t.status === newStatus) {
            return { ...t, position: (t.position ?? 0) + 1 };
          }
          return t;
        });
        onTasksChange(updatedTasks);
      }
      return;
    }

    const overTask = tasks.find((t) => t.id === overId);
    if (overTask && activeTask.status !== overTask.status) {
      // Moving to new column at specific position
      const updatedTasks = tasks.map((t) => {
        if (t.id === activeId) {
          return { ...t, status: overTask.status, position: overTask.position ?? 0 };
        }
        return t;
      });
      onTasksChange(updatedTasks);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    const overTask = tasks.find((t) => t.id === overId);

    if (!activeTask) return;

    // Reorder within same column
    if (overTask && activeTask.status === overTask.status) {
      const columnTasks = getTasksByStatus(activeTask.status);
      const activeIndex = columnTasks.findIndex((t) => t.id === activeId);
      const overIndex = columnTasks.findIndex((t) => t.id === overId);

      if (activeIndex !== overIndex) {
        // Reorder and update positions
        const newColumnTasks = [...columnTasks];
        const [removed] = newColumnTasks.splice(activeIndex, 1);
        newColumnTasks.splice(overIndex, 0, removed);

        // Assign new positions
        const updatedTasks = tasks.map((t) => {
          if (t.status !== activeTask.status) return t;
          const newIndex = newColumnTasks.findIndex((ct) => ct.id === t.id);
          return { ...t, position: newIndex };
        });

        onTasksChange(updatedTasks);
      }
    }
  };

  const savePendingSubtasks = useCallback(async (taskId: string, subtaskTitles: string[]) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const subtasksToInsert = subtaskTitles.map((title, index) => ({
      id: crypto.randomUUID(),
      task_id: taskId,
      user_id: user.id,
      title,
      completed: false,
      position: index,
    }));

    const { error } = await supabase.from('subtasks').insert(subtasksToInsert);
    if (error) {
      console.error('Error saving subtasks:', error);
    } else {
      fetchSubtaskCounts();
    }
  }, [fetchSubtaskCounts]);

  const handleAddTask = (title: string, description?: string, priority: Priority = 'medium', dueDate?: string, status?: TaskStatus, isAchievement?: boolean, subtasks?: string[]) => {
    const targetStatus = status ?? addToColumn;
    // Shift all existing tasks in target column down
    const updatedTasks = tasks.map((t) => {
      if (t.status === targetStatus) {
        return { ...t, position: (t.position ?? 0) + 1 };
      }
      return t;
    });

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      priority,
      dueDate,
      status: targetStatus,
      position: 0, // New task at top
      workDate, // Associate with current work date
      isAchievement: isAchievement || false,
      createdAt: Date.now(),
    };

    onTasksChange([...updatedTasks, newTask]);

    if (subtasks && subtasks.length > 0) {
      savePendingSubtasks(newTask.id, subtasks);
    }
  };

  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (taskToDelete) {
      setDeletedTask(taskToDelete);
      setShowUndoToast(true);
    }
    onTasksChange(tasks.filter((t) => t.id !== id));
  };

  const handleEditTask = (id: string, title: string, description?: string, priority?: Priority, dueDate?: string, isAchievement?: boolean) => {
    onTasksChange(
      tasks.map((t) =>
        t.id === id ? { ...t, title, description, ...(priority && { priority }), dueDate, isAchievement: isAchievement ?? t.isAchievement } : t
      )
    );
  };

  return (
    <div className="h-full">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 md:gap-8 h-full overflow-x-auto snap-x snap-mandatory md:snap-none pb-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.status}
              status={column.status}
              title={column.title}
              tasks={getTasksByStatus(column.status)}
              onDeleteTask={handleDeleteTask}
              onTaskClick={handleTaskClick}
              onAddTask={() => openAddModal(column.status)}
              isSortedByPriority={sortByPriority[column.status]}
              onToggleSort={() => handleToggleSort(column.status)}
              subtaskCounts={subtaskCounts}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-2 scale-105">
              <KanbanCard
                task={activeTask}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      {/* Create Task Modal */}
      <TaskDetailModal
        task={null}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onStatusChange={handleStatusChange}
        mode="create"
        onCreate={(title, description, priority, dueDate, status, isAchievement, subtasks) =>
          handleAddTask(title, description, priority, dueDate, status, isAchievement, subtasks)
        }
        initialStatus={addToColumn}
      />
      {/* Edit Task Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={selectedTask !== null}
        onClose={handleTaskDetailClose}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onStatusChange={handleStatusChange}
      />

      {/* Undo Toast */}
      {showUndoToast && deletedTask && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in">
          <div className="flex items-center gap-4 px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-muted)]">
            <span className="font-mono text-xs text-[var(--text-secondary)]">
              TASK DELETED
            </span>
            <button
              onClick={handleUndo}
              className="font-mono text-xs text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors"
            >
              UNDO (⌘Z)
            </button>
            <button
              onClick={() => {
                setShowUndoToast(false);
                setDeletedTask(null);
              }}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
