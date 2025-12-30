/**
 * Example: Lightbulb plugin test (core device)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestHarness } from "../../src/TestHarness.js";
import { MockAccessory, MockService, MockCharacteristic } from "../../src/MockHomeKit.js";
import { CharacteristicValidationError } from "../../src/errors/CharacteristicValidationError.js";
import {
  toHaveAccessory,
  toHaveService,
  toHaveCharacteristic,
  toHaveValue,
  toBeInRange,
} from "../../src/matchers/index.js";

describe("Lightbulb platform", () => {
  let harness: TestHarness;
  let light: MockAccessory;
  let service: MockService;
  let onChar: MockCharacteristic;
  let brightness: MockCharacteristic;
  let colorTemp: MockCharacteristic;

  beforeEach(async () => {
    harness = await TestHarness.create({
      platformConstructor: undefined as any,
      platformConfig: { platform: "LightbulbPlatform", name: "Demo Lights" },
    });

    light = new MockAccessory("light-uuid", "Living Room Light");
    service = new MockService("Lightbulb", "Lightbulb");

    onChar = new MockCharacteristic("On", "On", false, {
      format: "bool",
      perms: ["pr", "pw", "ev"],
    });

    brightness = new MockCharacteristic("Brightness", "Brightness", 50, {
      format: "int",
      perms: ["pr", "pw", "ev"],
      minValue: 0,
      maxValue: 100,
      minStep: 1,
      unit: "percentage",
    });

    colorTemp = new MockCharacteristic("ColorTemperature", "ColorTemperature", 350, {
      format: "int",
      perms: ["pr", "pw", "ev"],
      minValue: 140,
      maxValue: 500,
      minStep: 10,
    });

    service.addCharacteristic(onChar);
    service.addCharacteristic(brightness);
    service.addCharacteristic(colorTemp);
    light.addService(service);
    harness.homeKit.addAccessory(light);
  });

  afterEach(() => {
    harness.shutdown();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("registers the lightbulb service and characteristics", () => {
    expect(toHaveAccessory(harness.homeKit, "light-uuid").pass).toBe(true);
    expect(toHaveService(harness.homeKit, "Lightbulb").pass).toBe(true);

    const svc = harness.homeKit.service("light-uuid", "Lightbulb");
    expect(toHaveCharacteristic(svc!, "On").pass).toBe(true);
    expect(toHaveCharacteristic(svc!, "Brightness").pass).toBe(true);
    expect(toHaveCharacteristic(svc!, "ColorTemperature").pass).toBe(true);
  });

  it("toggles power and emits notifications", async () => {
    const subscription = onChar.subscribe();

    await onChar.setValue(true);
    const onEvent = await subscription.waitForNext(200);
    expect(onEvent.newValue).toBe(true);
    expect(toHaveValue(onChar, true).pass).toBe(true);

    await onChar.setValue(false);
    const offEvent = await subscription.waitForNext(200);
    expect(offEvent.newValue).toBe(false);
    expect(toHaveValue(onChar, false).pass).toBe(true);

    subscription.unsubscribe();
    expect(onChar.isSubscribed()).toBe(false);
  });

  it("enforces brightness and color temperature constraints", async () => {
    await brightness.setValue(80);
    expect(toBeInRange(brightness, 0, 100).pass).toBe(true);

    await colorTemp.setValue(400);
    expect(toBeInRange(colorTemp, 140, 500).pass).toBe(true);

    await expect(brightness.setValue(120)).rejects.toBeInstanceOf(CharacteristicValidationError);
    await expect(colorTemp.setValue(50)).rejects.toBeInstanceOf(CharacteristicValidationError);
  });
});
