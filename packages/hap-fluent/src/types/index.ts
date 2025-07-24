// Re-export all the types from the interface files
export * from './hap-interfaces.js';
export * from './hap-enums.js';
import './hap-interfaces.js';
import { Service, HAP } from 'homebridge';


// Re-export with explicit names to resolve ambiguity

/**
 * Utility interface for services with typed UUIDs
 * This is kept for backward compatibility but is no longer needed
 * with the new generic type mapping approach
 */
export interface WithTypedUUID<T extends string> {
	UUID: T;
}

export type InterfaceForService<T extends typeof Service> = T extends {
	interface: infer I;
}
	? I
	: never;
