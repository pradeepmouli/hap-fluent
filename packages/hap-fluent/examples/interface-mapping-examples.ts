import { Service } from "hap-nodejs";
import type {
  InterfaceFor,
  InterfaceForInstance,
  ConstructorForInterface,
  ServiceConstructorToInterface,
} from "../src/types/service-to-interface-mapping.js";
import type { AccessoryInformation, AirPurifier } from "../src/types/hap-interfaces.js";

// Example 1: Get interface type from constructor
type AccessoryInfoInterface = InterfaceFor<typeof Service.AccessoryInformation>;
// Result: AccessoryInformation interface

type AirPurifierInterface = InterfaceFor<typeof Service.AirPurifier>;
// Result: AirPurifier interface

// Example 2: Get interface type from instance
const airPurifierInstance = new Service.AirPurifier("Living Room");
type AirPurifierFromInstance = InterfaceForInstance<typeof airPurifierInstance>;
// Result: AirPurifier interface

// Example 3: Reverse mapping - get constructor from interface
type AccessoryInfoConstructor = ConstructorForInterface<AccessoryInformation>;
// Result: typeof Service.AccessoryInformation

type AirPurifierConstructor = ConstructorForInterface<AirPurifier>;
// Result: typeof Service.AirPurifier

// Example 4: Using with generics
function createTypedService<T extends keyof ServiceConstructorToInterface>(
  constructor: T,
  displayName: string,
): {
  service: InstanceType<T>;
  interface: ServiceConstructorToInterface[T];
} {
  const service = new constructor(displayName) as InstanceType<T>;

  return {
    service,
    interface: {} as ServiceConstructorToInterface[T], // Interface type for reference
  };
}

// Usage with full type safety
const typedAirPurifier = createTypedService(Service.AirPurifier, "Main Air Purifier");
// typedAirPurifier.service is typed as InstanceType<typeof Service.AirPurifier>
// typedAirPurifier.interface is typed as AirPurifier interface

// Example 5: Working with characteristics
function getCharacteristicValue<
  T extends keyof ServiceConstructorToInterface,
  K extends keyof ServiceConstructorToInterface[T],
>(service: InstanceType<T>, characteristicName: K): ServiceConstructorToInterface[T][K] {
  // This would access the characteristic with proper typing
  const characteristic = (
    service as unknown as { getCharacteristic: (name: string) => { value: unknown } }
  ).getCharacteristic(characteristicName as string);
  return characteristic?.value as ServiceConstructorToInterface[T][K];
}

// Usage
const accessoryInfo = new Service.AccessoryInformation("Test Accessory");
const manufacturerValue = getCharacteristicValue(accessoryInfo, "manufacturer");
// manufacturerValue is properly typed based on the interface
