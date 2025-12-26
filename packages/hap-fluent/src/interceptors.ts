/**
 * Interceptor system for HAP characteristic operations
 * 
 * Provides a fluent/decorator approach for extending characteristic behavior
 * with pre/post processing, logging, rate limiting, and other cross-cutting concerns.
 * 
 * @module interceptors
 */

import type { CharacteristicValue } from 'homebridge';
import { getLogger } from './logger.js';

/**
 * Context passed to interceptor functions
 */
export interface InterceptorContext {
	/** Name of the characteristic being accessed */
	characteristicName: string;
	/** Current value (for afterSet, afterGet) */
	value?: CharacteristicValue;
	/** Timestamp of the operation */
	timestamp: number;
	/** Additional metadata */
	metadata?: Record<string, unknown>;
}

/**
 * Interceptor for characteristic operations
 * 
 * Interceptors can modify values, log operations, enforce rate limits,
 * or perform any other cross-cutting concern.
 */
export interface Interceptor {
	/**
	 * Called before a value is set
	 * 
	 * @param value - Value about to be set
	 * @param context - Operation context
	 * @returns Modified value or original value
	 */
	beforeSet?(value: CharacteristicValue, context: InterceptorContext): CharacteristicValue | Promise<CharacteristicValue>;

	/**
	 * Called after a value is set successfully
	 * 
	 * @param value - Value that was set
	 * @param context - Operation context
	 */
	afterSet?(value: CharacteristicValue, context: InterceptorContext): void | Promise<void>;

	/**
	 * Called before a value is retrieved
	 * 
	 * @param context - Operation context
	 */
	beforeGet?(context: InterceptorContext): void | Promise<void>;

	/**
	 * Called after a value is retrieved
	 * 
	 * @param value - Value that was retrieved
	 * @param context - Operation context
	 * @returns Modified value or original value
	 */
	afterGet?(value: CharacteristicValue | undefined, context: InterceptorContext): CharacteristicValue | undefined | Promise<CharacteristicValue | undefined>;

	/**
	 * Called when an error occurs during set/get
	 * 
	 * @param error - The error that occurred
	 * @param context - Operation context
	 */
	onError?(error: Error, context: InterceptorContext): void | Promise<void>;
}

/**
 * Logging interceptor that logs all characteristic operations
 * 
 * @example
 * ```typescript
 * characteristic.intercept(createLoggingInterceptor());
 * ```
 */
export function createLoggingInterceptor(): Interceptor {
	const logger = getLogger();

	return {
		beforeSet(value, context) {
			logger.debug(
				{ characteristic: context.characteristicName, value },
				'[Interceptor] Before set'
			);
			return value;
		},

		afterSet(value, context) {
			logger.debug(
				{ characteristic: context.characteristicName, value },
				'[Interceptor] After set'
			);
		},

		beforeGet(context) {
			logger.debug(
				{ characteristic: context.characteristicName },
				'[Interceptor] Before get'
			);
		},

		afterGet(value, context) {
			logger.debug(
				{ characteristic: context.characteristicName, value },
				'[Interceptor] After get'
			);
			return value;
		},

		onError(error, context) {
			logger.error(
				{ characteristic: context.characteristicName, error },
				'[Interceptor] Error occurred'
			);
		},
	};
}

/**
 * Rate limiting interceptor to prevent excessive updates
 * 
 * @param maxCalls - Maximum number of calls allowed
 * @param windowMs - Time window in milliseconds
 * 
 * @example
 * ```typescript
 * characteristic.intercept(createRateLimitInterceptor(5, 1000));
 * ```
 */
export function createRateLimitInterceptor(maxCalls: number, windowMs: number): Interceptor {
	const calls: number[] = [];
	const logger = getLogger();

	return {
		beforeSet(value, context) {
			const now = Date.now();
			
			// Remove old calls outside the window
			while (calls.length > 0 && calls[0] < now - windowMs) {
				calls.shift();
			}

			// Check rate limit
			if (calls.length >= maxCalls) {
				const error = new Error(
					`Rate limit exceeded: ${maxCalls} calls per ${windowMs}ms for ${context.characteristicName}`
				);
				logger.warn(
					{ characteristic: context.characteristicName, maxCalls, windowMs },
					'Rate limit exceeded'
				);
				throw error;
			}

			calls.push(now);
			return value;
		},
	};
}

/**
 * Value clamping interceptor to ensure values stay within bounds
 * 
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * 
 * @example
 * ```typescript
 * characteristic.intercept(createClampingInterceptor(0, 100));
 * ```
 */
export function createClampingInterceptor(min: number, max: number): Interceptor {
	return {
		beforeSet(value, context) {
			if (typeof value !== 'number') {
				return value;
			}

			const clamped = Math.max(min, Math.min(max, value));
			
			if (clamped !== value) {
				const logger = getLogger();
				logger.debug(
					{ characteristic: context.characteristicName, original: value, clamped },
					'Value clamped to range'
				);
			}

			return clamped;
		},
	};
}

/**
 * Debouncing interceptor to delay rapid updates
 * 
 * @param delayMs - Delay in milliseconds
 * 
 * @example
 * ```typescript
 * characteristic.intercept(createDebouncingInterceptor(500));
 * ```
 */
