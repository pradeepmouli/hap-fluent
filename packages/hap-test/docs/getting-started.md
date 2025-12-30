# Getting Started

Use this quick path to write your first Homebridge plugin test in under 10 minutes.

## Install

```bash
pnpm add -D hap-test vitest
```

Peer deps expected at runtime:

- `homebridge` (types only for your plugin)
- `hap-nodejs` (HAP types)

## Project wiring

1. Ensure Vitest is configured (ESM). If you use fake timers elsewhere, prefer `vi.useFakeTimers()`.
2. Add a test file (e.g., `test/lightbulb.test.ts`).
3. Import the harness APIs from `hap-test`.

## Minimal test example

```typescript
import { describe, it, expect } from 'vitest';
import { TestHarness, MockAccessory, MockService, MockCharacteristic } from 'hap-test';

describe('Lightbulb', () => {
  it('toggles power', async () => {
    const harness = await TestHarness.create({
      platformConstructor: undefined as any,
      platformConfig: { platform: 'MyPlatform', name: 'Demo' },
    });

    const accessory = new MockAccessory('light-uuid', 'Living Room');
    const service = new MockService('Lightbulb', 'Lightbulb');
    const on = new MockCharacteristic('On', 'On', false, { format: 'bool', perms: ['pr', 'pw', 'ev'] });

    service.addCharacteristic(on);
    accessory.addService(service);
    harness.homeKit.addAccessory(accessory);

    await on.setValue(true);
    expect(await on.getValue()).toBe(true);

    harness.shutdown();
  });
});
```

## Common options

- `platformConstructor`: Your platform class (optional for pure harness usage).
- `platformConfig`: Object passed to your platform when instantiated.
- `cachedAccessories`: Array of `MockAccessory` to simulate restored devices.
- `logging`: `{ debug: boolean; level?: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'; categories?: string[] }`.

## Assertions and matchers

Register matchers once per test setup:

```typescript
import * as matchers from 'hap-test/matchers';
import { expect } from 'vitest';
expect.extend(matchers);
```

Useful matchers:

- `toHaveAccessory(uuid)`
- `toHaveService(name)`
- `toHaveCharacteristic(name)`
- `toHaveValue(value)`
- `toBeInRange(min, max)`

## Run tests

```bash
pnpm vitest run
```

If you only want harness examples: `pnpm --filter hap-test exec vitest run test/examples`.

## Cleanup tips

Always call `harness.shutdown()` in `afterEach` to restore timers and release resources.
