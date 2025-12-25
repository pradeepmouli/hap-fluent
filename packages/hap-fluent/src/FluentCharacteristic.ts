import { Characteristic, type CharacteristicValue, type CharacteristicSetHandler, type PrimitiveTypes, type CharacteristicProps, type PartialAllowingNull } from 'homebridge';

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
		return this.characteristic.value as T | undefined;
	}

	/**
	 * Set the characteristic value.
	 *
	 * @param value - New value to set.
	 * @returns This FluentCharacteristic instance for chaining.
	 */
	set(value: T): this {
		this.characteristic.setValue(value);
		return this;
	}

	/**
	 * Update the characteristic value without calling SET handlers.
	 *
	 * @param value - New value to apply.
	 * @returns This FluentCharacteristic instance for chaining.
	 */
	update(value: T): this {
		this.characteristic.updateValue(value);
		return this;
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
