# TaskFlowAI

A modern React Native task management app with AI-powered features, built with Expo.

## Features

### AI-Powered Task Creation
- Describe your task in natural language and let AI generate structured tasks
- Smart parsing of titles, descriptions, priorities, and due dates
- Preview and edit AI-generated tasks before saving
- Powered by Groq's Llama 3.1 model

### AI Daily Briefing
- Get an intelligent summary of your tasks each day
- Highlights urgent and overdue items
- Provides actionable suggestions to boost productivity
- Collapsible card with smooth animations

### Dark Mode Support
- Light, dark, and system-based themes
- Persists theme preference across sessions
- Smooth transitions between themes
- Theme-aware status bar

### Smart Salutations
- Time-based greetings on the login screen
- Dynamic icons that change throughout the day
- Personalized user experience

### Offline-First Architecture
- Tasks persist locally using AsyncStorage
- Works without internet connection
- Zustand state management with persistence middleware

### Authentication
- Secure user registration and login
- Token-based authentication
- Protected routes with navigation guards

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **State Management**: Zustand with persist middleware
- **Navigation**: React Navigation 7
- **Storage**: AsyncStorage for local persistence
- **AI Integration**: Groq API (Llama 3.1-8b-instant)
- **Styling**: React Native StyleSheet with custom theming
- **Testing**: Jest with React Native Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Clone the repository:
```bash
git clone https://github.com/caesaragen/TaskFlowAI.git
cd TaskFlowAI
```

2. Install dependencies:
```bash
yarn install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Add your API keys to `.env`:
```
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
```

5. Start the development server:
```bash
npx expo start
```

### Running on Device

- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan QR code with Expo Go app for physical device

## Project Structure

```
src/
  components/       # Reusable UI components
    tasks/          # Task-specific components (TaskItem, SmartTaskModal, AISummaryCard)
  config/           # App configuration (AI settings)
  constants/        # Theme and constants
  hooks/            # Custom React hooks
  navigation/       # Navigation configuration
  screens/          # Screen components
    auth/           # Login and Register screens
    profile/        # Profile and settings
    tasks/          # Task list and management
  services/
    ai/             # AI service integration (Groq)
    api/            # REST API client
    storage/        # Secure storage utilities
  store/            # Zustand stores (auth, tasks, theme)
  types/            # TypeScript type definitions
  utils/            # Utility functions
```

## Testing

Run the test suite:
```bash
yarn test
```

Run tests with coverage:
```bash
yarn test:coverage
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Backend API base URL |
| `EXPO_PUBLIC_GROQ_API_KEY` | Groq API key for AI features |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.
