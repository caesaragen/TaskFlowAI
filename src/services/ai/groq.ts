import { z } from 'zod';
import { AI_CONFIG, isAIConfigured } from '../../config/ai';
import { TaskPriority } from '../../types/task';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Zod schema for priority with transformation to TaskPriority enum
const prioritySchema = z
  .string()
  .optional()
  .transform((val): TaskPriority => {
    const normalized = val?.toLowerCase();
    switch (normalized) {
      case 'low':
        return TaskPriority.LOW;
      case 'high':
        return TaskPriority.HIGH;
      case 'urgent':
        return TaskPriority.URGENT;
      default:
        return TaskPriority.MEDIUM;
    }
  });

// Zod schema for generated task from AI
const generatedTaskSchema = z.object({
  title: z.string().max(60).optional().default(''),
  description: z.string().optional().default(''),
  priority: prioritySchema,
  category: z.string().optional().default('Other'),
  tags: z.array(z.string()).max(5).optional().default([]),
  estimatedDueDate: z
    .string()
    .nullable()
    .optional()
    .transform((val) => {
      if (!val || val === 'null') return undefined;
      const date = new Date(val);
      if (Number.isNaN(date.getTime())) return undefined;
      return date.toISOString();
    }),
});

// Zod schema for task summary from AI
const taskSummarySchema = z.object({
  overview: z.string().default('Tasks loaded successfully'),
  urgentTasks: z.array(z.string()).default([]),
  suggestions: z.array(z.string()).default([]),
});

// Infer types from schemas
type GeneratedTask = z.infer<typeof generatedTaskSchema>;
type TaskSummary = z.infer<typeof taskSummarySchema>;

/**
 * Call the Groq API with chat completion
 */
const callGroq = async (messages: GroqMessage[]): Promise<string> => {
  if (!isAIConfigured()) {
    throw new Error('AI is not configured. Please add your Groq API key in src/config/ai.ts');
  }

  const response = await fetch(`${AI_CONFIG.groq.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AI_CONFIG.groq.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: AI_CONFIG.groq.model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data: GroqResponse = await response.json();
  return data.choices[0]?.message?.content || '';
};

/**
 * Generate a full task from a simple idea or description
 */
export const generateTaskFromIdea = async (idea: string): Promise<GeneratedTask> => {
  const systemPrompt = `You are a helpful task management assistant. When given a task idea, expand it into a well-structured task with the following JSON format:
{
  "title": "Clear, actionable task title (max 60 chars)",
  "description": "Detailed description with specific steps or context",
  "priority": "low" | "medium" | "high" | "urgent",
  "category": "One of: Work, Personal, Health, Finance, Learning, Shopping, Home, Social, Other",
  "tags": ["relevant", "tags", "max 5"],
  "estimatedDueDate": "ISO date string or null if not applicable"
}

Guidelines:
- Make titles action-oriented (start with a verb)
- Descriptions should be helpful but concise
- Infer priority from urgency words or context
- Choose appropriate category based on the task type
- Add relevant tags for organization
- Only suggest a due date if the idea implies urgency

IMPORTANT: Return ONLY valid JSON, no additional text.`;

  const response = await callGroq([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Task idea: "${idea}"` },
  ]);

  try {
    // Extract JSON from response (in case there's extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate and normalize the response using Zod
    const result = generatedTaskSchema.safeParse(parsed);
    
    if (result.success) {
      return {
        ...result.data,
        title: result.data.title || idea,
      };
    }
    
    // If validation fails, return a basic task
    console.error('Zod validation failed:', result.error.issues);
    return {
      title: idea,
      description: '',
      priority: TaskPriority.MEDIUM,
      category: 'Other',
      tags: [],
      estimatedDueDate: undefined,
    };
  } catch (error) {
    console.error('Failed to parse AI response:', response);
    // Return a basic task if parsing fails
    return {
      title: idea,
      description: '',
      priority: TaskPriority.MEDIUM,
      category: 'Other',
      tags: [],
      estimatedDueDate: undefined,
    };
  }
};

/**
 * Summarize multiple tasks into a daily briefing
 */
export const summarizeTasks = async (tasks: Array<{
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
}>): Promise<TaskSummary> => {
  if (tasks.length === 0) {
    return {
      overview: 'No tasks to summarize. Time to add some!',
      urgentTasks: [],
      suggestions: ['Add your first task to get started'],
    };
  }

  const systemPrompt = `You are a productivity assistant. Analyze the user's tasks and provide a brief summary in this JSON format:
{
  "overview": "One sentence summary of their workload and status",
  "urgentTasks": ["List of task titles that need immediate attention (high/urgent priority or due soon)"],
  "suggestions": ["2-3 actionable productivity tips based on their tasks"]
}

IMPORTANT: Return ONLY valid JSON, no additional text.`;

  const taskList = tasks.map(t => 
    `- ${t.title} [${t.status}] [${t.priority}]${t.dueDate ? ` (due: ${t.dueDate})` : ''}`
  ).join('\n');

  const response = await callGroq([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Here are my current tasks:\n${taskList}` },
  ]);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate and normalize the response using Zod
    const result = taskSummarySchema.safeParse(parsed);
    
    if (result.success) {
      return result.data;
    }
    
    // If validation fails, return a fallback summary
    console.error('Zod validation failed:', result.error.issues);
    return {
      overview: `You have ${tasks.length} tasks to manage.`,
      urgentTasks: tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').map(t => t.title),
      suggestions: ['Review your high-priority tasks first'],
    };
  } catch (error) {
    console.error('Failed to parse summary response:', response);
    return {
      overview: `You have ${tasks.length} tasks to manage.`,
      urgentTasks: tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').map(t => t.title),
      suggestions: ['Review your high-priority tasks first'],
    };
  }
};
