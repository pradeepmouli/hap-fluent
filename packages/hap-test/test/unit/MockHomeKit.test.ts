/**
 * Unit tests for MockHomeKit and mock entities
 */

import { describe, it, expect } from 'vitest';
import { MockHomeKit, MockAccessory, MockService, MockCharacteristic } from '../../src/MockHomeKit.js';

describe('MockHomeKit', () => {
  it('should add and retrieve accessories', () => {
    const hk = new MockHomeKit();
    const acc = new MockAccessory('uuid-1', 'Test Accessory');
    hk.addAccessory(acc);

    expect(hk.accessories()).toHaveLength(1);
    expect(hk.accessory('uuid-1')?.displayName).toBe('Test Accessory');
  });

  it('should retrieve services and characteristics', async () => {
    const hk = new MockHomeKit();
    const acc = new MockAccessory('uuid-2', 'Accessory 2');
    const svc = new MockService('Lightbulb', 'Lightbulb');
    const char = new MockCharacteristic('On', 'On', false, { format: 'bool', perms: ['pr', 'pw'] });

    svc.addCharacteristic(char);
    acc.addService(svc);
    hk.addAccessory(acc);

    const fetchedSvc = hk.service('uuid-2', 'Lightbulb');
    expect(fetchedSvc?.displayName).toBe('Lightbulb');

    const fetchedChar = hk.characteristic('uuid-2', 'Lightbulb', 'On');
    expect(await fetchedChar?.getValue()).toBe(false);

    await fetchedChar?.setValue(true);
    expect(await fetchedChar?.getValue()).toBe(true);
  });

  it('should support subscriptions and event history', async () => {
    const hk = new MockHomeKit();
    const acc = new MockAccessory('uuid-3', 'Accessory 3');
    const svc = new MockService('Switch', 'Switch');
    const char = new MockCharacteristic('On', 'On', false, { format: 'bool', perms: ['pr', 'pw', 'ev'] });

    svc.addCharacteristic(char);
    acc.addService(svc);
    hk.addAccessory(acc);

    const sub = char.subscribe();
    const waiter = sub.waitForNext(200);

    // Trigger change
    await char.setValue(true);

    const evt = await waiter;
    expect(evt.newValue).toBe(true);
    expect(evt.accessoryUUID).toBe('uuid-3');
    expect(sub.getHistory().length).toBeGreaterThan(0);

    sub.unsubscribe();
    expect(char.isSubscribed()).toBe(false);
  });
});
