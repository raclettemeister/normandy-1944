import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/mobile",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173/normandy-1944/",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 7"],
        browserName: "chromium",
      },
    },
  ],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173/normandy-1944/",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
