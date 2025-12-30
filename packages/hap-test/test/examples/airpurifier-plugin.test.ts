/**
 * Example: AirPurifier plugin test (complex device)
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { TestHarness } from "../../src/TestHarness.js";
import { MockAccessory, MockService, MockCharacteristic } from "../../src/MockHomeKit.js";
import { NetworkSimulator } from "../../src/NetworkSimulator.js";
import {
  toHaveService,
  toHaveAccessory,
  toHaveCharacteristic,
  toHaveValue,
  toBeInRange,
} from "../../src/matchers/index.js";

// Using function-style matchers for type-safe assertions

/** Enum-like values for AirPurifier states */
const Active = { Inactive: 0, Active: 1 } as const;
const CurrentState = { Inactive: 0, Idle: 1, Purifying: 2 } as const;
const TargetState = { Manual: 0, Auto: 1 } as const;
const FilterChange = { OK: 0, Change: 1 } as const;

describe("AirPurifier platform", () => {
  let harness: TestHarness;
  let purifier: MockAccessory;
  let svc: MockService;

  beforeEach(async () => {
    harness = await TestHarness.create({
      platformConstructor: undefined as any,
      platformConfig: { platform: "AirPurifierPlatform", name: "Air Purifier" },
    });

    purifier = new MockAccessory("purifier-uuid", "Living Room Air Purifier");
    svc = new MockService("AirPurifier", "AirPurifier");

    // Core characteristics
    svc.addCharacteristic(
      new MockCharacteristic("Active", "Active", Active.Inactive, {
        format: "int",
        perms: ["pr", "pw", "ev"],
        validValues: [Active.Inactive, Active.Active],
      }),
    );
    svc.addCharacteristic(
      new MockCharacteristic(
        "CurrentAirPurifierState",
        "CurrentAirPurifierState",
        CurrentState.Inactive,
        {
          format: "int",
          perms: ["pr", "pw", "ev"],
          validValues: [CurrentState.Inactive, CurrentState.Idle, CurrentState.Purifying],
        },
      ),
    );
    svc.addCharacteristic(
      new MockCharacteristic("TargetAirPurifierState", "TargetAirPurifierState", TargetState.Auto, {
        format: "int",
        perms: ["pr", "pw", "ev"],
        validValues: [TargetState.Manual, TargetState.Auto],
      }),
    );

    // Speed and filter
    svc.addCharacteristic(
      new MockCharacteristic("RotationSpeed", "RotationSpeed", 0, {
        format: "int",
        perms: ["pr", "pw", "ev"],
        minValue: 0,
        maxValue: 100,
        unit: "percentage",
      }),
    );
    svc.addCharacteristic(
      new MockCharacteristic("FilterLifeLevel", "FilterLifeLevel", 100, {
        format: "int",
        perms: ["pr", "pw", "ev"],
        minValue: 0,
        maxValue: 100,
        unit: "percentage",
      }),
    );
    svc.addCharacteristic(
      new MockCharacteristic("FilterChangeIndication", "FilterChangeIndication", FilterChange.OK, {
        format: "int",
        perms: ["pr", "pw", "ev"],
        validValues: [FilterChange.OK, FilterChange.Change],
      }),
    );

    purifier.addService(svc);
    harness.homeKit.addAccessory(purifier);
  });

  it("registers service and characteristics", () => {
    const accRes = toHaveAccessory(harness.homeKit, "purifier-uuid");
    expect(accRes.pass).toBe(true);
    const svcRes = toHaveService(harness.homeKit, "AirPurifier");
    expect(svcRes.pass).toBe(true);

    const air = harness.homeKit.service("purifier-uuid", "AirPurifier");
    expect(toHaveCharacteristic(air!, "Active").pass).toBe(true);
    expect(toHaveCharacteristic(air!, "CurrentAirPurifierState").pass).toBe(true);
    expect(toHaveCharacteristic(air!, "TargetAirPurifierState").pass).toBe(true);
    expect(toHaveCharacteristic(air!, "RotationSpeed").pass).toBe(true);
    expect(toHaveCharacteristic(air!, "FilterLifeLevel").pass).toBe(true);
    expect(toHaveCharacteristic(air!, "FilterChangeIndication").pass).toBe(true);
  });

  it("activates purifier and transitions states", async () => {
    const active = harness.homeKit.characteristic("purifier-uuid", "AirPurifier", "Active")!;
    const current = harness.homeKit.characteristic(
      "purifier-uuid",
      "AirPurifier",
      "CurrentAirPurifierState",
    )!;
    const target = harness.homeKit.characteristic(
      "purifier-uuid",
      "AirPurifier",
      "TargetAirPurifierState",
    )!;

    // Initially inactive
    expect(toHaveValue(active, Active.Inactive).pass).toBe(true);
    expect(toHaveValue(current, CurrentState.Inactive).pass).toBe(true);

    // Set target to Auto and activate
    await target.setValue(TargetState.Auto);
    await active.setValue(Active.Active);

    // Simulate plugin updating current state to purifying
    await current.setValue(CurrentState.Purifying);

    expect(toHaveValue(target, TargetState.Auto).pass).toBe(true);
    expect(toHaveValue(active, Active.Active).pass).toBe(true);
    expect(toHaveValue(current, CurrentState.Purifying).pass).toBe(true);
  });

  it("controls rotation speed with constraints and events", async () => {
    const speed = harness.homeKit.characteristic("purifier-uuid", "AirPurifier", "RotationSpeed")!;
    const sub = speed.subscribe();

    // Set within range
    await speed.setValue(60);
    expect(toBeInRange(speed, 0, 100).pass).toBe(true);
    const evt1 = await sub.waitForNext(500);
    expect(evt1.newValue).toBe(60);

    // Increase speed
    await speed.setValue(85);
    const evt2 = await sub.waitForNext(500);
    expect(evt2.newValue).toBe(85);

    sub.unsubscribe();
  });

  it("updates filter change indication when life is low", async () => {
    const life = harness.homeKit.characteristic("purifier-uuid", "AirPurifier", "FilterLifeLevel")!;
    const indication = harness.homeKit.characteristic(
      "purifier-uuid",
      "AirPurifier",
      "FilterChangeIndication",
    )!;

    // High life → OK
    await life.setValue(90);
    await indication.setValue(FilterChange.OK); // plugin would set based on life
    expect(toHaveValue(indication, FilterChange.OK).pass).toBe(true);

    // Low life → Change
    await life.setValue(8);
    await indication.setValue(FilterChange.Change); // simulate plugin logic
    expect(toHaveValue(indication, FilterChange.Change).pass).toBe(true);
  });

  it("handles network latency on writes and reads", async () => {
    const simulator = new NetworkSimulator();
    simulator.setLatency(150);
    simulator.setPacketLoss(0);
    harness.homeKit.setNetworkSimulator(simulator);

    const speed = harness.homeKit.characteristic("purifier-uuid", "AirPurifier", "RotationSpeed")!;

    // Use fake timers to deterministically advance latency
    vi.useFakeTimers();

    // Write with latency
    const writePromise = speed.setValue(40);
    await vi.advanceTimersByTimeAsync(150);
    await writePromise;
    expect(toHaveValue(speed, 40).pass).toBe(true);

    // Read with latency
    const readPromise = speed.getValue();
    await vi.advanceTimersByTimeAsync(150);
    const val = await readPromise;
    expect(val).toBe(40);

    vi.useRealTimers();
  });
});
