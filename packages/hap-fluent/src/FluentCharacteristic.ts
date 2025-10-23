import { Characteristic, type CharacteristicValue, type CharacteristicSetHandler, type PrimitiveTypes, type CharacteristicProps, type PartialAllowingNull } from 'homebridge';

/**
 * FluentCharacteristic wraps a HAP characteristic with strong typing and fluent API
 */
export class FluentCharacteristic<T extends CharacteristicValue> {
	constructor(private characteristic: Characteristic) {}

	setProps(props: PartialAllowingNull<CharacteristicProps>): this {
		this.characteristic.setProps(props);
		return this;
	}

	get(): T | undefined {
		return this.characteristic.value as T | undefined;
	}

	set(value: T): this {
		this.characteristic.setValue(value);
		return this;
	}

	update(value: T): this {
		this.characteristic.setValue(value);
		return this;
	}

	onGet(handler: () => Promise<T>): this {
		this.characteristic.onGet(handler);
		return this;
	}

	onSet(handler: (value: T) => Promise<void>): this {
		this.characteristic.onSet(handler as unknown as CharacteristicSetHandler);
		return this;
	}
}
