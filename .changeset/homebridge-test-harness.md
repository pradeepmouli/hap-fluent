---
"hap-test": minor
"hap-fluent": minor
---

Add comprehensive Homebridge test harness with time control, network simulation, and validation

- **New Package: hap-test** - Complete test harness for Homebridge plugins
  - TestHarness for lifecycle management and assertions
  - MockHomeKit with full HAP protocol simulation
  - TimeController for deterministic time-based testing
  - NetworkSimulator for network condition testing
  - Custom matchers for HomeKit-specific validations
  - Comprehensive examples and documentation

- **hap-fluent Updates**
  - Updated AccessoryHandler API for better testability
  - Added initialize() and addService() methods
  - Improved type safety and error handling
  - Enhanced documentation with troubleshooting guide
  - Added property-based testing

- **CI/CD Infrastructure**
  - GitHub Actions workflows for CI and releases
  - Automated version management with changesets
  - Coverage reporting with Codecov
  - Multi-version Node.js testing (18.x, 20.x)

This release provides a production-ready testing framework for Homebridge plugin developers.
