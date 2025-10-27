import { expect } from 'chai';
import { PlatformAccessory } from 'homebridge';
import { Service } from 'hap-nodejs';
import { getOrAddService, wrapService, type FluentService } from '../src/FluentService.js';

describe('FluentService', () => {
    let mockPlatformAccessory: PlatformAccessory;
    let mockService: InstanceType<typeof Service.Lightbulb>;

    beforeEach(() => {
        // Create mock service
        mockService = {
            displayName: 'Test Lightbulb',
            characteristics: [],
            addCharacteristic: function(characteristic: any) { return this; },
            getCharacteristic: function(characteristic: any) { return characteristic; }
        } as any;

        // Create mock platform accessory
        mockPlatformAccessory = {
            displayName: 'Test Accessory',
            getService: function(serviceClass: any) { return undefined; },
            addService: function(service: any) { 
                this.services = this.services || [];
                this.services.push(service);
                return service; 
            },
            services: []
        } as any;
    });

    it('should wrap an existing service', () => {
        const fluentService = wrapService(mockService);
        expect(fluentService).to.be.an('object');
        expect(fluentService).to.have.property('characteristics');
    });

    it('should have onGet, onSet, and update methods', () => {
        const fluentService = wrapService(mockService);
        expect(fluentService).to.have.property('onGet');
        expect(fluentService).to.have.property('onSet'); 
        expect(fluentService).to.have.property('update');
    });

    it('should get or add service to platform accessory', () => {
        const fluentService = getOrAddService(mockPlatformAccessory, Service.Lightbulb, 'Test Light');
        expect(fluentService).to.be.an('object');
        expect(mockPlatformAccessory.services).to.have.lengthOf(1);
    });

    it('should return existing service if already present', () => {
        // First call should add the service
        const service1 = getOrAddService(mockPlatformAccessory, Service.Lightbulb, 'Test Light');
        
        // Mock getService to return the service
        mockPlatformAccessory.getService = function() { return mockService; };
        
        // Second call should return the existing service
        const service2 = getOrAddService(mockPlatformAccessory, Service.Lightbulb, 'Test Light');
        
        expect(service1).to.be.an('object');
        expect(service2).to.be.an('object');
    });
});