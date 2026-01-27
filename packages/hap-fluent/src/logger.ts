/**
 * Logger adapter for HAP Fluent
 * Uses Homebridge's Logging interface to integrate with the platform's logging system
 */

import type { Logging } from "homebridge";

/**
 * Logger interface compatible with homebridge's Logging
 * Provides methods for logging at different levels with context support
 */
export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
  success?(message: string, context?: Record<string, unknown>): void;
}

/**
 * Adapter to wrap Homebridge's Logging interface
 * Formats structured log messages with context for better debugging
 */
export class LoggerAdapter implements Logger {
  constructor(private readonly homebridgeLogger: Logging) {}

  info(message: string, context?: Record<string, unknown>): void {
    this.homebridgeLogger.info(this.formatMessage(message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.homebridgeLogger.warn(this.formatMessage(message, context));
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.homebridgeLogger.error(this.formatMessage(message, context));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.homebridgeLogger.debug(this.formatMessage(message, context));
  }

  success(message: string, context?: Record<string, unknown>): void {
    if (this.homebridgeLogger.success) {
      this.homebridgeLogger.success(this.formatMessage(message, context));
    } else {
      this.info(message, context);
    }
  }

  private formatMessage(message: string, context?: Record<string, unknown>): string {
    if (!context || Object.keys(context).length === 0) {
      return message;
    }
    const contextStr = Object.entries(context)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join(" ");
    return `${message} [${contextStr}]`;
  }
}

/**
 * Create a logger instance from Homebridge's Logging interface
 *
 * @param homebridgeLogger - The Homebridge logger instance
 * @returns Logger adapter instance
 *
 * @example
 * ```typescript
 * class MyPlatform implements DynamicPlatformPlugin {
 *   private readonly logger: Logger;
 *
 *   constructor(
 *     public readonly log: Logging,
 *     public readonly config: PlatformConfig,
 *     public readonly api: API,
 *   ) {
 *     this.logger = createLogger(log);
 *   }
 * }
 * ```
 */
export function createLogger(homebridgeLogger: Logging): Logger {
  return new LoggerAdapter(homebridgeLogger);
}

/**
 * Create a no-op logger for testing or when homebridge logger is not available
 * All log methods do nothing
 */
export function createNoOpLogger(): Logger {
  return {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
    success: () => {},
  };
}
