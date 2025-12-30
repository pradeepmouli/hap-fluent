/**
 * Custom Vitest matchers for accessory-level assertions
 */

import type { MatcherResult } from "./types.js";
import type { MockHomeKit, MockAccessory } from "../MockHomeKit.js";

/**
 * Assert that MockHomeKit has a service with the given name
 */
export function toHaveService(homeKit: MockHomeKit, serviceName: string): MatcherResult {
  const accessories = homeKit.accessories();
  const found = accessories.some((accessory) =>
    accessory.services.some((service) => service.type === serviceName),
  );

  return {
    pass: found,
    message: () =>
      found
        ? `Expected HomeKit not to have service "${serviceName}"`
        : `Expected HomeKit to have service "${serviceName}", but it was not found.\nAvailable services: ${accessories
            .flatMap((a) => a.services.map((s) => s.type))
            .join(", ")}`,
  };
}

/**
 * Assert that MockHomeKit has an accessory with the given UUID
 */
export function toHaveAccessory(homeKit: MockHomeKit, uuid: string): MatcherResult {
  const accessory = homeKit.accessory(uuid);

  return {
    pass: accessory !== undefined,
    message: () =>
      accessory
        ? `Expected HomeKit not to have accessory "${uuid}"`
        : `Expected HomeKit to have accessory "${uuid}", but it was not found.\nAvailable accessories: ${homeKit
            .accessories()
            .map((a) => `${a.UUID} (${a.displayName})`)
            .join(", ")}`,
  };
}

/**
 * Assert that an accessory is registered in MockHomeKit
 */
export function toBeRegistered(accessory: MockAccessory, homeKit: MockHomeKit): MatcherResult {
  const found = homeKit.accessory(accessory.UUID);

  return {
    pass: found !== undefined,
    message: () =>
      found
        ? `Expected accessory "${accessory.displayName}" (${accessory.UUID}) not to be registered`
        : `Expected accessory "${accessory.displayName}" (${accessory.UUID}) to be registered in HomeKit, but it was not found.\nRegistered accessories: ${homeKit
            .accessories()
            .map((a) => `${a.UUID} (${a.displayName})`)
            .join(", ")}`,
  };
}
