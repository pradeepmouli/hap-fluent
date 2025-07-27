import { DynamicPlatformPlugin, PlatformAccessory, type UnknownContext, API, type WithUUID} from 'homebridge';

import { Service, Characteristic, type CharacteristicValue } from 'hap-nodejs';

import { getOrAddService, wrapService, FluentService } from './FluentService.js';
import type { InterfaceMap, Lightbulb, AirPurifier, AccessoryInformation } from './types/hap-interfaces.js';
import type { CamelCase, PartialDeep } from 'type-fest';
import camelcase from 'camelcase';





let PlatformAccessoryClass: API['platformAccessory'];

export function isMultiService<T extends InterfaceMap[keyof InterfaceMap]>(state: Partial<T> | {[key: string]: T & {UUID: string}}): state is {[key: string]: T & {UUID: string}} {
	return Object.keys(state).length > 1 && Object.values(state)[0] instanceof Object;
}

export type ServiceObject<T> = T extends [infer U, ...infer Rest]
	? U extends InterfaceMap[keyof InterfaceMap] & {serviceName: infer I extends string} ?  { [K in CamelCase<I>] : Partial<Omit<U, 'UUID' | 'serviceName'>> } & ServiceObject<Rest>
	: ServiceObject<Rest> : {};

type Interfaces = InterfaceMap[keyof InterfaceMap];

type test = ServiceObject<[Lightbulb, AirPurifier, AccessoryInformation]>; // Should resolve to { lightbulb: Lightbulb, airPurifier: AirPurifier, accessoryInformation: AccessoryInformation }

export class FluentAccessory<TContext extends UnknownContext, Services extends Interfaces[]> {

  services: ServiceObject<Services> = {} as ServiceObject<Services>;
  constructor(private plugin: DynamicPlatformPlugin, public readonly accessory: PlatformAccessory<TContext>) {
	}

  async initialize(initialState: Partial<ServiceObject<Services>>): Promise<void> {

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
}
