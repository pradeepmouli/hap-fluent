import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			include: ['src/**/*.ts'],
			exclude: [
				'src/**/*.d.ts',
				'src/types/**',
				'src/**/index.ts',
				'test/**',
				'examples/**',
			],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 70,
				statements: 80,
			},
		},
		include: ['test/**/*.test.ts'],
		exclude: ['node_modules', 'dist'],
		testTimeout: 5000,
		hookTimeout: 10000,
	},
});
