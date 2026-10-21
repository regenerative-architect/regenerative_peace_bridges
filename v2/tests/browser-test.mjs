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

const browser = await chromium.launch();
const consoleProblems = [];
const results = [];
let failures = 0;
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const ONLY = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] || "" : "";
async function test(name, fn) {
  if (ONLY && !name.includes(ONLY) && !name.startsWith("No console")) return;
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
// Every part started, including the planner (which waits for storage). Works in any language.
const ready = (page) => page.waitForSelector('#appHealth[data-state="ok"]', { timeout: 15000 });
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
  assert(await page.locator("main > section").count() === 12, "expected 12 sections");
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
  assert(keys.includes("rpb-core-v-test-b") && keys.filter((k) => k.startsWith("rpb-")).length === 1, "new cache active, old one removed");
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

await test("No console errors or warnings anywhere", async () => {
  assert(consoleProblems.length === 0, consoleProblems.slice(0, 5).join(" || "));
});

await browser.close();
server.close();
console.log(results.join("\n"));
console.log(failures ? `\n✗ ${failures} test(s) failed.` : `\n✓ All ${results.length} browser tests passed.`);
process.exit(failures ? 1 : 0);
