/* =====================================================================
   Regenerative Peace Bridges — app.js (v3.11.0)
   ---------------------------------------------------------------------
   Adds the interactive layer on top of a page that is already readable
   without JavaScript. Every part below starts inside its own safety net
   ("fail-safe startup"), so if one part fails the rest keeps working.

   PARTS (search for the numbers to jump around)
     0  Startup and fail-safe registry
     1  Small helpers (building elements, dates, numbers, downloads)
     2  Language: interface words, reviewed-only text and content
     3  Display preferences (theme, reading level, text, motion, glass)
     4  Local storage (IndexedDB, then localStorage, then memory)
     5  Hero scene: dawn light, drifting seeds, a bridge of light
     6  Table of contents, scroll highlighting and reading progress
     7  Evidence library: filters, cards, citations
     8  Evidence web: which sources support which bridges
     9  Solution bridges
     10 Healing and peace practices
     11 Community meeting kit: session guide, consent script, cards
     12 Glossary
     13 Search everything
     14 Bridge planner: several plans, readiness, timeline, budget,
        risks, consent log, brief and exports
     15 Safety scan before anything leaves the device
     16 Your data panel (inventory, deletion, auto-delete)
     17 Language panel: choose, import, export and check language packs
     18 Offline app (service worker, updates, install, status)
     19 Keyboard shortcuts and links into the page

   PRIVACY PROMISE: nothing here sends data anywhere. There is no
   analytics, no tracking and no network request except loading the
   app's own files. Everything is stored in this browser only and can be
   deleted from "Your data and offline use".
   ===================================================================== */
