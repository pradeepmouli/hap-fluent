// Usage Examples for HAP Fluent API
// These examples demonstrate the improved type-safe fluent interface

import { wrapService, createFluentServices } from '../src/index.js';
import { Service } from 'homebridge';

// Example 1: Basic Service Creation and Usage
export function basicUsageExample() {
	// Create an AccessoryInformation service with proper typing
	const accessoryInfo = wrapService(new Service.AccessoryInformation(), {
		displayName: 'My RabbitAir Purifier',
		enableLogging: true,
		logPrefix: '[RabbitAir]'
	});

	// Set up characteristic handlers with strong typing
	accessoryInfo
		.onCharacteristicGet('manufacturer', () => 'RabbitAir')
		.onCharacteristicGet('model', () => 'MinusA2')
		.onCharacteristicGet('serialNumber', () => 'RA-12345')
		.onCharacteristicGet('firmwareRevision', () => '1.0.4');

	// Update characteristics with type safety
	accessoryInfo.updateCharacteristic('name', 'Living Room Air Purifier');

	return accessoryInfo;
}




// Example 2: Air Purifier Service with Validation
export function airPurifierExample() {
	const airPurifier = createFluentService('AirPurifier', {
		displayName: 'RabbitAir Purifier'
	});

	// Add validators for characteristics
	airPurifier
		.setValidator('rotationSpeed', (speed) => {
			if (speed < 0 || speed > 100) {
				return 'Rotation speed must be between 0 and 100';
			}
			return true;
		})
		.setValidator('active', (active) => {
			return active === 0 || active === 1;
		});

	// Set up handlers with validation
	airPurifier
		.onCharacteristicGet('active', async () => {
			// Simulate getting current state from device
			return 1; // Active
		})
		.onCharacteristicSet('active', async (value) => {
			console.log(`Setting purifier active state to: ${value}`);
			// Send command to device
		})
		.onCharacteristicGet('currentAirPurifierState', () => {
			return 2; // Purifying
		})
		.onCharacteristicSet('targetAirPurifierState', async (value) => {
			console.log(`Setting target purifier state to: ${value}`);
		});

	return airPurifier;
}

// Example 3: Multiple Services with Event Handling
export function multipleServicesExample() {
	const services = createFluentServices([
		{ name: 'AccessoryInformation', config: { displayName: 'Info Service' } },
		{ name: 'AirPurifier', config: { displayName: 'Purifier Service' } },
		{ name: 'AirQualitySensor', config: { displayName: 'Quality Sensor' } },
		{ name: 'FilterMaintenance', config: { displayName: 'Filter Service' } }
	]);

	// Set up cross-service event handling
	services.AirPurifier
		.onCharacteristicChange('active', (newValue, oldValue) => {
			console.log(`Air purifier active changed: ${oldValue} -> ${newValue}`);

			// Update air quality sensor based on purifier state
			if (newValue === 1) {
				services.AirQualitySensor.updateCharacteristic('statusActive', true);
			} else {
				services.AirQualitySensor.updateCharacteristic('statusActive', false);
			}
		})
		.onCharacteristicChange('rotationSpeed', (newValue) => {
			console.log(`Rotation speed changed to: ${newValue}%`);
		});

	// Set up filter maintenance monitoring
	services.FilterMaintenance
		.onCharacteristicGet('filterLifeLevel', () => {
			// Calculate filter life based on usage
			return 75; // 75% remaining
		})
		.onCharacteristicGet('filterChangeIndication', () => {
			return 0; // Filter OK
		});

	return services;
}

