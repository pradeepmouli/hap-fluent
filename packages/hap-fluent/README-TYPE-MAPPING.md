# Generic Type Mapping Solution for HAP-NodeJS Services

This document explains the comprehensive generic type mapping approach that replaces the incorrect module augmentation in the HAP Fluent API.

## Problem with the Original Approach

The original code attempted to use module augmentation to extend the `hap-nodejs` Service interface:

```typescript
declare module 'hap-nodejs' {
  export interface Service {
    AccessoryInformation: typeof ServiceBase.AccessoryInformation & WithTypedUUID<'AccessoryInformation'>;
  }
}
```

This approach had several issues:
1. **Incorrect Module Augmentation**: Added properties to the interface rather than mapping service names to constructor types
2. **Type Safety Issues**: `(typeof Service)[T]` doesn't work because Service doesn't have properties matching ServiceMap keys
3. **Architectural Mismatch**: Tried to use `new Service[serviceName]()` which isn't how hap-nodejs works

## The New Generic Type Mapping Solution

### 1. Service Constructor Mapping (`service-mapping.ts`)

Maps service names to their actual HAP-NodeJS constructor types:

```typescript
export type HAPServiceConstructorMap = {
  AccessoryInformation: typeof Service.AccessoryInformation;
  AirPurifier: typeof Service.AirPurifier;
  // ... all other services
};

export type ServiceConstructorFor<T extends keyof ServiceMap> = 
  T extends keyof HAPServiceConstructorMap ? HAPServiceConstructorMap[T] : never;
```

### 2. Service Type Lookup (`service-lookup.ts`)

Provides utilities to lookup interface types using HAP-NodeJS service types:

```typescript
// Map constructor to interface type
export type ServiceInterfaceForConstructor<T> = 
  ServiceConstructorToKey<T> extends keyof ServiceMap
    ? ServiceMap[ServiceConstructorToKey<T>]
    : never;

// Map instance to interface type  
export type ServiceInterfaceForInstance<T> = 
  ServiceInstanceToKey<T> extends keyof ServiceMap
    ? ServiceMap[ServiceInstanceToKey<T>]
    : never;
```

### 3. Fluent Interface Implementation (`fluent-service.ts`)

Implements a proper fluent interface with:
- Type-safe characteristic operations
- Validation support
- Event handling
- Error management

## How to Lookup Interface Types

### From Service Constructor

```typescript
import { Service } from 'hap-nodejs';
import type { ServiceInterfaceForConstructor } from 'hap-fluent';

// Get interface type from constructor
type AirPurifierInterface = ServiceInterfaceForConstructor<typeof Service.AirPurifier>;

// Use the interface type
const characteristics: AirPurifierInterface = {
  active: 1,
  currentAirPurifierState: 2,
  targetAirPurifierState: 1,
  rotationSpeed: 50
};
```

### From Service Instance

```typescript
const serviceInstance = new Service.TemperatureSensor('Temperature');
type TemperatureSensorInterface = ServiceInterfaceForInstance<typeof serviceInstance>;

const characteristics: TemperatureSensorInterface = {
  currentTemperature: 23.5,
  name: 'Living Room Temperature'
};
```

### Runtime Lookups

```typescript
import { getServiceNameFromConstructor, getServiceNameFromInstance } from 'hap-fluent';

// Get service name from constructor
const serviceName = getServiceNameFromConstructor(Service.AirPurifier); // "AirPurifier"

// Get service name from instance
const instance = new Service.Lightbulb('Living Room Light');
const instanceName = getServiceNameFromInstance(instance); // "Lightbulb"
```

### Characteristic Type Extraction

```typescript
// Get all characteristics for a service
type AirPurifierChars = CharacteristicMapForConstructor<typeof Service.AirPurifier>;

// Get specific characteristic type
type ActiveType = CharacteristicTypeForConstructor<typeof Service.AirPurifier, 'active'>;
type SpeedType = CharacteristicTypeForConstructor<typeof Service.AirPurifier, 'rotationSpeed'>;
```

### Service Discovery

