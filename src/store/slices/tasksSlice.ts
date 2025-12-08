import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as tasksApi from '../../services/api/tasks';
import { Task, TaskStatus, TaskPriority } from '../../types/task';

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
}

const initialState: TasksState = {
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
};

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, { rejectWithValue }) => {
  try {
    return await tasksApi.getTasks();
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      return await tasksApi.createTask(task);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, updates }: { id: string; updates: Partial<Task> }, { rejectWithValue }) => {
    try {
      return await tasksApi.updateTask(id, updates);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      await tasksApi.deleteTask(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },
    setFilter: (state, action: PayloadAction<Partial<TasksState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create task
      .addCase(createTask.pending, (state) => {
        state.isSyncing = true;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isSyncing = false;
        state.items.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.payload as string;
      })
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.isSyncing = true;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isSyncing = false;
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedTask?.id === action.payload.id) {
          state.selectedTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.payload as string;
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
        if (state.selectedTask?.id === action.payload) {
          state.selectedTask = null;
        }
      });
  },
});

export const { setSelectedTask, setFilter, clearFilters } = tasksSlice.actions;
export default tasksSlice.reducer;