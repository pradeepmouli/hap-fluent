/**
 * Integration test: Characteristic get/set operations
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestHarness } from "../../src/TestHarness.js";
import { MockAccessory, MockService, MockCharacteristic } from "../../src/MockHomeKit.js";
import type { HarnessOptions } from "../../src/types/harness.js";

describe("Characteristic Operations Integration", () => {
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

  it("should perform basic get/set on characteristics", async () => {
    // Setup accessory with lightbulb service
    const accessory = new MockAccessory("light-uuid", "Test Light");
    const service = new MockService("Lightbulb", "Lightbulb");
    const onChar = new MockCharacteristic("On", "On", false, {
      format: "bool",
      perms: ["pr", "pw", "ev"],
    });

    service.addCharacteristic(onChar);
    accessory.addService(service);
    harness.homeKit.addAccessory(accessory);

    // Get initial value
    const initialValue = await onChar.getValue();
    expect(initialValue).toBe(false);

    // Set new value
    await onChar.setValue(true);
    const updatedValue = await onChar.getValue();
    expect(updatedValue).toBe(true);
  });

  it("should retrieve characteristics via HomeKit controller", async () => {
    const accessory = new MockAccessory("switch-uuid", "Test Switch");
    const service = new MockService("Switch", "Switch");
    const onChar = new MockCharacteristic("On", "On", false, {
      format: "bool",
      perms: ["pr", "pw"],
    });

    service.addCharacteristic(onChar);
    accessory.addService(service);
    harness.homeKit.addAccessory(accessory);

    // Access via HomeKit controller API
    const char = harness.homeKit.characteristic("switch-uuid", "Switch", "On");
    expect(char).toBeDefined();
    expect(await char?.getValue()).toBe(false);

    await char?.setValue(true);
    expect(await char?.getValue()).toBe(true);
  });

  it("should support multiple characteristics on a service", async () => {
    const accessory = new MockAccessory("dimmer-uuid", "Dimmable Light");
    const service = new MockService("Lightbulb", "Lightbulb");

    const onChar = new MockCharacteristic("On", "On", false, {
      format: "bool",
      perms: ["pr", "pw"],
    });
    const brightnessChar = new MockCharacteristic("Brightness", "Brightness", 0, {
      format: "int",
      perms: ["pr", "pw"],
      minValue: 0,
      maxValue: 100,
    });

    service.addCharacteristic(onChar);
    service.addCharacteristic(brightnessChar);
    accessory.addService(service);
    harness.homeKit.addAccessory(accessory);

    // Operate on multiple characteristics
    await onChar.setValue(true);
    await brightnessChar.setValue(75);

    expect(await onChar.getValue()).toBe(true);
    expect(await brightnessChar.getValue()).toBe(75);
  });
});
