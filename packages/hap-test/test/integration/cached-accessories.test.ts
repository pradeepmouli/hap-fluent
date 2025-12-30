/**
 * Integration test: Cached accessory restoration flow
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHarness } from '../../src/TestHarness.js';
import { MockAccessory, MockService, MockCharacteristic } from '../../src/MockHomeKit.js';
import type { HarnessOptions } from '../../src/types/harness.js';

describe('Cached Accessory Restoration', () => {
  let harness: TestHarness;
  let options: HarnessOptions;

  beforeEach(async () => {
    const cached = new MockAccessory('cached-uuid', 'Cached Light');
    const svc = new MockService('Lightbulb', 'Lightbulb');
    const on = new MockCharacteristic('On', 'On', true, { format: 'bool', perms: ['pr', 'pw', 'ev'] });
    svc.addCharacteristic(on);
    cached.addService(svc);

    options = {
      platformConstructor: undefined as any,
      platformConfig: { platform: 'TestPlatform', name: 'Test' },
      cachedAccessories: [cached],
    };

    harness = await TestHarness.create(options);
  });

  afterEach(() => {
    if (harness) harness.shutdown();
  });

  it('emits configureAccessory for each cached accessory', async () => {
    let configureCount = 0;
    const handler = () => { configureCount += 1; };
    
    // Attach handler before providing cached accessories
    harness.api.on('configureAccessory', handler);
    harness.api.provideCachedAccessories(options.cachedAccessories || []);
    
    expect(configureCount).toBe(1);
    expect(harness.api.getCachedAccessories().length).toBe(1);
  });

  it('restores cached accessories into HomeKit controller', async () => {
    const accs = harness.homeKit.accessories();
    expect(accs.length).toBe(1);
    expect(accs[0].UUID).toBe('cached-uuid');
    expect(accs[0].displayName).toBe('Cached Light');

    const char = harness.homeKit.characteristic('cached-uuid', 'Lightbulb', 'On');
    expect(await char?.getValue()).toBe(true);
  });
});
