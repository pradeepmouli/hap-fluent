/**
 * Integration tests for event subscriptions and harness helpers
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestHarness } from "../../src/TestHarness.js";
import { MockAccessory, MockService, MockCharacteristic } from "../../src/MockHomeKit.js";
import type { HarnessOptions } from "../../src/types/harness.js";

describe("Event Subscriptions Integration", () => {
  let harness: TestHarness;
  let accessory: MockAccessory;
  let service: MockService;
  let characteristic: MockCharacteristic;

  const options: HarnessOptions = {
    platformConstructor: undefined as any,
    platformConfig: {
      platform: "TestPlatform",
      name: "Test",
    },
  };

  beforeEach(async () => {
    harness = await TestHarness.create(options);
    accessory = new MockAccessory("event-uuid", "Event Accessory");
    service = new MockService("Lightbulb", "Lightbulb");
    characteristic = new MockCharacteristic("On", "On", false, {
      format: "bool",
      perms: ["pr", "pw", "ev"],
    });

    service.addCharacteristic(characteristic);
    accessory.addService(service);
    harness.homeKit.addAccessory(accessory);
  });

  afterEach(() => {
    if (harness) {
      harness.shutdown();
    }
  });

  it("waitForAnyEvent resolves when characteristic changes", async () => {
    const anyEvent = harness.waitForAnyEvent(200);
    await characteristic.setValue(true);

    const event = await anyEvent;
    expect(event.accessoryUUID).toBe("event-uuid");
    expect(event.serviceType).toBe("Lightbulb");
    expect(event.characteristicType).toBe("On");
  });

  it("waitForEvent targets a specific characteristic", async () => {
    const waitSpecific = harness.waitForEvent("event-uuid", "Lightbulb", "On", 200);
    await characteristic.setValue(true);

    const event = await waitSpecific;
    expect(event.newValue).toBe(true);
    expect(event.oldValue).toBe(false);
  });

  it("timestamps honor TimeController", async () => {
    const targetTime = new Date("2025-01-01T00:00:00Z");
    harness.time.setTime(targetTime);

    const waitSpecific = harness.waitForEvent("event-uuid", "Lightbulb", "On", 200);
    await characteristic.setValue(true);

    const event = await waitSpecific;
    expect(event.timestamp).toBe(targetTime.getTime());
  });
});