(() => {
  "use strict";

  /* ------------------------------------------------------------------
     0  STARTUP AND FAIL-SAFE REGISTRY
     To add a feature: write part("name", () => { ... }). It runs at
     startup inside try/catch and appears in the app health line. If it
     shows words, also register App.onLang("name", redraw) so the words
     follow the chosen language.
     ------------------------------------------------------------------ */
  const D = window.RPB;
  // Build mode: "bundle" (normal website folder), "single" (one shareable
  // file) or "preview" (embedded preview where downloads and printing are
  // not available). Set by tools/build-single.mjs for the last two.
  const Evolution = window.RPB_EVOLUTION;
  const Impact = window.RPB_IMPACT;
  const Knowledge = window.RPB_KNOWLEDGE;
  const Systems = window.RPB_SYSTEMS;
  const Commons = window.RPB_COMMONS;
  const Forks = window.RPB_FORKING;
  const Economics = window.RPB_ECONOMICS;
  const Hazard = window.RPB_HAZARD;
  const TK = window.RPB_TK;
  const Seeds = window.RPB_SEEDS;
  const Decisions = window.RPB_DECISIONS;
  const LocalGlossary = window.RPB_LOCAL_GLOSSARY;
  const Stewardship = window.RPB_STEWARDSHIP;
  const Replication = window.RPB_REPLICATION;
  const Scenario = window.RPB_SCENARIO;
  const Portfolio = window.RPB_PORTFOLIO;
  const Provenance = window.RPB_PROVENANCE;
  const evolutionOf = (plan, id) => plan && plan.evolution && plan.evolution[id] || Evolution.initial();
  const evolutionText = e => "Evidence: " + e.evidence + " · Community: " + e.community;
  const activeEvolution = id => App.evolutionFor ? App.evolutionFor(id) : Evolution.initial();
  const evolutionBadge = id => h("p", { class: "evolution-badge", lang: "en" }, evolutionText(activeEvolution(id)));
  const impactStatus = id => {
    const b = App.impactFor ? App.impactFor(id) : Impact.emptyBridge();
    const latest = Object.values(b.metrics).map(r => Impact.summary(r).latest).filter(Boolean);
    return latest.length ? "Impact: " + latest.length + " / 14 indicators with follow-ups · latest " + latest.map(o => o.date).sort().at(-1) : "Impact: no follow-up observations recorded";
  };
  const BUILD = Object.assign({ mode: "bundle" }, window.RPB_BUILD || {});
  const parts = [];
  const health = { started: [], failed: [], pending: 0 };
  const App = {}; // shared functions between parts
  const part = (name, fn) => parts.push([name, fn]);
  const redraws = [];
  App.onLang = (name, fn) => redraws.push([name, fn]);
  // Redraw everything that shows words, after the language changes.
  function redrawAll() {
    for (const [name, fn] of redraws) {
      try { fn(); } catch (err) { if (!health.failed.includes(name)) health.failed.push(name); }
    }
    if (App.renderHealth) App.renderHealth();
  }

  function boot() {
    if (!D || !Array.isArray(D.documents)) {
      const main = document.getElementById("main");
      if (main) {
        const p = document.createElement("p");
        p.className = "empty";
        p.textContent = "The content file (data.js) did not load, so interactive tools are off. Check that data.js is in the same folder as index.html.";
        main.prepend(p);
      }
      return;
    }
    // Storage opens in the background; parts that need it wait for this.
    App.storeReady = Store.init().catch(() => "memory");
    for (const [name, fn] of parts) {
      try {
        const result = fn();
        if (result && typeof result.then === "function") {
          health.pending++;
          result.then(() => health.started.push(name), () => health.failed.push(name)).finally(() => { health.pending--; if (App.renderHealth) App.renderHealth(); });
        } else {
          health.started.push(name);
        }
      } catch (err) {
        health.failed.push(name);
      }
    }
    if (App.renderHealth) App.renderHealth();
  }

  /* ------------------------------------------------------------------
     1  SMALL HELPERS
     ------------------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const SVG_NS = "http://www.w3.org/2000/svg";
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  // Build an element safely. Text is always inserted as text, never as HTML,
  // so content (and language packs) can't inject code. Usage: h("p", { class: "x" }, "Hello").
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    setAttrs(el, attrs);
    appendKids(el, kids);
    return el;
  }
  function s(tag, attrs, ...kids) { // same for SVG elements
    const el = document.createElementNS(SVG_NS, tag);
    setAttrs(el, attrs);
    appendKids(el, kids);
    return el;
  }
  function setAttrs(el, attrs) {
    if (!attrs) return;
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") el.setAttribute("class", v);
      else if (k === "text") el.textContent = v;
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : String(v));
    }
  }
  function appendKids(el, kids) {
    for (const kid of kids.flat(Infinity)) {
      if (kid === null || kid === undefined || kid === false) continue;
      el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    }
  }
  // Replace an element's children, skipping empty values (null, false).
  // (replaceChildren on its own would turn null into the text "null".)
  function setKids(el, ...kids) { el.replaceChildren(); appendKids(el, kids); return el; }
  // An external-link icon used next to "Open source".
  const extIcon = () => s("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", focusable: "false" },
    s("path", { d: "M9 3h4v4M13 3 7.5 8.5M12 9.5V13H3V4h3.5", fill: "none", stroke: "currentColor", "stroke-width": "1.6", "stroke-linecap": "round", "stroke-linejoin": "round" }));

  const safeUrl = (u) => { try { const x = new URL(u); return x.protocol === "https:" ? x.href : null; } catch (e) { return null; } };
  // Normalise text for searching: lower case, no accents, straight quotes.
  const norm = (t) => String(t || "").toLocaleLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’‘]/g, "'");
  const debounce = (fn, ms) => { let tm = 0; return (...a) => { clearTimeout(tm); tm = setTimeout(() => fn(...a), ms); }; };
  const seeded = (seed) => { let x = seed >>> 0; return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; };
  const today = () => new Date().toISOString().slice(0, 10);
  const rid = () => Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 8);
  const docById = new Map(D ? D.documents.map((d) => [d.id, d]) : []);
  const bridgeById = new Map(D ? D.bridges.map((b) => [b.id, b]) : []);
  const practiceById = new Map(D ? D.practices.map((p) => [p.id, p]) : []);
  const clip = (text, max) => (text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text);

  // Numbers and dates follow the chosen language, always with 0–9 digits.
  const locale = () => (I18N.lang === "en" ? "en-GB" : I18N.lang);
  function fmtNum(n, opts) {
    try { return new Intl.NumberFormat(locale(), Object.assign({ numberingSystem: "latn" }, opts)).format(n); }
    catch (e) { return String(n); }
  }
  const fmtPct = (ratio) => fmtNum(ratio, { style: "percent", maximumFractionDigits: 0 });
  const fmtMoney = (n, currency) => fmtNum(n, { maximumFractionDigits: 2 }) + (currency ? " " + currency : "");
  // "2026-09-24" -> "24 September 2026"; "2024-06" -> "June 2024"; "2012" -> "2012".
  function fmtDate(str, ongoing) {
    if (!str) return ongoing ? t("Ongoing") : t("Undated");
    const [y, m, d] = str.split("-").map(Number);
    let out;
    try {
      const opts = m && d ? { day: "numeric", month: "long", year: "numeric" } : m ? { month: "long", year: "numeric" } : { year: "numeric" };
      out = new Intl.DateTimeFormat(locale(), Object.assign({ timeZone: "UTC", numberingSystem: "latn" }, opts)).format(new Date(Date.UTC(y, (m || 1) - 1, d || 1)));
    } catch (e) { out = str; }
    return ongoing ? t("Since {date}", { date: out }) : out;
  }
  function fmtTime(iso) {
    try { return new Date(iso).toLocaleString(locale(), { dateStyle: "medium", timeStyle: "short", numberingSystem: "latn" }); }
    catch (e) { return iso; }
  }
  function pluralCat(n) {
    try { return new Intl.PluralRules(locale()).select(n); } catch (e) { return n === 1 ? "one" : "other"; }
  }
  const sortKey = (d) => (d.date ? d.date.padEnd(10, "-00") : "0000");

  // What kind of evidence a document is, as a CSS class and a label.
  function evidenceOf(doc) {
    const type = D.types[doc.type] || { label: "Source", role: "howto" };
    if (doc.grade && type.role === "evidence") return { cls: "g-" + doc.grade, badge: doc.grade, label: tc("grades." + doc.grade + ".label", D.grades[doc.grade].label), rank: { A: 0, B: 1, C: 2 }[doc.grade] ?? 3 };
    if (type.role === "context") return { cls: "g-context", badge: t("Context"), label: t("Situation report"), rank: 5 };
    return { cls: "g-howto", badge: t("How-to"), label: t("Guidance"), rank: 4 };
  }
  function gradeBadge(doc) {
    const ev = evidenceOf(doc);
    if (ev.cls === "g-context") return h("span", { class: "grade grade--context", title: t("Describes a situation; does not test solutions") }, ev.badge);
    if (ev.cls === "g-howto") return h("span", { class: "grade grade--howto", title: t("Guidance or standard; not proof that something works") }, ev.badge);
    return h("span", { class: "grade grade--" + doc.grade, title: t("Evidence strength {grade}: {label}", { grade: doc.grade, label: ev.label }) }, doc.grade);
  }

  // Short notices at the bottom of the screen. `action` adds a button.
  function toast(message, opts = {}) {
    const box = $("#toasts");
    if (!box) return;
    const el = h("div", { class: "toast" }, h("span", null, message));
    if (opts.action) {
      el.append(h("button", { type: "button", onclick: () => { el.remove(); opts.action.fn(); } }, opts.action.label));
    }
    if (opts.sticky) el.append(h("button", { type: "button", "aria-label": t("Dismiss notice"), onclick: () => el.remove() }, t("Dismiss")));
    else setTimeout(() => el.remove(), opts.ms || 4500);
    box.append(el);
  }

  // Dialogs: open with focus management; close returns focus to the opener.
  function openDialog(dlg, opener) {
    if (!dlg) return;
    const back = opener || document.activeElement;
    if (!dlg.open) {
      if (typeof dlg.showModal === "function") dlg.showModal();
      else { dlg.setAttribute("open", ""); }
    }
    dlg.addEventListener("close", () => { if (back && typeof back.focus === "function" && document.contains(back)) back.focus({ preventScroll: true }); }, { once: true });
  }
  function closeDialog(dlg) {
    if (!dlg) return;
    if (typeof dlg.close === "function") dlg.close();
    else { dlg.removeAttribute("open"); dlg.dispatchEvent(new Event("close")); }
  }
  // Every dialog: the Close button and a click on the dimmed backdrop close it.
  function wireDialogs() {
    for (const dlg of $$("dialog.dlg")) {
      for (const btn of $$(".dlg__close", dlg)) btn.addEventListener("click", (e) => { e.preventDefault(); closeDialog(dlg); });
      dlg.addEventListener("click", (e) => { if (e.target === dlg) closeDialog(dlg); });
    }
    // "Copy to clipboard" in the copy-text dialog.
    const copyBtn = $("#dlgTextCopy");
    if (copyBtn) copyBtn.addEventListener("click", async () => {
      const ta = $("#dlgTextArea");
      ta.focus();
      ta.select();
      let ok = false;
      try { await navigator.clipboard.writeText(ta.value); ok = true; }
      catch (e) { try { ok = document.execCommand("copy"); } catch (e2) { ok = false; } }
      toast(ok ? t("Copied to the clipboard.") : t("Copying was blocked here. The text is selected: copy it with your keyboard or menu."));
    });
  }

  // A confirmation step built into the page (browser pop-ups are not used).
  function confirmDialog({ title, text, ok = t("Confirm"), danger = true }) {
    return new Promise((resolve) => {
      const dlg = $("#dlgConfirm");
      if (!dlg) { resolve(false); return; }
      $("#dlgConfirmTitle").textContent = title;
      $("#dlgConfirmText").textContent = text;
      const okBtn = $("#dlgConfirmOk");
      const cancel = $("#dlgConfirmCancel");
      okBtn.textContent = ok;
      okBtn.className = "btn " + (danger ? "btn--danger" : "btn--dawn");
      let result = false;
      const onOk = () => { result = true; closeDialog(dlg); };
      const onCancel = () => closeDialog(dlg);
      okBtn.addEventListener("click", onOk);
      cancel.addEventListener("click", onCancel);
      dlg.addEventListener("close", () => {
        okBtn.removeEventListener("click", onOk);
        cancel.removeEventListener("click", onCancel);
        resolve(result);
      }, { once: true });
      openDialog(dlg);
      cancel.focus();
    });
  }

  // Show text in a dialog for manual copying (used where downloads or the
  // clipboard are blocked, for example inside an embedded preview).
  function showText(title, text, note) {
    const dlg = $("#dlgText");
    if (!dlg) return;
    $("#dlgTextTitle").textContent = title;
    $("#dlgTextNote").textContent = note || "";
    const ta = $("#dlgTextArea");
    ta.value = text;
    openDialog(dlg);
    ta.focus();
    ta.select();
  }
  async function copyText(text, okMessage) {
    try {
      await navigator.clipboard.writeText(text);
      toast(okMessage || t("Copied to the clipboard."));
      return true;
    } catch (e) {
      showText(t("Copy text"), text, t("Your browser blocked automatic copying. The text is selected: copy it with your keyboard or menu."));
      return false;
    }
  }
  // Save a file to the device. In the embedded preview, offer copying instead.
  function download(filename, text, type) {
    if (BUILD.mode === "preview") {
      showText(t("Copy instead of downloading"), text, t("Downloads are not available in this preview. Copy the text below, or use the downloadable version of the app to save “{file}”.", { file: filename }));
      return;
    }
    try {
      const url = URL.createObjectURL(new Blob([text], { type }));
      const a = h("a", { href: url, download: filename, hidden: true });
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast(t("Download started: {file}", { file: filename }));
    } catch (e) {
      showText(t("Copy instead of downloading"), text, t("Your browser blocked the download. Copy the text below instead."));
    }
  }
  const canPrint = () => BUILD.mode !== "preview" && typeof window.print === "function";
  // Print with a body class that limits what is printed (see styles.css).
  function printWith(cls) {
    document.body.classList.add(cls);
    const done = () => { document.body.classList.remove(cls); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    window.print();
    setTimeout(done, 1500);
  }
  // A cell starting with = + - or @ could run as a formula when the file is
  // opened in a spreadsheet, so it gets a leading apostrophe.
  const csvCell = (v) => { let x = String(v ?? ""); if (/^[=+\-@\t\r]/.test(x)) x = "'" + x; return `"${x.replace(/"/g, '""')}"`; };
  const csvOf = (head, rows) => [head.map(csvCell).join(","), ...rows.map((r) => r.map(csvCell).join(","))].join("\r\n");

  // Move to an element and briefly highlight it.
  function reveal(el, focusEl) {
    if (!el) return;
    el.scrollIntoView({ behavior: App.motionOn && App.motionOn() ? "smooth" : "auto", block: "start" });
    el.classList.remove("is-flash");
    void el.offsetWidth; // restart the highlight animation
    el.classList.add("is-flash");
    const target = focusEl || el;
    if (!target.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(target.tagName)) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }

  /* ------------------------------------------------------------------
     2  LANGUAGE
     Three kinds of text, so that a quick draft translation can never
     change safety guidance:
       t(…)   interface words: buttons, labels, headings. Any language
              pack may translate them, including draft packs.
       tr(…)  safety, legal and guidance text. Only a pack marked
              "reviewed" by a named community or organisation may
              translate it; otherwise the English stays.
       tc(…)  content from data.js (sources, bridges, practices, the
              meeting kit). Only reviewed packs translate it, and only
              while the English it was translated from is unchanged.
     The English text is the key, so the code stays readable. Words in
     {curly brackets} are filled in by the app. Each function has an
     "x" twin (tx, trx, tcx) that also says whether English was used,
     so that element can be marked lang="en" for screen readers.
     Pack text is always inserted as plain text, never as HTML.
     ------------------------------------------------------------------ */
  const I18N = { lang: "en", dir: "ltr", pack: null, packs: new Map(), contentEn: false };
  const keyOf = (str) => String(str).replace(/\s+/g, " ").trim();
  const isEnglish = () => I18N.lang === "en";
  const fillVars = (str, vars) => (vars ? str.replace(/\{(\w+)\}/g, (whole, k) => (Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : whole)) : str);
  function look(en, reviewedOnly) {
    const p = I18N.pack;
    if (!p || (reviewedOnly && p.status !== "reviewed")) return undefined;
    const v = p.strings[keyOf(en)];
    return typeof v === "string" ? v : undefined;
  }
  function tx(en, vars) { const v = look(en, false); return [fillVars(v === undefined ? en : v, vars), v === undefined && !isEnglish()]; }
  function trx(en, vars) { const v = look(en, true); return [fillVars(v === undefined ? en : v, vars), v === undefined && !isEnglish()]; }
  function tcx(path, en) {
    const p = I18N.pack;
    const v = p && p.status === "reviewed" && !I18N.contentEn ? p.content[path] : undefined;
    return typeof v === "string" ? [v, false] : [en, !isEnglish()];
  }
  const t = (en, vars) => tx(en, vars)[0];
  const tr = (en, vars) => trx(en, vars)[0];
  const tc = (path, en) => (typeof en === "string" ? tcx(path, en)[0] : en);
  // Singular and plural: tn("{n} source", "{n} sources", count).
  function tn(one, other, n, vars) {
    const v = Object.assign({ n: fmtNum(n) }, vars);
    const p = I18N.pack;
    if (p) {
      const hit = p.strings[keyOf(other)];
      const cat = pluralCat(n);
      if (hit && typeof hit === "object") {
        const form = hit[cat] || hit.other;
        if (typeof form === "string") return fillVars(form, v);
      } else if (typeof hit === "string") {
        const oneHit = p.strings[keyOf(one)];
        return fillVars(cat === "one" && typeof oneHit === "string" ? oneHit : hit, v);
      }
    }
    return fillVars(n === 1 ? one : other, v);
  }
  // "Label: value" in the reader's language. Languages differ here: French,
  // for example, puts a no-break space before the colon. kv() returns text;
  // kvNodes() keeps label and value as separate pieces (so either can be
  // bold or a link); withColon() is a label that introduces a list.
  const kv = (label, value) => t("{label}: {value}", { label, value });
  function kvNodes(label, value) {
    const parts = t("{label}: {value}").split(/(\{label\}|\{value\})/);
    if (!parts.includes("{label}") || !parts.includes("{value}")) return [label, ": ", value];
    return parts.filter((x) => x !== "").map((x) => (x === "{label}" ? label : x === "{value}" ? value : x));
  }
  const withColon = (label) => kv(label, "").trimEnd();
  // Mark an element whose words stayed in English inside another language.
  function markEn(el, english) {
    if (english) { el.setAttribute("lang", "en"); el.setAttribute("dir", "ltr"); }
    else if (el.getAttribute("lang") === "en") { el.removeAttribute("lang"); el.removeAttribute("dir"); }
    return el;
  }
  // Build an element from a [text, stayedEnglish] pair (from tx, trx or tcx).
  const L = (tag, attrs, pair) => markEn(h(tag, attrs, pair[0]), pair[1]);
  // A list of such pairs. If every item stayed in English, the whole list
  // is marked English, so its bullets sit on the correct side.
  const Ls = (tag, attrs, pairs) => markEn(h(tag, attrs, pairs.map((p) => L("li", null, p))), pairs.length > 0 && pairs.every((p) => p[1]));
  // Content helpers: the translated text of a data.js item's field.
  const cBridge = (b, f) => tc("bridges." + b.id + "." + f, b[f]);
  const cBridgeList = (b, f) => (b[f] || []).map((x, i) => tcx("bridges." + b.id + "." + f + "." + i, x));
  const cDoc = (d, f) => tc("documents." + d.id + "." + f, d[f]);
  const cPractice = (p, f) => tc("practices." + p.id + "." + f, p[f]);
  const cStake = (g) => tc("stakeholders." + g.id, g.label);
  const cTopic = (x) => tc("topics." + x.id, x.label);
  const cType = (id) => tc("types." + id, (D.types[id] || {}).label || id);
  const cQuestion = (dim, q) => tc("readiness." + dim.id + "." + q.id, q.text);
  const cDim = (dim) => tc("readiness." + dim.id + ".label", dim.label);

  // ----- Language packs: checking, statistics and fingerprints -----
  const CATALOG = window.RPB_CATALOG || { ui: [], reviewed: [], plurals: [] };
  const PACK_LIMITS = { bytes: 3 * 1024 * 1024, text: 5000, strings: 6000, content: 15000 };
  const PLURAL_FORMS = ["zero", "one", "two", "few", "many", "other"];
  const LANG_RE = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8}){0,3}$/;
  const tokenSet = (str) => new Set(String(str).match(/\{\w+\}/g) || []);
  // Pack text is plain text. Control characters and invisible direction
  // overrides (which can make text show in a misleading order) are removed.
  const cleanText = (str) => String(str).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u202A-\u202E\u2066-\u2069]/g, "").trim();
  // A translation may leave out {n} (some languages say "one source"), but
  // must keep every other placeholder and add none of its own.
  function placeholdersMatch(en, translated) {
    const a = tokenSet(en);
    const b = tokenSet(translated);
    for (const x of b) if (!a.has(x)) return false;
    for (const x of a) if (x !== "{n}" && !b.has(x)) return false;
    return true;
  }
  let catalogCache = null;
  function catalog() {
    if (!catalogCache) catalogCache = { ui: new Set(CATALOG.ui), reviewed: new Set(CATALOG.reviewed), pluralOther: new Set((CATALOG.plurals || []).map((p) => p[1])) };
    return catalogCache;
  }
  let contentCache = null;
  // path -> English text, for every translatable piece of content.
  function contentIndex() {
    if (!contentCache) contentCache = new Map(window.RPB_I18N && D ? window.RPB_I18N.contentPaths(D) : []);
    return contentCache;
  }
  // Check a pack (built in or imported) and keep only what is safe to use.
  function validatePack(raw, opts = {}) {
    const errors = [];
    const notes = { ignored: 0, placeholders: 0, stale: 0 };
    if (!raw || typeof raw !== "object" || Array.isArray(raw) || raw.format !== "rpb-language-pack") return { ok: false, errors: [t("This file is not a language pack for this app.")] };
    if (raw.formatVersion !== 1) errors.push(t("This language pack uses a format this version of the app can’t read."));
    const lang = typeof raw.lang === "string" ? raw.lang.trim() : "";
    if (!LANG_RE.test(lang) || lang === "en") errors.push(t("The language code is missing or not valid."));
    const dir = raw.dir === undefined || raw.dir === "ltr" ? "ltr" : raw.dir === "rtl" ? "rtl" : null;
    if (!dir) errors.push(t("The text direction must be “ltr” or “rtl”."));
    const name = typeof raw.name === "string" ? cleanText(raw.name).slice(0, 60) : "";
    if (!name) errors.push(t("The language name is missing."));
    const status = raw.status === "reviewed" ? "reviewed" : raw.status === "draft" ? "draft" : null;
    if (!status) errors.push(t("The status must be “draft” or “reviewed”."));
    const rv = raw.review && typeof raw.review === "object" ? raw.review : {};
    const review = {
      by: typeof rv.by === "string" ? cleanText(rv.by).slice(0, 120) : "",
      date: typeof rv.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rv.date) ? rv.date : "",
      notes: typeof rv.notes === "string" ? cleanText(rv.notes).slice(0, 1000) : ""
    };
    if (status === "reviewed" && (!review.by || !review.date)) errors.push(t("A reviewed pack must say who reviewed it and when."));
    if (errors.length) return { ok: false, errors };

    const cat = catalog();
    const strings = Object.create(null);
    const rawStrings = raw.strings && typeof raw.strings === "object" ? raw.strings : {};
    Object.keys(rawStrings).slice(0, PACK_LIMITS.strings).forEach((k) => {
      const key = keyOf(k);
      const v = rawStrings[k];
      if (!cat.ui.has(key) && !cat.reviewed.has(key)) { notes.ignored++; return; }
      if (typeof v === "string") {
        const text = cleanText(v).slice(0, PACK_LIMITS.text);
        if (!text) return; // empty means "not translated yet"
        if (!placeholdersMatch(key, text)) { notes.placeholders++; return; }
        strings[key] = text;
      } else if (v && typeof v === "object" && cat.pluralOther.has(key)) {
        const forms = Object.create(null);
        for (const f of PLURAL_FORMS) {
          if (typeof v[f] !== "string" || !cleanText(v[f])) continue;
          const text = cleanText(v[f]).slice(0, PACK_LIMITS.text);
          if (placeholdersMatch(key, text)) forms[f] = text; else notes.placeholders++;
        }
        if (forms.other) strings[key] = forms; else notes.ignored++;
      } else notes.ignored++;
    });
    const content = Object.create(null);
    const entries = Object.create(null);
    const rawContent = raw.content && typeof raw.content === "object" ? raw.content : {};
    const idx = contentIndex();
    Object.keys(rawContent).slice(0, PACK_LIMITS.content).forEach((path) => {
      const e = rawContent[path];
      if (!idx.has(path) || !e || typeof e !== "object" || typeof e.text !== "string") { notes.ignored++; return; }
      const text = cleanText(e.text).slice(0, PACK_LIMITS.text);
      if (!text) return;
      const en = typeof e.en === "string" ? e.en : "";
      entries[path] = { en, text };
      // Used only while the English it was made from is still the current text.
      if (keyOf(en) !== keyOf(idx.get(path))) { notes.stale++; return; }
      content[path] = text;
    });
    const pack = { lang, name, englishName: typeof raw.englishName === "string" ? cleanText(raw.englishName).slice(0, 60) : "", dir, status, review, strings, content, entries, builtIn: !!opts.builtIn, fingerprint: "" };
    pack.stats = packStats(pack);
    return { ok: true, pack, notes };
  }
  function packStats(p) {
    const cat = catalog();
    let ui = 0;
    let rev = 0;
    for (const k of cat.ui) if (p.strings[k] !== undefined) ui++;
    for (const k of cat.reviewed) if (p.strings[k] !== undefined) rev++;
    return { ui, uiTotal: cat.ui.size, reviewed: rev, reviewedTotal: cat.reviewed.size, content: Object.keys(p.content).length, contentTotal: contentIndex().size };
  }
  // The same pack always gives the same fingerprint, so two communities
  // can check they have identical text by comparing a few characters.
  function canonicalPack(p) {
    const sorted = (o) => Object.keys(o).sort().reduce((acc, k) => { acc[k] = o[k]; return acc; }, {});
    return JSON.stringify({ format: "rpb-language-pack", formatVersion: 1, lang: p.lang, name: p.name, englishName: p.englishName, dir: p.dir, status: p.status, review: p.review, strings: sorted(p.strings), content: sorted(p.entries) });
  }
  async function fingerprintOf(p) {
    try {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonicalPack(p)));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (e) { return ""; }
  }
  const fpShort = (hex) => (hex ? hex.slice(0, 16).toUpperCase().match(/.{4}/g).join(" ") : "");

  // Elements in index.html marked data-i18n keep their English here.
  const staticText = new WeakMap();
  const staticAttrs = new WeakMap();
  function applyStatic() {
    document.title = t("Regenerative Peace Bridges");
    for (const el of $$("[data-i18n]")) {
      let en = staticText.get(el);
      if (en === undefined) { en = keyOf(el.textContent); staticText.set(el, en); }
      const pair = el.getAttribute("data-i18n") === "reviewed" ? trx(en) : tx(en);
      el.textContent = pair[0];
      markEn(el, pair[1]);
    }
    for (const el of $$("[data-i18n-attr]")) {
      let saved = staticAttrs.get(el);
      if (!saved) { saved = {}; staticAttrs.set(el, saved); }
      for (const name of el.getAttribute("data-i18n-attr").split(",")) {
        if (!(name in saved)) saved[name] = keyOf(el.getAttribute(name) || "");
        if (saved[name]) el.setAttribute(name, t(saved[name]));
      }
    }
    for (const el of $$("time[data-date]")) el.textContent = fmtDate(el.getAttribute("data-date"));
    // A block whose translatable parts all stayed in English reads left to right.
    for (const block of $$("[data-i18n-block]")) {
      const kids = $$("[data-i18n]", block);
      markEn(block, kids.length > 0 && kids.every((k) => k.getAttribute("lang") === "en"));
    }
  }
  // Switch language: update <html>, the page's own words, then every part.
  function activateLanguage(code, initial) {
    const pack = code && code !== "en" ? I18N.packs.get(code) || null : null;
    I18N.lang = pack ? pack.lang : "en";
    I18N.pack = pack;
    I18N.dir = pack ? pack.dir : "ltr";
    I18N.contentEn = !!prefs.contentEn;
    const root = document.documentElement;
    root.setAttribute("lang", I18N.lang);
    root.setAttribute("dir", I18N.dir);
    // At startup an imported pack may still be loading: keep the choice.
    if (!initial || pack || !code || code === "en") { prefs.lang = I18N.lang; prefs.dir = I18N.dir; writePrefs(); }
    applyStatic();
    if (!initial) redrawAll();
    if (App.renderLangBar) App.renderLangBar();
  }
  App.setLanguage = (code) => activateLanguage(code, false);
  App.lang = () => I18N.lang;

  /* ------------------------------------------------------------------
     3  DISPLAY PREFERENCES
     Stored in this browser only (key "rpb_prefs_v2"). "Reset display
     settings" removes them. early.js applies them before first paint,
     including the language and its direction (left-to-right or
     right-to-left), so the page never flashes the wrong way round.
     ------------------------------------------------------------------ */
  const PREF_KEY = "rpb_prefs_v2";
  const PREF_DEFAULTS = { theme: "system", level: "full", text: "standard", spacing: "standard", motion: "auto", surface: "glass", ttl: 0, lang: "en", dir: "ltr", contentEn: false };
  let prefs = { ...PREF_DEFAULTS };
  let themeSetByApp = false;
  const reducedMotionMQ = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false, addEventListener() {} };

  function readPrefs() {
    try {
      const saved = JSON.parse(localStorage.getItem(PREF_KEY) || "null");
      if (saved && typeof saved === "object") return { ...PREF_DEFAULTS, ...saved };
      const v1 = localStorage.getItem("rpb_theme"); // version 1 stored only this
      if (v1 === "dark" || v1 === "light") return { ...PREF_DEFAULTS, theme: v1 };
    } catch (e) { /* storage blocked */ }
    return { ...PREF_DEFAULTS };
  }
  function writePrefs() {
    try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { /* storage blocked: settings last until the page closes */ }
  }
  App.motionOn = () => (prefs.motion === "on") || (prefs.motion === "auto" && !reducedMotionMQ.matches);
  App.prefs = () => prefs;

  function applyPrefs() {
    const root = document.documentElement;
    if (prefs.theme === "light" || prefs.theme === "dark") { root.setAttribute("data-theme", prefs.theme); themeSetByApp = true; }
    else if (themeSetByApp) { root.removeAttribute("data-theme"); themeSetByApp = false; }
    root.setAttribute("data-level", prefs.level);
    root.setAttribute("data-text", prefs.text);
    root.setAttribute("data-spacing", prefs.spacing);
    root.setAttribute("data-surface", prefs.surface);
    root.setAttribute("data-motion", App.motionOn() ? "on" : "off");
    window.dispatchEvent(new CustomEvent("rpb:prefs"));
  }

  part("dialogs", wireDialogs);

  part("preferences", () => {
    prefs = readPrefs();
    // Respect an explicit theme set by an embedding page when ours is "system".
    if (document.documentElement.hasAttribute("data-theme") && prefs.theme !== "system") themeSetByApp = true;
    applyPrefs();
    const dlg = $("#dlgDisplay");
    const sync = () => {
      const set = (name, value) => { const el = $(`input[name="${name}"][value="${value}"]`, dlg); if (el) el.checked = true; };
      set("pref-theme", prefs.theme);
      set("pref-level", prefs.level);
      set("pref-text", prefs.text);
      set("pref-spacing", prefs.spacing);
      set("pref-motion", App.motionOn() ? "on" : "off");
      set("pref-surface", prefs.surface);
      const note = $("#motionNote");
      if (note) {
        note.textContent = App.lowPower ? t("Animation paused automatically to save power on this device. Choose On to try again.")
          : (reducedMotionMQ.matches && prefs.motion === "auto") ? t("Your device asks for reduced motion, so animation starts off. You can still turn it on.")
          : "";
      }
    };
    App.syncPrefsForm = sync;
    sync();
    App.onLang("preferences", sync);
    dlg.addEventListener("change", (e) => {
      const el = e.target;
      if (!el || !el.name || !el.name.startsWith("pref-")) return;
      const key = el.name.slice(5);
      prefs[key] = el.value;
      if (key === "motion") App.lowPower = false;
      writePrefs();
      applyPrefs();
      sync();
      window.dispatchEvent(new CustomEvent("rpb:motion"));
    });
    $("#btnDisplay").addEventListener("click", (e) => { sync(); openDialog(dlg, e.currentTarget); });
    $("#btnResetDisplay").addEventListener("click", () => {
      // Language has its own panel, so resetting the display keeps it.
      prefs = { ...PREF_DEFAULTS, ttl: prefs.ttl, lang: prefs.lang, dir: prefs.dir, contentEn: prefs.contentEn };
      writePrefs();
      try { localStorage.removeItem("rpb_theme"); } catch (e) { /* ignore */ }
      applyPrefs();
      sync();
      window.dispatchEvent(new CustomEvent("rpb:motion"));
      toast(t("Display settings reset."));
    });
    $("#btnShortcuts").addEventListener("click", () => { closeDialog(dlg); openDialog($("#dlgKeys")); });
    reducedMotionMQ.addEventListener && reducedMotionMQ.addEventListener("change", () => { applyPrefs(); sync(); window.dispatchEvent(new CustomEvent("rpb:motion")); });
    // Keep the browser bar colour in step with the theme.
    const meta = $('meta[name="theme-color"]');
    const paintBar = () => { if (meta) meta.setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--canopy").trim() || "#123b36"); };
    paintBar();
    window.addEventListener("rpb:prefs", paintBar);
  });

  // Built-in language packs (lang/*.js) are checked like imported ones.
  // Imported packs load from storage a moment later (see part 17).
  part("language", () => {
    for (const raw of window.RPB_PACKS || []) {
      const res = validatePack(raw, { builtIn: true });
      if (res.ok && !I18N.packs.has(res.pack.lang)) I18N.packs.set(res.pack.lang, res.pack);
    }
    activateLanguage(prefs.lang || "en", true);
  });

  /* ------------------------------------------------------------------
     4  LOCAL STORAGE
     Tries IndexedDB first (roomy, structured), then localStorage, then
     memory only (with a visible warning to export). Keys used:
       "workspace"           { schema: 3, activeId, plans[] }
       "workspace-v2-backup" the version 2 plan, kept after upgrading
       "packs"               language packs you imported
     Where the browser supports it, saves from several tabs take turns
     (Web Locks), so two tabs can't write at the same moment.
     ------------------------------------------------------------------ */
  const Store = (() => {
    const DB_NAME = "rpb", STORE = "kv", LS_PREFIX = "rpb_kv_";
    let mode = "memory";
    let db = null;
    const mem = new Map();
    function openDB() {
      return new Promise((resolve, reject) => {
        let req;
        try { req = window.indexedDB.open(DB_NAME, 1); } catch (e) { reject(e); return; }
        req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE); };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        req.onblocked = () => reject(new Error("blocked"));
      });
    }
    function run(type, work) {
      return new Promise((resolve, reject) => {
        const trn = db.transaction(STORE, type);
        const req = work(trn.objectStore(STORE));
        trn.oncomplete = () => resolve(req ? req.result : undefined);
        trn.onerror = () => reject(trn.error);
        trn.onabort = () => reject(trn.error);
      });
    }
    // Saves from several tabs take turns. If this browser can't use locks
    // here (some embedded frames), the save simply goes ahead.
    async function locked(fn) {
      if (!(navigator.locks && navigator.locks.request)) return fn();
      let ran = false;
      try { return await navigator.locks.request("rpb-store", () => { ran = true; return fn(); }); }
      catch (e) { if (ran) throw e; return fn(); }
    }
    async function rawGet(key) {
      if (mode === "indexeddb") return run("readonly", (st) => st.get(key));
      if (mode === "local") { const v = localStorage.getItem(LS_PREFIX + key); return v ? JSON.parse(v) : undefined; }
      return mem.get(key);
    }
    async function rawSet(key, value) {
      if (mode === "indexeddb") return run("readwrite", (st) => st.put(value, key));
      if (mode === "local") return localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
      mem.set(key, value);
    }
    async function rawDel(key) {
      if (mode === "indexeddb") return run("readwrite", (st) => st.delete(key));
      if (mode === "local") return localStorage.removeItem(LS_PREFIX + key);
      mem.delete(key);
    }
    return {
      get mode() { return mode; },
      async init() {
        let idb = null;
        try { idb = window.indexedDB || null; } catch (e) { idb = null; } // some embedded frames throw here
        if (idb) {
          try { db = await openDB(); mode = "indexeddb"; return mode; } catch (e) { db = null; }
        }
        try { localStorage.setItem(LS_PREFIX + "probe", "1"); localStorage.removeItem(LS_PREFIX + "probe"); mode = "local"; } catch (e) { mode = "memory"; }
        return mode;
      },
      get: rawGet,
      set: (key, value) => locked(() => rawSet(key, value)),
      del: (key) => locked(() => rawDel(key)),
      // Read, change and write as one step, so two tabs can't interleave.
      update: (key, change) => locked(async () => { const next = change(await rawGet(key)); await rawSet(key, next); return next; }),

      // Vault operations use one IndexedDB transaction, including the read and conflict check.
      updateAtomic: (key, change) => locked(async () => {
        if(mode!=='indexeddb'){const next=change(await rawGet(key));await rawSet(key,next);return next;}
        return new Promise((resolve,reject)=>{
          const trn=db.transaction(STORE,'readwrite'),st=trn.objectStore(STORE);let result,error;
          trn.oncomplete=()=>resolve(result);trn.onerror=()=>reject(error||trn.error);trn.onabort=()=>reject(error||trn.error||Error('Storage transaction aborted.'));
          const req=st.get(key);req.onsuccess=()=>{try{result=change(req.result);st.put(result,key);}catch(e){error=e;trn.abort();}};
        });
      }),
      transferCommit: (change, withVault) => locked(async () => {
        if(mode!=='indexeddb'){
          if(withVault)throw Error('Combined plan + vault restore requires IndexedDB. Uncheck vault restoration; export the included vault separately and restore it using the vault importer.');
          const result=change(await rawGet('workspace'),undefined);await rawSet('workspace',result.workspace);return result;
        }
        return new Promise((resolve,reject)=>{
          const tx=db.transaction(STORE,'readwrite'),st=tx.objectStore(STORE);let result,error,workspace,vault,count=0;
          tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(error||tx.error);tx.onabort=()=>reject(error||tx.error||Error('Transfer transaction aborted; nothing restored.'));
          const ready=()=>{if(++count!==2)return;try{result=change(workspace,vault);st.put(result.workspace,'workspace');if(withVault)st.put(result.vault,'knowledge-vault');}catch(e){error=e;tx.abort();}};
          const a=st.get('workspace'),b=st.get('knowledge-vault');a.onsuccess=()=>{workspace=a.result;ready();};b.onsuccess=()=>{vault=b.result;ready();};
        });
      }),
      async clearAll() {
        if (db) await run("readwrite", (st) => st.clear());
        try {
          const kill = [];
          for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith("rpb")) kill.push(k); }
          kill.forEach((k) => localStorage.removeItem(k));
        } catch (e) { /* ignore */ }
        try { sessionStorage.clear(); } catch (e) { /* ignore */ }
        mem.clear();
      }
    };
  })();
  App.Store = Store;
  /* ------------------------------------------------------------------
     5  HERO SCENE
     A dawn sky drawn on canvas: light shafts from a rising sun, drifting
     seeds and pollen with real depth of field (soft, rimmed bokeh up
     close, sharp specks far away), and several hundred points of light
     that rise from one bank and gather into a bridge, mirrored in the
     river. It adapts to the device: fewer particles on slow hardware,
     paused when off screen, and a still frame when motion is off.
     In right-to-left languages styles.css mirrors the canvas, so the
     bridge sits on the far side of the text, as it does in English.
     To change the mood, edit the colours in renderBackground() and the
     sprite colours in buildSprites().
     ------------------------------------------------------------------ */
  part("hero", () => {
    const canvas = $("#heroCanvas");
    const hero = $("#overview");
    if (!canvas || !hero || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bg = document.createElement("canvas");
    const bgx = bg.getContext("2d");
    let W = 0, H = 0, DPR = 1;
    let quality = 1;
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    if (cores <= 4 || memory <= 4) quality *= 0.75;
    if (navigator.connection && navigator.connection.saveData) quality *= 0.6;
    let geo = null, beads = [], motes = [], stars = [];
    const sprites = {};
    const sun = { ox: 0, oy: 0, tx: 0, ty: 0 };
    let raf = 0, running = false, onScreen = true, lastT = 0, startT = 0, frames = 0, frameAcc = 0, downgrades = 0, still = false;

    function makeSprite(radius, stops) {
      const c = document.createElement("canvas");
      const size = Math.max(2, Math.ceil(radius * 2));
      c.width = c.height = size;
      const g = c.getContext("2d");
      const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      for (const [o, col] of stops) grd.addColorStop(o, col);
      g.fillStyle = grd;
      g.fillRect(0, 0, size, size);
      return c;
    }
    function buildSprites() {
      const r = 24 * DPR;
      sprites.warm = makeSprite(r, [[0, "rgba(255,247,222,1)"], [0.1, "rgba(255,229,168,.92)"], [0.32, "rgba(255,192,104,.34)"], [1, "rgba(255,170,80,0)"]]);
      sprites.cool = makeSprite(r, [[0, "rgba(236,255,250,1)"], [0.12, "rgba(186,238,228,.78)"], [0.38, "rgba(122,200,200,.22)"], [1, "rgba(110,190,200,0)"]]);
      const b = 40 * DPR; // bokeh discs: soft body, brighter rim, like an out-of-focus lens
      sprites.bokehWarm = makeSprite(b, [[0, "rgba(255,214,150,.13)"], [0.7, "rgba(255,206,140,.12)"], [0.88, "rgba(255,224,170,.17)"], [0.96, "rgba(255,214,150,.05)"], [1, "rgba(255,214,150,0)"]]);
      sprites.bokehCool = makeSprite(b, [[0, "rgba(170,230,225,.1)"], [0.7, "rgba(160,220,220,.09)"], [0.88, "rgba(196,242,236,.13)"], [0.96, "rgba(170,230,225,.04)"], [1, "rgba(170,230,225,0)"]]);
      sprites.sun = makeSprite(220 * DPR, [[0, "rgba(255,240,200,.95)"], [0.05, "rgba(255,218,150,.78)"], [0.2, "rgba(255,172,84,.32)"], [0.5, "rgba(240,132,62,.1)"], [1, "rgba(240,120,50,0)"]]);
    }
    function computeGeometry() {
      const wide = W >= 860;
      if (wide) {
        const horizon = H * 0.71;
        const xL = W * 0.52, xR = Math.min(W * 0.955, W - 24);
        const deckY = horizon + 8;
        const apexY = deckY - Math.min(H * 0.3, (xR - xL) * 0.42);
        return { wide, horizon, xL, xR, deckY, apexY, sunX: xL + (xR - xL) * 0.63, sunY: horizon + 2 };
      }
      const horizon = H - 74;
      const xL = W * 0.06, xR = W * 0.94;
      const deckY = H - 54;
      const apexY = deckY - Math.min(84, (xR - xL) * 0.3);
      return { wide, horizon, xL, xR, deckY, apexY, sunX: W * 0.7, sunY: horizon + 2 };
    }
    function drawRidge(g, baseY, amp, color, rnd, freq) {
      const p1 = rnd() * 10, p2 = rnd() * 10;
      g.beginPath();
      g.moveTo(0, H);
      for (let x = 0; x <= W + 8; x += 8) {
        g.lineTo(x, baseY - amp * (0.55 + 0.45 * Math.sin(x * freq + p1)) - amp * 0.35 * Math.sin(x * freq * 2.3 + p2));
      }
      g.lineTo(W, H);
      g.closePath();
      g.fillStyle = color;
      g.fill();
    }
    function bankEdge(side) {
      const { horizon, xL, xR, deckY } = geo;
      const top = horizon - H * 0.012;
      const pts = [];
      const steps = 28;
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const x = side === "left" ? xL * u : W - (W - xR) * u;
        pts.push([x, top + (deckY + 3 - top) * Math.pow(u, 2.4)]);
      }
      return pts;
    }
    function drawBank(g, side) {
      const { horizon, xL, xR, deckY } = geo;
      const edge = bankEdge(side);
      const dir = side === "left" ? 1 : -1;
      const cliffX = side === "left" ? xL : xR;
      g.save();
      g.beginPath();
      g.moveTo(side === "left" ? 0 : W, H);
      for (const [x, y] of edge) g.lineTo(x, y);
      g.bezierCurveTo(cliffX + 9 * dir, deckY + 16, cliffX + 16 * dir, H * 0.96, cliffX + 24 * dir, H);
      g.closePath();
      const grd = g.createLinearGradient(0, horizon - 20, 0, H);
      grd.addColorStop(0, "#1d382f");
      grd.addColorStop(0.35, "#11241d");
      grd.addColorStop(1, "#06100d");
      g.fillStyle = grd;
      g.fill();
      // Rim light: the dawn catching the top edge of the land.
      g.globalCompositeOperation = "lighter";
      g.beginPath();
      edge.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.strokeStyle = "rgba(255,186,116,.32)";
      g.lineWidth = 1.3;
      g.stroke();
      g.restore();
    }
    function renderBackground() {
      const g = bgx;
      const { horizon, sunX, xL, xR } = geo;
      g.setTransform(DPR, 0, 0, DPR, 0, 0);
      const sky = g.createLinearGradient(0, 0, 0, horizon);
      sky.addColorStop(0, "#061319");
      sky.addColorStop(0.36, "#0b2a31");
      sky.addColorStop(0.68, "#1f4a47");
      sky.addColorStop(0.9, "#8c6a43");
      sky.addColorStop(1, "#e39b54");
      g.fillStyle = sky;
      g.fillRect(0, 0, W, horizon + 2);
      const glow = g.createRadialGradient(sunX, horizon, 0, sunX, horizon, W * 0.75);
      glow.addColorStop(0, "rgba(255,192,112,.5)");
      glow.addColorStop(0.25, "rgba(240,150,80,.2)");
      glow.addColorStop(1, "rgba(240,150,80,0)");
      g.fillStyle = glow;
      g.fillRect(0, 0, W, H);
      const rnd = seeded(7);
      drawRidge(g, horizon - H * 0.055, H * 0.035, "rgba(70,96,86,.5)", rnd, 0.0042);
      drawRidge(g, horizon - H * 0.028, H * 0.03, "rgba(40,66,60,.72)", rnd, 0.0072);
      drawRidge(g, horizon + 1, H * 0.018, "rgba(22,42,38,.94)", rnd, 0.011);
      const river = g.createLinearGradient(0, horizon, 0, H);
      river.addColorStop(0, "#2b4038");
      river.addColorStop(0.18, "#19302b");
      river.addColorStop(1, "#081512");
      g.fillStyle = river;
      g.fillRect(0, horizon, W, H - horizon);
      // The sun's reflection: a soft glow stretched down the water.
      g.save();
      g.globalCompositeOperation = "lighter";
      g.translate(sunX, horizon);
      g.scale(1, 3.4);
      const rr = Math.max(34, (xR - xL) * 0.12);
      const refl = g.createRadialGradient(0, 0, 0, 0, 0, rr);
      refl.addColorStop(0, "rgba(255,206,130,.34)");
      refl.addColorStop(0.45, "rgba(255,190,110,.12)");
      refl.addColorStop(1, "rgba(255,190,110,0)");
      g.fillStyle = refl;
      g.fillRect(-rr, 0, rr * 2, rr);
      g.restore();
      drawBank(g, "left");
      drawBank(g, "right");
      const vig = g.createRadialGradient(W * 0.6, H * 0.6, Math.min(W, H) * 0.3, W * 0.6, H * 0.6, Math.max(W, H) * 0.85);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,.38)");
      g.fillStyle = vig;
      g.fillRect(0, 0, W, H);
    }
    function buildStars() {
      const rnd = seeded(3);
      const n = Math.round(clamp((W * H) / 6500, 30, 160) * quality);
      stars = Array.from({ length: n }, () => {
        const y = rnd() * geo.horizon * 0.62;
        return { x: rnd() * W, y, r: 0.35 + rnd() * 0.85, a: (0.25 + rnd() * 0.6) * (1 - y / (geo.horizon * 0.7)), f: 0.4 + rnd() * 1.4, p: rnd() * 6.28 };
      });
    }
    function buildBeads(settled) {
      const { xL, xR, deckY, apexY } = geo;
      const rnd = seeded(42);
      const span = xR - xL, mid = (xL + xR) / 2;
      const count = Math.round(clamp(span * 1.05, 140, 560) * quality);
      const archY = (x) => { const u = (x - mid) / (span / 2); return deckY - (deckY - apexY) * (1 - u * u); };
      const deckAt = (x) => { const u = (x - mid) / (span / 2); return deckY - 4 * (1 - u * u); };
      const hangers = 9;
      beads = [];
      for (let i = 0; i < count; i++) {
        const r = rnd();
        let tx, ty, kind;
        if (r < 0.46) { tx = xL + span * rnd(); ty = archY(tx); kind = "arch"; }
        else if (r < 0.78) { tx = xL + span * rnd(); ty = deckAt(tx); kind = "deck"; }
        else {
          const k = 1 + Math.floor(rnd() * hangers);
          const hx = xL + (span * k) / (hangers + 1);
          const top = archY(hx), bottom = deckAt(hx);
          tx = hx; ty = top + (bottom - top) * rnd(); kind = "hanger";
        }
        tx += (rnd() - 0.5) * 2.2;
        ty += (rnd() - 0.5) * 2.2;
        const sx = geo.wide ? xL * (0.15 + rnd() * 0.85) : xL + span * rnd() * 0.4;
        const sy = deckY + 10 + rnd() * Math.max(30, H - deckY);
        beads.push({
          tx, ty, kind,
          x: settled ? tx : sx, y: settled ? ty : sy, vx: 0, vy: 0,
          delay: ((tx - xL) / span) * 1.7 + rnd() * 0.9,
          size: kind === "arch" ? 1.1 + rnd() * 1.4 : 0.9 + rnd() * 1.1,
          phase: rnd() * Math.PI * 2, tw: 0.6 + rnd() * 1.6, base: 0.55 + rnd() * 0.45, settled: !!settled
        });
      }
    }
    function newMote(rnd, anywhere) {
      const roll = rnd();
      const layer = roll < 0.07 ? 2 : roll < 0.45 ? 1 : 0; // 2 = near (bokeh), 1 = mid, 0 = far
      return {
        x: rnd() * W, y: anywhere ? rnd() * H : H + 30, layer,
        size: layer === 2 ? 20 + rnd() * 30 : layer === 1 ? 1.5 + rnd() * 1.8 : 0.7 + rnd() * 0.9,
        speed: (layer === 2 ? 7 : layer === 1 ? 11 : 5) * (0.6 + rnd() * 0.8),
        phase: rnd() * Math.PI * 2, drift: 0.3 + rnd() * 0.9,
        alpha: layer === 2 ? 0.55 + rnd() * 0.45 : 0.35 + rnd() * 0.6
      };
    }
    let moteRnd = seeded(99);
    function buildMotes() {
      moteRnd = seeded(99);
      const n = Math.round(clamp((W * H) / 9000, 36, 170) * quality);
      motes = Array.from({ length: n }, () => newMote(moteRnd, true));
    }
    function layout(keepSettled) {
      const rect = hero.getBoundingClientRect();
      W = Math.max(320, Math.round(rect.width));
      H = Math.max(360, Math.round(rect.height));
      DPR = Math.min(window.devicePixelRatio || 1, quality < 0.9 ? 1.25 : 1.75);
      DPR = Math.min(DPR, Math.sqrt(3.6e6 / (W * H))); // cap memory on very large screens
      DPR = Math.max(1, DPR);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      bg.width = canvas.width;
      bg.height = canvas.height;
      geo = computeGeometry();
      buildSprites();
      renderBackground();
      buildStars();
      buildBeads(keepSettled);
      buildMotes();
    }
    function drawSprite(img, x, y, size, alpha) {
      if (alpha <= 0.003) return;
      ctx.globalAlpha = alpha > 1 ? 1 : alpha;
      ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
    }
    function draw(now, dt) {
      const { horizon, xL, xR, deckY, sunX, sunY } = geo;
      const sx = sunX + sun.ox, sy = sunY + sun.oy;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(bg, 0, 0);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.globalCompositeOperation = "lighter";
      // Stars fade as the dawn grows.
      for (const st of stars) {
        drawSprite(sprites.cool, st.x, st.y, st.r * 7, st.a * (0.6 + 0.4 * Math.sin(now * 0.001 * st.f + st.p)) * 0.6);
      }
      // The sun, breathing slightly.
      const sunSize = Math.min(W, H) * (0.95 + 0.03 * Math.sin(now * 0.0006));
      drawSprite(sprites.sun, sx, sy, sunSize, 0.9);
      // Light shafts (volumetric rays) fanning up from the sun.
      for (let i = 0; i < 7; i++) {
        const base = -Math.PI / 2 - 0.25 + (i - 3) * 0.2 + Math.sin(now * 0.00013 + i * 1.7) * 0.035;
        const len = H * (1.15 + 0.25 * Math.sin(i * 2.1));
        const width = 0.045 + 0.018 * Math.sin(i * 1.3 + now * 0.0002);
        const a = 0.045 + 0.03 * (0.5 + 0.5 * Math.sin(now * 0.0005 + i));
        const ex = sx + Math.cos(base) * len, ey = sy + Math.sin(base) * len;
        const grd = ctx.createLinearGradient(sx, sy, ex, ey);
        grd.addColorStop(0, `rgba(255,212,142,${a.toFixed(3)})`);
        grd.addColorStop(0.55, `rgba(255,200,130,${(a * 0.35).toFixed(3)})`);
        grd.addColorStop(1, "rgba(255,200,130,0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(base - width) * len, sy + Math.sin(base - width) * len);
        ctx.lineTo(sx + Math.cos(base + width) * len, sy + Math.sin(base + width) * len);
        ctx.closePath();
        ctx.fill();
      }
      // River shimmer under the bridge.
      ctx.globalAlpha = 1;
      for (let i = 0; i < 16; i++) {
        const k = i / 16;
        const y = horizon + 8 + k * (H - horizon - 10);
        const x = sx + Math.sin(now * 0.0011 + i * 1.9) * (xR - xL) * 0.05;
        const w = 12 + 34 * (1 - k);
        const a = 0.22 * (1 - k) * (0.5 + 0.5 * Math.sin(now * 0.002 + i));
        if (x - w / 2 < xL + 18 || x + w / 2 > xR - 18) continue;
        ctx.fillStyle = `rgba(255,214,150,${a.toFixed(3)})`;
        ctx.fillRect(x - w / 2, y, w, 1.2);
      }
      // The bridge of light: beads rise from the bank, then hold the arch.
      const elapsed = (now - startT) / 1000;
      const pulseCycle = 6.2;
      const pulseP = elapsed > 4.5 ? ((elapsed - 4.5) % pulseCycle) / 2.8 : -1;
      const pulseX = !still && pulseP >= 0 && pulseP <= 1 ? xL + (xR - xL) * (pulseP < 0.5 ? 2 * pulseP * pulseP : 1 - Math.pow(-2 * pulseP + 2, 2) / 2) : -9999;
      const reflect = quality >= 0.7;
      for (const b of beads) {
        if (!b.settled) {
          if (elapsed > b.delay) {
            const k = 9, damp = 5.6;
            b.vx += ((b.tx - b.x) * k - b.vx * damp) * dt;
            b.vy += ((b.ty - b.y) * k - b.vy * damp) * dt;
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            if (Math.abs(b.tx - b.x) < 0.3 && Math.abs(b.ty - b.y) < 0.3 && Math.abs(b.vx) < 0.5) b.settled = true;
          } else {
            b.y -= 6 * dt; // waiting seeds lift gently
          }
        }
        const wx = Math.sin(now * 0.0007 * b.tw + b.phase) * 0.8;
        const wy = Math.cos(now * 0.0009 * b.tw + b.phase) * 0.6;
        const x = (b.settled ? b.tx : b.x) + wx, y = (b.settled ? b.ty : b.y) + wy;
        const boost = pulseX > -9000 ? Math.max(0, 1 - Math.abs(x - pulseX) / 46) : 0;
        const tw = b.base * (0.72 + 0.28 * Math.sin(now * 0.002 * b.tw + b.phase));
        const waiting = !b.settled && elapsed <= b.delay;
        const alpha = (waiting ? 0.35 : tw) + boost * 0.8;
        const size = b.size * (9 + boost * 10);
        drawSprite(sprites.warm, x, y, size, alpha);
        if (reflect && b.settled && b.kind !== "deck" && y < deckY) {
          // Mirror in the river, broken up by small ripples and fading with depth.
          const ry = deckY + (deckY - y) * 0.85 + 10;
          const fade = 1 - clamp((ry - deckY) / (H - deckY), 0, 1);
          drawSprite(sprites.warm, x + Math.sin(ry * 0.35 + now * 0.004) * 2.4, ry, size * 0.85, alpha * 0.085 * fade);
        }
      }
      if (pulseX > -9000) {
        drawSprite(sprites.warm, pulseX, deckY - 2, 34, 0.9);
        for (let j = 1; j <= 6; j++) drawSprite(sprites.warm, pulseX - j * 9, deckY - 2, 26 - j * 2.5, 0.5 - j * 0.07);
      }
      // Drifting seeds and pollen in three depths.
      for (const m of motes) {
        if (dt > 0) {
          m.y -= m.speed * dt;
          m.x += Math.sin(m.y * 0.01 + m.phase + now * 0.0003) * m.drift * dt * 10 + 2 * dt;
          if (m.y < -50 || m.x > W + 50) Object.assign(m, newMote(moteRnd, false));
        }
        const d = Math.hypot(m.x - sx, m.y - sy);
        const warm = d < Math.max(W, H) * 0.42;
        if (m.layer === 2) drawSprite(warm ? sprites.bokehWarm : sprites.bokehCool, m.x, m.y, m.size * 2, m.alpha);
        else drawSprite(warm ? sprites.warm : sprites.cool, m.x, m.y, m.size * (m.layer === 1 ? 7 : 5), m.alpha * (m.layer === 1 ? 0.7 : 0.55));
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
    function frame(now) {
      raf = 0;
      if (!running) return;
      const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0.016;
      lastT = now;
      sun.ox += (sun.tx - sun.ox) * 0.04;
      sun.oy += (sun.ty - sun.oy) * 0.04;
      draw(now, dt);
      // Adaptive quality: if frames are slow, draw less; if still slow, pause.
      frames++;
      frameAcc += dt;
      if (frames >= 90) {
        const avg = frameAcc / frames;
        frames = 0; frameAcc = 0;
        if (avg > 0.03) {
          if (downgrades < 3) { downgrades++; quality *= 0.7; layout(true); }
          else { App.lowPower = true; stop(); renderStill(); App.syncPrefsForm && App.syncPrefsForm(); return; }
        }
      }
      raf = requestAnimationFrame(frame);
    }
    const allowed = () => App.motionOn() && !App.lowPower;
    function start() {
      if (!geo || running || !allowed() || !onScreen || document.hidden) return;
      running = true;
      lastT = 0;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }
    function renderStill() {
      if (!geo) return;
      for (const b of beads) { b.settled = true; b.x = b.tx; b.y = b.ty; }
      still = true; // no travelling pulse in a still frame
      draw(1800, 0);
      still = false;
    }
    function init() {
      layout(!allowed());
      if (allowed()) { startT = performance.now(); start(); } else renderStill();
      if ("IntersectionObserver" in window) {
        new IntersectionObserver((entries) => {
          onScreen = entries[0].isIntersecting;
          if (onScreen) start(); else stop();
        }).observe(hero);
      }
      document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
      window.addEventListener("rpb:motion", () => {
        if (allowed()) { if (!running) { startT = performance.now() - 6000; start(); } }
        else { stop(); renderStill(); }
      });
      hero.addEventListener("pointermove", (e) => {
        const r = hero.getBoundingClientRect();
        const flip = I18N.dir === "rtl" ? -1 : 1; // the canvas is mirrored in right-to-left layouts
        sun.tx = flip * ((e.clientX - r.left) / r.width - 0.5) * 30;
        sun.ty = ((e.clientY - r.top) / r.height - 0.5) * 10;
      }, { passive: true });
      // Rebuild the scene when the hero changes size. During the opening
      // formation the beads start again; afterwards they stay in place.
      const relayout = debounce(() => { layout(!running || performance.now() - startT > 5000); if (!running) renderStill(); }, 180);
      if ("ResizeObserver" in window) {
        let first = true;
        new ResizeObserver(() => { if (first) { first = false; return; } relayout(); }).observe(hero);
      } else {
        window.addEventListener("resize", relayout);
      }
    }
    // Wait briefly for the fonts so the hero's final height is known first.
    const fontsReady = document.fonts && document.fonts.ready
      ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 800))])
      : Promise.resolve();
    fontsReady.then(() => {
      try { init(); } catch (e) { health.failed.push("hero"); if (App.renderHealth) App.renderHealth(); }
    });
  });

  /* ------------------------------------------------------------------
     6  TABLE OF CONTENTS, SCROLL HIGHLIGHTING, READING PROGRESS
     ------------------------------------------------------------------ */
  part("contents", () => {
    const sections = $$("main > section[id]");
    const list = $("#tocList");
    const mobile = $("#tocListMobile");
    const links = (id) => $$(`a[data-for="${id}"], .topbar__quick a[href="#${id}"]`);
    let current = null;
    const build = (target, withSubs) => {
      target.replaceChildren();
      for (const sec of sections) {
        const title = $("h2", sec);
        const li = h("li", null, h("a", { href: "#" + sec.id, "data-for": sec.id }, title ? title.textContent : sec.id));
        if (withSubs && sec.id === "bridges") {
          li.append(h("ol", { class: "toc__sub" }, D.bridges.map((b) => h("li", null, h("a", { href: "#bridge-" + b.id, "data-bridge": b.id }, cBridge(b, "short"))))));
        }
        target.append(li);
      }
    };
    const render = () => {
      build(list, true);
      build(mobile, false);
      if (current) links(current).forEach((a) => a.setAttribute("aria-current", "true"));
    };
    render();
    App.onLang("contents", render);
    // Links to a bridge open it as well as scrolling to it.
    document.addEventListener("click", (e) => {
      const a = e.target.closest && e.target.closest("a[data-bridge]");
      if (!a) return;
      e.preventDefault();
      App.openBridge && App.openBridge(a.getAttribute("data-bridge"));
    });
    const dlg = $("#dlgContents");
    $("#btnContents").addEventListener("click", (e) => openDialog(dlg, e.currentTarget));
    mobile.addEventListener("click", (e) => { if (e.target.closest("a")) closeDialog(dlg); });
    // Highlight the section being read.
    const setCurrent = (id) => {
      if (id === current) return;
      if (current) links(current).forEach((a) => a.removeAttribute("aria-current"));
      current = id;
      if (id) links(id).forEach((a) => a.setAttribute("aria-current", "true"));
    };
    if ("IntersectionObserver" in window) {
      const visible = new Map();
      const io = new IntersectionObserver((entries) => {
        for (const en of entries) visible.set(en.target.id, en.isIntersecting);
        const firstVisible = sections.find((sct) => visible.get(sct.id));
        setCurrent(firstVisible ? firstVisible.id : null);
      }, { rootMargin: "-35% 0px -60% 0px" });
      sections.forEach((sct) => io.observe(sct));
    }
    // Reading progress bar in the header.
    const bar = $("#readProgress");
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? clamp(window.scrollY / max, 0, 1) * 100 : 0).toFixed(2) + "%";
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  });

  /* ------------------------------------------------------------------
     7  EVIDENCE LIBRARY
     Filters: words, topic, kind of source, evidence strength, sort order.
     Searching finds words in the chosen language and in English.
     ------------------------------------------------------------------ */
  part("library", () => {
    const mount = $("#libraryMount");
    const filters = $("#libraryFilters");
    const count = $("#libraryCount");
    const state = { q: "", topic: "", type: "", grade: "", sort: "newest" };
    const usedBy = new Map();
    for (const b of D.bridges) for (const id of b.docs) { if (!usedBy.has(id)) usedBy.set(id, []); usedBy.get(id).push(b); }
    const topicById = new Map(D.topics.map((x) => [x.id, x]));
    let haystack = new Map();
    const buildHaystack = () => {
      haystack = new Map(D.documents.map((d) => [d.id, norm([
        d.title, d.org, d.authors, cDoc(d, "summary"), cDoc(d, "key"), cDoc(d, "limits"), d.summary, d.key, d.limits,
        cType(d.type), (D.types[d.type] || {}).label,
        d.topics.map((id) => { const x = topicById.get(id); return x ? cTopic(x) + " " + x.label : ""; }).join(" ")
      ].join(" "))]));
    };

    // Filter controls (rebuilt when the language changes; the filters stay).
    let q, typeSel, gradeSel, sortSel, chips;
    function buildFilters() {
      q = h("input", { type: "search", id: "libQ", autocomplete: "off", spellcheck: "false", placeholder: t("Words in titles, summaries or publishers") });
      q.value = state.q;
      typeSel = h("select", { id: "libType" }, h("option", { value: "" }, t("All kinds")), Object.keys(D.types).map((k) => h("option", { value: k }, cType(k))));
      gradeSel = h("select", { id: "libGrade" },
        h("option", { value: "" }, t("Any strength")),
        ["A", "B", "C"].map((g) => h("option", { value: g }, kv(g, tc("grades." + g + ".label", D.grades[g].label)))),
        h("option", { value: "howto" }, t("How-to (guidance, standards, law)")),
        h("option", { value: "context" }, t("Context (situation reports)")));
      sortSel = h("select", { id: "libSort" },
        h("option", { value: "newest" }, t("Newest first")),
        h("option", { value: "strength" }, t("Strongest evidence first")),
        h("option", { value: "title" }, t("Title A to Z")));
      typeSel.value = state.type;
      gradeSel.value = state.grade;
      sortSel.value = state.sort;
      chips = h("div", { class: "chips", role: "group", "aria-label": t("Filter by topic") },
        [{ id: "", label: t("All topics") }, ...D.topics.map((x) => ({ id: x.id, label: cTopic(x) }))].map((x) =>
          h("button", { type: "button", class: "chip", "data-topic": x.id, "aria-pressed": x.id === state.topic ? "true" : "false" }, x.label)));
      const clearBtn = h("button", { type: "button", class: "linkbtn", id: "libClear" }, t("Clear all filters"));
      const csvBtn = h("button", { type: "button", class: "btn btn--quiet btn--small", id: "libCsv" }, t("Export the library as CSV"));
      filters.replaceChildren(
        h("div", { class: "field field--search" }, h("label", { for: "libQ" }, t("Search the library")), q),
        h("div", { class: "field" }, h("label", { for: "libType" }, t("Kind of source")), typeSel),
        h("div", { class: "field" }, h("label", { for: "libGrade" }, t("Evidence strength")), gradeSel),
        h("div", { class: "field" }, h("label", { for: "libSort" }, t("Order")), sortSel),
        chips,
        h("p",{lang:"en",class:"note"},"These grades describe institutional study designs, not the value of Indigenous or traditional knowledge. Community-controlled TK accounts are documented separately with their own context, protocols and cross-references. ",h("button",{type:"button",class:"linkbtn",id:"libTK",onclick:()=>App.showPlanTab?.("tk")},"Open Indigenous & Traditional Knowledge")),
        h("div", { class: "filters__actions" }, clearBtn, csvBtn));
      q.addEventListener("input", debounce(() => { state.q = q.value.trim(); render(); }, 120));
      typeSel.addEventListener("change", () => { state.type = typeSel.value; render(); });
      gradeSel.addEventListener("change", () => { state.grade = gradeSel.value; render(); });
      sortSel.addEventListener("change", () => { state.sort = sortSel.value; render(); });
      chips.addEventListener("click", (e) => {
        const c = e.target.closest(".chip");
        if (!c) return;
        state.topic = c.dataset.topic;
        $$(".chip", chips).forEach((x) => x.setAttribute("aria-pressed", x === c ? "true" : "false"));
        render();
      });
      clearBtn.addEventListener("click", clearAll);
      csvBtn.addEventListener("click", () => App.exportCsv());
      filters.hidden = false;
    }

    function citation(d) {
      const who = d.authors && !/^Press release|^Research team|^Independent/.test(d.authors) ? d.authors : d.org;
      const year = d.date ? d.date.slice(0, 4) : "n.d.";
      const link = d.doi ? "https://doi.org/" + d.doi : d.url;
      return `${who}. (${year}). ${d.title}. ${who === d.org ? "" : d.org + ". "}${link}`;
    }
    App.citation = citation;

    function card(d) {
      const url = safeUrl(d.url);
      const meta = h("dl", { class: "doc__meta" },
        h("dt", null, t("Publisher")), h("dd", null, d.org),
        d.authors ? [h("dt", { "data-level": "detail" }, t("Authors")), h("dd", { "data-level": "detail" }, d.authors)] : null,
        h("dt", null, t("Published")), h("dd", null, h("time", { datetime: d.date || null }, fmtDate(d.date, d.ongoing))),
        d.doi ? [h("dt", { "data-level": "detail" }, "DOI"), h("dd", { "data-level": "detail" }, d.doi)] : null
      );
      const users = usedBy.get(d.id) || [];
      return h("article", { class: "doc", id: "doc-" + d.id, "aria-labelledby": "doc-t-" + d.id },
        h("div", { class: "doc__main" },
          h("div", { class: "doc__badges" }, gradeBadge(d), h("span", { class: "doc__type" }, cType(d.type))),
          // Titles stay as published, so citations still match the source.
          markEn(h("h3", { id: "doc-t-" + d.id }, d.title), !isEnglish()),
          L("p", { class: "doc__summary" }, tcx("documents." + d.id + ".summary", d.summary)),
          d.key ? L("p", { class: "doc__key", "data-level": "detail" }, tcx("documents." + d.id + ".key", d.key)) : null,
          h("div",{lang:"en","data-tk-source":d.id}),
          users.length ? h("p", { class: "note" }, t("Supports:"), " ", users.map((b, i) => [i ? ", " : "", h("a", { href: "#bridge-" + b.id, "data-bridge": b.id }, cBridge(b, "short"))])) : null),
        h("div", { class: "doc__side" },
          meta,
          h("p", { class: "doc__limits" }, h("strong", null, t("Keep in mind:")), " ", L("span", null, tcx("documents." + d.id + ".limits", d.limits))),
          h("div", { class: "doc__actions" },
            url ? h("a", { class: "ext", href: url, target: "_blank", rel: "noopener noreferrer" }, t("Open source"), extIcon(), h("span", { class: "sr-only" }, " " + t("(opens the publisher’s site in a new tab)"))) : h("span", { class: "note" }, t("Link unavailable")),
            h("button", { type: "button", class: "linkbtn", "data-cite": d.id }, t("Copy citation"))),
          h("p", { class: "doc__checked" }, t("Link checked {date}", { date: fmtDate(d.checked) })))
      );
    }

    function matches(d) {
      if (state.topic && !d.topics.includes(state.topic)) return false;
      if (state.type && d.type !== state.type) return false;
      if (state.grade) {
        const ev = evidenceOf(d);
        if (state.grade === "howto" ? ev.cls !== "g-howto" : state.grade === "context" ? ev.cls !== "g-context" : d.grade !== state.grade) return false;
      }
      if (state.q) {
        const hay = haystack.get(d.id);
        for (const word of norm(state.q).split(/\s+/).filter(Boolean)) if (!hay.includes(word)) return false;
      }
      return true;
    }
    // Without filters, show the ten newest first and offer the rest on request,
    // so the page stays easy to scan. Any filter or search shows every match.
    const FIRST = 10;
    let showAll = false;
    function render() {
      const docs = D.documents.filter(matches);
      if (state.sort === "newest") docs.sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
      else if (state.sort === "strength") docs.sort((a, b) => evidenceOf(a).rank - evidenceOf(b).rank || sortKey(b).localeCompare(sortKey(a)));
      else docs.sort((a, b) => a.title.localeCompare(b.title, "en"));
      const filtered = !!(state.q || state.topic || state.type || state.grade);
      const visible = filtered || showAll ? docs : docs.slice(0, FIRST);
      mount.replaceChildren(...visible.map(card));
      App.fillTKReferences?.();
      if (!docs.length) mount.append(h("p", { class: "empty" }, t("No sources match these filters."), " ", h("button", { type: "button", class: "linkbtn", onclick: clearAll }, t("Clear all filters"))));
      if (visible.length < docs.length) {
        mount.append(h("button", { type: "button", class: "btn btn--quiet library__more", onclick: () => {
          showAll = true;
          render();
          const next = mount.children[FIRST];
          if (next) reveal(next);
        } }, tn("Show all {n} source", "Show all {n} sources", docs.length)));
      }
      const total = D.documents.length;
      count.textContent = visible.length === total
        ? tn("Showing all {n} source.", "Showing all {n} sources.", total)
        : tn("Showing {n} of {total} source.", "Showing {n} of {total} sources.", total, { n: fmtNum(visible.length), total: fmtNum(total) });
    }
    function clearAll() {
      showAll = true;
      Object.assign(state, { q: "", topic: "", type: "", grade: "" });
      q.value = ""; typeSel.value = ""; gradeSel.value = "";
      $$(".chip", chips).forEach((c) => c.setAttribute("aria-pressed", c.dataset.topic === "" ? "true" : "false"));
      render();
    }
    mount.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cite]");
      if (!b) return;
      const d = docById.get(b.getAttribute("data-cite"));
      if (d) copyText(citation(d), t("Citation copied."));
    });
    // CSV export of the whole library (for spreadsheets and research).
    const csv = () => csvOf(["id", "title", "publisher", "authors", "date", "type", "evidence", "topics", "url", "doi", "link_checked"],
      D.documents.map((d) => [d.id, d.title, d.org, d.authors, d.date, (D.types[d.type] || {}).label, evidenceOf(d).cls.slice(2), d.topics.join("; "), d.url, d.doi, d.checked]));
    App.exportCsv = () => download(`peace-bridges-library-${today()}.csv`, csv(), "text/csv");
    // Make sure a card is visible (clearing filters if needed) and go to it.
    App.gotoDoc = (id) => {
      if (!document.getElementById("doc-" + id)) clearAll();
      const el = document.getElementById("doc-" + id);
      if (el) reveal(el);
    };
    const redraw = () => { buildHaystack(); buildFilters(); render(); };
    redraw();
    App.onLang("library", redraw);
  });

  /* ------------------------------------------------------------------
     8  EVIDENCE WEB
     Sources on one side, bridges on the other, one line per link. Lines
     take the colour of the source's evidence strength. In right-to-left
     languages the diagram is mirrored, so it reads from the right.
     ------------------------------------------------------------------ */
  part("evidence-web", () => {
    const mount = $("#webMount");
    let links = [];
    let nodes = [];
    const showView = value => {
      const systems=value===true, explorer=value==='explorer';
      mount.hidden = systems||explorer;
      $('#webExplorer').hidden=!explorer;
      $("#webSystems").hidden = !systems;
      $("#webViewSources").setAttribute("aria-pressed", String(!systems&&!explorer));
      $("#webViewExplorer").setAttribute("aria-pressed",String(explorer));
      $("#webViewSystems").setAttribute("aria-pressed", String(systems));
    };
    $("#webViewSources").addEventListener("click", () => showView(false));
    $("#webViewSystems").addEventListener("click", () => showView(true));
    App.showSystems = () => { showView(true); reveal($("#webSystems")); };
    const explorer=window.RPB_EXPLORER_UI({h,s,mount:$('#webExplorer'),registry:D,onSource:id=>App.gotoDoc(id),onBridge:id=>App.openBridge(id),onPlan:id=>App.planBridge(id),onSystems:()=>App.showSystems(),download});
    $('#webViewExplorer').addEventListener('click',()=>showView('explorer'));
    App.showExplorer=()=>{showView('explorer');reveal($('#webExplorer'));};
    function render() {
      const bridges = D.bridges;
      const used = [...new Set(bridges.flatMap((b) => b.docs))].map((id) => docById.get(id)).filter(Boolean);
      // Order sources by the average position of the bridges they support,
      // which keeps lines short and reduces crossings.
      const pos = new Map(bridges.map((b, i) => [b.id, i]));
      const centre = (d) => { const idx = bridges.filter((b) => b.docs.includes(d.id)).map((b) => pos.get(b.id)); return idx.reduce((a, c) => a + c, 0) / idx.length; };
      used.sort((a, b) => centre(a) - centre(b) || evidenceOf(a).rank - evidenceOf(b).rank);
      const ROW = 26, PAD = 46, VW = 980;
      const VH = PAD * 2 + used.length * ROW;
      const ys = new Map(used.map((d, i) => [d.id, PAD + i * ROW + ROW / 2]));
      const band = (used.length * ROW) / bridges.length;
      const yb = new Map(bridges.map((b, i) => [b.id, PAD + band * i + band / 2]));
      const SX = 382, BX = 640;
      const rtl = I18N.dir === "rtl";
      const X = (x) => (rtl ? VW - x : x); // mirror positions for right-to-left reading
      // Text anchors are relative to the reading direction, so they stay the same.
      const svg = s("svg", { viewBox: `0 0 ${VW} ${VH}`, role: "group", "aria-labelledby": "webTitle", "aria-describedby": "webDesc", direction: I18N.dir },
        s("title", { id: "webTitle" }, t("Evidence web")),
        s("desc", { id: "webDesc" }, t("{sources} sources linked to {bridges} proposed bridges. A list version follows the diagram.", { sources: fmtNum(used.length), bridges: fmtNum(bridges.length) })),
        s("text", { x: X(SX - 14), y: 24, "text-anchor": "end", class: "web__head" }, t("Sources")),
        s("text", { x: X(BX + 16), y: 24, "text-anchor": "start", class: "web__head" }, t("Bridges"))
      );
      const linkLayer = s("g", { "aria-hidden": "true" });
      svg.append(linkLayer);
      links = [];
      for (const b of bridges) {
        for (const id of b.docs) {
          const d = docById.get(id);
          if (!d) continue;
          const y1 = ys.get(id), y2 = yb.get(b.id);
          const path = s("path", { d: `M${X(SX + 6)},${y1} C${X(SX + 140)},${y1} ${X(BX - 120)},${y2} ${X(BX)},${y2}`, class: `web__link ${evidenceOf(d).cls}` });
          path.dataset.doc = id;
          path.dataset.bridge = b.id;
          links.push(path);
          linkLayer.append(path);
        }
      }
      nodes = [];
      for (const d of used) {
        const y = ys.get(d.id);
        const ev = evidenceOf(d);
        const label = cDoc(d, "short");
        const strength = ev.cls === "g-howto" || ev.cls === "g-context" ? ev.badge : t("evidence {grade}", { grade: ev.badge });
        const a = s("a", { href: "#doc-" + d.id, class: "web__node web__node--doc", "aria-label": t("{name}, {strength}. Go to this source in the library.", { name: label, strength }) },
          s("rect", { x: rtl ? VW - SX - 6 : 8, y: y - ROW / 2 + 2, width: SX - 2, height: ROW - 4, rx: 8, class: "web__hit", fill: "transparent", stroke: "none" }),
          s("circle", { cx: X(SX), cy: y, r: 5.5, class: `web__dot ${ev.cls}` }),
          s("text", { x: X(SX - 14), y: y + 4.5, "text-anchor": "end" }, clip(label, 48)));
        a.dataset.doc = d.id;
        nodes.push(a);
        svg.append(a);
      }
      for (const b of bridges) {
        const y = yb.get(b.id);
        const label = cBridge(b, "short");
        const a = s("a", { href: "#bridge-" + b.id, class: "web__node web__node--bridge", "aria-label": tn("{name}: rests on {n} source. Open this bridge.", "{name}: rests on {n} sources. Open this bridge.", b.docs.length, { name: label }) },
          s("rect", { x: rtl ? VW - BX - 320 : BX, y: y - 22, width: 320, height: 44, rx: 12 }),
          s("text", { x: X(BX + 16), y: y + 1, "text-anchor": "start" }, clip(label, 30)),
          s("text", { x: X(BX + 16), y: y + 16, "text-anchor": "start", class: "web__sub" }, tn("{n} source", "{n} sources", b.docs.length)));
        a.dataset.bridge = b.id;
        nodes.push(a);
        svg.append(a);
      }
      const swipe = h("p", { class: "web__swipe", "aria-hidden": "true" }, t("Swipe the diagram sideways to see the bridges, or read the list below."));
      const legend = h("div", { class: "web__legend", "aria-hidden": "true" },
        [["g-B", kv("B", tc("grades.B.label", D.grades.B.label))], ["g-C", kv("C", tc("grades.C.label", D.grades.C.label))], ["g-howto", t("How-to")], ["g-context", t("Context")]].map(([cls, label]) => h("span", null, h("i", { class: "web__swatch " + cls }), label)));
      const alt = h("details", { class: "web__alt" }, h("summary", null, t("Read the evidence web as a list")),
        h("ul", null, bridges.map((b) => h("li", null, kvNodes(h("strong", null, cBridge(b, "short")),
          b.docs.map((id, i) => { const d = docById.get(id); return d ? [i ? "; " : "", `${cDoc(d, "short")} (${evidenceOf(d).badge})`] : null; }))))));
      mount.replaceChildren(svg, swipe, legend, alt);
      // On phones the diagram needs sideways scrolling, so open the list too.
      if (window.matchMedia && window.matchMedia("(max-width: 640px)").matches) alt.open = true;
      for (const n of nodes) {
        const kind = n.dataset.bridge ? "bridge" : "doc";
        const id = n.dataset.bridge || n.dataset.doc;
        n.addEventListener("pointerenter", () => trace(kind, id));
        n.addEventListener("pointerleave", untrace);
        n.addEventListener("focus", () => trace(kind, id));
        n.addEventListener("blur", untrace);
        n.addEventListener("click", (e) => {
          e.preventDefault();
          if (kind === "bridge") App.openBridge(id); else App.gotoDoc(id);
        });
      }
    }
    // Tracing: highlight one bridge's sources, or one source's bridges.
    const trace = (kind, id) => {
      mount.classList.add("is-tracing");
      const onDocs = new Set(), onBridges = new Set();
      for (const l of links) {
        const on = kind === "bridge" ? l.dataset.bridge === id : l.dataset.doc === id;
        l.classList.toggle("is-on", on);
        if (on) { onDocs.add(l.dataset.doc); onBridges.add(l.dataset.bridge); }
      }
      for (const n of nodes) n.classList.toggle("is-on", n.dataset.doc ? onDocs.has(n.dataset.doc) : onBridges.has(n.dataset.bridge));
    };
    const untrace = () => { mount.classList.remove("is-tracing"); links.forEach((l) => l.classList.remove("is-on")); nodes.forEach((n) => n.classList.remove("is-on")); };
    render();
    App.onLang("evidence-web", render);
  });

  /* ------------------------------------------------------------------
     9  SOLUTION BRIDGES
     Each bridge is a <details> sheet. "Plan this bridge" fills in the
     planner. Text comes from data.js.
     ------------------------------------------------------------------ */
  part("bridges", () => {
    const workshopPrint=window.RPB_WORKSHOP_PRINT({h,registry:D,canPrint});
    App.printBridge=id=>workshopPrint.open(id);
    const mount = $("#bridgesMount");
    const chev = () => s("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", focusable: "false" }, s("path", { d: "m3 6 5 5 5-5", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }));
    const list = (pairs, ordered) => Ls(ordered ? "ol" : "ul", null, pairs);
    const fx = (b, f) => tcx("bridges." + b.id + "." + f, b[f]);
    const block = (title, body, cls, detail) => h("div", { class: "bridge__block" + (cls ? " " + cls : ""), "data-level": detail ? "detail" : null }, h("h4", null, title), body);
    function sheet(b) {
      const docs = b.docs.map((id) => docById.get(id)).filter(Boolean).sort((x, y) => evidenceOf(x).rank - evidenceOf(y).rank);
      return h("details", { class: "bridge", id: "bridge-" + b.id },
        h("summary", null,
          h("div", { class: "bridge__head" },
            L("h3", { class: "bridge__name" }, fx(b, "name")),
            L("p", { class: "bridge__plain" }, fx(b, "plain")), b.category ? h("p", {class:"knowledge-badge",lang:"en"}, "Category: " + D.bridgeCategories.find(c=>c.id===b.category).label) : null, evolutionBadge(b.id),
            h("p", { class: "impact-badge", lang: "en" }, impactStatus(b.id)),
            h("p", {lang:"en"}, "Peace systems: " + (App.systemsCount ? App.systemsCount(b.id) : 0) + " mapped relationships"),
            h("p", { class: "knowledge-badge", lang: "en" }, "Community knowledge: " + (App.knowledgeCount ? App.knowledgeCount(b.id) : 0) + " active local accounts"),
            h("div", { class: "bridge__row" },
              activeEvolution(b.id).history.length ? h("span", { lang: "en" }, "Local assessment recorded; check context and consent") : [h("span", { class: "grade grade--D", title: t("Every bridge is untested in a new place") }, "D"), h("span", null, t("Proposal, untested here"))],
              h("span", { class: "evbar", title: t("Strength of the sources behind it") }, docs.map((d) => h("i", { class: evidenceOf(d).cls }))),
              h("span", null, tn("{n} source behind it", "{n} sources behind it", docs.length)))),
          h("span", { class: "bridge__chev" }, chev())),
        h("div", { class: "bridge__body" },
          h("div", { class: "bridge__wide", lang: "en" }, "Lifecycle shown for the active local plan. Unrecorded bridges start at Conceptual / Proposed. Source grades and readiness checks remain separate.",
            h("ul", null, activeEvolution(b.id).history.slice(-3).map(e => h("li", { dir: "auto" }, fmtTime(e.at) + " — " + evolutionText(e) + ": " + e.note)))),
          h("div",{class:"bridge__block bridge__wide",lang:"en"},h("h4",null,"Contribution provenance"),...(App.provenanceFor && App.provenanceFor(b.id).history.length ? Provenance.lines({bridges:{[b.id]:App.provenanceFor(b.id)}},b.id,false) : ["Author and adaptation credits not yet recorded for this bridge in the active plan."]).map(x=>h("p",{dir:"auto"},x)),h("button",{type:"button",class:"btn btn--quiet","data-provenance-bridge":b.id},"Review contributions")),
          block(t("Where it comes from"), L("p", null, fx(b, "origin"))),
          block(t("Who it could help"), L("p", null, fx(b, "helps"))),
          block(t("What must be true first"), list(cBridgeList(b, "needs")), "bridge__wide"),
          block(t("What could go wrong"), list(cBridgeList(b, "risks")), "bridge__block--risks"),
          block(t("How to prevent harm"), list(cBridgeList(b, "safeguards")), "bridge__block--safe"),
          h("p",{class:"bridge__wide note",lang:"en"},"Hazard prerequisite: before field visits, planting, digging, water works or other physical intervention, complete a qualified mine-action review for the exact work area and activity. The planner checklist is not clearance. Never inspect or clear suspected ordnance yourself."),
          h("p",{class:"bridge__wide",lang:"en"},"Traditional knowledge: "+(App.tkCountFor?.(b.id)||0)+" local account(s); not ranked A–C. ",h("button",{type:"button",class:"linkbtn",onclick:()=>{App.planBridge(b.id);App.showPlanTab("tk");}},"Review TK protocols and links")),
          h("p",{class:"bridge__wide",lang:"en"},h("button",{type:"button",class:"linkbtn",onclick:()=>{App.planBridge(b.id);App.showPlanTab("seeds");}},"Open seed bank / nursery register")),
          h("div", { class: "bridge__first" }, h("h4", null, t("Smaller, safer first step")), L("p", null, fx(b, "firstStep"))),
          block(t("How a pilot could start"), list(cBridgeList(b, "steps"), true), null, true),
          block(t("What to measure"), list(cBridgeList(b, "measures")), null, true),
          block(t("What it can connect"), L("p", null, fx(b, "connectors")), "bridge__wide", true),
          b.evidenceNote ? h("p", { class: "bridge__note" }, h("strong", null, t("Evidence note:")), " ", L("span", null, fx(b, "evidenceNote"))) : null,
          block(t("Evidence behind this bridge"),
            h("ul", { class: "bridge__sources" }, docs.map((d) => h("li", null, gradeBadge(d), markEn(h("a", { href: "#doc-" + d.id, "data-doc": d.id }, d.title), !isEnglish())))), "bridge__wide"),
          h("div", { class: "bridge__actions" },
            h("button", { type: "button", class: "btn btn--quiet", lang: "en", "data-impact-bridge": b.id }, "Track impact"),
            h("button", {type:"button", class:"btn btn--quiet", lang:"en", "data-commons-bridge":b.id}, "Solutions commons"),
            h("button", { type: "button", class: "btn btn--quiet", lang: "en", "data-systems-bridge": b.id }, "Map peace systems"),
            h("button", { type: "button", class: "btn btn--quiet", lang: "en", "data-knowledge-bridge": b.id }, "Community knowledge"),
            h("button",{type:"button",class:"btn btn--quiet",lang:"en","data-print-bridge":b.id},"Print workshop / PDF"),
            h("button", { type: "button", class: "btn btn--dawn", "data-plan": b.id }, t("Plan this bridge")),
            h("button", { type: "button", class: "btn btn--quiet", "data-copy-bridge": b.id }, t("Copy as text")))
        ));
    }
    const evidenceFilter = h("select", { id: "evolutionEvidenceFilter" }, h("option", { value: "" }, "All evidence levels"), D.evolution.evidence.map(x => h("option", { value: x }, x)));
    const communityFilter = h("select", { id: "evolutionCommunityFilter" }, h("option", { value: "" }, "All community levels"), D.evolution.community.map(x => h("option", { value: x }, x)));
    const categoryFilter = h("select", {id: "bridgeCategoryFilter"}, h("option", {value:""}, "All bridge categories"), (D.bridgeCategories || []).map(c => h("option", {value:c.id}, c.label)));
    const query = h("input", { id: "evolutionSearch", type: "search", placeholder: "Name, maturity or lifecycle notes" });
    const count = h("p", { role: "status" });
    mount.before(h("div", { class: "evolution-filters", lang: "en" }, h("p", null, "Filter bridges in the active local plan"),
      h("label", { for: "evolutionSearch" }, "Search bridges"), query,
      h("label", {for:"bridgeCategoryFilter"}, "Bridge category"), categoryFilter,
      h("label", { for: "evolutionEvidenceFilter" }, "Evidence maturity"), evidenceFilter,
      h("label", { for: "evolutionCommunityFilter" }, "Community maturity"), communityFilter,
      h("button", { type: "button", class: "btn btn--quiet", onclick: () => { query.value = evidenceFilter.value = communityFilter.value = categoryFilter.value = ""; render(); } }, "Clear bridge filters"), count));
    [evidenceFilter, communityFilter, categoryFilter].forEach(x => x.addEventListener("change", render));
    query.addEventListener("input", render);
    function render() {
      const open = new Set($$(".bridge[open]", mount).map((d) => d.id));
      mount.replaceChildren(...D.bridges.map(sheet));
      let visible = 0;
      for (const b of D.bridges) {
        const e = activeEvolution(b.id);
        const text = norm([cBridge(b, "name"), cBridge(b, "plain"), ...cBridgeList(b, "steps").map(x=>x[0]), evolutionText(e), ...e.history.map(x => x.note), App.impactTextFor ? App.impactTextFor(b.id) : "", App.provenanceTextFor ? App.provenanceTextFor(b.id, false) : "", App.knowledgeTextFor ? App.knowledgeTextFor(b.id, false) : "", App.systemsTextFor ? App.systemsTextFor(b.id, false) : "", App.commonsTextFor ? App.commonsTextFor(b.id, false) : ""].join(" "));
        const match = (!categoryFilter.value || b.category === categoryFilter.value) && (!evidenceFilter.value || e.evidence === evidenceFilter.value) && (!communityFilter.value || e.community === communityFilter.value) && norm(query.value).split(/\s+/).every(w => text.includes(w));
        document.getElementById("bridge-" + b.id).hidden = !match;
        if (match) visible++;
      }
      count.textContent = visible + " of " + D.bridges.length + " bridges";
      for (const id of open) { const d = document.getElementById(id); if (d) d.open = true; }
    }
    render();
    App.onLang("bridges", render);
    App.refreshEvolutionCards = render;
    $("#bridgesToolbar").hidden = false;
    $("#bridgesOpenAll").addEventListener("click", () => $$(".bridge", mount).forEach((d) => (d.open = true)));
    $("#bridgesCloseAll").addEventListener("click", () => $$(".bridge", mount).forEach((d) => (d.open = false)));
    const bullets = (b, f) => cBridgeList(b, f).map((p) => "- " + p[0]);
    const asText = (b) => [
      cBridge(b, "name"), "", cBridge(b, "plain"), "", evolutionText(activeEvolution(b.id)), ...activeEvolution(b.id).history.map(e => e.at + " — " + evolutionText(e) + ": " + e.note), "",
      impactStatus(b.id), App.impactTextFor ? App.impactTextFor(b.id) : "", "",
      App.provenanceTextFor ? App.provenanceTextFor(b.id, true) : "", "", App.knowledgeTextFor ? App.knowledgeTextFor(b.id, true) : "", "", App.systemsTextFor ? App.systemsTextFor(b.id, true) : "", "", App.commonsTextFor ? App.commonsTextFor(b.id, true) : "", "",
      kv(t("Where it comes from"), cBridge(b, "origin")), kv(t("Who it could help"), cBridge(b, "helps")), "",
      withColon(t("What must be true first")), ...bullets(b, "needs"), "", withColon(t("What could go wrong")), ...bullets(b, "risks"), "",
      "Hazard prerequisite: qualified mine-action assessment for the exact area and intended use is required before field intervention. Never inspect or clear suspected ordnance yourself.", "",
      withColon(t("How to prevent harm")), ...bullets(b, "safeguards"), "", kv(t("Smaller, safer first step"), cBridge(b, "firstStep")), "",
      withColon(t("What to measure")), ...bullets(b, "measures"), "",
      activeEvolution(b.id).history.length ? "Local assessment only. It still requires the community’s free, prior and informed consent and an independent risk assessment." : tr("Status: a proposal, untested here. It needs the community’s free, prior and informed consent and an independent risk assessment."),
      t("Source: Regenerative Peace Bridges (Planetary Restoration Archive)")
    ].join("\n");
    mount.addEventListener("click", (e) => {
      const workshop=e.target.closest("[data-print-bridge]");if(workshop){workshopPrint.open(workshop.dataset.printBridge);return;}
      const provenance = e.target.closest("[data-provenance-bridge]");
      if(provenance){App.openProvenance(provenance.dataset.provenanceBridge);return;}
      const impact = e.target.closest("[data-impact-bridge]");
      if (impact) { App.planBridge(impact.dataset.impactBridge); App.showPlanTab("impact"); reveal($("#panel-impact")); return; }
      const commons=e.target.closest("[data-commons-bridge]");
      if (commons) {App.planBridge(commons.dataset.commonsBridge);App.openCommons();return;}
      const systems = e.target.closest("[data-systems-bridge]");
      if (systems) { App.planBridge(systems.dataset.systemsBridge); App.showSystems(); return; }
      const knowledge = e.target.closest("[data-knowledge-bridge]");
      if (knowledge) { App.planBridge(knowledge.dataset.knowledgeBridge); App.showPlanTab("knowledge"); reveal($("#panel-knowledge")); return; }
      const plan = e.target.closest("[data-plan]");
      if (plan) { App.planBridge && App.planBridge(plan.getAttribute("data-plan")); return; }
      const cp = e.target.closest("[data-copy-bridge]");
      if (cp) { const b = bridgeById.get(cp.getAttribute("data-copy-bridge")); if (b) App.safetyGate(App.activeEvolutionPlan(), () => copyText(asText(b), t("Bridge copied as text."))); return; }
      const doc = e.target.closest("a[data-doc]");
      if (doc) { e.preventDefault(); App.gotoDoc(doc.getAttribute("data-doc")); }
    });
    App.openBridge = (id) => {
      query.value = evidenceFilter.value = communityFilter.value = "";
      render();
      const d = document.getElementById("bridge-" + id);
      if (!d) return;
      d.open = true;
      reveal(d, $("summary", d));
    };
  });

  /* ------------------------------------------------------------------
     10 HEALING AND PEACE PRACTICES
     ------------------------------------------------------------------ */
  part("practices", () => {
    const mount = $("#practicesMount");
    const filter = $("#practiceFilter");
    const kinds = () => ({ healing: t("Healing"), peace: t("Peace"), rights: t("Rights and consent"), safety: t("Safety"), regenerative: t("Regenerative"), accountability: t("Accountability") });
    let active = "";
    const fx = (p, f) => tcx("practices." + p.id + "." + f, p[f]);
    const card = (p, K) => {
      const src = docById.get(p.source);
      return h("article", { class: "practice", id: "practice-" + p.id, "data-kind": p.kind, "aria-labelledby": "pr-t-" + p.id },
        h("span", { class: "practice__kind" }, K[p.kind] || p.kind),
        L("h3", { id: "pr-t-" + p.id }, fx(p, "name")),
        L("p", { class: "practice__plain" }, fx(p, "plain")),
        h("p", { class: "practice__when", "data-level": "detail" }, h("strong", null, t("When:")), " ", L("span", null, fx(p, "when"))),
        Ls("ol", null, p.steps.map((x, i) => tcx("practices." + p.id + ".steps." + i, x))),
        h("p", { class: "practice__care" }, h("strong", null, t("Take care:")), " ", L("span", null, fx(p, "care"))),
        src ? h("p", { class: "practice__src" }, t("From:"), " ", h("a", { href: "#doc-" + src.id, "data-doc": src.id }, cDoc(src, "short"))) : null);
    };
    const render = () => {
      const K = kinds();
      mount.replaceChildren(...D.practices.filter((p) => !active || p.kind === active).map((p) => card(p, K)));
    };
    const renderFilter = () => {
      filter.replaceChildren(...[["", t("All practices")], ...Object.entries(kinds())].map(([k, label]) =>
        h("button", { type: "button", class: "chip", "data-kind": k, "aria-pressed": k === active ? "true" : "false" }, label)));
      filter.hidden = false;
    };
    filter.addEventListener("click", (e) => {
      const c = e.target.closest(".chip");
      if (!c) return;
      active = c.dataset.kind;
      $$(".chip", filter).forEach((x) => x.setAttribute("aria-pressed", x === c ? "true" : "false"));
      render();
    });
    mount.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-doc]");
      if (a) { e.preventDefault(); App.gotoDoc(a.getAttribute("data-doc")); }
    });
    App.gotoPractice = (id) => {
      if (!document.getElementById("practice-" + id)) { active = ""; renderFilter(); render(); }
      reveal(document.getElementById("practice-" + id));
    };
    renderFilter();
    render();
    App.onLang("practices", () => { renderFilter(); render(); });
  });

  /* ------------------------------------------------------------------
     11 COMMUNITY MEETING KIT
     Everything for one listening session: a timed guide, a consent
     script to read aloud, picture cards for people who don't read,
     shape-coded voting cards and a complaints poster. The words come
     from data.js (RPB.kit). The pictures are simple line drawings made
     below, so they print sharply in black and white.
     To add a card: add it to RPB.kit.cards, then add a drawing to
     KIT_ICONS with the same id (64 x 64 units, lines 3.5 units wide).
     ------------------------------------------------------------------ */
  // Drawing shorthand: path, circle, ellipse. Class "t" = tinted fill,
  // "f" = solid fill, "thin" = finer line, "thick" = heavier line.
  const P = (d, cls) => ["path", { d, class: cls }];
  const C = (cx, cy, r, cls) => ["circle", { cx, cy, r, class: cls }];
  const E = (cx, cy, rx, ry, cls, rot) => ["ellipse", { cx, cy, rx, ry, class: cls, transform: rot ? `rotate(${rot} ${cx} ${cy})` : null }];
  const KIT_ICONS = {
    water: [P("M32 6C32 6 17 25 17 36a15 15 0 0 0 30 0C47 25 32 6 32 6Z", "t"), P("M25 39a7.5 7.5 0 0 0 6 7"), P("M8 58q6-4 12 0t12 0t12 0t12 0")],
    trees: [P("M20 38a11 11 0 0 1-2-21a14 14 0 0 1 28 0a11 11 0 0 1-2 21Z", "t"), P("M32 38V60M32 47l-6-5M32 44l6-5M18 60h28")],
    seeds: [P("M10 50H54"), P("M32 50V30"), P("M32 38C24 38 18 32 18 24C26 24 32 30 32 38Z", "t"), P("M32 31C32 23 38 17 46 17C46 25 40 31 32 31Z", "t"), E(20, 57, 3.2, 2.2, "f"), E(32, 58, 3.2, 2.2, "f"), E(44, 57, 3.2, 2.2, "f")],
    farming: [P("M32 60V15"), E(27, 21, 4.6, 2.6, "t", -35), E(37, 21, 4.6, 2.6, "t", 35), E(27, 29, 4.6, 2.6, "t", -35), E(37, 29, 4.6, 2.6, "t", 35), E(27, 37, 4.6, 2.6, "t", -35), E(37, 37, 4.6, 2.6, "t", 35), E(32, 11, 2.6, 4.4, "t"), P("M32 50C24 48 18 43 15 36"), P("M32 55C40 53 46 48 49 41")],
    herding: [P("M29 10C21 11 15 23 15 35C15 46 19 53 25 53C29 53 30 49 30 43Z", "t"), P("M35 10C43 11 49 23 49 35C49 46 45 53 39 53C35 53 34 49 34 43Z", "t")],
    school: [P("M32 18C26 13 16 12 8 14V50C16 48 26 49 32 54C38 49 48 48 56 50V14C48 12 38 13 32 18Z", "t"), P("M32 18V54"), P("M14 24c5-1 10-1 13 1M14 32c5-1 10-1 13 1M14 40c5-1 10-1 13 1M50 24c-5-1-10-1-13 1M50 32c-5-1-10-1-13 1M50 40c-5-1-10-1-13 1", "thin")],
    clinic: [P("M32 55C14 43 8 33 8 24C8 16 14 10 21 10C26 10 30 13 32 17C34 13 38 10 43 10C50 10 56 16 56 24C56 33 50 43 32 55Z", "t"), P("M4 33H19l4-9l6 18l5-13l3 4H60")],
    cooking: [P("M14 18H50V30a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10Z", "t"), P("M14 22H8M50 22h6"), P("M29 18v-4h6v4"), P("M32 62c-6 0-9-4-7-9c1 3 3 3 4 2c-2-4 1-8 4-10c0 4 6 6 6 11c0 4-3 6-7 6Z", "t"), P("M17 62l11-4.5M47 62l-11-4.5")],
    "safe-land": [P("M6 58H58"), P("M32 6L50 12V28C50 40 42 48 32 52C22 48 14 40 14 28V12Z", "t"), P("M24 29l6 6l11-12")],
    market: [P("M10 20H54L50 8H14Z", "t"), P("M10 20a5.5 5.5 0 0 0 11 0a5.5 5.5 0 0 0 11 0a5.5 5.5 0 0 0 11 0a5.5 5.5 0 0 0 11 0"), P("M14 26V56M50 26V56"), P("M8 43H56"), C(22, 37, 4.5, "t"), C(32, 37, 4.5, "t"), C(42, 37, 4.5, "t"), P("M6 56H58")],
    jobs: [P("M8 50v6a14 5 0 0 0 28 0v-6"), P("M8 44v6a14 5 0 0 0 28 0v-6"), P("M8 38v6a14 5 0 0 0 28 0v-6"), E(22, 38, 14, 5, "t"), C(46, 24, 12, "t"), C(46, 24, 6.5, "thin")],
    wellbeing: [C(20, 29, 6.5), P("M8 57C8 45 13 39 20 39C27 39 32 45 32 57"), C(44, 29, 6.5), P("M32 57C32 45 37 39 44 39C51 39 56 45 56 57"), P("M32 19c-4-3-7-5.5-7-8.5a3.5 3.5 0 0 1 7-1a3.5 3.5 0 0 1 7 1c0 3-3 5.5-7 8.5Z", "f")],
    complaint: [P("M12 12H52a4 4 0 0 1 4 4V40a4 4 0 0 1-4 4H30L18 54V44H12a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4Z", "t"), C(22, 28, 3, "f"), C(32, 28, 3, "f"), C(42, 28, 3, "f")],
    pause: [P("M22 6H42L58 22V42L42 58H22L6 42V22Z", "t"), P("M26 22V42M38 22V42", "thick")],
    measure: [P("M16 10H48a3 3 0 0 1 3 3V57a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3Z", "t"), P("M24 10V5H40V10"), P("M20 24l3.5 3.5L30 21M20 36l3.5 3.5L30 33"), P("M35 24H45M35 36H45M35 48H45", "thin"), P("M20 45h7v7h-7Z", "thin")],
    // Voting cards: the shape carries the meaning, so they work in black and white.
    "vote-yes": [C(32, 32, 26, "t"), P("M19 33l9 9l17-19")],
    "vote-unsure": [P("M32 5L60 56H4Z", "t"), P("M26 30a6 6 0 1 1 9 5.2c-2 1.2-3 2.3-3 4.8"), C(32, 48, 2.6, "f")],
    "vote-no": [["rect", { x: 7, y: 7, width: 50, height: 50, rx: 5, class: "t" }], P("M21 21L43 43M43 21L21 43")]
  };
  function pictogram(id, extraClass) {
    const shapes = KIT_ICONS[id] || [C(32, 32, 24)];
    return s("svg", { viewBox: "0 0 64 64", class: "pict" + (extraClass ? " " + extraClass : ""), "aria-hidden": "true", focusable: "false" }, shapes.map(([tag, attrs]) => s(tag, attrs)));
  }

  part("kit", () => {
    const mount = $("#kitMount");
    const bar = $("#kitToolbar");
    const K = D.kit;
    if (!mount || !K) return;
    const kx = (path, en) => tcx("kit." + path, en);
    const kt = (path, en) => tc("kit." + path, en);
    const mins = (n) => t("{n} min", { n: fmtNum(n) });
    function render() {
      const steps = K.session.steps;
      // A strip that shows how the 90 minutes are shared out.
      const timed = steps.filter((st) => st.minutes > 0);
      const strip = h("div", { class: "kit__time", "aria-hidden": "true" }, timed.map((st) => {
        const seg = h("span", { class: "kit__seg" }, h("span", { class: "kit__segname" }, kt(`session.${st.id}.title`, st.title)), h("span", { class: "kit__segmin" }, mins(st.minutes)));
        seg.style.flexGrow = String(st.minutes); // CSSOM, allowed by the security policy
        return seg;
      }));
      const session = h("section", { class: "kit__block kit__session", "aria-labelledby": "kit-session-title" },
        h("div", { class: "kit__head" }, L("h3", { id: "kit-session-title" }, kx("session.title", K.session.title)), L("span", { class: "kit__length" }, kx("session.length", K.session.length))),
        strip,
        h("ol", { class: "kit__steps" }, steps.map((st) => h("li", { class: "kit__step", id: "kit-step-" + st.id },
          h("div", { class: "kit__stephead" }, L("h4", null, kx(`session.${st.id}.title`, st.title)), st.minutes ? h("span", { class: "kit__min" }, mins(st.minutes)) : null),
          Ls("ul", null, st.points.map((pt, i) => kx(`session.${st.id}.points.${i}`, pt))),
          st.prompts ? h("div", { class: "kit__prompts" }, h("p", { class: "kit__label" }, t("Questions you could ask")),
            Ls("ul", null, st.prompts.map((pr, i) => kx(`session.${st.id}.prompts.${i}`, pr)))) : null))));
      const script = h("section", { class: "kit__block kit__script", "aria-labelledby": "kit-consent-title" },
        L("h3", { id: "kit-consent-title" }, kx("consent.title", K.consent.title)),
        L("p", { class: "note" }, kx("consent.note", K.consent.note)),
        h("div", { class: "script" },
          K.consent.lines.map((line, i) => L("p", { class: "script__line" }, kx("consent.lines." + i, line))),
          L("p", { class: "script__question" }, kx("consent.question", K.consent.question))));
      const children = h("section", { class: "kit__block kit__children", "aria-labelledby": "kit-children-title" },
        L("h3", { id: "kit-children-title" }, kx("children.title", K.children.title)),
        Ls("ul", null, K.children.points.map((pt, i) => kx("children.points." + i, pt))));
      const cardEl = (c) => h("li", { class: "pcard", "data-card": c.id }, pictogram(c.id),
        L("span", { class: "pcard__label" }, kx(`cards.${c.id}.label`, c.label)),
        L("span", { class: "pcard__hint" }, kx(`cards.${c.id}.hint`, c.hint)));
      const cards = h("section", { class: "kit__block kit__cards", "aria-labelledby": "kit-cards-title" },
        h("h3", { id: "kit-cards-title" }, t("Picture cards")),
        h("p", { class: "note" }, t("For “What matters most”, lay the cards out and let people place stones or marks on the ones that matter to them. The last three cards help run the meeting.")),
        h("ul", { class: "pcards" }, K.cards.filter((c) => c.group === "need").map(cardEl)),
        h("ul", { class: "pcards pcards--process" }, K.cards.filter((c) => c.group !== "need").map(cardEl)));
      const votes = h("section", { class: "kit__block kit__votes", "aria-labelledby": "kit-votes-title" },
        h("h3", { id: "kit-votes-title" }, t("Voting cards")),
        L("p", { class: "note" }, kx("votes.note", K.votes.note)),
        h("ul", { class: "vcards" }, K.votes.options.map((v) => h("li", { class: "vcard vcard--" + v.id, "data-vote": v.id }, pictogram("vote-" + v.id, "pict--vote"), L("span", { class: "vcard__label" }, kx("votes." + v.id, v.label))))));
      const poster = h("section", { class: "kit__block kit__posterblock", "aria-labelledby": "kit-poster-title" },
        h("h3", { id: "kit-poster-title" }, t("Complaints poster")),
        L("p", { class: "note" }, kx("poster.note", K.poster.note)),
        h("div", { class: "poster" },
          pictogram("complaint", "poster__icon"),
          L("p", { class: "poster__title" }, kx("poster.title", K.poster.title)),
          L("p", { class: "poster__lead" }, kx("poster.lead", K.poster.lead)),
          h("dl", { class: "poster__fields" }, K.poster.fields.map((f, i) => h("div", null, L("dt", null, kx("poster.fields." + i, f)), h("dd", null, h("span", { class: "sr-only" }, t("Blank, to fill in by hand.")))))),
          L("p", { class: "poster__promise" }, kx("poster.promise", K.poster.promise))));
      mount.replaceChildren(L("p", { class: "kit__intro" }, kx("intro", K.intro)), session, script, children, cards, votes, poster);
      setKids(bar,
        canPrint() ? h("button", { type: "button", class: "btn btn--dawn", id: "kitPrint" }, t("Print the kit")) : null,
        h("button", { type: "button", class: "btn btn--quiet", id: "kitCopyGuide" }, t("Copy the session guide")),
        h("button", { type: "button", class: "btn btn--quiet", id: "kitCopyScript" }, t("Copy the consent script")),
        h("button", { type: "button", class: "btn btn--quiet", id: "kitToPlan" }, t("Add this session to my plan")));
      bar.hidden = false;
    }
    // Plain text versions for copying into messages or documents.
    const scriptText = () => [kt("consent.title", K.consent.title), "", ...K.consent.lines.map((line, i) => kt("consent.lines." + i, line)), "", kt("consent.question", K.consent.question)].join("\n");
    function guideText() {
      const lines = [`${kt("session.title", K.session.title)} (${kt("session.length", K.session.length)})`, ""];
      K.session.steps.forEach((st, n) => {
        lines.push(`${n + 1}. ${kt(`session.${st.id}.title`, st.title)}${st.minutes ? " (" + mins(st.minutes) + ")" : ""}`);
        st.points.forEach((pt, i) => lines.push("   - " + kt(`session.${st.id}.points.${i}`, pt)));
        if (st.prompts) {
          lines.push("   " + withColon(t("Questions you could ask")));
          st.prompts.forEach((pr, i) => lines.push("     * " + kt(`session.${st.id}.prompts.${i}`, pr)));
        }
        lines.push("");
      });
      lines.push(scriptText(), "", kt("children.title", K.children.title), ...K.children.points.map((pt, i) => "- " + kt("children.points." + i, pt)), "",
        t("Source: Regenerative Peace Bridges (Planetary Restoration Archive)"));
      return lines.join("\n");
    }
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.id === "kitPrint") printWith("print-kit");
      else if (b.id === "kitCopyGuide") copyText(guideText(), t("Session guide copied."));
      else if (b.id === "kitCopyScript") copyText(scriptText(), t("Consent script copied."));
      else if (b.id === "kitToPlan" && App.addMilestone) App.addMilestone(kt("session.title", K.session.title));
    });
    App.gotoKit = (id) => { const el = document.getElementById(id); if (el) reveal(el); };
    render();
    App.onLang("kit", render);
  });

  /* ------------------------------------------------------------------
     12 GLOSSARY (sorted in the order of the chosen language)
     ------------------------------------------------------------------ */
  part("glossary", () => {
    const mount = $("#glossaryMount");
    const input = $("#glossaryInput");
    const slug = window.RPB_I18N ? window.RPB_I18N.slug : (x) => norm(x).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const render = () => {
      const qv = norm(input.value.trim());
      const items = D.glossary.map((g) => { const k = slug(g.term); return { g, k, term: tcx(`glossary.${k}.term`, g.term), def: tcx(`glossary.${k}.def`, g.def) }; })
        .filter((x) => !qv || norm([x.term[0], x.def[0], x.g.term, x.g.def].join(" ")).includes(qv))
        .sort((a, b) => a.term[0].localeCompare(b.term[0], locale()));
      const dl = h("dl", { class: "glossary" }, items.map((x) => h("div", { id: "term-" + x.k }, L("dt", null, x.term), L("dd", null, x.def))));
      mount.replaceChildren(items.length ? dl : h("p", { class: "empty" }, t("No terms match. Try a shorter word.")));
    };
    $("#glossaryFilter").hidden = false;
    input.addEventListener("input", debounce(render, 100));
    App.gotoTerm = (term) => { input.value = term; render(); reveal($("#glossary")); };
    render();
    App.onLang("glossary", render);
  });

  /* ------------------------------------------------------------------
     13 SEARCH EVERYTHING ( press / or Ctrl+K )
     The index is built when search first opens, and again after the
     language changes. It finds words in the chosen language and in
     English.
     ------------------------------------------------------------------ */
  part("search", () => {
    const dlg = $("#dlgSearch");
    const input = $("#searchInput");
    const out = $("#searchResults");
    let items = null;
    App.invalidateEvolutionSearch = () => { items = null; };
    function buildIndex() {
      items = [];
      const add = (type, order, title, text, extra, go) => items.push({ type, order, title, text, extra, go });
      for (const d of D.documents) add(t("Source"), 2, d.title, [cDoc(d, "summary"), cDoc(d, "key"), cDoc(d, "limits"), t("Publisher:") + " " + d.org + "."].filter(Boolean).join(" "), [d.summary, d.key, d.limits].join(" "), () => App.gotoDoc(d.id));
      for (const b of D.bridges) {
        const lists = ["needs", "risks", "safeguards", "measures"];
        add(t("Bridge"), 0, cBridge(b, "name"), [cBridge(b, "plain"), cBridge(b, "origin"), cBridge(b, "helps"), ...lists.flatMap((f) => cBridgeList(b, f).map((p) => p[0])), cBridge(b, "firstStep")].join(" "),
          [b.name, b.plain, b.origin, b.helps, ...lists.flatMap((f) => b[f]), b.firstStep, evolutionText(activeEvolution(b.id)), ...activeEvolution(b.id).history.map(e => e.note), App.impactTextFor ? App.impactTextFor(b.id) : "", App.provenanceTextFor ? App.provenanceTextFor(b.id, false) : "", App.knowledgeTextFor ? App.knowledgeTextFor(b.id, false) : "", App.systemsTextFor ? App.systemsTextFor(b.id, false) : ""].join(" "), () => App.openBridge(b.id));
      }
      if(App.showExplorer) add('Evidence web pathways',0,'Climate, livelihoods & restoration pathways',window.RPB_EXPLORER.nodes.map(n=>n.label+' '+n.description).join(' '),'drought flooding agricultural collapse seeds climate stressors visual map',()=>App.showExplorer());
      if(App.localGlossaryText) add("Community glossary",0,"Local language and dialect glossary",App.localGlossaryText(),"translation dialect language pronunciation",()=>App.showPlanTab("localGlossary"));
      if(App.decisionText) add("Workshop decisions",0,"Workshop decision tree",App.decisionText(),"risk workshop safeguards mediation downstream decision tree",()=>App.showPlanTab("decisions"));
      if(App.seedText) add("Seed sovereignty",0,"Seed banks, nurseries and supply tracking",App.seedText(),"seed sovereignty nursery propagation inventory supply",()=>App.showPlanTab("seeds"));
      if(App.tkText) add("Traditional knowledge",0,"Indigenous & Traditional Knowledge",App.tkText(),"IEK TK traditional ecological knowledge protocols permission cultural authority",()=>App.showPlanTab("tk"));
      if(App.hazardText) add("Safety prerequisite",0,"Hazard & Demining Prerequisite",App.hazardText(),"land mine UXO explosive ordnance stop work authority clearance",()=>App.showPlanTab("hazard"));
      if(App.economicsText) add("Appraisal",0,"Restoration Economics",App.economicsText(),"maintenance costs avoided losses retention distribution discount sensitivity",()=>App.showPlanTab("economics"));
      if(App.stewardshipText) add("Community assets",0,"Community Assets & Legitimacy",App.stewardshipText(),"strengths consent inclusion grievance accountability",()=>App.showPlanTab("stewardship"));
      if(App.replicationText) add("Evidence reports",0,"Replication & Failure Intelligence",App.replicationText(),"successful mixed failed interrupted inconclusive contradictory",()=>App.showPlanTab("replication"));
      if(App.scenarioText) add("Simulation",0,"Scenario & Causal Reasoning — simulations",App.scenarioText(),"rainfall population funding security institutional capacity sensitivity",()=>App.showPlanTab("scenario"));
      if(App.portfolioText) add("Portfolio",0,"Portfolio & Dependency Intelligence",App.portfolioText(),"prerequisites sequencing bottlenecks",()=>App.showPlanTab("portfolio"));
      for (const r of App.vault?.rows() || []) add("Vault note", 0, r.title, [r.body,r.context,r.source].join(" "), r.kind, () => App.vault.open(r.id));
      for (const r of App.commonsListings ? App.commonsListings() : []) { const c=Commons.current(r); add("Commons listing", 0, c.title, [c.description,c.community,c.area,c.capacity,c.conditions].join(" "), [c.kind,c.category,...c.themes,Commons.state(r)].join(" "), () => App.openCommons(r.id)); }
      for (const p of D.practices) add(t("Practice"), 1, cPractice(p, "name"), [cPractice(p, "plain"), cPractice(p, "when"), ...p.steps.map((x, i) => tc("practices." + p.id + ".steps." + i, x)), cPractice(p, "care")].join(" "), [p.name, p.plain, p.when, ...p.steps, p.care].join(" "), () => App.gotoPractice(p.id));
      const slug = window.RPB_I18N ? window.RPB_I18N.slug : (x) => norm(x);
      for (const g of D.glossary) { const k = slug(g.term); add(t("Term"), 4, tc(`glossary.${k}.term`, g.term), tc(`glossary.${k}.def`, g.def), g.term + " " + g.def, () => App.gotoTerm(tc(`glossary.${k}.term`, g.term))); }
      if (D.kit) {
        for (const st of D.kit.session.steps) add(t("Meeting kit"), 1, tc(`kit.session.${st.id}.title`, st.title), st.points.map((pt, i) => tc(`kit.session.${st.id}.points.${i}`, pt)).join(" "), [st.title, ...st.points].join(" "), () => App.gotoKit("kit-step-" + st.id));
        add(t("Meeting kit"), 1, tc("kit.consent.title", D.kit.consent.title), D.kit.consent.lines.map((x, i) => tc("kit.consent.lines." + i, x)).join(" "), D.kit.consent.lines.join(" "), () => App.gotoKit("kit-consent-title"));
        add(t("Meeting kit"), 1, t("Picture cards"), D.kit.cards.map((c) => tc(`kit.cards.${c.id}.label`, c.label)).join(", "), D.kit.cards.map((c) => c.label + " " + c.hint).join(" "), () => App.gotoKit("kit-cards-title"));
      }
      for (const m of $$("details.method")) {
        const title = $("summary h3", m);
        add(t("Method"), 3, title ? title.textContent : t("Method"), m.textContent.replace(/\s+/g, " "), "", () => { m.open = true; reveal(m, $("summary", m)); });
      }
      for (const sec of $$("main > section[id]")) {
        const title = $("h2", sec);
        if (title && ["start", "kit", "safeguards", "data", "about", "planner", "web", "commons"].includes(sec.id)) {
          add(t("Section"), 5, title.textContent, (sec.querySelector(".section__intro") || sec).textContent.replace(/\s+/g, " ").slice(0, 600), "", () => reveal(sec, title));
        }
      }
      for (const it of items) { it.nTitle = norm(it.title); it.nText = norm(it.text); it.nAll = it.nTitle + " " + it.nText + " " + norm(it.extra); }
    }
    let results = [];
    let sel = -1;
    const esc = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    function score(it, words) {
      let sc = 0;
      for (const w of words) {
        if (!it.nAll.includes(w)) return 0;
        if (it.nTitle.includes(w)) sc += new RegExp("(^|[^\\p{L}\\p{N}])" + esc(w), "u").test(it.nTitle) ? 8 : 5;
        if (it.nText.includes(w)) sc += 2;
        else sc += 1;
      }
      return sc;
    }
    // Build text with <mark> around matches without using innerHTML.
    function marked(text, words) {
      const n = norm(text);
      const spans = [];
      // Highlight only when normalising kept the length (true for most scripts).
      if (n.length === text.length) for (const w of words) { let i = n.indexOf(w); while (i !== -1 && w) { spans.push([i, i + w.length]); i = n.indexOf(w, i + w.length); } }
      spans.sort((a, b) => a[0] - b[0]);
      const frag = document.createDocumentFragment();
      let at = 0;
      for (const [a, b] of spans) { if (a < at) continue; frag.append(text.slice(at, a), h("mark", null, text.slice(a, b))); at = b; }
      frag.append(text.slice(at));
      return frag;
    }
    function snippet(it, words) {
      const i = it.nText.indexOf(words[0] || "");
      if (i < 0 || it.nText.length !== it.text.length) return it.text.slice(0, 140) + (it.text.length > 140 ? "…" : "");
      const from = Math.max(0, i - 50);
      return (from ? "…" : "") + it.text.slice(from, from + 150).trim() + (it.text.length > from + 150 ? "…" : "");
    }
    function run() {
      if (!items) buildIndex();
      const words = norm(input.value.trim()).split(/\s+/).filter(Boolean);
      out.replaceChildren();
      sel = -1;
      if (!words.length) { results = []; out.append(h("li", { class: "note" }, t("Type to search sources, bridges, practices, the meeting kit, methods and terms."))); return; }
      results = items.map((it) => ({ it, sc: score(it, words) })).filter((r) => r.sc > 0)
        .sort((a, b) => b.sc - a.sc || a.it.order - b.it.order).slice(0, 24).map((r) => r.it);
      if (!results.length) { out.append(h("li", { class: "note" }, t("Nothing found. Try another word, such as “water”, “consent” or “seed”."))); return; }
      results.forEach((it, i) => {
        out.append(h("li", null, h("button", { type: "button", "data-i": i, "aria-selected": "false" },
          h("span", { class: "search-results__type" }, it.type),
          h("span", { class: "search-results__title" }, marked(it.title, words)),
          h("span", { class: "search-results__snip" }, marked(snippet(it, words), words)))));
      });
    }
    function select(i) {
      const btns = $$("button", out);
      if (!btns.length) return;
      sel = (i + btns.length) % btns.length;
      btns.forEach((b, j) => b.setAttribute("aria-selected", j === sel ? "true" : "false"));
      btns[sel].scrollIntoView({ block: "nearest" });
    }
    function activate(i) {
      const it = results[i];
      if (!it) return;
      closeDialog(dlg);
      setTimeout(() => it.go(), 30);
    }
    input.addEventListener("input", debounce(run, 90));
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); select(sel + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); select(sel - 1); }
      else if (e.key === "Enter") { e.preventDefault(); activate(sel >= 0 ? sel : 0); }
      else if (e.key === "Escape") { e.preventDefault(); closeDialog(dlg); } // one press closes, even with text typed
    });
    out.addEventListener("click", (e) => { const b = e.target.closest("button[data-i]"); if (b) activate(Number(b.dataset.i)); });
    App.openSearch = (opener) => { openDialog(dlg, opener); input.select(); run(); input.focus(); };
    $("#btnSearch").addEventListener("click", (e) => App.openSearch(e.currentTarget));
    App.onLang("search", () => { items = null; if (dlg.open) run(); });
  });

  /* ------------------------------------------------------------------
     14 BRIDGE PLANNER
     Plans are saved automatically on this device. Workspace (schema 3):
       { schema: 3, activeId, plans: [{ id, created, updated, plan, history[] }],
         removed: [{ id, at }] }   <- plans deleted, so other tabs don't bring them back
     A plan holds:
       project, place, bridge, review (date), notes
       answers   { questionId: yes | partly | no | unknown | na }
       who       { groupId: met | planned | missing }
       dividers[], connectors[], measures[], customMeasures[]
       timeline  [{ id, date, title, status: planned | done | moved | dropped }]
       budget    { currency, lines: [{ id, item, category, amount }] }
       risks     [{ id, text, likelihood 1-3, impact 1-3, owner, mitigation,
                    status: open | watching | closed }]
       consent   [{ id, date, group, groupOther, process, decision, conditions, nextCheck }]
     Version 2 workspaces and version 1 drafts are upgraded automatically,
     and the version 2 original is kept untouched as a backup.
     ------------------------------------------------------------------ */
  const LIMITS = { short: 120, notes: 20000, item: 200, items: 12, measures: 30, importBytes: 64000000, plans: 20, history: 5,
    timeline: 60, budget: 80, risks: 60, consent: 100, title: 240, long: 500, owner: 80, currency: 12, amount: 1e12, removed: 50 };
  const IDS = {
    answer: ["yes", "partly", "no", "unknown", "na"],
    who: ["met", "planned", "missing"],
    milestone: ["planned", "done", "moved", "dropped"],
    cat: ["activities", "people", "safeguarding", "monitoring", "maintenance", "contingency", "other"],
    riskStatus: ["open", "watching", "closed"],
    process: ["listening", "meeting", "representatives", "separate", "other"],
    decision: ["agreed", "conditions", "more-time", "refused", "withdrawn"]
  };
  // Labels are functions, so they follow the chosen language.
  const LABELS = {
    answers: () => [["yes", t("Yes")], ["partly", t("Partly")], ["no", t("No")], ["unknown", t("Not sure")], ["na", t("Not applicable")]],
    who: () => [["met", t("Heard from")], ["planned", t("Planned")], ["missing", t("Not yet")]],
    milestone: () => [["planned", t("Planned")], ["done", t("Done")], ["moved", t("Postponed")], ["dropped", t("Dropped")]],
    cats: () => [["activities", t("Activities and materials")], ["people", t("Fair pay for local workers")], ["safeguarding", t("Safeguarding and complaints")], ["monitoring", t("Monitoring and sharing back")], ["maintenance", t("Upkeep after the project")], ["contingency", t("Contingency")], ["other", t("Other")]],
    likelihood: () => [[1, t("Unlikely")], [2, t("Possible")], [3, t("Likely")]],
    impact: () => [[1, t("Minor")], [2, t("Serious")], [3, t("Severe")]],
    riskStatus: () => [["open", t("Open")], ["watching", t("Being watched")], ["closed", t("Closed")]],
    process: () => [["listening", t("Listening session")], ["meeting", t("Community meeting")], ["representatives", t("Meeting with chosen representatives")], ["separate", t("Separate group session")], ["other", t("Other")]],
    decision: () => [["agreed", t("Agreed")], ["conditions", t("Agreed with conditions")], ["more-time", t("Asked for more time")], ["refused", t("Said no")], ["withdrawn", t("Withdrew consent")]]
  };
  const labelOf = (list, id) => (list().find((x) => x[0] === id) || [id, String(id)])[1];
  const generalMeasures = () => [
    ["The community’s own description of success", t("The community’s own description of success")],
    ["Complaints raised and resolved", t("Complaints raised and resolved")],
    ["Disputes reported and resolved", t("Disputes reported and resolved")],
    ["Who benefits, by group and gender", t("Who benefits, by group and gender")]
  ];
  const groupOptions = () => [["community", t("Whole community")], ...D.stakeholders.map((g) => [g.id, cStake(g)]), ["other", t("Another group")]];
  function groupLabel(c) {
    if (c.group === "community") return t("Whole community");
    if (c.group === "other") return c.groupOther || t("Another group");
    const g = D.stakeholders.find((x) => x.id === c.group);
    return g ? cStake(g) : c.group;
  }
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const isoOr = (v, dflt) => (typeof v === "string" && !Number.isNaN(Date.parse(v)) ? v : dflt);
  const allQuestions = () => D.readiness.flatMap((d) => d.questions);
  const emptyPlan = () => ({ project: "", place: "", bridge: "", review: "", answers: {}, who: {}, dividers: [], connectors: [], measures: [], customMeasures: [], notes: "",
    timeline: [], budget: { currency: "", lines: [] }, risks: [], consent: [], evolution: {}, impact: Impact.empty(), knowledge: Knowledge.empty(), systems: Systems.empty(), commons: Commons.empty(), forking: Forks.empty(), economics: Economics.empty(), hazard: Hazard.empty(), traditionalKnowledge: TK.empty(), seeds: Seeds.empty(), decisions: Decisions.empty(), localGlossary: LocalGlossary.empty(), stewardship: Stewardship.empty(), replication: Replication.empty(), scenario: Scenario.empty(), portfolio: Portfolio.empty(), provenance: Provenance.empty() });
  // Money: never negative, two decimals at most.
  const money = (v) => {
    const n = typeof v === "number" ? v : typeof v === "string" ? Number(v.trim().replace(",", ".")) : NaN;
    return Number.isFinite(n) && n >= 0 ? Math.min(Math.round(n * 100) / 100, LIMITS.amount) : 0;
  };
  const uniqueIds = (list) => { const seen = new Set(); for (const x of list) { while (seen.has(x.id)) x.id = rid(); seen.add(x.id); } return list; };

  // Accept only known fields, types and lengths from anything stored or imported.
  function sanitizePlan(raw, includeFork = true) {
    const p = emptyPlan();
    if (!raw || typeof raw !== "object") throw new Error("not a plan");
    const str = (v, max) => (typeof v === "string" ? v.slice(0, max) : "");
    const line = (v, max) => (typeof v === "string" ? v.replace(/[\r\n]+/g, " ").trim().slice(0, max) : "");
    const list = (arr, maxItems, maxLen) => (Array.isArray(arr) ? arr.filter((x) => typeof x === "string" && x.trim()).slice(0, maxItems).map((x) => x.trim().slice(0, maxLen)) : []);
    const date = (v) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");
    const pick = (v, allowed, dflt) => (allowed.includes(v) ? v : dflt);
    const rowId = (v) => (typeof v === "string" && /^[a-z0-9]{1,24}$/.test(v) ? v : rid());
    const rows = (v, max) => (Array.isArray(v) ? v.filter((x) => x && typeof x === "object").slice(0, max) : []);
    p.project = str(raw.project, LIMITS.short);
    p.place = str(raw.place, LIMITS.short);
    p.notes = str(raw.notes, LIMITS.notes);
    p.impact = Impact.clean(raw.impact);
    p.knowledge = Knowledge.clean(raw.knowledge);
    p.systems = Systems.clean(raw.systems);
    p.commons = Commons.clean(raw.commons);
    p.economics = Economics.clean(raw.economics);
    p.hazard = Hazard.clean(raw.hazard);
    p.traditionalKnowledge = TK.clean(raw.traditionalKnowledge);
    p.seeds = Seeds.clean(raw.seeds);
    p.decisions = Decisions.clean(raw.decisions);
    p.localGlossary = LocalGlossary.clean(raw.localGlossary);
    p.stewardship = Stewardship.clean(raw.stewardship);
    p.replication = Replication.clean(raw.replication);
    p.scenario = Scenario.clean(raw.scenario);
    p.portfolio = Portfolio.clean(raw.portfolio);
    p.provenance = Provenance.clean(raw.provenance);
    if (includeFork) p.forking = Forks.clean(raw.forking, x => sanitizePlan(x, false));
    p.bridge = bridgeById.has(raw.bridge) || raw.bridge === "other" ? raw.bridge : "";
    if (raw.evolution != null) {
      if (typeof raw.evolution !== "object" || Array.isArray(raw.evolution)) throw Error("Invalid lifecycle collection.");
      for (const id of [...bridgeById.keys(), "other"]) if (Object.hasOwn(raw.evolution, id)) p.evolution[id] = Evolution.clean(raw.evolution[id]);
      if (Object.values(p.evolution).reduce((n, e) => n + e.history.length, 0) > 200) throw Error("A plan may contain at most 200 lifecycle reviews.");
    }
    p.review = date(raw.review);
    for (const q of allQuestions()) if (raw.answers && IDS.answer.includes(raw.answers[q.id])) p.answers[q.id] = raw.answers[q.id];
    for (const g of D.stakeholders) if (raw.who && IDS.who.includes(raw.who[g.id])) p.who[g.id] = raw.who[g.id];
    p.dividers = list(raw.dividers, LIMITS.items, LIMITS.item);
    p.connectors = list(raw.connectors, LIMITS.items, LIMITS.item);
    p.measures = list(raw.measures, LIMITS.measures, LIMITS.item);
    p.customMeasures = list(raw.customMeasures, LIMITS.items, LIMITS.item);
    p.timeline = uniqueIds(rows(raw.timeline, LIMITS.timeline).map((m) => ({ id: rowId(m.id), date: date(m.date), title: line(m.title, LIMITS.title), status: pick(m.status, IDS.milestone, "planned") })).filter((m) => m.title));
    const b = raw.budget && typeof raw.budget === "object" ? raw.budget : {};
    p.budget = { currency: line(b.currency, LIMITS.currency), lines: uniqueIds(rows(b.lines, LIMITS.budget).map((l) => ({ id: rowId(l.id), item: line(l.item, LIMITS.title), category: pick(l.category, IDS.cat, "other"), amount: money(l.amount) })).filter((l) => l.item)) };
    p.risks = uniqueIds(rows(raw.risks, LIMITS.risks).map((r) => ({ id: rowId(r.id), text: line(r.text, LIMITS.long), likelihood: pick(Number(r.likelihood), [1, 2, 3], 2), impact: pick(Number(r.impact), [1, 2, 3], 2), owner: line(r.owner, LIMITS.owner), mitigation: str(r.mitigation, LIMITS.long).trim(), status: pick(r.status, IDS.riskStatus, "open") })).filter((r) => r.text));
    const groups = ["community", ...D.stakeholders.map((g) => g.id), "other"];
    p.consent = uniqueIds(rows(raw.consent, LIMITS.consent).map((c) => ({ id: rowId(c.id), date: date(c.date), group: pick(c.group, groups, "community"), groupOther: line(c.groupOther, LIMITS.owner), process: pick(c.process, IDS.process, "meeting"), decision: pick(c.decision, IDS.decision, "agreed"), conditions: str(c.conditions, LIMITS.long).trim(), nextCheck: date(c.nextCheck) })));
    return p;
  }
  function newEntry(plan) { plan.forking.id = plan.forking.id || rid(); return { id: rid(), created: new Date().toISOString(), updated: null, plan, history: [] }; }
  function sanitizeEntry(e) {
    if (!e || typeof e !== "object") return null;
    let plan;
    try { plan = sanitizePlan(e.plan); } catch (err) { return null; }
    if (!plan.forking.id) plan.forking.id = typeof e.id === 'string' && /^[a-z0-9]{1,24}$/.test(e.id) ? 'plan-' + e.id : rid();
    const history = [];
    for (const v of Array.isArray(e.history) ? e.history.slice(0, LIMITS.history) : []) {
      try { history.push({ at: isoOr(v && v.at, new Date().toISOString()), plan: sanitizePlan(v && v.plan) }); } catch (err) { /* skip a broken version */ }
    }
    return { id: typeof e.id === "string" && /^[a-z0-9]{1,24}$/.test(e.id) ? e.id : rid(), created: isoOr(e.created, new Date().toISOString()), updated: isoOr(e.updated, null), plan, history };
  }
  // Read a stored workspace of any version. Returns null if there is none.
  function workspaceFrom(saved) {
    if (saved && saved.schema === 3 && Array.isArray(saved.plans)) {
      const plans = uniqueIds(saved.plans.slice(0, LIMITS.plans).map(sanitizeEntry).filter(Boolean));
      const removed = (Array.isArray(saved.removed) ? saved.removed : []).filter((r) => r && typeof r.id === "string").slice(-LIMITS.removed).map((r) => ({ id: r.id, at: isoOr(r.at, "") }));
      return { schema: 3, activeId: plans.some((e) => e.id === saved.activeId) ? saved.activeId : plans[0] ? plans[0].id : null, plans, removed };
    }
    if (saved && saved.schema === 2 && saved.plan) {
      const e = sanitizeEntry({ created: saved.updated, updated: saved.updated, plan: saved.plan, history: saved.history });
      return e ? { schema: 3, activeId: e.id, plans: [e], removed: [], upgradedFrom: 2 } : null;
    }
    return null;
  }
  // Turn a backup file (version 1, 2 or 3) into clean plans.
  function plansFromBackup(x) {
    if (!x || typeof x !== "object") throw new Error(t("This file is not a Regenerative Peace Bridges backup."));
    if (x.schema === 1) {
      if (!["project", "place", "notes"].every((k) => typeof x[k] === "string")) throw new Error(t("This version 1 backup is missing fields."));
      return [sanitizePlan({ project: x.project, place: x.place, notes: x.notes })];
    }
    if (x.schema === 2 && x.plan) return [sanitizePlan(x.plan)];
    if (x.schema === 2 && x.workspace && x.workspace.plan) return [sanitizePlan(x.workspace.plan)];
    if (x.schema === 3 && x.plan) return [sanitizePlan(x.plan)];
    if (x.schema === 3 && x.workspace && Array.isArray(x.workspace.plans)) {
      const plans = [];
      for (const e of x.workspace.plans) plans.push(sanitizePlan(e && e.plan));
      return plans;
    }
    throw new Error(t("This file is not a Regenerative Peace Bridges backup."));
  }

  // ----- What the planner works out from a plan -----
  // The latest consent decision recorded for each group.
  function latestConsent(plan) {
    const latest = new Map();
    plan.consent.forEach((c, i) => {
      const key = c.group === "other" ? "other:" + norm(c.groupOther) : c.group;
      const prev = latest.get(key);
      if (!prev || (c.date || "") > (prev.c.date || "") || ((c.date || "") === (prev.c.date || "") && i > prev.i)) latest.set(key, { c, i });
    });
    return [...latest.values()].map((v) => v.c);
  }
  // Readiness: points per area, blockers and an overall verdict.
  function assess(plan) {
    const latest = latestConsent(plan);
    const consentBlocks = latest.filter((c) => c.decision === "refused" || c.decision === "withdrawn");
    const dims = D.readiness.map((dim) => {
      let got = 0, max = 0, answered = 0, blocked = dim.id === "consent" && consentBlocks.length > 0;
      for (const q of dim.questions) {
        const a = plan.answers[q.id];
        if (a) answered++;
        if (a === "na") continue;
        max += 2;
        if (a === "yes") got += 2;
        else if (a === "partly") got += 1;
        if (q.critical && a === "no") blocked = true;
      }
      const ratio = max ? got / max : 0;
      const level = blocked ? "gap" : ratio >= 0.85 ? 3 : ratio >= 0.5 ? 2 : ratio > 0 ? 1 : 0;
      return { id: dim.id, label: cDim(dim), got, max, answered, total: dim.questions.length, blocked, level };
    });
    const qs = D.readiness.flatMap((dim) => dim.questions.map((q) => ({ q, dim })));
    const asItem = ({ q, dim }) => ({ id: q.id, text: cQuestion(dim, q) });
    const answered = qs.filter(({ q }) => plan.answers[q.id]).length;
    const blockers = qs.filter(({ q }) => q.critical && plan.answers[q.id] === "no").map(asItem);
    const unsure = qs.filter(({ q }) => q.critical && !["yes", "no", "na"].includes(plan.answers[q.id])).map(asItem);
    const got = dims.reduce((a, d) => a + d.got, 0), max = dims.reduce((a, d) => a + d.max, 0);
    const overall = max ? got / max : 0;
    let verdict;
    if (!answered && !consentBlocks.length) verdict = { key: "start", title: t("Not started"), text: trx("Answer the readiness questions to see how strong this bridge is.") };
    else if (blockers.length || consentBlocks.length) verdict = { key: "pause", title: t("Pause: resolve blockers first"), text: blockers.length ? trx("At least one essential condition is not met. Work on it with the community before going any further.") : trx("A group has said no or withdrawn its consent. Respect that decision: don’t go ahead with them unless they choose to reopen the conversation.") };
    else if (unsure.length || overall < 0.6) verdict = { key: "groundwork", title: t("Groundwork needed"), text: trx("Some essentials are uncertain or incomplete. Find out more before any pilot.") };
    else if (overall < 0.85) verdict = { key: "almost", title: t("Almost ready"), text: trx("The essentials are in place. Close the remaining gaps before a pilot.") };
    else verdict = { key: "ready", title: t("Ready for a small, closely watched pilot"), text: trx("Start with the safer first step, keep listening, and be ready to stop.") };
    const workshop=Decisions.assess(plan.decisions,plan);
    if(workshop.started&&workshop.blocked)verdict={key:'pause',title:'Pause: workshop follow-up unresolved',text:workshop.title};
    const hazard=Hazard.assess(plan.hazard,plan);
    if(hazard.blocked&&(plan.bridge||['ready','almost'].includes(verdict.key)))verdict={key:'pause',title:'Pause: hazard prerequisite unresolved',text:hazard.reason};
    if(!hazard.blocked&&hazard.code==='desk'&&verdict.key==='ready')verdict={key:'ready',title:'Desk-only planning conditions recorded',text:hazard.reason};
    return { dims, answered, total: qs.length, blockers, unsure, consentBlocks, latest, overall, verdict, hazard, workshop };
  }
  // Budget totals and integrity checks.
  function budgetCalc(plan) {
    const by = Object.fromEntries(IDS.cat.map((c) => [c, 0]));
    let total = 0;
    for (const l of plan.budget.lines) { const a = money(l.amount); by[l.category] = (by[l.category] || 0) + a; total += a; }
    total = Math.round(total * 100) / 100;
    const share = (c) => (total ? by[c] / total : 0);
    const checks = total ? [
      { ok: by.people > 0, yes: t("Fair pay for local workers has a budget line."), no: t("Add a line for fair pay. Restoration work should never rely on unpaid labour.") },
      { ok: by.safeguarding > 0, yes: t("Safeguarding and complaints have a budget line."), no: t("Add a line for safeguarding and a safe complaint route. Both cost money to run well.") },
      { ok: by.monitoring > 0, yes: t("Monitoring and sharing back have a budget line."), no: t("Add a line for monitoring and for sharing results back with the community.") },
      { ok: by.maintenance > 0, yes: t("Upkeep after the project has a budget line."), no: t("Add a line for upkeep after the project, such as spare parts and repairs.") },
      { ok: share("contingency") >= 0.05, yes: t("Contingency is at least 5% of the total."), no: t("Set aside at least 5% for contingency. It is {pct} now.", { pct: fmtPct(share("contingency")) }) }
    ] : [];
    return { by, total, share, checks };
  }
  const riskScore = (r) => r.likelihood * r.impact;
  const riskLevel = (score) => (score >= 6 ? "high" : score >= 3 ? "medium" : "low");
  const riskLevelLabel = (lvl) => ({ high: t("High"), medium: t("Medium"), low: t("Low") })[lvl];
  const sortedTimeline = (plan) => [...plan.timeline].sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
  const sortedRisks = (plan) => [...plan.risks].sort((a, b) => (a.status === "closed") - (b.status === "closed") || riskScore(b) - riskScore(a));
  let measurePaths = null;
  // Chosen measures are stored in English and shown in the chosen language.
  function measureLabel(m) {
    if (!measurePaths) { measurePaths = new Map(); for (const b of D.bridges) b.measures.forEach((x, i) => { if (!measurePaths.has(x)) measurePaths.set(x, `bridges.${b.id}.measures.${i}`); }); }
    const path = measurePaths.get(m);
    if (path) return tc(path, m);
    const g = generalMeasures().find(([en]) => en === m);
    return g ? g[1] : m;
  }
  // Everything the brief needs, in the chosen language.
  function briefModel(plan) {
    const r = assess(plan);
    const groups = (state) => D.stakeholders.filter((g) => plan.who[g.id] === state).map(cStake);
    return {
      r, b: bridgeById.get(plan.bridge), groups,
      notYet: [...groups("missing"), ...D.stakeholders.filter((g) => !plan.who[g.id]).map(cStake)],
      measures: [...plan.measures.map(measureLabel), ...plan.customMeasures],
      timeline: sortedTimeline(plan), budget: budgetCalc(plan), risks: sortedRisks(plan)
    };
  }
  const noStop = (str) => String(str).trim().replace(/[.。؛;:!]+$/u, "");
  const riskText = (r) => t("{level}: {risk}. Likelihood: {likelihood}; impact: {impact}; watched by: {owner}; status: {status}.", {
    level: riskLevelLabel(riskLevel(riskScore(r))), risk: noStop(r.text), likelihood: labelOf(LABELS.likelihood, r.likelihood), impact: labelOf(LABELS.impact, r.impact),
    owner: r.owner || t("not set"), status: labelOf(LABELS.riskStatus, r.status) }) + (r.mitigation ? " " + t("To reduce it: {plan}", { plan: r.mitigation }) : "");
  const consentText = (c) => [
    kv(groupLabel(c), labelOf(LABELS.decision, c.decision)) + " (" + (c.date ? fmtDate(c.date) + ", " : "") + labelOf(LABELS.process, c.process) + ")",
    c.conditions ? t("Conditions or concerns:") + " " + noStop(c.conditions) : "",
    c.nextCheck ? t("Check again on {date}", { date: fmtDate(c.nextCheck) }) : ""
  ].filter(Boolean).join(". ") + ".";

  function briefMarkdown(plan) {
    const m = briefModel(plan);
    const { r, b } = m;
    const cur = plan.budget.currency;
    const lines = [
      `# ${t("Plan brief:")} ${plan.project || t("Untitled bridge plan")}`, "",
      `- ${kv(t("Bridge"), b ? cBridge(b, "name") : plan.bridge === "other" ? t("Another idea") : t("Not chosen yet"))}`,
      `- ${kv(t("General area"), plan.place || t("Not given"))}`,
      `- ${kv(t("Next community review"), plan.review ? fmtDate(plan.review) : t("Not set"))}`,
      `- ${t("Prepared: {date} with Regenerative Peace Bridges {version}", { date: fmtDate(today()), version: D.meta.version })}`, "",
      "## Workshop decision review", "", Decisions.summary(plan.decisions,plan), "",
      "## Traditional knowledge summaries approved for sharing", "", ...TK.lines(plan.traditionalKnowledge,plan.bridge).map(x=>"- "+x), "Knowledge-holder protocols govern reuse. No institutional grade or automatic scientific endorsement is assigned.", "",
      "## Hazard & Demining Prerequisite", "", r.hazard.title, r.hazard.reason, "Do not approach, touch, move or disturb suspected ordnance. This brief is not a clearance certificate; private authority references are excluded.", "",
      "## Bridge Evolution System", "", evolutionText(evolutionOf(plan, plan.bridge)), ...evolutionOf(plan, plan.bridge).history.map(e => "- " + e.at + " — " + evolutionText(e.from) + " → " + evolutionText(e) + ": " + e.note), "",
      "## Impact and learning", "", ...Impact.lines(plan.impact, plan.bridge).map(x => "- " + x), "Local observations; no causal attribution or combined impact score. See impact exports for sources, methods and full history.", "",
      "## Commons notices approved for sharing", "", ...Commons.lines(plan.commons, plan.bridge, true).map(x => "- " + x), "Community notices, not verified commitments. Recheck dates and availability.", "",
      "## Peace systems map approved for sharing", "", ...Systems.lines(plan.systems, plan.bridge, true).map(x => "- " + x), "Relationships are proposals or local accounts, not causal proof.", "",
      "## Community knowledge approved for sharing", "", ...Knowledge.lines(plan.knowledge, plan.bridge, true).map(x => "- " + x), "Community accounts retain their review status and limitations; they are not independently verified institutional findings.", "",
      `## ${t("Readiness")}`, "",
      t("Overall: {verdict} ({answered} of {total} questions answered)", { verdict: r.verdict.title, answered: fmtNum(r.answered), total: fmtNum(r.total) }), "",
      ...r.dims.map((d) => `- ${kv(d.label, d.blocked ? t("blocked") : t("{got} of {max} points", { got: fmtNum(d.got), max: fmtNum(d.max) }))}`), ""
    ];
    if (r.blockers.length) lines.push(`### ${t("Blockers to resolve first")}`, "", ...r.blockers.map((q) => `- ${q.text}`), "");
    if (r.consentBlocks.length) lines.push(`### ${t("Groups that said no or withdrew consent")}`, "", ...r.consentBlocks.map((c) => `- ${kv(groupLabel(c), labelOf(LABELS.decision, c.decision))}`), "");
    if (r.unsure.length) lines.push(`### ${t("Essentials still to confirm")}`, "", ...r.unsure.map((q) => `- ${q.text}`), "");
    lines.push(`## ${t("Who is in the room")}`, "",
      `- ${t("Heard from:")} ${m.groups("met").join("; ") || t("none yet")}`,
      `- ${t("Planned:")} ${m.groups("planned").join("; ") || t("none")}`,
      `- ${t("Not yet:")} ${m.notYet.join("; ") || t("none")}`, "");
    if (plan.dividers.length) lines.push(`## ${t("What divides people")}`, "", ...plan.dividers.map((x) => `- ${x}`), "");
    if (plan.connectors.length) lines.push(`## ${t("What connects people")}`, "", ...plan.connectors.map((x) => `- ${x}`), "");
    if (m.measures.length) lines.push(`## ${t("What to measure")}`, "", ...m.measures.map((x) => `- ${x}`), "");
    if (m.timeline.length) lines.push(`## ${t("Timeline")}`, "", ...m.timeline.map((x) => `- ${kv(x.date ? fmtDate(x.date) : t("No date"), x.title)} (${labelOf(LABELS.milestone, x.status)})`), "");
    if (m.budget.total) {
      lines.push(`## ${t("Budget")}`, "", kv(t("Total"), fmtMoney(m.budget.total, cur)), "",
        ...LABELS.cats().filter(([id]) => m.budget.by[id] > 0).map(([id, label]) => `- ${kv(label, fmtMoney(m.budget.by[id], cur))} (${fmtPct(m.budget.share(id))})`), "",
        `### ${t("Integrity checks")}`, "", ...m.budget.checks.map((c) => `- ${c.ok ? "[x]" : "[ ]"} ${c.ok ? c.yes : c.no}`), "");
    }
    if (m.risks.length) lines.push(`## ${t("Risks")}`, "", ...m.risks.map((x) => `- ${riskText(x)}`), "");
    if (plan.consent.length) lines.push(`## ${t("Consent log")}`, "", ...plan.consent.map((c) => `- ${consentText(c)}`), "");
    if (b) lines.push(`## ${t("Smaller, safer first step")}`, "", r.hazard.blocked ? "Resolve the Hazard & Demining Prerequisite before any field intervention. Desk planning does not authorize site access." : cBridge(b, "firstStep"), "");
    lines.push(...Forks.attribution(plan), "", ...Provenance.lines(plan.provenance,plan.bridge), "");
    if (plan.notes.trim()) lines.push(`## ${t("Notes and local validation questions")}`, "", plan.notes.trim(), "");
    lines.push("---", "",
      tr("Every bridge is a proposal until the community has been consulted, risks have been checked and results have been measured."),
      tr("Zero Harm and Anti-Coercion: do not use this plan to identify, locate, profile, pressure or target anyone. Aid is never conditional on participation."));
    return lines.join("\n");
  }

  part("planner", async () => {
    const mount = $("#plannerMount");
    const storeMode = await App.storeReady;
    let ws = { schema: 3, activeId: null, plans: [], removed: [] };
    let entry = null; // the plan being edited, with its saved versions
    let plan = null;  // shortcut to entry.plan
    let dirty = false;
    let tab = "readiness";
    const lastSaved = new Map(); // plan id -> the plan as last saved (JSON)
    const TAB_ID = rid();
    const channel = "BroadcastChannel" in window ? new BroadcastChannel("rpb-v3") : null;
    const later = (fn) => setTimeout(fn, 600);
    const now = () => new Date().toISOString();

    // ----- Load, upgrade from versions 1 and 2, and apply auto-delete -----
    try {
      const saved = await Store.get("workspace");
      const loaded = workspaceFrom(saved);
      if (loaded) {
        ws = loaded;
        if (loaded.upgradedFrom) {
          delete ws.upgradedFrom;
          await Store.set("workspace-v2-backup", saved); // the original, untouched
          await Store.set("workspace", clone(ws));
        }
      } else {
        let v1 = null, migrated = false;
        try { v1 = JSON.parse(localStorage.getItem("rpb_draft") || "null"); migrated = localStorage.getItem("rpb_v1_migrated") === "1"; } catch (e) { /* ignore */ }
        if (v1 && v1.schema === 1 && !migrated) {
          const e = newEntry(sanitizePlan({ project: v1.project, place: v1.place, notes: v1.notes }));
          e.updated = now();
          ws = { schema: 3, activeId: e.id, plans: [e], removed: [] };
          await Store.set("workspace", clone(ws));
          try { localStorage.setItem("rpb_v1_migrated", "1"); } catch (err) { /* ignore */ }
          later(() => toast(t("Your version 1 draft is now in the planner."), { ms: 7000 }));
        }
      }
      const ttl = Number(App.prefs().ttl) || 0;
      if (ttl > 0) {
        const cutoff = Date.now() - ttl * 86400000;
        const old = ws.plans.filter((e) => e.updated && Date.parse(e.updated) < cutoff);
        if (old.length) {
          ws.plans = ws.plans.filter((e) => !old.includes(e));
          ws.removed.push(...old.map((e) => ({ id: e.id, at: now() })));
          await Store.set("workspace", clone(ws));
          later(() => toast(tn("{n} plan was deleted automatically after {days} days without changes, as you asked.", "{n} plans were deleted automatically after {days} days without changes, as you asked.", old.length, { days: fmtNum(ttl) }), { sticky: true }));
        }
      }
    } catch (e) {
      ws = { schema: 3, activeId: null, plans: [], removed: [] };
    }
    function ensurePlan() {
      if (!ws.plans.length) { const e = newEntry(emptyPlan()); ws.plans.push(e); ws.activeId = e.id; }
      entry = ws.plans.find((e) => e.id === ws.activeId) || ws.plans[0];
      ws.activeId = entry.id;
      plan = entry.plan;
      for (const e of ws.plans) if (!lastSaved.has(e.id)) lastSaved.set(e.id, e.updated ? JSON.stringify(e.plan) : null);
    }
    ensurePlan();

    // ----- Rows: timeline, budget, risks and consent log share one editor -----
    const ROWS = {
      timeline: {
        list: () => plan.timeline, max: LIMITS.timeline,
        make: () => ({ id: rid(), date: "", title: "", status: "planned" }),
        name: (i) => t("Milestone {n}", { n: fmtNum(i + 1) }),
        empty: () => t("No milestones yet."),
        fields: () => [
          { f: "date", type: "date", label: t("Date") },
          { f: "title", type: "text", label: t("Milestone"), max: LIMITS.title, grow: true, placeholder: t("For example: listening session with women") },
          { f: "status", type: "select", label: t("Status"), options: LABELS.milestone() }]
      },
      budget: {
        list: () => plan.budget.lines, max: LIMITS.budget,
        make: () => ({ id: rid(), item: "", category: "activities", amount: 0 }),
        name: (i) => t("Budget line {n}", { n: fmtNum(i + 1) }),
        empty: () => t("No budget lines yet."),
        fields: () => [
          { f: "item", type: "text", label: t("What it pays for"), max: LIMITS.title, grow: true },
          { f: "category", type: "select", label: t("Category"), options: LABELS.cats() },
          { f: "amount", type: "number", label: t("Amount") }]
      },
      risks: {
        list: () => plan.risks, max: LIMITS.risks,
        make: () => ({ id: rid(), text: "", likelihood: 2, impact: 2, owner: "", mitigation: "", status: "open" }),
        name: (i) => t("Risk {n}", { n: fmtNum(i + 1) }),
        empty: () => t("No risks listed yet."),
        fields: () => [
          { f: "text", type: "text", label: t("What could go wrong"), max: LIMITS.long, wide: true },
          { f: "likelihood", type: "select", label: t("Likelihood"), options: LABELS.likelihood() },
          { f: "impact", type: "select", label: t("Impact"), options: LABELS.impact() },
          { f: "status", type: "select", label: t("Status"), options: LABELS.riskStatus() },
          { f: "owner", type: "text", label: t("Who watches it"), max: LIMITS.owner, hint: trx("A role, not a person’s name.") },
          { f: "mitigation", type: "textarea", label: t("What will reduce it"), max: LIMITS.long, wide: true }]
      },
      consent: {
        list: () => plan.consent, max: LIMITS.consent,
        make: () => ({ id: rid(), date: today(), group: "community", groupOther: "", process: "meeting", decision: "agreed", conditions: "", nextCheck: "" }),
        name: (i) => t("Entry {n}", { n: fmtNum(i + 1) }),
        empty: () => t("No consent decisions recorded yet."),
        fields: () => [
          { f: "date", type: "date", label: t("Date") },
          { f: "group", type: "select", label: t("Group"), options: groupOptions() },
          { f: "groupOther", type: "text", label: t("Name of the group"), max: LIMITS.owner, showIf: (x) => x.group === "other", hint: trx("A group, never a named person.") },
          { f: "process", type: "select", label: t("How it was decided"), options: LABELS.process() },
          { f: "decision", type: "select", label: t("Decision"), options: LABELS.decision() },
          { f: "nextCheck", type: "date", label: t("Check again on") },
          { f: "conditions", type: "textarea", label: t("Conditions or concerns"), max: LIMITS.long, wide: true }]
      }
    };
    function rowEl(coll, item, index, fields) {
      const def = ROWS[coll];
      const idp = `${coll}-${item.id}`;
      const controls = fields.map((fd) => {
        const id = `${idp}-${fd.f}`;
        const common = { id, "data-row": coll, "data-id": item.id, "data-field": fd.f, "aria-describedby": fd.hint ? id + "-hint" : null };
        let ctl;
        if (fd.type === "select") { ctl = h("select", common, fd.options.map(([v, label]) => h("option", { value: v }, label))); ctl.value = String(item[fd.f]); }
        else if (fd.type === "textarea") { ctl = h("textarea", Object.assign({ rows: 2, maxlength: fd.max, dir: "auto" }, common)); ctl.value = item[fd.f] || ""; }
        else if (fd.type === "number") { ctl = h("input", Object.assign({ type: "number", min: "0", step: "any", inputmode: "decimal" }, common)); ctl.value = item[fd.f] ? String(item[fd.f]) : ""; }
        else if (fd.type === "date") { ctl = h("input", Object.assign({ type: "date" }, common)); ctl.value = item[fd.f] || ""; }
        else { ctl = h("input", Object.assign({ type: "text", maxlength: fd.max, autocomplete: "off", dir: "auto", placeholder: fd.placeholder || null }, common)); ctl.value = item[fd.f] || ""; }
        return h("div", { class: "field rows__field" + (fd.grow ? " rows__field--grow" : "") + (fd.wide ? " rows__field--wide" : ""), "data-show": fd.showIf ? fd.f : null, hidden: fd.showIf ? !fd.showIf(item) : null },
          h("label", { for: id }, fd.label), ctl, fd.hint ? L("p", { class: "field__hint", id: id + "-hint" }, fd.hint) : null);
      });
      const level = coll === "risks" ? riskLevel(riskScore(item)) : null;
      return h("li", { class: "row row--" + coll, "data-id": item.id },
        h("div", { class: "row__head" },
          h("span", { class: "row__name" }, def.name(index)),
          level ? h("span", { class: "risk-level risk-level--" + level, id: idp + "-level" }, riskLevelLabel(level)) : null,
          h("button", { type: "button", class: "btn btn--quiet btn--small row__remove", "data-action": "row-remove", "data-row": coll, "data-id": item.id, "aria-label": t("Remove {item}", { item: def.name(index) }) }, t("Remove"))),
        h("div", { class: "row__grid row__grid--" + coll }, controls));
    }
    function drawRows(coll) {
      const ol = $("#rows-" + coll, mount);
      if (!ol) return;
      const def = ROWS[coll];
      const fields = def.fields();
      const list = coll === "timeline" ? sortedTimeline(plan) : def.list();
      ol.replaceChildren(...list.map((item, i) => rowEl(coll, item, i, fields)));
      if (!list.length) ol.append(h("li", { class: "rows__empty" }, def.empty()));
    }
    function addRow(coll, item) {
      const def = ROWS[coll];
      if (def.list().length >= def.max) { toast(t("This list is full. Remove an item first.")); return null; }
      const x = item || def.make();
      def.list().push(x);
      drawRows(coll);
      changed();
      return x;
    }

    // ----- Build the form (again after the language changes) -----
    const el = {};
    let provenanceBridge;
    const portfolioUI=window.RPB_PORTFOLIO_UI({h,getPlan:()=>plan,changed,download,safetyGate:(p,go)=>App.safetyGate(p,go)});
    const scenarioUI=window.RPB_SCENARIO_UI({h,getPlan:()=>plan,changed,download,safetyGate:(p,go)=>App.safetyGate(p,go)});
    const replicationUI=window.RPB_REPLICATION_UI({h,getPlan:()=>plan,changed,download,safetyGate:(p,go)=>App.safetyGate(p,go)});
    const stewardshipUI=window.RPB_STEWARDSHIP_UI({h,getPlan:()=>plan,changed,download,safetyGate:(p,go)=>App.safetyGate(p,go),showTab:id=>setTab(id)});
    const hazardUI=window.RPB_HAZARD_UI({h,getPlan:()=>plan,changed});
    const decisionsUI=window.RPB_DECISIONS_UI({h,getPlan:()=>plan,changed,onOpen:id=>App.showPlanTab(id),onRisk:q=>{
      const text='[Workshop: '+q.id+'] '+q.text;
      if(plan.risks.some(r=>r.text===text))return;
      if(plan.risks.length>=LIMITS.risks)throw Error('Risk register is full; preserve existing entries.');
      plan.risks.push({id:rid(),text,likelihood:2,impact:2,owner:'',mitigation:q.action,status:'open'});drawRows('risks');changed();
    }});
    const glossaryUI=window.RPB_LOCAL_GLOSSARY_UI({h,getPlan:()=>plan,changed,download,confirmDialog,safetyGate:(p,go)=>App.safetyGate(p,go),onTerm:term=>App.gotoTerm(term)});
    const drawLocalGlossary=()=>{const host=$("#localGlossaryMount");const pick=h("select",{id:"lgPlan"},ws.plans.map(e=>h("option",{value:e.id},e.plan.project||"Untitled plan")));pick.value=entry.id;pick.onchange=async()=>{await flush();switchTo(pick.value);await saveStructure();};const body=h("div");host.replaceChildren(h("label",{for:"lgPlan"},"Active local plan"),pick,body);glossaryUI.render(body);};
    const drawDecisions=()=>decisionsUI.render($('#plDecisions',mount));
    const drawHazard=()=>hazardUI.render($('#plHazard',mount));
    const economicsUI=window.RPB_ECONOMICS_UI({h,getPlan:()=>plan,changed,download,safetyGate:(p,go)=>App.safetyGate(p,go)});
    const transferUI=window.RPB_TRANSFER_UI({h,download,
      getSnapshot:async(scope,includeVault)=>{
        const snapshot={schema:3,kind:'offline-transfer',app:'regenerative-peace-bridges',version:D.meta.version,exported:now(),workspace:clone({schema:3,activeId:entry.id,plans:scope==='all'?ws.plans:[entry],removed:[]})};
        if(includeVault)snapshot.knowledgeVault=window.RPB_VAULT.clean(await Store.get('knowledge-vault'));
        return snapshot;
      },
      validateSnapshot:raw=>{
        if(raw?.workspace?.schema!==3||!Array.isArray(raw.workspace.plans)||!raw.workspace.plans.length||raw.workspace.plans.length>LIMITS.plans)throw Error('Transfer needs 1–20 plans in workspace schema 3.');
        const strict=p=>{const normalized={...p};if(!Object.hasOwn(p,"hazard"))normalized.hazard=Hazard.empty();if(!Object.hasOwn(p,"traditionalKnowledge"))normalized.traditionalKnowledge=TK.empty();if(!Object.hasOwn(p,"seeds"))normalized.seeds=Seeds.empty();if(!Object.hasOwn(p,"decisions"))normalized.decisions=Decisions.empty();if(!Object.hasOwn(p,"localGlossary"))normalized.localGlossary=LocalGlossary.empty();const cleaned=sanitizePlan(normalized);if(window.RPB_TRANSFER.canonical(normalized)!==window.RPB_TRANSFER.canonical(cleaned))throw Error('A plan contains unknown, truncated or non-canonical fields. Restore with a compatible app; no data was imported.');return cleaned;};
        const entries=raw.workspace.plans.map(e=>{if(!e||!Array.isArray(e.history)||e.history.length>LIMITS.history||!e.created||!Number.isFinite(Date.parse(e.created)))throw Error('Invalid plan history or creation date.');return {plan:strict(e.plan),created:e.created,history:e.history.map(v=>{if(!v.at||!Number.isFinite(Date.parse(v.at)))throw Error('Invalid saved-version date.');return {at:v.at,plan:strict(v.plan)};})};});
        const vault=raw.knowledgeVault?window.RPB_VAULT.clean(raw.knowledgeVault):null;if(vault&&window.RPB_TRANSFER.canonical(vault)!==window.RPB_TRANSFER.canonical(raw.knowledgeVault))throw Error('Vault contains unknown or non-canonical fields. Nothing imported.');
        return {entries,vault};
      },
      restore:async(incoming,includeVault)=>{
        const withVault=!!(includeVault&&incoming.vault);
        if(withVault&&Store.mode!=='indexeddb')throw Error('Combined restore requires IndexedDB. Restore plans alone and extract the included vault for its separate importer.');
        const ok=await confirmDialog({title:'Restore offline transfer?',text:'Add '+incoming.entries.length+' plan(s), including saved versions, as NEW local copies.'+(withVault?' Merge included vault records; conflicting IDs will abort the entire restore.':''),ok:'Restore new copies',danger:false});
        if(!ok)throw Error('Restore cancelled. No imported data was added.');
        await flush();if(dirty)throw Error('Current plan could not be saved. Resolve storage before importing.');
        const restoreSource=plan,restoreSnapshot=JSON.stringify(plan);
        const added=incoming.entries.map(e=>({...newEntry(clone(e.plan)),created:e.created,updated:now(),history:clone(e.history)}));
        const result=await Store.transferCommit((stored,vaultRaw)=>{
          if(plan!==restoreSource||dirty||JSON.stringify(plan)!==restoreSnapshot)throw Error('The current plan changed during restore. Nothing imported; inspect and retry.');
          const target=workspaceFrom(stored)||{schema:3,plans:[],activeId:null,removed:[]};
          if(target.plans.length+added.length>LIMITS.plans)throw Error('Not enough plan capacity. Nothing imported; export/delete unneeded plans first.');
          let vault;
          if(withVault){const merged=window.RPB_VAULT.merge(vaultRaw,incoming.vault);if(merged.conflicts)throw Error('Conflicting vault IDs. Nothing imported; existing records were preserved.');vault=merged.vault;}
          target.plans.push(...added);target.activeId=added[0].id;return {workspace:target,vault};
        },withVault);
        ws=result.workspace;lastSaved.clear();dirty=false;switchTo(added[0].id);updateSwitcher();
        if(withVault)await App.vault?.reload();
        if(channel)channel.postMessage({type:'saved',tab:TAB_ID,at:now()});App.refreshInventory?.();
      },
      safetyGate:(snapshot,go)=>App.safetyGate([...(snapshot.workspace.plans||[]).flatMap(e=>[{name:e.plan.project||'Plan',plan:e.plan},...e.history.map(v=>({name:'Saved version',plan:v.plan}))]),...(snapshot.knowledgeVault?[{name:'Private Knowledge Vault',plan:{...emptyPlan(),vaultText:JSON.stringify(snapshot.knowledgeVault)}}]:[])],go)
    });
    const drawTransfer=()=>transferUI.render($('#plTransfer',mount));
    const drawEconomics=()=>economicsUI.render($("#plEconomics",mount));
    const drawStewardship=()=>stewardshipUI.render($("#plStewardship",mount));
    const drawReplication=()=>replicationUI.render($("#plReplication",mount));
    const drawScenario=()=>scenarioUI.render($("#plScenario",mount));
    const drawPortfolio=()=>portfolioUI.render($("#plPortfolio",mount));
    const provenanceUI = window.RPB_PROVENANCE_UI({h,getPlan:()=>plan,changed,download,csvOf,safetyGate:(p,go)=>App.safetyGate(p,go)});
    const drawProvenance=()=>{provenanceBridge=plan.bridge;provenanceUI.render($("#plProvenance",mount));};
    const impactUI = window.RPB_IMPACT_UI({ h, s, getPlan: () => plan, changed, download, csvOf,
      safetyGate: (p, go) => App.safetyGate(p, go), confirmDialog,
      lifecycle: (text) => { setTab("readiness"); drawEvolution(); const note = $("#evo-note"); if (note) { note.value = clip("Impact review summary:\n" + text, 1000); reveal(el.evolution, note); } },
      schedule: title => App.addMilestone(title)
    });
    const drawImpact = () => impactUI.render(el.impact);
    const knowledgeUI = window.RPB_KNOWLEDGE_UI({ h, getPlan: () => plan, changed, download, csvOf,
      safetyGate: (p, go) => App.safetyGate(p, go), confirmDialog,
      onMetric: id => { setTab("impact"); impactUI.selectMetric(id, el.impact); reveal(el.impact); },
      onSource: id => App.gotoDoc(id),
      onLifecycle: text => { setTab("readiness"); drawEvolution(); const note = $("#evo-note"); if (note) { note.value = clip("Community knowledge review:\n" + text, 1000); reveal(el.evolution, note); } },
      onLearning: (finding, action) => { setTab("impact"); drawImpact(); const box = document.getElementById("impactFinding"); if (box) { box.value = clip(finding, 1000); document.getElementById("impactAction").value = clip(action, 1000); reveal(el.impact, box); } }
    });
    const tkUI=window.RPB_TK_UI({h,getPlan:()=>plan,changed,download,safetyGate:(p,go)=>App.safetyGate(p,go),confirmDialog,onSource:id=>App.gotoDoc(id),onPractice:id=>App.gotoPractice(id),onBridge:id=>App.openBridge(id)});
    const seedsUI=window.RPB_SEEDS_UI({h,getPlan:()=>plan,changed,onHazard:()=>App.showPlanTab('hazard'),onPortfolio:()=>App.showPlanTab('portfolio'),onKnowledge:()=>App.showPlanTab('tk')});
    const drawKnowledge = () => {knowledgeUI.render(el.knowledge);const seedBox=h('section',{id:'plSeeds',lang:'en','aria-label':'Seed sovereignty and supply tracking'});el.knowledge.append(seedBox);seedsUI.render(seedBox);const box=h('section',{id:'plTK',lang:'en','aria-label':'Indigenous and Traditional Knowledge'});el.knowledge.append(box);tkUI.render(box);};
    App.showTKSource=id=>{setTab('knowledge');tkUI.filterSource(id,$('#plTK',mount));reveal($('#plTK',mount));};
    App.fillTKReferences=()=>{const records=TK.clean(plan.traditionalKnowledge).records.filter(r=>r.bridgeId===plan.bridge&&!r.withdrawal&&!TK.current(r).withdrawn);$$('[data-tk-source]').forEach(box=>{const n=records.filter(r=>TK.current(r).links.some(l=>l.kind==='source'&&l.id===box.dataset.tkSource)).length;box.replaceChildren(...(n?[h('button',{type:'button',class:'linkbtn',onclick:()=>App.showTKSource(box.dataset.tkSource)},n+' linked TK account(s) in this local bridge plan — view relationships')]:[]));});};
    App.tkCountFor=id=>(plan.traditionalKnowledge?.records||[]).filter(r=>r.bridgeId===id&&!r.withdrawal&&!TK.current(r).withdrawn).length;
    const systemsUI = window.RPB_SYSTEMS_UI({h, getPlan: () => plan, changed, download, csvOf, confirmDialog,
      safetyGate: (p, go) => App.safetyGate(p, go),
      onMetric: id => { setTab("impact"); impactUI.selectMetric(id, el.impact); reveal(el.impact); },
      onKnowledge: () => { setTab("knowledge"); drawKnowledge(); drawSystems(); drawCommons(); reveal(el.knowledge); },
      onSource: id => App.gotoDoc(id)
    });
    const drawSystems = () => {
      const planPick = h("select", {id:"webSystemPlan"}, ws.plans.map(e => h("option", {value:e.id}, e.plan.project || "Untitled plan")));
      planPick.value = entry.id;
      planPick.addEventListener("change", async () => { const id=planPick.value; await flush(); switchTo(id); await saveStructure(); });
      const bridgePick = h("select", {id:"webSystemBridge"}, h("option", {value:""}, "Choose a bridge"), D.bridges.map(b => h("option", {value:b.id}, cBridge(b,"short"))), h("option", {value:"other"}, "Another idea"));
      bridgePick.value = plan.bridge;
      bridgePick.addEventListener("change", () => { el.bridge.value=bridgePick.value; bindEdit(el.bridge); });
      $("#webSystemsContext").replaceChildren(h("p", null, "System relationships are saved with the selected local plan and bridge. This selection is shared with the planner."),
        h("div", {class:"grid-2"}, h("div", {class:"field"}, h("label", {for:"webSystemPlan"}, "Local plan"), planPick), h("div", {class:"field"}, h("label", {for:"webSystemBridge"}, "Bridge"), bridgePick)));
      systemsUI.render(el.systems);
      $("#webViews").hidden=false;
    };
    const commonsUI = window.RPB_COMMONS_UI({h, getPlan: () => plan, changed, download, csvOf, confirmDialog, safetyGate: (p, go) => App.safetyGate(p, go)});
    const drawCommons = () => {
      const pick=h("select", {id: "commonsPlan"}, ws.plans.map(e => h("option", {value:e.id}, e.plan.project || "Untitled plan")));
      pick.value=entry.id;
      pick.addEventListener("change", async () => {const id=pick.value;await flush();switchTo(id);await saveStructure();});
      $("#commonsContext").replaceChildren(h("div", {class:"field"}, h("label", {for:"commonsPlan"}, "Local plan / commons board"), pick));
      commonsUI.render($("#commonsMount"));
    };
    App.openCommons = id => {const card=id ? commonsUI.showListing(id, $("#commonsMount")) : null;reveal(card || $("#commons"), card);};
    function build() {
      const field = (id, label, control, hintPair) => {
        if (hintPair) control.setAttribute("aria-describedby", id + "-hint");
        return h("div", { class: "field" }, h("label", { for: id }, label), control, hintPair ? L("p", { class: "field__hint", id: id + "-hint" }, hintPair) : null);
      };
      const step = (id, num, title, ...kids) => h("fieldset", { class: "pstep", id }, h("legend", null, h("span", { class: "pstep__num" }, fmtNum(num)), title), ...kids);
      const panelBox = (title, ...kids) => h("div", { class: "pstep pstep--panel" }, h("h3", { class: "pstep__title" }, title), ...kids);
      const small = (id, action, label, extra) => h("button", Object.assign({ type: "button", class: "btn btn--quiet btn--small", id, "data-action": action }, extra || {}), label);

      // Which plan, and new or duplicate.
      el.switcher = h("select", { id: "plSwitch" });
      const plans = h("div", { class: "plans" },
        h("div", { class: "field plans__pick" }, h("label", { for: "plSwitch" }, t("Plan")), el.switcher),
        h("div", { class: "plans__actions" }, small("plNew", "plan-new", t("New plan")), small("plDuplicate", "plan-duplicate", t("Duplicate"))));

      // 1 to 6: the readiness steps.
      el.project = h("input", { type: "text", id: "plProject", "data-bind": "project", maxlength: LIMITS.short, autocomplete: "off", dir: "auto", placeholder: t("For example: Community-led water restoration") });
      el.bridge = h("select", { id: "plBridge", "data-bind": "bridge" }, h("option", { value: "" }, t("Choose a bridge (optional)")), D.bridges.map((b) => h("option", { value: b.id }, cBridge(b, "short"))), h("option", { value: "other" }, t("Another idea")));
      el.place = h("input", { type: "text", id: "plPlace", "data-bind": "place", maxlength: LIMITS.short, autocomplete: "off", dir: "auto", placeholder: t("A district, province or region"), "aria-describedby": "plPlace-warn" });
      el.review = h("input", { type: "date", id: "plReview", "data-bind": "review" });
      el.notes = h("textarea", { id: "plNotes", "data-bind": "notes", rows: 7, maxlength: LIMITS.notes, dir: "auto", placeholder: t("What did people say? What still needs checking locally?") });
      const basics = step("pl-basics", 1, t("The basics"),
        h("div", { class: "grid-2" },
          field("plProject", t("Plan name"), el.project),
          field("plBridge", t("Bridge"), el.bridge),
          h("div", { class: "field" }, h("label", { for: "plPlace" }, t("General area (optional)")), el.place,
            L("p", { class: "warnline", id: "plPlace-warn" }, trx("Use a district, province or region. Never enter coordinates, addresses, or the locations of homes, schools, shelters or water points."))),
          field("plReview", t("Next community review"), el.review, tx("When will the community look at this plan again?"))));
      el.evolution = h("section", { id: "plEvolution", class: "pstep", lang: "en", "aria-label": "Bridge Evolution System" });
      el.impact = h("section", { id: "plImpact", class: "pstep impact", lang: "en", "aria-label": "Impact Metrics Layer" });
      el.systems = h("section", {id: "plSystems", class:"pstep systems", lang:"en", "aria-label":"Peace Systems Mapping"});
      $("#webSystemsBody").replaceChildren(el.systems);
      el.knowledge = h("section", { id: "plKnowledge", class: "pstep knowledge", lang: "en", "aria-label": "Community Knowledge Capture" });
      const readiness = step("pl-readiness", 2, t("Readiness check"),
        L("p", { class: "pstep__intro" }, trx("Answer honestly, ideally together with community representatives. Essential questions must be answered “Yes” or “Not applicable” before any pilot.")));
      const answers = LABELS.answers();
      for (const dim of D.readiness) {
        const box = h("div", { class: "dim", id: "dim-" + dim.id }, h("h3", { class: "dim__title" }, L("span", null, tcx("readiness." + dim.id + ".label", dim.label)), h("span", { class: "dim__score", id: "dimScore-" + dim.id })));
        for (const q of dim.questions) {
          const pr = practiceById.get(q.practice);
          box.append(h("fieldset", { class: "q", id: "q-" + q.id },
            h("legend", null, q.critical ? h("span", { class: "q__flag" }, t("Essential")) : null, L("span", null, tcx("readiness." + dim.id + "." + q.id, q.text))),
            h("div", { class: "pills" }, answers.map(([v, label]) => h("label", { class: "pill" }, h("input", { type: "radio", name: "ans-" + q.id, value: v }), h("span", null, label)))),
            pr ? h("p", { class: "q__help" }, t("Help with this:"), " ", h("a", { href: "#practice-" + pr.id, "data-practice": pr.id }, cPractice(pr, "name"))) : null));
        }
        readiness.append(box);
      }
      const whoLabels = LABELS.who();
      const who = step("pl-who", 3, t("Who is in the room?"),
        L("p", { class: "pstep__intro" }, trx("Record groups, never named individuals. Hearing from children needs child-safe methods, trained facilitators and caregivers’ consent.")),
        h("div", { class: "who" }, D.stakeholders.map((g) => h("div", { class: "who__row" },
          L("span", { id: "who-l-" + g.id }, tcx("stakeholders." + g.id, g.label)),
          h("div", { class: "pills", role: "radiogroup", "aria-labelledby": "who-l-" + g.id }, whoLabels.map(([v, label]) => h("label", { class: "pill" }, h("input", { type: "radio", name: "who-" + g.id, value: v }), h("span", null, label))))))));
      const listEditor = (key, label, hintPair, placeholder) => h("div", { class: "listedit" },
        h("label", { for: "le-" + key, class: "field__label" }, label),
        hintPair ? L("p", { class: "field__hint" }, hintPair) : null,
        h("ul", { id: "list-" + key }),
        h("div", { class: "listedit__add" },
          h("input", { type: "text", maxlength: LIMITS.item, id: "le-" + key, "data-list": key, placeholder, autocomplete: "off", dir: "auto" }),
          h("button", { type: "button", class: "btn btn--quiet btn--small", "data-action": "list-add", "data-key": key }, t("Add"))));
      const dnh = step("pl-dnh", 4, t("Dividers and connectors"),
        h("p", { class: "pstep__intro" }, L("span", null, trx("From the Do No Harm method. Your project should weaken what divides and strengthen what connects.")), " ", h("a", { href: "#practice-do-no-harm", "data-practice": "do-no-harm" }, t("How to do this"))),
        h("div", { class: "grid-2" },
          listEditor("dividers", t("What divides people here?"), trx("Issues and tensions, not people. For example: disputes over a well in the dry season."), t("Add something that divides")),
          listEditor("connectors", t("What connects people here?"), tx("Shared places, habits or values. For example: the weekly market both groups use."), t("Add something that connects"))));
      const measures = step("pl-measures", 5, t("What to measure"),
        L("p", { class: "pstep__intro" }, trx("Choose a few measures and take a baseline before work starts. Report only combined figures that can’t identify anyone.")),
        h("div", { class: "checks", id: "plMeasures" }),
        listEditor("customMeasures", t("Your own measures"), tx("Add what the community said matters."), t("Add a measure")));
      const notes = step("pl-notes", 6, t("Notes and local validation questions"),
        field("plNotes", t("Notes"), el.notes, trx("Write about issues, not individuals. Don’t record names, phone numbers or exact locations.")));

      // The other tabs.
      const rowsBlock = (coll, actions) => [h("ol", { class: "rows", id: "rows-" + coll }), h("div", { class: "rows__actions" }, actions)];
      const timeline = panelBox(t("Timeline"),
        L("p", { class: "pstep__intro" }, trx("Plan in small steps, with time to listen and to stop. Put the community’s review dates in first.")),
        h("p", { class: "note", id: "tlReview" }),
        ...rowsBlock("timeline", [
          small("tlAdd", "row-add", t("Add a milestone"), { "data-row": "timeline" }),
          small("tlSeed", "seed-timeline", t("Add this bridge’s steps")),
          small("tlCsv", "csv", t("Download as CSV"), { "data-row": "timeline" })]));
      el.currency = h("input", { type: "text", id: "budgetCurrency", "data-bind": "currency", maxlength: LIMITS.currency, autocomplete: "off", dir: "auto", placeholder: t("For example: USD") });
      const budget = panelBox(t("Budget"),
        h("p", { class: "pstep__intro" }, t("List what the work will cost, including the parts that keep people safe. Amounts are only for your planning and stay on this device.")),
        h("div", { class: "field field--short" }, h("label", { for: "budgetCurrency" }, t("Currency")), el.currency),
        ...rowsBlock("budget", [
          small("budgetAdd", "row-add", t("Add a budget line"), { "data-row": "budget" }),
          small("budgetSeed", "seed-budget", t("Add the essential lines")),
          small("budgetCsv", "csv", t("Download as CSV"), { "data-row": "budget" })]),
        h("div", { class: "budget__summary", id: "budgetSummary", "aria-live": "polite" }));
      const risks = panelBox(t("Risks"),
        h("p", { class: "pstep__intro" }, t("List what could go wrong, how likely it is and how serious it would be, who keeps an eye on it, and what will reduce it.")),
        h("section",{id:"plDecisions",lang:"en","aria-label":"Workshop decision tree"}),
        h("div", { class: "matrix-wrap", id: "riskMatrix" }),
        h("div",{id:"riskMatrixSelection",lang:"en","aria-live":"polite"}),
        ...rowsBlock("risks", [
          small("riskAdd", "row-add", t("Add a risk"), { "data-row": "risks" }),
          small("riskSeed", "seed-risks", t("Add this bridge’s risks")),
          small("riskCsv", "csv", t("Download as CSV"), { "data-row": "risks" })]));
      const consent = panelBox(t("Consent log"),
        L("p", { class: "pstep__intro" }, trx("Record each group’s decision, made through its own process. Consent can be given with conditions, delayed or withdrawn at any time. A “no” or a withdrawal pauses the plan for that group, and help never depends on agreeing.")),
        h("div", { id: "consentSummary" }),
        ...rowsBlock("consent", [
          small("consentAdd", "row-add", t("Add an entry"), { "data-row": "consent" }),
          small("consentCsv", "csv", t("Download as CSV"), { "data-row": "consent" })]));

      // Tabs (arrow keys move between them, following the reading direction).
      const TABS = [["readiness", t("Readiness")], ["timeline", t("Timeline")], ["budget", t("Budget")], ["risks", t("Risks")], ["consent", t("Consent log")], ["impact", "Impact"], ["knowledge", "Community knowledge"]];
      const tablist = h("div", { class: "tabs", role: "tablist", "aria-label": t("Parts of the plan") },
        TABS.map(([id, label]) => h("button", { type: "button", role: "tab", class: "tabs__tab", id: "tab-" + id, lang: ["impact", "knowledge"].includes(id) ? "en" : null, "aria-controls": "panel-" + id, "aria-selected": id === tab ? "true" : "false", tabindex: id === tab ? "0" : "-1", "data-tab": id },
          label, h("span", { class: "tabs__count", id: "tabCount-" + id, "aria-hidden": "true" }))));
      const panel = (id, ...kids) => h("div", { class: "tabpanel", role: "tabpanel", id: "panel-" + id, "aria-labelledby": "tab-" + id, tabindex: "0", hidden: id !== tab }, ...kids);

      // Side panel: bridge strength picture, verdict, gaps and actions.
      const rtl = I18N.dir === "rtl";
      const strengthSvg = s("svg", { viewBox: "0 0 300 128", role: "img", "aria-labelledby": "strengthTitle", class: "strength__svg" },
        s("title", { id: "strengthTitle" }, t("Bridge strength: one plank for each readiness area")),
        s("rect", { x: 0, y: 84, width: 300, height: 44, class: "water" }),
        s("path", { d: "M0 128V62h38l14 8 6 58Z", class: "bank" }),
        s("path", { d: "M300 128V62h-38l-14 8-6 58Z", class: "bank" }),
        s("path", { d: "M52 68Q150 0 248 68", class: "cable" }));
      const plankW = 196 / D.readiness.length;
      el.planks = D.readiness.map((dim, i) => {
        const x = 52 + (rtl ? D.readiness.length - 1 - i : i) * plankW; // planks run in reading order
        const cx = x + plankW / 2;
        const u = (cx - 150) / 98;
        strengthSvg.append(s("path", { d: `M${cx} ${68 - 68 * (1 - u * u) * 0.5 + 2}V${66}`, class: "cable" }));
        const r = s("rect", { x: x + 1, y: 66, width: plankW - 2, height: 9, rx: 2, class: "plank plank--0" }, s("title", null, cDim(dim)));
        strengthSvg.append(r);
        return r;
      });
      el.strengthList = h("ul", { class: "gaps", id: "strengthList" });
      el.verdict = h("div", { class: "verdict", id: "verdict", "aria-live": "polite" });
      el.gaps = h("div", { id: "gaps" });
      el.savestate = h("p", { class: "savestate", id: "saveState", role: "status" });
      const actions = h("div", { class: "side-actions" },
        h("button", { type: "button", class: "btn btn--dawn btn--wide", id: "plSave" }, t("Save now")),
        h("button", { type: "button", class: "btn btn--quiet", id: "plExportJson" }, t("Export backup")),
        h("button", { type: "button", class: "btn btn--quiet", id: "plImportBtn" }, t("Import backup")),
        h("button", { type: "button", class: "btn btn--quiet", id: "plExportMd" }, t("Export brief")),
        h("button", { type: "button", class: "btn btn--quiet", id: "plCopy" }, t("Copy brief")),
        canPrint() ? h("button", { type: "button", class: "btn btn--quiet", id: "plPrint" }, t("Print brief")) : null,
        h("button", { type: "button", class: "btn btn--quiet", id: "plVersions" }, t("Saved versions")),
        h("button", { type: "button", class: "btn btn--danger btn--wide", id: "plDelete" }, t("Delete this plan")),
        h("input", { type: "file", id: "plImport", accept: "application/json,.json", class: "sr-only", tabindex: "-1", "aria-label": t("Choose a plan backup file to import") }));
      const side = h("section", { class: "planner__side", "aria-label": t("Plan summary and actions") },
        h("div", { class: "side-card" }, h("h3", null, t("Bridge strength")), h("div", { class: "strength" }, strengthSvg), el.strengthList, el.verdict, h("p",{id:"hazardGate",lang:"en",role:"status"}), h("a",{href:"#hazardDetails",onclick:()=>{$("#hazardDetails",mount).open=true;}},"Review hazard prerequisite"), el.gaps,
          L("p", { class: "note" }, trx("A complete bridge means you asked the right questions. It does not mean the project is safe: only the people affected can judge that, and conditions change."))),
        h("div", { class: "side-card" }, h("h3", null, t("Save and share")), el.savestate, actions,
          h("p", { class: "note" }, storeMode === "memory" ? t("This browser is blocking storage, so your plans will be lost when you close the page. Export a backup to keep them.") : t("Saved only on this device. Before anything leaves it, a safety check looks for details that could identify people."))));
      el.brief = h("section", { class: "brief", id: "brief", "aria-labelledby": "briefTitle" });
      mount.replaceChildren(
        plans, h("section", {id:"plForking",lang:"en",dir:"ltr","aria-label":"Plan forking and attribution"}),
        h("details",{id:"transferDetails",lang:"en",dir:"ltr"},h("summary",null,"Offline JSON / CSV transfer bundles"),h("div",{id:"plTransfer"})),
        h("details",{id:"hazardDetails",lang:"en"},h("summary",null,"Hazard & Demining Prerequisite — before field work"),h("div",{id:"plHazard"})),
        h("details",{id:"economicsDetails",lang:"en",dir:"ltr"},h("summary",null,"Restoration Economics — lifecycle appraisal"),h("div",{id:"plEconomics"})),
        h("details",{id:"stewardshipDetails",lang:"en",dir:"ltr",ontoggle:e=>{if(!e.currentTarget.open)stewardshipUI.lock();}},h("summary",null,"Community Assets & Legitimacy"),h("div",{id:"plStewardship"})),
        h("details",{id:"replicationDetails",lang:"en",dir:"ltr"},h("summary",null,"Replication & Failure Intelligence"),h("div",{id:"plReplication"})),
        h("details",{id:"scenarioDetails",lang:"en",dir:"ltr"},h("summary",null,"Scenario & Causal Reasoning — simulations"),h("div",{id:"plScenario"})),
        h("details",{id:"portfolioDetails",lang:"en",dir:"ltr"},h("summary",null,"Portfolio & Dependency Intelligence"),h("div",{id:"plPortfolio"})),
        h("details",{id:"provDetails",lang:"en",dir:"ltr"},h("summary",null,"Contribution provenance — authors, adaptations, evidence and assumptions"),h("div",{id:"plProvenance"})),
        h("div", { class: "planner" },
          h("div", { class: "planner__main" }, tablist,
            panel("readiness", basics, el.evolution, readiness, who, dnh, measures, notes),
            panel("timeline", timeline), panel("budget", budget), panel("risks", risks), panel("consent", consent), panel("impact", el.impact), panel("knowledge", el.knowledge)),
          side),
        el.brief);
    }

    App.localGlossaryText = () => LocalGlossary.texts(plan.localGlossary).join(" ");
    App.decisionText = () => Decisions.texts(plan.decisions).join(" ");
    App.seedText = () => Seeds.texts(plan.seeds).join(" ");
    App.tkText = () => TK.texts(plan.traditionalKnowledge).join(" ");
    App.hazardText = () => Hazard.texts(plan.hazard).join(" ");
    App.economicsText = () => Economics.texts(plan.economics).join(" ");
    App.stewardshipText = () => plan.stewardship.assets.flatMap(a=>[a.title,a.summary,a.category]).join(" ");
    App.replicationText = () => Replication.texts(plan.replication).join(" ");
    App.scenarioText = () => Scenario.texts(plan.scenario).join(" ");
    App.portfolioText = () => Portfolio.texts(plan.portfolio).join(" ");
    App.provenanceFor = id => Provenance.get(plan.provenance,id);
    App.provenanceTextFor = (id,sharedOnly=true) => (sharedOnly?Provenance.lines(plan.provenance,id):Provenance.texts({bridges:{[id]:Provenance.get(plan.provenance,id)}})).join("\n");
    App.openProvenance = id => {if(id)App.planBridge(id);$("#provDetails",mount).open=true;reveal($("#provDetails",mount),$("#provAuthor",mount));};
    App.evolutionFor = id => evolutionOf(plan, id);
    App.impactFor = id => Impact.bridge(plan.impact, id);
    App.impactTextFor = id => Impact.lines(plan.impact, id).join("\n");
    App.commonsListings = () => plan.commons.listings;
    App.commonsTextFor = (id, sharedOnly = true) => Commons.lines(plan.commons, id, sharedOnly).join("\n");
    App.systemsTextFor = (id, sharedOnly = true) => Systems.lines(plan.systems, id, sharedOnly).join("\n");
    App.systemsCount = id => Systems.get(plan.systems, id).edges.length;
    App.knowledgeCount = id => Knowledge.forBridge(plan.knowledge, id).length;
    App.knowledgeTextFor = (id, sharedOnly = true) => Knowledge.lines(plan.knowledge, id, sharedOnly).join("\n");
    App.activeEvolutionPlan = () => plan;
    function drawEvolution() {
      if(provenanceBridge!==plan.bridge)drawProvenance();
      const id = plan.bridge;
      el.evolution.replaceChildren(h("h3", null, "Bridge Evolution System"));
      if (!id) { el.evolution.append(h("p", null, "Choose a bridge to track its local lifecycle.")); return; }
      const e = evolutionOf(plan, id);
      const select = (axis, label) => {
        const control = h("select", { id: "evo-" + axis, "aria-describedby": "evo-guide" }, D.evolution[axis].map(x => h("option", { value: x }, x)));
        control.value = e[axis];
        return { control, field: h("div", { class: "field" }, h("label", { for: "evo-" + axis }, label), control) };
      };
      const ev = select("evidence", "Evidence maturity"), cm = select("community", "Community maturity");
      const note = h("textarea", { id: "evo-note", rows: 3, maxlength: 1000, dir: "auto", "aria-describedby": "evo-help" });
      const feedback = h("p", { role: "status", id: "evo-feedback" });
      el.evolution.append(h("p", null, "Local assessment for this plan only. Levels may advance or move back; they never override consent, safety or readiness."),
        h("p", { class: "evolution-badge" }, evolutionText(e)),
        h("details", { id: "evo-guide" }, h("summary", null, "What the maturity levels mean"), h("dl", null, Object.entries(D.evolution.definitions).flatMap(([k,v]) => [h("dt", null, k), h("dd", null, v)]))),
        h("div", { class: "grid-2" }, ev.field, cm.field), h("label", { for: "evo-note" }, "Rationale, context and evidence references (required)"), note,
        h("p", { id: "evo-help", class: "note" }, "Describe what changed, the local context and the supporting source or review. Use roles or organisations, not private names or precise locations. Same-level reviews and corrections are allowed."),
        h("button", { type: "button", class: "btn", id: "evo-save", onclick: () => {
          try {
            if (Object.values(plan.evolution).reduce((n, x) => n + x.history.length, 0) >= 200) throw Error("This plan has 200 lifecycle reviews. Export a backup and start a new plan to continue.");
            plan.evolution[id] = Evolution.record(evolutionOf(plan, id), ev.control.value, cm.control.value, note.value);
            changed(); drawEvolution(); $("#evo-save").focus(); $("#evo-feedback").textContent = "Lifecycle review recorded.";
          } catch (err) { feedback.textContent = err.message; note.focus(); }
        } }, "Record lifecycle review"), feedback,
        h("h4", null, "Lifecycle history"),
        e.history.length ? h("ol", { class: "evolution-history" }, e.history.slice().reverse().map(x => h("li", null, h("time", { datetime: x.at }, fmtTime(x.at)), h("p", null, evolutionText(x.from) + " → " + evolutionText(x)), h("p", { dir: "auto" }, x.note)))) : h("p", null, "No reviews recorded. Conceptual / Proposed is an unassessed default, not a historical event."),
        h("button", { type: "button", class: "btn btn--quiet", id: "evo-csv", onclick: () => App.safetyGate(plan, () => download("bridge-lifecycle-" + today() + ".csv", csvOf(["Bridge", "Recorded at", "Previous evidence", "Previous community", "Evidence", "Community", "Rationale"], e.history.map(x => [id, x.at, x.from.evidence, x.from.community, x.evidence, x.community, x.note])), "text/csv")) }, "Export lifecycle CSV"));
    }

    function drawForking() {
      const box=$("#plForking",mount); if(!box)return;
      const f=plan.forking;
      const attributionList=h("ul",null,Forks.attribution(plan).map(x=>h("li",{dir:"auto"},x)));
      const credit=h("input",{id:"forkCredit",maxlength:200,value:f.credit,dir:"auto"});
      const note=h("textarea",{id:"forkNote",maxlength:1000,rows:2,dir:"auto"},f.note);
      const status=h("p",{id:"forkStatus",role:"status"});
      const output=h("div",{id:"forkComparison","aria-live":"polite"});
      const selector=h("select",{id:"forkCompareTarget"},f.parent?h("option",{value:"parent"},"Frozen source design at fork time"):null,
        ws.plans.filter(e=>e.id!==entry.id).map(e=>h("option",{value:e.id},"Local plan: "+(e.plan.project||"Untitled plan"))));
      const button=(id,label,onclick)=>h("button",{type:"button",class:"btn btn--quiet",id,onclick},label);
      const compared=()=>{
        const other=selector.value==='parent'?null:ws.plans.find(e=>e.id===selector.value);
        const before=selector.value==='parent'?f.parent?.baseline:other?Forks.design(other.plan):null;
        if(!before)throw Error('Choose another local plan or fork a source plan first.');
        return {format:'rpb-plan-comparison',schema:1,notice:'Design comparison only; attribution is self-reported. Arrays are compared as complete lists. No merge is performed.',source:other?other.plan.forking.id:f.parent.id,target:plan.forking.id,attribution:Forks.attribution(plan),changes:Forks.diff(before,Forks.design(plan)),other};
      };
      box.replaceChildren(h("details",{id:"forkDetails"},h("summary",null,"Plan forking, attribution and comparison"),
        h("p",null,"Fork a design, adapt it locally and compare changes. Attribution is self-reported, not authenticated. Backups preserve lineage and the frozen source design, even if the source is later edited or deleted."),
        h("label",{for:"forkCredit"},"Plan attribution — community or organization (avoid private names)"),credit,
        h("label",{for:"forkNote"},"Adaptation note / reuse conditions (record permission separately when needed)"),note,
        button("forkSaveCredit","Save attribution",()=>{f.id=f.id||rid();f.credit=credit.value.trim();f.note=note.value.trim();changed();attributionList.replaceChildren(...Forks.attribution(plan).map(x=>h('li',{dir:'auto'},x)));status.textContent='Attribution saved.';}),
        h("p",null,"Forks copy design fields and maps. Readiness, participation, consent, maturity, measurements, knowledge accounts and commons notices start empty. Tasks become planned, risks reopen, maps become local hypotheses. Review inherited notes and dates for the new context."),
        button("plFork","Fork this plan",async()=>{
          if(atLimit())return;
          if(!(await confirmDialog('Fork this plan?','Create an independent design with preserved source attribution and a frozen comparison baseline. Local assessments and sharing permissions will not transfer.','Create fork')))return;
          try{
            f.id=f.id||rid();f.credit=credit.value.trim();f.note=note.value.trim();changed();await flush();
            const next=Forks.fork(plan,rid(),now(),x=>sanitizePlan(x,false));
            next.project=clip((plan.project||'Untitled plan')+' (fork)',LIMITS.short);
            const e=newEntry(next);ws.plans.push(e);switchTo(e.id);await saveStructure();
            $("#forkDetails",mount).open=true;el.project.focus();toast('Plan forked. Review and adapt it for this context.');
          }catch(err){status.textContent=err.message;}
        }),
        attributionList,
        h("p",null,f.parent?'The frozen baseline is the source design after the reset described above. It is retained in private backups.':'This plan has no fork baseline. You can compare it with another local plan.'),
        h("label",{for:"forkCompareTarget"},"Compare current design against"),selector,
        button("forkCompare","Compare now",()=>{try{const c=compared();output.replaceChildren(h("p",null,c.changes.length+' changed fields or lists. Before = selected source; after = current design. Refresh comparison after edits.'),...c.changes.map(d=>h("details",null,h("summary",null,d.kind+': '+d.path),h("h4",null,'Before'),h("pre",{class:"fork-value",dir:"auto"},JSON.stringify(d.before,null,2).slice(0,5000)),h("h4",null,'After'),h("pre",{class:"fork-value",dir:"auto"},JSON.stringify(d.after,null,2).slice(0,5000)))),h("p",null,'Values display up to 5,000 characters each. Export the comparison for complete values.'));status.textContent='Comparison updated.';}catch(err){status.textContent=err.message;}}),
        button("forkExport","Export comparison JSON",()=>{try{const c=compared();const others=c.other?[{name:'Comparison source',plan:c.other.plan}]:[];delete c.other;App.safetyGate([{name:'Current plan and frozen source',plan},...others],()=>download('plan-comparison-'+today()+'.json',JSON.stringify(c,null,2),'application/json'));}catch(err){status.textContent=err.message;}}),status,output));
    }

    // ----- Fill the form from the plan -----
    function drawList(key) {
      const ul = $("#list-" + key, mount);
      if (!ul) return;
      ul.replaceChildren(...plan[key].map((txt, i) => h("li", null, h("span", { dir: "auto" }, txt),
        h("button", { type: "button", class: "btn btn--quiet btn--small", "data-action": "list-remove", "data-key": key, "data-index": i, "aria-label": t("Remove “{item}”", { item: txt }) }, t("Remove")))));
    }
    function drawMeasures() {
      const box = $("#plMeasures", mount);
      const b = bridgeById.get(plan.bridge);
      const options = b ? b.measures.map((m, i) => [m, tc(`bridges.${b.id}.measures.${i}`, m)]) : generalMeasures();
      for (const m of plan.measures) if (!options.some(([en]) => en === m)) options.push([m, measureLabel(m)]);
      box.replaceChildren(h("p", { class: "field__label" }, b ? t("Suggested for {bridge}", { bridge: cBridge(b, "short") }) : t("General suggestions")),
        ...options.map(([en, label], i) => h("label", { class: "check" }, h("input", { type: "checkbox", value: en, id: "ms-" + i, checked: plan.measures.includes(en) }), h("span", null, label))));
    }
    function fill() {
      drawDecisions();
      drawLocalGlossary();
      drawHazard();
      drawTransfer();
      drawEconomics();
      drawStewardship();
      drawReplication();
      drawScenario();
      drawPortfolio();
      drawProvenance();
      drawForking();
      drawEvolution();
      drawImpact();
      drawKnowledge(); drawSystems(); drawCommons();
      el.project.value = plan.project;
      el.bridge.value = plan.bridge;
      el.place.value = plan.place;
      el.review.value = plan.review;
      el.notes.value = plan.notes;
      el.currency.value = plan.budget.currency;
      for (const q of allQuestions()) for (const r of $$(`input[name="ans-${q.id}"]`, mount)) r.checked = plan.answers[q.id] === r.value;
      for (const g of D.stakeholders) for (const r of $$(`input[name="who-${g.id}"]`, mount)) r.checked = plan.who[g.id] === r.value;
      ["dividers", "connectors", "customMeasures"].forEach(drawList);
      drawMeasures();
      Object.keys(ROWS).forEach(drawRows);
      refresh();
    }

    // ----- Live summary, side panel and brief -----
    function refresh() {
      decisionsUI.sync();
      glossaryUI.sync();
      App.refreshEvolutionCards && App.refreshEvolutionCards();
      App.fillTKReferences?.();
      App.invalidateEvolutionSearch && App.invalidateEvolutionSearch();
      const m = briefModel(plan);
      const r = m.r;
      const portfolioHazard=$('#portfolioHazard',mount);if(portfolioHazard)portfolioHazard.textContent=r.hazard.title+'. '+r.hazard.reason;
      const hazardResult=$('#hazardResult',mount);if(hazardResult)hazardResult.textContent=r.hazard.title+'. '+r.hazard.reason;
      r.dims.forEach((d, i) => {
        el.planks[i].setAttribute("class", "plank plank--" + d.level);
        const score = $("#dimScore-" + d.id, mount);
        if (score) score.textContent = d.blocked ? t("Blocked") : d.answered ? t("{got} of {max} points", { got: fmtNum(d.got), max: fmtNum(d.max) }) : t("Not answered");
      });
      el.strengthList.replaceChildren(...r.dims.map((d) => h("li", null, kvNodes(h("bdi", null, d.label), h("strong", null, d.blocked ? t("blocked") : d.answered ? t("{got} of {max}", { got: fmtNum(d.got), max: fmtNum(d.max) }) : t("not answered"))))));
      el.verdict.className = "verdict verdict--" + r.verdict.key;
      el.verdict.replaceChildren(h("p", { class: "verdict__title" }, r.verdict.title), L("p", null, r.verdict.text), h("p", { class: "note" }, t("{answered} of {total} questions answered.", { answered: fmtNum(r.answered), total: fmtNum(r.total) })));
      $("#hazardGate",mount).textContent=r.hazard.title+". "+r.hazard.reason;
      setKids(el.gaps,
        r.blockers.length ? h("div", null, h("p", null, h("strong", null, t("Blockers"))), h("ul", { class: "gaps" }, r.blockers.map((q) => h("li", null, h("a", { href: "#q-" + q.id, dir: "auto" }, q.text))))) : null,
        r.consentBlocks.length ? h("div", null, h("p", null, h("strong", null, t("Consent"))), h("ul", { class: "gaps" }, r.consentBlocks.map((c) => h("li", null, h("a", { href: "#panel-consent", "data-goto-tab": "consent" }, kv(groupLabel(c), labelOf(LABELS.decision, c.decision))))))) : null,
        r.answered && r.unsure.length ? h("div", null, h("p", null, h("strong", null, t("Essentials to confirm"))), h("ul", { class: "gaps" }, r.unsure.map((q) => h("li", null, h("a", { href: "#q-" + q.id, dir: "auto" }, q.text))))) : null);
      renderBrief(m);
      renderBudget(m.budget);
      renderMatrix();
      renderConsent(r);
      const tl = $("#tlReview", mount);
      if (tl) tl.textContent = plan.review ? t("Next community review: {date}", { date: fmtDate(plan.review) }) : t("Tip: set the next community review date under Readiness.");
      const counts = { timeline: plan.timeline.length, budget: plan.budget.lines.length, risks: plan.risks.length, consent: plan.consent.length, impact: Object.values(Impact.bridge(plan.impact, plan.bridge).metrics).reduce((n, r) => n + Impact.active(r).length, 0), knowledge: Knowledge.forBridge(plan.knowledge, plan.bridge).length, systems: Systems.get(plan.systems, plan.bridge).edges.length };
      for (const [k, n] of Object.entries(counts)) { const c = $("#tabCount-" + k, mount); if (c) c.textContent = n ? fmtNum(n) : ""; }
      const hasBridge = bridgeById.has(plan.bridge);
      for (const id of ["tlSeed", "riskSeed"]) { const b = $("#" + id, mount); if (b) b.hidden = !hasBridge; }
      updateSwitcher();
    }
    function updateSwitcher() {
      const label = (e) => e.plan.project || t("Untitled plan");
      el.switcher.replaceChildren(...ws.plans.map((e) => h("option", { value: e.id }, label(e))));
      el.switcher.value = entry.id;
      const commonsPlan=document.getElementById("commonsPlan");
      if (commonsPlan) {commonsPlan.replaceChildren(...ws.plans.map(e => h("option", {value:e.id}, label(e))));commonsPlan.value=entry.id;}
      const webPlan = document.getElementById("webSystemPlan");
      if (webPlan) { webPlan.replaceChildren(...ws.plans.map(e => h("option", {value:e.id}, label(e)))); webPlan.value = entry.id; }
    }
    function renderBudget(bc) {
      const box = $("#budgetSummary", mount);
      if (!box) return;
      const cur = plan.budget.currency;
      if (!bc.total) { box.replaceChildren(h("p", { class: "note" }, t("Add budget lines and amounts to see the total and the checks."))); return; }
      const rows = LABELS.cats().filter(([id]) => bc.by[id] > 0).map(([id, label]) => {
        const bar = h("span", { class: "btable__bar btable__bar--" + id });
        bar.style.width = ((bc.by[id] / bc.total) * 100).toFixed(1) + "%"; // CSSOM, allowed by the security policy
        return h("tr", null, h("th", { scope: "row" }, label), h("td", { class: "num" }, fmtMoney(bc.by[id], cur)), h("td", null, h("span", { class: "btable__track", "aria-hidden": "true" }, bar), " ", fmtPct(bc.share(id))));
      });
      box.replaceChildren(
        h("p", { class: "btotal" }, kvNodes(t("Total"), h("strong", null, fmtMoney(bc.total, cur)))),
        h("table", { class: "btable" },
          h("caption", { class: "sr-only" }, t("Budget by category")),
          h("thead", null, h("tr", null, h("th", { scope: "col" }, t("Category")), h("th", { scope: "col" }, t("Amount")), h("th", { scope: "col" }, t("Share")))),
          h("tbody", null, rows)),
        h("h4", null, t("Integrity checks")),
        h("ul", { class: "bchecks" }, bc.checks.map((c) => h("li", { class: c.ok ? "is-ok" : "is-gap" }, h("span", { class: "sr-only" }, c.ok ? t("Done:") : t("To do:")), " ", c.ok ? c.yes : c.no))));
    }
    let matrixSelection=null;
    function renderMatrix() {
      const box = $("#riskMatrix", mount);
      if (!box) return;
      const live = plan.risks.filter((r) => r.status !== "closed");
      const selection=$('#riskMatrixSelection',mount);
      const showSelection=()=>{if(!selection)return;if(!matrixSelection){selection.replaceChildren(h('p',null,'Select a matrix cell to inspect open risks. Ratings are local judgments, not probabilities. Low scores never override consent or safety holds.'));return;}
       const [lv,iv]=matrixSelection,rows=live.filter(r=>r.likelihood===lv&&r.impact===iv);
       selection.replaceChildren(h('h4',null,'Selected cell: likelihood '+lv+', impact '+iv+' — '+rows.length+' open risk(s)'),h('button',{type:'button',class:'linkbtn',onclick:()=>{matrixSelection=null;renderMatrix();}},'Clear matrix selection'),h('ul',null,rows.map(r=>h('li',null,r.text||'Untitled risk',h('button',{type:'button',class:'linkbtn',onclick:()=>{const target=document.getElementById('risks-'+r.id+'-text');if(target)reveal(target,target);}},'Review risk ratings and safeguards')))));
      };showSelection();
      const lik = LABELS.likelihood();
      const imp = [...LABELS.impact()].reverse();
      box.replaceChildren(h("table", { class: "matrix" },
        h("caption", null, t("Open risks by likelihood (across) and impact (down)")),
        h("thead", null, h("tr", null, h("td", { class: "matrix__corner" }), lik.map(([, label]) => h("th", { scope: "col" }, label)))),
        h("tbody", null, imp.map(([iv, ilabel]) => h("tr", null, h("th", { scope: "row" }, ilabel),
          lik.map(([lv]) => {
            const n = live.filter((r) => r.likelihood === lv && r.impact === iv).length;
            return h("td", { class: "matrix__cell matrix__cell--" + riskLevel(lv * iv) + (n ? " has-risks" : "") }, h("button",{type:"button",class:"linkbtn","aria-label":"Likelihood "+lv+", impact "+iv+": "+n+" open risks","aria-pressed":String(matrixSelection?.[0]===lv&&matrixSelection?.[1]===iv),onclick:()=>{matrixSelection=[lv,iv];renderMatrix();const btn=$("button[aria-pressed=\"true\"]",box);btn?.focus();}},fmtNum(n)));
          }))))));
    }
    function renderConsent(r) {
      const box = $("#consentSummary", mount);
      if (!box) return;
      setKids(box, r.latest.length ? h("div", { class: "csum" }, h("h4", null, t("Latest decision for each group")),
        h("ul", null, r.latest.map((c) => h("li", { class: "csum__item csum__item--" + c.decision },
          kvNodes(h("strong", { dir: "auto" }, groupLabel(c)), labelOf(LABELS.decision, c.decision)),
          c.date ? " (" + fmtDate(c.date) + ")" : null, c.nextCheck ? " · " + t("check again on {date}", { date: fmtDate(c.nextCheck) }) : null)))) : null);
    }
    function renderBrief(m) {
      const { r, b } = m;
      const cur = plan.budget.currency;
      const auto = (txt) => h("bdi", null, txt); // keeps mixed-direction text in order
      el.brief.replaceChildren();
      appendKids(el.brief, [
        h("h3", { id: "briefTitle" }, t("Plan brief:"), " ", auto(plan.project || t("Untitled bridge plan"))),
        h("section",{lang:"en"},h("h4",null,"Workshop decision review"),h("p",null,Decisions.summary(plan.decisions,plan))),
        h("section",{lang:"en"},h("h4",null,"Traditional knowledge summaries approved for sharing"),h("ul",null,TK.lines(plan.traditionalKnowledge,plan.bridge).map(x=>h("li",null,x))),h("p",null,"Knowledge-holder protocols govern reuse. No institutional grade or automatic scientific endorsement is assigned.")),
        h("section",{lang:"en"},h("h4",null,"Hazard & Demining Prerequisite"),h("p",null,r.hazard.title+". "+r.hazard.reason),h("p",null,"This brief is not a clearance certificate; private authority references are excluded.")),
        h("section", { lang: "en" }, h("h4", null, "Bridge Evolution System"), h("p", null, evolutionText(evolutionOf(plan, plan.bridge))), h("ul", null, evolutionOf(plan, plan.bridge).history.map(e => h("li", { dir: "auto" }, fmtTime(e.at) + " — " + evolutionText(e) + ": " + e.note)))),
        h("section", { lang: "en" }, h("h4", null, "Impact and learning"), h("ul", null, Impact.lines(plan.impact, plan.bridge).map(x => h("li", { dir: "auto" }, x))), h("p", null, "Local observations, not proof of causation. Sources and full history are in impact exports.")),
        h("section", {lang:"en"}, h("h4", null, "Commons notices approved for sharing"), h("ul", null, Commons.lines(plan.commons, plan.bridge, true).map(x => h("li", {dir:"auto"}, x))), h("p", null, "Community notices, not verified commitments. Recheck dates and availability.")),
        h("section", { lang: "en" }, h("h4", null, "Peace systems map approved for sharing"), h("ul", null, Systems.lines(plan.systems, plan.bridge, true).map(x => h("li", {dir:"auto"}, x))), h("p", null, "Relationships are proposals or local accounts, not causal proof.")),
        h("section", { lang: "en" }, h("h4", null, "Community knowledge approved for sharing"), h("ul", null, Knowledge.lines(plan.knowledge, plan.bridge, true).map(x => h("li", { dir: "auto" }, x))), h("p", null, "Community accounts, not independently verified findings. Local-only and withdrawn accounts are omitted.")),
        h("dl", { class: "brief__meta" },
          h("dt", null, t("Bridge")), h("dd", null, b ? auto(cBridge(b, "name")) : plan.bridge === "other" ? t("Another idea") : t("Not chosen yet")),
          h("dt", null, t("General area")), h("dd", null, plan.place ? auto(plan.place) : t("Not given")),
          h("dt", null, t("Next review")), h("dd", null, plan.review ? fmtDate(plan.review) : t("Not set")),
          h("dt", null, t("Readiness")), h("dd", null, t("{verdict} ({answered} of {total} answered)", { verdict: r.verdict.title, answered: fmtNum(r.answered), total: fmtNum(r.total) }))),
        r.blockers.length ? [h("h4", null, t("Blockers to resolve first")), h("ul", null, r.blockers.map((q) => h("li", { dir: "auto" }, q.text)))] : null,
        r.consentBlocks.length ? [h("h4", null, t("Groups that said no or withdrew consent")), h("ul", null, r.consentBlocks.map((c) => h("li", null, kv(groupLabel(c), labelOf(LABELS.decision, c.decision)))))] : null,
        h("h4", null, t("Who is in the room")),
        h("ul", null, h("li", null, t("Heard from:"), " ", auto(m.groups("met").join("; ") || t("none yet"))), h("li", null, t("Planned:"), " ", auto(m.groups("planned").join("; ") || t("none"))), h("li", null, t("Not yet:"), " ", auto(m.notYet.join("; ") || t("none")))),
        plan.dividers.length ? [h("h4", null, t("What divides people")), h("ul", null, plan.dividers.map((x) => h("li", { dir: "auto" }, x)))] : null,
        plan.connectors.length ? [h("h4", null, t("What connects people")), h("ul", null, plan.connectors.map((x) => h("li", { dir: "auto" }, x)))] : null,
        m.measures.length ? [h("h4", null, t("What to measure")), h("ul", null, m.measures.map((x) => h("li", { dir: "auto" }, x)))] : null,
        m.timeline.length ? [h("h4", null, t("Timeline")), h("ul", null, m.timeline.map((x) => h("li", null, kvNodes(x.date ? fmtDate(x.date) : t("No date"), auto(x.title)), " (" + labelOf(LABELS.milestone, x.status) + ")")))] : null,
        m.budget.total ? [h("h4", null, t("Budget")), h("p", null, kvNodes(t("Total"), h("strong", null, fmtMoney(m.budget.total, cur)))),
          h("ul", null, LABELS.cats().filter(([id]) => m.budget.by[id] > 0).map(([id, label]) => h("li", null, `${kv(label, fmtMoney(m.budget.by[id], cur))} (${fmtPct(m.budget.share(id))})`))),
          h("ul", { class: "bchecks" }, m.budget.checks.map((c) => h("li", { class: c.ok ? "is-ok" : "is-gap" }, h("span", { class: "sr-only" }, c.ok ? t("Done:") : t("To do:")), " ", c.ok ? c.yes : c.no)))] : null,
        m.risks.length ? [h("h4", null, t("Risks")), h("ul", null, m.risks.map((x) => h("li", { dir: "auto" }, riskText(x))))] : null,
        plan.consent.length ? [h("h4", null, t("Consent log")), h("ul", null, plan.consent.map((c) => h("li", { dir: "auto" }, consentText(c))))] : null,
        b ? [h("h4", null, t("Smaller, safer first step")), h("p",null,r.hazard.blocked ? "Resolve the Hazard & Demining Prerequisite before any field intervention. Desk planning does not authorize site access." : cBridge(b,"firstStep"))] : null,
        Forks.attribution(plan).map(x => h("p", {lang:"en",dir:"auto"}, x)),
        Provenance.lines(plan.provenance,plan.bridge).map(x=>h("p",{lang:"en",dir:"auto"},x)),
        plan.notes.trim() ? [h("h4", null, t("Notes and local validation questions")), h("p", { class: "brief__notes", dir: "auto" }, plan.notes.trim())] : null,
        L("p", { class: "brief__foot" }, trx("Every bridge is a proposal until the community has been consulted, risks have been checked and results have been measured. Zero Harm and Anti-Coercion: do not use this plan to identify, locate, profile, pressure or target anyone."))]);
    }

    // ----- Tabs -----
    function setTab(id, focus) {
      tab = id;
      for (const b of $$('[role="tab"]', mount)) {
        const on = b.dataset.tab === id;
        b.setAttribute("aria-selected", on ? "true" : "false");
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      }
      for (const p of $$('[role="tabpanel"]', mount)) p.hidden = p.id !== "panel-" + id;
    }
    App.showPlanTab = (id) => id === "localGlossary" ? reveal($("#localGlossaryMount")) : id === "decisions" ? (setTab("risks"),reveal($("#plDecisions",mount))) : id === "seeds" ? (setTab("knowledge"),reveal($("#plSeeds",mount))) : id === "tk" ? (setTab("knowledge"),reveal($("#plTK",mount))) : id === "hazard" ? ($("#hazardDetails",mount).open=true,reveal($("#plHazard",mount))) : id === "economics" ? ($("#economicsDetails",mount).open=true,reveal($("#plEconomics",mount))) : id === "stewardship" ? ($("#stewardshipDetails",mount).open=true,reveal($("#plStewardship",mount))) : id === "replication" ? ($("#replicationDetails",mount).open=true,reveal($("#plReplication",mount))) : id === "scenario" ? ($("#scenarioDetails",mount).open=true,reveal($("#plScenario",mount))) : id === "portfolio" ? ($("#portfolioDetails",mount).open=true,reveal($("#plPortfolio",mount))) : id === "provenance" ? App.openProvenance() : id === "vault" ? App.vault?.open() : id === "systems" ? App.showSystems() : id === "commons" ? App.openCommons() : setTab(id);

    // ----- Saving: merges with other tabs, keeps versions -----
    function setSaveState(text) { if (el.savestate) el.savestate.textContent = text; }
    // Write the workspace, merged with whatever other tabs saved meanwhile:
    //  - plans another tab created are kept;
    //  - plans deleted anywhere stay deleted, except the one on screen here;
    //  - for every other plan, the copy saved most recently wins, so a tab
    //    left open in the background never overwrites newer work.
    // `editing` is true when this save carries changes to the plan on screen.
    async function writeWorkspace(editing) {
      let refill = false;
      await Store.update("workspace", (stored) => {
        if (stored && stored.schema === 3 && Array.isArray(stored.plans)) {
          const gone = new Set(ws.removed.map((r) => r.id));
          for (const r of Array.isArray(stored.removed) ? stored.removed : []) if (r && typeof r.id === "string" && !gone.has(r.id)) { ws.removed.push({ id: r.id, at: isoOr(r.at, "") }); gone.add(r.id); }
          if (gone.has(entry.id)) { ws.removed = ws.removed.filter((r) => r.id !== entry.id); gone.delete(entry.id); }
          ws.plans = ws.plans.filter((e) => !gone.has(e.id));
          for (const e of stored.plans) {
            if (!e || typeof e.id !== "string" || !/^[a-z0-9]{1,24}$/.test(e.id) || gone.has(e.id)) continue;
            const i = ws.plans.findIndex((x) => x.id === e.id);
            const mine = i > -1 ? ws.plans[i] : null;
            if (!mine && ws.plans.length >= LIMITS.plans) continue;
            // Ours is as new or newer, or is the plan being edited here: keep ours.
            if (mine && ((e.id === entry.id && (editing || dirty)) || !(isoOr(e.updated, "") > (mine.updated || "")))) continue;
            const c = sanitizeEntry(e);
            if (!c) continue;
            lastSaved.set(c.id, c.updated ? JSON.stringify(c.plan) : null);
            if (!mine) ws.plans.push(c);
            else {
              ws.plans[i] = c;
              if (c.id === entry.id) { entry = c; plan = c.plan; refill = true; }
            }
          }
          ws.removed = ws.removed.slice(-LIMITS.removed);
        }
        return clone(ws);
      });
      // The plan on screen had a newer copy from another tab: show that one.
      if (refill) fill();
    }
    // When a save changes the plan, the earlier state becomes a "saved
    // version": on every manual save, and automatically when the newest
    // version is more than ten minutes old. Five are kept for each plan.
    async function persist(manual) {
      const stamp = now();
      const snapshot = JSON.stringify(plan);
      const prev = lastSaved.get(entry.id);
      const newest = entry.history[0];
      if (prev && prev !== snapshot && (manual || !newest || Date.now() - Date.parse(newest.at) > 600000)
          && (!newest || JSON.stringify(newest.plan) !== prev)) {
        entry.history.unshift({ at: entry.updated || stamp, plan: JSON.parse(prev) });
        entry.history = entry.history.slice(0, LIMITS.history);
      }
      lastSaved.set(entry.id, snapshot);
      entry.updated = stamp;
      ws.activeId = entry.id;
      try {
        await writeWorkspace(true);
        dirty = false;
        setSaveState(Store.mode === "memory" ? t("Kept for this visit only. Export a backup to keep it.") : t("Saved on this device, {time}.", { time: fmtTime(stamp) }));
        if (channel) channel.postMessage({ type: "saved", tab: TAB_ID, at: stamp });
      } catch (e) {
        window.dispatchEvent(new Event("rpb-storage-error"));
        setSaveState(t("Could not save on this device. Export a backup to keep your work."));
      }
      updateSwitcher();
      App.refreshInventory && App.refreshInventory();
    }
    // Save the list of plans (switching, new, duplicate, delete).
    async function saveStructure() {
      try {
        await writeWorkspace(false);
        if (channel) channel.postMessage({ type: "saved", tab: TAB_ID, at: now() });
      } catch (e) { setSaveState(t("Could not save on this device. Export a backup to keep your work.")); }
      updateSwitcher();
      App.refreshInventory && App.refreshInventory();
    }
    const flush = async () => { if (dirty) await persist(false); };
    App.prepareUpdate = async () => { await flush(); if(dirty || Store.mode === "memory") throw Error("Save or export your plans before changing the app version."); };
    // Only saves if something changed since the last save (a manual save
    // in the meantime makes this a no-op).
    const autosave = debounce(() => { if (dirty) persist(false); }, 700);
    function changed() {
      dirty = true;
      setSaveState(t("Saving…"));
      refresh();
      autosave();
    }
    function switchTo(id) {
      const e = ws.plans.find((x) => x.id === id);
      if (!e) return;
      entry = e;
      plan = e.plan;
      ws.activeId = e.id;
      if (!lastSaved.has(e.id)) lastSaved.set(e.id, e.updated ? JSON.stringify(e.plan) : null);
      fill();
      setSaveState(e.updated ? t("Saved on this device, {time}.", { time: fmtTime(e.updated) }) : t("Not saved yet. Your plan saves automatically as you type."));
    }
    const atLimit = () => { if (ws.plans.length < LIMITS.plans) return false; toast(t("You can keep up to {n} plans on this device. Delete or export one first.", { n: fmtNum(LIMITS.plans) })); return true; };

    // ----- Events (attached once; the form inside can be rebuilt) -----
    const bindEdit = (c) => {
      const key = c.dataset.bind;
      if (key === "review") plan.review = /^\d{4}-\d{2}-\d{2}$/.test(c.value) ? c.value : "";
      else if (key === "bridge") { plan.bridge = bridgeById.has(c.value) || c.value === "other" ? c.value : ""; drawMeasures(); drawEvolution(); drawImpact(); drawKnowledge(); drawSystems(); drawCommons(); drawHazard(); }
      else if (key === "currency") plan.budget.currency = c.value.replace(/[\r\n]+/g, " ").slice(0, LIMITS.currency);
      else plan[key] = c.value.slice(0, key === "notes" ? LIMITS.notes : LIMITS.short);
      if(key === "place")drawHazard();
      changed();
    };
    function rowEdit(c) {
      const coll = c.dataset.row;
      const item = ROWS[coll].list().find((x) => x.id === c.dataset.id);
      if (!item) return;
      const f = c.dataset.field;
      let v = c.value;
      if (f === "amount") v = money(v);
      else if (f === "likelihood" || f === "impact") v = [1, 2, 3].includes(Number(v)) ? Number(v) : 2;
      else if (c.type === "date") v = /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "";
      else if (c.tagName === "TEXTAREA") v = v.slice(0, LIMITS.long);
      else if (c.type === "text") v = v.replace(/[\r\n]+/g, " ").slice(0, Number(c.maxLength) > 0 ? Number(c.maxLength) : LIMITS.title);
      item[f] = v;
      if (coll === "consent" && f === "group") { const wrap = $('[data-show="groupOther"]', c.closest(".row")); if (wrap) wrap.hidden = v !== "other"; }
      if (coll === "risks" && (f === "likelihood" || f === "impact")) {
        const badge = $(`#risks-${item.id}-level`, mount);
        const lvl = riskLevel(riskScore(item));
        if (badge) { badge.className = "risk-level risk-level--" + lvl; badge.textContent = riskLevelLabel(lvl); }
      }
      changed();
    }
    const isTyping = (c) => c.tagName === "TEXTAREA" || (c.tagName === "INPUT" && ["text", "number", "search"].includes(c.type));
    mount.addEventListener("input", (e) => {
      const c = e.target;
      if (!isTyping(c)) return;
      if (c.dataset.bind) bindEdit(c);
      else if (c.dataset.row) rowEdit(c);
    });
    mount.addEventListener("change", async (e) => {
      const c = e.target;
      if (c.id === "plImport") { importFile(c); return; }
      if (c.id === "plSwitch") { const target = c.value; await flush(); switchTo(target); await saveStructure(); return; }
      if (isTyping(c)) return;
      if (c.dataset.bind) { bindEdit(c); return; }
      if (c.dataset.row) { rowEdit(c); return; }
      if (c.type === "radio") {
        if (c.name.startsWith("ans-")) plan.answers[c.name.slice(4)] = c.value;
        else if (c.name.startsWith("who-")) plan.who[c.name.slice(4)] = c.value;
        else return;
        changed();
        return;
      }
      if (c.type === "checkbox" && c.closest("#plMeasures")) {
        if (c.checked && !plan.measures.includes(c.value)) plan.measures.push(c.value);
        if (!c.checked) plan.measures = plan.measures.filter((m) => m !== c.value);
        changed();
      }
    });
    function addToList(key) {
      const input = $("#le-" + key, mount);
      const v = input.value.trim();
      if (!v) return;
      if (plan[key].length >= LIMITS.items) { toast(t("You can list up to {n} items here.", { n: fmtNum(LIMITS.items) })); return; }
      plan[key].push(v.slice(0, LIMITS.item));
      input.value = "";
      drawList(key);
      changed();
    }
    mount.addEventListener("keydown", (e) => {
      const c = e.target;
      if (e.key === "Enter" && c.dataset && c.dataset.list) { e.preventDefault(); addToList(c.dataset.list); return; }
      // Arrow keys move between tabs; left and right follow the reading direction.
      if (c.getAttribute && c.getAttribute("role") === "tab") {
        const ids = $$('[role="tab"]', mount).map((b) => b.dataset.tab);
        const i = ids.indexOf(c.dataset.tab);
        const fwd = I18N.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
        const back = I18N.dir === "rtl" ? "ArrowRight" : "ArrowLeft";
        let next = null;
        if (e.key === fwd) next = ids[(i + 1) % ids.length];
        else if (e.key === back) next = ids[(i - 1 + ids.length) % ids.length];
        else if (e.key === "Home") next = ids[0];
        else if (e.key === "End") next = ids[ids.length - 1];
        if (next) { e.preventDefault(); setTab(next, true); }
      }
    });
    const SEEDS = {
      "seed-timeline": () => {
        const b = bridgeById.get(plan.bridge);
        if (!b) return;
        let added = 0;
        for (const title of [cBridge(b, "firstStep"), ...cBridgeList(b, "steps").map((p) => p[0])].map((x) => clip(x, LIMITS.title))) {
          if (plan.timeline.length >= LIMITS.timeline || plan.timeline.some((m) => m.title === title)) continue;
          plan.timeline.push({ id: rid(), date: "", title, status: "planned" });
          added++;
        }
        drawRows("timeline");
        changed();
        toast(added ? tn("{n} milestone added. Add dates when the community agrees them.", "{n} milestones added. Add dates when the community agrees them.", added) : t("These steps are already in the timeline."));
      },
      "seed-risks": () => {
        const b = bridgeById.get(plan.bridge);
        if (!b) return;
        let added = 0;
        for (const text of cBridgeList(b, "risks").map((p) => clip(p[0], LIMITS.long))) {
          if (plan.risks.length >= LIMITS.risks || plan.risks.some((r) => r.text === text)) continue;
          plan.risks.push({ id: rid(), text, likelihood: 2, impact: 2, owner: "", mitigation: "", status: "open" });
          added++;
        }
        drawRows("risks");
        changed();
        toast(added ? tn("{n} risk added. Rate each one with the community.", "{n} risks added. Rate each one with the community.", added) : t("These risks are already listed."));
      },
      "seed-budget": () => {
        const essentials = [["people", t("Fair pay for local workers")], ["safeguarding", t("Safe complaint route and safeguarding training")], ["monitoring", t("Monitoring, and sharing results back with the community")], ["maintenance", t("Spare parts, repairs and upkeep after the project")], ["contingency", t("Contingency (at least 5%)")]];
        let added = 0;
        for (const [category, item] of essentials) {
          if (plan.budget.lines.length >= LIMITS.budget || plan.budget.lines.some((l) => l.category === category)) continue;
          plan.budget.lines.push({ id: rid(), item, category, amount: 0 });
          added++;
        }
        drawRows("budget");
        changed();
        toast(added ? tn("{n} line added. Fill in the amount.", "{n} lines added. Fill in the amounts.", added) : t("The essential lines are already there."));
      }
    };
    const backupJson = () => JSON.stringify({ schema: 3, kind: "plan", app: "regenerative-peace-bridges", version: D.meta.version, exported: now(), plan }, null, 2);
    function rowsCsv(coll) {
      const cur = plan.budget.currency;
      if (coll === "timeline") return csvOf([t("Date"), t("Milestone"), t("Status")], sortedTimeline(plan).map((m) => [m.date, m.title, labelOf(LABELS.milestone, m.status)]));
      if (coll === "budget") return csvOf([t("What it pays for"), t("Category"), t("Amount"), t("Currency")], plan.budget.lines.map((l) => [l.item, labelOf(LABELS.cats, l.category), l.amount, cur]));
      if (coll === "risks") return csvOf([t("What could go wrong"), t("Likelihood"), t("Impact"), t("Level"), t("Who watches it"), t("What will reduce it"), t("Status")], sortedRisks(plan).map((r) => [r.text, labelOf(LABELS.likelihood, r.likelihood), labelOf(LABELS.impact, r.impact), riskLevelLabel(riskLevel(riskScore(r))), r.owner, r.mitigation, labelOf(LABELS.riskStatus, r.status)]));
      return csvOf([t("Date"), t("Group"), t("How it was decided"), t("Decision"), t("Conditions or concerns"), t("Check again on")], plan.consent.map((c) => [c.date, groupLabel(c), labelOf(LABELS.process, c.process), labelOf(LABELS.decision, c.decision), c.conditions, c.nextCheck]));
    }
    mount.addEventListener("click", async (e) => {
      const tabBtn = e.target.closest('[role="tab"]');
      if (tabBtn) { setTab(tabBtn.dataset.tab); return; }
      const a = e.target.closest("a[data-practice]");
      if (a) { e.preventDefault(); App.gotoPractice(a.getAttribute("data-practice")); return; }
      const qa = e.target.closest('a[href^="#q-"]');
      if (qa) { e.preventDefault(); setTab("readiness"); const q = $(qa.getAttribute("href")); if (q) reveal(q, $("input", q)); return; }
      const goto = e.target.closest("[data-goto-tab]");
      if (goto) { e.preventDefault(); setTab(goto.dataset.gotoTab); reveal($("#panel-" + goto.dataset.gotoTab)); return; }
      const b = e.target.closest("button");
      if (!b) return;
      const act = b.dataset.action;
      if (act === "list-add") addToList(b.dataset.key);
      else if (act === "list-remove") { plan[b.dataset.key].splice(Number(b.dataset.index), 1); drawList(b.dataset.key); changed(); }
      else if (act === "row-add") { const x = addRow(b.dataset.row); if (x) { const first = $(`[data-row="${b.dataset.row}"][data-id="${x.id}"]`, mount); if (first) first.focus(); } }
      else if (act === "row-remove") {
        const list = ROWS[b.dataset.row].list();
        const i = list.findIndex((x) => x.id === b.dataset.id);
        if (i > -1) list.splice(i, 1);
        drawRows(b.dataset.row);
        changed();
        const addBtn = $(`[data-action="row-add"][data-row="${b.dataset.row}"]`, mount);
        if (addBtn) addBtn.focus();
      }
      else if (SEEDS[act]) SEEDS[act]();
      else if (act === "csv") App.safetyGate(plan, () => download(`peace-bridges-${b.dataset.row}-${today()}.csv`, rowsCsv(b.dataset.row), "text/csv"));
      else if (act === "plan-new") {
        if (atLimit()) return;
        await flush();
        const ne = newEntry(emptyPlan());
        ws.plans.push(ne);
        switchTo(ne.id);
        setTab("readiness");
        await saveStructure();
        el.project.focus();
        toast(t("New plan started. Your other plans are kept."));
      }
      else if (act === "plan-duplicate") {
        if (atLimit()) return;
        await flush();
        const copy = newEntry(sanitizePlan(clone(plan)));
        copy.plan.forking.id = rid();
        copy.plan.hazard=Hazard.empty();
        copy.plan.traditionalKnowledge=TK.empty();copy.plan.seeds=Seeds.empty();copy.plan.decisions=Decisions.empty();copy.plan.localGlossary=LocalGlossary.empty();
        copy.plan.project = clip(t("{name} (copy)", { name: plan.project || t("Untitled plan") }), LIMITS.short);
        copy.updated = now();
        ws.plans.push(copy);
        lastSaved.set(copy.id, JSON.stringify(copy.plan));
        switchTo(copy.id);
        await saveStructure();
        toast(t("Plan duplicated."));
      }
      else if (b.id === "plSave") persist(true);
      else if (b.id === "plExportJson") App.safetyGate(plan, () => download(`peace-bridges-plan-backup-${today()}.json`, backupJson(), "application/json"));
      else if (b.id === "plExportMd") App.safetyGate(plan, () => download(`peace-bridges-plan-brief-${today()}.md`, briefMarkdown(plan), "text/markdown"));
      else if (b.id === "plCopy") App.safetyGate(plan, () => copyText(briefMarkdown(plan), t("Plan brief copied.")));
      else if (b.id === "plPrint") App.safetyGate(plan, () => printWith("print-brief"));
      else if (b.id === "plImportBtn") $("#plImport", mount).click();
      else if (b.id === "plVersions") openVersions(b);
      else if (b.id === "plDelete") deletePlan();
    });
    async function importFile(input) {
      const f = input.files && input.files[0];
      input.value = "";
      if (!f) return;
      if (f.size > LIMITS.importBytes) { toast(t("That file is too large to be a plan backup.")); return; }
      let parsed, incoming;
      try { parsed = JSON.parse(await f.text()); }
      catch (e) { toast(t("That file isn’t a readable backup (it is not valid JSON).")); return; }
      try { incoming = plansFromBackup(parsed); }
      catch (e) { toast(e && e.message ? e.message : t("That file isn’t a valid plan backup.")); return; }
      if (!incoming.length) { toast(t("That file has no plans in it.")); return; }
      const room = LIMITS.plans - ws.plans.length;
      if (room <= 0) { atLimit(); return; }
      const n = Math.min(room, incoming.length);
      const ok = await confirmDialog({ title: tn("Add {n} imported plan?", "Add {n} imported plans?", n), text: t("Imported plans are added next to your current plans, which stay as they are. You can switch between plans at the top of the planner."), ok: tn("Add {n} plan", "Add {n} plans", n), danger: false });
      if (!ok) return;
      await flush();
      const added = incoming.slice(0, n).map((p) => { const ne = newEntry(p); ne.updated = now(); lastSaved.set(ne.id, JSON.stringify(p)); return ne; });
      ws.plans.push(...added);
      switchTo(added[0].id);
      await saveStructure();
      toast(tn("{n} plan imported.", "{n} plans imported.", n));
      if(parsed.knowledgeVault){const notice=$("#vaultStatus");if(notice)notice.textContent="Plans imported. To restore vault records too, choose the same Export everything file in the vault import control.";reveal($("#vault"),$("#vaultImport"));}
    }
    async function deletePlan() {
      const name = plan.project || t("Untitled plan");
      const ok = await confirmDialog({ title: t("Delete this plan?"), text: t("This deletes “{name}” and its saved versions from this device. Your other plans stay. It can’t be undone. Export a backup first if you might need it.", { name }), ok: t("Delete plan") });
      if (!ok) return;
      const gone = entry.id;
      ws.plans = ws.plans.filter((e) => e.id !== gone);
      ws.removed.push({ id: gone, at: now() });
      lastSaved.delete(gone);
      dirty = false;
      try { localStorage.setItem("rpb_v1_migrated", "1"); } catch (e) { /* ignore */ }
      // Show the most recently saved remaining plan (or a fresh, empty one),
      // then save. A short list of deleted plans (ids and dates only, never
      // their content) is kept, so a copy still open in another tab can't
      // bring this plan back.
      ws.plans.sort((a, b) => (b.updated || "").localeCompare(a.updated || ""));
      ws.activeId = ws.plans.length ? ws.plans[0].id : null;
      ensurePlan();
      fill();
      await saveStructure();
      setSaveState(t("Plan deleted from this device."));
    }
    // Saved versions of the plan being edited.
    const vDlg = $("#dlgVersions");
    function openVersions(opener) {
      const list = $("#versionsList");
      list.replaceChildren(...(entry.history.length ? entry.history.map((v, i) => h("li", null,
        h("span", null, h("strong", { dir: "auto" }, v.plan.project || t("Untitled plan")), " ", h("span", { class: "note" }, fmtTime(v.at))),
        h("button", { type: "button", class: "btn btn--quiet btn--small", "data-restore": i }, t("Restore")))) : [h("li", null, t("No earlier versions yet. Versions are kept when you press Save now, and every ten minutes while you work."))]));
      openDialog(vDlg, opener);
    }
    $("#versionsList").addEventListener("click", async (e) => {
      const b = e.target.closest("[data-restore]");
      if (!b) return;
      const i = Number(b.dataset.restore);
      const v = entry.history[i];
      if (!v) return;
      entry.history.splice(i, 1);
      entry.history.unshift({ at: now(), plan: clone(plan) });
      entry.history = entry.history.slice(0, LIMITS.history);
      entry.plan = plan = sanitizePlan(v.plan);
      fill();
      closeDialog(vDlg);
      await persist(false);
      toast(t("Earlier version restored. Your previous plan is under Saved versions."));
    });
    // Another tab saved a change: offer to load it instead of overwriting.
    const reloadFromStore = async () => {
      const saved = await Store.get("workspace").catch(() => null);
      ws = workspaceFrom(saved) || { schema: 3, activeId: entry ? entry.id : null, plans: [], removed: [] };
      if (entry && ws.plans.some((e) => e.id === entry.id)) ws.activeId = entry.id;
      lastSaved.clear();
      dirty = false;
      ensurePlan();
      fill();
      setSaveState(t("Loaded the latest version."));
    };
    if (channel) channel.addEventListener("message", (e) => {
      if (!e.data || e.data.tab === TAB_ID || e.data.type !== "saved") return;
      toast(t("Your plans were changed in another tab."), { sticky: true, action: { label: t("Load latest"), fn: reloadFromStore } });
    });
    window.addEventListener("beforeunload", () => { if (dirty) persist(false); });

    // ----- Shared functions -----
    App.planBridge = (id) => {
      if (!bridgeById.has(id)) return;
      plan.bridge = id;
      el.bridge.value = id;
      drawMeasures();
      drawEvolution();
      drawImpact();
      drawKnowledge(); drawSystems(); drawCommons();
      changed();
      setTab("readiness");
      reveal($("#pl-basics"), el.project);
      toast(t("“{name}” is now the bridge in your plan.", { name: cBridge(bridgeById.get(id), "short") }));
    };
    App.addMilestone = (title) => {
      const x = addRow("timeline", { id: rid(), date: "", title: clip(title, LIMITS.title), status: "planned" });
      if (!x) return;
      setTab("timeline");
      reveal($("#panel-timeline"));
      toast(t("Added to the timeline of “{name}”.", { name: plan.project || t("Untitled plan") }));
    };
    App.getWorkspace = () => ws;
    App.resetPlanner = () => { ws = { schema: 3, activeId: null, plans: [], removed: [] }; lastSaved.clear(); dirty = false; ensurePlan(); fill(); setSaveState(""); };
    App.storeMode = storeMode;
    build();
    fill();
    const savedLine = () => setSaveState(entry.updated ? t("Saved on this device, {time}.", { time: fmtTime(entry.updated) }) : t("Not saved yet. Your plan saves automatically as you type."));
    savedLine();
    App.onLang("planner", () => { build(); fill(); savedLine(); });
    window.addEventListener("focus",refresh);
    window.addEventListener("beforeprint",refresh);
    document.addEventListener("visibilitychange",()=>{if(!document.hidden)refresh();});
    if (App.refreshInventory) App.refreshInventory();
    if (location.hash.startsWith("#pl-") || location.hash.startsWith("#q-")) { const target = $(location.hash); if (target) target.scrollIntoView(); }
  });

  /* ------------------------------------------------------------------
     15 SAFETY SCAN
     Before a plan is exported, copied or printed, look for details that
     could identify or locate people, in every part of the plan. The
     person decides what to do: the scan explains and never blocks.
     ------------------------------------------------------------------ */
  part("safety-scan", () => {
    const patterns = () => [
      { label: t("an email address"), re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi },
      { label: t("map coordinates"), re: /-?\d{1,2}\.\d{3,}\s*[,;]?\s*-?\d{1,3}\.\d{3,}/g },
      { label: t("map coordinates"), re: /\d{1,3}\s*°\s*\d{1,2}\s*['′]\s*(?:\d{1,2}(?:\.\d+)?\s*["″])?\s*[NSEW]/gi },
      { label: t("a map link"), re: /\b(?:maps\.google|google\.[a-z.]+\/maps|goo\.gl\/maps|maps\.app\.goo\.gl|openstreetmap\.org|maps\.apple\.com|what3words)\S*/gi },
      { label: t("a location code"), re: /\b[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3}\b/g },
      { label: t("a location code"), re: /\/\/\/[a-z]+\.[a-z]+\.[a-z]+/gi },
      { label: t("a phone number"), re: /\+?\d[\d\s().-]{7,}\d/g, check: (m) => m.replace(/\D/g, "").length >= 9 && !/^\d{4}\s*[-–]\s*\d{4}$/.test(m.trim()) },
      { label: t("a long ID number"), re: /\b\d{8,}\b/g }
    ];
    // Every free-text field in a plan, with the tab where it can be edited.
    function fieldsOf(plan) {
      return [
        ["Knowledge Vault", "vault", plan.vaultText || ""],
        [t("Plan name"), "readiness", plan.project], [t("General area"), "readiness", plan.place], [t("Notes"), "readiness", plan.notes],
        ...LocalGlossary.texts(plan.localGlossary).map(x=>["Community glossary", "localGlossary", x]),
        ...Decisions.texts(plan.decisions).map(x=>["Workshop decisions", "decisions", x]),
        ...Seeds.texts(plan.seeds).map(x=>["Seed register", "seeds", x]),
        ...TK.texts(plan.traditionalKnowledge).map(x=>["Traditional knowledge", "tk", x]),
        ...Hazard.texts(plan.hazard).map(x=>["Hazard prerequisite", "hazard", x]),
        ...Economics.texts(plan.economics).map(x=>["Restoration economics", "economics", x]),
        ...Stewardship.texts(plan.stewardship).map(x=>["Community stewardship", "stewardship", x]),
        ...Replication.texts(plan.replication).map(x=>["Replication registry", "replication", x]),
        ...Scenario.texts(plan.scenario).map(x=>["Scenario assumptions", "scenario", x]),
        ...Portfolio.texts(plan.portfolio).map(x=>["Portfolio", "portfolio", x]),
        ...Provenance.texts(plan.provenance).map(x=>["Contribution provenance", "provenance", x]),
        ...Forks.texts(plan).map(x => ["Plan attribution or fork baseline", "readiness", x]),
        ...Object.values(plan.evolution || {}).flatMap(e => e.history.map(x => ["Lifecycle review", "readiness", x.note])),
        ...Impact.texts(plan.impact).map(x => ["Impact measurement or learning review", "impact", x]),
        ...Knowledge.texts(plan.knowledge).map(x => ["Community knowledge or revision", "knowledge", x]),
        ...Systems.texts(plan.systems).map(x => ["Peace systems map or revision", "systems", x]),
        ...Commons.texts(plan.commons).map(x => ["Commons listing or revision", "commons", x]),
        ...plan.dividers.map((x) => [t("Dividers"), "readiness", x]),
        ...plan.connectors.map((x) => [t("Connectors"), "readiness", x]),
        ...plan.customMeasures.map((x) => [t("Your own measures"), "readiness", x]),
        ...plan.timeline.map((m) => [t("Timeline"), "timeline", m.title]),
        [t("Budget"), "budget", plan.budget.currency], ...plan.budget.lines.map((l) => [t("Budget"), "budget", l.item]),
        ...plan.risks.flatMap((r) => [[t("Risks"), "risks", r.text], [t("Risks"), "risks", r.owner], [t("Risks"), "risks", r.mitigation]]),
        ...plan.consent.flatMap((c) => [[t("Consent log"), "consent", c.groupOther], [t("Consent log"), "consent", c.conditions]])
      ];
    }
    // `plans`: one plan, or a list of { name, plan } to scan together.
    function scan(plans) {
      const list = Array.isArray(plans) ? plans : [{ name: "", plan: plans }];
      const PATTERNS = patterns();
      const found = [];
      const seen = new Set();
      for (const { name, plan } of list) {
        for (const [label, tab, value] of fieldsOf(plan)) {
          if (!value) continue;
          const where = name ? kv(name, label) : label;
          for (const p of PATTERNS) {
            p.re.lastIndex = 0;
            let m;
            while ((m = p.re.exec(value))) {
              const hit = m[0].trim();
              if (p.check && !p.check(hit)) continue;
              const key = where + "|" + hit;
              if (seen.has(key)) continue;
              seen.add(key);
              found.push({ where, tab, label: p.label, hit: clip(hit, 48) });
            }
          }
        }
      }
      return found;
    }
    App.scanPlan = scan;
    const dlg = $("#dlgSafety");
    let pending = null;
    let firstTab = "readiness";
    $("#dlgSafetyEdit").addEventListener("click", () => {
      pending = null;
      closeDialog(dlg);
      if (App.showPlanTab) App.showPlanTab(firstTab);
      if (firstTab === "readiness") { const f = $("#plNotes") || $("#plProject"); if (f) reveal($("#pl-notes") || f, f); }
      else { const panel = firstTab === "economics" ? $("#plEconomics") : firstTab === "stewardship" ? $("#plStewardship") : firstTab === "replication" ? $("#plReplication") : firstTab === "scenario" ? $("#plScenario") : firstTab === "portfolio" ? $("#plPortfolio") : firstTab === "provenance" ? $("#plProvenance") : firstTab === "vault" ? $("#vault") : firstTab === "systems" ? $("#plSystems") : firstTab === "commons" ? $("#commonsMount") : $("#panel-" + firstTab); if (panel) reveal(panel, $("input, textarea", panel) || panel); }
    });
    $("#dlgSafetyContinue").addEventListener("click", () => { const go = pending; pending = null; closeDialog(dlg); if (go) setTimeout(go, 40); });
    App.safetyGate = (plans, go) => {
      const found = scan(plans);
      if (!found.length) { go(); return; }
      pending = go;
      firstTab = found[0].tab;
      $("#safetyFindings").replaceChildren(...found.map((f) => h("li", null, t("{where}: looks like {what}:", { where: f.where, what: f.label }), " ", h("code", { dir: "ltr" }, f.hit))));
      openDialog(dlg);
      $("#dlgSafetyEdit").focus();
    };
  });

  /* ------------------------------------------------------------------
     16 YOUR DATA PANEL
     ------------------------------------------------------------------ */

  part('knowledge-vault', async()=>{
    await App.storeReady;
    App.vault = await window.RPB_VAULT_UI({h,mount:$("#vault"),Store,confirmDialog,download,
      safetyGate:(data,go)=>App.safetyGate({...emptyPlan(),vaultText:JSON.stringify(data)},go),
      getPlan:()=>{const ws=App.getWorkspace?.();return ws?.plans.find(e=>e.id===ws.activeId)?.plan;},
      changed:()=>{App.invalidateEvolutionSearch?.();App.refreshInventory?.();}});
    App.refreshInventory?.();
  });

  part("data-panel", () => {
    const inv = $("#inventory");
    const est = $("#storageEstimate");
    const modeText = () => ({ indexeddb: t("this browser’s database (IndexedDB)"), local: t("this browser’s local storage"), memory: t("memory only, because this browser blocks storage") });
    App.refreshInventory = async () => {
      const ws = App.getWorkspace ? App.getWorkspace() : null;
      const saved = ws ? ws.plans.filter((e) => e.updated) : [];
      const versions = saved.reduce((a, e) => a + e.history.length, 0);
      const newest = saved.map((e) => e.updated).sort().pop();
      const imported = [...I18N.packs.values()].filter((p) => !p.builtIn);
      let backup = false;
      try { backup = !!(await Store.get("workspace-v2-backup")); } catch (e) { backup = false; }
      setKids(inv,
        h("li", {lang:"en"}, (App.vault?.rows().length || 0) + " private Knowledge Vault records (stored separately from plans)."),
        h("li", null, t("Your display and language settings.")),
        h("li", null, saved.length
          ? tn("{n} plan saved on this device, last saved {time}.", "{n} plans saved on this device, last saved {time}.", saved.length, { time: fmtTime(newest) }) + " " + tn("{n} earlier saved version.", "{n} earlier saved versions.", versions)
          : t("No bridge plan is saved on this device.")),
        backup ? h("li", null, t("A copy of your plan from before the version 3 upgrade, kept so nothing is lost.")) : null,
        h("li", null, imported.length ? t("Language packs you imported: {list}.", { list: imported.map((p) => p.name).join(", ") }) : t("No imported language packs.")),
        h("li", null, t("Where it’s kept: {place}.", { place: modeText()[App.storeMode || Store.mode] || t("this browser") })),
        h("li", null, BUILD.mode === "bundle" && /^https?:$/.test(location.protocol) ? t("An offline copy of this app’s own files (no personal data).") : t("No offline copy in this mode.")));
      if (navigator.storage && navigator.storage.estimate) {
        try {
          const { usage } = await navigator.storage.estimate();
          if (typeof usage === "number") est.textContent = t("This site uses about {mb} MB on this device, most of it the app’s offline files.", { mb: fmtNum(usage / 1048576, { maximumFractionDigits: usage > 10485760 ? 0 : 1 }) });
        } catch (e) { /* ignore */ }
      }
    };
    App.renderHealth = () => {
      let line = $("#appHealth");
      if (!line) { line = h("p", { class: "note", id: "appHealth" }); inv.after(line); }
      // data-state lets tests and tools read the result in any language.
      line.dataset.state = health.failed.length ? "failed" : health.pending ? "starting" : "ok";
      line.textContent = health.failed.length
        ? tn("App health: {n} part did not start ({list}). Everything else works. Reloading may help.", "App health: {n} parts did not start ({list}). Everything else works. Reloading may help.", health.failed.length, { list: health.failed.join(", ") })
        : t("App health: all {n} parts started normally.", { n: fmtNum(health.started.length) });
    };
    App.onLang("data-panel", () => { App.refreshInventory(); App.renderHealth(); });
    $("#dataActions").hidden = false;
    $("#ttlField").hidden = false;
    $("#btnExportCsv").hidden = false;
    $("#btnExportCsv").addEventListener("click", () => App.exportCsv && App.exportCsv());
    const ttl = $("#ttlSelect");
    ttl.value = String(App.prefs().ttl || 0);
    ttl.addEventListener("change", () => {
      const p = App.prefs();
      p.ttl = Number(ttl.value) || 0;
      writePrefs();
      toast(p.ttl ? tn("Plans will be deleted after {n} day without changes.", "Plans will be deleted after {n} days without changes.", p.ttl) : t("Automatic deletion is off."));
    });
    $("#btnExportAll").addEventListener("click", async () => {
      const ws = App.getWorkspace ? App.getWorkspace() : null;
      let previous = null;
      try { previous = await Store.get("workspace-v2-backup"); } catch (e) { previous = null; }
      let knowledgeVault; try {knowledgeVault=window.RPB_VAULT.clean(await Store.get("knowledge-vault"));} catch(err){toast("Vault could not be read; backup was not exported: "+err.message);return;}
      const packs = [...I18N.packs.values()].filter((p) => !p.builtIn).map((p) => ({ lang: p.lang, name: p.name, status: p.status, fingerprint: p.fingerprint }));
      const go = () => download(`peace-bridges-everything-${today()}.json`, JSON.stringify({ schema: 3, kind: "everything", app: "regenerative-peace-bridges", version: D.meta.version, exported: new Date().toISOString(), preferences: App.prefs(), workspace: ws, knowledgeVault, versionTwoBackup: previous || undefined, importedLanguagePacks: packs }, null, 2), "application/json");
      if (App.safetyGate) App.safetyGate([...(ws?.plans || []).map((e) => ({ name: e.plan.project || t("Untitled plan"), plan: e.plan })), {name:"Knowledge Vault",plan:{...emptyPlan(),vaultText:JSON.stringify(knowledgeVault)}}], go); else go();
    });
    const persistBtn = $("#btnPersist");
    if (!(navigator.storage && navigator.storage.persist)) persistBtn.hidden = true;
    else persistBtn.addEventListener("click", async () => {
      try {
        const ok = await navigator.storage.persist();
        toast(ok ? t("Persistent storage granted. Clearing browser data still deletes it; keep external backups.") : t("This browser chose not to protect the data. Export a backup to be safe."));
      } catch (e) { toast(t("This browser doesn’t allow protected storage here. Export a backup to be safe.")); }
    });
    $("#btnWipe").addEventListener("click", async () => {
      const ok = await confirmDialog({ title: t("Delete everything on this device?"), text: t("This deletes your plans, their saved versions, any version 1 draft, the pre-upgrade copy, imported language packs and your display and language settings from this browser. The app’s own offline files stay so it keeps working; they hold none of your data. This can’t be undone."), ok: t("Delete everything") });
      if (!ok) return;
      try { await Store.clearAll(); } catch(err) { toast('Deletion failed; data may remain on this device: '+err.message); return; }
      App.vault?.reset();
      prefs = { ...PREF_DEFAULTS };
      for (const [code, p] of [...I18N.packs]) if (!p.builtIn) I18N.packs.delete(code);
      if (App.restoreBuiltInPacks) App.restoreBuiltInPacks();
      applyPrefs();
      App.syncPrefsForm && App.syncPrefsForm();
      ttl.value = "0";
      App.setLanguage("en");
      App.resetPlanner && App.resetPlanner();
      await App.refreshInventory();
      toast(t("Everything was deleted from this device."));
    });
    App.refreshInventory();
  });

  /* ------------------------------------------------------------------
     17 LANGUAGE PANEL
     Choose a language, see how complete and how checked it is, import a
     pack someone shared, download a template to translate, or export a
     pack to share. Every pack shows a fingerprint: the same pack always
     has the same fingerprint, so people can confirm they have identical
     text before using it in a meeting.
     ------------------------------------------------------------------ */
  // A pack as JSON. With `template`, every phrase and piece of content is
  // listed (untranslated ones empty), ready for translators.
  function packJson(p, template) {
    const cat = catalog();
    const out = {
      format: "rpb-language-pack", formatVersion: 1, app: "regenerative-peace-bridges", appVersion: D.meta.version,
      lang: p ? p.lang : "", name: p ? p.name : "", englishName: p ? p.englishName : "", dir: p ? p.dir : "ltr",
      status: p ? p.status : "draft", review: p ? Object.assign({}, p.review) : { by: "", date: "", notes: "" }
    };
    if (template) {
      out.instructions = [
        "Translate the empty values. Keep words in {curly brackets} exactly as they are: the app fills them in.",
        "\"strings\" are interface words. Those listed in \"reviewedOnly\" are safety, legal and guidance text: the app uses them only when \"status\" is \"reviewed\".",
        "\"content\" holds the sources, bridges, practices and meeting kit. Translate each \"text\" and leave its \"en\" unchanged: a translation is used only while the English it was made from is still current.",
        "Set \"status\" to \"reviewed\" only after people who speak the language, ideally from the communities who will use it, have checked every safety and consent text. Then fill in \"review\": who reviewed it (an organisation or group) and the date as YYYY-MM-DD.",
        "Leave anything you are unsure about empty: the English will show there instead.",
        "Plurals: a value may be an object with your language's forms, for example {\"one\": \"{n} source\", \"other\": \"{n} sources\"}. The forms are zero, one, two, few, many and other.",
        "Use \"dir\": \"rtl\" for languages written right to left, such as Arabic.",
        "Never put names, phone numbers or locations of real people in a language pack."
      ];
      out.reviewedOnly = [...cat.reviewed].sort();
      out.strings = {};
      for (const k of [...cat.ui, ...cat.reviewed].sort()) out.strings[k] = p && p.strings[k] !== undefined ? p.strings[k] : "";
      out.content = {};
      for (const [path, en] of contentIndex()) {
        const e = p && p.entries[path];
        out.content[path] = { en, text: e && keyOf(e.en) === keyOf(en) ? e.text : "" };
      }
    } else {
      out.strings = Object.assign({}, p.strings);
      out.content = {};
      for (const path of Object.keys(p.entries)) out.content[path] = Object.assign({}, p.entries[path]);
    }
    return JSON.stringify(out, null, 2);
  }
  const storedPack = (p) => JSON.parse(packJson(p, false));

  part("language-panel", () => {
    const dlg = $("#dlgLanguage");
    const sel = $("#langSelect");
    const status = $("#langStatus");
    const contentEn = $("#langContentEn");
    const contentWrap = $("#langContentEnWrap");
    const file = $("#langFile");
    const bar = $("#langBar");
    const BUILTIN = new Map([...I18N.packs].filter(([, p]) => p.builtIn));
    App.restoreBuiltInPacks = () => { for (const [code, p] of BUILTIN) I18N.packs.set(code, p); };
    const statusWord = (p) => (p.status === "reviewed" ? t("reviewed") : t("draft"));

    function fillOptions() {
      const packs = [...I18N.packs.values()].sort((a, b) => (a.englishName || a.name).localeCompare(b.englishName || b.name, "en"));
      sel.replaceChildren(h("option", { value: "en", lang: "en", dir: "ltr" }, "English"),
        ...packs.map((p) => h("option", { value: p.lang },
          `${p.name}${p.englishName && p.englishName !== p.name ? " (" + p.englishName + ")" : ""} · ${statusWord(p)}${p.builtIn ? "" : " · " + t("imported")}`)));
      sel.value = I18N.lang;
    }
    function renderStatus() {
      const p = I18N.pack;
      $("#langExport").hidden = !p;
      $("#langRemove").hidden = !p || p.builtIn;
      contentWrap.hidden = !(p && p.status === "reviewed" && p.stats.content > 0);
      contentEn.checked = !!prefs.contentEn;
      if (!p) {
        status.replaceChildren(h("p", null, t("English is built in and complete.")));
        return;
      }
      const st = p.stats;
      setKids(status,
        h("p", null, h("strong", { lang: p.lang, dir: p.dir }, p.name), " · ",
          p.status === "reviewed" ? t("Reviewed by {by} on {date}.", { by: p.review.by, date: fmtDate(p.review.date) }) : t("Draft: not yet reviewed by people who speak the language.")),
        h("ul", { class: "langstatus__list" },
          h("li", null, t("Interface: {n} of {total} phrases translated.", { n: fmtNum(st.ui), total: fmtNum(st.uiTotal) })),
          h("li", null, p.status === "reviewed"
            ? t("Safety and guidance text: {n} of {total} phrases translated.", { n: fmtNum(st.reviewed), total: fmtNum(st.reviewedTotal) })
            : t("Safety and guidance text stays in English until the pack is reviewed.")),
          h("li", null, p.status === "reviewed"
            ? t("Content: {n} of {total} pieces translated.", { n: fmtNum(st.content), total: fmtNum(st.contentTotal) })
            : t("Sources, bridges, practices and the meeting kit stay in English until the pack is reviewed."))),
        h("p", { class: "note" }, t("Fingerprint:"), " ", h("code", { class: "fp", dir: "ltr" }, fpShort(p.fingerprint) || "…")),
        p.review.notes ? h("p", { class: "note" }, t("Review notes:"), " ", h("span", { lang: p.lang, dir: p.dir }, p.review.notes)) : null);
    }
    App.renderLangBar = () => {
      const p = I18N.pack;
      if (!p) { bar.hidden = true; return; }
      bar.hidden = false;
      bar.classList.toggle("langbar--draft", p.status !== "reviewed");
      $("#langBarBadge").textContent = `${p.name} · ${statusWord(p)}`;
      const pair = p.status === "reviewed"
        ? tx("Translation reviewed by {by} on {date}. Fingerprint {fp}.", { by: p.review.by, date: fmtDate(p.review.date), fp: fpShort(p.fingerprint) || "…" })
        : tx("Draft translation of the interface only. Safety guidance, consent text and content stay in English until people who speak this language review it.");
      const text = $("#langBarText");
      text.textContent = pair[0];
      markEn(text, pair[1]);
    };
    const refreshPanel = () => { fillOptions(); renderStatus(); App.renderLangBar(); };
    App.onLang("language-panel", refreshPanel);
    async function saveImported() {
      try { await Store.set("packs", [...I18N.packs.values()].filter((p) => !p.builtIn).map(storedPack)); }
      catch (e) { toast(t("The language pack works for now, but this browser couldn’t store it.")); }
      App.refreshInventory && App.refreshInventory();
    }
    const open = (e) => { refreshPanel(); openDialog(dlg, e && e.currentTarget); };
    $("#btnLanguage").addEventListener("click", open);
    $("#langBarChange").addEventListener("click", open);
    sel.addEventListener("change", () => { App.setLanguage(sel.value); sel.focus(); });
    contentEn.addEventListener("change", () => {
      prefs.contentEn = contentEn.checked;
      writePrefs();
      App.setLanguage(I18N.lang);
    });
    $("#langImport").addEventListener("click", () => file.click());
    $("#langTemplate").addEventListener("click", () => download(`peace-bridges-language-template-${I18N.lang}.json`, packJson(I18N.pack, true), "application/json"));
    $("#langExport").addEventListener("click", () => { const p = I18N.pack; if (p) download(`peace-bridges-language-${p.lang}-${p.status}.json`, packJson(p, false), "application/json"); });
    $("#langRemove").addEventListener("click", async () => {
      const p = I18N.pack;
      if (!p || p.builtIn) return;
      const ok = await confirmDialog({ title: t("Remove this language pack?"), text: t("This removes the {name} pack from this device.", { name: p.name }), ok: t("Remove pack") });
      if (!ok) return;
      I18N.packs.delete(p.lang);
      const builtIn = BUILTIN.get(p.lang);
      if (builtIn) I18N.packs.set(p.lang, builtIn);
      await saveImported();
      App.setLanguage(builtIn ? p.lang : "en");
      toast(t("Language pack removed."));
    });
    file.addEventListener("change", async () => {
      const f = file.files && file.files[0];
      file.value = "";
      if (!f) return;
      if (f.size > PACK_LIMITS.bytes) { toast(t("That file is too large to be a language pack.")); return; }
      let raw;
      try { raw = JSON.parse(await f.text()); }
      catch (e) { toast(t("That file isn’t a readable language pack (it is not valid JSON).")); return; }
      const res = validatePack(raw);
      if (!res.ok) { toast(res.errors.join(" "), { sticky: true }); return; }
      const p = res.pack;
      p.fingerprint = await fingerprintOf(p);
      const st = p.stats;
      const lines = [t("{name}: {ui} interface phrases, {rev} safety and guidance phrases and {content} pieces of content.", { name: p.name, ui: fmtNum(st.ui), rev: fmtNum(st.reviewed), content: fmtNum(st.content) })];
      if (res.notes.stale) lines.push(tn("{n} content translation was made from older English text, so the current English will show there.", "{n} content translations were made from older English text, so the current English will show there.", res.notes.stale));
      const skipped = res.notes.ignored + res.notes.placeholders;
      if (skipped) lines.push(tn("{n} entry was skipped because it doesn’t match this app.", "{n} entries were skipped because they don’t match this app.", skipped));
      if (p.status === "reviewed") lines.push(t("This pack says it was reviewed by {by} on {date}. Reviewed packs change safety guidance, consent text and content, so use it only if you trust who made it. Fingerprint: {fp}.", { by: p.review.by, date: fmtDate(p.review.date), fp: fpShort(p.fingerprint) }));
      const existing = I18N.packs.get(p.lang);
      if (existing) lines.push(existing.builtIn ? t("It will be used instead of the built-in draft for this language.") : t("It will replace the {name} pack you imported earlier.", { name: existing.name }));
      const ok = await confirmDialog({ title: t("Use this language pack?"), text: lines.join(" "), ok: t("Use this pack"), danger: false });
      if (!ok) return;
      I18N.packs.set(p.lang, p);
      await saveImported();
      App.setLanguage(p.lang);
      toast(t("Language pack added."));
    });

    // Fingerprints, then any packs imported earlier (they live in storage).
    (async () => {
      for (const p of BUILTIN.values()) p.fingerprint = await fingerprintOf(p);
      await App.storeReady;
      let stored = [];
      try { stored = (await Store.get("packs")) || []; } catch (e) { stored = []; }
      for (const raw of Array.isArray(stored) ? stored : []) {
        const res = validatePack(raw);
        if (!res.ok) continue;
        res.pack.fingerprint = await fingerprintOf(res.pack);
        I18N.packs.set(res.pack.lang, res.pack);
      }
      const wanted = prefs.lang || "en";
      if (wanted !== I18N.lang || (I18N.pack && I18N.packs.get(I18N.lang) !== I18N.pack)) App.setLanguage(I18N.packs.has(wanted) ? wanted : "en");
      else refreshPanel();
      App.refreshInventory && App.refreshInventory();
    })().catch(() => { /* the built-in languages still work */ });
    refreshPanel();
  });

  /* ------------------------------------------------------------------
     18 OFFLINE APP: service worker, updates, install, status
     ------------------------------------------------------------------ */
  part("offline-app", () => {
    const pill = $("#netStatus");
    const status = $("#offlineStatus");
    const isWeb = /^https?:$/.test(location.protocol);
    let statusKey = "default";
    const STATUS = () => ({
      default: t("Served from a website, this app keeps a copy of its own files so it opens without a connection. Opened directly from a folder, everything works except the offline copy and installing."),
      preview: t("This is an embedded preview. Offline use, installing, downloads and printing work in the downloadable version of the app."),
      single: t("This single-file version works offline as it is: keep the file and open it in any browser. Installing as an app needs the full folder version served from a website."),
      file: t("Opened directly from a folder: everything works, but the offline copy and installing need the app to be served from a website (or from a local server)."),
      ready: t("Offline copy ready: this app will open without a connection."),
      blocked: t("This browser didn’t allow an offline copy here. Everything else works while you’re online.")
    });
    const setStatus = (key) => { statusKey = key; status.textContent = STATUS()[key]; };
    const setPill = (state, text) => { pill.dataset.state = state; pill.textContent = text; };
    const refreshPill = () => {
      if (BUILD.mode === "preview") return setPill("local", t("Preview"));
      if (!isWeb) return setPill("local", t("Opened from a file"));
      const ready = navigator.serviceWorker && navigator.serviceWorker.controller;
      if (!navigator.onLine) return setPill("offline", ready ? t("Offline, saved copy") : t("Offline"));
      setPill(ready ? "ready" : "online", ready ? t("Offline-ready") : t("Online"));
    };
    window.addEventListener("online", refreshPill);
    window.addEventListener("offline", refreshPill);
    App.onLang("offline-app", () => { refreshPill(); setStatus(statusKey); });
    if (BUILD.mode === "preview") setStatus("preview");
    else if (BUILD.mode === "single") setStatus("single");
    else if (!isWeb) setStatus("file");
    else setStatus("default");
    refreshPill();
    window.RPB_PWA({h, mount:status.parentElement, mode:BUILD.mode, version:D.meta.version, download, confirmDialog, prepareUpdate:()=>App.prepareUpdate?.()});
    if (BUILD.mode !== "bundle" || !isWeb || !("serviceWorker" in navigator)) return;

    let askedToUpdate = false;
    const offerUpdate = (worker) => toast(t("A new version of this app is ready."), { sticky: true, action: { label: t("Reload"), fn: async () => { try { await App.prepareUpdate?.(); await window.RPB_PWA.unpin?.(); askedToUpdate = true; worker.postMessage({ type: "SKIP_WAITING" }); } catch(e) { toast(e.message); } } } });
    navigator.serviceWorker.register("./sw.js").then((reg) => {
      if (reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg.waiting);
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener("statechange", () => {
          if (nw.state === "installed" && navigator.serviceWorker.controller) offerUpdate(nw);
          if (nw.state === "activated") { refreshPill(); setStatus("ready"); }
          if (nw.state === "redundant") { status.textContent="Offline update could not be installed. Your previous release is retained. Check connection and device storage, export backups, then retry."; }
        });
      });
      if (navigator.serviceWorker.controller) setStatus("ready");
    }).catch(() => setStatus("blocked"));
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      refreshPill();
      if (askedToUpdate) { askedToUpdate = false; location.reload(); }
    });
    // The install button appears only when the browser offers installation.
    let deferred = null;
    const installBtn = $("#btnInstall");
    window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; installBtn.hidden = false; });
    installBtn.addEventListener("click", async () => {
      if (!deferred) return;
      try { await deferred.prompt(); } catch(e) { toast("Installation was unavailable. Use the browser menu or keep the standalone HTML."); }
      try { await deferred.userChoice; } catch (e) { /* ignore */ }
      deferred = null;
      installBtn.hidden = true;
    });
    window.addEventListener("appinstalled", () => { installBtn.hidden = true; toast(t("Installed. Open it from your apps.")); });
  });

  /* ------------------------------------------------------------------
     19 KEYBOARD SHORTCUTS AND LINKS INTO THE PAGE
     ------------------------------------------------------------------ */
  part("shortcuts-and-links", () => {
    document.addEventListener("keydown", (e) => {
      const el = e.target;
      const typing = el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
      if (document.querySelector("dialog[open]")) return;
      if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) { e.preventDefault(); App.openSearch && App.openSearch(); return; }
      if (typing || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "/") { e.preventDefault(); App.openSearch && App.openSearch(); }
      else if (e.key === "?") { e.preventDefault(); openDialog($("#dlgKeys")); }
    });
    // Links like #doc-…, #bridge-…, #practice-… open and highlight their target.
    const follow = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (id.startsWith("doc-") && App.gotoDoc) App.gotoDoc(id.slice(4));
      else if (id.startsWith("bridge-") && App.openBridge) App.openBridge(id.slice(7));
      else if (id.startsWith("practice-") && App.gotoPractice) App.gotoPractice(id.slice(9));
      else if (id.startsWith("kit-") && App.gotoKit) App.gotoKit(id);
    };
    window.addEventListener("hashchange", follow);
    if (location.hash) setTimeout(follow, 60);
    document.addEventListener("click", (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#doc-"]:not([data-doc])');
      if (a && !a.closest("#webMount")) { e.preventDefault(); App.gotoDoc(a.getAttribute("href").slice(5)); }
    });
  });

  // Start everything once the page has been parsed.
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

