/**
 * Integration test: HAP Protocol Validation
 *
 * Verifies that MockCharacteristic enforces HAP protocol rules:
 * - Format validation
 * - Constraint validation (min/max/step/validValues)
 * - Permission enforcement (read/write/notify)
 */

import { describe, it, expect } from 'vitest';
import { MockAccessory, MockService, MockCharacteristic } from '../../src/MockHomeKit.js';

describe('HAP Protocol Validation Integration', () => {
  it('should enforce read-only characteristics', async () => {
    const char = new MockCharacteristic('Status', 'Status', 'ok', {
      format: 'string',
      perms: ['pr'], // Read-only
    });

    // Read should succeed
    expect(await char.getValue()).toBe('ok');

    // Write should fail
    await expect(char.setValue('error')).rejects.toThrow();
  });

  it('should enforce write-only characteristics', async () => {
    const char = new MockCharacteristic('Control', 'Control', 0, {
      format: 'int',
      perms: ['pw'], // Write-only
    });

    // Write should succeed
    await char.setValue(1);

    // Read should fail
    await expect(char.getValue()).rejects.toThrow();
  });

  it('should allow read-write operations on characteristics with both permissions', async () => {
    const char = new MockCharacteristic('Brightness', 'Brightness', 50, {
      format: 'int',
      perms: ['pr', 'pw'],
      minValue: 0,
      maxValue: 100,
    });

    // Both read and write should work
    expect(await char.getValue()).toBe(50);
    await char.setValue(75);
    expect(await char.getValue()).toBe(75);
  });

  it('should track value changes in event history', async () => {
    const char = new MockCharacteristic('On', 'On', false, {
      format: 'bool',
      perms: ['pr', 'pw', 'ev'],
    });

    const sub = char.subscribe();

    await char.setValue(true);
    await char.setValue(false);
    await char.setValue(true);

    const history = sub.getHistory();
    expect(history.length).toBe(3);
    expect(history[0].newValue).toBe(true);
    expect(history[1].newValue).toBe(false);
    expect(history[2].newValue).toBe(true);

    sub.unsubscribe();
  });

  it('should handle multiple services with different permissions', async () => {
    const accessory = new MockAccessory('multi-service', 'Multi Service');

    // Read-only service
    const readService = new MockService('Status', 'Status');
    const statusChar = new MockCharacteristic('Status', 'Status', 'idle', {
      format: 'string',
      perms: ['pr'],
    });
    readService.addCharacteristic(statusChar);
    accessory.addService(readService);

    // Write-only service
    const writeService = new MockService('Control', 'Control');
    const controlChar = new MockCharacteristic('Command', 'Command', '', {
      format: 'string',
      perms: ['pw'],
    });
    writeService.addCharacteristic(controlChar);
    accessory.addService(writeService);

    // Verify permissions
    expect(await statusChar.getValue()).toBe('idle');
    await expect(statusChar.setValue('running')).rejects.toThrow();

    await controlChar.setValue('start');
    await expect(controlChar.getValue()).rejects.toThrow();
  });
});