export function createDebouncingInterceptor(delayMs: number): Interceptor {
	let timeoutId: NodeJS.Timeout | null = null;
	let pendingValue: CharacteristicValue | null = null;

	return {
		beforeSet(value, context) {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			pendingValue = value;

			return new Promise((resolve) => {
				timeoutId = setTimeout(() => {
					resolve(pendingValue!);
					timeoutId = null;
					pendingValue = null;
				}, delayMs);
			});
		},
	};
}

/**
 * Transformation interceptor that applies a custom function to values
 * 
 * @param transform - Function to transform the value
 * 
 * @example
 * ```typescript
 * characteristic.intercept(
 *   createTransformInterceptor((v) => Math.round(v as number))
 * );
 * ```
 */
export function createTransformInterceptor(
	transform: (value: CharacteristicValue) => CharacteristicValue
): Interceptor {
	return {
		beforeSet(value, context) {
			return transform(value);
		},
	};
}

/**
 * Audit interceptor that tracks all changes to a characteristic
 * 
 * @param onAudit - Callback function to receive audit events
 * 
 * @example
 * ```typescript
 * characteristic.intercept(
 *   createAuditInterceptor((event) => {
 *     console.log('Audit:', event);
 *   })
 * );
 * ```
 */
export function createAuditInterceptor(
	onAudit: (event: {
		type: 'set' | 'get' | 'error';
		characteristic: string;
		value?: CharacteristicValue;
		error?: Error;
		timestamp: number;
	}) => void
): Interceptor {
	return {
		afterSet(value, context) {
			onAudit({
				type: 'set',
				characteristic: context.characteristicName,
				value,
				timestamp: context.timestamp,
			});
		},

		afterGet(value, context) {
			onAudit({
				type: 'get',
				characteristic: context.characteristicName,
				value: value,
				timestamp: context.timestamp,
			});
			return value;
		},

		onError(error, context) {
			onAudit({
				type: 'error',
				characteristic: context.characteristicName,
				error,
				timestamp: context.timestamp,
			});
		},
	};
}

/**
 * Composite interceptor that combines multiple interceptors
 * 
 * @param interceptors - Array of interceptors to combine
 * 
 * @example
 * ```typescript
 * characteristic.intercept(
 *   createCompositeInterceptor([
 *     createLoggingInterceptor(),
 *     createRateLimitInterceptor(5, 1000)
 *   ])
 * );
 * ```
 */
export function createCompositeInterceptor(interceptors: Interceptor[]): Interceptor {
	return {
		async beforeSet(value, context) {
			let currentValue = value;
			for (const interceptor of interceptors) {
				if (interceptor.beforeSet) {
					currentValue = await interceptor.beforeSet(currentValue, context);
				}
			}
			return currentValue;
		},

		async afterSet(value, context) {
			for (const interceptor of interceptors) {
				if (interceptor.afterSet) {
					await interceptor.afterSet(value, context);
				}
			}
		},

		async beforeGet(context) {
			for (const interceptor of interceptors) {
				if (interceptor.beforeGet) {
					await interceptor.beforeGet(context);
				}
			}
		},

		async afterGet(value, context) {
			let currentValue = value;
			for (const interceptor of interceptors) {
				if (interceptor.afterGet) {
					currentValue = await interceptor.afterGet(currentValue, context);
				}
			}
			return currentValue;
		},

		async onError(error, context) {
			for (const interceptor of interceptors) {
				if (interceptor.onError) {
					await interceptor.onError(error, context);
				}
			}
		},
	};
}

/**
 * Codec interceptor for two-way value transformation
 * 
 * Codecs transform values when setting (encode) and retrieving (decode).
 * This is useful for converting between different formats or units.
 * 
 * @param encode - Function to transform values when setting (to HAP format)
 * @param decode - Function to transform values when getting (from HAP format)
 * 
 * @example
 * ```typescript
 * // Convert between Celsius and Fahrenheit
 * characteristic.intercept(
 *   createCodecInterceptor(
 *     (celsius) => (celsius * 9/5) + 32,  // encode: C to F
 *     (fahrenheit) => (fahrenheit - 32) * 5/9  // decode: F to C
 *   )
 * );
 * 
 * // Convert between different string formats
 * characteristic.intercept(
 *   createCodecInterceptor(
 *     (value) => String(value).toUpperCase(),  // encode
 *     (value) => String(value).toLowerCase()   // decode
 *   )
 * );
 * 
 * // Convert complex objects to/from JSON
 * characteristic.intercept(
 *   createCodecInterceptor(
 *     (obj) => JSON.stringify(obj),  // encode
 *     (str) => JSON.parse(String(str))  // decode
 *   )
 * );
 * ```
 */
export function createCodecInterceptor(
	encode: (value: CharacteristicValue) => CharacteristicValue,
	decode: (value: CharacteristicValue) => CharacteristicValue
): Interceptor {
	const logger = getLogger();

	return {
		beforeSet(value, context) {
			const encoded = encode(value);
			logger.debug(
				{ characteristic: context.characteristicName, original: value, encoded },
				'[Codec] Encoded value for SET'
			);
			return encoded;
		},

		afterGet(value, context) {
			if (value === undefined) {
				return value;
			}
			const decoded = decode(value);
			logger.debug(
				{ characteristic: context.characteristicName, original: value, decoded },
				'[Codec] Decoded value for GET'
			);
			return decoded;
		},
	};
}
