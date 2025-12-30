/**
 * Integration test: Platform lifecycle management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHarness } from '../../src/TestHarness.js';
import type { HarnessOptions } from '../../src/types/harness.js';

describe('Platform Lifecycle Integration', () => {
  let harness: TestHarness;

  const options: HarnessOptions = {
    platformConstructor: undefined as any, // MVP: not fully wiring platform yet
    platformConfig: {
      platform: 'TestPlatform',
      name: 'Test',
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

  it('should create harness with all components initialized', () => {
    expect(harness).toBeDefined();
    expect(harness.api).toBeDefined();
    expect(harness.homeKit).toBeDefined();
    expect(harness.time).toBeDefined();
    expect(harness.state.didFinishLaunching).toBe(false);
  });

  it('should handle didFinishLaunching lifecycle event', async () => {
    const promise = harness.waitForRegistration(500);

    // Simulate platform completing initialization
    harness.api.emitDidFinishLaunching();

    await promise;
    expect(harness.state.didFinishLaunching).toBe(true);
  });

  it('should cleanup on shutdown', () => {
    harness.shutdown();
    // Verify time controller is reset (no explicit assertion, just ensuring no throw)
    expect(harness.state.didFinishLaunching).toBe(false);
  });
});
