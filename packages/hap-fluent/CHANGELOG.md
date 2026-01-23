# Changelog

## 0.4.0

### Minor Changes

- simplified types

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive error handling infrastructure with typed error classes (`FluentError`, `FluentCharacteristicError`, `FluentServiceError`, `ValidationError`, `ConfigurationError`)
- Type guard utilities for runtime validation (`isCharacteristicValue`, `isService`, `isCharacteristic`)
- Structured logging with Pino integration
  - Configurable log levels (trace, debug, info, warn, error, fatal)
  - Pretty printing for development
  - Child loggers with contextual information
- Type utilities for improved developer experience
  - Value transformers: `createClampTransformer`, `createScaleTransformer`
  - Value predicates: `createRangePredicate`
  - Type guards: `isFluentCharacteristic`
  - Type helpers: `ServiceState`, `PartialServiceState`, `CharacteristicNames`, `CharacteristicType`
- Comprehensive JSDoc documentation on all public APIs
- Example files demonstrating error handling, logging, and type utilities
- Modern package exports for tree-shaking support

### Changed

- **BREAKING**: Moved `homebridge` and `hap-nodejs` from `devDependencies` to `peerDependencies`
- Improved error messages with actionable context throughout the library
- Enhanced characteristic operations (`set`, `get`, `update`) with try-catch error handling
- Service creation now includes comprehensive logging for debugging
- Accessory initialization includes detailed logging of state application

### Fixed

- Type safety violations reduced from 17 to 4 (all documented and justified)
- Removed all undocumented `@ts-ignore`, `@ts-expect-error`, and unsafe `as any` casts
- Eliminated ~65 lines of dead code and commented-out blocks
- Fixed syntax errors in examples
- Corrected property naming to support both camelCase and PascalCase for backward compatibility

### Improved

- Test coverage: 128 tests passing (up from 60), 100% pass rate
- Type checking: 0 errors with TypeScript strict mode
- Build system: Integrated with tsgo for faster builds
- Code organization: Better separation of concerns with dedicated modules

## [0.3.0] - 2025-12-25

### Phase 1: Code Quality & Robustness Complete

- Established foundation for production-ready 1.0.0 release
- All Phase 1 objectives achieved (41/41 tasks)
- Comprehensive refactoring of core modules
- Git tag: `refactor-001-phase-1`

## [0.2.0] - Previous Release

### Added

- Initial fluent API for HAP-NodeJS services and characteristics
- Type-safe characteristic access with generated interfaces
- Service wrapping with method chaining
- Accessory handler for managing multiple services

## [0.1.0] - Initial Release

### Added

- Basic prototype of fluent HAP-NodeJS wrapper
- Core `FluentCharacteristic`, `FluentService`, and `AccessoryHandler` classes
- TypeScript support with generated HAP interfaces

[Unreleased]: https://github.com/pradeepmouli/hap-fluent/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/pradeepmouli/hap-fluent/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/pradeepmouli/hap-fluent/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/pradeepmouli/hap-fluent/releases/tag/v0.1.0
