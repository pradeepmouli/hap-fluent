/**
 * Validation Examples for HAP Fluent
 * 
 * Demonstrates how to use the validation framework to add value constraints
 * to characteristics. All validators are opt-in and don't change default behavior.
 */

import { Service, Characteristic, Accessory, uuid } from 'hap-nodejs';
import { wrapService } from '../src/FluentService.js';
import {
	RangeValidator,
	EnumValidator,
	CompositeValidator,
	createCustomValidator,
	createTransformingValidator,
} from '../src/validation.js';

// Example 1: Basic Range Validation
console.log('=== Example 1: Range Validation ===');
{
	const accessory = new Accessory('Light', uuid.generate('light-1'));
	const service = accessory.addService(Service.Lightbulb, 'My Light');
	service.addCharacteristic(Characteristic.Brightness);
	
	const wrapped = wrapService(service);
	
	// Add brightness validation (0-100)
	wrapped.characteristics.brightness.addValidator(
		new RangeValidator(0, 100, 'Brightness')
	);
	
	try {
		await wrapped.characteristics.brightness.set(75);
		console.log('✓ Valid value 75 accepted');
	} catch (error) {
		console.error('✗ Failed:', error);
	}
	
	try {
		await wrapped.characteristics.brightness.set(150);
		console.log('✗ Invalid value 150 should have been rejected');
	} catch (error) {
		console.log('✓ Invalid value 150 rejected:', error.message);
	}
}

// Example 2: Enum Validation with Labels
console.log('\n=== Example 2: Enum Validation ===');
{
	const accessory = new Accessory('Thermostat', uuid.generate('thermo-1'));
	const service = accessory.addService(Service.Thermostat, 'Climate Control');
	
	const wrapped = wrapService(service);
	
	// Validate heating/cooling state
	wrapped.characteristics.targetHeatingCoolingState.addValidator(
		new EnumValidator(
			[0, 1, 2, 3],
			'TargetHeatingCoolingState',
			{ 0: 'OFF', 1: 'HEAT', 2: 'COOL', 3: 'AUTO' }
		)
	);
	
	try {
		await wrapped.characteristics.targetHeatingCoolingState.set(1); // HEAT
		console.log('✓ Valid state HEAT (1) accepted');
	} catch (error) {
		console.error('✗ Failed:', error);
	}
	
	try {
		await wrapped.characteristics.targetHeatingCoolingState.set(5);
		console.log('✗ Invalid state 5 should have been rejected');
	} catch (error) {
		console.log('✓ Invalid state 5 rejected');
		console.log('  Error message includes labels:', error.message.includes('OFF'));
	}
}

// Example 3: Composite Validators
console.log('\n=== Example 3: Composite Validation ===');
{
	const accessory = new Accessory('Smart Light', uuid.generate('light-2'));
	const service = accessory.addService(Service.Lightbulb, 'RGB Light');
	service.addCharacteristic(Characteristic.Brightness);
	
	const wrapped = wrapService(service);
	
	// Brightness must be 0-100 AND a multiple of 5
	wrapped.characteristics.brightness.addValidator(
		new CompositeValidator([
			new RangeValidator(0, 100, 'Brightness'),
			createCustomValidator(
				(v) => typeof v === 'number' && v % 5 === 0,
				'Brightness must be a multiple of 5'
			),
		])
	);
	
	try {
		await wrapped.characteristics.brightness.set(50);
		console.log('✓ Valid value 50 accepted (in range and multiple of 5)');
	} catch (error) {
		console.error('✗ Failed:', error);
	}
	
	try {
		await wrapped.characteristics.brightness.set(47);
		console.log('✗ Value 47 should have been rejected (not multiple of 5)');
	} catch (error) {
		console.log('✓ Value 47 rejected:', error.message);
	}
}

// Example 4: Custom Validator
console.log('\n=== Example 4: Custom Validator ===');
{
	const accessory = new Accessory('Fan', uuid.generate('fan-1'));
	const service = accessory.addService(Service.Fan, 'Ceiling Fan');
	service.addCharacteristic(Characteristic.RotationSpeed);
	
	const wrapped = wrapService(service);
	
	// Only allow low (33), medium (66), or high (100) speeds
	wrapped.characteristics.rotationSpeed.addValidator(
		createCustomValidator(
			(v) => v === 33 || v === 66 || v === 100,
			'Speed must be Low (33), Medium (66), or High (100)'
		)
	);
	
	try {
		await wrapped.characteristics.rotationSpeed.set(66); // Medium
		console.log('✓ Valid speed 66 (Medium) accepted');
	} catch (error) {
		console.error('✗ Failed:', error);
	}
	
	try {
		await wrapped.characteristics.rotationSpeed.set(50);
		console.log('✗ Speed 50 should have been rejected');
	} catch (error) {
		console.log('✓ Speed 50 rejected:', error.message);
	}
}

