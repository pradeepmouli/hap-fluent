# HAP Fluent

> Fluent, strongly-typed wrapper for HAP-NodeJS services and characteristics

[![npm version](https://img.shields.io/npm/v/hap-fluent.svg)](https://www.npmjs.com/package/hap-fluent)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

HAP Fluent provides a type-safe, fluent API for working with HomeKit Accessory Protocol (HAP) services and characteristics in Homebridge plugins. It eliminates boilerplate code, provides compile-time type safety, and offers excellent developer experience with comprehensive error handling and structured logging.

## Features

- ✨ **Fluent API**: Method chaining for readable, expressive code
- 🔒 **Type Safety**: Full TypeScript support with generated HAP interfaces
- 🎯 **IntelliSense**: Autocomplete for services and characteristics
- 🛡️ **Error Handling**: Typed error classes with contextual information
- 📝 **Structured Logging**: Pino integration with configurable log levels
- 🧰 **Type Utilities**: Transformers, validators, and helper types
- 📦 **Tree-Shakeable**: Modern ES modules with optimized exports
- ✅ **Well-Tested**: 128 tests, 100% pass rate
- 📚 **Documented**: Comprehensive JSDoc on all public APIs

## Installation

```bash
npm install hap-fluent
```

### Peer Dependencies

HAP Fluent requires the following peer dependencies:

```bash
npm install homebridge@>=1.11.0 hap-nodejs@>=0.13.0
```

## Quick Start

```typescript
import { API } from 'homebridge';
import { getOrAddService, initializeAccessory } from 'hap-fluent';
import { configureLogger } from 'hap-fluent/logger';

// Configure logging (optional)
configureLogger({ level: 'debug', pretty: true });

export default (api: API) => {
  api.registerAccessory('MyPlugin', 'MyAccessory', MyAccessory);
};

class MyAccessory {
  constructor(private readonly log: any, private readonly config: any, private readonly api: API) {
    // Create accessory
    const uuid = api.hap.uuid.generate('my-unique-id');
    const accessory = new api.platformAccessory('My Light', uuid);
    
    // Add lightbulb service with fluent API
    const lightbulb = getOrAddService(
      accessory,
      api.hap.Service.Lightbulb,
      'My Light'
    );
    
    // Set up characteristic handlers
    lightbulb.onGet('On', async () => {
      return await this.getLightState();
    });
    
    lightbulb.onSet('On', async (value) => {
      await this.setLightState(value);
    });
    
    // Set initial values
    lightbulb.characteristics.On.set(true);
    lightbulb.characteristics.Brightness.set(100);
  }
  
  private async getLightState(): Promise<boolean> {
    // Your implementation
    return true;
  }
  
  private async setLightState(value: boolean): Promise<void> {
    // Your implementation
  }
}
```

## Core API

### FluentService

Wrap HAP services with type-safe characteristic access and fluent methods.

```typescript
import { getOrAddService, wrapService } from 'hap-fluent';

// Get or add a service
const lightbulb = getOrAddService(
  accessory,
  hap.Service.Lightbulb,
  'Living Room Light',
  'main' // optional subtype
);

// Access characteristics (both camelCase and PascalCase supported)
lightbulb.characteristics.On.set(true);
lightbulb.characteristics.brightness.set(75); // camelCase also works

// Shorthand property access
lightbulb.on = true;
lightbulb.brightness = 75;

// Register handlers
lightbulb.onGet('On', async () => {
  return await getDeviceState();
});

lightbulb.onSet('Brightness', async (value) => {
  await setDeviceBrightness(value);
});

// Update without triggering SET handlers
lightbulb.update('On', false);
lightbulb.update('Brightness', 50);
```

### FluentCharacteristic

Type-safe wrapper for HAP characteristics with error handling.

```typescript
// Get current value
const currentBrightness = lightbulb.characteristics.Brightness.get();

// Set value (triggers SET handlers)
lightbulb.characteristics.On
  .set(true)
  .setProps({ minValue: 0, maxValue: 100 });

// Update value (no SET handlers)
lightbulb.characteristics.Brightness.update(75);

// Register async handlers
lightbulb.characteristics.On.onGet(async () => {
  const state = await fetchDeviceState();
  return state.isOn;
});

lightbulb.characteristics.On.onSet(async (value) => {
  await updateDeviceState({ isOn: value });
});
```

### AccessoryHandler

Initialize accessories with state and type-safe service access.

```typescript
import { initializeAccessory } from 'hap-fluent';

const accessory = initializeAccessory(platformAccessory, {
  lightbulb: {
    on: true,
    brightness: 75,
    hue: 120,
    saturation: 50,
  },
  accessoryInformation: {
    manufacturer: 'ACME',
    model: 'Light-1000',
    serialNumber: 'SN12345',
    firmwareRevision: '1.0.0',
  },
});

// Access services with full type safety
accessory.lightbulb.characteristics.On.get(); // boolean
accessory.lightbulb.characteristics.Brightness.get(); // number
```

## Error Handling

HAP Fluent provides typed error classes for robust error handling:

```typescript
import {
  FluentError,
  FluentCharacteristicError,
  FluentServiceError,
  ValidationError,
  ConfigurationError,
} from 'hap-fluent/errors';

try {
  lightbulb.characteristics.Brightness.set(150);
} catch (error) {
  if (error instanceof FluentCharacteristicError) {
    console.error('Characteristic Error:', {
      message: error.message,
      characteristic: error.context?.characteristic,
      value: error.context?.value,
      originalError: error.context?.originalError,
    });
    
    // Implement retry, fallback, or user notification
  } else if (error instanceof ValidationError) {
    console.error('Validation Error:', error.context);
  }
}
```

### Error Classes

- **FluentError**: Base class for all HAP Fluent errors
- **FluentCharacteristicError**: Characteristic operation failures
- **FluentServiceError**: Service operation failures
- **ValidationError**: Input validation errors
- **ConfigurationError**: Configuration-related errors

All errors include a `context` object with relevant debugging information.

## Structured Logging

HAP Fluent uses Pino for fast, structured JSON logging.

### Configuration

```typescript
import { configureLogger, getLogger, createChildLogger } from 'hap-fluent/logger';

// Development: pretty printing
configureLogger({
  level: 'debug',
  pretty: true,
});

// Production: JSON output
configureLogger({
  level: 'info',
  pretty: false,
  base: {
    plugin: 'homebridge-my-plugin',
    version: '1.0.0',
  },
});
```

### Usage

```typescript
const logger = getLogger();

// Structured logging
logger.info({ deviceId: '123', status: 'online' }, 'Device connected');
logger.debug({ operation: 'setBrightness', value: 75 }, 'Setting brightness');
logger.warn('Device slow to respond, retrying...');
logger.error({ err: new Error('Timeout') }, 'Operation failed');

// Child loggers with context
const deviceLogger = createChildLogger({
  device: 'living-room-light',
  deviceId: '12345',
});

deviceLogger.info('State changed');
// Output includes device context in every log
```

### Log Levels

- `trace`: Very detailed (rarely used)
- `debug`: Detailed for debugging
- `info`: General informational messages (default)
- `warn`: Warning messages
- `error`: Error messages
- `fatal`: Critical errors
- `silent`: No logging

## Type Utilities

HAP Fluent provides type utilities for common operations:

### Value Transformers

```typescript
import { createClampTransformer, createScaleTransformer } from 'hap-fluent/type-utils';

// Clamp values to valid range
const clampBrightness = createClampTransformer(0, 100);
clampBrightness(150); // Returns 100
clampBrightness(-10); // Returns 0

// Scale between ranges
const percentToDecimal = createScaleTransformer(0, 100, 0, 1);
percentToDecimal(50); // Returns 0.5
```

### Value Predicates

```typescript
import { createRangePredicate } from 'hap-fluent/type-utils';

const isValidHue = createRangePredicate(0, 360);
isValidHue(180); // true
isValidHue(400); // false
```

### Type Helpers

```typescript
import type {
  ServiceState,
  PartialServiceState,
  CharacteristicNames,
  CharacteristicType,
} from 'hap-fluent/type-utils';

// Service state management
const state: ServiceState = {
  on: true,
  brightness: 75,
  hue: 120,
};

// Partial updates
const update: PartialServiceState = {
  brightness: 100,
};
```

## Advanced Examples

### Multi-Service Accessories

```typescript
const accessory = initializeAccessory(platformAccessory, {
  lightbulb: {
    on: true,
    brightness: 75,
  },
  temperatureSensor: {
    currentTemperature: 22.5,
  },
  accessoryInformation: {
    manufacturer: 'ACME',
    model: 'Smart Light Pro',
  },
});

// Access each service
accessory.lightbulb.onSet('On', async (value) => {
  await device.setPower(value);
});

accessory.temperatureSensor.update('CurrentTemperature', 23.0);
```

### Service with Subtypes

```typescript
// Create multiple instances of the same service type
const outlet1 = getOrAddService(
  accessory,
  hap.Service.Outlet,
  'Main Outlet',
  'outlet-1'
);

const outlet2 = getOrAddService(
  accessory,
  hap.Service.Outlet,
  'USB Outlet',
  'outlet-2'
);

// Configure each independently
outlet1.onSet('On', async (value) => {
  await device.setOutlet(1, value);
});

outlet2.onSet('On', async (value) => {
  await device.setOutlet(2, value);
});
```

### Error Recovery with Retry

```typescript
import { FluentCharacteristicError } from 'hap-fluent/errors';

async function setWithRetry(
  characteristic: any,
  value: any,
  maxRetries = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      characteristic.set(value);
      return true;
    } catch (error) {
      if (error instanceof FluentCharacteristicError) {
        if (attempt < maxRetries) {
          logger.warn({ attempt, maxRetries }, 'Retrying...');
          await delay(Math.pow(2, attempt) * 1000);
        } else {
          logger.error({ attempt, maxRetries, error }, 'Failed after retries');
          return false;
        }
      } else {
        throw error; // Non-recoverable error
      }
    }
  }
  return false;
}
```

### Custom Type Guards

```typescript
import { isFluentCharacteristic } from 'hap-fluent/type-utils';

function processValue(obj: unknown) {
  if (isFluentCharacteristic(obj)) {
    // TypeScript knows obj is FluentCharacteristic
    const value = obj.get();
    obj.set(newValue);
  }
}
```

## Best Practices

### 1. Configure Logging Early

```typescript
// In plugin constructor or platform
configureLogger({
  level: process.env.DEBUG ? 'debug' : 'info',
  pretty: process.env.NODE_ENV === 'development',
  base: {
    plugin: this.name,
    version: this.version,
  },
});
```

### 2. Use Child Loggers for Context

```typescript
class MyAccessory {
  private readonly logger;
  
  constructor(accessory: PlatformAccessory) {
    this.logger = createChildLogger({
      accessory: accessory.displayName,
      uuid: accessory.UUID,
    });
    
    this.logger.info('Accessory initialized');
  }
}
```

### 3. Handle Errors Gracefully

```typescript
try {
  await characteristic.set(value);
} catch (error) {
  if (error instanceof FluentCharacteristicError) {
    // Log and recover
    this.logger.error({ error }, 'Failed to set characteristic');
    // Use fallback value or notify user
  } else {
    // Unknown error, re-throw
    throw error;
  }
}
```

### 4. Use Type Utilities for Validation

```typescript
import { createRangePredicate, createClampTransformer } from 'hap-fluent/type-utils';

const isValid = createRangePredicate(0, 100);
const clamp = createClampTransformer(0, 100);

function setBrightness(value: number) {
  if (!isValid(value)) {
    logger.warn({ value }, 'Invalid brightness, clamping');
    value = clamp(value);
  }
  
  characteristic.set(value);
}
```

### 5. Initialize Accessories with State

```typescript
// Define initial state
const initialState = {
  lightbulb: {
    on: false,
    brightness: 0,
  },
  accessoryInformation: {
    manufacturer: 'ACME',
    model: 'Light-1000',
    serialNumber: device.serialNumber,
  },
};

// Initialize with state
const accessory = initializeAccessory(platformAccessory, initialState);
```

## TypeScript Configuration

HAP Fluent requires TypeScript 5.0+ with strict mode enabled:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "esModuleInterop": true
  }
}
```

## API Reference

### Exports

```typescript
// Main API
export { getOrAddService, wrapService } from 'hap-fluent';
export { FluentCharacteristic, FluentService } from 'hap-fluent';
export { initializeAccessory, createServicesObject } from 'hap-fluent';

