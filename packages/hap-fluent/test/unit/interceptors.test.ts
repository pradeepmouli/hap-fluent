import { describe, it, expect, vi } from 'vitest';
import { Characteristic } from 'hap-nodejs';
import { FluentCharacteristic } from '../../src/FluentCharacteristic.js';

// Mock Characteristic class for testing
class MockCharacteristic {
displayName: string;
UUID: string;
value: any = undefined;
private setHandler: ((value: any) => void | Promise<void>) | null = null;
private getHandler: (() => any | Promise<any>) | null = null;

constructor(displayName: string, uuid: string) {
this.displayName = displayName;
this.UUID = uuid;
}

setValue(value: any) {
this.value = value;
}

updateValue(value: any) {
this.value = value;
}

onSet(handler: (value: any) => void | Promise<void>) {
this.setHandler = handler;
}

onGet(handler: () => any | Promise<any>) {
this.getHandler = handler;
}

async triggerSet(value: any) {
if (this.setHandler) {
await this.setHandler(value);
}
}

async triggerGet() {
if (this.getHandler) {
return await this.getHandler();
}
return this.value;
}

setProps(props: any) {
Object.assign(this, props);
}
}

describe('Interceptor System - Fluent API', () => {
describe('log() interceptor', () => {
it('should add logging interceptor', () => {
const mockChar = new MockCharacteristic('Brightness', 'brightness-uuid');
const fluent = new FluentCharacteristic(mockChar as any);

const result = fluent.log();
expect(result).toBe(fluent); // Should return this for chaining
});

it('should log set operations', async () => {
const mockChar = new MockCharacteristic('Brightness', 'brightness-uuid');
const fluent = new FluentCharacteristic(mockChar as any);

let handlerValue: any;
fluent.log().onSet(async (value) => {
handlerValue = value;
});

await mockChar.triggerSet(50);
expect(handlerValue).toBe(50);
});
});

describe('limit() interceptor', () => {
it('should add rate limiting interceptor', () => {
const mockChar = new MockCharacteristic('Brightness', 'brightness-uuid');
const fluent = new FluentCharacteristic(mockChar as any);

const result = fluent.limit(3, 1000);
expect(result).toBe(fluent); // Should return this for chaining
});

it('should allow calls within rate limit', async () => {
const mockChar = new MockCharacteristic('Brightness', 'brightness-uuid');
const fluent = new FluentCharacteristic(mockChar as any);

const values: number[] = [];
fluent.limit(3, 1000).onSet(async (value) => {
values.push(value);
});

// First 3 calls should succeed
await mockChar.triggerSet(1);
await mockChar.triggerSet(2);
await mockChar.triggerSet(3);

expect(values).toEqual([1, 2, 3]);
});

it('should reject calls exceeding rate limit', async () => {
const mockChar = new MockCharacteristic('Brightness', 'brightness-uuid');
const fluent = new FluentCharacteristic(mockChar as any);

fluent.limit(2, 1000).onSet(async (value) => {
// Handler
});

// First 2 calls succeed
await mockChar.triggerSet(1);
await mockChar.triggerSet(2);

// 3rd call should fail
await expect(mockChar.triggerSet(3)).rejects.toThrow();
});
});

describe('clamp() interceptor', () => {
it('should add clamping interceptor', () => {
const mockChar = new MockCharacteristic('Brightness', 'brightness-uuid');
const fluent = new FluentCharacteristic(mockChar as any);

const result = fluent.clamp(0, 100);
expect(result).toBe(fluent); // Should return this for chaining
});

it('should clamp values to range', async () => {
const mockChar = new MockCharacteristic('Brightness', 'brightness-uuid');
const fluent = new FluentCharacteristic(mockChar as any);

let handlerValue: any;
fluent.clamp(0, 100).onSet(async (value) => {
handlerValue = value;
});

// Value within range
await mockChar.triggerSet(50);
expect(handlerValue).toBe(50);

// Value below min
await mockChar.triggerSet(-10);
expect(handlerValue).toBe(0);

// Value above max
await mockChar.triggerSet(150);
expect(handlerValue).toBe(100);
});

it('should pass through non-numeric values', async () => {
const mockChar = new MockCharacteristic('Name', 'name-uuid');
const fluent = new FluentCharacteristic(mockChar as any);

let handlerValue: any;
fluent.clamp(0, 100).onSet(async (value) => {
handlerValue = value;
});

await mockChar.triggerSet('test');
expect(handlerValue).toBe('test');
});
});

describe('transform() interceptor', () => {
it('should add transformation interceptor', () => {
const mockChar = new MockCharacteristic('Brightness', 'brightness-uuid');
const fluent = new FluentCharacteristic(mockChar as any);

const result = fluent.transform(v => v);
expect(result).toBe(fluent); // Should return this for chaining
});

it('should transform values', async () => {
const mockChar = new MockCharacteristic('Brightness', 'brightness-uuid');
const fluent = new FluentCharacteristic(mockChar as any);

let handlerValue: any;
fluent.transform(v => Math.round(v as number)).onSet(async (value) => {
handlerValue = value;
});

await mockChar.triggerSet(42.7);
expect(handlerValue).toBe(43);

await mockChar.triggerSet(42.3);
expect(handlerValue).toBe(42);
});
});

describe('audit() interceptor', () => {
it('should add audit interceptor', () => {
const mockChar = new MockCharacteristic('LockState', 'lock-uuid');
const fluent = new FluentCharacteristic(mockChar as any);

const result = fluent.audit();
expect(result).toBe(fluent); // Should return this for chaining
});

it('should track operations', async () => {
const mockChar = new MockCharacteristic('LockState', 'lock-uuid');
const fluent = new FluentCharacteristic(mockChar as any);

const values: number[] = [];
fluent.audit().onSet(async (value) => {
values.push(value);
});

await mockChar.triggerSet(0);
await mockChar.triggerSet(1);

expect(values).toEqual([0, 1]);
});
});

describe('Fluent chaining', () => {
it('should chain multiple interceptors', () => {
const mockChar = new MockCharacteristic('Brightness', 'brightness-uuid');
const fluent = new FluentCharacteristic(mockChar as any);

const result = fluent
.log()
.transform(v => Math.round(v as number))
.clamp(0, 100)
.limit(5, 1000);

expect(result).toBe(fluent); // Should return this for chaining
});

it('should apply interceptors in order', async () => {
const mockChar = new MockCharacteristic('Brightness', 'brightness-uuid');
const fluent = new FluentCharacteristic(mockChar as any);

let handlerValue: any;
fluent
.transform(v => (v as number) * 2)  // 50 * 2 = 100
.clamp(0, 80)                         // clamp 100 to 80
.onSet(async (value) => {
handlerValue = value;
});

await mockChar.triggerSet(50);
expect(handlerValue).toBe(80); // 50 * 2 = 100, clamped to 80
});

it('should work with validation', async () => {
const mockChar = new MockCharacteristic('Brightness', 'brightness-uuid');
const fluent = new FluentCharacteristic(mockChar as any);

const { RangeValidator } = await import('../../src/validation.js');
fluent.addValidator(new RangeValidator(0, 100, 'Brightness'));

let handlerValue: any;
fluent
.log()
.onSet(async (value) => {
handlerValue = value;
});

// Valid value
await mockChar.triggerSet(50);
expect(handlerValue).toBe(50);

// Invalid value should be rejected by validator
await expect(mockChar.triggerSet(150)).rejects.toThrow('Brightness must be between 0 and 100');
});
});

describe('clearInterceptors()', () => {
it('should remove all interceptors', async () => {
const mockChar = new MockCharacteristic('Brightness', 'brightness-uuid');
const fluent = new FluentCharacteristic(mockChar as any);

fluent.limit(1, 1000).onSet(async (value) => {
// Handler
});

// First call succeeds
await mockChar.triggerSet(1);

// Second call would fail with rate limit
await expect(mockChar.triggerSet(2)).rejects.toThrow();

// Clear interceptors and re-register handler
fluent.clearInterceptors();
fluent.onSet(async (value) => {
// New handler without rate limit
});

// Now should work without rate limiting
await mockChar.triggerSet(3);
await mockChar.triggerSet(4);
await mockChar.triggerSet(5);
// All should succeed
});
});
});
