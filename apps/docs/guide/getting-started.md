# Getting Started

> **⚠️ Pre-1.0 software** — APIs are subject to change between minor versions. Pin to exact versions in production.

HAP Fluent provides a type-safe, fluent API for working with HomeKit Accessory Protocol (HAP) services and characteristics in Homebridge plugins.

## Install

```bash
npm install hap-fluent
```

## Quick example

```typescript
import { getOrAddService } from 'hap-fluent';

const lightbulb = getOrAddService(accessory, api.hap.Service.Lightbulb, 'My Light');

lightbulb.onGet('On', async () => this.getLightState());
lightbulb.onSet('On', async (value) => this.setLightState(value));

lightbulb.characteristics.On.set(true);
lightbulb.characteristics.Brightness.set(100);
```

## Next steps

- [Installation](./installation.md)
- [Usage](./usage.md)
- [API Reference](../api/)
