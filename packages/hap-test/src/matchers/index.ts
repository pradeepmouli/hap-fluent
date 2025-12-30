/**
 * Custom Vitest matchers for hap-test
 *
 * Import and register these matchers in your test setup:
 *
 * ```typescript
 * import { expect } from 'vitest';
 * import { registerMatchers } from 'hap-test/matchers';
 *
 * registerMatchers(expect);
 * ```
 */

import { toHaveService, toHaveAccessory, toBeRegistered } from "./accessory-matchers.js";
import {
  toHaveCharacteristic,
  toHaveValue,
  toBeInRange,
  toHaveFormat,
} from "./characteristic-matchers.js";

/**
 * Register all custom matchers with Vitest's expect
 */
export function registerMatchers(expect: any): void {
  expect.extend({
    toHaveService,
    toHaveAccessory,
    toBeRegistered,
    toHaveCharacteristic,
    toHaveValue,
    toBeInRange,
    toHaveFormat,
  });
}

// Export individual matchers for direct use
export {
  toHaveService,
  toHaveAccessory,
  toBeRegistered,
  toHaveCharacteristic,
  toHaveValue,
  toBeInRange,
  toHaveFormat,
};

// Export types
export type { MatcherResult } from "./types.js";
