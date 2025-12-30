import {
  type Characteristic,
  type CharacteristicValue,
  type CharacteristicSetHandler,
  type CharacteristicProps,
  type PartialAllowingNull,
} from "homebridge";
import { FluentCharacteristicError } from "./errors.js";
import { isCharacteristicValue } from "./type-guards.js";
import { getLogger } from "./logger.js";
import type { Interceptor, InterceptorContext } from "./interceptors.js";

/**
 * FluentCharacteristic wraps a HAP characteristic with strong typing and fluent API
 */
export class FluentCharacteristic<T extends CharacteristicValue> {
  private interceptors: Interceptor[] = [];

  /**
   * @param characteristic - HAP characteristic to wrap.
   */
  constructor(private characteristic: Characteristic) {}

  /**
   * Update the characteristic's metadata properties.
   *
   * @param props - Partial characteristic properties to apply.
   * @returns This FluentCharacteristic instance for chaining.
   */
  setProps(props: PartialAllowingNull<CharacteristicProps>): this {
    this.characteristic.setProps(props);
    return this;
  }

  /**
   * Get the current characteristic value.
   *
   * @returns The current characteristic value, or undefined if not set.
   */
  get(): T | undefined {
    const logger = getLogger();
    const value = this.characteristic.value as T | undefined;
    logger.debug(
      { characteristic: this.characteristic.displayName, value },
      "Retrieved characteristic value",
    );
    return value;
  }

  /**
   * Set the characteristic value.
   *
   * @param value - New value to set.
   * @returns This FluentCharacteristic instance for chaining.
   * @throws {FluentCharacteristicError} If value is invalid or setValue fails
   *
   * @remarks
   * This method is for direct programmatic value setting. Interceptors
   * are applied in onSet handlers, which are triggered when HomeKit accesses the characteristic.
   */
  set(value: T): this {
    const logger = getLogger();
    logger.debug(
      { characteristic: this.characteristic.displayName, value },
      "Setting characteristic value",
    );

    try {
      if (!isCharacteristicValue(value)) {
        logger.warn(
          { characteristic: this.characteristic.displayName, value },
          "Invalid characteristic value",
        );
        throw new FluentCharacteristicError("Invalid characteristic value", {
          characteristic: this.characteristic.displayName,
          value,
        });
      }

      this.characteristic.setValue(value);
      logger.debug(
        { characteristic: this.characteristic.displayName, value },
        "Successfully set characteristic value",
      );
      return this;
    } catch (error) {
      if (error instanceof FluentCharacteristicError) {
        throw error;
      }
      logger.error(
        { characteristic: this.characteristic.displayName, value, error },
        "Failed to set characteristic value",
      );
      throw new FluentCharacteristicError("Failed to set characteristic value", {
        characteristic: this.characteristic.displayName,
        value,
        originalError: error,
      });
    }
  }

  /**
   * Update the characteristic value without calling SET handlers.
   *
   * @param value - New value to apply.
   * @returns This FluentCharacteristic instance for chaining.
   * @throws {FluentCharacteristicError} If value is invalid or updateValue fails
   */
  update(value: T): this {
    const logger = getLogger();
    logger.debug(
      { characteristic: this.characteristic.displayName, value },
      "Updating characteristic value",
    );
    try {
      if (!isCharacteristicValue(value)) {
        logger.warn(
          { characteristic: this.characteristic.displayName, value },
          "Invalid characteristic value",
        );
        throw new FluentCharacteristicError("Invalid characteristic value", {
          characteristic: this.characteristic.displayName,
          value,
        });
      }
      this.characteristic.updateValue(value);
      logger.debug(
        { characteristic: this.characteristic.displayName, value },
        "Successfully updated characteristic value",
      );
      return this;
    } catch (error) {
      if (error instanceof FluentCharacteristicError) {
        throw error;
      }
      logger.error(
        { characteristic: this.characteristic.displayName, value, error },
        "Failed to update characteristic value",
      );
      throw new FluentCharacteristicError("Failed to update characteristic value", {
        characteristic: this.characteristic.displayName,
        value,
        originalError: error,
      });
    }
  }

