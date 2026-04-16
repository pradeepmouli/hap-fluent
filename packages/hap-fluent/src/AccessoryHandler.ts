/**
 * Accessory-level helpers that initialize and manage collections of HAP services
 * on a Homebridge `PlatformAccessory`.
 *
 * @remarks
 * This module provides two complementary patterns:
 *
 * **Functional pattern** — `initializeAccessory()` mutates a plain
 * `PlatformAccessory` in place, merging fluent service wrappers onto it and
 * optionally setting initial characteristic values. The returned
 * `FluentAccessory` is the same object reference as the input accessory, so
 * it can be passed to `api.registerPlatformAccessories()` unchanged.
 *
 * **Class pattern** — `AccessoryHandler` is a base class for your Homebridge
 * platform accessory class. It exposes `this.services` (a strongly-typed map
 * of `FluentService` instances) and `addService()` / `initialize()` helpers.
 *
 * `AccessoryInformation` is automatically injected into the `ServicesObject`
 * type even if not listed explicitly, because all HomeKit accessories are
 * required by the HAP specification to include the AccessoryInformation service.
 *
 * @module AccessoryHandler
 *
 * @example
 * ```typescript
 * import { initializeAccessory } from 'hap-fluent';
 *
 * // Initialize with state
 * const accessory = initializeAccessory(platformAccessory, {
 *   lightbulb: { on: true, brightness: 75 },
 *   accessoryInformation: { manufacturer: 'ACME', model: 'Light-1' }
 * });
 *
 * // Access services with full type safety
 * accessory.lightbulb.characteristics.on.set(false);
 * accessory.accessoryInformation.characteristics.manufacturer.set('ACME');
 * ```
 */

import {
  type DynamicPlatformPlugin,
  PlatformAccessory,
  type UnknownContext,
  type WithUUID
} from 'homebridge';
import { Service } from 'hap-nodejs';

import { TupleToUnion } from 'type-fest';

import { _definitions } from 'hap-nodejs';

import { getOrAddService, wrapService, FluentService } from './FluentService.js';
import type { AccessoryInformation } from './types/hap-interfaces.js';
import type { CamelCase, SimplifyDeep } from 'type-fest';
import camelcase from 'camelcase';
import type { ServiceForInterface, Interfaces, InterfaceMap, ServiceMap } from './types/index.js';
import { getLogger } from './logger.js';

/**
 * Determine if the provided state object represents multiple service instances.
 *
 * @typeParam T - Service interface type from the interface map.
 * @param state - Single-service state or a keyed map of service states.
 * @returns True when the state contains multiple service entries.
 */
export function isMultiService<T extends InterfaceMap[keyof InterfaceMap]>(
  state: Partial<T> | { [key: string]: Partial<T> }
): state is { [key: string]: Partial<T> } {
  const keys = Object.keys(state);
  return keys.length > 1 && (state as Record<string, unknown>)[keys[0]] instanceof Object;
}

type InternalServicesObject<T> = T extends [infer U, ...infer Rest]
  ? U extends InterfaceMap[keyof InterfaceMap] & { serviceName: infer I extends keyof ServiceMap }
    ? { [K in I as CamelCase<K>]: FluentService<ServiceMap[I]> } & InternalServicesObject<Rest>
    : InternalServicesObject<Rest>
  : {};

/**
 * A record mapping camelCase service names to their corresponding
 * {@link FluentService} instances.
 *
 * @remarks
 * `AccessoryInformation` is always present in the resulting type even when not
 * listed in `T`, because the HAP specification mandates it on every accessory.
 * The type resolves service names using the generated `ServiceMap` and
 * `InterfaceMap` from `hap-codegen`.
 *
 * @typeParam T - Tuple of HAP interface types (e.g.,
 *   `[LightbulbInterface, SwitchInterface]`).
 *
 * @category AccessoryHandler
 */
export type ServicesObject<T extends readonly unknown[]> =
  AccessoryInformation extends TupleToUnion<T>
    ? SimplifyDeep<InternalServicesObject<T>>
    : SimplifyDeep<InternalServicesObject<[...T, AccessoryInformation]>>;

/**
 * Check if a service entry holds multiple subtypes instead of a single instance.
 */
function hasSubTypes<T extends ServiceMap[keyof ServiceMap]>(
  service: Record<string, T> | T
): service is Record<string, T> & object {
  return !Object.keys(service).includes('UUID');
}

/**
 * Apply initial state values to the services on an accessory.
 *
 * @param services - Wrapped services object to populate.
 * @param accessory - The platform accessory owning the services.
 * @param initialState - Initial characteristic values keyed by service name.
 */
