/**
 * Runtime type guard utilities for HAP-NodeJS types.
 *
 * @remarks
 * hap-nodejs objects are duck-typed at runtime; these guards validate the
 * minimal structural requirements defined by the HAP specification before
 * hap-fluent operates on them. Using guards prevents cryptic downstream errors
 * from hap-nodejs when malformed objects are passed.
 *
 * @module type-guards
 */

import type { Characteristic, Service } from 'hap-nodejs';

/**
 * Determine whether `value` is a valid HAP `CharacteristicValue`.
 *
 * @remarks
 * The HAP specification defines valid characteristic value types as:
 * `string`, `number`, `boolean`, or `object`. `null` and `undefined` are
 * **not** valid — hap-nodejs will throw if you attempt to set them.
 *
 * @param value - Value to test.
 * @returns `true` if `value` is a `string`, `number`, `boolean`, or non-null `object`.
 *
 * @example
 * ```typescript
 * isCharacteristicValue(true);   // true
 * isCharacteristicValue(75);     // true
 * isCharacteristicValue(null);   // false
 * isCharacteristicValue(undefined); // false
 * ```
 *
 * @category TypeGuards
 */
export function isCharacteristicValue(value: unknown): value is CharacteristicValue {
  if (value === null || value === undefined) {
    return false;
  }

  const type = typeof value;
  return type === 'string' || type === 'number' || type === 'boolean' || type === 'object';
}

/**
 * Determine whether `obj` is a valid hap-nodejs `Service` instance.
 *
 * @remarks
 * Validates structural requirements: `UUID` (string), `displayName` (string),
 * `getCharacteristic` (function), and `addCharacteristic` (function). This
 * duck-type check is sufficient for hap-fluent's use — it avoids an `instanceof`
 * check that would fail across different hap-nodejs module instances (common
 * in monorepo setups where multiple packages resolve hap-nodejs independently).
 *
 * @param obj - Value to test.
 * @returns `true` if `obj` satisfies the minimal `Service` interface.
 *
 * @category TypeGuards
 */
export function isService(obj: unknown): obj is Service {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const service = obj as Partial<Service>;
  return (
    typeof service.UUID === 'string' &&
    typeof service.displayName === 'string' &&
    typeof service.getCharacteristic === 'function' &&
    typeof service.addCharacteristic === 'function'
  );
}

/**
 * Determine whether `obj` is a valid hap-nodejs `Characteristic` instance.
 *
 * @remarks
 * Validates: `UUID` (string), `displayName` (string), `updateValue` (function),
 * and `getValue` (function). Same duck-typing rationale as {@link isService}.
 *
 * @param obj - Value to test.
 * @returns `true` if `obj` satisfies the minimal `Characteristic` interface.
 *
 * @category TypeGuards
 */
export function isCharacteristic(obj: unknown): obj is Characteristic {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const characteristic = obj as Partial<Characteristic>;
  return (
    typeof characteristic.UUID === 'string' &&
    typeof characteristic.displayName === 'string' &&
    typeof characteristic.updateValue === 'function' &&
    typeof characteristic.getValue === 'function'
  );
}

/**
 * Determine whether `value` is a `string`.
 * @param value - Value to test.
 * @returns `true` if `typeof value === 'string'`.
 * @category TypeGuards
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Determine whether `value` is a finite `number` (excludes `NaN`).
 * @param value - Value to test.
 * @returns `true` if `typeof value === 'number'` and not `NaN`.
 * @category TypeGuards
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Determine whether `value` is a `boolean`.
 * @param value - Value to test.
 * @returns `true` if `typeof value === 'boolean'`.
 * @category TypeGuards
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Union of all valid HAP characteristic value types per the HAP specification.
 *
 * @remarks
 * The HAP specification (section 6.6) defines the following data types for
 * characteristics: bool (`boolean`), uint8/uint16/uint32/int (`number`),
 * float (`number`), string (`string`), TLV8 and data (represented as `object`).
 * `null` is included here to match the hap-nodejs type definition, but
 * {@link isCharacteristicValue} rejects `null` at runtime to prevent HAP errors.
 *
 * @category TypeGuards
 */
export type CharacteristicValue = string | number | boolean | Record<string, unknown> | null;
