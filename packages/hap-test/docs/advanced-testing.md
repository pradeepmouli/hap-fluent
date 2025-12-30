# Advanced Testing

Deep-dive scenarios for complex plugins: time control, network simulation, multi-user setups, and events.

## Time control with TimeController

- The harness uses Vitest fake timers by default.
- Advance time deterministically:

```typescript
await harness.time.advance(1000); // runs scheduled timers
```

- Freeze time to stop auto progression: `harness.time.freeze()`.
- Reset to real timers when cleaning up: `harness.time.reset()`.

## Network simulation

Attach a simulator to HomeKit to test latency, packet loss, and disconnects.

```typescript
import { NetworkSimulator } from 'hap-test';

const simulator = new NetworkSimulator();
simulator.setLatency(200);
simulator.setPacketLoss(0.2);
// simulate outage
afterEach(() => simulator.reset());

harness.homeKit.setNetworkSimulator(simulator);
```

All `getValue`/`setValue` calls will honor these conditions. Expect `NetworkError` with `errorType` such as `DISCONNECTED` or `PACKET_LOSS`.

## Event subscriptions

```typescript
const characteristic = harness.homeKit.characteristic('uuid', 'Lightbulb', 'On')!;
const sub = characteristic.subscribe();
const event = await sub.waitForNext(500);
sub.unsubscribe();
```

Use `harness.waitForAnyEvent()` to listen globally, or `waitForEvent()` for a specific target.

## Validation and permissions

- Writes enforce HAP constraints (min/max/step/validValues) and throw `CharacteristicValidationError`.
- Reads/writes honor permissions: missing `pr`/`pw`/`ev` throws immediately.
- Formats supported: `bool`, numeric formats (int/float/uint8+), `string`, `data`, `tlv8`.

## Cached accessories

Provide cached devices to simulate Homebridge restore:

```typescript
const cached = [existingAccessory];
const harness = await TestHarness.create({ platformConstructor, platformConfig, cachedAccessories: cached });
```

`configureAccessory` will fire for each cached accessory, and the controller pre-loads them for immediate use.

## Multi-controller scenarios

The controller exposes pairing state:

```typescript
harness.homeKit.pair();
const paired = harness.homeKit.isPaired();
```

Create multiple harnesses with different controller IDs to simulate multi-user interactions (set via constructor argument if you instantiate `MockHomeKit` directly).

## Batch operations

`refreshAll()` reads every readable characteristic and returns a keyed `Map` of `accessoryUUID.service.characteristic` to value.

## Debug logging

Enable categorized debug logs:

```typescript
const harness = await TestHarness.create({
  platformConstructor,
  platformConfig,
  logging: { debug: true, level: 'DEBUG', categories: ['HARNESS', 'CHARACTERISTIC'] },
});
```
