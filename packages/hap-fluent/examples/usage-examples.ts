import { Service } from "hap-nodejs";
import { PlatformAccessory } from "homebridge";
import type { DynamicPlatformPlugin } from "homebridge";
import { wrapAccessory } from "../src";

/**
 * Example 1: Basic Air Purifier with AccessoryHandler
 * Demonstrates the single-surface API for wrapping and managing accessories
 */
export function basicAirPurifierExample(
  plugin: DynamicPlatformPlugin,
  platformAccessory: PlatformAccessory,
  api: any,
) {
  // Wrap accessory and add service with type accumulation
  const handler = wrapAccessory(plugin, platformAccessory, api).with(
    Service.AirPurifier,
    "Main Purifier",
  );

  // Initialize with default state
  handler.initialize({
    airPurifier: {
      active: 0, // Inactive
      currentAirPurifierState: 0, // Inactive
      targetAirPurifierState: 0, // Manual
      rotationSpeed: 0,
    },
    accessoryInformation: {
      manufacturer: "RabbitAir",
      model: "MinusA2",
      serialNumber: "RA-12345",
    },
  });

  // Access and configure characteristics
  const purifier = handler.services.airPurifier;

  purifier.characteristics.active.onGet(async () => {
    console.log("Getting purifier active state");
    return 0;
  });

  purifier.characteristics.active.onSet(async (value: number) => {
    console.log(`Purifier active: ${value}`);
  });

  purifier.characteristics.rotationSpeed.onGet(async () => {
    console.log("Getting rotation speed");
    return 0;
  });

  purifier.characteristics.rotationSpeed.onSet(async (value: number) => {
    console.log(`Setting rotation speed to ${value}%`);
  });

  return handler;
}

/**
 * Example 2: Multi-Service Accessory
 * Demonstrates managing multiple services and cross-service interactions
 */
export function multiServiceAccessoryExample(
  plugin: DynamicPlatformPlugin,
  platformAccessory: PlatformAccessory,
  api: any,
) {
  // Add multiple services with type accumulation
  const handler = wrapAccessory(plugin, platformAccessory, api)
    .with(Service.AirPurifier, "Purifier")
    .with(Service.AirQualitySensor, "Quality Sensor")
    .with(Service.HumiditySensor, "Humidity Sensor");

  // Initialize state for all services
  handler.initialize({
    airPurifier: {
      active: 0,
      currentAirPurifierState: 0,
      targetAirPurifierState: 0,
      rotationSpeed: 0,
    },
    airQualitySensor: {
      airQuality: 1, // Excellent
      pm25Density: 10,
    },
    humiditySensor: {
      currentRelativeHumidity: 45,
    },
    accessoryInformation: {
      manufacturer: "SmartHome Inc",
      model: "Multi-Sensor",
      serialNumber: "MS-98765",
    },
  });

  // Set up purifier handlers
  handler.services.airPurifier.characteristics.active.onSet(async (value: number) => {
    console.log(`Purifier active state: ${value}`);

    // Update related characteristics
    if (value === 1) {
      handler.services.airPurifier.characteristics.currentAirPurifierState.set(2); // Purifying
    } else {
      handler.services.airPurifier.characteristics.currentAirPurifierState.set(0); // Inactive
    }
  });

  // Monitor humidity
  handler.services.humiditySensor.characteristics.currentRelativeHumidity.onGet(async () => {
    console.log("Reading humidity from device");
    return 50;
  });

  return handler;
}

/**
 * Example 3: Thermostat with Complex Logic
 * Demonstrates accessing context and managing complex state
 */
