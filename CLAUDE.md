# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite application for editing prompts with dynamic variable replacement. The app extracts variables in `${prop}` format from user-entered system prompts, generates input fields for those variables, and reconstructs the final prompt with user-provided values.

## Development Commands

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production (runs TypeScript compilation first)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Architecture

### Core Structure
- **App.tsx**: Main application component and layout
- **src/components/**: Component directory (currently empty in template)
- Standard Vite React setup with TypeScript

### Key Implementation Requirements
Based on `requirements.md`, the application should implement:

1. **PromptEditor Component**: 
   - Extract variables using `/\$\{(\w+)\}/g` regex pattern
   - Dynamic input field generation for each unique variable
   - Real-time prompt reconstruction with variable substitution
   - State management for `originalPrompt`, `variables`, `variableValues`, `generatedPrompt`

2. **UI Structure**:
   - Prompt input textarea
   - Dynamic variable input fields 
   - Generated prompt display area
   - Reset functionality

3. **Styling**: Uses Tailwind CSS with Inter font

### Technology Stack
- **Frontend**: React 19, TypeScript 5.7
- **Build Tool**: Vite 6.3
- **Linting**: ESLint 9 with React-specific rules
- **Styling**: CSS (Tailwind CSS mentioned in requirements)

## Development Notes

- The current codebase contains only the Vite React template
- No test framework is currently configured
- ESLint is configured with React hooks and React refresh plugins
- The makefile provides a `push` command for git operations