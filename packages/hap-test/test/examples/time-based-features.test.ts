/**
 * Example: Time-based features using TimeController
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestHarness } from "../../src/TestHarness.js";
import { MockAccessory, MockService, MockCharacteristic } from "../../src/MockHomeKit.js";

const buildLight = (): {
  accessory: MockAccessory;
  trigger: MockCharacteristic;
  brightness: MockCharacteristic;
} => {
  const accessory = new MockAccessory("time-light", "Scheduled Light");
  const service = new MockService("Lightbulb", "Lightbulb");

  const trigger = new MockCharacteristic("On", "On", false, {
    format: "bool",
    perms: ["pr", "pw", "ev"],
  });

  const brightness = new MockCharacteristic("Brightness", "Brightness", 0, {
    format: "int",
    perms: ["pr", "pw", "ev"],
    minValue: 0,
    maxValue: 100,
    minStep: 1,
  });

  service.addCharacteristic(trigger);
  service.addCharacteristic(brightness);
  accessory.addService(service);

  return { accessory, trigger, brightness };
};

describe("Time-based features", () => {
  let harness: TestHarness;
  let trigger: MockCharacteristic;
  let brightness: MockCharacteristic;

  beforeEach(async () => {
    harness = await TestHarness.create({
      platformConstructor: undefined as any,
      platformConfig: { platform: "TimeFeaturesPlatform", name: "Time Features" },
    });

    const { accessory, trigger: onChar, brightness: levelChar } = buildLight();
    trigger = onChar;
    brightness = levelChar;
    harness.homeKit.addAccessory(accessory);
  });

  afterEach(() => {
    harness.shutdown();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("executes scheduled operations with deterministic time", async () => {
    const subscription = trigger.subscribe();
    const nextEvent = subscription.waitForNext(1000);

    setTimeout(async () => {
      await trigger.setValue(true);
    }, 750);

    await harness.time.advance(750);
    const evt = await nextEvent;

    expect(evt.newValue).toBe(true);
    subscription.unsubscribe();
  });

  it("supports polling intervals and cumulative updates", async () => {
    const subscription = brightness.subscribe();

    const intervalId = setInterval(async () => {
      const current = (await brightness.getValue()) as number;
      await brightness.setValue(Math.min(current + 10, 100));
    }, 500);

    await harness.time.advance(1500);
    const value = await brightness.getValue();

    clearInterval(intervalId);
    subscription.unsubscribe();

    expect(value).toBe(30);
    expect(subscription.getHistory().length).toBeGreaterThanOrEqual(3);
  });
});
