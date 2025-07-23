# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Monorepo Architecture

This is a **TypeScript monorepo template** using pnpm workspaces. Key architectural principles:

- **Package Structure**: Each package in `packages/` is self-contained with its own `package.json`, `tsconfig.json`, and build scripts
- **Workspace Dependencies**: Use `workspace:*` protocol for internal package dependencies (e.g., `@company/core: "workspace:*"`)
- **TypeScript Project References**: Packages reference each other via `tsconfig.json` references for proper build ordering

## Development Workflow Commands

Essential commands that aren't obvious from package.json inspection:

```bash
# Install dependencies for entire monorepo
pnpm install

# Run commands across all packages
pnpm -r run build          # Build all packages
pnpm -r run test           # Test all packages
pnpm -r --parallel run dev # Watch mode for all packages

# Work with specific packages
pnpm --filter @company/core build
pnpm --filter @company/utils test
```

## Project-Specific Conventions

- **Package Naming**: Use scoped names `@company/package-name` format
- **Cross-Package Imports**: Import from package names, not relative paths: `import { Logger } from '@company/core'`
- **Build Order**: TypeScript project references handle build dependencies automatically
- **Testing**: Each package has its own test setup with Mocha + Chai

## Code Generation Patterns

When creating new packages:

1. Copy structure from existing packages (`packages/core` or `packages/utils`)
2. Update `package.json` name and dependencies
3. Add TypeScript project references in `tsconfig.json` if depending on other packages
4. Follow the established src/test directory structure

## Build & Integration Points

- **Root TypeScript Config**: Shared base configuration with path mapping for all packages
- **ESLint**: Monorepo-aware with project-specific overrides for test files
- **Husky + lint-staged**: Pre-commit hooks run linting and formatting across changed files
- **GitHub Actions**: CI pipeline tests all Node.js versions and runs full build/test cycle

## Additional Instructions

- PLEASE REF TO './instructions/copilot-instructions.md'
