/**
 * Interceptor Examples for HAP Fluent
 * 
 * Demonstrates the simplified fluent API for extending characteristic behavior.
 * Standard interceptors are available as chainable methods on characteristics.
 * 
 * Key Points:
 * - Standard interceptors: log(), limit(), clamp(), transform(), audit()
 * - All methods are chainable for fluent composition
 * - Interceptors wrap onSet/onGet handlers
 * - They run when HomeKit accesses the characteristic
 * - HAP-nodejs already handles its own validation/rate-limiting
 * - Our interceptors add custom behavior on top
 */

import { Service, Characteristic, Accessory, uuid } from 'hap-nodejs';
import { wrapService } from '../src/FluentService.js';

// Example 1: Basic Logging on onSet
console.log('=== Example 1: Logging on onSet ===');
{
const accessory = new Accessory('Light', uuid.generate('light-1'));
const service = accessory.addService(Service.Lightbulb, 'My Light');
service.addCharacteristic(Characteristic.Brightness);

const wrapped = wrapService(service);

// Simple logging with fluent API
wrapped.characteristics.brightness.log().onSet(async (value) => {
console.log(`  Handler received value: ${value}`);
// Your business logic here
});

// When HomeKit calls onSet, logs will appear before and after
console.log('✓ Logging configured on onSet handler');
console.log('  When HomeKit sets brightness, logs will appear');
}

// Example 2: Rate Limiting on onSet
console.log('\n=== Example 2: Rate Limiting on onSet ===');
{
const accessory = new Accessory('Light', uuid.generate('light-2'));
const service = accessory.addService(Service.Lightbulb, 'Rate Limited Light');
service.addCharacteristic(Characteristic.Brightness);

const wrapped = wrapService(service);

// Rate limit to 3 calls per second
wrapped.characteristics.brightness
.limit(3, 1000)
.onSet(async (value) => {
console.log(`  Handler processing value: ${value}`);
// Your business logic here
});

console.log('✓ Rate limiter configured on onSet handler');
console.log('  HomeKit updates will be rate limited to 3 per second');
}

// Example 3: Value Clamping on onSet
console.log('\n=== Example 3: Value Clamping on onSet ===');
{
const accessory = new Accessory('Light', uuid.generate('light-3'));
const service = accessory.addService(Service.Lightbulb, 'Clamped Light');
service.addCharacteristic(Characteristic.Brightness);

const wrapped = wrapService(service);

// Clamp brightness to 0-100 before handler receives it
wrapped.characteristics.brightness
.clamp(0, 100)
.onSet(async (value) => {
console.log(`  Handler received clamped value: ${value}`);
// Value will always be 0-100, even if HomeKit sends out-of-range
});

console.log('✓ Clamping configured - handler will only receive 0-100 values');
}

// Example 4: Value Transformation on onSet
console.log('\n=== Example 4: Value Transformation on onSet ===');
{
const accessory = new Accessory('Light', uuid.generate('light-4'));
const service = accessory.addService(Service.Lightbulb, 'Rounded Light');
service.addCharacteristic(Characteristic.Brightness);

const wrapped = wrapService(service);

// Transform value (e.g., round floating point numbers)
wrapped.characteristics.brightness
.transform((v) => Math.round(v as number))
.onSet(async (value) => {
console.log(`  Handler received rounded value: ${value}`);
// Value will always be an integer
});

console.log('✓ Value transformation configured - handler receives rounded values');
}

// Example 5: Audit Trail
console.log('\n=== Example 5: Audit Trail ===');
{
const accessory = new Accessory('Lock', uuid.generate('lock-1'));
const service = accessory.addService(Service.LockMechanism, 'Front Door');

const wrapped = wrapService(service);

// Track all lock state changes with audit trail
wrapped.characteristics.lockTargetState
.audit()
.onSet(async (value) => {
const state = value === 1 ? 'LOCKED' : 'UNLOCKED';
console.log(`  Handler: setting lock to ${state}`);
});

console.log('✓ Audit trail configured - all operations logged');
}

// Example 6: Fluent Chaining Multiple Interceptors
console.log('\n=== Example 6: Fluent Chaining ===');
{
const accessory = new Accessory('Light', uuid.generate('light-6'));
const service = accessory.addService(Service.Lightbulb, 'Smart Light');
service.addCharacteristic(Characteristic.Brightness);

const wrapped = wrapService(service);

// Chain multiple interceptors using fluent API
wrapped.characteristics.brightness
.log()
.transform((v) => Math.round(v as number))
.clamp(0, 100)
.limit(5, 1000)
.onSet(async (value) => {
console.log(`  Handler received: ${value}`);
// Value has been logged, rounded, clamped, and rate-limited
});

console.log('✓ Multiple interceptors chained: log → transform → clamp → limit');
}

// Example 7: Combining with Validation
console.log('\n=== Example 7: Interceptors + Validation ===');
{
const accessory = new Accessory('Light', uuid.generate('light-7'));
const service = accessory.addService(Service.Lightbulb, 'Validated Light');
service.addCharacteristic(Characteristic.Brightness);

const wrapped = wrapService(service);

// Add validation first
const { RangeValidator } = await import('../src/validation.js');
wrapped.characteristics.brightness.addValidator(
new RangeValidator(0, 100, 'Brightness')
);

// Then add interceptors
wrapped.characteristics.brightness
.log()
.onSet(async (value) => {
console.log(`  Handler: validated value ${value}`);
// Value has been validated AND intercepted
});

console.log('✓ Validation runs after interceptors transform, before user handler');
}

console.log('\n=== All Interceptor Examples Complete ===');
console.log('\nKey Takeaways:');
console.log('1. Standard interceptors: log(), limit(), clamp(), transform(), audit()');
console.log('2. All methods are chainable for fluent composition');
console.log('3. Interceptors wrap onSet/onGet handlers');
console.log('4. Execution order: beforeSet → validation → handler → afterSet');
console.log('5. Opt-in: No impact on direct set() calls or default behavior');
