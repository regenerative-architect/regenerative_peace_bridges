#!/usr/bin/env node
/* =====================================================================
   tools/prerender.mjs — writes a readable, no-JavaScript version of the
   library, bridges, practices, meeting kit, planner questions and
   glossary straight into index.html, so the page still works if scripts
   are off or fail. (The fallback is in English.)

   Run it after editing data.js (needs Node.js 18 or newer):
       node tools/prerender.mjs
   It only replaces the text between <!-- prerender:NAME --> markers.
   Use --check to report whether index.html is up to date without
   changing it (used by the tests).
   ===================================================================== */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(join(root, "data.js"), "utf8"), sandbox, { filename: "data.js" });
const D = sandbox.window.RPB;

const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function fmtDate(str, ongoing) {
  if (!str) return ongoing ? "Ongoing" : "Undated";
  const [y, m, d] = str.split("-").map(Number);
  let out = String(y);
  if (m && d) out = `${d} ${MONTHS[m - 1]} ${y}`;
  else if (m) out = `${MONTHS[m - 1]} ${y}`;
  return ongoing ? `Since ${out}` : out;
}
function badge(doc) {
  const role = (D.types[doc.type] || {}).role;
  if (doc.grade && role === "evidence") return `<span class="grade grade--${esc(doc.grade)}">${esc(doc.grade)}</span>`;
  if (role === "context") return '<span class="grade grade--context">Context</span>';
  return '<span class="grade grade--howto">How-to</span>';
}
const ul = (items) => `<ul>${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
const docs = new Map(D.documents.map((d) => [d.id, d]));

const sections = {
  library: D.documents.map((d) => `<article class="doc" id="doc-${esc(d.id)}">
<div class="doc__badges">${badge(d)}<span class="doc__type">${esc((D.types[d.type] || {}).label)}</span></div>
<h3>${esc(d.title)}</h3>
<p class="doc__summary">${esc(d.summary)}</p>
<p class="note">${esc(d.org)}. ${esc(fmtDate(d.date, d.ongoing))}.</p>
<p class="doc__limits"><strong>Keep in mind: </strong>${esc(d.limits)}</p>
<div class="doc__actions"><a class="ext" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">Open source</a><span class="doc__checked">Link checked ${esc(fmtDate(d.checked))}</span></div>
</article>`).join("\n"),

  bridges: D.bridges.map((b) => `<details class="bridge" id="bridge-${esc(b.id)}">
<summary><div class="bridge__head"><h3 class="bridge__name">${esc(b.name)}</h3><p class="bridge__plain">${esc(b.plain)}</p></div></summary>
<div class="bridge__body">
<div class="bridge__block"><h4>Where it comes from</h4><p>${esc(b.origin)}</p></div>
<div class="bridge__block"><h4>Who it could help</h4><p>${esc(b.helps)}</p></div>
<div class="bridge__block bridge__wide"><h4>What must be true first</h4>${ul(b.needs)}</div>
<div class="bridge__block bridge__block--risks"><h4>What could go wrong</h4>${ul(b.risks)}</div>
<div class="bridge__block bridge__block--safe"><h4>How to prevent harm</h4>${ul(b.safeguards)}</div>
<div class="bridge__first"><h4>Smaller, safer first step</h4><p>${esc(b.firstStep)}</p></div>
<div class="bridge__block bridge__wide"><h4>Evidence behind this bridge</h4>${ul(b.docs.map((id) => (docs.get(id) || {}).title).filter(Boolean))}</div>
</div>
</details>`).join("\n"),

  practices: D.practices.map((p) => `<article class="practice" id="practice-${esc(p.id)}" data-kind="${esc(p.kind)}">
<h3>${esc(p.name)}</h3>
<p class="practice__plain">${esc(p.plain)}</p>
<ol>${p.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
<p class="practice__care"><strong>Take care: </strong>${esc(p.care)}</p>
</article>`).join("\n"),

  planner: `<div class="static-planner">
<p>The interactive planner needs JavaScript. You can still use its questions on paper or in a meeting:</p>
${D.readiness.map((dim) => `<h3>${esc(dim.label)}</h3><ol>${dim.questions.map((q) => `<li>${q.critical ? "<strong>Essential:</strong> " : ""}${esc(q.text)}</li>`).join("")}</ol>`).join("\n")}
<h3>Who is in the room?</h3>${ul(D.stakeholders.map((g) => g.label))}
</div>`,

  kit: (() => {
    const K = D.kit;
    const shapes = { circle: "circle", triangle: "triangle", square: "square" };
    return `<div class="kit-static">
<p class="kit__intro">${esc(K.intro)}</p>
<h3>${esc(K.session.title)} (${esc(K.session.length)})</h3>
<ol>${K.session.steps.map((st) => `<li><strong>${esc(st.title)}</strong>${st.minutes ? ` (${st.minutes} min)` : ""}${ul(st.points)}${st.prompts ? `<p>Questions you could ask:</p>${ul(st.prompts)}` : ""}</li>`).join("")}</ol>
<h3>${esc(K.consent.title)}</h3>
<p class="note">${esc(K.consent.note)}</p>
<div class="script">${K.consent.lines.map((l) => `<p class="script__line">${esc(l)}</p>`).join("")}<p class="script__question">${esc(K.consent.question)}</p></div>
<h3>${esc(K.children.title)}</h3>${ul(K.children.points)}
<h3>Picture cards</h3>${ul(K.cards.map((c) => `${c.label}: ${c.hint}`))}
<h3>Voting cards</h3><p>${esc(K.votes.note)}</p>${ul(K.votes.options.map((v) => `${v.label} (${shapes[v.shape] || v.shape})`))}
<h3>Complaints poster</h3><p><strong>${esc(K.poster.title)}</strong></p><p>${esc(K.poster.lead)}</p>${ul(K.poster.fields.map((f) => f + " ________________"))}<p>${esc(K.poster.promise)}</p><p class="note">${esc(K.poster.note)}</p>
</div>`;
  })(),

  glossary: `<dl class="glossary">${[...D.glossary].sort((a, b) => a.term.localeCompare(b.term, "en")).map((g) => `<div><dt>${esc(g.term)}</dt><dd>${esc(g.def)}</dd></div>`).join("")}</dl>`
};

const file = join(root, "index.html");
let html = readFileSync(file, "utf8");
let changed = false;
for (const [name, content] of Object.entries(sections)) {
  const re = new RegExp(`(<!-- prerender:${name} -->)[\\s\\S]*?(<!-- /prerender:${name} -->)`);
  if (!re.test(html)) { console.error(`Marker for "${name}" not found in index.html`); process.exit(2); }
  const next = html.replace(re, (_, open, close) => `${open}\n${content}\n${close}`); // function: "$" in text stays literal
  if (next !== html) changed = true;
  html = next;
}
if (process.argv.includes("--check")) {
  if (changed) { console.error("index.html fallback content is out of date. Run: node tools/prerender.mjs"); process.exit(1); }
  console.log("index.html fallback content is up to date.");
} else {
  writeFileSync(file, html);
  console.log(changed ? "Updated the fallback content in index.html." : "Fallback content was already up to date.");
}
