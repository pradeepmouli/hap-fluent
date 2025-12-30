# Migration Guide

Move from ad-hoc/manual Homebridge testing to automated harness-based tests.

## Before you start

- Identify core user flows: registration, characteristic get/set, events.
- Gather sample accessories/services/characteristics from your plugin.
- Ensure your plugin can run with injected Homebridge API mocks.

## Replace manual steps with harness

| Manual step | Harness equivalent |
|-------------|--------------------|
| Launch Homebridge + plugin | `TestHarness.create({ platformConstructor, platformConfig })` |
| Pair controller | `harness.homeKit.pair()` |
| Add accessories via UI | `MockAccessory` + `MockService` + `MockCharacteristic` then `homeKit.addAccessory()` |
| Flip switches in Home app | `setValue()`/`getValue()` on characteristics |
| Observe logs for changes | Subscribe via `subscribe()` or `waitForAnyEvent()` |

## Incremental migration plan

1. **Smoke tests**: Create one harness test per accessory type. Validate basic get/set and registration.
2. **Validation**: Add tests that assert invalid writes throw `CharacteristicValidationError`.
3. **Events**: Add subscriptions for characteristics that notify; assert event payloads.
4. **Timing**: Use `TimeController` to cover scheduled or delayed operations.
5. **Network resilience**: Attach `NetworkSimulator` to simulate latency, loss, and outages.
6. **Cache behavior**: Provide `cachedAccessories` to ensure restore paths work.
7. **Refine assertions**: Register custom matchers (`hap-test/matchers`) to simplify expectations.

## Refactoring tips

- Extract helper functions for building accessories/services to keep tests short.
- Prefer deterministic values (fixed UUIDs, known initial states).
- Always call `harness.shutdown()` in `afterEach`.
- Use `vi.useFakeTimers()` only when you need manual control; the harness already sets fake timers.

## Validation checklist

- ✅ Platform initializes with harness-provided API and config
- ✅ All characteristics have correct permissions/constraints
- ✅ Events fire for writes and are observable via subscriptions
- ✅ Time-dependent code is deterministic under fake timers
- ✅ Network failures surface as `NetworkError`

## Common pitfalls

- Forgetting to add `ev` permission prevents subscriptions.
- Missing `pr`/`pw` perms will throw on read/write.
- Large latency values require advancing fake timers to resolve promises.