  /**
   * Register an async getter for the characteristic.
   *
   * @param handler - Async getter returning the current value.
   * @returns This FluentCharacteristic instance for chaining.
   */
  onGet(handler: () => Promise<T>): this {
    // Wrap the handler with interceptors
    const wrappedHandler = async (): Promise<T> => {
      const logger = getLogger();

      try {
        // Run beforeGet interceptors
        if (this.interceptors.length > 0) {
          await this.runBeforeGetInterceptors();
        }

        // Call the original handler
        let value = await handler();

        // Run afterGet interceptors
        if (this.interceptors.length > 0) {
          value = (await this.runAfterGetInterceptors(value)) as T;
        }

        logger.debug(
          { characteristic: this.characteristic.displayName, value },
          "onGet handler completed with interceptors",
        );

        return value;
      } catch (error) {
        // Run error interceptors
        if (this.interceptors.length > 0 && error instanceof Error) {
          await this.runErrorInterceptors(error);
        }
        throw error;
      }
    };

    this.characteristic.onGet(wrappedHandler);
    return this;
  }

  /**
   * Register an async setter for the characteristic.
   *
   * @param handler - Async setter receiving the new value.
   * @returns This FluentCharacteristic instance for chaining.
   */
  onSet(handler: (value: T) => Promise<void>): this {
    // Wrap the handler with interceptors
    const wrappedHandler = async (value: T): Promise<void> => {
      const logger = getLogger();

      try {
        logger.debug(
          { characteristic: this.characteristic.displayName, value },
          "onSet handler called",
        );

        // Run beforeSet interceptors
        if (this.interceptors.length > 0) {
          value = (await this.runBeforeSetInterceptors(value)) as T;
        }

        // Call the original handler
        await handler(value);

        // Run afterSet interceptors
        if (this.interceptors.length > 0) {
          await this.runAfterSetInterceptors(value);
        }

        logger.debug(
          { characteristic: this.characteristic.displayName, value },
          "onSet handler completed with interceptors",
        );
      } catch (error) {
        // Run error interceptors
        if (this.interceptors.length > 0 && error instanceof Error) {
          await this.runErrorInterceptors(error);
        }

        if (error instanceof FluentCharacteristicError) {
          throw error;
        }

        logger.error(
          { characteristic: this.characteristic.displayName, value, error },
          "onSet handler failed",
        );
        throw new FluentCharacteristicError("onSet handler failed", {
          characteristic: this.characteristic.displayName,
          value,
          originalError: error,
        });
      }
    };

    this.characteristic.onSet(wrappedHandler as unknown as CharacteristicSetHandler);
    return this;
  }

  /**
   * Add logging interceptor that logs all operations (beforeSet, afterSet, beforeGet, afterGet, errors).
   *
   * @returns This FluentCharacteristic instance for chaining
   *
   * @example
   * ```typescript
   * characteristic.log().onSet(async (value) => {
   *   console.log('Value from HomeKit:', value);
   * });
   * ```
   */
  log(): this {
    const logger = getLogger();

    this.interceptors.push({
      beforeSet(value, context) {
        logger.debug({ characteristic: context.characteristicName, value }, "[Log] Before set");
        return value;
      },
      afterSet(value, context) {
        logger.debug({ characteristic: context.characteristicName, value }, "[Log] After set");
      },
      beforeGet(context) {
        logger.debug({ characteristic: context.characteristicName }, "[Log] Before get");
      },
      afterGet(value, context) {
        logger.debug({ characteristic: context.characteristicName, value }, "[Log] After get");
        return value;
      },
      onError(error, context) {
        logger.error({ characteristic: context.characteristicName, error }, "[Log] Error occurred");
      },
    });
    return this;
  }

