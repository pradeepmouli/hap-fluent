# HAP-Fluent Library Enhancement Proposals

**Date**: 2025-12-25
**Reviewer**: Claude Code
**Version**: 1.0

## Executive Summary

This document provides a comprehensive review of the hap-fluent library and proposes enhancements to make it more robust, developer-friendly, and testable. The library shows strong architectural foundations but requires improvements in error handling, type safety, documentation, and testing before production readiness.

---

## Library Overview

This is a well-conceived TypeScript wrapper for HAP-NodeJS that provides type-safe, fluent APIs for Homebridge accessories. The library shows good architectural foundations but has several areas that need improvement for production readiness.

## Key Findings

### Strengths
- Strong TypeScript typing with generated interfaces
- Fluent API design improves developer experience
- Good test coverage structure with Vitest
- Clear separation of concerns across modules
- Monorepo structure with workspace management
- JSDoc comments on most public methods

### Critical Issues Found

#### 1. **Type Safety Violations**
- Multiple `as any` casts throughout codebase (FluentService.ts:73, 83, 89, 92)
- `//@ts-ignore` and `//@ts-expect-error` directives masking type issues
- Type assertions without runtime validation
- **Location**: `packages/hap-fluent/src/FluentService.ts:73, 83, 89, 92`
- **Location**: `packages/hap-fluent/src/AccessoryHandler.ts:66, 69, 150`

#### 2. **Missing Error Handling**
- No try-catch blocks in async operations
- No validation of characteristic values before setting
- No error recovery mechanisms
- Silent failures in AccessoryHandler initialization
- **Impact**: Runtime errors can crash the application

