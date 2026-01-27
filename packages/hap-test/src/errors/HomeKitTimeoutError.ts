/**
 * Error thrown when HomeKit operations timeout
 */
export class HomeKitTimeoutError extends Error {
  public readonly operation: string;
  public readonly timeoutMs: number;
  public readonly context?: any;

  constructor(operation: string, timeoutMs: number, context?: any) {
    const message = `HomeKit operation "${operation}" timed out after ${timeoutMs}ms`;
    super(message);

    this.name = "HomeKitTimeoutError";
    this.operation = operation;
    this.timeoutMs = timeoutMs;
    this.context = context;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HomeKitTimeoutError);
    }
  }
}
