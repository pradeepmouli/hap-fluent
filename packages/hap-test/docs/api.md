# API Reference (summary)

Generated docs can be produced with `pnpm --filter hap-test docs:api`. This summary highlights key entry points.

## Core classes

### TestHarness

- `static create(options: HarnessOptions): Promise<TestHarness>`
- `api`: `MockHomebridgeAPI` instance
- `homeKit`: `MockHomeKit` controller
- `time`: `TimeController`
- `waitForRegistration(timeoutMs?)`
- `waitForAccessories(count, timeoutMs?)`
- `waitForEvent(accessoryUuid, serviceName, characteristicName, timeoutMs?)`
- `waitForAnyEvent(timeoutMs?)`
- `shutdown()`

### MockHomeKit

- `accessories()` → `MockAccessory[]`
- `accessory(uuid)` → `MockAccessory | undefined`
- `service(accessoryUuid, serviceName)` → `MockService | undefined`
- `characteristic(accessoryUuid, serviceName, charName)` → `MockCharacteristic | undefined`
- `addAccessory(accessory)`
- `refreshAll()` → `Map<string, CharacteristicValue>`
- `setNetworkSimulator(simulator)` / `getNetworkSimulator()`
- `pair()`, `unpair()`, `isPaired()`
- `onCharacteristicEvent(handler)` → unsubscribe fn

### MockAccessory

- `addService(service)`
- `getService(nameOrType)`
- `getServices()`
- `context`: mutable record

### MockService

- `addCharacteristic(characteristic)`
- `getCharacteristic(nameOrType)`
- `hasCharacteristic(nameOrType)`
- `characteristics`: list

### MockCharacteristic

- `getValue()` / `setValue(value)`
- `subscribe()` → `EventSubscription`
- `isSubscribed()`
- `getHistory()`

### EventSubscription

- `waitForNext(timeout?)`
- `getHistory()`
- `latest?()`
- `count?()`
- `unsubscribe()`

### TimeController

- `advance(ms)`
- `freeze()`
- `setTime(date)`
- `now()`
- `reset()`

### NetworkSimulator

- `setLatency(ms)`
- `setPacketLoss(rate)`
- `disconnect()` / `reconnect()` / `reset()`
- `applyConditions(fn)` (used internally)

## Types

- `HarnessOptions`, `PlatformState`
- Mock types: `MockAccessory`, `MockService`, `MockCharacteristic`, `EventSubscription`
- Events: `CharacteristicEvent`
- Errors: `CharacteristicValidationError`, `HomeKitTimeoutError`, `NetworkError`

## Matchers

Import from `hap-test/matchers`:

- `toHaveAccessory`, `toHaveService`, `toHaveCharacteristic`
- `toHaveValue`, `toBeInRange`, `toHaveFormat`

## Validation helpers

From `utils/validation`:

- `validateCharacteristicValue(type, value, props, operation)`
- `validateConstraints(value, min, max, step, validValues)`
- `validatePermissions(operation, permissions)`
