# Refactor Spec: Complete Enhancement Implementation - Production Readiness

**Refactor ID**: refactor-001
**Branch**: `refactor/001-implement-phase-1`
**Created**: 2025-12-25
**Type**: [x] Maintainability | [x] Security | [x] Tech Debt | [x] Performance | [x] Architecture
**Impact**: [x] Medium Risk
**Status**: [x] Planning | [ ] Baseline Captured | [ ] In Progress | [ ] Validation | [ ] Complete

## Input
User description: "Implement all phases of enhancement proposals: Fix type safety violations, add error handling, clean up code quality issues, correct package dependencies, improve developer experience, add comprehensive testing, implement advanced features, optimize performance, and enhance build tooling"

## Motivation

### Current State Problems
**Code Smell(s)**:
- [x] Type Safety Violations (`as any`, `@ts-ignore`)
- [x] Missing Error Handling (no try-catch in async operations)
- [x] Dead Code (large commented-out blocks)
- [x] Inconsistent Validation (some methods validate, others don't)
- [x] Magic Dependencies (incorrect peerDependencies configuration)
- [x] Broken Examples (syntax errors in usage-examples.ts)

**Concrete Examples**:
- `packages/hap-fluent/src/FluentService.ts` lines 73, 83, 89, 92: Multiple `as any` casts defeating type safety
- `packages/hap-fluent/src/AccessoryHandler.ts` lines 66, 69, 150: `@ts-ignore` and `@ts-expect-error` masking issues
- `packages/hap-fluent/src/AccessoryHandler.ts` lines 102-113, 240-294: Large blocks of commented-out code
- `packages/hap-fluent/examples/usage-examples.ts` line 25: Syntax error preventing examples from running
- `packages/hap-fluent/package.json`: `homebridge` and `hap-nodejs` in devDependencies instead of peerDependencies
- `packages/hap-fluent/src/FluentCharacteristic.ts`: No error handling in async set/get operations
- `packages/hap-fluent/src/FluentService.ts`: `getOrAddService` validates, but `wrapService` doesn't

### Business/Technical Justification
[x] **Blocking new features**: Type safety issues prevent safe refactoring and feature additions
[x] **Causing frequent bugs**: Missing error handling leads to silent failures and crashes
[x] **Developer velocity impact**: Broken examples and unclear APIs slow down adoption
[x] **Technical debt accumulation**: Code quality issues compound, making maintenance harder

**Why NOW**:
- Library is approaching 1.0.0 release - must implement all enhancements before stable API
- Current type safety violations violate new constitution principles (Type Safety First)
- Incorrect dependency configuration causes version conflicts for consumers
- Missing developer experience features blocking adoption
- No comprehensive testing strategy limits confidence
- Performance optimizations needed before scaling
- Complete overhaul is easier than incremental fixes across multiple releases

## Proposed Improvement

### Refactoring Pattern/Technique
**Primary Techniques** (6 Phases):
1. **Phase 1 - Code Quality & Robustness**: Type safety restoration, error handling, code cleanup
2. **Phase 2 - Developer Experience**: Documentation, improved error messages, debug logging
3. **Phase 3 - Testability**: Test coverage, integration tests, property-based testing
4. **Phase 4 - Advanced Features**: Validation framework, event system, middleware/plugins
5. **Phase 5 - Performance**: Caching layer, batching support, optimization
6. **Phase 6 - Build & Tooling**: Source maps, modern exports, bundle size tracking

**High-Level Approach**:
Implement comprehensive enhancements incrementally across 6 phases, each building on the previous:

**Phase 1 (Critical Foundation)**:
- Remove all type safety violations with proper type guards
- Add comprehensive error handling with custom error classes
- Clean up dead code and fix broken examples
- Correct package dependency configuration

**Phase 2 (Developer Experience)**:
- Create comprehensive README and API documentation
- Improve error messages with actionable context
- Add debug logging with `debug` package
- Create type utilities for better DX

**Phase 3 (Testing Infrastructure)**:
- Add test coverage reporting and tracking
- Implement integration tests with real HAP-NodeJS
- Add property-based tests for complex scenarios
- Establish coverage thresholds

**Phase 4 (Advanced Features)**:
- Implement validation framework with composable validators
- Add event system for characteristic changes
- Create middleware/plugin system for extensibility

**Phase 5 (Performance)**:
- Add intelligent caching layer
- Implement batch operations for bulk updates
- Optimize memory usage and bundle size

**Phase 6 (Build Tooling)**:
- Enable source maps for production debugging
- Add modern package exports for tree-shaking
- Implement bundle size tracking in CI

**Files Affected** (Complete List):
- **Modified**:
  - `packages/hap-fluent/src/FluentCharacteristic.ts` (error handling, events, caching)
  - `packages/hap-fluent/src/FluentService.ts` (type safety, validation, batching)
  - `packages/hap-fluent/src/AccessoryHandler.ts` (cleanup, type guards)
  - `packages/hap-fluent/examples/*.ts` (fix all examples, add new patterns)
  - `packages/hap-fluent/package.json` (dependencies, exports, scripts)
  - `packages/hap-fluent/tsconfig.json` (source maps)
  - `packages/hap-fluent/vitest.config.ts` (coverage config)
  - `packages/hap-fluent/src/index.ts` (export new modules)
- **Created**:
  - `packages/hap-fluent/README.md` (comprehensive documentation)
  - `packages/hap-fluent/CHANGELOG.md` (version history)
  - `packages/hap-fluent/src/errors.ts` (custom error classes)
  - `packages/hap-fluent/src/type-guards.ts` (runtime validation)
  - `packages/hap-fluent/src/type-utils.ts` (DX type utilities)
  - `packages/hap-fluent/src/validation.ts` (validation framework)
  - `packages/hap-fluent/src/middleware.ts` (plugin system)
  - `packages/hap-fluent/src/cache.ts` (caching layer)
  - `packages/hap-fluent/test/integration/` (integration test suite)
  - `packages/hap-fluent/test/property-based/` (property tests)
  - `.github/workflows/size.yml` (bundle size CI)
- **Deleted**:
  - Dead code in AccessoryHandler.ts (inline removal)

### Design Improvements
**Before** (Current State):
```typescript
// Phase 1 Issues:
// - Unsafe type casts
const obj = { ...e, value: value as any };
// - No error handling
async set(value: T): Promise<void> {
  this.characteristic.updateValue(value);
}
// - Incorrect dependencies
{ "devDependencies": { "homebridge": "^1.11.0" } }

// Phase 2 Issues:
// - No documentation, unclear errors
// - No debug logging

// Phase 3 Issues:
// - No integration tests
// - No coverage reporting

// Phase 4 Issues:
// - No validation framework
// - No events or middleware

// Phase 5 Issues:
// - No caching
// - No batch operations

// Phase 6 Issues:
// - No source maps
// - No modern exports
```

**After** (All Phases Complete):
```typescript
// Phase 1: Type Safety & Error Handling
if (!isCharacteristicValue(value)) {
  throw new ValidationError(`Invalid value: ${typeof value}`, { value });
}
const obj = { ...e, value };

async set(value: T): Promise<void> {
  try {
    await this.runMiddleware('beforeSet', value);
    this.validateValue(value);
    this.characteristic.updateValue(value);
    this.events.emit('set', value);
    await this.runMiddleware('afterSet', value);
  } catch (error) {
    log('set failed', { value, error });
    throw new FluentCharacteristicError('Set failed', {
      characteristic: this.name, value, originalError: error
    });
  }
}

// Phase 2: Documentation & DX
/**
 * Set characteristic value with validation
 * @throws {ValidationError} If value is invalid
 * @throws {FluentCharacteristicError} If update fails
 */

// Phase 3: Integration Tests
describe('FluentCharacteristic integration', () => {
  it('should set value on real HAP service', async () => {
    // Real HAP-NodeJS integration test
  });
});

// Phase 4: Validation & Events
char.addValidator(new RangeValidator(0, 100))
    .on('change', (newVal, oldVal) => log(newVal));

// Phase 5: Caching & Batching
char.enableCache({ ttl: 5000 });
service.updateBatch({ On: true, Brightness: 75 });

// Phase 6: Modern Exports
{
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
    "./errors": { "import": "./dist/errors.js" }
  },
  "peerDependencies": {
    "homebridge": "^1.8.0 || ^2.0.0",
    "hap-nodejs": "^0.11.0 || ^0.12.0 || ^0.13.0"
  }
}
```
```

## Baseline Metrics
*Captured before refactoring begins - run: `.specify/extensions/workflows/refactor/measure-metrics.sh --before`*

### Code Complexity
- **Type Safety Violations**: 11+ instances (`as any`: 7, `@ts-ignore`/`@ts-expect-error`: 4+)
- **Lines of Code**: ~1200 lines across packages/hap-fluent/src
- **Function Length**: Some functions >50 lines with complex logic
- **Dead Code**: ~65 lines of commented-out code in AccessoryHandler.ts
- **Broken Examples**: 1 syntax error in usage-examples.ts
- **Documentation**: No package README, minimal JSDoc, no API reference

### Test Coverage
- **Overall Coverage**: To be measured with `pnpm run test:coverage`
- **Current Test Files**: 4 test files (unit tests only)
- **Integration Tests**: 0 (no real HAP-NodeJS integration)
- **Property-Based Tests**: 0
- **Test Status**: All tests passing (baseline requirement)

### Dependencies & Configuration
- **Configuration Issues**: 2 packages incorrectly in devDependencies
- **Missing Exports**: No modern `exports` field in package.json
- **Source Maps**: Present in tsconfig but not verified
- **Bundle Size**: Not tracked

### Features
- **Error Handling**: Minimal (no custom error classes)
- **Validation**: Inconsistent across methods
- **Events**: None
- **Middleware**: None
- **Caching**: None
- **Batching**: None

## Target Metrics
*Goals to achieve across all phases - measurable success criteria*

### Phase 1 Targets (Code Quality & Robustness)
- **Type Safety Violations**: Reduce to 0 (from 11+)
- **Dead Code**: Remove all commented-out blocks (65+ lines)
- **Broken Examples**: Fix all syntax errors (1 known)
- **Error Handling**: 100% coverage of async operations
- **Dependencies**: Move 2 packages to peerDependencies

### Phase 2 Targets (Developer Experience)
- **Documentation**: Add comprehensive README (500+ lines)
- **API Reference**: Generate from JSDoc
- **CHANGELOG**: Create and maintain
- **Error Messages**: All actionable with context
- **Debug Logging**: Implement with debug package
- **Type Utilities**: Export 5+ helper types

### Phase 3 Targets (Testability)
- **Test Coverage**: Increase to >80% line coverage, >70% branch
- **Integration Tests**: Add 10+ test scenarios with real HAP
- **Property-Based Tests**: Add for critical functions
- **Coverage Reporting**: Enable and track in CI

### Phase 4 Targets (Advanced Features)
- **Validation Framework**: Implement with 5+ built-in validators
- **Event System**: Add to FluentCharacteristic
- **Middleware**: Create plugin system with 3+ built-in middleware

### Phase 5 Targets (Performance)
- **Caching**: Implement with TTL and size limits
- **Batching**: Add batch operations for services
- **Bundle Size**: Track and optimize (target: no increase)
- **Memory**: Profile and optimize characteristic storage

### Phase 6 Targets (Build & Tooling)
- **Source Maps**: Verify enabled and working
- **Modern Exports**: Add exports field with subpath exports
- **Bundle Size CI**: Add GitHub workflow tracking
- **Build Time**: Maintain or improve

### Success Threshold
**Minimum acceptable improvement**:
- All Phase 1 targets achieved (critical foundation)
- All Phase 2 targets achieved (documentation essential for 1.0)
- ≥70% of Phase 3 targets (core testing infrastructure)
- ≥50% of Phase 4-6 targets (nice-to-have enhancements)
- Zero type safety violations
- All tests passing
- No performance regression >5%
- Library usable in production (1.0.0 ready)

## Behavior Preservation Guarantee
*CRITICAL: Refactoring MUST NOT change external behavior*

### External Contracts Unchanged
- [ ] API endpoints return same responses
- [ ] Function signatures unchanged (or properly deprecated)
- [ ] Component props unchanged
- [ ] CLI arguments unchanged
- [ ] Database schema unchanged
- [ ] File formats unchanged

### Test Suite Validation
- [ ] **All existing tests MUST pass WITHOUT modification**
- [ ] If test needs changing, verify it was testing implementation detail, not behavior
- [ ] Do NOT weaken assertions to make tests pass

### Behavioral Snapshot
**Key behaviors to preserve**:
1. [Behavior 1: specific observable output for given input]
2. [Behavior 2: specific side effect or state change]
3. [Behavior 3: specific error handling]

**Test**: Run before and after refactoring, outputs MUST be identical

## Risk Assessment

### Risk Level Justification
**Why Medium Risk**:
- **Code Touched**: Core library files (FluentCharacteristic, FluentService, AccessoryHandler) - central to all functionality
- **User Impact**: Library used by Homebridge plugins - must not break existing integrations
- **Complexity**: Touching type system, error handling, and async operations - multiple failure modes
- **Blast Radius**: Medium - affects all users, but can be rolled back via npm versioning
- **Mitigation**: Comprehensive testing, incremental implementation, 6-phase approach allows partial rollback

### Potential Issues
- **Risk 1**: Type changes break consumer code
  - **Mitigation**: Run tests after each change; use type guards instead of removing types; deprecate before removal
  - **Rollback**: Git revert specific type changes; publish patch version

- **Risk 2**: New error handling throws in unexpected places
  - **Mitigation**: Document all new error cases; ensure errors include context; test error paths
  - **Rollback**: Revert error handling commits; publish patch version

- **Risk 3**: Performance regression from validation/middleware
  - **Mitigation**: Benchmark before/after; make validation/middleware opt-in; profile hot paths
  - **Rollback**: Disable performance-affecting features; optimize or revert

- **Risk 4**: Breaking changes in peer dependencies
  - **Mitigation**: Test with multiple versions of homebridge/hap-nodejs; document version compatibility
  - **Rollback**: Adjust peerDependencies range; publish patch

### Safety Measures
- [x] Incremental commits (can revert partially per phase)
- [x] Peer review required for all changes
- [x] Comprehensive test suite (existing + new)
- [x] Behavioral snapshot for validation
- [x] Phased approach allows stopping at any phase
- [x] Version tags for each phase completion
- [N/A] Feature flags (library has no runtime flags, but phases are independently releasable)
- [N/A] Staging environment (consumers test in their own environments)

## Rollback Plan

### How to Undo
**Per-Phase Rollback** (recommended):
1. Identify which phase introduced the issue
2. `git revert <phase-commit-range>`
3. Run full test suite to verify rollback
4. Publish new patch version
5. Announce rollback in GitHub release notes

**Full Rollback** (if multiple phases affected):
1. `git checkout <pre-refactor-tag>`
2. Create new branch: `git checkout -b rollback-refactor-001`
3. Cherry-pick any unrelated fixes if needed
4. Run full test suite
5. Publish as new patch version
6. Update CHANGELOG with rollback notice

### Rollback Triggers
Revert if any of these occur:
- [ ] Test suite failures in CI
- [ ] Performance regression > 5% in benchmarks
- [ ] Consumer reports of breaking changes (>3 independent reports)
- [ ] Critical bugs that can't be hotfixed within 24 hours
- [ ] TypeScript compilation errors in known consumer projects

### Recovery Time Objective
**RTO**: < 2 hours from decision to publish
- Git operations: < 15 minutes
- Test suite validation: < 30 minutes
- npm publish: < 5 minutes
- Communication: < 30 minutes

## Implementation Plan

### Phase 0: Baseline (Before ANY Refactoring)
1. Run `.specify/extensions/workflows/refactor/measure-metrics.sh --before`
2. Document all baseline metrics in [metrics-before.md](./metrics-before.md)
3. Fill out [behavioral-snapshot.md](./behavioral-snapshot.md) with current behaviors
4. Ensure 100% test pass rate: `pnpm run test`
5. Run type check: `pnpm run type-check`
6. Create git tag: `git tag pre-refactor-001 -m "Baseline before comprehensive refactor"`
7. Commit baseline documentation

### Phase 1: Code Quality & Robustness (CRITICAL - Must Complete)
**Goal**: Type-safe, error-handled, clean foundation

1. **Create Error Infrastructure**
   - [ ] Create `src/errors.ts` with custom error classes (FluentCharacteristicError, ValidationError, etc.)
   - [ ] Create `src/type-guards.ts` with runtime validation functions
   - [ ] Add tests for error classes
   - [ ] Commit: "feat: add custom error classes and type guards"

2. **Fix FluentCharacteristic**
   - [ ] Remove type suppressions in FluentCharacteristic.ts
   - [ ] Add error handling to async set/get/update methods
   - [ ] Add input validation using type guards
   - [ ] Update tests to verify error handling
   - [ ] Commit: "refactor(FluentCharacteristic): add error handling and type safety"

3. **Fix FluentService**
   - [ ] Replace `as any` casts with proper type guards
   - [ ] Add consistent validation to wrapService (match getOrAddService)
   - [ ] Add error handling
   - [ ] Update tests
   - [ ] Commit: "refactor(FluentService): remove type casts and add validation"

4. **Fix AccessoryHandler**
   - [ ] Remove `//@ts-ignore` and `//@ts-expect-error` directives
   - [ ] Delete commented-out code (lines 102-113, 240-294)
   - [ ] Add proper type handling
   - [ ] Update tests
   - [ ] Commit: "refactor(AccessoryHandler): cleanup and type safety"

5. **Fix Package Configuration**
   - [ ] Move homebridge/hap-nodejs to peerDependencies in package.json
   - [ ] Add modern exports field
   - [ ] Update README with installation notes about peer dependencies
   - [ ] Commit: "fix: correct peer dependencies configuration"

6. **Fix Examples**
   - [ ] Fix syntax error in usage-examples.ts line 25
   - [ ] Verify all examples compile and run
   - [ ] Commit: "fix: repair broken examples"

7. **Phase 1 Validation**
   - [ ] Run full test suite: `pnpm run test` (must pass 100%)
   - [ ] Verify behavioral snapshot unchanged
   - [ ] Check type safety: `pnpm run type-check`
   - [ ] Verify no type violations remain: `grep -r "as any\|@ts-ignore\|@ts-expect-error" src/`
   - [ ] Tag: `git tag refactor-001-phase-1 -m "Phase 1: Code Quality Complete"`

### Phase 2: Developer Experience (HIGH PRIORITY)
**Goal**: Comprehensive documentation and improved DX

1. **Create Documentation**
   - [ ] Create comprehensive README.md (installation, quickstart, API overview, examples)
   - [ ] Create CHANGELOG.md following keepachangelog.com
   - [ ] Enhance JSDoc comments on all public APIs
   - [ ] Add examples for common patterns
   - [ ] Commit: "docs: add comprehensive README and CHANGELOG"

2. **Improve Error Messages**
   - [ ] Update all error messages to be actionable
   - [ ] Add context to all thrown errors
   - [ ] Document error handling in README
   - [ ] Commit: "feat: improve error messages with actionable context"

3. **Add Debug Logging**
   - [ ] Add `debug` package dependency
   - [ ] Implement logging in FluentCharacteristic, FluentService
   - [ ] Document DEBUG environment variable usage
   - [ ] Commit: "feat: add debug logging support"

4. **Create Type Utilities**
   - [ ] Create `src/type-utils.ts` with helper types (CharacteristicType, ServiceState, etc.)
   - [ ] Export from index.ts
   - [ ] Add examples of usage
   - [ ] Commit: "feat: add type utilities for better DX"

5. **Phase 2 Validation**
   - [ ] Verify all docs render correctly
   - [ ] Test debug logging in example app
   - [ ] Ensure type utilities work in TypeScript
   - [ ] Tag: `git tag refactor-001-phase-2 -m "Phase 2: Developer Experience Complete"`

### Phase 3: Testability (MEDIUM PRIORITY)
**Goal**: Comprehensive test coverage and infrastructure

1. **Configure Test Coverage**
   - [ ] Update vitest.config.ts with coverage thresholds (>80% line, >70% branch)
   - [ ] Add coverage scripts to package.json
   - [ ] Run baseline coverage report
   - [ ] Commit: "test: configure coverage reporting"

2. **Add Integration Tests**
   - [ ] Create `test/integration/` directory
   - [ ] Add real HAP-NodeJS service integration tests
   - [ ] Test all key user journeys
   - [ ] Commit: "test: add integration test suite"

3. **Add Property-Based Tests**
   - [ ] Add `@fast-check/vitest` dependency
   - [ ] Create `test/property-based/` directory
   - [ ] Add property tests for characteristic values
   - [ ] Commit: "test: add property-based tests"

4. **Phase 3 Validation**
   - [ ] Run coverage: `pnpm run test:coverage`
   - [ ] Verify thresholds met
   - [ ] All tests passing
   - [ ] Tag: `git tag refactor-001-phase-3 -m "Phase 3: Testability Complete"`

### Phase 4: Advanced Features (NICE-TO-HAVE)
**Goal**: Extensibility and power features

1. **Validation Framework**
   - [ ] Create `src/validation.ts` with validator interfaces and built-ins
   - [ ] Integrate into FluentCharacteristic
   - [ ] Add tests and examples
   - [ ] Commit: "feat: add validation framework"

2. **Event System**
   - [ ] Add EventEmitter to FluentCharacteristic
   - [ ] Implement change, get, set events
   - [ ] Add tests and examples
   - [ ] Commit: "feat: add event system to characteristics"

3. **Middleware/Plugin System**
   - [ ] Create `src/middleware.ts` with middleware interface
   - [ ] Implement built-in middleware (logging, rate-limiting, caching)
   - [ ] Integrate into FluentCharacteristic
   - [ ] Add tests and examples
   - [ ] Commit: "feat: add middleware/plugin system"

4. **Phase 4 Validation**
   - [ ] Test all new features work independently
   - [ ] Verify opt-in nature (default behavior unchanged)
   - [ ] Tag: `git tag refactor-001-phase-4 -m "Phase 4: Advanced Features Complete"`

### Phase 5: Performance (LOW PRIORITY)
**Goal**: Optimize for scale

1. **Caching Layer**
   - [ ] Create `src/cache.ts` with TTL and size-limit caching
   - [ ] Add enableCache() to FluentCharacteristic
   - [ ] Benchmark performance improvement
   - [ ] Commit: "feat: add caching layer"

2. **Batch Operations**
   - [ ] Add updateBatch() and getBatch() to FluentService
   - [ ] Optimize for bulk updates
   - [ ] Add tests and examples
   - [ ] Commit: "feat: add batch operations"

3. **Phase 5 Validation**
   - [ ] Run performance benchmarks
   - [ ] Verify no regression in non-cached paths
   - [ ] Tag: `git tag refactor-001-phase-5 -m "Phase 5: Performance Complete"`

### Phase 6: Build & Tooling (LOW PRIORITY)
**Goal**: Modern build infrastructure

1. **Source Maps**
   - [ ] Verify source maps enabled in tsconfig.json
   - [ ] Test source maps work in debugging
   - [ ] Commit: "build: verify source maps configuration"

2. **Modern Exports**
   - [ ] Add subpath exports to package.json
   - [ ] Test tree-shaking works
   - [ ] Commit: "build: add modern package exports"

3. **Bundle Size Tracking**
   - [ ] Create `.github/workflows/size.yml`
   - [ ] Configure size-limit or similar
   - [ ] Add badge to README
   - [ ] Commit: "ci: add bundle size tracking"

4. **Phase 6 Validation**
   - [ ] Verify builds work correctly
   - [ ] Test imports from various tools (webpack, vite, esbuild)
   - [ ] Tag: `git tag refactor-001-phase-6 -m "Phase 6: Build Tooling Complete"`

### Final: Release Preparation
1. **Run Complete Validation**
   - [ ] All tests passing: `pnpm run test`
   - [ ] Coverage thresholds met: `pnpm run test:coverage`
   - [ ] Type check clean: `pnpm run type-check`
   - [ ] Lint clean: `pnpm run lint`
   - [ ] Build successful: `pnpm run build`
   - [ ] Behavioral snapshot matches
   - [ ] Run `.specify/extensions/workflows/refactor/measure-metrics.sh --after`
   - [ ] Compare metrics before/after

2. **Update Version**
   - [ ] Update version in package.json to 1.0.0
   - [ ] Update CHANGELOG.md with all changes
   - [ ] Commit: "chore: prepare v1.0.0 release"

3. **Create Release**
   - [ ] Tag: `git tag v1.0.0 -m "v1.0.0: Production-ready release"`
   - [ ] Push tags: `git push origin --tags`
   - [ ] Create GitHub release with changelog
   - [ ] Publish to npm (if public): `npm publish`

**Principle**: Each commit should compile, pass tests, and leave the code in a working state. Can stop at any phase boundary.

## Verification Checklist

### Pre-Refactoring
- [ ] Baseline metrics captured and documented
- [ ] All tests passing (100% pass rate)
- [ ] Behavioral snapshot created
- [ ] Git tag created
- [ ] Rollback plan prepared

### During Refactoring
- [ ] Incremental commits (each one compiles and tests pass)
- [ ] External behavior unchanged
- [ ] No new dependencies added (unless justified)
- [ ] Comments updated to match code
- [ ] Dead code removed

### Post-Refactoring
- [ ] All tests still passing (100% pass rate)
- [ ] Target metrics achieved or improvement demonstrated
- [ ] Behavioral snapshot matches (behavior unchanged)
- [ ] No performance regression
- [ ] Code review approved
- [ ] Documentation updated

### Post-Deployment
- [ ] Monitoring shows stable performance
- [ ] No error rate increase
- [ ] No user reports related to refactored area
- [ ] 48-72 hour stability period completed

## Related Work

### Blocks
[List features blocked by current technical debt that this refactoring unblocks]

### Enables
[List future refactorings or features this enables]

### Dependencies
[List other refactorings that should happen first]

---
*Refactor spec created using `/refactor` workflow - See .specify/extensions/workflows/refactor/*
