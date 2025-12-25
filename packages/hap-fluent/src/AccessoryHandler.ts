import { type API, type DynamicPlatformPlugin, type HAP, PlatformAccessory, type UnknownContext, type WithUUID, Characteristic, type CharacteristicValue } from 'homebridge';
import { Service } from 'hap-nodejs';

import { TupleToUnion } from 'type-fest';

import { _definitions } from 'hap-nodejs';

import { getOrAddService, wrapService, FluentService } from './FluentService.js';
import type { Lightbulb, AirPurifier, AccessoryInformation } from './types/hap-interfaces.js';
import type { CamelCase, SimplifyDeep } from 'type-fest';
import camelcase from 'camelcase';
import type { TupleOrArray } from 'type-fest/source/spread.js';
import type { ServiceForInterface, Interfaces, InterfaceMap, ServiceMap } from './types/index.js';



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
		const serviceName = camelcase(service.constructor.name /* get service name */, { pascalCase: false }) as keyof ServicesObject<T>;

		let serviceObject = (acc as any)[serviceName];
		if(service?.subtype)
		{

			const subTypeName = camelcase(service.subtype, { pascalCase: true });
			// If the service has subtypes, we need to handle them differently
			if(hasSubTypes(serviceObject))
			{
				//@ts-ignore
				serviceObject = { ...serviceObject, [camelcase(service.subtype, { pascalCase: true })]: wrapService(service as any) };
			}
			else {
				//@ts-ignore
				serviceObject = {'primary': serviceObject, [subTypeName]: wrapService(service as any)};
			}
		}
		else
		{
			serviceObject = wrapService(service);
		}
		if(!(serviceName in acc)) {
			Object.defineProperty(acc, serviceName, {
				value: serviceObject,
				writable: true,
				enumerable: true,
				configurable: true
			});
		}
		else
		{
			acc[serviceName] = serviceObject;
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

// /* export function createServiceStateObject<T extends InterfaceMap[keyof InterfaceMap][]>(services: ServicesObject<T[]>): ServicesStateObject<T[]> {
// 	return services.reduce<ServicesStateObject<T[]>>((acc, service) => {
// 		const serviceName = camelcase(service.constructor.name /* get service name */, { pascalCase: true }) as keyof ServicesStateObject<T[]>;

// 		acc[serviceName] = Object.keys(service.characteristics).reduce((charAcc, charKey) => {
// 			charAcc[charKey] = service.characteristics[charKey].getValue();
// 			return charAcc;
// 		}, {} as Partial<Omit<InterfaceMap[keyof InterfaceMap], 'UUID' | 'serviceName'>>);

// 		return acc;
// 	}, {} as ServicesStateObject<T[]>);
// }



type test = ServicesObject<[Lightbulb, AccessoryInformation, AirPurifier]>; // Should resolve to { lightbulb: Lightbulb, airPurifier: AirPurifier, accessoryInformation: AccessoryInformation }

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
 */
export function initializeAccessory<TContext extends UnknownContext, Services extends Interfaces[]>(
	accessory: PlatformAccessory<TContext>,
	initialState: InternalServicesStateObject<Services>,
): FluentAccessory<TContext, Services> {
	const services = createServicesObject(...accessory.services as any);
	for (const key in initialState) {
	  if(typeof initialState[key] === 'object') {
		const serviceClass = Service[camelcase(key, {pascalCase: true}) as keyof InterfaceMap] as WithUUID<typeof Service.AccessoryInformation>;
		if(serviceClass) {
			let singleService = true;
			if(isMultiService(initialState[key] as any)) {
				singleService = false;
			}
			else
			{
				const service = accessory.getService(serviceClass)
				|| accessory.addService(new serviceClass()) as InstanceType<typeof serviceClass>;

				const wrappedService = wrapService(service as InstanceType<typeof serviceClass>) as FluentService<any>;
				//@ts-expect-error
				services[camelcase(key, {pascalCase: true}) as keyof InternalServicesObject<Services>] = wrappedService as any;
					for(const charKey in initialState[key]) {
						if(charKey in wrappedService.characteristics) {
							const characteristic = wrappedService.characteristics[charKey as keyof typeof wrappedService.characteristics] as Characteristic;
							if (characteristic) {
								characteristic.setValue(initialState[key][charKey] as CharacteristicValue);
							}
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
		this.services = createServicesObject(...accessory.services as any) as ServicesObject<Services>;

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
						let singleService = true;
						if (isMultiService(initialState[key] as any)) {
							singleService = false;
						} else {
							const service = this.accessory.getService(serviceClass as WithUUID<typeof Service>)
								|| this.accessory.addService(new serviceClass()) as InstanceType<typeof serviceClass>;

							const wrappedService = wrapService(service as InstanceType<typeof serviceClass>) as FluentService<any>;
							this.services[camelcase(key, { pascalCase: true }) as keyof ServicesObject<Services>] = wrappedService as any;
							for (const charKey in initialState[key]) {
								if (charKey in wrappedService.characteristics) {
									const characteristic = wrappedService.characteristics[charKey as keyof typeof wrappedService.characteristics] as Characteristic;
									if (characteristic) {
										characteristic.setValue(initialState[key][charKey] as CharacteristicValue);
									}
								}
							}
						}
					}
				}
			}

		}
	}
}

/*export class FFluentAccessory<TContext extends UnknownContext, Services extends Interfaces[]> {

  public services: ServicesObject<Services> = {} as ServicesObject<Services>;
  constructor(protected plugin: DynamicPlatformPlugin, public readonly accessory: PlatformAccessory<TContext>) {

	}

  async initialize(initialState: ServicesStateObject<Services>): Promise<void> {

	for (const key in initialState) {
	  if(typeof initialState[key] === 'object') {
		const serviceClass = Service[camelcase(key, {pascalCase: true}) as keyof InterfaceMap] as WithUUID<typeof Service.AccessoryInformation>;
		if(serviceClass) {
			let singleService = true;
			if(isMultiService(initialState[key] as any)) {
				singleService = false;
			}
			else
			{
				const service = this.accessory.getService(serviceClass)
				|| this.accessory.addService(new serviceClass()) as InstanceType<typeof serviceClass>;

				const wrappedService = wrapService(service as InstanceType<typeof serviceClass>) as FluentService<any>;
				this.services = wrappedService as any;
					for(const charKey in initialState[key]) {
						if(charKey in wrappedService.characteristics) {
							const characteristic = wrappedService.characteristics[charKey as keyof typeof wrappedService.characteristics] as Characteristic;
							if (characteristic) {
								characteristic.setValue(initialState[key][charKey] as CharacteristicValue);
							}
						}
					}
			}
		}
	  }
	}
  }

  get displayName(): string {
	return this.accessory.displayName;
  }




  addService<S extends typeof Service>(
	serviceClass: WithUUID<S>,
	displayName?: string,
	subType?: string
  ): FluentService<S> {
	return getOrAddService(this.accessory, serviceClass, displayName, subType);
  }

  // Add your methods and properties here
}*/