function applyInitialState<Services extends Interfaces[]>(
  services: Record<string, unknown>,
  accessory: PlatformAccessory,
  initialState: InternalServicesStateObject<Services>
): void {
  for (const key in initialState) {
    if (typeof initialState[key] !== 'object') {
      continue;
    }
    const pascalKey = camelcase(key, { pascalCase: true });
    const serviceClass = Service[pascalKey as keyof InterfaceMap] as WithUUID<
      typeof Service.AccessoryInformation
    >;
    if (!serviceClass) {
      continue;
    }
    const stateValue = initialState[key];
    if (typeof stateValue === 'object' && isMultiService(stateValue as any)) {
      // Multi-service handling not yet implemented
      continue;
    }
    const service =
      accessory.getService(serviceClass) ||
      (accessory.addService(new serviceClass()) as InstanceType<typeof serviceClass>);
    const wrappedService = wrapService(service as InstanceType<typeof serviceClass>);
    services[pascalKey] = wrappedService;
    for (const charKey in initialState[key]) {
      const characteristics = (wrappedService as any).characteristics;
      const wrappedChar = characteristics?.[charKey];
      if (wrappedChar && typeof wrappedChar.set === 'function') {
        wrappedChar.set(initialState[key][charKey]);
      }
    }
  }
}

/**
 * Build a strongly-typed service map by wrapping an array of service instances.
 *
 * @remarks
 * Each service is wrapped with {@link wrapService} and stored under both its
 * camelCase name (primary, enumerable) and PascalCase name (non-enumerable
 * alias for backward compatibility). When a service has a `subtype`, the entry
 * becomes a `{ primary, [subTypeName] }` object rather than a flat
 * `FluentService`.
 *
 * @param services - HAP `Service` instances to wrap. Order is preserved.
 * @returns An object keyed by camelCase service names, typed as
 *   `ServicesObject<T>`.
 *
 * @useWhen
 * - You want to build a services map from `platformAccessory.services` directly,
 *   e.g., in a `configureAccessory()` restore path.
 *
 * @avoidWhen
 * - You are initializing an accessory from scratch with initial state — use
 *   {@link initializeAccessory} which combines `createServicesObject` and
 *   `applyInitialState` in a single call.
 *
 * @example
 * ```typescript
 * import { createServicesObject } from 'hap-fluent';
 *
 * const services = createServicesObject(...accessory.services);
 * services.lightbulb.onGet('on', async () => getState());
 * ```
 *
 * @category AccessoryHandler
 */
export function createServicesObject<T extends Interfaces[]>(
  ...services: InstanceType<ServiceForInterface<T[number]>>[]
): ServicesObject<T> {
  return services.reduce<ServicesObject<T>>(
    (acc: ServicesObject<T>, service): ServicesObject<T> => {
      // Create both PascalCase (e.g., "Lightbulb") and camelCase (e.g., "lightbulb") names
      const pascalName = camelcase(service.constructor.name /* get service name */, {
        pascalCase: true
      });
      const camelName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);
      const serviceName = camelName as keyof ServicesObject<T>;

      const accRecord = acc as Record<string, unknown>;
      let serviceObject = accRecord[serviceName as string];
      if (service?.subtype) {
        const subTypeName = camelcase(service.subtype, { pascalCase: true });
        // If the service has subtypes, we need to handle them differently
        if (serviceObject && hasSubTypes(serviceObject as ServiceMap[keyof ServiceMap])) {
          // hasSubTypes narrows the type, safe to spread
          serviceObject = { ...serviceObject, [subTypeName]: wrapService(service) };
        } else {
          serviceObject = { primary: serviceObject, [subTypeName]: wrapService(service) };
        }
      } else {
        serviceObject = wrapService(service);
      }
      if (!(serviceName in acc)) {
        // Define camelCase property (primary, for type system)
        Object.defineProperty(acc, serviceName, {
          value: serviceObject,
          writable: true,
          enumerable: true,
          configurable: true
        });
        // Also define PascalCase property for backward compatibility
        if (pascalName !== serviceName) {
          Object.defineProperty(acc, pascalName, {
            value: serviceObject,
            writable: true,
            enumerable: false, // Don't enumerate to avoid duplication
            configurable: true
          });
        }
      } else {
        acc[serviceName] = serviceObject as ServicesObject<T>[keyof ServicesObject<T>];
      }
      return acc;
    },
    {} as ServicesObject<T>
  );
}

export type InternalServicesStateObject<T> = T extends [infer U, ...infer Rest]
  ? U extends InterfaceMap[keyof InterfaceMap] & { serviceName: infer I extends keyof ServiceMap }
    ? {
        [K in I as CamelCase<K>]: Partial<Omit<InterfaceMap[I], 'UUID' | 'serviceName'>>;
      } & InternalServicesStateObject<Rest>
    : InternalServicesStateObject<Rest>
  : {};
