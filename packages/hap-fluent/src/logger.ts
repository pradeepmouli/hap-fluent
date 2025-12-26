/**
 * Structured logging configuration for HAP Fluent
 * Uses Pino for fast, JSON-structured logging with configurable levels
 */

import pino from 'pino';

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';

export interface LoggerOptions {
	/**
	 * Minimum log level to output
	 * @default 'info'
	 */
	level?: LogLevel;

	/**
	 * Enable pretty printing for development
	 * @default false
	 */
	pretty?: boolean;

	/**
	 * Custom log destination
	 * @default process.stdout
	 */
	destination?: pino.DestinationStream;

	/**
	 * Additional context to include in all log messages
	 */
	base?: Record<string, unknown>;
}

/**
 * Global logger instance
 */
let loggerInstance: pino.Logger | null = null;

/**
 * Configure the global logger instance
 *
 * @param options - Logger configuration options
 * @returns Configured Pino logger instance
 *
 * @example
 * ```typescript
 * // Development mode with pretty printing
 * configureLogger({ level: 'debug', pretty: true });
 *
 * // Production mode with JSON output
 * configureLogger({ level: 'info', pretty: false });
 *
 * // Custom context for all logs
 * configureLogger({
 *   level: 'debug',
 *   base: { plugin: 'my-homebridge-plugin', version: '1.0.0' }
 * });
 * ```
 */
export function configureLogger(options: LoggerOptions = {}): pino.Logger {
	const {
		level = 'info',
		pretty = false,
		destination,
		base = { name: 'hap-fluent' },
	} = options;

	const transport = pretty
		? {
				target: 'pino-pretty',
				options: {
					colorize: true,
					translateTime: 'HH:MM:ss.l',
					ignore: 'pid,hostname',
				},
			}
		: undefined;

	loggerInstance = pino(
		{
			level,
			base,
			...(transport && { transport }),
		},
		destination,
	);

	return loggerInstance;
}

/**
 * Get the current logger instance
 * If no logger has been configured, returns a default logger with 'info' level
 *
 * @returns Current Pino logger instance
 *
 * @example
 * ```typescript
 * const logger = getLogger();
 * logger.info('Operation completed');
 * logger.error({ err }, 'Operation failed');
 * ```
 */
export function getLogger(): pino.Logger {
	if (!loggerInstance) {
		loggerInstance = pino({
			level: 'info',
			base: { name: 'hap-fluent' },
		});
	}
	return loggerInstance;
}

/**
 * Create a child logger with additional context
 *
 * @param context - Additional context to include in all child logger messages
 * @returns Child logger instance with bound context
 *
 * @example
 * ```typescript
 * const serviceLogger = createChildLogger({ service: 'Lightbulb', uuid: '123' });
 * serviceLogger.debug('Service created');
 * // Output: {"level":20,"service":"Lightbulb","uuid":"123","msg":"Service created"}
 * ```
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
