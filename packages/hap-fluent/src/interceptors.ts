/**
 * Interceptor pipeline for HAP characteristic GET/SET operations.
 *
 * @remarks
 * Interceptors allow you to add cross-cutting concerns (logging, rate limiting,
 * value transformation, codec translation, audit trails) to characteristic
 * handlers without modifying your handler logic. They are composed into a
 * pipeline that executes in registration order around each `onGet`/`onSet`
 * call.
 *
 * Interceptors are attached to a {@link FluentCharacteristic} via its fluent
 * methods (`.log()`, `.limit()`, `.clamp()`, `.transform()`, `.codec()`,
 * `.audit()`). You can also compose multiple interceptors with
 * {@link createCompositeInterceptor} for reuse across characteristics.
 *
 * **Execution order for SET:**
 * `beforeSet (interceptor 1..N)` → `handler()` → `afterSet (interceptor 1..N)`
 *
 * **Execution order for GET:**
 * `beforeGet (interceptor 1..N)` → `handler()` → `afterGet (interceptor 1..N)`
 *
 * @module interceptors
 */

import type { CharacteristicValue } from 'homebridge';
import { getLogger } from './logger.js';

/**
 * Context object passed to every interceptor lifecycle hook.
 *
 * @remarks
 * Interceptors receive a shared `InterceptorContext` for each operation.
 * The `value` field is populated by `beforeSet` / `afterGet` hooks and is
 * `undefined` for `beforeGet` / `afterSet` initial invocations.
 *
 * @category Interceptors
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
 * Interface for a single-characteristic operation interceptor.
 *
 * @remarks
 * Implement this interface to create a custom interceptor. All lifecycle
 * hooks are optional — implement only the hooks relevant to your use case.
 *
 * Interceptors are synchronous or async (returning a `Promise`). hap-fluent
 * `await`s each hook before proceeding to the next interceptor in the chain.
 *
 * @useWhen
 * - You need custom pre/post processing not covered by built-in interceptors.
 * - You are building a reusable interceptor library for your plugin.
 *
 * @avoidWhen
 * - You only need logging, rate-limiting, or clamping — use the built-in
 *   factory functions ({@link createLoggingInterceptor}, etc.) instead.
 *
 * @pitfalls
 * - NEVER throw inside `afterSet` or `afterGet` without catching — uncaught
 *   errors in post-operation hooks are caught by the `onError` hook, but if
 *   `onError` is also missing, the error propagates to hap-nodejs which logs
 *   it as an unhandled rejection.
 * - NEVER perform slow I/O in `beforeSet` without applying a `.limit()` rate
 *   limiter — iOS polls characteristics every 1-5 seconds for active tiles,
 *   so a slow `beforeSet` will cause cascading HomeKit timeouts.
 *
 * @category Interceptors
 */
export interface Interceptor {
  /**
   * Called before a value is set
   *
   * @param value - Value about to be set
   * @param context - Operation context
   * @returns Modified value or original value
   */
  beforeSet?(
    value: CharacteristicValue,
    context: InterceptorContext
  ): CharacteristicValue | Promise<CharacteristicValue>;

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
  afterGet?(
    value: CharacteristicValue | undefined,
    context: InterceptorContext
  ): CharacteristicValue | undefined | Promise<CharacteristicValue | undefined>;

  /**
   * Called when an error occurs during set/get
   *
   * @param error - The error that occurred
   * @param context - Operation context
   */
  onError?(error: Error, context: InterceptorContext): void | Promise<void>;
}

