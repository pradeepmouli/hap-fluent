# Troubleshooting Guide

This guide covers common issues when using the Homebridge Test Harness and how to resolve them.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Test Execution Problems](#test-execution-problems)
- [Mock Behavior Issues](#mock-behavior-issues)
- [Timing and Event Issues](#timing-and-event-issues)
- [Validation Errors](#validation-errors)
- [Network Simulation Issues](#network-simulation-issues)
- [Debugging Tips](#debugging-tips)

---

## Installation Issues

### Peer Dependency Warnings

**Problem**: npm/pnpm warns about unmet peer dependencies.

**Solution**: Ensure you have the required peer dependencies installed:

```bash
npm install --save-dev homebridge hap-nodejs hap-fluent vitest
```

**Versions Required**:
- `homebridge`: >=1.11.0
- `hap-nodejs`: >=0.13.0
- `hap-fluent`: >=0.3.0
- `vitest`: >=2.0.0

### TypeScript Compilation Errors

**Problem**: TypeScript errors when importing hap-test types.

**Solution**: Ensure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true
  }
}
```

---

## Test Execution Problems

### Tests Timeout Immediately

**Problem**: All tests timeout with "Operation timed out" errors.

**Possible Causes**:
1. Platform constructor never completes
2. Platform hangs waiting for external resources
3. TimeController not properly configured

**Solutions**:

```typescript
// Increase timeout for slow platforms
const harness = await TestHarness.create({
  platformConfig: myConfig,
  timeouts: {
    startup: 10000, // 10 seconds
    registration: 5000,
  },
});

// Use TimeController for time-dependent operations
await harness.time.advance(1000); // Instead of real delays
```

### Platform Not Initializing

**Problem**: `harness.homekit.accessories()` returns empty array.

**Possible Causes**:
1. Platform didn't register any accessories
2. Platform registers accessories asynchronously after `didFinishLaunching`
3. Configuration is invalid

**Solutions**:

```typescript
// Wait for accessories to be registered
await harness.waitForAccessories(1, 5000); // Wait for 1 accessory, 5s timeout

// Check platform logs
const harness = await TestHarness.create({
  platformConfig: myConfig,
  debug: true, // Enable debug logging
});

// Verify platform received correct config
console.log('Platform config:', harness.platform);
```

### Cleanup Errors Between Tests

**Problem**: Tests fail with "Accessory already registered" or similar errors.

**Solution**: Always clean up in `afterEach`:

```typescript
let harness: TestHarness;

afterEach(async () => {
  if (harness) {
    await harness.shutdown();
  }
});

test('my test', async () => {
  harness = await TestHarness.create({...});
  // Test code
});
```

---

## Mock Behavior Issues

### Characteristic Values Not Updating

**Problem**: Calling `characteristic.setValue()` doesn't trigger platform handlers.

**Explanation**: Mock characteristics don't automatically call platform handlers. Use the platform's API:

```typescript
// ❌ Wrong - doesn't trigger platform handlers
const char = homekit.characteristic(uuid, 'Lightbulb', 'On');
char.setValue(true);

// ✅ Correct - triggers platform's onSet handler
const service = homekit.service(uuid, 'Lightbulb');
await service.setCharacteristic('On', true);
```

### Services Not Found

**Problem**: `homekit.service(uuid, 'Lightbulb')` returns undefined.

**Possible Causes**:
1. Service name doesn't match exactly (case-sensitive)
2. Accessory not registered yet
3. Service created with subtype

**Solutions**:

```typescript
// Wait for accessory registration
await harness.waitForAccessories(1);

// Check available services
const accessory = homekit.accessory(uuid);
console.log('Services:', accessory?.services.map(s => s.displayName));

// Use exact service name from HAP
const service = homekit.service(uuid, 'Lightbulb'); // Not 'Light Bulb'

// For services with subtypes
const service = homekit.service(uuid, 'Outlet', 'outlet-1');
```

---

## Timing and Event Issues

### Events Not Received

**Problem**: `subscription.waitForNext()` times out even though value changed.

**Possible Causes**:
1. Value didn't actually change (setValue with same value)
2. Subscription created after value change
3. Platform updated value without triggering notification

**Solutions**:

```typescript
// Subscribe before changing value
const subscription = char.subscribe();

// Change value
await platform.updateCharacteristic();

// Wait for event
const event = await subscription.waitForNext(1000);

// Check if value actually changed
console.log('Old:', event.oldValue, 'New:', event.newValue);
```

### Time-Based Tests Flaky

**Problem**: Tests that use `time.advance()` sometimes pass, sometimes fail.

**Solution**: Always use TimeController consistently:

```typescript
// ✅ Good - deterministic time control
test('polling every 30 seconds', async () => {
  const harness = await TestHarness.create({...});
  
  // Platform should poll on creation
  expect(homekit.characteristic(uuid, 'Lightbulb', 'On').value).toBe(false);
  
  // Advance exactly 30 seconds
  await harness.time.advance(30000);
  
  // Platform should have polled again
  expect(homekit.characteristic(uuid, 'Lightbulb', 'On').value).toBe(true);
});

// ❌ Bad - mixing real time and fake time
test('flaky polling test', async () => {
  // Don't mix setTimeout with time.advance()
  setTimeout(() => {}, 1000); // This uses real time!
  await harness.time.advance(30000); // This uses fake time
});
```

---

## Validation Errors

### Unexpected CharacteristicValidationError

**Problem**: Test fails with validation error for what seems like a valid value.

**Common Cases**:

#### Case 1: Value Out of Range

```typescript
// ❌ Brightness must be 0-100
service.setCharacteristic('Brightness', 150);
// Error: Value 150 exceeds maximum 100

// ✅ Correct
service.setCharacteristic('Brightness', 100);
```

#### Case 2: Wrong Format

```typescript
// ❌ CurrentTemperature expects number
service.setCharacteristic('CurrentTemperature', '20');
// Error: Expected number, got string

// ✅ Correct
service.setCharacteristic('CurrentTemperature', 20);
```

#### Case 3: Invalid Enum Value

```typescript
// ❌ TargetHeatingCoolingState only accepts 0, 1, 2, 3
service.setCharacteristic('TargetHeatingCoolingState', 5);
// Error: Value 5 not in valid values [0, 1, 2, 3]

// ✅ Correct
service.setCharacteristic('TargetHeatingCoolingState', 1); // HEAT
```

#### Case 4: Step Value Violation

```typescript
// ❌ Hue has step of 1 (integers only)
service.setCharacteristic('Hue', 180.5);
// Error: Value 180.5 does not match step 1

// ✅ Correct
service.setCharacteristic('Hue', 180);
```

### Permission Errors

**Problem**: "Characteristic does not support write operations"

**Explanation**: Some characteristics are read-only (e.g., CurrentTemperature).

```typescript
// ❌ CurrentTemperature is read-only
service.setCharacteristic('CurrentTemperature', 25);
// Error: Characteristic does not support write operations

// ✅ Platform should update it, not tests
// In platform code:
service.getCharacteristic(Characteristic.CurrentTemperature)
  .updateValue(25);

// In tests, just read it:
const temp = await service.getCharacteristic('CurrentTemperature');
expect(temp).toBe(25);
```

---

## Network Simulation Issues

### Network Simulation Not Working

**Problem**: Setting latency/packet loss has no effect.

**Solution**: Ensure NetworkSimulator is enabled:

```typescript
const harness = await TestHarness.create({
  platformConfig: myConfig,
  networkSimulation: {
    enabled: true, // Must be explicitly enabled
  },
});

// Now network simulation works
harness.network.setLatency(100);
harness.network.setPacketLoss(0.1);
```

### Timeouts Too Aggressive

**Problem**: Tests fail with network simulation because operations timeout.

**Solution**: Adjust timeouts to account for simulated latency:

```typescript
harness.network.setLatency(200); // 200ms latency

// Operation needs time for both request and response
await service.setCharacteristic('On', true); // Total: ~400ms

// If using custom timeouts:
const char = await service.getCharacteristic('On', { timeout: 1000 });
```

---

## Debugging Tips

### Enable Debug Logging

```typescript
const harness = await TestHarness.create({
  platformConfig: myConfig,
  debug: true, // Enables detailed logging
});

// You'll see:
// - Platform initialization steps
// - Accessory registration events
// - Characteristic get/set operations
// - Event emissions
// - Network simulation effects
```

### Inspect Harness State

```typescript
// Check what accessories are registered
console.log('Accessories:', harness.homekit.accessories().map(a => ({
  uuid: a.UUID,
  name: a.displayName,
  services: a.services.map(s => s.displayName),
})));

// Check characteristic values
const accessory = harness.homekit.accessory(uuid);
accessory?.services.forEach(service => {
  console.log(`Service: ${service.displayName}`);
  service.characteristics.forEach(char => {
    console.log(`  ${char.displayName}: ${char.value}`);
  });
});

// Check pending operations
console.log('Pending ops:', harness.pendingOperations);
```

### Use Vitest Debugging

```typescript
// Add .only to debug specific test
test.only('debug this test', async () => {
  // Set breakpoints here
  const harness = await TestHarness.create({...});
});

// Use console.log liberally
test('investigate behavior', async () => {
  console.log('Before:', char.value);
  await service.setCharacteristic('On', true);
  console.log('After:', char.value);
});
```

### Check Event History

```typescript
const subscription = char.subscribe();

// Do some operations
await service.setCharacteristic('On', true);
await service.setCharacteristic('Brightness', 75);

// Check what events fired
const history = subscription.getHistory();
console.log('Events:', history.map(e => ({
  characteristic: e.characteristic,
  oldValue: e.oldValue,
  newValue: e.newValue,
  timestamp: e.timestamp,
})));
```

### Verify HAP Constraints

```typescript
// Check characteristic properties
const char = homekit.characteristic(uuid, 'Lightbulb', 'Brightness');
console.log('Properties:', {
  minValue: char.props?.minValue,
  maxValue: char.props?.maxValue,
  minStep: char.props?.minStep,
  validValues: char.props?.validValues,
  format: char.props?.format,
  perms: char.props?.perms,
});
```

---

## Common Error Messages

### "Operation timed out after Xms"

**Meaning**: An async operation didn't complete in time.

**Solutions**:
- Increase timeout in harness options
- Check if platform is actually responding
- Use `time.advance()` for time-dependent code
- Enable debug logging to see where it's stuck

### "Accessory with UUID 'xxx' not found"

**Meaning**: Trying to access an accessory that isn't registered.

**Solutions**:
- Wait for registration: `await harness.waitForAccessories(1)`
- Verify UUID is correct
- Check if platform actually registered it

### "Characteristic 'XXX' does not exist on service 'YYY'"

**Meaning**: Service doesn't have that characteristic.

**Solutions**:
- Check characteristic spelling (case-sensitive)
- Verify service type supports that characteristic
- Platform may not have added it yet

### "Value X violates constraint Y"

**Meaning**: Validation failed per HAP protocol.

**Solutions**:
- Check valid range for characteristic
- Verify format (int vs float, etc.)
- Review HAP specification for characteristic

---

## Getting More Help

1. **Check Examples**: Review `/examples` directory for working patterns
2. **Enable Debug Mode**: Always your first debugging step
3. **Read API Docs**: Check JSDoc for method signatures and behavior
4. **GitHub Issues**: Search for similar issues or create new one
5. **Stack Trace**: Read the full error message and stack trace carefully

---

## Performance Issues

### Slow Test Execution

**Problem**: Tests take longer than expected.

**Causes & Solutions**:

```typescript
// ❌ Creating harness in every test
test('test 1', async () => {
  const harness = await TestHarness.create({...}); // Slow!
});

// ✅ Reuse harness across tests when possible
describe('my platform', () => {
  let harness: TestHarness;
  
  beforeAll(async () => {
    harness = await TestHarness.create({...}); // Once
  });
  
  afterAll(async () => {
    await harness.shutdown();
  });
  
  test('test 1', async () => {
    // Use harness
  });
  
  test('test 2', async () => {
    // Use same harness
  });
});
```

### Memory Leaks

**Problem**: Tests consume increasing memory.

**Solution**: Always clean up:

```typescript
afterEach(async () => {
  if (harness) {
    await harness.shutdown(); // Critical!
  }
});
```

---

**Last Updated**: December 30, 2025
