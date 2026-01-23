import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	AccessoryHandler,
	createServicesObject,
	wrapAccessory,
	isMultiService,
} from '../../src/AccessoryHandler.js';
import {
	MockService,
	MockPlatformAccessory,
	createMockLightbulbService,
	createMockSwitchService,
	createMockThermostatService,
	MockCharacteristic,
	Switch,
} from '../mocks/homebridge.mock.js';

describe('FluentAccessory', () => {
	let mockAccessory: MockPlatformAccessory;
	let mockPlugin: any;
	let mockApi: any;

	beforeEach(() => {
		mockAccessory = new MockPlatformAccessory('Test Accessory', 'test-uuid');
		mockPlugin = {
			log: {
				info: vi.fn(),
				error: vi.fn(),
				warn: vi.fn(),
				debug: vi.fn(),
			},
		};
		mockApi = {
			hap: {
				Service: {},
			},
		};
	});

	describe('isMultiService()', () => {
		it('should return false for single service state', () => {
			const state = { on: true, brightness: 50 };
			expect(isMultiService(state)).toBe(false);
		});

		it('should return true for multi-service state', () => {
			const state = {
				service1: { on: true },
				service2: { on: false },
			};
			expect(isMultiService(state)).toBe(true);
		});

		it('should return false for empty object', () => {
			const state = {};
			expect(isMultiService(state)).toBe(false);
		});

		it('should return false for single key object', () => {
			const state = { on: true };
			expect(isMultiService(state)).toBe(false);
		});
	});

	describe('createServicesObject()', () => {
		it('should create services object from service instances', () => {
			const lightbulbService = createMockLightbulbService();
			const services = createServicesObject(lightbulbService as any);

			expect(services).toBeDefined();
			expect(services).toHaveProperty('Lightbulb');
		});

		it('should handle multiple services', () => {
			const lightbulbService = createMockLightbulbService();
			const switchService = createMockSwitchService();
			const services = createServicesObject(lightbulbService as any, switchService as any);

			expect(services).toHaveProperty('Lightbulb');
			expect(services).toHaveProperty('Switch');
		});

		it('should wrap services with fluent interface', () => {
			const lightbulbService = createMockLightbulbService();
			const services = createServicesObject(lightbulbService as any) as any;

			expect(services.Lightbulb).toBeDefined();
			expect(services.Lightbulb.characteristics).toBeDefined();
		});

		it('should handle services with subtypes', () => {
			const service1 = new Switch();
			service1.subtype = 'outlet1';
			service1.addCharacteristic(new MockCharacteristic('On', 'on-uuid'));

			const service2 = new Switch();
			service2.subtype = 'outlet2';
			service2.addCharacteristic(new MockCharacteristic('On', 'on-uuid'));

			const services = createServicesObject(service1 as any, service2 as any);

			// Should have Switch property with subtypes
			expect(services).toHaveProperty('Switch');
			expect((services as any).Switch).toHaveProperty('primary');
			expect((services as any).Switch).toHaveProperty('Outlet1');
		});

		it('should handle empty services array', () => {
			const services = createServicesObject();
			expect(services).toBeDefined();
			expect(Object.keys(services)).toHaveLength(0);
		});

		it('should create PascalCase property names', () => {
			const thermostatService = createMockThermostatService();
			const services = createServicesObject(thermostatService as any);

			expect(services).toHaveProperty('Thermostat');
		});
	});

	describe('AccessoryHandler', () => {
		it('should create an AccessoryHandler instance', () => {
			const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);
			expect(handler).toBeInstanceOf(AccessoryHandler);
		});

		it('should expose accessory context', () => {
			mockAccessory.context = { customData: 'test' };
			const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);
			expect(handler.context).toEqual({ customData: 'test' });
		});

		it('should create services object from accessory services', () => {
			const lightbulbService = createMockLightbulbService();
			mockAccessory.addService(lightbulbService);

			const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);
			expect(handler.services).toBeDefined();
		});

		it('should expose the underlying accessory', () => {
			const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);
			expect(handler.accessory).toBe(mockAccessory);
		});

		describe('addService()', () => {
			it('should add a new service to the accessory', () => {
				const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);

				class TestService extends MockService {
					static UUID = 'test-service-uuid';
				}

				const result = handler.with(TestService as any, 'Test Service');
				expect(mockAccessory.services).toHaveLength(1);
				// addService returns the handler itself with updated type
				expect(result).toBeInstanceOf(AccessoryHandler);
			});

			it('should wrap the added service with fluent interface', () => {
				const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);

				class TestService extends MockService {
					static UUID = 'test-service-uuid';
					constructor(displayName?: string, subtype?: string) {
						super(displayName, subtype);
						this.addCharacteristic(new MockCharacteristic('Power', 'power-uuid'));
					}
				}

				const result = handler.with(TestService as any, 'Test Service');
				// The service is now available through services property
				const serviceKey = Object.keys(result.services).find(key => key !== 'accessoryInformation');
				if (serviceKey) {
					const service = (result.services as any)[serviceKey];
					expect(service.characteristics).toBeDefined();
				}
			});

			it('should handle adding service with subtype', () => {
				const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);

				class TestService extends MockService {
					static UUID = 'test-service-uuid';
				}

				handler.with(TestService as any, 'Test Service', 'subtype1');
				expect(mockAccessory.services[0].subtype).toBe('subtype1');
			});
		});

		describe('initialize()', () => {
			it('should initialize with state', () => {
				const lightbulbService = createMockLightbulbService();
				mockAccessory.addService(lightbulbService);

				const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);

				const result = handler.initialize({
					lightbulb: {
						on: true,
						brightness: 50,
					},
				} as any);

				expect(result).toBeDefined();
				expect(result.services).toBeDefined();
			});

			it('should initialize without state', () => {
				const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);
				const result = handler.initialize();
				expect(result).toBeDefined();
			});

			it('should handle empty state object', () => {
				const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);
				const result = handler.initialize({} as any);
				expect(result).toBeDefined();
			});
		});
	});

	describe('AccessoryHandler integration', () => {
		it('should handle multiple services correctly', () => {
			const lightbulbService = createMockLightbulbService();
			const switchService = createMockSwitchService();
			mockAccessory.addService(lightbulbService);
			mockAccessory.addService(switchService);

			const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);
			expect(mockAccessory.services).toHaveLength(2);
		});

		it('should maintain context throughout lifecycle', () => {
			mockAccessory.context = { deviceId: '12345' };
			const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);

			expect(handler.context).toEqual({ deviceId: '12345' });

			handler.initialize();
			expect(handler.context).toEqual({ deviceId: '12345' });
		});

		it('should allow adding services after construction', () => {
			const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);

			class TestService1 extends MockService {
				static UUID = 'test-service-1-uuid';
			}
			class TestService2 extends MockService {
				static UUID = 'test-service-2-uuid';
			}

			handler.with(TestService1 as any, 'Service 1');
			handler.with(TestService2 as any, 'Service 2');

			expect(mockAccessory.services).toHaveLength(2);
		});
	});

	describe('error handling', () => {
		it('should handle accessory with no services', () => {
			const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);
			expect(handler.services).toBeDefined();
			expect(Object.keys(handler.services)).toHaveLength(0);
		});

		it('should handle invalid service class in addService', () => {
			const handler = new AccessoryHandler(mockPlugin, mockAccessory as any, mockApi as any);

			expect(() => {
				handler.with(null as any, 'Invalid Service');
			}).toThrow();
		});
	});
});
