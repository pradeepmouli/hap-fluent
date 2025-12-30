/**
 * Example: Debug mode usage
 *
 * Demonstrates how to enable debug logging for troubleshooting
 * and understanding test behavior
 */

import { TestHarness } from "../src/TestHarness.js";
import { MockAccessory, MockService, MockCharacteristic } from "../src/MockHomeKit.js";
import { logger, LogLevel, LogCategory } from "../src/utils/logger.js";
import type { HarnessOptions } from "../src/types/harness.js";

async function demonstrateDebugMode() {
  console.log("🔍 Debug Mode Demonstration\n");

  // Example 1: Enable all debug logging
  console.log("1️⃣  Creating harness with full debug logging...\n");

  const options1: HarnessOptions = {
    platformConstructor: undefined as any,
    platformConfig: {
      platform: "TestPlatform",
      name: "Debug Test",
    },
    logging: {
      debug: true,
      level: "DEBUG", // Log everything
    },
  };

  const harness1 = await TestHarness.create(options1);

  // Create and add an accessory (will generate debug logs)
  const light = new MockAccessory("light-uuid", "Living Room Light");
  const service = new MockService("Lightbulb", "Lightbulb");
  service.addCharacteristic(
    new MockCharacteristic("On", "On", false, {
      format: "bool",
      perms: ["pr", "pw", "ev"],
    }),
  );
  service.addCharacteristic(
    new MockCharacteristic("Brightness", "Brightness", 0, {
      format: "int",
      perms: ["pr", "pw", "ev"],
      minValue: 0,
      maxValue: 100,
    }),
  );
  light.addService(service);
  harness1.homeKit.addAccessory(light);

  // Perform operations (will generate logs)
  await harness1.homeKit.characteristic("light-uuid", "Lightbulb", "On")?.setValue(true);
  await harness1.homeKit.characteristic("light-uuid", "Lightbulb", "Brightness")?.setValue(75);
  const brightness = await harness1.homeKit
    .characteristic("light-uuid", "Lightbulb", "Brightness")
    ?.getValue();

  console.log(`\n✓ Operations completed with debug logging enabled`);
  console.log(`  Current brightness: ${brightness}%\n`);

  harness1.shutdown();

  // Example 2: Enable only specific categories
  console.log("2️⃣  Filtering logs to only CHARACTERISTIC category...\n");

  logger.reset(); // Clear previous logs
  logger.enable(LogLevel.DEBUG);
  logger.enableCategories(LogCategory.CHARACTERISTIC); // Only characteristic operations

  const options2: HarnessOptions = {
    platformConstructor: undefined as any,
    platformConfig: {
      platform: "TestPlatform",
      name: "Filtered Test",
    },
  };

  const harness2 = await TestHarness.create(options2);
  harness2.homeKit.addAccessory(light); // Won't log (ACCESSORY category filtered out)

  await harness2.homeKit.characteristic("light-uuid", "Lightbulb", "On")?.setValue(false); // Will log
  await harness2.homeKit.characteristic("light-uuid", "Lightbulb", "Brightness")?.setValue(50); // Will log

  console.log("✓ Only characteristic operations were logged\n");

  harness2.shutdown();

  // Example 3: Using different log levels
  console.log("3️⃣  Using INFO level (less verbose)...\n");

  logger.reset();
  logger.enable(LogLevel.INFO); // Only INFO, WARN, ERROR

  const options3: HarnessOptions = {
    platformConstructor: undefined as any,
    platformConfig: {
      platform: "TestPlatform",
      name: "Info Level Test",
    },
  };

  const harness3 = await TestHarness.create(options3);
  harness3.homeKit.addAccessory(light);

  // setValue logs at INFO level, getValue logs at DEBUG level
  await harness3.homeKit.characteristic("light-uuid", "Lightbulb", "Brightness")?.setValue(100); // Will log
  await harness3.homeKit.characteristic("light-uuid", "Lightbulb", "Brightness")?.getValue(); // Won't log (DEBUG)

  console.log("✓ Only INFO and higher level logs were shown\n");

  harness3.shutdown();

  // Example 4: Exporting logs for analysis
  console.log("4️⃣  Exporting logs for analysis...\n");

  logger.reset();
  logger.enable(LogLevel.DEBUG);

  const options4: HarnessOptions = {
    platformConstructor: undefined as any,
    platformConfig: {
      platform: "TestPlatform",
      name: "Export Test",
    },
  };

  const harness4 = await TestHarness.create(options4);
  harness4.homeKit.addAccessory(light);
  await harness4.homeKit.characteristic("light-uuid", "Lightbulb", "On")?.setValue(true);
  await harness4.homeKit.characteristic("light-uuid", "Lightbulb", "Brightness")?.setValue(80);

  // Get logs for analysis
  const allLogs = logger.getLogs();
  const charLogs = logger.getLogsByCategory(LogCategory.CHARACTERISTIC);

  console.log(`✓ Captured ${allLogs.length} total log entries`);
  console.log(`✓ ${charLogs.length} characteristic-related logs`);

  // Export logs as JSON
  const logsJson = logger.export();
  console.log(`\n✓ Logs can be exported for offline analysis:`);
  console.log(`  ${logsJson.split("\n").length} lines of JSON data\n`);

  harness4.shutdown();

  // Example 5: Production mode (no logging)
  console.log("5️⃣  Production mode with logging disabled...\n");

  logger.reset();
  logger.disable(); // Turn off all logging

  const options5: HarnessOptions = {
    platformConstructor: undefined as any,
    platformConfig: {
      platform: "TestPlatform",
      name: "Production Test",
    },
  };

  const harness5 = await TestHarness.create(options5);
  harness5.homeKit.addAccessory(light);
  await harness5.homeKit.characteristic("light-uuid", "Lightbulb", "Brightness")?.setValue(60);

  console.log("✓ Operations completed silently (no debug output)\n");

  harness5.shutdown();

  console.log("✅ Debug mode demonstration complete!");
  console.log("\n💡 Use debug logging to:");
  console.log("  • Understand test execution flow");
  console.log("  • Troubleshoot failing tests");
  console.log("  • Verify characteristic operations");
  console.log("  • Track accessory registration");
  console.log("  • Analyze timing issues");
}

export { demonstrateDebugMode };
