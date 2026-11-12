// Tangkapan layar SEJENAK dengan Playwright.
// node shoot.mjs <outDir> <shotsJson> [baseUrl]
// shots: [{ name, role, path, w, h, theme, full, actions:[{click:"text"}|{fill:[sel,val]}|{wait:ms}|{press:key}|{eval:"js"}] }]
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const [outDir, shotsFile, base = "http://localhost:5173"] = process.argv.slice(2);
const shots = JSON.parse(fs.readFileSync(shotsFile, "utf8"));
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();

for (const s of shots) {
  const mobile = (s.w ?? 390) < 700;
  const ctx = await browser.newContext({
    viewport: { width: s.w ?? 390, height: s.h ?? 844 },
    deviceScaleFactor: s.dpr ?? 2,
    colorScheme: s.theme ?? "light",
    isMobile: mobile, hasTouch: mobile, reducedMotion: s.reduced ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(base + "/masuk");
  await page.evaluate(() => localStorage.clear());
  await page.goto(base + "/masuk");
  if (s.role) {
    const label = { mahasiswa: "Mahasiswa", peer: "Teman Sejenak", bk: "Konselor BK", admin: "Admin kampus" }[s.role];
    await page.getByRole("button", { name: label, exact: true }).click();
    await page.getByRole("button", { name: /data contoh/ }).click();
    await page.waitForTimeout(800);
  }
  if (s.path) await page.goto(base + s.path);
  await page.waitForTimeout(500);
  for (const a of s.actions ?? []) {
    if (a.click) await page.getByText(a.click, { exact: a.exact ?? false }).first().click();
    if (a.role) await page.getByRole(a.role[0], { name: a.role[1] }).first().click();
    if (a.fill) await page.fill(a.fill[0], a.fill[1]);
    if (a.press) await page.keyboard.press(a.press);
    if (a.eval) await page.evaluate(a.eval);
    if (a.goto) await page.goto(base + a.goto);
    await page.waitForTimeout(a.wait ?? 350);
  }
  await page.waitForTimeout(s.settle ?? 400);
  const file = path.join(outDir, `${s.name}.png`);
  await page.screenshot({ path: file, fullPage: s.full ?? false });
  console.log(file, errors.length ? "ERR: " + errors.join(" | ") : "");
  await ctx.close();
}
await browser.close();
