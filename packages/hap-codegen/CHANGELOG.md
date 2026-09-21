# hap-codegen

## 0.1.1

### Patch Changes

- [#79](https://github.com/pradeepmouli/hap-fluent/pull/79) [`a38c36f`](https://github.com/pradeepmouli/hap-fluent/commit/a38c36fc8dc0eea5a89e6543a123938a57cc6c43) Thanks [@pradeepmouli](https://github.com/pradeepmouli)! - - feat!: require Homebridge 2 (`homebridge >=2.0.0`) and the scoped `@homebridge/hap-nodejs >=2.0.0`; the unscoped `hap-nodejs` 0.x is no longer supported. Import HAP types from `@homebridge/hap-nodejs`.
  - fix: mixing `hap-nodejs` 0.14 with Homebridge 2's bundled HAP types caused type errors in `AccessoryHandler` and `FluentService`.
  - fix: `isCharacteristic` checks `setValue` instead of `getValue`, which no longer exists in hap-nodejs 2.
