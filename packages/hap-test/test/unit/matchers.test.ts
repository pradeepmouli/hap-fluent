/**
 * Tests for custom Vitest matchers
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockHomeKit, MockAccessory, MockService, MockCharacteristic } from '../../src/MockHomeKit.js';
import {
  toHaveService,
  toHaveAccessory,
  toBeRegistered,
  toHaveCharacteristic,
  toHaveValue,
  toBeInRange,
  toHaveFormat,
} from '../../src/matchers/index.js';

describe('Accessory Matchers', () => {
  let homeKit: MockHomeKit;
  let accessory: MockAccessory;

  beforeEach(() => {
    homeKit = new MockHomeKit();
    accessory = new MockAccessory('test-uuid', 'Test Accessory');
    const service = new MockService('Lightbulb', 'Lightbulb');
    service.addCharacteristic(new MockCharacteristic('On', 'On', false, {
      format: 'bool',
      perms: ['pr', 'pw'],
    }));
    accessory.addService(service);
    homeKit.addAccessory(accessory);
  });

  describe('toHaveService', () => {
    it('should pass when service exists', () => {
      const result = toHaveService(homeKit, 'Lightbulb');
      expect(result.pass).toBe(true);
    });

    it('should fail when service does not exist', () => {
      const result = toHaveService(homeKit, 'Thermostat');
      expect(result.pass).toBe(false);
      expect(result.message()).toContain('Expected HomeKit to have service "Thermostat"');
    });
  });

  describe('toHaveAccessory', () => {
    it('should pass when accessory exists', () => {
      const result = toHaveAccessory(homeKit, 'test-uuid');
      expect(result.pass).toBe(true);
    });

    it('should fail when accessory does not exist', () => {
      const result = toHaveAccessory(homeKit, 'missing-uuid');
      expect(result.pass).toBe(false);
      expect(result.message()).toContain('Expected HomeKit to have accessory "missing-uuid"');
    });
  });

  describe('toBeRegistered', () => {
    it('should pass when accessory is registered', () => {
      const result = toBeRegistered(accessory, homeKit);
      expect(result.pass).toBe(true);
    });

    it('should fail when accessory is not registered', () => {
      const newAccessory = new MockAccessory('other-uuid', 'Other Accessory');
      const result = toBeRegistered(newAccessory, homeKit);
      expect(result.pass).toBe(false);
      expect(result.message()).toContain('Expected accessory "Other Accessory"');
    });
  });
});

describe('Characteristic Matchers', () => {
  let service: MockService;
  let characteristic: MockCharacteristic;

  beforeEach(() => {
    service = new MockService('Thermostat', 'Thermostat');
    characteristic = new MockCharacteristic('CurrentTemperature', 'CurrentTemperature', 22, {
      format: 'float',
      perms: ['pr', 'ev'],
      minValue: -50,
      maxValue: 100,
    });
    service.addCharacteristic(characteristic);
  });

  describe('toHaveCharacteristic', () => {
    it('should pass when characteristic exists', () => {
      const result = toHaveCharacteristic(service, 'CurrentTemperature');
      expect(result.pass).toBe(true);
    });

    it('should fail when characteristic does not exist', () => {
      const result = toHaveCharacteristic(service, 'TargetTemperature');
      expect(result.pass).toBe(false);
      expect(result.message()).toContain('Expected service "Thermostat" to have characteristic "TargetTemperature"');
    });
  });

  describe('toHaveValue', () => {
    it('should pass when value matches', () => {
      const result = toHaveValue(characteristic, 22);
      expect(result.pass).toBe(true);
    });

    it('should fail when value does not match', () => {
      const result = toHaveValue(characteristic, 25);
      expect(result.pass).toBe(false);
      expect(result.message()).toContain('Expected characteristic "CurrentTemperature" to have value 25, but got 22');
    });
  });

  describe('toBeInRange', () => {
    it('should pass when value is within range', () => {
      const result = toBeInRange(characteristic, 20, 25);
      expect(result.pass).toBe(true);
    });

    it('should fail when value is below range', () => {
      const result = toBeInRange(characteristic, 25, 30);
      expect(result.pass).toBe(false);
      expect(result.message()).toContain('Expected characteristic "CurrentTemperature" value 22 to be in range [25, 30]');
    });

    it('should fail when value is above range', () => {
      const result = toBeInRange(characteristic, 10, 20);
      expect(result.pass).toBe(false);
    });

    it('should fail when value is not numeric', () => {
      const boolChar = new MockCharacteristic('On', 'On', false, {
        format: 'bool',
        perms: ['pr', 'pw'],
      });
      const result = toBeInRange(boolChar, 0, 1);
      expect(result.pass).toBe(false);
      expect(result.message()).toContain('Expected characteristic "On" to have a numeric value');
    });
  });

  describe('toHaveFormat', () => {
    it('should pass when format matches', () => {
      const result = toHaveFormat(characteristic, 'float');
      expect(result.pass).toBe(true);
    });

    it('should fail when format does not match', () => {
      const result = toHaveFormat(characteristic, 'int');
      expect(result.pass).toBe(false);
      expect(result.message()).toContain('Expected characteristic "CurrentTemperature" to have format "int", but got "float"');
    });
  });
});
