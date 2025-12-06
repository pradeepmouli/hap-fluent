// Type Lookup Examples
// Demonstrates how to lookup interface types using HAP-NodeJS service types

import { Service } from "hap-nodejs";
import type {
  ServiceInterfaceForConstructor,
  ServiceInterfaceForInstance,
  ServiceConstructorToKey,
  ServiceInstanceToKey,
  CharacteristicMapForConstructor,
  CharacteristicTypeForConstructor,
  ServicesWithCharacteristic,
  ServiceHasCharacteristic,
  FluentInterfaceForServiceConstructor,
} from "../src/types/service-lookup.js";
import {
  getServiceNameFromConstructor,
  getServiceNameFromInstance,
  isValidServiceConstructor,
  isValidServiceInstance,
} from "../src/types/service-lookup.js";
import { createFluentService } from "../src/index.js";

// Example 1: Lookup interface type from service constructor
export function constructorToInterfaceExample() {
  // Get the interface type from a HAP-NodeJS service constructor
  type AirPurifierInterface = ServiceInterfaceForConstructor<typeof Service.AirPurifier>;

  // Now you can use the interface type
  const exampleCharacteristics: AirPurifierInterface = {
    active: 1,
    currentAirPurifierState: 2,
    targetAirPurifierState: 1,
    rotationSpeed: 50,
    // All other characteristics are optional
  };

  console.log("AirPurifier interface example:", exampleCharacteristics);

  // Create a fluent service using the constructor type information
  const fluentService = createFluentService("AirPurifier");

  // The service is strongly typed based on the interface
  fluentService.onCharacteristicGet("active", () => exampleCharacteristics.active);
  fluentService.onCharacteristicGet("rotationSpeed", () => exampleCharacteristics.rotationSpeed!);

  return { interface: exampleCharacteristics, service: fluentService };
}

// Example 2: Lookup interface type from service instance
export function instanceToInterfaceExample() {
  // Create a service instance
  const serviceInstance = new Service.TemperatureSensor("Temperature", "living-room");

  // Get the interface type from the service instance
  type TemperatureSensorInterface = ServiceInterfaceForInstance<typeof serviceInstance>;

  const exampleCharacteristics: TemperatureSensorInterface = {
    currentTemperature: 23.5,
    name: "Living Room Temperature",
    statusActive: true,
    // Other characteristics are optional
  };

  console.log("TemperatureSensor interface example:", exampleCharacteristics);

  return { interface: exampleCharacteristics, instance: serviceInstance };
}

// Example 3: Map constructor/instance to key names
export function serviceToKeyMappingExample() {
  // Map constructor to key
  type AirPurifierKey = ServiceConstructorToKey<typeof Service.AirPurifier>; // "AirPurifier"
  type LightbulbKey = ServiceConstructorToKey<typeof Service.Lightbulb>; // "Lightbulb"

  // Map instance to key
  const lightbulbInstance = new Service.Lightbulb("Living Room Light");
  type LightbulbInstanceKey = ServiceInstanceToKey<typeof lightbulbInstance>; // "Lightbulb"

  // Runtime lookup
  const airPurifierKeyRuntime = getServiceNameFromConstructor(Service.AirPurifier);
  const lightbulbKeyRuntime = getServiceNameFromInstance(lightbulbInstance);

  console.log("Service key mappings:");
  console.log("AirPurifier key:", airPurifierKeyRuntime); // "AirPurifier"
  console.log("Lightbulb key:", lightbulbKeyRuntime); // "Lightbulb"

  return {
    airPurifierKey: airPurifierKeyRuntime,
    lightbulbKey: lightbulbKeyRuntime,
  };
}

// Example 4: Get characteristic types for a service constructor
export function characteristicTypesExample() {
  // Get all characteristics for a service
  type AirPurifierChars = CharacteristicMapForConstructor<typeof Service.AirPurifier>;

  // Get specific characteristic type
  type ActiveType = CharacteristicTypeForConstructor<typeof Service.AirPurifier, "active">;
  type SpeedType = CharacteristicTypeForConstructor<typeof Service.AirPurifier, "rotationSpeed">;

  // Use the types
  const activeValue: ActiveType = 1; // 0 or 1
  const speedValue: SpeedType = 75; // number or undefined

  console.log("Characteristic types example:");
  console.log("Active value:", activeValue);
  console.log("Speed value:", speedValue);

  return { activeValue, speedValue };
}

// Example 5: Find services with specific characteristics
export function findServicesWithCharacteristicExample() {
  // Find all services that have an 'active' characteristic
  type ServicesWithActive = ServicesWithCharacteristic<"active">;

  // Find all services with 'name' characteristic
  type ServicesWithName = ServicesWithCharacteristic<"name">;

  // Check if specific services have specific characteristics
  type AirPurifierHasActive = ServiceHasCharacteristic<"AirPurifier", "active">; // true
  type AccessoryInfoHasActive = ServiceHasCharacteristic<"AccessoryInformation", "active">; // false
  type LightbulbHasName = ServiceHasCharacteristic<"Lightbulb", "name">; // true

  console.log("Services with characteristics:");
  console.log("AirPurifier has active: true");
  console.log("AccessoryInformation has active: false");
  console.log("Lightbulb has name: true");

  // These types help at compile time for type safety
  // The actual services with these characteristics would be determined by the ServiceMap
}