  /**
   * Add rate limiting interceptor to prevent excessive updates.
   *
   * @param maxCalls - Maximum number of calls allowed
   * @param windowMs - Time window in milliseconds
   * @returns This FluentCharacteristic instance for chaining
   *
   * @example
   * ```typescript
   * characteristic.limit(5, 1000).onSet(handler); // Max 5 calls per second
   * ```
   */
  limit(maxCalls: number, windowMs: number): this {
    const calls: number[] = [];
    const logger = getLogger();

    this.interceptors.push({
      beforeSet(value, context) {
        const now = Date.now();

        // Remove old calls outside the window
        while (calls.length > 0 && calls[0] < now - windowMs) {
          calls.shift();
        }

        // Check rate limit
        if (calls.length >= maxCalls) {
          const error = new Error(
            `Rate limit exceeded: ${maxCalls} calls per ${windowMs}ms for ${context.characteristicName}`,
          );
          logger.warn(
            { characteristic: context.characteristicName, maxCalls, windowMs },
            "Rate limit exceeded",
          );
          throw error;
        }

        calls.push(now);
        return value;
      },
    });
    return this;
  }

  /**
   * Add value clamping interceptor to ensure numeric values stay within bounds.
   *
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns This FluentCharacteristic instance for chaining
   *
   * @example
   * ```typescript
   * characteristic.clamp(0, 100).onSet(handler); // Ensures value is 0-100
   * ```
   */
  clamp(min: number, max: number): this {
    const logger = getLogger();

    this.interceptors.push({
      beforeSet(value, context) {
        if (typeof value !== "number") {
          return value;
        }

        const clamped = Math.max(min, Math.min(max, value));

        if (clamped !== value) {
          logger.debug(
            { characteristic: context.characteristicName, original: value, clamped },
            "Value clamped to range",
          );
        }

        return clamped;
      },
    });
    return this;
  }

  /**
   * Add value transformation interceptor that applies a custom function.
   *
   * @param transformFn - Function to transform the value
   * @returns This FluentCharacteristic instance for chaining
   *
   * @example
   * ```typescript
   * characteristic.transform(v => Math.round(v as number)).onSet(handler);
   * ```
   */
  transform(transformFn: (value: CharacteristicValue) => CharacteristicValue): this {
    this.interceptors.push({
      beforeSet(value, _context) {
        return transformFn(value);
      },
    });
    return this;
  }

  /**
   * Add audit trail interceptor that tracks all operations.
   *
   * @returns This FluentCharacteristic instance for chaining
   *
   * @example
   * ```typescript
   * characteristic.audit().onSet(handler); // Logs audit trail
   * ```
   */
  audit(): this {
    const logger = getLogger();
    const auditTrail: Array<{ operation: string; value?: CharacteristicValue; timestamp: number }> =
      [];

    this.interceptors.push({
      beforeSet(value, context) {
        auditTrail.push({
          operation: "set",
          value,
          timestamp: context.timestamp,
        });
        logger.info(
          { characteristic: context.characteristicName, value, auditCount: auditTrail.length },
          "[Audit] SET operation",
        );
        return value;
      },
      beforeGet(context) {
        auditTrail.push({
          operation: "get",
          timestamp: context.timestamp,
        });
        logger.info(
          { characteristic: context.characteristicName, auditCount: auditTrail.length },
          "[Audit] GET operation",
        );
      },
    });
    return this;
  }

