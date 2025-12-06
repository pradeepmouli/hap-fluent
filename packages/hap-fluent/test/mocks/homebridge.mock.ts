import { vi } from "vitest";
import type {
  CharacteristicValue,
  CharacteristicSetHandler,
  CharacteristicProps,
  PartialAllowingNull,
} from "homebridge";

/**
 * Mock Characteristic class for testing
 */
export class MockCharacteristic {
  public UUID: string;
  public displayName: string;
  public value: CharacteristicValue | undefined;
  private getHandler: (() => Promise<CharacteristicValue>) | undefined;
  private setHandler: CharacteristicSetHandler | undefined;
  public props: Partial<CharacteristicProps> = {};

  constructor(displayName: string, UUID: string) {
    this.displayName = displayName;
    this.UUID = UUID;
    this.value = undefined;
  }

  setValue(value: CharacteristicValue): this {
    this.value = value;
    return this;
  }

  getValue(): CharacteristicValue | undefined {
    return this.value;
  }

  onGet(handler: () => Promise<CharacteristicValue>): this {
    this.getHandler = handler;
    return this;
  }

  onSet(handler: CharacteristicSetHandler): this {
    this.setHandler = handler;
    return this;
  }

  setProps(props: PartialAllowingNull<CharacteristicProps>): this {
    this.props = { ...this.props, ...props };
    return this;
  }

  async handleGet(): Promise<CharacteristicValue> {
    if (this.getHandler) {
      return await this.getHandler();
    }
    return this.value;
  }

  async handleSet(value: CharacteristicValue): Promise<void> {
    if (this.setHandler) {
      await this.setHandler(value);
    }
    this.value = value;
  }
}

/**
 * Mock Service class for testing
 */
export class MockService {
  public static UUID = "mock-service-uuid";
  public UUID: string;
  public displayName: string;
  public subtype: string | undefined;
  public characteristics: MockCharacteristic[] = [];

  constructor(displayName?: string, UUID?: string, subtype?: string) {
    this.displayName = displayName || "Mock Service";
    this.UUID = UUID || MockService.UUID;
    this.subtype = subtype;
  }

  addCharacteristic(characteristic: MockCharacteristic): this {
    this.characteristics.push(characteristic);
    return this;
  }

  getCharacteristic(name: string): MockCharacteristic | undefined {
    return this.characteristics.find((c) => c.displayName === name);
  }
}

/**
 * Mock PlatformAccessory class for testing
 */
export class MockPlatformAccessory {
  public displayName: string;
  public UUID: string;
  public services: MockService[] = [];
  public context: any = {};

  constructor(displayName: string, UUID: string) {
    this.displayName = displayName;
    this.UUID = UUID;
  }

  addService(service: MockService): MockService {
    this.services.push(service);
    return service;
  }

  getService(serviceClass: typeof MockService): MockService | undefined {
    return this.services.find((s) => s.UUID === serviceClass.UUID);
  }

  getServiceById(serviceClass: typeof MockService, subType: string): MockService | undefined {
    return this.services.find((s) => s.UUID === serviceClass.UUID && s.subtype === subType);
  }

  removeService(service: MockService): void {
    const index = this.services.indexOf(service);
    if (index > -1) {
      this.services.splice(index, 1);
    }
  }
}

/**
 * Mock Lightbulb Service class
 */
export class Lightbulb extends MockService {
  constructor() {
    super("Lightbulb", "lightbulb-uuid");
    this.addCharacteristic(new MockCharacteristic("On", "on-uuid"));
    this.addCharacteristic(new MockCharacteristic("Brightness", "brightness-uuid"));
    this.addCharacteristic(new MockCharacteristic("Hue", "hue-uuid"));
    this.addCharacteristic(new MockCharacteristic("Saturation", "saturation-uuid"));
  }
}

/**
 * Mock Thermostat Service class
 */
export class Thermostat extends MockService {
  constructor() {
    super("Thermostat", "thermostat-uuid");
    this.addCharacteristic(
      new MockCharacteristic("Current Heating Cooling State", "current-state-uuid"),
    );
    this.addCharacteristic(
      new MockCharacteristic("Target Heating Cooling State", "target-state-uuid"),
    );
    this.addCharacteristic(new MockCharacteristic("Current Temperature", "current-temp-uuid"));
    this.addCharacteristic(new MockCharacteristic("Target Temperature", "target-temp-uuid"));
    this.addCharacteristic(new MockCharacteristic("Temperature Display Units", "temp-units-uuid"));
  }
}

/**
 * Mock Switch Service class
 */
export class Switch extends MockService {
  constructor() {
    super("Switch", "switch-uuid");
    this.addCharacteristic(new MockCharacteristic("On", "on-uuid"));
  }
}

/**
 * Create a mock Lightbulb service with standard characteristics
 */
export function createMockLightbulbService(): Lightbulb {
  return new Lightbulb();
}

/**
 * Create a mock Thermostat service with standard characteristics
 */
export function createMockThermostatService(): Thermostat {
  return new Thermostat();
}

/**
 * Create a mock Switch service with standard characteristics
 */
export function createMockSwitchService(): Switch {
  return new Switch();
}

/**
 * Create a mock accessory with services
 */
export function createMockAccessory(
  displayName: string,
  UUID: string,
  services: MockService[] = [],
): MockPlatformAccessory {
  const accessory = new MockPlatformAccessory(displayName, UUID);
  services.forEach((service) => accessory.addService(service));
  return accessory;
}
