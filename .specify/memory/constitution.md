<!--
Sync Impact Report (Last Amendment: 2025-12-25)
Version: 0.0.0 → 1.0.0 (Initial constitution)

Modified/Added Principles:
  ✓ I. Type Safety First - NEW
  ✓ II. Library-First Architecture - NEW
  ✓ III. Test-First Development - NEW
  ✓ IV. Fluent API Design - NEW
  ✓ V. Developer Experience - NEW

Templates Status:
  ✅ plan-template.md - reviewed, no updates required (already aligned)
  ✅ spec-template.md - reviewed, no updates required (already aligned)
  ✅ tasks-template.md - reviewed, no updates required (already aligned)
  ✅ checklist-template.md - reviewed
  ✅ agent-file-template.md - reviewed

Follow-up TODOs: None
-->

# HAP Fluent Monorepo Constitution

## Core Principles

### I. Type Safety First (NON-NEGOTIABLE)

**Strict TypeScript discipline**:
- NO `as any` casts except when absolutely necessary with documented justification
- NO `@ts-ignore` or `@ts-expect-error` directives without issue tracking and migration plan
- Runtime validation MUST accompany type assertions
- Generated types (hap-codegen) MUST be kept in sync with HAP-NodeJS definitions
- All public APIs MUST have explicit return types

**Rationale**: Type safety prevents runtime errors and provides excellent developer experience. The library wraps HAP-NodeJS to improve type safety; weakening types defeats the core value proposition.

### II. Library-First Architecture

**Every feature starts as a standalone library**:
- Libraries MUST be self-contained and independently testable
- Libraries MUST have clear, single purpose (no "utils" or "common" dumping grounds)
- Each package has explicit exports via `package.json` `exports` field
- Dependencies MUST be correctly categorized (peer vs dev vs runtime)
  - `hap-nodejs` and `homebridge` → peerDependencies
  - Build tools → devDependencies
  - Runtime utilities → dependencies

**Rationale**: Clear separation ensures reusability, testability, and maintainability. Correct dependency resolution prevents version conflicts in consumer projects.

### III. Test-First Development

**TDD discipline**:
- Tests MUST be written before implementation
- Tests MUST fail initially (red)
- Implement minimum code to pass (green)
- Refactor with safety (tests stay green)
- Coverage targets: >80% line coverage, >70% branch coverage

**Test categories**:
- Unit tests: Individual classes/functions with mocked dependencies
- Integration tests: Real HAP-NodeJS service/characteristic interactions
- Contract tests: Verify interface/API contracts remain stable

**Rationale**: Test-first ensures testable design, prevents regressions, and serves as executable documentation. HAP-NodeJS integration is complex; tests catch errors early.

### IV. Fluent API Design

**Fluent interfaces MUST**:
- Support method chaining with consistent `this` returns
- Provide type-safe builders that guide correct usage
- Hide HAP-NodeJS complexity while preserving full functionality
- Use clear, domain-appropriate naming (no jargon unless HAP-standard)
- Document common patterns and provide working examples

**Rationale**: Fluent APIs reduce boilerplate, improve readability, and make correct usage obvious. The library's value is in improving developer ergonomics over raw HAP-NodeJS.

### V. Developer Experience (DX)

**All code MUST prioritize DX**:
- Comprehensive JSDoc on all public APIs
- Working, tested examples in `examples/` directories
- Error messages MUST be actionable with clear resolution steps
- Source maps enabled for debugging
- Package exports configured for modern tooling (ESM/CJS compatibility)

**Documentation MUST include**:
- Package-level README with quickstart
- API reference (can be generated from JSDoc)
- Migration guides for breaking changes
- Changelog following keepachangelog.com format

**Rationale**: Library adoption depends on low friction. Clear docs, helpful errors, and working examples reduce support burden and increase success rate.

## Quality Standards

### Code Quality Requirements

- NO commented-out code blocks in committed code (use git history)
- NO broken examples in examples/ directories
- NO syntax errors or linting violations in committed code
- Consistent code style enforced via ESLint and Prettier
- All promises MUST be handled (async/await with try-catch or .catch())

### Error Handling

**All error paths MUST be explicit**:
- Custom error classes for different failure modes
- Errors MUST include context (characteristic name, value, operation)
- Async operations MUST have try-catch blocks
- Invalid inputs MUST be validated with clear error messages
- NO silent failures

### Dependency Management

- Lock files (`pnpm-lock.yaml`) MUST be committed
- Dependencies MUST be kept reasonably up-to-date (quarterly reviews)
- Security vulnerabilities MUST be addressed promptly
- Use workspace protocol (`workspace:*`) for internal dependencies

## Development Workflow

### Code Review Gates

All PRs MUST pass:
1. TypeScript compilation with strict mode
2. ESLint with no errors
3. Prettier formatting
4. All tests passing (unit + integration)
5. Coverage thresholds met (if applicable)
6. Manual code review approving changes

### Release Process

**Versioning** (Semantic Versioning 2.0.0):
- MAJOR: Breaking changes to public API or removing features
- MINOR: New features, backwards-compatible additions
- PATCH: Bug fixes, documentation, internal refactors

**Release checklist**:
- Update CHANGELOG.md with changes
- Bump version in package.json
- Create git tag `v{version}`
- Publish to npm (if public)
- Create GitHub release with notes

### Testing Requirements

Before marking feature complete:
- Unit tests for all new functions/classes
- Integration tests for HAP-NodeJS interactions
- Examples updated or added
- Documentation updated
- Manual smoke test in real Homebridge environment

## Governance

**Constitution Authority**: This constitution supersedes all other practices and conventions. When conflicts arise, constitution takes precedence.

**Amendment Process**:
1. Propose change with rationale (issue or PR)
2. Document impact on existing code/practices
3. Require maintainer approval
4. Update constitution with version bump
5. Create migration plan if changes affect existing code
6. Announce changes to contributors

**Version Policy**:
- MAJOR: Removing/redefining core principles
- MINOR: Adding new principles or expanding existing ones
- PATCH: Clarifications, typos, non-semantic updates

**Compliance Review**: All feature PRs MUST include constitutional compliance section verifying adherence to principles (see templates).

**Runtime Guidance**: For agent-specific development guidance beyond this constitution, refer to `.github/copilot-instructions.md` and TypeScript instructions in VS Code settings.

**Version**: 1.0.0 | **Ratified**: 2025-12-25 | **Last Amended**: 2025-12-25
