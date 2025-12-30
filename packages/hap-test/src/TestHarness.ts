/**
 * TestHarness orchestrates the mock Homebridge API, mock HomeKit controller, and time control.
 *
 * Public API surface is kept intentionally small so plugins can spin up an isolated harness,
 * register accessories, and observe characteristic events with minimal setup.
 */

import { EventEmitter } from 'events';
import { MockHomebridgeAPI } from './MockHomebridgeAPI.js';
import { MockHomeKit } from './MockHomeKit.js';
import { TimeController } from './TimeController.js';
import type { HarnessOptions, PlatformState } from './types/harness.js';
import type { CharacteristicEvent } from './types/events.js';
import { logger, LogLevel, LogCategory } from './utils/logger.js';

export class TestHarness extends EventEmitter {
  readonly api: MockHomebridgeAPI;
  readonly homeKit: MockHomeKit;
  readonly time: TimeController;
  readonly options: HarnessOptions;
  readonly state: PlatformState;

  private constructor(options: HarnessOptions) {
    super();
    this.options = options;

    // Configure debug logging if requested
    if (options.logging?.debug) {
      logger.enable(LogLevel[options.logging.level || 'DEBUG']);
      if (options.logging.categories) {
        logger.enableCategories(...options.logging.categories);
      }
      logger.info(LogCategory.HARNESS, 'TestHarness: Debug logging enabled', {
        level: options.logging.level || 'DEBUG',
        categories: options.logging.categories || 'all',
      });
    }

    this.api = new MockHomebridgeAPI();
    this.time = new TimeController();
    this.homeKit = new MockHomeKit(this.time);
    this.state = {
      didFinishLaunching: false,
      accessoryCount: 0,
      pendingOperations: 0,
      lastError: undefined,
    };

    logger.debug(LogCategory.HARNESS, 'TestHarness: Initialized', {
      useFakeTimers: options.time?.useFakeTimers,
      persistPath: options.storage?.persistPath,
    });

    this.api.on('didFinishLaunching', () => {
      logger.info(LogCategory.HARNESS, 'TestHarness: didFinishLaunching event');
      this.state.didFinishLaunching = true;
      this.emit('didFinishLaunching');
    });
    this.api.on('registerPlatformAccessories', (accessories: any[]) => {
      this.state.accessoryCount = accessories.length; // basic tracking
      logger.info(LogCategory.HARNESS, `TestHarness: Registered ${accessories.length} accessories`);
      this.emit('registerPlatformAccessories', accessories);
    });
    this.api.on('shutdown', () => {
      logger.info(LogCategory.HARNESS, 'TestHarness: Shutdown event');
      this.emit('shutdown');
    });

    // Emit configureAccessory for cached accessories and restore in HomeKit
    this.api.on('configureAccessory', (accessory: any) => {
      if (accessory && typeof accessory.UUID === 'string') {
        logger.debug(LogCategory.HARNESS, `TestHarness: Configuring cached accessory ${accessory.UUID}`);
        // If provided as MockAccessory, add to HomeKit immediately
        if (typeof accessory.getServices === 'function') {
          this.homeKit.addAccessory(accessory);
        }
      }
    });
  }

  /**
   * Create a new harness instance.
   *
   * @param options Platform constructor, config, optional cached accessories, and logging/time settings.
   */
  static async create(options: HarnessOptions): Promise<TestHarness> {
    const harness = new TestHarness(options);

    // Provide cached accessories (if any) to API and emit configure callbacks
    if (options.cachedAccessories && options.cachedAccessories.length > 0) {
      harness.api.provideCachedAccessories(options.cachedAccessories);
      // Restore immediately into HomeKit for test convenience
      for (const acc of options.cachedAccessories) {
        harness.homeKit.addAccessory(acc as any);
      }
    }

    // Note: In a full implementation, we would construct the platform here
    // using options.platformConstructor and wire it with this.api.
    return harness;
  }

  /**
   * Wait until the platform emits `didFinishLaunching`.
   *
   * @param _timeoutMs Optional timeout in milliseconds (not yet enforced).
   */
  async waitForRegistration(_timeoutMs = 1000): Promise<void> {
    if (this.state.didFinishLaunching) return;
    await new Promise<void>(resolve => {
      const handler = () => {
        this.off('didFinishLaunching', handler);
        resolve();
      };
      this.on('didFinishLaunching', handler);
    });
  }

  /**
   * Wait until at least `count` accessories are registered.
   *
   * @param count Minimum accessory count to wait for.
   * @param _timeoutMs Optional timeout in milliseconds (not yet enforced).
   */
  async waitForAccessories(count: number, _timeoutMs = 1000): Promise<void> {
    if (this.homeKit.accessories().length >= count) return;
    await new Promise<void>(resolve => {
      const handler = () => {
        if (this.homeKit.accessories().length >= count) {
          this.off('registerPlatformAccessories', handler);
          resolve();
        }
      };
      this.on('registerPlatformAccessories', handler);
    });
  }

  /**
   * Subscribe to a specific characteristic and resolve once the next event arrives.
   *
   * @param accessoryUuid Accessory UUID.
   * @param serviceName Service name or type.
   * @param characteristicName Characteristic name or type.
   * @param timeoutMs Timeout in milliseconds before rejecting.
   */
  async waitForEvent(accessoryUuid: string, serviceName: string, characteristicName: string, timeoutMs = 1000): Promise<CharacteristicEvent> {
    const characteristic = this.homeKit.characteristic(accessoryUuid, serviceName, characteristicName);
    if (!characteristic) {
      throw new Error(`Characteristic ${characteristicName} not found on service ${serviceName}`);
    }

    const subscription = characteristic.subscribe();
    try {
      return await subscription.waitForNext(timeoutMs);
    } finally {
      subscription.unsubscribe();
    }
  }

  /**
   * Wait for the next characteristic event across any accessory/service/characteristic.
   *
   * @param timeoutMs Timeout in milliseconds before rejecting.
   */
  async waitForAnyEvent(timeoutMs = 1000): Promise<CharacteristicEvent> {
    return await new Promise<CharacteristicEvent>((resolve, reject) => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const clear = this.homeKit.onCharacteristicEvent(event => {
        if (timer) {
          clearTimeout(timer);
        }
        clear();
        resolve(event);
      });

      timer = setTimeout(() => {
        clear();
        reject(new Error('Timeout waiting for any event'));
      }, timeoutMs);
    });
  }

  /**
   * Cleanly shut down the harness, restoring timers and emitting shutdown.
   */
  shutdown(): void {
    this.time.reset();
    this.api.emitShutdown();
  }
}
