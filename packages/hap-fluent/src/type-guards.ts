/**
 * Runtime type guard utilities for HAP-NodeJS types
 * @module type-guards
 */

import type { Characteristic, Service } from "hap-nodejs";

/**
 * Type guard to check if a value is a valid characteristic value
 */
export function isCharacteristicValue(value: unknown): value is CharacteristicValue {
  if (value === null || value === undefined) {
    return false;
  }

  const type = typeof value;
  return type === "string" || type === "number" || type === "boolean" || type === "object";
}

/**
 * Type guard to check if an object is a HAP-NodeJS Service
 */
export function isService(obj: unknown): obj is Service {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const service = obj as Partial<Service>;
  return (
    typeof service.UUID === "string" &&
    typeof service.displayName === "string" &&
    typeof service.getCharacteristic === "function" &&
    typeof service.addCharacteristic === "function"
  );
}

/**
 * Type guard to check if an object is a HAP-NodeJS Characteristic
 */
export function isCharacteristic(obj: unknown): obj is Characteristic {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const characteristic = obj as Partial<Characteristic>;
  return (
    typeof characteristic.UUID === "string" &&
    typeof characteristic.displayName === "string" &&
    typeof characteristic.updateValue === "function" &&
    typeof characteristic.getValue === "function"
  );
}

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

/**
 * Type guard to check if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * Valid characteristic value types per HAP specification
 */
export type CharacteristicValue = string | number | boolean | Record<string, unknown> | null;
