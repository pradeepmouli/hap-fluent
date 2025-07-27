import { DynamicPlatformPlugin, PlatformAccessory, type UnknownContext, API, type WithUUID} from 'homebridge';

import { Service, Characteristic, type CharacteristicValue } from 'hap-nodejs';

import { getOrAddService, wrapService, FluentService } from './FluentService.js';
import type { InterfaceMap, Lightbulb, AirPurifier, AccessoryInformation, ServiceMap } from './types/hap-interfaces.js';
import type { CamelCase, PartialDeep } from 'type-fest';
import camelcase from 'camelcase';





let PlatformAccessoryClass: API['platformAccessory'];

export function isMultiService<T extends InterfaceMap[keyof InterfaceMap]>(state: Partial<T> | {[key: string]: T & {UUID: string}}): state is {[key: string]: T & {UUID: string}} {
	return Object.keys(state).length > 1 && Object.values(state)[0] instanceof Object;
}

export type ServicesObject<T> = T extends [infer U, ...infer Rest]
	? U extends InterfaceMap[keyof InterfaceMap] & {serviceName: infer I extends keyof ServiceMap} ?  { [K in I as CamelCase<K>] : FluentService<ServiceMap[I]>} & ServicesObject<Rest>
	: ServicesObject<Rest> : {};

export type ServicesStateObject<T> = T extends [infer U, ...infer Rest]
	? U extends InterfaceMap[keyof InterfaceMap] & {serviceName: infer I extends keyof ServiceMap} ?  { [K in I as CamelCase<K>] : Partial<Omit<InterfaceMap[I], 'UUID'|'serviceName'>>} & ServicesStateObject<Rest>
	: ServicesStateObject<Rest>
	: {};

type Interfaces = InterfaceMap[keyof InterfaceMap];

type test = ServicesObject<[Lightbulb, AirPurifier, AccessoryInformation]>; // Should resolve to { lightbulb: Lightbulb, airPurifier: AirPurifier, accessoryInformation: AccessoryInformation }

export class FluentAccessory<TContext extends UnknownContext, Services extends Interfaces[]> {

  services: ServicesObject<Services> = {} as ServicesObject<Services>;
  constructor(private plugin: DynamicPlatformPlugin, public readonly accessory: PlatformAccessory<TContext>) {
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
}

class test2 extends FluentAccessory<UnknownContext, [Lightbulb, AirPurifier, AccessoryInformation]> {
	constructor(plugin: DynamicPlatformPlugin, accessory: PlatformAccessory<UnknownContext>) {
		super(plugin, accessory);
		this.initialize({
			lightbulb: { on: true, brightness: 100,   },
			airPurifier: { active: true, targetAirPurifierState: 'auto' },
			accessoryInformation: { manufacturer: 'My Manufacturer', model: 'My Model', serialNumber: 'My Serial Number' }
		});
	}
}