import { describe, it, expect, beforeEach, vi } from "vitest";
import { FluentCharacteristic } from "../src/FluentCharacteristic.js";
import { MockCharacteristic } from "./mocks/homebridge.mock.js";

describe("FluentCharacteristic", () => {
  let mockCharacteristic: MockCharacteristic;
  let fluentCharacteristic: FluentCharacteristic<boolean>;

  beforeEach(() => {
    mockCharacteristic = new MockCharacteristic("On", "on-uuid");
    fluentCharacteristic = new FluentCharacteristic(mockCharacteristic as any);
  });

  describe("constructor", () => {
    it("should create a FluentCharacteristic instance", () => {
      expect(fluentCharacteristic).toBeInstanceOf(FluentCharacteristic);
    });
  });

  describe("get()", () => {
    it("should return the current value", () => {
      mockCharacteristic.value = true;
      expect(fluentCharacteristic.get()).toBe(true);
    });

    it("should return undefined if no value is set", () => {
      expect(fluentCharacteristic.get()).toBeUndefined();
    });

    it("should return numeric values correctly", () => {
      const numericChar = new MockCharacteristic("Brightness", "brightness-uuid");
      numericChar.value = 75;
      const fluentNumeric = new FluentCharacteristic<number>(numericChar as any);
      expect(fluentNumeric.get()).toBe(75);
    });

    it("should return string values correctly", () => {
      const stringChar = new MockCharacteristic("Name", "name-uuid");
      stringChar.value = "Test Name";
      const fluentString = new FluentCharacteristic<string>(stringChar as any);
      expect(fluentString.get()).toBe("Test Name");
    });
  });

  describe("set()", () => {
    it("should set the characteristic value", () => {
      fluentCharacteristic.set(true);
      expect(mockCharacteristic.value).toBe(true);
    });

    it("should return this for chaining", () => {
      const result = fluentCharacteristic.set(false);
      expect(result).toBe(fluentCharacteristic);
    });

    it("should allow method chaining", () => {
      fluentCharacteristic.set(true).set(false);
      expect(mockCharacteristic.value).toBe(false);
    });

    it("should set numeric values", () => {
      const numericChar = new MockCharacteristic("Brightness", "brightness-uuid");
      const fluentNumeric = new FluentCharacteristic<number>(numericChar as any);
      fluentNumeric.set(50);
      expect(numericChar.value).toBe(50);
    });
  });

  describe("update()", () => {
    it("should update the characteristic value", () => {
      fluentCharacteristic.update(true);
      expect(mockCharacteristic.value).toBe(true);
    });

    it("should return this for chaining", () => {
      const result = fluentCharacteristic.update(false);
      expect(result).toBe(fluentCharacteristic);
    });

    it("should allow method chaining with update", () => {
      fluentCharacteristic.update(true).update(false);
      expect(mockCharacteristic.value).toBe(false);
    });

    it("should update numeric values", () => {
      const numericChar = new MockCharacteristic("Brightness", "brightness-uuid");
      const fluentNumeric = new FluentCharacteristic<number>(numericChar as any);
      fluentNumeric.update(75);
      expect(numericChar.value).toBe(75);
    });
  });

  describe("onGet()", () => {
    it("should register a get handler", () => {
      const handler = vi.fn(async () => true);
      fluentCharacteristic.onGet(handler);
      expect(mockCharacteristic["getHandler"]).toBeDefined();
    });

    it("should return this for chaining", () => {
      const handler = async () => true;
      const result = fluentCharacteristic.onGet(handler);
      expect(result).toBe(fluentCharacteristic);
    });

    it("should call the handler when characteristic is read", async () => {
      const handler = vi.fn(async () => true);
      fluentCharacteristic.onGet(handler);
      const value = await mockCharacteristic.handleGet();
      expect(handler).toHaveBeenCalled();
      expect(value).toBe(true);
    });

    it("should handle async handlers correctly", async () => {
      const handler = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return false;
      });
      fluentCharacteristic.onGet(handler);
      const value = await mockCharacteristic.handleGet();
      expect(handler).toHaveBeenCalled();
      expect(value).toBe(false);
    });
  });

  describe("onSet()", () => {
    it("should register a set handler", () => {
      const handler = vi.fn(async (value: boolean) => {});
      fluentCharacteristic.onSet(handler);
      expect(mockCharacteristic["setHandler"]).toBeDefined();
    });

    it("should return this for chaining", () => {
      const handler = async (value: boolean) => {};
      const result = fluentCharacteristic.onSet(handler);
      expect(result).toBe(fluentCharacteristic);
    });

    it("should call the handler when characteristic is written", async () => {
      const handler = vi.fn(async (value: boolean) => {});
      fluentCharacteristic.onSet(handler);
      await mockCharacteristic.handleSet(true);
      expect(handler).toHaveBeenCalledWith(true);
    });

    it("should handle async set handlers correctly", async () => {
      let capturedValue: boolean | undefined;
      const handler = vi.fn(async (value: boolean) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        capturedValue = value;
      });
      fluentCharacteristic.onSet(handler);
      await mockCharacteristic.handleSet(false);
      expect(handler).toHaveBeenCalledWith(false);
      expect(capturedValue).toBe(false);
    });
  });

  describe("setProps()", () => {
    it("should set characteristic properties", () => {
      const props = { minValue: 0, maxValue: 100, minStep: 1 };
      fluentCharacteristic.setProps(props);
      expect(mockCharacteristic.props).toMatchObject(props);
    });

    it("should return this for chaining", () => {
      const props = { minValue: 0, maxValue: 100 };
      const result = fluentCharacteristic.setProps(props);
      expect(result).toBe(fluentCharacteristic);
    });

    it("should allow chaining with setProps", () => {
      const numericChar = new MockCharacteristic("Brightness", "brightness-uuid");
      const fluentNumeric = new FluentCharacteristic<number>(numericChar as any);

      fluentNumeric.setProps({ minValue: 0, maxValue: 100 }).set(50).setProps({ minStep: 1 });

      expect(numericChar.props).toMatchObject({
        minValue: 0,
        maxValue: 100,
        minStep: 1,
      });
      expect(numericChar.value).toBe(50);
    });

    it("should handle partial property updates", () => {
      fluentCharacteristic.setProps({ minValue: 0 });
      expect(mockCharacteristic.props.minValue).toBe(0);

      fluentCharacteristic.setProps({ maxValue: 100 });
      expect(mockCharacteristic.props.maxValue).toBe(100);
      expect(mockCharacteristic.props.minValue).toBe(0);
    });

    it("should handle null values in properties", () => {
      fluentCharacteristic.setProps({ minValue: null as any });
      expect(mockCharacteristic.props.minValue).toBeNull();
    });
  });

  describe("method chaining", () => {
    it("should allow complex method chaining", () => {
      const handler = vi.fn(async () => true);
      const setHandler = vi.fn(async (value: boolean) => {});

      const result = fluentCharacteristic
        .setProps({ minValue: 0, maxValue: 1 })
        .set(true)
        .onGet(handler)
        .onSet(setHandler)
        .update(false);

      expect(result).toBe(fluentCharacteristic);
      expect(mockCharacteristic.value).toBe(false);
      expect(mockCharacteristic.props).toMatchObject({ minValue: 0, maxValue: 1 });
    });

    it("should maintain state through chaining", () => {
      const numericChar = new MockCharacteristic("Brightness", "brightness-uuid");
      const fluentNumeric = new FluentCharacteristic<number>(numericChar as any);

      fluentNumeric.set(0).setProps({ minValue: 0, maxValue: 100 }).update(50).set(75);

      expect(numericChar.value).toBe(75);
      expect(numericChar.props).toMatchObject({ minValue: 0, maxValue: 100 });
    });
  });

  describe("type safety", () => {
    it("should work with boolean types", () => {
      const boolChar = new MockCharacteristic("On", "on-uuid");
      const fluentBool = new FluentCharacteristic<boolean>(boolChar as any);

      fluentBool.set(true);
      expect(fluentBool.get()).toBe(true);
    });

    it("should work with number types", () => {
      const numChar = new MockCharacteristic("Brightness", "brightness-uuid");
      const fluentNum = new FluentCharacteristic<number>(numChar as any);

      fluentNum.set(50);
      expect(fluentNum.get()).toBe(50);
    });

    it("should work with string types", () => {
      const strChar = new MockCharacteristic("Name", "name-uuid");
      const fluentStr = new FluentCharacteristic<string>(strChar as any);

      fluentStr.set("Test");
      expect(fluentStr.get()).toBe("Test");
    });
  });
});
