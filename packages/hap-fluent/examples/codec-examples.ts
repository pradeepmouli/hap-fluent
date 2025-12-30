/**
 * Examples of using codec interceptors for two-way value transformation
 *
 * Codecs allow you to transform values when setting (encode) and retrieving (decode).
 * This is useful for converting between different formats, units, or representations.
 */

import { Service, Characteristic, Accessory, uuid } from "hap-nodejs";
import { wrapService } from "../src/FluentService.js";

// Example 1: Temperature unit conversion (Celsius <-> Fahrenheit)
function example1TemperatureConversion() {
  console.log("\n=== Example 1: Temperature Unit Conversion ===");

  const accessory = new Accessory("TempSensor", uuid.generate("temp-1"));
  const service = accessory.addService(Service.TemperatureSensor, "Temperature");
  service.addCharacteristic(Characteristic.CurrentTemperature);
  const wrapped = wrapService(service);

  // Convert between Celsius (HAP format) and Fahrenheit (user format)
  const tempChar = wrapped.characteristics.currentTemperature
    .codec(
      // encode: Convert Fahrenheit to Celsius for HAP
      (fahrenheit) => {
        const celsius = (((fahrenheit as number) - 32) * 5) / 9;
        console.log(`Encoding: ${fahrenheit}°F -> ${celsius}°C`);
        return celsius;
      },
      // decode: Convert Celsius to Fahrenheit for display
      (celsius) => {
        const fahrenheit = ((celsius as number) * 9) / 5 + 32;
        console.log(`Decoding: ${celsius}°C -> ${fahrenheit}°F`);
        return fahrenheit;
      },
    )
    // onSet receives the encoded HAP value, which is in Celsius
    .onSet(async (value) => {
      console.log(`Handler received encoded HAP value: ${value}°C`);
    });

  // When you set 72°F, HAP receives 22.2°C
  tempChar.set(72);

  // When HAP has 25°C, you get 77°F
  const currentValue = tempChar.get();
  console.log(`Current value: ${currentValue}°F`);
}

// Example 2: String format transformation
function example2StringFormatting() {
  console.log("\n=== Example 2: String Format Transformation ===");

  const accessory = new Accessory("Light", uuid.generate("light-2"));
  const service = accessory.addService(Service.Lightbulb, "Light");
  service.addCharacteristic(Characteristic.Name);
  const wrapped = wrapService(service);

  // Convert strings to/from uppercase
  const nameChar = wrapped.characteristics.name.codec(
    // encode: Convert to uppercase for storage
    (value) => {
      const upper = String(value).toUpperCase();
      console.log(`Encoding: "${value}" -> "${upper}"`);
      return upper;
    },
    // decode: Convert to lowercase for display
    (value) => {
      const lower = String(value).toLowerCase();
      console.log(`Decoding: "${value}" -> "${lower}"`);
      return lower;
    },
  );

  nameChar.set("Living Room Light");
  console.log(`Retrieved: ${nameChar.get()}`);
}

// Example 3: JSON serialization/deserialization
function example3JsonCodec() {
  console.log("\n=== Example 3: JSON Serialization ===");

  const accessory = new Accessory("Light", uuid.generate("light-3"));
  const service = accessory.addService(Service.Lightbulb, "Light");
  service.addCharacteristic(Characteristic.Name);
  const wrapped = wrapService(service);

  interface LightConfig {
    brightness: number;
    color: { r: number; g: number; b: number };
    mode: string;
  }

  // Store complex objects as JSON strings
  const configChar = wrapped.characteristics.name // Using Name as example storage
    .codec(
      // encode: Object to JSON string
      (value) => {
        const json = JSON.stringify(value);
        console.log(`Encoding object:`, value, `-> "${json}"`);
        return json;
      },
      // decode: JSON string to object
      (value) => {
        const obj = JSON.parse(String(value));
        console.log(`Decoding JSON:`, `"${value}"`, `->`, obj);
        return obj;
      },
    );

  const config: LightConfig = {
    brightness: 75,
    color: { r: 255, g: 200, b: 100 },
    mode: "sunset",
  };

  configChar.set(config);
  const retrieved = configChar.get();
  console.log(`Retrieved config:`, retrieved);
}

