# Tasks: Homebridge Test Harness (hap-test)

**Branch**: `001-homebridge-test-harness` | **Date**: 2025-12-27
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Overview

This document breaks down the implementation of the Homebridge Test Harness into actionable, dependency-ordered tasks following Test-First Development principles. Tasks are organized by implementation phases that correspond to user-facing capabilities.

**Implementation Strategy**:
- **MVP First**: Phase 1 (Setup) + Phase 2 (Foundational) = Minimal viable test harness
- **Incremental Delivery**: Each phase after Foundational adds complete, independently testable features
- **Parallel Execution**: Tasks marked with `[P]` can run in parallel within their phase

**Test Strategy**: Following TDD discipline - tests written before implementation for all components.

---

## Phase 1: Setup & Project Initialization

**Objective**: Create package structure, configure tooling, establish baseline

**Success Criteria**:
- Package builds successfully with TypeScript
- Vitest runs (even with no tests)
- ESLint and Prettier configured and passing
- Package exports configured

### Tasks

- [X] T001 Create package directory structure at `packages/hap-test/`
- [X] T002 [P] Create `packages/hap-test/package.json` with metadata, peer dependencies (homebridge, hap-nodejs, hap-fluent, vitest), and exports configuration
- [X] T003 [P] Create `packages/hap-test/tsconfig.json` with strict mode enabled, targeting ES2020
- [X] T004 [P] Create `packages/hap-test/vitest.config.ts` with coverage configuration
- [X] T005 [P] Create `packages/hap-test/README.md` with placeholder content
- [X] T006 [P] Create source directory structure: `src/`, `src/types/`, `src/errors/`, `src/matchers/`, `src/utils/`
- [X] T007 [P] Create test directory structure: `test/unit/`, `test/integration/`, `test/examples/`
- [X] T008 [P] Create examples directory: `examples/`
- [X] T009 Create `packages/hap-test/src/index.ts` as main entry point (empty exports for now)
- [X] T010 Configure workspace to include new package in root `pnpm-workspace.yaml`
- [X] T011 Run `pnpm install` to link workspace dependencies
- [X] T012 Verify build succeeds with `pnpm --filter hap-test build`

**Phase Gate**: ✅ Package builds, lints, and is ready for development

---

## Phase 2: Foundational - Core Infrastructure

**Objective**: Implement foundational test harness components (TestHarness, MockHomebridgeAPI, MockHomeKit, TimeController)

**Success Criteria**:
- Can initialize a platform through TestHarness
- Can register and retrieve accessories
- Can perform basic get/set operations on characteristics
- Time control works with Vitest fake timers
- 80%+ unit test coverage for core components

### Tasks

#### Type Definitions & Errors (Foundational)

- [ ] T013 [P] Create `packages/hap-test/src/types/harness.ts` with TestHarness interfaces (HarnessOptions, PlatformState)
- [ ] T014 [P] Create `packages/hap-test/src/types/mocks.ts` with mock interface types (MockAccessory, MockService, MockCharacteristic)
- [ ] T015 [P] Create `packages/hap-test/src/types/events.ts` with event type definitions (AccessoryEvent, CharacteristicEvent)
- [ ] T016 [P] Create `packages/hap-test/src/types/index.ts` to export all type definitions
- [ ] T017 [P] Create `packages/hap-test/src/errors/CharacteristicValidationError.ts` with context-rich error class
- [ ] T018 [P] Create `packages/hap-test/src/errors/HomeKitTimeoutError.ts` for timeout scenarios
- [ ] T019 [P] Create `packages/hap-test/src/errors/NetworkError.ts` for network simulation
- [ ] T020 Create `packages/hap-test/src/errors/index.ts` to export all error classes

#### TimeController (Test-Time Manipulation)

- [ ] T021 Write unit test `packages/hap-test/test/unit/TimeController.test.ts` for time advancement, freezing, and timer integration
- [ ] T022 Implement `packages/hap-test/src/TimeController.ts` with Vitest fake timers integration
  - advance(ms: number): Promise<void>
  - freeze(): void
  - reset(): void
  - now(): number
  - setTime(date: Date): void

#### MockHomebridgeAPI (Homebridge Platform API Mock)

- [ ] T023 Write unit test `packages/hap-test/test/unit/MockHomebridgeAPI.test.ts` for accessory registration, lifecycle events, and storage
- [ ] T024 Implement `packages/hap-test/src/MockHomebridgeAPI.ts` with complete Homebridge API surface
  - registerPlatformAccessories()
  - unregisterPlatformAccessories()
  - updatePlatformAccessories()
  - Lifecycle event emission (didFinishLaunching, shutdown)
  - HAP types exposure
  - Storage path management (temp directories)

