/**
 * Property-based tests for service operations
 *
 * Uses fast-check to verify service characteristic access patterns
 * work correctly across various inputs.
 */

import { describe, expect } from "vitest";
import { fc, test } from "@fast-check/vitest";
import { wrapService } from "../../src/FluentService.js";
import { MockService, MockCharacteristic } from "../mocks/homebridge.mock.js";

describe("FluentService Operations Property-Based Tests", () => {
  describe("Service wrapping", () => {
    test.prop([fc.constantFrom("Lightbulb", "Switch", "Fan", "Outlet")])(
      "should wrap any service type",
      (serviceType) => {
        const mockService = new MockService(serviceType, `${serviceType}-uuid`);
        mockService.characteristics = [new MockCharacteristic("On", "on-uuid")];

        const wrapped = wrapService(mockService as any);

        expect(wrapped).toBeDefined();
        expect(wrapped.characteristics).toBeDefined();
        expect(wrapped.characteristics.on).toBeDefined();
      },
    );
  });

  describe("Characteristic access patterns", () => {
    test.prop([fc.boolean()])("should handle ON characteristic access", async (value) => {
      const mockService = new MockService("Lightbulb", "lightbulb-uuid");
      mockService.characteristics = [new MockCharacteristic("On", "on-uuid")];

      const wrapped = wrapService(mockService as any);

      await wrapped.characteristics.on.set(value);
      const result = await wrapped.characteristics.on.get();

      expect(result).toBe(value);
    });

    test.prop([fc.integer({ min: 0, max: 100 })])(
      "should handle BRIGHTNESS characteristic access",
      async (value) => {
        const mockService = new MockService("Lightbulb", "lightbulb-uuid");
        mockService.characteristics = [
          new MockCharacteristic("On", "on-uuid"),
          new MockCharacteristic("Brightness", "brightness-uuid"),
        ];

        const wrapped = wrapService(mockService as any);

        await wrapped.characteristics.brightness.set(value);
        const result = await wrapped.characteristics.brightness.get();

        expect(result).toBe(value);
      },
    );

    test.prop([
      fc.record({
        on: fc.boolean(),
        brightness: fc.integer({ min: 0, max: 100 }),
      }),
    ])("should handle multiple characteristics simultaneously", async (values) => {
      const mockService = new MockService("Lightbulb", "lightbulb-uuid");
      mockService.characteristics = [
        new MockCharacteristic("On", "on-uuid"),
        new MockCharacteristic("Brightness", "brightness-uuid"),
      ];

      const wrapped = wrapService(mockService as any);

      await wrapped.characteristics.on.set(values.on);
      await wrapped.characteristics.brightness.set(values.brightness);

      expect(await wrapped.characteristics.on.get()).toBe(values.on);
      expect(await wrapped.characteristics.brightness.get()).toBe(values.brightness);
    });
  });

  describe("Update method", () => {
    test.prop([fc.boolean()])("should update ON via update method", (value) => {
      const mockService = new MockService("Switch", "switch-uuid");
      mockService.characteristics = [new MockCharacteristic("On", "on-uuid")];

      const wrapped = wrapService(mockService as any);

      wrapped.update("on", value);

      expect(mockService.characteristics[0].value).toBe(value);
    });

    test.prop([fc.integer({ min: 0, max: 100 })])(
      "should update BRIGHTNESS via update method",
      (value) => {
        const mockService = new MockService("Lightbulb", "lightbulb-uuid");
        mockService.characteristics = [
          new MockCharacteristic("On", "on-uuid"),
          new MockCharacteristic("Brightness", "brightness-uuid"),
        ];

        const wrapped = wrapService(mockService as any);

        wrapped.update("brightness", value);

        expect(mockService.characteristics[1].value).toBe(value);
      },
    );

    test.prop([
      fc.array(
        fc.record({
          on: fc.boolean(),
          brightness: fc.integer({ min: 0, max: 100 }),
        }),
        { minLength: 1, maxLength: 10 },
      ),
    ])("should handle sequence of updates", (sequence) => {
      const mockService = new MockService("Lightbulb", "lightbulb-uuid");
      mockService.characteristics = [
        new MockCharacteristic("On", "on-uuid"),
        new MockCharacteristic("Brightness", "brightness-uuid"),
      ];

      const wrapped = wrapService(mockService as any);

      for (const values of sequence) {
        wrapped.update("on", values.on);
        wrapped.update("brightness", values.brightness);
      }

      const lastValues = sequence[sequence.length - 1];
      expect(mockService.characteristics[0].value).toBe(lastValues.on);
      expect(mockService.characteristics[1].value).toBe(lastValues.brightness);
    });
  });

  describe("Characteristic name casing", () => {
    test.prop([fc.boolean()])("should access ON with camelCase", async (value) => {
      const mockService = new MockService("Switch", "switch-uuid");
      mockService.characteristics = [new MockCharacteristic("On", "on-uuid")];

      const wrapped = wrapService(mockService as any);

      await wrapped.characteristics.on.set(value);
      expect(await wrapped.characteristics.on.get()).toBe(value);
    });
  });

  describe("Handler registration", () => {
    test.prop([fc.boolean()])("should register onGet handler", async (returnValue) => {
      const mockService = new MockService("Switch", "switch-uuid");
      mockService.characteristics = [new MockCharacteristic("On", "on-uuid")];

      const wrapped = wrapService(mockService as any);

      wrapped.onGet("on", async () => returnValue);

      const handler = mockService.characteristics[0]["getHandler"];
      expect(handler).toBeDefined();
      if (handler) {
        const result = await handler();
        expect(result).toBe(returnValue);
      }
    });

    test.prop([fc.boolean()])("should register onSet handler", async (testValue) => {
      const mockService = new MockService("Switch", "switch-uuid");
      mockService.characteristics = [new MockCharacteristic("On", "on-uuid")];

      const wrapped = wrapService(mockService as any);

      let receivedValue: any = null;
      wrapped.onSet("on", async (value) => {
        receivedValue = value;
      });

      const handler = mockService.characteristics[0]["setHandler"];
      expect(handler).toBeDefined();
      if (handler) {
        await handler(testValue);
        expect(receivedValue).toBe(testValue);
      }
    });
  });

  describe("Complex service scenarios", () => {
    test.prop([
      fc.record({
        currentTemp: fc.float({ min: -40, max: 60, noNaN: true }),
        targetTemp: fc.float({ min: 10, max: 35, noNaN: true }),
        state: fc.integer({ min: 0, max: 3 }),
      }),
    ])("should handle thermostat state updates", async (thermostatState) => {
      const mockService = new MockService("Thermostat", "thermostat-uuid");
      mockService.characteristics = [
        new MockCharacteristic("CurrentTemperature", "current-temp-uuid"),
        new MockCharacteristic("TargetTemperature", "target-temp-uuid"),
        new MockCharacteristic("TargetHeatingCoolingState", "target-state-uuid"),
      ];

      const wrapped = wrapService(mockService as any);

      wrapped.update("currentTemperature", thermostatState.currentTemp);
      wrapped.update("targetTemperature", thermostatState.targetTemp);
      wrapped.update("targetHeatingCoolingState", thermostatState.state);

      expect(await wrapped.characteristics.currentTemperature.get()).toBeCloseTo(
        thermostatState.currentTemp,
        2,
      );
      expect(await wrapped.characteristics.targetTemperature.get()).toBeCloseTo(
        thermostatState.targetTemp,
        2,
      );
      expect(await wrapped.characteristics.targetHeatingCoolingState.get()).toBe(
        thermostatState.state,
      );
    });

    test.prop([
      fc.array(
        fc.record({
          on: fc.boolean(),
        }),
        { minLength: 5, maxLength: 20 },
      ),
    ])("should handle rapid fan control updates", (controlSequence) => {
      const mockService = new MockService("Fan", "fan-uuid");
      mockService.characteristics = [new MockCharacteristic("On", "on-uuid")];

      const wrapped = wrapService(mockService as any);

      for (const control of controlSequence) {
        wrapped.update("on", control.on);
      }

      const lastControl = controlSequence[controlSequence.length - 1];
      expect(mockService.characteristics[0].value).toBe(lastControl.on);
    });
  });
});
