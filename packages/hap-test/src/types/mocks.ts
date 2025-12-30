/**
 * Type definitions for mock HomeKit entities
 */

import type { CharacteristicValue } from 'hap-nodejs';
import type { AccessoryContext } from './harness.js';
import type { CharacteristicEvent } from './events.js';

/**
 * Mock accessory representation
 */
export interface MockAccessory {
	/** Unique identifier (UUID) */
	UUID: string;

	/** Display name */
	displayName: string;

	/** Category (e.g., LIGHTBULB, SWITCH) */
	category?: number;

	/** Associated services */
	services: MockService[];

	/** User context */
	context: AccessoryContext;

	/** Get service by type or name */
	getService(nameOrType: string): MockService | undefined;

	/** Get all services */
	getServices(): MockService[];
}

/**
 * Mock service representation
 */
export interface MockService {
	/** Service type (e.g., "Lightbulb", "Switch") */
	type: string;

	/** Service subtype */
	subtype?: string;

	/** Display name */
	displayName: string;

	/** Associated characteristics */
	characteristics: MockCharacteristic[];

	/** Get characteristic by type or name */
	getCharacteristic(nameOrType: string): MockCharacteristic | undefined;

	/** Check if characteristic exists */
	hasCharacteristic(nameOrType: string): boolean;
}

/**
 * Mock characteristic representation
 */
export interface MockCharacteristic {
	/** Characteristic type (e.g., "On", "Brightness") */
	type: string;

	/** Display name */
	displayName: string;

	/** Current value */
	value: CharacteristicValue;

	/** Characteristic properties */
	props: CharacteristicProps;

	/** Get current value */
	getValue(): Promise<CharacteristicValue>;

	/** Set new value */
	setValue(value: CharacteristicValue): Promise<void>;

	/** Subscribe to value changes */
	subscribe(): EventSubscription;

	/** Check if subscribed */
	isSubscribed(): boolean;

	/** Get historical events */
	getHistory(): CharacteristicEvent[];
}

/**
 * Characteristic properties (constraints and metadata)
 */
export interface CharacteristicProps {
	/** Format (e.g., "bool", "int", "float", "string") */
	format: string;

	/** Permissions (read, write, notify) */
	perms: string[];

	/** Minimum value (numeric types) */
	minValue?: number;

	/** Maximum value (numeric types) */
	maxValue?: number;

	/** Step value (numeric types) */
	minStep?: number;

	/** Valid values (enum types) */
	validValues?: number[];

	/** Unit (e.g., "celsius", "percentage") */
	unit?: string;
}

/**
 * Event subscription for characteristic changes
 */
export interface EventSubscription {
	/** Wait for next event */
	waitForNext(timeout?: number): Promise<CharacteristicEvent>;

	/** Get event history */
	getHistory(): CharacteristicEvent[];

	/** Unsubscribe from events */
	unsubscribe(): void;

	/** Latest event (if any) */
	latest?: () => CharacteristicEvent | undefined;

	/** Number of events seen */
	count?: () => number;
}

/**
 * Characteristic change event
 */
export type CharacteristicChangeEvent = CharacteristicEvent;
