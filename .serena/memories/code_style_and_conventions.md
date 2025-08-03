# Code Style and Conventions

## Formatting
- **Indentation**: Tabs (configured in Biome)
- **Quotes**: Double quotes for JavaScript/TypeScript (configured in Biome)
- **Import Organization**: Automatic import organization enabled in Biome

## File Structure
- **Path Alias**: `@/` points to `src/` directory
- **Component Structure**: 
  - `src/components/` - React components
  - `src/hooks/` - Custom React hooks
  - `src/lib/` - Utility functions
  - `src/repositories/` - Data access layer
  - `src/types.ts` - TypeScript interfaces

## Naming Conventions
- Components: PascalCase (e.g., `PromptEditor.tsx`)
- Hooks: camelCase with "use" prefix (e.g., `useExtractVariables`)
- Files: kebab-case for utilities, PascalCase for components
- Variables: camelCase

## TypeScript
- Strict TypeScript configuration
- Interface definitions in `src/types.ts`
- Type-aware linting available but not currently enabled

## Testing
- Vitest with Testing Library
- Test files: `*.test.ts` alongside source files
- Coverage reporting available

## Git Workflow
- Simple commit messages ("chore") for routine updates
- Clean repository structure with proper .gitignore