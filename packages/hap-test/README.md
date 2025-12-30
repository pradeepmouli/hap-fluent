# hap-test

> Comprehensive test harness for Homebridge plugin development

[![npm version](https://img.shields.io/npm/v/hap-test.svg)](https://www.npmjs.com/package/hap-test)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-134%20passing-brightgreen.svg)]()

## Overview

**hap-test** is a comprehensive testing framework for Homebridge plugins that enables developers to write integration and end-to-end tests without requiring physical HomeKit controllers or a running Homebridge instance. Test your plugins with confidence using mocked Homebridge APIs, simulated HomeKit interactions, and deterministic time control.

## Why hap-test?

- **🚀 Fast**: No network access, no physical devices, tests complete in milliseconds
- **🎯 Deterministic**: Fake timers eliminate flaky tests from timing issues
- **✅ Complete**: Full Homebridge API mock with lifecycle events
- **🛡️ Type-Safe**: Full TypeScript support with comprehensive types
- **📊 Validated**: Automatic HAP protocol validation catches bugs early
- **🧪 Flexible**: Test success paths, error scenarios, and edge cases
- **🔍 Debuggable**: Debug mode with detailed logging of all operations

## Features

### Core Testing Infrastructure

- **TestHarness**: Orchestrates complete Homebridge environment for testing
- **MockHomebridgeAPI**: Complete mock of Homebridge platform API
- **MockHomeKit**: Simulates Apple Home controller interactions
- **TimeController**: Deterministic time-based testing with Vitest integration

### Advanced Capabilities

- **HAP Protocol Validation**: Automatic validation of characteristic constraints (min/max/step/format)
- **Event System**: Subscribe to and test characteristic value change events
- **Network Simulation**: Test resilience with simulated latency, packet loss, and disconnection
- **Cached Accessories**: Test accessory restoration across Homebridge restarts
- **Multi-User Support**: Test scenarios with multiple HomeKit controllers
- **Custom Matchers**: Vitest matchers for common HomeKit assertions

## Installation

```bash
npm install --save-dev hap-test
# or
pnpm add -D hap-test
# or
yarn add -D hap-test
```

### Peer Dependencies

```bash
npm install --save-dev homebridge hap-nodejs hap-fluent vitest
```

**Required Versions**:

- `homebridge` >= 1.11.0
- `hap-nodejs` >= 0.13.0
- `hap-fluent` >= 0.3.0
- `vitest` >= 2.0.0

## Quick Start

Here's a complete test for a lightbulb platform:

```typescript
import { describe, test, expect, afterEach } from 'vitest';
import { TestHarness } from 'hap-test';
import { LightbulbPlatform } from '../src/platform';

describe('LightbulbPlatform', () => {
  let harness: TestHarness;

  afterEach(async () => {
    if (harness) {
      await harness.shutdown();
    }
  });

  test('should register lightbulb accessory', async () => {
    // Create test harness with your platform
    harness = await TestHarness.create({
      platformConstructor: LightbulbPlatform,
      platformConfig: {
        platform: 'LightbulbPlatform',
        name: 'Test Lightbulb',
        devices: [{ id: 'light-1', name: 'Living Room' }],
      },
    });

    // Wait for platform to register accessories
    await harness.waitForAccessories(1);

    // Get registered accessory
    const accessories = harness.homekit.accessories();
    expect(accessories).toHaveLength(1);
    expect(accessories[0].displayName).toBe('Living Room');

    // Get lightbulb service
    const service = harness.homekit.service(accessories[0].UUID, 'Lightbulb');
    expect(service).toBeDefined();

    // Test characteristic operations
    const onChar = service?.getCharacteristic('On');
    expect(onChar?.value).toBe(false);

    // Simulate HomeKit setting value
    await service?.setCharacteristic('On', true);
    expect(onChar?.value).toBe(true);
  });
});
```

## Core Concepts

### TestHarness

The central orchestrator that manages the complete test environment:

```typescript
const harness = await TestHarness.create({
  // Your platform class
  platformConstructor: MyPlatform,

  // Platform configuration
  platformConfig: {
    platform: 'MyPlatform',
    name: 'Test Platform',
    // ... your config
  },

  // Optional: cached accessories from previous session
  cachedAccessories: [],

  // Optional: enable debug logging
  debug: true,

  // Optional: custom timeouts
  timeouts: {
    startup: 5000,
    registration: 3000,
  },
});

// Access components
harness.homekit;  // MockHomeKit controller
harness.api;      // MockHomebridgeAPI
harness.time;     // TimeController
harness.network;  // NetworkSimulator

// Cleanup
await harness.shutdown();
```

### MockHomeKit

Simulates an Apple Home controller:

```typescript
// Get all registered accessories
const accessories = harness.homekit.accessories();

// Get specific accessory
const accessory = harness.homekit.accessory('accessory-uuid');

// Get service on accessory
const service = harness.homekit.service('accessory-uuid', 'Lightbulb');

// Get characteristic
const char = harness.homekit.characteristic('accessory-uuid', 'Lightbulb', 'On');

// Simulate HomeKit operations
await service.setCharacteristic('On', true);
const value = await service.getCharacteristic('On');

// Subscribe to events
const subscription = char.subscribe();
const event = await subscription.waitForNext(1000);
```

### TimeController

Control time for deterministic testing:

```typescript
// Advance time by 30 seconds
await harness.time.advance(30000);

// Freeze time at specific point
harness.time.freeze();

// Set specific time
harness.time.setTime(new Date('2025-01-01T00:00:00Z'));

// Get current fake time
const now = harness.time.now();

// Reset to real time
harness.time.reset();
```

### NetworkSimulator

Simulate network conditions:

```typescript
// Enable network simulation
const harness = await TestHarness.create({
  platformConfig: myConfig,
  networkSimulation: { enabled: true },
});

// Add latency (affects all operations)
harness.network.setLatency(200); // 200ms delay

// Simulate packet loss
harness.network.setPacketLoss(0.1); // 10% packet loss

// Disconnect network
harness.network.disconnect();

// Reconnect
harness.network.reconnect();

// Reset to normal
harness.network.reset();
```

## Advanced Features

### Event Subscriptions

Test asynchronous platform behavior:

```typescript
const char = harness.homekit.characteristic(uuid, 'Lightbulb', 'On');

// Subscribe to value changes
const subscription = char.subscribe();

// Platform changes value
await platform.updateCharacteristic();

// Wait for event
const event = await subscription.waitForNext(5000);
expect(event.newValue).toBe(true);

// Check event history
const history = subscription.getHistory();
console.log('Events:', history);

// Cleanup
subscription.unsubscribe();
```

### HAP Protocol Validation

Automatic validation of HAP constraints:

```typescript
const service = harness.homekit.service(uuid, 'Lightbulb');

// ✅ Valid operation
await service.setCharacteristic('Brightness', 75);

// ❌ Throws CharacteristicValidationError
await expect(
  service.setCharacteristic('Brightness', 150) // Max is 100
).rejects.toThrow('exceeds maximum 100');

// ❌ Throws for wrong format
await expect(
  service.setCharacteristic('Brightness', 'bright') // Must be number
).rejects.toThrow('Expected number');

// ❌ Throws for invalid enum
await expect(
  service.setCharacteristic('TargetHeatingCoolingState', 99)
).rejects.toThrow('not in valid values');
```

### Cached Accessories

Test accessory restoration across restarts:

```typescript
// First session - register accessories
let harness = await TestHarness.create({
  platformConstructor: MyPlatform,
  platformConfig: myConfig,
});

await harness.waitForAccessories(2);
const cached = harness.api.getRegisteredAccessories();
await harness.shutdown();

// Second session - restore from cache
harness = await TestHarness.create({
  platformConstructor: MyPlatform,
  platformConfig: myConfig,
  cachedAccessories: cached, // Restored!
});

// Platform's configureAccessory() was called
expect(harness.homekit.accessories()).toHaveLength(2);
```

### Time-Based Testing

Test polling, schedules, and timeouts:

```typescript
test('polls device every 30 seconds', async () => {
  const harness = await TestHarness.create({
    platformConstructor: PollingPlatform,
    platformConfig: myConfig,
  });

  const char = harness.homekit.characteristic(uuid, 'Lightbulb', 'On');

  // Initial state
  expect(char.value).toBe(false);

  // Advance 30 seconds
  await harness.time.advance(30000);

  // Platform should have polled
  expect(char.value).toBe(true);

  // Advance another 30 seconds
  await harness.time.advance(30000);

  // Another poll occurred
  expect(char.value).toBe(false);
});
```

### Error Scenarios

Test error handling and recovery:

```typescript
test('handles device errors gracefully', async () => {
  const harness = await TestHarness.create({
    platformConstructor: MyPlatform,
    platformConfig: myConfig,
    networkSimulation: { enabled: true },
  });

  const service = harness.homekit.service(uuid, 'Lightbulb');

  // Simulate network failure
  harness.network.disconnect();

  // Operation should fail
  await expect(
    service.setCharacteristic('On', true)
  ).rejects.toThrow('Network disconnected');

  // Reconnect
  harness.network.reconnect();

  // Should work now
  await service.setCharacteristic('On', true);
  expect(service.getCharacteristic('On')?.value).toBe(true);
});
```

## Custom Matchers

Vitest matchers for common assertions:

```typescript
import 'hap-test/matchers';

test('using custom matchers', async () => {
  const harness = await TestHarness.create({...});
  const accessory = harness.homekit.accessory(uuid);
  const service = harness.homekit.service(uuid, 'Lightbulb');
  const char = harness.homekit.characteristic(uuid, 'Lightbulb', 'Brightness');

  // Accessory matchers
  expect(accessory).toBeRegistered();
  expect(accessory).toHaveService('Lightbulb');

  // Service matchers
  expect(service).toHaveCharacteristic('On');
  expect(service).toHaveCharacteristic('Brightness');

  // Characteristic matchers
  expect(char).toHaveValue(75);
  expect(char).toBeInRange(0, 100);
  expect(char).toHaveFormat('int');
});
```

## Examples

Check the `/examples` directory for complete working examples:

- **basic-accessory-test.ts** - Simple lightbulb platform test
- **debug-mode.ts** - Using debug logging
- **error-scenarios.ts** - Testing error handling
- **hap-protocol-validation.ts** - HAP validation examples
- **multi-device-platform.ts** - Multiple accessories
- **time-based-features.ts** - Polling and schedules

## Documentation

- [**Getting Started**](docs/getting-started.md) - Your first test in 10 minutes
- [**Advanced Testing**](docs/advanced-testing.md) - Events, time control, network simulation
- [**Migration Guide**](docs/migration-guide.md) - From manual to automated testing
- [**Troubleshooting**](docs/troubleshooting.md) - Common issues and solutions
- [**API Reference**](docs/api-reference.md) - Complete API documentation

## Testing Best Practices

### 1. Always Clean Up

```typescript
let harness: TestHarness;

afterEach(async () => {
  if (harness) {
    await harness.shutdown();
  }
});
```

### 2. Wait for Registration

```typescript
const harness = await TestHarness.create({...});
await harness.waitForAccessories(expectedCount, timeout);
```

### 3. Use Time Control

```typescript
// ❌ Flaky - uses real time
await new Promise(resolve => setTimeout(resolve, 1000));

// ✅ Deterministic - uses fake time
await harness.time.advance(1000);
```

### 4. Enable Debug Mode

```typescript
const harness = await TestHarness.create({
  platformConfig: myConfig,
  debug: true, // See all operations
});
```

### 5. Test Error Cases

```typescript
// Test both success and failure
test('handles invalid values', async () => {
  await expect(
    service.setCharacteristic('Brightness', -1)
  ).rejects.toThrow();
});
```

## TypeScript Configuration

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "types": ["vitest/globals", "node"]
  },
  "include": ["test/**/*.ts"]
}
```

## Vitest Configuration

Add to your `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
    },
  },
});
```

## Performance

hap-test is designed for speed:

- **Harness initialization**: < 50ms
- **Accessory registration**: < 10ms per accessory
- **Characteristic operations**: < 1ms
- **Full test suite**: Typically < 1 second

## Compatibility

- **Homebridge**: 1.11.0+
- **HAP-NodeJS**: 0.13.0+
- **Node.js**: 18+
- **TypeScript**: 5.0+
- **Vitest**: 2.0+

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for details.

## License

MIT © Pradeep Mouli

## Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/pradeepmouli/hap-monorepo/issues)
- 💬 [Discussions](https://github.com/pradeepmouli/hap-monorepo/discussions)

## Acknowledgments

- Built for [Homebridge](https://homebridge.io/) plugin development
- Works seamlessly with [hap-fluent](../hap-fluent/) for type-safe characteristic access
- Powered by [Vitest](https://vitest.dev/) for fast, modern testing

---

**Status**: Production Ready | **Version**: 0.1.0 | **Tests**: 134 passing

      format: 'bool',
      perms: ['pr', 'pw', 'ev'],
    });

    service.addCharacteristic(onChar);
    accessory.addService(service);
    harness.homeKit.addAccessory(accessory);

    // Test characteristic operations
    await onChar.setValue(true);
    expect(await onChar.getValue()).toBe(true);

    // Test event subscriptions
    const subscription = onChar.subscribe();
    await onChar.setValue(false);

    const history = subscription.getHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[history.length - 1].newValue).toBe(false);

    subscription.unsubscribe();
    harness.shutdown();

});
});

```

See [examples/basic-accessory-test.ts](./examples/basic-accessory-test.ts) for more detailed usage.

## Documentation

- [Getting Started](./docs/getting-started.md)
- [Advanced Testing](./docs/advanced-testing.md)
- [Migration Guide](./docs/migration-guide.md)
- [API Reference (summary)](./docs/api.md) — generate HTML via `pnpm --filter hap-test docs:api`
- [Examples](./examples/)

## Requirements

- Node.js >= 18.0.0
- Homebridge >= 1.6.0 or 2.x
- HAP-NodeJS >= 0.11.0
- Vitest >= 1.0.0

## Development Status

🚧 **Phase 6 (Developer Experience) - In Progress**

Current capabilities:
- ✅ Core infrastructure (TestHarness, MockHomebridgeAPI, MockHomeKit, TimeController)
- ✅ HAP protocol validation and permissions enforcement
- ✅ Event subscriptions and history tracking
- ✅ Network simulation (latency, packet loss, disconnect)
- ✅ Custom Vitest matchers
- ✅ Example suites covering common devices

API may change before 1.0.0 release.

## License

MIT © HAP Fluent Monorepo Contributors
```
