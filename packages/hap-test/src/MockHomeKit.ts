/**
 * MockHomeKit - Simulated HomeKit controller for testing
 *
 * Provides accessory/service/characteristic operations with validation,
 * event emission, and time-aware event history for deterministic tests.
 */

import { EventEmitter } from "events";
import type { CharacteristicValue } from "hap-nodejs";
import type { CharacteristicEvent } from "./types/events.js";
import type {
  MockAccessory as IMockAccessory,
  MockService as IMockService,
  MockCharacteristic as IMockCharacteristic,
  EventSubscription as IEventSubscription,
  CharacteristicProps,
} from "./types/mocks.js";
import {
  buildChangeEvent,
  ensureReadable,
  ensureSubscribable,
  ensureWritable,
  type TimeProvider,
} from "./utils/characteristic-utils.js";
import { validateCharacteristicValue } from "./utils/validation.js";
import type { NetworkSimulator } from "./NetworkSimulator.js";
import { logger, LogCategory } from "./utils/logger.js";

const defaultTime: TimeProvider = { now: () => Date.now() };

/**
 * MockHomeKit simulates a HomeKit controller, letting tests interact with accessories,
 * services, and characteristics without real devices.
 */
export class MockHomeKit {
  private _accessories: Map<string, MockAccessory> = new Map();
  private readonly _eventEmitter: EventEmitter = new EventEmitter();
  private readonly _time: TimeProvider;
  private _networkSimulator?: NetworkSimulator;
  private _paired: boolean = true;
  private _controllerId: string;

  constructor(time?: TimeProvider, controllerId: string = "default-controller") {
    this._time = time ?? defaultTime;
    this._controllerId = controllerId;
  }

  /** Return all registered accessories. */
  accessories(): MockAccessory[] {
    return Array.from(this._accessories.values());
  }

  /** Look up an accessory by UUID. */
  accessory(uuid: string): MockAccessory | undefined {
    return this._accessories.get(uuid);
  }

  /** Retrieve a service by accessory UUID plus service name/type. */
  service(accessoryUuid: string, serviceNameOrType: string): MockService | undefined {
    const acc = this._accessories.get(accessoryUuid);
    if (!acc) return undefined;
    return acc.getService(serviceNameOrType);
  }

  /** Retrieve a characteristic by accessory + service + characteristic identifiers. */
  characteristic(
    accessoryUuid: string,
    serviceNameOrType: string,
    charNameOrType: string,
  ): MockCharacteristic | undefined {
    const svc = this.service(accessoryUuid, serviceNameOrType);
    if (!svc) return undefined;
    return svc.getCharacteristic(charNameOrType);
  }

  /**
   * Add an accessory to the simulated controller (testing helper)
   */
  /** Register an accessory with the simulated controller. */
  addAccessory(accessory: MockAccessory): void {
    if (this._accessories.has(accessory.UUID)) {
      logger.debug(
        LogCategory.ACCESSORY,
        `Accessory already registered: ${accessory.UUID} (${accessory.displayName})`,
      );
      return;
    }

    logger.info(
      LogCategory.ACCESSORY,
      `Adding accessory: ${accessory.UUID} (${accessory.displayName})`,
      {
        services: accessory.services.map((s) => s.type),
      },
    );

    accessory.bindEvents(this._eventEmitter, this._time, this._networkSimulator);
    this._accessories.set(accessory.UUID, accessory);
  }

  /**
   * Set network simulator for testing network conditions
   */
  /** Attach a network simulator to propagate latency/packet loss to all characteristics. */
  setNetworkSimulator(simulator: NetworkSimulator | undefined): void {
    this._networkSimulator = simulator;
    // Propagate simulator to existing accessories/services/characteristics
    for (const acc of this._accessories.values()) {
      acc.updateNetworkSimulator(simulator);
    }
  }

  /**
   * Get current network simulator
   */
  /** Current network simulator, if any. */
  getNetworkSimulator(): NetworkSimulator | undefined {
    return this._networkSimulator;
  }