/**
 * Partial characteristic-value map for initializing an accessory's services.
 *
 * @remarks
 * Each key is the camelCase service name; the value is a partial record of
 * characteristic names to initial values. `AccessoryInformation` is always
 * included in the type even when not listed explicitly.
 *
 * @typeParam T - Tuple of HAP interface types.
 *
 * @category AccessoryHandler
 */
export type ServicesStateObject<T extends readonly unknown[]> =
  AccessoryInformation extends TupleToUnion<T>
    ? InternalServicesStateObject<T>
    : InternalServicesStateObject<[...T, AccessoryInformation]>;

/**
 * A Homebridge `PlatformAccessory` augmented with strongly-typed
 * {@link FluentService} properties for each declared service.
 *
 * @remarks
 * `FluentAccessory` is the return type of {@link initializeAccessory}. It is
 * the **same object** as the input `PlatformAccessory` (mutated in place via
 * `Object.assign`) so it can be passed directly to
 * `api.registerPlatformAccessories()` or `api.updatePlatformAccessories()`.
 *
 * Access services via camelCase property names:
 * - `accessory.lightbulb` → `FluentService<typeof Service.Lightbulb>`
 * - `accessory.accessoryInformation` → `FluentService<typeof Service.AccessoryInformation>`
 *
 * @typeParam TContext - The accessory's custom context type (extends `UnknownContext`).
 * @typeParam Services - Tuple of HAP interface types declared for this accessory.
 *
 * @category AccessoryHandler
 */
export type FluentAccessory<
  TContext extends UnknownContext,
  Services extends Interfaces[]
> = ServicesObject<Services> & PlatformAccessory<TContext>;

/**
 * Initialize a `PlatformAccessory` with fluent service wrappers and apply
 * initial characteristic values in a single call.
 *
 * @remarks
 * This is the recommended entry-point for the functional pattern. It:
 * 1. Calls `createServicesObject()` on the existing `accessory.services`.
 * 2. Calls `applyInitialState()` to set characteristic values from `initialState`.
 * 3. Merges the resulting services onto `accessory` via `Object.assign`.
 *
 * The returned value is the **same reference** as the input `accessory` — no
 * new `PlatformAccessory` is created. You can therefore pass the returned
 * value to `api.registerPlatformAccessories()` unchanged.
 *
 * Services not listed in `initialState` are still wrapped and accessible via
 * property access; they just won't have values set on their characteristics.
 *
 * @param accessory - The Homebridge `PlatformAccessory` to augment.
 * @param initialState - Partial characteristic values keyed by camelCase service
 *   name (e.g., `{ lightbulb: { on: true, brightness: 100 } }`).
 * @returns The same `accessory` reference typed as {@link FluentAccessory}.
 *
 * @useWhen
 * - Initializing an accessory in `configureAccessory()` or your plugin
 *   constructor, especially when you want to set initial states at the same time.
 * - You prefer the functional style (no class inheritance required).
 *
 * @avoidWhen
 * - You need to add services dynamically after initialization — use
 *   {@link getOrAddService} for post-initialization service additions.
 * - You need to track accessory lifecycle beyond initialization — use
 *   {@link AccessoryHandler} for a stateful class-based approach.
 *
 * @pitfalls
 * - NEVER call `initializeAccessory()` more than once on the same accessory
 *   instance — the second call will overwrite the service wrappers created by
 *   the first call, and any `onGet`/`onSet` handlers registered between calls
 *   will be lost.
 * - NEVER pass characteristic keys that don't exist on the service in
 *   `initialState` — they are silently ignored (no error is thrown), which can
 *   mask typos in characteristic names.
 *
 * @example
 * ```typescript
 * import { initializeAccessory } from 'hap-fluent';
 *
 * class MyLightAccessory {
 *   constructor(
 *     private readonly api: API,
 *     private readonly platformAccessory: PlatformAccessory
 *   ) {
 *     const accessory = initializeAccessory(platformAccessory, {
 *       lightbulb: { on: false, brightness: 100 },
 *       accessoryInformation: {
 *         manufacturer: 'ACME',
 *         model: 'Smart Light',
 *         serialNumber: 'SN-001',
 *         firmwareRevision: '1.0.0'
 *       }
 *     });
 *
 *     accessory.lightbulb.onGet('on', async () => this.getState());
 *     accessory.lightbulb.onSet('on', async (v) => this.setState(v));
 *   }
 * }
 * ```
 *
 * @category AccessoryHandler
 */
