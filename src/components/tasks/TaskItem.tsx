import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Task, TaskStatus, TaskPriority } from "../../types/task";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useTheme, Theme } from "../../constants/theme";

interface TaskItemProps {
  task: Task;
  onPress: (taskId: string) => void;
}

const TaskItem = React.memo(({ task, onPress }: TaskItemProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const priorityColors = {
    [TaskPriority.LOW]: theme.colors.success,
    [TaskPriority.MEDIUM]: theme.colors.warning,
    [TaskPriority.HIGH]: theme.colors.error,
    [TaskPriority.URGENT]: "#AF52DE",
  };

  const statusIcons = {
    [TaskStatus.TODO]: "ellipse-outline",
    [TaskStatus.IN_PROGRESS]: "play-circle-outline",
    [TaskStatus.COMPLETED]: "checkmark-circle",
  };

  const isCompleted = task.status === TaskStatus.COMPLETED;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(task.id)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Ionicons
          name={statusIcons[task.status] as any}
          size={24}
          color={isCompleted ? theme.colors.success : theme.colors.primary}
        />
        <View style={styles.titleContainer}>
          <Text
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          {task.description ? (
            <Text style={styles.description} numberOfLines={1}>
              {task.description}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.leftSection}>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: priorityColors[task.priority] + "20" },
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                { color: priorityColors[task.priority] },
              ]}
            >
              {task.priority}
            </Text>
          </View>
          {task.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{task.category}</Text>
            </View>
          )}
        </View>

        {task.dueDate && (
          <View style={styles.dueDateContainer}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.dueDateText}>
              {format(new Date(task.dueDate), "MMM dd")}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

TaskItem.displayName = "TaskItem";

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  titleContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: theme.colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.sm,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  categoryBadge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.lg,
  },
  categoryText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dueDateText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
});

export default TaskItem;