#### MockHomeKit (HomeKit Controller Simulation)

- [ ] T025 Write unit test `packages/hap-test/test/unit/MockHomeKit.test.ts` for accessory discovery, characteristic get/set, and basic validation
- [ ] T026 Implement `packages/hap-test/src/MockHomeKit.ts` with controller simulation
  - accessories(): MockAccessory[]
  - accessory(uuid: string): MockAccessory | undefined
  - service(accessoryUuid: string, serviceName: string): MockService | undefined
  - characteristic(accessoryUuid, serviceName, charName): MockCharacteristic | undefined
  - Basic get/set operations (validation comes in Phase 3)

#### MockAccessory, MockService, MockCharacteristic

- [ ] T027 [P] Implement MockAccessory class in `packages/hap-test/src/MockHomeKit.ts` (or separate file)
  - UUID, display name, services access
  - Context storage
- [ ] T028 [P] Implement MockService class with characteristic enumeration
  - Type, subtype, characteristics
  - Helper methods (hasCharacteristic, getCharacteristic)
- [ ] T029 [P] Implement MockCharacteristic class with state management
  - Type, value, permissions, properties
  - getValue(), setValue() with event emission
  - subscribe(), unsubscribe()

#### TestHarness (Main Orchestrator)

- [ ] T030 Write unit test `packages/hap-test/test/unit/TestHarness.test.ts` for lifecycle management, platform initialization, and cleanup
- [ ] T031 Implement `packages/hap-test/src/TestHarness.ts` with orchestration logic
  - static create(options: HarnessOptions): Promise<TestHarness>
  - Platform initialization and configuration
  - Accessory registration tracking
  - MockHomeKit and MockHomebridgeAPI integration
  - TimeController integration
  - waitForAccessories(), waitForRegistration()
  - shutdown() with cleanup

#### Async Utilities

- [ ] T032 [P] Implement `packages/hap-test/src/utils/async-utils.ts` for operation tracking
  - pendingOperations tracking
  - waitFor helpers with timeout
  - Promise utilities

#### Integration & Package Exports

- [ ] T033 Update `packages/hap-test/src/index.ts` to export all public APIs
  - TestHarness
  - MockHomeKit, MockAccessory, MockService, MockCharacteristic
  - TimeController
  - All error classes
  - Type definitions
- [ ] T034 Write integration test `packages/hap-test/test/integration/platform-lifecycle.test.ts` for complete platform initialization flow
- [ ] T035 Write integration test `packages/hap-test/test/integration/accessory-registration.test.ts` for registration and retrieval
- [ ] T036 Write integration test `packages/hap-test/test/integration/characteristic-operations.test.ts` for basic get/set operations
- [ ] T037 Create example `packages/hap-test/examples/basic-accessory-test.ts` demonstrating simple lightbulb platform test
- [ ] T038 Run all tests and verify 80%+ coverage for core components
- [ ] T039 Update `packages/hap-test/README.md` with basic usage example

**Phase Gate**: ✅ Can write and run basic integration tests for Homebridge plugins

---

## Phase 3: HAP Protocol Validation

**Objective**: Implement comprehensive characteristic validation to ensure HAP protocol compliance

**Success Criteria**:
- All characteristic constraints validated (min/max/step/validValues)
- Format validation for all HAP types (bool, int, float, string, uint8, etc.)
- Permission checking enforced (read/write/notify)
- Proper error messages for violations
- Comprehensive validation test suite

### Tasks

#### Validation Infrastructure

- [ ] T040 Write unit test `packages/hap-test/test/unit/validators.test.ts` for constraint validation logic
- [ ] T041 Implement `packages/hap-test/src/utils/validation.ts` with HAP validation functions
  - validateValue(characteristic, value): ValidationResult
  - validateConstraints(value, min, max, step, validValues)
  - validateFormat(value, format): boolean
  - validatePermissions(operation, permissions): boolean

#### Enhanced MockCharacteristic with Validation

- [ ] T042 Update MockCharacteristic in `packages/hap-test/src/MockHomeKit.ts` to enforce validation
  - Integrate validation.ts functions
  - Throw CharacteristicValidationError on violations
  - Validate on setValue() and getValue()
- [ ] T043 Add characteristic properties support (min, max, step, validValues, format, perms)
- [ ] T044 Update unit tests in `packages/hap-test/test/unit/MockHomeKit.test.ts` to cover validation scenarios

#### HAP Format Support

