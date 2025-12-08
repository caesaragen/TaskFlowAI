import { apiClient, handleApiError } from './client';
import { Task, TaskStatus, TaskPriority } from '../../types/task';

const MOCK_MODE = true;

let mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project documentation',
    description: 'Write comprehensive README and API docs',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    category: 'Development',
    tags: ['documentation', 'urgent'],
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    title: 'Review pull requests',
    description: 'Check and approve pending PRs from team',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    category: 'Code Review',
    tags: ['review', 'team'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: 'Update dependencies',
    description: 'Update npm packages to latest versions',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.LOW,
    category: 'Maintenance',
    tags: ['dependencies', 'npm'],
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

const mockDelay = () => new Promise((resolve) => setTimeout(resolve, 800));

export const getTasks = async (): Promise<Task[]> => {
  if (MOCK_MODE) {
    await mockDelay();
    return [...mockTasks].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  try {
    const response = await apiClient.get<Task[]>('/tasks');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getTask = async (id: string): Promise<Task> => {
  if (MOCK_MODE) {
    await mockDelay();
    const task = mockTasks.find((t) => t.id === id);
    if (!task) throw new Error('Task not found');
    return task;
  }

  try {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const createTask = async (
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Task> => {
  if (MOCK_MODE) {
    await mockDelay();
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockTasks.unshift(newTask);
    return newTask;
  }

  try {
    const response = await apiClient.post<Task>('/tasks', task);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
  if (MOCK_MODE) {
    await mockDelay();
    const index = mockTasks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Task not found');
    
    mockTasks[index] = {
      ...mockTasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return mockTasks[index];
  }

  try {
    const response = await apiClient.patch<Task>(`/tasks/${id}`, updates);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const deleteTask = async (id: string): Promise<void> => {
  if (MOCK_MODE) {
    await mockDelay();
    mockTasks = mockTasks.filter((t) => t.id !== id);
    return;
  }

  try {
    await apiClient.delete(`/tasks/${id}`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};