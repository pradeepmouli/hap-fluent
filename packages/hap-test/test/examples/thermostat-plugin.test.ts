/**
 * Example: Thermostat plugin test (temperature and modes)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestHarness } from '../../src/TestHarness.js';
import { MockAccessory, MockService, MockCharacteristic } from '../../src/MockHomeKit.js';
import { CharacteristicValidationError } from '../../src/errors/CharacteristicValidationError.js';
import { toHaveAccessory, toHaveService, toHaveCharacteristic, toHaveValue, toBeInRange } from '../../src/matchers/index.js';

const HeatingCoolingState = { Off: 0, Heat: 1, Cool: 2, Auto: 3 } as const;

describe('Thermostat platform', () => {
  let harness: TestHarness;
  let thermostat: MockAccessory;
  let service: MockService;
  let currentTemp: MockCharacteristic;
  let targetTemp: MockCharacteristic;
  let currentState: MockCharacteristic;
  let targetState: MockCharacteristic;

  beforeEach(async () => {
    harness = await TestHarness.create({
      platformConstructor: undefined as any,
      platformConfig: { platform: 'ThermostatPlatform', name: 'Climate Control' },
    });

    thermostat = new MockAccessory('thermostat-uuid', 'Living Room Thermostat');
    service = new MockService('Thermostat', 'Thermostat');

    currentTemp = new MockCharacteristic('CurrentTemperature', 'CurrentTemperature', 22.0, {
      format: 'float',
      perms: ['pr', 'ev'],
      minValue: -50,
      maxValue: 100,
    });

    targetTemp = new MockCharacteristic('TargetTemperature', 'TargetTemperature', 21.0, {
      format: 'float',
      perms: ['pr', 'pw', 'ev'],
      minValue: 10,
      maxValue: 32,
      minStep: 0.5,
    });

    currentState = new MockCharacteristic('CurrentHeatingCoolingState', 'CurrentHeatingCoolingState', HeatingCoolingState.Off, {
      format: 'int',
      perms: ['pr', 'ev'],
      validValues: [HeatingCoolingState.Off, HeatingCoolingState.Heat, HeatingCoolingState.Cool, HeatingCoolingState.Auto],
    });

    targetState = new MockCharacteristic('TargetHeatingCoolingState', 'TargetHeatingCoolingState', HeatingCoolingState.Auto, {
      format: 'int',
      perms: ['pr', 'pw', 'ev'],
      validValues: [HeatingCoolingState.Off, HeatingCoolingState.Heat, HeatingCoolingState.Cool, HeatingCoolingState.Auto],
    });

    service.addCharacteristic(currentTemp);
    service.addCharacteristic(targetTemp);
    service.addCharacteristic(currentState);
    service.addCharacteristic(targetState);
    thermostat.addService(service);
    harness.homeKit.addAccessory(thermostat);
  });

  afterEach(() => {
    harness.shutdown();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('registers thermostat services and characteristics', () => {
    expect(toHaveAccessory(harness.homeKit, 'thermostat-uuid').pass).toBe(true);
    expect(toHaveService(harness.homeKit, 'Thermostat').pass).toBe(true);

    const svc = harness.homeKit.service('thermostat-uuid', 'Thermostat');
    expect(toHaveCharacteristic(svc!, 'CurrentTemperature').pass).toBe(true);
    expect(toHaveCharacteristic(svc!, 'TargetTemperature').pass).toBe(true);
    expect(toHaveCharacteristic(svc!, 'TargetHeatingCoolingState').pass).toBe(true);
  });

  it('adjusts target temperature and mode', async () => {
    const tempSubscription = targetTemp.subscribe();
    const modeSubscription = targetState.subscribe();

    await targetTemp.setValue(24.5);
    const tempEvent = await tempSubscription.waitForNext(200);
    expect(tempEvent.newValue).toBeCloseTo(24.5, 2);
    expect(toBeInRange(targetTemp, 10, 32).pass).toBe(true);

    await targetState.setValue(HeatingCoolingState.Heat);
    const modeEvent = await modeSubscription.waitForNext(200);
    expect(modeEvent.newValue).toBe(HeatingCoolingState.Heat);
    expect(toHaveValue(targetState, HeatingCoolingState.Heat).pass).toBe(true);

    tempSubscription.unsubscribe();
    modeSubscription.unsubscribe();
  });

  it('enforces read-only and range constraints', async () => {
    await expect(currentTemp.setValue(30)).rejects.toBeInstanceOf(CharacteristicValidationError);
    await expect(targetTemp.setValue(40)).rejects.toBeInstanceOf(CharacteristicValidationError);
    expect(toHaveValue(currentState, HeatingCoolingState.Off).pass).toBe(true);
  });
});
