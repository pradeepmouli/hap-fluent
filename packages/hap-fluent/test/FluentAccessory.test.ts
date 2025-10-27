import { expect } from 'chai';
import { PlatformAccessory } from 'homebridge';
import { initializeAccessory, type FluentAccessory } from '../src/AccessoryHandler.js';

describe('FluentAccessory', () => {
    let mockPlatformAccessory: PlatformAccessory;

    beforeEach(() => {
        // Create mock platform accessory
        mockPlatformAccessory = {
            displayName: 'Test Accessory',
            getService: function(serviceClass: any) { return undefined; },
            addService: function(service: any) { return service; },
            services: []
        } as any;
    });

    it('should create a FluentAccessory using initializeAccessory', () => {
        const fluentAccessory = initializeAccessory(mockPlatformAccessory, {});
        expect(fluentAccessory).to.be.an('object');
        expect(fluentAccessory.displayName).to.equal('Test Accessory');
    });

    it('should have platform accessory properties', () => {
        const fluentAccessory = initializeAccessory(mockPlatformAccessory, {});
        expect(fluentAccessory.displayName).to.equal('Test Accessory');
        expect(fluentAccessory.services).to.be.an('array');
    });

    it('should initialize with empty state object', () => {
        const fluentAccessory = initializeAccessory(mockPlatformAccessory, {});
        expect(fluentAccessory).to.be.an('object');
    });
});