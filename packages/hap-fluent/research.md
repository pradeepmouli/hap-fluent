# Research Notes: Homebridge Plugin Development

## Overview

Homebridge is a lightweight NodeJS server that emulates the iOS HomeKit API, allowing you to integrate with smart home devices that don't natively support HomeKit. Plugin developers create bridges between Homebridge and various smart home devices/platforms.

## Plugin Types

### 1. Accessory Plugins
- Expose a single accessory device (simplest form)
- Use `registerAccessory` method
- Good for simple devices with minimal configuration

### 2. Platform Plugins
- Manage multiple accessories (most flexible)
- Use `registerPlatform` method
- Three types:
  - **Static**: All accessories defined at startup
  - **Dynamic**: Accessories can be added/removed at runtime (RECOMMENDED)
  - **Independent**: May not expose accessories, used for extensions

## Key Components

### DynamicPlatformPlugin Interface
The main interface for dynamic platform plugins that allows runtime accessory management.

**Required Methods:**
- `constructor(log, config, api)` - Initialize plugin
- `configureAccessory(accessory)` - Restore cached accessories on startup

**Lifecycle Events:**
- `api.on('didFinishLaunching', callback)` - Called after Homebridge startup

### PlatformAccessory Class
Represents a HomeKit accessory with services and characteristics.

**Key Methods:**
- `new PlatformAccessory(displayName, uuid)` - Create new accessory
- `addService(service, name?)` - Add a HomeKit service
- `getService(service)` - Get existing service
- `removeService(service)` - Remove a service

### Service
Represents a HomeKit service (e.g., Switch, Lightbulb, TemperatureSensor).

**Common Services:**
- `hap.Service.Switch` - On/Off switch
- `hap.Service.Lightbulb` - Light with brightness, color
- `hap.Service.Thermostat` - Temperature control
- `hap.Service.TemperatureSensor` - Temperature reading
- `hap.Service.AccessoryInformation` - Device metadata (required)

### Characteristic
Represents a property of a service (e.g., On, Brightness, CurrentTemperature).

**Event Handlers:**
- `.on('get', callback)` - HomeKit reads value
- `.on('set', callback)` - HomeKit writes value
- `.updateValue(value)` - Push value to HomeKit

## Plugin Structure

```
homebridge-plugin-name/
├── package.json           # Plugin metadata, entry point
├── src/
│   ├── index.ts          # Plugin registration
│   ├── platform.ts       # Platform implementation
│   └── accessory.ts      # Accessory logic (optional)
├── config.schema.json    # Config UI schema
└── tsconfig.json         # TypeScript config
```

## Registration Pattern

```typescript
import { API } from 'homebridge';

export = (api: API) => {
  api.registerPlatform('PlatformName', MyPlatformClass);
};
```

## Typical Dynamic Platform Flow

1. **Initialization**: Constructor called with log, config, api
2. **Configure Accessories**: `configureAccessory()` called for each cached accessory
3. **Did Finish Launching**: `didFinishLaunching` event fires
4. **Discover Devices**: Plugin discovers/creates accessories
5. **Register Accessories**: Call `api.registerPlatformAccessories()`
6. **Setup Handlers**: Attach get/set handlers to characteristics
7. **Runtime Updates**: Add/remove accessories as needed

## Accessory Management Methods

```typescript
// Register new accessories
api.registerPlatformAccessories(pluginName, platformName, accessories);

// Update existing accessories
api.updatePlatformAccessories(accessories);

// Remove accessories
api.unregisterPlatformAccessories(pluginName, platformName, accessories);
```

## Best Practices

1. **Use TypeScript**: Better type safety and developer experience
2. **Use Plugin Template**: Start with official Homebridge plugin template
3. **Implement Dynamic Platform**: Most flexible for future expansion
4. **Cache Context**: Store device-specific data in `accessory.context`
5. **Handle Restoration**: Properly restore accessories from cache in `configureAccessory()`
6. **Use UUID Generation**: `hap.uuid.generate(uniqueId)` for consistent UUIDs
7. **Error Handling**: Always handle errors in get/set handlers
8. **Logging**: Use provided logger for consistent logging
9. **Config Validation**: Validate configuration in constructor
10. **Update Values**: Use `updateValue()` to push state changes to HomeKit

## Testing and Development

### Local Testing
1. Build: `npm run build`
2. Watch: `npm run watch` (live reload)
3. Link: `npm link` or `hb-service link`
4. Restart Homebridge: `sudo systemctl restart homebridge` or `hb-service restart`

### Debugging
- Enable debug logging in Homebridge
- Use VSCode with Node.js debugging
- Check Homebridge logs: `tail -f ~/.homebridge/homebridge.log`

## HAP-NodeJS Integration

Homebridge is built on top of HAP-NodeJS, which provides the low-level HomeKit API implementation. The `hap` object from the Homebridge API gives access to:

- `hap.Service.*` - All HomeKit services
- `hap.Characteristic.*` - All HomeKit characteristics
- `hap.uuid.generate()` - UUID generation
- `hap.PlatformAccessory` - Accessory class

This is where **hap-fluent** integrates - it provides a fluent wrapper around HAP-NodeJS services and characteristics, making it easier to build accessories with chainable methods, built-in validation, and interceptors.

## Resources

- **Official Docs**: https://developers.homebridge.io/
- **Plugin Template**: https://github.com/homebridge/homebridge-plugin-template
- **Examples**: https://github.com/homebridge/homebridge-examples
- **API Reference**: https://developers.homebridge.io/homebridge/
- **Dynamic Platform Example**: https://github.com/homebridge/homebridge-examples/blob/latest/dynamic-platform-example-typescript/

## Related to hap-fluent

**hap-fluent** is a fluent wrapper around HAP-NodeJS services and characteristics. In a Homebridge plugin context:

1. **Standard Approach**: Directly use HAP-NodeJS API via `accessory.addService()` and characteristic handlers
2. **hap-fluent Approach**: Wrap HAP-NodeJS services/characteristics with FluentService/FluentCharacteristic for:
   - Chainable fluent API
   - Built-in validation with validators
   - Interceptors (logging, rate limiting, transformation)
   - Better developer experience with autocomplete
   - Easier testing and maintenance

Both approaches work in Homebridge plugins, but hap-fluent provides a more modern, type-safe, and maintainable API.
