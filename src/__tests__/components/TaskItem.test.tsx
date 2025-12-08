import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TaskItem from '../../components/tasks/TaskItem';
import { Task, TaskStatus, TaskPriority } from '../../types/task';

// Mock the theme hook
jest.mock('../../constants/theme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      text: '#1A1A1A',
      textSecondary: '#666666',
      textTertiary: '#999999',
      card: '#FFFFFF',
      surface: '#F5F5F5',
      border: '#E0E0E0',
      disabled: '#BDBDBD',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
    },
    shadows: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
    },
  }),
}));

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
