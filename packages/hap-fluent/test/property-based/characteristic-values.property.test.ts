/**
 * Property-based tests for characteristic value handling
 * 
 * Uses fast-check to generate random inputs and verify properties hold
 * across a wide range of values.
 */

import { describe, it, expect } from 'vitest';
import { fc, test } from '@fast-check/vitest';
import { FluentCharacteristic } from '../../src/FluentCharacteristic.js';
import { MockCharacteristic } from '../mocks/homebridge.mock.js';

describe('FluentCharacteristic Property-Based Tests', () => {
	describe('Boolean characteristic values', () => {
		test.prop([fc.boolean()])('should handle any boolean value', async (value) => {
			const mockChar = new MockCharacteristic('On', 'on-uuid');
			const fluent = new FluentCharacteristic(mockChar as any);

			await fluent.set(value);
			const result = await fluent.get();

			expect(result).toBe(value);
		});

		test.prop([fc.array(fc.boolean(), { minLength: 1, maxLength: 100 })])(
			'should handle rapid boolean value changes',
			async (values) => {
				const mockChar = new MockCharacteristic('On', 'on-uuid');
				const fluent = new FluentCharacteristic(mockChar as any);

				for (const value of values) {
					await fluent.set(value);
				}

				const lastValue = values[values.length - 1];
				const result = await fluent.get();
				expect(result).toBe(lastValue);
			}
		);
	});

	describe('Numeric characteristic values', () => {
		test.prop([fc.integer({ min: 0, max: 100 })])(
			'should handle brightness values (0-100)',
			async (value) => {
				const mockChar = new MockCharacteristic('Brightness', 'brightness-uuid');
				const fluent = new FluentCharacteristic(mockChar as any);

				await fluent.set(value);
				const result = await fluent.get();

				expect(result).toBe(value);
				expect(result).toBeGreaterThanOrEqual(0);
				expect(result).toBeLessThanOrEqual(100);
			}
		);

		test.prop([fc.integer({ min: 0, max: 360 })])(
			'should handle hue values (0-360)',
			async (value) => {
				const mockChar = new MockCharacteristic('Hue', 'hue-uuid');
				const fluent = new FluentCharacteristic(mockChar as any);

				await fluent.set(value);
				const result = await fluent.get();

				expect(result).toBe(value);
				expect(result).toBeGreaterThanOrEqual(0);
				expect(result).toBeLessThanOrEqual(360);
			}
		);

		test.prop([fc.float({ min: 0, max: 100, noNaN: true })])(
			'should handle saturation values (0-100 float)',
			async (value) => {
				const mockChar = new MockCharacteristic('Saturation', 'saturation-uuid');
				const fluent = new FluentCharacteristic(mockChar as any);

				await fluent.set(value);
				const result = await fluent.get();

				expect(result).toBeCloseTo(value, 2);
				expect(result).toBeGreaterThanOrEqual(0);
				expect(result).toBeLessThanOrEqual(100);
			}
		);

		test.prop([fc.float({ min: -50, max: 50, noNaN: true })])(
			'should handle temperature values',
			async (value) => {
				const mockChar = new MockCharacteristic('CurrentTemperature', 'temp-uuid');
				const fluent = new FluentCharacteristic(mockChar as any);

				await fluent.set(value);
				const result = await fluent.get();

				expect(result).toBeCloseTo(value, 2);
			}
		);

		test.prop([fc.integer({ min: 140, max: 500 })])(
			'should handle color temperature in mireds (140-500)',
			async (value) => {
				const mockChar = new MockCharacteristic('ColorTemperature', 'color-temp-uuid');
				const fluent = new FluentCharacteristic(mockChar as any);

				await fluent.set(value);
				const result = await fluent.get();

				expect(result).toBe(value);
				expect(result).toBeGreaterThanOrEqual(140);
				expect(result).toBeLessThanOrEqual(500);
			}
		);
	});

	describe('String characteristic values', () => {
		test.prop([fc.string({ minLength: 1, maxLength: 64 })])(
			'should handle string values',
			async (value) => {
				const mockChar = new MockCharacteristic('Name', 'name-uuid');
				const fluent = new FluentCharacteristic(mockChar as any);

				await fluent.set(value);
				const result = await fluent.get();

				expect(result).toBe(value);
			}
		);

		test.prop([fc.string({ minLength: 1, maxLength: 64 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s))])(
			'should handle alphanumeric string values',
			async (value) => {
				const mockChar = new MockCharacteristic('SerialNumber', 'serial-uuid');
				const fluent = new FluentCharacteristic(mockChar as any);

				await fluent.set(value);
				const result = await fluent.get();

				expect(result).toBe(value);
			}
		);
	});

	describe('Enum characteristic values', () => {
		test.prop([fc.integer({ min: 0, max: 3 })])(
			'should handle heating/cooling state enum (0-3)',
			async (value) => {
				const mockChar = new MockCharacteristic(
					'TargetHeatingCoolingState',
					'target-state-uuid'
				);
				const fluent = new FluentCharacteristic(mockChar as any);

				await fluent.set(value);
				const result = await fluent.get();

				expect(result).toBe(value);
				expect([0, 1, 2, 3]).toContain(result);
			}
		);

		test.prop([fc.integer({ min: 0, max: 4 })])(
			'should handle door state enum (0-4)',
			async (value) => {
				const mockChar = new MockCharacteristic('CurrentDoorState', 'door-state-uuid');
				const fluent = new FluentCharacteristic(mockChar as any);

				await fluent.set(value);
				const result = await fluent.get();

				expect(result).toBe(value);
				expect([0, 1, 2, 3, 4]).toContain(result);
			}
		);
	});

	describe('Value update method', () => {
		test.prop([fc.integer({ min: 0, max: 100 })])(
			'should update value without triggering SET handler',
			async (value) => {
				const mockChar = new MockCharacteristic('Brightness', 'brightness-uuid');
				let setHandlerCalled = false;
				mockChar.setHandler = () => {
					setHandlerCalled = true;
				};

				const fluent = new FluentCharacteristic(mockChar as any);
				fluent.update(value);

				const result = await fluent.get();
				expect(result).toBe(value);
				expect(setHandlerCalled).toBe(false);
			}
		);
	});

	describe('Characteristic properties', () => {
		test.prop([
			fc.record({
				brightness: fc.integer({ min: 0, max: 100 }),
				hue: fc.integer({ min: 0, max: 360 }),
				saturation: fc.integer({ min: 0, max: 100 }),
			}),
		])('should handle multiple related characteristics', async (values) => {
			const brightnessChar = new MockCharacteristic('Brightness', 'brightness-uuid');
			const hueChar = new MockCharacteristic('Hue', 'hue-uuid');
			const saturationChar = new MockCharacteristic('Saturation', 'saturation-uuid');

			const fluentBrightness = new FluentCharacteristic(brightnessChar as any);
			const fluentHue = new FluentCharacteristic(hueChar as any);
			const fluentSaturation = new FluentCharacteristic(saturationChar as any);

			await fluentBrightness.set(values.brightness);
			await fluentHue.set(values.hue);
			await fluentSaturation.set(values.saturation);

			expect(await fluentBrightness.get()).toBe(values.brightness);
			expect(await fluentHue.get()).toBe(values.hue);
			expect(await fluentSaturation.get()).toBe(values.saturation);
		});
	});
});
