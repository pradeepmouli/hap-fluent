# hap-test

> Test harness for Homebridge plugin development - write integration tests without physical HomeKit controllers

[![npm version](https://img.shields.io/npm/v/hap-test.svg)](https://www.npmjs.com/package/hap-test)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`hap-test` provides a comprehensive testing framework for Homebridge plugins, enabling developers to write integration and end-to-end tests without requiring physical HomeKit controllers or a running Homebridge instance. The harness includes mock implementations of the Homebridge API, HAP-NodeJS services, and simulated Apple Home interactions.

## Features

- **Mock Homebridge Environment**: Complete mock of Homebridge API including platform lifecycle
- **Mock HomeKit Controller**: Simulate Apple Home interactions (accessory discovery, characteristic get/set)
- **Time Control**: Deterministic time-based testing with Vitest fake timers integration
- **HAP Protocol Validation**: Automatic validation of HAP protocol compliance
- **Event System**: Test asynchronous platform behavior with event subscriptions
- **Custom Matchers**: Vitest matchers for common HomeKit assertions
- **Zero External Dependencies**: No network access, isolated temp storage

## Installation

```bash
npm install --save-dev hap-test
# or
pnpm add -D hap-test
```

## Quick Start

```typescript
import { describe, it, expect } from 'vitest';
import { TestHarness } from 'hap-test';
import { MyPlatform } from '../src/platform';

describe('MyPlatform', () => {
  it('should register a lightbulb accessory', async () => {
    const harness = await TestHarness.create({
      platformConstructor: MyPlatform,
      platformConfig: {
        name: 'Test Platform',
        // ... your config
      },
    });

    // Wait for platform to register accessories
    await harness.waitForAccessories(1);

    // Get the mock HomeKit controller
    const homekit = harness.homekit;
    const accessories = homekit.accessories();

    expect(accessories).toHaveLength(1);
    expect(accessories[0].displayName).toBe('My Lightbulb');

    // Test characteristic operations
    const service = homekit.service(accessories[0].UUID, 'Lightbulb');
    const onChar = service?.characteristic('On');
    
    await onChar?.setValue(true);
    expect(await onChar?.getValue()).toBe(true);

    await harness.shutdown();
  });
});
```

## Documentation

- [API Reference](./docs/api.md) *(coming soon)*
- [User Guide](./docs/guide.md) *(coming soon)*
- [Examples](./examples/) *(coming soon)*

## Requirements

- Node.js >= 18.0.0
- Homebridge >= 1.6.0 or 2.x
- HAP-NodeJS >= 0.11.0
- Vitest >= 1.0.0

## Development Status

🚧 **This package is under active development.** API may change before 1.0.0 release.

## License

MIT © HAP Fluent Monorepo Contributors
