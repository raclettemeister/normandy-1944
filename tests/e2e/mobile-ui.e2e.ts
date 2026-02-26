import { test, expect, type Locator, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page, context: string) {
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    return {
      clientWidth: doc.clientWidth,
      docScrollWidth: doc.scrollWidth,
      bodyScrollWidth: body ? body.scrollWidth : 0,
    };
  });

  const widest = Math.max(metrics.docScrollWidth, metrics.bodyScrollWidth);
  expect(
    widest,
    `${context}: horizontal overflow (content=${widest}, viewport=${metrics.clientWidth})`
  ).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

async function expectMinHeight(locator: Locator, minHeight: number, label: string) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  expect(box, `${label}: expected a visible target for size checks`).not.toBeNull();
  if (!box) return;
  expect(box.height, `${label}: touch target too small`).toBeGreaterThanOrEqual(minHeight - 0.5);
}

async function expectPanelWithinViewport(page: Page, panel: Locator, label: string) {
  const viewport = page.viewportSize();
  expect(viewport, `${label}: viewport is unavailable`).not.toBeNull();
  if (!viewport) return;

  const box = await panel.boundingBox();
  expect(box, `${label}: panel should be visible`).not.toBeNull();
  if (!box) return;

  expect(box.x, `${label}: panel starts offscreen (left)`).toBeGreaterThanOrEqual(-1);
  expect(box.y, `${label}: panel starts offscreen (top)`).toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width, `${label}: panel exceeds viewport width`).toBeLessThanOrEqual(
    viewport.width + 1
  );
  expect(box.y + box.height, `${label}: panel exceeds viewport height`).toBeLessThanOrEqual(
    viewport.height + 1
  );
}

test.describe("mobile UI sanity", () => {
  test("menu, overlays, and controls remain mobile-safe", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("main-menu")).toBeVisible();
    await expectNoHorizontalOverflow(page, "main menu");

    await expectMinHeight(page.getByTestId("start-easy"), 44, "main menu start button");
    await page.getByTestId("start-easy").click();

    await expect(page.getByTestId("orders-btn")).toBeVisible();
    await expectNoHorizontalOverflow(page, "game screen");

    await expectMinHeight(page.getByTestId("orders-btn"), 44, "orders toolbar button");
    await expectMinHeight(page.getByTestId("roster-btn"), 44, "roster toolbar button");
    await expectMinHeight(page.getByTestId("wiki-btn"), 44, "wiki toolbar button");

    await page.getByTestId("situation-continue").click();
    const firstDecision = page.locator(".decision-btn").first();
    await expect(firstDecision).toBeVisible();
    await expectMinHeight(firstDecision, 44, "decision button");

    await page.getByTestId("orders-btn").click();
    const ordersPanel = page.getByTestId("orders-panel");
    await expect(ordersPanel).toBeVisible();
    await expectPanelWithinViewport(page, ordersPanel, "orders overlay");
    await expectMinHeight(
      ordersPanel.locator(".overlay-close"),
      44,
      "orders overlay close button"
    );
    await ordersPanel.locator(".overlay-close").click();

    await page.getByTestId("roster-btn").click();
    const rosterPanel = page.getByTestId("roster-panel");
    await expect(rosterPanel).toBeVisible();
    await expectPanelWithinViewport(page, rosterPanel, "roster overlay");
    await rosterPanel.locator(".overlay-close").click();

    await page.getByTestId("wiki-btn").click();
    const wikiPanel = page.getByTestId("wiki-panel");
    await expect(wikiPanel).toBeVisible();
    await expectPanelWithinViewport(page, wikiPanel, "wiki overlay");
    await expectMinHeight(
      wikiPanel.locator(".wiki-category-btn").first(),
      44,
      "wiki category button"
    );
    await wikiPanel.locator(".overlay-close").click();

    await expectNoHorizontalOverflow(page, "post-overlay game screen");
  });

  test("outcome transition remains tappable and non-clipped", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("start-easy").click();
    await page.getByTestId("situation-continue").click();

    const firstDecision = page.locator(".decision-btn").first();
    await expect(firstDecision).toBeVisible();
    await firstDecision.click();

    const continueButton = page.locator(".transition-prompt__btn");
    await expect(continueButton).toBeVisible();
    await expectMinHeight(continueButton, 44, "transition continue button");
    await expectNoHorizontalOverflow(page, "outcome transition");
  });
});