- [ ] T045 [P] Implement format validators for: bool, int, float, uint8, uint16, uint32, uint64, string, data, tlv8
- [ ] T046 Add format validation tests for each supported type
- [ ] T047 Add permission validation (read-only characteristics reject setValue, write-only reject getValue)

#### Integration & Examples

- [ ] T048 Write integration test `packages/hap-test/test/integration/hap-protocol-validation.test.ts` exercising all validation scenarios
- [ ] T049 Create example `packages/hap-test/examples/hap-protocol-validation.ts` demonstrating constraint enforcement
- [ ] T050 Update characteristic-utils if needed in `packages/hap-test/src/utils/characteristic-utils.ts`
- [ ] T051 Run validation test suite and verify all HAP rules enforced

**Phase Gate**: ✅ Mock correctly rejects invalid operations per HAP spec

---

## Phase 4: Event System

**Objective**: Implement event subscription, notification, and asynchronous waiting

**Success Criteria**:
- Can subscribe to characteristic value changes
- Events propagate from platform to controller
- Can wait for next event with timeout
- Event history tracked for debugging
- Event system integration tests pass

### Tasks

#### Event Subscription Infrastructure

- [ ] T052 Write unit test `packages/hap-test/test/unit/EventSubscription.test.ts` for subscription lifecycle and waiting
- [ ] T053 Implement EventSubscription class in `packages/hap-test/src/MockHomeKit.ts` (or separate file)
  - waitForNext(timeout?: number): Promise<CharacteristicEvent>
  - getHistory(): CharacteristicEvent[]
  - unsubscribe(): void

#### MockCharacteristic Event Emission

- [ ] T054 Update MockCharacteristic to emit events on value changes
  - Track subscriptions
  - Notify all subscribers on setValue()
  - Store event history
- [ ] T055 Add subscribe() method returning EventSubscription
- [ ] T056 Update unit tests to verify event emission

#### TestHarness Event Helpers

- [ ] T057 Add event waiting helpers to TestHarness
  - waitForEvent(accessoryUuid, serviceName, charName, timeout)
  - waitForAnyEvent(timeout)
- [ ] T058 Integrate with TimeController for deterministic event timing tests

#### Integration & Examples

- [ ] T059 Write integration test `packages/hap-test/test/integration/event-subscriptions.test.ts` for complete event flows
- [ ] T060 Create example `packages/hap-test/examples/time-based-features.ts` using events and time control
- [ ] T061 Update type definitions in `packages/hap-test/src/types/events.ts` for EventSubscription
- [ ] T062 Run event system tests and verify correct propagation

**Phase Gate**: ✅ Can test asynchronous platform behavior with events

---

## Phase 5: Advanced Features

**Objective**: Add network simulation, cached accessory flows, and multi-user support

**Success Criteria**:
- Network conditions (latency, packet loss, disconnection) can be simulated
- Cached accessory restoration works
- Multiple HomeKit controllers supported
- Pairing/unpairing states managed
- Batch operations functional
- Advanced scenario test suite passes

### Tasks

#### NetworkSimulator

- [ ] T063 Write unit test `packages/hap-test/test/unit/NetworkSimulator.test.ts` for all network conditions
- [ ] T064 Implement `packages/hap-test/src/NetworkSimulator.ts` with simulation capabilities
  - setLatency(ms: number): void
  - setPacketLoss(rate: number): void
  - disconnect(): void
  - reconnect(): void
  - reset(): void
- [ ] T065 Integrate NetworkSimulator with MockHomeKit characteristic operations
- [ ] T066 Add delay and failure injection to get/set operations

#### Cached Accessory Support

- [ ] T067 Update MockHomebridgeAPI to support cached accessory restoration
  - configureAccessory() callback support
  - Cached accessory storage between harness instances
- [ ] T068 Add TestHarness option for cachedAccessories in HarnessOptions
- [ ] T069 Write integration test for cached accessory restoration flow

#### Multi-User & Pairing

- [ ] T070 [P] Add pairing state management to MockHomeKit
  - isPaired(): boolean
  - pair(), unpair()
- [ ] T071 [P] Support multiple MockHomeKit controller instances
- [ ] T072 Write integration test for multi-user scenarios

#### Batch Operations

- [ ] T073 Add refreshAll() method to MockHomeKit for batch characteristic reads
- [ ] T074 Add batch operation tests

#### Integration & Examples

- [ ] T075 Write integration test `packages/hap-test/test/integration/network-simulation.test.ts` for resilience scenarios
- [ ] T076 Create example `packages/hap-test/examples/error-scenarios.ts` with network failures and recovery
- [ ] T077 Create example `packages/hap-test/examples/multi-device-platform.ts` with multiple accessories
- [ ] T078 Run advanced feature tests and verify all scenarios work

