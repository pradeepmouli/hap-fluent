/**
 * Example: Multi-accessory platform test (dynamic discovery + caching)
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TestHarness } from '../../src/TestHarness.js';
import { MockAccessory, MockService, MockCharacteristic } from '../../src/MockHomeKit.js';
import type { HarnessOptions } from '../../src/types/harness.js';

function buildLight(uuid: string, name: string): MockAccessory {
  const accessory = new MockAccessory(uuid, name);
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
  }));

  accessory.addService(service);
  return accessory;
}

describe('Multi-accessory platform', () => {
  let harness: TestHarness;
  let accessories: MockAccessory[];

  beforeEach(async () => {
    harness = await TestHarness.create({
      platformConstructor: undefined as any,
      platformConfig: { platform: 'MultiAccessoryPlatform', name: 'Multi Accessory' },
    });

    accessories = [
      buildLight('light-0', 'Hallway Light'),
      buildLight('light-1', 'Kitchen Light'),
    ];

    accessories.forEach(acc => harness.homeKit.addAccessory(acc));
  });

  afterEach(() => {
    harness.shutdown();
  });

  it('refreshes values across all accessories', async () => {
    await harness.homeKit.characteristic('light-0', 'Lightbulb', 'On')?.setValue(true);
    await harness.homeKit.characteristic('light-0', 'Lightbulb', 'Brightness')?.setValue(40);
    await harness.homeKit.characteristic('light-1', 'Lightbulb', 'Brightness')?.setValue(75);

    const values = await harness.homeKit.refreshAll();
    const expectedCharacteristics = accessories.length * 2; // On + Brightness per accessory

    expect(values.size).toBe(expectedCharacteristics);
    expect(values.get('light-0.Lightbulb.On')).toBe(true);
    expect(values.get('light-0.Lightbulb.Brightness')).toBe(40);
    expect(values.get('light-1.Lightbulb.Brightness')).toBe(75);
  });

  it('restores cached accessories and supports dynamic discovery', async () => {
    const cachedOptions: HarnessOptions = {
      platformConstructor: undefined as any,
      platformConfig: { platform: 'MultiAccessoryPlatform', name: 'Multi Accessory' },
      cachedAccessories: accessories,
    };

    const restoredHarness = await TestHarness.create(cachedOptions);
    expect(restoredHarness.homeKit.accessories().length).toBe(accessories.length);

    const newSensor = new MockAccessory('sensor-0', 'Door Sensor');
    const contactService = new MockService('ContactSensor', 'ContactSensor');
    contactService.addCharacteristic(new MockCharacteristic('ContactSensorState', 'ContactSensorState', 0, {
      format: 'int',
      perms: ['pr', 'pw', 'ev'],
      validValues: [0, 1],
    }));
    newSensor.addService(contactService);

    restoredHarness.homeKit.addAccessory(newSensor);

    const refreshed = await restoredHarness.homeKit.refreshAll();
    expect(refreshed.has('sensor-0.ContactSensor.ContactSensorState')).toBe(true);
    expect(restoredHarness.homeKit.accessories().length).toBe(accessories.length + 1);

    restoredHarness.shutdown();
  });
});
