/**
 * Integration test: Multi-user and batch operations
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestHarness } from "../../src/TestHarness.js";
import {
  MockAccessory,
  MockService,
  MockCharacteristic,
  MockHomeKit,
} from "../../src/MockHomeKit.js";
import type { HarnessOptions } from "../../src/types/harness.js";

describe("Multi-User and Batch Operations", () => {
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

  describe("Pairing State", () => {
    it("starts paired by default", () => {
      expect(harness.homeKit.isPaired()).toBe(true);
    });

    it("can unpair and re-pair", () => {
      harness.homeKit.unpair();
      expect(harness.homeKit.isPaired()).toBe(false);

      harness.homeKit.pair();
      expect(harness.homeKit.isPaired()).toBe(true);
    });

    it("has a unique controller ID", () => {
      const id = harness.homeKit.getControllerId();
      expect(id).toBeDefined();
      expect(typeof id).toBe("string");
    });
  });

  describe("Multiple Controllers", () => {
    it("can create multiple controllers with different IDs", () => {
      const controller1 = new MockHomeKit(undefined, "controller-1");
      const controller2 = new MockHomeKit(undefined, "controller-2");

      expect(controller1.getControllerId()).toBe("controller-1");
      expect(controller2.getControllerId()).toBe("controller-2");
      expect(controller1.getControllerId()).not.toBe(controller2.getControllerId());
    });

    it("each controller maintains independent pairing state", () => {
      const controller1 = new MockHomeKit(undefined, "controller-1");
      const controller2 = new MockHomeKit(undefined, "controller-2");

      controller1.unpair();
      expect(controller1.isPaired()).toBe(false);
      expect(controller2.isPaired()).toBe(true);
    });
  });

  describe("Batch Operations", () => {
    beforeEach(() => {
      // Set up accessories with multiple characteristics
      const acc1 = new MockAccessory("light-uuid", "Light");
      const lightService = new MockService("Lightbulb", "Lightbulb");
      lightService.addCharacteristic(
        new MockCharacteristic("On", "On", true, { format: "bool", perms: ["pr", "pw"] }),
      );
      lightService.addCharacteristic(
        new MockCharacteristic("Brightness", "Brightness", 75, {
          format: "int",
          perms: ["pr", "pw"],
          minValue: 0,
          maxValue: 100,
        }),
      );
      acc1.addService(lightService);
      harness.homeKit.addAccessory(acc1);

      const acc2 = new MockAccessory("switch-uuid", "Switch");
      const switchService = new MockService("Switch", "Switch");
      switchService.addCharacteristic(
        new MockCharacteristic("On", "On", false, { format: "bool", perms: ["pr", "pw"] }),
      );
      acc2.addService(switchService);
      harness.homeKit.addAccessory(acc2);
    });

    it("refreshAll() reads all accessible characteristics", async () => {
      const results = await harness.homeKit.refreshAll();

      expect(results.size).toBeGreaterThan(0);
      expect(results.get("light-uuid.Lightbulb.On")).toBe(true);
      expect(results.get("light-uuid.Lightbulb.Brightness")).toBe(75);
      expect(results.get("switch-uuid.Switch.On")).toBe(false);
    });

    it("refreshAll() skips write-only characteristics", async () => {
      const acc = new MockAccessory("write-only-uuid", "WriteOnly");
      const svc = new MockService("Service", "Service");
      svc.addCharacteristic(
        new MockCharacteristic("WriteOnly", "WriteOnly", 0, { format: "int", perms: ["pw"] }),
      );
      acc.addService(svc);
      harness.homeKit.addAccessory(acc);

      const results = await harness.homeKit.refreshAll();

      // Should not include the write-only characteristic
      const writeOnlyKey = "write-only-uuid.Service.WriteOnly";
      expect(results.has(writeOnlyKey)).toBe(false);
    });
  });
});