// Example 6: Create fluent interfaces based on constructor types
export function fluentInterfaceFromConstructorExample() {
  // This shows how to create a fluent interface type from a constructor
  type AirPurifierFluent = FluentInterfaceForServiceConstructor<typeof Service.AirPurifier>;

  // You could use this type to create strongly-typed wrappers
  const service = createFluentService("AirPurifier");

  // The service methods are type-safe based on the constructor
  service
    .onCharacteristicGet("active", () => 1)
    .onCharacteristicGet("currentAirPurifierState", () => 2)
    .onCharacteristicSet("targetAirPurifierState", async (value) => {
      console.log("Setting target state to:", value);
    });

  return service;
}

// Example 7: Runtime type checking and validation
export function runtimeTypeCheckingExample() {
  const validConstructor = Service.AirPurifier;
  const invalidConstructor = String; // Not a service constructor

  const validInstance = new Service.Lightbulb("Test Light");
  const invalidInstance = { not: "a service" };

  console.log("Runtime type checking:");
  console.log("Valid constructor:", isValidServiceConstructor(validConstructor)); // true
  console.log("Invalid constructor:", isValidServiceConstructor(invalidConstructor)); // false
  console.log("Valid instance:", isValidServiceInstance(validInstance)); // true
  console.log("Invalid instance:", isValidServiceInstance(invalidInstance)); // false

  // Safe runtime operations
  if (isValidServiceConstructor(validConstructor)) {
    const serviceName = getServiceNameFromConstructor(validConstructor);
    console.log("Service name from constructor:", serviceName);
  }

  if (isValidServiceInstance(validInstance)) {
    const serviceName = getServiceNameFromInstance(validInstance);
    console.log("Service name from instance:", serviceName);
  }
}

// Example 8: Generic function that works with any service type
export function genericServiceFunction<T extends keyof typeof Service>(
  serviceConstructor: (typeof Service)[T],
): string | null {
  // Get the service name from the constructor
  const serviceName = getServiceNameFromConstructor(serviceConstructor);

  if (serviceName && isValidServiceConstructor(serviceConstructor)) {
    // Create a fluent service
    const fluentService = createFluentService(serviceName);

    console.log(`Created fluent service for: ${serviceName}`);

    // You could add common setup logic here
    return serviceName;
  }

  return null;
}

// Usage examples
export function runExamples() {
  console.log("=== HAP-NodeJS Service Type Lookup Examples ===\n");

  console.log("1. Constructor to Interface:");
  constructorToInterfaceExample();

  console.log("\n2. Instance to Interface:");
  instanceToInterfaceExample();

  console.log("\n3. Service to Key Mapping:");
  serviceToKeyMappingExample();

  console.log("\n4. Characteristic Types:");
  characteristicTypesExample();

  console.log("\n5. Find Services with Characteristics:");
  findServicesWithCharacteristicExample();

  console.log("\n6. Fluent Interface from Constructor:");
  fluentInterfaceFromConstructorExample();

  console.log("\n7. Runtime Type Checking:");
  runtimeTypeCheckingExample();

  console.log("\n8. Generic Service Function:");
  const result1 = genericServiceFunction(Service.AirPurifier);
  const result2 = genericServiceFunction(Service.AccessoryInformation);
  console.log("Generic function results:", { result1, result2 });
}

// Advanced example: Create a service factory based on constructor types
export function createServiceFactory() {
  return {
    // Type-safe factory method
    create<K extends keyof typeof Service>(serviceType: K, displayName?: string) {
      const ServiceConstructor = Service[serviceType];

      if (isValidServiceConstructor(ServiceConstructor)) {
        const serviceName = getServiceNameFromConstructor(ServiceConstructor);

        if (serviceName) {
          return createFluentService(serviceName, {
            displayName,
            enableLogging: true,
            logPrefix: `[${serviceName}]`,
          });
        }
      }

      throw new Error(`Invalid service type: ${String(serviceType)}`);
    },

    // Batch creation
    createMultiple<K extends keyof typeof Service>(
      services: Array<{ type: K; displayName?: string }>,
    ) {
      return services.map(({ type, displayName }) => ({
        type,
        service: this.create(type, displayName),
      }));
    },
  };
}

// Example usage of the service factory
export function serviceFactoryExample() {
  const factory = createServiceFactory();

  // Create individual services
  const airPurifier = factory.create("AirPurifier", "Living Room Purifier");
  const temperatureSensor = factory.create("TemperatureSensor", "Temperature Sensor");

  // Create multiple services
  const services = factory.createMultiple([
    { type: "AccessoryInformation" },
    { type: "AirPurifier", displayName: "Main Purifier" },
    { type: "FilterMaintenance", displayName: "Filter Status" },
  ]);

  console.log(
    "Created services:",
    services.map((s) => s.type),
  );

  return { airPurifier, temperatureSensor, services };
}