// Example 4: Advanced Usage with Custom Logic
export function advancedUsageExample() {
	const purifier = createFluentService('AirPurifier');
	const qualitySensor = createFluentService('AirQualitySensor');

	// Simulate device state
	let deviceState = {
		power: false,
		speed: 0,
		mode: 'auto',
		airQuality: 1, // Good
		pm25: 12
	};

	// Set up complex state management
	purifier
		.onCharacteristicGet('active', () => deviceState.power ? 1 : 0)
		.onCharacteristicSet('active', async (value) => {
			deviceState.power = value === 1;

			// Update related characteristics
			if (deviceState.power) {
				purifier.updateCharacteristic('currentAirPurifierState', 2); // Purifying
				qualitySensor.updateCharacteristic('statusActive', true);
			} else {
				purifier.updateCharacteristic('currentAirPurifierState', 0); // Inactive
				qualitySensor.updateCharacteristic('statusActive', false);
			}
		})
		.onCharacteristicGet('rotationSpeed', () => deviceState.speed)
		.onCharacteristicSet('rotationSpeed', async (value) => {
			deviceState.speed = value;

			// Adjust device mode based on speed
			if (value === 0) {
				deviceState.mode = 'off';
			} else if (value <= 33) {
				deviceState.mode = 'low';
			} else if (value <= 66) {
				deviceState.mode = 'medium';
			} else {
				deviceState.mode = 'high';
			}

			console.log(`Device mode set to: ${deviceState.mode}`);
		});

	// Set up air quality monitoring
	qualitySensor
		.onCharacteristicGet('airQuality', () => deviceState.airQuality)
		.onCharacteristicGet('pm25Density', () => deviceState.pm25);

	// Simulate periodic air quality updates
	setInterval(() => {
		// Simulate air quality changes
		deviceState.pm25 = Math.floor(Math.random() * 50) + 10; // 10-60 μg/m³

		// Determine air quality level based on PM2.5
		if (deviceState.pm25 <= 12) {
			deviceState.airQuality = 1; // Excellent
		} else if (deviceState.pm25 <= 35) {
			deviceState.airQuality = 2; // Good
		} else if (deviceState.pm25 <= 55) {
			deviceState.airQuality = 3; // Fair
		} else {
			deviceState.airQuality = 4; // Inferior
		}

		// Update characteristics
		qualitySensor
			.updateCharacteristic('pm25Density', deviceState.pm25)
			.updateCharacteristic('airQuality', deviceState.airQuality);
	}, 30000); // Update every 30 seconds

	return { purifier, qualitySensor };
}

// Example 5: Error Handling and Validation
export function errorHandlingExample() {
	const service = createFluentService('AirPurifier');

	// Add comprehensive validation
	service
		.setValidator('rotationSpeed', (speed) => {
			if (typeof speed !== 'number') {
				return 'Rotation speed must be a number';
			}
			if (speed < 0 || speed > 100) {
				return 'Rotation speed must be between 0 and 100';
			}
			if (!Number.isInteger(speed)) {
				return 'Rotation speed must be an integer';
			}
			return true;
		})
		.setValidator('active', (active) => {
			if (active !== 0 && active !== 1) {
				return 'Active state must be 0 (inactive) or 1 (active)';
			}
			return true;
		});

	// Set up error handling in callbacks
	service
		.onCharacteristicSet('rotationSpeed', async (value) => {
			try {
				// Simulate device communication that might fail
				if (Math.random() < 0.1) { // 10% chance of failure
					throw new Error('Device communication failed');
				}

				console.log(`Successfully set rotation speed to ${value}`);
			} catch (error) {
				console.error('Failed to set rotation speed:', error);
				throw error; // Re-throw to trigger HomeKit error
			}
		})
		.onCharacteristicGet('currentAirPurifierState', async () => {
			try {
				// Simulate getting state from device
				await new Promise(resolve => setTimeout(resolve, 100));
				return 2; // Purifying
			} catch (error) {
				console.error('Failed to get purifier state:', error);
				return 0; // Default to inactive on error
			}
		});

	return service;
}

// Type-safe usage demonstration
export function typeSafetyDemo() {
	const service = createFluentService('AirPurifier');

	// All of these are type-safe and will provide IntelliSense
	service.onCharacteristicGet('active', () => 1);
	service.onCharacteristicGet('currentAirPurifierState', () => 2);
	service.onCharacteristicGet('targetAirPurifierState', () => 1);
	service.onCharacteristicGet('rotationSpeed', () => 50);

	// These would cause TypeScript errors if uncommented:
	// service.onCharacteristicGet('invalidCharacteristic', () => 'test'); // Error: invalid characteristic
	// service.onCharacteristicGet('active', () => 'invalid'); // Error: wrong return type
	// service.updateCharacteristic('rotationSpeed', 'not a number'); // Error: wrong value type

	return service;
}