/**
 * Validation framework for HAP characteristic values
 * 
 * @deprecated This validation framework is deprecated. HAP-nodejs and Homebridge handle validation
 * automatically based on characteristic metadata (minValue, maxValue, validValues, etc.).
 * 
 * It is recommended to use HAP's built-in validation by setting proper characteristic properties
 * with `FluentCharacteristic.setProps()` instead of custom validators.
 * 
 * This module will be removed in a future major version.
 * 
 * @example
 * ```typescript
 * // Deprecated approach:
 * import { RangeValidator } from 'hap-fluent/validation';
 * characteristic.addValidator(new RangeValidator(0, 100, 'Brightness'));
 * 
 * // Recommended approach:
 * characteristic.setProps({ minValue: 0, maxValue: 100 });
 * ```
 * 
 * @module validation
 */

import type { CharacteristicValue } from 'homebridge';

/**
 * Result of a validation operation
 */
export interface ValidationResult {
	/** Whether the value passed validation */
	valid: boolean;
	/** Error message if validation failed */
	error?: string;
	/** The validated value (may be transformed) */
	value?: CharacteristicValue;
}

/**
 * Base validator interface
 * 
 * All validators must implement this interface to be used with FluentCharacteristic.
 * Validators are composable and can be chained together.
 * 
 * @example
 * ```typescript
 * const validator: Validator = {
 *   validate: (value) => {
 *     if (typeof value === 'number' && value >= 0 && value <= 100) {
 *       return { valid: true, value };
 *     }
 *     return { valid: false, error: 'Value must be between 0 and 100' };
 *   }
 * };
 * ```
 */
export interface Validator {
	/**
	 * Validate a characteristic value
	 * 
	 * @param value - The value to validate
	 * @returns Validation result with valid flag and optional error message
	 */
	validate(value: CharacteristicValue): ValidationResult;
}

/**
 * Validates that a numeric value is within a specified range
 * 
 * @example
 * ```typescript
 * const brightnessValidator = new RangeValidator(0, 100, 'Brightness');
 * const result = brightnessValidator.validate(75); // { valid: true, value: 75 }
 * const invalid = brightnessValidator.validate(150); // { valid: false, error: '...' }
 * ```
 */
export class RangeValidator implements Validator {
	/**
	 * Create a range validator
	 * 
	 * @param min - Minimum allowed value (inclusive)
	 * @param max - Maximum allowed value (inclusive)
	 * @param name - Name of the value being validated (for error messages)
	 */
	constructor(
		private readonly min: number,
		private readonly max: number,
		private readonly name: string = 'Value'
	) {}

	validate(value: CharacteristicValue): ValidationResult {
		if (typeof value !== 'number') {
			return {
				valid: false,
				error: `${this.name} must be a number, got ${typeof value}`,
			};
		}

		if (value < this.min || value > this.max) {
			return {
				valid: false,
				error: `${this.name} must be between ${this.min} and ${this.max}, got ${value}`,
			};
		}

		return { valid: true, value };
	}
}

/**
 * Validates that a value matches one of a predefined set of allowed values
 * 
 * @example
 * ```typescript
 * const stateValidator = new EnumValidator(
 *   [0, 1, 2, 3],
 *   'HeatingCoolingState',
 *   { 0: 'OFF', 1: 'HEAT', 2: 'COOL', 3: 'AUTO' }
 * );
 * const result = stateValidator.validate(1); // { valid: true, value: 1 }
 * const invalid = stateValidator.validate(5); // { valid: false, error: '...' }
 * ```
 */
export class EnumValidator implements Validator {
	/**
	 * Create an enum validator
	 * 
	 * @param allowedValues - Array of allowed values
	 * @param name - Name of the value being validated (for error messages)
	 * @param labels - Optional labels for each value (for better error messages)
	 */
	constructor(
		private readonly allowedValues: CharacteristicValue[],
		private readonly name: string = 'Value',
		private readonly labels?: Record<string | number, string>
	) {}

	validate(value: CharacteristicValue): ValidationResult {
		const isValid = this.allowedValues.some((allowed) => allowed === value);

		if (!isValid) {
			let errorMsg = `${this.name} must be one of: ${this.allowedValues.join(', ')}`;
			
			if (this.labels) {
				const labeledValues = this.allowedValues.map(
					(v) => `${v} (${this.labels![String(v)]})`
				);
				errorMsg = `${this.name} must be one of: ${labeledValues.join(', ')}`;
			}
			
			errorMsg += `, got ${value}`;
			
			return { valid: false, error: errorMsg };
		}

		return { valid: true, value };
	}
}

/**
 * Combines multiple validators, requiring all to pass
 * 
 * Validators are evaluated in order, and validation stops at the first failure.
 * 
 * @example
 * ```typescript
 * const validator = new CompositeValidator([
 *   new RangeValidator(0, 100, 'Brightness'),
 *   new CustomValidator((v) => v % 5 === 0, 'Brightness must be multiple of 5')
 * ]);
 * ```
 */
export class CompositeValidator implements Validator {
	/**
	 * Create a composite validator
	 * 
	 * @param validators - Array of validators to apply in order
	 */
	constructor(private readonly validators: Validator[]) {}

	validate(value: CharacteristicValue): ValidationResult {
		for (const validator of this.validators) {
			const result = validator.validate(value);
			if (!result.valid) {
				return result;
			}
			// Use the potentially transformed value from previous validator
			if (result.value !== undefined) {
				value = result.value;
			}
		}

		return { valid: true, value };
	}
}

/**
 * Creates a custom validator from a predicate function
 * 
 * @example
 * ```typescript
 * const evenValidator = createCustomValidator(
 *   (value) => typeof value === 'number' && value % 2 === 0,
 *   'Value must be an even number'
 * );
 * ```
 * 
 * @param predicate - Function that returns true if value is valid
 * @param errorMessage - Error message to return if validation fails
 * @returns A Validator instance
 */
export function createCustomValidator(
	predicate: (value: CharacteristicValue) => boolean,
	errorMessage: string
): Validator {
	return {
		validate(value: CharacteristicValue): ValidationResult {
			if (predicate(value)) {
				return { valid: true, value };
			}
			return { valid: false, error: errorMessage };
		},
	};
}

/**
 * Creates a validator that transforms the value if validation passes
 * 
 * @example
 * ```typescript
 * const clamping = createTransformingValidator(
 *   (value) => typeof value === 'number',
 *   (value) => Math.max(0, Math.min(100, value as number)),
 *   'Value must be a number'
 * );
 * ```
 * 
 * @param predicate - Function that returns true if value can be transformed
 * @param transform - Function that transforms the value
 * @param errorMessage - Error message if predicate fails
 * @returns A Validator instance
 */
export function createTransformingValidator(
	predicate: (value: CharacteristicValue) => boolean,
	transform: (value: CharacteristicValue) => CharacteristicValue,
	errorMessage: string
): Validator {
	return {
		validate(value: CharacteristicValue): ValidationResult {
			if (!predicate(value)) {
				return { valid: false, error: errorMessage };
			}
			return { valid: true, value: transform(value) };
		},
	};
}
