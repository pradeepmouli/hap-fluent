/**
 * Logging Examples for HAP Fluent
 * Demonstrates how to configure and use structured logging with Pino
 */

import { configureLogger, getLogger, createChildLogger } from "../src/logger.js";

/**
 * Example 1: Basic logging configuration
 */
function basicLogging() {
  // Configure logger for development with pretty printing
  configureLogger({
    level: "debug",
    pretty: true,
  });

  const logger = getLogger();

  logger.info("Plugin initialized");
  logger.debug({ deviceCount: 5 }, "Discovered devices");
  logger.warn("Device not responding, will retry");
  logger.error({ error: new Error("Connection failed") }, "Failed to connect");
}

/**
 * Example 2: Production configuration
 */
function productionLogging() {
  // Configure for production with JSON output
  configureLogger({
    level: "info",
    pretty: false,
    base: {
      plugin: "homebridge-my-plugin",
      version: "1.0.0",
      environment: "production",
    },
  });

  const logger = getLogger();
  logger.info("Running in production mode");
}

/**
 * Example 3: Using child loggers for context
 */
function childLoggers() {
  configureLogger({ level: "debug", pretty: true });

  // Create a child logger with device context
  const deviceLogger = createChildLogger({
    device: "living-room-light",
    deviceId: "12345",
  });

  deviceLogger.info("Device state changed");
  // Output includes: {"device":"living-room-light","deviceId":"12345",...}

  deviceLogger.debug({ brightness: 75 }, "Brightness updated");
  // Output includes device context + brightness value
}

/**
 * Example 4: Logging in plugin class
 */
class MyHomebridgePlugin {
  private readonly logger;

  constructor() {
    // Configure once during plugin initialization
    configureLogger({
      level: process.env.NODE_ENV === "development" ? "debug" : "info",
      pretty: process.env.NODE_ENV === "development",
      base: {
        plugin: "homebridge-my-plugin",
      },
    });

    this.logger = getLogger();
    this.logger.info("Plugin constructed");
  }

  discoverDevices() {
    this.logger.debug("Starting device discovery");

    // Simulate discovery
    const devices = ["device1", "device2"];

    this.logger.info({ deviceCount: devices.length }, "Devices discovered");

    return devices;
  }

  handleError(error: Error) {
    this.logger.error({ err: error }, "Operation failed");

    // Pino automatically serializes error objects
    // Output includes: name, message, stack
  }
}

/**
 * Example 5: Logging accessory operations
 */
class AccessoryLogger {
  private readonly logger;

  constructor(accessoryName: string, accessoryId: string) {
    // Create child logger for this accessory
    this.logger = createChildLogger({
      accessory: accessoryName,
      id: accessoryId,
    });

    this.logger.info("Accessory initialized");
  }

  logCharacteristicChange(characteristic: string, oldValue: unknown, newValue: unknown) {
    this.logger.debug(
      {
        characteristic,
        oldValue,
        newValue,
      },
      "Characteristic changed",
    );
  }

  logServiceAdded(serviceName: string, serviceType: string) {
    this.logger.info(
      {
        service: serviceName,
        type: serviceType,
      },
      "Service added",
    );
  }

  logError(operation: string, error: Error) {
    this.logger.error(
      {
        operation,
        err: error,
      },
      "Operation failed",
    );
  }
}

/**
 * Example 6: Conditional logging based on log level
 */
function conditionalLogging() {
  configureLogger({ level: "info" });
  const logger = getLogger();

  // This will NOT be logged (level is 'info', not 'debug')
  logger.debug("Detailed debug information");

  // This WILL be logged
  logger.info("Important status update");

  // For expensive operations, check level first
  if (logger.level === "debug") {
    const expensiveData = computeExpensiveData();
    logger.debug({ data: expensiveData }, "Expensive debug data");
  }
}

function computeExpensiveData() {
  // Simulated expensive computation
  return {
    /* large data */
  };
}

/**
 * Example 7: Structured logging for metrics
 */
function metricsLogging() {
  configureLogger({ level: "info" });
  const logger = getLogger();

  // Log performance metrics
  logger.info(
    {
      metric: "response_time",
      value: 250,
      unit: "ms",
      operation: "get_characteristic",
    },
    "Performance metric",
  );

  // Log resource usage
  logger.info(
    {
      metric: "memory_usage",
      value: process.memoryUsage().heapUsed / 1024 / 1024,
      unit: "MB",
    },
    "Resource usage",
  );
}

/**
 * Example 8: Log levels guide
 */
function logLevelsGuide() {
  const logger = getLogger();

  // TRACE: Very detailed, typically not used
  logger.trace("Entering function");

  // DEBUG: Detailed for debugging during development
  logger.debug({ state: { on: true, brightness: 75 } }, "Current device state");

  // INFO: General informational messages
  logger.info("Device connected successfully");

  // WARN: Warning messages for recoverable issues
  logger.warn("Device slow to respond, retrying...");

  // ERROR: Error messages for failures
  logger.error({ err: new Error("Connection timeout") }, "Failed to connect");

  // FATAL: Critical errors causing shutdown (rarely used)
  logger.fatal("Unrecoverable error, shutting down");
}

// Export examples
export {
  basicLogging,
  productionLogging,
  childLoggers,
  MyHomebridgePlugin,
  AccessoryLogger,
  conditionalLogging,
  metricsLogging,
  logLevelsGuide,
};
