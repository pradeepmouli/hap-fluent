/**
 * Example: Error scenario testing with network simulation
 *
 * Demonstrates how to test plugin behavior under network failures,
 * timeouts, and disconnection scenarios.
 */

import { TestHarness } from "../src/TestHarness.js";
import { NetworkSimulator } from "../src/NetworkSimulator.js";
import { NetworkError, NetworkErrorType } from "../src/errors/NetworkError.js";
import { MockAccessory, MockService, MockCharacteristic } from "../src/MockHomeKit.js";
import type { HarnessOptions } from "../src/types/harness.js";

async function runErrorScenarios() {
  // Setup test harness
  const options: HarnessOptions = {
    platformConstructor: undefined as any,
    platformConfig: {
      platform: "TestPlatform",
      name: "Test",
    },
  };

  const harness = await TestHarness.create(options);
  const simulator = new NetworkSimulator();
  harness.homeKit.setNetworkSimulator(simulator);

  // Create a thermostat accessory
  const thermostat = new MockAccessory("thermostat-uuid", "Living Room Thermostat");
  const service = new MockService("Thermostat", "Thermostat");
  service.addCharacteristic(
    new MockCharacteristic("CurrentTemperature", "CurrentTemperature", 22, {
      format: "float",
      perms: ["pr", "ev"],
      minValue: -50,
      maxValue: 100,
    }),
  );
  service.addCharacteristic(
    new MockCharacteristic("TargetTemperature", "TargetTemperature", 20, {
      format: "float",
      perms: ["pr", "pw", "ev"],
      minValue: 10,
      maxValue: 38,
    }),
  );
  thermostat.addService(service);
  harness.homeKit.addAccessory(thermostat);

  const targetChar = harness.homeKit.characteristic(
    "thermostat-uuid",
    "Thermostat",
    "TargetTemperature",
  );

  console.log("🧪 Error Scenario Testing\n");

  // Scenario 1: Network latency
  console.log("1️⃣  Testing with 500ms latency...");
  simulator.setLatency(500);

  const start1 = Date.now();
  await targetChar?.setValue(22);
  const elapsed1 = Date.now() - start1;
  console.log(`   ✓ Set operation completed in ${elapsed1}ms (expected ~500ms)\n`);

  // Scenario 2: Packet loss
  console.log("2️⃣  Testing packet loss (100% loss rate)...");
  simulator.setLatency(0);
  simulator.setPacketLoss(1.0);

  try {
    await targetChar?.getValue();
    console.log("   ✗ Expected packet loss error!\n");
  } catch (error) {
    if (error instanceof NetworkError && error.errorType === NetworkErrorType.PACKET_LOSS) {
      console.log("   ✓ Correctly threw packet loss error\n");
    }
  }

  // Scenario 3: Network disconnection
  console.log("3️⃣  Testing network disconnection...");
  simulator.reset();
  simulator.disconnect();

  try {
    await targetChar?.setValue(21);
    console.log("   ✗ Expected disconnection error!\n");
  } catch (error) {
    if (error instanceof NetworkError && error.errorType === NetworkErrorType.DISCONNECTED) {
      console.log("   ✓ Correctly threw disconnection error\n");
    }
  }

  // Scenario 4: Recovery after reconnection
  console.log("4️⃣  Testing recovery after reconnection...");
  simulator.reconnect();

  await targetChar?.setValue(23);
  const value = await targetChar?.getValue();
  console.log(`   ✓ Successfully set and read value after reconnection: ${value}°C\n`);

  // Scenario 5: Combined latency + intermittent failures
  console.log("5️⃣  Testing combined conditions (200ms latency + 30% packet loss)...");
  simulator.reset();
  simulator.setLatency(200);
  simulator.setPacketLoss(0.3);

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < 10; i++) {
    try {
      await targetChar?.getValue();
      successCount++;
    } catch {
      failureCount++;
    }
  }

  console.log(`   ✓ Results: ${successCount} succeeded, ${failureCount} failed`);
  console.log(`   (Expected ~70% success rate with 30% packet loss)\n`);

  console.log("✅ All error scenarios tested successfully!");

  harness.shutdown();
}

export { runErrorScenarios };
