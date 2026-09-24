# hap-test

## 0.2.1

### Patch Changes

- [#90](https://github.com/pradeepmouli/hap-fluent/pull/90) [`49c298c`](https://github.com/pradeepmouli/hap-fluent/commit/49c298cf8092d7c8a019e5a97c009f173ab020ce) Thanks [@pradeepmouli](https://github.com/pradeepmouli)! - Bump `vitest` to `^5.0.1` and `@fast-check/vitest` to `^0.5.0` (devDependencies — this repo was missed by the earlier portfolio-wide vitest 4→5 bump). Widened `hap-test`'s `vitest` peerDependencies range to include `^5.0.0`.

## 0.2.0

### Minor Changes

- [#79](https://github.com/pradeepmouli/hap-fluent/pull/79) [`a38c36f`](https://github.com/pradeepmouli/hap-fluent/commit/a38c36fc8dc0eea5a89e6543a123938a57cc6c43) Thanks [@pradeepmouli](https://github.com/pradeepmouli)! - - feat!: require Homebridge 2 (`homebridge >=2.0.0`) and the scoped `@homebridge/hap-nodejs >=2.0.0`; the unscoped `hap-nodejs` 0.x is no longer supported. Import HAP types from `@homebridge/hap-nodejs`.
  - fix: mixing `hap-nodejs` 0.14 with Homebridge 2's bundled HAP types caused type errors in `AccessoryHandler` and `FluentService`.
  - fix: `isCharacteristic` checks `setValue` instead of `getValue`, which no longer exists in hap-nodejs 2.

### Patch Changes

- [`c780966`](https://github.com/pradeepmouli/hap-fluent/commit/c78096673a4becf01703b8a89136edba7bdcd228) Thanks [@pradeepmouli](https://github.com/pradeepmouli)! - Update production dependencies (camelcase, pino, type-fest)
