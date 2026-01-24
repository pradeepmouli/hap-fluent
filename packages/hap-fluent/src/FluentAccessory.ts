/**
 * Accessory handler providing strongly-typed service management for Homebridge accessories
 *
 * @module AccessoryHandler
 *
 * @example
 * ```typescript
 * import { wrapAccessory } from 'hap-fluent';
 * import { Service } from 'hap-nodejs';
 *
 * // Wrap a platform accessory to get an AccessoryHandler
 * const handler = wrapAccessory(plugin, platformAccessory, api);
 *
 * // Add services with type accumulation
 * const handler2 = handler.with(Service.Lightbulb, 'Main Light');
 *
 * // Initialize with state (synchronous)
 * handler2.initialize({
 *   lightbulb: { on: true, brightness: 75 },
 *   accessoryInformation: { manufacturer: 'ACME', model: 'Light-1' }
 * });
 *
 * // Add service with subtype
 * const handler3 = handler2.with(Service.Outlet, 'Outlet 1', 'outlet1');
 *
 * // Access services
 * handler2.services.lightbulb.characteristics.Brightness.set(50);
 * handler3.services.outlet.outlet1.characteristics.On.set(true);
 * ```
 */

import {
  type API,
  type DynamicPlatformPlugin,
  type Logger,
  type PlatformAccessory,

  type UnknownContext,
  type WithUUID,
} from "homebridge";


import type { Service } from "hap-nodejs";


import { getOrAddService, wrapService, FluentService } from "./FluentService.js";
import type { AccessoryInformation } from "./types/hap-interfaces.js";

import camelcase from "camelcase";
import type {
	InterfaceForService,
  InterfaceMap,
  Interfaces,
  ServiceMap,
} from "./types/index.js";

import { camelCase, PascalCase } from "./utils.js";
import type { CamelCase, TupleToUnion, SimplifyDeep } from 'type-fest';

/**
 * Determine if the provided state object represents multiple service instances.
 *
 * @typeParam T - Service interface type from the interface map.
 * @param state - Single-service state or a keyed map of service states.
 * @returns True when the state contains multiple service entries.
 */
export function isMultiService<T extends InterfaceMap[keyof InterfaceMap]>(
  state: Partial<T> | { [key: string]: Partial<T> },
): state is { [key: string]: Partial<T> } {
  return Object.keys(state).length > 1 && Object.values(state)[0] instanceof Object;
}

type InternalServicesObject<T> = T extends [infer U, ...infer Rest]
  ? U extends InterfaceMap[keyof InterfaceMap] & { serviceName: infer I extends keyof ServiceMap }
    ? { [K in I]: FluentService<ServiceMap[I]> } & InternalServicesObject<Rest>
    : U extends {
          [key: string]: InterfaceMap[keyof InterfaceMap] & {
            serviceName: infer I extends keyof ServiceMap;
          };
        }
      ? {
          [K in I as CamelCase<K>]: { [SubKey in keyof U]: FluentService<ServiceMap[I]> };
        } & InternalServicesObject<Rest>
      : InternalServicesObject<Rest>
  : {};

/**
 * Service object map created from one or more service interfaces.
 * Ensures AccessoryInformation is included if not explicitly provided.
 */
export type ServicesObject<T extends readonly unknown[]> =
  AccessoryInformation extends TupleToUnion<T>
    ? SimplifyDeep<InternalServicesObject<T>>
    : SimplifyDeep<InternalServicesObject<[...T, AccessoryInformation]>>;

/**
 * Check if a service entry holds multiple subtypes instead of a single instance.
 */
function hasSubTypes<T extends ServiceMap[keyof ServiceMap]>(
  service: Record<string, T> | T,
): service is Record<string, T> & object {
  return !Object.keys(service).includes("UUID");
}

/**
 * Create a strongly-typed service map from a list of service instances.
 *
 * @param services - Service instances to wrap.
 * @returns Object keyed by camel-cased service names.
 */
export function createServicesObject<T extends Interfaces[]>(
  ...services: any[]
): any;

/**
 * Create a strongly-typed service map from a list of service instances with context.
 * @internal
 */
export function createServicesObject<T extends Interfaces[]>(
  plugin: DynamicPlatformPlugin,
  api: API,
  logger: Logger,
  ...services: any[]
): any;

