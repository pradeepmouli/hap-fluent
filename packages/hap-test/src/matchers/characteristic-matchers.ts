/**
 * Custom Vitest matchers for characteristic-level assertions
 */

import type { MatcherResult } from "./types.js";
import type { MockService, MockCharacteristic } from "../MockHomeKit.js";
import type { CharacteristicValue } from "hap-nodejs";

/**
 * Assert that a service has a characteristic with the given name
 */
export function toHaveCharacteristic(service: MockService, charName: string): MatcherResult {
  const found = service.hasCharacteristic(charName);

  return {
    pass: found,
    message: () =>
      found
        ? `Expected service "${service.displayName}" not to have characteristic "${charName}"`
        : `Expected service "${service.displayName}" to have characteristic "${charName}", but it was not found.\nAvailable characteristics: ${service.characteristics
            .map((c) => c.displayName)
            .join(", ")}`,
  };
}

/**
 * Assert that a characteristic has a specific value
 */
export function toHaveValue(
  characteristic: MockCharacteristic,
  expected: CharacteristicValue,
): MatcherResult {
  const actual = characteristic.value;
  const pass = actual === expected;

  return {
    pass,
    message: () =>
      pass
        ? `Expected characteristic "${characteristic.displayName}" not to have value ${expected}`
        : `Expected characteristic "${characteristic.displayName}" to have value ${expected}, but got ${actual}`,
  };
}

/**
 * Assert that a characteristic's value is within a numeric range
 */
export function toBeInRange(
  characteristic: MockCharacteristic,
  min: number,
  max: number,
): MatcherResult {
  const value = characteristic.value;

  if (typeof value !== "number") {
    return {
      pass: false,
      message: () =>
        `Expected characteristic "${characteristic.displayName}" to have a numeric value for range check, but got ${typeof value}`,
    };
  }

  const pass = value >= min && value <= max;

  return {
    pass,
    message: () =>
      pass
        ? `Expected characteristic "${characteristic.displayName}" value ${value} not to be in range [${min}, ${max}]`
        : `Expected characteristic "${characteristic.displayName}" value ${value} to be in range [${min}, ${max}]`,
  };
}

/**
 * Assert that a characteristic has a specific format
 */
export function toHaveFormat(
  characteristic: MockCharacteristic,
  expectedFormat: string,
): MatcherResult {
  const actualFormat = characteristic.props.format;
  const pass = actualFormat === expectedFormat;

  return {
    pass,
    message: () =>
      pass
        ? `Expected characteristic "${characteristic.displayName}" not to have format "${expectedFormat}"`
        : `Expected characteristic "${characteristic.displayName}" to have format "${expectedFormat}", but got "${actualFormat}"`,
  };
}