**Phase Gate**: ✅ Can test realistic failure scenarios and complex platform behaviors

---

## Phase 6: Developer Experience

**Objective**: Polish API, create custom matchers, improve error messages

**Success Criteria**:
- Custom Vitest matchers available (toHaveCharacteristic, toHaveValue, etc.)
- Error messages include context and suggestions
- Debug mode with detailed logging
- Assertion helpers for common patterns
- Example test suites for reference

### Tasks

#### Custom Vitest Matchers

- [ ] T079 Implement `packages/hap-test/src/matchers/accessory-matchers.ts`
  - toHaveService(serviceName)
  - toHaveAccessory(uuid)
  - toBeRegistered()
- [ ] T080 Implement `packages/hap-test/src/matchers/characteristic-matchers.ts`
  - toHaveCharacteristic(charName)
  - toHaveValue(expected)
  - toBeInRange(min, max)
  - toHaveFormat(format)
- [ ] T081 Create `packages/hap-test/src/matchers/index.ts` with matcher registration
- [ ] T082 Update `packages/hap-test/src/index.ts` to export 'hap-test/matchers'
- [ ] T083 Write matcher tests in `packages/hap-test/test/unit/matchers.test.ts`

#### Error Message Enhancement

- [ ] T084 Review all error classes and add contextual information
  - Include characteristic name, expected vs actual values
  - Add suggestions for resolution
- [ ] T085 Add error context to CharacteristicValidationError (what was attempted, why it failed, how to fix)
- [ ] T086 Add error context to HomeKitTimeoutError (what was being waited for, timeout value)
- [ ] T087 Add error context to NetworkError (operation attempted, network state)

#### Debug Mode

- [ ] T088 Add debug logging option to HarnessOptions
- [ ] T089 Implement debug logger in `packages/hap-test/src/utils/logger.ts`
- [ ] T090 Add debug output for key operations (registration, get/set, events)
- [ ] T091 Create example demonstrating debug mode usage

#### Example Test Suites

- [ ] T092 [P] Create `packages/hap-test/test/examples/lightbulb-plugin.test.ts` - complete lightbulb platform test
- [ ] T093 [P] Create `packages/hap-test/test/examples/thermostat-plugin.test.ts` - thermostat with target/current temp
- [ ] T094 [P] Create `packages/hap-test/test/examples/multi-accessory-platform.test.ts` - dynamic accessory discovery
- [ ] T095 [P] Create `packages/hap-test/test/examples/error-handling.test.ts` - comprehensive error scenarios
- [ ] T096 Create `packages/hap-test/test/examples/time-based-features.test.ts` - scheduled operations and polling

**Phase Gate**: ✅ Developers write tests comfortably with excellent error messages and helpers

---

## Phase 7: Documentation

**Objective**: Create comprehensive documentation for adoption

**Success Criteria**:
- API reference generated from JSDoc
- Getting Started guide allows first test in <10 minutes
- Advanced guide covers all features
- Migration guide from manual testing
- 10+ working example files

### Tasks

#### API Reference

- [ ] T097 Add comprehensive JSDoc to all public APIs in src/
- [ ] T098 Configure JSDoc or TypeDoc for API reference generation
- [ ] T099 Generate API reference documentation
- [ ] T100 Review and enhance API documentation

#### Guides

- [ ] T101 Write Getting Started guide in `packages/hap-test/docs/getting-started.md`
  - Installation
  - First test in <10 minutes
  - Basic assertions
  - Running tests
- [ ] T102 Write Advanced Testing guide in `packages/hap-test/docs/advanced-testing.md`
  - Time control
  - Network simulation
  - Event subscriptions
  - Custom matchers
  - Error scenarios
- [ ] T103 Write Migration Guide in `packages/hap-test/docs/migration-guide.md`
  - From manual testing to automated
  - Converting existing test setups
  - Best practices
- [ ] T104 Write Troubleshooting guide in `packages/hap-test/docs/troubleshooting.md`

#### Examples & README

- [ ] T105 Update `packages/hap-test/README.md` with comprehensive overview
  - Feature highlights
  - Installation
  - Quick example
  - Links to guides
  - Contributing section
- [ ] T106 Ensure all 5 example files in `examples/` are documented and working
- [ ] T107 Create `packages/hap-test/examples/README.md` with example index

**Phase Gate**: ✅ New developer can learn harness in <30 minutes

---

