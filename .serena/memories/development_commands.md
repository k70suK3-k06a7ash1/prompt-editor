# Development Commands

## Core Development
- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production (runs TypeScript compilation first)
- `npm run preview` - Preview production build locally

## Testing
- `npm run test` - Run Vitest tests (watch mode)
- `npm run test:ui` - Run Vitest with UI
- `npm run test:run` - Run tests once without watch mode
- `npm run test:coverage` - Run tests with coverage report

## Code Quality
- `npm run lint` - Run ESLint
- `make format` - Format code with Biome
- `make lint` - Lint and fix code with Biome
- `make check` - Run Biome formatter and linter together
- `make push` - Git add, commit with "chore" message, and push

## GitHub Actions Testing (Local with act)
- `make act-test` - Run GitHub Actions test workflow locally
- `make act-test-verbose` - Run with verbose output for debugging
- `make act-list` - List all available GitHub Actions jobs
- `make act-dry` - Perform a dry run without executing

## System Requirements
- Docker required for act (GitHub Actions local testing)
- Node.js and npm for development