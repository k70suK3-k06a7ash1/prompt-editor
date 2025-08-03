# Architecture and Patterns

## Core Architecture
- **Single Page Application** with React 19
- **Component-based** architecture with clear separation of concerns
- **Custom hooks** for business logic (variable extraction, prompt generation)
- **Repository pattern** for data access (PromptRepository)

## Key Components
- **PromptEditor**: Main application component containing all functionality
- **LoadingState**: Shared loading component
- **UI Components**: Custom components with Radix UI primitives (Button, etc.)

## State Management
- **Local component state** for UI interactions
- **Custom hooks** for complex logic:
  - `useExtractVariables`: Variable extraction from prompts using regex `/\$\{(\w+)\}/g`
  - `useGeneratePrompt`: Prompt reconstruction with variable substitution
- **PGlite with live queries** for database state

## Database Design
- **Table**: `prompt_versions`
- **Schema**: title, original_prompt, variable_values (JSONB), timestamps
- **Real-time updates** with `useLiveQuery` from pglite-react

## Build Configuration
- **Vite config** optimized for PGlite (excluded from optimization)
- **Base path**: `/prompt-editor/` for deployment
- **Worker format**: ES modules
- **Tailwind CSS v4** integration

## Testing Strategy
- **Unit tests** for hooks and utilities
- **Component testing** with Testing Library
- **Coverage reporting** available
- **Local CI testing** with act and Docker