/**
 * MockHomebridgeAPI - Mock implementation of Homebridge API
 *
 * Provides a complete mock of the Homebridge platform API for testing,
 * including accessory registration, lifecycle events, and storage.
 */

import { EventEmitter } from "events";
import { tmpdir } from "os";
import { join } from "path";
import type { PlatformAccessory } from "homebridge";
import * as HAP from "hap-nodejs";

export class MockHomebridgeAPI extends EventEmitter {
  private _accessories: Map<string, PlatformAccessory> = new Map();
  private _didFinishLaunching: boolean = false;
  private _storagePath: string;
  private _cachedAccessories: any[] = [];

  public readonly hap: any = HAP;
  public readonly platformAccessory: any = HAP.Accessory;
  public readonly version = 2.0;
  public readonly serverVersion = "1.0.0-mock";

  constructor() {
    super();

    // Create temp storage path
    this._storagePath = join(tmpdir(), `hap-test-${Date.now()}`);
  }

  /**
   * Register platform accessories
   */
  registerPlatformAccessories(
    pluginIdentifier: string,
    platformName: string,
    accessories: PlatformAccessory[],
  ): void {
    for (const accessory of accessories) {
      // Prevent duplicate registrations
      if (!this._accessories.has(accessory.UUID)) {
        this._accessories.set(accessory.UUID, accessory);
      }
    }

    this.emit("registerPlatformAccessories", accessories);
  }

  /**
   * Unregister platform accessories
   */
  unregisterPlatformAccessories(
    pluginIdentifier: string,
    platformName: string,
    accessories: PlatformAccessory[],
  ): void {
    for (const accessory of accessories) {
      this._accessories.delete(accessory.UUID);
    }

    this.emit("unregisterPlatformAccessories", accessories);
  }

  /**
   * Update platform accessories
   */
  updatePlatformAccessories(accessories: PlatformAccessory[]): void {
    for (const accessory of accessories) {
      if (this._accessories.has(accessory.UUID)) {
        this._accessories.set(accessory.UUID, accessory);
      }
    }

    this.emit("updatePlatformAccessories", accessories);
  }

  /**
   * Get all registered accessories
   */
  platformAccessories(): PlatformAccessory[] {
    return Array.from(this._accessories.values());
  }

  /**
   * Emit didFinishLaunching lifecycle event
   */
  emitDidFinishLaunching(): void {
    this._didFinishLaunching = true;
    this.emit("didFinishLaunching");
  }

  /**
   * Emit shutdown lifecycle event
   */
  emitShutdown(): void {
    this.emit("shutdown");
  }

  /**
   * User storage paths
   */
  public readonly user = {
    /**
     * Get persistent storage path
     */
    persistPath: (): string => {
      return this._storagePath;
    },

    /**
     * Get cached accessories path
     */
    cachedAccessoryPath: (): string => {
      return join(this._storagePath, "accessories");
    },

    /**
     * Get config path
     */
    configPath: (): string => {
      return join(this._storagePath, "config.json");
    },

    /**
     * Get storage path
     */
    storagePath: (): string => {
      return this._storagePath;
    },
  };

  /**
   * Publish external accessories (not implemented for initial phase)
   */
  publishExternalAccessories(_pluginIdentifier: string, _accessories: PlatformAccessory[]): void {
    // Not implemented in Phase 2
    throw new Error("publishExternalAccessories not yet implemented");
  }

  /**
   * Provide cached accessories to the platform and emit configure callbacks
   */
  provideCachedAccessories(accessories: any[]): void {
    this._cachedAccessories = accessories.slice();
    for (const accessory of accessories) {
      this.emit("configureAccessory", accessory);
    }
  }

  /**
   * Get cached accessories previously provided
   */
  getCachedAccessories(): any[] {
    return this._cachedAccessories.slice();
  }
}
