/**
 * Example: using TimeController with event subscriptions
 */

import { TestHarness } from '../src/TestHarness.js';
import { MockAccessory, MockService, MockCharacteristic } from '../src/MockHomeKit.js';

async function main(): Promise<void> {
	const harness = await TestHarness.create({
		platformConstructor: undefined as any,
		platformConfig: { platform: 'ExamplePlatform', name: 'Example' },
	});

	const accessory = new MockAccessory('time-demo', 'Time Demo');
	const service = new MockService('Lightbulb', 'Lightbulb');
	const characteristic = new MockCharacteristic('On', 'On', false, {
		format: 'bool',
		perms: ['pr', 'pw', 'ev'],
	});

	service.addCharacteristic(characteristic);
	accessory.addService(service);
	harness.homeKit.addAccessory(accessory);

	// Subscribe to notifications
	const subscription = characteristic.subscribe();
	const eventPromise = subscription.waitForNext(5000);

	// Schedule a state change in the future using fake time
	setTimeout(async () => {
		await characteristic.setValue(true);
	}, 1000);

	// Advance time to trigger the timer deterministically
	await harness.time.advance(1000);
	const event = await eventPromise;

	console.log('Received event at timestamp', event.timestamp);
	console.log('New value:', event.newValue);

	subscription.unsubscribe();
	harness.shutdown();
}

main().catch(err => {
	console.error('Example failed', err);
});
