#!/usr/bin/env node
/* =====================================================================
   tools/build-single.mjs — makes ONE self-contained HTML file with the
   styles, fonts and scripts inside it, for sharing by USB stick, email
   or messaging apps where a folder is awkward. It opens offline in any
   modern browser, straight from the file.

   Run from the app folder (Node.js 18 or newer):
       node tools/build-single.mjs
   Output: share/regenerative-peace-bridges.html

   Optional: --preview <file> also writes a version for embedded previews
   (no document wrapper; downloads replaced by copy-to-clipboard).

   The single file has no Content Security Policy, because its scripts
   are inline. Edit the source files and rebuild rather than editing the
   single file directly.
   ===================================================================== */
import './build-archive.mjs';
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const b64 = (p) => readFileSync(join(root, p)).toString("base64");

// Styles with the Latin font files embedded. Extended-Latin faces are
// dropped to keep the file small; those characters use system fonts.
let css = read("styles.css");
css = css.replace(/@font-face\s*{[^}]*latin-ext[^}]*}\s*/g, "");
css = css.replace(/url\("fonts\/([^"]+\.woff2)"\)/g, (_, f) => `url("data:font/woff2;base64,${b64("fonts/" + f)}")`);
if (/url\("fonts\//.test(css)) throw new Error("A font was not embedded.");

// Inline scripts must never contain a closing script tag.
const safeJs = (js) => js.replace(/<\/script/gi, "<\\/script");
const early = safeJs(read("early.js"));
const data = safeJs(read("data.js"));
const impact = safeJs(read("impact.js")) + "\n" + safeJs(read("impact-ui.js"));
const knowledge = ["knowledge.js", "knowledge-examples.js", "knowledge-ui.js"].map(f => safeJs(read(f))).join("\n");
// The language tools and built-in draft packs, in the same order as index.html.
const LANG_FILES = ["lang/content-paths.js", "lang/catalog.js", "lang/fr.js", "lang/es.js", "lang/ar.js"];
const langJs = LANG_FILES.map((f) => safeJs(read(f)));
const commons = ['commons.js','commons-ui.js'].map(f => safeJs(read(f))).join('\n');
const systems = ['systems.js','systems-ui.js'].map(f => safeJs(read(f))).join('\n');
const app = ["local_glossary.js","local-glossary-ui.js","workshop_print.js","evidence_explorer.js","evidence-explorer-ui.js","decision_tree.js","decision-tree-ui.js","seed_sovereignty.js","seed-sovereignty-ui.js","traditional_knowledge.js","traditional-knowledge-ui.js","hazard.js","hazard-ui.js","pwa.js","offline_transfer.js","transfer-ui.js","regenerative_economics.js","economics-ui.js","community_stewardship.js","stewardship-ui.js","replication_registry.js","replication-ui.js","scenario_engine.js","scenario-ui.js","portfolio_engine.js","portfolio-ui.js","provenance.js","provenance-ui.js","forking.js","vault.js","vault-ui.js","app.js"].map(f => safeJs(read(f))).join("\n");

function build(mode) {
  // Replacements use functions so "$" characters in code are never treated
  // as special replacement patterns.
  let html = read("index.html");
  html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>\n?/, "");
  html = html.replace(/<!-- Security:[\s\S]*?-->\n?/, "");
  html = html.replace(/<link rel="manifest"[^>]*>\n?/, "");
  html = html.replace(/<link rel="icon"[^>]*>\n?/, () => `<link rel="icon" href="data:image/svg+xml;base64,${b64("icon.svg")}">\n`);
  html = html.replace(/<link rel="apple-touch-icon"[^>]*>\n?/, "");
  html = html.replace(/<link rel="stylesheet" href="styles.css">/, () => `<style>\n${css}\n</style>`);
  html = html.replace(/<!-- early\.js[\s\S]*?-->\n?<script src="early.js"><\/script>/, () => `<script>\n${early}\n</script>`);
  html = html.replace(/<!-- data\.js holds[\s\S]*?-->\n?(?:<script src="[^"]+\.js" defer><\/script>\n?)+/, "");
  const tag = (js) => `<script>\n${js}\n</script>\n`;
  const scripts = `<script>window.RPB_BUILD = { mode: "${mode}" };</script>\n` + tag(data) + tag(impact) + tag(knowledge) + tag(systems) + tag(commons) + langJs.map(tag).join("") + tag(app);
  html = html.replace("</body>", () => scripts + "</body>");
  if (/src="[^"]+\.js"|href="styles\.css"/.test(html)) throw new Error("A file reference was not inlined.");
  return html;
}

// Embedded-preview variant: the host supplies <html>, <head> and <body>.
function previewFrom(html) {
  const title = (html.match(/<title>[\s\S]*?<\/title>/) || [""])[0];
  const styles = (html.match(/<style>[\s\S]*?<\/style>/) || [""])[0];
  const earlyTag = (html.match(/<script>\n\/\* =+\s*\n\s*early\.js[\s\S]*?<\/script>/) || [""])[0];
  const body = html.split(/<body[^>]*>/)[1].split("</body>")[0];
  return `${title}\n<meta name="claude:viewport-fit-sides" content="cover">\n${styles}\n${earlyTag}\n${body}`;
}

mkdirSync(join(root, "share"), { recursive: true });
const single = build("single");
writeFileSync(join(root, "share", "regenerative-peace-bridges.html"), single);
console.log(`Wrote share/regenerative-peace-bridges.html (${Math.round(single.length / 1024)} KB)`);

const i = process.argv.indexOf("--preview");
if (i > -1 && process.argv[i + 1]) {
  const preview = previewFrom(build("preview"));
  writeFileSync(process.argv[i + 1], preview);
  console.log(`Wrote preview: ${process.argv[i + 1]} (${Math.round(preview.length / 1024)} KB)`);
}
