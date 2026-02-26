import { expect, test } from "@playwright/test";

test("main menu renders on mobile", async ({ page }) => {
  await page.goto("/normandy-1944/");

  await expect(page.getByTestId("main-menu")).toBeVisible();
  await expect(page.getByTestId("start-easy")).toBeVisible();
  await expect(page.getByTestId("start-medium")).toBeVisible();
  await expect(page.getByTestId("start-hardcore")).toBeVisible();
});
