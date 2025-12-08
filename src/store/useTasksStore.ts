import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as tasksApi from '../services/api/tasks';
import { Task, TaskStatus, TaskPriority } from '../types/task';

interface TasksState {
  items: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  filters: {
    status: TaskStatus | 'all';
    priority: TaskPriority | 'all';
    search: string;
  };
  _hasHydrated: boolean;

  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setSelectedTask: (task: Task | null) => void;
  setFilter: (filters: Partial<TasksState['filters']>) => void;
  clearFilters: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      selectedTask: null,
      isLoading: false,
      isSyncing: false,
      error: null,
      filters: {
        status: 'all',
        priority: 'all',
        search: '',
      },
      _hasHydrated: false,

      // Hydration tracker
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      // Fetch tasks
      fetchTasks: async () => {
        set({ isLoading: true, error: null });
        try {
          const tasks = await tasksApi.getTasks();
          set({ items: tasks, isLoading: false });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to fetch tasks';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      // Create task
      createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
        set({ isSyncing: true });
        try {
          const newTask = await tasksApi.createTask(task);
          set((state) => ({
            items: [newTask, ...state.items],
            isSyncing: false,
          }));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to create task';
          set({ isSyncing: false, error: message });
          throw error;
        }
      },

      // Update task
      updateTask: async (id: string, updates: Partial<Task>) => {
        set({ isSyncing: true });
        try {
          const updatedTask = await tasksApi.updateTask(id, updates);
          set((state) => {
            const items = state.items.map((task) =>
              task.id === id ? updatedTask : task
            );
            const selectedTask =
              state.selectedTask?.id === id ? updatedTask : state.selectedTask;
            return {
              items,
              selectedTask,
              isSyncing: false,
            };
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to update task';
          set({ isSyncing: false, error: message });
          throw error;
        }
      },

      // Delete task
      deleteTask: async (id: string) => {
        try {
          await tasksApi.deleteTask(id);
          set((state) => ({
            items: state.items.filter((task) => task.id !== id),
            selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
          }));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to delete task';
          set({ error: message });
          throw error;
        }
      },

      // Set selected task
      setSelectedTask: (task: Task | null) => {
        set({ selectedTask: task });
      },

      // Set filter
      setFilter: (filters: Partial<TasksState['filters']>) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      // Clear filters
      clearFilters: () => {
        set({
          filters: {
            status: 'all',
            priority: 'all',
            search: '',
          },
        });
      },
    }),
    {
      name: 'taskflow-tasks-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the items array, not loading states or errors
      partialize: (state) => ({
        items: state.items,
        filters: state.filters,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
