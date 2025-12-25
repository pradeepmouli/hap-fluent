import { Service, Characteristic, type WithUUID, type CharacteristicValue, type PrimitiveTypes } from 'homebridge';
import { PlatformAccessory } from 'homebridge';
import camelcase from 'camelcase';
import type { InterfaceForService } from './types/index.js';
import { PascalCase } from 'type-fest';
import { FluentCharacteristic } from './FluentCharacteristic.js';
import { FluentServiceError, ValidationError } from './errors.js';
import { isService } from './type-guards.js';

export type FluentService<T extends typeof Service> = InterfaceForService<T> & {
	characteristics: {
		[K in CharacteristicNamesOf<T> as PascalCase<K>]: FluentCharacteristic<InterfaceForService<T>[K] & CharacteristicValue>;
	};
	onGet<K extends CharacteristicNamesOf<T>>(
		key: PascalCase<K>,
		callback: () => Promise<InterfaceForService<T>[K]>
	): void;
	onSet<K extends CharacteristicNamesOf<T>>(
		key: PascalCase<K>,
		callback: (value: InterfaceForService<T>[K]) => Promise<void>
	): void;
	update<K extends CharacteristicNamesOf<T>>(
		key: PascalCase<K>,
		value: InterfaceForService<T>[K]
	): void;
};

export type CharacteristicNamesOf<T extends typeof Service> = keyof Omit< InterfaceForService<T>, 'UUID' | 'serviceName'>;


/**
 * Add or retrieve a service on a platform accessory and wrap it with fluent helpers.
 *
 * @param platformAccessory - Accessory that owns the service.
 * @param serviceClass - HAP service constructor.
 * @param displayName - Optional display name for the service.
 * @param subType - Optional subtype identifier.
 * @returns A fluent, strongly-typed service wrapper.
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
	const existingService = subType
		? platformAccessory.getServiceById(serviceClass, subType)
		: platformAccessory.getService(serviceClass);

	if (existingService) {
		return wrapService(existingService as InstanceType<T>);
	} else {
		const newService = new serviceClass(displayName ?? '', subType ?? '') as InstanceType<T>;
		platformAccessory.addService(newService);

		return wrapService(newService);
	}
}

/**
 * Wrap a HAP service with typed characteristic access and fluent helpers.
 *
 * @param service - Service instance to wrap.
 * @returns A fluent, strongly-typed service wrapper.
 * @throws {ValidationError} If service is invalid
 */
export function wrapService<T extends typeof Service>(service: InstanceType<T>): FluentService<T> {
	if (!isService(service)) {
		throw new ValidationError('Invalid service object', {
			value: service,
			expected: 'HAP Service instance',
			actual: typeof service,
		});
	}
	
	const e = {
		characteristics: Object.fromEntries(
			service.characteristics.map((p) => [camelcase(p.displayName, { pascalCase: true }), new FluentCharacteristic(p)])
		) as { [R in keyof FluentService<T>]: FluentCharacteristic<CharacteristicValue> },
	};

	const obj = {
		...e,
		onGet: <K extends keyof InterfaceForService<T>>(
			key: K,
			callback: () => Promise<InterfaceForService<T>[K]>
		) => {
			// Type assertion needed: TypeScript can't prove InterfaceForService[K] extends CharacteristicValue
			// Runtime validation happens in FluentCharacteristic
			return e.characteristics[key].onGet(callback as unknown as () => Promise<CharacteristicValue>);
		},
		onSet: <K extends keyof InterfaceForService<T>>(
			key: K,
			callback: (value: InterfaceForService<T>[K]) => Promise<void>
		) => {
			// Type assertion needed: TypeScript can't prove CharacteristicValue extends InterfaceForService[K]
			// Runtime validation happens in FluentCharacteristic
			return e.characteristics[key].onSet(callback as unknown as (value: CharacteristicValue) => Promise<void>);
		},
		update: <K extends keyof InterfaceForService<T>>(key: K, value: InterfaceForService<T>[K]) => {
			// Type assertion needed: TypeScript can't prove InterfaceForService[K] extends CharacteristicValue
			// Runtime validation happens in FluentCharacteristic.update()
			e.characteristics[key].update(value as unknown as CharacteristicValue);
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
