import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Theme } from '../../constants/theme';
import { summarizeTasks } from '../../services/ai/groq';
import { isAIConfigured } from '../../config/ai';
import { Task } from '../../types/task';

interface TaskSummary {
  overview: string;
  urgentTasks: string[];
  suggestions: string[];
}

interface AISummaryCardProps {
  tasks: Task[];
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({ tasks }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<TaskSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  const animatedHeight = React.useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.spring(animatedHeight, {
      toValue,
      useNativeDriver: false,
      friction: 8,
    }).start();
    setIsExpanded(!isExpanded);
    
    // Generate summary on first expand
    if (!isExpanded && !hasGenerated && !isLoading) {
      generateSummary();
    }
  };

  const generateSummary = async () => {
    if (!isAIConfigured()) {
      setError('AI not configured');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const taskData = tasks.map(t => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
      }));
      
      const result = await summarizeTasks(taskData);
      setSummary(result);
      setHasGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  const maxHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 400],
  });

  // Don't show if no tasks
  if (tasks.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Daily Briefing</Text>
            <Text style={styles.headerSubtitle}>
              {tasks.length} task{tasks.length === 1 ? '' : 's'} analyzed
            </Text>
          </View>
        </View>
        <Ionicons 
          name={isExpanded ? 'chevron-up' : 'chevron-down'} 
          size={24} 
          color={theme.colors.textSecondary} 
        />
      </TouchableOpacity>

      <Animated.View style={[styles.content, { maxHeight }]}>
        <View style={styles.contentInner}>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Analyzing your tasks...</Text>
            </View>
          )}
          
          {!isLoading && error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={generateSummary}>
                <Text style={styles.retryText}>Tap to retry</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {!isLoading && !error && summary && (
            <>
              {/* Overview */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="analytics-outline" size={18} color={theme.colors.primary} />
                  <Text style={styles.sectionTitle}>Overview</Text>
                </View>
                <Text style={styles.overviewText}>{summary.overview}</Text>
              </View>

              {/* Urgent Tasks */}
              {summary.urgentTasks.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="alert-circle" size={18} color={theme.colors.error} />
                    <Text style={styles.sectionTitle}>Needs Attention</Text>
                  </View>
                  {summary.urgentTasks.map((task) => (
                    <View key={`urgent-${task}`} style={styles.urgentItem}>
                      <View style={styles.urgentDot} />
                      <Text style={styles.urgentText} numberOfLines={1}>{task}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Suggestions */}
              {summary.suggestions.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="bulb-outline" size={18} color={theme.colors.warning} />
                    <Text style={styles.sectionTitle}>Suggestions</Text>
                  </View>
                  {summary.suggestions.map((suggestion, index) => (
                    <View key={`suggestion-${suggestion.slice(0, 20)}`} style={styles.suggestionItem}>
                      <Text style={styles.suggestionNumber}>{index + 1}</Text>
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Refresh Button */}
              <TouchableOpacity style={styles.refreshButton} onPress={generateSummary}>
                <Ionicons name="refresh" size={16} color={theme.colors.primary} />
                <Text style={styles.refreshText}>Refresh Analysis</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    headerSubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    content: {
      overflow: 'hidden',
    },
    contentInner: {
      padding: theme.spacing.md,
      paddingTop: 0,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: theme.spacing.lg,
    },
    loadingText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    errorContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    errorText: {
      fontSize: 14,
      color: theme.colors.error,
    },
    retryText: {
      fontSize: 14,
      color: theme.colors.primary,
      marginTop: theme.spacing.sm,
    },
    section: {
      marginBottom: theme.spacing.md,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    overviewText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    urgentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    urgentDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.error,
    },
    urgentText: {
      fontSize: 14,
      color: theme.colors.text,
      flex: 1,
    },
    suggestionItem: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 8,
    },
    suggestionNumber: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.warningLight,
      color: theme.colors.warning,
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 20,
    },
    suggestionText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      flex: 1,
      lineHeight: 20,
    },
    refreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    refreshText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '500',
    },
  });

export default AISummaryCard;
