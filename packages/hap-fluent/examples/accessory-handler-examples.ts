/**
 * AccessoryHandler Examples - Single Surface API
 *
 * This demonstrates the simplified single-surface API for managing accessories:
 * - wrapAccessory(plugin, accessory) returns an AccessoryHandler
 * - handler.initialize() sets up services and initial state
 * - handler.with() adds/retrieves services idempotently with type accumulation
 */

import {
  wrapAccessory,
  type Outlet,
  Thermostat,
  HumiditySensor,
  OccupancySensor,
  type Enums,
} from "../src/index.js";
import { PlatformAccessory } from "homebridge";
import { Service } from "hap-nodejs";
import type { API, DynamicPlatformPlugin } from "homebridge";

/**
 * Example 1: Basic AccessoryHandler usage
 * Wrap an accessory and initialize with state
 */
export function basicAccessoryHandlerExample(
  plugin: DynamicPlatformPlugin,
  platformAccessory: PlatformAccessory,
  api: API,
) {
  // Single entry point: wrap the accessory
  const handler = wrapAccessory(plugin, platformAccessory, api);

  // Add services first
  const handler2 = handler.with(api.hap.Service.Lightbulb, "Main Light");
	handler2.services.lightbulb.characteristics.hue
  // Initialize with initial state (synchronous)
  handler2.initialize({
    lightbulb: {
      on: true,
      brightness: 75,
      hue: 180,
      saturation: 50,
    },
    accessoryInformation: {
      manufacturer: "ACME Corp",
      model: "Smart Light Pro",
      serialNumber: "SL-12345",
      firmwareRevision: "2.1.0",
    },
  });

  // Access services via handler
  handler2.services.lightbulb.characteristics.on.onGet(async () => {
    console.log("Getting light state");
    return true;
  });

  handler2.services.lightbulb.characteristics.brightness.onSet(async (value: number) => {
    console.log(`Setting brightness to ${value}`);
  });

  return handler2;
}

/**
 * Example 2: Adding services dynamically
 * Use handler.with() for idempotent service management with type accumulation
 */
export function addingServicesExample(
  plugin: DynamicPlatformPlugin,
  platformAccessory: PlatformAccessory,
  api: API,
) {
  const handler = wrapAccessory(plugin, platformAccessory, api);

  // Add a motion sensor service (idempotent - won't duplicate if already exists)
  // with() returns the handler with the new service type accumulated
  const handler2 = handler.with(api.hap.Service.MotionSensor, "Motion Detector");

  handler2.services.motionSensor.characteristics.motionDetected.onGet(async () => {
    // Query device state
    return false;
  });

  // Add services with subtypes - the type parameter is inferred from subtype string
  const handler3 = handler2.with(Service.Outlet, "Outlet 1", "outlet1");
  const handler4 = handler3.with(Service.Outlet, "Outlet 2", "outlet2");

  // Access subtyped services
  handler4.services.outlet.outlet1.characteristics.on.set(true);
  handler4.services.outlet.outlet2.characteristics.on.set(false);

  return handler4;
}

/**
 * Example 3: Complex multi-service accessory
 * Demonstrates full lifecycle with multiple services
 */
export function multiServiceAccessoryExample(
  plugin: DynamicPlatformPlugin,
  platformAccessory: PlatformAccessory,
  api: API,
) {
  // Add services first with type accumulation
  const handler = wrapAccessory(plugin, platformAccessory, api)
    .with(api.hap.Service.Thermostat, "Climate Control")
    .with(api.hap.Service.HumiditySensor, "Humidity Sensor");

  // Initialize with multiple services (synchronous)
  handler.initialize({
    thermostat: {
      currentHeatingCoolingState: 1, // Heating
      targetHeatingCoolingState: 3, // Auto
      currentTemperature: 20.5,
      targetTemperature: 22.0,
      temperatureDisplayUnits: 0, // Celsius
    },
    humiditySensor: {
      currentRelativeHumidity: 45,
    },
    accessoryInformation: {
      manufacturer: "SmartHome Inc",
      model: "Thermostat v3",
      serialNumber: "TH-98765",
    },
  });

  // Add additional services dynamically with type accumulation
  const handler2 = handler.with(Service.Fanv2, "Climate Fan");

  handler2.services.fanv2.characteristics.active.onSet(async (value: Enums.Active) => {
    console.log(`Fan active: ${value}`);
    // Control physical device
  });

  // Set up cross-service interactions
  handler2.services.thermostat.characteristics.currentHeatingCoolingState.onGet(async () => {
    // Read from device
    return 1;
  });

  handler2.services.thermostat.characteristics.targetTemperature.onSet(async (value: number) => {
    console.log(`Setting target temperature to ${value}°C`);
    // Send command to device
  });

  // Access context for custom data storage
  handler2.context.lastUpdate = Date.now();
  handler2.context.deviceId = "custom-device-id";

  return handler2;
}

/**
 * Example 4: Handler-based service management
 * Shows the single-surface API pattern with type accumulation
 */
export function handlerBasedExample(
  plugin: DynamicPlatformPlugin,
  platformAccessory: PlatformAccessory,
  api: any,
) {
  // Single-surface API pattern - wrap and add service
  const handler = wrapAccessory(plugin, platformAccessory, api).with(
    Service.Lightbulb,
    "Main Light",
  );

  handler.initialize({
    lightbulb: { on: false, brightness: 50 },
    accessoryInformation: {
      manufacturer: "ACME",
      model: "Light-100",
    },
  });

  // Access the service directly through handler
  handler.services.lightbulb.characteristics.on.set(true);

  return handler;
}

/**
 * Example 5: Real-world smart light accessory
 */
export function smartLightExample(
  plugin: DynamicPlatformPlugin,
  platformAccessory: PlatformAccessory,
  api: any,
) {
  // Add lightbulb service first
  const handler = wrapAccessory(plugin, platformAccessory, api).with(
    Service.Lightbulb,
    "Smart Light",
  );

  // Initialize with default state
  handler.initialize({
    lightbulb: {
      on: false,
      brightness: 100,
      hue: 0,
      saturation: 0,
      colorTemperature: 300,
    },
    accessoryInformation: {
      manufacturer: "Philips",
      model: "Hue White and Color",
      serialNumber: "HUE-001122",
    },
  });

  // Set up handlers
  const lightbulb = handler.services.lightbulb;

  lightbulb.characteristics.on.onGet(async () => {
    // Query actual device state
    const state = await queryDeviceState(handler.context.deviceId);
    return state.isOn;
  });

  lightbulb.characteristics.on.onSet(async (value: boolean) => {
    await sendCommand(handler.context.deviceId, "power", value);
  });

  lightbulb.characteristics.brightness.onSet(async (value: number) => {
    await sendCommand(handler.context.deviceId, "brightness", value);
  });

  lightbulb.characteristics.hue.onSet(async (value: number) => {
    await sendCommand(handler.context.deviceId, "hue", value);
  });

  lightbulb.characteristics.saturation.onSet(async (value: number) => {
    await sendCommand(handler.context.deviceId, "saturation", value);
  });

  return handler;
}

// Mock device communication functions for examples
async function queryDeviceState(deviceId: string): Promise<{ isOn: boolean }> {
  return { isOn: false };
}

async function sendCommand(deviceId: string, command: string, value: any): Promise<void> {
  console.log(`[${deviceId}] ${command}: ${value}`);
}
