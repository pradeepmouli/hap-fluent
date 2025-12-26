import { Service, Characteristic, type WithUUID, type CharacteristicValue, type PrimitiveTypes } from 'homebridge';
import { PlatformAccessory } from 'homebridge';
import camelcase from 'camelcase';
import type { InterfaceForService } from './types/index.js';
import { PascalCase } from 'type-fest';
import { FluentCharacteristic } from './FluentCharacteristic.js';
import { ValidationError } from './errors.js';
import { isService } from './type-guards.js';
import { getLogger } from './logger.js';

/**
 * Fluent wrapper for HAP Service with strong typing and characteristic access
 *
 * @template T - HAP Service class type
 *
 * @example
 * ```typescript
 * const lightbulb: FluentService<typeof Lightbulb> = getOrAddService(
 *   accessory,
 *   hap.Service.Lightbulb,
 *   'My Light'
 * );
 *
 * // Access characteristics with camelCase or PascalCase
 * lightbulb.characteristics.On.set(true);
 * lightbulb.on = true; // Shorthand property access
 *
 * // Register handlers
 * lightbulb.onGet('On', async () => await getLightState());
 * lightbulb.onSet('On', async (value) => await setLightState(value));
 *
 * // Update without triggering handlers
 * lightbulb.update('Brightness', 75);
 * ```
 */
export type FluentService<T extends typeof Service> = InterfaceForService<T> & {
	/**
	 * Collection of all characteristics for this service
	 * Keys are PascalCase characteristic names (e.g., 'On', 'Brightness')
	 */
	characteristics: {
		[K in CharacteristicNamesOf<T> as PascalCase<K>]: FluentCharacteristic<InterfaceForService<T>[K] & CharacteristicValue>;
	};
	/**
	 * Register an async getter for a characteristic
	 *
	 * @param key - Characteristic name (PascalCase)
	 * @param callback - Async function returning the characteristic value
	 *
	 * @example
	 * ```typescript
	 * service.onGet('On', async () => {
	 *   const state = await getDeviceState();
	 *   return state.isOn;
	 * });
	 * ```
	 */
	onGet<K extends CharacteristicNamesOf<T>>(
		key: PascalCase<K>,
		callback: () => Promise<InterfaceForService<T>[K]>
	): void;
	/**
	 * Register an async setter for a characteristic
	 *
	 * @param key - Characteristic name (PascalCase)
	 * @param callback - Async function receiving the new value
	 *
	 * @example
	 * ```typescript
	 * service.onSet('On', async (value) => {
	 *   await setDeviceState({ isOn: value });
	 * });
	 * ```
	 */
	onSet<K extends CharacteristicNamesOf<T>>(
		key: PascalCase<K>,
		callback: (value: InterfaceForService<T>[K]) => Promise<void>
	): void;
	/**
	 * Update a characteristic value without triggering SET handlers
	 *
	 * @param key - Characteristic name (PascalCase)
	 * @param value - New characteristic value
	 *
	 * @example
	 * ```typescript
	 * // Update brightness from external state change
	 * service.update('Brightness', newBrightness);
	 * ```
	 */
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
	const logger = getLogger();

	if (typeof serviceClass !== 'function') {
		logger.error({ serviceClass }, 'Service class must be a constructor function');
		throw new Error('Service class must be a constructor function');
	}
	if (!('UUID' in serviceClass)) {
		logger.error({ serviceClass }, 'Service class must have a UUID property');
		throw new Error('Service class must have a UUID property');
	}

	const existingService = subType
		? platformAccessory.getServiceById(serviceClass, subType)
		: platformAccessory.getService(serviceClass);

	if (existingService) {
		logger.debug(
			{ displayName, subType, uuid: serviceClass.UUID },
			'Found existing service',
		);
		return wrapService(existingService as InstanceType<T>);
	} else {
		logger.debug(
			{ displayName, subType, uuid: serviceClass.UUID },
			'Creating new service',
		);
		const newService = new serviceClass(displayName ?? '', subType ?? '') as InstanceType<T>;
		platformAccessory.addService(newService);

		logger.info(
			{ displayName, subType, uuid: serviceClass.UUID, characteristicCount: newService.characteristics.length },
			'Created and added new service',
		);

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
	const logger = getLogger();

	if (!isService(service)) {
		logger.error({ service }, 'Invalid service object');
		throw new ValidationError('Invalid service object', {
			value: service,
			expected: 'HAP Service instance',
			actual: typeof service,
		});
	}

	logger.debug(
		{
			serviceName: service.displayName,
			uuid: service.UUID,
			characteristicCount: service.characteristics.length
		},
		'Wrapping service with fluent interface',
	);

	const e = {
		characteristics: Object.fromEntries(
			service.characteristics.map((p) => {
				const pascalName = camelcase(p.displayName, { pascalCase: true });
				const camelName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);
				return [camelName, new FluentCharacteristic(p)];
			})
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
		// Create PascalCase property (e.g., "On", "Brightness")
		Object.defineProperty(obj, key, {
			get: () => e.characteristics[key as keyof typeof e.characteristics].get(),
			set: (value) => e.characteristics[key as keyof typeof e.characteristics].set(value),
		});

		// Also create lowercase property for backward compatibility (e.g., "on", "brightness")
		const lowercaseKey = key.charAt(0).toLowerCase() + key.slice(1);
		if (lowercaseKey !== key) {
			Object.defineProperty(obj, lowercaseKey, {
				get: () => e.characteristics[key as keyof typeof e.characteristics].get(),
				set: (value) => e.characteristics[key as keyof typeof e.characteristics].set(value),
			});
		}
	}

	return obj as FluentService<T>;
}
