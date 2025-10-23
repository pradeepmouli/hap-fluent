import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { add, greet, Logger } from '../src/index.js';

describe('Core utilities', () => {
	describe('greet', () => {
		it('should return a greeting message', () => {
			expect(greet('World')).toBe('Hello, World!');
		});

		it('should handle empty string', () => {
			expect(greet('')).toBe('Hello, !');
		});

		it('should handle special characters', () => {
			expect(greet('Alice & Bob')).toBe('Hello, Alice & Bob!');
		});

		it('should handle unicode characters', () => {
			expect(greet('世界')).toBe('Hello, 世界!');
		});
	});

	describe('add', () => {
		it('should add two positive numbers correctly', () => {
			expect(add(2, 3)).toBe(5);
		});

		it('should add negative and positive numbers', () => {
			expect(add(-1, 1)).toBe(0);
		});

		it('should add two negative numbers', () => {
			expect(add(-5, -3)).toBe(-8);
		});

		it('should add zero correctly', () => {
			expect(add(0, 0)).toBe(0);
			expect(add(5, 0)).toBe(5);
			expect(add(0, 5)).toBe(5);
		});

		it('should handle decimal numbers', () => {
			expect(add(1.5, 2.3)).toBeCloseTo(3.8, 5);
		});

		it('should handle large numbers', () => {
			expect(add(1000000, 2000000)).toBe(3000000);
		});
	});

	describe('Logger', () => {
		let consoleLogSpy: any;
		let consoleErrorSpy: any;

		beforeEach(() => {
			consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
			consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		});

		afterEach(() => {
			consoleLogSpy.mockRestore();
			consoleErrorSpy.mockRestore();
		});

		describe('constructor', () => {
			it('should create a logger with default prefix', () => {
				const logger = new Logger();
				expect(logger).toBeInstanceOf(Logger);
			});

			it('should create a logger with custom prefix', () => {
				const logger = new Logger('TEST');
				expect(logger).toBeInstanceOf(Logger);
			});

			it('should handle empty prefix', () => {
				const logger = new Logger('');
				expect(logger).toBeInstanceOf(Logger);
			});
		});

		describe('info', () => {
			it('should log info message with default prefix', () => {
				const logger = new Logger();
				logger.info('test message');
				expect(consoleLogSpy).toHaveBeenCalledWith('[LOG] test message');
			});

			it('should log info message with custom prefix', () => {
				const logger = new Logger('CUSTOM');
				logger.info('test message');
				expect(consoleLogSpy).toHaveBeenCalledWith('[CUSTOM] test message');
			});

			it('should handle empty message', () => {
				const logger = new Logger();
				logger.info('');
				expect(consoleLogSpy).toHaveBeenCalledWith('[LOG] ');
			});

			it('should handle multiline messages', () => {
				const logger = new Logger();
				logger.info('line1\nline2');
				expect(consoleLogSpy).toHaveBeenCalledWith('[LOG] line1\nline2');
			});
		});

		describe('error', () => {
			it('should log error message with default prefix', () => {
				const logger = new Logger();
				logger.error('error message');
				expect(consoleErrorSpy).toHaveBeenCalledWith('[LOG] ERROR: error message');
			});

			it('should log error message with custom prefix', () => {
				const logger = new Logger('APP');
				logger.error('error message');
				expect(consoleErrorSpy).toHaveBeenCalledWith('[APP] ERROR: error message');
			});

			it('should handle empty error message', () => {
				const logger = new Logger();
				logger.error('');
				expect(consoleErrorSpy).toHaveBeenCalledWith('[LOG] ERROR: ');
			});

			it('should handle complex error messages', () => {
				const logger = new Logger();
				logger.error('Connection failed: timeout after 5000ms');
				expect(consoleErrorSpy).toHaveBeenCalledWith(
					'[LOG] ERROR: Connection failed: timeout after 5000ms'
				);
			});
		});

		describe('multiple calls', () => {
			it('should handle multiple info calls', () => {
				const logger = new Logger();
				logger.info('message 1');
				logger.info('message 2');
				logger.info('message 3');

				expect(consoleLogSpy).toHaveBeenCalledTimes(3);
				expect(consoleLogSpy).toHaveBeenNthCalledWith(1, '[LOG] message 1');
				expect(consoleLogSpy).toHaveBeenNthCalledWith(2, '[LOG] message 2');
				expect(consoleLogSpy).toHaveBeenNthCalledWith(3, '[LOG] message 3');
			});

			it('should handle mixed info and error calls', () => {
				const logger = new Logger();
				logger.info('info message');
				logger.error('error message');

				expect(consoleLogSpy).toHaveBeenCalledWith('[LOG] info message');
				expect(consoleErrorSpy).toHaveBeenCalledWith('[LOG] ERROR: error message');
			});
		});
	});
});
