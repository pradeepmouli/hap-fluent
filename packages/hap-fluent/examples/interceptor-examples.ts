/**
 * Interceptor Examples for HAP Fluent
 * 
 * Demonstrates the fluent/decorator approach for extending characteristic behavior.
 * Interceptors provide a cleaner, more idiomatic API than middleware for TypeScript.
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

// Example 1: Basic Logging Interceptor
console.log('=== Example 1: Logging Interceptor ===');
{
	const accessory = new Accessory('Light', uuid.generate('light-1'));
	const service = accessory.addService(Service.Lightbulb, 'My Light');
	service.addCharacteristic(Characteristic.Brightness);
	
	const wrapped = wrapService(service);
	
	// Add logging to all operations
	wrapped.characteristics.brightness.intercept(createLoggingInterceptor());
	
	await wrapped.characteristics.brightness.setAsync(75);
	console.log('✓ Set brightness to 75 (check logs above)');
	
	const value = await wrapped.characteristics.brightness.get();
	console.log(`✓ Current brightness: ${value}`);
}

// Example 2: Rate Limiting
console.log('\n=== Example 2: Rate Limiting ===');
{
	const accessory = new Accessory('Light', uuid.generate('light-2'));
	const service = accessory.addService(Service.Lightbulb, 'Rate Limited Light');
	service.addCharacteristic(Characteristic.Brightness);
	
	const wrapped = wrapService(service);
	
	// Allow max 3 updates per second
	wrapped.characteristics.brightness.intercept(
		createRateLimitInterceptor(3, 1000)
	);
	
	try {
		await wrapped.characteristics.brightness.setAsync(10);
		await wrapped.characteristics.brightness.setAsync(20);
		await wrapped.characteristics.brightness.setAsync(30);
		console.log('✓ First 3 updates succeeded');
		
		await wrapped.characteristics.brightness.setAsync(40);
		console.log('✗ 4th update should have been rate limited');
	} catch (error) {
		console.log('✓ 4th update blocked by rate limit:', error.message);
	}
}

// Example 3: Value Clamping
console.log('\n=== Example 3: Value Clamping ===');
{
	const accessory = new Accessory('Light', uuid.generate('light-3'));
	const service = accessory.addService(Service.Lightbulb, 'Clamped Light');
	service.addCharacteristic(Characteristic.Brightness);
	
	const wrapped = wrapService(service);
	
	// Clamp brightness to 0-100
	wrapped.characteristics.brightness.intercept(
		createClampingInterceptor(0, 100)
	);
	
	await wrapped.characteristics.brightness.setAsync(150);
	const value1 = await wrapped.characteristics.brightness.get();
	console.log(`✓ Value 150 clamped to: ${value1}`);
	
	await wrapped.characteristics.brightness.setAsync(-10);
	const value2 = await wrapped.characteristics.brightness.get();
	console.log(`✓ Value -10 clamped to: ${value2}`);
}

// Example 4: Value Transformation
console.log('\n=== Example 4: Value Transformation ===');
{
	const accessory = new Accessory('Light', uuid.generate('light-4'));
	const service = accessory.addService(Service.Lightbulb, 'Rounded Light');
	service.addCharacteristic(Characteristic.Brightness);
	
	const wrapped = wrapService(service);
	
	// Round all brightness values
	wrapped.characteristics.brightness.intercept(
		createTransformInterceptor((v) => Math.round(v as number))
	);
	
	await wrapped.characteristics.brightness.setAsync(75.7);
	const value1 = await wrapped.characteristics.brightness.get();
	console.log(`✓ Value 75.7 rounded to: ${value1}`);
	
	await wrapped.characteristics.brightness.setAsync(25.3);
	const value2 = await wrapped.characteristics.brightness.get();
	console.log(`✓ Value 25.3 rounded to: ${value2}`);
}

// Example 5: Audit Trail
console.log('\n=== Example 5: Audit Trail ===');
{
	const accessory = new Accessory('Light', uuid.generate('light-5'));
	const service = accessory.addService(Service.Lightbulb, 'Audited Light');
	service.addCharacteristic(Characteristic.Brightness);
	
	const wrapped = wrapService(service);
	
	const auditLog: any[] = [];
	wrapped.characteristics.brightness.intercept(
		createAuditInterceptor((event) => {
			auditLog.push({
				...event,
				time: new Date(event.timestamp).toISOString(),
			});
		})
	);
	
	await wrapped.characteristics.brightness.setAsync(50);
	await wrapped.characteristics.brightness.get();
	await wrapped.characteristics.brightness.setAsync(75);
	
	console.log('✓ Audit log entries:');
	auditLog.forEach((entry, i) => {
		console.log(`  ${i + 1}. ${entry.type}: value=${entry.value} at ${entry.time}`);
	});
}

// Example 6: Composite Interceptors (Fluent Chaining)
console.log('\n=== Example 6: Fluent Chaining ===');
{
	const accessory = new Accessory('Light', uuid.generate('light-6'));
	const service = accessory.addService(Service.Lightbulb, 'Smart Light');
	service.addCharacteristic(Characteristic.Brightness);
	
	const wrapped = wrapService(service);
	
	// Chain multiple interceptors using fluent API
	wrapped.characteristics.brightness
		.intercept(createLoggingInterceptor())
		.intercept(createTransformInterceptor((v) => Math.round(v as number)))
		.intercept(createClampingInterceptor(0, 100))
		.intercept(createRateLimitInterceptor(5, 1000));
	
	await wrapped.characteristics.brightness.setAsync(75.7);
	console.log('✓ Value processed through all interceptors');
	console.log('  75.7 → rounded to 76 → clamped (no change) → rate limited (OK)');
}

// Example 7: Custom Interceptor (Decorator Pattern)
console.log('\n=== Example 7: Custom Interceptor ===');
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
	
	wrapped.characteristics.targetTemperature.intercept(customInterceptor);
	
	await wrapped.characteristics.targetTemperature.setAsync(22);
	await wrapped.characteristics.targetTemperature.get();
	console.log('✓ Custom interceptor called for all operations');
}

// Example 8: Combining with Validation
console.log('\n=== Example 8: Interceptors + Validation ===');
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
		.intercept(createAuditInterceptor((e) => console.log(`  Audit: ${e.type}`)));
	
	try {
		await wrapped.characteristics.brightness.setAsync(50);
		console.log('✓ Valid value passed validation and interceptors');
		
		await wrapped.characteristics.brightness.setAsync(150);
		console.log('✗ Should have been rejected by validator');
	} catch (error) {
		console.log('✓ Invalid value rejected by validator before interceptors');
	}
}

// Example 9: Conditional Interceptors
console.log('\n=== Example 9: Dynamic Interceptors ===');
{
	const accessory = new Accessory('Fan', uuid.generate('fan-1'));
	const service = accessory.addService(Service.Fan, 'Smart Fan');
	service.addCharacteristic(Characteristic.RotationSpeed);
	
	const wrapped = wrapService(service);
	
	console.log('Phase 1: No rate limiting');
	await wrapped.characteristics.rotationSpeed.setAsync(10);
	await wrapped.characteristics.rotationSpeed.setAsync(20);
	await wrapped.characteristics.rotationSpeed.setAsync(30);
	console.log('✓ All updates succeeded');
	
	console.log('\nPhase 2: Add rate limiting');
	wrapped.characteristics.rotationSpeed.intercept(
		createRateLimitInterceptor(2, 1000)
	);
	
	try {
		await wrapped.characteristics.rotationSpeed.setAsync(40);
		await wrapped.characteristics.rotationSpeed.setAsync(50);
		await wrapped.characteristics.rotationSpeed.setAsync(60);
		console.log('✗ Should have been rate limited');
	} catch (error) {
		console.log('✓ Rate limit now enforced');
	}
	
	console.log('\nPhase 3: Remove interceptors');
	wrapped.characteristics.rotationSpeed.clearInterceptors();
	
	await wrapped.characteristics.rotationSpeed.setAsync(70);
	await wrapped.characteristics.rotationSpeed.setAsync(80);
	await wrapped.characteristics.rotationSpeed.setAsync(90);
	console.log('✓ All updates succeeded after clearing interceptors');
}

// Example 10: Composite Interceptor
console.log('\n=== Example 10: Composite Interceptor ===');
{
	const accessory = new Accessory('Light', uuid.generate('light-8'));
	const service = accessory.addService(Service.Lightbulb, 'Composite Light');
	service.addCharacteristic(Characteristic.Brightness);
	
	const wrapped = wrapService(service);
	
	// Create a single composite interceptor
	const composite = createCompositeInterceptor([
		createTransformInterceptor((v) => Math.round(v as number)),
		createClampingInterceptor(0, 100),
		createLoggingInterceptor(),
		createAuditInterceptor((e) => console.log(`  Audit: ${e.type} = ${e.value}`)),
	]);
	
	wrapped.characteristics.brightness.intercept(composite);
	
	await wrapped.characteristics.brightness.setAsync(75.7);
	console.log('✓ Single composite interceptor with multiple behaviors');
}

// Example 11: Error Handling
console.log('\n=== Example 11: Error Handling ===');
{
	const accessory = new Accessory('Light', uuid.generate('light-9'));
	const service = accessory.addService(Service.Lightbulb, 'Error Light');
	service.addCharacteristic(Characteristic.Brightness);
	
	const wrapped = wrapService(service);
	
	const errorLog: string[] = [];
	wrapped.characteristics.brightness.intercept({
		beforeSet(value, context) {
			if ((value as number) > 100) {
				throw new Error('Value too high!');
			}
			return value;
		},
		onError(error, context) {
			errorLog.push(`Error caught: ${error.message}`);
		},
	});
	
	try {
		await wrapped.characteristics.brightness.setAsync(150);
	} catch (error) {
		// Error is logged by interceptor
	}
	
	console.log('✓ Error logged by interceptor:', errorLog[0]);
}

console.log('\n=== All Interceptor Examples Complete ===');
console.log('\nKey Takeaways:');
console.log('1. Fluent API: characteristic.intercept(...).intercept(...)');
console.log('2. Decorator Pattern: Pass custom objects with hooks');
console.log('3. Composable: Combine multiple interceptors');
console.log('4. Opt-in: No impact on default behavior');
console.log('5. Order matters: Interceptors run in sequence');
