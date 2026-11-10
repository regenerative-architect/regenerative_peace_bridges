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
const categories = new Set((D.bridgeCategories || []).map(c => c.id));
ok(categories.size === (D.bridgeCategories || []).length, "duplicate bridge category");
for (const b of D.bridges) ok(!b.category || categories.has(b.category), b.id + ": invalid bridge category");
const governance = D.bridges.find(b=>b.id==="regenerative-governance");
ok(governance && governance.category === "governance", "dedicated governance bridge missing");
for (const phrase of ["participatory budgeting", "community assemblies", "stewardship councils", "transparent decision-making"]) ok(governance.steps.some(s=>s.toLowerCase().includes(phrase)), "governance pillar missing: " + phrase);
const docIds = new Set(D.documents.map((d) => d.id));
const diplomacyIds=['shared-watersheds','shared-seed-systems','cross-border-restoration','joint-monitoring'];
ok(D.bridges.filter(b=>b.category==='diplomacy').length===4,'four Restoration Diplomacy pathways required');
for(const id of diplomacyIds){
 const b=D.bridges.find(b=>b.id===id);
 ok(b?.category==='diplomacy',id+': missing diplomacy bridge');
 ok(b?.steps.length===6 && b.risks.length===4 && b.safeguards.length===4 && b.measures.length===5,id+': incomplete planning content');
}
const digitalIds = ['offline-education','community-archives','local-knowledge','mesh-communication','resilience-portals'];
ok(D.bridges.filter(b=>b.category==='digital').length===5, 'digital family must contain five pathways');
for (const id of digitalIds) {
  const b=D.bridges.find(b=>b.id===id);
  ok(b && b.category==='digital', id+': digital bridge missing');
  ok(b && b.steps.length>=6 && b.risks.length>=4 && b.safeguards.length>=4 && b.measures.length>=5, id+': incomplete digital planning guidance');
}
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

// --- Community meeting kit ---
const K = D.kit;
ok(K && typeof K.intro === "string", "RPB.kit is missing");
if (K) {
  const total = K.session.steps.reduce((a, st) => a + (st.minutes || 0), 0);
  ok(total > 0 && total <= 120, `the listening session should last up to two hours (it adds up to ${total} minutes)`);
  for (const st of K.session.steps) ok(st.id && st.title && Array.isArray(st.points) && st.points.length >= 2, `kit step ${st.id}: needs a title and at least two points`);
  ok(K.consent.lines.length >= 5 && /\?$/.test(K.consent.question), "the consent script needs its lines and a closing question");
  ok(K.consent.lines.some((l) => /no\b|leave|stop/i.test(l)) && K.consent.lines.some((l) => /name/i.test(l)), "the consent script must say people can say no or leave, and that names are not recorded");
  ok(K.children.points.length >= 4, "the children's note needs its points");
  ok(K.votes.options.map((v) => v.shape).join() === "circle,triangle,square", "voting cards use three different shapes");
  ok(K.poster.fields.length >= 3 && K.poster.promise, "the complaints poster needs its fields and promise");
}

