import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'dist/',
				'**/*.d.ts',
				'**/*.config.ts',
				'**/test/**',
			],
		},
		include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
		exclude: ['node_modules', 'dist'],
	},
});
