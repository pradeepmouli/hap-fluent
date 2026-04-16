/**
 * Typed error hierarchy for HAP Fluent operations.
 *
 * @remarks
 * All errors extend `FluentError` which attaches a `context` object containing
 * machine-readable debugging fields (characteristic name, value, original error,
 * etc.). Use `instanceof` guards to branch on specific error types.
 *
 * @module errors
 */

/**
 * Base class for all HAP Fluent errors.
 *
 * @remarks
 * `FluentError` captures the current stack trace at construction time via
 * `Error.captureStackTrace`. It sets `this.name` to the concrete subclass name
 * so that `error.name` is always human-readable in logs.
 *
 * All `FluentError` subclasses carry an optional `context` record that you can
 * log directly for structured diagnostics:
 * ```typescript
 * logger.error({ err, ...err.context }, 'HAP operation failed');
 * ```
 *
 * @useWhen
 * - Catching all hap-fluent errors in a single `catch` block (catch `FluentError`
 *   then narrow with `instanceof` for specific handling).
 *
 * @avoidWhen
 * - Catching specific characteristic or service errors — use the subclasses
 *   {@link FluentCharacteristicError}, {@link FluentServiceError}, etc.
 *
 * @example
 * ```typescript
 * import { FluentError, FluentCharacteristicError } from 'hap-fluent';
 *
 * try {
 *   lightbulb.characteristics.brightness.set(200);
 * } catch (err) {
 *   if (err instanceof FluentCharacteristicError) {
 *     console.error('Characteristic error', err.context);
 *   } else if (err instanceof FluentError) {
 *     console.error('Generic fluent error', err.context);
 *   }
 * }
 * ```
 *
 * @category Errors
 */
export class FluentError extends Error {
  constructor(
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when a characteristic `get`, `set`, or `update` operation fails.
 *
 * @remarks
 * The `context` object contains:
 * - `characteristic` — display name of the failing characteristic.
 * - `value` — the value that was attempted (may be `undefined` for `get` failures).
 * - `originalError` — the underlying error from hap-nodejs, if any.
 *
 * @pitfalls
 * - NEVER swallow this error silently in a Homebridge plugin — hap-nodejs expects
 *   `onGet`/`onSet` handlers to either resolve or reject with an `HAPStatus` error
 *   code. If you catch and re-throw a plain `Error`, HomeKit receives a generic
 *   failure status and may mark the accessory as "Not Responding".
 *
 * @example
 * ```typescript
 * import { FluentCharacteristicError } from 'hap-fluent';
 *
 * lightbulb.characteristics.brightness.onSet(async (value) => {
 *   try {
 *     await device.setBrightness(value);
 *   } catch (err) {
 *     throw new FluentCharacteristicError('Device unreachable', {
 *       characteristic: 'Brightness',
 *       value,
 *       originalError: err
 *     });
 *   }
 * });
 * ```
 *
 * @category Errors
 */
export class FluentCharacteristicError extends FluentError {
  constructor(
    message: string,
    context?: {
      characteristic?: string;
      value?: unknown;
      originalError?: unknown;
    }
  ) {
    super(message, context);
  }
}

/**
 * Error thrown when a service-level operation fails (e.g., wrapping an invalid service).
 *
 * @remarks
 * The `context` object contains:
 * - `service` — display name of the service.
 * - `uuid` — HAP UUID of the service.
 * - `originalError` — the underlying error, if any.
 *
 * @category Errors
 */
export class FluentServiceError extends FluentError {
  constructor(
    message: string,
    context?: {
      service?: string;
      uuid?: string;
      originalError?: unknown;
    }
  ) {
    super(message, context);
  }
}

/**
 * Error thrown when input validation fails (e.g., an invalid service or
 * characteristic value is passed to a hap-fluent function).
 *
 * @remarks
 * The `context` object contains:
 * - `value` — the offending value.
 * - `expected` — description of the expected type/shape.
 * - `actual` — description of what was actually received.
 *
 * @example
 * ```typescript
 * import { ValidationError } from 'hap-fluent';
 *
 * try {
 *   wrapService(null as any);
 * } catch (err) {
 *   if (err instanceof ValidationError) {
 *     console.error('Invalid service:', err.context);
 *   }
 * }
 * ```
 *
 * @category Errors
 */
export class ValidationError extends FluentError {
  constructor(
    message: string,
    context?: {
      value?: unknown;
      expected?: string;
      actual?: string;
    }
  ) {
    super(message, context);
  }
}

/**
 * Error thrown when logger or plugin configuration is invalid or incomplete.
 *
 * @remarks
 * The `context` object contains:
 * - `setting` — the name of the configuration key that is invalid.
 * - `value` — the value that was provided.
 *
 * @category Errors
 */
export class ConfigurationError extends FluentError {
  constructor(
    message: string,
    context?: {
      setting?: string;
      value?: unknown;
    }
  ) {
    super(message, context);
  }
}
