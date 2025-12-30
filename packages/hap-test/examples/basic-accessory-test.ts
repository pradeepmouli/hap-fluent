/**
 * Basic Example: Testing a simple lightbulb accessory
 *
 * This example demonstrates:
 * - Creating a test harness
 * - Setting up a mock accessory with a service and characteristics
 * - Performing get/set operations
 * - Basic assertions
 */

import { TestHarness, MockAccessory, MockService, MockCharacteristic } from '../src/index.js';

async function runExample() {
  // Create test harness
  const harness = await TestHarness.create({
    platformConstructor: undefined as any, // In real tests, provide your platform class
    platformConfig: {
      platform: 'ExampleLightbulb',
      name: 'Example Light',
    },
  });

  console.log('✓ Test harness created');

  // Create a mock lightbulb accessory
  const accessory = new MockAccessory('example-light-uuid', 'Living Room Light');

  // Add Lightbulb service
  const service = new MockService('Lightbulb', 'Lightbulb');

  // Add On characteristic
  const onChar = new MockCharacteristic('On', 'On', false, {
    format: 'bool',
    perms: ['pr', 'pw', 'ev'],
  });

  // Add Brightness characteristic
  const brightnessChar = new MockCharacteristic('Brightness', 'Brightness', 0, {
    format: 'int',
    perms: ['pr', 'pw', 'ev'],
    minValue: 0,
    maxValue: 100,
    minStep: 1,
  });

  service.addCharacteristic(onChar);
  service.addCharacteristic(brightnessChar);
  accessory.addService(service);

  // Register with HomeKit controller
  harness.homeKit.addAccessory(accessory);

  console.log('✓ Accessory registered');

  // Test: Turn light on
  await onChar.setValue(true);
  const isOn = await onChar.getValue();
  console.log(`✓ Light turned on: ${isOn}`);

  // Test: Set brightness
  await brightnessChar.setValue(75);
  const brightness = await brightnessChar.getValue();
  console.log(`✓ Brightness set to: ${brightness}%`);

  // Test: Subscribe to changes
  const subscription = onChar.subscribe();

  // Trigger a change
  await onChar.setValue(false);

  // Check history
  const history = subscription.getHistory();
  console.log(`✓ Event history has ${history.length} events`);

  subscription.unsubscribe();

  // Cleanup
  harness.shutdown();
  console.log('✓ Test harness shutdown');
}

export { runExample };