/**
 * Create an {@link Interceptor} that logs all characteristic operations via
 * the hap-fluent Pino logger at `debug` level.
 *
 * @remarks
 * Logs `beforeSet`, `afterSet`, `beforeGet`, `afterGet`, and `onError` hooks.
 * Equivalent to calling `.log()` on a {@link FluentCharacteristic}.
 *
 * @returns A logging `Interceptor` instance.
 *
 * @example
 * ```typescript
 * characteristic.intercept(createLoggingInterceptor());
 * // or via fluent API:
 * characteristic.log().onSet(handler);
 * ```
 *
 * @category Interceptors
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
      logger.debug({ characteristic: context.characteristicName }, '[Interceptor] Before get');
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
    }
  };
}

/**
 * Create an {@link Interceptor} that enforces a sliding-window rate limit on
 * `beforeSet` calls, throwing when the limit is exceeded.
 *
 * @remarks
 * Uses a simple timestamp array to track calls within the rolling `windowMs`
 * interval. When `maxCalls` is exceeded, the interceptor throws synchronously
 * inside `beforeSet`, which propagates as an `HAPStatus` error to HomeKit.
 *
 * Equivalent to calling `.limit(maxCalls, windowMs)` on a
 * {@link FluentCharacteristic}.
 *
 * @param maxCalls - Maximum number of SET calls allowed within `windowMs`.
 * @param windowMs - Sliding window size in milliseconds.
 * @returns A rate-limiting `Interceptor` instance.
 *
 * @pitfalls
 * - NEVER share a single rate-limiter interceptor instance across multiple
 *   characteristics — the call counter is shared, so one busy characteristic
 *   will block others. Create a separate instance per characteristic.
 *
 * @example
 * ```typescript
 * characteristic.intercept(createRateLimitInterceptor(5, 1000));
 * // or via fluent API:
 * characteristic.limit(5, 1000).onSet(handler);
 * ```
 *
 * @category Interceptors
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
    }
  };
}

/**
 * Create an {@link Interceptor} that clamps numeric characteristic values to
 * `[min, max]` in `beforeSet`, leaving non-numeric values unchanged.
 *
 * @remarks
 * This is the underlying implementation of `.clamp()` on
 * {@link FluentCharacteristic}. Use it when building composite interceptors or
 * when you want explicit control over ordering.
 *
 * @param min - Minimum numeric value (inclusive).
 * @param max - Maximum numeric value (inclusive).
 * @returns A clamping `Interceptor` instance.
 *
 * @pitfalls
 * - NEVER use clamping as a substitute for proper HAP characteristic range
 *   configuration (`setProps({ minValue, maxValue })`). iOS uses the declared
 *   HAP range to render the control UI; if the UI allows 0–255 but you clamp
 *   to 0–100, the slider will appear broken to the user.
 *
 * @example
 * ```typescript
 * characteristic.intercept(createClampingInterceptor(0, 100));
 * // or via fluent API:
 * characteristic.clamp(0, 100).onSet(handler);
 * ```
 *
 * @category Interceptors
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
    }
  };
}

/**
 * Create an {@link Interceptor} that debounces rapid `beforeSet` calls by
 * delaying execution until `delayMs` milliseconds of inactivity.
 *
 * @remarks
 * Only the last value received within a burst is forwarded to the handler;
 * intermediate values are discarded. This is useful for characteristics like
 * `Hue` or `Saturation` where the iOS color wheel generates rapid updates.
 *
 * **Note:** The `beforeSet` hook returns a `Promise` that resolves after the
 * debounce delay. hap-nodejs will hold the HomeKit response open until the
 * promise resolves, so keep `delayMs` well under the HomeKit 5-second timeout.
 *
 * @param delayMs - Debounce delay in milliseconds.
 * @returns A debouncing `Interceptor` instance.
 *
 * @pitfalls
 * - NEVER use `delayMs > 4000` — HomeKit enforces a 5-second handler timeout;
 *   exceeding it causes the iOS controller to retry and can create rapid
 *   duplicate SET calls that compound debounce delays.
 *
 * @example
 * ```typescript
 * // Debounce rapid color changes from iOS color wheel
 * characteristic.intercept(createDebouncingInterceptor(200));
 * ```
 *
 * @category Interceptors
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
    }
  };
}

/**
 * Create an {@link Interceptor} that applies a custom synchronous transform
 * function to the value in `beforeSet`.
 *
 * @remarks
 * Use when you need a one-way value transformation that doesn't fit the
 * encode/decode pattern of {@link createCodecInterceptor}. For two-way
 * transformation (e.g., unit conversion), prefer `createCodecInterceptor`.
 *
 * @param transform - Function that receives the incoming value and returns
 *   the transformed value to pass to the handler.
 * @returns A transform `Interceptor` instance.
 *
 * @example
 * ```typescript
 * characteristic.intercept(
 *   createTransformInterceptor((v) => Math.round(v as number))
 * );
 * // or via fluent API:
 * characteristic.transform((v) => Math.round(v as number)).onSet(handler);
 * ```
 *
 * @category Interceptors
 */
