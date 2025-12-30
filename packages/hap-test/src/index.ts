/**
 * hap-test - Test harness for Homebridge plugin development
 *
 * @packageDocumentation
 */

// Public API exports

export { TestHarness } from './TestHarness.js';
export { MockHomebridgeAPI } from './MockHomebridgeAPI.js';
export { MockHomeKit, MockAccessory, MockService, MockCharacteristic } from './MockHomeKit.js';
export { TimeController } from './TimeController.js';
export { NetworkSimulator } from './NetworkSimulator.js';

export * from './types/index.js';
export * from './errors/index.js';
export * from './utils/validation.js';
export * from './matchers/index.js';
