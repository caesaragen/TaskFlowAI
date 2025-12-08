import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TaskItem from '../../components/tasks/TaskItem';
import { Task, TaskStatus, TaskPriority } from '../../types/task';

describe('TaskItem', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    category: 'Work',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('should render task title and description', () => {
    const { getByText } = render(<TaskItem task={mockTask} onPress={mockOnPress} />);
    expect(getByText('Test Task')).toBeTruthy();
    expect(getByText('Test Description')).toBeTruthy();
  });

  it('should render priority badge', () => {
    const { getByText } = render(<TaskItem task={mockTask} onPress={mockOnPress} />);
    expect(getByText('medium')).toBeTruthy();
  });

  it('should render category if present', () => {
    const { getByText } = render(<TaskItem task={mockTask} onPress={mockOnPress} />);
    expect(getByText('Work')).toBeTruthy();
  });

  it('should call onPress when tapped', () => {
    const { getByText } = render(<TaskItem task={mockTask} onPress={mockOnPress} />);
    fireEvent.press(getByText('Test Task'));
    expect(mockOnPress).toHaveBeenCalledWith('1');
  });

  it('should show strikethrough for completed tasks', () => {
    const completedTask = { ...mockTask, status: TaskStatus.COMPLETED };
    const { getByText } = render(<TaskItem task={completedTask} onPress={mockOnPress} />);
    const titleElement = getByText('Test Task');
    expect(titleElement.props.style).toContainEqual(
      expect.objectContaining({ textDecorationLine: 'line-through' })
    );
  });

  it('should not render description if not present', () => {
    const taskWithoutDescription = { ...mockTask, description: '' };
    const { queryByText } = render(<TaskItem task={taskWithoutDescription} onPress={mockOnPress} />);
    expect(queryByText('Test Description')).toBeNull();
  });

  it('should render due date if present', () => {
    const taskWithDueDate = { ...mockTask, dueDate: '2024-12-31T00:00:00.000Z' };
    const { getByText } = render(<TaskItem task={taskWithDueDate} onPress={mockOnPress} />);
    expect(getByText('Dec 31')).toBeTruthy();
  });
});
