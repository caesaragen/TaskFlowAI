/**
 * AI Configuration
 * 
 * To use AI features, you need a Groq API key:
 * 1. Sign up at https://console.groq.com (free tier available)
 * 2. Create an API key
 * 3. Copy .env.example to .env and add your key
 * 
 * Free tier includes 30 requests/minute which is plenty for development.
 */

// Environment variables are loaded by Expo automatically from .env files
export const AI_CONFIG = {
  // Groq API configuration
  groq: {
    apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '',
    baseUrl: 'https://api.groq.com/openai/v1',
    // Using Llama 3.1 8B - fast and free
    model: process.env.EXPO_PUBLIC_GROQ_MODEL ?? 'llama-3.1-8b-instant',
    // Alternative models:
    // 'llama-3.1-70b-versatile' - more capable but slower
    // 'mixtral-8x7b-32768' - good balance
    // 'gemma2-9b-it' - Google's model
  },
  
  // Feature flags
  features: {
    smartTaskCreation: true,
    taskSummarization: true,
    autoCategoriztion: true,
  },
};

/**
 * Check if AI features are properly configured
 */
export const isAIConfigured = (): boolean => {
  const key = AI_CONFIG.groq.apiKey;
  return key.length > 0 && !key.includes('your_') && !key.includes('YOUR_');
};
