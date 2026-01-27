import { describe, it, expect, beforeEach, vi } from "vitest";
import { Service } from "hap-nodejs";
import {
  AccessoryHandler,
  createServicesObject,
  isMultiService,
} from "../../src/FluentAccessory.js";
import { MockPlatformAccessory } from "../mocks/homebridge.mock.js";

describe("FluentAccessory", () => {
  let mockAccessory: MockPlatformAccessory;
  let mockPlugin: any;
  let mockApi: any;

  beforeEach(() => {
    mockAccessory = new MockPlatformAccessory("Test Accessory", "test-uuid");
    mockPlugin = {
      log: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
      },
    };
    mockApi = {
      hap: {
        Service: {},
      },
    };
  });

  describe("isMultiService()", () => {
    it("should return false for single service state", () => {
      const state = { on: true, brightness: 50 };
      expect(isMultiService(state)).toBe(false);
    });

    it("should return true for multi-service state", () => {
      const state = {
        service1: { on: true },
        service2: { on: false },
      };
      expect(isMultiService(state)).toBe(true);
    });

    it("should return false for empty object", () => {
      const state = {};
      expect(isMultiService(state)).toBe(false);
    });

    it("should return false for single key object", () => {
      const state = { on: true };
      expect(isMultiService(state)).toBe(false);
    });
  });

  describe("createServicesObject()", () => {
    it("should create services object from service instances", () => {
      const lightbulbService = new Service.Lightbulb();
      const services = createServicesObject(lightbulbService);

      expect(services).toBeDefined();
      expect(services).toHaveProperty("lightbulb");
    });

    it("should handle multiple services", () => {
      const lightbulbService = new Service.Lightbulb();
      const switchService = new Service.Switch();
      const services = createServicesObject(lightbulbService, switchService);

      expect(services).toHaveProperty("lightbulb");
      expect(services).toHaveProperty("switch");
    });

    it("should wrap services with fluent interface", () => {
      const lightbulbService = new Service.Lightbulb();
      const services = createServicesObject(lightbulbService) as unknown as {
        lightbulb: { characteristics: unknown };
      };

      expect(services.lightbulb).toBeDefined();
      expect(services.lightbulb.characteristics).toBeDefined();
    });

    it("should handle services with subtypes", () => {
      const service1 = new Service.Switch("Outlet 1", "outlet1");
      const service2 = new Service.Switch("Outlet 2", "outlet2");

      const services = createServicesObject(service1, service2) as unknown as {
        switch: Record<string, unknown>;
      };

      // Should have switch property with subtypes
      expect(services).toHaveProperty("switch");
      expect(services.switch).toHaveProperty("primary");
      expect(services.switch).toHaveProperty("outlet1");
    });

    it("should handle empty services array", () => {
      const services = createServicesObject();
      expect(services).toBeDefined();
      expect(Object.keys(services)).toHaveLength(0);
    });

    it("should create camelCase property names", () => {
      const thermostatService = new Service.Thermostat();
      const services = createServicesObject(thermostatService);

      expect(services).toHaveProperty("thermostat");
    });
  });

  describe("AccessoryHandler", () => {
    it("should create an AccessoryHandler instance", () => {
      const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);
      expect(handler).toBeInstanceOf(AccessoryHandler);
    });

    it("should expose accessory context", () => {
      mockAccessory.context = { customData: "test" };
      const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);
      expect(handler.context).toEqual({ customData: "test" });
    });

    it("should create services object from accessory services", () => {
      const lightbulbService = new Service.Lightbulb();
      mockAccessory.addService(lightbulbService as any);

      const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);
      expect(handler.services).toBeDefined();
    });

    it("should expose the underlying accessory", () => {
      const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);
      expect(handler.accessory).toBe(mockAccessory);
    });

    describe("addService()", () => {
      it("should add a new service to the accessory", () => {
        const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);

        const result = handler.with(Service.Lightbulb, "Test Light");
        expect(mockAccessory.services).toHaveLength(1);
        expect(result).toBeInstanceOf(AccessoryHandler);
      });

      it("should wrap the added service with fluent interface", () => {
        const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);

        const result = handler.with(Service.Switch, "Test Switch");
        // The service is now available through services property
        const serviceKey = Object.keys(result.services).find(
          (key) => key !== "accessoryInformation",
        );
        if (serviceKey) {
          const service = (result.services as any)[serviceKey];
          expect(service.characteristics).toBeDefined();
        }
      });

      it("should handle adding service with subtype", () => {
        const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);

        handler.with(Service.Switch, "Test Switch", "subtype1");
        expect(mockAccessory.services[0].subtype).toBe("subtype1");
      });
    });

    describe("initialize()", () => {
      it("should initialize with state", () => {
        const lightbulbService = new Service.Lightbulb();
        mockAccessory.addService(lightbulbService as any);

        const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);

        const result = handler.initialize({
          lightbulb: {
            on: true,
            brightness: 50,
          },
        } as any);

        expect(result).toBeDefined();
        expect(result.services).toBeDefined();
      });

      it("should initialize without state", () => {
        const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);
        const result = handler.initialize();
        expect(result).toBeDefined();
      });

      it("should handle empty state object", () => {
        const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);
        const result = handler.initialize({} as any);
        expect(result).toBeDefined();
      });
    });
  });

  describe("AccessoryHandler integration", () => {
    it("should handle multiple services correctly", () => {
      const lightbulbService = new Service.Lightbulb();
      const switchService = new Service.Switch();
      mockAccessory.addService(lightbulbService as any);
      mockAccessory.addService(switchService as any);

      const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);
      expect(mockAccessory.services).toHaveLength(2);
    });

    it("should maintain context throughout lifecycle", () => {
      mockAccessory.context = { deviceId: "12345" };
      const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);

      expect(handler.context).toEqual({ deviceId: "12345" });

      handler.initialize();
      expect(handler.context).toEqual({ deviceId: "12345" });
    });

    it("should allow adding services after construction", () => {
      const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);

      handler.with(Service.Lightbulb, "Light 1");
      handler.with(Service.Switch, "Switch 1");

      expect(mockAccessory.services).toHaveLength(2);
    });
  });

  describe("error handling", () => {
    it("should handle accessory with no services", () => {
      const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);
      expect(handler.services).toBeDefined();
      expect(Object.keys(handler.services)).toHaveLength(0);
    });

    it("should handle invalid service class in addService", () => {
      const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);

      expect(() => {
        handler.with(null as any, "Invalid Service");
      }).toThrow();
    });
  });
});
