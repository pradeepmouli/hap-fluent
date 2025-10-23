import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDate, capitalize, debounce, logAndReturn } from '../src/index.js';

describe('Utils', () => {
	describe('formatDate', () => {
		it('should format date to ISO date string (YYYY-MM-DD)', () => {
			const date = new Date('2024-03-15T10:30:00Z');
			expect(formatDate(date)).toBe('2024-03-15');
		});

		it('should handle dates at start of year', () => {
			const date = new Date('2024-01-01T00:00:00Z');
			expect(formatDate(date)).toBe('2024-01-01');
		});

		it('should handle dates at end of year', () => {
			const date = new Date('2024-12-31T23:59:59Z');
			expect(formatDate(date)).toBe('2024-12-31');
		});

		it('should handle leap year dates', () => {
			const date = new Date('2024-02-29T12:00:00Z');
			expect(formatDate(date)).toBe('2024-02-29');
		});

		it('should handle different timezones correctly', () => {
			const date = new Date('2024-03-15T23:30:00Z');
			const formatted = formatDate(date);
			expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});

		it('should handle dates in distant past', () => {
			const date = new Date('1900-01-01T00:00:00Z');
			expect(formatDate(date)).toBe('1900-01-01');
		});

		it('should handle dates in distant future', () => {
			const date = new Date('2100-12-31T00:00:00Z');
			expect(formatDate(date)).toBe('2100-12-31');
		});
	});

	describe('capitalize', () => {
		it('should capitalize first letter of lowercase string', () => {
			expect(capitalize('hello')).toBe('Hello');
		});

		it('should lowercase rest of the string', () => {
			expect(capitalize('hELLO')).toBe('Hello');
		});

		it('should handle already capitalized string', () => {
			expect(capitalize('Hello')).toBe('Hello');
		});

		it('should handle single character string', () => {
			expect(capitalize('a')).toBe('A');
		});

		it('should handle uppercase single character', () => {
			expect(capitalize('A')).toBe('A');
		});

		it('should handle empty string', () => {
			expect(capitalize('')).toBe('');
		});

		it('should handle string with numbers', () => {
			expect(capitalize('hello123')).toBe('Hello123');
		});

		it('should handle string with special characters', () => {
			expect(capitalize('hello-world')).toBe('Hello-world');
		});

		it('should handle string with spaces', () => {
			expect(capitalize('hello world')).toBe('Hello world');
		});

		it('should handle all uppercase string', () => {
			expect(capitalize('HELLO WORLD')).toBe('Hello world');
		});

		it('should handle unicode characters', () => {
			expect(capitalize('élève')).toBe('Élève');
		});
	});

	describe('debounce', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		it('should delay function execution', () => {
			const func = vi.fn();
			const debouncedFunc = debounce(func, 1000);

			debouncedFunc();
			expect(func).not.toHaveBeenCalled();

			vi.advanceTimersByTime(1000);
			expect(func).toHaveBeenCalledTimes(1);
		});

		it('should cancel previous call if called again before delay', () => {
			const func = vi.fn();
			const debouncedFunc = debounce(func, 1000);

			debouncedFunc();
			vi.advanceTimersByTime(500);
			debouncedFunc();
			vi.advanceTimersByTime(500);

			expect(func).not.toHaveBeenCalled();

			vi.advanceTimersByTime(500);
			expect(func).toHaveBeenCalledTimes(1);
		});

		it('should pass arguments to debounced function', () => {
			const func = vi.fn((a: number, b: number) => a + b);
			const debouncedFunc = debounce(func, 1000);

			debouncedFunc(5, 3);
			vi.advanceTimersByTime(1000);

			expect(func).toHaveBeenCalledWith(5, 3);
		});

		it('should handle multiple calls with different arguments', () => {
			const func = vi.fn();
			const debouncedFunc = debounce(func, 1000);

			debouncedFunc(1);
			vi.advanceTimersByTime(500);
			debouncedFunc(2);
			vi.advanceTimersByTime(500);
			debouncedFunc(3);
			vi.advanceTimersByTime(1000);

			expect(func).toHaveBeenCalledTimes(1);
			expect(func).toHaveBeenCalledWith(3);
		});

		it('should handle zero delay', () => {
			const func = vi.fn();
			const debouncedFunc = debounce(func, 0);

			debouncedFunc();
			expect(func).not.toHaveBeenCalled();

			vi.advanceTimersByTime(0);
			expect(func).toHaveBeenCalledTimes(1);
		});

		it('should allow multiple executions after delay', () => {
			const func = vi.fn();
			const debouncedFunc = debounce(func, 1000);

			debouncedFunc();
			vi.advanceTimersByTime(1000);
			expect(func).toHaveBeenCalledTimes(1);

			debouncedFunc();
			vi.advanceTimersByTime(1000);
			expect(func).toHaveBeenCalledTimes(2);
		});

		it('should handle functions with no arguments', () => {
			const func = vi.fn(() => 'result');
			const debouncedFunc = debounce(func, 1000);

			debouncedFunc();
			vi.advanceTimersByTime(1000);

			expect(func).toHaveBeenCalledTimes(1);
		});

		it('should handle rapid successive calls', () => {
			const func = vi.fn();
			const debouncedFunc = debounce(func, 1000);

			for (let i = 0; i < 10; i++) {
				debouncedFunc();
				vi.advanceTimersByTime(100);
			}

			expect(func).not.toHaveBeenCalled();

			vi.advanceTimersByTime(1000);
			expect(func).toHaveBeenCalledTimes(1);
		});
	});

	describe('logAndReturn', () => {
		let consoleLogSpy: any;

		beforeEach(() => {
			consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		});

		afterEach(() => {
			consoleLogSpy.mockRestore();
		});

		it('should return the value unchanged', () => {
			const value = 42;
			const result = logAndReturn(value);
			expect(result).toBe(42);
		});

		it('should log default message with value', () => {
			const value = 'test';
			logAndReturn(value);
			expect(consoleLogSpy).toHaveBeenCalledWith(
				expect.stringContaining('Returning value: "test"')
			);
		});

		it('should log custom message when provided', () => {
			const value = 123;
			logAndReturn(value, 'Custom message');
			expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Custom message'));
		});

		it('should handle boolean values', () => {
			const result = logAndReturn(true);
			expect(result).toBe(true);
		});

		it('should handle null values', () => {
			const result = logAndReturn(null);
			expect(result).toBeNull();
		});

		it('should handle undefined values', () => {
			const result = logAndReturn(undefined);
			expect(result).toBeUndefined();
		});

		it('should handle object values', () => {
			const obj = { name: 'test', value: 42 };
			const result = logAndReturn(obj);
			expect(result).toEqual(obj);
			expect(result).toBe(obj); // Should be same reference
		});

		it('should handle array values', () => {
			const arr = [1, 2, 3];
			const result = logAndReturn(arr);
			expect(result).toEqual(arr);
			expect(result).toBe(arr); // Should be same reference
		});

		it('should handle string values', () => {
			const result = logAndReturn('hello world');
			expect(result).toBe('hello world');
		});

		it('should handle numeric values', () => {
			const result = logAndReturn(3.14159);
			expect(result).toBe(3.14159);
		});

		it('should handle empty string', () => {
			const result = logAndReturn('');
			expect(result).toBe('');
		});

		it('should handle zero', () => {
			const result = logAndReturn(0);
			expect(result).toBe(0);
		});

		it('should handle complex nested objects', () => {
			const complex = {
				nested: {
					array: [1, 2, { deep: 'value' }],
					func: () => 'test',
				},
			};
			const result = logAndReturn(complex);
			expect(result).toBe(complex);
		});

		it('should handle empty custom message', () => {
			const value = 'test';
			logAndReturn(value, '');
			expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining(''));
		});

		it('should maintain type through return', () => {
			const numberResult: number = logAndReturn(42);
			const stringResult: string = logAndReturn('test');
			const boolResult: boolean = logAndReturn(true);

			expect(typeof numberResult).toBe('number');
			expect(typeof stringResult).toBe('string');
			expect(typeof boolResult).toBe('boolean');
		});
	});

	describe('Integration', () => {
		it('should work with combined utilities', () => {
			const date = new Date('2024-03-15T10:30:00Z');
			const formatted = formatDate(date);
			const capitalized = capitalize(formatted);

			expect(capitalized).toBe('2024-03-15');
		});

		it('should chain capitalize and logAndReturn', () => {
			const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

			const result = logAndReturn(capitalize('hello'), 'Capitalized string');

			expect(result).toBe('Hello');
			expect(consoleLogSpy).toHaveBeenCalled();

			consoleLogSpy.mockRestore();
		});

		it('should use debounce with formatDate', () => {
			vi.useFakeTimers();

			const dates: string[] = [];
			const logDate = (date: Date) => {
				dates.push(formatDate(date));
			};
			const debouncedLogDate = debounce(logDate, 1000);

			const date1 = new Date('2024-01-01');
			const date2 = new Date('2024-02-01');
			const date3 = new Date('2024-03-01');

			debouncedLogDate(date1);
			vi.advanceTimersByTime(500);
			debouncedLogDate(date2);
			vi.advanceTimersByTime(500);
			debouncedLogDate(date3);
			vi.advanceTimersByTime(1000);

			expect(dates).toHaveLength(1);
			expect(dates[0]).toBe('2024-03-01');

			vi.restoreAllMocks();
		});
	});
});
