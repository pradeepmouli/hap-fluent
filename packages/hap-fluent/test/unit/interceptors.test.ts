import { describe, it, expect, vi } from 'vitest';
import {
	createLoggingInterceptor,
	createRateLimitInterceptor,
	createClampingInterceptor,
	createTransformInterceptor,
	createAuditInterceptor,
	createCompositeInterceptor,
	type Interceptor,
} from '../../src/interceptors.js';

describe('Interceptor System', () => {
	describe('createLoggingInterceptor', () => {
		it('should create a logging interceptor', () => {
			const interceptor = createLoggingInterceptor();
			
			expect(interceptor).toBeDefined();
			expect(interceptor.beforeSet).toBeDefined();
			expect(interceptor.afterSet).toBeDefined();
			expect(interceptor.beforeGet).toBeDefined();
			expect(interceptor.afterGet).toBeDefined();
		});

		it('should pass through values unchanged', async () => {
			const interceptor = createLoggingInterceptor();
			const context = { characteristicName: 'Test', timestamp: Date.now() };
			
			const result = await interceptor.beforeSet?.(42, context);
			expect(result).toBe(42);
		});
	});

	describe('createRateLimitInterceptor', () => {
		it('should allow calls within rate limit', () => {
			const interceptor = createRateLimitInterceptor(3, 1000);
			const context = { characteristicName: 'Test', timestamp: Date.now() };
			
			// First 3 calls should succeed
			expect(interceptor.beforeSet?.(1, context)).toBe(1);
			expect(interceptor.beforeSet?.(2, context)).toBe(2);
			expect(interceptor.beforeSet?.(3, context)).toBe(3);
		});

		it('should reject calls exceeding rate limit', () => {
			const interceptor = createRateLimitInterceptor(2, 1000);
			const context = { characteristicName: 'Test', timestamp: Date.now() };
			
			// First 2 calls succeed
			interceptor.beforeSet?.(1, context);
			interceptor.beforeSet?.(2, context);
			
			// 3rd call should fail
			expect(() => interceptor.beforeSet?.(3, context)).toThrow('Rate limit exceeded');
		});

		it('should reset after time window', async () => {
			const interceptor = createRateLimitInterceptor(2, 100);
			const context = { characteristicName: 'Test', timestamp: Date.now() };
			
			// Use up limit
			interceptor.beforeSet?.(1, context);
			interceptor.beforeSet?.(2, context);
			
			// Wait for window to pass
			await new Promise(resolve => setTimeout(resolve, 150));
			
			// Should work again
			expect(interceptor.beforeSet?.(3, context)).toBe(3);
		});
	});

	describe('createClampingInterceptor', () => {
		it('should clamp values to range', async () => {
			const interceptor = createClampingInterceptor(0, 100);
			const context = { characteristicName: 'Brightness', timestamp: Date.now() };
			
			// Value within range
			expect(await interceptor.beforeSet?.(50, context)).toBe(50);
			
			// Value below min
			expect(await interceptor.beforeSet?.(-10, context)).toBe(0);
			
			// Value above max
			expect(await interceptor.beforeSet?.(150, context)).toBe(100);
		});

		it('should pass through non-numeric values', async () => {
			const interceptor = createClampingInterceptor(0, 100);
			const context = { characteristicName: 'Test', timestamp: Date.now() };
			
			expect(await interceptor.beforeSet?.('string', context)).toBe('string');
			expect(await interceptor.beforeSet?.(true, context)).toBe(true);
		});
	});

	describe('createTransformInterceptor', () => {
		it('should transform values', async () => {
			const interceptor = createTransformInterceptor((v) => (v as number) * 2);
			const context = { characteristicName: 'Test', timestamp: Date.now() };
			
			expect(await interceptor.beforeSet?.(5, context)).toBe(10);
			expect(await interceptor.beforeSet?.(10, context)).toBe(20);
		});

		it('should handle string transformations', async () => {
			const interceptor = createTransformInterceptor((v) => (v as string).toUpperCase());
			const context = { characteristicName: 'Test', timestamp: Date.now() };
			
			expect(await interceptor.beforeSet?.('hello', context)).toBe('HELLO');
		});

		it('should handle rounding', async () => {
			const interceptor = createTransformInterceptor((v) => Math.round(v as number));
			const context = { characteristicName: 'Test', timestamp: Date.now() };
			
			expect(await interceptor.beforeSet?.(5.4, context)).toBe(5);
			expect(await interceptor.beforeSet?.(5.6, context)).toBe(6);
		});
	});

	describe('createAuditInterceptor', () => {
		it('should call audit callback on set', async () => {
			const auditEvents: any[] = [];
			const interceptor = createAuditInterceptor((event) => auditEvents.push(event));
			const context = { characteristicName: 'Test', timestamp: Date.now() };
			
			await interceptor.afterSet?.(42, context);
			
			expect(auditEvents).toHaveLength(1);
			expect(auditEvents[0].type).toBe('set');
			expect(auditEvents[0].value).toBe(42);
			expect(auditEvents[0].characteristic).toBe('Test');
		});

		it('should call audit callback on get', async () => {
			const auditEvents: any[] = [];
			const interceptor = createAuditInterceptor((event) => auditEvents.push(event));
			const context = { characteristicName: 'Test', timestamp: Date.now() };
			
			await interceptor.afterGet?.(42, context);
			
			expect(auditEvents).toHaveLength(1);
			expect(auditEvents[0].type).toBe('get');
			expect(auditEvents[0].value).toBe(42);
		});

		it('should call audit callback on error', async () => {
			const auditEvents: any[] = [];
			const interceptor = createAuditInterceptor((event) => auditEvents.push(event));
			const context = { characteristicName: 'Test', timestamp: Date.now() };
			const error = new Error('Test error');
			
			await interceptor.onError?.(error, context);
			
			expect(auditEvents).toHaveLength(1);
			expect(auditEvents[0].type).toBe('error');
			expect(auditEvents[0].error).toBe(error);
		});
	});

	describe('createCompositeInterceptor', () => {
		it('should combine multiple interceptors', async () => {
			const order: string[] = [];
			
			const interceptor1: Interceptor = {
				beforeSet: async (v, ctx) => {
					order.push('before1');
					return v;
				},
			};
			
			const interceptor2: Interceptor = {
				beforeSet: async (v, ctx) => {
					order.push('before2');
					return v;
				},
			};
			
			const composite = createCompositeInterceptor([interceptor1, interceptor2]);
			const context = { characteristicName: 'Test', timestamp: Date.now() };
			
			await composite.beforeSet?.(42, context);
			
			expect(order).toEqual(['before1', 'before2']);
		});

		it('should chain transformed values', async () => {
			const doubler = createTransformInterceptor((v) => (v as number) * 2);
			const adder = createTransformInterceptor((v) => (v as number) + 10);
			
			const composite = createCompositeInterceptor([doubler, adder]);
			const context = { characteristicName: 'Test', timestamp: Date.now() };
			
			const result = await composite.beforeSet?.(5, context);
			expect(result).toBe(20); // (5 * 2) + 10
		});

		it('should combine clamping and transformation', async () => {
			const clamper = createClampingInterceptor(0, 100);
			const rounder = createTransformInterceptor((v) => Math.round(v as number));
			
			const composite = createCompositeInterceptor([clamper, rounder]);
			const context = { characteristicName: 'Test', timestamp: Date.now() };
			
			const result = await composite.beforeSet?.(150.7, context);
			expect(result).toBe(100); // Clamped to 100, then rounded (still 100)
		});

		it('should call all afterSet hooks', async () => {
			const calls: string[] = [];
			
			const interceptor1: Interceptor = {
				afterSet: async (v, ctx) => {
					calls.push('after1');
				},
			};
			
			const interceptor2: Interceptor = {
				afterSet: async (v, ctx) => {
					calls.push('after2');
				},
			};
			
			const composite = createCompositeInterceptor([interceptor1, interceptor2]);
			const context = { characteristicName: 'Test', timestamp: Date.now() };
			
			await composite.afterSet?.(42, context);
			
			expect(calls).toEqual(['after1', 'after2']);
		});
	});

	describe('Real-world scenarios', () => {
		it('should combine logging, rate limiting, and clamping', async () => {
			const logged: string[] = [];
			const logger: Interceptor = {
				beforeSet: async (v, ctx) => {
					logged.push(`beforeSet:${v}`);
					return v;
				},
				afterSet: async (v, ctx) => {
					logged.push(`afterSet:${v}`);
				},
			};
			
			const composite = createCompositeInterceptor([
				logger,
				createRateLimitInterceptor(3, 1000),
				createClampingInterceptor(0, 100),
			]);
			
			const context = { characteristicName: 'Brightness', timestamp: Date.now() };
			
			// First call with clamping
			let result = await composite.beforeSet?.(150, context);
			expect(result).toBe(100); // Clamped
			await composite.afterSet?.(100, context);
			
			// Second call without clamping
			result = await composite.beforeSet?.(50, context);
			expect(result).toBe(50);
			await composite.afterSet?.(50, context);
			
			expect(logged).toEqual([
				'beforeSet:150',
				'afterSet:100',
				'beforeSet:50',
				'afterSet:50',
			]);
		});

		it('should handle audit trail with transformations', async () => {
			const auditEvents: any[] = [];
			
			const composite = createCompositeInterceptor([
				createTransformInterceptor((v) => Math.round(v as number)),
				createClampingInterceptor(0, 100),
				createAuditInterceptor((event) => auditEvents.push(event)),
			]);
			
			const context = { characteristicName: 'Brightness', timestamp: Date.now() };
			
			await composite.beforeSet?.(75.7, context);
			await composite.afterSet?.(76, context);
			
			expect(auditEvents).toHaveLength(1);
			expect(auditEvents[0].type).toBe('set');
			expect(auditEvents[0].value).toBe(76);
		});
	});
});
