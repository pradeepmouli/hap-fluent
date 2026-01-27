import {
  type WithUUID,
  type CharacteristicValue,
  type PlatformAccessory,
  type Service,
} from "homebridge";
import type { InterfaceForService } from "./types/index.js";
import { PascalCase, type CamelCase } from "type-fest";
import { FluentCharacteristic } from "./FluentCharacteristic.js";
import { ValidationError } from "./errors.js";
import { isService } from "./type-guards.js";
import type { Logger } from "./logger.js";
import { createNoOpLogger } from "./logger.js";
import { camelCase } from "./utils.js";

/**
 * Fluent wrapper for HAP Service with strong typing and characteristic access
 *
 * @template T - HAP Service class type
 *
 * @example
 * ```typescript
 * const lightbulb: FluentService<typeof Lightbulb> = getOrAddService(
 *   accessory,
 *   hap.Service.Lightbulb,
 *   'My Light'
 * );
 *
 * // Access characteristics with camelCase or PascalCase
 * lightbulb.characteristics.On.set(true);
 * lightbulb.on = true; // Shorthand property access
 *
 * // Register handlers
 * lightbulb.onGet('On', async () => await getLightState());
 * lightbulb.onSet('On', async (value) => await setLightState(value));
 *
 * // Update without triggering handlers
 * lightbulb.update('Brightness', 75);
 * ```
 */
export type FluentService<T extends typeof Service> = InterfaceForService<T> & {
  /**
   * Collection of all characteristics for this service
   * Keys are PascalCase characteristic names (e.g., 'On', 'Brightness')
   */
  characteristics: {
    [K in CharacteristicNamesOf<T> as CamelCase<K>]: FluentCharacteristic<
      InterfaceForService<T>[K] & CharacteristicValue
    >;
  };
  /**
   * Register an async getter for a characteristic
   *
   * @param key - Characteristic name (PascalCase)
   * @param callback - Async function returning the characteristic value
   *
   * @example
   * ```typescript
   * service.onGet('On', async () => {
   *   const state = await getDeviceState();
   *   return state.isOn;
   * });
   * ```
   */
  onGet<K extends CharacteristicNamesOf<T>>(
    key: PascalCase<K>,
    callback: () => Promise<InterfaceForService<T>[K]>,
  ): void;
  /**
   * Register an async setter for a characteristic
   *
   * @param key - Characteristic name (PascalCase)
   * @param callback - Async function receiving the new value
   *
   * @example
   * ```typescript
   * service.onSet('On', async (value) => {
   *   await setDeviceState({ isOn: value });
   * });
   * ```
   */
  onSet<K extends CharacteristicNamesOf<T>>(
    key: PascalCase<K>,
    callback: (value: InterfaceForService<T>[K]) => Promise<void>,
  ): void;
  /**
   * Update a characteristic value without triggering SET handlers
   *
   * @param key - Characteristic name (PascalCase)
   * @param value - New characteristic value
   *
   * @example
   * ```typescript
   * // Update brightness from external state change
   * service.update('Brightness', newBrightness);
   * ```
   */
  update<K extends CharacteristicNamesOf<T>>(
    key: PascalCase<K>,
    value: InterfaceForService<T>[K],
  ): void;
};

export type CharacteristicNamesOf<T extends typeof Service> = keyof Omit<
  InterfaceForService<T>,
  "UUID" | "serviceName"
>;

/**
 * Add or retrieve a service on a platform accessory and wrap it with fluent helpers.
 *
 * @param platformAccessory - Accessory that owns the service.
 * @param serviceClass - HAP service constructor.
 * @param loggerOrDisplayName - Logger instance or display name for the service.
 * @param displayNameOrSubType - Display name or subtype identifier.
 * @param subType - Optional subtype identifier (when displayName is provided).
 * @returns A fluent, strongly-typed service wrapper.
 */
