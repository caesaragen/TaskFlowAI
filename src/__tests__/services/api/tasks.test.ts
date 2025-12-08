import { getTasks, createTask, updateTask, deleteTask } from '../../../services/api/tasks';
import { TaskStatus, TaskPriority } from '../../../types/task';

describe('tasks API service', () => {
  describe('getTasks', () => {
    it('should fetch tasks successfully', async () => {
      const tasks = await getTasks();
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThan(0);
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const newTask = {
        title: 'New Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
      };

      const createdTask = await createTask(newTask);
      expect(createdTask.title).toBe('New Test Task');
      expect(createdTask.id).toBeTruthy();
      expect(createdTask.createdAt).toBeTruthy();
    });
  });

  describe('updateTask', () => {
    it('should update existing task', async () => {
      const tasks = await getTasks();
      const taskToUpdate = tasks[0];

      const updatedTask = await updateTask(taskToUpdate.id, {
        title: 'Updated Title',
      });

      expect(updatedTask.id).toBe(taskToUpdate.id);
      expect(updatedTask.title).toBe('Updated Title');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const newTask = await createTask({
        title: 'Task to Delete',
        description: 'Will be deleted',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
      });

      await expect(deleteTask(newTask.id)).resolves.not.toThrow();
    });
  });
});