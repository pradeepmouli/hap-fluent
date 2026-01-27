import { describe, it, expect } from "vitest";
import {
  FluentError,
  FluentCharacteristicError,
  FluentServiceError,
  ValidationError,
  ConfigurationError,
} from "../../src/errors.js";

describe("Error Classes", () => {
  describe("FluentError", () => {
    it("should create error with message", () => {
      const error = new FluentError("Test error");
      expect(error.message).toBe("Test error");
      expect(error.name).toBe("FluentError");
      expect(error).toBeInstanceOf(Error);
    });

    it("should create error with context", () => {
      const context = { foo: "bar", count: 42 };
      const error = new FluentError("Test error", context);
      expect(error.context).toEqual(context);
    });

    it("should capture stack trace", () => {
      const error = new FluentError("Test error");
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("FluentError");
    });
  });

  describe("FluentCharacteristicError", () => {
    it("should create error with characteristic context", () => {
      const error = new FluentCharacteristicError("Failed to set value", {
        characteristic: "On",
        value: true,
      });
      expect(error.message).toBe("Failed to set value");
      expect(error.name).toBe("FluentCharacteristicError");
      expect(error.context).toEqual({
        characteristic: "On",
        value: true,
      });
    });

    it("should include original error in context", () => {
      const originalError = new Error("Original error");
      const error = new FluentCharacteristicError("Operation failed", {
        originalError,
      });
      expect(error.context?.originalError).toBe(originalError);
    });
  });

  describe("FluentServiceError", () => {
    it("should create error with service context", () => {
      const error = new FluentServiceError("Service not found", {
        service: "Lightbulb",
        uuid: "00000043-0000-1000-8000-0026BB765291",
      });
      expect(error.message).toBe("Service not found");
      expect(error.name).toBe("FluentServiceError");
      expect(error.context?.service).toBe("Lightbulb");
      expect(error.context?.uuid).toBe("00000043-0000-1000-8000-0026BB765291");
    });
  });

  describe("ValidationError", () => {
    it("should create error with validation context", () => {
      const error = new ValidationError("Invalid value type", {
        value: "invalid",
        expected: "number",
        actual: "string",
      });
      expect(error.message).toBe("Invalid value type");
      expect(error.name).toBe("ValidationError");
      expect(error.context?.expected).toBe("number");
      expect(error.context?.actual).toBe("string");
    });
  });

  describe("ConfigurationError", () => {
    it("should create error with configuration context", () => {
      const error = new ConfigurationError("Invalid setting", {
        setting: "maxRetries",
        value: -1,
      });
      expect(error.message).toBe("Invalid setting");
      expect(error.name).toBe("ConfigurationError");
      expect(error.context?.setting).toBe("maxRetries");
      expect(error.context?.value).toBe(-1);
    });
  });

  describe("Error inheritance", () => {
    it("should maintain inheritance chain", () => {
      const error = new FluentCharacteristicError("Test");
      expect(error).toBeInstanceOf(FluentCharacteristicError);
      expect(error).toBeInstanceOf(FluentError);
      expect(error).toBeInstanceOf(Error);
    });

    it("should work with instanceof checks", () => {
      const errors = [
        new FluentError("Test"),
        new FluentCharacteristicError("Test"),
        new FluentServiceError("Test"),
        new ValidationError("Test"),
        new ConfigurationError("Test"),
      ];

      errors.forEach((error) => {
        expect(error instanceof FluentError).toBe(true);
        expect(error instanceof Error).toBe(true);
      });
    });
  });
});
