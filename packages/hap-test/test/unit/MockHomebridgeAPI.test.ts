/**
 * Unit tests for MockHomebridgeAPI
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { MockHomebridgeAPI } from "../../src/MockHomebridgeAPI.js";
import type { PlatformAccessory } from "homebridge";

describe("MockHomebridgeAPI", () => {
  let mockAPI: MockHomebridgeAPI;

  beforeEach(() => {
    mockAPI = new MockHomebridgeAPI();
  });

  describe("initialization", () => {
    it("should initialize with empty accessories list", () => {
      expect(mockAPI.platformAccessories()).toHaveLength(0);
    });

    it("should provide HAP types", () => {
      expect(mockAPI.hap).toBeDefined();
      expect(mockAPI.hap.Characteristic).toBeDefined();
      expect(mockAPI.hap.Service).toBeDefined();
    });

    it("should provide platformAccessory constructor", () => {
      expect(mockAPI.platformAccessory).toBeDefined();
    });
  });

  describe("accessory registration", () => {
    it("should register platform accessories", () => {
      const accessories = createMockAccessories(2);

      mockAPI.registerPlatformAccessories("test-plugin", "TestPlatform", accessories);

      expect(mockAPI.platformAccessories()).toHaveLength(2);
    });

    it("should emit accessory registered events", () => {
      const handler = vi.fn();
      mockAPI.on("registerPlatformAccessories", handler);

      const accessories = createMockAccessories(1);
      mockAPI.registerPlatformAccessories("test-plugin", "TestPlatform", accessories);

      expect(handler).toHaveBeenCalledWith(accessories);
    });

    it("should prevent duplicate registrations", () => {
      const accessories = createMockAccessories(1);

      mockAPI.registerPlatformAccessories("test-plugin", "TestPlatform", accessories);
      mockAPI.registerPlatformAccessories("test-plugin", "TestPlatform", accessories);

      expect(mockAPI.platformAccessories()).toHaveLength(1);
    });

    it("should handle multiple registration calls", () => {
      const batch1 = createMockAccessories(2);
      const batch2 = createMockAccessories(3);

      mockAPI.registerPlatformAccessories("test-plugin", "TestPlatform", batch1);
      mockAPI.registerPlatformAccessories("test-plugin", "TestPlatform", batch2);

      expect(mockAPI.platformAccessories()).toHaveLength(5);
    });
  });

  describe("accessory unregistration", () => {
    it("should unregister platform accessories", () => {
      const accessories = createMockAccessories(3);

      mockAPI.registerPlatformAccessories("test-plugin", "TestPlatform", accessories);
      mockAPI.unregisterPlatformAccessories("test-plugin", "TestPlatform", [accessories[1]]);

      expect(mockAPI.platformAccessories()).toHaveLength(2);
    });

    it("should emit unregister events", () => {
      const handler = vi.fn();
      mockAPI.on("unregisterPlatformAccessories", handler);

      const accessories = createMockAccessories(1);
      mockAPI.registerPlatformAccessories("test-plugin", "TestPlatform", accessories);
      mockAPI.unregisterPlatformAccessories("test-plugin", "TestPlatform", accessories);

      expect(handler).toHaveBeenCalledWith(accessories);
    });

    it("should handle unregistering non-existent accessories gracefully", () => {
      const accessories = createMockAccessories(1);

      expect(() => {
        mockAPI.unregisterPlatformAccessories("test-plugin", "TestPlatform", accessories);
      }).not.toThrow();
    });
  });

  describe("accessory updates", () => {
    it("should update platform accessories", () => {
      const accessories = createMockAccessories(1);

      mockAPI.registerPlatformAccessories("test-plugin", "TestPlatform", accessories);

      // Modify accessory
      accessories[0].displayName = "Updated Name";
      mockAPI.updatePlatformAccessories(accessories);

      const updated = mockAPI.platformAccessories()[0];
      expect(updated.displayName).toBe("Updated Name");
    });

    it("should emit update events", () => {
      const handler = vi.fn();
      mockAPI.on("updatePlatformAccessories", handler);

      const accessories = createMockAccessories(1);
      mockAPI.registerPlatformAccessories("test-plugin", "TestPlatform", accessories);
      mockAPI.updatePlatformAccessories(accessories);

      expect(handler).toHaveBeenCalledWith(accessories);
    });
  });

  describe("lifecycle events", () => {
    it("should emit didFinishLaunching event", () => {
      const handler = vi.fn();
      mockAPI.on("didFinishLaunching", handler);

      mockAPI.emitDidFinishLaunching();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should emit shutdown event", () => {
      const handler = vi.fn();
      mockAPI.on("shutdown", handler);

      mockAPI.emitShutdown();

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("storage", () => {
    it("should provide persistent storage path", () => {
      const path = mockAPI.user.persistPath();

      expect(path).toBeDefined();
      expect(typeof path).toBe("string");
    });

    it("should provide cached accessories path", () => {
      const path = mockAPI.user.cachedAccessoryPath();

      expect(path).toBeDefined();
      expect(typeof path).toBe("string");
    });

    it("should provide config path", () => {
      const path = mockAPI.user.configPath();

      expect(path).toBeDefined();
      expect(typeof path).toBe("string");
    });
  });
});

/**
 * Helper to create mock accessories for testing
 */
let accessoryCounter = 0;
function createMockAccessories(count: number): PlatformAccessory[] {
  return Array.from({ length: count }, (_, i) => {
    const id = accessoryCounter++;
    return {
      UUID: `test-uuid-${id}`,
      displayName: `Test Accessory ${id}`,
      category: 1,
      services: [],
      context: {},
      getService: vi.fn(),
      addService: vi.fn(),
      removeService: vi.fn(),
      getServiceById: vi.fn(),
    } as any as PlatformAccessory;
  });
}
