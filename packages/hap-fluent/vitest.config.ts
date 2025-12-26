import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			exclude: [
				'node_modules/',
				'dist/',
				'**/*.d.ts',
				'**/*.config.ts',
				'**/test/**',
				'**/examples/**',
			],
			thresholds: {
				lines: 80,
				branches: 70,
				functions: 70,
				statements: 80,
			},
		},
		include: [
			'test/unit/**/*.test.ts',
			'test/integration/**/*.test.ts',
			'test/property-based/**/*.test.ts',
		],
		exclude: ['node_modules', 'dist'],
	},
});
