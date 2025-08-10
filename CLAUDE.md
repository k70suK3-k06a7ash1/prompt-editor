# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite application for editing prompts with dynamic variable replacement. The app extracts variables in `${prop}` format from user-entered system prompts, generates input fields for those variables, reconstructs the final prompt with user-provided values, and persists prompts using PGlite (in-browser PostgreSQL).

## Development Commands

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production (runs TypeScript compilation first)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally
- `npm run test` - Run Vitest tests
- `npm run test:ui` - Run Vitest with UI
- `npm run test:run` - Run tests once without watch mode
- `npm run test:coverage` - Run tests with coverage report

### Code Quality Tools
- `make format` - Format code with Biome
- `make lint` - Lint and fix code with Biome
- `make check` - Run Biome formatter and linter together
- `make push` - Git add, commit with "chore" message, and push

### GitHub Actions Testing (Local)
- `make act-test` - Run GitHub Actions test workflow locally
- `make act-test-verbose` - Run with verbose output for debugging
- `make act-list` - List all available GitHub Actions jobs
- `make act-dry` - Perform a dry run without executing
- `make act-clean` - Clean up Docker resources after testing

## Architecture

### Core Structure
- **src/main.tsx**: Application entry point with PGlite database initialization
- **src/App.tsx**: Simple wrapper that renders PromptEditor
- **src/components/PromptEditor.tsx**: Main application component with all functionality
- **src/repositories/PromptRepository.ts**: Database operations layer for prompt management
- **src/hooks/use-extract-variables.ts**: Custom hook for variable extraction logic
- **src/hooks/use-auto-save.ts**: Auto-save functionality with debouncing
- **src/hooks/use-generate-multi-prompts.ts**: Multi-prompt generation from comma-separated values
- **src/hooks/use-session-persistence.ts**: Session storage for data persistence
- **src/types.ts**: TypeScript interfaces (PromptVersion)

### Key Features Implementation

1. **Variable Extraction**: 
   - Uses `useExtractVariables` hook with regex `/\$\{(\w+)\}/g`
   - Automatically discovers unique variables from prompt text
   - Maintains state synchronization between variables and their values

2. **Database Persistence** (PGlite):
   - In-browser PostgreSQL database for prompt storage
   - Table: `prompt_versions` with title, original_prompt, variable_values (JSONB), timestamps
   - Real-time queries with `useLiveQuery` for history display
   - Repository pattern via `PromptRepository` class for data operations

3. **Auto-Save System**:
   - Uses `useAutoSave` hook with configurable debouncing (default 2000ms)
   - Automatically saves prompts with "[Auto-save]" prefix
   - Updates existing auto-saves instead of creating duplicates
   - Status indicators: idle, saving, saved, error

4. **Multi-Prompt Generation**:
   - Uses `useGenerateMultiPrompts` hook for comma-separated variable values
   - Generates cartesian product of all variable combinations
   - Supports batch prompt generation from single template

5. **Session Persistence**:
   - Uses `useSessionPersistence` hook for browser session storage
   - Auto-restores work on page refresh (within 24 hours)
   - Saves data before page unload to prevent loss

6. **UI Sections**:
   - Save/Load prompt functionality with history
   - System prompt input textarea
   - Dynamic variable input fields (responsive grid)
   - Generated prompt display with copy functionality
   - Reset and clipboard operations

### Technology Stack
- **Frontend**: React 19, TypeScript 5.7
- **Build Tool**: Vite 7 with React plugin
- **Database**: PGlite (in-browser PostgreSQL) with live queries
- **Styling**: Tailwind CSS v4 with Inter font
- **Icons**: Lucide React
- **Testing**: Vitest with jsdom, Testing Library
- **Code Quality**: Biome (formatter/linter), ESLint
- **UI Components**: Custom components with Radix UI primitives

### State Management
- **PromptEditor Component State**:
  - `originalPrompt`: User-entered prompt string
  - `variables`: Array of extracted variable names
  - `variableValues`: Object mapping variable names to user values  
  - `generatedPrompt`: Final prompt with variables substituted
  - `promptTitle`: Title for saving prompts
  - `showHistory`: Toggle for prompt history display

### Custom Hooks
- **useExtractVariables**: Manages variable extraction and state synchronization
  - Parses prompt for `${variable}` patterns
  - Updates variables array and values object
  - Handles cleanup of removed variables

- **useAutoSave**: Automatic prompt saving with debouncing
  - Configurable save interval and minimum content length
  - Creates/updates auto-save entries with timestamp prefixes
  - Provides save status tracking and manual save capability

- **useGenerateMultiPrompts**: Multi-prompt generation from variable combinations
  - Parses comma-separated values in variable inputs
  - Generates cartesian product of all variable combinations
  - Returns array of generated prompts for batch operations

- **useSessionPersistence**: Browser session storage management
  - Auto-saves form state to sessionStorage with debouncing
  - Restores session data on page load (24-hour expiry)
  - Handles page unload events to prevent data loss

- **useGeneratePrompt**: Single prompt generation with variable substitution
  - Replaces `${variable}` patterns with user-provided values
  - Maintains original placeholder format for empty values

## Development Notes

- Database schema auto-initializes on app startup
- Repository pattern implemented for data layer separation (`PromptRepository`)
- Tests configured with Vitest and Testing Library
- Path alias `@/` points to `src/` directory
- Build output goes to `dist/` with base path `/prompt-editor/`
- Biome configured with tab indentation and double quotes
- PGlite requires special Vite optimization exclusion
- Auto-save and session persistence work independently for data resilience
- Multi-prompt generation supports complex variable combinations
- Lefthook configuration available but currently contains only examples
- Uses act for local GitHub Actions testing (requires Docker)

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.