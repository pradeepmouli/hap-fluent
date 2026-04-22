# hap-fluent Development Guidelines

## Project Overview

Fluent, strongly-typed wrapper for HAP-NodeJS services and characteristics. Provides a type-safe, fluent API for building Homebridge plugins — eliminating boilerplate with compile-time type safety and structured logging.

## Tech Stack

- TypeScript 5, Node.js ≥20, Homebridge / HAP-NodeJS
- Vitest (test runner), ESLint + Prettier (lint/format)
- pnpm workspaces (monorepo), changesets (releases)

## Project Structure

```text
packages/hap-fluent/   # Core fluent wrapper
packages/hap-codegen/  # HAP interface code generator
packages/hap-test/     # Test utilities
apps/                  # Demo applications
specs/                 # Specification documents
docs/                  # VitePress documentation
```

## Commands

```bash
pnpm install        # Install dependencies
pnpm test           # Run tests
pnpm run type-check # TypeScript strict mode
pnpm run build      # Build
pnpm run lint       # ESLint
pnpm run format     # Prettier
```

## Code Style

- TypeScript strict mode, no `any`
- ESLint + Prettier for linting and formatting
- Conventional commits

## Key Patterns

- **Fluent builder API** — `service.characteristic('On').onGet(...).onSet(...)` method chaining
- **Generated HAP interfaces** — `hap-codegen` produces typed service/characteristic interfaces from HAP spec
- **FluentCharacteristic wrapper** — strongly-typed get/set/subscribe with interceptor support
- **Interceptor pipeline** — built-in logging, rate-limiting, transformation, and codec interceptors

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->
