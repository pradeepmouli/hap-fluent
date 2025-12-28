<!--
Sync Impact Report (Last Amendment: 2025-12-26)
Version: 1.0.0 → 1.1.0 (Workflow quality gates enhancement)

Modified/Added Principles:
  ✓ I. Type Safety First - unchanged
  ✓ II. Library-First Architecture - unchanged
  ✓ III. Test-First Development - unchanged
  ✓ IV. Fluent API Design - unchanged
  ✓ V. Developer Experience - unchanged

Enhanced Sections:
  ✓ Development Workflow - EXPANDED
    - Added Core Workflow (Feature Development) description
    - Added Extension Workflows list (Baseline, Bugfix, Enhancement, etc.)
    - Added Workflow Selection guidance
    - Added Quality Gates by Workflow (9 workflow types with specific gates)

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

### Core Workflow (Feature Development)

The standard feature development lifecycle:
1. Feature request initiates with `/speckit.specify <description>`
2. Clarification via `/speckit.clarify` to resolve ambiguities
3. Technical planning with `/speckit.plan` to create implementation design
4. Task breakdown using `/speckit.tasks` for execution roadmap
5. Implementation via `/speckit.implement` following task order

### Extension Workflows

Development activities beyond standard features use specialized workflows:
- **Baseline**: `/speckit.baseline` → baseline-spec.md + current-state.md establishing project context
- **Bugfix**: `/speckit.bugfix "<description>"` → bug-report.md + tasks.md with regression test requirement
- **Enhancement**: `/speckit.enhance "<description>"` → enhancement.md (condensed single-doc with spec + plan + tasks)
- **Modification**: `/speckit.modify <feature_num> "<description>"` → modification.md + impact analysis + tasks.md
- **Refactor**: `/speckit.refactor "<description>"` → refactor.md + baseline metrics + incremental tasks.md
- **Hotfix**: `/speckit.hotfix "<incident>"` → hotfix.md + expedited tasks.md + post-mortem.md (within 48 hours)
- **Deprecation**: `/speckit.deprecate <feature_num> "<reason>"` → deprecation.md + dependency scan + phased tasks.md
- **Review**: `/speckit.review <task_id>` → review implementation against spec + update tasks.md + generate report
- **Cleanup**: `/speckit.cleanup` → organize specs/ directory + archive old branches + update documentation

### Workflow Selection

Development activities SHALL use the appropriate workflow type based on the nature of the work. Each workflow enforces specific quality gates and documentation requirements tailored to its purpose:

- **Baseline** (`/speckit.baseline`): Project context establishment - requires comprehensive documentation of existing architecture and change tracking
- **Feature Development** (`/speckit.specify`): New functionality - requires full specification, planning, and TDD approach
- **Bug Fixes** (`/speckit.bugfix`): Defect remediation - requires regression test BEFORE applying fix
- **Enhancements** (`/speckit.enhance`): Minor improvements to existing features - streamlined single-document workflow with simple single-phase plan (max 7 tasks)
- **Modifications** (`/speckit.modify`): Changes to existing features - requires impact analysis and backward compatibility assessment
- **Refactoring** (`/speckit.refactor`): Code quality improvements - requires baseline metrics, behavior preservation guarantee, and incremental validation
- **Hotfixes** (`/speckit.hotfix`): Emergency production issues - expedited process with deferred testing and mandatory post-mortem
- **Deprecation** (`/speckit.deprecate`): Feature sunset - requires phased rollout (warnings → disabled → removed), migration guide, and stakeholder approvals

The wrong workflow SHALL NOT be used - features must not bypass specification, bugs must not skip regression tests, refactorings must not alter behavior, and enhancements requiring complex multi-phase plans must use full feature development workflow.

### Quality Gates by Workflow

**Baseline**:
- Comprehensive project analysis MUST be performed
- All major components MUST be documented in baseline-spec.md
- Current state MUST enumerate all changes by workflow type
- Architecture and technology stack MUST be accurately captured

**Feature Development**:
- Specification MUST be complete before planning
- Plan MUST pass constitution checks before task generation
- Tests MUST be written before implementation (TDD)
- Code review MUST verify constitution compliance

**Bugfix**:
- Bug reproduction MUST be documented with exact steps
- Regression test MUST be written before fix is applied
- Root cause MUST be identified and documented
- Prevention strategy MUST be defined

**Enhancement**:
- Enhancement MUST be scoped to a single-phase plan with no more than 7 tasks
- Changes MUST be clearly defined in the enhancement document
- Tests MUST be added for new behavior
- If complexity exceeds single-phase scope, full feature workflow MUST be used instead

**Modification**:
- Impact analysis MUST identify all affected files and contracts
- Original feature spec MUST be linked
- Backward compatibility MUST be assessed
- Migration path MUST be documented if breaking changes

**Refactor**:
- Baseline metrics MUST be captured before any changes unless explicitly exempted
- Tests MUST pass after EVERY incremental change
- Behavior preservation MUST be guaranteed (tests unchanged)
- Target metrics MUST show measurable improvement unless explicitly exempted

**Hotfix**:
- Severity MUST be assessed (P0/P1/P2)
- Rollback plan MUST be prepared before deployment
- Fix MUST be deployed and verified before writing tests (exception to TDD)
- Post-mortem MUST be completed within 48 hours of resolution

**Deprecation**:
- Dependency scan MUST be run to identify affected code
- Migration guide MUST be created before Phase 1
- All three phases MUST complete in sequence (no skipping)
- Stakeholder approvals MUST be obtained before starting

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

**Version**: 1.1.0 | **Ratified**: 2025-12-25 | **Last Amended**: 2025-12-26
