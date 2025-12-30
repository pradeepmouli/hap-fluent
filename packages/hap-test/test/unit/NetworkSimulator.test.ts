/**
 * Unit tests for NetworkSimulator
 */

import { describe, it, expect, beforeEach } from "vitest";
import { NetworkSimulator } from "../../src/NetworkSimulator.js";
import { NetworkError, NetworkErrorType } from "../../src/errors/NetworkError.js";

describe("NetworkSimulator", () => {
  let simulator: NetworkSimulator;

  beforeEach(() => {
    simulator = new NetworkSimulator();
  });

  describe("Latency", () => {
    it("should add delay to operations", async () => {
      simulator.setLatency(100);

      const start = Date.now();
      await simulator.applyConditions(async () => "result");
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(90); // Allow 10ms tolerance
    });

    it("should reject negative latency", () => {
      expect(() => simulator.setLatency(-10)).toThrow("Latency cannot be negative");
    });

    it("should allow zero latency", async () => {
      simulator.setLatency(0);

      const start = Date.now();
      await simulator.applyConditions(async () => "result");
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });

  describe("Packet Loss", () => {
    it("should throw error when packet is lost", async () => {
      simulator.setPacketLoss(1.0); // 100% loss

      await expect(simulator.applyConditions(async () => "result")).rejects.toThrow(NetworkError);
    });

    it("should succeed when packet is not lost", async () => {
      simulator.setPacketLoss(0.0); // 0% loss

      const result = await simulator.applyConditions(async () => "success");
      expect(result).toBe("success");
    });

    it("should reject invalid packet loss rates", () => {
      expect(() => simulator.setPacketLoss(-0.1)).toThrow(
        "Packet loss rate must be between 0 and 1",
      );
      expect(() => simulator.setPacketLoss(1.1)).toThrow(
        "Packet loss rate must be between 0 and 1",
      );
    });

    it("should throw NetworkError with PACKET_LOSS type", async () => {
      simulator.setPacketLoss(1.0);

      try {
        await simulator.applyConditions(async () => "result");
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(NetworkError);
        expect((err as NetworkError).errorType).toBe(NetworkErrorType.PACKET_LOSS);
      }
    });
  });

  describe("Disconnection", () => {
    it("should throw error when disconnected", async () => {
      simulator.disconnect();

      await expect(simulator.applyConditions(async () => "result")).rejects.toThrow(NetworkError);
    });

    it("should succeed after reconnect", async () => {
      simulator.disconnect();
      simulator.reconnect();

      const result = await simulator.applyConditions(async () => "success");
      expect(result).toBe("success");
    });

    it("should throw NetworkError with DISCONNECTED type", async () => {
      simulator.disconnect();

      try {
        await simulator.applyConditions(async () => "result");
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(NetworkError);
        expect((err as NetworkError).errorType).toBe(NetworkErrorType.DISCONNECTED);
      }
    });
  });

  describe("Reset", () => {
    it("should reset all conditions", async () => {
      simulator.setLatency(100);
      simulator.setPacketLoss(1.0);
      simulator.disconnect();

      simulator.reset();

      const conditions = simulator.getConditions();
      expect(conditions.latency).toBe(0);
      expect(conditions.packetLoss).toBe(0);
      expect(conditions.disconnected).toBe(false);

      // Should succeed after reset
      const result = await simulator.applyConditions(async () => "success");
      expect(result).toBe("success");
    });
  });

  describe("Combined Conditions", () => {
    it("should apply latency and succeed when connected", async () => {
      simulator.setLatency(50);
      simulator.setPacketLoss(0);

      const start = Date.now();
      const result = await simulator.applyConditions(async () => "result");
      const duration = Date.now() - start;

      expect(result).toBe("result");
      expect(duration).toBeGreaterThanOrEqual(40);
    });

    it("should check disconnection before packet loss", async () => {
      simulator.disconnect();
      simulator.setPacketLoss(0.5);

      try {
        await simulator.applyConditions(async () => "result");
        expect.fail("Should have thrown");
      } catch (err) {
        expect((err as NetworkError).errorType).toBe(NetworkErrorType.DISCONNECTED);
      }
    });
  });

  describe("Operation Execution", () => {
    it("should return operation result", async () => {
      const result = await simulator.applyConditions(async () => ({ value: 42 }));
      expect(result).toEqual({ value: 42 });
    });

    it("should propagate operation errors", async () => {
      const customError = new Error("Operation failed");

      await expect(
        simulator.applyConditions(async () => {
          throw customError;
        }),
      ).rejects.toThrow("Operation failed");
    });
  });
});
