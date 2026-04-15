# Usage

## Basic Homebridge accessory

```typescript
import { API } from 'homebridge';
import { getOrAddService, initializeAccessory } from 'hap-fluent';
import { configureLogger } from 'hap-fluent/logger';

configureLogger({ level: 'debug', pretty: true });

export default (api: API) => {
  api.registerAccessory('MyPlugin', 'MyAccessory', MyAccessory);
};

class MyAccessory {
  constructor(
    private readonly log: any,
    private readonly config: any,
    private readonly api: API
  ) {
    const uuid = api.hap.uuid.generate('my-unique-id');
    const accessory = new api.platformAccessory('My Light', uuid);

    const lightbulb = getOrAddService(
      accessory,
      api.hap.Service.Lightbulb,
      'My Light'
    );

    lightbulb.onGet('On', async () => await this.getLightState());
    lightbulb.onSet('On', async (value) => await this.setLightState(value));

    lightbulb.characteristics.On.set(true);
    lightbulb.characteristics.Brightness.set(100);
  }

  private async getLightState(): Promise<boolean> {
    return true;
  }

  private async setLightState(value: boolean): Promise<void> {
    // your implementation
  }
}
```

## More

See the [API Reference](../api/) for the full surface: `getOrAddService`, `initializeAccessory`, `FluentCharacteristic`, `FluentService`, interceptors, error classes, and type guards.
