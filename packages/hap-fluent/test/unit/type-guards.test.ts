import { describe, it, expect } from 'vitest';
import {
	isCharacteristicValue,
	isService,
	isCharacteristic,
	isString,
	isNumber,
	isBoolean,
} from '../../src/type-guards.js';

describe('Type Guards', () => {
	describe('isCharacteristicValue', () => {
		it('should return true for valid values', () => {
			expect(isCharacteristicValue('string')).toBe(true);
			expect(isCharacteristicValue(42)).toBe(true);
			expect(isCharacteristicValue(0)).toBe(true);
			expect(isCharacteristicValue(true)).toBe(true);
			expect(isCharacteristicValue(false)).toBe(true);
			expect(isCharacteristicValue({ key: 'value' })).toBe(true);
			expect(isCharacteristicValue([])).toBe(true);
		});

		it('should return false for null and undefined', () => {
			expect(isCharacteristicValue(null)).toBe(false);
			expect(isCharacteristicValue(undefined)).toBe(false);
		});

		it('should return true for valid object types', () => {
			expect(isCharacteristicValue({})).toBe(true);
			expect(isCharacteristicValue({ nested: { value: 1 } })).toBe(true);
		});
	});

	describe('isService', () => {
		it('should return true for valid Service objects', () => {
			const mockService = {
				UUID: '00000043-0000-1000-8000-0026BB765291',
				displayName: 'Lightbulb',
				getCharacteristic: () => {},
				addCharacteristic: () => {},
			};
			expect(isService(mockService)).toBe(true);
		});

		it('should return false for invalid objects', () => {
			expect(isService(null)).toBe(false);
			expect(isService(undefined)).toBe(false);
			expect(isService({})).toBe(false);
			expect(isService({ UUID: '123' })).toBe(false);
			expect(isService({ displayName: 'Test' })).toBe(false);
			expect(isService('string')).toBe(false);
			expect(isService(42)).toBe(false);
		});

		it('should require all required methods', () => {
			const incomplete = {
				UUID: '00000043-0000-1000-8000-0026BB765291',
				displayName: 'Test',
				getCharacteristic: () => {},
				// missing addCharacteristic
			};
			expect(isService(incomplete)).toBe(false);
		});
	});

	describe('isCharacteristic', () => {
		it('should return true for valid Characteristic objects', () => {
			const mockCharacteristic = {
				UUID: '00000025-0000-1000-8000-0026BB765291',
				displayName: 'On',
				updateValue: () => {},
				value: true,
			};
			expect(isCharacteristic(mockCharacteristic)).toBe(true);
		});

		it('should return false for invalid objects', () => {
			expect(isCharacteristic(null)).toBe(false);
			expect(isCharacteristic(undefined)).toBe(false);
			expect(isCharacteristic({})).toBe(false);
			expect(isCharacteristic({ UUID: '123' })).toBe(false);
			expect(isCharacteristic('string')).toBe(false);
		});

		it('should require all required methods', () => {
			const incomplete = {
				UUID: '00000025-0000-1000-8000-0026BB765291',
				displayName: 'On',
				updateValue: () => {},
				// missing getValue
			};
			expect(isCharacteristic(incomplete)).toBe(false);
		});
	});

	describe('isString', () => {
		it('should return true for strings', () => {
			expect(isString('')).toBe(true);
			expect(isString('test')).toBe(true);
			expect(isString('123')).toBe(true);
		});

		it('should return false for non-strings', () => {
			expect(isString(123)).toBe(false);
			expect(isString(true)).toBe(false);
			expect(isString(null)).toBe(false);
			expect(isString(undefined)).toBe(false);
			expect(isString({})).toBe(false);
			expect(isString([])).toBe(false);
		});
	});

	describe('isNumber', () => {
		it('should return true for valid numbers', () => {
			expect(isNumber(0)).toBe(true);
			expect(isNumber(42)).toBe(true);
			expect(isNumber(-10)).toBe(true);
			expect(isNumber(3.14)).toBe(true);
			expect(isNumber(Number.MAX_SAFE_INTEGER)).toBe(true);
		});

		it('should return false for NaN', () => {
			expect(isNumber(NaN)).toBe(false);
			expect(isNumber(Number.NaN)).toBe(false);
		});

		it('should return false for non-numbers', () => {
			expect(isNumber('123')).toBe(false);
			expect(isNumber(true)).toBe(false);
			expect(isNumber(null)).toBe(false);
			expect(isNumber(undefined)).toBe(false);
			expect(isNumber({})).toBe(false);
		});
	});

	describe('isBoolean', () => {
		it('should return true for booleans', () => {
			expect(isBoolean(true)).toBe(true);
			expect(isBoolean(false)).toBe(true);
		});

		it('should return false for non-booleans', () => {
			expect(isBoolean(1)).toBe(false);
			expect(isBoolean(0)).toBe(false);
			expect(isBoolean('true')).toBe(false);
			expect(isBoolean('false')).toBe(false);
			expect(isBoolean(null)).toBe(false);
			expect(isBoolean(undefined)).toBe(false);
			expect(isBoolean({})).toBe(false);
		});
	});

	describe('Type narrowing', () => {
		it('should narrow types correctly', () => {
			const value: unknown = 'test';
			if (isString(value)) {
				// TypeScript should know value is string here
				const upperCase: string = value.toUpperCase();
				expect(upperCase).toBe('TEST');
			}
		});

		it('should work with type guards in filter', () => {
			const mixed: unknown[] = ['test', 123, true, null, undefined, {}];
			const strings = mixed.filter(isString);
			expect(strings).toEqual(['test']);
			expect(strings.every((s) => typeof s === 'string')).toBe(true);
		});
	});
});
