'use client';

import { useState } from 'react';
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
import { AddTaskModal } from './AddTaskModal';

interface KanbanBoardProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  isAddModalOpen?: boolean;
  onAddModalOpenChange?: (open: boolean) => void;
  searchQuery?: string;
  priorityFilter?: Priority | 'all';
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

export function KanbanBoard({ tasks, onTasksChange, isAddModalOpen, onAddModalOpenChange, searchQuery = '', priorityFilter = 'all' }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [internalModalOpen, setInternalModalOpen] = useState(false);

  // Use external control if provided, otherwise use internal state
  const isModalOpen = isAddModalOpen ?? internalModalOpen;
  const setIsModalOpen = onAddModalOpenChange ?? setInternalModalOpen;
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

  const handleAddTask = (title: string, description?: string, priority: Priority = 'medium', dueDate?: string) => {
    // Shift all existing todo tasks down
    const updatedTasks = tasks.map((t) => {
      if (t.status === 'todo') {
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
      status: 'todo',
      position: 0, // New task at top
      createdAt: Date.now(),
    };

    onTasksChange([...updatedTasks, newTask]);
  };

  const handleDeleteTask = (id: string) => {
    onTasksChange(tasks.filter((t) => t.id !== id));
  };

  const handleEditTask = (id: string, title: string, description?: string, priority?: Priority, dueDate?: string) => {
    onTasksChange(
      tasks.map((t) =>
        t.id === id ? { ...t, title, description, ...(priority && { priority }), dueDate } : t
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
        <div className="flex gap-8 h-full">
          {columns.map((column) => (
            <KanbanColumn
              key={column.status}
              status={column.status}
              title={column.title}
              tasks={getTasksByStatus(column.status)}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
              onAddTask={column.status === 'todo' ? () => setIsModalOpen(true) : undefined}
              isSortedByPriority={sortByPriority[column.status]}
              onToggleSort={() => handleToggleSort(column.status)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-2 scale-105">
              <KanbanCard
                task={activeTask}
                onDelete={() => {}}
                onEdit={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTask}
      />
    </div>
  );
}
