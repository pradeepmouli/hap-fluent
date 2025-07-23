# TypeScript Monorepo Template

A production-ready TypeScript monorepo template with pnpm, ESLint, Prettier, and Mocha.

## Features

- 🏗️ **Monorepo Structure**: pnpm workspaces for efficient dependency management
- 🔧 **TypeScript**: Strict TypeScript configuration with project references
- 🎯 **ESLint + Prettier**: Consistent code style and quality
- 🧪 **Testing**: Mocha test framework with Chai assertions
- 🚀 **CI/CD**: GitHub Actions workflow for testing and building
- 🎣 **Git Hooks**: Pre-commit hooks with Husky and lint-staged

## Quick Start

```bash
# Clone the template
git clone <repository-url>
cd ts-template

# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm run test

# Start development mode
pnpm run dev
```

## Project Structure

```
├── packages/
│   ├── core/           # Core utilities and shared functionality
│   └── utils/          # Additional utilities building on core
├── .github/
│   ├── workflows/      # CI/CD workflows
│   └── copilot-instructions.md
├── .eslintrc.js        # ESLint configuration
├── .prettierrc         # Prettier configuration
├── .mocharc.json       # Mocha test configuration
├── tsconfig.json       # Root TypeScript configuration
└── pnpm-workspace.yaml # pnpm workspace configuration
```

## Scripts

- `pnpm run build` - Build all packages
- `pnpm run test` - Run tests for all packages
- `pnpm run lint` - Lint all TypeScript files
- `pnpm run format` - Format all files with Prettier
- `pnpm run type-check` - Run TypeScript type checking
- `pnpm run clean` - Clean all build artifacts

## Adding New Packages

1. Create a new directory in `packages/`
2. Copy the structure from an existing package
3. Update `package.json` with the new package name
4. Add dependencies and TypeScript references as needed

## License

MIT