  /**
   * Subscribe to all characteristic events.
   */
  /** Subscribe to all characteristic events; returns an unsubscribe function. */
  onCharacteristicEvent(handler: (event: CharacteristicEvent) => void): () => void {
    this._eventEmitter.on("characteristic", handler);
    return () => this._eventEmitter.off("characteristic", handler);
  }

  /**
   * Internal helper used by MockCharacteristic to bubble events.
   */
  /** Internal: emit a characteristic event to global listeners. */
  emitCharacteristicEvent(event: CharacteristicEvent): void {
    this._eventEmitter.emit("characteristic", event);
  }

  /**
   * Check if controller is paired with accessories
   */
  /** Whether the controller is currently paired. */
  isPaired(): boolean {
    return this._paired;
  }

  /**
   * Simulate pairing with accessories
   */
  /** Simulate pairing with accessories. */
  pair(): void {
    this._paired = true;
  }

  /**
   * Simulate unpairing from accessories
   */
  /** Simulate unpairing from accessories. */
  unpair(): void {
    this._paired = false;
  }

  /**
   * Get controller identifier
   */
  /** Controller identifier used for multi-controller scenarios. */
  getControllerId(): string {
    return this._controllerId;
  }

  /**
   * Refresh all characteristic values (batch read)
   */
  /** Batch-read all readable characteristics. */
  async refreshAll(): Promise<Map<string, CharacteristicValue>> {
    const results = new Map<string, CharacteristicValue>();

    for (const accessory of this._accessories.values()) {
      for (const service of accessory.services) {
        for (const char of service.characteristics) {
          const key = `${accessory.UUID}.${service.displayName}.${char.displayName}`;
          try {
            const value = await char.getValue();
            results.set(key, value);
          } catch {
            // Skip characteristics that can't be read
          }
        }
      }
    }

    return results;
  }
}

/**
 * MockAccessory represents an accessory under test with services/characteristics.
 */
export class MockAccessory implements IMockAccessory {
  UUID: string;
  displayName: string;
  category?: number;
  services: MockService[] = [];
  context: Record<string, any> = {};

  private _eventEmitter?: EventEmitter;
  private _time: TimeProvider = defaultTime;
  private _networkSimulator?: NetworkSimulator;

  constructor(uuid: string, displayName: string, category?: number) {
    this.UUID = uuid;
    this.displayName = displayName;
    this.category = category;
  }

  /** Bind event/time/network context to the accessory and its services. */
  bindEvents(emitter: EventEmitter, time: TimeProvider, simulator?: NetworkSimulator): void {
    this._eventEmitter = emitter;
    this._time = time;
    this._networkSimulator = simulator;
    this.services.forEach((service) => service.bindContext(this, emitter, time, simulator));
  }

  /** Get a single service by name or type. */
  getService(nameOrType: string): MockService | undefined {
    return this.services.find((s) => s.displayName === nameOrType || s.type === nameOrType);
  }

  /** Shallow copy of all services. */
  getServices(): MockService[] {
    return this.services.slice();
  }

  /** Add a service to the accessory. */
  addService(service: MockService): void {
    service.bindContext(this, this._eventEmitter, this._time, this._networkSimulator);
    this.services.push(service);
  }

  /** Propagate network simulator updates to services. */
  updateNetworkSimulator(simulator?: NetworkSimulator): void {
    this._networkSimulator = simulator;
    this.services.forEach((svc) => svc.updateNetworkSimulator(simulator));
  }
}

/**
 * MockService models a HomeKit service with a collection of characteristics.
 */
export class MockService implements IMockService {
  type: string;
  subtype?: string;
  displayName: string;
  characteristics: MockCharacteristic[] = [];
  accessory?: MockAccessory;

  private _eventEmitter?: EventEmitter;
  private _time: TimeProvider = defaultTime;
  private _networkSimulator?: NetworkSimulator;

