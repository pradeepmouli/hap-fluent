import { Service, Characteristic, type WithUUID, type CharacteristicValue } from 'homebridge';
import { PlatformAccessory } from 'homebridge';
import camelcase from 'camelcase';
import type { InterfaceForService } from './types/index.js';
import { PascalCase, CamelCase } from 'type-fest';
import { FluentCharacteristic } from './FluentCharacteristic.js';

export type FluentService<T extends typeof Service> = InterfaceForService<T> & {
	characteristics: {
		[K in keyof InterfaceForService<T> as CamelCase<K> &
		//@ts-ignore
		keyof typeof Characteristic]: FluentCharacteristic<InterfaceForService<T>[K]>;
	};
	onGet<K extends keyof InterfaceForService<T>>(
		key: K,
		callback: () => Promise<InterfaceForService<T>[K]>
	): void;
	onSet<K extends keyof InterfaceForService<T>>(
		key: K,
		callback: (value: InterfaceForService<T>[K]) => Promise<void>
	): void;
	update<K extends keyof InterfaceForService<T>>(
		key: K,
		value: InterfaceForService<T>[K]
	): void;
};

/**
 * FluentService wraps a HAP service with strong typing and fluent API
 */
export function getOrAddService<T extends typeof Service>(
	platformAccessory: PlatformAccessory,
	serviceClass: WithUUID<T>,
	displayName?: string,
	subType?: string
): FluentService<T> {
	if (typeof serviceClass !== 'function') {
		throw new Error('Service class must be a constructor function');
	}
	if (!('UUID' in serviceClass)) {
		throw new Error('Service class must have a UUID property');
	}
	const existingService = platformAccessory.getService(serviceClass) as InstanceType<T> | undefined;
	if (existingService) {
		return wrapService(existingService);
	} else {
		const newService = new serviceClass(displayName, serviceClass.UUID, subType) as InstanceType<T>;
		platformAccessory.addService(newService);

		return wrapService(newService);
	}
}

export function wrapService<T extends typeof Service>(service: InstanceType<T>): FluentService<T> {
	const e = {
		characteristics: Object.fromEntries(
			service.characteristics.map((p) => [camelcase(p.displayName), new FluentCharacteristic(p)])
		) as { [R in keyof FluentService<T>]: FluentCharacteristic<CharacteristicValue> },
	};

	const obj = {
		...e,
		onGet: <K extends keyof InterfaceForService<T>>(
			key: K,
			callback: () => Promise<InterfaceForService<T>[K]>
		) => {
			return e.characteristics[key].onGet(callback as any);
		},
		onSet: <K extends keyof InterfaceForService<T>>(
			key: K,
			callback: (value: InterfaceForService<T>[K]) => Promise<void>
		) => {
			return e.characteristics[key].onSet(callback as any);
		},
		update: <K extends keyof InterfaceForService<T>>(key: K, value: InterfaceForService<T>[K]) => {
			e.characteristics[key].update(value as any);
		},
	};

	for (const key in e.characteristics) {
		Object.defineProperty(obj, key, {
			get: () => e.characteristics[key as keyof typeof e.characteristics].get(),
			set: (value) => e.characteristics[key as keyof typeof e.characteristics].set(value),
		});
	}

	return obj as FluentService<T>;
}
