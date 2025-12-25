# HAP Fluent Monorepo

Type-safe, fluent wrappers and tooling for working with HAP-NodeJS and Homebridge.

## Packages

- **`packages/hap-fluent`**: Fluent, strongly-typed wrapper for HAP-NodeJS services and characteristics.
- **`packages/hap-codegen`**: Code generator for HAP-NodeJS service and characteristic TypeScript interfaces.

## Quick Start (Development)

```bash
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
│   ├── hap-codegen/    # HAP interface code generation
│   └── hap-fluent/     # Fluent Homebridge/HAP wrapper
├── .github/
│   ├── workflows/      # CI/CD workflows
│   └── copilot-instructions.md
├── eslint.config.ts    # ESLint configuration
├── prettier.config.ts  # Prettier configuration
├── tsconfig.json       # Root TypeScript configuration
└── pnpm-workspace.yaml # pnpm workspace configuration
```

## Common Scripts

- `pnpm run build` - Build all packages
- `pnpm run test` - Run tests for all packages
- `pnpm run lint` - Lint all TypeScript files
- `pnpm run format` - Format all files with Prettier
- `pnpm run type-check` - Run TypeScript type checking
- `pnpm run clean` - Clean all build artifacts

## Package-Specific Scripts

- `pnpm --filter hap-codegen run download` - Fetch HAP definitions.
- `pnpm --filter hap-codegen run generate` - Generate TypeScript interfaces.
- `pnpm --filter hap-fluent run test` - Run hap-fluent tests.

## License

Apache-2.0
