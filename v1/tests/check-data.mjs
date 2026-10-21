#!/usr/bin/env node
/* =====================================================================
   tests/check-data.mjs — checks the content and wiring without a browser.
   Run from the app folder:  node tests/check-data.mjs
   It exits with an error code if anything is wrong, and says what.
   ===================================================================== */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(read("data.js"), sandbox, { filename: "data.js" });
const D = sandbox.window.RPB;
const problems = [];
const fail = (msg) => problems.push(msg);
let checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) fail(msg); };

// --- Content registry ---
const ids = new Set();
for (const coll of ["documents", "bridges", "practices"]) {
  for (const item of D[coll]) {
    ok(item.id && !ids.has(item.id), `${coll}: duplicate or missing id "${item.id}"`);
    ids.add(item.id);
  }
}
const topicIds = new Set(D.topics.map((t) => t.id));
const urls = new Set();
for (const d of D.documents) {
  for (const f of ["short", "title", "org", "type", "summary", "limits", "url", "checked"]) ok(typeof d[f] === "string" && d[f].trim(), `${d.id}: missing ${f}`);
  ok(D.types[d.type], `${d.id}: unknown type ${d.type}`);
  const role = D.types[d.type] && D.types[d.type].role;
  ok(role === "evidence" ? ["A", "B", "C"].includes(d.grade) : d.grade === null, `${d.id}: grade "${d.grade}" does not fit type "${d.type}"`);
  ok(/^(\d{4}(-\d{2}(-\d{2})?)?)?$/.test(d.date), `${d.id}: bad date "${d.date}"`);
  ok(/^\d{4}-\d{2}-\d{2}$/.test(d.checked), `${d.id}: bad checked date`);
  ok(Array.isArray(d.topics) && d.topics.length && d.topics.every((t) => topicIds.has(t)), `${d.id}: bad topics`);
  let u = null;
  try { u = new URL(d.url); } catch (e) { /* reported below */ }
  ok(u && u.protocol === "https:", `${d.id}: url must be https`);
  ok(!urls.has(d.url), `${d.id}: duplicate url`);
  urls.add(d.url);
  ok(d.short.length <= 46, `${d.id}: short label too long for the evidence web (${d.short.length} > 46)`);
}
const docIds = new Set(D.documents.map((d) => d.id));
const practiceIds = new Set(D.practices.map((p) => p.id));
for (const b of D.bridges) {
  for (const f of ["short", "name", "plain", "origin", "helps", "firstStep", "connectors"]) ok(typeof b[f] === "string" && b[f].trim(), `${b.id}: missing ${f}`);
  for (const f of ["needs", "steps", "risks", "safeguards", "measures", "docs"]) ok(Array.isArray(b[f]) && b[f].length >= 2, `${b.id}: ${f} needs at least two entries`);
  for (const id of b.docs) ok(docIds.has(id), `${b.id}: unknown document "${id}"`);
}
for (const p of D.practices) {
  ok(docIds.has(p.source), `${p.id}: unknown source "${p.source}"`);
  ok(["healing", "peace", "rights", "safety", "regenerative", "accountability"].includes(p.kind), `${p.id}: unknown kind`);
  ok(p.steps.length >= 3, `${p.id}: needs at least three steps`);
}
const qIds = new Set();
for (const dim of D.readiness) for (const q of dim.questions) {
  ok(!qIds.has(q.id), `duplicate question id ${q.id}`);
  qIds.add(q.id);
  ok(practiceIds.has(q.practice), `${q.id}: unknown practice ${q.practice}`);
}
ok(D.readiness.length === 6, "readiness must have six areas (one plank each)");
// Safety: content must not carry personal contact details or coordinates.
const allText = JSON.stringify(D);
ok(!/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(allText), "data.js contains something that looks like an email address");
ok(!/-?\d{1,2}\.\d{4,}\s*,\s*-?\d{1,3}\.\d{4,}/.test(allText), "data.js contains something that looks like map coordinates");

// --- Files and wiring ---
const html = read("index.html");
const app = read("app.js");
// Links to sources are fine; loading scripts, styles, fonts or media from other sites is not.
ok(!/<(script|img|iframe|link|source|video|audio|embed|object)\b[^>]*\s(src|href|data)="https?:/i.test(html), "index.html must not load anything from other websites");
ok(!/@import\s+url\(\s*["']?https?:/i.test(read("styles.css")), "styles.css must not import from other websites");
ok(/Zero Harm and Anti-Coercion/.test(html.split("<footer")[1] || ""), "the footer must carry the Zero Harm and Anti-Coercion note");
for (const m of app.matchAll(/\$\("#([A-Za-z][\w-]*)"\)/g)) {
  const id = m[1];
  ok(html.includes(`id="${id}"`) || app.includes(`id: "${id}"`), `app.js uses #${id}, which is not in index.html or created by app.js`);
}
const sw = read("sw.js");
for (const m of sw.matchAll(/"\.\/([^"]+)"/g)) ok(existsSync(join(root, m[1])), `sw.js caches a missing file: ${m[1]}`);
const manifest = JSON.parse(read("manifest.webmanifest"));
for (const icon of manifest.icons) ok(existsSync(join(root, icon.src)), `manifest icon missing: ${icon.src}`);
for (const m of read("styles.css").matchAll(/url\("(fonts\/[^"]+)"\)/g)) ok(existsSync(join(root, m[1])), `missing font file: ${m[1]}`);

// --- Fallback content is in step with data.js ---
try {
  execFileSync(process.execPath, [join(root, "tools", "prerender.mjs"), "--check"], { stdio: "pipe" });
  checks++;
} catch (e) {
  fail("index.html fallback content is out of date: run node tools/prerender.mjs");
}

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s) found in ${checks} checks:`);
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}
console.log(`✓ ${checks} content and wiring checks passed (${D.documents.length} sources, ${D.bridges.length} bridges, ${D.practices.length} practices).`);
