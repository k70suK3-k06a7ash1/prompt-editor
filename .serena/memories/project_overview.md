# Project Overview

## Purpose
React + TypeScript + Vite application for editing prompts with dynamic variable replacement. The app extracts variables in `${prop}` format from user-entered system prompts, generates input fields for those variables, reconstructs the final prompt with user-provided values, and persists prompts using PGlite (in-browser PostgreSQL).

## Tech Stack
- **Frontend**: React 19, TypeScript 5.7
- **Build Tool**: Vite 7 with React plugin
- **Database**: PGlite (in-browser PostgreSQL) with live queries
- **Styling**: Tailwind CSS v4 with Inter font
- **Icons**: Lucide React
- **Testing**: Vitest with jsdom, Testing Library
- **Code Quality**: Biome (formatter/linter), ESLint
- **UI Components**: Custom components with Radix UI primitives

## Key Dependencies
- @electric-sql/pglite - In-browser PostgreSQL database
- @electric-sql/pglite-react - React hooks for PGlite
- @radix-ui/react-slot - Radix UI primitives
- lucide-react - Icon library
- tailwindcss - Utility-first CSS framework
- class-variance-authority - Component variant management
- clsx/tailwind-merge - CSS class utilities