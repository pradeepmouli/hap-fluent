# hap-test Examples

This directory contains working examples demonstrating various testing scenarios with the hap-test framework.

## Available Examples

### Basic Examples

#### [basic-accessory-test.ts](basic-accessory-test.ts)
Simple lightbulb platform test demonstrating:
- Creating a test harness
- Waiting for accessory registration
- Testing characteristic get/set operations
- Basic assertions

**Best for**: First-time users, understanding the basics

---

#### [debug-mode.ts](debug-mode.ts)
Demonstrates debug logging features:
- Enabling debug mode
- Viewing operation logs
- Inspecting harness state
- Troubleshooting test failures

**Best for**: Debugging failing tests

---

### Validation & Error Handling

#### [hap-protocol-validation.ts](hap-protocol-validation.ts)
Comprehensive HAP protocol validation examples:
- Value range validation (min/max)
- Format validation (int, float, bool, string)
- Enum value validation
- Step value validation
- Permission validation (read-only, write-only)

**Best for**: Understanding HAP constraints, testing edge cases

---

#### [error-scenarios.ts](error-scenarios.ts)
Testing error handling and resilience:
- Network failures and recovery
- Device timeouts
- Invalid characteristic values
- Permission violations
- Graceful error handling

**Best for**: Testing robustness, error recovery patterns

---

### Advanced Features

#### [time-based-features.ts](time-based-features.ts)
Time-controlled testing scenarios:
- Polling at regular intervals
- Scheduled operations
- Timeout handling
- Deterministic time advancement

**Best for**: Testing scheduled tasks, polling behavior

---

#### [multi-device-platform.ts](multi-device-platform.ts)
Complex platform with multiple accessories:
- Dynamic accessory discovery
- Multiple service types
- Independent accessory control
- Batch operations

**Best for**: Testing platforms with many devices

---

### Integration Examples

#### Test Files in `/test/examples/`

The `test/examples/` directory contains complete test suites:

##### [lightbulb-plugin.test.ts](../test/examples/lightbulb-plugin.test.ts)
Complete lightbulb platform test suite:
- On/Off control
- Brightness adjustment
- HAP validation
- State persistence

##### [thermostat-plugin.test.ts](../test/examples/thermostat-plugin.test.ts)
Thermostat testing patterns:
- Current temperature reading
- Target temperature setting
- Heating/Cooling mode control
- Temperature range validation

##### [multi-accessory-platform.test.ts](../test/examples/multi-accessory-platform.test.ts)
Platform with dynamic device discovery:
- Accessory discovery flow
- Registration tracking
- Multi-device coordination

##### [error-handling.test.ts](../test/examples/error-handling.test.ts)
Comprehensive error scenario testing:
- Network disconnection
- Device unavailability
- Invalid operations
- Recovery mechanisms

##### [time-based-features.test.ts](../test/examples/time-based-features.test.ts)
Time-controlled test examples:
- Polling intervals
- Scheduled operations
- Timeout scenarios
- Deterministic timing

##### [airpurifier-plugin.test.ts](../test/examples/airpurifier-plugin.test.ts)
Air purifier platform testing:
- Multiple characteristics
- Fan speed control
- Air quality monitoring
- Filter status

---

## Running Examples

### Run Individual Example

```bash
# Basic examples (just TypeScript files, need conversion to tests)
npx tsx examples/basic-accessory-test.ts

# Test examples (full test suites)
npx vitest run test/examples/lightbulb-plugin.test.ts
```

### Run All Example Tests

```bash
npx vitest run test/examples/
```

### Run with Debug Output

```bash
DEBUG=true npx vitest run test/examples/lightbulb-plugin.test.ts
```

---

## Example Structure

Each example follows this pattern:

