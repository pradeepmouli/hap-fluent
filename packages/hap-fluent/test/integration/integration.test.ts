import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AccessoryHandler, createServicesObject } from '../../src/AccessoryHandler.js';
import { wrapService } from '../../src/FluentService.js';
import {
	MockService,
	MockPlatformAccessory,
	MockCharacteristic,
	createMockLightbulbService,
	createMockSwitchService,
	createMockThermostatService,
	Switch,
} from '../mocks/homebridge.mock.js';

describe('Integration Tests', () => {
	let mockAccessory: MockPlatformAccessory;
	let mockPlugin: any;

	beforeEach(() => {
		mockAccessory = new MockPlatformAccessory('Test Device', 'test-uuid-123');
		mockPlugin = {
			log: {
				info: vi.fn(),
				error: vi.fn(),
				warn: vi.fn(),
				debug: vi.fn(),
			},
		};
	});

	describe('End-to-End Lightbulb Control', () => {
		it('should control a lightbulb through the full stack', async () => {
			const lightbulbService = createMockLightbulbService();
			mockAccessory.addService(lightbulbService);

			const handler = new AccessoryHandler(mockPlugin, mockAccessory as any);
			const services = createServicesObject(lightbulbService as any) as any;

			// Turn on the lightbulb
			services.Lightbulb.characteristics.on.set(true);
			expect(lightbulbService.characteristics[0].value).toBe(true);

			// Set brightness
			services.Lightbulb.characteristics.brightness.set(75);
			expect(lightbulbService.characteristics[1].value).toBe(75);

			// Set hue
			services.Lightbulb.characteristics.hue.set(180);
			expect(lightbulbService.characteristics[2].value).toBe(180);

			// Set saturation
			services.Lightbulb.characteristics.saturation.set(50);
			expect(lightbulbService.characteristics[3].value).toBe(50);
		});

		it('should handle get/set handlers on lightbulb', async () => {
			const lightbulbService = createMockLightbulbService();
			mockAccessory.addService(lightbulbService);

			const services = createServicesObject(lightbulbService as any) as any;

			let deviceState = false;
			const getHandler = vi.fn(async () => deviceState);
			const setHandler = vi.fn(async (value: boolean) => {
				deviceState = value;
			});

			services.Lightbulb.characteristics.on.onGet(getHandler).onSet(setHandler);

			// Test get
			const value = await lightbulbService.characteristics[0].handleGet();
			expect(getHandler).toHaveBeenCalled();
			expect(value).toBe(false);

			// Test set
			await lightbulbService.characteristics[0].handleSet(true);
			expect(setHandler).toHaveBeenCalledWith(true);
			expect(deviceState).toBe(true);

			// Test get after set
			const newValue = await lightbulbService.characteristics[0].handleGet();
			expect(newValue).toBe(true);
		});
	});

	describe('Multi-Service Accessory', () => {
		it('should handle accessory with multiple services', () => {
			const lightbulbService = createMockLightbulbService();
			const switchService = createMockSwitchService();

			mockAccessory.addService(lightbulbService);
			mockAccessory.addService(switchService);

			const handler = new AccessoryHandler(mockPlugin, mockAccessory as any);
			expect(mockAccessory.services).toHaveLength(2);
		});

		it('should maintain independent state for each service', () => {
			const service1 = createMockSwitchService();
			const service2 = new Switch();
			service2.subtype = 'outlet2';
			service2.addCharacteristic(new MockCharacteristic('On', 'on-uuid'));

			mockAccessory.addService(service1);
			mockAccessory.addService(service2);

			const services = createServicesObject(service1 as any, service2 as any);

			// Set different values for each service
			service1.characteristics[0].value = true;
			service2.characteristics[0].value = false;

			expect(service1.characteristics[0].value).toBe(true);
			expect(service2.characteristics[0].value).toBe(false);
		});

		it('should handle complex multi-service initialization', async () => {
			const lightbulbService = createMockLightbulbService();
			const thermostatService = createMockThermostatService();

			mockAccessory.addService(lightbulbService);
			mockAccessory.addService(thermostatService);

			const handler = new AccessoryHandler(mockPlugin, mockAccessory as any);

			await handler.initialize({
				lightbulb: {
					on: true,
					brightness: 80,
				},
			} as any);

			// Should have 2+ services (lightbulb, thermostat, possibly AccessoryInformation)
			expect(mockAccessory.services.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe('Thermostat Control', () => {
		it('should control thermostat through full stack', async () => {
			const thermostatService = createMockThermostatService();
			mockAccessory.addService(thermostatService);

			const services = createServicesObject(thermostatService as any);

			// Set target temperature
			services.thermostat.characteristics.targetTemperature.set(22);
			expect(thermostatService.characteristics[3].value).toBe(22);

			// Set current temperature
			services.thermostat.characteristics.currentTemperature.set(20);
			expect(thermostatService.characteristics[2].value).toBe(20);
		});

		it('should handle thermostat state changes with handlers', async () => {
			const thermostatService = createMockThermostatService();
			mockAccessory.addService(thermostatService);

			const services = createServicesObject(thermostatService as any);

			let targetTemp = 20;
			const getHandler = vi.fn(async () => targetTemp);
			const setHandler = vi.fn(async (value: number) => {
				targetTemp = value;
			});

			services.thermostat.characteristics.targetTemperature
				.onGet(getHandler)
				.onSet(setHandler);

			// Test initial get
			const temp = await thermostatService.characteristics[3].handleGet();
			expect(getHandler).toHaveBeenCalled();
			expect(temp).toBe(20);

			// Test set
			await thermostatService.characteristics[3].handleSet(24);
			expect(setHandler).toHaveBeenCalledWith(24);
			expect(targetTemp).toBe(24);
		});
	});

	describe('Property Chaining and Updates', () => {
		it('should support complex chaining across services', () => {
			const lightbulbService = createMockLightbulbService();
			mockAccessory.addService(lightbulbService);

			const services = createServicesObject(lightbulbService as any);

			// Complex chaining
			services.lightbulb.characteristics.on
				.set(true)
				.setProps({ minValue: 0, maxValue: 1 });

			services.lightbulb.characteristics.brightness
				.set(50)
				.setProps({ minValue: 0, maxValue: 100, minStep: 1 })
				.update(75);

			expect(lightbulbService.characteristics[0].value).toBe(true);
			expect(lightbulbService.characteristics[1].value).toBe(75);
		});

		it('should update multiple characteristics atomically', () => {
			const lightbulbService = createMockLightbulbService();
			mockAccessory.addService(lightbulbService);

			const services = createServicesObject(lightbulbService as any);

			// Simulate scene activation
			services.lightbulb.update('on' as any, true);
			services.lightbulb.update('brightness' as any, 100);
			services.lightbulb.update('hue' as any, 0);
			services.lightbulb.update('saturation' as any, 100);

			expect(lightbulbService.characteristics[0].value).toBe(true);
			expect(lightbulbService.characteristics[1].value).toBe(100);
			expect(lightbulbService.characteristics[2].value).toBe(0);
			expect(lightbulbService.characteristics[3].value).toBe(100);
		});
	});

	describe('Context Management', () => {
		it('should maintain context across accessory lifecycle', async () => {
			mockAccessory.context = {
				deviceId: 'ABC123',
				firmwareVersion: '1.2.3',
				customData: { key: 'value' },
			};

			const handler = new AccessoryHandler(mockPlugin, mockAccessory as any);

			expect(handler.context.deviceId).toBe('ABC123');
			expect(handler.context.firmwareVersion).toBe('1.2.3');
			expect(handler.context.customData).toEqual({ key: 'value' });

			await handler.initialize();

			expect(handler.context.deviceId).toBe('ABC123');
		});

		it('should allow context modifications', () => {
			mockAccessory.context = { count: 0 };
			const handler = new AccessoryHandler(mockPlugin, mockAccessory as any);

			handler.context.count++;
			expect(handler.context.count).toBe(1);

			handler.context.count = 5;
			expect(mockAccessory.context.count).toBe(5);
		});
	});

	describe('Dynamic Service Addition', () => {
		it('should add services dynamically during runtime', () => {
			const handler = new AccessoryHandler(mockPlugin, mockAccessory as any);

			class DynamicService extends MockService {
				static UUID = 'dynamic-service-uuid';
				constructor(displayName?: string, UUID?: string, subtype?: string) {
					super(displayName, UUID, subtype);
					this.addCharacteristic(new MockCharacteristic('Status', 'status-uuid'));
				}
			}

			const service1 = handler.addService(DynamicService as any, 'Service 1');
			expect(mockAccessory.services).toHaveLength(1);

			const service2 = handler.addService(DynamicService as any, 'Service 2', 'subtype1');
			expect(mockAccessory.services).toHaveLength(2);

			expect(service1.characteristics).toBeDefined();
			expect(service2.characteristics).toBeDefined();
		});
	});

	describe('Error Recovery', () => {
		it('should handle handler errors gracefully', async () => {
			const lightbulbService = createMockLightbulbService();
			mockAccessory.addService(lightbulbService);

			const services = createServicesObject(lightbulbService as any);

			const errorHandler = vi.fn(async () => {
				throw new Error('Device communication failed');
			});

			services.lightbulb.characteristics.on.onGet(errorHandler);

			await expect(lightbulbService.characteristics[0].handleGet()).rejects.toThrow(
				'Device communication failed'
			);
		});

		it('should allow recovery after handler error', async () => {
			const lightbulbService = createMockLightbulbService();
			mockAccessory.addService(lightbulbService);

			const services = createServicesObject(lightbulbService as any);

			let shouldError = true;
			const conditionalHandler = vi.fn(async () => {
				if (shouldError) {
					throw new Error('Temporary failure');
				}
				return true;
			});

			services.lightbulb.characteristics.on.onGet(conditionalHandler);

			// First call fails
			await expect(lightbulbService.characteristics[0].handleGet()).rejects.toThrow();

			// Fix the issue
			shouldError = false;

			// Second call succeeds
			const value = await lightbulbService.characteristics[0].handleGet();
			expect(value).toBe(true);
		});
	});

	describe('Real-world Scenarios', () => {
		it('should simulate smart light automation', async () => {
			const lightbulbService = createMockLightbulbService();
			mockAccessory.addService(lightbulbService);

			const services = createServicesObject(lightbulbService as any);

			// Simulate evening scene
			const setEveningScene = () => {
				services.lightbulb.update('on' as any, true);
				services.lightbulb.update('brightness' as any, 60);
				services.lightbulb.update('hue' as any, 30); // Warm orange
				services.lightbulb.update('saturation' as any, 80);
			};

			setEveningScene();

			expect(lightbulbService.characteristics[0].value).toBe(true);
			expect(lightbulbService.characteristics[1].value).toBe(60);
			expect(lightbulbService.characteristics[2].value).toBe(30);
			expect(lightbulbService.characteristics[3].value).toBe(80);
		});

		it('should simulate climate control automation', async () => {
			const thermostatService = createMockThermostatService();
			mockAccessory.addService(thermostatService);

			const services = createServicesObject(thermostatService as any);

			// Simulate temperature monitoring and adjustment
			let currentTemp = 18;
			let targetTemp = 22;

			services.thermostat.characteristics.currentTemperature.onGet(
				async () => currentTemp
			);
			services.thermostat.characteristics.targetTemperature
				.onGet(async () => targetTemp)
				.onSet(async (value: number) => {
					targetTemp = value;
				});

			// Get initial temps
			const current = await thermostatService.characteristics[2].handleGet();
			expect(current).toBe(18);

			// Adjust target
			await thermostatService.characteristics[3].handleSet(24);
			expect(targetTemp).toBe(24);

			// Simulate heating (temperature rises)
			currentTemp = 20;
			const newCurrent = await thermostatService.characteristics[2].handleGet();
			expect(newCurrent).toBe(20);
		});

		it('should handle multi-outlet power strip', () => {
			// Create 4 switch services for a power strip
			const outlets = Array.from({ length: 4 }, (_, i) => {
				const outlet = new MockService('Switch', 'switch-uuid', `outlet${i + 1}`);
				outlet.addCharacteristic(new MockCharacteristic('On', 'on-uuid'));
				return outlet;
			});

			outlets.forEach((outlet) => mockAccessory.addService(outlet));

			const handler = new AccessoryHandler(mockPlugin, mockAccessory as any);
			expect(mockAccessory.services).toHaveLength(4);

			// Turn on outlets 1 and 3
			outlets[0].characteristics[0].value = true;
			outlets[2].characteristics[0].value = true;

			expect(outlets[0].characteristics[0].value).toBe(true);
			expect(outlets[1].characteristics[0].value).toBeUndefined();
			expect(outlets[2].characteristics[0].value).toBe(true);
			expect(outlets[3].characteristics[0].value).toBeUndefined();
		});
	});
});
