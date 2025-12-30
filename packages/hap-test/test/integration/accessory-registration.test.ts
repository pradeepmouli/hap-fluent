/**
 * Integration test: Accessory registration and retrieval
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestHarness } from "../../src/TestHarness.js";
import { MockAccessory, MockService } from "../../src/MockHomeKit.js";
import type { HarnessOptions } from "../../src/types/harness.js";

describe("Accessory Registration Integration", () => {
  let harness: TestHarness;

  const options: HarnessOptions = {
    platformConstructor: undefined as any,
    platformConfig: {
      platform: "TestPlatform",
      name: "Test",
    },
  };

  beforeEach(async () => {
    harness = await TestHarness.create(options);
  });

  afterEach(() => {
    if (harness) {
      harness.shutdown();
    }
  });

  it("should register accessories and make them available via HomeKit", () => {
    const accessory = new MockAccessory("test-uuid-1", "Test Light");
    const service = new MockService("Lightbulb", "Lightbulb");
    accessory.addService(service);

    // Register via Homebridge API
    harness.api.registerPlatformAccessories("test-plugin", "TestPlatform", [accessory as any]);

    // Make available in HomeKit controller
    harness.homeKit.addAccessory(accessory);

    // Verify accessible via HomeKit
    const retrieved = harness.homeKit.accessory("test-uuid-1");
    expect(retrieved?.displayName).toBe("Test Light");
    expect(retrieved?.getService("Lightbulb")).toBeDefined();
  });

  it("should track multiple accessory registrations", () => {
    const acc1 = new MockAccessory("uuid-1", "Light 1");
    const acc2 = new MockAccessory("uuid-2", "Light 2");

    harness.api.registerPlatformAccessories("test-plugin", "TestPlatform", [
      acc1 as any,
      acc2 as any,
    ]);
    harness.homeKit.addAccessory(acc1);
    harness.homeKit.addAccessory(acc2);

    expect(harness.homeKit.accessories()).toHaveLength(2);
    expect(harness.api.platformAccessories()).toHaveLength(2);
  });

  it("should support accessory updates", () => {
    const accessory = new MockAccessory("update-uuid", "Original Name");

    harness.api.registerPlatformAccessories("test-plugin", "TestPlatform", [accessory as any]);
    harness.homeKit.addAccessory(accessory);

    // Update accessory
    accessory.displayName = "Updated Name";
    harness.api.updatePlatformAccessories([accessory as any]);

    const retrieved = harness.homeKit.accessory("update-uuid");
    expect(retrieved?.displayName).toBe("Updated Name");
  });
});