export function createServicesObject<T extends Interfaces[]>(
  ...args: unknown[]
): any {
  // Overload resolution
  let plugin: DynamicPlatformPlugin | undefined;
  let api: API | undefined;
  let logger: Logger | undefined;
  let services: any[];

  if (args.length >= 3 && typeof args[0] === "object" && typeof args[1] === "object") {
    // Called with context (plugin, api, logger, ...services)
    plugin = args[0] as DynamicPlatformPlugin;
    api = args[1] as API;
    logger = args[2] as Logger | undefined;
    services = args.slice(3) as any[];
  } else {
    // Called without context (...services)
    services = args as any[];
  }

  return services.reduce(
    (acc: any, service): any => {
      // Create both PascalCase (e.g., "Lightbulb") and camelCase (e.g., "lightbulb") names
      const pascalName = camelcase(service.constructor.name /* get service name */, {
        pascalCase: true,
      });
      const camelName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);
      const serviceName = camelName as keyof ServicesObject<T>;

      const accRecord = acc as Record<string, unknown>;
      let serviceObject = accRecord[serviceName as string];
      if (service?.subtype) {
        const subTypeName = camelCase(service.subtype);
        // If the service has subtypes, we need to handle them differently
        if (serviceObject && hasSubTypes(serviceObject as ServiceMap[keyof ServiceMap])) {
          // hasSubTypes narrows the type, safe to spread
          serviceObject = {
            ...serviceObject,
            [camelCase(service.subtype)]: logger ? wrapService(service, logger) : wrapService(service),
          };
        } else {
          serviceObject = {
            primary: serviceObject,
            [subTypeName]: logger ? wrapService(service, logger) : wrapService(service),
          };
        }
      } else {
        serviceObject = logger ? wrapService(service, logger) : wrapService(service);
      }
      if (!(serviceName in acc)) {
        // Define camelCase property (primary, for type system)
        Object.defineProperty(acc, serviceName, {
          value: serviceObject,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      } else {
        acc[serviceName] = serviceObject;
      }
      return acc;
    },
    {},
  );
}

export type ServiceOrSubtype = Interfaces | { [key: string]: Interfaces };

export type InternalServicesStateObject<T> = T extends [infer U, ...infer Rest]
  ? U extends InterfaceMap[keyof InterfaceMap] & { serviceName: infer I extends keyof ServiceMap }
    ? {
        [K in I as CamelCase<K>]: Partial<Omit<InterfaceMap[I], "UUID" | "serviceName">>;
      } & InternalServicesStateObject<Rest>
    : InternalServicesStateObject<Rest>
  : {};
/**
 * State object shape for updating services, including AccessoryInformation by default.
 */
export type ServicesStateObject<T extends readonly unknown[]> =
  AccessoryInformation extends TupleToUnion<T>
    ? InternalServicesStateObject<T>
    : InternalServicesStateObject<[...T, AccessoryInformation]>;

/**
 * Platform accessory augmented with strongly-typed fluent services.
 */
export type FluentAccessory<
  TContext extends UnknownContext,
  Services extends ServiceOrSubtype[],
> = {
  context: TContext;
  services: ServicesObject<Services>;
  // Without subtype
  with<S extends typeof Service>(
    serviceClass: WithUUID<S>,
    displayName?: string,
  ): With<FluentAccessory<TContext, Services>, InterfaceForService<S>>;
  // With subtype
  with<
    S extends typeof Service,
    SubType extends string,
  >(
    serviceClass: WithUUID<S>,
    displayName: string,
    subType: SubType,
  ): With<FluentAccessory<TContext, Services>, { [K in SubType]: InterfaceForService<S> }>;

  initialize<T extends [...Services, ...N], N extends ServiceOrSubtype[]>(
    initialState?: InternalServicesStateObject<T>,
  ): void;
};

/**
 * Helper type to check if a type is already in a tuple
 */
type Contains<T extends readonly unknown[], U> = U extends T[number] ? true : false;

/**
 * Helper type to add a service to the services array only if it's not already present
 */
type AddIfNotExists<Services extends readonly unknown[], S> =
  Contains<Services, S> extends true ? Services : [...Services, S];

/**
 * Type helper for adding a service to a FluentAccessory while preventing duplicates
 */
export type With<F extends FluentAccessory<any, any>, S extends ServiceOrSubtype> =
  F extends FluentAccessory<infer TContext, infer ExistingServices>
    ? FluentAccessory<TContext, AddIfNotExists<ExistingServices, S>>
    : never;

/**
 * Wrapper around a Homebridge platform accessory that exposes fluent service helpers.
 */
export class AccessoryHandler<
  TContext extends UnknownContext = {},
  Services extends ServiceOrSubtype[] = [AccessoryInformation],
> implements FluentAccessory<TContext, Services> {
  public context: TContext;
  public services: ServicesObject<Services>;

  /**
   * @param plugin - Homebridge platform plugin instance.
   * @param accessory - Platform accessory to manage.
   * @param api - Homebridge API instance.
   * @param logger - Logger instance for structured logging.
   */
  constructor(
    protected plugin: DynamicPlatformPlugin,
    public readonly accessory: PlatformAccessory<TContext>,
    protected readonly api: API,
    protected readonly logger: Logger,
  ) {
    this.context = accessory.context as TContext;

    this.services = createServicesObject(
      plugin,
      api,
      logger,
      ...(accessory.services as unknown[]),
    ) as any;
  }

  /**
   * Add or retrieve a service and wrap it with fluent helpers.
   * Mutates the current handler instance and returns it with updated type.
   *
   * @param serviceClass - HAP service class constructor.
   * @param displayName - Optional display name for the service.
   * @returns This handler instance cast to include the new service type.
   */
  with<S extends typeof Service, I extends Interfaces = InterfaceForService<S> & Interfaces>(
    serviceClass: WithUUID<S>,
    displayName?: string,
  ): With<FluentAccessory<TContext, Services>, I>;

  /**
   * Add or retrieve a service with subtype and wrap it with fluent helpers.
   * Mutates the current handler instance and returns it with updated type.
   *
   * @param serviceClass - HAP service class constructor.
   * @param displayName - Display name for the service.
   * @param subType - Subtype identifier for the service.
   * @returns This handler instance cast to include the new subtyped service.
   */
  with<
    S extends typeof Service,
    SubType extends string,
    I extends Interfaces = InterfaceForService<S> & Interfaces,
  >(
    serviceClass: WithUUID<S>,
    displayName: string,
    subType: SubType,
  ): With<FluentAccessory<TContext, Services>, { [K in SubType]: I }>;

  with<S extends typeof Service, I extends Interfaces = InterfaceForService<S> & Interfaces>(
    serviceClass: WithUUID<S>,
    displayName?: string,
    subType?: string,
  ): any {
    const fluentService = getOrAddService(this.accessory, serviceClass, displayName, subType);

    // Update the services object on the current instance
    const serviceKey = displayName
      ? camelcase(displayName, { pascalCase: true })
      : camelcase(serviceClass.name, { pascalCase: true });
    (this.services as Record<string, unknown>)[serviceKey] = fluentService;

    // Return this instance cast to the new accumulated type
    return this as any;
  }

  /**
   * Ensure services exist on the accessory and apply initial values.
   *
   * @param initialState - Optional initial characteristic values.
   */
  initialize<T extends [...Services, ...N], N extends ServiceOrSubtype[]>(
    initialState?: InternalServicesStateObject<T>,
  ): FluentAccessory<TContext, T> {
    if (initialState) {
      for (const key in initialState) {
        if (typeof initialState[key] === "object") {
          const serviceClass = this.api.hap.Service[PascalCase(key) as keyof InterfaceMap];
          if (serviceClass) {
            const stateValue = initialState[key];
            // Type assertion needed: runtime check handles type safety
            if (typeof stateValue === "object" && isMultiService(stateValue as any)) {
              // Multi-service handling not yet implemented
            } else {
              // Use getService or getOrAddService to avoid duplicating AccessoryInformation
              const service = getOrAddService(this.accessory, serviceClass as WithUUID<any>);

              // Type assertion needed: dynamic service name lookup and characteristic access
              // TypeScript cannot prove that initialState[key][charKey] matches the characteristic's value type
              (this.services as Record<string, unknown>)[camelCase(key)] = service;
              for (const charKey in initialState[key]) {
                const wrappedChar = (service as any).characteristics?.[charKey];
                if (wrappedChar && typeof wrappedChar.set === "function") {
                  wrappedChar.set(initialState[key][charKey]);
                }
              }
            }
          }
        }
      }
    }
    return this as unknown as FluentAccessory<TContext, T>;
  }
}

/**
 * Wrap a platform accessory and return an AccessoryHandler.
 * Provides a single surface for managing services and initialization.
 *
 * @param plugin - Homebridge platform plugin instance.
 * @param accessory - Platform accessory to manage.
 * @param api - Homebridge API instance.
 * @param logger - Logger instance for structured logging.
 * @param initialState - Optional initial state for services.
 * @returns AccessoryHandler instance bound to the provided accessory.
 */
export function wrapAccessory<
  TContext extends UnknownContext = {},
  Services extends ServiceOrSubtype[] = [AccessoryInformation],
>(
  plugin: DynamicPlatformPlugin,
  accessory: PlatformAccessory<TContext>,
  api: API,
  logger: Logger,
  initialState?: InternalServicesStateObject<[...Services]>,
): FluentAccessory<TContext, [...Services]> {
  const handler = new AccessoryHandler<TContext, [...Services, AccessoryInformation]>(
    plugin,
    accessory,
    api,
    logger,
  );
  if (initialState) {
    handler.initialize(initialState);
  }
  return handler;
}
