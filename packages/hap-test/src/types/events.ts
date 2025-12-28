/**
 * Event type definitions for HomeKit protocol events
 */

import type { CharacteristicValue } from 'hap-nodejs';

/**
 * Accessory-level events
 */
export enum AccessoryEventType {
	/** Accessory was registered */
	REGISTERED = 'registered',
	
	/** Accessory was unregistered */
	UNREGISTERED = 'unregistered',
	
	/** Accessory was updated */
	UPDATED = 'updated',
	
	/** Accessory configuration changed */
	CONFIG_CHANGED = 'config-changed',
}

/**
 * Accessory event data
 */
export interface AccessoryEvent {
	/** Event type */
	type: AccessoryEventType;
	
	/** Accessory UUID */
	accessoryUUID: string;
	
	/** Accessory display name */
	displayName: string;
	
	/** Timestamp */
	timestamp: number;
	
	/** Additional context */
	context?: any;
}

/**
 * Characteristic-level events
 */
export enum CharacteristicEventType {
	/** Value changed */
	VALUE_CHANGE = 'value-change',
	
	/** Value read */
	VALUE_READ = 'value-read',
	
	/** Value written */
	VALUE_WRITE = 'value-write',
	
	/** Subscription added */
	SUBSCRIBE = 'subscribe',
	
	/** Subscription removed */
	UNSUBSCRIBE = 'unsubscribe',
}

/**
 * Characteristic event data
 */
export interface CharacteristicEvent {
	/** Event type */
	type: CharacteristicEventType;
	
	/** Characteristic type */
	characteristicType: string;
	
	/** Service type */
	serviceType: string;
	
	/** Accessory UUID */
	accessoryUUID: string;
	
	/** Old value (for VALUE_CHANGE) */
	oldValue?: CharacteristicValue;
	
	/** New value */
	newValue: CharacteristicValue;
	
	/** Timestamp */
	timestamp: number;
	
	/** Additional context */
	context?: any;
}

/**
 * Generic event emitter interface
 */
export interface EventEmitter<T = any> {
	/** Subscribe to events */
	on(eventType: string, handler: (event: T) => void): void;
	
	/** Unsubscribe from events */
	off(eventType: string, handler: (event: T) => void): void;
	
	/** Emit event */
	emit(eventType: string, event: T): void;
}
