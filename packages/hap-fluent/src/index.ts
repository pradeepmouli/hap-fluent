// Auto-generated HAP Fluent API wrapper
// This file will be extended to use generated interfaces from hap-codegen


import { Service, Characteristic, type WithUUID, type CharacteristicValue, type CharacteristicSetHandler } from 'homebridge';
import type { InterfaceForService } from './types/index.js';
import { CamelCase, PascalCase } from 'type-fest';
import  {PlatformAccessory} from 'homebridge';
import camelcase from 'camelcase';




/**
 * FluentCharacteristic wraps a HAP characteristic with strong typing and fluent API
 */
export * from './FluentCharacteristic.js';

export * from './FluentService.js';

export * from './AccessoryHandler.js';

export * from './types/index.js';

// Example usage (to be replaced with generated interfaces)
// import { AccessoryInformationCharacteristics } from 'hap-codegen/hap-interfaces';
// const infoService = new FluentService<AccessoryInformationCharacteristics>({ ... });
// infoService.set('Manufacturer', 'Rabbit Air').get('Manufacturer').get();