// Example 5: Transforming Validator (Clamping)
console.log('\n=== Example 5: Transforming Validator ===');
{
	const accessory = new Accessory('Thermostat', uuid.generate('thermo-2'));
	const service = accessory.addService(Service.Thermostat, 'Smart Thermostat');
	
	const wrapped = wrapService(service);
	
	// Clamp target temperature to valid range (10-35°C)
	wrapped.characteristics.targetTemperature.addValidator(
		createTransformingValidator(
			(v) => typeof v === 'number',
			(v) => Math.max(10, Math.min(35, v as number)),
			'Temperature must be a number'
		)
	);
	
	try {
		await wrapped.characteristics.targetTemperature.set(5); // Below min
		const value = await wrapped.characteristics.targetTemperature.get();
		console.log(`✓ Value 5 clamped to min: ${value}°C`);
	} catch (error) {
		console.error('✗ Failed:', error);
	}
	
	try {
		await wrapped.characteristics.targetTemperature.set(40); // Above max
		const value = await wrapped.characteristics.targetTemperature.get();
		console.log(`✓ Value 40 clamped to max: ${value}°C`);
	} catch (error) {
		console.error('✗ Failed:', error);
	}
}

// Example 6: Multiple Independent Validators
console.log('\n=== Example 6: Multiple Characteristics ===');
{
	const accessory = new Accessory('RGB Light', uuid.generate('light-3'));
	const service = accessory.addService(Service.Lightbulb, 'Color Light');
	service.addCharacteristic(Characteristic.Brightness);
	service.addCharacteristic(Characteristic.Hue);
	service.addCharacteristic(Characteristic.Saturation);
	
	const wrapped = wrapService(service);
	
	// Each characteristic has its own validation
	wrapped.characteristics.brightness.addValidator(
		new RangeValidator(0, 100, 'Brightness')
	);
	
	wrapped.characteristics.hue.addValidator(
		new RangeValidator(0, 360, 'Hue')
	);
	
	wrapped.characteristics.saturation.addValidator(
		new RangeValidator(0, 100, 'Saturation')
	);
	
	try {
		await wrapped.characteristics.brightness.set(75);
		await wrapped.characteristics.hue.set(120); // Green
		await wrapped.characteristics.saturation.set(100);
		console.log('✓ All RGB values set successfully');
		console.log('  Brightness: 75, Hue: 120 (green), Saturation: 100');
	} catch (error) {
		console.error('✗ Failed:', error);
	}
}

// Example 7: Dynamic Validation (Conditional)
console.log('\n=== Example 7: Conditional Validation ===');
{
	const accessory = new Accessory('Light', uuid.generate('light-4'));
	const service = accessory.addService(Service.Lightbulb, 'Dimmable Light');
	service.addCharacteristic(Characteristic.Brightness);
	
	const wrapped = wrapService(service);
	
	// Brightness can be changed, but validator can be added/removed dynamically
	console.log('Phase 1: No validation');
	await wrapped.characteristics.brightness.set(75);
	console.log('✓ Set to 75 without validation');
	
	console.log('\nPhase 2: Add validation');
	wrapped.characteristics.brightness.addValidator(
		new RangeValidator(0, 50, 'Brightness (dimmed mode)')
	);
	
	try {
		await wrapped.characteristics.brightness.set(75);
		console.log('✗ Should have been rejected (> 50)');
	} catch (error) {
		console.log('✓ Value 75 rejected (exceeds dim mode limit of 50)');
	}
	
	await wrapped.characteristics.brightness.set(30);
	console.log('✓ Value 30 accepted in dim mode');
	
	console.log('\nPhase 3: Remove validation');
	wrapped.characteristics.brightness.clearValidators();
	await wrapped.characteristics.brightness.set(75);
	console.log('✓ Set to 75 after removing validation');
}

// Example 8: Color Temperature Validation
console.log('\n=== Example 8: Color Temperature ===');
{
	const accessory = new Accessory('White Light', uuid.generate('light-5'));
	const service = accessory.addService(Service.Lightbulb, 'Tunable White');
	service.addCharacteristic(Characteristic.ColorTemperature);
	
	const wrapped = wrapService(service);
	
	// Color temperature in mireds (140-500, where lower = warmer)
	wrapped.characteristics.colorTemperature.addValidator(
		new RangeValidator(140, 500, 'ColorTemperature')
	);
	
	try {
		await wrapped.characteristics.colorTemperature.set(300); // Neutral
		console.log('✓ Color temperature 300 mireds accepted');
	} catch (error) {
		console.error('✗ Failed:', error);
	}
	
	try {
		await wrapped.characteristics.colorTemperature.set(100); // Too low
		console.log('✗ Should have been rejected');
	} catch (error) {
		console.log('✓ Value 100 rejected (minimum is 140 mireds)');
	}
}

console.log('\n=== All Validation Examples Complete ===');
