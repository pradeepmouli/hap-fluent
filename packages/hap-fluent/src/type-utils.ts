/**
 * Compile-time type helpers and runtime value utilities for HAP Fluent.
 *
 * @remarks
 * This module exports TypeScript utility types for extracting characteristic
 * names and value types from service types, plus runtime transformer and
 * predicate factories for characteristic value manipulation.
 *
 * Import selectively — all exports are tree-shakeable.
 */

import type { CharacteristicValue } from 'hap-nodejs';
import type { FluentCharacteristic } from './FluentCharacteristic.js';

/**
 * Extract the camelCase characteristic name union from a `FluentService` type.
 *
 * @remarks
 * Useful when you need to constrain a key parameter to valid characteristic
 * names for a specific service type, or when generating type-safe state objects.
 *
 * @typeParam T - A `FluentService` type or any object with a `characteristics` property.
 *
 * @example
 * ```typescript
 * type LightbulbChars = CharacteristicNames<FluentService<typeof hap.Service.Lightbulb>>;
 * // Result: 'on' | 'brightness' | 'hue' | 'saturation' | ...
 * ```
 *
 * @category TypeUtils
 */
export type CharacteristicNames<T> = T extends { characteristics: infer C }
  ? C extends Record<string, unknown>
    ? keyof C
    : never
  : never;

/**
 * Extract the `FluentCharacteristic<T>` type for a named characteristic on a service.
 *
 * @typeParam TService - A `FluentService` type.
 * @typeParam TCharName - The camelCase characteristic name string.
 *
 * @example
 * ```typescript
 * type OnChar = CharacteristicType<FluentService<typeof hap.Service.Lightbulb>, 'on'>;
 * // Result: FluentCharacteristic<boolean>
 * ```
 *
 * @category TypeUtils
 */
export type CharacteristicType<TService, TCharName extends string> = TService extends {
  characteristics: infer C;
}
  ? C extends Record<TCharName, infer Char>
    ? Char
    : never
  : never;

/**
 * A flat record mapping characteristic names to their current HAP values.
 *
 * @remarks
 * Used for bulk state snapshots and type-safe state passing. Keys should be
 * camelCase characteristic names matching `CharacteristicNames<T>`.
 *
 * @example
 * ```typescript
 * const lightState: ServiceState = {
 *   on: true,
 *   brightness: 75,
 *   hue: 120,
 *   saturation: 50
 * };
 * ```
 *
 * @category TypeUtils
 */
export type ServiceState = Record<string, CharacteristicValue>;

/**
 * A partial {@link ServiceState} for incremental characteristic updates.
 *
 * @example
 * ```typescript
 * const update: PartialServiceState = {
 *   on: true,
 *   brightness: 100
 * };
 * ```
 *
 * @category TypeUtils
 */
export type PartialServiceState = Partial<ServiceState>;

/**
 * Determine whether `value` is a {@link FluentCharacteristic} instance.
 *
 * @remarks
 * Uses duck-typing to check for `set` and `get` methods, matching the
 * `FluentCharacteristic` public API without requiring an `instanceof` check.
 *
 * @param value - Value to test.
 * @returns `true` if `value` has `set` and `get` functions (duck-type match).
 *
 * @example
 * ```typescript
 * if (isFluentCharacteristic(obj)) {
 *   obj.set(true);
 * }
 * ```
 *
 * @category TypeUtils
 */
export function isFluentCharacteristic(
  value: unknown
): value is FluentCharacteristic<CharacteristicValue> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'characteristic' in value &&
    typeof (value as Record<string, unknown>).set === 'function' &&
    typeof (value as Record<string, unknown>).get === 'function'
  );
}

/**
 * Make a subset of properties on `T` required while leaving others unchanged.
 *
 * @typeParam T - Source type.
 * @typeParam K - Keys to make required.
 *
 * @example
 * ```typescript
 * type Config = { host?: string; port?: number; timeout?: number };
 * type RequiredConfig = RequireProperties<Config, 'host' | 'port'>;
 * // Result: { host: string; port: number; timeout?: number }
 * ```
 *
 * @category TypeUtils
 */