```typescript
// Find all services with 'active' characteristic
type ServicesWithActive = ServicesWithCharacteristic<'active'>;

// Check if service has specific characteristic
type AirPurifierHasActive = ServiceHasCharacteristic<'AirPurifier', 'active'>; // true
type AccessoryInfoHasActive = ServiceHasCharacteristic<'AccessoryInformation', 'active'>; // false
```

## Benefits of the New Approach

1. **Proper Type Safety**: Uses actual HAP-NodeJS types without incorrect module augmentation
2. **Runtime Support**: Provides runtime utilities alongside compile-time types
3. **Extensibility**: Easy to add new services or modify existing mappings
4. **IntelliSense**: Full IDE support with autocomplete and error detection
5. **Validation**: Built-in characteristic validation and error handling
6. **Event Support**: Change listeners and event emission
7. **Flexibility**: Works with both constructor types and instance types

## Usage Examples

### Basic Service Creation

```typescript
import { createFluentService } from 'hap-fluent';

const airPurifier = createFluentService('AirPurifier', {
  displayName: 'Living Room Purifier',
  enableLogging: true
});

airPurifier
  .onCharacteristicGet('active', () => 1)
  .onCharacteristicSet('rotationSpeed', async (speed) => {
    console.log(`Setting speed to ${speed}`);
  })
  .updateCharacteristic('currentAirPurifierState', 2);
```

### Multiple Services

```typescript
import { createFluentServices } from 'hap-fluent';

const services = createFluentServices([
  { name: 'AccessoryInformation' },
  { name: 'AirPurifier', config: { displayName: 'Main Purifier' } },
  { name: 'FilterMaintenance', config: { displayName: 'Filter Status' } }
]);
```

### With Validation

```typescript
airPurifier
  .setValidator('rotationSpeed', (speed) => {
    if (speed < 0 || speed > 100) {
      return 'Speed must be between 0 and 100';
    }
    return true;
  })
  .onCharacteristicSet('rotationSpeed', async (speed) => {
    // Validation runs automatically before this callback
    await sendSpeedToDevice(speed);
  });
```

### Generic Service Factory

```typescript
function createServiceFactory() {
  return {
    create<K extends keyof typeof Service>(serviceType: K, displayName?: string) {
      const ServiceConstructor = Service[serviceType];
      const serviceName = getServiceNameFromConstructor(ServiceConstructor);
      
      if (serviceName) {
        return createFluentService(serviceName, { displayName });
      }
      
      throw new Error(`Invalid service type: ${String(serviceType)}`);
    }
  };
}

const factory = createServiceFactory();
const purifier = factory.create('AirPurifier', 'Living Room Purifier');
```

## Migration Guide

### From Old Approach

Replace this:

```typescript
// Old problematic approach
declare module 'hap-nodejs' {
  export interface Service {
    AccessoryInformation: typeof ServiceBase.AccessoryInformation & WithTypedUUID<'AccessoryInformation'>;
  }
}

// Usage that didn't work properly
const service = new Service.AccessoryInformation();
```

### To New Approach

With this:

```typescript
// New proper approach
import { createFluentService, type ServiceInterfaceForConstructor } from 'hap-fluent';

// Type-safe interface lookup
type AccessoryInfoInterface = ServiceInterfaceForConstructor<typeof Service.AccessoryInformation>;

// Proper service creation
const service = createFluentService('AccessoryInformation', {
  displayName: 'Device Information'
});
```

## File Structure

```
packages/hap-fluent/src/
├── index.ts                    # Main exports
├── fluent-service.ts          # Fluent service implementation
├── types/
│   ├── index.ts               # Type exports
│   ├── service-mapping.ts     # Service constructor mapping
│   ├── service-lookup.ts      # Type lookup utilities
│   ├── fluent-interface.ts    # Fluent interface types
│   ├── hap-interfaces.ts      # Generated service interfaces
│   └── hap-enums.ts          # HAP enumerations
└── examples/
    ├── usage-examples.ts      # Basic usage examples
    └── type-lookup-examples.ts # Type lookup examples
```

This solution provides a robust, type-safe, and extensible foundation for working with HAP-NodeJS services while maintaining full compatibility with the existing ecosystem.