export function createTransformInterceptor(
  transform: (value: CharacteristicValue) => CharacteristicValue
): Interceptor {
  return {
    beforeSet(value, context) {
      return transform(value);
    }
  };
}

/**
 * Create an {@link Interceptor} that calls a callback with a structured audit
 * event after every `set`, `get`, or `error` operation.
 *
 * @remarks
 * Unlike the inline `.audit()` method on `FluentCharacteristic` (which logs to
 * Pino), this factory lets you route audit events to any destination
 * (database, metrics system, external audit service).
 *
 * @param onAudit - Callback receiving an audit event object with `type`,
 *   `characteristic`, `value` (optional), `error` (optional), and `timestamp`.
 * @returns An audit `Interceptor` instance.
 *
 * @example
 * ```typescript
 * characteristic.intercept(
 *   createAuditInterceptor((event) => {
 *     metricsClient.record('characteristic.operation', event);
 *   })
 * );
 * ```
 *
 * @category Interceptors
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
        timestamp: context.timestamp
      });
    },

    afterGet(value, context) {
      onAudit({
        type: 'get',
        characteristic: context.characteristicName,
        value: value,
        timestamp: context.timestamp
      });
      return value;
    },

    onError(error, context) {
      onAudit({
        type: 'error',
        characteristic: context.characteristicName,
        error,
        timestamp: context.timestamp
      });
    }
  };
}

/**
 * Combine multiple {@link Interceptor} instances into a single interceptor
 * that executes them in order.
 *
 * @remarks
 * Each lifecycle hook runs all provided interceptors in array order, awaiting
 * each before calling the next. This preserves value transformations across
 * the chain (each `beforeSet` receives the value returned by the previous one).
 *
 * @param interceptors - Ordered array of interceptors to compose.
 * @returns A single composite `Interceptor` that delegates to all provided interceptors.
 *
 * @useWhen
 * - You want to apply a standard set of interceptors (e.g., log + clamp + rate-limit)
 *   to multiple characteristics without repeating the chain setup.
 *
 * @example
 * ```typescript
 * const standard = createCompositeInterceptor([
 *   createLoggingInterceptor(),
 *   createRateLimitInterceptor(5, 1000),
 *   createClampingInterceptor(0, 100)
 * ]);
 *
 * brightnessChar.intercept(standard);
 * saturationChar.intercept(standard); // same pipeline, separate instances
 * ```
 *
 * @category Interceptors
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
    }
  };
}

/**
 * Create an {@link Interceptor} for symmetric two-way value transformation
 * (encode on SET, decode on GET).
 *
 * @remarks
 * Codecs transform values when setting (encode: plugin value → HAP value)
 * and when retrieving (decode: HAP value → plugin value). This is useful for
 * unit conversion (Celsius ↔ Fahrenheit), format normalization, or wrapping
 * complex objects as JSON strings for TLV8 characteristics.
 *
 * Equivalent to calling `.codec(encode, decode)` on a
 * {@link FluentCharacteristic}.
 *
 * @param encode - Transform applied in `beforeSet` (incoming value → HAP format).
 * @param decode - Transform applied in `afterGet` (HAP value → plugin format).
 * @returns A codec `Interceptor` instance.
 *
 * @pitfalls
 * - NEVER use a lossy codec (e.g., rounding) in `decode` without also applying
 *   the inverse in `encode` — round-trip encoding errors accumulate and cause
 *   the Home app to show stale values.
 *
 * @example
 * ```typescript
 * // Convert between Celsius (plugin) and Fahrenheit (HAP)
 * characteristic.intercept(
 *   createCodecInterceptor(
 *     (celsius) => (celsius as number) * 9/5 + 32,    // encode: C → F
 *     (fahrenheit) => ((fahrenheit as number) - 32) * 5/9  // decode: F → C
 *   )
 * );
 * // or via fluent API:
 * characteristic.codec(
 *   (c) => (c as number) * 9/5 + 32,
 *   (f) => ((f as number) - 32) * 5/9
 * ).onGet(async () => currentCelsius);
 * ```
 *
 * @category Interceptors
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
    }
  };
}