export type RequireProperties<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make a subset of properties on `T` optional while leaving others unchanged.
 *
 * @typeParam T - Source type.
 * @typeParam K - Keys to make optional.
 *
 * @example
 * ```typescript
 * type Config = { host: string; port: number; timeout: number };
 * type PartialConfig = OptionalProperties<Config, 'timeout'>;
 * // Result: { host: string; port: number; timeout?: number }
 * ```
 *
 * @category TypeUtils
 */
export type OptionalProperties<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * A function that transforms a characteristic value from one type/shape to another.
 *
 * @typeParam TInput - Input value type.
 * @typeParam TOutput - Output value type.
 *
 * @example
 * ```typescript
 * const percentToDecimal: ValueTransformer<number, number> = (value) => value / 100;
 * ```
 *
 * @category TypeUtils
 */
export type ValueTransformer<TInput = CharacteristicValue, TOutput = CharacteristicValue> = (
  value: TInput
) => TOutput;

/**
 * A predicate function for characteristic values.
 *
 * @typeParam T - Value type to test.
 *
 * @example
 * ```typescript
 * const isValidBrightness: ValuePredicate<number> = (value) =>
 *   typeof value === 'number' && value >= 0 && value <= 100;
 * ```
 *
 * @category TypeUtils
 */
export type ValuePredicate<T = CharacteristicValue> = (value: T) => boolean;

/**
 * Create a {@link ValueTransformer} that clamps a numeric value to `[min, max]`.
 *
 * @param min - Minimum allowed value (inclusive).
 * @param max - Maximum allowed value (inclusive).
 * @returns A transformer function that returns `Math.max(min, Math.min(max, value))`.
 *
 * @example
 * ```typescript
 * const clampBrightness = createClampTransformer(0, 100);
 * clampBrightness(150); // Returns 100
 * clampBrightness(-10); // Returns 0
 * clampBrightness(75);  // Returns 75
 * ```
 *
 * @category TypeUtils
 */
export function createClampTransformer(min: number, max: number): ValueTransformer<number, number> {
  return (value: number): number => Math.max(min, Math.min(max, value));
}

/**
 * Create a {@link ValueTransformer} that linearly maps a value from one numeric
 * range to another.
 *
 * @param fromMin - Source range minimum.
 * @param fromMax - Source range maximum.
 * @param toMin - Target range minimum.
 * @param toMax - Target range maximum.
 * @returns A transformer function applying the linear mapping.
 *
 * @example
 * ```typescript
 * // Convert percentage (0-100) to decimal (0-1)
 * const percentToDecimal = createScaleTransformer(0, 100, 0, 1);
 * percentToDecimal(50); // Returns 0.5
 *
 * // Convert Homebridge 0-100 brightness to device 0-255 range
 * const brightnessToDevice = createScaleTransformer(0, 100, 0, 255);
 * brightnessToDevice(50); // Returns 127.5
 * ```
 *
 * @category TypeUtils
 */
export function createScaleTransformer(
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
): ValueTransformer<number, number> {
  return (value: number): number => {
    const normalized = (value - fromMin) / (fromMax - fromMin);
    return toMin + normalized * (toMax - toMin);
  };
}

/**
 * Create a {@link ValuePredicate} that validates whether a number falls
 * within `[min, max]`.
 *
 * @param min - Minimum value.
 * @param max - Maximum value.
 * @param inclusive - When `true` (default), the bounds are inclusive.
 * @returns A predicate returning `true` if the value is within range.
 *
 * @example
 * ```typescript
 * const isValidHue = createRangePredicate(0, 360);
 * isValidHue(180); // Returns true
 * isValidHue(400); // Returns false
 * isValidHue(0);   // Returns true (inclusive)
 * ```
 *
 * @category TypeUtils
 */
export function createRangePredicate(
  min: number,
  max: number,
  inclusive = true
): ValuePredicate<number> {
  return (value: number): boolean => {
    if (inclusive) {
      return value >= min && value <= max;
    }
    return value > min && value < max;
  };
}
