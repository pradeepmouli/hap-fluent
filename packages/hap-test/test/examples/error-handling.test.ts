/**
 * Example: Error handling scenarios with NetworkSimulator
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestHarness } from '../../src/TestHarness.js';
import { NetworkSimulator } from '../../src/NetworkSimulator.js';
import { NetworkError, NetworkErrorType } from '../../src/errors/NetworkError.js';
import { MockAccessory, MockService, MockCharacteristic } from '../../src/MockHomeKit.js';

const buildThermostat = (): MockAccessory => {
  const accessory = new MockAccessory('thermostat-uuid', 'Living Room Thermostat');
  const service = new MockService('Thermostat', 'Thermostat');

  service.addCharacteristic(new MockCharacteristic('CurrentTemperature', 'CurrentTemperature', 22, {
    format: 'float',
    perms: ['pr', 'ev'],
    minValue: -50,
    maxValue: 100,
  }));

  service.addCharacteristic(new MockCharacteristic('TargetTemperature', 'TargetTemperature', 20, {
    format: 'float',
    perms: ['pr', 'pw', 'ev'],
    minValue: 10,
    maxValue: 38,
  }));

  accessory.addService(service);
  return accessory;
};

describe('Error handling with simulated networks', () => {
  let harness: TestHarness;
  let simulator: NetworkSimulator;
  let targetChar: MockCharacteristic;

  beforeEach(async () => {
    harness = await TestHarness.create({
      platformConstructor: undefined as any,
      platformConfig: { platform: 'NetworkedThermostat', name: 'Thermostat' },
    });

    simulator = new NetworkSimulator();
    harness.homeKit.setNetworkSimulator(simulator);

    const thermostat = buildThermostat();
    harness.homeKit.addAccessory(thermostat);
    targetChar = harness.homeKit.characteristic('thermostat-uuid', 'Thermostat', 'TargetTemperature')!;
  });

  afterEach(() => {
    harness.shutdown();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('adds latency to read and write operations', async () => {
    simulator.setLatency(250);
    vi.useFakeTimers();

    const writePromise = targetChar.setValue(22);
    await vi.advanceTimersByTimeAsync(250);
    await expect(writePromise).resolves.toBeUndefined();

    const readPromise = targetChar.getValue();
    await vi.advanceTimersByTimeAsync(250);
    await expect(readPromise).resolves.toBe(22);
  });

  it('throws when packet loss is triggered', async () => {
    simulator.reset();
    simulator.setPacketLoss(1.0);
    vi.spyOn(Math, 'random').mockReturnValue(0.01);

    await expect(targetChar.getValue()).rejects.toBeInstanceOf(NetworkError);
    await expect(targetChar.getValue()).rejects.toMatchObject({ errorType: NetworkErrorType.PACKET_LOSS });
  });

  it('errors on disconnect and recovers after reconnect', async () => {
    simulator.disconnect();
    await expect(targetChar.setValue(21)).rejects.toMatchObject({ errorType: NetworkErrorType.DISCONNECTED });

    simulator.reconnect();
    simulator.reset();

    await expect(targetChar.setValue(23)).resolves.toBeUndefined();
    await expect(targetChar.getValue()).resolves.toBe(23);
  });
});
