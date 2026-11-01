import { chromium, expect } from "@playwright/test";
import { staticServer } from "./serve.mjs";
const server = await staticServer(0);
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests = [];
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await context.route("https://www.googletagmanager.com/**", async (route) => {
    requests.push(route.request().url());
    await route.fulfill({
      contentType: "application/javascript",
      body: "window.__gaMockLoaded=true;",
    });
  });
  await context.route("https://www.clarity.ms/**", async (route) => {
    requests.push(route.request().url());
    await route.fulfill({
      contentType: "application/javascript",
      body: "window.__clarityMockLoaded=true;",
    });
  });
  await page.goto(base + "/json-formatter?private=do-not-measure");
  await expect(
    page.getByRole("button", { name: "Accept analytics", exact: true }),
  ).toBeVisible();
  expect(requests).toHaveLength(0);
  const defaults = await page.evaluate(() => Array.from(window.dataLayer[0]));
  expect(defaults[0]).toBe("consent");
  expect(defaults[1]).toBe("default");
  expect(defaults[2].analytics_storage).toBe("denied");
  await expect(page.locator(".workspace-wrap")).toHaveAttribute(
    "data-clarity-mask",
    "true",
  );
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  expect(requests).toHaveLength(0);
  await page
    .getByRole("button", { name: "Cookie settings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Accept analytics", exact: true })
    .click();
  await expect.poll(() => requests.length).toBe(2);
  expect(requests.some((u) => u.includes("G-PTMKFXTDC8"))).toBe(true);
  expect(requests.some((u) => u.includes("z6v4zidf6c"))).toBe(true);
  const data = await page.evaluate(() =>
    window.dataLayer.map((x) => Array.from(x)),
  );
  const configs = data.filter((x) => x[0] === "config");
  expect(configs).toHaveLength(1);
  expect(configs[0][1]).toBe("G-PTMKFXTDC8");
  expect(configs[0][2].page_location).toBe(base + "/json-formatter");
  expect(configs[0][2].send_page_view).toBe(true);
  expect(
    data.filter((x) => x[0] === "event" && x[1] === "page_view"),
  ).toHaveLength(0);
  const clarity = await page.evaluate(() => Array.from(window.clarity.q[0]));
  expect(clarity).toEqual([
    "consentv2",
    { analytics_Storage: "granted", ad_Storage: "denied" },
  ]);
  await page
    .getByRole("button", { name: "Cookie settings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Accept analytics", exact: true })
    .click();
  expect(requests).toHaveLength(2);
  await page
    .getByRole("button", { name: "Cookie settings", exact: true })
    .click();
  await expect(page.getByText(/Rejecting now reloads/)).toBeVisible();
  await Promise.all([
    page.waitForEvent("load"),
    page.getByRole("button", { name: "Reject & reload", exact: true }).click(),
  ]);
  expect(await page.evaluate(() => window.miToolsAnalytics.getConsent())).toBe(
    "denied",
  );
  expect(requests).toHaveLength(2);
  await expect(page.locator("#mi-tools-ga, #mi-tools-clarity")).toHaveCount(0);
  await page.goto(base + "/");
  await expect(page.locator(".consent-banner")).toHaveCount(0);
  expect(requests).toHaveLength(2);
  // Accepted returning visitor: same document gets one tag per vendor.
  await page.evaluate(() => window.miToolsAnalytics.setConsent("granted"));
  await expect.poll(() => requests.length).toBe(4);
  await page.reload();
  await expect.poll(() => requests.length).toBe(6);
  const returningConfigs = await page.evaluate(() =>
    window.dataLayer.map((x) => Array.from(x)).filter((x) => x[0] === "config"),
  );
  expect(returningConfigs).toHaveLength(1);
  // Expired choice asks again rather than silently granting consent.
  await page.evaluate(() =>
    localStorage.setItem(
      "mi-tools-consent-v1",
      JSON.stringify({
        choice: "granted",
        time: Date.now() - 181 * 24 * 60 * 60 * 1000,
      }),
    ),
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Accept analytics", exact: true }),
  ).toBeVisible();
  expect(requests).toHaveLength(6);
  expect(errors).toEqual([]);
  console.log(
    "Analytics checks passed: denied by default, both IDs, one config per document, consent updates, masking, sanitized page URL, revocation, returning visits, and expiry. Vendor requests were mocked.",
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
