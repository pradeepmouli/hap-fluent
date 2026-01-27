/**
 * Custom error classes for HAP Fluent library
 * @module errors
 */

/**
 * Base error class for all HAP Fluent errors
 */
export class FluentError extends Error {
  constructor(
    message: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when a characteristic operation fails
 */
export class FluentCharacteristicError extends FluentError {
  constructor(
    message: string,
    context?: {
      characteristic?: string;
      value?: unknown;
      originalError?: unknown;
    },
  ) {
    super(message, context);
  }
}

/**
 * Error thrown when a service operation fails
 */
export class FluentServiceError extends FluentError {
  constructor(
    message: string,
    context?: {
      service?: string;
      uuid?: string;
      originalError?: unknown;
    },
  ) {
    super(message, context);
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends FluentError {
  constructor(
    message: string,
    context?: {
      value?: unknown;
      expected?: string;
      actual?: string;
    },
  ) {
    super(message, context);
  }
}

/**
 * Error thrown when configuration is invalid
 */
export class ConfigurationError extends FluentError {
  constructor(
    message: string,
    context?: {
      setting?: string;
      value?: unknown;
    },
  ) {
    super(message, context);
  }
}
