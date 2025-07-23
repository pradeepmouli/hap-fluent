// Auto-generated HAP Fluent API wrapper
// This file will be extended to use generated interfaces from hap-codegen

import * as Interfaces from './types/hap-interfaces.js';
import { CharacteristicEventTypes, Service, Characteristic } from 'homebridge';
import type { InterfaceForService } from './types/index.js';
import { CamelCase, PascalCase } from 'type-fest';

export type ServiceMap<T extends typeof Service> = InterfaceForService<T> & {
	characteristics: {
		[K in keyof InterfaceForService<T> as PascalCase<K> &
		//@ts-ignore
		keyof typeof Characteristic]: InstanceType<(typeof Characteristic)[PascalCase<K>]
		>;
	};
	onGet<K extends keyof InterfaceForService<T>>(
		key: K,
		callback: (value: InterfaceForService<T>[K]) => void
	): void;
	onSet<K extends keyof InterfaceForService<T>>(
		key: K,
		callback: (value: InterfaceForService<T>[K]) => void
	): void;
	update<K extends keyof InterfaceForService<T>>(
		key: K,
		value: InterfaceForService<T>[K]
	): void;
};

export type test = InterfaceForService<typeof Service.AirPurifier>; // Should resolve to AirPurifier interface

/**
 * Generic type for a map of characteristics and their values
 */
export type CharacteristicMap<T extends Record<string, any>> = {
	[K in keyof T]: T[K];
};

/**
 * FluentCharacteristic wraps a HAP characteristic with strong typing and fluent API
 */
export class FluentCharacteristic<T> {
	constructor (private value: T) {}

	get(): T {
		return this.value;
	}

	set(value: T): this {
		this.value = value;
		return this;
	}
}

/**
 * FluentService wraps a HAP service with strong typing and fluent API
 */

export function createFluentService<T extends typeof Service>(
	service: InstanceType<T>
): ServiceMap<T> {
	let e = {
		characteristics: Object.fromEntries(
			service.characteristics.map((p) => [camelcase(p.displayName), p])
		) as { [R in keyof ServiceMap<T>]: InstanceType<typeof Characteristic> }
	};

	return {
		...e,
		...Object.fromEntries(
			Object.entries(service.characteristics).map(([key, char]) => [
				camelcase(key),
				char.value
			])
		),

		onGet: (key: keyof ServiceMap<T>, callback: any) => {
			return e.characteristics[key].onGet(callback);
		},
		onSet: (key: keyof ServiceMap<T>, callback: any) => {
			return e.characteristics[key].onSet(callback);
		},
		update: (key: keyof ServiceMap<T>, value: any) => {
			return e.characteristics[key].updateValue(value);
		}
	} satisfies ServiceMap<T>;
}

function camelcase(displayName: string): any {
	throw new Error('Function not implemented.');
}
// Example usage (to be replaced with generated interfaces)
// import { AccessoryInformationCharacteristics } from 'hap-codegen/hap-interfaces';
// const infoService = new FluentService<AccessoryInformationCharacteristics>({ ... });
// infoService.set('Manufacturer', 'Rabbit Air').get('Manufacturer').get();