  constructor(type: string, displayName: string, subtype?: string) {
    this.type = type;
    this.displayName = displayName;
    this.subtype = subtype;
  }

  /** Bind accessory/event/time/network context to this service and its characteristics. */
  bindContext(
    accessory: MockAccessory,
    emitter?: EventEmitter,
    time: TimeProvider = defaultTime,
    simulator?: NetworkSimulator,
  ): void {
    this.accessory = accessory;
    this._eventEmitter = emitter;
    this._time = time;
    this._networkSimulator = simulator;
    this.characteristics.forEach((char) =>
      char.bindContext(this, accessory, emitter, time, simulator),
    );
  }

  /** Get a characteristic by name or type. */
  getCharacteristic(nameOrType: string): MockCharacteristic | undefined {
    return this.characteristics.find((c) => c.displayName === nameOrType || c.type === nameOrType);
  }

  /** Whether the service has a characteristic matching the name or type. */
  hasCharacteristic(nameOrType: string): boolean {
    return !!this.getCharacteristic(nameOrType);
  }

  /** Add a characteristic to the service. */
  addCharacteristic(characteristic: MockCharacteristic): void {
    characteristic.bindContext(
      this,
      this.accessory,
      this._eventEmitter,
      this._time,
      this._networkSimulator,
    );
    this.characteristics.push(characteristic);
  }

  /** Propagate network simulator updates to characteristics. */
  updateNetworkSimulator(simulator?: NetworkSimulator): void {
    this._networkSimulator = simulator;
    this.characteristics.forEach((char) => char.updateNetworkSimulator(simulator));
  }
}

/**
 * MockCharacteristic implements stateful characteristic behavior with validation,
 * event emission, and optional network simulation.
 */
export class MockCharacteristic implements IMockCharacteristic {
  type: string;
  displayName: string;
  value: CharacteristicValue;
  props: CharacteristicProps;

  private _subscribed: boolean = false;
  private _history: CharacteristicEvent[] = [];
  private _subscriptions: Set<EventSubscription> = new Set();
  private _service?: MockService;
  private _accessory?: MockAccessory;
  private _eventEmitter?: EventEmitter;
  private _time: TimeProvider = defaultTime;
  private _networkSimulator?: NetworkSimulator;

  constructor(
    type: string,
    displayName: string,
    initial: CharacteristicValue,
    props: CharacteristicProps,
  ) {
    this.type = type;
    this.displayName = displayName;
    this.value = initial;
    this.props = props;
  }

  /** Bind service/accessory/event/time/network context to this characteristic. */
  bindContext(
    service?: MockService,
    accessory?: MockAccessory,
    emitter?: EventEmitter,
    time: TimeProvider = defaultTime,
    simulator?: NetworkSimulator,
  ): void {
    this._service = service;
    this._accessory = accessory;
    this._eventEmitter = emitter;
    this._time = time;
    this._networkSimulator = simulator;
  }

  /** Read the current value, enforcing permissions/validation and network conditions. */
  async getValue(): Promise<CharacteristicValue> {
    const op = async () => {
      ensureReadable(this.type, this.props);
      validateCharacteristicValue(this.type, this.value, this.props, "read");

      logger.debug(LogCategory.CHARACTERISTIC, `getValue: ${this.displayName} = ${this.value}`, {
        accessory: this._accessory?.UUID,
        service: this._service?.type,
        characteristic: this.type,
      });

      return this.value;
    };

    if (this._networkSimulator) {
      return this._networkSimulator.applyConditions(op);
    }

    return op();
  }