export function thermostatExample(
  plugin: DynamicPlatformPlugin,
  platformAccessory: PlatformAccessory,
  api: any,
) {
  const handler = wrapAccessory(plugin, platformAccessory, api)
    .with(Service.Thermostat, "Climate Control")
    .with(Service.TemperatureSensor, "Temperature");

  // Initialize state
  handler.initialize({
    thermostat: {
      currentHeatingCoolingState: 0,
      targetHeatingCoolingState: 1, // Heat
      currentTemperature: 20,
      targetTemperature: 22,
      temperatureDisplayUnits: 0, // Celsius
    },
    temperatureSensor: {
      currentTemperature: 20,
    },
    accessoryInformation: {
      manufacturer: "SmartHome",
      model: "Thermostat Pro",
      serialNumber: "TH-001",
    },
  });

  // Store device state in context
  handler.context.currentTemp = 20;
  handler.context.targetTemp = 22;
  handler.context.mode = "heat";

  const thermostat = handler.services.thermostat;

  // Target temperature handler
  thermostat.characteristics.targetTemperature.onSet(async (value: number) => {
    console.log(`Setting target temperature to ${value}°C`);
    handler.context.targetTemp = value;
    // Send command to device
  });

  // Heating mode handler
  thermostat.characteristics.targetHeatingCoolingState.onSet(async (value: number) => {
    const modes = ["Off", "Heat", "Cool", "Auto"];
    console.log(`Setting mode to ${modes[value] || "Unknown"}`);
    handler.context.mode = value;
  });

  // Periodically update current temperature
  setInterval(() => {
    // Simulate temperature changes
    const sensor = handler.services.temperatureSensor;
    sensor.characteristics.currentTemperature.set(handler.context.currentTemp);
    thermostat.characteristics.currentTemperature.set(handler.context.currentTemp);
  }, 10000);

  return handler;
}

/**
 * Example 4: Smart Light with Color Control
 * Demonstrates color light control with validation
 */
export function smartLightExample(
  plugin: DynamicPlatformPlugin,
  platformAccessory: PlatformAccessory,
  api: any,
) {
  const handler = wrapAccessory(plugin, platformAccessory, api).with(
    Service.Lightbulb,
    "Color Light",
  );

  // Initialize with color light state
  handler.initialize({
    lightbulb: {
      on: false,
      brightness: 100,
      hue: 0,
      saturation: 0,
      colorTemperature: 370, // Warm white
    },
    accessoryInformation: {
      manufacturer: "Philips",
      model: "Hue Bridge",
      serialNumber: "HB-12345",
    },
  });

  const light = handler.services.lightbulb;

  // Power on/off
  light.characteristics.on.onSet(async (value: boolean) => {
    console.log(`Light power: ${value ? "ON" : "OFF"}`);
  });

  // Brightness
  light.characteristics.brightness.onSet(async (value: number) => {
    console.log(`Brightness set to ${value}%`);
  });

  // Hue
  light.characteristics.hue.onSet(async (value: number) => {
    console.log(`Hue set to ${value}°`);
  });

  // Saturation
  light.characteristics.saturation.onSet(async (value: number) => {
    console.log(`Saturation set to ${value}%`);
  });

  // Color temperature
  light.characteristics.colorTemperature.onSet(async (value: number) => {
    console.log(`Color temperature set to ${value}K`);
  });

  return handler;
}

/**
 * Example 5: Door Lock Control
 * Demonstrates lock control and status management
 */
export function smartLockExample(
  plugin: DynamicPlatformPlugin,
  platformAccessory: PlatformAccessory,
  api: any,
) {
  const handler = wrapAccessory(plugin, platformAccessory, api).with(
    Service.Lock,
    "Front Door Lock",
  );

  // Initialize lock state
  handler.initialize({
    lock: {
      lockCurrentState: 1, // Unlocked
      lockTargetState: 1, // Unlocked
    },
    accessoryInformation: {
      manufacturer: "August",
      model: "Smart Lock Pro",
      serialNumber: "SL-99999",
    },
  });

  const lock = handler.services.lock;

  // Handle lock/unlock
  lock.characteristics.lockTargetState.onSet(async (value: number) => {
    const state = value === 0 ? "LOCK" : "UNLOCK";
    console.log(`Lock command received: ${state}`);

    // Send command to device
    try {
      // Simulate device communication
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update actual lock state
      lock.characteristics.lockCurrentState.set(value);
      console.log(`Lock ${state} successful`);
    } catch (error) {
      console.error(`Failed to ${state} door:`, error);
      throw error;
    }
  });

  // Monitor lock state
  lock.characteristics.lockCurrentState.onGet(async () => {
    console.log("Reading lock status from device");
    return 1; // Unlocked
  });

  return handler;
}
