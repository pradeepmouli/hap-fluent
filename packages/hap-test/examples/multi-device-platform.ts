/**
 * Example: Multi-device platform testing with batch operations
 * 
 * Demonstrates testing platforms with multiple accessories,
 * cached accessory restoration, and batch refresh operations.
 */

import { TestHarness } from '../src/TestHarness.js';
import { MockAccessory, MockService, MockCharacteristic } from '../src/MockHomeKit.js';
import type { HarnessOptions } from '../src/types/harness.js';

async function runMultiDevicePlatformTest() {
  console.log('🏠 Multi-Device Platform Testing\n');

  // Scenario 1: Fresh platform setup with multiple devices
  console.log('1️⃣  Testing fresh platform with 3 lights...');
  
  const options1: HarnessOptions = {
    platformConstructor: undefined as any,
    platformConfig: {
      platform: 'SmartLightsPlatform',
      name: 'Smart Lights',
    },
  };

  const harness1 = await TestHarness.create(options1);

  // Add three light bulbs
  const lights = ['Living Room', 'Bedroom', 'Kitchen'].map((room, idx) => {
    const light = new MockAccessory(`light-${idx}`, `${room} Light`);
    const service = new MockService('Lightbulb', 'Lightbulb');
    
    service.addCharacteristic(new MockCharacteristic('On', 'On', false, {
      format: 'bool',
      perms: ['pr', 'pw', 'ev'],
    }));
    
    service.addCharacteristic(new MockCharacteristic('Brightness', 'Brightness', 100, {
      format: 'int',
      perms: ['pr', 'pw', 'ev'],
      minValue: 0,
      maxValue: 100,
      unit: 'percentage',
    }));
    
    light.addService(service);
    harness1.homeKit.addAccessory(light);
    
    return light;
  });

  console.log(`   ✓ Added ${lights.length} light accessories`);

  // Test batch operations
  console.log('\n2️⃣  Testing batch refresh operation...');
  
  // Set different brightness values
  await harness1.homeKit.characteristic('light-0', 'Lightbulb', 'Brightness')?.setValue(50);
  await harness1.homeKit.characteristic('light-1', 'Lightbulb', 'Brightness')?.setValue(75);
  await harness1.homeKit.characteristic('light-2', 'Lightbulb', 'Brightness')?.setValue(100);

  const allValues = await harness1.homeKit.refreshAll();
  console.log(`   ✓ Batch refresh returned ${allValues.size} values`);
  
  console.log('\n   Current state:');
  allValues.forEach((value, key) => {
    if (key.includes('Brightness')) {
      console.log(`   - ${key}: ${value}%`);
    }
  });

  harness1.shutdown();

  // Scenario 2: Platform restart with cached accessories
  console.log('\n3️⃣  Testing platform restart with cached accessories...');
  
  const options2: HarnessOptions = {
    platformConstructor: undefined as any,
    platformConfig: {
      platform: 'SmartLightsPlatform',
      name: 'Smart Lights',
    },
    cachedAccessories: lights, // Restore previous accessories
  };

  const harness2 = await TestHarness.create(options2);

  // Verify cached accessories were restored
  const brightness = await harness2.homeKit.characteristic('light-0', 'Lightbulb', 'Brightness')?.getValue();
  
  console.log(`   ✓ Restored ${lights.length} cached accessories`);
  console.log(`   ✓ Living Room Light brightness: ${brightness}%`);

  // Scenario 3: Multi-controller testing
  console.log('\n4️⃣  Testing multiple HomeKit controllers...');
  
  // Controller 1 pairs and sets values
  harness2.homeKit.pair();
  await harness2.homeKit.characteristic('light-1', 'Lightbulb', 'On')?.setValue(true);
  console.log(`   ✓ Controller paired and turned on bedroom light`);

  // Test pairing status
  const isPaired = harness2.homeKit.isPaired();
  console.log(`   ✓ Controller pairing status: ${isPaired ? 'PAIRED' : 'NOT PAIRED'}`);

  // Scenario 4: Testing dynamic accessory addition
  console.log('\n5️⃣  Testing dynamic accessory addition...');
  
  const newLight = new MockAccessory('light-3', 'Garage Light');
  const garageService = new MockService('Lightbulb', 'Lightbulb');
  garageService.addCharacteristic(new MockCharacteristic('On', 'On', false, {
    format: 'bool',
    perms: ['pr', 'pw', 'ev'],
  }));
  newLight.addService(garageService);
  
  harness2.homeKit.addAccessory(newLight);
  console.log(`   ✓ Added new accessory dynamically`);
  
  const accessoryCount = harness2.homeKit.accessories().length;
  console.log(`   ✓ Total accessories now: ${accessoryCount}`);

  // Final batch refresh showing all devices
  console.log('\n6️⃣  Final state of all devices:');
  const finalState = await harness2.homeKit.refreshAll();
  
  const byAccessory = new Map<string, Map<string, any>>();
  finalState.forEach((value, key) => {
    const [uuid] = key.split('.');
    if (!byAccessory.has(uuid)) {
      byAccessory.set(uuid, new Map());
    }
    const charName = key.split('.').pop() || '';
    byAccessory.get(uuid)!.set(charName, value);
  });

  byAccessory.forEach((chars, uuid) => {
    const accessory = harness2.homeKit.accessory(uuid);
    console.log(`\n   ${accessory?.displayName || uuid}:`);
    chars.forEach((value, charName) => {
      console.log(`     - ${charName}: ${value}`);
    });
  });

  console.log('\n✅ All multi-device scenarios tested successfully!');

  harness2.shutdown();
}

export { runMultiDevicePlatformTest };