  /** Write a new value, enforcing permissions/validation and emitting events. */
  async setValue(value: CharacteristicValue): Promise<void> {
    const op = async () => {
      ensureWritable(this.type, this.props);
      validateCharacteristicValue(this.type, value, this.props, "write");

      const oldValue = this.value;
      this.value = value;

      logger.info(
        LogCategory.CHARACTERISTIC,
        `setValue: ${this.displayName} ${oldValue} → ${value}`,
        {
          accessory: this._accessory?.UUID,
          service: this._service?.type,
          characteristic: this.type,
          oldValue,
          newValue: value,
        },
      );

      const event = buildChangeEvent({
        accessoryUUID: this._accessory?.UUID,
        serviceType: this._service?.type ?? this._service?.displayName,
        characteristicType: this.type,
        event: { oldValue, newValue: value },
        time: this._time,
      });

      this._history.push(event);
      this.notifySubscribers(event);
    };

    if (this._networkSimulator) {
      await this._networkSimulator.applyConditions(op);
      return;
    }

    await op();
  }

  /** Subscribe to change events for this characteristic. */
  subscribe(): IEventSubscription {
    ensureSubscribable(this.type, this.props);

    this._subscribed = true;
    const subscription = new EventSubscription(this);
    this._subscriptions.add(subscription);
    return subscription;
  }

  /** Whether any active subscriptions exist. */
  isSubscribed(): boolean {
    return this._subscribed;
  }

  /** Return a copy of the event history. */
  getHistory(): CharacteristicEvent[] {
    return this._history.slice();
  }

  private notifySubscribers(event: CharacteristicEvent): void {
    this._subscriptions.forEach((sub) => sub.receive(event));
    this._eventEmitter?.emit("characteristic", event);
  }

  /** Internal: remove a subscription and update state. */
  removeSubscription(subscription: EventSubscription): void {
    this._subscriptions.delete(subscription);
    if (this._subscriptions.size === 0) {
      this._subscribed = false;
    }
  }

  /** Update network simulator reference for future operations. */
  updateNetworkSimulator(simulator?: NetworkSimulator): void {
    this._networkSimulator = simulator;
  }
}

class EventSubscription implements IEventSubscription {
  private _active: boolean = true;
  private _queue: CharacteristicEvent[] = [];
  private _pendingResolver?: (event: CharacteristicEvent) => void;
  private _pendingReject?: (error: Error) => void;
  private _timeoutId?: ReturnType<typeof setTimeout>;

  constructor(private readonly source: MockCharacteristic) {}

  receive(event: CharacteristicEvent): void {
    if (!this._active) return;

    if (this._pendingResolver) {
      if (this._timeoutId) {
        clearTimeout(this._timeoutId);
        this._timeoutId = undefined;
      }
      const resolver = this._pendingResolver;
      this._pendingResolver = undefined;
      this._pendingReject = undefined;
      resolver(event);
      return;
    }

    this._queue.push(event);
  }

  waitForNext(timeout?: number): Promise<CharacteristicEvent> {
    if (!this._active) {
      return Promise.reject(new Error("Subscription is inactive"));
    }

    if (this._queue.length > 0) {
      return Promise.resolve(this._queue.shift() as CharacteristicEvent);
    }

    return new Promise<CharacteristicEvent>((resolve, reject) => {
      this._pendingResolver = resolve;
      this._pendingReject = reject;

      if (timeout && timeout > 0) {
        this._timeoutId = setTimeout(() => {
          this._pendingResolver = undefined;
          this._pendingReject = undefined;
          reject(new Error("Timeout waiting for next event"));
        }, timeout);
      }
    });
  }

  getHistory(): CharacteristicEvent[] {
    return this.source.getHistory().slice();
  }

  unsubscribe(): void {
    if (!this._active) return;
    this._active = false;
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
      this._timeoutId = undefined;
    }
    this._pendingResolver = undefined;
    if (this._pendingReject) {
      this._pendingReject(new Error("Subscription cancelled"));
      this._pendingReject = undefined;
    }
    this.source.removeSubscription(this);
  }

  latest(): CharacteristicEvent | undefined {
    const history = this.source.getHistory();
    return history.length > 0 ? history[history.length - 1] : undefined;
  }

  count(): number {
    return this.source.getHistory().length;
  }
}
