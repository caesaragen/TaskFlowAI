import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Task, TaskStatus, TaskPriority } from "../../types/task";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

interface TaskItemProps {
  task: Task;
  onPress: (taskId: string) => void;
}

const priorityColors = {
  [TaskPriority.LOW]: "#34C759",
  [TaskPriority.MEDIUM]: "#FF9500",
  [TaskPriority.HIGH]: "#FF3B30",
  [TaskPriority.URGENT]: "#AF52DE",
};

const statusIcons = {
  [TaskStatus.TODO]: "ellipse-outline",
  [TaskStatus.IN_PROGRESS]: "play-circle-outline",
  [TaskStatus.COMPLETED]: "checkmark-circle",
};

const TaskItem = React.memo(({ task, onPress }: TaskItemProps) => {
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
          color={isCompleted ? "#34C759" : "#007AFF"}
        />
        <View style={styles.titleContainer}>
          <Text
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          {task.description && (
            <Text style={styles.description} numberOfLines={1}>
              {task.description}
            </Text>
          )}
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
            <Ionicons name="calendar-outline" size={14} color="#8E8E93" />
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: "#8E8E93",
  },
  description: {
    fontSize: 14,
    color: "#8E8E93",
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
    borderRadius: 12,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  categoryBadge: {
    backgroundColor: "#E5E5EA",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: "#3A3A3C",
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dueDateText: {
    fontSize: 12,
    color: "#8E8E93",
    marginLeft: 4,
  },
});

export default TaskItem;