## Phase 8: Integration & Release

**Objective**: Polish, integrate CI/CD, benchmark, and publish v1.0.0

**Success Criteria**:
- All tests passing in CI
- Package published to npm
- Performance benchmarks meet targets
- Documentation deployed
- v1.0.0 released

### Tasks

#### CI/CD Integration

- [ ] T108 Add GitHub Actions workflow for hap-test package
  - Build on push
  - Run tests
  - Check coverage
  - Lint
- [ ] T109 Configure npm publishing workflow
- [ ] T110 Add coverage reporting (Codecov or similar)

#### Performance Benchmarking

- [ ] T111 Create performance benchmarks in `packages/hap-test/benchmarks/`
  - Harness initialization time
  - Accessory registration time
  - Characteristic operation throughput
  - Event propagation latency
- [ ] T112 Run benchmarks and verify targets met (<50ms init, <10ms per accessory, <100ms per test)
- [ ] T113 Document performance characteristics in README

#### Final Polish

- [ ] T114 Run full test suite and fix any failing tests
- [ ] T115 Review all error messages for clarity
- [ ] T116 Run linter and fix all violations
- [ ] T117 Review and update all JSDoc
- [ ] T118 Test package in real Homebridge plugin project (manual validation)

#### Release

- [ ] T119 Update CHANGELOG.md with v1.0.0 features
- [ ] T120 Bump version to 1.0.0 in package.json
- [ ] T121 Create git tag v1.0.0
- [ ] T122 Publish to npm registry
- [ ] T123 Create GitHub release with notes

**Phase Gate**: ✅ Published v1.0.0 on npm, all tests passing, documentation complete

---

## Task Summary

### By Phase

| Phase | Task Count | Parallel Tasks | Key Deliverable |
|-------|------------|----------------|-----------------|
| 1: Setup | 12 | 7 | Package structure and tooling |
| 2: Foundational | 27 | 10 | Core test harness functional |
| 3: HAP Protocol | 12 | 2 | Validation enforced |
| 4: Event System | 11 | 0 | Event subscriptions working |
| 5: Advanced | 16 | 2 | Network sim, multi-user |
| 6: Developer UX | 18 | 5 | Matchers, errors, examples |
| 7: Documentation | 11 | 0 | Guides and API docs |
| 8: Release | 16 | 0 | v1.0.0 published |
| **TOTAL** | **123** | **26** | Production-ready test harness |

### Dependency Graph (Phases)

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)  ← Must complete before other phases
    ↓
    ├─→ Phase 3 (HAP Validation)
    ├─→ Phase 4 (Event System)
    └─→ Phase 5 (Advanced Features)
         ↓
Phase 6 (Developer UX)  ← Depends on Phases 2-5
    ↓
Phase 7 (Documentation)  ← Depends on Phase 6
    ↓
Phase 8 (Release)  ← Depends on all previous phases
```

### MVP Scope (Minimum Viable Product)

**Phases 1 + 2 = MVP** (39 tasks, ~2 weeks)
- Package structure and configuration
- Core TestHarness, MockHomebridgeAPI, MockHomeKit
- Basic get/set operations
- Time control
- Unit and integration tests
- Simple example

**Value**: Developers can write basic integration tests without real Homebridge

### Parallel Execution Opportunities

**Phase 1**: Tasks T002-T008 (7 tasks) can run in parallel - creating different config files
**Phase 2**: Tasks T013-T020 (8 tasks) can run in parallel - type definitions and errors are independent
**Phase 2**: Tasks T027-T029 (3 tasks) can run in parallel - Mock classes can be implemented simultaneously
**Phase 5**: Tasks T070-T071 (2 tasks) can run in parallel - pairing and multi-user are independent features
**Phase 6**: Tasks T092-T096 (5 tasks) can run in parallel - example test suites are independent

**Total Parallelizable**: 26 tasks across all phases

---

## Implementation Notes

**Test-First Discipline**:
- Every component has tests written FIRST (red)
- Implement minimum code to pass tests (green)
- Refactor with test safety (tests stay green)
- Target: 80%+ line coverage, 90%+ for critical paths

**Incremental Validation**:
- Each phase gate must pass before proceeding
- Integration tests validate cross-component behavior
- Example files serve as acceptance tests

**Constitutional Compliance**:
- Type safety: All public APIs have explicit types
- Library-first: Package is standalone and independently testable
- Fluent API: Method chaining and builder patterns throughout
- Developer experience: Comprehensive JSDoc, helpful errors, working examples

**Next Action**: Start with Phase 1, Task T001 - Create package directory structure
