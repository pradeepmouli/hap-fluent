/**
 * Unit tests for HAP validation utilities
 */

import { describe, it, expect } from "vitest";
import {
  validateFormat,
  validateConstraints,
  validatePermission,
  validateCharacteristicValue,
} from "../../src/utils/validation.js";
import { CharacteristicValidationError } from "../../src/errors/CharacteristicValidationError.js";
import type { CharacteristicProps } from "../../src/types/mocks.js";

describe("Format Validation", () => {
  it("should validate bool format", () => {
    expect(validateFormat(true, "bool")).toBe(true);
    expect(validateFormat(false, "bool")).toBe(true);
    expect(validateFormat(1, "bool")).toBe(false);
    expect(validateFormat("true", "bool")).toBe(false);
  });

  it("should validate int format", () => {
    expect(validateFormat(42, "int")).toBe(true);
    expect(validateFormat(-10, "int")).toBe(true);
    expect(validateFormat(3.14, "int")).toBe(false);
    expect(validateFormat("42", "int")).toBe(false);
  });

  it("should validate float format", () => {
    expect(validateFormat(3.14, "float")).toBe(true);
    expect(validateFormat(42, "float")).toBe(true);
    expect(validateFormat("3.14", "float")).toBe(false);
  });

  it("should validate uint formats", () => {
    expect(validateFormat(42, "uint8")).toBe(true);
    expect(validateFormat(256, "uint16")).toBe(true);
    expect(validateFormat(-1, "uint8")).toBe(false);
    expect(validateFormat(3.14, "uint32")).toBe(false);
  });

  it("should validate string format", () => {
    expect(validateFormat("hello", "string")).toBe(true);
    expect(validateFormat("", "string")).toBe(true);
    expect(validateFormat(123, "string")).toBe(false);
  });

  it("should validate data and tlv8 formats", () => {
    const buf = Buffer.from("test") as any;
    expect(validateFormat(buf, "data")).toBe(true);
    expect(validateFormat(buf, "tlv8")).toBe(true);
    expect(validateFormat("encoded", "data")).toBe(true);
    expect(validateFormat(123, "data")).toBe(false);
  });
});

describe("Constraint Validation", () => {
  it("should validate min/max constraints", () => {
    const props: CharacteristicProps = {
      format: "int",
      perms: ["pr", "pw"],
      minValue: 0,
      maxValue: 100,
    };

    expect(validateConstraints(50, props).valid).toBe(true);
    expect(validateConstraints(-1, props).valid).toBe(false);
    expect(validateConstraints(101, props).valid).toBe(false);
  });

  it("should validate step constraint", () => {
    const props: CharacteristicProps = {
      format: "int",
      perms: ["pr", "pw"],
      minValue: 0,
      maxValue: 100,
      minStep: 10,
    };

    expect(validateConstraints(0, props).valid).toBe(true);
    expect(validateConstraints(10, props).valid).toBe(true);
    expect(validateConstraints(20, props).valid).toBe(true);
    expect(validateConstraints(15, props).valid).toBe(false);
  });

  it("should validate valid values (enum)", () => {
    const props: CharacteristicProps = {
      format: "int",
      perms: ["pr", "pw"],
      validValues: [0, 1, 2],
    };

    expect(validateConstraints(0, props).valid).toBe(true);
    expect(validateConstraints(1, props).valid).toBe(true);
    expect(validateConstraints(3, props).valid).toBe(false);
  });

  it("should ignore numeric constraints for non-numeric values", () => {
    const props: CharacteristicProps = {
      format: "string",
      perms: ["pr", "pw"],
      minValue: 0,
      maxValue: 100,
    };

    expect(validateConstraints("hello", props).valid).toBe(true);
  });
});

describe("Permission Validation", () => {
  it("should validate read permission", () => {
    expect(validatePermission("read", ["pr"])).toBe(true);
    expect(validatePermission("read", ["pw"])).toBe(false);
    expect(validatePermission("read", ["pr", "pw"])).toBe(true);
    expect(validatePermission("read", undefined)).toBe(true);
  });

  it("should validate write permission", () => {
    expect(validatePermission("write", ["pw"])).toBe(true);
    expect(validatePermission("write", ["pr"])).toBe(false);
    expect(validatePermission("write", ["pr", "pw"])).toBe(true);
  });

  it("should validate notify permission", () => {
    expect(validatePermission("notify", ["ev"])).toBe(true);
    expect(validatePermission("notify", ["pr", "pw"])).toBe(false);
    expect(validatePermission("notify", ["pr", "ev"])).toBe(true);
  });
});

describe("Comprehensive Validation", () => {
  it("should validate characteristic value with all constraints", () => {
    const props: CharacteristicProps = {
      format: "int",
      perms: ["pr", "pw"],
      minValue: 0,
      maxValue: 100,
    };

    // Valid value
    expect(() => validateCharacteristicValue("Brightness", 50, props, "write")).not.toThrow();

    // Invalid format
    expect(() => validateCharacteristicValue("Brightness", "not-a-number", props, "write")).toThrow(
      CharacteristicValidationError,
    );

    // Out of range
    expect(() => validateCharacteristicValue("Brightness", 150, props, "write")).toThrow(
      CharacteristicValidationError,
    );
  });

  it("should reject write operations on read-only characteristics", () => {
    const props: CharacteristicProps = {
      format: "int",
      perms: ["pr"], // Read-only
    };

    expect(() => validateCharacteristicValue("Status", 42, props, "write")).toThrow(
      CharacteristicValidationError,
    );
    expect(() => validateCharacteristicValue("Status", 42, props, "read")).not.toThrow();
  });

  it("should reject read operations on write-only characteristics", () => {
    const props: CharacteristicProps = {
      format: "int",
      perms: ["pw"], // Write-only
    };

    expect(() => validateCharacteristicValue("Control", 42, props, "read")).toThrow(
      CharacteristicValidationError,
    );
    expect(() => validateCharacteristicValue("Control", 42, props, "write")).not.toThrow();
  });

  it("should include helpful error details", () => {
    const props: CharacteristicProps = {
      format: "int",
      perms: ["pr", "pw"],
      minValue: 0,
      maxValue: 100,
    };

    try {
      validateCharacteristicValue("Brightness", 150, props, "write");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(CharacteristicValidationError);
      const validErr = err as CharacteristicValidationError;
      expect(validErr.characteristicType).toBe("Brightness");
      expect(validErr.value).toBe(150);
      expect(validErr.message).toContain("Brightness");
    }
  });
});
