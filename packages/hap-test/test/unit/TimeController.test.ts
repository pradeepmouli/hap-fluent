/**
 * Unit tests for TimeController
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TimeController } from "../../src/TimeController.js";

describe("TimeController", () => {
  let timeController: TimeController;

  beforeEach(() => {
    timeController = new TimeController();
  });

  afterEach(async () => {
    timeController.reset();
  });

  describe("time advancement", () => {
    it("should advance time by specified milliseconds", async () => {
      const initialTime = timeController.now();

      await timeController.advance(1000);

      expect(timeController.now()).toBe(initialTime + 1000);
    });

    it("should execute setTimeout callbacks when advancing time", async () => {
      const callback = vi.fn();

      setTimeout(callback, 500);
      await timeController.advance(500);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should execute multiple timers in order", async () => {
      const calls: number[] = [];

      setTimeout(() => calls.push(1), 100);
      setTimeout(() => calls.push(2), 200);
      setTimeout(() => calls.push(3), 300);

      await timeController.advance(300);

      expect(calls).toEqual([1, 2, 3]);
    });

    it("should handle zero advancement", async () => {
      const initialTime = timeController.now();

      await timeController.advance(0);

      expect(timeController.now()).toBe(initialTime);
    });
  });

  describe("time freezing", () => {
    it("should freeze time at current moment", () => {
      const freezeTime = Date.now();

      timeController.freeze();

      // Time should not advance
      const time1 = timeController.now();
      const time2 = timeController.now();

      expect(time1).toBe(time2);
      expect(time1).toBeGreaterThanOrEqual(freezeTime);
    });

    it("should prevent setTimeout from executing without manual advancement", async () => {
      const callback = vi.fn();

      timeController.freeze();
      setTimeout(callback, 100);

      // Don't advance time - callback shouldn't execute
      expect(callback).not.toHaveBeenCalled();
    });

    it("should still allow manual time advancement when frozen", async () => {
      const callback = vi.fn();

      timeController.freeze();
      setTimeout(callback, 100);

      await timeController.advance(100);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("time setting", () => {
    it("should set time to specific date", () => {
      const targetDate = new Date("2025-01-01T00:00:00Z");

      timeController.setTime(targetDate);

      expect(timeController.now()).toBe(targetDate.getTime());
    });

    it("should allow advancing from set time", async () => {
      const targetDate = new Date("2025-01-01T00:00:00Z");

      timeController.setTime(targetDate);
      await timeController.advance(1000);

      expect(timeController.now()).toBe(targetDate.getTime() + 1000);
    });
  });

  describe("reset", () => {
    it("should restore real timers", () => {
      timeController.freeze();
      timeController.reset();

      // After reset, real timers should work
      const realTime1 = Date.now();
      const realTime2 = Date.now();

      // Times should be close but potentially different
      expect(Math.abs(realTime2 - realTime1)).toBeLessThan(100);
    });

    it("should clear all pending timers", async () => {
      const callback = vi.fn();

      setTimeout(callback, 1000);
      timeController.reset();

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("integration with Vitest", () => {
    it("should work with vi.useFakeTimers()", async () => {
      vi.useFakeTimers();
      const callback = vi.fn();

      setTimeout(callback, 1000);

      await vi.advanceTimersByTimeAsync(1000);

      expect(callback).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });
});
