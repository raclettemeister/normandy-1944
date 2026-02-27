import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "vite";
import { chromium } from "playwright";

interface DemoStep {
  label: string;
  prompt: string;
}

interface StepResult {
  label: string;
  prompt: string;
  narrativeLead: string;
  outcomeLead: string;
  statusMen: string;
  statusAmmo: string;
  statusMorale: string;
  statusReadiness: string;
  statusTime: string;
  screenshot: string;
}

const STEPS: DemoStep[] = [
  {
    label: "Landing",
    prompt:
      "I cut free first, whisper a gear roll call, and use AA arcs plus the steeple silhouette to set a calm northbound bearing before I move.",
  },
  {
    label: "Finding North",
    prompt:
      "I pace by compass checks and hedgerow counting, marking turns with shallow knife cuts so we do not loop in the bocage.",
  },
  {
    label: "First Contact",
    prompt:
      "One click challenge only. If response is wrong, fallback to Flash/Thunder. Weapon low but ready. Fold any friendly into rear security immediately.",
  },
  {
    label: "The Sergeant",
    prompt:
      "Use clicker from hard cover, confirm voices, then quietly consolidate under Henderson with sectors and noise discipline.",
  },
  {
    label: "The Patrol (Fun Prompt)",
    prompt:
      "Operation Midnight Accordion: Malone left through canal, Henderson base fire, I trigger the L-ambush when the Feldwebel bends over papers. No heroics.",
  },
  {
    label: "The Farmhouse",
    prompt:
      "Porch clicker first. No grenades until positive ID. Then controlled stack clear and immediate med/ammo triage inside.",
  },
  {
    label: "The Road",
    prompt:
      "Send paired scouts with hand signals, cross in bounds only after wire is confirmed cold, keep everyone below hedge line to avoid silhouette.",
  },
];

function shortLine(input: string, max = 160): string {
  const normalized = input.replace(/\s+/g, " ").trim();
  return normalized.length <= max ? normalized : `${normalized.slice(0, max)}...`;
}

async function clickContinueButtons(page: import("playwright").Page): Promise<void> {
  // Transition screen continue
  const transitionBtn = page.locator(".transition-prompt__btn");
  if (await transitionBtn.count()) {
    await transitionBtn.first().click();
  }

  // Optional interlude continue
  const interludeBtn = page.locator(".interlude-continue");
  if (await interludeBtn.count()) {
    await interludeBtn.first().click();
  }
}

async function run(): Promise<void> {
  const artifactsDir = resolve("artifacts", "hardcore-browser-demo");
  mkdirSync(artifactsDir, { recursive: true });

  const vite = await createServer({
    server: { host: "127.0.0.1", port: 4173, strictPort: true },
  });
  await vite.listen();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // mobile-ish viewport
  });
  const page = await context.newPage();

  try {
    await page.goto("http://127.0.0.1:4173/normandy-1944/", { waitUntil: "networkidle" });
    await page.getByTestId("main-menu").waitFor({ state: "visible" });

    await page.getByTestId("start-hardcore").click();
    await page.getByTestId("status-time").waitFor({ state: "visible" });

    const results: StepResult[] = [];

    for (let i = 0; i < STEPS.length; i += 1) {
      const step = STEPS[i];

      await page.getByTestId("situation-continue").waitFor({ state: "visible" });
      await page.getByTestId("situation-continue").click();

      const prepPhase = page.getByTestId("prep-phase");
      if (await prepPhase.isVisible({ timeout: 500 }).catch(() => false)) {
        const prepActions = page.locator("[data-testid^='prep-action-']");
        if ((await prepActions.count()) > 0) {
          await prepActions.first().click();
        }
        await page.getByTestId("prep-continue").click();
      }

      await page.getByTestId("free-text-input").waitFor({ state: "visible" });
      await page.getByTestId("free-text-input").fill(step.prompt);
      await page.getByTestId("free-text-submit").click();

      await page.getByTestId("briefing-phase").waitFor({ state: "visible" });
      await page.getByTestId("briefing-commit").click();

      await page.getByTestId("outcome-narrative").waitFor({ state: "visible" });
      // wait for local streaming animation to finish if active
      await page.waitForTimeout(400);

      const narrativeLead = shortLine(await page.getByTestId("narrative").innerText());
      const outcomeLead = shortLine(await page.getByTestId("outcome-narrative").innerText());
      const statusMen = shortLine(await page.getByTestId("status-men").innerText(), 80);
      const statusAmmo = shortLine(await page.getByTestId("status-ammo").innerText(), 80);
      const statusMorale = shortLine(await page.getByTestId("status-morale").innerText(), 80);
      const statusReadiness = shortLine(
        await page.getByTestId("status-readiness").innerText(),
        80
      );
      const statusTime = shortLine(await page.getByTestId("status-time").innerText(), 80);

      const screenshot = `step-${String(i + 1).padStart(2, "0")}.png`;
      await page.screenshot({ path: resolve(artifactsDir, screenshot), fullPage: true });

      results.push({
        label: step.label,
        prompt: step.prompt,
        narrativeLead,
        outcomeLead,
        statusMen,
        statusAmmo,
        statusMorale,
        statusReadiness,
        statusTime,
        screenshot,
      });

      await clickContinueButtons(page);
    }

    const reportLines: string[] = [];
    reportLines.push("# Hardcore Browser Demo (Real Browser, Mobile Viewport)");
    reportLines.push("");
    reportLines.push("- Runtime: local Vite server + Playwright Chromium");
    reportLines.push("- Viewport: 390x844");
    reportLines.push("- Mode: Hardcore with offline AI narrator");
    reportLines.push("");

    for (const [idx, result] of results.entries()) {
      reportLines.push(`## ${idx + 1}. ${result.label}`);
      reportLines.push(`- Prompt: ${result.prompt}`);
      reportLines.push(`- Scene lead: ${result.narrativeLead}`);
      reportLines.push(`- Outcome lead: ${result.outcomeLead}`);
      reportLines.push(
        `- Status: ${result.statusMen} | ${result.statusAmmo} | ${result.statusMorale} | ${result.statusReadiness} | ${result.statusTime}`
      );
      reportLines.push(`- Screenshot: artifacts/hardcore-browser-demo/${result.screenshot}`);
      reportLines.push("");
    }

    const reportPath = resolve(artifactsDir, "report.md");
    writeFileSync(reportPath, reportLines.join("\n"), "utf8");
    console.log(`Hardcore browser demo complete. Report: ${reportPath}`);
  } finally {
    await context.close();
    await browser.close();
    await vite.close();
  }
}

run().catch((error) => {
  console.error("Hardcore browser demo failed:", error);
  process.exitCode = 1;
});
