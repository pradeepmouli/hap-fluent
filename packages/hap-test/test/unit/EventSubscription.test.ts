/**
 * Unit tests for EventSubscription lifecycle and behavior
 */

import { describe, it, expect, vi } from "vitest";
import {
  MockHomeKit,
  MockAccessory,
  MockService,
  MockCharacteristic,
} from "../../src/MockHomeKit.js";

function buildSwitch(homeKit: MockHomeKit) {
  const accessory = new MockAccessory("sub-uuid", "Sub Test");
  const service = new MockService("Switch", "Switch");
  const characteristic = new MockCharacteristic("On", "On", false, {
    format: "bool",
    perms: ["pr", "pw", "ev"],
  });

  service.addCharacteristic(characteristic);
  accessory.addService(service);
  homeKit.addAccessory(accessory);

  return { accessory, service, characteristic };
}

describe("EventSubscription", () => {
  it("resolves waitForNext when value changes", async () => {
    const hk = new MockHomeKit();
    const { accessory, characteristic } = buildSwitch(hk);

    const subscription = characteristic.subscribe();
    const waitPromise = subscription.waitForNext(200);

    await characteristic.setValue(true);
    const event = await waitPromise;

    expect(event.newValue).toBe(true);
    expect(event.accessoryUUID).toBe(accessory.UUID);
    subscription.unsubscribe();
  });

  it("rejects on timeout with fake timers", async () => {
    vi.useFakeTimers();
    const hk = new MockHomeKit();
    const { characteristic } = buildSwitch(hk);
    const subscription = characteristic.subscribe();

    const waitPromise = subscription.waitForNext(50);
    const expectPromise = expect(waitPromise).rejects.toThrow("Timeout");
    await vi.advanceTimersByTimeAsync(50);
    await expectPromise;

    subscription.unsubscribe();
    vi.useRealTimers();
  });

  it("stops delivering after unsubscribe", async () => {
    const hk = new MockHomeKit();
    const { characteristic } = buildSwitch(hk);
    const subscription = characteristic.subscribe();

    subscription.unsubscribe();
    await characteristic.setValue(true);
    await expect(subscription.waitForNext(20)).rejects.toThrow();
  });
});
