/**
 * Type definitions for the TestHarness core API
 */

import type { API, PlatformConfig, DynamicPlatformPlugin } from "homebridge";

/**
 * Options for initializing the TestHarness
 */
export interface HarnessOptions {
  /** Platform constructor class */
  platformConstructor: new (log: any, config: PlatformConfig, api: API) => DynamicPlatformPlugin;

  /** Platform configuration object */
  platformConfig: PlatformConfig;

  /** Optional logger configuration */
  logging?: {
    /** Enable debug logging */
    debug?: boolean;
    /** Custom log prefix */
    prefix?: string;
    /** Log level (DEBUG, INFO, WARN, ERROR) */
    level?: "DEBUG" | "INFO" | "WARN" | "ERROR";
    /** Specific categories to log */
    categories?: string[];
  };

  /** Time control options */
  time?: {
    /** Use fake timers */
    useFakeTimers?: boolean;
    /** Initial time (defaults to current time) */
    initialTime?: Date;
  };

  /** Storage options */
  storage?: {
    /** Base path for persistent storage (defaults to temp directory) */
    persistPath?: string;
  };

  /** Cached accessories to restore at startup */
  cachedAccessories?: import("./mocks.js").MockAccessory[];
}

/**
 * Internal state tracking for the platform
 */
export interface PlatformState {
  /** Whether the platform has finished launching */
  didFinishLaunching: boolean;

  /** Registered accessories count */
  accessoryCount: number;

  /** Pending operations count */
  pendingOperations: number;

  /** Last error encountered */
  lastError?: Error;
}

/**
 * Context object attached to accessories
 */
export interface AccessoryContext {
  /** User-provided context data */
  [key: string]: any;
}
