#!/usr/bin/env node
/* =====================================================================
   tests/browser-test.mjs — end-to-end checks in a real browser.
   One-time setup:  npm install playwright && npx playwright install chromium
   Run from the app folder:  node tests/browser-test.mjs
   (Set PLAYWRIGHT_MODULE to a path if Playwright is installed elsewhere.)

   It serves this folder on a private local port, drives Chromium through
   every feature, and fails if any console error or warning appears.
   ===================================================================== */
import { createRequire } from "node:module";
import http from "node:http";
import { readFile, writeFile, mkdtemp } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, extname, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TMP = await mkdtemp(join(tmpdir(), "rpb-test-"));

// Build the single-file and preview versions so they are tested too.
const previewFile = join(TMP, "preview-body.html");
execFileSync(process.execPath, [join(ROOT, "tools", "build-single.mjs"), "--preview", previewFile], { stdio: "pipe" });
const previewPage = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>${readFileSync(previewFile, "utf8")}</body></html>`;

// ----- A tiny static server. `swVariant` lets the update test ship a "new" sw.js.
let swVariant = "";
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json", ".json": "application/json" };
const server = http.createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p === "/__preview.html") { res.writeHead(200, { "Content-Type": TYPES[".html"] }); res.end(previewPage); return; }
  if (p.endsWith("/")) p += "index.html";
  try {
    let body = await readFile(join(ROOT, p));
    if (p === "/sw.js" && swVariant) body = Buffer.from(body.toString().replace(/rpb-core-v[\d.]+/, "rpb-core-v-test-" + swVariant));
    res.writeHead(200, { "Content-Type": TYPES[extname(p)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(body);
  } catch (e) { res.writeHead(404); res.end("not found"); }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const consoleProblems = [];
const results = [];
let failures = 0;
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
async function test(name, fn) {
  const t0 = Date.now();
  try { await fn(); results.push(`  ✓ ${name} (${Date.now() - t0} ms)`); }
  catch (e) { failures++; results.push(`  ✗ ${name}: ${String(e.message).split("\n")[0]}`); }
}
async function newPage(opts = {}, label = "") {
  const ctx = opts.context || await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 900 }, reducedMotion: opts.reducedMotion || "reduce", colorScheme: opts.colorScheme || "light", acceptDownloads: true });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") consoleProblems.push(`[${label}] ${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => consoleProblems.push(`[${label}] page error: ${e.message}`));
  return { ctx, page };
}
const ready = (page) => page.waitForFunction(() => /all \d+ parts started/.test((document.getElementById("appHealth") || {}).textContent || ""), null, { timeout: 15000 });
const toastText = (page) => page.evaluate(() => Array.from(document.querySelectorAll(".toast")).map((t) => t.textContent).join(" | "));
async function download(page, selector) {
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 8000 }), page.click(selector)]);
  return { name: dl.suggestedFilename(), text: readFileSync(await dl.path(), "utf8") };
}

