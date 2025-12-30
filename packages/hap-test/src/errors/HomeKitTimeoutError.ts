/**
 * Error thrown when HomeKit operations timeout
 */
export class HomeKitTimeoutError extends Error {
  public readonly operation: string;
  public readonly timeoutMs: number;
  public readonly context?: any;

  constructor(operation: string, timeoutMs: number, context?: any) {
    const suggestions = HomeKitTimeoutError.generateSuggestions(operation, timeoutMs, context);
    const message = [
      `⏱️  HomeKit operation timeout`,
      ``,
      `Operation: ${operation}`,
      `Timeout: ${timeoutMs}ms`,
      ...(context?.waitingFor ? [`Waiting for: ${context.waitingFor}`] : []),
      ...(context?.accessoryUuid ? [`Accessory: ${context.accessoryUuid}`] : []),
      ...(context?.serviceName ? [`Service: ${context.serviceName}`] : []),
      ...(context?.characteristicName ? [`Characteristic: ${context.characteristicName}`] : []),
      ...(suggestions.length > 0
        ? [``, `💡 Troubleshooting:`, ...suggestions.map((s) => `  • ${s}`)]
        : []),
    ].join("\n");

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

  private static generateSuggestions(
    operation: string,
    timeoutMs: number,
    context?: any,
  ): string[] {
    const suggestions: string[] = [];

    if (operation.includes("wait") || operation.includes("event")) {
      suggestions.push("Check that the event is actually being emitted by the accessory");
      suggestions.push("Verify event subscriptions are set up before triggering operations");
      suggestions.push("Use TimeController.advance() to progress fake timers in tests");
    }

    if (
      operation.includes("response") ||
      operation.includes("read") ||
      operation.includes("write")
    ) {
      suggestions.push("Ensure the characteristic operation completes within the timeout");
      suggestions.push("Check for network simulation settings that may be delaying operations");
    }

    if (context?.networkSimulator) {
      suggestions.push("Network simulator is active - check latency and packet loss settings");
      suggestions.push("Consider increasing timeout or resetting network conditions for this test");
    }

    if (timeoutMs < 1000) {
      suggestions.push(
        `Timeout is quite short (${timeoutMs}ms) - consider increasing if operations are legitimately slow`,
      );
    }

    suggestions.push("Review test logs and console output for additional context");

    return suggestions;
  }
}
