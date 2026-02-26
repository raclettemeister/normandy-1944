import { expect, test } from "@playwright/test";

test("loads the main menu on a mobile viewport", async ({ page }) => {
  await page.goto("/");

  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  expect(viewport!.width).toBeLessThanOrEqual(430);

  await expect(page.getByTestId("main-menu")).toBeVisible();
  await expect(page.getByTestId("start-easy")).toBeVisible();
  await expect(page.getByTestId("start-easy")).toBeEnabled();
});