// Example 4: Percentage to 0-1 range conversion
function example4PercentageConversion() {
  console.log("\n=== Example 4: Percentage to Decimal Range ===");

  const accessory = new Accessory("Light", uuid.generate("light-4"));
  const service = accessory.addService(Service.Lightbulb, "Light");
  service.addCharacteristic(Characteristic.Brightness);
  const wrapped = wrapService(service);

  // Convert between percentage (0-100) and decimal (0-1)
  const brightnessChar = wrapped.characteristics.brightness
    .codec(
      // encode: Convert percentage to decimal
      (percent) => {
        const decimal = (percent as number) / 100;
        console.log(`Encoding: ${percent}% -> ${decimal}`);
        return decimal * 100; // HAP uses 0-100, but shows concept
      },
      // decode: Convert decimal to percentage
      (decimal) => {
        const percent = decimal as number;
        console.log(`Decoding: ${decimal} -> ${percent}%`);
        return percent;
      },
    )
    .onSet(async (value) => {
      console.log(`Handler received: ${value}%`);
    });

  brightnessChar.set(75);
  console.log(`Current brightness: ${brightnessChar.get()}%`);
}

// Example 5: Combining codec with other interceptors
function example5CombiningCodecWithInterceptors() {
  console.log("\n=== Example 5: Combining Codec with Other Interceptors ===");

  const accessory = new Accessory("TempSensor", uuid.generate("temp-5"));
  const service = accessory.addService(Service.TemperatureSensor, "Temperature");
  service.addCharacteristic(Characteristic.CurrentTemperature);
  const wrapped = wrapService(service);

  const tempChar = wrapped.characteristics.currentTemperature
    .log() // Log before transformation
    .codec(
      // Fahrenheit to Celsius
      (f) => (((f as number) - 32) * 5) / 9,
      // Celsius to Fahrenheit
      (c) => ((c as number) * 9) / 5 + 32,
    )
    .clamp(32, 212) // Clamp to valid Fahrenheit range (after decode)
    .limit(5, 1000) // Rate limit updates
    .onSet(async (value) => {
      console.log(`Final handler: ${value}°F`);
    });

  tempChar.set(72); // All interceptors apply in order
}

// Example 6: Bidirectional value mapping
function example6ValueMapping() {
  console.log("\n=== Example 6: Bidirectional Value Mapping ===");

  const accessory = new Accessory("Thermostat", uuid.generate("thermo-6"));
  const service = accessory.addService(Service.Thermostat, "Thermostat");
  service.addCharacteristic(Characteristic.TargetHeatingCoolingState);
  const wrapped = wrapService(service);

  // Map between numeric HAP values and string representations
  const modeMap: Record<number, string> = {
    0: "OFF",
    1: "HEAT",
    2: "COOL",
    3: "AUTO",
  };

  const reverseModeMap: Record<string, number> = {
    OFF: 0,
    HEAT: 1,
    COOL: 2,
    AUTO: 3,
  };

  const modeChar = wrapped.characteristics.targetHeatingCoolingState
    .codec(
      // encode: String to number for HAP
      (value) => {
        const str = String(value).toUpperCase();
        const num = reverseModeMap[str] ?? 0;
        console.log(`Encoding mode: "${str}" -> ${num}`);
        return num;
      },
      // decode: Number to string for display
      (value) => {
        const num = value as number;
        const str = modeMap[num] ?? "UNKNOWN";
        console.log(`Decoding mode: ${num} -> "${str}"`);
        return str;
      },
    )
    .onSet(async (value) => {
      console.log(`Mode set to: ${value}`);
    });

  modeChar.set("HEAT");
  console.log(`Current mode: ${modeChar.get()}`);
}

// Run all examples
function runAllExamples() {
  console.log("=== Codec Interceptor Examples ===\n");
  console.log("Codecs provide two-way transformation:");
  console.log("- encode: Transform values when SETTING (to HAP format)");
  console.log("- decode: Transform values when GETTING (from HAP format)\n");

  example1TemperatureConversion();
  example2StringFormatting();
  example3JsonCodec();
  example4PercentageConversion();
  example5CombiningCodecWithInterceptors();
  example6ValueMapping();

  console.log("\n=== All Examples Complete ===");
}

// Export for testing or run directly
export {
  example1TemperatureConversion,
  example2StringFormatting,
  example3JsonCodec,
  example4PercentageConversion,
  example5CombiningCodecWithInterceptors,
  example6ValueMapping,
  runAllExamples,
};

// Run if executed directly
if (require.main === module) {
  runAllExamples();
}
