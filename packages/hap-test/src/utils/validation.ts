/**
 * HAP Protocol validation utilities
 *
 * Provides validation for characteristic values according to HomeKit Accessory Protocol (HAP) specifications:
 * - Format validation (bool, int, float, string, uint8-64, data, tlv8)
 * - Constraint validation (min, max, step, validValues)
 * - Permission validation (read, write, notify)
 */

import { CharacteristicValidationError } from "../errors/CharacteristicValidationError.js";
import type { CharacteristicValue } from "hap-nodejs";
import type { CharacteristicProps } from "../types/mocks.js";

/**
 * Validate characteristic format
 */
export function validateFormat(value: CharacteristicValue, format: string): boolean {
  switch (format.toLowerCase()) {
    case "bool":
      return typeof value === "boolean";
    case "int":
      return typeof value === "number" && Number.isInteger(value);
    case "float":
      return typeof value === "number";
    case "uint8":
    case "uint16":
    case "uint32":
    case "uint64":
      return typeof value === "number" && value >= 0 && Number.isInteger(value);
    case "string":
      return typeof value === "string";
    case "data":
      return Buffer.isBuffer(value) || typeof value === "string";
    case "tlv8":
      return Buffer.isBuffer(value) || typeof value === "string";
    default:
      return true; // Unknown format accepted by default
  }
}

/**
 * Validate characteristic constraints (min, max, step, validValues)
 */
export function validateConstraints(
  value: CharacteristicValue,
  props: CharacteristicProps,
): { valid: boolean; reason?: string } {
  // Check valid values (enum)
  if (props.validValues && Array.isArray(props.validValues)) {
    if (!props.validValues.includes(value as any)) {
      return {
        valid: false,
        reason: `Value ${value} not in valid values: ${props.validValues.join(", ")}`,
      };
    }
  }

  // Only check numeric constraints for numbers
  if (typeof value !== "number") {
    return { valid: true };
  }

  // Check min value
  if (props.minValue !== undefined && value < props.minValue) {
    return {
      valid: false,
      reason: `Value ${value} is less than minimum ${props.minValue}`,
    };
  }

  // Check max value
  if (props.maxValue !== undefined && value > props.maxValue) {
    return {
      valid: false,
      reason: `Value ${value} is greater than maximum ${props.maxValue}`,
    };
  }

  // Check step (value must be multiple of step offset from min)
  if (props.minStep !== undefined && props.minStep > 0) {
    const min = props.minValue ?? 0;
    const offset = value - min;
    if (offset % props.minStep !== 0) {
      return {
        valid: false,
        reason: `Value ${value} does not align with step ${props.minStep}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate permissions for an operation
 */
export function validatePermission(
  operation: "read" | "write" | "notify",
  perms: string[] | undefined,
): boolean {
  if (!perms) return true; // No permissions defined, allow all

  const permMap: Record<string, string> = {
    read: "pr",
    write: "pw",
    notify: "ev",
  };

  const requiredPerm = permMap[operation];
  return perms.includes(requiredPerm);
}

/**
 * Comprehensive validation for characteristic value
 *
 * @throws CharacteristicValidationError if validation fails
 */
export function validateCharacteristicValue(
  type: string,
  value: CharacteristicValue,
  props: CharacteristicProps,
  operation: "read" | "write" = "write",
): void {
  // Validate permission first
  if (!validatePermission(operation, props.perms)) {
    const opLabel = operation === "read" ? "reading" : "writing";
    throw new CharacteristicValidationError(
      type,
      value,
      `Permission denied for ${opLabel}: characteristic does not support '${operation}' operation`,
    );
  }

  // Validate format
  if (!validateFormat(value, props.format)) {
    throw new CharacteristicValidationError(
      type,
      value,
      `Invalid format: expected ${props.format}, got ${typeof value}`,
    );
  }

  // Validate constraints
  const constraintResult = validateConstraints(value, props);
  if (!constraintResult.valid) {
    throw new CharacteristicValidationError(
      type,
      value,
      constraintResult.reason || "Constraint validation failed",
    );
  }
}
