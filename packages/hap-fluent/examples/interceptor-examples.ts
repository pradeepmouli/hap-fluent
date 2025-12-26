/**
 * Interceptor Examples for HAP Fluent
 * 
 * Demonstrates the fluent/decorator approach for extending characteristic behavior.
 * Interceptors wrap onSet/onGet handlers, so they apply when HomeKit accesses
 * characteristics, not just during programmatic access.
 * 
 * Key Points:
 * - Interceptors are applied to onSet/onGet handlers
 * - They run when HomeKit accesses the characteristic
 * - HAP-nodejs already handles its own validation/rate-limiting
 * - Our interceptors add custom behavior on top
 */

import { Service, Characteristic, Accessory, uuid } from 'hap-nodejs';
import { wrapService } from '../src/FluentService.js';
import {
	createLoggingInterceptor,
	createRateLimitInterceptor,
	createClampingInterceptor,
	createTransformInterceptor,
	createAuditInterceptor,
	createCompositeInterceptor,
	type Interceptor,
} from '../src/interceptors.js';

// Example 1: Basic Logging Interceptor on onSet
console.log('=== Example 1: Logging Interceptor on onSet ===');
{
	const accessory = new Accessory('Light', uuid.generate('light-1'));
	const service = accessory.addService(Service.Lightbulb, 'My Light');
	service.addCharacteristic(Characteristic.Brightness);
	
	const wrapped = wrapService(service);
	
	// Add interceptor BEFORE setting up onSet handler
	wrapped.characteristics.brightness.intercept(createLoggingInterceptor());
	
	// Set up onSet handler - interceptor will wrap this
	wrapped.characteristics.brightness.onSet(async (value) => {
		console.log(`  Handler received value: ${value}`);
		// Your business logic here
	});
	
	// When HomeKit calls onSet, the interceptor will log before and after
	console.log('✓ Interceptor configured on onSet handler');
	console.log('  When HomeKit sets brightness, logs will appear');
}

// Example 2: Rate Limiting on onSet
console.log('\n=== Example 2: Rate Limiting on onSet ===');
{
	const accessory = new Accessory('Light', uuid.generate('light-2'));
	const service = accessory.addService(Service.Lightbulb, 'Rate Limited Light');
	service.addCharacteristic(Characteristic.Brightness);
	
	const wrapped = wrapService(service);
	
	// Add rate limiting interceptor
	wrapped.characteristics.brightness.intercept(
		createRateLimitInterceptor(3, 1000)
	);
	
	// Set up onSet handler - rate limiting will be enforced
	wrapped.characteristics.brightness.onSet(async (value) => {
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
	wrapped.characteristics.brightness.intercept(
		createClampingInterceptor(0, 100)
	);
	
	wrapped.characteristics.brightness.onSet(async (value) => {
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
	
	// Round all brightness values before handler
	wrapped.characteristics.brightness.intercept(
		createTransformInterceptor((v) => Math.round(v as number))
	);
	
	wrapped.characteristics.brightness.onSet(async (value) => {
		console.log(`  Handler received rounded value: ${value}`);
		// Value will always be an integer
	});
	
	console.log('✓ Transform configured - handler will only receive rounded integers');
}

// Example 5: Fluent Chaining Multiple Interceptors
console.log('\n=== Example 5: Fluent Chaining ===');
{
	const accessory = new Accessory('Light', uuid.generate('light-5'));
	const service = accessory.addService(Service.Lightbulb, 'Smart Light');
	service.addCharacteristic(Characteristic.Brightness);
	
	const wrapped = wrapService(service);
	
	// Chain multiple interceptors using fluent API
	wrapped.characteristics.brightness
		.intercept(createLoggingInterceptor())
		.intercept(createTransformInterceptor((v) => Math.round(v as number)))
		.intercept(createClampingInterceptor(0, 100))
		.intercept(createRateLimitInterceptor(5, 1000))
		.onSet(async (value) => {
			console.log(`  Handler received: ${value}`);
			// Value has been logged, rounded, clamped, and rate-limited
		});
	
	console.log('✓ Multiple interceptors chained before onSet handler');
}

// Example 6: Custom Interceptor (Decorator Pattern)
console.log('\n=== Example 6: Custom Interceptor ===');
{
	const accessory = new Accessory('Thermostat', uuid.generate('thermo-1'));
	const service = accessory.addService(Service.Thermostat, 'Smart Thermostat');
	
	const wrapped = wrapService(service);
	
	// Custom interceptor with all hooks
	const customInterceptor: Interceptor = {
		beforeSet(value, context) {
			console.log(`  Before set: ${context.characteristicName} = ${value}`);
			// Can transform the value
			return value;
		},
		afterSet(value, context) {
			console.log(`  After set: ${context.characteristicName} = ${value}`);
		},
		beforeGet(context) {
			console.log(`  Before get: ${context.characteristicName}`);
		},
		afterGet(value, context) {
			console.log(`  After get: ${context.characteristicName} = ${value}`);
			return value;
		},
		onError(error, context) {
			console.log(`  Error in ${context.characteristicName}: ${error.message}`);
		},
	};
	
	wrapped.characteristics.targetTemperature
		.intercept(customInterceptor)
		.onSet(async (value) => {
			console.log(`  Handler: setting temperature to ${value}`);
		})
		.onGet(async () => {
			return 22; // Current temperature
		});
	
	console.log('✓ Custom interceptor with all hooks configured');
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
		.intercept(createLoggingInterceptor())
		.onSet(async (value) => {
			console.log(`  Handler: validated value ${value}`);
			// Value has been validated AND intercepted
		});
	
	console.log('✓ Validation runs before interceptors in onSet handler');
}

console.log('\n=== All Interceptor Examples Complete ===');
console.log('\nKey Takeaways:');
console.log('1. Interceptors wrap onSet/onGet handlers');
console.log('2. They apply when HomeKit accesses characteristics');
console.log('3. Order: intercept() → onSet/onGet()');
console.log('4. Execution: beforeSet → validator → handler → afterSet');
console.log('5. Opt-in: No impact on direct set() calls or default behavior');