```typescript
import { describe, test, expect, afterEach } from 'vitest';
import { TestHarness } from 'hap-test';
import { MyPlatform } from './MyPlatform';

describe('Example Description', () => {
  let harness: TestHarness;

  afterEach(async () => {
    if (harness) {
      await harness.shutdown();
    }
  });

  test('specific scenario', async () => {
    // 1. Setup harness
    harness = await TestHarness.create({
      platformConstructor: MyPlatform,
      platformConfig: { ... },
    });

    // 2. Wait for registration
    await harness.waitForAccessories(1);

    // 3. Get accessories/services
    const accessory = harness.homekit.accessories()[0];
    const service = harness.homekit.service(accessory.UUID, 'ServiceName');

    // 4. Perform operations
    await service.setCharacteristic('CharName', value);

    // 5. Assert results
    expect(service.getCharacteristic('CharName')?.value).toBe(expected);
  });
});
```

---

## Common Patterns

### Pattern: Basic Accessory Test

```typescript
test('controls accessory', async () => {
  const harness = await TestHarness.create({...});
  await harness.waitForAccessories(1);
  
  const service = harness.homekit.service(uuid, 'Lightbulb');
  await service.setCharacteristic('On', true);
  
  expect(service.getCharacteristic('On')?.value).toBe(true);
});
```

### Pattern: Time-Based Test

```typescript
test('polls every 30 seconds', async () => {
  const harness = await TestHarness.create({...});
  const char = harness.homekit.characteristic(uuid, 'Service', 'Char');
  
  expect(char.value).toBe(initialValue);
  await harness.time.advance(30000);
  expect(char.value).toBe(updatedValue);
});
```

### Pattern: Event Subscription

```typescript
test('receives value change events', async () => {
  const harness = await TestHarness.create({...});
  const char = harness.homekit.characteristic(uuid, 'Service', 'Char');
  
  const subscription = char.subscribe();
  // Trigger change
  const event = await subscription.waitForNext(1000);
  expect(event.newValue).toBe(expected);
});
```

### Pattern: Error Testing

```typescript
test('handles errors gracefully', async () => {
  const harness = await TestHarness.create({
    networkSimulation: { enabled: true },
  });
  
  harness.network.disconnect();
  await expect(
    service.setCharacteristic('On', true)
  ).rejects.toThrow();
});
```

### Pattern: Validation Testing

```typescript
test('validates characteristic constraints', async () => {
  const harness = await TestHarness.create({...});
  const service = harness.homekit.service(uuid, 'Lightbulb');
  
  // Should reject invalid value
  await expect(
    service.setCharacteristic('Brightness', 150) // Max is 100
  ).rejects.toThrow('exceeds maximum');
});
```

---

## Learning Path

**Beginner**:
1. Start with `basic-accessory-test.ts`
2. Run `lightbulb-plugin.test.ts`
3. Explore `hap-protocol-validation.ts`

**Intermediate**:
4. Study `time-based-features.ts`
5. Review `multi-accessory-platform.test.ts`
6. Examine `error-scenarios.ts`

**Advanced**:
7. Deep dive into `airpurifier-plugin.test.ts`
8. Analyze `thermostat-plugin.test.ts`
9. Create your own custom test suites

---

## Tips

1. **Always clean up**: Use `afterEach` to shutdown harness
2. **Wait for registration**: Don't assume accessories are immediate
3. **Use time control**: Avoid real delays in tests
4. **Enable debug**: When tests fail, enable debug mode
5. **Test edge cases**: Use validation examples as reference

---

## Contributing Examples

Want to add an example? Great! Follow this checklist:

- [ ] Clear description of what's demonstrated
- [ ] Complete, runnable code
- [ ] Comments explaining key concepts
- [ ] Proper cleanup (afterEach)
- [ ] Tests pass when run
- [ ] Add entry to this README

---

## Questions?

- Check the [main documentation](../docs/)
- Review [troubleshooting guide](../docs/troubleshooting.md)
- Open an issue on GitHub

---

**Last Updated**: December 30, 2025