export function initializeAccessory<TContext extends UnknownContext, Services extends Interfaces[]>(
  accessory: PlatformAccessory<TContext>,
  initialState: InternalServicesStateObject<Services>
): FluentAccessory<TContext, Services> {
  const logger = getLogger();
  logger.info(
    {
      accessoryUUID: accessory.UUID,
      accessoryName: accessory.displayName,
      serviceCount: accessory.services.length,
      stateKeys: Object.keys(initialState)
    },
    'Initializing accessory with state'
  );

  const services = createServicesObject(
    ...(accessory.services as unknown as InstanceType<ServiceForInterface<Services[number]>>[])
  );
  applyInitialState<Services>(services as Record<string, unknown>, accessory, initialState);
  return Object.assign(accessory, services as ServicesObject<Services>);
}

/**
 * Class-based wrapper around a Homebridge `PlatformAccessory` that manages
 * its fluent service helpers and exposes a typed `services` map.
 *
 * @remarks
 * Extend `AccessoryHandler` in your Homebridge platform accessory class to get
 * typed access to all services via `this.services` without writing boilerplate
 * wrap calls. Call `this.addService()` in your constructor for each HAP service
 * you want to manage, then call `this.initialize()` with initial state if needed.
 *
 * `this.services` is populated from `accessory.services` at construction time.
 * Services added later via `this.addService()` are accessible through
 * `FluentService` references returned by that method but are **not**
 * automatically added to `this.services` — update `this.services` manually
 * if needed.
 *
 * @typeParam TContext - The accessory's custom context type (extends `UnknownContext`).
 * @typeParam Services - Tuple of HAP interface types for services this handler manages.
 *
 * @useWhen
 * - You prefer class inheritance over the functional `initializeAccessory()` pattern.
 * - You need a stable `this.services` reference that persists across handler calls.
 * - You want to extend the handler with custom methods specific to your device type.
 *
 * @avoidWhen
 * - Your Homebridge plugin already extends another base class — use the functional
 *   `initializeAccessory()` pattern instead to avoid multiple inheritance issues.
 * - You only need a one-off initialization — `initializeAccessory()` is simpler.
 *
 * @pitfalls
 * - NEVER call `this.initialize()` after `api.registerPlatformAccessories()` —
 *   characteristic values set post-publish are sent as HomeKit notifications,
 *   which can spam the iOS controller and drain device battery.
 * - NEVER hold references to `FluentService` instances across Homebridge restarts
 *   — each restart creates a fresh `AccessoryHandler`; old service references
 *   are invalid and will silently operate on orphaned characteristic objects.
 *
 * @example
 * ```typescript
 * import { AccessoryHandler } from 'hap-fluent';
 *
 * class SmartLightHandler extends AccessoryHandler<MyContext, [LightbulbInterface]> {
 *   constructor(plugin: MyPlatform, accessory: PlatformAccessory<MyContext>) {
 *     super(plugin, accessory);
 *   }
 *
 *   async setup() {
 *     const lightbulb = this.addService(hap.Service.Lightbulb, 'Ceiling Light');
 *     lightbulb.onGet('on', async () => this.fetchState());
 *     lightbulb.onSet('on', async (v) => this.applyState(v));
 *     await this.initialize({ lightbulb: { on: false, brightness: 100 } });
 *   }
 * }
 * ```
 *
 * @category AccessoryHandler
 */
export class AccessoryHandler<TContext extends UnknownContext, Services extends Interfaces[]> {
  public context: TContext;
  public services: ServicesObject<Services> = {} as ServicesObject<Services>;

  /**
   * @param plugin - Homebridge platform plugin instance.
   * @param accessory - Platform accessory to manage.
   */
  constructor(
    protected plugin: DynamicPlatformPlugin,
    public readonly accessory: PlatformAccessory<TContext>
  ) {
    this.context = accessory.context as TContext;
    this.services = createServicesObject(
      ...(accessory.services as unknown as InstanceType<ServiceForInterface<Services[number]>>[])
    ) as ServicesObject<Services>;
  }

  /**
   * Add or retrieve a service and wrap it with fluent helpers.
   *
   * @param serviceClass - HAP service class constructor.
   * @param displayName - Optional display name for the service.
   * @param subType - Optional subtype identifier.
   */
  addService<S extends typeof Service>(
    serviceClass: WithUUID<S>,
    displayName?: string,
    subType?: string
  ): FluentService<S> {
    return getOrAddService(this.accessory, serviceClass, displayName, subType);
  }

  /**
   * Ensure services exist on the accessory and apply initial values.
   *
   * @param initialState - Optional initial characteristic values.
   */
  async initialize(initialState?: InternalServicesStateObject<Services>): Promise<void> {
    if (initialState) {
      applyInitialState<Services>(
        this.services as Record<string, unknown>,
        this.accessory,
        initialState
      );
    }
  }
}
