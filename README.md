# Prompt Editor

A React + TypeScript + Vite application for editing prompts with dynamic variable replacement. The app extracts variables in `${prop}` format from user-entered system prompts, generates input fields for those variables, reconstructs the final prompt with user-provided values, and persists prompts using PGlite (in-browser PostgreSQL).

## Development

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build
```

### Code Quality

```bash
# Format code with Biome
make format

# Lint and fix code with Biome
make lint

# Run both formatter and linter
make check
```

## Testing GitHub Actions Locally

This project uses [act](https://github.com/nektos/act) to run GitHub Actions locally. Act allows you to test your workflows before pushing to GitHub.

### Prerequisites

Install act on your system:

```bash
# macOS (using Homebrew)
brew install act

# Or using curl
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

### Usage

```bash
# Run the test workflow locally (quiet mode)
make act-test

# Run with verbose output for debugging
make act-test-verbose

# List all available jobs
make act-list

# Perform a dry run (see what would happen without running)
make act-dry

# Clean up Docker resources after testing
make act-clean
```

### First Time Setup

When you first run act, it will ask you to choose a Docker image size:
- Choose **Medium** for most cases (recommended)
- This downloads a ~500MB Docker image with common tools

### Troubleshooting

If you encounter issues:

1. Make sure Docker is running
2. For permission issues, you might need to run with `sudo`
3. Check act logs for specific error messages

```bash
# Run with verbose output for debugging
act -j test --verbose
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
