/**
 * Type utilities for improving developer experience with HAP Fluent
 * Provides helper types for working with services, characteristics, and state management
 */

import type { CharacteristicValue } from "hap-nodejs";
import type { FluentCharacteristic } from "./FluentCharacteristic.js";

/**
 * Extract characteristic names from a service type
 * Useful for type-safe characteristic access
 *
 * @example
 * ```typescript
 * type LightbulbChars = CharacteristicNames<typeof Lightbulb>;
 * // Result: 'on' | 'brightness' | 'hue' | 'saturation' | ...
 * ```
 */
export type CharacteristicNames<T> = T extends { characteristics: infer C }
  ? C extends Record<string, unknown>
    ? keyof C
    : never
  : never;

/**
 * Extract the type of a specific characteristic from a service
 *
 * @example
 * ```typescript
 * type OnChar = CharacteristicType<typeof Lightbulb, 'on'>;
 * // Result: FluentCharacteristic<boolean>
 * ```
 */
export type CharacteristicType<TService, TCharName extends string> = TService extends {
  characteristics: infer C;
}
  ? C extends Record<TCharName, infer Char>
    ? Char
    : never
  : never;

/**
 * Represents the state of a service as a record of characteristic values
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
 */
export type ServiceState = Record<string, CharacteristicValue>;

/**
 * Represents a partial state update for a service
 * Allows updating only specific characteristics
 *
 * @example
 * ```typescript
 * const update: PartialServiceState = {
 *   on: true,
 *   brightness: 100
 * };
 * ```
 */
export type PartialServiceState = Partial<ServiceState>;

/**
 * Type guard to check if a value is a FluentCharacteristic
 *
 * @param value - Value to check
 * @returns True if value is a FluentCharacteristic
 *
 * @example
 * ```typescript
 * if (isFluentCharacteristic(obj)) {
 *   await obj.set(true);
 * }
 * ```
 */
export function isFluentCharacteristic(
  value: unknown,
): value is FluentCharacteristic<CharacteristicValue> {
  return (
    typeof value === "object" &&
    value !== null &&
    "characteristic" in value &&
    typeof (value as Record<string, unknown>).set === "function" &&
    typeof (value as Record<string, unknown>).get === "function"
  );
}

/**
 * Utility type to make specific properties required
 *
 * @example
 * ```typescript
 * type Config = { host?: string; port?: number; timeout?: number };
 * type RequiredConfig = RequireProperties<Config, 'host' | 'port'>;
 * // Result: { host: string; port: number; timeout?: number }
 * ```
 */
export type RequireProperties<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Utility type to make specific properties optional
 *
 * @example
 * ```typescript
 * type Config = { host: string; port: number; timeout: number };
 * type PartialConfig = OptionalProperties<Config, 'timeout'>;
 * // Result: { host: string; port: number; timeout?: number }
 * ```
 */
export type OptionalProperties<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Represents a function that transforms a characteristic value
 *
 * @example
 * ```typescript
 * const percentToDecimal: ValueTransformer<number, number> = (value) => value / 100;
 * ```
 */
export type ValueTransformer<TInput = CharacteristicValue, TOutput = CharacteristicValue> = (
  value: TInput,
) => TOutput;

/**
 * Represents a predicate function for characteristic values
 *
 * @example
 * ```typescript
 * const isValidBrightness: ValuePredicate<number> = (value) =>
 *   typeof value === 'number' && value >= 0 && value <= 100;
 * ```
 */
export type ValuePredicate<T = CharacteristicValue> = (value: T) => boolean;

/**
 * Create a value transformer that clamps a numeric value within a range
 *
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Transformer function that clamps values
 *
 * @example
 * ```typescript
 * const clampBrightness = createClampTransformer(0, 100);
 * clampBrightness(150); // Returns 100
 * clampBrightness(-10); // Returns 0
 * ```
 */
export function createClampTransformer(min: number, max: number): ValueTransformer<number, number> {
  return (value: number): number => Math.max(min, Math.min(max, value));
}

/**
 * Create a value transformer that scales a value from one range to another
 *
 * @param fromMin - Source range minimum
 * @param fromMax - Source range maximum
 * @param toMin - Target range minimum
 * @param toMax - Target range maximum
 * @returns Transformer function that scales values
 *
 * @example
 * ```typescript
 * // Convert percentage (0-100) to decimal (0-1)
 * const percentToDecimal = createScaleTransformer(0, 100, 0, 1);
 * percentToDecimal(50); // Returns 0.5
 * ```
 */
export function createScaleTransformer(
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number,
): ValueTransformer<number, number> {
  return (value: number): number => {
    const normalized = (value - fromMin) / (fromMax - fromMin);
    return toMin + normalized * (toMax - toMin);
  };
}

/**
 * Create a value predicate that checks if a number is within a range
 *
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param inclusive - Whether min/max are inclusive (default: true)
 * @returns Predicate function that validates range
 *
 * @example
 * ```typescript
 * const isValidHue = createRangePredicate(0, 360);
 * isValidHue(180); // Returns true
 * isValidHue(400); // Returns false
 * ```
 */
export function createRangePredicate(
  min: number,
  max: number,
  inclusive = true,
): ValuePredicate<number> {
  return (value: number): boolean => {
    if (inclusive) {
      return value >= min && value <= max;
    }
    return value > min && value < max;
  };
}
