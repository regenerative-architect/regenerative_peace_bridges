#!/usr/bin/env node
/* =====================================================================
   tests/browser-test.mjs — end-to-end checks in a real browser.
   One-time setup:  npm install playwright && npx playwright install chromium
   Run from the app folder:  node tests/browser-test.mjs
   Run only some tests:      node tests/browser-test.mjs --only "Planner"
   (Set PLAYWRIGHT_MODULE to a path if Playwright is installed elsewhere.)

   It serves this folder on a private local port, drives Chromium through
   every feature (in English, French and Arabic), and fails if any console
   error or warning appears.
   ===================================================================== */
import { createRequire } from "node:module";
import http from "node:http";
import { readFile, writeFile, mkdtemp, mkdir } from "node:fs/promises";
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
const previewPage = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><link rel="icon" href="icon.svg"></head><body>${readFileSync(previewFile, "utf8")}</body></html>`;
const DOCS = (() => { const box = { window: {} }; require("node:vm").runInNewContext(readFileSync(join(ROOT, "data.js"), "utf8"), box); return box.window.RPB; })();
const N_DOCS = DOCS.documents.length;
const N_BRIDGES = DOCS.bridges.length;

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

const browser = await chromium.launch(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {});
const consoleProblems = [];
const results = [];
let failures = 0;
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const ONLY = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] || "" : "";
async function test(name, fn) {
  if (ONLY && !name.includes(ONLY) && !name.startsWith("No console")) return;
  const t0 = Date.now();
  try { await fn(); results.push(`  ✓ ${name} (${Date.now() - t0} ms)`); }
  catch (e) { if(ONLY) console.error(e.stack); failures++; results.push(`  ✗ ${name}: ${String(e.message).split("\n")[0]}`); }
}
async function newPage(opts = {}, label = "") {
  const ctx = opts.context || await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 900 }, reducedMotion: opts.reducedMotion || "reduce", colorScheme: opts.colorScheme || "light", acceptDownloads: true });
  const page = await ctx.newPage();
  page.on("response", r => { if (r.status() >= 400) consoleProblems.push(`[${label}] HTTP ${r.status()}: ${r.url()}`); });
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") consoleProblems.push(`[${label}] ${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => consoleProblems.push(`[${label}] page error: ${e.message}`));
  return { ctx, page };
}
// Every part started, including the planner (which waits for storage). Works in any language.
const ready = async (page) => { try { await page.waitForSelector('#appHealth[data-state="ok"]', { timeout: 15000, state: 'attached' }); } catch (e) { throw Error("App startup: " + await page.evaluate(() => document.querySelector('#appHealth')?.textContent || document.body.textContent.slice(0,200))); } };
const toastText = (page) => page.evaluate(() => Array.from(document.querySelectorAll(".toast")).map((t) => t.textContent).join(" | "));
async function download(page, selector) {
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 8000 }), page.click(selector)]);
  return { name: dl.suggestedFilename(), text: readFileSync(await dl.path(), "utf8") };
}
async function chooseLanguage(page, code) {
  await page.click("#btnLanguage");
  await page.selectOption("#langSelect", code);
  await page.waitForFunction((c) => document.documentElement.lang === c, code);
  await page.click("#dlgLanguage .dlg__close");
}
// Read and write the app's IndexedDB store directly (to set up old or
// expired data). No eval: the app's security policy forbids it.
const idbPut = (page, key, value) => page.evaluate(([k, v]) => new Promise((resolve, reject) => {
  const req = indexedDB.open("rpb", 1);
  req.onupgradeneeded = () => req.result.createObjectStore("kv");
  req.onerror = () => reject(req.error);
  req.onsuccess = () => {
    const db = req.result;
    const tx = db.transaction("kv", "readwrite");
    tx.objectStore("kv").put(v, k);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => reject(tx.error);
  };
}), [key, value]);
const idbGet = (page, key) => page.evaluate((k) => new Promise((resolve, reject) => {
  const req = indexedDB.open("rpb", 1);
  req.onerror = () => reject(req.error);
  req.onsuccess = () => { const db = req.result; const g = db.transaction("kv").objectStore("kv").get(k); g.onsuccess = () => { db.close(); resolve(g.result); }; g.onerror = () => reject(g.error); };
}), key);

