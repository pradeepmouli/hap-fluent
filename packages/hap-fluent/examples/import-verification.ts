/**
 * Import Verification Examples
 * 
 * These examples verify that the package exports work correctly
 * for both main exports and subpath exports.
 */

// T139: Verify main imports work correctly
import { FluentService, FluentCharacteristic, getOrAddService, wrapService } from 'hap-fluent';

// T140: Verify subpath imports work correctly
import { FluentCharacteristicError, ValidationError, ConfigurationError } from 'hap-fluent/errors';
import { RangeValidator, EnumValidator, CompositeValidator } from 'hap-fluent/validation';
import { isCharacteristicValue, isService, isCharacteristic } from 'hap-fluent/type-guards';
import { Nullable, Optional, Result } from 'hap-fluent/type-utils';
import { configureLogger, createLogger } from 'hap-fluent/logger';

// Example: Main exports usage
console.log('Main exports loaded successfully:');
console.log('- FluentService:', typeof FluentService);
console.log('- FluentCharacteristic:', typeof FluentCharacteristic);
console.log('- getOrAddService:', typeof getOrAddService);
console.log('- wrapService:', typeof wrapService);

// Example: Subpath exports usage
console.log('\nSubpath exports loaded successfully:');
console.log('- Errors:', {
  FluentCharacteristicError: typeof FluentCharacteristicError,
  ValidationError: typeof ValidationError,
  ConfigurationError: typeof ConfigurationError
});
console.log('- Validation:', {
  RangeValidator: typeof RangeValidator,
  EnumValidator: typeof EnumValidator,
  CompositeValidator: typeof CompositeValidator
});
console.log('- Type Guards:', {
  isCharacteristicValue: typeof isCharacteristicValue,
  isService: typeof isService,
  isCharacteristic: typeof isCharacteristic
});
console.log('- Logger:', {
  configureLogger: typeof configureLogger,
  createLogger: typeof createLogger
});

console.log('\n✅ All imports verified successfully!');
console.log('Tree-shaking should work with modern bundlers (webpack, vite, esbuild)');
