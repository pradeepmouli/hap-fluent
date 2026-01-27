/**
 * Type Utilities Examples for HAP Fluent
 * Demonstrates how to use type utilities for improved developer experience
 */

import {
  createClampTransformer,
  createScaleTransformer,
  createRangePredicate,
  isFluentCharacteristic,
  type ServiceState,
  type PartialServiceState,
  type ValueTransformer,
  type ValuePredicate,
} from "../src/type-utils.js";

/**
 * Example 1: Using ServiceState type for state management
 */
function stateManagement() {
  // Define complete service state
  const lightState: ServiceState = {
    on: true,
    brightness: 75,
    hue: 120,
    saturation: 50,
  };

  // Partial state for updates
  const update: PartialServiceState = {
    on: false,
    brightness: 0,
  };

  // Merge states
  const newState = { ...lightState, ...update };
  console.log("New state:", newState);
}

/**
 * Example 2: Value transformers for clamping
 */
function clampingValues() {
  // Create a transformer that clamps brightness to 0-100
  const clampBrightness = createClampTransformer(0, 100);

  console.log(clampBrightness(150)); // Returns 100
  console.log(clampBrightness(-10)); // Returns 0
  console.log(clampBrightness(50)); // Returns 50

  // Use in characteristic updates
  const userInput = 150;
  const _safeBrightness = clampBrightness(userInput);
  // Use _safeBrightness to set characteristic (reserved for future implementation)
}

/**
 * Example 3: Value transformers for scaling
 */
function scalingValues() {
  // Convert percentage (0-100) to decimal (0-1)
  const percentToDecimal = createScaleTransformer(0, 100, 0, 1);

  console.log(percentToDecimal(0)); // Returns 0
  console.log(percentToDecimal(50)); // Returns 0.5
  console.log(percentToDecimal(100)); // Returns 1

  // Convert Kelvin (2000-6500) to HomeKit color temperature (140-500)
  const kelvinToMired = createScaleTransformer(2000, 6500, 500, 140);

  console.log(kelvinToMired(2700)); // Warm white
  console.log(kelvinToMired(6500)); // Cool daylight
}

/**
 * Example 4: Value predicates for validation
 */
function validatingValues() {
  // Create validators
  const isValidHue = createRangePredicate(0, 360);
  const isValidBrightness = createRangePredicate(0, 100);

  // Validate user input
  const userHue = 180;
  if (isValidHue(userHue)) {
    console.log("Valid hue:", userHue);
  }

  const userBrightness = 150;
  if (!isValidBrightness(userBrightness)) {
    console.error("Invalid brightness:", userBrightness);
  }
}

/**
 * Example 5: Combining transformers and predicates
 */
function combineTransformersAndPredicates() {
  const clampBrightness = createClampTransformer(0, 100);
  const isValidBrightness = createRangePredicate(0, 100);

  function setBrightness(value: number) {
    // Validate first
    if (!isValidBrightness(value)) {
      console.warn(`Invalid brightness ${value}, clamping...`);
      value = clampBrightness(value);
    }

    console.log("Setting brightness to:", value);
    // Set to characteristic...
  }

  setBrightness(150); // Clamps to 100
  setBrightness(-10); // Clamps to 0
  setBrightness(75); // Valid, uses as-is
}

/**
 * Example 6: Custom value transformers
 */
function customTransformers() {
  // Transformer to round to nearest 5
  const roundToNearest5: ValueTransformer<number, number> = (value) => {
    return Math.round(value / 5) * 5;
  };

  console.log(roundToNearest5(73)); // Returns 75
  console.log(roundToNearest5(72)); // Returns 70

  // Transformer to convert boolean to number
  const boolToNumber: ValueTransformer<boolean, number> = (value) => {
    return value ? 1 : 0;
  };

  console.log(boolToNumber(true)); // Returns 1
  console.log(boolToNumber(false)); // Returns 0
}

/**
 * Example 7: Custom value predicates
 */
function customPredicates() {
  // Predicate for valid percentage
  const isPercentage: ValuePredicate<number> = (value) => {
    return Number.isFinite(value) && value >= 0 && value <= 100;
  };

  // Predicate for valid color temperature
  const isValidColorTemp: ValuePredicate<number> = (value) => {
    return Number.isInteger(value) && value >= 140 && value <= 500;
  };

  // Use predicates
  console.log(isPercentage(50)); // true
  console.log(isPercentage(150)); // false
  console.log(isValidColorTemp(300)); // true
  console.log(isValidColorTemp(100)); // false
}

/**
 * Example 8: Type-safe state updates
 */
function typeSafeStateUpdates() {
  const currentState = {
    on: true,
    brightness: 50,
  };

  // Type-safe partial update
  const update = {
    brightness: 75,
    hue: 200,
  };

  const newState = {
    ...currentState,
    ...update,
  };

  console.log("Updated state:", newState);
}

/**
 * Example 9: Using type guard for FluentCharacteristic
 */
function typeGuardExample() {
  const obj: unknown = {}; // Could be anything

  if (isFluentCharacteristic(obj)) {
    // TypeScript now knows obj is FluentCharacteristic
    obj.get();
    // obj.set(true); // Would work if we had a real instance
  } else {
    console.log("Not a FluentCharacteristic");
  }
}

/**
 * Example 10: Practical accessory state manager
 */
class AccessoryStateManager {
  private state: ServiceState = {};
  private readonly clampBrightness = createClampTransformer(0, 100);
  private readonly clampHue = createClampTransformer(0, 360);
  private readonly isValidValue = (value: unknown): value is number | boolean | string => {
    return typeof value === "number" || typeof value === "boolean" || typeof value === "string";
  };

  updateCharacteristic(name: string, value: unknown) {
    if (!this.isValidValue(value)) {
      throw new Error(`Invalid value for ${name}: ${value}`);
    }

    // Apply transformations based on characteristic type
    let transformedValue = value;

    if (name === "brightness" && typeof value === "number") {
      transformedValue = this.clampBrightness(value);
    } else if (name === "hue" && typeof value === "number") {
      transformedValue = this.clampHue(value);
    }

    this.state[name] = transformedValue;
    console.log(`Updated ${name}:`, transformedValue);
  }

  getState(): ServiceState {
    return { ...this.state };
  }
}

// Export examples
export {
  stateManagement,
  clampingValues,
  scalingValues,
  validatingValues,
  combineTransformersAndPredicates,
  customTransformers,
  customPredicates,
  typeSafeStateUpdates,
  typeGuardExample,
  AccessoryStateManager,
};
