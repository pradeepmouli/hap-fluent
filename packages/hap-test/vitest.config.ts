import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,js}"],
      exclude: ["**/*.d.ts", "**/types/**", "**/index.ts", "test/**", "examples/**"],
      all: true,
      clean: true,
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
    include: ["test/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
    testTimeout: 5000,
    hookTimeout: 10000,
  },
});
