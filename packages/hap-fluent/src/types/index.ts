// Re-export all the types from the interface files
//export * from "./hap-interfaces.js";
export * from "./hap-enums.js";
import { InterfaceMap, ServiceMap } from "./hap-interfaces.js";

import type { Service } from "hap-nodejs";

// Re-export with explicit names to resolve ambiguity
export type { InterfaceMap } from "./hap-interfaces.js";
export type { ServiceMap } from "./hap-interfaces.js";
/**
 * Utility interface for services with typed UUIDs
 * This is kept for backward compatibility but is no longer needed
 * with the new generic type mapping approach
 */
export interface WithTypedUUID<T extends string> {
  UUID: T;
}

export type InterfaceForService<T extends typeof Service> = T extends {
  interface: infer I;
}
  ? I
  : never;

export type Services = ServiceMap[keyof ServiceMap];

export type Interfaces = InterfaceMap[keyof InterfaceMap];

export type ServiceForInterface<T extends Interfaces> = T["serviceName"] extends keyof ServiceMap
  ? ServiceMap[T["serviceName"]]
  : never;
