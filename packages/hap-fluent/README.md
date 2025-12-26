# HAP Fluent

> Fluent, strongly-typed wrapper for HAP-NodeJS services and characteristics

[![npm version](https://img.shields.io/npm/v/hap-fluent.svg)](https://www.npmjs.com/package/hap-fluent)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/hap-fluent)](https://bundlephobia.com/package/hap-fluent)

HAP Fluent provides a type-safe, fluent API for working with HomeKit Accessory Protocol (HAP) services and characteristics in Homebridge plugins. It eliminates boilerplate code, provides compile-time type safety, and offers excellent developer experience with comprehensive error handling and structured logging.

## Features

- ✨ **Fluent API**: Method chaining for readable, expressive code
- 🔒 **Type Safety**: Full TypeScript support with generated HAP interfaces
- 🎯 **IntelliSense**: Autocomplete for services and characteristics
- 🛡️ **Error Handling**: Typed error classes with contextual information
- 📝 **Structured Logging**: Pino integration with configurable log levels
- 🔄 **Interceptors**: Built-in logging, rate limiting, transformation, and codec support
- 🧰 **Type Utilities**: Transformers, validators, and helper types
- 📦 **Tree-Shakeable**: Modern ES modules with optimized exports
- ✅ **Well-Tested**: 196 tests, 100% pass rate
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

## Standard Interceptors

hap-fluent provides built-in interceptors for common cross-cutting concerns. Interceptors wrap `onSet` and `onGet` handlers to add behavior transparently.

### Available Interceptors

#### `.log()` - Logging Interceptor

Logs all characteristic operations (before/after set/get, errors).

```typescript
characteristic
  .log()
  .onSet(async (value) => {
    // Your handler
  });
```

#### `.limit(maxCalls, windowMs)` - Rate Limiting

Prevents excessive updates by limiting calls per time window.

```typescript
characteristic
  .limit(5, 1000)  // Max 5 calls per second
  .onSet(async (value) => {
    // Rate-limited handler
  });
```

#### `.clamp(min, max)` - Value Clamping

Ensures numeric values stay within specified bounds.

```typescript
characteristic
  .clamp(0, 100)  // Clamp to 0-100 range
  .onSet(async (value) => {
    // Value is guaranteed to be 0-100
  });
```

#### `.transform(fn)` - Value Transformation

Applies a transformation function to values before setting.

```typescript
characteristic
  .transform((v) => Math.round(v as number))  // Round to integer
  .onSet(async (value) => {
    // Value is now an integer
  });
```

#### `.codec(encode, decode)` - Two-Way Transformation

Transforms values when setting (encode) and retrieving (decode). Perfect for unit conversions or format transformations.

```typescript
// Convert between Celsius and Fahrenheit
characteristic.codec(
  (fahrenheit) => (fahrenheit - 32) * 5/9,  // encode: F to C
  (celsius) => (celsius * 9/5) + 32         // decode: C to F
).onSet(async (value) => {
  console.log('Temperature in Fahrenheit:', value);
});

// String format conversion
characteristic.codec(
  (value) => String(value).toUpperCase(),  // encode
  (value) => String(value).toLowerCase()   // decode
);

// JSON serialization
characteristic.codec(
  (obj) => JSON.stringify(obj),           // encode
  (str) => JSON.parse(String(str))        // decode
);
```

#### `.audit()` - Audit Trail

Tracks all operations for debugging and compliance.

```typescript
characteristic
  .audit()
  .onSet(async (value) => {
    // All operations logged to audit trail
  });
```

### Chaining Interceptors

All interceptors are chainable and execute in order:

```typescript
characteristic
  .log()                              // 1. Log operation
  .codec(encodeValue, decodeValue)    // 2. Transform value
  .clamp(0, 100)                      // 3. Clamp to range
  .transform((v) => Math.round(v))    // 4. Round value
  .limit(5, 1000)                     // 5. Rate limit
  .audit()                            // 6. Audit trail
  .onSet(async (value) => {
    // Final value after all interceptors
  });
```

### Validation (Deprecated)

**Note:** The validation framework (`addValidator`, `RangeValidator`, `EnumValidator`, etc.) is deprecated. HAP-nodejs and Homebridge automatically validate values based on characteristic metadata.

**Instead of validators, use HAP's built-in validation:**

```typescript
// ❌ Deprecated: Custom validators
import { RangeValidator } from 'hap-fluent/validation';
characteristic.addValidator(new RangeValidator(0, 100, 'Brightness'));

// ✅ Recommended: HAP built-in validation
characteristic.setProps({ minValue: 0, maxValue: 100 });

// ✅ For enum values
characteristic.setProps({ validValues: [0, 1, 2, 3] });
```

HAP-nodejs validates based on:
- `minValue` / `maxValue` - Numeric range validation
- `validValues` - Enum value validation
- `format` - Format validation (e.g., uint8, uint16, float)
- `unit` - Unit validation (e.g., celsius, percentage, arcdegrees)

For custom transformations or formatting, use the `.codec()` or `.transform()` interceptors instead.

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

## Using with Homebridge Plugins

HAP Fluent is designed to work seamlessly with Homebridge dynamic platform plugins, providing a more maintainable and type-safe alternative to directly using HAP-NodeJS APIs.

### Complete Homebridge Plugin Example

Here's a complete example of a Homebridge dynamic platform plugin using hap-fluent to manage smart light accessories:

```typescript
import {
  API,
  DynamicPlatformPlugin,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
  Logger,
} from 'homebridge';
import { FluentService, getOrAddService } from 'hap-fluent';
import { configureLogger } from 'hap-fluent/logger';

const PLUGIN_NAME = 'homebridge-smart-lights';
const PLATFORM_NAME = 'SmartLights';

export = (api: API) => {
  api.registerPlatform(PLATFORM_NAME, SmartLightsPlatform);
};

class SmartLightsPlatform implements DynamicPlatformPlugin {
  private readonly accessories: Map<string, PlatformAccessory> = new Map();

  constructor(
    private readonly log: Logger,
    private readonly config: PlatformConfig,
    private readonly api: API
  ) {
    // Configure hap-fluent logging
    configureLogger({
      level: config.debug ? 'debug' : 'info',
      pretty: true,
    });

    this.api.on('didFinishLaunching', () => {
      this.discoverDevices();
    });
  }

  /**
   * Called when Homebridge restores cached accessories from disk at startup
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    
    // Re-attach handlers to cached accessory
    this.setupAccessoryHandlers(accessory);
    this.accessories.set(accessory.UUID, accessory);
  }

  /**
   * Discover and register devices
   */
  async discoverDevices() {
    // Example: Fetch devices from your smart home API
    const devices = await this.fetchDevices();

    for (const device of devices) {
      const uuid = this.api.hap.uuid.generate(device.id);
      const existingAccessory = this.accessories.get(uuid);

      if (existingAccessory) {
        // Update existing accessory
        this.log.info('Restoring existing accessory:', device.name);
        existingAccessory.context.device = device;
        this.setupAccessoryHandlers(existingAccessory);
        this.api.updatePlatformAccessories([existingAccessory]);
      } else {
        // Create new accessory
        this.log.info('Adding new accessory:', device.name);
        const accessory = new this.api.platformAccessory(device.name, uuid);
        accessory.context.device = device;
        
        this.setupAccessoryHandlers(accessory);
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        this.accessories.set(uuid, accessory);
      }
    }

    // Remove accessories that no longer exist
    const deviceUUIDs = new Set(devices.map(d => this.api.hap.uuid.generate(d.id)));
    for (const [uuid, accessory] of this.accessories) {
      if (!deviceUUIDs.has(uuid)) {
        this.log.info('Removing accessory:', accessory.displayName);
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        this.accessories.delete(uuid);
      }
    }
  }

  /**
   * Setup accessory with hap-fluent
   */
  private setupAccessoryHandlers(accessory: PlatformAccessory) {
    const device = accessory.context.device;

    // Set up accessory information service
    const info = accessory.getService(this.api.hap.Service.AccessoryInformation)!;
    info
      .setCharacteristic(this.api.hap.Characteristic.Manufacturer, device.manufacturer || 'Smart Lights')
      .setCharacteristic(this.api.hap.Characteristic.Model, device.model || 'Smart Bulb')
      .setCharacteristic(this.api.hap.Characteristic.SerialNumber, device.serialNumber || device.id)
      .setCharacteristic(this.api.hap.Characteristic.FirmwareRevision, device.firmwareVersion || '1.0.0');

    // Get or add lightbulb service using hap-fluent
    const lightbulb: FluentService = getOrAddService(
      accessory,
      this.api.hap.Service.Lightbulb,
      device.name
    );

    // HAP validates brightness automatically based on characteristic props
    lightbulb.characteristics.Brightness.setProps({ minValue: 0, maxValue: 100 });

    // Setup interceptors for logging and rate limiting
    lightbulb.characteristics.On
      .log()  // Log all operations
      .limit(5, 1000)  // Rate limit to 5 calls per second
      .onGet(async () => {
        this.log.debug('Getting On state for', device.name);
        try {
          const state = await this.getDeviceState(device.id);
          return state.on;
        } catch (error) {
          this.log.error('Failed to get On state:', error);
          throw error;
        }
      })
      .onSet(async (value: boolean) => {
        this.log.debug('Setting On state to', value, 'for', device.name);
        try {
          await this.setDevicePower(device.id, value);
        } catch (error) {
          this.log.error('Failed to set On state:', error);
          throw error;
        }
      });

    // Setup brightness with transformation and clamping
    lightbulb.characteristics.Brightness
      .transform((value) => Math.round(value as number))  // Round to integer
      .clamp(0, 100)  // Ensure within range
      .onGet(async () => {
        this.log.debug('Getting Brightness for', device.name);
        try {
          const state = await this.getDeviceState(device.id);
          return state.brightness;
        } catch (error) {
          this.log.error('Failed to get Brightness:', error);
          throw error;
        }
      })
      .onSet(async (value: number) => {
        this.log.debug('Setting Brightness to', value, 'for', device.name);
        try {
          await this.setDeviceBrightness(device.id, value);
        } catch (error) {
          this.log.error('Failed to set Brightness:', error);
          throw error;
        }
      });

    // Example: Use codec for color temperature conversion (Kelvin <-> Mireds)
    // Some devices use Kelvin, but HAP uses mireds (micro reciprocal degrees)
    if (device.supportsColorTemperature) {
      lightbulb.characteristics.ColorTemperature
        .codec(
          // encode: Convert Kelvin to mireds for HAP
          (kelvin) => Math.round(1000000 / (kelvin as number)),
          // decode: Convert mireds to Kelvin for device API
          (mireds) => Math.round(1000000 / (mireds as number))
        )
        .onGet(async () => {
          const state = await this.getDeviceState(device.id);
          return state.colorTemperature;  // Returns Kelvin, codec converts to mireds
        })
        .onSet(async (kelvin: number) => {
          // Receives Kelvin (converted from mireds by codec)
          await this.setDeviceColorTemperature(device.id, kelvin);
        });
    }

    // Optional: Setup hue and saturation for color lights
    if (device.supportsColor) {
      lightbulb.characteristics.Hue
        .clamp(0, 360)
        .onGet(async () => {
          const state = await this.getDeviceState(device.id);
          return state.hue;
        })
        .onSet(async (value: number) => {
          await this.setDeviceHue(device.id, value);
        });

      lightbulb.characteristics.Saturation
        .clamp(0, 100)
        .onGet(async () => {
          const state = await this.getDeviceState(device.id);
          return state.saturation;
        })
        .onSet(async (value: number) => {
          await this.setDeviceSaturation(device.id, value);
        });
    }

    // Poll device state every 30 seconds and update HomeKit
    this.startPolling(device.id, lightbulb);
  }

  /**
   * Poll device state and update HomeKit
   */
  private startPolling(deviceId: string, lightbulb: FluentService) {
    setInterval(async () => {
      try {
        const state = await this.getDeviceState(deviceId);
        
        // Update HomeKit without triggering SET handlers
        lightbulb.characteristics.On.update(state.on);
        lightbulb.characteristics.Brightness.update(state.brightness);
        
        if (state.hue !== undefined) {
          lightbulb.characteristics.Hue?.update(state.hue);
        }
        if (state.saturation !== undefined) {
          lightbulb.characteristics.Saturation?.update(state.saturation);
        }
      } catch (error) {
        this.log.error('Failed to poll device state:', error);
      }
    }, 30000);
  }

  // Device API methods (implement based on your smart home platform)
  private async fetchDevices() {
    // Fetch devices from your API
    return [
      { id: '1', name: 'Living Room Light', manufacturer: 'ACME', model: 'LB-100', supportsColor: true },
      { id: '2', name: 'Bedroom Light', manufacturer: 'ACME', model: 'LB-50', supportsColor: false },
    ];
  }

  private async getDeviceState(deviceId: string) {
    // Fetch current state from your API
    return { on: true, brightness: 75, hue: 120, saturation: 50 };
  }

  private async setDevicePower(deviceId: string, on: boolean) {
    // Send power command to your API
  }

  private async setDeviceBrightness(deviceId: string, brightness: number) {
    // Send brightness command to your API
  }

  private async setDeviceHue(deviceId: string, hue: number) {
    // Send hue command to your API
  }

  private async setDeviceSaturation(deviceId: string, saturation: number) {
    // Send saturation command to your API
  }
}
```

### Key Benefits in Homebridge Plugins

1. **Type Safety**: Full TypeScript autocomplete for all HomeKit services and characteristics
2. **Less Boilerplate**: Fluent API reduces verbose HAP-NodeJS code
3. **Built-in Validation**: Validate characteristic values before sending to devices
4. **Interceptors**: Add logging, rate limiting, and transformations without cluttering handlers
5. **Error Handling**: Consistent error handling with typed error classes
6. **Maintainable**: Cleaner code structure makes plugins easier to maintain and test

### Comparison: Standard vs hap-fluent

**Standard HAP-NodeJS Approach:**
```typescript
const service = accessory.getService(hap.Service.Lightbulb) 
  || accessory.addService(hap.Service.Lightbulb);

service.getCharacteristic(hap.Characteristic.On)
  .on('get', (callback) => {
    this.getDeviceState(device.id)
      .then(state => callback(null, state.on))
      .catch(error => callback(error));
  })
  .on('set', (value, callback) => {
    this.setDevicePower(device.id, value)
      .then(() => callback(null))
      .catch(error => callback(error));
  });
```

**hap-fluent Approach:**
```typescript
const lightbulb = getOrAddService(accessory, hap.Service.Lightbulb);

lightbulb.characteristics.On
  .log()
  .limit(5, 1000)
  .onGet(async () => {
    const state = await this.getDeviceState(device.id);
    return state.on;
  })
  .onSet(async (value) => {
    await this.setDevicePower(device.id, value);
  });
```

The hap-fluent approach is more concise, type-safe, and includes built-in features like logging and rate limiting.

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

## Testing

HAP Fluent has a comprehensive test suite with multiple testing strategies to ensure reliability and correctness.

### Test Structure

The test suite is organized into three categories:

#### Unit Tests (`test/unit/`)
Traditional unit tests covering individual functions and classes:
- **FluentCharacteristic**: 31 tests for characteristic operations
- **FluentService**: 24 tests for service wrapping and operations
- **AccessoryHandler**: 28 tests for accessory initialization
- **Type Guards**: 18 tests for runtime type validation
- **Errors**: 10 tests for error class behavior

#### Integration Tests (`test/integration/`)
End-to-end tests verifying complete workflows:
- **integration.test.ts**: 17 tests covering real-world accessory scenarios
- Tests multi-service accessories, state management, and characteristic updates
- Validates complete plugin lifecycle from initialization to operation

#### Property-Based Tests (`test/property-based/`)
Generative tests using [fast-check](https://fast-check.dev/) to verify properties across thousands of random inputs:
- **characteristic-values.property.test.ts**: Tests characteristic value handling
  - Boolean, numeric, string, and enum characteristic types
  - Value ranges and constraints (brightness 0-100, hue 0-360, temperature -50-50)
  - Rapid value updates and edge cases
- **service-operations.property.test.ts**: Tests service-level operations
  - Service wrapping for different service types
  - Characteristic access patterns (camelCase)
  - Handler registration and update methods
  - Complex scenarios (thermostat state, rapid updates)

### Running Tests

```bash
# Run all tests
pnpm run test

# Run with coverage
pnpm run test:coverage

# Run in watch mode
pnpm run test:watch

# Run with UI
pnpm run test:ui
```

### Coverage

The test suite maintains high code coverage:
- **Lines**: 86.39% (target: >80%)
- **Branches**: 76.69% (target: >70%)
- **Functions**: 87.5% (target: >70%)
- **Statements**: 86.3% (target: >80%)

All coverage thresholds are enforced in CI/CD.

### Test Strategy

1. **Unit tests** validate individual components in isolation
2. **Integration tests** verify complete workflows with mocked HAP-NodeJS components
3. **Property-based tests** discover edge cases through random input generation
4. **Coverage thresholds** ensure new code is adequately tested

This multi-layered approach provides confidence in both individual components and the system as a whole.

## Debugging with Source Maps

HAP Fluent includes source maps for better debugging experience. You can set breakpoints in TypeScript source files and step through code at the TypeScript level.

### Using Source Maps in VSCode

1. **Set Breakpoints**: Open any `.ts` file in `node_modules/hap-fluent/dist/` and set breakpoints
2. **Start Debugging**: Use VSCode's debugger with Node.js configuration
3. **Step Through Code**: The debugger will map compiled JavaScript back to TypeScript source

### Launch Configuration

Add this to your `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Homebridge Plugin",
      "program": "${workspaceFolder}/node_modules/.bin/homebridge",
      "args": ["-D", "-P", "${workspaceFolder}"],
      "sourceMaps": true,
      "outFiles": ["${workspaceFolder}/**/*.js"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Troubleshooting

- Ensure `sourceMap: true` is set in your `tsconfig.json`
- Verify `.js.map` files exist in `node_modules/hap-fluent/dist/`
- Check that VSCode's "Debug: Enable Breakpoint Locations" is enabled

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
