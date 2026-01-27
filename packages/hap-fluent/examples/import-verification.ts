/**
 * Import Verification Examples
 *
 * These examples would verify package exports work correctly.
 * They require the package to be built and published.
 *
 * Uncomment when verifying published package behavior:
 *
 * import { FluentCharacteristic, wrapService } from 'hap-fluent';
 * import { FluentCharacteristicError, ValidationError, ConfigurationError } from 'hap-fluent/errors';
 * import { isCharacteristicValue, isService, isCharacteristic } from 'hap-fluent/type-guards';
 * import { getLogger } from 'hap-fluent/logger';
 */

// For development, verify relative imports work
import { FluentCharacteristic, wrapService } from "../src/index.js";
import { FluentCharacteristicError, ValidationError, ConfigurationError } from "../src/errors.js";
import { isCharacteristicValue, isService, isCharacteristic } from "../src/type-guards.js";
import { getLogger } from "../src/logger.js";

// Example: Main exports usage (note: FluentCharacteristic is a type, so we check functions)
console.log("Relative imports verified:");
console.log("- wrapService:", typeof wrapService);

// Example: Error classes
console.log("- Errors:", {
  FluentCharacteristicError: typeof FluentCharacteristicError,
  ValidationError: typeof ValidationError,
  ConfigurationError: typeof ConfigurationError,
});

// Example: Type Guards
console.log("- Type Guards:", {
  isCharacteristicValue: typeof isCharacteristicValue,
  isService: typeof isService,
  isCharacteristic: typeof isCharacteristic,
});

// Example: Logger
console.log("- Logger:", {
  getLogger: typeof getLogger,
});

console.log("\n✅ All relative imports verified successfully!");
