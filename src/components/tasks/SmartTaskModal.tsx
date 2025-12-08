import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Theme } from '../../constants/theme';
import { generateTaskFromIdea } from '../../services/ai/groq';
import { isAIConfigured } from '../../config/ai';
import { TaskPriority } from '../../types/task';

interface GeneratedTaskData {
  title: string;
  description: string;
  priority: TaskPriority;
  category: string;
  tags: string[];
  estimatedDueDate?: string;
}

interface SmartTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateTask: (task: GeneratedTaskData) => void;
}

export const SmartTaskModal: React.FC<SmartTaskModalProps> = ({
  visible,
  onClose,
  onCreateTask,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTask, setGeneratedTask] = useState<GeneratedTaskData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    
    if (!isAIConfigured()) {
      setError('AI not configured. Add your Groq API key in src/config/ai.ts');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const task = await generateTaskFromIdea(idea.trim());
      setGeneratedTask(task);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate task');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreate = () => {
    if (generatedTask) {
      onCreateTask(generatedTask);
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setIdea('');
    setGeneratedTask(null);
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const priorityColors: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: theme.colors.success,
    [TaskPriority.MEDIUM]: theme.colors.warning,
    [TaskPriority.HIGH]: theme.colors.error,
    [TaskPriority.URGENT]: '#AF52DE',
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="sparkles" size={24} color={theme.colors.primary} />
            <Text style={styles.headerTitle}>Smart Task</Text>
          </View>
          <View style={styles.closeButton} />
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Input Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What do you need to do?</Text>
            <Text style={styles.sectionSubtitle}>
              Describe your task and AI will help structure it
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Buy groceries for the week, prepare for Monday meeting..."
              placeholderTextColor={theme.colors.placeholder}
              value={idea}
              onChangeText={setIdea}
              multiline
              numberOfLines={3}
              editable={!isGenerating}
            />
            
            <TouchableOpacity
              style={[
                styles.generateButton,
                (!idea.trim() || isGenerating) && styles.generateButtonDisabled,
              ]}
              onPress={handleGenerate}
              disabled={!idea.trim() || isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                  <Text style={styles.generateButtonText}>Generate Task</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Generated Task Preview */}
          {generatedTask && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Generated Task</Text>
              
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>{generatedTask.title}</Text>
                
                {generatedTask.description && (
                  <Text style={styles.previewDescription}>
                    {generatedTask.description}
                  </Text>
                )}

                <View style={styles.previewMeta}>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: priorityColors[generatedTask.priority] + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: priorityColors[generatedTask.priority] },
                      ]}
                    >
                      {generatedTask.priority}
                    </Text>
                  </View>
                  
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{generatedTask.category}</Text>
                  </View>
                </View>

                {generatedTask.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {generatedTask.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {generatedTask.estimatedDueDate && (
                  <View style={styles.dueDateContainer}>
                    <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.dueDateText}>
                      Suggested due: {new Date(generatedTask.estimatedDueDate).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.regenerateButton} onPress={handleGenerate}>
                  <Ionicons name="refresh" size={20} color={theme.colors.primary} />
                  <Text style={styles.regenerateButtonText}>Regenerate</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>Create Task</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    closeButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    input: {
      backgroundColor: theme.colors.inputBackground,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.text,
      minHeight: 100,
      textAlignVertical: 'top',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    generateButton: {
      backgroundColor: theme.colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: theme.borderRadius.lg,
      marginTop: theme.spacing.md,
    },
    generateButtonDisabled: {
      opacity: 0.5,
    },
    generateButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.colors.errorLight,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.lg,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 14,
      flex: 1,
    },
    previewCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.md,
    },
    previewTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    previewDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: theme.spacing.md,
    },
    previewMeta: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: theme.spacing.sm,
    },
    priorityBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    priorityText: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    categoryBadge: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    categoryText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: theme.spacing.sm,
    },
    tag: {
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    tagText: {
      fontSize: 12,
      color: theme.colors.primary,
    },
    dueDateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    dueDateText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: theme.spacing.lg,
    },
    regenerateButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 14,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    regenerateButtonText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    createButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 14,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.success,
    },
    createButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default SmartTaskModal;
