import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  fullyParallel: false,
  globalTeardown: "./tests/e2e/global-teardown.ts",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: process.env.PLAYWRIGHT_USE_PROD ? "npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: false,
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "mobile",
      dependencies: ["setup"],
      testMatch: /.*\.spec\.ts/,
      use: { ...devices["iPhone 13"], storageState: "playwright/.auth/user.json" },
    },
  ],
});