#### 3. **Code Quality Issues**
- Large blocks of commented-out code (AccessoryHandler.ts:102-113, 240-294)
- Incomplete/broken example files (usage-examples.ts:25 has syntax error)
- Inconsistent validation (getOrAddService validates, wrapService doesn't)
- Dead code that should be removed

#### 4. **Package Configuration**
- homebridge/hap-nodejs should be peerDependencies, not devDependencies
- Missing modern package.json "exports" field
- No source maps for debugging
- **Impact**: Incorrect dependency resolution in consumer projects

#### 5. **Documentation Gaps**
- No package-level README for hap-fluent
- No migration guide or changelog
- Examples have syntax errors and don't run
- No API reference documentation
- Missing contributing guidelines

#### 6. **Limited Testability**
- No integration tests with real HAP-NodeJS services
- No test coverage reporting configured
- Edge cases not covered in tests
- No property-based testing for complex scenarios

---

## Enhancement Proposals

### Phase 1: Code Quality & Robustness (High Priority)

**Goal**: Make the library production-ready with proper error handling and type safety.

#### 1.1 Add Comprehensive Error Handling

**Files to modify**: `packages/hap-fluent/src/FluentCharacteristic.ts`

```typescript
// Create custom error classes
export class FluentCharacteristicError extends Error {
  constructor(
    message: string,
    public readonly context: {
      characteristic?: string;
      value?: unknown;
      operation?: string;
      originalError?: Error;
    }
  ) {
    super(message);
    this.name = 'FluentCharacteristicError';
  }
}

// Add error handling to FluentCharacteristic
class FluentCharacteristic<T extends CharacteristicValue> {
  set(value: T): this {
    try {
      this.validateValue(value);
      this.characteristic.setValue(value);
    } catch (error) {
      throw new FluentCharacteristicError(
        `Failed to set characteristic: ${error.message}`,
        {
          characteristic: this.characteristic.displayName,
          value,
          operation: 'set',
          originalError: error instanceof Error ? error : undefined
        }
      );
    }
    return this;
  }

  private validateValue(value: T): void {
    if (value === null || value === undefined) {
      throw new Error('Value cannot be null or undefined');
    }
    // Add range validation based on characteristic props
    const props = this.characteristic.props;
    if (typeof value === 'number' && props) {
      if (props.minValue !== undefined && value < props.minValue) {
        throw new Error(`Value ${value} is below minimum ${props.minValue}`);
      }
      if (props.maxValue !== undefined && value > props.maxValue) {
        throw new Error(`Value ${value} exceeds maximum ${props.maxValue}`);
      }
    }
  }

  async onGet(handler: () => Promise<T>): this {
    this.characteristic.onGet(async () => {
      try {
        return await handler();
      } catch (error) {
        throw new FluentCharacteristicError(
          `Get handler failed: ${error.message}`,
          {
            characteristic: this.characteristic.displayName,
            operation: 'get',
            originalError: error instanceof Error ? error : undefined
          }
        );
      }
    });
    return this;
  }

  async onSet(handler: (value: T) => Promise<void>): this {
    this.characteristic.onSet(async (value: CharacteristicValue) => {
      try {
        await handler(value as T);
      } catch (error) {
        throw new FluentCharacteristicError(
          `Set handler failed: ${error.message}`,
          {
            characteristic: this.characteristic.displayName,
            value,
            operation: 'set',
            originalError: error instanceof Error ? error : undefined
          }
        );
      }
    } as unknown as CharacteristicSetHandler);
    return this;
  }
}
```

**Files to modify**: `packages/hap-fluent/src/FluentService.ts`

```typescript
export class FluentServiceError extends Error {
  constructor(
    message: string,
    public readonly context: {
      service?: string;
      characteristic?: string;
      operation?: string;
      originalError?: Error;
    }
  ) {
    super(message);
    this.name = 'FluentServiceError';
  }
}

export function getOrAddService<T extends typeof Service>(
  platformAccessory: PlatformAccessory,
  serviceClass: WithUUID<T>,
  displayName?: string,
  subType?: string
): FluentService<T> {
  // Enhanced validation
  if (typeof serviceClass !== 'function') {
    throw new FluentServiceError(
      'Service class must be a constructor function',
      {
        operation: 'getOrAddService',
        service: serviceClass?.toString()
      }
    );
  }

  if (!('UUID' in serviceClass)) {
    throw new FluentServiceError(
      'Service class must have a UUID property',
      {
        operation: 'getOrAddService',
        service: serviceClass.name
      }
    );
  }

  try {
    const existingService = subType
      ? platformAccessory.getServiceById(serviceClass, subType)
      : platformAccessory.getService(serviceClass);

    if (existingService) {
      return wrapService(existingService as InstanceType<T>);
    } else {
      const newService = new serviceClass(displayName ?? '', subType ?? '') as InstanceType<T>;
      platformAccessory.addService(newService);
      return wrapService(newService);
    }
  } catch (error) {
    throw new FluentServiceError(
      `Failed to get or add service: ${error.message}`,
      {
        service: serviceClass.name,
        operation: 'getOrAddService',
        originalError: error instanceof Error ? error : undefined
      }
    );
  }
}
```

#### 1.2 Remove Type Safety Violations

**Task**: Eliminate all `as any` casts with proper type guards

**Files to modify**:
- `packages/hap-fluent/src/FluentService.ts`
- `packages/hap-fluent/src/AccessoryHandler.ts`

```typescript
// Instead of:
const obj = {
  ...e,
  onGet: <K extends keyof InterfaceForService<T>>(
    key: K,
    callback: () => Promise<InterfaceForService<T>[K]>
  ) => {
    return e.characteristics[key].onGet(callback as any); // BAD
  }
};

// Use type guards:
const obj = {
  ...e,
  onGet: <K extends keyof InterfaceForService<T>>(
    key: K,
    callback: () => Promise<InterfaceForService<T>[K]>
  ) => {
    const char = e.characteristics[key];
    if (!char) {
      throw new FluentServiceError(
        `Characteristic '${String(key)}' not found`,
        { characteristic: String(key), operation: 'onGet' }
      );
    }
    return char.onGet(callback as () => Promise<CharacteristicValue>);
  }
};
```

**Action Items**:
1. Add runtime type checking where TypeScript types can't guarantee safety
2. Remove all `//@ts-ignore` and `//@ts-expect-error` directives
3. Fix underlying type issues instead of suppressing them
4. Add proper type guards for dynamic property access

#### 1.3 Clean Up Codebase

**Files to modify**:
- `packages/hap-fluent/src/AccessoryHandler.ts` (lines 102-113, 240-294)
- `packages/hap-fluent/examples/usage-examples.ts` (line 25)

**Tasks**:
1. Remove all commented-out code blocks
2. Fix syntax errors in examples:
   ```typescript
   // Line 25 - Fix this:
   createFluentServic()) // BROKEN

   // Should be removed or completed properly
   ```
3. Add consistent input validation across all public methods
4. Remove duplicate code between `initializeAccessory` and `AccessoryHandler.initialize`

#### 1.4 Fix Package Dependencies

**File to modify**: `packages/hap-fluent/package.json`

```json
{
  "name": "hap-fluent",
  "version": "0.3.0",
  "description": "Fluent, strongly-typed wrapper for HAP-NodeJS services and characteristics.",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "type": "module",
  "peerDependencies": {
    "homebridge": "^1.8.0 || ^1.9.0 || ^1.10.0 || ^1.11.0",
    "hap-nodejs": "^0.11.0 || ^0.12.0 || ^0.13.0"
  },
  "peerDependenciesMeta": {
    "hap-nodejs": {
      "optional": true
    }
  },
  "dependencies": {
    "camelcase": "^8.0.0"
  },
  "devDependencies": {
    "homebridge": "^1.11.0",
    "hap-nodejs": "^0.13.1",
    "eslint": "^9.38.0",
    "glob": "^11.0.3",
    "prettier": "^3.6.2",
    "ts-node": "^10.9.2",
    "type-fest": "^4.41.0",
    "typescript": "^5.9.3",
    "vitest": "^3.0.0"
  }
}
```

**Why**: Peer dependencies ensure that the consuming application provides compatible versions of homebridge/hap-nodejs, avoiding version conflicts and duplicate installations.

---

### Phase 2: Developer Experience (High Priority)

**Goal**: Make the library easy to use, understand, and debug.

#### 2.1 Add Package Documentation

**File to create**: `packages/hap-fluent/README.md`

```markdown
# HAP Fluent

Type-safe, fluent wrapper for HAP-NodeJS services and characteristics.

## Installation

```bash
npm install hap-fluent
# or
pnpm add hap-fluent
```

## Quick Start

```typescript
import { getOrAddService, FluentService } from 'hap-fluent';
import { Service } from 'homebridge';

// Get or add a service to your accessory
const lightbulb = getOrAddService(
  platformAccessory,
  Service.Lightbulb,
  'Living Room Light'
);

// Set up handlers with full type safety
lightbulb
  .onGet('On', async () => {
    return await device.getPowerState();
  })
  .onSet('On', async (value) => {
    await device.setPowerState(value);
  })
  .onGet('Brightness', async () => {
    return await device.getBrightness();
  })
  .onSet('Brightness', async (value) => {
    await device.setBrightness(value);
  });

// Update values
lightbulb.update('On', true);
lightbulb.update('Brightness', 75);
```

## Features

- 🔒 **Type Safety**: Full TypeScript support with auto-generated HAP interfaces
- ⛓️ **Fluent API**: Chain method calls for cleaner code
- 🎯 **IntelliSense**: IDE autocomplete for all services and characteristics
- 🧪 **Testable**: Easy to mock and test your accessories
- 📦 **Zero Config**: Works out of the box with Homebridge

## API Reference

### `getOrAddService<T>(accessory, serviceClass, displayName?, subType?)`

Get an existing service or add a new one to an accessory.

**Parameters**:
- `accessory: PlatformAccessory` - The Homebridge platform accessory
- `serviceClass: typeof Service` - The HAP service class
- `displayName?: string` - Optional display name for the service
- `subType?: string` - Optional subtype for multiple services of the same type

**Returns**: `FluentService<T>` - A fluent wrapper around the service

### `FluentService<T>`

A type-safe wrapper around a HAP service.

**Methods**:
- `onGet<K>(key, handler)` - Register an async getter for a characteristic
- `onSet<K>(key, handler)` - Register an async setter for a characteristic
- `update<K>(key, value)` - Update a characteristic value without triggering SET handlers

**Properties**:
- `characteristics` - Object containing all FluentCharacteristic wrappers

### `FluentCharacteristic<T>`

A type-safe wrapper around a HAP characteristic.

**Methods**:
- `get()` - Get the current value
- `set(value)` - Set the value (triggers SET handlers)
- `update(value)` - Update the value (skips SET handlers)
- `onGet(handler)` - Register an async getter
- `onSet(handler)` - Register an async setter
- `setProps(props)` - Update characteristic properties (min/max/step)

## Examples

See the [examples](./examples) directory for more usage patterns.

## License

Apache-2.0
```

#### 2.2 Improve Error Messages

**File to create**: `packages/hap-fluent/src/errors.ts`

```typescript
export class FluentServiceError extends Error {
  constructor(
    message: string,
    public readonly context: {
      service?: string;
      characteristic?: string;
      operation?: string;
      originalError?: Error;
    }
  ) {
    super(message);
    this.name = 'FluentServiceError';

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FluentServiceError);
    }
  }

  toString(): string {
    const contextStr = Object.entries(this.context)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    return `${this.name}: ${this.message}\nContext: ${contextStr}`;
  }
}

export class FluentCharacteristicError extends Error {
  constructor(
    message: string,
    public readonly context: {
      characteristic?: string;
      value?: unknown;
      operation?: string;
      originalError?: Error;
    }
  ) {
    super(message);
    this.name = 'FluentCharacteristicError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FluentCharacteristicError);
    }
  }

  toString(): string {
    const contextStr = Object.entries(this.context)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    return `${this.name}: ${this.message}\nContext: ${contextStr}`;
  }
}

export class ValidationError extends FluentCharacteristicError {
  constructor(message: string, context: FluentCharacteristicError['context']) {
    super(message, context);
    this.name = 'ValidationError';
  }
}
```

#### 2.3 Add Debug Logging

**File to modify**: `packages/hap-fluent/package.json`

```json
{
  "dependencies": {
    "camelcase": "^8.0.0",
    "debug": "^4.3.4"
  }
}
```

**File to modify**: `packages/hap-fluent/src/FluentCharacteristic.ts`

```typescript
import debug from 'debug';

const log = debug('hap-fluent:characteristic');

export class FluentCharacteristic<T extends CharacteristicValue> {
  constructor(private characteristic: Characteristic) {
    log('Created FluentCharacteristic for %s', characteristic.displayName);
  }

  set(value: T): this {
    log('Setting %s to %o', this.characteristic.displayName, value);
    this.characteristic.setValue(value);
    return this;
  }

  update(value: T): this {
    log('Updating %s to %o', this.characteristic.displayName, value);
    this.characteristic.updateValue(value);
    return this;
  }

  onGet(handler: () => Promise<T>): this {
    log('Registering GET handler for %s', this.characteristic.displayName);
    this.characteristic.onGet(async () => {
      const value = await handler();
      log('GET %s returned %o', this.characteristic.displayName, value);
      return value;
    });
    return this;
  }

  onSet(handler: (value: T) => Promise<void>): this {
    log('Registering SET handler for %s', this.characteristic.displayName);
    this.characteristic.onSet(async (value: CharacteristicValue) => {
      log('SET %s to %o', this.characteristic.displayName, value);
      await handler(value as T);
    } as unknown as CharacteristicSetHandler);
    return this;
  }
}
```

**Usage**:
```bash
# Enable debug logging
DEBUG=hap-fluent:* homebridge
```

#### 2.4 Add Type Utilities

**File to create**: `packages/hap-fluent/src/type-utils.ts`

```typescript
import type { Service } from 'homebridge';
import type { InterfaceForService } from './types/index.js';

/**
 * Extract characteristic names from a service type
 */
export type CharacteristicType<S extends typeof Service> =
  keyof Omit<InterfaceForService<S>, 'UUID' | 'serviceName'>;

/**
 * Extract the value type of a specific characteristic
 */
export type CharacteristicValue<
  S extends typeof Service,
  K extends CharacteristicType<S>
> = InterfaceForService<S>[K];

/**
 * Create a partial state object for a service
 */
export type ServiceState<S extends typeof Service> = Partial<
  Omit<InterfaceForService<S>, 'UUID' | 'serviceName'>
>;

/**
 * Type guard to check if a value is a valid characteristic value
 */
export function isCharacteristicValue(value: unknown): value is CharacteristicValue {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null
  );
}

/**
 * Type guard to check if a key is a valid characteristic name
 */
export function isCharacteristicKey<S extends typeof Service>(
  service: S,
  key: string
): key is CharacteristicType<S> {
  // Runtime check implementation
  return typeof key === 'string' && key !== 'UUID' && key !== 'serviceName';
}
```

**Export from index**:
```typescript
// packages/hap-fluent/src/index.ts
export * from './type-utils.js';
```

---

### Phase 3: Testability (Medium Priority)

**Goal**: Ensure comprehensive test coverage and easy testing for consumers.

#### 3.1 Add Test Coverage Reporting

**File to modify**: `packages/hap-fluent/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        '**/*.test.ts',
        '**/*.mock.ts',
        '**/examples/**',
        '**/dist/**',
        '**/node_modules/**'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      },
      all: true
    }
  }
});
```

**File to modify**: `packages/hap-fluent/package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "@vitest/coverage-v8": "^3.0.0"
  }
}
```

#### 3.2 Add Integration Tests

**File to create**: `packages/hap-fluent/test/integration/real-service.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { Service, Characteristic, PlatformAccessory } from 'homebridge';
import { getOrAddService, wrapService } from '../../src/index.js';

describe('Integration Tests - Real HAP Services', () => {
  let accessory: PlatformAccessory;

  beforeEach(() => {
    accessory = new PlatformAccessory('Test', 'test-uuid');
  });

  describe('Real Lightbulb Service', () => {
    it('should create and interact with real lightbulb service', async () => {
      const lightbulb = getOrAddService(
        accessory,
        Service.Lightbulb,
        'Test Light'
      );

      let deviceState = { on: false, brightness: 0 };

      lightbulb
        .onGet('On', async () => deviceState.on)
        .onSet('On', async (value) => {
          deviceState.on = value;
        })
        .onGet('Brightness', async () => deviceState.brightness)
        .onSet('Brightness', async (value) => {
          deviceState.brightness = value;
        });

      // Test SET through HomeKit
      await lightbulb.characteristics.On.onSet(true);
      expect(deviceState.on).toBe(true);

      // Test GET through HomeKit
      const brightness = await lightbulb.characteristics.Brightness.onGet();
      expect(brightness).toBe(0);

      // Test UPDATE
      lightbulb.update('Brightness', 75);
      expect(lightbulb.characteristics.Brightness.get()).toBe(75);
    });
  });

  describe('Multi-Service Accessory', () => {
    it('should handle multiple services correctly', () => {
      const info = getOrAddService(accessory, Service.AccessoryInformation);
      const lightbulb = getOrAddService(accessory, Service.Lightbulb);
      const switch1 = getOrAddService(
        accessory,
        Service.Switch,
        'Switch 1',
        'switch-1'
      );
      const switch2 = getOrAddService(
        accessory,
        Service.Switch,
        'Switch 2',
        'switch-2'
      );

      expect(accessory.services).toHaveLength(4);

      info.update('Manufacturer', 'Test Manufacturer');
      lightbulb.update('On', true);
      switch1.update('On', false);
      switch2.update('On', true);

      expect(info.characteristics.Manufacturer.get()).toBe('Test Manufacturer');
      expect(lightbulb.characteristics.On.get()).toBe(true);
      expect(switch1.characteristics.On.get()).toBe(false);
      expect(switch2.characteristics.On.get()).toBe(true);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle SET errors gracefully', async () => {
      const lightbulb = getOrAddService(accessory, Service.Lightbulb);

      lightbulb.onSet('On', async (value) => {
        throw new Error('Device unreachable');
      });

      await expect(
        lightbulb.characteristics.On.onSet(true)
      ).rejects.toThrow('Device unreachable');
    });

    it('should handle GET errors gracefully', async () => {
      const lightbulb = getOrAddService(accessory, Service.Lightbulb);

      lightbulb.onGet('On', async () => {
        throw new Error('Device unreachable');
      });

      await expect(
        lightbulb.characteristics.On.onGet()
      ).rejects.toThrow('Device unreachable');
    });
  });
});
```

#### 3.3 Add Property-Based Tests

**File to modify**: `packages/hap-fluent/package.json`

```json
{
  "devDependencies": {
    "@fast-check/vitest": "^0.1.0",
    "fast-check": "^3.15.0"
  }
}
```

**File to create**: `packages/hap-fluent/test/property-based/characteristic.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { fc, test } from '@fast-check/vitest';
import { FluentCharacteristic } from '../../src/FluentCharacteristic.js';
import { MockCharacteristic } from '../mocks/homebridge.mock.js';

describe('Property-Based Tests - FluentCharacteristic', () => {
  test.prop([fc.boolean()])('should handle any boolean value', (value) => {
    const char = new MockCharacteristic('On', 'on-uuid');
    const fluent = new FluentCharacteristic<boolean>(char as any);

    fluent.set(value);
    expect(fluent.get()).toBe(value);
  });

  test.prop([fc.integer({ min: 0, max: 100 })])(
    'should handle brightness values in valid range',
    (value) => {
      const char = new MockCharacteristic('Brightness', 'brightness-uuid');
      char.props = { minValue: 0, maxValue: 100 };
      const fluent = new FluentCharacteristic<number>(char as any);

      fluent.set(value);
      expect(fluent.get()).toBe(value);
    }
  );

  test.prop([fc.string({ minLength: 1, maxLength: 64 })])(
    'should handle string values',
    (value) => {
      const char = new MockCharacteristic('Name', 'name-uuid');
      const fluent = new FluentCharacteristic<string>(char as any);

      fluent.set(value);
      expect(fluent.get()).toBe(value);
    }
  );

  test.prop([
    fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 10 })
  ])('should handle multiple sequential updates', (values) => {
    const char = new MockCharacteristic('Value', 'value-uuid');
    const fluent = new FluentCharacteristic<number>(char as any);

    for (const value of values) {
      fluent.set(value);
    }

    expect(fluent.get()).toBe(values[values.length - 1]);
  });
});
```

---

### Phase 4: Advanced Features (Medium Priority)

**Goal**: Add advanced functionality for complex use cases.

#### 4.1 Add Validation Framework

**File to create**: `packages/hap-fluent/src/validation.ts`

```typescript
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface CharacteristicValidator<T> {
  validate(value: T): ValidationResult;
}

export class RangeValidator<T extends number> implements CharacteristicValidator<T> {
  constructor(
    private min: number,
    private max: number,
    private options?: { inclusive?: boolean }
  ) {}

  validate(value: T): ValidationResult {
    const inclusive = this.options?.inclusive ?? true;

    if (inclusive) {
      if (value < this.min || value > this.max) {
        return {
          valid: false,
          message: `Value ${value} must be between ${this.min} and ${this.max} (inclusive)`
        };
      }
    } else {
      if (value <= this.min || value >= this.max) {
        return {
          valid: false,
          message: `Value ${value} must be between ${this.min} and ${this.max} (exclusive)`
        };
      }
    }

    return { valid: true };
  }
}

export class EnumValidator<T> implements CharacteristicValidator<T> {
  constructor(private allowedValues: T[]) {}

  validate(value: T): ValidationResult {
    if (!this.allowedValues.includes(value)) {
      return {
        valid: false,
        message: `Value ${value} must be one of: ${this.allowedValues.join(', ')}`
      };
    }
    return { valid: true };
  }
}

export class TypeValidator implements CharacteristicValidator<unknown> {
  constructor(private expectedType: string) {}

  validate(value: unknown): ValidationResult {
    if (typeof value !== this.expectedType) {
      return {
        valid: false,
        message: `Expected ${this.expectedType}, got ${typeof value}`
      };
    }
    return { valid: true };
  }
}

export class CustomValidator<T> implements CharacteristicValidator<T> {
  constructor(
    private validationFn: (value: T) => boolean | string,
    private errorMessage?: string
  ) {}

  validate(value: T): ValidationResult {
    const result = this.validationFn(value);

    if (typeof result === 'boolean') {
      return {
        valid: result,
        message: result ? undefined : this.errorMessage || 'Validation failed'
      };
    }

    return {
      valid: false,
      message: result
    };
  }
}
```

**File to modify**: `packages/hap-fluent/src/FluentCharacteristic.ts`

```typescript
import type { CharacteristicValidator, ValidationResult } from './validation.js';

export class FluentCharacteristic<T extends CharacteristicValue> {
  private validators: CharacteristicValidator<T>[] = [];

  addValidator(validator: CharacteristicValidator<T>): this {
    this.validators.push(validator);
    return this;
  }

  removeValidators(): this {
    this.validators = [];
    return this;
  }

  private validateValue(value: T): void {
    for (const validator of this.validators) {
      const result = validator.validate(value);
      if (!result.valid) {
        throw new ValidationError(
          result.message || 'Validation failed',
          {
            characteristic: this.characteristic.displayName,
            value,
            operation: 'validate'
          }
        );
      }
    }
  }

  set(value: T): this {
    this.validateValue(value);
    this.characteristic.setValue(value);
    return this;
  }
}
```

**Usage Example**:
```typescript
import { RangeValidator, EnumValidator } from 'hap-fluent';

const lightbulb = getOrAddService(accessory, Service.Lightbulb);

lightbulb.characteristics.Brightness
  .addValidator(new RangeValidator(0, 100))
  .onSet(async (value) => {
    // Value is guaranteed to be 0-100
    await device.setBrightness(value);
  });

lightbulb.characteristics.On
  .addValidator(new EnumValidator([true, false]))
  .onSet(async (value) => {
    await device.setPower(value);
  });
```

#### 4.2 Add Event System

**File to modify**: `packages/hap-fluent/src/FluentCharacteristic.ts`

```typescript
import { EventEmitter } from 'events';

export interface CharacteristicEvents<T> {
  change: (newValue: T, oldValue: T | undefined) => void;
  get: (value: T) => void;
  set: (value: T) => void;
}

export class FluentCharacteristic<T extends CharacteristicValue> {
  private events = new EventEmitter();

  on<E extends keyof CharacteristicEvents<T>>(
    event: E,
    listener: CharacteristicEvents<T>[E]
  ): this {
    this.events.on(event, listener);
    return this;
  }

  off<E extends keyof CharacteristicEvents<T>>(
    event: E,
    listener: CharacteristicEvents<T>[E]
  ): this {
    this.events.off(event, listener);
    return this;
  }

  once<E extends keyof CharacteristicEvents<T>>(
    event: E,
    listener: CharacteristicEvents<T>[E]
  ): this {
    this.events.once(event, listener);
    return this;
  }

  set(value: T): this {
    const oldValue = this.get();
    this.characteristic.setValue(value);
    this.events.emit('set', value);
    if (oldValue !== value) {
      this.events.emit('change', value, oldValue);
    }
    return this;
  }

  update(value: T): this {
    const oldValue = this.get();
    this.characteristic.updateValue(value);
    if (oldValue !== value) {
      this.events.emit('change', value, oldValue);
    }
    return this;
  }

  onGet(handler: () => Promise<T>): this {
    this.characteristic.onGet(async () => {
      const value = await handler();
      this.events.emit('get', value);
      return value;
    });
    return this;
  }
}
```

**Usage Example**:
```typescript
const lightbulb = getOrAddService(accessory, Service.Lightbulb);

// Listen for changes
lightbulb.characteristics.On.on('change', (newValue, oldValue) => {
  console.log(`Light changed from ${oldValue} to ${newValue}`);

  // Update other characteristics based on state
  if (newValue) {
    lightbulb.update('Brightness', 100);
  }
});

// Listen for SET operations
lightbulb.characteristics.Brightness.on('set', (value) => {
  console.log(`Brightness set to ${value} via HomeKit`);
});
```

#### 4.3 Add Middleware/Plugin System

**File to create**: `packages/hap-fluent/src/middleware.ts`

```typescript
export interface CharacteristicMiddleware<T> {
  beforeGet?(char: FluentCharacteristic<T>): void | Promise<void>;
  afterGet?(value: T, char: FluentCharacteristic<T>): T | Promise<T>;
  beforeSet?(value: T, char: FluentCharacteristic<T>): T | Promise<T>;
  afterSet?(value: T, char: FluentCharacteristic<T>): void | Promise<void>;
}

// Built-in middleware examples

export class LoggingMiddleware<T> implements CharacteristicMiddleware<T> {
  constructor(private logger: (message: string) => void = console.log) {}

  beforeGet(char: FluentCharacteristic<T>): void {
    this.logger(`GET ${char.displayName}`);
  }

  afterGet(value: T, char: FluentCharacteristic<T>): T {
    this.logger(`GET ${char.displayName} returned ${value}`);
    return value;
  }

  beforeSet(value: T, char: FluentCharacteristic<T>): T {
    this.logger(`SET ${char.displayName} to ${value}`);
    return value;
  }

  afterSet(value: T, char: FluentCharacteristic<T>): void {
    this.logger(`SET ${char.displayName} completed`);
  }
}

export class CachingMiddleware<T> implements CharacteristicMiddleware<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();

  constructor(private ttl: number = 5000) {}

  afterGet(value: T, char: FluentCharacteristic<T>): T {
    this.cache.set(char.displayName, {
      value,
      timestamp: Date.now()
    });
    return value;
  }

  beforeGet(char: FluentCharacteristic<T>): void {
    const cached = this.cache.get(char.displayName);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      // Return cached value (implementation depends on architecture)
    }
  }
}

export class RateLimitMiddleware<T> implements CharacteristicMiddleware<T> {
  private lastCall = new Map<string, number>();

  constructor(private minInterval: number = 1000) {}

  beforeSet(value: T, char: FluentCharacteristic<T>): T {
    const lastTime = this.lastCall.get(char.displayName);
    if (lastTime && Date.now() - lastTime < this.minInterval) {
      throw new Error(
        `Rate limit exceeded for ${char.displayName}. ` +
        `Minimum interval: ${this.minInterval}ms`
      );
    }
    this.lastCall.set(char.displayName, Date.now());
    return value;
  }
}
```

**File to modify**: `packages/hap-fluent/src/FluentCharacteristic.ts`

```typescript
import type { CharacteristicMiddleware } from './middleware.js';

export class FluentCharacteristic<T extends CharacteristicValue> {
  private middleware: CharacteristicMiddleware<T>[] = [];

  use(middleware: CharacteristicMiddleware<T>): this {
    this.middleware.push(middleware);
    return this;
  }

  async onGet(handler: () => Promise<T>): this {
    this.characteristic.onGet(async () => {
      // Run beforeGet middleware
      for (const mw of this.middleware) {
        if (mw.beforeGet) {
          await mw.beforeGet(this);
        }
      }

      let value = await handler();

      // Run afterGet middleware
      for (const mw of this.middleware) {
        if (mw.afterGet) {
          value = await mw.afterGet(value, this);
        }
      }

      return value;
    });
    return this;
  }

  async onSet(handler: (value: T) => Promise<void>): this {
    this.characteristic.onSet(async (rawValue: CharacteristicValue) => {
      let value = rawValue as T;

      // Run beforeSet middleware
      for (const mw of this.middleware) {
        if (mw.beforeSet) {
          value = await mw.beforeSet(value, this);
        }
      }

      await handler(value);

      // Run afterSet middleware
      for (const mw of this.middleware) {
        if (mw.afterSet) {
          await mw.afterSet(value, this);
        }
      }
    } as unknown as CharacteristicSetHandler);
    return this;
  }
}
```

**Usage Example**:
```typescript
import { LoggingMiddleware, RateLimitMiddleware } from 'hap-fluent';

const lightbulb = getOrAddService(accessory, Service.Lightbulb);

lightbulb.characteristics.On
  .use(new LoggingMiddleware())
  .use(new RateLimitMiddleware(500))
  .onSet(async (value) => {
    await device.setPower(value);
  });
```

---

### Phase 5: Performance & Optimization (Low Priority)

**Goal**: Optimize for performance in large-scale deployments.

#### 5.1 Add Caching Layer

**File to create**: `packages/hap-fluent/src/cache.ts`

```typescript
export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache entries
}

export class CharacteristicCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private readonly ttl: number;
  private readonly maxSize: number;

  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl ?? 5000;
    this.maxSize = options.maxSize ?? 100;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: T): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, { value, timestamp: Date.now() });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
```

**File to modify**: `packages/hap-fluent/src/FluentCharacteristic.ts`

```typescript
import { CharacteristicCache } from './cache.js';

export class FluentCharacteristic<T extends CharacteristicValue> {
  private cache?: CharacteristicCache<T>;

  enableCache(options?: CacheOptions): this {
    this.cache = new CharacteristicCache<T>(options);
    return this;
  }

  disableCache(): this {
    this.cache = undefined;
    return this;
  }

  get(): T | undefined {
    if (this.cache) {
      const cached = this.cache.get(this.characteristic.displayName);
      if (cached !== undefined) {
        return cached;
      }
    }

    const value = this.characteristic.value as T | undefined;

    if (this.cache && value !== undefined) {
      this.cache.set(this.characteristic.displayName, value);
    }

    return value;
  }

  set(value: T): this {
    this.characteristic.setValue(value);
    if (this.cache) {
      this.cache.invalidate(this.characteristic.displayName);
    }
    return this;
  }

  update(value: T): this {
    this.characteristic.updateValue(value);
    if (this.cache) {
      this.cache.set(this.characteristic.displayName, value);
    }
    return this;
  }
}
```

#### 5.2 Add Batching Support

**File to modify**: `packages/hap-fluent/src/FluentService.ts`

```typescript
export type FluentService<T extends typeof Service> = {
  // ... existing properties

  updateBatch(updates: Partial<InterfaceForService<T>>): void;
  getBatch<K extends CharacteristicNamesOf<T>[]>(
    keys: K
  ): { [P in K[number]]: InterfaceForService<T>[P] | undefined };
};

export function wrapService<T extends typeof Service>(
  service: InstanceType<T>
): FluentService<T> {
  // ... existing code

  const obj = {
    // ... existing properties

    updateBatch: (updates: Partial<InterfaceForService<T>>) => {
      const entries = Object.entries(updates);

      // Batch all updates together
      for (const [key, value] of entries) {
        if (key in e.characteristics) {
          e.characteristics[key].update(value as any);
        }
      }
    },

    getBatch: <K extends CharacteristicNamesOf<T>[]>(keys: K) => {
      const result: any = {};
      for (const key of keys) {
        if (key in e.characteristics) {
          result[key] = e.characteristics[key].get();
        }
      }
      return result;
    }
  };

  // ... rest of the code
}
```

**Usage Example**:
```typescript
const lightbulb = getOrAddService(accessory, Service.Lightbulb);

// Update multiple characteristics at once
lightbulb.updateBatch({
  On: true,
  Brightness: 75,
  Hue: 180,
  Saturation: 50
});

// Get multiple values at once
const state = lightbulb.getBatch(['On', 'Brightness', 'Hue']);
console.log(state); // { On: true, Brightness: 75, Hue: 180 }
```

---

### Phase 6: Build & Tooling (Low Priority)

**Goal**: Improve build process and developer tooling.

#### 6.1 Add Source Maps

**File to modify**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

**Benefits**:
- Better debugging in production
- Stack traces point to original source
- IDE support for jump-to-definition

#### 6.2 Modern Package Exports

**File to modify**: `packages/hap-fluent/package.json`

```json
{
  "name": "hap-fluent",
  "version": "0.3.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./types": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/types/index.js",
      "default": "./dist/types/index.js"
    },
    "./validation": {
      "types": "./dist/validation.d.ts",
      "import": "./dist/validation.js",
      "default": "./dist/validation.js"
    },
    "./middleware": {
      "types": "./dist/middleware.d.ts",
      "import": "./dist/middleware.js",
      "default": "./dist/middleware.js"
    },
    "./package.json": "./package.json"
  },
  "typesVersions": {
    "*": {
      "*": ["./dist/*"],
      "types": ["./dist/types/index.d.ts"],
      "validation": ["./dist/validation.d.ts"],
      "middleware": ["./dist/middleware.d.ts"]
    }
  }
}
```

**Benefits**:
- Better tree-shaking
- Explicit module boundaries
- Prevents importing internal modules

#### 6.3 Add Bundle Size Tracking

**File to modify**: `packages/hap-fluent/package.json`

```json
{
  "scripts": {
    "size": "size-limit",
    "size:why": "size-limit --why"
  },
  "devDependencies": {
    "@size-limit/preset-small-lib": "^11.0.0",
    "size-limit": "^11.0.0"
  },
  "size-limit": [
    {
      "name": "Core (FluentCharacteristic + FluentService)",
      "path": "dist/index.js",
      "import": "{ FluentCharacteristic, FluentService }",
      "limit": "5 KB"
    },
    {
      "name": "Full bundle",
      "path": "dist/index.js",
      "limit": "15 KB"
    },
    {
      "name": "Types only",
      "path": "dist/types/index.js",
      "limit": "1 KB"
    }
  ]
}
```

**File to create**: `.github/workflows/size.yml`

```yaml
name: Bundle Size

on:
  pull_request:
    branches: [main]

jobs:
  size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run build
      - uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          package_manager: pnpm
```

---

## Implementation Priority

### Immediate (Week 1)
**Goal**: Fix critical issues and make library safe to use

- [ ] Fix package dependencies (move to peerDependencies)
- [ ] Remove all commented-out code blocks
- [ ] Fix syntax errors in examples
- [ ] Add basic error handling to FluentCharacteristic
- [ ] Add input validation to public methods
- [ ] Create basic package README

**Deliverable**: Version 0.4.0 - "Stability Release"

### Short-term (Weeks 2-4)
**Goal**: Production readiness

- [ ] Add comprehensive error handling across all modules
- [ ] Remove all type safety violations (`as any`, `//@ts-ignore`)
- [ ] Create custom error classes with context
- [ ] Add debug logging with `debug` package
- [ ] Add test coverage reporting
- [ ] Implement validation framework
- [ ] Write integration tests with real HAP services
- [ ] Create comprehensive documentation

**Deliverable**: Version 1.0.0 - "Production Ready"

### Medium-term (Months 2-3)
**Goal**: Enhanced developer experience

- [ ] Add event system for characteristic changes
- [ ] Implement middleware/plugin system
- [ ] Add property-based testing
- [ ] Improve error messages with helpful context
- [ ] Add type utilities for better DX
- [ ] Create migration guide from direct HAP usage
- [ ] Add examples for common patterns

**Deliverable**: Version 1.1.0 - "Enhanced DX"

### Long-term (Months 3-6)
**Goal**: Performance and scalability

- [ ] Implement caching layer
- [ ] Add batching support for bulk operations
- [ ] Add source maps for debugging
- [ ] Implement modern package exports
- [ ] Add bundle size tracking and optimization
- [ ] Create performance benchmarks
- [ ] Add advanced caching strategies

**Deliverable**: Version 1.2.0 - "Performance"

---

## Recommended Next Steps

### 1. Start with Phase 1
Focus on robustness and code quality first. A stable foundation is essential before adding advanced features.

### 2. Create Project Governance Files

**CHANGELOG.md**
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Moved homebridge and hap-nodejs to peerDependencies

### Removed
- Removed commented-out code blocks
- Removed syntax errors in examples

### Fixed
- Fixed type safety violations
- Fixed missing error handling

## [0.3.0] - 2024-XX-XX

### Added
- Initial release with fluent API
```

**CONTRIBUTING.md**
```markdown
# Contributing to HAP Fluent

Thank you for your interest in contributing!

## Development Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Build: `pnpm run build`
4. Test: `pnpm run test`

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Add tests for new functionality
4. Ensure all tests pass
5. Update documentation
6. Submit PR with clear description

## Coding Standards

- Follow TypeScript strict mode
- Add JSDoc comments to public APIs
- Maintain test coverage above 80%
- Run `pnpm run lint` before committing
```

### 3. Set up CI/CD

**File to create**: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run lint
      - run: pnpm run type-check
      - run: pnpm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./packages/hap-fluent/coverage/lcov.info
```

### 4. Plan Version Releases

- **0.4.0** - Critical fixes (Week 1)
- **1.0.0** - Production ready (Month 1)
- **1.1.0** - Enhanced features (Month 2-3)
- **1.2.0** - Performance optimizations (Month 4-6)

---

## Summary

This enhancement proposal provides a comprehensive roadmap to transform hap-fluent into a production-ready, developer-friendly library. The phased approach ensures:

1. **Immediate stability** through critical bug fixes
2. **Production readiness** with comprehensive error handling and testing
3. **Enhanced DX** with better documentation and tooling
4. **Long-term sustainability** with performance optimizations

The library has strong foundations - with these enhancements, it will become a best-in-class wrapper for HAP-NodeJS.

---

**Next Actions**:
1. Review and prioritize enhancements
2. Create GitHub issues for each task
3. Begin Phase 1 implementation
4. Set up CI/CD pipeline
5. Plan 1.0.0 release milestone
