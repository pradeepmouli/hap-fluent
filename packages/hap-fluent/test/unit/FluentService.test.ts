import { describe, it, expect, beforeEach, vi } from "vitest";
import { getOrAddService, wrapService } from "../../src/FluentService.js";
import {
  MockCharacteristic,
  MockService,
  MockPlatformAccessory,
  createMockLightbulbService,
  createMockSwitchService,
} from "../mocks/homebridge.mock.js";

describe("FluentService", () => {
  let mockAccessory: MockPlatformAccessory;
  let mockService: MockService;

  beforeEach(() => {
    mockAccessory = new MockPlatformAccessory("Test Accessory", "test-uuid");
    mockService = createMockLightbulbService();
  });

  describe("wrapService()", () => {
    it("should wrap a service with fluent interface", () => {
      const fluentService = wrapService(mockService as any);
      expect(fluentService).toBeDefined();
      expect(fluentService.characteristics).toBeDefined();
    });

    it("should create characteristics object with camelCase names", () => {
      const fluentService = wrapService(mockService as any);
      expect(fluentService.characteristics).toHaveProperty("on");
      expect(fluentService.characteristics).toHaveProperty("brightness");
      expect(fluentService.characteristics).toHaveProperty("hue");
      expect(fluentService.characteristics).toHaveProperty("saturation");
    });

    it("should allow getting characteristic values via property access", () => {
      mockService.characteristics[0].value = true;
      const fluentService = wrapService(mockService as any);
      expect(fluentService.on).toBe(true);
    });

    it("should allow setting characteristic values via property access", () => {
      const fluentService = wrapService(mockService as any);
      fluentService.on = true;
      expect(mockService.characteristics[0].value).toBe(true);
    });

    it("should provide onGet method for registering get handlers", () => {
      const fluentService = wrapService(mockService as any);
      const handler = vi.fn(async () => true);
      fluentService.onGet("on" as any, handler);
      expect(mockService.characteristics[0]["getHandler"]).toBeDefined();
    });

    it("should provide onSet method for registering set handlers", () => {
      const fluentService = wrapService(mockService as any);
      const handler = vi.fn(async (value: boolean) => {});
      fluentService.onSet("on" as any, handler);
      expect(mockService.characteristics[0]["setHandler"]).toBeDefined();
    });

    it("should provide update method for updating characteristic values", () => {
      const fluentService = wrapService(mockService as any);
      fluentService.update("on" as any, true);
      expect(mockService.characteristics[0].value).toBe(true);
    });

    it("should handle multiple characteristics correctly", () => {
      const fluentService = wrapService(mockService as any);

      fluentService.update("on" as any, true);
      fluentService.update("brightness" as any, 75);
      fluentService.update("hue" as any, 180);
      fluentService.update("saturation" as any, 50);

      expect(mockService.characteristics[0].value).toBe(true);
      expect(mockService.characteristics[1].value).toBe(75);
      expect(mockService.characteristics[2].value).toBe(180);
      expect(mockService.characteristics[3].value).toBe(50);
    });

    it("should handle numeric characteristic values", () => {
      const fluentService = wrapService(mockService as any);
      fluentService.brightness = 50;
      expect(mockService.characteristics[1].value).toBe(50);
      expect(fluentService.brightness).toBe(50);
    });

    it("should handle boolean characteristic values", () => {
      const fluentService = wrapService(mockService as any);
      fluentService.on = false;
      expect(mockService.characteristics[0].value).toBe(false);
      expect(fluentService.on).toBe(false);
    });
  });

  describe("getOrAddService()", () => {
    it("should add a new service if it does not exist", () => {
      class TestService extends MockService {
        static UUID = "test-service-uuid";
      }

      const fluentService = getOrAddService(
        mockAccessory as any,
        TestService as any,
        "Test Service",
      );
      expect(mockAccessory.services).toHaveLength(1);
      expect(mockAccessory.services[0].UUID).toBe("test-service-uuid");
    });

    it("should return existing service if it already exists", () => {
      class TestService extends MockService {
        static UUID = "test-service-uuid";
      }

      const service1 = new TestService("Test Service", TestService.UUID);
      mockAccessory.addService(service1);

      const fluentService = getOrAddService(
        mockAccessory as any,
        TestService as any,
        "Test Service",
      );
      expect(mockAccessory.services).toHaveLength(1);
    });

    it("should wrap the service with fluent interface", () => {
      class TestService extends MockService {
        static UUID = "test-service-uuid";
        constructor(displayName?: string, UUID?: string, subtype?: string) {
          super(displayName, UUID, subtype);
          this.addCharacteristic(new MockCharacteristic("Power", "power-uuid"));
        }
      }

      const fluentService = getOrAddService(
        mockAccessory as any,
        TestService as any,
        "Test Service",
      );
      expect(fluentService.characteristics).toBeDefined();
      expect(fluentService.characteristics).toHaveProperty("power");
    });

    it("should handle service with subtype", () => {
      class TestService extends MockService {
        static UUID = "test-service-uuid";
      }

      const fluentService = getOrAddService(
        mockAccessory as any,
        TestService as any,
        "Test Service",
        "subtype1",
      );
      expect(mockAccessory.services).toHaveLength(1);
      expect(mockAccessory.services[0].subtype).toBe("subtype1");
    });

    it("should throw error if service class is not a function", () => {
      expect(() => {
        getOrAddService(mockAccessory as any, null as any);
      }).toThrow("Service class must be a constructor function");
    });

    it("should throw error if service class does not have UUID", () => {
      const invalidService = function () {} as any;
      expect(() => {
        getOrAddService(mockAccessory as any, invalidService);
      }).toThrow("Service class must have a UUID property");
    });

    it("should handle multiple services of same type with different subtypes", () => {
      class TestService extends MockService {
        static UUID = "test-service-uuid";
      }

      const service1 = getOrAddService(
        mockAccessory as any,
        TestService as any,
        "Test Service 1",
        "subtype1",
      );
      const service2 = getOrAddService(
        mockAccessory as any,
        TestService as any,
        "Test Service 2",
        "subtype2",
      );

      expect(mockAccessory.services).toHaveLength(2);
    });
  });

  describe("FluentService integration", () => {
    it("should allow complex interactions with characteristics", async () => {
      const fluentService = wrapService(mockService as any);

      const getHandler = vi.fn(async () => true);
      const setHandler = vi.fn(async (value: boolean) => {});

      fluentService.onGet("on" as any, getHandler);
      fluentService.onSet("on" as any, setHandler);
      fluentService.update("on" as any, false);

      expect(mockService.characteristics[0].value).toBe(false);

      const value = await mockService.characteristics[0].handleGet();
      expect(getHandler).toHaveBeenCalled();
      expect(value).toBe(true);

      await mockService.characteristics[0].handleSet(true);
      expect(setHandler).toHaveBeenCalledWith(true);
    });

    it("should handle multiple services correctly", () => {
      const lightbulbService = createMockLightbulbService();
      const switchService = createMockSwitchService();

      const fluentLightbulb = wrapService(lightbulbService as any);
      const fluentSwitch = wrapService(switchService as any);

      fluentLightbulb.on = true;
      fluentSwitch.on = false;

      expect(lightbulbService.characteristics[0].value).toBe(true);
      expect(switchService.characteristics[0].value).toBe(false);
    });

    it("should maintain separate state for each characteristic", () => {
      const fluentService = wrapService(mockService as any);

      fluentService.update("on" as any, true);
      fluentService.update("brightness" as any, 50);
      fluentService.update("hue" as any, 180);

      expect(fluentService.on).toBe(true);
      expect(fluentService.brightness).toBe(50);
      expect(fluentService.hue).toBe(180);
    });

    it("should work with property getters and setters", () => {
      const fluentService = wrapService(mockService as any);

      fluentService.on = true;
      expect(fluentService.on).toBe(true);

      fluentService.brightness = 75;
      expect(fluentService.brightness).toBe(75);
    });
  });

  describe("error handling", () => {
    it("should handle missing characteristics gracefully", () => {
      const emptyService = new MockService("Empty", "empty-uuid");
      const fluentService = wrapService(emptyService as any);

      expect(fluentService.characteristics).toBeDefined();
      expect(Object.keys(fluentService.characteristics)).toHaveLength(0);
    });

    it("should handle undefined characteristic values", () => {
      const fluentService = wrapService(mockService as any);
      expect(fluentService.on).toBeUndefined();
    });

    it("should handle setting values on characteristics without handlers", () => {
      const fluentService = wrapService(mockService as any);
      expect(() => {
        fluentService.on = true;
      }).not.toThrow();
    });
  });
});
