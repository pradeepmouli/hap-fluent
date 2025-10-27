import { expect } from 'chai';
import { Characteristic } from 'homebridge';
import { FluentCharacteristic } from '../src/FluentCharacteristic.js';

describe('FluentCharacteristic', () => {
    let mockCharacteristic: Characteristic;
    let fluentCharacteristic: FluentCharacteristic<number>;

    beforeEach(() => {
        // Create a mock characteristic
        mockCharacteristic = {
            value: undefined,
            setValue: function(value: any) { this.value = value; return this; },
            onGet: function(handler: any) { return this; },
            onSet: function(handler: any) { return this; },
            setProps: function(props: any) { return this; }
        } as any;
        
        fluentCharacteristic = new FluentCharacteristic<number>(mockCharacteristic);
    });

    it('should create an instance of FluentCharacteristic', () => {
        expect(fluentCharacteristic).to.be.instanceOf(FluentCharacteristic);
    });

    it('should get the current value', () => {
        mockCharacteristic.value = 42;
        expect(fluentCharacteristic.get()).to.equal(42);
    });

    it('should set a value using the fluent API', () => {
        const result = fluentCharacteristic.set(42);
        expect(mockCharacteristic.value).to.equal(42);
        expect(result).to.equal(fluentCharacteristic); // Should return this for chaining
    });

    it('should update a value using the fluent API', () => {
        const result = fluentCharacteristic.update(100);
        expect(mockCharacteristic.value).to.equal(100);
        expect(result).to.equal(fluentCharacteristic); // Should return this for chaining
    });

    it('should set up onGet handler', () => {
        let getCalled = false;
        mockCharacteristic.onGet = function(handler: any) { getCalled = true; return this; };
        
        const result = fluentCharacteristic.onGet(async () => 42);
        expect(getCalled).to.be.true;
        expect(result).to.equal(fluentCharacteristic); // Should return this for chaining
    });

    it('should set up onSet handler', () => {
        let setCalled = false;
        mockCharacteristic.onSet = function(handler: any) { setCalled = true; return this; };
        
        const result = fluentCharacteristic.onSet(async (value: number) => {});
        expect(setCalled).to.be.true;
        expect(result).to.equal(fluentCharacteristic); // Should return this for chaining
    });

    it('should set properties using setProps', () => {
        let propsCalled = false;
        const testProps = { minValue: 0, maxValue: 100 };
        mockCharacteristic.setProps = function(props: any) { 
            propsCalled = true; 
            expect(props).to.deep.equal(testProps);
            return this; 
        };
        
        const result = fluentCharacteristic.setProps(testProps);
        expect(propsCalled).to.be.true;
        expect(result).to.equal(fluentCharacteristic); // Should return this for chaining
    });
});