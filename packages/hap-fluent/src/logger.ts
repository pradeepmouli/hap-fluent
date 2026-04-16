/**
 * Structured logging configuration for HAP Fluent.
 *
 * @remarks
 * HAP Fluent uses [Pino](https://getpino.io) for fast, low-overhead JSON
 * logging. By default a silent logger is created automatically on first use;
 * call {@link configureLogger} early in your plugin startup to set a custom
 * log level and enable pretty-printing for development.
 *
 * A single global `pino.Logger` instance is shared across all hap-fluent
 * operations. Use {@link createChildLogger} to bind extra context (device ID,
 * service name, etc.) without mutating the root logger.
 *
 * @module logger
 */

import pino from 'pino';

/**
 * Valid Pino log level identifiers.
 *
 * @remarks
 * Ordered from most verbose to most silent:
 * `trace` → `debug` → `info` → `warn` → `error` → `fatal` → `silent`.
 * The default level used by hap-fluent is `info`.
 *
 * @defaultValue `'info'`
 *
 * @category Logger
 */
export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';

/**
 * Configuration options for the global hap-fluent logger.
 *
 * @config
 *
 * @remarks
 * Pass to {@link configureLogger} once at plugin startup. All fields are
 * optional; omitting them leaves the corresponding Pino default in effect.
 *
 * @example
 * ```typescript
 * // Development — human-readable output
 * configureLogger({ level: 'debug', pretty: true });
 *
 * // Production — JSON output with plugin context
 * configureLogger({
 *   level: 'warn',
 *   base: { plugin: 'homebridge-my-plugin', version: '2.0.0' }
 * });
 * ```
 *
 * @category Logger
 */
export interface LoggerOptions {
  /**
   * Minimum log level to output.
   * @defaultValue `'info'`
   */
  level?: LogLevel;

  /**
   * Enable pretty-printing (pino-pretty) for human-readable output.
   * Set to `false` in production to emit structured JSON.
   * @defaultValue `false`
   */
  pretty?: boolean;

  /**
   * Custom log destination stream.
   * @defaultValue `process.stdout`
   */
  destination?: pino.DestinationStream;

  /**
   * Additional context fields included in every log message.
   * Useful for tagging logs with plugin name and version.
   */
  base?: Record<string, unknown>;
}

/**
 * Global logger instance
 */
let loggerInstance: pino.Logger | null = null;

/**
 * Configure the global hap-fluent logger instance.
 *
 * @remarks
 * Call this once at the start of your plugin's lifecycle (e.g., in the
 * platform constructor) before any hap-fluent operations. Subsequent calls
 * replace the existing logger instance entirely — all child loggers created
 * before the replacement will continue to use the old instance.
 *
 * @param options - {@link LoggerOptions} controlling level, pretty-print, etc.
 * @returns The newly configured `pino.Logger` instance.
 *
 * @useWhen
 * - Setting up structured logging at plugin startup with a custom level or
 *   base context fields.
 * - Switching between development (pretty) and production (JSON) output.
 *
 * @avoidWhen
 * - You only need a read reference to the current logger — use {@link getLogger} instead.
 *
 * @pitfalls
 * - NEVER call `configureLogger` inside a GET/SET handler — reconstructing the
 *   logger on every HomeKit poll is a significant performance overhead.
 * - NEVER enable `pretty: true` in production — pino-pretty adds ~1ms of
 *   synchronous formatting overhead per log line, which can cascade under
 *   high-frequency characteristic polling.
 *
 * @example
 * ```typescript
 * // Development mode with pretty printing
 * configureLogger({ level: 'debug', pretty: true });
 *
 * // Production mode with JSON output and plugin context
 * configureLogger({
 *   level: 'info',
 *   pretty: false,
 *   base: { plugin: 'my-homebridge-plugin', version: '1.0.0' }
 * });
 * ```
 *
 * @category Logger
 */
export function configureLogger(options: LoggerOptions = {}): pino.Logger {
  const { level = 'info', pretty = false, destination, base = { name: 'hap-fluent' } } = options;

  const transport = pretty
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname'
        }
      }
    : undefined;

  loggerInstance = pino(
    {
      level,
      base,
      ...(transport && { transport })
    },
    destination
  );

  return loggerInstance;
}

/**
 * Get the current global logger instance.
 *
 * @remarks
 * If no logger has been configured via {@link configureLogger}, a default
 * `pino.Logger` at `info` level is created lazily on first call. This lazy
 * initialization ensures hap-fluent never throws on import in environments
 * where Pino is available but `configureLogger` has not yet been called.
 *
 * @returns The active `pino.Logger` instance.
 *
 * @example
 * ```typescript
 * const logger = getLogger();
 * logger.info({ deviceId: '123' }, 'Device connected');
 * logger.error({ err: new Error('Timeout') }, 'Operation failed');
 * ```
 *
 * @category Logger
 */
export function getLogger(): pino.Logger {
  if (!loggerInstance) {
    loggerInstance = pino({
      level: 'info',
      base: { name: 'hap-fluent' }
    });
  }
  return loggerInstance;
}

/**
 * Create a child Pino logger with additional bound context fields.
 *
 * @remarks
 * Every message emitted by the child logger automatically includes the
 * `context` fields, making it easy to correlate logs for a specific device,
 * service, or characteristic without manually adding fields to each log call.
 *
 * The child logger uses the same level and transport as the root logger
 * returned by {@link getLogger}. Re-configure the root logger via
 * {@link configureLogger} if you need to change the level globally.
 *
 * @param context - Key-value pairs to bind to every log message.
 * @returns A `pino.Logger` child instance with the given context fields.
 *
 * @example
 * ```typescript
 * const deviceLogger = createChildLogger({
 *   device: 'living-room-light',
 *   deviceId: '12345'
 * });
 *
 * deviceLogger.info('State changed');
 * // Output: { "device": "living-room-light", "deviceId": "12345", "msg": "State changed" }
 * ```
 *
 * @category Logger
 */
export function createChildLogger(context: Record<string, unknown>): pino.Logger {
  return getLogger().child(context);
}

/**
 * Reset the logger instance (primarily for testing)
 */
export function resetLogger(): void {
  loggerInstance = null;
}
