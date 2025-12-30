/**
 * Helpers for characteristic validation and event construction.
 */

import type { CharacteristicValue } from 'hap-nodejs';
import { CharacteristicValidationError } from '../errors/CharacteristicValidationError.js';
import type { CharacteristicEvent } from '../types/events.js';
import { CharacteristicEventType } from '../types/events.js';
import type { CharacteristicProps } from '../types/mocks.js';
import { validatePermission } from './validation.js';

export type TimeProvider = { now(): number };

export function ensureReadable(type: string, props: CharacteristicProps): void {
	if (!props.perms || !validatePermission('read', props.perms)) {
		throw new CharacteristicValidationError(type, undefined, 'Read (pr) permission required');
	}
}

export function ensureWritable(type: string, props: CharacteristicProps): void {
	if (!props.perms || !validatePermission('write', props.perms)) {
		throw new CharacteristicValidationError(type, undefined, 'Write (pw) permission required');
	}
}

export function ensureSubscribable(type: string, props: CharacteristicProps): void {
	if (!props.perms || !validatePermission('notify', props.perms)) {
		throw new CharacteristicValidationError(type, undefined, 'Notification (ev) permission required for subscription');
	}
}

export function resolveTimestamp(time?: TimeProvider): number {
	return time?.now() ?? Date.now();
}

interface BuildChangeEventArgs {
	accessoryUUID?: string;
	serviceType?: string;
	characteristicType: string;
	event: {
		oldValue?: CharacteristicValue;
		newValue: CharacteristicValue;
		context?: any;
		timestamp?: number;
	};
	time?: TimeProvider;
	type?: CharacteristicEventType;
}

export function buildChangeEvent(args: BuildChangeEventArgs): CharacteristicEvent {
	const timestamp = args.event.timestamp ?? resolveTimestamp(args.time);
	return {
		type: args.type ?? CharacteristicEventType.VALUE_CHANGE,
		characteristicType: args.characteristicType,
		serviceType: args.serviceType ?? 'unknown-service',
		accessoryUUID: args.accessoryUUID ?? 'unknown-accessory',
		oldValue: args.event.oldValue,
		newValue: args.event.newValue,
		timestamp,
		context: args.event.context,
	};
}
