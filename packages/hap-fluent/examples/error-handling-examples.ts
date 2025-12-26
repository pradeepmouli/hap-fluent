/**
 * Error Handling Examples for HAP Fluent
 * Demonstrates proper error handling patterns and typed error catching
 */

import { configureLogger } from '../src/logger.js';
import {
	FluentError,
	FluentCharacteristicError,
	ValidationError,
	ConfigurationError,
} from '../src/errors.js';

// Configure logger for examples
configureLogger({ level: 'debug', pretty: true });

/**
 * Example 1: Catching specific error types
 */
async function handleCharacteristicError() {
	try {
		// Simulated characteristic operation that might fail
		throw new FluentCharacteristicError('Failed to set characteristic value', {
			characteristic: 'On',
			value: true,
			originalError: new Error('Device not responding'),
		});
	} catch (error) {
		if (error instanceof FluentCharacteristicError) {
			console.error('Characteristic Error:', {
				message: error.message,
				context: error.context,
				characteristic: error.context?.characteristic,
			});

			// Implement retry logic, fallback, or user notification
			return false;
		}
		throw error; // Re-throw if it's not a characteristic error
	}
}

/**
 * Example 2: Using type guards for error checking
 */
function handleGenericError(error: unknown) {
	if (error instanceof FluentError) {
		console.error('HAP Fluent Error:', {
			name: error.name,
			message: error.message,
			context: error.context,
		});

		// Log to monitoring service
		// sendToMonitoring(error);

		return;
	}

	// Handle non-Fluent errors
	console.error('Unknown Error:', error);
}

/**
 * Example 3: Validation error handling
 */
function validateServiceConfiguration(config: unknown) {
	if (!config || typeof config !== 'object') {
		throw new ValidationError('Invalid service configuration', {
			value: config,
			expected: 'object',
			actual: typeof config,
		});
	}

	if (!('displayName' in config)) {
		throw new ValidationError('Missing required field: displayName', {
			value: config,
			expected: 'object with displayName',
			actual: 'object without displayName',
		});
	}

	return config;
}

/**
 * Example 4: Configuration error handling
 */
function loadPluginConfiguration(path: string) {
	try {
		// Simulated configuration loading
		if (!path.endsWith('.json')) {
			throw new ConfigurationError('Invalid configuration file format', {
				setting: 'configPath',
				value: path,
			});
		}

		// Load and parse configuration...
		return { /* config */ };
	} catch (error) {
		if (error instanceof ConfigurationError) {
			console.error('Configuration Error:', error.message);
			console.error('Setting:', error.context?.setting);
			console.error('Value:', error.context?.value);

			// Use default configuration or exit gracefully
			return getDefaultConfiguration();
		}
		throw error;
	}
}

function getDefaultConfiguration() {
	return { /* default config */ };
}

/**
 * Example 5: Error recovery with fallback
 */
async function setCharacteristicWithFallback(
	characteristic: any,
	value: any,
	fallback: any
) {
	try {
		await characteristic.set(value);
		return true;
	} catch (error) {
		if (error instanceof FluentCharacteristicError) {
			console.warn('Primary value failed, using fallback:', {
				attempted: value,
				fallback,
				reason: error.message,
			});

			try {
				await characteristic.set(fallback);
				return true;
			} catch (fallbackError) {
				console.error('Fallback also failed:', fallbackError);
				return false;
			}
		}
		return false;
	}
}

/**
 * Example 6: Comprehensive error handler for plugin
 */
class ErrorHandler {
	private errorCounts = new Map<string, number>();
	private readonly maxRetries = 3;

	async handleWithRetry<T>(
		operation: () => Promise<T>,
		context: Record<string, unknown>
	): Promise<T> {
		const key = JSON.stringify(context);
		const attempts = this.errorCounts.get(key) || 0;

		try {
			const result = await operation();
			this.errorCounts.delete(key); // Reset on success
			return result;
		} catch (error) {
			if (attempts < this.maxRetries && error instanceof FluentError) {
				console.warn('Retrying operation:', {
					attempt: attempts + 1,
					maxRetries: this.maxRetries,
					error: error.message,
					context,
				});

				this.errorCounts.set(key, attempts + 1);

				// Exponential backoff
				await this.delay(Math.pow(2, attempts) * 1000);

				return this.handleWithRetry(operation, context);
			}

			// Max retries exceeded or non-recoverable error
			console.error('Operation failed after retries:', {
				attempts: attempts + 1,
				error,
				context,
			});

			throw error;
		}
	}

	private delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}

/**
 * Example 7: Error aggregation and reporting
 */
class ErrorReporter {
	private errors: FluentError[] = [];

	record(error: FluentError) {
		this.errors.push(error);

		// Real-time critical error handling
		if (error instanceof ConfigurationError) {
			this.handleCriticalError(error);
		}
	}

	private handleCriticalError(error: FluentError) {
		console.error('CRITICAL ERROR:', {
			message: error.message,
			context: error.context,
		});

		// Send alert, log to service, etc.
	}

	getSummary() {
		const byType = new Map<string, number>();

		for (const error of this.errors) {
			const count = byType.get(error.name) || 0;
			byType.set(error.name, count + 1);
		}

		return {
			total: this.errors.length,
			byType: Object.fromEntries(byType),
			recent: this.errors.slice(-10),
		};
	}

	clear() {
		this.errors = [];
	}
}

// Export examples
export {
	handleCharacteristicError,
	handleGenericError,
	validateServiceConfiguration,
	loadPluginConfiguration,
	setCharacteristicWithFallback,
	ErrorHandler,
	ErrorReporter,
};
