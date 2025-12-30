/**
 * TimeController - Manages test time and timer integration
 *
 * Provides deterministic time control for testing time-dependent
 * platform behavior using Vitest's fake timer infrastructure.
 */

import { vi } from 'vitest';

export class TimeController {
	private _isFrozen: boolean = false;
	private _currentTime: number = Date.now();
	private _useFakeTimers: boolean = false;

	constructor() {
		// Initialize with fake timers
		this._useFakeTimers = true;
		vi.useFakeTimers();
		this._currentTime = Date.now();
	}

	/**
	 * Advance time by the specified number of milliseconds
	 * Executes all timers that should fire during this period
	 *
	 * @param ms - Milliseconds to advance
	 */
	async advance(ms: number): Promise<void> {
		if (ms < 0) {
			throw new Error('Cannot advance time backwards');
		}

		if (ms === 0) {
			return;
		}

		this._currentTime += ms;

		if (this._useFakeTimers) {
			await vi.advanceTimersByTimeAsync(ms);
		}
	}

	/**
	 * Freeze time at the current moment
	 * Prevents automatic timer execution but allows manual advancement
	 */
	freeze(): void {
		this._isFrozen = true;

		if (!this._useFakeTimers) {
			vi.useFakeTimers();
			this._useFakeTimers = true;
		}
	}

	/**
	 * Get current time in milliseconds since epoch
	 *
	 * @returns Current test time
	 */
	now(): number {
		if (this._useFakeTimers) {
			return Date.now();
		}
		return this._currentTime;
	}

	/**
	 * Set time to a specific date
	 *
	 * @param date - Target date/time
	 */
	setTime(date: Date): void {
		this._currentTime = date.getTime();

		if (!this._useFakeTimers) {
			vi.useFakeTimers();
			this._useFakeTimers = true;
		}

		vi.setSystemTime(date);
	}

	/**
	 * Reset time controller and restore real timers
	 */
	reset(): void {
		this._isFrozen = false;
		this._currentTime = Date.now();

		if (this._useFakeTimers) {
			vi.useRealTimers();
			this._useFakeTimers = false;
		}
	}

	/**
	 * Check if time is currently frozen
	 */
	get isFrozen(): boolean {
		return this._isFrozen;
	}
}