  /**
   * Add a codec interceptor for two-way value transformation.
   *
   * Codecs allow you to transform values when setting (encode) and retrieving (decode).
   * This is useful for converting between different formats or units.
   *
   * @param encode - Function to transform values when setting (to HAP format)
   * @param decode - Function to transform values when getting (from HAP format)
   * @returns This FluentCharacteristic instance for chaining
   *
   * @example
   * ```typescript
   * // Convert between Celsius and Fahrenheit
   * characteristic.codec(
   *   (celsius) => (celsius * 9/5) + 32,  // encode: C to F
   *   (fahrenheit) => (fahrenheit - 32) * 5/9  // decode: F to C
   * ).onSet(async (fahrenheit) => {
   *   console.log('Temperature in F:', fahrenheit);
   * });
   *
   * // Convert between different string formats
   * characteristic.codec(
   *   (value) => String(value).toUpperCase(),  // encode
   *   (value) => String(value).toLowerCase()   // decode
   * );
   *
   * // Convert complex objects to/from JSON
   * characteristic.codec(
   *   (obj) => JSON.stringify(obj),  // encode
   *   (str) => JSON.parse(String(str))  // decode
   * );
   * ```
   */
  codec(
    encode: (value: CharacteristicValue) => CharacteristicValue,
    decode: (value: CharacteristicValue) => CharacteristicValue,
  ): this {
    this.interceptors.push({
      beforeSet(value, context) {
        const encoded = encode(value);
        const logger = getLogger();
        logger.debug(
          { characteristic: context.characteristicName, original: value, encoded },
          "[Codec] Encoded value for SET",
        );
        return encoded;
      },
      afterGet(value, context) {
        if (value === undefined) {
          return value;
        }
        const decoded = decode(value);
        const logger = getLogger();
        logger.debug(
          { characteristic: context.characteristicName, original: value, decoded },
          "[Codec] Decoded value for GET",
        );
        return decoded;
      },
    });
    return this;
  }

  /**
   * Remove all interceptors from this characteristic.
   *
   * @returns This FluentCharacteristic instance for chaining
   */
  clearInterceptors(): this {
    this.interceptors = [];
    return this;
  }

  /**
   * Create interceptor context for the current operation
   *
   * @param value - Optional value for the context
   * @returns Interceptor context
   * @private
   */
  private createInterceptorContext(value?: CharacteristicValue): InterceptorContext {
    return {
      characteristicName: this.characteristic.displayName,
      value,
      timestamp: Date.now(),
    };
  }

  /**
   * Run beforeSet interceptors
   *
   * @param value - Value to be set
   * @returns Modified value
   * @private
   */
  private async runBeforeSetInterceptors(value: CharacteristicValue): Promise<CharacteristicValue> {
    let currentValue = value;
    const context = this.createInterceptorContext(value);

    for (const interceptor of this.interceptors) {
      if (interceptor.beforeSet) {
        currentValue = await interceptor.beforeSet(currentValue, context);
        context.value = currentValue;
      }
    }

    return currentValue;
  }

  /**
   * Run afterSet interceptors
   *
   * @param value - Value that was set
   * @private
   */
  private async runAfterSetInterceptors(value: CharacteristicValue): Promise<void> {
    const context = this.createInterceptorContext(value);

    for (const interceptor of this.interceptors) {
      if (interceptor.afterSet) {
        await interceptor.afterSet(value, context);
      }
    }
  }

  /**
   * Run beforeGet interceptors
   *
   * @private
   */
  private async runBeforeGetInterceptors(): Promise<void> {
    const context = this.createInterceptorContext();

    for (const interceptor of this.interceptors) {
      if (interceptor.beforeGet) {
        await interceptor.beforeGet(context);
      }
    }
  }

  /**
   * Run afterGet interceptors
   *
   * @param value - Value that was retrieved
   * @returns Modified value
   * @private
   */
  private async runAfterGetInterceptors(
    value: CharacteristicValue | undefined,
  ): Promise<CharacteristicValue | undefined> {
    let currentValue = value;
    const context = this.createInterceptorContext(value);

    for (const interceptor of this.interceptors) {
      if (interceptor.afterGet) {
        currentValue = await interceptor.afterGet(currentValue, context);
        context.value = currentValue;
      }
    }

    return currentValue;
  }

  /**
   * Run error interceptors
   *
   * @param error - Error that occurred
   * @private
   */
  private async runErrorInterceptors(error: Error): Promise<void> {
    const context = this.createInterceptorContext();

    for (const interceptor of this.interceptors) {
      if (interceptor.onError) {
        await interceptor.onError(error, context);
      }
    }
  }
}
