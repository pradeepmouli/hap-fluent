import { Characteristic, type CharacteristicValue, type CharacteristicSetHandler, type PrimitiveTypes, type CharacteristicProps, type PartialAllowingNull } from 'homebridge';
import { FluentCharacteristicError } from './errors.js';
import { isCharacteristicValue } from './type-guards.js';
import { getLogger } from './logger.js';

/**
 * FluentCharacteristic wraps a HAP characteristic with strong typing and fluent API
 */
export class FluentCharacteristic<T extends CharacteristicValue> {
	/**
	 * @param characteristic - HAP characteristic to wrap.
	 */
	constructor(private characteristic: Characteristic) {}

	/**
	 * Update the characteristic's metadata properties.
	 *
	 * @param props - Partial characteristic properties to apply.
	 * @returns This FluentCharacteristic instance for chaining.
	 */
	setProps(props: PartialAllowingNull<CharacteristicProps>): this {
		this.characteristic.setProps(props);
		return this;
	}

	/**
	 * Get the current characteristic value.
	 *
	 * @returns The current characteristic value, or undefined if not set.
	 */
	get(): T | undefined {
		const logger = getLogger();
		const value = this.characteristic.value as T | undefined;
		logger.debug(
			{ characteristic: this.characteristic.displayName, value },
			'Retrieved characteristic value',
		);
		return value;
	}

	/**
	 * Set the characteristic value.
	 *
	 * @param value - New value to set.
	 * @returns This FluentCharacteristic instance for chaining.
	 * @throws {FluentCharacteristicError} If value is invalid or setValue fails
	 */
	set(value: T): this {
		const logger = getLogger();
		logger.debug(
			{ characteristic: this.characteristic.displayName, value },
			'Setting characteristic value',
		);
		try {
			if (!isCharacteristicValue(value)) {
				logger.warn(
					{ characteristic: this.characteristic.displayName, value },
					'Invalid characteristic value',
				);
				throw new FluentCharacteristicError('Invalid characteristic value', {
					characteristic: this.characteristic.displayName,
					value,
				});
			}
			this.characteristic.setValue(value);
			logger.debug(
				{ characteristic: this.characteristic.displayName, value },
				'Successfully set characteristic value',
			);
			return this;
		} catch (error) {
			if (error instanceof FluentCharacteristicError) {
				throw error;
			}
			logger.error(
				{ characteristic: this.characteristic.displayName, value, error },
				'Failed to set characteristic value',
			);
			throw new FluentCharacteristicError('Failed to set characteristic value', {
				characteristic: this.characteristic.displayName,
				value,
				originalError: error,
			});
		}
	}

	/**
	 * Update the characteristic value without calling SET handlers.
	 *
	 * @param value - New value to apply.
	 * @returns This FluentCharacteristic instance for chaining.
	 * @throws {FluentCharacteristicError} If value is invalid or updateValue fails
	 */
	update(value: T): this {
		const logger = getLogger();
		logger.debug(
			{ characteristic: this.characteristic.displayName, value },
			'Updating characteristic value',
		);
		try {
			if (!isCharacteristicValue(value)) {
				logger.warn(
					{ characteristic: this.characteristic.displayName, value },
					'Invalid characteristic value',
				);
				throw new FluentCharacteristicError('Invalid characteristic value', {
					characteristic: this.characteristic.displayName,
					value,
				});
			}
			this.characteristic.updateValue(value);
			logger.debug(
				{ characteristic: this.characteristic.displayName, value },
				'Successfully updated characteristic value',
			);
			return this;
		} catch (error) {
			if (error instanceof FluentCharacteristicError) {
				throw error;
			}
			logger.error(
				{ characteristic: this.characteristic.displayName, value, error },
				'Failed to update characteristic value',
			);
			throw new FluentCharacteristicError('Failed to update characteristic value', {
				characteristic: this.characteristic.displayName,
				value,
				originalError: error,
			});
		}
	}

	/**
	 * Register an async getter for the characteristic.
	 *
	 * @param handler - Async getter returning the current value.
	 * @returns This FluentCharacteristic instance for chaining.
	 */
	onGet(handler: () => Promise<T>): this {
		this.characteristic.onGet(handler);
		return this;
	}

	/**
	 * Register an async setter for the characteristic.
	 *
	 * @param handler - Async setter receiving the new value.
	 * @returns This FluentCharacteristic instance for chaining.
	 */
	onSet(handler: (value: T) => Promise<void>): this {
		this.characteristic.onSet(handler as unknown as CharacteristicSetHandler);
		return this;
	}
}
