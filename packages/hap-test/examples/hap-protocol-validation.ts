/**
 * Example: HAP Protocol Validation
 *
 * Demonstrates how hap-test enforces HomeKit Accessory Protocol (HAP) rules
 * for characteristics including:
 * - Format validation (bool, int, string, etc.)
 * - Constraint validation (min/max/step)
 * - Permission enforcement (read/write/notify)
 */

import { MockAccessory, MockService, MockCharacteristic } from '../src/index.js';

async function demonstrateValidation() {
  console.log('=== HAP Protocol Validation Example ===\n');

  // Example 1: Permission enforcement
  console.log('1. Permission Enforcement');
  console.log('   Creating a read-only Status characteristic...');

  const statusChar = new MockCharacteristic('Status', 'Status', 'available', {
    format: 'string',
    perms: ['pr'], // Read-only
  });

  try {
    const status = await statusChar.getValue();
    console.log(`   ✓ Read succeeded: "${status}"`);
  } catch (err) {
    console.log(`   ✗ Read failed: ${err}`);
  }

  try {
    await statusChar.setValue('unavailable');
    console.log('   ✗ Write succeeded (should have failed!)');
  } catch {
    console.log(`   ✓ Write correctly rejected: Permission denied`);
  }

  // Example 2: Brightness with constraints
  console.log('\n2. Constraint Validation (min/max)');
  console.log('   Creating Brightness characteristic (0-100)...');

  const brightnessChar = new MockCharacteristic('Brightness', 'Brightness', 50, {
    format: 'int',
    perms: ['pr', 'pw'],
    minValue: 0,
    maxValue: 100,
  });

  // Valid values should work
  const validValues = [0, 25, 50, 75, 100];
  for (const val of validValues) {
    await brightnessChar.setValue(val);
    const current = await brightnessChar.getValue();
    console.log(`   ✓ Set brightness to ${val}: ${current}`);
  }

  // Example 3: Complete accessory with mixed permissions
  console.log('\n3. Accessory with Multiple Characteristics');
  console.log('   Creating a lightbulb accessory...');

  const light = new MockAccessory('light-1', 'Table Lamp');
  const lightbulbSvc = new MockService('Lightbulb', 'Lightbulb');

  // Readable and writable (On state)
  const onChar = new MockCharacteristic('On', 'On', false, {
    format: 'bool',
    perms: ['pr', 'pw', 'ev'], // Read, Write, Notify
  });

  // Brightness
  const brightnessChar2 = new MockCharacteristic('Brightness', 'Brightness', 50, {
    format: 'int',
    perms: ['pr', 'pw'],
    minValue: 0,
    maxValue: 100,
    minStep: 1,
  });

  lightbulbSvc.addCharacteristic(onChar);
  lightbulbSvc.addCharacteristic(brightnessChar2);
  light.addService(lightbulbSvc);

  // Test operations
  console.log('   Turning light on...');
  await onChar.setValue(true);
  console.log(`   ✓ Light is now ${await onChar.getValue() ? 'on' : 'off'}`);

  console.log('   Setting brightness to 75...');
  await brightnessChar2.setValue(75);
  console.log(`   ✓ Brightness is now ${await brightnessChar2.getValue()}%`);

  // Subscribe to changes
  const subscription = onChar.subscribe();
  console.log('   Toggling light off...');
  await onChar.setValue(false);

  const eventHistory = subscription.getHistory();
  console.log(`   ✓ Event history shows ${eventHistory.length} changes`);
  subscription.unsubscribe();

  console.log('\n✓ All validation examples completed successfully!');
}

export { demonstrateValidation };