export function getOrAddService<T extends typeof Service>(
  platformAccessory: PlatformAccessory,
  serviceClass: WithUUID<T>,
  loggerOrDisplayName?: Logger | string,
  displayNameOrSubType?: string,
  subType?: string,
): FluentService<T> {
  // Detect whether third argument is a logger or a display name
  // Logger objects have specific methods, while display names are just strings
  let logger: Logger | undefined;
  let displayName: string | undefined;
  let resolvedSubType: string | undefined;

  if (
    loggerOrDisplayName &&
    typeof loggerOrDisplayName === "object" &&
    "info" in loggerOrDisplayName
  ) {
    // Third argument is a logger
    logger = loggerOrDisplayName as Logger;
    displayName = displayNameOrSubType;
    resolvedSubType = subType;
  } else if (typeof loggerOrDisplayName === "string") {
    // Third argument is a display name (backward compatibility)
    logger = undefined;
    displayName = loggerOrDisplayName;
    resolvedSubType = displayNameOrSubType;
  }

  const finalLogger = logger || createNoOpLogger();

  if (typeof serviceClass !== "function") {
    finalLogger.error("Service class must be a constructor function", { serviceClass });
    throw new Error("Service class must be a constructor function");
  }
  if (!("UUID" in serviceClass)) {
    finalLogger.error("Service class must have a UUID property", { serviceClass });
    throw new Error("Service class must have a UUID property");
  }

  const existingService = resolvedSubType
    ? platformAccessory.getServiceById(serviceClass, resolvedSubType)
    : platformAccessory.getService(serviceClass);

  if (existingService) {
    finalLogger.debug("Found existing service", {
      displayName,
      subType: resolvedSubType,
      uuid: serviceClass.UUID,
    });
    return wrapService(existingService as InstanceType<T>, finalLogger);
  } else {
    finalLogger.debug("Creating new service", {
      displayName,
      subType: resolvedSubType,
      uuid: serviceClass.UUID,
    });
    const newService = new serviceClass(
      displayName ?? "",
      resolvedSubType ?? "",
    ) as InstanceType<T>;
    platformAccessory.addService(newService);

    finalLogger.info("Created and added new service", {
      displayName,
      subType: resolvedSubType,
      uuid: serviceClass.UUID,
      characteristicCount: newService.characteristics.length,
    });

    return wrapService(newService, finalLogger);
  }
}

/**
 * Wrap a HAP service with typed characteristic access and fluent helpers.
 *
 * @param service - Service instance to wrap.
 * @returns A fluent, strongly-typed service wrapper.
 * @throws {ValidationError} If service is invalid
 */
export function wrapService<T extends typeof Service>(service: InstanceType<T>): FluentService<T>;

/**
 * Wrap a HAP service with typed characteristic access and fluent helpers.
 *
 * @param service - Service instance to wrap.
 * @param logger - Logger instance for logging operations.
 * @returns A fluent, strongly-typed service wrapper.
 * @throws {ValidationError} If service is invalid
 */
export function wrapService<T extends typeof Service>(
  service: InstanceType<T>,
  logger: Logger,
): FluentService<T>;

export function wrapService<T extends typeof Service>(
  service: InstanceType<T>,
  logger?: Logger,
): FluentService<T> {
  const finalLogger = logger || createNoOpLogger();

  if (!isService(service)) {
    finalLogger.error("Invalid service object", { service });
    throw new ValidationError("Invalid service object", {
      value: service,
      expected: "HAP Service instance",
      actual: typeof service,
    });
  }

  finalLogger.debug("Wrapping service with fluent interface", {
    serviceName: service.displayName,
    uuid: service.UUID,
    characteristicCount: service.characteristics.length,
  });

  const e = {
    characteristics: Object.fromEntries(
      service.characteristics.map((p) => {
        const camelName = camelCase(p.displayName);
        return [camelName, new FluentCharacteristic(p, finalLogger)];
      }),
    ) as { [R in keyof FluentService<T>]: FluentCharacteristic<CharacteristicValue> },
  };

  const obj = {
    ...e,
    onGet: <K extends keyof InterfaceForService<T>>(
      key: K | PascalCase<K>,
      callback: () => Promise<InterfaceForService<T>[K]>,
    ) => {
      // Type assertion needed: TypeScript can't prove InterfaceForService[K] extends CharacteristicValue
      // Runtime validation happens in FluentCharacteristic
      return e.characteristics[camelCase(key as string) as keyof typeof e.characteristics].onGet(
        callback as unknown as () => Promise<CharacteristicValue>,
      );
    },
    onSet: <K extends keyof InterfaceForService<T>>(
      key: K | PascalCase<K>,
      callback: (value: InterfaceForService<T>[K]) => Promise<void>,
    ) => {
      // Type assertion needed: TypeScript can't prove CharacteristicValue extends InterfaceForService[K]
      // Runtime validation happens in FluentCharacteristic
      return e.characteristics[camelCase(key as string) as keyof typeof e.characteristics].onSet(
        callback as unknown as (value: CharacteristicValue) => Promise<void>,
      );
    },
    update: <K extends keyof InterfaceForService<T>>(
      key: K | PascalCase<K>,
      value: InterfaceForService<T>[K],
    ) => {
      // Type assertion needed: TypeScript can't prove InterfaceForService[K] extends CharacteristicValue
      // Runtime validation happens in FluentCharacteristic.update()
      e.characteristics[camelCase(key as string) as keyof typeof e.characteristics].update(
        value as unknown as CharacteristicValue,
      );
    },
  };

  for (const key in e.characteristics) {
    // Create camelCase property (e.g., "on", "brightness")
    Object.defineProperty(obj, key, {
      get: () => e.characteristics[key as keyof typeof e.characteristics].get(),
      set: (value) => e.characteristics[key as keyof typeof e.characteristics].set(value),
    });
  }

  return obj as FluentService<T>;
}
