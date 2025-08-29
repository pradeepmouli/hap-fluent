import { type DynamicPlatformPlugin, PlatformAccessory, type UnknownContext, API, type WithUUID} from 'homebridge';

import { TupleToUnion } from 'type-fest';

import { Service, type Characteristic, type CharacteristicValue } from 'hap-nodejs';

import { getOrAddService, wrapService, FluentService } from './FluentService.js';
import type { InterfaceMap, Lightbulb, AirPurifier, AccessoryInformation, ServiceMap } from './types/hap-interfaces.js';
import type { CamelCase, SimplifyDeep } from 'type-fest';
import camelcase from 'camelcase';
import type { TupleOrArray } from 'type-fest/source/spread.js';


export function isMultiService<T extends InterfaceMap[keyof InterfaceMap]>(state: Partial<T> | {[key: string]: Partial<T>}): state is {[key: string]: Partial<T>} {
	return Object.keys(state).length > 1 && Object.values(state)[0] instanceof Object;
}

 type InternalServicesObject<T> = T extends [infer U, ...infer Rest]
	? U extends InterfaceMap[keyof InterfaceMap] & {serviceName: infer I extends keyof ServiceMap} ?  { [K in I as CamelCase<K>] : FluentService<ServiceMap[I]>} & InternalServicesObject<Rest>
	: InternalServicesObject<Rest> : {};

export type ServicesObject<T extends readonly unknown[]> = AccessoryInformation extends TupleToUnion<T> ? SimplifyDeep<InternalServicesObject<T>> : SimplifyDeep<InternalServicesObject<[...T,AccessoryInformation]>>;



function hasSubTypes<T extends ServiceMap[keyof ServiceMap]>(service: Record<string, T> | T): service is Record<string,T> & object {
	return !Object.keys(service).includes('UUID');
}

export function createServicesObject<T extends ServiceMap[keyof ServiceMap]>(...services: InstanceType<T>[]): InternalServicesObject<T[]> {
	return services.reduce<InternalServicesObject<T[]>>((acc, service) : Partial<InternalServicesObject<T[]>> => {
		const serviceName = camelcase(service.constructor.name /* get service name */, { pascalCase: true }) as keyof InternalServicesObject<T[]>;

		let serviceObject = acc[serviceName] || {};
		if(service.subtype)
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
			serviceObject = wrapService(service as any);
		}
		if(!acc[serviceName]) {
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
	} , {} as InternalServicesObject<T[]>);
}

export type InternalServicesStateObject<T> = T extends [infer U, ...infer Rest]
	? U extends InterfaceMap[keyof InterfaceMap] & {serviceName: infer I extends keyof ServiceMap} ?  { [K in I as CamelCase<K>] : Partial<Omit<InterfaceMap[I], 'UUID'|'serviceName'>>} & InternalServicesStateObject<Rest>
	: InternalServicesStateObject<Rest>
	: {};
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

export type Interfaces = InterfaceMap[keyof InterfaceMap];

type test = ServicesObject<[Lightbulb, AccessoryInformation, AirPurifier]>; // Should resolve to { lightbulb: Lightbulb, airPurifier: AirPurifier, accessoryInformation: AccessoryInformation }

export type  FluentAccessory<TContext extends UnknownContext, Services extends Interfaces[]> = ServicesObject<Services> & PlatformAccessory<TContext>;


export function initializeAccessory<TContext extends UnknownContext, Services extends Interfaces[]>(
	accessory: PlatformAccessory<TContext>,
	initialState: InternalServicesStateObject<Services>,
): FluentAccessory<TContext, Services> {
	const services = createServicesObject(...accessory.services);
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

export class AccessoryHandler<TContext extends UnknownContext, Services extends Interfaces[]> {

  public context: TContext;
  public services: ServicesObject<Services> = {} as ServicesObject<Services>;

	constructor(protected plugin: DynamicPlatformPlugin, public readonly accessory: PlatformAccessory<TContext>) {
		this.context = accessory.context as TContext;
		this.services = createServicesObject(...accessory.services) as ServicesObject<Services>;

	}

	addService<S extends typeof Service>(
		serviceClass: WithUUID<S>,
		displayName?: string,
		subType?: string
	): FluentService<S> {
		return getOrAddService(this.accessory, serviceClass, displayName, subType);
	}



	async initialize(initialState?: InternalServicesStateObject<Services>): Promise<void> {
		if (initialState) {
			for (const key in initialState) {
				if (typeof initialState[key] === 'object') {
					const serviceClass = Service[camelcase(key, { pascalCase: true }) as keyof InterfaceMap] as WithUUID<typeof Service.AccessoryInformation>;
					if (serviceClass) {
						let singleService = true;
						if (isMultiService(initialState[key] as any)) {
							singleService = false;
						} else {
							const service = this.accessory.getService(serviceClass)
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
