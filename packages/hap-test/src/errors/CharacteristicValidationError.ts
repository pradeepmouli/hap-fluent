/**
 * Error thrown when characteristic validation fails
 */
export class CharacteristicValidationError extends Error {
  public readonly characteristicType: string;
  public readonly value: any;
  public readonly constraint: string;
  public readonly context?: any;

  constructor(characteristicType: string, value: any, constraint: string, context?: any) {
    const suggestions = CharacteristicValidationError.generateSuggestions(
      constraint,
      value,
      context,
    );
    const message = [
      `❌ Characteristic validation failed for "${characteristicType}"`,
      ``,
      `Constraint: ${constraint}`,
      `Attempted value: ${JSON.stringify(value)}`,
      ...(context ? [`Context: ${JSON.stringify(context)}`] : []),
      ...(suggestions.length > 0
        ? [``, `💡 Suggestions:`, ...suggestions.map((s) => `  • ${s}`)]
        : []),
    ].join("\n");

    super(message);

    this.name = "CharacteristicValidationError";
    this.characteristicType = characteristicType;
    this.value = value;
    this.constraint = constraint;
    this.context = context;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CharacteristicValidationError);
    }
  }

  private static generateSuggestions(constraint: string, value: any, context?: any): string[] {
    const suggestions: string[] = [];

    if (constraint.includes("read")) {
      suggestions.push('Ensure the characteristic has "pr" (paired read) permission in its props');
    }

    if (constraint.includes("write")) {
      suggestions.push('Ensure the characteristic has "pw" (paired write) permission in its props');
    }

    if (constraint.includes("subscribe") || constraint.includes("notify")) {
      suggestions.push('Ensure the characteristic has "ev" (events) permission in its props');
    }

    if (constraint.includes("range") || constraint.includes("min") || constraint.includes("max")) {
      if (context?.minValue !== undefined && context?.maxValue !== undefined) {
        suggestions.push(`Value must be between ${context.minValue} and ${context.maxValue}`);
      } else {
        suggestions.push("Check the minValue and maxValue properties of the characteristic");
      }
    }

    if (constraint.includes("format") || constraint.includes("type")) {
      suggestions.push(
        "Verify the value type matches the characteristic format (bool, int, float, string, etc.)",
      );
    }

    if (constraint.includes("valid values")) {
      if (context?.validValues) {
        suggestions.push(`Valid values are: ${JSON.stringify(context.validValues)}`);
      }
    }

    return suggestions;
  }
}