// ======================= TESTS =======================
await test("Loads over HTTP with every part started and no horizontal scroll at phone width", async () => {
  const { ctx, page } = await newPage({ viewport: { width: 360, height: 760 } }, "load");
  await page.goto(BASE + "/");
  await ready(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(overflow <= 0, `page scrolls sideways by ${overflow}px`);
  assert(await page.locator("main > section").count() === 13, "expected 13 sections including the solutions commons");
  assert(await page.isHidden("#btnInstall"), "the Install button must stay hidden until the browser offers installation");
  assert(await page.isHidden("#langBar"), "no translation bar in English");
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
  assert((await page.textContent("#libraryCount")).includes(`10 of ${N_DOCS}`), "should start with the ten newest");
  await page.click(".library__more");
  assert((await page.textContent("#libraryCount")).includes(`all ${N_DOCS}`), `show all should list ${N_DOCS}`);
  await page.fill("#libQ", "water");
  await page.waitForTimeout(300);
  const n = await page.locator("#libraryMount .doc").count();
  assert(n > 0 && n < N_DOCS, `search for water should narrow the list (got ${n})`);
  await page.fill("#libQ", "");
  await page.waitForTimeout(300); // the search box waits for typing to pause
  await page.click('#libraryFilters .chip[data-topic="energy"]');
  const c = await page.locator("#libraryMount .doc").count();
  assert(c >= 4 && c < N_DOCS, `the new energy topic should narrow the list (got ${c})`);
  await page.click("#libClear");
  assert(await page.locator("#libraryMount .doc").count() === N_DOCS, `clear should show all ${N_DOCS}`);
  await page.click("#libraryMount .doc [data-cite]");
  await page.waitForTimeout(200);
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  assert(/\(\d{4}|n\.d\.\)/.test(clip) && /https:\/\//.test(clip), "citation should contain a year and a link");
  const csv = await download(page, "#libCsv");
  assert(csv.name.endsWith(".csv") && csv.text.startsWith('"id","title","publisher"') && csv.text.split("\r\n").length === N_DOCS + 1, `CSV should have a header and ${N_DOCS} rows`);
  await ctx.close();
});

await test("Evidence web: tracing a bridge highlights its sources; selecting a source jumps to it", async () => {
  const { ctx, page } = await newPage({}, "web");
  await page.goto(BASE + "/");
  await ready(page);
  await page.hover('#webMount a[data-bridge="clinic-power"]');
  const on = await page.locator("#webMount .web__link.is-on").count();
  assert(await page.locator("#webMount.is-tracing").count() === 1 && on === 5, `solar for clinics should light 5 links (got ${on})`);
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
  assert(await page.locator(".bridge[open]").count() === N_BRIDGES, `all ${N_BRIDGES} should open`);
  await page.click("#bridgesCloseAll");
  assert(await page.locator(".bridge[open]").count() === 0, "all should close");
  await page.evaluate(() => { document.getElementById("bridge-zai").open = true; });
  await page.click('[data-copy-bridge="zai"]');
  await page.waitForTimeout(200);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  assert(copied.startsWith("Zaï pits and water harvesting") && copied.includes("free, prior and informed consent"), "bridge text should be copied with its status line");
  await page.click('[data-plan="zai"]');
  await page.waitForTimeout(300);
  assert(await page.inputValue("#plBridge") === "zai", "planner should select the zaï bridge");
  assert(await page.locator("#plMeasures input[type=checkbox]").count() >= 4, "zaï measures should be offered");
  await ctx.close();
});

await test("Practices filter, glossary filter and planner help links", async () => {
  const { ctx, page } = await newPage({}, "practices");
  await page.goto(BASE + "/");
  await ready(page);
  await page.click('#practiceFilter .chip[data-kind="healing"]');
  assert(await page.locator("#practicesMount .practice").count() === 3, "three healing practices");
  await page.fill("#glossaryInput", "tenure");
  await page.waitForTimeout(250);
  assert(await page.locator("#glossaryMount dt").count() === 1, "one glossary term for tenure");
  const terms = await page.$$eval("#glossaryMount dt", (d) => d.map((x) => x.textContent));
  await page.fill("#glossaryInput", "");
  await page.waitForTimeout(250);
  const all = await page.$$eval("#glossaryMount dt", (d) => d.map((x) => x.textContent));
  assert(all.length === DOCS.glossary.length && all.join("|") === [...all].sort((a, b) => a.localeCompare(b, "en-GB")).join("|"), "glossary is complete and sorted");
  void terms;
  await page.click('#q-s1 a[data-practice="safe-ground"]');
  await page.waitForTimeout(300);
  assert(await page.evaluate(() => document.activeElement && document.activeElement.id === "practice-safe-ground"), "help link should reveal the practice (resetting the filter)");
  await ctx.close();
});

await test("Search: '/' opens it, arrows and Enter navigate, Escape closes; the meeting kit is searchable", async () => {
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
  await page.keyboard.press("/");
  await page.keyboard.type("consent script");
  await page.waitForTimeout(250);
  const types = await page.$$eval("#searchResults .search-results__type", (x) => x.map((e) => e.textContent));
  assert(types.includes("Meeting kit"), "the meeting kit should appear in search results");
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

await test("Language: French draft translates the interface only, persists across reloads, and back to English", async () => {
  const { ctx, page } = await newPage({}, "lang-fr");
  await page.goto(BASE + "/");
  await ready(page);
  await chooseLanguage(page, "fr");
  assert(await page.textContent("#btnSearch .tool__label") === "Rechercher", "interface words are translated");
  assert(await page.isVisible("#langBar") && (await page.textContent("#langBarBadge")).includes("brouillon"), "the bar says this is a draft");
  const rule = await page.$eval(".hero__rule strong", (el) => [el.textContent, el.getAttribute("lang")]);
  assert(rule[0] === "The evidence rule." && rule[1] === "en", "reviewed-only safety text stays in English, marked lang=en");
  const bridgeName = await page.$eval("#bridge-water .bridge__name", (el) => [el.textContent, el.getAttribute("lang")]);
  assert(bridgeName[0].startsWith("Solar-powered") && bridgeName[1] === "en", "content stays in English in a draft pack, marked lang=en");
  assert((await page.textContent("#libraryCount")).includes("Affichage de 10 sources sur"), "counts use translated plural forms");
  assert(await page.isHidden("#langContentEnWrap"), "the 'content in English' switch is hidden for a draft pack");
  await page.reload();
  await ready(page);
  assert(await page.getAttribute("html", "lang") === "fr" && await page.textContent("#btnSearch .tool__label") === "Rechercher", "French should persist after reload");
  await chooseLanguage(page, "en");
  assert(await page.textContent("#btnSearch .tool__label") === "Search" && await page.isHidden("#langBar"), "back to English");
  await ctx.close();
});

await test("Arabic: right-to-left layout, mirrored diagram, no sideways scroll, arrow keys follow reading direction", async () => {
  const { ctx, page } = await newPage({ viewport: { width: 390, height: 844 } }, "lang-ar");
  await page.goto(BASE + "/");
  await ready(page);
  await chooseLanguage(page, "ar");
  assert(await page.getAttribute("html", "dir") === "rtl", "dir=rtl on <html>");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(overflow <= 0, `page scrolls sideways by ${overflow}px in Arabic`);
  const mirrored = await page.evaluate(() => {
    const bridge = document.querySelector("#webMount .web__node--bridge rect").getBBox().x;
    const dot = document.querySelector("#webMount .web__dot").getAttribute("cx");
    return bridge < Number(dot);
  });
  assert(mirrored, "bridges should sit on the left (the far side) in right to left");
  assert(await page.textContent("#tab-budget") === "الميزانية", "planner tabs are translated");
  await page.focus("#tab-readiness");
  await page.keyboard.press("ArrowLeft");
  assert(await page.getAttribute("#tab-timeline", "aria-selected") === "true", "ArrowLeft moves forward in right to left");
  await page.keyboard.press("ArrowRight");
  assert(await page.getAttribute("#tab-readiness", "aria-selected") === "true", "ArrowRight moves back");
  await ctx.close();
});

await test("Language packs: import a reviewed pack, check fingerprint and stale content, then remove it", async () => {
  const { ctx, page } = await newPage({}, "lang-import");
  await page.goto(BASE + "/");
  await ready(page);
  const pack = {
    format: "rpb-language-pack", formatVersion: 1, lang: "de", name: "Deutsch", englishName: "German", dir: "ltr",
    status: "reviewed", review: { by: "Test review group", date: "2026-10-01", notes: "Checked in a test." },
    strings: { "Search": "Such\u202Een", "The evidence rule.": "Die Evidenzregel.", "Not an app string": "x", "Remove {item}": "Entfernen {wrong}" },
    content: {
      "bridges.water.name": { en: "Solar-powered community water for families and schools", text: "Solarbetriebenes Gemeinschaftswasser für Familien und Schulen" },
      "bridges.water.plain": { en: "An older English sentence", text: "Veraltet" }
    }
  };
  const file = join(TMP, "de.json");
  await writeFile(file, JSON.stringify(pack));
  await page.click("#btnLanguage");
  await page.setInputFiles("#langFile", file);
  await page.waitForSelector("#dlgConfirm[open]");
  const text = await page.textContent("#dlgConfirmText");
  assert(text.includes("Test review group") && /[0-9A-F]{4} [0-9A-F]{4} [0-9A-F]{4} [0-9A-F]{4}/.test(text), "the confirmation names the reviewer and shows a fingerprint");
  assert(text.includes("1 content translation was made from older English text") && text.includes("2 entries were skipped"), "stale and unknown entries are reported");
  await page.click("#dlgConfirmOk");
  await page.waitForFunction(() => document.documentElement.lang === "de");
  await page.click("#dlgLanguage .dlg__close");
  assert(await page.textContent("#btnSearch .tool__label") === "Suchen", "imported interface word used, with hidden direction overrides removed");
  assert(await page.textContent(".hero__rule strong") === "Die Evidenzregel.", "a reviewed pack may translate safety text");
  assert((await page.textContent("#bridge-water .bridge__name")).startsWith("Solarbetriebenes"), "current content translation used");
  assert(await page.getAttribute("#bridge-water .bridge__plain", "lang") === "en", "stale content translation is not shown");
  assert((await page.textContent("#langBarText")).includes("Test review group"), "the bar names the reviewer");
  await page.reload();
  await ready(page);
  await page.waitForFunction(() => document.documentElement.lang === "de", null, { timeout: 5000 });
  assert(await page.textContent("#btnSearch .tool__label") === "Suchen", "the imported pack is kept on this device");
  await page.click("#btnLanguage");
  await page.click("#langRemove");
  await page.click("#dlgConfirmOk");
  await page.waitForFunction(() => document.documentElement.lang === "en");
  const bad = join(TMP, "bad-pack.json");
  await writeFile(bad, JSON.stringify({ format: "something-else" }));
  await page.setInputFiles("#langFile", bad);
  await page.waitForTimeout(300);
  assert((await toastText(page)).includes("not a language pack"), "a wrong file is refused with a clear message");
  const tpl = await download(page, "#langTemplate");
  const t = JSON.parse(tpl.text);
  assert(t.format === "rpb-language-pack" && Object.keys(t.strings).length > 600 && Object.keys(t.content).length > 500 && t.reviewedOnly.length > 50, "the template lists every phrase and piece of content");
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
  assert((await page.textContent("#verdict")).includes("hazard prerequisite unresolved"), "all yes cannot bypass hazard prerequisite");
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
  assert(await page.locator("#versionsList [data-restore]").count() >= 1, "saved versions expected");
  await page.click("#versionsList [data-restore]");
  await page.waitForTimeout(300);
  assert(await page.inputValue("#plProject") === "Test plan one", "restore should bring back the earlier name");
  await ctx.close();
});

await test("Planner: several plans side by side (new, switch, duplicate, delete)", async () => {
  const { ctx, page } = await newPage({}, "plans");
  await page.goto(BASE + "/");
  await ready(page);
  await page.fill("#plProject", "Plan A");
  await page.click("#plNew");
  await page.waitForTimeout(200);
  assert(await page.inputValue("#plProject") === "", "a new plan starts empty");
  await page.fill("#plProject", "Plan B");
  await page.waitForTimeout(900);
  assert(await page.locator("#plSwitch option").count() === 2, "two plans to choose from");
  const a = await page.$eval("#plSwitch", (s) => [...s.options].find((o) => o.textContent === "Plan A").value);
  await page.selectOption("#plSwitch", a);
  await page.waitForTimeout(200);
  assert(await page.inputValue("#plProject") === "Plan A", "switching shows the other plan");
  await page.click("#plDuplicate");
  await page.waitForTimeout(200);
  assert(await page.inputValue("#plProject") === "Plan A (copy)" && await page.locator("#plSwitch option").count() === 3, "duplicate adds a copy");
  await page.click("#plDelete");
  await page.click("#dlgConfirmOk");
  await page.waitForTimeout(300);
  assert(await page.locator("#plSwitch option").count() === 2, "delete removes only this plan");
  await page.reload();
  await ready(page);
  assert(await page.locator("#plSwitch option").count() === 2, "plans persist after reload");
  await ctx.close();
});

await test("Planner: timeline from the kit, budget checks, risk matrix, consent log pauses the plan, CSV and brief", async () => {
  const { ctx, page } = await newPage({}, "tabs");
  await page.goto(BASE + "/");
  await ready(page);
  await page.fill("#plProject", "Water plan");
  await page.selectOption("#plBridge", "water");
  await page.click("#kitToPlan");
  await page.waitForTimeout(200);
  assert(await page.getAttribute("#tab-timeline", "aria-selected") === "true", "the kit button opens the timeline");
  assert(await page.inputValue('#rows-timeline input[data-field="title"]') === "Listening session", "the session is a milestone");
  await page.click("#tlSeed");
  assert(await page.locator("#rows-timeline .row").count() === 6, "the bridge's first step and four pilot steps are added");
  await page.click("#tab-budget");
  await page.click("#budgetSeed");
  const amounts = await page.$$('#rows-budget input[data-field="amount"]');
  assert(amounts.length === 5, "five essential lines");
  for (const [i, v] of [100, 100, 100, 100, 10].entries()) await amounts[i].fill(String(v));
  await page.fill("#budgetCurrency", "USD");
  assert((await page.textContent("#budgetSummary")).includes("410 USD"), "total in the chosen currency");
  assert((await page.textContent("#budgetSummary")).includes("Set aside at least 5% for contingency"), "low contingency is flagged");
  await amounts[4].fill("50");
  assert((await page.textContent("#budgetSummary")).includes("Contingency is at least 5% of the total."), "enough contingency passes");
  await page.click("#budgetAdd");
  await page.locator('#rows-budget input[data-field="item"]').last().fill('=HYPERLINK("x")');
  const csv = await download(page, "#budgetCsv");
  assert(csv.text.startsWith('"What it pays for","Category","Amount","Currency"') && csv.text.includes(`"'=HYPERLINK(""x"")"`), "CSV has headers, and formulas are made harmless");
  await page.click("#tab-risks");
  await page.click("#riskSeed");
  assert(await page.locator("#rows-risks .row").count() === 5, "the bridge's five risks are added");
  assert((await page.textContent("#riskMatrix .matrix__cell--medium.has-risks")).trim() === "5", "the matrix counts them as possible and serious");
  const first = page.locator("#rows-risks .row").first();
  await first.locator('select[data-field="likelihood"]').selectOption("3");
  await first.locator('select[data-field="impact"]').selectOption("3");
  assert((await first.locator(".risk-level").textContent()) === "High", "likely and severe is high");
  await page.click("#tab-consent");
  await page.click("#consentAdd");
  await page.selectOption('#rows-consent select[data-field="group"]', "other");
  assert(await page.isVisible('#rows-consent input[data-field="groupOther"]'), "naming another group appears when needed");
  await page.fill('#rows-consent input[data-field="groupOther"]', "River users");
  await page.selectOption('#rows-consent select[data-field="decision"]', "withdrawn");
  assert((await page.textContent("#verdict")).includes("Pause") && (await page.textContent("#gaps")).includes("River users"), "a withdrawal pauses the plan");
  const brief = await page.textContent("#brief");
  assert(["Timeline", "Budget", "Risks", "Consent log", "Groups that said no or withdrew consent", "Listening session"].every((x) => brief.includes(x)), "the brief includes the new sections");
  assert(!/null|undefined|\[object/.test(brief), "no rendering artefacts in the brief");
  await page.waitForTimeout(900);
  await page.reload();
  await ready(page);
  await page.click("#tab-risks");
  assert(await page.locator("#rows-risks .row").count() === 5 && await page.textContent("#tabCount-consent") === "1", "everything persists after reload");
  await ctx.close();
});

await test("Planner: dividers, connectors, custom measures, the brief, print and the Markdown export", async () => {
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

await test("Safety scan covers every part of the plan, and 'Go back' opens the right tab", async () => {
  const { ctx, page } = await newPage({}, "safety");
  await page.goto(BASE + "/");
  await ready(page);
  await page.fill("#plNotes", "Call +235 66 12 34 56 at the site 12.1234, 15.5678. Years 2021-2024 are fine.");
  await page.click("#plExportJson");
  assert(await page.locator("#dlgSafety[open]").count() === 1, "safety dialog should open");
  assert(await page.locator("#safetyFindings li").count() === 2, "phone and coordinates found in the notes");
  await page.click("#dlgSafetyEdit");
  await page.fill("#plNotes", "");
  await page.click("#tab-risks");
  await page.click("#riskAdd");
  await page.fill('#rows-risks input[data-field="text"]', "Theft at night");
  await page.fill('#rows-risks input[data-field="owner"]', "ring 0700 123 4567");
  await page.click("#tab-readiness");
  await page.click("#plExportJson");
  await page.waitForSelector("#dlgSafety[open]");
  assert((await page.textContent("#safetyFindings")).includes("Risks"), "the risk register is scanned");
  await page.click("#dlgSafetyEdit");
  try { await page.waitForSelector('#tab-risks[aria-selected="true"]', { timeout: 4000 }); } catch (e) { throw new Error('Safety navigation state: ' + JSON.stringify(await page.evaluate(() => ({ findings: document.querySelector('#safetyFindings').textContent, notes: document.querySelector('#plNotes').value, tab: document.querySelector('[role=tab][aria-selected=true]')?.id, open: document.querySelector('#dlgSafety').open })))); }
  assert(await page.getAttribute("#tab-risks", "aria-selected") === "true", "Go back opens the risks tab");
  await page.click("#plExportJson");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#dlgSafetyContinue")]);
  const data = JSON.parse(readFileSync(await dl.path(), "utf8"));
  assert(data.schema === 3 && data.kind === "plan" && data.plan.risks[0].owner.includes("0700"), "continue anyway exports a version 3 plan");
  await ctx.close();
});

await test("Import: version 2 and version 1 backups are added as new plans; bad files are refused", async () => {
  const { ctx, page } = await newPage({}, "import");
  await page.goto(BASE + "/");
  await ready(page);
  await page.fill("#plProject", "Existing plan");
  await page.waitForTimeout(900);
  const v2 = join(TMP, "v2.json");
  await writeFile(v2, JSON.stringify({ schema: 2, plan: { project: "Imported two", bridge: "school", answers: { c1: "yes", zz: "evil" }, who: { women: "met" }, dividers: ["A", 5], notes: "<img src=x onerror=alert(1)>" } }));
  await page.setInputFiles("#plImport", v2);
  await page.waitForSelector("#dlgConfirm[open]");
  await page.click("#dlgConfirmOk");
  await page.waitForTimeout(400);
  assert(await page.inputValue("#plProject") === "Imported two" && await page.inputValue("#plBridge") === "school", "v2 import applied");
  assert(await page.locator("#plSwitch option").count() === 2, "the existing plan is kept");
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
  assert(await page.inputValue("#plProject") === "From version one" && await page.locator("#plSwitch option").count() === 3, "cancel adds nothing");
  await ctx.close();
});

await test("Upgrade: a version 2 plan becomes version 3, and the original is kept as a backup", async () => {
  const { ctx, page } = await newPage({}, "upgrade");
  await page.goto(BASE + "/");
  await ready(page);
  await idbPut(page, "workspace", { schema: 2, plan: { project: "My v2 plan", bridge: "seeds", answers: { c1: "yes" }, who: {}, dividers: ["Old divider"], connectors: [], measures: [], customMeasures: [], notes: "kept" }, history: [{ at: "2026-09-30T10:00:00Z", plan: { project: "Older v2 plan" } }], updated: "2026-10-01T10:00:00Z" });
  await page.reload();
  await ready(page);
  await page.waitForFunction(() => document.getElementById("plProject").value === "My v2 plan", null, { timeout: 5000 });
  assert(await page.inputValue("#plBridge") === "seeds" && await page.isChecked('input[name="ans-c1"][value="yes"]'), "the plan's answers come across");
  const ws = await idbGet(page, "workspace");
  const backup = await idbGet(page, "workspace-v2-backup");
  assert(ws.schema === 3 && ws.plans.length === 1 && ws.plans[0].history.length === 1, "stored as version 3 with its saved version");
  assert(backup && backup.schema === 2 && backup.plan.project === "My v2 plan", "the version 2 original is kept untouched");
  assert((await page.textContent("#inventory")).includes("before the version 3 upgrade"), "the data panel lists the backup");
  await ctx.close();
});

await test("Version 1 draft is migrated once, and stays deleted after 'Delete this plan'", async () => {
  const { ctx, page } = await newPage({}, "migrate");
  await page.goto(BASE + "/");
  await ready(page);
  await page.evaluate(() => {
    localStorage.setItem("rpb_draft", JSON.stringify({ schema: 1, project: "My v1 draft", place: "District A", notes: "v1 notes", updated: "2026-09-01T00:00:00Z" }));
    localStorage.setItem("rpb_theme", "dark");
    localStorage.removeItem("rpb_prefs_v2");
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

await test("Auto-delete removes plans untouched for longer than the chosen period", async () => {
  const { ctx, page } = await newPage({}, "ttl");
  await page.goto(BASE + "/");
  await ready(page);
  await page.fill("#plProject", "Old plan");
  await page.waitForTimeout(1000);
  await page.selectOption("#ttlSelect", "7");
  const ws = await idbGet(page, "workspace");
  ws.plans[0].updated = new Date(Date.now() - 10 * 86400000).toISOString();
  await idbPut(page, "workspace", ws);
  await page.reload();
  await ready(page);
  await page.waitForTimeout(800);
  assert(await page.inputValue("#plProject") === "", "plan should be auto-deleted");
  assert((await toastText(page)).includes("deleted automatically"), "auto-delete notice shown");
  await ctx.close();
});

await test("Delete everything clears plans, imported packs and settings", async () => {
  const { ctx, page } = await newPage({}, "wipe");
  await page.goto(BASE + "/");
  await ready(page);
  await page.fill("#plProject", "To be wiped");
  await page.click("#btnDisplay");
  await page.check('input[name="pref-text"][value="large"]');
  await page.click("#dlgDisplay .dlg__close");
  await chooseLanguage(page, "es");
  await page.waitForTimeout(900);
  await page.click("#btnWipe");
  await page.click("#dlgConfirmOk");
  await page.waitForTimeout(500);
  assert(await page.getAttribute("html", "lang") === "en", "language returns to English");
  await page.reload();
  await ready(page);
  await page.waitForTimeout(400);
  assert(await page.inputValue("#plProject") === "" && await page.getAttribute("html", "data-text") === "standard" && await page.getAttribute("html", "lang") === "en", "everything should be cleared");
  await ctx.close();
});

await test("Two tabs: a save in one offers 'Load latest' in the other, and plans made in one tab survive saves in the other", async () => {
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
  await a.click("#plNew");
  await a.fill("#plProject", "Second plan from A");
  await a.click("#plSave");
  await a.waitForTimeout(300);
  await b.fill("#plProject", "Changed again in tab B");
  await b.click("#plSave");
  await b.waitForTimeout(300);
  const ws = await idbGet(b, "workspace");
  const names = ws.plans.map((p) => p.plan.project).sort();
  assert(names.join("|") === "Changed again in tab B|Second plan from A", `both tabs' plans are kept (got ${names.join(", ")})`);
  // Tab A still holds an older copy of the first plan. Saving its own plan
  // must not overwrite tab B's newer work, and switching shows B's copy.
  await a.fill("#plProject", "Second plan, edited again in A");
  await a.click("#plSave");
  await a.waitForTimeout(300);
  const ws2 = await idbGet(a, "workspace");
  const names2 = ws2.plans.map((p) => p.plan.project).sort();
  assert(names2.join("|") === "Changed again in tab B|Second plan, edited again in A", `an idle copy never wins over newer work (got ${names2.join(", ")})`);
  const first = await a.$eval("#plSwitch", (s) => [...s.options].find((o) => o.textContent === "Changed again in tab B")?.value);
  assert(first, "tab A's plan list shows tab B's newer name");
  await a.selectOption("#plSwitch", first);
  await a.waitForTimeout(200);
  assert(await a.inputValue("#plProject") === "Changed again in tab B", "switching in tab A shows tab B's newer copy");
  await ctx.close();
});

await test("Community meeting kit: cards, voting shapes, copy, print layout and plan link", async () => {
  const { ctx, page } = await newPage({}, "kit");
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
  await page.goto(BASE + "/");
  await ready(page);
  assert(await page.locator("#kitMount .pcard").count() === DOCS.kit.cards.length, "every picture card is drawn");
  assert(await page.locator("#kitMount .pcard svg path, #kitMount .pcard svg circle, #kitMount .pcard svg ellipse").count() > 40, "the cards have drawings");
  assert(await page.locator("#kitMount .vcard").count() === 3, "three voting cards");
  assert(await page.locator("#kitMount .kit__step").count() === DOCS.kit.session.steps.length, "every session step is listed");
  await page.click("#kitCopyGuide");
  await page.waitForTimeout(200);
  const guide = await page.evaluate(() => navigator.clipboard.readText());
  assert(guide.startsWith("Listening session (About 90 minutes)") && guide.includes("Do you agree to continue?"), "the guide copies with the consent script");
  await page.evaluate(() => { window.__printed = null; window.print = () => { window.__printed = document.body.classList.contains("print-kit"); }; });
  await page.click("#kitPrint");
  await page.waitForTimeout(100);
  assert(await page.evaluate(() => window.__printed) === true, "print uses the kit-only layout");
  await page.emulateMedia({ media: "print" });
  await page.evaluate(() => document.body.classList.add("print-kit"));
  assert(await page.isHidden("#library") && await page.isVisible("#kitMount .poster"), "the kit-only print hides the rest of the page");
  await page.evaluate(() => document.body.classList.remove("print-kit"));
  await page.emulateMedia({ media: "screen" });
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
  await chooseLanguage(page, "ar");
  assert(await page.getAttribute("html", "dir") === "rtl", "language packs work offline");
  await chooseLanguage(page, "en");
  assert((await page.textContent("#netStatus")).includes("Offline") || await page.isHidden("#netStatus"), "status should say offline");
  await ctx.setOffline(false);
  swVariant = "b";
  await page.evaluate(async () => { const reg = await navigator.serviceWorker.getRegistration(); await reg.update(); });
  await page.waitForSelector(".toast button:has-text('Reload')", { timeout: 10000 });
  await Promise.all([page.waitForEvent("load", { timeout: 10000 }), page.click(".toast button:has-text('Reload')")]);
  await ready(page);
  const keys = await page.evaluate(() => caches.keys());
  assert(keys.includes("rpb-core-v-test-b") && keys.filter((k) => k.startsWith("rpb-core-v")).length >= 2, "new cache active, old archive retained");
  swVariant = "";
  await ctx.close();
});

await test("Opened directly from the folder (file://): works with no errors, in Arabic too", async () => {
  const { ctx, page } = await newPage({}, "file");
  await page.goto(pathToFileURL(join(ROOT, "index.html")).href);
  await ready(page);
  assert((await page.textContent("#netStatus")).includes("Opened from a file"), "status should explain file mode");
  assert(await page.locator("#libraryMount .doc").count() === 10, "library renders");
  await chooseLanguage(page, "ar");
  assert(await page.getAttribute("html", "dir") === "rtl", "Arabic works from a file");
  await ctx.close();
});

await test("Single shareable file works offline from disk, with the language packs inside", async () => {
  const { ctx, page } = await newPage({}, "single");
  await page.goto(pathToFileURL(join(ROOT, "share", "regenerative-peace-bridges.html")).href);
  await ready(page);
  assert(await page.evaluate(() => window.RPB_BUILD && window.RPB_BUILD.mode === "single"), "single mode");
  const file = await download(page, "#plExportJson");
  assert(file.name.endsWith(".json"), "downloads work in the single file");
  await chooseLanguage(page, "fr");
  assert(await page.textContent("#btnSearch .tool__label") === "Rechercher", "French works in the single file");
  await ctx.close();
});

await test("Embedded preview: copy instead of download, a working copy button, no print, no service worker", async () => {
  const { ctx, page } = await newPage({}, "preview");
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
  await page.goto(BASE + "/__preview.html");
  await ready(page);
  assert(await page.locator("#plPrint").count() === 0 && await page.locator("#kitPrint").count() === 0, "no print buttons in preview");
  await page.click("#plExportJson");
  await page.waitForSelector("#dlgText[open]");
  assert((await page.inputValue("#dlgTextArea")).includes('"schema": 3'), "export text offered for copying");
  await page.click("#dlgTextCopy");
  await page.waitForTimeout(200);
  assert((await page.evaluate(() => navigator.clipboard.readText())).includes('"schema": 3'), "the copy button copies the text");
  assert(await page.evaluate(async () => !(await navigator.serviceWorker.getRegistration())), "no service worker in preview");
  assert(!(await page.textContent("#kitToolbar")).includes("null"), "no stray text in the kit toolbar");
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

await test("Evolution: reviews, filters, isolation, reload, export, offline and validation", async () => {
  const {ctx, page} = await newPage({}, "evolution");
  await page.goto(BASE + "/"); await ready(page);
  const id = DOCS.bridges[0].id, other = DOCS.bridges[1].id;
  await page.selectOption("#plBridge", id);
  assert(await page.locator("#evo-evidence option").count() === 5, "five evidence levels");
  assert(await page.locator("#evo-community option").count() === 5, "five community levels");
  await page.selectOption("#evo-evidence", "Tested");
  await page.selectOption("#evo-community", "Adapted");
  await page.click("#evo-save");
  assert((await page.textContent("#evo-feedback")).includes("rationale"), "rationale required");
  await page.fill("#evo-note", "Pilot review: documented outcomes in this district; report alpha.");
  await page.click("#evo-save");
  assert((await page.textContent("#bridge-"+id+" .evolution-badge")).includes("Tested"), "card updates");
  await page.selectOption("#evolutionEvidenceFilter", "Tested");
  assert(await page.locator(".bridge:not([hidden])").count() === 1, "evidence filter");
  await page.fill("#evolutionSearch", "report alpha");
  assert(await page.locator(".bridge:not([hidden])").count() === 1, "history search");
  await page.selectOption("#plBridge", other);
  assert(await page.inputValue("#evo-evidence") === "Conceptual", "bridge isolation");
  await page.selectOption("#plBridge", id);
  assert(await page.inputValue("#evo-evidence") === "Tested", "bridge history retained");
  await page.waitForTimeout(1100);
  await page.reload(); await ready(page);
  assert(await page.inputValue("#evo-community") === "Adapted", "persisted");
  const backup = JSON.parse((await download(page, "#plExportJson")).text);
  assert(backup.plan.evolution[id].history.length === 1, "JSON includes history");
  const csv = await download(page, "#evo-csv");
  assert(csv.text.includes("Previous evidence") && csv.text.includes("report alpha"), "CSV includes transitions");
  const md = await download(page, "#plExportMd");
  assert(md.text.includes("Tested") && md.text.includes("report alpha"), "brief includes lifecycle");
  await page.click("#plNew");
  await page.selectOption("#plBridge", id);
  assert(await page.inputValue("#evo-evidence") === "Conceptual", "plan isolation");
  await page.locator("#plImport").setInputFiles({ name:"lifecycle.json", mimeType:"application/json", buffer:Buffer.from(JSON.stringify(backup)) });
  await page.click("#dlgConfirmOk");
  await page.waitForTimeout(700);
  assert(await page.inputValue("#evo-evidence") === "Tested", "backup restored");
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await ctx.setOffline(true);
  await page.reload(); await ready(page);
  await page.selectOption("#evo-evidence", "Emerging");
  await page.fill("#evo-note", "Reassessment after follow-up review.");
  await page.click("#evo-save");
  assert(await page.locator("#plEvolution .evolution-history li").count() === 2, "offline correction history");
  await ctx.setOffline(false);
  await ctx.close();
});

await test("Impact: rates, zero baseline, corrections, learning, exports and bridge isolation", async () => {
  const {ctx,page} = await newPage({},"impact");
  await page.goto(BASE+"/"); await ready(page);
  const id=DOCS.bridges[0].id, other=DOCS.bridges[1].id;
  await page.fill('#plProject','Impact learning plan');
  await page.selectOption('#plBridge',id); await page.click('#tab-impact');
  assert(await page.locator('#impactMetric option').count()===14,'all fourteen indicators');
  assert(await page.locator('#impactDomain option').count()===5,'four domains and all');
  assert((await page.textContent('#plImpact')).includes('Missing values are not zero'),'missing data explained');
  await page.selectOption('#impactMetric','soil');
  await page.fill('#impactScope','Same district plots; monthly observations');
  await page.fill('#impactMethod','Fixed transect of ten sampling points');
  await page.fill('#impactTarget','80'); await page.fill('#impactTargetDate','2026-12-01');
  await page.fill('#impactDate','2026-01-01'); await page.fill('#impactNumerator','0'); await page.fill('#impactDenominator','0');
  await page.fill('#impactSource','Field sheet alpha'); await page.click('#impactRecord');
  assert((await page.textContent('#impactStatus')).includes('denominator'),'zero denominator refused');
  await page.fill('#impactDenominator','10'); await page.click('#impactRecord');
  assert((await page.textContent('#impactStatus')).includes('recorded'),'baseline recorded');
  await page.fill('#impactDate','2026-02-01'); await page.fill('#impactNumerator','8'); await page.fill('#impactDenominator','10');
  await page.fill('#impactSource','Field sheet beta'); await page.click('#impactRecord');
  assert((await page.textContent('#plImpact')).includes('target: 100%'),'progress toward target');
  assert(await page.locator('.impact-chart svg').count()===1,'accessible trend chart');
  assert((await page.textContent('#bridge-'+id+' .impact-badge')).includes('1 / 14'),'bridge status updates');
  const correctionId=await page.locator('#impactCorrection option').last().getAttribute('value');
  await page.selectOption('#impactCorrection',correctionId); await page.fill('#impactNumerator','6');
  await page.fill('#impactNote','Corrected transcription after field review'); await page.click('#impactRecord');
  assert((await page.textContent('#plImpact')).includes('target: 75%'),'correction recalculates progress');
  assert((await page.textContent('#plImpact')).includes('Replaced by correction'),'original retained');
  await page.fill('#impactFinding','Cover increased; rainfall may also explain change.');
  await page.fill('#impactAction','Repeat sampling and discuss with community.');
  await page.fill('#impactLearningNext','2026-12-01'); await page.click('#impactSaveLearning');
  assert((await page.textContent('#impactStatus')).includes('Learning review saved'),'learning review saved');
  const csv=await download(page,'#impactCsv');
  assert(csv.text.includes('replaced')&&csv.text.includes('Field sheet beta'),'history CSV includes corrections and sources');
  const learning=await download(page,'#impactLearningCsv'); assert(learning.text.includes('rainfall'),'learning CSV');
  const summary=await download(page,'#impactSummaryCsv'); assert(summary.text.includes('Baseline date')&&summary.text.includes('Soil cover'),'summary CSV');
  const md=await download(page,'#plExportMd'); assert(md.text.includes('Impact and learning')&&md.text.includes('rainfall'),'brief integration');
  const backup=JSON.parse((await download(page,'#plExportJson')).text);
  assert(backup.plan.impact.bridges[id].metrics.soil.observations.length===3,'JSON complete history');
  const originalPlan = await page.inputValue('#plSwitch');
  await page.click('#plDuplicate'); await page.click('#tab-impact');
  assert((await page.textContent('.impact-coverage')).startsWith('1 of'),'duplication retains impact');
  await page.selectOption('#plSwitch',originalPlan); await page.click('#tab-impact');
  const countBeforeInvalid = await page.locator('#plSwitch option').count();
  const invalidBackup=JSON.parse(JSON.stringify(backup));
  invalidBackup.plan.impact.bridges[id].metrics.soil.observations[0].denominator=0;
  await page.locator('#plImport').setInputFiles({name:'invalid-impact.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalidBackup))});
  await page.waitForTimeout(150);
  assert(await page.locator('#plSwitch option').count()===countBeforeInvalid,'invalid impact import adds no plan');
  assert((await toastText(page)).includes('denominator'),'invalid impact error explained');
  await page.click('#impactLifecycle');
  assert((await page.inputValue('#evo-note')).includes('Soil cover'),'impact summary supports lifecycle review');
  assert(await page.inputValue('#evo-evidence')==='Conceptual','maturity never auto-promoted');
  await page.selectOption('#plBridge',other); await page.click('#tab-impact');
  assert((await page.textContent('.impact-coverage')).startsWith('0 of'),'bridge data isolated');
  await page.click('#tab-readiness'); await page.selectOption('#plBridge',id); await page.click('#tab-impact');
  assert((await page.textContent('.impact-coverage')).startsWith('1 of'),'bridge data retained');
  await page.waitForTimeout(1100); await page.reload(); await ready(page); await page.click('#tab-impact');
  assert((await page.textContent('.impact-coverage')).startsWith('1 of'),'persistence');
  await page.click('#plNew'); await page.selectOption('#plBridge',id); await page.click('#tab-impact');
  assert((await page.textContent('.impact-coverage')).startsWith('0 of'),'new plan isolated');
  await page.locator('#plImport').setInputFiles({name:'impact.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await page.click('#dlgConfirmOk'); await page.click('#tab-impact');
  assert((await page.textContent('.impact-coverage')).startsWith('1 of'),'import preserves impact');
  await page.click('#impactClear'); await page.click('#dlgConfirmCancel');
  assert((await page.textContent('.impact-coverage')).startsWith('1 of'),'clear cancellation preserves data');
  await page.click('#impactClear'); await page.click('#dlgConfirmOk');
  await page.waitForFunction(()=>document.querySelector('.impact-coverage').textContent.startsWith('0 of'));
  assert((await page.textContent('.impact-coverage')).startsWith('0 of'),'explicit impact deletion');
  await ctx.close();
});

await test("Impact: offline observations, unsafe exports, mobile RTL and single-file", async () => {
  const {ctx,page}=await newPage({viewport:{width:390,height:844}},'impact-offline');
  await page.goto(BASE+'/'); await ready(page);
  await page.selectOption('#plBridge',DOCS.bridges[0].id); await page.click('#tab-impact');
  await page.fill('#impactScope','Fixed regeneration cohort'); await page.fill('#impactMethod','Count all living stems in the cohort');
  await page.fill('#impactValue','20'); await page.fill('#impactSource','Field report'); await page.click('#impactRecord');
  await page.waitForTimeout(1100); await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
  await ctx.setOffline(true); await page.reload(); await ready(page); await page.click('#tab-impact');
  assert((await page.textContent('.impact-history')).includes('20 trees'),'baseline available offline');
  await page.fill('#impactValue','18'); await page.fill('#impactSource','Field report phone 0700 123 4567'); await page.click('#impactRecord');
  await page.click('#impactCsv'); await page.waitForSelector('#dlgSafety[open]');
  assert((await page.textContent('#dlgSafety')).includes('Impact measurement'),'safety scan includes impact references');
  await page.click('#dlgSafetyEdit');
  assert(await page.locator('#panel-impact:not([hidden])').count()===1,'safety edit returns to impact');
  await chooseLanguage(page,'ar'); await page.click('#tab-impact');
  assert(await page.getAttribute('#plImpact','lang')==='en','English fallback marked for screen readers');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile RTL has no page overflow');
  await ctx.setOffline(false); await ctx.close();
  const single=await newPage({},'impact-single');
  await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href); await ready(single.page);
  await single.page.selectOption('#plBridge',DOCS.bridges[0].id); await single.page.click('#tab-impact');
  assert(await single.page.locator('#impactMetric option').count()===14,'impact embedded in single file');
  await single.ctx.close();
});

await test("Knowledge: prompts, local capture, review, sharing, revision, search and withdrawal", async () => {
  const {ctx,page}=await newPage({},'knowledge');
  await page.goto(BASE+'/');await ready(page);
  await page.selectOption('#plBridge','agropeace');await page.click('#tab-knowledge');
  assert(await page.locator('#knowledgeExample option').count()===N_BRIDGES*3+1,'three prompts per bridge plus placeholder');
  await page.click('#knowledgeExamples summary');await page.selectOption('#knowledgeExample','example-1');await page.click('#knowledgeUseExample');
  assert((await page.textContent('#knowledgePrompt')).includes('18 months'),'requested prompt available');
  assert(await page.inputValue('#knowledgeStatement')==='','examples never become evidence');
  assert((await page.textContent('#knowledgeCount')).startsWith('0 active'),'no fabricated records');
  await page.click('#knowledgeSave');assert((await page.textContent('#knowledgeStatus')).includes('Add an account'),'required fields enforced');
  await page.fill('#knowledgeStatement','KnowledgeLocalSentinel — a private community observation.');
  await page.fill('#knowledgeContext','District grazing agreement, across two dry seasons.');
  await page.fill('#knowledgeSource','Farmer–herder dialogue group');
  await page.selectOption('#knowledgeMetric','disputes');await page.click('#knowledgeSave');
  const id=await page.locator('#knowledgeList .knowledge-card').first().getAttribute('data-knowledge-id');
  assert((await page.textContent('#knowledgeCount')).startsWith('1 active'),'local capture saved');
  assert((await page.textContent('#bridge-agropeace .knowledge-badge')).includes('1 active'),'bridge card updates');
  await page.fill('#evolutionSearch','KnowledgeLocalSentinel');
  assert(await page.locator('.bridge:not([hidden])').count()===1,'bridge search indexes local accounts');
  await page.fill('#evolutionSearch','');
  await page.click('#btnSearch');await page.fill('#searchInput','KnowledgeLocalSentinel');await page.waitForTimeout(250);
  assert(await page.locator('#searchResults button').count()>0,'global local search includes accounts');
  await page.keyboard.press('Escape');
  const privateBackup=JSON.parse((await download(page,'#plExportJson')).text);
  assert(privateBackup.plan.knowledge.records.length===1,'private backups include local-only accounts');
  const mdPrivate=await download(page,'#plExportMd');assert(!mdPrivate.text.includes('KnowledgeLocalSentinel'),'private account excluded from brief');
  await page.click('#knowledgeExport');assert((await page.textContent('#knowledgeStatus')).includes('No active accounts'),'sharing disabled without approval');
  await page.click('#knowledgeEdit-'+id);
  await page.fill('#knowledgeStatement','Grazing corridor agreement remained stable for eighteen months.');
  await page.selectOption('#knowledgeSharing','shared');await page.selectOption('#knowledgeReview','reviewed');
  await page.fill('#knowledgeReason','Community corrected the wording and reviewed sharing.');
  await page.click('#knowledgeSave');assert((await page.textContent('#knowledgeStatus')).includes('who reviewed'),'review needs process');
  await page.fill('#knowledgeReviewNote','Dialogue group reviewed wording; absent seasonal users have not yet been heard.');
  await page.click('#knowledgeSave');assert((await page.textContent('#knowledgeStatus')).includes('approved sharing'),'permission required');
  await page.fill('#knowledgePermission','Group agreed to exchange this version with neighboring communities.');
  await page.click('#knowledgeSave');
  const packet=JSON.parse((await download(page,'#knowledgeExport')).text);
  assert(packet.records.length===1&&packet.records[0].revision===2,'current approved version exported');
  assert(!JSON.stringify(packet).includes('KnowledgeLocalSentinel'),'private historical wording not exported');
  const csv=await download(page,'#knowledgeCsv');assert(csv.text.includes('neighboring communities'),'sharing conditions in CSV');
  const md=await download(page,'#plExportMd');assert(md.text.includes('Grazing corridor')&&!md.text.includes('KnowledgeLocalSentinel'),'brief permission boundary');
  await page.click('#knowledgeMetric-'+id);assert(await page.inputValue('#impactMetric')==='disputes','related metric navigation');
  await page.click('#tab-knowledge');await page.click('#knowledgeLearning-'+id);
  assert((await page.inputValue('#impactFinding')).includes('Grazing corridor'),'learning draft links account');
  await page.click('#tab-knowledge');await page.click('#knowledgeLifecycle-'+id);
  assert((await page.inputValue('#evo-note')).includes('Grazing corridor'),'lifecycle draft links account');
  assert(await page.inputValue('#evo-evidence')==='Conceptual','knowledge never auto-promotes maturity');
  await page.click('#tab-knowledge');
  for(const kind of ['lesson','unexpected']){
    await page.selectOption('#knowledgeKind',kind);await page.fill('#knowledgeStatement',kind==='lesson'?'Participants associated committee elections with fewer disagreements.':'Tree ownership became contentious after crop prices rose.');
    await page.fill('#knowledgeContext','Local dialogue in the district; possible alternative explanations.');await page.fill('#knowledgeSource','Community discussion group');await page.click('#knowledgeSave');
  }
  assert((await page.textContent('#knowledgeCount')).startsWith('3 active'),'all three account types');
  await page.selectOption('#knowledgeKindFilter','unexpected');assert(await page.locator('#knowledgeList .knowledge-card').count()===1,'type filter');
  await page.selectOption('#knowledgeKindFilter','');
  await page.click('#knowledgeEdit-'+id);assert(await page.inputValue('#knowledgeSharing')==='local'&&await page.inputValue('#knowledgeReview')==='unreviewed','revisions require renewed permission and review');
  await page.click('#knowledgeCancel');
  await page.locator('[data-knowledge-id="'+id+'"] details').last().locator('summary').click();
  await page.fill('#knowledgeWithdrawReason-'+id,'The source group withdrew permission.');await page.click('#knowledgeWithdraw-'+id);await page.click('#dlgConfirmOk');
  await page.waitForFunction(()=>document.getElementById('knowledgeCount').textContent.startsWith('2 active'));
  assert((await page.textContent('#knowledgeCount')).startsWith('2 active'),'withdrawal hides active account');
  await page.click('#knowledgeExport');assert((await page.textContent('#knowledgeStatus')).includes('No active accounts'),'withdrawal excludes future sharing');
  await page.check('#knowledgeShowWithdrawn');assert(await page.locator('#knowledgeList .knowledge-card').count()===3,'withdrawn record retained locally');
  const mdWithdrawn=await download(page,'#plExportMd');assert(!mdWithdrawn.text.includes('Grazing corridor'),'withdrawn account omitted from future brief');
  await ctx.close();
});

await test("Knowledge: decentralized imports, duplicate/conflict handling, isolation and private backup", async () => {
  const {ctx,page}=await newPage({},'knowledge-import');await page.goto(BASE+'/');await ready(page);
  const packet=await page.evaluate(()=>{const K=window.RPB_KNOWLEDGE,at=new Date().toISOString(),s={...K.fresh(),kind:'lesson',statement:'Committee elections reduced conflict, according to the discussion group.',context:'A local comparison with other possible explanations.',source:'Community dialogue group',date:at.slice(0,10),review:'reviewed',reviewNote:'Group reviewed with dissent recorded.',sharing:'shared',permissionNote:'Agreed to share with other communities.'};return K.packet(K.save(K.empty(),'agropeace','origin-committee',s,'Initial capture',at),'agropeace',at);});
  await page.selectOption('#plBridge','agropeace');await page.click('#tab-knowledge');
  const importFile=async x=>page.locator('#knowledgeImportFile').setInputFiles({name:'community.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(x))});
  await importFile(packet);await page.click('#dlgConfirmOk');
  await page.waitForFunction(()=>document.getElementById('knowledgeCount').textContent.startsWith('1 active'));
  assert((await page.textContent('#knowledgeList')).includes('Local only')&&(await page.textContent('#knowledgeList')).includes('Not yet community-reviewed'),'imports require local permission and review');
  assert((await page.textContent('#knowledgeList')).includes('origin-committee'),'provenance retained');
  await importFile(packet);await page.waitForTimeout(150);assert((await page.textContent('#knowledgeStatus')).includes('duplicate'),'identical imports deduplicated');
  const altered=JSON.parse(JSON.stringify(packet));altered.records[0].snapshot.statement='Another version of the committee account.';
  await importFile(altered);await page.click('#dlgConfirmOk');
  await page.waitForFunction(()=>document.getElementById('knowledgeCount').textContent.startsWith('2 active'));
  assert((await page.textContent('#knowledgeCount')).startsWith('2 active'),'conflicting wording preserved separately');
  assert((await page.textContent('#knowledgeList')).includes('not independent corroboration'),'related-version caveat');
  const invalid=JSON.parse(JSON.stringify(packet));invalid.records[0].snapshot.sharing='local';
  await importFile(invalid);await page.waitForTimeout(150);assert((await page.textContent('#knowledgeStatus')).includes('approved'),'invalid sharing packet rejected');
  await page.waitForTimeout(900);await page.reload();await ready(page);await page.click('#tab-knowledge');
  assert((await page.textContent('#knowledgeCount')).startsWith('2 active'),'knowledge persists');
  const backup=JSON.parse((await download(page,'#plExportJson')).text);assert(backup.plan.knowledge.records[0].origin.snapshot.review==='reviewed','backup retains source assertion separately');
  await page.click('#tab-readiness');await page.selectOption('#plBridge','water');await page.click('#tab-knowledge');assert((await page.textContent('#knowledgeCount')).startsWith('0 active'),'bridge isolation');
  await page.click('#plNew');await page.selectOption('#plBridge','agropeace');await page.click('#tab-knowledge');assert((await page.textContent('#knowledgeCount')).startsWith('0 active'),'plan isolation');
  await page.locator('#plImport').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await page.click('#dlgConfirmOk');await page.click('#tab-knowledge');
  assert((await page.textContent('#knowledgeCount')).startsWith('2 active'),'full backup restores accounts');
  await page.click('#plDuplicate');await page.click('#tab-knowledge');assert((await page.textContent('#knowledgeCount')).startsWith('2 active'),'duplication preserves knowledge');
  await ctx.close();
});

await test("Knowledge: offline, safety, literal text, mobile RTL and single-file", async () => {
  const {ctx,page}=await newPage({viewport:{width:390,height:844}},'knowledge-offline');await page.goto(BASE+'/');await ready(page);
  await page.selectOption('#plBridge','water');await page.click('#tab-knowledge');
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await ctx.setOffline(true);
  await page.fill('#knowledgeStatement','<img src=x onerror=alert(1)> is literal community text.');await page.fill('#knowledgeContext','General district and season.');
  await page.fill('#knowledgeSource','Community group phone 0700 123 4567');await page.selectOption('#knowledgeSharing','shared');await page.fill('#knowledgePermission','Group approved this version.');await page.click('#knowledgeSave');
  assert(await page.locator('#knowledgeList img').count()===0,'user text never becomes HTML');
  await page.click('#knowledgeExport');await page.waitForSelector('#dlgSafety[open]');assert((await page.textContent('#dlgSafety')).includes('Community knowledge'),'safety scan includes knowledge');await page.click('#dlgSafetyEdit');
  assert(await page.locator('#panel-knowledge:not([hidden])').count()===1,'safety edit returns to knowledge');
  await page.waitForTimeout(900);await page.reload();await ready(page);await page.click('#tab-knowledge');assert((await page.textContent('#knowledgeCount')).startsWith('1 active'),'offline capture persists');
  await chooseLanguage(page,'ar');await page.click('#tab-knowledge');assert(await page.getAttribute('#plKnowledge','lang')==='en','English UI explicitly marked');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no mobile RTL page overflow');
  await ctx.setOffline(false);await ctx.close();
  const single=await newPage({},'knowledge-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);
  await single.page.selectOption('#plBridge','regeneration');await single.page.click('#tab-knowledge');assert(await single.page.locator('#knowledgeExample option').count()===N_BRIDGES*3+1,'all examples embedded offline');await single.ctx.close();
});


await test("Systems: examples, pathway, node editing, review, sharing and exports", async () => {
  const {ctx,page}=await newPage({},'systems');await page.goto(BASE+'/');await ready(page);
  await page.click('#webViewSystems');await page.selectOption('#webSystemBridge','water');
  assert(await page.locator('#web #plSystems').count()===1 && await page.locator('#tab-systems').count()===0,'mapping extends Evidence Web without a planner tab');
  assert(await page.inputValue('#plBridge')==='water','web bridge selection is shared with planner');
  await page.click('#webViewSources');assert(await page.locator('#webMount').isVisible(),'existing sources view remains available');
  await page.click('#webViewSystems');
  await page.locator('#plSystems details').first().locator('summary').click();
  await page.click('#systemsLoad');await page.click('#dlgConfirmOk');
  await page.waitForFunction(()=>document.querySelector('#systemsCount').textContent.startsWith('4 nodes'));
  assert(await page.locator('#systemsDiagram svg').count()===1,'map diagram drawn');
  await page.selectOption('#systemsPathFrom','n0');await page.selectOption('#systemsPathTo','n3');
  assert((await page.textContent('#systemsPathReport')).includes('Water → School Attendance → Social Stability → Reduced Tension'),'requested pathway');
  await page.selectOption('#systemsTypeFilter','water');
  assert((await page.textContent('#systemsPathReport')).includes('No directed pathway'),'path respects filters');
  await page.selectOption('#systemsTypeFilter','');
  await page.click('#systemsExport');assert((await page.textContent('#systemsStatus')).includes('Approve'),'private map cannot export');
  await page.fill('#systemsPermission','Community workshop approved this map and its notes.');await page.click('#systemsApprove');
  await page.waitForFunction(()=>document.querySelector('#systemsCount').textContent.includes('Approved'));
  const packet=JSON.parse((await download(page,'#systemsExport')).text);assert(packet.graph.nodes.length===4&&!packet.graph.history,'portable graph excludes history');
  const svg=await download(page,'#systemsSvg');assert(svg.text.includes('<svg')&&svg.text.includes('School Attendance'),'SVG exported');assert(await page.evaluate(text=>new DOMParser().parseFromString(text,'image/svg+xml').querySelector('parsererror')===null,svg.text),'exported SVG is valid XML');
  assert((await download(page,'#systemsCsv')).text.includes('School Attendance'),'relationships CSV exported');
  assert((await page.textContent('#brief')).includes('School Attendance'),'approved map in brief');
  await page.locator('#systemsDiagram g[role=button]').first().focus();await page.keyboard.press('Enter');
  await page.fill('#systemsNodeLabel','Reliable water');await page.click('#systemsSaveNode');
  await page.waitForFunction(()=>document.querySelector('#systemsCount').textContent.includes('Local only'));
  assert(!(await page.textContent('#brief')).includes('Reliable water'),'edits reset shared brief approval');
  await page.click('#systems-edit-e0');await page.selectOption('#systemsState','observed');await page.click('#systemsSaveEdge');
  assert((await page.textContent('#systemsStatus')).includes('Describe local support'),'supported claims need explanation');
  await page.fill('#systemsEvidence','Participants described fewer missed days; seasonal changes may also explain this.');await page.click('#systemsSaveEdge');
  await page.waitForFunction(()=>document.querySelector('#systemsRelationships').textContent.includes('Locally supported account'));
  await page.fill('#systemsSearch','Reliable water');assert((await page.textContent('#systemsDiagram')).includes('Reliable water'),'search finds node');
  await page.waitForTimeout(900);await page.reload();await ready(page);await page.click('#webViewSystems');
  assert((await page.textContent('#systemsRelationships')).includes('Reliable water'),'saved map persists');
  await ctx.close();
});
await test("Systems: import validation, history, isolation and private backups",async()=>{
  const {ctx,page}=await newPage({},'systems-import');await page.goto(BASE+'/');await ready(page);await page.selectOption('#plBridge','water');await page.click('#webViewSystems');
  const packet=await page.evaluate(()=>({format:'rpb-peace-systems',schema:1,bridgeId:'water',graph:window.RPB_SYSTEMS.template('restoration-food')}));
  const f=join(TMP,'systems.json');await writeFile(f,JSON.stringify(packet));await page.setInputFiles('#systemsImport',f);await page.click('#dlgConfirmOk');
  await page.waitForFunction(()=>document.querySelector('#systemsCount').textContent.startsWith('4 nodes'));
  assert((await page.textContent('#systemsRelationships')).includes('4 relationships participate in feedback loops'),'feedback loop detected');
  const backup=JSON.parse((await download(page,'#plExportJson')).text);assert(backup.plan.systems.maps.water.history.length===1,'private backup retains history');
  await page.click('#tab-readiness');await page.selectOption('#plBridge','school');assert((await page.textContent('#systemsCount')).startsWith('0 nodes'),'bridge isolation');await page.selectOption('#plBridge','water');await page.click('#webViewSystems');
  packet.graph.edges[0].to='missing';await writeFile(f,JSON.stringify(packet));await page.setInputFiles('#systemsImport',f);
  await page.waitForFunction(()=>document.querySelector('#systemsStatus').textContent.includes('existing endpoints'));
  assert((await page.textContent('#systemsCount')).startsWith('4 nodes'),'invalid import changes nothing');
  await page.locator('#systems-restore-0').evaluate(e=>e.closest('details').open=true);await page.click('#systems-restore-0');await page.click('#dlgConfirmOk');
  await page.waitForFunction(()=>document.querySelector('#systemsCount').textContent.startsWith('0 nodes'));
  await ctx.close();
});
await test("Systems: offline capture, safe text, mobile RTL and standalone build",async()=>{
  const {ctx,page}=await newPage({viewport:{width:390,height:844}},'systems-offline');await page.goto(BASE+'/');await ready(page);await page.selectOption('#plBridge','water');await page.click('#webViewSystems');
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await ctx.setOffline(true);
  await page.fill('#systemsNodeLabel','<img src=x onerror=alert(1)>');await page.click('#systemsSaveNode');
  await page.waitForFunction(()=>document.querySelector('#systemsCount').textContent.startsWith('1 nodes'));
  assert(await page.locator('#plSystems img').count()===0,'literal node label remains text');
  await page.waitForTimeout(900);await page.reload();await ready(page);await page.click('#webViewSystems');assert((await page.textContent('#systemsCount')).startsWith('1 nodes'),'offline persistence');
  await chooseLanguage(page,'ar');await page.click('#webViewSystems');assert(await page.getAttribute('#plSystems','lang')==='en','English map controls marked');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no mobile page overflow');await ctx.setOffline(false);await ctx.close();
  const single=await newPage({},'systems-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);await single.page.selectOption('#plBridge','water');await single.page.click('#webViewSystems');assert(await single.page.locator('#systemsTemplate option').count()===5,'all templates available standalone');await single.ctx.close();
});


await test("Commons: listings, consent, categories, matching, exports and revisions",async()=>{
 const {ctx,page}=await newPage({},'commons');await page.goto(BASE+'/');await ready(page);
 assert(await page.locator('#commonsCategory option').count()===5,'five needed categories');
 await page.fill('#commonsTitle','Water equipment support');await page.fill('#commonsDescription','Support for community water monitoring.');await page.fill('#commonsCommunity','Water committee');await page.fill('#commonsArea','Broad district');await page.selectOption('#commonsBridge','water');
 await page.selectOption('#commonsState','open');await page.selectOption('#commonsSharing','shared');await page.click('#commonsSave');
 await page.waitForFunction(()=>document.querySelector('#commonsStatus').textContent.includes('Sharing requires'));
 await page.fill('#commonsRoute','Existing community liaison process');await page.fill('#commonsEnd','2030-12-01');await page.fill('#commonsPermission','Committee approved this wording.');await page.click('#commonsSave');
 await page.waitForFunction(()=>document.querySelector('#commonsCount').textContent.startsWith('1 listings'));
 const packet=JSON.parse((await download(page,'#commonsExport')).text);assert(packet.listings.length===1&&!packet.listings[0].versions,'shared export excludes history');
 assert((await download(page,'#commonsCsv')).text.includes('Water equipment support'),'CSV');assert((await download(page,'#commonsText')).text.includes('NEEDED: Water equipment support'),'readable bulletin');
 await page.selectOption('#commonsKind','offered');assert(await page.locator('#commonsCategory option').count()===5,'five offered categories');await page.selectOption('#commonsCategory','equipment');
 await page.fill('#commonsTitle','Monitoring toolkit');await page.fill('#commonsDescription','Supervised use of a monitoring kit.');await page.fill('#commonsCommunity','Monitoring group');await page.fill('#commonsArea','Neighbouring district');await page.selectOption('#commonsState','open');await page.click('#commonsSave');
 await page.waitForFunction(()=>document.querySelector('#commonsCount').textContent.startsWith('2 listings'));
 await page.click('#commonsMatch-'+packet.listings[0].id);assert((await page.textContent('#commonsMatches')).includes('Monitoring toolkit'),'opposite types with shared topics match');
 assert(JSON.parse((await download(page,'#commonsExport')).text).listings.length===1,'local listing excluded');
 await page.selectOption('#commonsCategoryFilter','offered:equipment');assert(await page.locator('#commonsList article').count()===1,'category filter');await page.selectOption('#commonsCategoryFilter','');
 await page.click('#btnSearch');await page.fill('#searchInput','Water equipment support');await page.locator('#searchResults button').filter({hasText:'Commons listing'}).first().click();await page.waitForFunction(()=>document.querySelector('#commonsSearch').value==='Water equipment support');await page.fill('#commonsSearch','');
 await page.fill('#commonsSearch','Monitoring toolkit');assert(await page.locator('#commonsList article').count()===1,'listing search');await page.fill('#commonsSearch','');
 await page.click('#commonsEdit-'+packet.listings[0].id);assert(await page.inputValue('#commonsSharing')==='local','editing resets approval');await page.selectOption('#commonsState','fulfilled');await page.fill('#commonsReason','Request fulfilled through local agreement.');await page.click('#commonsSave');
 await page.waitForFunction(()=>document.querySelector('#commonsList').textContent.includes('Fulfilled'));
 assert(await page.locator('#commonsMatch-'+packet.listings[0].id).count()===0,'closed listing does not match');
 const backup=JSON.parse((await download(page,'#plExportJson')).text);assert(backup.plan.commons.listings.length===2&&backup.plan.commons.listings[0].versions.length===2,'private backups include all listings/history');
 await page.waitForTimeout(900);await page.reload();await ready(page);assert((await page.textContent('#commonsCount')).startsWith('2 listings'),'listings persist');await ctx.close();
});
await test("Commons: incoming notices, deduplication, updates, conflicts and isolation",async()=>{
 const {ctx,page}=await newPage({},'commons-import');await page.goto(BASE+'/');await ready(page);
 const packet=await page.evaluate(()=>{const C=window.RPB_COMMONS;return C.packet(C.save(C.empty(),'water','remote-notice',{...C.fresh(),kind:'offered',category:'equipment',title:'Shared water toolkit',description:'A small kit for community use.',community:'Neighbouring water group',area:'Broad region',route:'Community liaison',end:'2030-12-01',status:'open',sharing:'shared',permission:'Group approved sharing.'},'Initial offer'));});
 const f=join(TMP,'commons.json');await writeFile(f,JSON.stringify(packet));await page.setInputFiles('#commonsImport',f);await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#commonsCount').textContent.startsWith('1 listings'));
 assert(await page.locator('#commonsList [id^=commonsEdit-]').count()===0,'received notices are read-only');
 await page.setInputFiles('#commonsImport',f);await page.waitForFunction(()=>document.querySelector('#commonsStatus').textContent.includes('1 duplicate'));
 packet.listings[0].snapshot.title='Conflicting source text';await writeFile(f,JSON.stringify(packet));await page.setInputFiles('#commonsImport',f);await page.waitForFunction(()=>document.querySelector('#commonsStatus').textContent.includes('1 conflicting'));
 packet.listings[0].snapshot.status='withdrawn';packet.listings[0].revision=2;await writeFile(f,JSON.stringify(packet));await page.setInputFiles('#commonsImport',f);await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#commonsList').textContent.includes('Withdrawn'));
 assert((await page.textContent('#commonsCount')).startsWith('1 listings'),'update refreshes received listing without duplicating');
 await page.click('#commonsExport');await page.waitForFunction(()=>document.querySelector('#commonsStatus').textContent.includes('No listings approved'));
 const original=await page.inputValue('#commonsPlan');await page.click('#plNew');await page.waitForFunction(()=>document.querySelector('#commonsCount').textContent.startsWith('0 listings'));
 await page.selectOption('#commonsPlan',original);await page.waitForFunction(()=>document.querySelector('#commonsCount').textContent.startsWith('1 listings'));assert(await page.inputValue('#plSwitch')===original,'commons plan selector is synchronized');await ctx.close();
});
await test("Commons: offline, safety return, safe text, mobile RTL and standalone",async()=>{
 const {ctx,page}=await newPage({viewport:{width:390,height:844}},'commons-offline');await page.goto(BASE+'/');await ready(page);await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await ctx.setOffline(true);
 await page.fill('#commonsTitle','<img src=x onerror=alert(1)>');await page.fill('#commonsDescription','A community request.');await page.fill('#commonsCommunity','Water group');await page.fill('#commonsArea','Broad district');await page.fill('#commonsRoute','Phone 0700 123 4567');await page.click('#commonsSave');await page.waitForFunction(()=>document.querySelector('#commonsCount').textContent.startsWith('1 listings'));
 assert(await page.locator('#commonsList img').count()===0,'listing text remains literal');await page.click('#plExportJson');await page.waitForSelector('#dlgSafety[open]');assert((await page.textContent('#safetyFindings')).includes('Commons'),'safety scans listings');await page.click('#dlgSafetyEdit');assert(await page.locator('#commonsMount').isVisible(),'safety edit reaches commons');
 await page.waitForTimeout(900);await page.reload();await ready(page);assert((await page.textContent('#commonsCount')).startsWith('1 listings'),'offline capture persists');await chooseLanguage(page,'ar');assert(await page.getAttribute('#commons','lang')==='en','English controls marked');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile RTL no overflow');await ctx.setOffline(false);await ctx.close();
 const single=await newPage({},'commons-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);assert(await single.page.locator('#commonsCategory option').count()===5,'standalone commons available');await single.ctx.close();
});

await test("Governance: category, four pillars, planner, evidence web and offline content",async()=>{
 const {ctx,page}=await newPage({},'governance');await page.goto(BASE+'/');await ready(page);
 await page.selectOption('#bridgeCategoryFilter','governance');assert(await page.locator('#bridgesMount .bridge:not([hidden])').count()===1,'governance category isolates the new bridge');
 await page.fill('#evolutionSearch','participatory budgeting');assert(await page.locator('#bridge-regenerative-governance').isVisible(),'pillar text is searchable');
 await page.locator('#bridge-regenerative-governance > summary').click();const text=await page.textContent('#bridge-regenerative-governance');
 for(const phrase of ['Participatory budgeting','Community assemblies','Stewardship councils','Transparent decision-making'])assert(text.includes(phrase),'governance pillar '+phrase);
 await page.click('#bridge-regenerative-governance [data-plan]');assert(await page.inputValue('#plBridge')==='regenerative-governance','planner selects governance');
 assert(await page.locator('#plMeasures input[type=checkbox]').count()===7,'governance measures available');
 await page.click('#tab-timeline');await page.click('#tlSeed');assert(await page.locator('#rows-timeline .row').count()===9,'governance pilot steps seed timeline');
 await page.click('#tab-risks');await page.click('#riskSeed');assert(await page.locator('#rows-risks .row').count()===7,'governance failure modes seed risks');
 await page.click('#tab-knowledge');assert(await page.locator('#knowledgeExample option').count()===N_BRIDGES*3+1,'governance learning prompts included');
 assert(await page.locator('#webMount [data-bridge="regenerative-governance"]').count()>0,'bridge appears in evidence web');
 const backup=JSON.parse((await download(page,'#plExportJson')).text);assert(backup.plan.bridge==='regenerative-governance'&&backup.plan.risks.length===7,'backup retains governance plan');
 await page.waitForFunction(()=>document.querySelector('#saveState').textContent.startsWith('Saved on this device'));await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await ctx.setOffline(true);await page.reload();await ready(page);assert(await page.inputValue('#plBridge')==='regenerative-governance','offline governance plan restored');await ctx.setOffline(false);await ctx.close();
});

await test("Digital: five pathways, planning, selectors, backups and offline access",async()=>{
 const {ctx,page}=await newPage({},'digital');await page.goto(BASE+'/');await ready(page);
 await page.selectOption('#bridgeCategoryFilter','digital');
 assert(await page.locator('#bridgesMount .bridge:not([hidden])').count()===5,'five digital pathways');
 const family=DOCS.bridges.filter(b=>b.category==='digital');
 for(const b of family){
   await page.fill('#evolutionSearch',b.short);
   assert(await page.locator('#bridgesMount .bridge:not([hidden])').count()===1,'search isolates '+b.id);
   await page.locator('#bridge-'+b.id+' > summary').click();await page.click('#bridge-'+b.id+' [data-plan]');
   assert(await page.inputValue('#plBridge')===b.id,'planner selects '+b.id);
   assert(await page.locator('#plMeasures input[type=checkbox]').count()===b.measures.length,'measures '+b.id);
   assert(await page.locator('#webMount [data-bridge="'+b.id+'"]').count()>0,'source links '+b.id);
   assert(await page.locator('#commonsBridge option[value="'+b.id+'"]').count()===1,'commons selection '+b.id);
   const backup=JSON.parse((await download(page,'#plExportJson')).text);assert(backup.plan.bridge===b.id,'backup accepts '+b.id);
 }
 await page.fill('#evolutionSearch','');await page.click('#tab-timeline');await page.click('#tlSeed');assert(await page.locator('#rows-timeline .row').count()===7,'six steps plus first step');
 await page.click('#tab-risks');await page.click('#riskSeed');assert(await page.locator('#rows-risks .row').count()===4,'portal risks seed');
 await page.click('#tab-knowledge');assert(await page.locator('#knowledgeExample option').count()===N_BRIDGES*3+1,'all learning examples');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await ctx.setOffline(true);await page.waitForTimeout(900);await page.reload();await ready(page);
 assert(await page.inputValue('#plBridge')==='resilience-portals','offline selected bridge persists');await page.selectOption('#bridgeCategoryFilter','digital');assert(await page.locator('#bridgesMount .bridge:not([hidden])').count()===5,'offline family');await ctx.close();
 const single=await newPage({viewport:{width:390,height:844}},'digital-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);
 await single.page.selectOption('#bridgeCategoryFilter','digital');assert(await single.page.locator('#bridgesMount .bridge:not([hidden])').count()===5,'standalone family');
 await chooseLanguage(single.page,'ar');assert(await single.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile RTL no overflow');await single.ctx.close();
});

await test("Diplomacy: four pathways, planning, selectors, backups and offline access",async()=>{
 const {ctx,page}=await newPage({},'diplomacy');await page.goto(BASE+'/');await ready(page);
 await page.selectOption('#bridgeCategoryFilter','diplomacy');
 assert(await page.locator('#bridgesMount .bridge:not([hidden])').count()===4,'four diplomacy pathways');
 const family=DOCS.bridges.filter(b=>b.category==='diplomacy');
 for(const b of family){
   await page.fill('#evolutionSearch',b.short);
   assert(await page.locator('#bridge-'+b.id).isVisible(),'search includes '+b.id);
   await page.locator('#bridge-'+b.id+' > summary').click();await page.click('#bridge-'+b.id+' [data-plan]');
   assert(await page.inputValue('#plBridge')===b.id,'planner selects '+b.id);
   assert(await page.locator('#plMeasures input[type=checkbox]').count()===b.measures.length,'measures '+b.id);
   assert(await page.locator('#webMount [data-bridge="'+b.id+'"]').count()>0,'source links '+b.id);
   assert(await page.locator('#commonsBridge option[value="'+b.id+'"]').count()===1,'commons selection '+b.id);
   const backup=JSON.parse((await download(page,'#plExportJson')).text);assert(backup.plan.bridge===b.id,'backup accepts '+b.id);
 }
 await page.fill('#evolutionSearch','');
 await page.click('#webViewSystems');await page.locator('#plSystems details').first().locator('summary').click();await page.selectOption('#systemsTemplate','restoration-diplomacy');await page.click('#systemsLoad');await page.click('#dlgConfirmOk');
 await page.waitForFunction(()=>document.querySelector('#systemsCount').textContent.startsWith('5 nodes'));
 const mapBackup=JSON.parse((await download(page,'#plExportJson')).text).plan.systems.maps['joint-monitoring'];
 assert(mapBackup.edges.length===6 && mapBackup.edges.every(e=>e.status==='hypothesis') && mapBackup.sharing==='local','proposed map and tradeoff preserved in backup');
 await page.click('#tab-timeline');await page.click('#tlSeed');assert(await page.locator('#rows-timeline .row').count()===7,'six steps plus first step');
 await page.click('#tab-risks');await page.click('#riskSeed');assert(await page.locator('#rows-risks .row').count()===4,'joint monitoring risks seed');
 await page.click('#tab-knowledge');assert(await page.locator('#knowledgeExample option').count()===N_BRIDGES*3+1,'all learning examples');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await ctx.setOffline(true);await page.waitForTimeout(900);await page.reload();await ready(page);
 assert(await page.inputValue('#plBridge')==='joint-monitoring','offline selected bridge persists');await page.selectOption('#bridgeCategoryFilter','diplomacy');assert(await page.locator('#bridgesMount .bridge:not([hidden])').count()===4,'offline family');await ctx.close();
 const single=await newPage({viewport:{width:390,height:844}},'diplomacy-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);
 await single.page.selectOption('#bridgeCategoryFilter','diplomacy');assert(await single.page.locator('#bridgesMount .bridge:not([hidden])').count()===4,'standalone family');
 await chooseLanguage(single.page,'ar');assert(await single.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile RTL no overflow');await single.ctx.close();
});

await test("Forking: attribution, adaptation, frozen comparisons, import and offline",async()=>{
 const {ctx,page}=await newPage({},'forking');await page.goto(BASE+'/');await ready(page);
 await page.fill('#plProject','Original watershed design');await page.fill('#plNotes','Original design note');await page.selectOption('#plBridge','shared-watersheds');
 await page.click('#tab-timeline');await page.click('#tlSeed');
 await page.locator('#forkDetails > summary').click();await page.fill('#forkCredit','Watershed council');await page.fill('#forkNote','Credit the source and return learning.');await page.click('#forkSaveCredit');
 const sourceId=await page.inputValue('#plSwitch');const source=JSON.parse((await download(page,'#plExportJson')).text).plan;
 await page.click('#plFork');await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#plProject').value.endsWith('(fork)'));
 const forkId=await page.inputValue('#plSwitch');assert(forkId!==sourceId,'fork creates independent local plan');
 await page.click('#tab-readiness');await page.fill('#plNotes','Adapted design note');await page.fill('#forkCredit','Partner assembly');await page.fill('#forkNote','Adjusted for local seasons.');await page.click('#forkSaveCredit');
 await page.click('#forkCompare');assert((await page.textContent('#forkComparison')).includes('Original design note')&&(await page.textContent('#forkComparison')).includes('Adapted design note'),'before and after shown');
 const comparison=JSON.parse((await download(page,'#forkExport')).text);assert(comparison.changes.some(d=>d.path==='notes')&&comparison.source===source.forking.id,'comparison export has source identity and changed fields');
 const backup=(await download(page,'#plExportJson')).text;const fork=JSON.parse(backup).plan;
 assert(fork.forking.ancestors[0].credit==='Watershed council'&&fork.forking.id!==source.forking.id,'attribution preserved with new identity');
 assert(fork.consent.length===0&&Object.keys(fork.evolution).length===0,'local consent and maturity not inherited');
 assert((await download(page,'#plExportMd')).text.includes('Watershed council'),'brief attribution');
 await page.selectOption('#plSwitch',sourceId);await page.fill('#plNotes','Source edited later');await page.selectOption('#plSwitch',forkId);await page.locator('#forkDetails > summary').click();await page.click('#forkCompare');
 assert((await page.textContent('#forkComparison')).includes('Original design note')&&!(await page.textContent('#forkComparison')).includes('Source edited later'),'frozen baseline survives source edit');
 await page.selectOption('#forkCompareTarget',sourceId);await page.click('#forkCompare');assert((await page.textContent('#forkComparison')).includes('Source edited later'),'can compare another current local plan');
 await page.click('#plFork');await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#plProject').value.endsWith('(fork) (fork)'));
 const descendant=JSON.parse((await download(page,'#plExportJson')).text).plan;assert(descendant.forking.ancestors.length===2&&descendant.forking.ancestors[1].credit==='Partner assembly','multi-generation attribution');
 const file=join(TMP,'fork-plan.json');await writeFile(file,backup);await page.setInputFiles('#plImport',file);await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#plNotes').value==='Adapted design note');
 const imported=JSON.parse((await download(page,'#plExportJson')).text).plan;assert(imported.forking.parent.baseline.notes==='Original design note','import retains baseline');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.waitForTimeout(900);await ctx.setOffline(true);await page.reload();await ready(page);await page.locator('#forkDetails > summary').click();await page.click('#forkCompare');assert((await page.textContent('#forkComparison')).includes('Original design note'),'offline comparison');await ctx.close();
 const single=await newPage({viewport:{width:390,height:844}},'fork-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);await single.page.locator('#forkDetails > summary').click();await single.page.fill('#forkCredit','<img src=x onerror=alert(1)>');await single.page.click('#forkSaveCredit');await single.page.click('#plFork');await single.page.click('#dlgConfirmOk');await single.page.waitForFunction(()=>document.querySelector('#plProject').value.endsWith('(fork)'));assert(await single.page.locator('#plForking img').count()===0,'attribution is literal text');await chooseLanguage(single.page,'ar');assert(await single.page.getAttribute('#plForking','lang')==='en','new controls marked English');assert(await single.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile RTL no overflow');await single.ctx.close();
});

await test("Vault: IndexedDB persistence, history, capture, search, import and deletion",async()=>{
 const {ctx,page}=await newPage({},'vault');await page.goto(BASE+'/');await ready(page);
 assert((await page.textContent('#vaultStorage')).includes('Storage: IndexedDB'),'actual IndexedDB mode');
 await page.fill('#vaultTitle','Research sentinel');await page.fill('#vaultBody','Compare soil-cover methods.');await page.fill('#vaultSource','Community research circle');await page.selectOption('#vaultBridge','shared-watersheds');await page.click('#vaultSave');await page.waitForFunction(()=>document.querySelector('#vaultCount').textContent.startsWith('1 of 1'));
 const stored=await page.evaluate(()=>new Promise((resolve,reject)=>{const req=indexedDB.open('rpb',1);req.onsuccess=()=>{const db=req.result;const tx=db.transaction('kv','readonly'),q=tx.objectStore('kv').get('knowledge-vault');q.onsuccess=()=>resolve(q.result);tx.oncomplete=()=>db.close();};req.onerror=()=>reject(req.error);}));
 assert(stored.records.length===1&&stored.records[0].body==='Compare soil-cover methods.','record committed to IndexedDB');
 const id=stored.records[0].id;await page.click('#vaultEdit-'+id);await page.fill('#vaultBody','Corrected soil-cover method.');await page.click('#vaultSave');await page.waitForFunction(()=>document.querySelector('#vaultList').textContent.includes('revision 2'));
 assert((JSON.parse((await download(page,'#vaultExport')).text)).vault.records[0].history[0].body==='Compare soil-cover methods.','backup retains history');
 await page.click('#btnSearch');await page.fill('#searchInput','Research sentinel');await page.locator('#searchResults button').filter({hasText:'Vault note'}).first().click();await page.waitForFunction(()=>document.querySelector('#vaultTitle').value==='Research sentinel');await page.click('#vaultCancel');
 await page.selectOption('#plBridge','shared-watersheds');await page.fill('#plProject','Local adaptation');await page.fill('#plNotes','A different review schedule.');await page.click('#tab-knowledge');await page.fill('#knowledgeStatement','Residents observed improved soil cover.');await page.fill('#knowledgeContext','A local seasonal discussion.');await page.fill('#knowledgeSource','Community assembly');await page.click('#knowledgeSave');await page.waitForFunction(()=>document.querySelector('#knowledgeCount').textContent.startsWith('1 active'));
 await page.locator('#vault > details').locator('summary').click();await page.click('#vaultCaptureAccounts');await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#vaultCount').textContent.startsWith('2 of 2'));
 await page.locator('#vault > details').locator('summary').click();await page.click('#vaultCaptureAccounts');await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#vaultStatus').textContent.startsWith('0 source accounts'));
 await page.locator('#vault > details').locator('summary').click();await page.click('#vaultCaptureAdaptation');await page.waitForFunction(()=>document.querySelector('#vaultCount').textContent.startsWith('3 of 3'));
 await page.selectOption('#vaultTypeFilter','observation');assert(await page.locator('#vaultList article').count()===1,'record type filter');await page.selectOption('#vaultTypeFilter','');await page.fill('#vaultSearch','soil');assert(await page.locator('#vaultList article').count()===2,'vault search');await page.fill('#vaultSearch','');
 const all=(await download(page,'#btnExportAll')).text;assert(JSON.parse(all).knowledgeVault.records.length===3,'Export everything includes vault');
 const f=join(TMP,'vault-all.json');await writeFile(f,all);await page.setInputFiles('#vaultImport',f);await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#vaultStatus').textContent.includes('3 duplicates'));
 await page.click('#vaultDelete-'+id);await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#vaultCount').textContent.startsWith('2 of 2'));
 await page.setInputFiles('#vaultImport',f);await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#vaultStatus').textContent.startsWith('1 added'));
 await page.click('#btnWipe');await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#vaultCount').textContent.startsWith('0 of 0'));await page.reload();await ready(page);assert((await page.textContent('#vaultCount')).startsWith('0 of 0'),'global deletion removes persisted vault');await ctx.close();
});
await test("Vault: concurrent writes, stale edits and failed transaction preserve drafts",async()=>{
 const {ctx,page}=await newPage({},'vault-conflicts');await ctx.addInitScript(()=>Object.defineProperty(navigator,'locks',{value:undefined}));await page.goto(BASE+'/');await ready(page);const other=await ctx.newPage();await other.goto(BASE+'/');await ready(other);
 await page.fill('#vaultTitle','First');await page.fill('#vaultBody','First note');await other.fill('#vaultTitle','Second');await other.fill('#vaultBody','Second note');await Promise.all([page.click('#vaultSave'),other.click('#vaultSave')]);await page.waitForFunction(()=>document.querySelector('#vaultStatus').textContent.length>0);await other.waitForFunction(()=>document.querySelector('#vaultStatus').textContent.length>0);
 await page.click('#vaultReload');await page.waitForFunction(()=>document.querySelector('#vaultCount').textContent.startsWith('2 of 2'));await other.click('#vaultReload');await other.waitForFunction(()=>document.querySelector('#vaultCount').textContent.startsWith('2 of 2'));
 const id=await page.locator('#vaultList article').first().getAttribute('data-vault-id');await page.click('#vaultEdit-'+id);await other.click('#vaultEdit-'+id);await page.fill('#vaultBody','New local revision');await page.click('#vaultSave');await page.waitForFunction(()=>document.querySelector('#vaultList').textContent.includes('revision 2'));await other.fill('#vaultBody','Stale draft');await other.click('#vaultSave');await other.waitForFunction(()=>document.querySelector('#vaultStatus').textContent.includes('another tab'));assert(await other.inputValue('#vaultBody')==='Stale draft','conflict retains unsaved draft');
 await page.fill('#vaultTitle','Quota trial');await page.fill('#vaultBody','Retain this unsaved text');await page.evaluate(()=>{window.originalVaultPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(value,key){if(key==='knowledge-vault')throw new DOMException('Test quota failure','QuotaExceededError');return window.originalVaultPut.call(this,value,key);};});await page.click('#vaultSave');await page.waitForFunction(()=>document.querySelector('#vaultStatus').textContent.includes('quota'));assert(await page.inputValue('#vaultBody')==='Retain this unsaved text','failed transaction preserves draft');await page.evaluate(()=>IDBObjectStore.prototype.put=window.originalVaultPut);const backup=JSON.parse((await download(page,'#vaultExport')).text);assert(backup.vault.records.length===2,'failed transaction did not write');await ctx.close();
});
await test("Vault: offline, standalone, mobile RTL, literal text and fallback storage",async()=>{
 const {ctx,page}=await newPage({viewport:{width:390,height:844}},'vault-offline');await page.goto(BASE+'/');await ready(page);await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await ctx.setOffline(true);await page.selectOption('#vaultKind','lesson');await page.fill('#vaultTitle','<img src=x onerror=alert(1)>');await page.fill('#vaultBody','Local lesson');await page.click('#vaultSave');await page.waitForFunction(()=>document.querySelector('#vaultCount').textContent.startsWith('1 of 1'));await page.reload();await ready(page);assert(await page.locator('#vaultList img').count()===0,'text remains literal');assert((await page.textContent('#vaultCount')).startsWith('1 of 1'),'offline persists');await chooseLanguage(page,'ar');assert(await page.getAttribute('#vault','lang')==='en','vault English marked');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile RTL no overflow');await ctx.close();
 const single=await newPage({},'vault-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);assert(await single.page.locator('#vaultKind option').count()===4,'all four types standalone');await single.ctx.close();
 const fallback=await newPage({},'vault-fallback');await fallback.ctx.addInitScript(()=>Object.defineProperty(window,'indexedDB',{value:undefined}));await fallback.page.goto(BASE+'/');await ready(fallback.page);assert((await fallback.page.textContent('#vaultStorage')).includes('using localStorage'),'fallback reported honestly');await fallback.page.fill('#vaultTitle','Fallback note');await fallback.page.fill('#vaultBody','Stored locally');await fallback.page.click('#vaultSave');await fallback.page.waitForFunction(()=>document.querySelector('#vaultCount').textContent.startsWith('1 of 1'));await fallback.page.reload();await ready(fallback.page);assert((await fallback.page.textContent('#vaultCount')).startsWith('1 of 1'),'fallback persists');await fallback.ctx.close();
});

await test("Provenance: authors, adapters, evidence, assumptions, sharing and fork lineage",async()=>{
 const {ctx,page}=await newPage({},'provenance');await page.goto(BASE+'/');await ready(page);await page.selectOption('#plBridge','shared-watersheds');await page.fill('#plProject','Contribution trial');if(!(await page.locator('#provAuthor').isVisible()))await page.locator('#provDetails > summary').click();
 await page.fill('#provAuthor','Watershed author council');await page.fill('#provEvidence','Initial observation account');await page.fill('#provAssumptions','AssumptionSentinel: joint sessions are accessible.');await page.selectOption('#provSources',['chs-2024']);await page.click('#provSave');await page.waitForFunction(()=>document.querySelector('#provStatus').textContent.includes('actor'));
 await page.fill('#provActor','Council reviewer');await page.fill('#provReason','Record initial design and evidence.');await page.click('#provPreviewBtn');assert((await page.textContent('#provPreview')).includes('Assumptions'),'change preview');await page.click('#provSave');await page.waitForFunction(()=>document.querySelector('#provCount').textContent.startsWith('1 recorded'));
 assert((await page.textContent('#bridge-shared-watersheds')).includes('Watershed author council'),'card shows local author credit');
 assert(!(await download(page,'#plExportMd')).text.includes('AssumptionSentinel'),'local provenance excluded from briefs');
 await page.fill('#provAdapter','Neighbouring assembly');await page.fill('#provEvidence','Later observations challenge the initial account.');await page.selectOption('#provSources',['cda-dnh']);await page.fill('#provAssumptions','Separate sessions are needed.');await page.fill('#provActor','Assembly reviewer');await page.fill('#provReason','Participation conditions changed.');await page.click('#provSave');await page.waitForFunction(()=>document.querySelector('#provCount').textContent.startsWith('2 recorded'));
 const local=JSON.parse((await download(page,'#plExportJson')).text).plan;const ledger=local.provenance.bridges['shared-watersheds'];assert(ledger.history[1].before.evidence==='Initial observation account'&&ledger.history[1].after.assumptions==='Separate sessions are needed.','before/after retained');
 await page.click('#provExport');await page.waitForFunction(()=>document.querySelector('#provStatus').textContent.includes('Approve'));await page.fill('#provPermission','Both groups approved the entire history.');await page.click('#provApprove');await page.waitForFunction(()=>document.querySelector('#provSharing').textContent.includes('Approved'));
 const exported=JSON.parse((await download(page,'#provExport')).text);assert(exported.record.history.length===2,'approved export includes history');const csv=(await download(page,'#provCsv')).text;assert(csv.includes('Initial observation account')&&csv.includes('Later observations'),'CSV shows evidence changes');assert((await download(page,'#plExportMd')).text.includes('Neighbouring assembly'),'approved summary in brief');
 await page.fill('#evolutionSearch','Council reviewer');assert(await page.locator('#bridge-shared-watersheds').isVisible(),'history contributor searchable');await page.fill('#evolutionSearch','');
 await page.locator('#forkDetails > summary').click();await page.click('#plFork');await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#plProject').value.endsWith('(fork)'));if(!(await page.locator('#provAuthor').isVisible()))await page.locator('#provDetails > summary').click();
 assert((await page.textContent('#plProvenance')).includes('Inherited contribution history'),'fork labels inherited claims');assert((await page.textContent('#provCount')).startsWith('2 recorded')&&(await page.textContent('#provSharing')).includes('Local only'),'fork retains history and resets sharing');assert(await page.inputValue('#evo-evidence')==='Conceptual','provenance does not promote maturity');
 await page.fill('#provAdapter','New local group');await page.fill('#provActor','Local reviewer');await page.fill('#provReason','Adapted the inherited design.');await page.click('#provSave');await page.waitForFunction(()=>document.querySelector('#provCount').textContent.startsWith('3 recorded'));
 await page.selectOption('#plBridge','water');assert((await page.textContent('#provCount')).startsWith('0 recorded'),'bridge isolation');await page.selectOption('#plBridge','shared-watersheds');assert((await page.textContent('#provCount')).startsWith('3 recorded'),'original bridge restored');
 const backup=(await download(page,'#plExportJson')).text,f=join(TMP,'provenance.json');await writeFile(f,backup);await page.setInputFiles('#plImport',f);await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#plProject').value.endsWith('(fork)'));if(!(await page.locator('#provAuthor').isVisible()))await page.locator('#provDetails > summary').click();assert((await page.textContent('#provCount')).startsWith('3 recorded'),'backup import preserves ledger');await ctx.close();
});
await test("Provenance: offline, literal credits, mobile RTL and standalone",async()=>{
 const {ctx,page}=await newPage({viewport:{width:390,height:844}},'provenance-offline');await page.goto(BASE+'/');await ready(page);await page.selectOption('#plBridge','water');if(!(await page.locator('#provAuthor').isVisible()))await page.locator('#provDetails > summary').click();await page.fill('#provAuthor','<img src=x onerror=alert(1)>');await page.fill('#provAssumptions','Local access requires review.');await page.fill('#provActor','Review group');await page.fill('#provReason','Record a local assumption.');await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await ctx.setOffline(true);await page.click('#provSave');await page.waitForFunction(()=>document.querySelector('#provCount').textContent.startsWith('1 recorded'));await page.waitForTimeout(900);await page.reload();await ready(page);if(!(await page.locator('#provAuthor').isVisible()))await page.locator('#provDetails > summary').click();assert((await page.textContent('#provCount')).startsWith('1 recorded'),'offline persistence');assert(await page.locator('#plProvenance img').count()===0,'credits render as text');await chooseLanguage(page,'ar');assert(await page.getAttribute('#provDetails','lang')==='en','English controls marked');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile RTL no overflow');await ctx.close();
 const single=await newPage({},'prov-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);await single.page.selectOption('#plBridge','water');await single.page.locator('#provDetails > summary').click();assert(await single.page.locator('#provAuthor').isVisible(),'standalone provenance available');await single.ctx.close();
});

await test('Portfolio: sequencing, interactions, validation, backups and forks',async()=>{
 const {ctx,page}=await newPage({},'portfolio');await page.goto(BASE+'/');await ready(page);await page.locator('#portfolioDetails > summary').click();await page.click('#portfolioExample');
 assert(await page.locator('#portfolioWaves > li').count()===4,'four sequence waves');assert((await page.textContent('#portfolioReady')).includes('Safe land access'),'root ready');
 await page.click('#portfolioEditEdge-demo-edge-0');await page.selectOption('#portfolioVerification','verified');await page.click('#portfolioSaveEdge');assert((await page.textContent('#portfolioStatus')).includes('Verification needs'),'verification evidence required');
 await page.fill('#portfolioEvidence','Council review 2026-10-26');await page.click('#portfolioSaveEdge');await page.click('#portfolioEditNode-demo-0');await page.selectOption('#portfolioNodeState','complete');await page.click('#portfolioSaveNode');assert((await page.textContent('#portfolioReady')).includes('Seed distribution'),'verified prerequisite unlocks target');
 await page.click('#portfolioEditEdge-demo-edge-0');await page.fill('#portfolioRequirement','Revised access review');await page.click('#portfolioSaveEdge');assert(!(await page.textContent('#portfolioReady')).includes('Seed distribution'),'changed requirement resets verification');
 await page.selectOption('#portfolioFrom','demo-3');await page.selectOption('#portfolioTo','demo-0');await page.selectOption('#portfolioKind','benefit');await page.fill('#portfolioOwner','School council');await page.fill('#portfolioRequirement','PortfolioSentinel: meals may support stewardship participation');await page.fill('#portfolioContingency','Review participation barriers');await page.click('#portfolioSaveEdge');assert(await page.locator('#portfolioWaves > li').count()===4,'benefit never creates dependency cycle');assert((await page.textContent('#portfolioInteractions')).includes('PortfolioSentinel'),'interaction distinct');
 await page.click('#portfolioDeleteNode-demo-0');assert((await page.textContent('#portfolioStatus')).includes('Remove connected'),'no destructive cascade');
 await page.click('#btnSearch');await page.fill('#searchInput','PortfolioSentinel');await page.waitForTimeout(250);assert((await page.textContent('#searchResults')).includes('Portfolio & Dependency'),'search indexes portfolio');await page.keyboard.press('Escape');
 const report=JSON.parse((await download(page,'#portfolioExport')).text);assert(report.portfolio.nodes.length===4&&report.analysis.waves.length===4,'report includes model and analysis');
 const backup=(await download(page,'#plExportJson')).text,f=join(TMP,'portfolio-backup.json');await writeFile(f,backup);await page.setInputFiles('#plImport',f);await page.click('#dlgConfirmOk');await page.waitForTimeout(400);if(!(await page.locator('#portfolioExample').isVisible()))await page.locator('#portfolioDetails > summary').click();assert(await page.locator('#portfolioWaves > li').count()===4,'backup restores portfolio');
 if(!(await page.locator('#plFork').isVisible()))await page.locator('#forkDetails > summary').click();await page.click('#plFork');await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#plProject').value.endsWith('(fork)'));if(!(await page.locator('#portfolioExample').isVisible()))await page.locator('#portfolioDetails > summary').click();assert((await page.textContent('#portfolioReady')).includes('Safe land access'),'fork resets completion');assert((await page.textContent('#portfolioNodes')).includes('planned'),'fork retains design');await ctx.close();
});
await test('Portfolio: offline mobile RTL and standalone',async()=>{
 const {ctx,page}=await newPage({viewport:{width:390,height:844}},'portfolio-offline');await page.goto(BASE+'/');await ready(page);await page.locator('#portfolioDetails > summary').click();await page.fill('#portfolioTitle','<b>Local activity</b>');await page.click('#portfolioSaveNode');assert(await page.locator('#portfolioNodes b').count()===0,'literal safe text');await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.waitForTimeout(1000);await ctx.setOffline(true);await page.reload();await ready(page);await page.locator('#portfolioDetails > summary').click();assert((await page.textContent('#portfolioNodes')).includes('Local activity'),'offline persistence');await chooseLanguage(page,'ar');if(!(await page.locator('#portfolioExample').isVisible()))await page.locator('#portfolioDetails > summary').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile RTL no overflow');await ctx.close();
 const single=await newPage({},'portfolio-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);await single.page.locator('#portfolioDetails > summary').click();await single.page.click('#portfolioExample');assert(await single.page.locator('#portfolioWaves > li').count()===4,'standalone engine');await single.ctx.close();
});

await test('Scenario: deterministic results, ranges, edits, reports, backups and forks',async()=>{
 const {ctx,page}=await newPage({},'scenario');await page.goto(BASE+'/');await ready(page);await page.locator('#scenarioDetails > summary').click();assert((await page.textContent('#scenarioResults')).includes('Simulation unavailable'),'unconfigured model does not simulate');await page.click('#scenarioExample');assert((await page.textContent('#scenarioResults')).includes('82.5'),'hand calculated example');assert((await page.textContent('#scenarioResults')).includes('not a forecast'),'output label');
 await page.fill('#scenarioMin-rainfall','600');await page.click('#scenarioSaveParameters');assert((await page.textContent('#scenarioStatus')).includes('ranges'),'invalid baseline range rejected');await page.fill('#scenarioMin-rainfall','0');await page.fill('#scenarioContext','ScenarioSentinel: local illustrative assumptions');await page.click('#scenarioSaveParameters');
 await page.click('#scenarioEditCase-dry');await page.fill('#scenarioValue-rainfall','1001');await page.click('#scenarioSaveCase');assert((await page.textContent('#scenarioStatus')).includes('outside'),'out of range scenario refused');await page.fill('#scenarioValue-rainfall','500');await page.click('#scenarioSaveCase');assert((await page.textContent('#scenarioResults')).includes('92.5'),'scenario recomputed');
 await page.click('#scenarioEditOutcome-food');await page.fill('#scenarioWeight-funding','0');await page.click('#scenarioSaveOutcome');assert((await page.textContent('#scenarioResults')).includes('change from baseline: 0'),'zero coefficient honored');
 await page.click('#btnSearch');await page.fill('#searchInput','ScenarioSentinel');await page.waitForTimeout(250);assert((await page.textContent('#searchResults')).includes('Scenario & Causal'),'search');await page.keyboard.press('Escape');
 const report=JSON.parse((await download(page,'#scenarioExport')).text);assert(report.label.includes('SIMULATION')&&report.model.outcomes[0].weights.funding===0,'explicit labeled reproducible report');assert(!(await download(page,'#plExportMd')).text.includes('ScenarioSentinel'),'private assumptions excluded from brief');
 const backup=(await download(page,'#plExportJson')).text,f=join(TMP,'scenario-backup.json');await writeFile(f,backup);await page.setInputFiles('#plImport',f);await page.click('#dlgConfirmOk');await page.waitForTimeout(350);if(!(await page.locator('#scenarioExample').isVisible()))await page.locator('#scenarioDetails > summary').click();assert((await page.textContent('#scenarioResults')).includes('change from baseline: 0'),'backup restored');
 if(!(await page.locator('#plFork').isVisible()))await page.locator('#forkDetails > summary').click();await page.click('#plFork');await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#plProject').value.endsWith('(fork)'));if(!(await page.locator('#scenarioExample').isVisible()))await page.locator('#scenarioDetails > summary').click();assert((await page.textContent('#scenarioResults')).includes('change from baseline: 0'),'fork preserves model assumptions');await ctx.close();
});
await test('Scenario: offline, safe text, mobile RTL and standalone',async()=>{
 const {ctx,page}=await newPage({viewport:{width:390,height:844}},'scenario-offline');await page.goto(BASE+'/');await ready(page);await page.locator('#scenarioDetails > summary').click();await page.click('#scenarioExample');await page.click('#scenarioEditCase-dry');await page.fill('#scenarioTitle','<b>Dry scenario</b>');await page.click('#scenarioSaveCase');assert(await page.locator('#scenarioResults b').count()===0,'literal text');await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.waitForTimeout(1000);await ctx.setOffline(true);await page.reload();await ready(page);await page.locator('#scenarioDetails > summary').click();assert((await page.textContent('#scenarioResults')).includes('82.5'),'offline reproducibility');await chooseLanguage(page,'ar');if(!(await page.locator('#scenarioExample').isVisible()))await page.locator('#scenarioDetails > summary').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile RTL fits');await ctx.close();
 const single=await newPage({},'scenario-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);await single.page.locator('#scenarioDetails > summary').click();await single.page.click('#scenarioExample');assert((await single.page.textContent('#scenarioResults')).includes('82.5'),'standalone simulation');await single.ctx.close();
});
await test('Replication: distinct findings, filtering, verification, exchange and forks',async()=>{
 const {ctx,page}=await newPage({},'replication');await page.goto(BASE+'/');await ready(page);await page.locator('#replicationDetails > summary').click();await page.click('#replicationExamples');assert((await page.textContent('#replicationCount')).startsWith('5 of 5'),'all outcome types retained');await page.selectOption('#replicationFilterStatus','failed');assert(await page.locator('#replicationList > details').count()===1,'status filter');await page.selectOption('#replicationFilterStatus','');await page.fill('#replicationSearch','resentment');assert(await page.locator('#replicationList > details').count()===1,'adverse effect searchable');await page.fill('#replicationSearch','');
 for(const [id,value] of Object.entries({replicationTitle:'ReplicationSentinel independent account',replicationIntervention:'Illustrative shared seed system',replicationSource:'Council account with permission',replicationPeriod:'2026 growing season',replicationContext:'Objective was equitable access across settlements.',replicationConditions:'Different access conditions',replicationFidelity:'Delivery followed the protocol.',replicationFindings:'Contradictory account: excluded households saw no gain.',replicationAdverse:'Some participants reported exclusion.',replicationLimitations:'Small sample and selection bias.',replicationCostBasis:'Unknown total; in-kind contributions unrecorded.'}))await page.fill('#'+id,value);
 await page.selectOption('#replicationSourceType','community');await page.selectOption('#replicationOutcome','mixed');await page.selectOption('#replicationVerification','independent');await page.selectOption('#replicationRelated',['example-0']);await page.click('#replicationSave');assert((await page.textContent('#replicationStatus')).includes('reviewer'),'independence metadata required');await page.fill('#replicationVerifier','External review collective');await page.fill('#replicationVerificationReference','Review 2026-10-26, access outcomes only');await page.fill('#replicationIndependence','No role in project delivery; funder disclosed.');await page.click('#replicationSave');assert((await page.textContent('#replicationCount')).startsWith('6 of 6'),'contradictory account appended');await page.selectOption('#replicationFilterVerification','independent');assert(await page.locator('#replicationList > details').count()===1,'verification filter');await page.selectOption('#replicationFilterVerification','');
 const exported=JSON.parse((await download(page,'#replicationExport')).text);assert(exported.registry.records.length===6,'full registry report');assert(exported.registry.records[5].relations[0].kind==='contradicts','explicit contradiction preserved');const file=join(TMP,'registry.json');await writeFile(file,JSON.stringify(exported));await page.setInputFiles('#replicationImport',file);await page.waitForFunction(()=>document.querySelector('#replicationStatus').textContent.includes('6 identical'));exported.registry.records[0].findings='Changed remote account';await writeFile(file,JSON.stringify(exported));await page.setInputFiles('#replicationImport',file);await page.waitForFunction(()=>document.querySelector('#replicationStatus').textContent.includes('Conflicting report ID'));assert((await page.textContent('#replicationCount')).startsWith('6 of 6'),'conflict leaves originals');
 await page.locator('[data-report="example-1"] > summary').click();await page.fill('#replicationWithdrawReason-example-1','Contributor requested withdrawal');await page.click('#replicationWithdraw-example-1');assert((await page.textContent('#replicationCount')).startsWith('5 of 6'),'withdrawal hidden by default');await page.check('#replicationIncludeWithdrawn');assert((await page.textContent('#replicationCount')).startsWith('6 of 6'),'withdrawn retained');assert(!(await download(page,'#plExportMd')).text.includes('ReplicationSentinel'),'not public brief');
 const backup=(await download(page,'#plExportJson')).text,bf=join(TMP,'registry-plan.json');await writeFile(bf,backup);await page.setInputFiles('#plImport',bf);await page.click('#dlgConfirmOk');await page.waitForTimeout(350);if(!(await page.locator('#replicationExamples').isVisible()))await page.locator('#replicationDetails > summary').click();assert((await page.textContent('#replicationCount')).startsWith('5 of 6'),'backup keeps withdrawal');if(!(await page.locator('#plFork').isVisible()))await page.locator('#forkDetails > summary').click();await page.click('#plFork');await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#plProject').value.endsWith('(fork)'));if(!(await page.locator('#replicationExamples').isVisible()))await page.locator('#replicationDetails > summary').click();assert((await page.textContent('#replicationCount')).startsWith('5 of 6'),'fork retains reports and withdrawal');await ctx.close();
});
await test('Replication: offline, literal text, mobile RTL and standalone',async()=>{
 const {ctx,page}=await newPage({viewport:{width:390,height:844}},'replication-offline');await page.goto(BASE+'/');await ready(page);await page.locator('#replicationDetails > summary').click();await page.click('#replicationExamples');const packet=JSON.parse((await download(page,'#replicationExport')).text);packet.registry.records.forEach((r,i)=>{r.id='safe-'+i;r.relations=[];});packet.registry.records[0].title='<b>Literal report</b>';const file=join(TMP,'registry-safe.json');await writeFile(file,JSON.stringify(packet));await page.setInputFiles('#replicationImport',file);await page.waitForFunction(()=>document.querySelector('#replicationCount').textContent.startsWith('10 of 10'));assert(await page.locator('#replicationList b').count()===0,'safe text');await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.waitForTimeout(1000);await ctx.setOffline(true);await page.reload();await ready(page);await page.locator('#replicationDetails > summary').click();assert((await page.textContent('#replicationCount')).startsWith('10 of 10'),'offline persistence');await chooseLanguage(page,'ar');if(!(await page.locator('#replicationExamples').isVisible()))await page.locator('#replicationDetails > summary').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile RTL fits');await ctx.close();
 const single=await newPage({},'replication-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);await single.page.locator('#replicationDetails > summary').click();await single.page.click('#replicationExamples');assert((await single.page.textContent('#replicationCount')).startsWith('5 of 5'),'standalone registry');await single.ctx.close();
});
await test('Stewardship: encrypted notes, consent gates, grievances and safe disclosure',async()=>{
 const {ctx,page}=await newPage({},'stewardship');await page.goto(BASE+'/');await ready(page);await page.locator('#stewardshipDetails > summary').click();await page.fill('#stewTitle','Community repair capability');await page.fill('#stewSummary','Broad repair skills available through agreed community processes.');await page.selectOption('#stewGroups',['women']);await page.fill('#stewSecret','ProtectedLocationSentinel: never share this detail');await page.fill('#stewPass','correct test passphrase');await page.click('#stewSaveAsset');await page.waitForFunction(()=>document.querySelector('#stewList').textContent.includes('Community repair capability'));
 let backup=JSON.parse((await download(page,'#plExportJson')).text);const asset=backup.plan.stewardship.assets[0],id=asset.id;assert(asset.protected.algorithm==='AES-GCM','ciphertext persisted');assert(!JSON.stringify(backup).includes('ProtectedLocationSentinel'),'plaintext absent from backup');assert(!JSON.stringify(backup).includes('correct test passphrase'),'passphrase not saved');
 await page.click('#stewSelect-'+id);await page.fill('#stewUnlockPass','incorrect test passphrase');await page.click('#stewUnlock');await page.waitForFunction(()=>document.querySelector('#stewStatus').textContent.includes('Unable to unlock'));await page.fill('#stewUnlockPass','correct test passphrase');await page.click('#stewUnlock');await page.waitForFunction(()=>document.querySelector('#stewRevealed').textContent.includes('ProtectedLocationSentinel'));await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert(await page.textContent('#stewRevealed')==='','blur clears plaintext');await page.fill('#stewUnlockPass','correct test passphrase');await page.click('#stewUnlock');await page.waitForFunction(()=>document.querySelector('#stewRevealed').textContent.includes('ProtectedLocationSentinel'));await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));assert(await page.textContent('#stewRevealed')==='','printing clears plaintext');await page.click('#stewExport');assert((await page.textContent('#stewStatus')).includes('No assets'),'no permission no export');
 const date=new Date().toISOString().slice(0,10),due=new Date(Date.now()+365*86400000).toISOString().slice(0,10);
 await page.click('#stewInclusion');await page.check('input[name="who-women"][value="met"]');await page.click('#tab-consent');await page.click('#consentAdd');await page.selectOption('#rows-consent select[data-field="group"]','women');await page.fill('#rows-consent input[data-field="date"]',date);await page.fill('#rows-consent input[data-field="nextCheck"]',due);await page.click('#stewRefresh');
 const event=async(kind,caseId='')=>{await page.selectOption('#stewEventKind',kind);await page.selectOption('#stewEventGroup','women');await page.fill('#stewEventOwner','Stewardship council');await page.fill('#stewEventNote','Neutral process rationale and feedback');await page.fill('#stewEventReference','Permissioned council record');await page.fill('#stewEventDue',due);await page.selectOption('#stewEventCase',caseId);await page.click('#stewSaveEvent');};
 await event('disclosure-granted');await event('decision');assert((await page.textContent('#stewEligibility')).startsWith('Eligible'),'consent plus decision permits neutral summary');const publicReport=JSON.parse((await download(page,'#stewExport')).text);assert(publicReport.assets.length===1,'approved summary exported');assert(Object.keys(publicReport.assets[0]).sort().join(',')==='category,summary,title','strict allowlist');assert(!JSON.stringify(publicReport).includes('protected'),'no protected payload');
 await event('grievance-open');assert((await page.textContent('#stewEligibility')).includes('Unresolved'),'grievance blocks disclosure');const caseId=await page.locator('#stewEventCase option').nth(1).getAttribute('value');await event('grievance-response',caseId);assert((await page.textContent('#stewGrievances')).includes('responded, unresolved'),'response does not close');await event('grievance-close',caseId);assert((await page.textContent('#stewEligibility')).startsWith('Eligible'),'closure tracked');await event('disclosure-withdrawn');await page.click('#stewExport');assert((await page.textContent('#stewStatus')).includes('No assets'),'withdrawal blocks export');
 await page.click('#btnSearch');await page.fill('#searchInput','ProtectedLocationSentinel');await page.waitForTimeout(250);assert(!(await page.textContent('#searchResults')).includes('Community Assets & Legitimacy'),'protected notes not indexed');await page.keyboard.press('Escape');
 backup=JSON.parse((await download(page,'#plExportJson')).text);const file=join(TMP,'stewardship-plan.json');await writeFile(file,JSON.stringify(backup));await page.setInputFiles('#plImport',file);await page.click('#dlgConfirmOk');await page.waitForTimeout(350);if(!(await page.locator('#stewTitle').isVisible()))await page.locator('#stewardshipDetails > summary').click();await page.click('#stewSelect-'+id);await page.fill('#stewUnlockPass','correct test passphrase');await page.click('#stewUnlock');await page.waitForFunction(()=>document.querySelector('#stewRevealed').textContent.includes('ProtectedLocationSentinel'));await page.click('#stewLock');
 if(!(await page.locator('#plFork').isVisible()))await page.locator('#forkDetails > summary').click();await page.click('#plFork');await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#plProject').value.endsWith('(fork)'));if(!(await page.locator('#stewTitle').isVisible()))await page.locator('#stewardshipDetails > summary').click();assert(await page.locator('#stewList .side-card').count()===0,'fork excludes protected records and permissions');await ctx.close();
});
await test('Stewardship: offline encrypted persistence, mobile RTL and standalone',async()=>{
 const {ctx,page}=await newPage({viewport:{width:390,height:844}},'stewardship-offline');await page.goto(BASE+'/');await ready(page);await page.locator('#stewardshipDetails > summary').click();await page.fill('#stewTitle','<b>Local capability</b>');await page.fill('#stewSummary','Neutral summary');await page.selectOption('#stewGroups',['youth']);await page.fill('#stewSecret','OfflinePrivateSentinel');await page.fill('#stewPass','offline test passphrase');await page.click('#stewSaveAsset');await page.waitForFunction(()=>document.querySelector('#stewList').textContent.includes('Local capability'));assert(await page.locator('#stewList b').count()===0,'literal text');await page.waitForFunction(()=>document.querySelector('#saveState').textContent.startsWith('Saved on this device'));await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await ctx.setOffline(true);await page.reload();await ready(page);await page.locator('#stewardshipDetails > summary').click();await page.locator('#stewList button').first().click();await page.fill('#stewUnlockPass','offline test passphrase');await page.click('#stewUnlock');await page.waitForFunction(()=>document.querySelector('#stewRevealed').textContent.includes('OfflinePrivateSentinel'));await page.locator('#stewardshipDetails > summary').click();await page.waitForFunction(()=>document.querySelector('#stewRevealed').textContent==='');await chooseLanguage(page,'ar');if(!(await page.locator('#stewTitle').isVisible()))await page.locator('#stewardshipDetails > summary').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile RTL fits');await ctx.close();
 const single=await newPage({},'stewardship-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);await single.page.locator('#stewardshipDetails > summary').click();assert(await single.page.locator('#stewCategory option').count()===6,'six strength types standalone');await single.ctx.close();
});
await test('Economics: lifecycle projections, overlap controls, sensitivity, backups and forks',async()=>{
 const {ctx,page}=await newPage({},'economics');await page.goto(BASE+'/');await ready(page);await page.locator('#economicsDetails > summary').click();await page.click('#econExample');assert((await page.textContent('#econResults')).includes('SIMULATION'),'simulation label');assert((await page.textContent('#econResults')).includes('Cash lifecycle cost, undiscounted: 1500'),'cash budget');assert(await page.locator('#econAnnual > li').count()===6,'years zero through five');assert(await page.locator('#econSensitivity > li').count()===4,'sensitivity comparisons');assert((await page.textContent('#econDistribution')).includes('Local workers and suppliers'),'distribution recipients');assert((await page.textContent('#econImpacts')).includes('culturally'),'non monetized impact');
 await page.fill('#econRate','10');await page.click('#econSaveSettings');assert((await page.textContent('#econStatus')).includes('range'),'rate outside sensitivity bounds rejected');await page.fill('#econRate','0');await page.fill('#econContext','EconomicsSentinel: locally reviewed illustrative assumptions');await page.click('#econSaveSettings');assert((await page.textContent('#econResults')).includes('Net present value: 250'),'zero discount case');
 await page.fill('#econTitle','Alternative crop-loss valuation');await page.selectOption('#econKind','benefit');await page.fill('#econGroup','Community');await page.fill('#econStart','1');await page.fill('#econEnd','5');await page.fill('#econAmount','100');await page.fill('#econLow','80');await page.fill('#econHigh','120');await page.fill('#econService','crop-loss-endpoint');await page.fill('#econBasis','Alternative valuation of the same endpoint, not additional benefit.');await page.click('#econSaveLine');assert((await page.textContent('#econResults')).includes('double counting'),'same endpoint blocks calculation');const conflict=await page.locator('#econLines li').filter({hasText:'Alternative crop-loss valuation'}).locator('button').first();await conflict.click();await page.uncheck('#econIncluded');await page.click('#econSaveLine');assert((await page.textContent('#econResults')).includes('Net present value: 250'),'excluded alternative resolves overlap');
 await page.click('#econEdit-maint');await page.fill('#econAmount','200');await page.fill('#econLow','160');await page.fill('#econHigh','240');await page.click('#econSaveLine');assert((await page.textContent('#econResults')).includes('Net present value: -250'),'maintenance changes net');const report=JSON.parse((await download(page,'#econExport')).text);assert(report.result.base.netPV===-250&&report.result.nonMonetized.length===1,'reproducible report preserves unpriced values');assert(!(await download(page,'#plExportMd')).text.includes('EconomicsSentinel'),'private model excluded from brief');
 await page.click('#btnSearch');await page.fill('#searchInput','EconomicsSentinel');await page.waitForTimeout(250);assert((await page.textContent('#searchResults')).includes('Restoration Economics'),'global search');await page.keyboard.press('Escape');const backup=(await download(page,'#plExportJson')).text,f=join(TMP,'economics-plan.json');await writeFile(f,backup);await page.setInputFiles('#plImport',f);await page.click('#dlgConfirmOk');await page.waitForTimeout(350);if(!(await page.locator('#econExample').isVisible()))await page.locator('#economicsDetails > summary').click();assert((await page.textContent('#econResults')).includes('Net present value: -250'),'backup restore');if(!(await page.locator('#plFork').isVisible()))await page.locator('#forkDetails > summary').click();await page.click('#plFork');await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#plProject').value.endsWith('(fork)'));if(!(await page.locator('#econExample').isVisible()))await page.locator('#economicsDetails > summary').click();assert((await page.textContent('#econResults')).includes('Net present value: -250'),'fork design retains appraisal');await ctx.close();
});
await test('Economics: offline, safe text, mobile RTL and standalone',async()=>{
 const {ctx,page}=await newPage({viewport:{width:390,height:844}},'economics-offline');await page.goto(BASE+'/');await ready(page);await page.locator('#economicsDetails > summary').click();await page.click('#econExample');await page.click('#econEdit-maint');await page.fill('#econTitle','<b>Maintenance</b>');await page.click('#econSaveLine');assert(await page.locator('#econLines b').count()===0,'literal safe text');await page.waitForFunction(()=>document.querySelector('#saveState').textContent.startsWith('Saved on this device'));await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await ctx.setOffline(true);await page.reload();await ready(page);await page.locator('#economicsDetails > summary').click();assert((await page.textContent('#econResults')).includes('Cash lifecycle cost, undiscounted: 1500'),'offline calculation');await chooseLanguage(page,'ar');if(!(await page.locator('#econExample').isVisible()))await page.locator('#economicsDetails > summary').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile RTL fits');await ctx.close();
 const single=await newPage({},'economics-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);await single.page.locator('#economicsDetails > summary').click();await single.page.click('#econExample');assert((await single.page.textContent('#econResults')).includes('Cash lifecycle cost, undiscounted: 1500'),'standalone appraisal');await single.ctx.close();
});
await test('Transfer: encrypted complete plans, histories, vault and atomic restore',async()=>{
 const {ctx,page}=await newPage({},'transfer');await page.goto(BASE+'/');await ready(page);await page.fill('#plProject','Transfer project');await page.fill('#plNotes','PrivateTransferSentinel');await page.click('#plSave');await page.waitForFunction(()=>document.querySelector('#saveState').textContent.startsWith('Saved on this device'));await page.fill('#plNotes','PrivateTransferSentinel revised');await page.click('#plSave');await page.waitForFunction(()=>document.querySelector('#saveState').textContent.startsWith('Saved on this device'));
 await page.fill('#vaultTitle','Transfer vault note');await page.fill('#vaultBody','VaultPrivateSentinel');await page.click('#vaultSave');await page.waitForFunction(()=>document.querySelector('#vaultCount').textContent.startsWith('1 of 1'));
 await page.locator('#transferDetails > summary').click();await page.check('#transferVault');await page.fill('#transferPass','strong transfer passphrase');await page.fill('#transferPassConfirm','strong transfer passphrase');const encrypted=(await download(page,'#transferEncrypted')).text;assert(!encrypted.includes('PrivateTransferSentinel')&&!encrypted.includes('VaultPrivateSentinel'),'whole payload encrypted');assert(await page.inputValue('#transferPass')==='','passphrase cleared');const f=join(TMP,'transfer.encrypted.json');await writeFile(f,encrypted);
 await page.setInputFiles('#transferFile',f);await page.fill('#transferUnlock','incorrect passphrase');await page.click('#transferInspect');await page.waitForFunction(()=>document.querySelector('#transferStatus').textContent.includes('Unable to decrypt'));const before=await page.locator('#plSwitch option').count();await page.fill('#transferUnlock','strong transfer passphrase');await page.click('#transferInspect');await page.waitForFunction(()=>document.querySelector('#transferPreview').textContent.includes('Integrity fingerprint'));assert((await page.textContent('#transferPreview')).includes('1 vault record'),'vault inspected');await page.click('#transferRestore');await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#transferStatus').textContent.startsWith('Restore completed'));assert(await page.locator('#plSwitch option').count()===before+1,'new copy added');assert(await page.inputValue('#plNotes')==='PrivateTransferSentinel revised','full plan restored');await page.click('#plVersions');assert(await page.locator('#versionsList [data-restore]').count()>=1,'saved versions retained');await page.keyboard.press('Escape');
 const plain=JSON.parse((await download(page,'#transferPlain')).text),snapshot=JSON.parse(plain.files.find(f=>f.name==='snapshot.json').content);assert(snapshot.workspace.plans[0].history.length>=1,'bundle retains history');const [zip]=await Promise.all([page.waitForEvent('download'),page.click('#transferZip')]);const z=readFileSync(await zip.path());assert(z[0]===80&&z[1]===75,'real ZIP');await page.setInputFiles('#transferFile',{name:'transfer.zip',mimeType:'application/zip',buffer:z});await page.click('#transferInspect');await page.waitForFunction(()=>document.querySelector('#transferPreview').textContent.includes('Integrity fingerprint'));
 await page.setInputFiles('#transferFile',f);await page.fill('#transferUnlock','strong transfer passphrase');await page.click('#transferInspect');await page.waitForFunction(()=>document.querySelector('#transferPreview').textContent.includes('Integrity fingerprint'));await page.check('#transferRestoreVault');const original=await page.locator('#plSwitch option').count();await page.evaluate(()=>{window.restorePut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(value,key){if(key==='knowledge-vault')throw new DOMException('Test quota failure','QuotaExceededError');return window.restorePut.call(this,value,key);};});await page.click('#transferRestore');await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#transferStatus').textContent.includes('quota'));assert(await page.locator('#plSwitch option').count()===original,'failed transaction adds no plan');await page.evaluate(()=>{IDBObjectStore.prototype.put=window.restorePut;});const storedCount=await page.evaluate(()=>new Promise((resolve,reject)=>{const q=indexedDB.open('rpb',1);q.onsuccess=()=>{const db=q.result,r=db.transaction('kv').objectStore('kv').get('workspace');r.onsuccess=()=>{resolve(r.result.plans.length);db.close();};r.onerror=()=>reject(r.error);};q.onerror=()=>reject(q.error);}));assert(storedCount===original,'aborted vault write rolls back queued workspace write');await page.locator('[id^=vaultEdit-]').first().click();await page.fill('#vaultBody','A newer local note');await page.click('#vaultSave');await page.waitForFunction(()=>document.querySelector('#vaultStatus').textContent.includes('Saved locally'));await page.click('#transferRestore');await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#transferStatus').textContent.includes('Conflicting vault IDs'));assert(await page.locator('#plSwitch option').count()===original,'vault conflict imports no plans');await ctx.close();
});
await test('Transfer: offline import, tamper rejection, CSV, mobile RTL and standalone',async()=>{
 const {ctx,page}=await newPage({viewport:{width:390,height:844}},'transfer-offline');await page.goto(BASE+'/');await ready(page);await page.fill('#plProject','=SUM(1,2)');await page.fill('#plNotes','Offline transfer');await page.locator('#transferDetails > summary').click();const raw=(await download(page,'#transferPlain')).text,b=JSON.parse(raw);assert(b.files.find(f=>f.name==='plans.csv').content.includes("'=SUM"),'CSV formula neutralized');const f=join(TMP,'plain-transfer.json');await writeFile(f,raw);b.files[0].content+=' ';const bad=join(TMP,'bad-transfer.json');await writeFile(bad,JSON.stringify(b));await page.setInputFiles('#transferFile',bad);await page.click('#transferInspect');await page.waitForFunction(()=>document.querySelector('#transferStatus').textContent.includes('Integrity check failed'));await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await ctx.setOffline(true);await page.setInputFiles('#transferFile',f);await page.click('#transferInspect');await page.waitForFunction(()=>document.querySelector('#transferPreview').textContent.includes('Integrity fingerprint'));await page.click('#transferRestore');await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#transferStatus').textContent.startsWith('Restore completed'));await page.reload();await ready(page);assert(await page.inputValue('#plNotes')==='Offline transfer','offline restore persists');await chooseLanguage(page,'ar');await page.locator('#transferDetails > summary').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile RTL fits');await ctx.close();
 const single=await newPage({},'transfer-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);await single.page.locator('#transferDetails > summary').click();const singleBundle=JSON.parse((await download(single.page,'#transferPlain')).text);assert(singleBundle.format==='rpb-offline-bundle','standalone transfer');await single.ctx.close();
});
await test('PWA: verified release, pin survives activation, archive switcher and quota status',async()=>{
 const {ctx,page}=await newPage({},'pwa');await page.goto(BASE+'/');await ready(page);await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.locator('#pwaDetails > summary').click();await page.click('#pwaRefresh');await page.waitForFunction(()=>document.querySelector('#pwaHealth').textContent.includes('Offline archive verified'));await page.click('#pwaPin');await page.waitForFunction(()=>document.querySelector('#pwaHealth').textContent.includes('Pinned release'));
 const original=await page.evaluate(async()=>{const c=await caches.open('rpb-release-settings');return (await (await c.match(new URL('__release-pin',location.href))).json()).version;});
 swVariant='pwa-next';await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update();});await page.waitForSelector(".toast button:has-text('Reload')");await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await new Promise(resolve=>{navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true});reg.waiting.postMessage({type:'SKIP_WAITING'});});});await page.reload();await ready(page);await page.locator('#pwaDetails > summary').click();await page.click('#pwaRefresh');await page.waitForFunction(()=>document.querySelector('#pwaHealth').textContent.includes('Pinned release'));assert((await page.textContent('#pwaHealth')).includes(original),'pin survives worker activation');
 await page.fill('#plNotes','Archive switch keeps private plans');await page.evaluate(async()=>{const r=await fetch('evidence-archive.json'),a=await r.json();a.version='3.18.0-fixture';a.data.documents[0].title='ArchiveFixtureSentinel';const c=await caches.open('rpb-core-v3.18.0-fixture');await c.put(new URL('evidence-archive.json',location.href),new Response(JSON.stringify(a)));});await page.click('#pwaRefresh');await page.selectOption('#pwaArchiveVersion','rpb-core-v3.18.0-fixture');await page.fill('#pwaArchiveSearch','ArchiveFixtureSentinel');await page.waitForFunction(()=>document.querySelector('#pwaArchiveView').textContent.includes('ArchiveFixtureSentinel'));assert(await page.inputValue('#plNotes')==='Archive switch keeps private plans','reader does not change plan');const archive=JSON.parse((await download(page,'#pwaExportArchive')).text);assert(archive.version==='3.18.0-fixture'&&!JSON.stringify(archive).includes('Archive switch keeps private plans'),'public archive export excludes plans');
 await page.evaluate(()=>{navigator.storage.estimate=async()=>({usage:95*1048576,quota:100*1048576});navigator.storage.persist=async()=>false;navigator.storage.persisted=async()=>false;});await page.click('#pwaProtect');assert((await page.textContent('#pwaMessage')).includes('not granted'),'denial explained');assert((await page.textContent('#pwaStorage')).includes('Low storage'),'quota warning');
 await ctx.setOffline(true);await page.click('#pwaRefresh');assert((await page.textContent('#pwaHealth')).includes('Offline'),'offline indicator');await ctx.setOffline(false);
 await page.click('#pwaRemoveArchive');await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#pwaMessage').textContent.includes('Older release removed')).catch(async e=>{throw Error('Cache removal: '+await page.textContent('#pwaMessage')+'; selected: '+await page.inputValue('#pwaArchiveVersion'));});assert(await page.inputValue('#plNotes')==='Archive switch keeps private plans','cache removal preserves plans');
 await Promise.all([page.waitForEvent('load'),page.click('#pwaUseUpdate')]);await ready(page);await page.locator('#pwaDetails > summary').click();await page.click('#pwaRefresh');await page.waitForFunction(()=>document.querySelector('#pwaHealth').textContent.includes('rpb-core-v-test-pwa-next'));assert(!(await page.textContent('#pwaHealth')).includes('Pinned release'),'explicit update unpins');swVariant='';await ctx.close();
});
await test('PWA: missing cache detection, install prompt, mobile and standalone guidance',async()=>{
 const {ctx,page}=await newPage({viewport:{width:390,height:844}},'pwa-missing');await page.goto(BASE+'/');await ready(page);await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.locator('#pwaDetails > summary').click();await page.click('#pwaRefresh');await page.waitForFunction(()=>document.querySelector('#pwaHealth').textContent.includes('Offline archive verified'));
 await page.evaluate(()=>{const e=new Event('beforeinstallprompt',{cancelable:true});e.prompt=async()=>{window.installPromptCalled=true;};e.userChoice=Promise.resolve({outcome:'dismissed'});window.dispatchEvent(e);});assert(await page.locator('#btnInstall').isVisible(),'install offered');await page.click('#btnInstall');assert(await page.evaluate(()=>window.installPromptCalled),'prompt invoked by gesture');assert(await page.locator('#btnInstall').isHidden(),'dismissed prompt resets');
 await page.evaluate(async()=>{for(const name of await caches.keys())if(name.startsWith('rpb-core-v')){const c=await caches.open(name);await c.delete(new URL('evidence-archive.json',location.href));}});await page.click('#pwaRefresh');await page.waitForFunction(()=>document.querySelector('#pwaHealth').textContent.includes('INCOMPLETE'));await page.click('#pwaPin');await page.waitForFunction(()=>document.querySelector('#pwaMessage').textContent.includes('complete offline release'));await chooseLanguage(page,'ar');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile RTL fits');await ctx.close();
 const single=await newPage({},'pwa-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);await single.page.locator('#pwaDetails > summary').click();assert((await single.page.textContent('#pwaHealth')).includes('standalone HTML'),'file mode explains recovery');await single.ctx.close();
});
await test('Hazard: mandatory prerequisite, scope invalidation, stop-work, private backups and forks',async()=>{
 const {ctx,page}=await newPage({},'hazard');await page.goto(BASE+'/');await ready(page);await page.selectOption('#plBridge','zai');await page.fill('#plPlace','General restoration area');for(const q of ['c1','c2','c3','s1','s2','s3','s4','r1','r2','r3','e1','e2','e3','o1','o2','o3','m1','m2','m3'])await page.check('input[name="ans-'+q+'"][value="yes"]',{force:true});assert((await page.textContent('#verdict')).includes('hazard prerequisite unresolved'),'all yes cannot self-certify');
 await page.locator('#hazardDetails > summary').click();await page.selectOption('#hazardOutcome','documented');await page.fill('#hazardWork','Only the authority-defined restoration scope');await page.fill('#hazardAuthority','Qualified mine-action organization');await page.fill('#hazardReference','HazardPrivateSentinel');await page.fill('#hazardConditions','Use only the agreed scope. Stop on any new concern.');await page.fill('#hazardOwner','Safety liaison role');await page.fill('#hazardReason','Checked the dated authority record and local arrangements');await page.fill('#hazardNext',new Date(Date.now()+30*86400000).toISOString().slice(0,10));await page.click('#hazardSave');assert((await page.textContent('#hazardStatus')).includes('every checklist item'),'missing checklist refuses completion');for(const k of ['authority','scope','access','briefing','response','monitoring'])await page.check('#hazardCheck-'+k);await page.click('#hazardSave');assert((await page.textContent('#hazardResult')).includes('not a clearance certificate'),'does not certify safety');assert((await page.textContent('#verdict')).includes('Ready for a small'),'other readiness conditions still apply');
 const brief=(await download(page,'#plExportMd')).text;assert(brief.includes('not a clearance certificate')&&!brief.includes('HazardPrivateSentinel'),'brief contains status without private references');const backup=(await download(page,'#plExportJson')).text;assert(JSON.parse(backup).plan.hazard.reviews.length===1,'backup preserves review');
 await page.fill('#plPlace','Different area');assert((await page.textContent('#verdict')).includes('hazard prerequisite unresolved'),'location change invalidates');await page.fill('#plPlace','General restoration area');await page.click('#tab-timeline');await page.click('[data-action="seed-timeline"]');assert((await page.textContent('#hazardResult')).includes('activities changed'),'scope change invalidates');
 await page.click('#hazardStop');assert((await page.textContent('#hazardStatus')).includes('Stop-work concern recorded'),'stop requires no completed form');assert(await page.locator('#hazardHistory > li').count()===2,'history retained');assert((await page.textContent('#hazardResult')).includes('STOP'),'stop gates field work');
 const file=join(TMP,'hazard-plan.json');await writeFile(file,backup);await page.setInputFiles('#plImport',file);await page.click('#dlgConfirmOk');await page.waitForTimeout(300);if(!(await page.locator('#hazardResult').isVisible()))await page.locator('#hazardDetails > summary').click();assert((await page.textContent('#hazardResult')).includes('not a clearance certificate'),'backup carries declarations with caveat');await page.click('#plDuplicate');assert((await page.textContent('#hazardResult')).includes('STOP'),'duplicate resets authorization');await page.selectOption('#plSwitch',await page.locator('#plSwitch option').nth(1).getAttribute('value'));if(!(await page.locator('#plFork').isVisible()))await page.locator('#forkDetails > summary').click();await page.click('#plFork');await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#plProject').value.endsWith('(fork)'));assert(await page.locator('#hazardHistory > li').count()===0,'fork starts unassessed');await ctx.close();
});
await test('Hazard: offline persistence, legacy defaults, safe text, mobile RTL and standalone',async()=>{
 const {ctx,page}=await newPage({viewport:{width:390,height:844}},'hazard-offline');await page.goto(BASE+'/');await ready(page);await page.selectOption('#plBridge','wetlands');await page.locator('#hazardDetails > summary').click();await page.fill('#hazardReason','<b>Local concern</b>');await page.click('#hazardStop');assert(await page.locator('#hazardHistory b').count()===0,'literal safe text');await page.waitForFunction(()=>document.querySelector('#saveState').textContent.startsWith('Saved on this device'));await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await ctx.setOffline(true);await page.reload();await ready(page);await page.locator('#hazardDetails > summary').click();assert(await page.locator('#hazardHistory > li').count()===1,'offline stop persists');assert((await page.textContent('#hazardResult')).includes('STOP'),'offline gate');await chooseLanguage(page,'ar');if(!(await page.locator('#hazardResult').isVisible()))await page.locator('#hazardDetails > summary').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile RTL fits');await ctx.close();
 const single=await newPage({},'hazard-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);await single.page.locator('#hazardDetails > summary').click();assert((await single.page.textContent('#hazardResult')).includes('STOP'),'standalone default gate');const old=JSON.parse((await download(single.page,'#plExportJson')).text);delete old.plan.hazard;const f=join(TMP,'pre-hazard.json');await writeFile(f,JSON.stringify(old));await single.page.setInputFiles('#plImport',f);await single.page.click('#dlgConfirmOk');await single.page.waitForTimeout(300);assert((await single.page.textContent('#hazardResult')).includes('STOP'),'legacy imports never inherit clearance');
 const legacyBundle=await single.page.evaluate(async old=>window.RPB_TRANSFER.create({schema:3,kind:'offline-transfer',app:'regenerative-peace-bridges',version:'3.18.0',exported:new Date().toISOString(),workspace:{schema:3,activeId:'legacy',removed:[],plans:[{id:'legacy',created:new Date().toISOString(),updated:null,plan:old.plan,history:[]}]}}),old);await single.page.locator('#transferDetails > summary').click();await single.page.setInputFiles('#transferFile',{name:'legacy-bundle.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacyBundle))});await single.page.click('#transferInspect');await single.page.waitForFunction(()=>document.querySelector('#transferStatus').textContent.includes('Transfer validated'));await single.page.click('#transferRestore');await single.page.click('#dlgConfirmOk');await single.page.waitForFunction(()=>document.querySelector('#transferStatus').textContent.startsWith('Restore completed'));assert((await single.page.textContent('#hazardResult')).includes('STOP'),'old complete bundles migrate to unassessed');await single.ctx.close();
});
await test('TK: permission gates, plural relationships, library links, limited sharing and withdrawal',async()=>{
 const {ctx,page}=await newPage({},'tk');await page.goto(BASE+'/');await ready(page);await page.selectOption('#plBridge','regeneration');await page.click('#tab-knowledge');await page.fill('#tkTitle','Local seasonal stewardship');await page.fill('#tkPractice','PrivateTKPracticeSentinel');await page.fill('#tkCommunity','Collective knowledge-holder role');await page.fill('#tkContext','Locally specific seasonal context');await page.fill('#tkBasis','Intergenerational learning and collective observation');await page.fill('#tkLimits','Different accounts remain distinct; conditions may change');await page.fill('#tkProtocol','PrivateTKProtocolSentinel');await page.fill('#tkBenefits','Reciprocity arrangements agreed with holders');await page.fill('#tkPermissionReference','PrivateTKPermissionSentinel');const until=new Date(Date.now()+30*86400000).toISOString().slice(0,10);await page.fill('#tkRetention',until);await page.fill('#tkReason','Holder-authorized initial account');await page.click('#tkSave');assert((await page.textContent('#tkStatus')).includes('knowledge holders'),'capture permission required');await page.check('#tkCapture');await page.selectOption('#tkReview','plural');await page.fill('#tkReviewNote','Holder-led review retains differing views');const target=await page.locator('#tkLinkTarget-0 option[value^="source|"]').first().getAttribute('value'),docId=target.split('|')[1];await page.selectOption('#tkLinkTarget-0',target);await page.selectOption('#tkLinkRelation-0','differs');await page.fill('#tkLinkNote-0','PrivateTKLinkSentinel');await page.selectOption('#tkSharing','summary');await page.fill('#tkPublicTitle','Approved seasonal account');await page.fill('#tkPublicSummary','PublicTKSummarySentinel');await page.fill('#tkPublicCredit','Knowledge-holder-approved credit');await page.fill('#tkPublicTerms','Agreed educational audience only; contact holders before other uses');await page.fill('#tkShareReference','PrivateTKShareSentinel');await page.fill('#tkShareUntil',until);await page.click('#tkSave');assert((await page.textContent('#tkStatus')).includes('separate approval'),'separate sharing approval required');await page.check('#tkShare');await page.check('#tkPublishLinks');await page.click('#tkSave');await page.waitForFunction(()=>document.querySelector('#tkCount').textContent.startsWith('1 '));assert((await page.textContent('#tkList')).includes('Different account or conditions'),'difference preserved');
 const packet=JSON.parse((await download(page,'#tkExport')).text);assert(packet.records.length===1&&packet.records[0].links[0].relation==='differs','approved relationship retained');for(const marker of ['PrivateTKPracticeSentinel','PrivateTKProtocolSentinel','PrivateTKPermissionSentinel','PrivateTKLinkSentinel','PrivateTKShareSentinel'])assert(!JSON.stringify(packet).includes(marker),'private field excluded: '+marker);assert(!Object.hasOwn(packet.records[0],'grade'),'no grade assigned');const brief=(await download(page,'#plExportMd')).text;assert(brief.includes('PublicTKSummarySentinel')&&!brief.includes('PrivateTKPracticeSentinel'),'brief uses approved summary');
 await page.locator('#tkList button[id^="tkLink-"]').first().click();assert(await page.locator('#doc-'+docId+' [data-tk-source] button').count()===1,'library backlink present');await page.locator('#doc-'+docId+' [data-tk-source] button').click();assert(await page.locator('#tkClearSource').count()===1,'source relationship filter');await page.click('#tkClearSource');const backup=(await download(page,'#plExportJson')).text;assert(JSON.parse(backup).plan.traditionalKnowledge.records.length===1,'private backup includes record');
 await page.locator('[id^="tkEdit-"]').first().click();assert(await page.inputValue('#tkSharing')==='local','editing resets sharing');assert(!(await page.isChecked('#tkCapture'))&&!(await page.isChecked('#tkShare')),'permissions require renewed confirmation');await page.fill('#tkPractice','Revised local practice');await page.fill('#tkReason','Updated local account');await page.check('#tkCapture');await page.click('#tkSave');await page.click('#tkExport');assert((await page.textContent('#tkStatus')).includes('No current'),'local revision blocks previous public summary');assert(!(await download(page,'#plExportMd')).text.includes('PublicTKSummarySentinel'),'prior approved revision excluded from brief');
 const f=join(TMP,'tk-plan.json');await writeFile(f,backup);await page.setInputFiles('#plImport',f);await page.click('#dlgConfirmOk');await page.waitForTimeout(300);await page.click('#tab-knowledge');await page.locator('[id^="tkWithdraw-"]').first().click();await page.click('#tkExport');assert((await page.textContent('#tkStatus')).includes('No current'),'withdrawal blocks export');assert((await page.textContent('#tkList')).includes('Withdrawn'),'withdrawal retained');await page.click('#plDuplicate');await page.waitForFunction(()=>document.querySelector('#tkCount').textContent.startsWith('0 '));await ctx.close();
});
await test('TK: offline privacy, safe text, legacy defaults, forks and standalone RTL',async()=>{
 const {ctx,page}=await newPage({viewport:{width:390,height:844}},'tk-offline');await page.goto(BASE+'/');await ready(page);await page.selectOption('#plBridge','wetlands');await page.click('#tab-knowledge');await page.fill('#tkTitle','<b>Permissioned local account</b>');for(const id of ['tkPractice','tkCommunity','tkContext','tkBasis','tkLimits','tkProtocol','tkPermissionReference'])await page.fill('#'+id,'Permissioned '+id);await page.fill('#tkRetention',new Date(Date.now()+30*86400000).toISOString().slice(0,10));await page.fill('#tkReason','Authorized local capture');await page.check('#tkCapture');await page.click('#tkSave');assert(await page.locator('#tkList b').count()===0,'literal text');assert(!(await download(page,'#plExportMd')).text.includes('Permissioned tkPractice'),'private record excluded');await page.waitForFunction(()=>document.querySelector('#saveState').textContent.startsWith('Saved on this device'));await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await ctx.setOffline(true);await page.reload();await ready(page);await page.click('#tab-knowledge');assert((await page.textContent('#tkCount')).startsWith('1 '),'offline persistence');await chooseLanguage(page,'ar');await page.click('#tab-knowledge');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile RTL fits');await chooseLanguage(page,'en');if(!(await page.locator('#plFork').isVisible()))await page.locator('#forkDetails > summary').click();await page.click('#plFork');await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#plProject').value.endsWith('(fork)'));await page.click('#tab-knowledge');assert((await page.textContent('#tkCount')).startsWith('0 '),'fork does not carry TK authority or records');await ctx.close();
 const single=await newPage({},'tk-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);await single.page.click('#tab-knowledge');assert((await single.page.textContent('#plTK')).includes('not a ranking'),'standalone framework');const legacy=JSON.parse((await download(single.page,'#plExportJson')).text);delete legacy.plan.traditionalKnowledge;const f=join(TMP,'before-tk.json');await writeFile(f,JSON.stringify(legacy));await single.page.setInputFiles('#plImport',f);await single.page.click('#dlgConfirmOk');await single.page.waitForTimeout(300);await single.page.click('#tab-knowledge');assert((await single.page.textContent('#tkCount')).startsWith('0 '),'legacy migration creates no invented TK');await single.ctx.close();
});
await test('Seeds: permissions, stock ledger, nursery validation, private backups and offline persistence',async()=>{
 const {ctx,page}=await newPage({viewport:{width:390,height:844}},'seeds');await page.goto(BASE+'/');await ready(page);await page.selectOption('#plBridge','seed-sovereignty');await page.click('#tab-knowledge');
 for(const [k,v]of Object.entries({name:'PrivateSeedSentinel <img src=x onerror=alert(1)>',custodian:'Council role',origin:'PrivateSourceSentinel',permission:'Permission recorded through council',reason:'Initial locally approved record'}))await page.fill('#seed-'+k,v);
 await page.fill('#seed-reviewBy','2099-01-01');await page.click('#seed-save');assert((await page.textContent('#seedStatus')).includes('Confirm permission'),'permission required');await page.check('#seed-consent');await page.click('#seed-save');assert(await page.locator('#seedList article').count()===1,'lot created');assert(await page.locator('#seedList img').count()===0,'text is not markup');
 await page.locator('[id^="seed-edit-"]').click();await page.fill('#seed-quantity','12');await page.fill('#seed-movement-reason','Stock physically verified');await page.click('#seed-move');assert((await page.textContent('#seedList')).includes('12 seeds'),'receipt balance');await page.selectOption('#seed-direction','out');await page.fill('#seed-quantity','13');await page.fill('#seed-movement-reason','Invalid overspend');await page.click('#seed-move');assert((await page.textContent('#seedStatus')).includes('below zero'),'overspend rejected');await page.fill('#seed-quantity','2');await page.click('#seed-move');assert((await page.textContent('#seedList')).includes('10 seeds'),'outgoing balance');
 await page.selectOption('#seed-nursery','yes');await page.fill('#seed-started','100');await page.fill('#seed-germinated','80');await page.fill('#seed-surviving','70');await page.fill('#seed-ready','90');await page.fill('#seed-reason','Nursery observation');await page.check('#seed-consent');await page.click('#seed-save');assert((await page.textContent('#seedStatus')).includes('counts'),'impossible nursery counts rejected');await page.fill('#seed-ready','60');await page.click('#seed-save');assert((await page.textContent('#seedList')).includes('80%'),'establishment denominator');assert((await page.textContent('#seedList')).includes('10 seeds'),'nursery does not invent stock');
 const backup=JSON.parse((await download(page,'#plExportJson')).text);assert(backup.plan.seeds.lots[0].movements.length===2&&backup.plan.seeds.lots[0].revisions.length===2,'backup preserves ledger and history');assert(!(await download(page,'#plExportMd')).text.includes('PrivateSeedSentinel'),'public brief excludes private inventory');
 await page.waitForFunction(()=>document.querySelector('#saveState').textContent.startsWith('Saved on this device'));await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await ctx.setOffline(true);await page.reload();await ready(page);await page.click('#tab-knowledge');assert((await page.textContent('#seedList')).includes('10 seeds'),'offline persistence');await chooseLanguage(page,'ar');await page.click('#tab-knowledge');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile RTL fits');await ctx.close();
});
await test('Seeds: fork isolation, legacy defaults and standalone register',async()=>{
 const {ctx,page}=await newPage({},'seeds-copy');await page.goto(BASE+'/');await ready(page);await page.selectOption('#plBridge','seed-sovereignty');await page.click('#tab-knowledge');for(const[k,v]of Object.entries({name:'Local seed',custodian:'Council',origin:'Local source',permission:'Approved storage',reason:'Initial lot'}))await page.fill('#seed-'+k,v);await page.fill('#seed-reviewBy','2099-01-01');await page.check('#seed-consent');await page.click('#seed-save');if(!(await page.locator('#plFork').isVisible()))await page.locator('#forkDetails > summary').click();await page.click('#plFork');await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#plProject').value.endsWith('(fork)'));await page.click('#tab-knowledge');assert(await page.locator('#seedList article').count()===0,'fork has no stock ownership claim');await ctx.close();
 const single=await newPage({},'seed-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);await single.page.click('#tab-knowledge');assert(await single.page.locator('#seed-save').count()===1,'standalone register');const legacy=JSON.parse((await download(single.page,'#plExportJson')).text);delete legacy.plan.seeds;const f=join(TMP,'before-seeds.json');await writeFile(f,JSON.stringify(legacy));await single.page.setInputFiles('#plImport',f);await single.page.click('#dlgConfirmOk');await single.page.waitForTimeout(300);await single.page.click('#tab-knowledge');assert(await single.page.locator('#seedList article').count()===0,'legacy defaults empty');await single.ctx.close();
});
await test('Decisions: conditional safeguards, matrix drilldown, private history and context changes',async()=>{
 const {ctx,page}=await newPage({},'decisions');await page.goto(BASE+'/');await ready(page);await page.selectOption('#plBridge','shared-watersheds');await page.click('#tab-risks');await page.click('#decisionSave');assert((await page.textContent('#decisionStatus')).includes('Choose'),'unanswered is not no');
 const answer=async(value,note='PrivateWorkshopSentinel')=>{await page.selectOption('#decisionAnswer',value);await page.fill('#decisionReason',note);await page.click('#decisionSave');};await answer('no');assert((await page.textContent('#decisionQuestion')).includes('water availability'),'sequential next question');await answer('yes');assert((await page.textContent('#decisionQuestion')).includes('downstream'),'conditional downstream branch');await answer('unknown');assert((await page.textContent('#decisionQuestion')).includes('joint meetings'),'precautionary mediation branch');assert(await page.locator('#decision-risk-downstream').count()===1,'mediation safeguard generated');
 await page.click('#decision-risk-downstream');await page.click('#decision-risk-downstream');assert(await page.locator('#rows-risks > li').count()===1,'risk draft deduplicated');const cell=page.locator('#riskMatrix button[aria-label="Likelihood 2, impact 2: 1 open risks"]');await cell.focus();await page.keyboard.press('Enter');assert((await page.textContent('#riskMatrixSelection')).includes('downstream'),'keyboard matrix drilldown');assert(await page.locator('#riskMatrix button[aria-pressed="true"]').count()===1,'selection announced');
 await page.fill('#decision-owner-downstream','Facilitator role');await page.fill('#decision-proof-downstream','PrivateReviewSentinel');await page.fill('#decision-date-downstream','2099-01-01');await page.selectOption('#decision-state-downstream','verified');await page.click('#decision-save-downstream');assert((await page.textContent('#decisionSummary')).includes('follow-up required'),'unknown answer still requires follow-up');
 const backup=JSON.parse((await download(page,'#plExportJson')).text);assert(backup.plan.decisions.reviews.length===4,'private history preserved');const md=(await download(page,'#plExportMd')).text;assert(md.includes('Workshop decision review')&&!md.includes('PrivateWorkshopSentinel')&&!md.includes('PrivateReviewSentinel'),'public summary excludes private notes');
 await page.selectOption('#decisionStep','1');await answer('no');assert(await page.locator('#decision-risk-downstream').count()===0,'irrelevant branch removed');assert(await page.locator('#rows-risks > li').count()===1,'manual risk draft preserved');await page.click('#tab-readiness');await page.fill('#plPlace','Changed general area');await page.click('#tab-risks');assert((await page.textContent('#decisionSummary')).includes('context changed'),'context change invalidates answers');await ctx.close();
});
await test('Decisions: offline resume, mobile RTL, fork isolation and standalone migration',async()=>{
 const {ctx,page}=await newPage({viewport:{width:390,height:844}},'decision-offline');await page.goto(BASE+'/');await ready(page);await page.selectOption('#plBridge','shared-watersheds');await page.click('#tab-risks');await page.selectOption('#decisionAnswer','no');await page.fill('#decisionReason','<img src=x onerror=alert(1)> Local review');await page.click('#decisionSave');assert(await page.locator('#plDecisions img').count()===0,'safe literal text');await page.waitForFunction(()=>document.querySelector('#saveState').textContent.startsWith('Saved on this device'));await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await ctx.setOffline(true);await page.reload();await ready(page);await page.click('#tab-risks');assert(await page.inputValue('#decisionAnswer')==='no','offline answer retained');await chooseLanguage(page,'ar');await page.click('#tab-risks');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile RTL fits');await chooseLanguage(page,'en');if(!(await page.locator('#plFork').isVisible()))await page.locator('#forkDetails > summary').click();await page.click('#plFork');await page.click('#dlgConfirmOk');await page.waitForFunction(()=>document.querySelector('#plProject').value.endsWith('(fork)'));await page.click('#tab-risks');assert((await page.textContent('#decisionSummary')).includes('not started'),'fork resets workshop authority');await ctx.close();
 const single=await newPage({},'decision-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);await single.page.click('#tab-risks');assert(await single.page.locator('#decisionSave').count()===1,'standalone wizard');const legacy=JSON.parse((await download(single.page,'#plExportJson')).text);delete legacy.plan.decisions;const f=join(TMP,'before-decisions.json');await writeFile(f,JSON.stringify(legacy));await single.page.setInputFiles('#plImport',f);await single.page.click('#dlgConfirmOk');await single.page.waitForTimeout(300);await single.page.click('#tab-risks');assert((await single.page.textContent('#decisionSummary')).includes('not started'),'legacy default no invented answers');await single.ctx.close();
});
await test('Explorer: visual pathways, keyboard tracing, source context, trade-offs and diagram export',async()=>{
 const {ctx,page}=await newPage({},'explorer');await page.goto(BASE+'/');await ready(page);const before=JSON.parse((await download(page,'#plExportJson')).text).plan;await page.click('#webViewExplorer');assert(await page.locator('#webExplorer').isVisible()&&!(await page.locator('#webMount').isVisible()),'existing web view toggled');assert(await page.locator('#exploreSVG .explorer-node').count()>5,'visual nodes');await page.locator('#explore-node-drought').focus();await page.keyboard.press('Enter');assert((await page.textContent('#exploreDetails')).includes('Rainfall stress alone'),'node context');await page.keyboard.press('ArrowRight');assert(await page.evaluate(()=>document.activeElement.id.startsWith('explore-node-')&&document.activeElement.id!=='explore-node-drought'),'keyboard navigation');await page.selectOption('#exploreMode','trace');assert(await page.locator('#explore-node-food-stress').count()===1&&await page.locator('#explore-node-b-zai').count()===0,'directed trace excludes upstream proposed bridges');await page.click('#exploreReset');await page.fill('#exploreSearch','watershed');assert(await page.locator('#exploreResults button').count()===1,'search text alternative');await page.click('#explore-pick-b-watershed');await page.selectOption('#exploreMode','neighbors');assert(await page.locator('#explore-node-tension').count()===1,'trade-off neighborhood');await page.click('#explore-edge-watershed-tension');assert((await page.textContent('#exploreDetails')).includes('Possible trade-off')&&(await page.textContent('#exploreDetails')).includes('does not verify'),'relationship uncertainty and source distinction');await page.click('#explore-source-unesco-water-cooperation-2024');assert(await page.locator('#doc-unesco-water-cooperation-2024').isVisible(),'source library navigation');await page.click('#webViewExplorer');await page.click('#exploreReset');await page.click('#exploreZoomIn');assert(await page.locator('#exploreSVG').getAttribute('width')==='1462.5','zoom');const svg=(await download(page,'#exploreExport')).text;assert(svg.includes('Illustrative pathways')&&svg.includes('marker-end')&&!svg.includes('<script'),'portable labeled diagram');assert(await page.evaluate(text=>!new DOMParser().parseFromString(text,'image/svg+xml').querySelector('parsererror'),svg),'valid SVG');const after=JSON.parse((await download(page,'#plExportJson')).text).plan;assert(JSON.stringify(before)===JSON.stringify(after),'exploring does not mutate local plans');await page.click('#exploreReset');await page.click('#exploreFit');await page.locator('.toast').evaluateAll(nodes=>nodes.forEach(n=>n.remove()));await page.locator('.explorer-viewport').screenshot({path:join(ROOT,'..','..','evidence-explorer-preview.png')});await page.click('#explore-pick-b-zai');await page.click('#explorePlan');assert(await page.inputValue('#plBridge')==='zai','explicit planning action selects bridge');await ctx.close();
});
await test('Explorer: all story views, offline use, mobile RTL and standalone',async()=>{
 const {ctx,page}=await newPage({viewport:{width:390,height:844}},'explorer-offline');await page.goto(BASE+'/');await ready(page);await page.click('#webViewExplorer');for(const story of ['flood','access','all']){await page.selectOption('#exploreStory',story);assert(await page.locator('#exploreSVG .explorer-node').count()>5,'story '+story);}await chooseLanguage(page,'ar');await page.click('#webViewExplorer');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no page overflow in RTL');assert(await page.locator('#webExplorer').getAttribute('dir')==='ltr','English diagram direction explicit');await page.click('#exploreLocal');assert(await page.locator('#webSystems').isVisible()&&!(await page.locator('#webExplorer').isVisible()),'existing systems editor retained');await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await ctx.setOffline(true);await page.reload();await ready(page);await page.click('#webViewExplorer');assert(await page.locator('#explore-node-drought').count()===1,'offline assets available');await ctx.close();
 const single=await newPage({},'explorer-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);await single.page.click('#webViewExplorer');await single.page.selectOption('#exploreStory','access');assert(await single.page.locator('#explore-node-b-seed').count()===1,'standalone pathway');await single.ctx.close();
});
await test('Workshop print: selected bridge, public-only content, PDF layouts and cancellation',async()=>{
 const {ctx,page}=await newPage({},'workshop-print');await page.goto(BASE+'/');await ready(page);await page.fill('#plProject','PrivatePrintSentinel');await page.locator('#bridge-seed-sovereignty > summary').click();await page.click('[data-print-bridge="seed-sovereignty"]');assert(await page.locator('#workshopPrintDialog').isVisible(),'accessible preview');assert(await page.locator('#workshopPrintRoot .wp-page').count()===4,'four handout sheets');assert(!(await page.textContent('#workshopPrintRoot')).includes('PrivatePrintSentinel'),'public template excludes plan data');assert((await page.textContent('#workshopPrintRoot')).includes('Community seed sovereignty'),'selected bridge');
 await page.evaluate(()=>{window.__printCalls=0;window.print=()=>{window.__printCalls++;window.dispatchEvent(new Event('beforeprint'));window.dispatchEvent(new Event('afterprint'));};});await page.click('#workshopPrintGo');assert(await page.evaluate(()=>window.__printCalls===1&&!document.body.classList.contains('print-workshop')),'one click invokes print and cleanup');
 const out=join(ROOT,'..','..','output','pdf');await mkdir(out,{recursive:true});await page.pdf({path:join(out,'seed-sovereignty-workshop-handout.pdf'),preferCSSPageSize:true,printBackground:false,displayHeaderFooter:false});await page.selectOption('#workshopPrintFormat','poster');assert(await page.locator('#workshopPrintRoot .wp-page').count()===1,'single poster sheet');await page.pdf({path:join(out,'seed-sovereignty-workshop-poster.pdf'),preferCSSPageSize:true,printBackground:false,displayHeaderFooter:false});await page.keyboard.press('Escape');assert(!(await page.locator('#workshopPrintDialog').isVisible())&&await page.locator('#workshopPrintRoot').isHidden(),'cancel restores normal UI');assert(await page.inputValue('#plProject')==='PrivatePrintSentinel','plan unchanged');await ctx.close();
});
await test('Workshop print: every bridge, Letter, offline, RTL and standalone',async()=>{
 const {ctx,page}=await newPage({viewport:{width:390,height:844}},'workshop-all');await page.goto(BASE+'/');await ready(page);await page.emulateMedia({media:'print'});for(const b of DOCS.bridges){await page.evaluate(id=>document.querySelector('[data-print-bridge="'+id+'"]').click(),b.id);for(const layout of ['handout-a4','handout-letter','poster-a3']){const [mode,paper]=layout.split('-');await page.evaluate(({mode,paper})=>{const s=document.querySelector('#workshopPrintFormat');s.value=mode;s.dispatchEvent(new Event('change'));if(mode==='handout'){const p=document.querySelector('#workshopPrintPaper');p.value=paper;p.dispatchEvent(new Event('change'));}},{mode,paper});await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));const over=await page.locator('#workshopPrintRoot .wp-page').evaluateAll(nodes=>nodes.map(n=>({height:n.getBoundingClientRect().height,poster:n.classList.contains('wp-poster'),a4:n.parentElement.classList.contains('wp-a4')})).filter(n=>n.height>(n.poster?388:n.a4?269:251.4)*96/25.4+2));assert(!over.length,'page height fits '+b.id+' '+mode+': '+JSON.stringify(over));await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));}await page.evaluate(()=>document.querySelector('#workshopPrintClose').click());}await page.emulateMedia({media:'screen'});
 await chooseLanguage(page,'ar');await page.evaluate(()=>document.querySelector('[data-print-bridge="regeneration"]').click());assert(await page.locator('#workshopPrintRoot').getAttribute('lang')==='en','public English clearly marked');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile fits');await page.click('#workshopPrintClose');await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await ctx.setOffline(true);await page.reload();await ready(page);await page.evaluate(()=>document.querySelector('[data-print-bridge="water"]').click());assert((await page.textContent('#workshopPrintRoot')).includes('Solar'),'offline template');await ctx.close();
 const single=await newPage({},'workshop-single');await single.page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(single.page);await single.page.evaluate(()=>document.querySelector('[data-print-bridge="zai"]').click());assert(await single.page.locator('#workshopPrintGo').count()===1,'standalone print action');await single.ctx.close();
});
await test('Local glossary: Unicode, permissions, revisions, backups and offline',async()=>{
 const {ctx,page}=await newPage({viewport:{width:390,height:844}},'glossary');await page.goto(BASE+'/');await ready(page);
 const values={language:'ar',languageName:'العربية',dialect:'Local workshop',translation:'ماء',meaning:'مصدر مشترك',context:'Workshop terminology',credit:'Anonymous collective',recordPermission:'PrivateGlossarySentinel'};
 for(const[k,v]of Object.entries(values))await page.fill('#lg-'+k,v);await page.selectOption('#lg-direction','rtl');await page.fill('#lgReason','Initial community wording');await page.click('#lgSave');assert((await page.textContent('#lgStatus')).includes('Confirm permission'),'permission required');await page.check('#lgCapture');await page.click('#lgSave');assert((await page.textContent('#lgCount')).startsWith('1'),'entry saved');assert(await page.locator('#lgList [lang="ar"]').getAttribute('dir')==='rtl','native direction');
 await page.fill('#lgSearch','ماء');assert((await page.textContent('#lgCount')).startsWith('1'),'native search');await page.fill('#lgSearch','absent');assert((await page.textContent('#lgCount')).startsWith('0'),'filter excludes');await page.fill('#lgSearch','');
 await page.locator('[id^="lg-edit-"]').click();await page.selectOption('#lg-sharing','approved');await page.fill('#lg-shareReference','Use in community workshops');await page.fill('#lg-shareUntil','2099-01-01');await page.fill('#lgReason','Permission granted');await page.check('#lgCapture');await page.check('#lgShare');await page.click('#lgSave');
 const exchange=JSON.parse((await download(page,'#lgExport')).text);assert(exchange.entries.length===1&&!JSON.stringify(exchange).includes('PrivateGlossarySentinel'),'scoped export');
 const backup=JSON.parse((await download(page,'#plExportJson')).text);assert(JSON.stringify(backup).includes('PrivateGlossarySentinel'),'private backup retains entry');
 await page.locator('[id^="lg-edit-"]').click();assert(await page.inputValue('#lg-sharing')==='local'&&await page.inputValue('#lg-status')==='draft','revision resets permissions');await page.click('#lgNew');await page.locator('[id^="lg-withdraw-"]').click();assert((await page.textContent('#lgList')).includes('Local only'),'withdrawal visible');
 await page.waitForFunction(()=>document.querySelector('#saveState').textContent.startsWith('Saved on this device'));await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await ctx.setOffline(true);await page.reload();await ready(page);assert((await page.textContent('#lgList')).includes('ماء'),'offline entry retained');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile fits');await ctx.close();
});
await test('Local glossary: standalone import preview and independent draft variants',async()=>{
 const {ctx,page}=await newPage({},'glossary-import');await page.goto(pathToFileURL(join(ROOT,'share','regenerative-peace-bridges.html')).href);await ready(page);
 const payload=await page.evaluate(()=>{const G=window.RPB_LOCAL_GLOSSARY,t=window.RPB.glossary[0],v={...G.fresh(),sourceTerm:t.term,sourceDefinition:t.def,language:'und-x-local',languageName:'Community language',translation:'Local word',meaning:'Local explanation',context:'Workshop',credit:'Collective',recordPermission:'Private',sharing:'approved',shareReference:'Workshop use',shareUntil:'2099-01-01'};return G.packet(G.save(null,'',v,'Initial',new Date().toISOString(),'example'));});
 await page.setInputFiles('#lgImport',{name:'glossary.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))});await page.waitForSelector('#lgAccept');assert((await page.textContent('#localGlossaryMount')).includes('Import preview: 1'),'preview before import');assert((await page.textContent('#lgCount')).startsWith('0'),'no premature mutation');await page.click('#lgAccept');assert((await page.textContent('#lgStatus')).includes('Confirm permission'),'import permission');await page.check('#lgImportAllowed');await page.click('#lgAccept');assert((await page.textContent('#lgCount')).startsWith('1'),'import accepted');assert((await page.textContent('#lgList')).includes('draft'),'draft local claim');
 await page.setInputFiles('#lgImport',{name:'glossary.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))});await page.check('#lgImportAllowed');await page.click('#lgAccept');assert((await page.textContent('#lgCount')).startsWith('2'),'variants coexist');await ctx.close();
});

await test("No console errors or warnings anywhere", async () => {
  assert(consoleProblems.length === 0, consoleProblems.slice(0, 5).join(" || "));
});

await browser.close();
server.close();
console.log(results.join("\n"));
console.log(failures ? `\n✗ ${failures} test(s) failed.` : `\n✓ All ${results.length} browser tests passed.`);
process.exit(failures ? 1 : 0);