// --- Files and wiring ---
const html = read("index.html");
const app = read("app.js");
// Every kit card has a drawing in app.js (KIT_ICONS).
const iconBlock = (app.split("const KIT_ICONS = {")[1] || "").split("\n  };")[0];
const iconIds = new Set([...iconBlock.matchAll(/^\s+"?([\w-]+)"?: \[/gm)].map((m) => m[1]));
if (K) {
  for (const c of K.cards) ok(iconIds.has(c.id), `kit card "${c.id}" has no drawing in KIT_ICONS (app.js)`);
  for (const v of K.votes.options) ok(iconIds.has("vote-" + v.id), `voting card "${v.id}" has no drawing in KIT_ICONS (app.js)`);
}
// Every script the page loads is cached for offline use.
const swText = read("sw.js");
for (const m of html.matchAll(/<script src="([^"]+)"/g)) ok(swText.includes(`"./${m[1]}"`), `sw.js does not cache ${m[1]}, which index.html loads`);

// --- Language: content paths, catalog and built-in packs ---
const langBox = { window: {} };
vm.runInNewContext(read("lang/content-paths.js"), langBox, { filename: "lang/content-paths.js" });
const paths = langBox.window.RPB_I18N.contentPaths(D);
const pathSet = new Set();
for (const [path] of paths) { ok(!pathSet.has(path), `content path used twice: ${path}`); pathSet.add(path); }
ok(paths.length > 500, `expected the content to have many translatable pieces (found ${paths.length})`);
try {
  execFileSync(process.execPath, [join(root, "tools", "i18n-extract.mjs"), "--check"], { stdio: "pipe" });
  checks++;
} catch (e) {
  fail("lang/catalog.js is out of date or the interface text has a problem: run node tools/i18n-extract.mjs (" + String(e.stderr || "").trim().split("\n").slice(-2).join(" ") + ")");
}
vm.runInNewContext(read("lang/catalog.js"), langBox, { filename: "lang/catalog.js" });
const CAT = langBox.window.RPB_CATALOG;
const uiKeys = new Set(CAT.ui);
const reviewedKeys = new Set(CAT.reviewed);
const pluralOther = new Set(CAT.plurals.map((p) => p[1]));
const tokens = (str) => new Set(String(str).match(/\{\w+\}/g) || []);
const tokensOk = (en, tr) => { const a = tokens(en), b = tokens(tr); for (const x of b) if (!a.has(x)) return false; for (const x of a) if (x !== "{n}" && !b.has(x)) return false; return true; };
for (const code of ["fr", "es", "ar"]) {
  langBox.window.RPB_PACKS = [];
  vm.runInNewContext(read(`lang/${code}.js`), langBox, { filename: `lang/${code}.js` });
  const pack = langBox.window.RPB_PACKS[0];
  ok(pack && pack.format === "rpb-language-pack" && pack.formatVersion === 1 && pack.lang === code, `lang/${code}.js: not a valid language pack`);
  if (!pack) continue;
  ok(pack.status === "draft", `lang/${code}.js: built-in packs are drafts until people who speak the language review them`);
  ok(pack.dir === (code === "ar" ? "rtl" : "ltr"), `lang/${code}.js: wrong text direction`);
  ok(!pack.content, `lang/${code}.js: a draft pack must not translate content`);
  for (const [key, value] of Object.entries(pack.strings)) {
    ok(uiKeys.has(key), `lang/${code}.js: “${key.slice(0, 50)}” is not an interface string${reviewedKeys.has(key) ? " (it is reviewed-only)" : ""}`);
    const forms = typeof value === "string" ? [value] : Object.values(value || {});
    ok(forms.length && forms.every((f) => typeof f === "string" && f.trim()), `lang/${code}.js: empty translation for “${key.slice(0, 50)}”`);
    if (typeof value === "object") ok(pluralOther.has(key) && value.other, `lang/${code}.js: plural forms given for a non-plural string “${key.slice(0, 50)}”`);
    for (const f of forms) ok(tokensOk(key, f), `lang/${code}.js: placeholders differ in “${key.slice(0, 50)}”`);
  }
  const missing = CAT.ui.filter((k) => !(k in pack.strings));
  ok(missing.length === 0, `lang/${code}.js: ${missing.length} interface strings are not translated, e.g. “${(missing[0] || "").slice(0, 50)}”`);
}
// Links to sources are fine; loading scripts, styles, fonts or media from other sites is not.
ok(!/<(script|img|iframe|link|source|video|audio|embed|object)\b[^>]*\s(src|href|data)="https?:/i.test(html), "index.html must not load anything from other websites");
ok(!/@import\s+url\(\s*["']?https?:/i.test(read("styles.css")), "styles.css must not import from other websites");
ok(/Zero Harm and Anti-Coercion/.test(html.split("<footer")[1] || ""), "the footer must carry the Zero Harm and Anti-Coercion note");
for (const m of app.matchAll(/\$\("#([A-Za-z][\w-]*)"\)/g)) {
  const id = m[1];
  // Created in index.html, as an element id in app.js, or by the planner's step()/panel() helpers.
  const made = html.includes(`id="${id}"`) || app.includes(`id: "${id}"`) || app.includes(`step("${id}"`) || (id.startsWith("panel-") && app.includes(`panel("${id.slice(6)}"`));
  ok(made || app.includes('id:"'+id+'"') || read('vault-ui.js').includes("id:'"+id+"'") || read('provenance-ui.js').includes("'"+id+"'"), `app.js uses #${id}, which is not in index.html or created by an app module`);
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
console.log(`✓ ${checks} content, language and wiring checks passed (${D.documents.length} sources, ${D.bridges.length} bridges, ${D.practices.length} practices, ${paths.length} translatable pieces of content, ${CAT.ui.length} interface and ${CAT.reviewed.length} reviewed-only phrases).`);
