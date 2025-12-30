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

import { type DynamicPlatformPlugin, PlatformAccessory, type UnknownContext } from 'homebridge';

import { TupleToUnion } from 'type-fest';

import { wrapService, FluentService } from './FluentService.js';
import type { AccessoryInformation } from './types/hap-interfaces.js';
import type { CamelCase, SimplifyDeep } from 'type-fest';
import camelcase from 'camelcase';
import type { ServiceForInterface, Interfaces, InterfaceMap, ServiceMap } from './types/index.js';
import { getLogger } from './logger.js';
import type { API } from 'homebridge';



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
 * @param api - Homebridge API for accessing hap.Service constructor.
 * @param initialState - Initial characteristic values for each service.
 * @returns The accessory augmented with fluent service wrappers.
 *
 * @remarks
 * This function wraps existing services on the accessory with fluent interfaces.
 * It can create new services using the api.hap.Service constructors if they don't already exist.
 *
 * @example
 * ```typescript
 * // Initialize with fluent interface, creating services if needed
 * const fluentAccessory = initializeAccessory(accessory, api, {
 *   lightbulb: { on: true, brightness: 100 }
 * });
 *
 * // Use fluent API
 * fluentAccessory.lightbulb.on.set(false);
 * ```
 */
export function initializeAccessory<TContext extends UnknownContext, Services extends Interfaces[]>(
	accessory: PlatformAccessory<TContext>,
	api: API,
	initialState?: InternalServicesStateObject<Services>,
): FluentAccessory<TContext, Services> {
	const logger = getLogger();
	logger.info(
		{
			accessoryUUID: accessory.UUID,
			accessoryName: accessory.displayName,
			serviceCount: accessory.services.length,
			stateKeys: initialState ? Object.keys(initialState) : []
		},
		'Initializing accessory with state',
	);

	// Apply initial state to services, creating them if needed
	if (initialState) {
		for (const key in initialState) {
			const serviceName = camelcase(key, { pascalCase: true });
			const stateValue = initialState[key];

			if (typeof stateValue === 'object' && !isMultiService(stateValue as any)) {
				// Look up service class from api.hap.Service
				const serviceClass = (api.hap.Service as Record<string, any>)[serviceName];

				if (serviceClass) {
					// Get existing service or create new one
					let service = accessory.getService(serviceClass);
					if (!service) {
						service = accessory.addService(new serviceClass());
					}

					// Apply initial characteristic values
					for (const charKey in stateValue) {
						const characteristic = service.getCharacteristic((api.hap.Characteristic as Record<string, any>)[camelcase(charKey, { pascalCase: true })]);
						if (characteristic) {
							characteristic.setValue((stateValue as Record<string, any>)[charKey]);
						}
					}
				}
			}
		}
	}

	// Wrap all services on the accessory
	const services = createServicesObject(...accessory.services as unknown as InstanceType<ServiceForInterface<Services[number]>>[]);
	return Object.assign(accessory, services as ServicesObject<Services>);
}

/**
 * Wrapper around a Homebridge platform accessory that exposes fluent service helpers.
 *
 * @remarks
 * This class wraps an existing Homebridge accessory with fluent service helpers.
 * Services must be created through Homebridge's hap.Service API before passing
 * to this class.
 */
export class AccessoryHandler<TContext extends UnknownContext, Services extends Interfaces[]> {

	public context: TContext;
	public services: ServicesObject<Services> = {} as ServicesObject<Services>;

	/**
	 * @param plugin - Homebridge platform plugin instance.
	 * @param accessory - Platform accessory to manage (must have services already created).
	 */
	constructor(protected plugin: DynamicPlatformPlugin, public readonly accessory: PlatformAccessory<TContext>) {
		this.context = accessory.context as TContext;
		this.services = createServicesObject(...accessory.services as unknown as InstanceType<ServiceForInterface<Services[number]>>[]) as ServicesObject<Services>;
	}

	/**
	 * Initialize the accessory with state, applying values to characteristics and creating services if needed.
	 * This method requires the Homebridge API to access hap.Service constructors for dynamic service creation.
	 *
	 * @param apiOrState - Homebridge API instance (required for creating new services) or initial state if API was injected.
	 * @param maybeState - Initial characteristic values for services (if first param is API).
	 *
	 * @example
	 * ```typescript
	 * const handler = new AccessoryHandler(plugin, accessory);
	 * // With API for creating services
	 * await handler.initialize(api, { lightbulb: { on: true } });
	 * // Or just with existing services (no service creation)
	 * await handler.initialize({ lightbulb: { on: true } });
	 * ```
	 */
	public async initialize(apiOrState?: API | InternalServicesStateObject<Services>, maybeState?: InternalServicesStateObject<Services>): Promise<void> {
		let api: API | undefined;
		let initialState: InternalServicesStateObject<Services> | undefined;

		// Determine if first arg is API or state
		if (apiOrState && 'hap' in (apiOrState as any)) {
			// First arg is API
			api = apiOrState as API;
			initialState = maybeState;
		} else {
			// First arg is state (or undefined)
			initialState = apiOrState as InternalServicesStateObject<Services>;
		}

		// Only initialize with state if we have both api and state
		if (api && initialState) {
			initializeAccessory(this.accessory, api, initialState);
		} else if (initialState && !api) {
			// If state is provided without API, just apply to existing services
			// This happens in tests where services already exist
			for (const key in initialState) {
				const serviceName = camelcase(key, { pascalCase: true });
				const stateValue = initialState[key];

				if (typeof stateValue === 'object' && !isMultiService(stateValue as any)) {
					// Find service by name
					const service = this.accessory.services.find(s =>
						s.constructor.name === serviceName ||
						camelcase(s.constructor.name, { pascalCase: true }) === serviceName
					);

					if (service) {
						for (const charKey in stateValue) {
							const characteristic = service.getCharacteristic(
								(stateValue as any)[charKey]?.constructor || charKey as any
							);
							if (characteristic) {
								characteristic.setValue((stateValue as Record<string, any>)[charKey]);
							}
						}
					}
				}
			}
		}

		// Always refresh the services object after initialization
		this.services = createServicesObject(...this.accessory.services as unknown as InstanceType<ServiceForInterface<Services[number]>>[]) as ServicesObject<Services>;
	}

	/**
	 * Add a new service to the accessory and return it wrapped with the fluent interface.
	 *
	 * @param serviceClass - Service class constructor.
	 * @param displayName - Display name for the service.
	 * @param subtype - Optional subtype for the service.
	 * @returns The wrapped fluent service.
	 *
	 * @example
	 * ```typescript
	 * const lightbulb = handler.addService(api.hap.Service.Lightbulb, 'Main Light');
	 * lightbulb.on.set(true);
	 * ```
	 */
	public addService(
		serviceClass: any,
		displayName: string,
		subtype?: string,
	): FluentService<any> {
		const service = this.accessory.addService(new serviceClass(displayName, subtype) as unknown as any);
		return wrapService(service as any);
	}
}
