# Refactor Spec: Simplify AccessoryHandler to a single surface (wrapAccessory → AccessoryHandler with initialize/addService)

**Refactor ID**: refactor-002
**Branch**: `refactor/002-simplify-accessoryhandler-only`
**Created**: 2026-01-18
**Type**: [ ] Performance | [x] Maintainability | [ ] Security | [x] Architecture | [x] Tech Debt
**Impact**: [ ] High Risk | [x] Medium Risk | [ ] Low Risk
**Status**: [x] Planning | [ ] Baseline Captured | [ ] In Progress | [ ] Validation | [ ] Complete

## Input

User description: "simplify accessoryhandler/to only have one surface - wrapAccessory, returning accessoryHandler, and accessoryHandler.initialize instead of directly calling initializeAccessory, accessoryHandler.addService instead of getOrAddService"

## Motivation

### Current State Problems

**Code Smell(s)**:

- [ ] Duplication (DRY violation)
- [ ] God Object/Class (too many responsibilities)
- [ ] Long Method (too complex)
- [ ] Feature Envy (accessing other object's data)
- [ ] Primitive Obsession
- [ ] Dead Code
- [ ] Magic Numbers/Strings
- [x] Tight Coupling (multiple entry points to Accessory lifecycle)
- [x] Other: Inconsistent API surface leading to misuse and confusion

**Concrete Examples**:

- Multiple public entry points in Accessory handling: `wrapAccessory`, `initializeAccessory`, and `getOrAddService` encourage mixed usage patterns rather than a cohesive handler instance.
- Consumers can directly call `initializeAccessory(accessory)` or `getOrAddService(...)` instead of working through a single `AccessoryHandler`, making lifecycle harder to reason about.

### Business/Technical Justification

[Why is this refactoring needed NOW?]

- [x] Developer velocity impact (simpler, consistent usage pattern)
- [x] Technical debt accumulation (split API surface increases maintenance)
- [ ] Blocking new features
- [ ] Performance degradation
- [ ] Security vulnerability
- [ ] Causing frequent bugs

## Proposed Improvement

### Refactoring Pattern/Technique

**Primary Technique**: Encapsulate by introducing a cohesive instance API (Facade); Rename Method; Deprecate free functions with thin wrappers

**High-Level Approach**:
Consolidate Accessory operations behind a single `wrapAccessory(accessory)` entry that returns an `AccessoryHandler` instance. Move/alias `initializeAccessory(accessory)` to `AccessoryHandler.initialize()`, and rename `getOrAddService(...)` to `AccessoryHandler.addService(...)` while preserving idempotent semantics. Maintain behavior by keeping the legacy free functions as thin wrappers delegating to the instance methods until deprecation.

**Files Affected**:

- **Modified**:
  - packages/hap-fluent/src/AccessoryHandler.ts
  - packages/hap-fluent/src/index.ts (exports and re-exports)
  - packages/hap-fluent/src/FluentService.ts (call sites if any)
  - packages/hap-fluent/examples/\*.ts (usage examples alignment)
  - packages/hap-fluent/test/unit/FluentAccessory.test.ts
  - packages/hap-fluent/test/unit/FluentService.test.ts
  - packages/hap-fluent/test/property-based/service-operations.property.test.ts
  - packages/hap-fluent/test/integration/integration.test.ts
- **Created**: None
- **Deleted**: None
- **Moved**: None

### Design Improvements

**Before**:

```
wrapAccessory(accessory?)
initializeAccessory(accessory)
getOrAddService(accessory, serviceType, subtype?)
```

**After**:

```
wrapAccessory(accessory) → AccessoryHandler
AccessoryHandler.initialize()
AccessoryHandler.addService(serviceType, subtype?)

// Legacy free functions remain as thin wrappers (behavior-preserving)
initializeAccessory(accessory) → wrapAccessory(accessory).initialize()
getOrAddService(accessory, ...) → wrapAccessory(accessory).addService(...)
```

## Phase 0: Testing Gap Assessment

_CRITICAL: Complete BEFORE capturing baseline metrics - see testing-gaps.md_

### Pre-Baseline Testing Requirement

- [ ] **Testing gaps assessment completed** (see `testing-gaps.md`)
- [ ] **Critical gaps identified and addressed**
- [ ] **All affected functionality has adequate test coverage**
- [ ] **Ready to capture baseline metrics**

**Rationale**: Refactoring requires behavior preservation validation. If code lacks test coverage, we cannot verify behavior is preserved. All impacted functionality MUST be tested BEFORE establishing the baseline.

### Testing Coverage Status

**Affected Code Areas**:

- Accessory lifecycle init: `AccessoryHandler.initialize()` (formerly `initializeAccessory`) - Coverage [unknown] - [ ] ✅ Adequate [x] ❌ Needs Tests
- Service management: `AccessoryHandler.addService()` (formerly `getOrAddService`) - Coverage [unknown] - [ ] ✅ Adequate [x] ❌ Needs Tests
- Wrapper contract: `wrapAccessory()` returning a handler bound to the given accessory - Coverage [unknown] - [ ] ✅ Adequate [x] ❌ Needs Tests

**Action Taken**:

- [ ] No gaps found - proceeded to baseline
- [ ] Gaps found - added [N] tests before baseline
- [ ] Gaps documented but deferred (with justification)

---

## Baseline Metrics

_Captured AFTER testing gaps are addressed - see metrics-before.md_

### Code Complexity

- **Cyclomatic Complexity**: not measured
- **Cognitive Complexity**: not measured
- **Lines of Code**: [number]
- **Function Length (avg/max)**: [avg: X lines, max: Y lines]
- **Class Size (avg/max)**: [avg: X lines, max: Y lines]
- **Duplication**: [X% or "Y instances"]

### Test Coverage

- **Overall Coverage**: [X%]
- **Lines Covered**: [X/Y]
- **Branches Covered**: [X/Y]
- **Functions Covered**: [X/Y]

### Performance

- **Build Time**: [X seconds]
- **Bundle Size**: [X KB]
- **Runtime Performance**: [X ms for key operations]
- **Memory Usage**: [X MB]

### Dependencies

- **Direct Dependencies**: [count]
- **Total Dependencies**: [count including transitive]
- **Outdated Dependencies**: [count]

## Target Metrics

_Goals to achieve - measurable success criteria_

### Code Quality Goals

- **Cyclomatic Complexity**: Reduce or maintain (no increase due to consolidation)
- **Lines of Code**: Accept small increases for clarity; reduce scattered helpers
- **Duplication**: Eliminate duplicate entry points
- **Function Length**: Maintain reasonable method sizes
- **Test Coverage**: Maintain or increase; add coverage for handler methods

### Performance Goals

- **Build Time**: Maintain or improve (no regression)
- **Bundle Size**: Maintain (renaming should not impact size materially)
- **Runtime Performance**: Maintain or improve (no regression > 5%)
- **Memory Usage**: Maintain or reduce

### Success Threshold

**Minimum acceptable improvement**: Consolidated API usage in examples/tests; maintain test coverage; no performance regression

## Behavior Preservation Guarantee

_CRITICAL: Refactoring MUST NOT change external behavior_

### External Contracts Unchanged

- [ ] API endpoints return same responses
- [x] Function signatures unchanged (or properly deprecated via wrappers)
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

1. `wrapAccessory(accessory)` returns a handler bound to the provided accessory; instance methods operate on that accessory.
2. `initialize()` performs the same initialization side effects as `initializeAccessory(accessory)` today (registration, event wiring, interceptors).
3. `addService()` is idempotent: returns existing service if present; otherwise creates, registers, and returns new service (matching `getOrAddService`).

**Test**: Run before and after refactoring, outputs MUST be identical

## Risk Assessment

### Risk Level Justification

**Why Medium Risk**:
Touches core Accessory handling APIs and updates call sites. Behavior is preserved via wrappers, but incorrect renames or missed call sites could cause runtime errors. Blast radius includes examples and tests.

### Potential Issues

- **Risk 1**: Breaking consumers if legacy functions are removed too early
  - **Mitigation**: Keep legacy wrappers delegating to instance methods; mark for deprecation separately
  - **Rollback**: Revert commit or re-introduce wrappers

- **Risk 2**: Missed internal call sites leading to inconsistent behavior
  - **Mitigation**: Grep codebase; run full test suite; update examples
  - **Rollback**: Revert incremental commits

### Safety Measures

- [ ] Feature flag available for gradual rollout
- [ ] Monitoring in place for key metrics
- [ ] Rollback plan tested
- [x] Incremental commits (can revert partially)
- [x] Peer review required
- [ ] Staging environment test required

## Rollback Plan

### How to Undo

1. [Step 1: revert commit range]
2. [Step 2: any manual cleanup needed]
3. [Step 3: verification steps]

### Rollback Triggers

Revert if any of these occur within 24-48 hours:

- [ ] Test suite failure
- [ ] Performance regression > 10%
- [ ] Production error rate increase
- [ ] User-facing bug reports related to refactored area
- [ ] Monitoring alerts

### Recovery Time Objective

**RTO**: [How fast can we rollback? e.g., "< 30 minutes"]

## Implementation Plan

### Phase 0: Testing Gap Assessment (Pre-Baseline)

**CRITICAL FIRST STEP**: Assess and address testing gaps BEFORE baseline

1. Review `testing-gaps.md` template
2. Identify all code that will be modified during refactoring
3. Assess test coverage for each affected area
4. Document gaps (critical, important, nice-to-have)
5. **Add tests for critical gaps** - DO NOT proceed without these
6. Verify all new tests pass
7. Mark testing gaps assessment as complete

**Checkpoint**: Only proceed to Phase 1 when adequate test coverage exists

### Phase 1: Baseline (Before Refactoring)

1. Capture all baseline metrics (run `.specify/extensions/workflows/refactor/measure-metrics.sh --before`)
2. Create behavioral snapshot (document current outputs)
3. Ensure 100% test pass rate (including newly added tests)
4. Tag current state in git: `git tag pre-refactor-### -m "Baseline before refactor-###"`

### Phase 2: Refactoring (Incremental)

1. [Step 1: small, atomic change]
2. [Step 2: another small change]
3. [Step 3: continue incrementally]

**Principle**: Each step should compile and pass tests

### Phase 3: Validation

1. Run full test suite (MUST pass 100%)
2. Re-measure all metrics
3. Compare behavioral snapshot (MUST be identical)
4. Performance regression test
5. Manual testing of critical paths

### Phase 4: Deployment

1. Code review focused on behavior preservation
2. Deploy to staging
3. Monitor for 24 hours
4. Deploy to production with feature flag (if available)
5. Monitor for 48-72 hours
6. Remove feature flag if stable

## Verification Checklist

### Phase 0: Testing Gap Assessment

- [ ] Testing gaps assessment completed (testing-gaps.md)
- [ ] All affected code areas identified
- [ ] Test coverage assessed for each area
- [ ] Critical gaps identified and documented
- [ ] Tests added for all critical gaps
- [ ] All new tests passing
- [ ] Ready to proceed to baseline capture

### Pre-Refactoring (Phase 1)

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

_Refactor spec created using `/refactor` workflow - See .specify/extensions/workflows/refactor/_