// Error handling
export * from 'hap-fluent/errors';
export { isCharacteristicValue, isService, isCharacteristic } from 'hap-fluent/type-guards';

// Logging
export { configureLogger, getLogger, createChildLogger, resetLogger } from 'hap-fluent/logger';
export type { LogLevel, LoggerOptions } from 'hap-fluent/logger';

// Type utilities
export * from 'hap-fluent/type-utils';

// Types
export type * from 'hap-fluent/types';
```

## Performance

HAP Fluent is designed for minimal overhead:

- **Method Call Overhead**: <1ms per operation
- **Memory Footprint**: <100KB additional over raw HAP-NodeJS
- **Zero Runtime Dependencies**: Only `pino` and `camelcase`
- **Tree-Shakeable**: Use only what you need

## Migration Guide

### From Raw HAP-NodeJS

**Before:**
```typescript
const service = accessory.getService(hap.Service.Lightbulb) ||
  accessory.addService(hap.Service.Lightbulb);

service.getCharacteristic(hap.Characteristic.On)
  .onGet(async () => await getLightState())
  .onSet(async (value) => await setLightState(value as boolean));
```

**After:**
```typescript
const lightbulb = getOrAddService(accessory, hap.Service.Lightbulb);

lightbulb.onGet('On', async () => await getLightState());
lightbulb.onSet('On', async (value) => await setLightState(value));
```

## Troubleshooting

### Type Errors

If you see type errors, ensure:
1. TypeScript 5.0+ is installed
2. `strict: true` is enabled
3. Peer dependencies are correctly installed

### Logging Not Appearing

```typescript
// Ensure logger is configured before use
configureLogger({ level: 'debug' });

// Check that level is not 'silent'
const logger = getLogger();
console.log('Current level:', logger.level);
```

### Characteristic Value Errors

```typescript
import { isCharacteristicValue } from 'hap-fluent/type-guards';

// Validate before setting
if (isCharacteristicValue(value)) {
  characteristic.set(value);
} else {
  logger.error({ value }, 'Invalid characteristic value');
}
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

Apache-2.0 © Pradeep Mouli

## Acknowledgments

- Built on top of [HAP-NodeJS](https://github.com/homebridge/HAP-NodeJS)
- Designed for [Homebridge](https://homebridge.io/)
- Logging powered by [Pino](https://getpino.io/)

## Support

- 📖 [Documentation](https://github.com/pradeepmouli/hap-fluent/wiki)
- 🐛 [Issue Tracker](https://github.com/pradeepmouli/hap-fluent/issues)
- 💬 [Discussions](https://github.com/pradeepmouli/hap-fluent/discussions)

---

**Status**: Active development | **Version**: 0.3.0 | **Phase**: 2 of 6 Complete
