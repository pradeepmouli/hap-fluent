/**
 * Accessory handler providing strongly-typed service management for Homebridge accessories
 *
 * @module AccessoryHandler
 *
 * @example
 * ```typescript
 * import { createAccessoryHandler, initializeAccessory } from 'hap-fluent';
 *
 * // Create a handler for a lightbulb accessory
 * const handler = createAccessoryHandler(
 *   plugin,
 *   'my-light',
 *   'My Light Bulb',
 *   [hap.Service.Lightbulb]
 * );
 *
 * // Initialize with state
 * const accessory = initializeAccessory(platformAccessory, {
 *   lightbulb: { on: true, brightness: 75 },
 *   accessoryInformation: { manufacturer: 'ACME', model: 'Light-1' }
 * });
 *
 * // Access services with strong typing
 * accessory.lightbulb.characteristics.On.set(false);
 * ```
 */

import { type DynamicPlatformPlugin, PlatformAccessory, type UnknownContext, type WithUUID } from 'homebridge';
import { Service } from 'hap-nodejs';

import { TupleToUnion } from 'type-fest';

import { _definitions } from 'hap-nodejs';

import { getOrAddService, wrapService, FluentService } from './FluentService.js';
import type { AccessoryInformation } from './types/hap-interfaces.js';
import type { CamelCase, SimplifyDeep } from 'type-fest';
import camelcase from 'camelcase';
import type { ServiceForInterface, Interfaces, InterfaceMap, ServiceMap } from './types/index.js';
import { getLogger } from './logger.js';



/**
 * Determine if the provided state object represents multiple service instances.
 *
 * @typeParam T - Service interface type from the interface map.
 * @param state - Single-service state or a keyed map of service states.
 * @returns True when the state contains multiple service entries.
 */
export function isMultiService<T extends InterfaceMap[keyof InterfaceMap]>(state: Partial<T> | {[key: string]: Partial<T>}): state is {[key: string]: Partial<T>} {
	return Object.keys(state).length > 1 && Object.values(state)[0] instanceof Object;
}

 type InternalServicesObject<T> = T extends [infer U, ...infer Rest]
	? U extends InterfaceMap[keyof InterfaceMap] & {serviceName: infer I extends keyof ServiceMap} ?  { [K in I as CamelCase<K>] : FluentService<ServiceMap[I]>} & InternalServicesObject<Rest>
	: InternalServicesObject<Rest> : {};

/**
 * Service object map created from one or more service interfaces.
 * Ensures AccessoryInformation is included if not explicitly provided.
 */
export type ServicesObject<T extends readonly unknown[]> = AccessoryInformation extends TupleToUnion<T> ? SimplifyDeep<InternalServicesObject<T>> : SimplifyDeep<InternalServicesObject<[...T,AccessoryInformation]>>;



/**
 * Check if a service entry holds multiple subtypes instead of a single instance.
 */
function hasSubTypes<T extends ServiceMap[keyof ServiceMap]>(service: Record<string, T> | T): service is Record<string,T> & object {
	return !Object.keys(service).includes('UUID');
}

/**
 * Create a strongly-typed service map from a list of service instances.
 *
 * @param services - Service instances to wrap.
 * @returns Object keyed by camel-cased service names.
 */
export function createServicesObject<T extends Interfaces[]>(...services: InstanceType<ServiceForInterface<T[number]>>[]): ServicesObject<T> {
	return services.reduce<ServicesObject<T>>((acc: ServicesObject<T>, service) : ServicesObject<T> => {
		// Create both PascalCase (e.g., "Lightbulb") and camelCase (e.g., "lightbulb") names
		const pascalName = camelcase(service.constructor.name /* get service name */, { pascalCase: true });
		const camelName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);
		const serviceName = camelName as keyof ServicesObject<T>;

		const accRecord = acc as Record<string, unknown>;
		let serviceObject = accRecord[serviceName as string];
		if(service?.subtype)
		{

			const subTypeName = camelcase(service.subtype, { pascalCase: true });
			// If the service has subtypes, we need to handle them differently
			if(serviceObject && hasSubTypes(serviceObject as ServiceMap[keyof ServiceMap]))
			{
				// hasSubTypes narrows the type, safe to spread
				serviceObject = { ...serviceObject, [camelcase(service.subtype, { pascalCase: true })]: wrapService(service) };
			}
			else {
				serviceObject = {'primary': serviceObject, [subTypeName]: wrapService(service)};
			}
		}
		else
		{
			serviceObject = wrapService(service);
		}
		if(!(serviceName in acc)) {
			// Define camelCase property (primary, for type system)
			Object.defineProperty(acc, serviceName, {
				value: serviceObject,
				writable: true,
				enumerable: true,
				configurable: true
			});
			// Also define PascalCase property for backward compatibility
			const pascalName = camelcase(service.constructor.name, { pascalCase: true });
			if (pascalName !== serviceName) {
				Object.defineProperty(acc, pascalName, {
					value: serviceObject,
					writable: true,
					enumerable: false, // Don't enumerate to avoid duplication
					configurable: true
				});
			}
		}
		else
		{
			acc[serviceName] = serviceObject as ServicesObject<T>[keyof ServicesObject<T>];
		}
		return acc;
	} , {} as ServicesObject<T>);
}

export type InternalServicesStateObject<T> = T extends [infer U, ...infer Rest]
	? U extends InterfaceMap[keyof InterfaceMap] & {serviceName: infer I extends keyof ServiceMap} ?  { [K in I as CamelCase<K>] : Partial<Omit<InterfaceMap[I], 'UUID'|'serviceName'>>} & InternalServicesStateObject<Rest>
	: InternalServicesStateObject<Rest>
	: {};
