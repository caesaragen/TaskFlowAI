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

interface GeneratedTask {
  title: string;
  description: string;
  priority: TaskPriority;
  category: string;
  tags: string[];
  estimatedDueDate?: string;
}

interface TaskSummary {
  overview: string;
  urgentTasks: string[];
  suggestions: string[];
}

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
    
    // Validate and normalize the response
    return {
      title: parsed.title || idea,
      description: parsed.description || '',
      priority: validatePriority(parsed.priority),
      category: parsed.category || 'Other',
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
      estimatedDueDate: parsed.estimatedDueDate || undefined,
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
    
    return {
      overview: parsed.overview || 'Tasks loaded successfully',
      urgentTasks: Array.isArray(parsed.urgentTasks) ? parsed.urgentTasks : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
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

/**
 * Validate and normalize priority value
 */
const validatePriority = (priority: string): TaskPriority => {
  const normalized = priority?.toLowerCase();
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
};
