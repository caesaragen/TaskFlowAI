import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasksStore } from '../../store/useTasksStore';
import TaskItem from '../../components/tasks/TaskItem';
import SmartTaskModal from '../../components/tasks/SmartTaskModal';
import AISummaryCard from '../../components/tasks/AISummaryCard';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme, Theme } from '../../constants/theme';
import { TaskPriority, TaskStatus } from '../../types/task';

export default function TasksScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const tasks = useTasksStore((state) => state.items);
  const isLoading = useTasksStore((state) => state.isLoading);
  const error = useTasksStore((state) => state.error);
  const fetchTasks = useTasksStore((state) => state.fetchTasks);
  const createTask = useTasksStore((state) => state.createTask);
  const [refreshing, setRefreshing] = useState(false);
  const [isSmartModalVisible, setIsSmartModalVisible] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      await fetchTasks();
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleAddTask = () => {
    setIsSmartModalVisible(true);
  };

  const handleSmartTaskCreate = async (task: {
    title: string;
    description: string;
    priority: TaskPriority;
    category: string;
    tags: string[];
    estimatedDueDate?: string;
  }) => {
    try {
      await createTask({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: TaskStatus.TODO,
        category: task.category,
        tags: task.tags,
        dueDate: task.estimatedDueDate,
      });
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleTaskPress = (taskId: string) => {
    // Navigate to task detail screen
    console.log('Task pressed:', taskId);
  };

  if (isLoading && tasks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTasks}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.smartAddButton}
            onPress={handleAddTask}
            accessibilityLabel="Create task with AI"
          >
            <Ionicons name="sparkles" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
            <Ionicons name="add-circle" size={32} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <SmartTaskModal
        visible={isSmartModalVisible}
        onClose={() => setIsSmartModalVisible(false)}
        onCreateTask={handleSmartTaskCreate}
      />

      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-done-outline" size={80} color={theme.colors.disabled} />
          <Text style={styles.emptyText}>No tasks yet</Text>
          <Text style={styles.emptySubtext}>Tap the + button to add your first task</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TaskItem task={item} onPress={handleTaskPress} />}
          ListHeaderComponent={<AISummaryCard tasks={tasks} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
          }
        />
      )}
    </ScreenWrapper>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
  },
  header: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smartAddButton: {
    padding: 8,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 20,
  },
  addButton: {
    padding: 4,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: 16,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.error,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
});
