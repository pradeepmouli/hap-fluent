import { describe, it, expect } from 'vitest';
import {
	RangeValidator,
	EnumValidator,
	CompositeValidator,
	createCustomValidator,
	createTransformingValidator,
} from '../../src/validation.js';

describe('Validation Framework', () => {
	describe('RangeValidator', () => {
		it('should validate values within range', () => {
			const validator = new RangeValidator(0, 100, 'Brightness');
			
			expect(validator.validate(0)).toEqual({ valid: true, value: 0 });
			expect(validator.validate(50)).toEqual({ valid: true, value: 50 });
			expect(validator.validate(100)).toEqual({ valid: true, value: 100 });
		});

		it('should reject values below minimum', () => {
			const validator = new RangeValidator(0, 100, 'Brightness');
			const result = validator.validate(-1);
			
			expect(result.valid).toBe(false);
			expect(result.error).toContain('must be between 0 and 100');
			expect(result.error).toContain('-1');
		});

		it('should reject values above maximum', () => {
			const validator = new RangeValidator(0, 100, 'Brightness');
			const result = validator.validate(101);
			
			expect(result.valid).toBe(false);
			expect(result.error).toContain('must be between 0 and 100');
			expect(result.error).toContain('101');
		});

		it('should reject non-numeric values', () => {
			const validator = new RangeValidator(0, 100, 'Brightness');
			const result = validator.validate('50');
			
			expect(result.valid).toBe(false);
			expect(result.error).toContain('must be a number');
		});

		it('should include name in error messages', () => {
			const validator = new RangeValidator(-50, 50, 'Temperature');
			const result = validator.validate(60);
			
			expect(result.error).toContain('Temperature');
		});
	});

	describe('EnumValidator', () => {
		it('should validate allowed values', () => {
			const validator = new EnumValidator([0, 1, 2, 3], 'State');
			
			expect(validator.validate(0)).toEqual({ valid: true, value: 0 });
			expect(validator.validate(1)).toEqual({ valid: true, value: 1 });
			expect(validator.validate(3)).toEqual({ valid: true, value: 3 });
		});

		it('should reject disallowed values', () => {
			const validator = new EnumValidator([0, 1, 2], 'State');
			const result = validator.validate(5);
			
			expect(result.valid).toBe(false);
			expect(result.error).toContain('must be one of');
			expect(result.error).toContain('0, 1, 2');
			expect(result.error).toContain('5');
		});

		it('should work with string values', () => {
			const validator = new EnumValidator(['on', 'off', 'auto'], 'Mode');
			
			expect(validator.validate('on')).toEqual({ valid: true, value: 'on' });
			expect(validator.validate('off')).toEqual({ valid: true, value: 'off' });
			
			const result = validator.validate('invalid');
			expect(result.valid).toBe(false);
		});

		it('should include labels in error messages', () => {
			const validator = new EnumValidator(
				[0, 1, 2, 3],
				'HeatingCoolingState',
				{ 0: 'OFF', 1: 'HEAT', 2: 'COOL', 3: 'AUTO' }
			);
			const result = validator.validate(5);
			
			expect(result.error).toContain('OFF');
			expect(result.error).toContain('HEAT');
			expect(result.error).toContain('COOL');
			expect(result.error).toContain('AUTO');
		});

		it('should work with boolean values', () => {
			const validator = new EnumValidator([true, false], 'Switch');
			
			expect(validator.validate(true)).toEqual({ valid: true, value: true });
			expect(validator.validate(false)).toEqual({ valid: true, value: false });
		});
	});

	describe('CompositeValidator', () => {
		it('should pass when all validators pass', () => {
			const validator = new CompositeValidator([
				new RangeValidator(0, 100, 'Value'),
				createCustomValidator(
					(v) => typeof v === 'number' && v % 5 === 0,
					'Value must be multiple of 5'
				),
			]);
			
			expect(validator.validate(0)).toEqual({ valid: true, value: 0 });
			expect(validator.validate(50)).toEqual({ valid: true, value: 50 });
			expect(validator.validate(100)).toEqual({ valid: true, value: 100 });
		});

		it('should fail when first validator fails', () => {
			const validator = new CompositeValidator([
				new RangeValidator(0, 100, 'Value'),
				createCustomValidator(
					(v) => typeof v === 'number' && v % 5 === 0,
					'Value must be multiple of 5'
				),
			]);
			
			const result = validator.validate(150);
			expect(result.valid).toBe(false);
			expect(result.error).toContain('must be between 0 and 100');
		});

		it('should fail when second validator fails', () => {
			const validator = new CompositeValidator([
				new RangeValidator(0, 100, 'Value'),
				createCustomValidator(
					(v) => typeof v === 'number' && v % 5 === 0,
					'Value must be multiple of 5'
				),
			]);
			
			const result = validator.validate(51);
			expect(result.valid).toBe(false);
			expect(result.error).toContain('must be multiple of 5');
		});

		it('should stop at first failure', () => {
			let secondValidatorCalled = false;
			
			const validator = new CompositeValidator([
				createCustomValidator(() => false, 'First fails'),
				createCustomValidator(() => {
					secondValidatorCalled = true;
					return true;
				}, 'Second never called'),
			]);
			
			validator.validate(10);
			expect(secondValidatorCalled).toBe(false);
		});

		it('should chain transformed values', () => {
			const validator = new CompositeValidator([
				createTransformingValidator(
					(v) => typeof v === 'number',
					(v) => (v as number) * 2,
					'Must be number'
				),
				createCustomValidator(
					(v) => typeof v === 'number' && v === 100,
					'Value must be 100 after doubling'
				),
			]);
			
			const result = validator.validate(50);
			expect(result.valid).toBe(true);
			expect(result.value).toBe(100);
		});
	});

	describe('createCustomValidator', () => {
		it('should validate using custom predicate', () => {
			const validator = createCustomValidator(
				(v) => typeof v === 'number' && v % 2 === 0,
				'Value must be even'
			);
			
			expect(validator.validate(2)).toEqual({ valid: true, value: 2 });
			expect(validator.validate(4)).toEqual({ valid: true, value: 4 });
			
			const result = validator.validate(3);
			expect(result.valid).toBe(false);
			expect(result.error).toBe('Value must be even');
		});

		it('should work with string predicates', () => {
			const validator = createCustomValidator(
				(v) => typeof v === 'string' && v.length <= 10,
				'String must be 10 characters or less'
			);
			
			expect(validator.validate('short')).toEqual({ valid: true, value: 'short' });
			
			const result = validator.validate('this is too long');
			expect(result.valid).toBe(false);
		});
	});

	describe('createTransformingValidator', () => {
		it('should transform valid values', () => {
			const validator = createTransformingValidator(
				(v) => typeof v === 'number',
				(v) => Math.max(0, Math.min(100, v as number)),
				'Value must be a number'
			);
			
			expect(validator.validate(50)).toEqual({ valid: true, value: 50 });
			expect(validator.validate(-10)).toEqual({ valid: true, value: 0 });
			expect(validator.validate(150)).toEqual({ valid: true, value: 100 });
		});

		it('should fail on invalid values', () => {
			const validator = createTransformingValidator(
				(v) => typeof v === 'number',
				(v) => (v as number) * 2,
				'Value must be a number'
			);
			
			const result = validator.validate('not a number');
			expect(result.valid).toBe(false);
			expect(result.error).toBe('Value must be a number');
		});

		it('should support string transformations', () => {
			const validator = createTransformingValidator(
				(v) => typeof v === 'string',
				(v) => (v as string).toUpperCase(),
				'Value must be a string'
			);
			
			expect(validator.validate('hello')).toEqual({ valid: true, value: 'HELLO' });
		});
	});

	describe('Real-world validation scenarios', () => {
		it('should validate brightness with range', () => {
			const validator = new RangeValidator(0, 100, 'Brightness');
			
			expect(validator.validate(0).valid).toBe(true);
			expect(validator.validate(50).valid).toBe(true);
			expect(validator.validate(100).valid).toBe(true);
			expect(validator.validate(-1).valid).toBe(false);
			expect(validator.validate(101).valid).toBe(false);
		});

		it('should validate heating/cooling state with enum', () => {
			const validator = new EnumValidator(
				[0, 1, 2, 3],
				'TargetHeatingCoolingState',
				{ 0: 'OFF', 1: 'HEAT', 2: 'COOL', 3: 'AUTO' }
			);
			
			for (let i = 0; i <= 3; i++) {
				expect(validator.validate(i).valid).toBe(true);
			}
			expect(validator.validate(4).valid).toBe(false);
		});

		it('should validate temperature with clamping', () => {
			const validator = new CompositeValidator([
				createTransformingValidator(
					(v) => typeof v === 'number',
					(v) => Math.max(10, Math.min(35, v as number)),
					'Temperature must be a number'
				),
				new RangeValidator(10, 35, 'Temperature'),
			]);
			
			expect(validator.validate(5).value).toBe(10); // Clamped to min
			expect(validator.validate(22).value).toBe(22); // Within range
			expect(validator.validate(40).value).toBe(35); // Clamped to max
		});

		it('should validate color temperature in mireds', () => {
			const validator = new RangeValidator(140, 500, 'ColorTemperature');
			
			expect(validator.validate(140).valid).toBe(true);
			expect(validator.validate(300).valid).toBe(true);
			expect(validator.validate(500).valid).toBe(true);
			expect(validator.validate(100).valid).toBe(false);
			expect(validator.validate(600).valid).toBe(false);
		});
	});
});