// ======================= TESTS =======================
await test("Loads over HTTP with every part started and no horizontal scroll at phone width", async () => {
  const { ctx, page } = await newPage({ viewport: { width: 360, height: 760 } }, "load");
  await page.goto(BASE + "/");
  await ready(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(overflow <= 0, `page scrolls sideways by ${overflow}px`);
  assert(await page.locator("main > section").count() === 11, "expected 11 sections");
  await ctx.close();
});

await test("Keyboard: skip link reaches the main content", async () => {
  const { ctx, page } = await newPage({}, "keyboard");
  await page.goto(BASE + "/");
  await ready(page);
  await page.keyboard.press("Tab");
  assert(await page.evaluate(() => document.activeElement.classList.contains("skip-link")), "first Tab should focus the skip link");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(150);
  assert(await page.evaluate(() => document.activeElement.id === "main" || location.hash === "#main"), "skip link should move to main");
  await ctx.close();
});

await test("Library: show all, search, topic filter, clear, citation copy and CSV export", async () => {
  const { ctx, page } = await newPage({}, "library");
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
  await page.goto(BASE + "/");
  await ready(page);
  assert((await page.textContent("#libraryCount")).includes("10 of 31"), "should start with the ten newest");
  await page.click(".library__more");
  assert((await page.textContent("#libraryCount")).includes("all 31"), "show all should list 31");
  await page.fill("#libQ", "water");
  await page.waitForTimeout(300);
  const n = await page.locator("#libraryMount .doc").count();
  assert(n > 0 && n < 31, `search for water should narrow the list (got ${n})`);
  await page.fill("#libQ", "");
  await page.click('#libraryFilters .chip[data-topic="children"]');
  const c = await page.locator("#libraryMount .doc").count();
  assert(c > 0 && c < 31, "topic filter should narrow the list");
  await page.click("#libClear");
  assert(await page.locator("#libraryMount .doc").count() === 31, "clear should show all 31");
  await page.click("#libraryMount .doc [data-cite]");
  await page.waitForTimeout(200);
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  assert(/\(\d{4}|n\.d\.\)/.test(clip) && /https:\/\//.test(clip), "citation should contain a year and a link");
  const csv = await download(page, "#libCsv");
  assert(csv.name.endsWith(".csv") && csv.text.startsWith("id,title,publisher") && csv.text.split("\r\n").length === 32, "CSV should have a header and 31 rows");
  await ctx.close();
});

await test("Evidence web: tracing a bridge highlights its sources; selecting a source jumps to it", async () => {
  const { ctx, page } = await newPage({}, "web");
  await page.goto(BASE + "/");
  await ready(page);
  await page.hover('#webMount a[data-bridge="water"]');
  const on = await page.locator("#webMount .web__link.is-on").count();
  assert(await page.locator("#webMount.is-tracing").count() === 1 && on === 6, `water bridge should light 6 links (got ${on})`);
  await page.click('#webMount a[data-doc="pbf-sl-gn-2024"]');
  await page.waitForTimeout(300);
  assert(await page.evaluate(() => document.activeElement && document.activeElement.id === "doc-pbf-sl-gn-2024"), "should focus the library card");
  await ctx.close();
});

await test("Bridges: open all, close all, copy as text and 'Plan this bridge'", async () => {
  const { ctx, page } = await newPage({}, "bridges");
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
  await page.goto(BASE + "/");
  await ready(page);
  await page.click("#bridgesOpenAll");
  assert(await page.locator(".bridge[open]").count() === 8, "all eight should open");
  await page.click("#bridgesCloseAll");
  assert(await page.locator(".bridge[open]").count() === 0, "all should close");
  await page.evaluate(() => { document.getElementById("bridge-seeds").open = true; });
  await page.click('[data-copy-bridge="seeds"]');
  await page.waitForTimeout(200);
  assert((await page.evaluate(() => navigator.clipboard.readText())).startsWith("Community seed systems"), "bridge text should be copied");
  await page.click('[data-plan="seeds"]');
  await page.waitForTimeout(300);
  assert(await page.inputValue("#plBridge") === "seeds", "planner should select the seeds bridge");
  assert(await page.locator("#plMeasures input[type=checkbox]").count() >= 5, "seed measures should be offered");
  await ctx.close();
});

await test("Practices filter, glossary filter and planner help links", async () => {
  const { ctx, page } = await newPage({}, "practices");
  await page.goto(BASE + "/");
  await ready(page);
  await page.click('#practiceFilter .chip[data-kind="healing"]');
  assert(await page.locator("#practicesMount .practice").count() === 2, "two healing practices");
  await page.fill("#glossaryInput", "tenure");
  await page.waitForTimeout(250);
  assert(await page.locator("#glossaryMount dt").count() === 1, "one glossary term for tenure");
  await page.click('#q-s1 a[data-practice="safe-ground"]');
  await page.waitForTimeout(300);
  assert(await page.evaluate(() => document.activeElement && document.activeElement.id === "practice-safe-ground"), "help link should reveal the practice (resetting the filter)");
  await ctx.close();
});

await test("Search: '/' opens it, arrows and Enter navigate, Escape closes in one press", async () => {
  const { ctx, page } = await newPage({}, "search");
  await page.goto(BASE + "/");
  await ready(page);
  await page.keyboard.press("/");
  assert(await page.locator("#dlgSearch[open]").count() === 1, "slash should open search");
  await page.keyboard.type("seed");
  await page.waitForTimeout(250);
  assert(await page.locator("#searchResults button").count() > 0, "results expected");
  await page.keyboard.press("Escape");
  assert(await page.locator("#dlgSearch[open]").count() === 0, "one Escape should close search");
  await page.keyboard.press("Control+K");
  await page.keyboard.type("look listen link");
  await page.waitForTimeout(250);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  assert(await page.locator("#dlgSearch[open]").count() === 0, "Enter should close search");
  assert(await page.evaluate(() => document.activeElement && document.activeElement.id === "practice-pfa"), "should land on psychological first aid");
  await ctx.close();
});

await test("Display settings: dark theme and plain language persist; reset clears them", async () => {
  const { ctx, page } = await newPage({}, "display");
  await page.goto(BASE + "/");
  await ready(page);
  await page.click("#btnDisplay");
  await page.check('input[name="pref-theme"][value="dark"]');
  await page.check('input[name="pref-level"][value="plain"]');
  assert(await page.getAttribute("html", "data-theme") === "dark", "dark theme applied");
  assert(await page.evaluate(() => getComputedStyle(document.querySelector(".doc__key")).display === "none"), "plain language hides detail");
  await page.click("#dlgDisplay .dlg__close");
  await page.reload();
  await ready(page);
  assert(await page.getAttribute("html", "data-theme") === "dark" && await page.getAttribute("html", "data-level") === "plain", "settings should persist");
  await page.click("#btnDisplay");
  await page.click("#btnResetDisplay");
  assert(await page.getAttribute("html", "data-theme") === null && await page.getAttribute("html", "data-level") === "full", "reset should clear settings");
  await ctx.close();
});

await test("Planner: readiness verdicts, autosave across reload, saved versions and restore", async () => {
  const { ctx, page } = await newPage({}, "planner");
  await page.goto(BASE + "/");
  await ready(page);
  await page.fill("#plProject", "Test plan one");
  await page.check('input[name="ans-c1"][value="yes"]', { force: true });
  assert((await page.textContent("#verdict")).includes("Groundwork needed"), "one answer: groundwork");
  await page.check('input[name="ans-s2"][value="no"]', { force: true });
  assert((await page.textContent("#verdict")).includes("Pause"), "critical no: pause");
  assert(await page.locator("#planner .plank--gap").count() === 1, "blocked area shows a gap in the bridge");
  for (const q of ["c1", "c2", "c3", "s1", "s2", "s3", "s4", "r1", "r2", "r3", "e1", "e2", "e3", "o1", "o2", "o3", "m1", "m2", "m3"]) await page.check(`input[name="ans-${q}"][value="yes"]`, { force: true });
  assert((await page.textContent("#verdict")).includes("Ready for a small"), "all yes: ready");
  await page.waitForTimeout(1100);
  await page.reload();
  await ready(page);
  await page.waitForFunction(() => document.getElementById("plProject") && document.getElementById("plProject").value === "Test plan one", null, { timeout: 5000 });
  assert(await page.isChecked('input[name="ans-m3"][value="yes"]'), "answers should persist");
  await page.click("#plSave");
  await page.fill("#plProject", "Test plan two");
  await page.waitForTimeout(100);
  await page.click("#plSave");
  await page.waitForTimeout(300);
  await page.click("#plVersions");
  const versions = await page.locator("#versionsList [data-restore]").count();
  assert(versions >= 1, "saved versions expected");
  await page.click("#versionsList [data-restore]");
  await page.waitForTimeout(300);
  assert(await page.inputValue("#plProject") === "Test plan one", "restore should bring back the earlier name");
  await ctx.close();
});

await test("Planner: dividers, connectors, custom measures and the brief", async () => {
  const { ctx, page } = await newPage({}, "brief");
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
  await page.goto(BASE + "/");
  await ready(page);
  await page.fill("#plProject", "Brief test");
  await page.selectOption("#plBridge", "water");
  await page.fill("#le-dividers", "Queue order disputes");
  await page.press("#le-dividers", "Enter");
  await page.fill("#le-connectors", "Shared market day");
  await page.press("#le-connectors", "Enter");
  await page.fill("#le-customMeasures", "Hours of light at the water point");
  await page.press("#le-customMeasures", "Enter");
  await page.check("#plMeasures input[type=checkbox] >> nth=0");
  const brief = await page.textContent("#brief");
  assert(brief.includes("Queue order disputes") && brief.includes("Shared market day") && brief.includes("Hours of light") && brief.includes("Smaller, safer first step"), "brief should reflect the plan");
  assert(!/null|\[object/.test(brief), "brief must not contain rendering artefacts");
  await page.click("#plCopy");
  await page.waitForTimeout(200);
  const md = await page.evaluate(() => navigator.clipboard.readText());
  assert(md.startsWith("# Plan brief: Brief test") && md.includes("## What divides people"), "markdown brief copied");
  const file = await download(page, "#plExportMd");
  assert(file.name.endsWith(".md") && file.text.includes("Zero Harm and Anti-Coercion"), "brief download should include the covenant line");
  await page.evaluate(() => { window.__printed = null; window.print = () => { window.__printed = document.body.classList.contains("print-brief"); }; });
  await page.click("#plPrint");
  await page.waitForTimeout(100);
  assert(await page.evaluate(() => window.__printed) === true, "print should use the brief-only layout");
  await ctx.close();
});

await test("Safety scan warns about phone numbers and coordinates before export", async () => {
  const { ctx, page } = await newPage({}, "safety");
  await page.goto(BASE + "/");
  await ready(page);
  await page.fill("#plNotes", "Call +235 66 12 34 56 at the site 12.1234, 15.5678. Years 2021-2024 are fine.");
  await page.click("#plExportJson");
  assert(await page.locator("#dlgSafety[open]").count() === 1, "safety dialog should open");
  const findings = await page.locator("#safetyFindings li").count();
  assert(findings === 2, `expected phone + coordinates, got ${findings}`);
  await page.click("#dlgSafetyEdit");
  assert(await page.locator("#dlgSafety[open]").count() === 0, "edit closes the dialog");
  await page.click("#plExportJson");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#dlgSafetyContinue")]);
  const data = JSON.parse(readFileSync(await dl.path(), "utf8"));
  assert(data.schema === 2 && data.plan.notes.includes("+235"), "continue anyway should export");
  await ctx.close();
});

await test("Import: version 2 and version 1 backups, with a confirmation step; bad files are refused", async () => {
  const { ctx, page } = await newPage({}, "import");
  await page.goto(BASE + "/");
  await ready(page);
  const v2 = join(TMP, "v2.json");
  await writeFile(v2, JSON.stringify({ schema: 2, plan: { project: "Imported two", bridge: "school", answers: { c1: "yes", zz: "evil" }, who: { women: "met" }, dividers: ["A", 5], notes: "<img src=x onerror=alert(1)>" } }));
  await page.setInputFiles("#plImport", v2);
  await page.waitForSelector("#dlgConfirm[open]");
  await page.click("#dlgConfirmOk");
  await page.waitForTimeout(400);
  assert(await page.inputValue("#plProject") === "Imported two" && await page.inputValue("#plBridge") === "school", "v2 import applied");
  assert(await page.evaluate(() => !document.querySelector("#brief img")), "imported text must never become HTML");
  const v1 = join(TMP, "v1.json");
  await writeFile(v1, JSON.stringify({ schema: 1, project: "From version one", place: "Region", notes: "Old notes", updated: "2026-10-01T00:00:00Z" }));
  await page.setInputFiles("#plImport", v1);
  await page.waitForSelector("#dlgConfirm[open]");
  await page.click("#dlgConfirmOk");
  await page.waitForTimeout(400);
  assert(await page.inputValue("#plProject") === "From version one", "v1 import applied");
  const bad = join(TMP, "bad.json");
  await writeFile(bad, "this is not json");
  await page.setInputFiles("#plImport", bad);
  await page.waitForTimeout(300);
  assert((await toastText(page)).includes("isn’t a readable backup"), "bad file should be refused with a clear message");
  await page.setInputFiles("#plImport", v2);
  await page.waitForSelector("#dlgConfirm[open]");
  await page.click("#dlgConfirmCancel");
  await page.waitForTimeout(200);
  assert(await page.inputValue("#plProject") === "From version one", "cancel keeps the current plan");
  await ctx.close();
});

await test("Version 1 draft is migrated once, and stays deleted after 'Delete this plan'", async () => {
  const { ctx, page } = await newPage({}, "migrate");
  await page.goto(BASE + "/");
  await ready(page);
  await page.evaluate(() => {
    localStorage.setItem("rpb_draft", JSON.stringify({ schema: 1, project: "My v1 draft", place: "District A", notes: "v1 notes", updated: "2026-09-01T00:00:00Z" }));
    localStorage.setItem("rpb_theme", "dark");
    return new Promise((r) => { const req = indexedDB.deleteDatabase("rpb"); req.onsuccess = req.onerror = req.onblocked = () => r(); });
  });
  await page.reload();
  await ready(page);
  await page.waitForFunction(() => document.getElementById("plProject").value === "My v1 draft", null, { timeout: 5000 });
  assert(await page.getAttribute("html", "data-theme") === "dark", "v1 theme preference honoured");
  await page.waitForSelector(".toast:has-text('version 1 draft')", { timeout: 4000 });
  await page.click("#plDelete");
  await page.click("#dlgConfirmOk");
  await page.waitForTimeout(300);
  await page.reload();
  await ready(page);
  await page.waitForTimeout(400);
  assert(await page.inputValue("#plProject") === "", "deleted plan must not come back from the v1 draft");
  await ctx.close();
});

await test("Auto-delete removes a plan untouched for longer than the chosen period", async () => {
  const { ctx, page } = await newPage({}, "ttl");
  await page.goto(BASE + "/");
  await ready(page);
  await page.fill("#plProject", "Old plan");
  await page.waitForTimeout(1000);
  await page.selectOption("#ttlSelect", "7");
  await page.evaluate(() => new Promise((resolve, reject) => {
    const req = indexedDB.open("rpb", 1);
    req.onsuccess = () => {
      const tx = req.result.transaction("kv", "readwrite");
      const st = tx.objectStore("kv");
      const g = st.get("workspace");
      g.onsuccess = () => { const ws = g.result; ws.updated = new Date(Date.now() - 10 * 86400000).toISOString(); st.put(ws, "workspace"); };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
  }));
  await page.reload();
  await ready(page);
  await page.waitForTimeout(800);
  assert(await page.inputValue("#plProject") === "", "plan should be auto-deleted");
  assert((await toastText(page)).includes("deleted automatically"), "auto-delete notice shown");
  await ctx.close();
});

await test("Delete everything clears plan and settings", async () => {
  const { ctx, page } = await newPage({}, "wipe");
  await page.goto(BASE + "/");
  await ready(page);
  await page.fill("#plProject", "To be wiped");
  await page.click("#btnDisplay");
  await page.check('input[name="pref-text"][value="large"]');
  await page.click("#dlgDisplay .dlg__close");
  await page.waitForTimeout(900);
  await page.click("#btnWipe");
  await page.click("#dlgConfirmOk");
  await page.waitForTimeout(500);
  await page.reload();
  await ready(page);
  await page.waitForTimeout(400);
  assert(await page.inputValue("#plProject") === "" && await page.getAttribute("html", "data-text") === "standard", "everything should be cleared");
  await ctx.close();
});

await test("Two tabs: a save in one offers 'Load latest' in the other", async () => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const a = (await newPage({ context: ctx }, "tab-a")).page;
  const b = (await newPage({ context: ctx }, "tab-b")).page;
  await a.goto(BASE + "/"); await ready(a);
  await b.goto(BASE + "/"); await ready(b);
  await a.fill("#plProject", "Changed in tab A");
  await a.click("#plSave");
  await b.waitForSelector(".toast button:has-text('Load latest')", { timeout: 5000 });
  await b.click(".toast button:has-text('Load latest')");
  await b.waitForTimeout(300);
  assert(await b.inputValue("#plProject") === "Changed in tab A", "tab B should load the latest plan");
  await ctx.close();
});

await test("Offline: the app reopens without a connection, and offers updates with a Reload button", async () => {
  const { ctx, page } = await newPage({}, "offline");
  await page.goto(BASE + "/");
  await ready(page);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  if (!(await page.evaluate(() => !!navigator.serviceWorker.controller))) { await page.reload(); await ready(page); }
  assert(await page.evaluate(() => !!navigator.serviceWorker.controller), "service worker should control the page");
  await ctx.setOffline(true);
  await page.reload();
  await ready(page);
  assert(await page.locator("#libraryMount .doc").count() >= 10, "library should render offline");
  assert((await page.textContent("#netStatus")).includes("Offline"), "status should say offline");
  await ctx.setOffline(false);
  swVariant = "b";
  await page.evaluate(async () => { const reg = await navigator.serviceWorker.getRegistration(); await reg.update(); });
  await page.waitForSelector(".toast button:has-text('Reload')", { timeout: 10000 });
  await Promise.all([page.waitForEvent("load", { timeout: 10000 }), page.click(".toast button:has-text('Reload')")]);
  await ready(page);
  const keys = await page.evaluate(() => caches.keys());
  assert(keys.includes("rpb-core-v-test-b") && keys.filter((k) => k.startsWith("rpb-")).length === 1, "new cache active, old one removed");
  swVariant = "";
  await ctx.close();
});

await test("Opened directly from the folder (file://): works with no errors", async () => {
  const { ctx, page } = await newPage({}, "file");
  await page.goto(pathToFileURL(join(ROOT, "index.html")).href);
  await ready(page);
  assert((await page.textContent("#netStatus")).includes("Opened from a file"), "status should explain file mode");
  assert(await page.locator("#libraryMount .doc").count() === 10, "library renders");
  await ctx.close();
});

await test("Single shareable file works offline from disk", async () => {
  const { ctx, page } = await newPage({}, "single");
  await page.goto(pathToFileURL(join(ROOT, "share", "regenerative-peace-bridges.html")).href);
  await ready(page);
  assert(await page.evaluate(() => window.RPB_BUILD && window.RPB_BUILD.mode === "single"), "single mode");
  const file = await download(page, "#plExportJson");
  assert(file.name.endsWith(".json"), "downloads work in the single file");
  await ctx.close();
});

await test("Embedded preview: copy instead of download, no print button, no service worker", async () => {
  const { ctx, page } = await newPage({}, "preview");
  await page.goto(BASE + "/__preview.html");
  await ready(page);
  assert(await page.locator("#plPrint").count() === 0, "no print button in preview");
  await page.click("#plExportJson");
  await page.waitForSelector("#dlgText[open]");
  assert((await page.inputValue("#dlgTextArea")).includes('"schema": 2'), "export text offered for copying");
  assert(await page.evaluate(async () => !(await navigator.serviceWorker.getRegistration())), "no service worker in preview");
  await ctx.close();
});

await test("Hero: animated with motion, a still frame with reduced motion", async () => {
  const { ctx, page } = await newPage({ reducedMotion: "no-preference" }, "hero-motion");
  await page.goto(BASE + "/");
  await ready(page);
  await page.waitForTimeout(1500);
  assert(await page.getAttribute("html", "data-motion") === "on", "motion on");
  // Read pixels from a copy, so the app's own canvas is never slowed by readback.
  const sample = () => page.evaluate(() => { const c = document.getElementById("heroCanvas"); const t = document.createElement("canvas"); t.width = c.width; t.height = c.height; const g = t.getContext("2d", { willReadFrequently: true }); g.drawImage(c, 0, 0); const x = g.getImageData(0, 0, t.width, t.height).data; let s = 0; for (let i = 0; i < x.length; i += 4000) s += x[i] + x[i + 1] + x[i + 2]; return s; });
  const s1 = await sample();
  await page.waitForTimeout(600);
  const s2 = await sample();
  assert(s1 > 0 && s1 !== s2, "hero should be drawn and moving");
  await ctx.close();
  const still = await newPage({ reducedMotion: "reduce" }, "hero-still");
  await still.page.goto(BASE + "/");
  await ready(still.page);
  await still.page.waitForTimeout(1200);
  assert(await still.page.getAttribute("html", "data-motion") === "off", "motion off");
  const snap = () => still.page.evaluate(() => document.getElementById("heroCanvas").toDataURL("image/png").length);
  const a = await snap();
  await still.page.waitForTimeout(500);
  const b = await snap();
  assert(a > 5000 && a === b, "a still frame should be drawn and stay unchanged");
  await still.ctx.close();
});

await test("No console errors or warnings anywhere", async () => {
  assert(consoleProblems.length === 0, consoleProblems.slice(0, 5).join(" || "));
});

await browser.close();
server.close();
console.log(results.join("\n"));
console.log(failures ? `\n✗ ${failures} test(s) failed.` : `\n✓ All ${results.length} browser tests passed.`);
process.exit(failures ? 1 : 0);
