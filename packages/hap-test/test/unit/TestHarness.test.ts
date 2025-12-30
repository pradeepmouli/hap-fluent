/**
 * Unit tests for TestHarness
 */

import { describe, it, expect } from "vitest";
import { TestHarness } from "../../src/TestHarness.js";

describe("TestHarness", () => {
  it("should create harness with components", async () => {
    const harness = await TestHarness.create({
      // minimal options; platformConstructor is not used in MVP
      // keeping shape consistent with HarnessOptions
      platformConstructor: undefined as unknown as any,
      platformConfig: {} as any,
    });

    expect(harness.api).toBeDefined();
    expect(harness.homeKit).toBeDefined();
    expect(harness.time).toBeDefined();
  });

  it("should wait for registration event", async () => {
    const harness = await TestHarness.create({
      platformConstructor: undefined as unknown as any,
      platformConfig: {} as any,
    });

    const wait = harness.waitForRegistration(200);
    harness.api.emitDidFinishLaunching();
    await expect(wait).resolves.toBeUndefined();
  });

  it("should shutdown and reset time", async () => {
    const harness = await TestHarness.create({
      platformConstructor: undefined as unknown as any,
      platformConfig: {} as any,
    });

    harness.shutdown();
    // No explicit assertion; ensuring no throw and time controller resets
    expect(harness.state.didFinishLaunching).toBe(false);
  });
});