/**
 * State object shape for updating services, including AccessoryInformation by default.
 */
export type ServicesStateObject <T extends readonly unknown[]> = AccessoryInformation extends TupleToUnion<T> ? InternalServicesStateObject<T> : InternalServicesStateObject<[...T,AccessoryInformation]>;

/**
 * Platform accessory augmented with strongly-typed fluent services.
 */
export type  FluentAccessory<TContext extends UnknownContext, Services extends Interfaces[]> = ServicesObject<Services> & PlatformAccessory<TContext>;

/**
 * Initialize an accessory and apply the provided initial state to its services.
 *
 * @param accessory - The Homebridge platform accessory instance.
 * @param initialState - Initial characteristic values for each service.
 * @returns The accessory augmented with fluent service wrappers.
 *
 * @example
 * ```typescript
 * const accessory = initializeAccessory(platformAccessory, {
 *   lightbulb: { on: true, brightness: 100 },
 *   accessoryInformation: { manufacturer: 'ACME', model: 'Light-1' }
 * });
 * ```
 */
export function initializeAccessory<TContext extends UnknownContext, Services extends Interfaces[]>(
	accessory: PlatformAccessory<TContext>,
	initialState: InternalServicesStateObject<Services>,
): FluentAccessory<TContext, Services> {
	const logger = getLogger();
	logger.info(
		{
			accessoryUUID: accessory.UUID,
			accessoryName: accessory.displayName,
			serviceCount: accessory.services.length,
			stateKeys: Object.keys(initialState)
		},
		'Initializing accessory with state',
	);

	const services = createServicesObject(...accessory.services as unknown as InstanceType<ServiceForInterface<Services[number]>>[]);
	for (const key in initialState) {
	  if(typeof initialState[key] === 'object') {
		const serviceClass = Service[camelcase(key, {pascalCase: true}) as keyof InterfaceMap] as WithUUID<typeof Service.AccessoryInformation>;
		if(serviceClass) {
			const stateValue = initialState[key];
			// Type assertion needed: runtime check handles type safety
			if(typeof stateValue === 'object' && isMultiService(stateValue as any)) {
				// Multi-service handling not yet implemented
			}
			else
			{
				const service = accessory.getService(serviceClass)
				|| accessory.addService(new serviceClass()) as InstanceType<typeof serviceClass>;

				const wrappedService = wrapService(service as InstanceType<typeof serviceClass>);
				// Type assertion needed: dynamic service name lookup and characteristic access
				// TypeScript cannot prove that initialState[key][charKey] matches the characteristic's value type
				(services as Record<string, unknown>)[camelcase(key, {pascalCase: true})] = wrappedService;
					for(const charKey in initialState[key]) {
						const characteristics = (wrappedService as any).characteristics;
						const wrappedChar = characteristics?.[charKey];
						if (wrappedChar && typeof wrappedChar.set === 'function') {
							wrappedChar.set(initialState[key][charKey]);
						}
					}
			}
		}
	  }

	}
	return Object.assign(accessory, services as ServicesObject<Services>);

}

/**
 * Wrapper around a Homebridge platform accessory that exposes fluent service helpers.
 */
export class AccessoryHandler<TContext extends UnknownContext, Services extends Interfaces[]> {

  public context: TContext;
  public services: ServicesObject<Services> = {} as ServicesObject<Services>;

	/**
	 * @param plugin - Homebridge platform plugin instance.
	 * @param accessory - Platform accessory to manage.
	 */
	constructor(protected plugin: DynamicPlatformPlugin, public readonly accessory: PlatformAccessory<TContext>) {
		this.context = accessory.context as TContext;
		this.services = createServicesObject(...accessory.services as unknown as InstanceType<ServiceForInterface<Services[number]>>[]) as ServicesObject<Services>;

	}

	/**
	 * Add or retrieve a service and wrap it with fluent helpers.
	 *
	 * @param serviceClass - HAP service class constructor.
	 * @param displayName - Optional display name for the service.
	 * @param subType - Optional subtype identifier.
	 */
	addService<S extends typeof Service>(
		serviceClass: WithUUID<S>,
		displayName?: string,
		subType?: string
	): FluentService<S> {
		return getOrAddService(this.accessory, serviceClass, displayName, subType);
	}


	/**
	 * Ensure services exist on the accessory and apply initial values.
	 *
	 * @param initialState - Optional initial characteristic values.
	 */
	async initialize(initialState?: InternalServicesStateObject<Services>): Promise<void> {
		if (initialState) {
			for (const key in initialState) {
				if (typeof initialState[key] === 'object') {
					const serviceClass = Service[camelcase(key, { pascalCase: true }) as keyof InterfaceMap];
					if (serviceClass) {
					const stateValue = initialState[key];
					// Type assertion needed: runtime check handles type safety
					if (typeof stateValue === 'object' && isMultiService(stateValue as any)) {
						// Multi-service handling not yet implemented
						} else {
							const service = this.accessory.getService(serviceClass as WithUUID<typeof Service>)
								|| this.accessory.addService(new serviceClass()) as InstanceType<typeof serviceClass>;

						const wrappedService = wrapService(service as InstanceType<typeof serviceClass>);
						// Type assertion needed: dynamic service name lookup and characteristic access
						// TypeScript cannot prove that initialState[key][charKey] matches the characteristic's value type
						(this.services as Record<string, unknown>)[camelcase(key, { pascalCase: true })] = wrappedService;
							for (const charKey in initialState[key]) {
								const characteristics = (wrappedService as any).characteristics;
								const wrappedChar = characteristics?.[charKey];
								if (wrappedChar && typeof wrappedChar.set === 'function') {
									wrappedChar.set(initialState[key][charKey]);
								}
							}
						}
					}
				}
			}

		}
	}
}
