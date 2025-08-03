# Task Completion Checklist

## Code Quality Checks
When completing any development task, run these commands:

### Essential Checks
1. **Format code**: `make format` or `npx @biomejs/biome format --write ./src`
2. **Lint code**: `make lint` or `npx @biomejs/biome lint --write ./src` 
3. **Run both**: `make check` or `npx @biomejs/biome check --write ./src`
4. **Type check**: `npm run build` (includes TypeScript compilation)
5. **Test suite**: `npm run test:run` (single run) or `npm run test:coverage`

### Optional Quality Checks
6. **ESLint**: `npm run lint` (additional linting beyond Biome)
7. **Local CI**: `make act-test` (if Docker available)

## Pre-commit
- **Format and lint** are enforced by Biome configuration
- **Import organization** happens automatically
- **Git workflow**: Simple "chore" commits for routine updates with `make push`

## Testing Strategy
- Run **unit tests** for any modified hooks or utilities
- Use **coverage reporting** to ensure adequate test coverage
- **Component tests** should pass for UI changes
- Consider **integration testing** for database-related changes

## Build Verification
- **Development build**: `npm run dev` should start without errors
- **Production build**: `npm run build` should complete successfully
- **Preview build**: `npm run preview` should serve correctly