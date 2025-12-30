/**
 * Integration test: Network simulation (latency, packet loss, disconnect)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TestHarness } from "../../src/TestHarness.js";
import { MockAccessory, MockService, MockCharacteristic } from "../../src/MockHomeKit.js";
import { NetworkSimulator } from "../../src/NetworkSimulator.js";
import { NetworkError, NetworkErrorType } from "../../src/errors/NetworkError.js";
import type { HarnessOptions } from "../../src/types/harness.js";

describe("Network Simulation Integration", () => {
  let harness: TestHarness;
  let simulator: NetworkSimulator;

  const options: HarnessOptions = {
    platformConstructor: undefined as any,
    platformConfig: {
      platform: "TestPlatform",
      name: "Test",
    },
  };

  beforeEach(async () => {
    harness = await TestHarness.create(options);
    simulator = new NetworkSimulator();
    harness.homeKit.setNetworkSimulator(simulator);
  });

  afterEach(() => {
    if (harness) {
      harness.shutdown();
    }
    vi.restoreAllMocks();
  });

  function makeOnCharacteristic(): MockCharacteristic {
    return new MockCharacteristic("On", "On", false, {
      format: "bool",
      perms: ["pr", "pw", "ev"],
    });
  }

  function setupAccessory(char: MockCharacteristic): void {
    const accessory = new MockAccessory("net-uuid", "Net Light");
    const service = new MockService("Lightbulb", "Lightbulb");
    service.addCharacteristic(char);
    accessory.addService(service);
    harness.homeKit.addAccessory(accessory);
  }

  it("applies latency to getValue()", async () => {
    const onChar = makeOnCharacteristic();
    setupAccessory(onChar);

    simulator.setLatency(1000);

    let resolved = false;
    const p = onChar.getValue().then(() => {
      resolved = true;
    });

    await harness.time.advance(500);
    expect(resolved).toBe(false);

    await harness.time.advance(500);
    await p;
    expect(resolved).toBe(true);
  });

  it("applies latency to setValue()", async () => {
    const onChar = makeOnCharacteristic();
    setupAccessory(onChar);

    simulator.setLatency(800);

    const p = onChar.setValue(true);

    // Value should remain unchanged before latency elapses
    await harness.time.advance(400);
    expect(onChar.value).toBe(false);

    await harness.time.advance(400);
    await expect(p).resolves.toBeUndefined();
    expect(onChar.value).toBe(true);
  });

  it("can simulate packet loss errors", async () => {
    const onChar = makeOnCharacteristic();
    setupAccessory(onChar);

    simulator.setPacketLoss(1.0); // 100% loss
    vi.spyOn(Math, "random").mockReturnValue(0.0);

    await expect(onChar.getValue()).rejects.toEqual(
      new NetworkError(NetworkErrorType.PACKET_LOSS, "Packet lost"),
    );
  });

  it("can simulate disconnection errors", async () => {
    const onChar = makeOnCharacteristic();
    setupAccessory(onChar);

    simulator.disconnect();

    await expect(onChar.setValue(true)).rejects.toEqual(
      new NetworkError(NetworkErrorType.DISCONNECTED, "Network disconnected"),
    );
  });
});
