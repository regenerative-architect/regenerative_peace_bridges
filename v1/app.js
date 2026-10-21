/* =====================================================================
   Regenerative Peace Bridges — app.js (v2.0.0)
   ---------------------------------------------------------------------
   Adds the interactive layer on top of a page that is already readable
   without JavaScript. Every part below starts inside its own safety net
   ("fail-safe startup"), so if one part fails the rest keeps working.

   PARTS (search for the numbers to jump around)
     0  Startup and fail-safe registry
     1  Small helpers (building elements, dates, text, downloads)
     2  Display preferences (theme, reading level, text, motion, glass)
     3  Local storage (IndexedDB, then localStorage, then memory)
     4  Hero scene: dawn light, drifting seeds, a bridge of light
     5  Table of contents, scroll highlighting and reading progress
     6  Evidence library: filters, cards, citations
     7  Evidence web: which sources support which bridges
     8  Solution bridges
     9  Healing and peace practices
     10 Glossary
     11 Search everything
     12 Bridge planner (readiness, who is in the room, brief, exports)
     13 Safety scan before anything leaves the device
     14 Your data panel (inventory, deletion, auto-delete)
     15 Offline app (service worker, updates, install, status)
     16 Keyboard shortcuts and links into the page

   PRIVACY PROMISE: nothing here sends data anywhere. There is no
   analytics, no tracking and no network request except loading the
   app's own files. Everything is stored in this browser only and can be
   deleted from "Your data and offline use".
   ===================================================================== */
(() => {
  "use strict";

  /* ------------------------------------------------------------------
     0  STARTUP AND FAIL-SAFE REGISTRY
     To add a feature: write `part("name", () => { ... })`. It will run
     at startup inside try/catch and appear in the app health line.
     ------------------------------------------------------------------ */
  const D = window.RPB;
  // Build mode: "bundle" (normal website folder), "single" (one shareable
  // file) or "preview" (embedded preview where downloads and printing are
  // not available). Set by tools/build-single.mjs for the last two.
  const BUILD = Object.assign({ mode: "bundle" }, window.RPB_BUILD || {});
  const parts = [];
  const health = { started: [], failed: [] };
  const App = {}; // shared functions between parts
  const part = (name, fn) => parts.push([name, fn]);

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
    for (const [name, fn] of parts) {
      try {
        const result = fn();
        if (result && typeof result.then === "function") {
          result.then(() => health.started.push(name), () => health.failed.push(name)).finally(() => App.renderHealth && App.renderHealth());
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
  // so content can't inject code. Usage: h("p", { class: "x" }, "Hello").
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
  // An external-link icon used next to "Open source".
  const extIcon = () => s("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", focusable: "false" },
    s("path", { d: "M9 3h4v4M13 3 7.5 8.5M12 9.5V13H3V4h3.5", fill: "none", stroke: "currentColor", "stroke-width": "1.6", "stroke-linecap": "round", "stroke-linejoin": "round" }));

  const safeUrl = (u) => { try { const x = new URL(u); return x.protocol === "https:" ? x.href : null; } catch (e) { return null; } };
  // Normalise text for searching: lower case, no accents, straight quotes.
  const norm = (t) => String(t || "").toLocaleLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’‘]/g, "'");
  const debounce = (fn, ms) => { let t = 0; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const seeded = (seed) => { let x = seed >>> 0; return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; };
  const today = () => new Date().toISOString().slice(0, 10);
  const docById = new Map(D ? D.documents.map((d) => [d.id, d]) : []);
  const bridgeById = new Map(D ? D.bridges.map((b) => [b.id, b]) : []);
  const practiceById = new Map(D ? D.practices.map((p) => [p.id, p]) : []);

  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  // "2026-09-24" -> "24 September 2026"; "2024-06" -> "June 2024"; "2012" -> "2012".
  function fmtDate(str, ongoing) {
    if (!str) return ongoing ? "Ongoing" : "Undated";
    const [y, m, d] = str.split("-").map(Number);
    let out = String(y);
    if (m && d) out = `${d} ${MONTHS[m - 1]} ${y}`;
    else if (m) out = `${MONTHS[m - 1]} ${y}`;
    return ongoing ? `Since ${out}` : out;
  }
  const fmtTime = (iso) => {
    try { return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }); } catch (e) { return iso; }
  };
  const sortKey = (d) => (d.date ? d.date.padEnd(10, "-00") : "0000");

  // What kind of evidence a document is, as a CSS class and a label.
  function evidenceOf(doc) {
    const type = D.types[doc.type] || { label: "Source", role: "howto" };
    if (doc.grade && type.role === "evidence") return { cls: "g-" + doc.grade, badge: doc.grade, label: D.grades[doc.grade].label, rank: { A: 0, B: 1, C: 2 }[doc.grade] ?? 3 };
    if (type.role === "context") return { cls: "g-context", badge: "Context", label: "Situation report", rank: 5 };
    return { cls: "g-howto", badge: "How-to", label: "Guidance", rank: 4 };
  }
  function gradeBadge(doc) {
    const ev = evidenceOf(doc);
    if (ev.cls === "g-context") return h("span", { class: "grade grade--context", title: "Describes a situation; does not test solutions" }, "Context");
    if (ev.cls === "g-howto") return h("span", { class: "grade grade--howto", title: "Guidance or standard; not proof that something works" }, "How-to");
    return h("span", { class: "grade grade--" + doc.grade, title: `Evidence strength ${doc.grade}: ${ev.label}` }, doc.grade);
  }

  // Short notices at the bottom of the screen. `action` adds a button.
  function toast(message, opts = {}) {
    const box = $("#toasts");
    if (!box) return;
    const el = h("div", { class: "toast" }, h("span", null, message));
    if (opts.action) {
      el.append(h("button", { type: "button", onclick: () => { el.remove(); opts.action.fn(); } }, opts.action.label));
    }
    if (opts.sticky) el.append(h("button", { type: "button", "aria-label": "Dismiss notice", onclick: () => el.remove() }, "Dismiss"));
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
  }

  // A confirmation step built into the page (browser pop-ups are not used).
  function confirmDialog({ title, text, ok = "Confirm", danger = true }) {
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
      toast(okMessage || "Copied to the clipboard.");
      return true;
    } catch (e) {
      showText("Copy text", text, "Your browser blocked automatic copying. The text is selected: copy it with your keyboard or menu.");
      return false;
    }
  }
  // Save a file to the device. In the embedded preview, offer copying instead.
  function download(filename, text, type) {
    if (BUILD.mode === "preview") {
      showText("Copy instead of downloading", text, `Downloads are not available in this preview. Copy the text below, or use the downloadable version of the app to save “${filename}”.`);
      return;
    }
    try {
      const url = URL.createObjectURL(new Blob([text], { type }));
      const a = h("a", { href: url, download: filename, hidden: true });
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast(`Download started: ${filename}`);
    } catch (e) {
      showText("Copy instead of downloading", text, "Your browser blocked the download. Copy the text below instead.");
    }
  }
  const canPrint = () => BUILD.mode !== "preview" && typeof window.print === "function";

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
     2  DISPLAY PREFERENCES
     Stored in this browser only (key "rpb_prefs_v2"). "Reset display
     settings" removes them. early.js applies them before first paint.
     ------------------------------------------------------------------ */
  const PREF_KEY = "rpb_prefs_v2";
  const PREF_DEFAULTS = { theme: "system", level: "full", text: "standard", spacing: "standard", motion: "auto", surface: "glass", ttl: 0 };
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
        note.textContent = App.lowPower ? "Animation paused automatically to save power on this device. Choose On to try again."
          : (reducedMotionMQ.matches && prefs.motion === "auto") ? "Your device asks for reduced motion, so animation starts off. You can still turn it on."
          : "";
      }
    };
    App.syncPrefsForm = sync;
    sync();
    dlg.addEventListener("change", (e) => {
      const t = e.target;
      if (!t || !t.name || !t.name.startsWith("pref-")) return;
      const key = t.name.slice(5);
      prefs[key] = t.value;
      if (key === "motion") App.lowPower = false;
      writePrefs();
      applyPrefs();
      sync();
      window.dispatchEvent(new CustomEvent("rpb:motion"));
    });
    $("#btnDisplay").addEventListener("click", (e) => { sync(); openDialog(dlg, e.currentTarget); });
    $("#btnResetDisplay").addEventListener("click", () => {
      const ttl = prefs.ttl;
      prefs = { ...PREF_DEFAULTS, ttl };
      writePrefs();
      try { localStorage.removeItem("rpb_theme"); } catch (e) { /* ignore */ }
      applyPrefs();
      sync();
      window.dispatchEvent(new CustomEvent("rpb:motion"));
      toast("Display settings reset.");
    });
    $("#btnShortcuts").addEventListener("click", () => { closeDialog(dlg); openDialog($("#dlgKeys")); });
    reducedMotionMQ.addEventListener && reducedMotionMQ.addEventListener("change", () => { applyPrefs(); sync(); window.dispatchEvent(new CustomEvent("rpb:motion")); });
    // Keep the browser bar colour in step with the theme.
    const meta = $('meta[name="theme-color"]');
    const paintBar = () => { if (meta) meta.setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--canopy").trim() || "#123b36"); };
    paintBar();
    window.addEventListener("rpb:prefs", paintBar);
  });

  /* ------------------------------------------------------------------
     3  LOCAL STORAGE
     Tries IndexedDB first (roomy, structured), then localStorage, then
     memory only (with a visible warning to export). Keys used:
       "workspace" -> { schema: 2, plan, history[], updated }
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
    function tx(type, work) {
      return new Promise((resolve, reject) => {
        const t = db.transaction(STORE, type);
        const req = work(t.objectStore(STORE));
        t.oncomplete = () => resolve(req ? req.result : undefined);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      });
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
      async get(key) {
        if (mode === "indexeddb") return tx("readonly", (st) => st.get(key));
        if (mode === "local") { const v = localStorage.getItem(LS_PREFIX + key); return v ? JSON.parse(v) : undefined; }
        return mem.get(key);
      },
      async set(key, value) {
        if (mode === "indexeddb") return tx("readwrite", (st) => st.put(value, key));
        if (mode === "local") return localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
        mem.set(key, value);
      },
      async del(key) {
        if (mode === "indexeddb") return tx("readwrite", (st) => st.delete(key));
        if (mode === "local") return localStorage.removeItem(LS_PREFIX + key);
        mem.delete(key);
      },
      async clearAll() {
        if (db) { try { await tx("readwrite", (st) => st.clear()); } catch (e) { /* ignore */ } }
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
     4  HERO SCENE
     A dawn sky drawn on canvas: light shafts from a rising sun, drifting
     seeds and pollen with real depth of field (soft, rimmed bokeh up
     close, sharp specks far away), and several hundred points of light
     that rise from one bank and gather into a bridge, mirrored in the
     river. It adapts to the device: fewer particles on slow hardware,
     paused when off screen, and a still frame when motion is off.
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
        sun.tx = ((e.clientX - r.left) / r.width - 0.5) * 30;
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
     5  TABLE OF CONTENTS, SCROLL HIGHLIGHTING, READING PROGRESS
     ------------------------------------------------------------------ */
  part("contents", () => {
    const sections = $$("main > section[id]");
    const list = $("#tocList");
    const mobile = $("#tocListMobile");
    const build = (target, withSubs) => {
      target.replaceChildren();
      for (const sec of sections) {
        const title = $("h2", sec);
        const li = h("li", null, h("a", { href: "#" + sec.id, "data-for": sec.id }, title ? title.textContent : sec.id));
        if (withSubs && sec.id === "bridges") {
          li.append(h("ol", { class: "toc__sub" }, D.bridges.map((b) => h("li", null, h("a", { href: "#bridge-" + b.id, "data-bridge": b.id }, b.short)))));
        }
        target.append(li);
      }
    };
    build(list, true);
    build(mobile, false);
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
    const links = (id) => $$(`a[data-for="${id}"], .topbar__quick a[href="#${id}"]`);
    let current = null;
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
     6  EVIDENCE LIBRARY
     Filters: words, topic, kind of source, evidence strength, sort order.
     ------------------------------------------------------------------ */
  part("library", () => {
    const mount = $("#libraryMount");
    const filters = $("#libraryFilters");
    const count = $("#libraryCount");
    const state = { q: "", topic: "", type: "", grade: "", sort: "newest" };
    const usedBy = new Map();
    for (const b of D.bridges) for (const id of b.docs) { if (!usedBy.has(id)) usedBy.set(id, []); usedBy.get(id).push(b); }
    const topicLabel = new Map(D.topics.map((t) => [t.id, t.label]));
    const haystack = new Map(D.documents.map((d) => [d.id, norm([d.title, d.org, d.authors, d.summary, d.key, d.limits, (D.types[d.type] || {}).label, d.topics.map((t) => topicLabel.get(t)).join(" ")].join(" "))]));

    // Filter controls
    const q = h("input", { type: "search", id: "libQ", autocomplete: "off", spellcheck: "false", placeholder: "Words in titles, summaries or publishers" });
    const typeSel = h("select", { id: "libType" }, h("option", { value: "" }, "All kinds"), Object.entries(D.types).map(([k, v]) => h("option", { value: k }, v.label)));
    const gradeSel = h("select", { id: "libGrade" },
      h("option", { value: "" }, "Any strength"),
      ["A", "B", "C"].map((g) => h("option", { value: g }, `${g}: ${D.grades[g].label}`)),
      h("option", { value: "howto" }, "How-to (guidance, standards, law)"),
      h("option", { value: "context" }, "Context (situation reports)"));
    const sortSel = h("select", { id: "libSort" },
      h("option", { value: "newest" }, "Newest first"),
      h("option", { value: "strength" }, "Strongest evidence first"),
      h("option", { value: "title" }, "Title A to Z"));
    const chips = h("div", { class: "chips", role: "group", "aria-label": "Filter by topic" },
      [{ id: "", label: "All topics" }, ...D.topics].map((t) => h("button", { type: "button", class: "chip", "data-topic": t.id, "aria-pressed": t.id === "" ? "true" : "false" }, t.label)));
    const clearBtn = h("button", { type: "button", class: "linkbtn", id: "libClear" }, "Clear all filters");
    const csvBtn = h("button", { type: "button", class: "btn btn--quiet btn--small", id: "libCsv" }, "Export the library as CSV");
    filters.append(
      h("div", { class: "field field--search" }, h("label", { for: "libQ" }, "Search the library"), q),
      h("div", { class: "field" }, h("label", { for: "libType" }, "Kind of source"), typeSel),
      h("div", { class: "field" }, h("label", { for: "libGrade" }, "Evidence strength"), gradeSel),
      h("div", { class: "field" }, h("label", { for: "libSort" }, "Order"), sortSel),
      chips,
      h("div", { class: "filters__actions" }, clearBtn, csvBtn)
    );
    filters.hidden = false;

    function citation(d) {
      const who = d.authors && !/^Press release|^Research team|^Independent/.test(d.authors) ? d.authors : d.org;
      const year = d.date ? d.date.slice(0, 4) : "n.d.";
      const link = d.doi ? "https://doi.org/" + d.doi : d.url;
      return `${who}. (${year}). ${d.title}. ${who === d.org ? "" : d.org + ". "}${link}`;
    }
    App.citation = citation;

    function card(d) {
      const type = D.types[d.type] || { label: "Source" };
      const url = safeUrl(d.url);
      const meta = h("dl", { class: "doc__meta" },
        h("dt", null, "Publisher"), h("dd", null, d.org),
        d.authors ? [h("dt", { "data-level": "detail" }, "Authors"), h("dd", { "data-level": "detail" }, d.authors)] : null,
        h("dt", null, "Published"), h("dd", null, h("time", { datetime: d.date || null }, fmtDate(d.date, d.ongoing))),
        d.doi ? [h("dt", { "data-level": "detail" }, "DOI"), h("dd", { "data-level": "detail" }, d.doi)] : null
      );
      const users = usedBy.get(d.id) || [];
      return h("article", { class: "doc", id: "doc-" + d.id, "aria-labelledby": "doc-t-" + d.id },
        h("div", { class: "doc__main" },
          h("div", { class: "doc__badges" }, gradeBadge(d), h("span", { class: "doc__type" }, type.label)),
          h("h3", { id: "doc-t-" + d.id }, d.title),
          h("p", { class: "doc__summary" }, d.summary),
          d.key ? h("p", { class: "doc__key", "data-level": "detail" }, d.key) : null,
          users.length ? h("p", { class: "note" }, "Supports: ", users.map((b, i) => [i ? ", " : "", h("a", { href: "#bridge-" + b.id, "data-bridge": b.id }, b.short)])) : null),
        h("div", { class: "doc__side" },
          meta,
          h("p", { class: "doc__limits" }, h("strong", null, "Keep in mind: "), d.limits),
          h("div", { class: "doc__actions" },
            url ? h("a", { class: "ext", href: url, target: "_blank", rel: "noopener noreferrer" }, "Open source", extIcon(), h("span", { class: "sr-only" }, " (opens the publisher’s site in a new tab)")) : h("span", { class: "note" }, "Link unavailable"),
            h("button", { type: "button", class: "linkbtn", "data-cite": d.id }, "Copy citation")),
          h("p", { class: "doc__checked" }, "Link checked ", h("time", { datetime: d.checked }, fmtDate(d.checked))))
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
      let docs = D.documents.filter(matches);
      if (state.sort === "newest") docs.sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
      else if (state.sort === "strength") docs.sort((a, b) => evidenceOf(a).rank - evidenceOf(b).rank || sortKey(b).localeCompare(sortKey(a)));
      else docs.sort((a, b) => a.title.localeCompare(b.title));
      const filtered = !!(state.q || state.topic || state.type || state.grade);
      const visible = filtered || showAll ? docs : docs.slice(0, FIRST);
      mount.replaceChildren(...visible.map(card));
      if (!docs.length) mount.append(h("p", { class: "empty" }, "No sources match these filters. ", h("button", { type: "button", class: "linkbtn", onclick: clearAll }, "Clear all filters")));
      if (visible.length < docs.length) {
        mount.append(h("button", { type: "button", class: "btn btn--quiet library__more", onclick: () => {
          showAll = true;
          render();
          const next = mount.children[FIRST];
          if (next) reveal(next);
        } }, `Show all ${docs.length} sources`));
      }
      count.textContent = visible.length === D.documents.length ? `Showing all ${visible.length} sources.` : `Showing ${visible.length} of ${D.documents.length} sources.`;
    }
    function clearAll() {
      showAll = true;
      Object.assign(state, { q: "", topic: "", type: "", grade: "" });
      q.value = ""; typeSel.value = ""; gradeSel.value = "";
      $$(".chip", chips).forEach((c) => c.setAttribute("aria-pressed", c.dataset.topic === "" ? "true" : "false"));
      render();
    }
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
    mount.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cite]");
      if (!b) return;
      const d = docById.get(b.getAttribute("data-cite"));
      if (d) copyText(citation(d), "Citation copied.");
    });
    // CSV export of the whole library (for spreadsheets and research).
    const csv = () => {
      const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const head = ["id", "title", "publisher", "authors", "date", "type", "evidence", "topics", "url", "doi", "link_checked"];
      const rows = D.documents.map((d) => [d.id, d.title, d.org, d.authors, d.date, (D.types[d.type] || {}).label, evidenceOf(d).badge, d.topics.join("; "), d.url, d.doi, d.checked].map(cell).join(","));
      return [head.join(","), ...rows].join("\r\n");
    };
    App.exportCsv = () => download(`peace-bridges-library-${today()}.csv`, csv(), "text/csv");
    csvBtn.addEventListener("click", App.exportCsv);
    // Make sure a card is visible (clearing filters if needed) and go to it.
    App.gotoDoc = (id) => {
      if (!document.getElementById("doc-" + id)) clearAll();
      const el = document.getElementById("doc-" + id);
      if (el) reveal(el);
    };
    render();
  });

  /* ------------------------------------------------------------------
     7  EVIDENCE WEB
     Sources on the left, bridges on the right, one line per link. Lines
     take the colour of the source's evidence strength.
     ------------------------------------------------------------------ */
  part("evidence-web", () => {
    const mount = $("#webMount");
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
    // role "group" (not "img"), because the diagram contains links people can use.
    const svg = s("svg", { viewBox: `0 0 ${VW} ${VH}`, role: "group", "aria-labelledby": "webTitle", "aria-describedby": "webDesc" },
      s("title", { id: "webTitle" }, "Evidence web"),
      s("desc", { id: "webDesc" }, `${used.length} sources linked to ${bridges.length} proposed bridges. A list version follows the diagram.`),
      s("text", { x: SX - 14, y: 24, "text-anchor": "end", class: "web__head" }, "Sources"),
      s("text", { x: BX + 16, y: 24, class: "web__head" }, "Bridges")
    );
    const linkLayer = s("g", { "aria-hidden": "true" });
    svg.append(linkLayer);
    const links = [];
    for (const b of bridges) {
      for (const id of b.docs) {
        const d = docById.get(id);
        if (!d) continue;
        const y1 = ys.get(id), y2 = yb.get(b.id);
        const path = s("path", { d: `M${SX + 6},${y1} C${SX + 140},${y1} ${BX - 120},${y2} ${BX},${y2}`, class: `web__link ${evidenceOf(d).cls}` });
        path.dataset.doc = id;
        path.dataset.bridge = b.id;
        links.push(path);
        linkLayer.append(path);
      }
    }
    const nodes = [];
    for (const d of used) {
      const y = ys.get(d.id);
      const ev = evidenceOf(d);
      const a = s("a", { href: "#doc-" + d.id, class: "web__node web__node--doc", "aria-label": `${d.short}, ${ev.badge === "How-to" || ev.badge === "Context" ? ev.badge : "evidence " + ev.badge}. Go to this source in the library.` },
        s("rect", { x: 8, y: y - ROW / 2 + 2, width: SX - 2, height: ROW - 4, rx: 8, class: "web__hit", fill: "transparent", stroke: "none" }),
        s("circle", { cx: SX, cy: y, r: 5.5, class: `web__dot ${ev.cls}` }),
        s("text", { x: SX - 14, y: y + 4.5, "text-anchor": "end" }, d.short));
      a.dataset.doc = d.id;
      nodes.push(a);
      svg.append(a);
    }
    for (const b of bridges) {
      const y = yb.get(b.id);
      const a = s("a", { href: "#bridge-" + b.id, class: "web__node web__node--bridge", "aria-label": `${b.short}: rests on ${b.docs.length} sources. Open this bridge.` },
        s("rect", { x: BX, y: y - 22, width: 320, height: 44, rx: 12 }),
        s("text", { x: BX + 16, y: y + 1 }, b.short),
        s("text", { x: BX + 16, y: y + 16, class: "web__sub" }, `${b.docs.length} sources`));
      a.dataset.bridge = b.id;
      nodes.push(a);
      svg.append(a);
    }
    const swipe = h("p", { class: "web__swipe", "aria-hidden": "true" }, "Swipe the diagram sideways to see the bridges, or read the list below.");
    const legend = h("div", { class: "web__legend", "aria-hidden": "true" },
      [["g-B", "B: moderate"], ["g-C", "C: emerging"], ["g-howto", "How-to"], ["g-context", "Context"]].map(([cls, label]) => h("span", null, h("i", { class: "web__swatch " + cls }), label)));
    const alt = h("details", { class: "web__alt" }, h("summary", null, "Read the evidence web as a list"),
      h("ul", null, bridges.map((b) => h("li", null, h("strong", null, b.short + ": "),
        b.docs.map((id, i) => { const d = docById.get(id); return d ? [i ? "; " : "", `${d.short} (${evidenceOf(d).badge})`] : null; })))));
    mount.replaceChildren(svg, swipe, legend, alt);
    // On phones the diagram needs sideways scrolling, so open the list too.
    if (window.matchMedia && window.matchMedia("(max-width: 640px)").matches) alt.open = true;

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
  });

  /* ------------------------------------------------------------------
     8  SOLUTION BRIDGES
     Each bridge is a <details> sheet. "Plan this bridge" fills in the
     planner. Text comes from data.js.
     ------------------------------------------------------------------ */
  part("bridges", () => {
    const mount = $("#bridgesMount");
    const chev = () => s("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", focusable: "false" }, s("path", { d: "m3 6 5 5 5-5", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }));
    const list = (items, ordered) => h(ordered ? "ol" : "ul", null, items.map((t) => h("li", null, t)));
    function sheet(b) {
      const docs = b.docs.map((id) => docById.get(id)).filter(Boolean).sort((x, y) => evidenceOf(x).rank - evidenceOf(y).rank);
      return h("details", { class: "bridge", id: "bridge-" + b.id },
        h("summary", null,
          h("div", { class: "bridge__head" },
            h("h3", { class: "bridge__name" }, b.name),
            h("p", { class: "bridge__plain" }, b.plain),
            h("div", { class: "bridge__row" },
              h("span", { class: "grade grade--D", title: "Every bridge is untested in a new place" }, "D"), h("span", null, "Proposal, untested here"),
              h("span", { class: "evbar", title: "Strength of the sources behind it" }, docs.map((d) => h("i", { class: evidenceOf(d).cls }))),
              h("span", null, `${docs.length} sources behind it`))),
          h("span", { class: "bridge__chev" }, chev())),
        h("div", { class: "bridge__body" },
          h("div", { class: "bridge__block" }, h("h4", null, "Where it comes from"), h("p", null, b.origin)),
          h("div", { class: "bridge__block" }, h("h4", null, "Who it could help"), h("p", null, b.helps)),
          h("div", { class: "bridge__block bridge__wide" }, h("h4", null, "What must be true first"), list(b.needs)),
          h("div", { class: "bridge__block bridge__block--risks" }, h("h4", null, "What could go wrong"), list(b.risks)),
          h("div", { class: "bridge__block bridge__block--safe" }, h("h4", null, "How to prevent harm"), list(b.safeguards)),
          h("div", { class: "bridge__first" }, h("h4", null, "Smaller, safer first step"), h("p", null, b.firstStep)),
          h("div", { class: "bridge__block", "data-level": "detail" }, h("h4", null, "How a pilot could start"), list(b.steps, true)),
          h("div", { class: "bridge__block", "data-level": "detail" }, h("h4", null, "What to measure"), list(b.measures)),
          h("div", { class: "bridge__block bridge__wide", "data-level": "detail" }, h("h4", null, "What it can connect"), h("p", null, b.connectors)),
          b.evidenceNote ? h("p", { class: "bridge__note" }, h("strong", null, "Evidence note: "), b.evidenceNote) : null,
          h("div", { class: "bridge__block bridge__wide" }, h("h4", null, "Evidence behind this bridge"),
            h("ul", { class: "bridge__sources" }, docs.map((d) => h("li", null, gradeBadge(d), h("a", { href: "#doc-" + d.id, "data-doc": d.id }, d.title))))),
          h("div", { class: "bridge__actions" },
            h("button", { type: "button", class: "btn btn--dawn", "data-plan": b.id }, "Plan this bridge"),
            h("button", { type: "button", class: "btn btn--quiet", "data-copy-bridge": b.id }, "Copy as text"))
        ));
    }
    mount.replaceChildren(...D.bridges.map(sheet));
    $("#bridgesToolbar").hidden = false;
    $("#bridgesOpenAll").addEventListener("click", () => $$(".bridge", mount).forEach((d) => (d.open = true)));
    $("#bridgesCloseAll").addEventListener("click", () => $$(".bridge", mount).forEach((d) => (d.open = false)));
    const asText = (b) => [
      b.name, "", b.plain, "", "Where it comes from: " + b.origin, "Who it could help: " + b.helps, "",
      "What must be true first:", ...b.needs.map((x) => "- " + x), "", "What could go wrong:", ...b.risks.map((x) => "- " + x), "",
      "How to prevent harm:", ...b.safeguards.map((x) => "- " + x), "", "Smaller, safer first step: " + b.firstStep, "",
      "What to measure:", ...b.measures.map((x) => "- " + x), "",
      "Status: a proposal, untested here. It needs the community’s free, prior and informed consent and an independent risk assessment.",
      "Source: Regenerative Peace Bridges (Planetary Restoration Archive)"
    ].join("\n");
    mount.addEventListener("click", (e) => {
      const plan = e.target.closest("[data-plan]");
      if (plan) { App.planBridge && App.planBridge(plan.getAttribute("data-plan")); return; }
      const cp = e.target.closest("[data-copy-bridge]");
      if (cp) { const b = bridgeById.get(cp.getAttribute("data-copy-bridge")); if (b) copyText(asText(b), "Bridge copied as text."); return; }
      const doc = e.target.closest("a[data-doc]");
      if (doc) { e.preventDefault(); App.gotoDoc(doc.getAttribute("data-doc")); }
    });
    App.openBridge = (id) => {
      const d = document.getElementById("bridge-" + id);
      if (!d) return;
      d.open = true;
      reveal(d, $("summary", d));
    };
  });

  /* ------------------------------------------------------------------
     9  HEALING AND PEACE PRACTICES
     ------------------------------------------------------------------ */
  part("practices", () => {
    const mount = $("#practicesMount");
    const filter = $("#practiceFilter");
    const kinds = { healing: "Healing", peace: "Peace", rights: "Rights and consent", safety: "Safety", regenerative: "Regenerative", accountability: "Accountability" };
    let active = "";
    const card = (p) => {
      const src = docById.get(p.source);
      return h("article", { class: "practice", id: "practice-" + p.id, "data-kind": p.kind, "aria-labelledby": "pr-t-" + p.id },
        h("span", { class: "practice__kind" }, kinds[p.kind] || p.kind),
        h("h3", { id: "pr-t-" + p.id }, p.name),
        h("p", { class: "practice__plain" }, p.plain),
        h("p", { class: "practice__when", "data-level": "detail" }, h("strong", null, "When: "), p.when),
        h("ol", null, p.steps.map((x) => h("li", null, x))),
        h("p", { class: "practice__care" }, h("strong", null, "Take care: "), p.care),
        src ? h("p", { class: "practice__src" }, "From: ", h("a", { href: "#doc-" + src.id, "data-doc": src.id }, src.short)) : null);
    };
    const render = () => mount.replaceChildren(...D.practices.filter((p) => !active || p.kind === active).map(card));
    filter.append(...[["", "All practices"], ...Object.entries(kinds)].map(([k, label]) =>
      h("button", { type: "button", class: "chip", "data-kind": k, "aria-pressed": k === "" ? "true" : "false" }, label)));
    filter.hidden = false;
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
      if (!document.getElementById("practice-" + id)) { active = ""; $$(".chip", filter).forEach((x) => x.setAttribute("aria-pressed", x.dataset.kind === "" ? "true" : "false")); render(); }
      reveal(document.getElementById("practice-" + id));
    };
    render();
  });

  /* ------------------------------------------------------------------
     10 GLOSSARY
     ------------------------------------------------------------------ */
  part("glossary", () => {
    const mount = $("#glossaryMount");
    const input = $("#glossaryInput");
    const render = () => {
      const qv = norm(input.value.trim());
      const items = D.glossary.filter((g) => !qv || norm(g.term + " " + g.def).includes(qv));
      const dl = h("dl", { class: "glossary" }, items.map((g) => h("div", { id: "term-" + norm(g.term).replace(/[^a-z0-9]+/g, "-") }, h("dt", null, g.term), h("dd", null, g.def))));
      mount.replaceChildren(items.length ? dl : h("p", { class: "empty" }, "No terms match. Try a shorter word."));
    };
    $("#glossaryFilter").hidden = false;
    input.addEventListener("input", debounce(render, 100));
    App.gotoTerm = (term) => { input.value = term; render(); reveal($("#glossary")); };
    render();
  });

  /* ------------------------------------------------------------------
     11 SEARCH EVERYTHING ( press / or Ctrl+K )
     ------------------------------------------------------------------ */
  part("search", () => {
    const dlg = $("#dlgSearch");
    const input = $("#searchInput");
    const out = $("#searchResults");
    const items = [];
    for (const d of D.documents) items.push({ type: "Source", title: d.title, text: [d.summary, d.key, d.limits, "Publisher: " + d.org + "."].filter(Boolean).join(" "), go: () => App.gotoDoc(d.id) });
    for (const b of D.bridges) items.push({ type: "Bridge", title: b.name, text: [b.plain, b.origin, b.helps, ...b.needs, ...b.risks, ...b.safeguards, b.firstStep, ...b.measures].join(" "), go: () => App.openBridge(b.id) });
    for (const p of D.practices) items.push({ type: "Practice", title: p.name, text: [p.plain, p.when, ...p.steps, p.care].join(" "), go: () => App.gotoPractice(p.id) });
    for (const g of D.glossary) items.push({ type: "Term", title: g.term, text: g.def, go: () => App.gotoTerm(g.term) });
    for (const m of $$("details.method")) {
      const title = $("summary h3", m);
      items.push({ type: "Method", title: title ? title.textContent : "Method", text: m.textContent, go: () => { m.open = true; reveal(m, $("summary", m)); } });
    }
    for (const sec of $$("main > section[id]")) {
      const title = $("h2", sec);
      if (title && ["start", "safeguards", "data", "about", "planner", "web"].includes(sec.id)) {
        items.push({ type: "Section", title: title.textContent, text: (sec.querySelector(".section__intro") || sec).textContent.slice(0, 600), go: () => reveal(sec, title) });
      }
    }
    for (const it of items) { it.nTitle = norm(it.title); it.nText = norm(it.text); }
    const ORDER = { Bridge: 0, Practice: 1, Source: 2, Method: 3, Term: 4, Section: 5 };
    let results = [];
    let sel = -1;

    function score(it, words) {
      let sc = 0;
      for (const w of words) {
        const inTitle = it.nTitle.includes(w);
        const inText = it.nText.includes(w);
        if (!inTitle && !inText) return 0;
        if (inTitle) sc += new RegExp("(^|[^a-z0-9])" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(it.nTitle) ? 8 : 5;
        if (inText) sc += 2;
      }
      return sc;
    }
    // Build text with <mark> around matches without using innerHTML.
    function marked(text, words) {
      const n = norm(text);
      const spans = [];
      for (const w of words) { let i = n.indexOf(w); while (i !== -1 && w) { spans.push([i, i + w.length]); i = n.indexOf(w, i + w.length); } }
      spans.sort((a, b) => a[0] - b[0]);
      const frag = document.createDocumentFragment();
      let at = 0;
      for (const [a, b] of spans) { if (a < at) continue; frag.append(text.slice(at, a), h("mark", null, text.slice(a, b))); at = b; }
      frag.append(text.slice(at));
      return frag;
    }
    function snippet(it, words) {
      const i = it.nText.indexOf(words[0] || "");
      if (i < 0) return it.text.slice(0, 140) + (it.text.length > 140 ? "…" : "");
      const from = Math.max(0, i - 50);
      return (from ? "…" : "") + it.text.slice(from, from + 150).trim() + (it.text.length > from + 150 ? "…" : "");
    }
    function run() {
      const words = norm(input.value.trim()).split(/\s+/).filter(Boolean);
      out.replaceChildren();
      sel = -1;
      if (!words.length) { results = []; out.append(h("li", { class: "note" }, "Type to search sources, bridges, practices, methods and terms.")); return; }
      results = items.map((it) => ({ it, sc: score(it, words) })).filter((r) => r.sc > 0)
        .sort((a, b) => b.sc - a.sc || ORDER[a.it.type] - ORDER[b.it.type]).slice(0, 24).map((r) => r.it);
      if (!results.length) { out.append(h("li", { class: "note" }, "Nothing found. Try another word, such as “water”, “consent” or “seed”.")); return; }
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
  });

  /* ------------------------------------------------------------------
     12 BRIDGE PLANNER
     A plan is saved automatically on this device. Shape (schema 2):
       { project, place, bridge, review, answers{questionId: yes|partly|no|unknown|na},
         who{groupId: met|planned|missing}, dividers[], connectors[], measures[],
         customMeasures[], notes }
     Version 1 drafts (project, place, notes) are imported automatically.
     ------------------------------------------------------------------ */
  const LIMITS = { short: 120, notes: 20000, item: 200, items: 12, measures: 30, importBytes: 200000 };
  const ANSWERS = [["yes", "Yes"], ["partly", "Partly"], ["no", "No"], ["unknown", "Not sure"], ["na", "Not applicable"]];
  const WHO = [["met", "Heard from"], ["planned", "Planned"], ["missing", "Not yet"]];
  const allQuestions = () => D.readiness.flatMap((d) => d.questions);
  const emptyPlan = () => ({ project: "", place: "", bridge: "", review: "", answers: {}, who: {}, dividers: [], connectors: [], measures: [], customMeasures: [], notes: "" });

  // Accept only known fields, types and lengths from anything imported.
  function sanitizePlan(raw) {
    const p = emptyPlan();
    if (!raw || typeof raw !== "object") throw new Error("not a plan");
    const str = (v, max) => (typeof v === "string" ? v.slice(0, max) : "");
    const list = (arr, maxItems, maxLen) => (Array.isArray(arr) ? arr.filter((x) => typeof x === "string" && x.trim()).slice(0, maxItems).map((x) => x.trim().slice(0, maxLen)) : []);
    p.project = str(raw.project, LIMITS.short);
    p.place = str(raw.place, LIMITS.short);
    p.notes = str(raw.notes, LIMITS.notes);
    p.bridge = bridgeById.has(raw.bridge) || raw.bridge === "other" ? raw.bridge : "";
    p.review = typeof raw.review === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.review) ? raw.review : "";
    const okA = new Set(ANSWERS.map((a) => a[0]));
    for (const q of allQuestions()) if (raw.answers && okA.has(raw.answers[q.id])) p.answers[q.id] = raw.answers[q.id];
    const okW = new Set(WHO.map((w) => w[0]));
    for (const g of D.stakeholders) if (raw.who && okW.has(raw.who[g.id])) p.who[g.id] = raw.who[g.id];
    p.dividers = list(raw.dividers, LIMITS.items, LIMITS.item);
    p.connectors = list(raw.connectors, LIMITS.items, LIMITS.item);
    p.measures = list(raw.measures, LIMITS.measures, LIMITS.item);
    p.customMeasures = list(raw.customMeasures, LIMITS.items, LIMITS.item);
    return p;
  }
  // Turn a backup file (version 1 or 2) into a clean plan.
  function planFromBackup(x) {
    if (!x || typeof x !== "object") throw new Error("Not a backup file.");
    if (x.schema === 1) {
      if (!["project", "place", "notes"].every((k) => typeof x[k] === "string")) throw new Error("This version 1 backup is missing fields.");
      return sanitizePlan({ project: x.project, place: x.place, notes: x.notes });
    }
    if (x.schema === 2 && x.plan) return sanitizePlan(x.plan);
    if (x.schema === 2 && x.workspace && x.workspace.plan) return sanitizePlan(x.workspace.plan);
    throw new Error("This file is not a Regenerative Peace Bridges backup.");
  }

  // Readiness: points per area, blockers and an overall verdict.
  function assess(plan) {
    const dims = D.readiness.map((dim) => {
      let got = 0, max = 0, answered = 0, blocked = false;
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
      return { id: dim.id, label: dim.label, got, max, answered, total: dim.questions.length, blocked, level };
    });
    const qs = allQuestions();
    const answered = qs.filter((q) => plan.answers[q.id]).length;
    const blockers = qs.filter((q) => q.critical && plan.answers[q.id] === "no");
    const unsure = qs.filter((q) => q.critical && !["yes", "no", "na"].includes(plan.answers[q.id]));
    const got = dims.reduce((a, d) => a + d.got, 0), max = dims.reduce((a, d) => a + d.max, 0);
    const overall = max ? got / max : 0;
    let verdict;
    if (!answered) verdict = { key: "start", title: "Not started", text: "Answer the readiness questions to see how strong this bridge is." };
    else if (blockers.length) verdict = { key: "pause", title: "Pause: resolve blockers first", text: "At least one essential condition is not met. Work on it with the community before going any further." };
    else if (unsure.length || overall < 0.6) verdict = { key: "groundwork", title: "Groundwork needed", text: "Some essentials are uncertain or incomplete. Find out more before any pilot." };
    else if (overall < 0.85) verdict = { key: "almost", title: "Almost ready", text: "The essentials are in place. Close the remaining gaps before a pilot." };
    else verdict = { key: "ready", title: "Ready for a small, closely watched pilot", text: "Start with the safer first step, keep listening, and be ready to stop." };
    return { dims, answered, total: qs.length, blockers, unsure, overall, verdict };
  }

  function briefMarkdown(plan) {
    const r = assess(plan);
    const b = bridgeById.get(plan.bridge);
    const label = (id) => (D.stakeholders.find((g) => g.id === id) || {}).label;
    const groups = (state) => D.stakeholders.filter((g) => plan.who[g.id] === state).map((g) => g.label);
    const unchecked = D.stakeholders.filter((g) => !plan.who[g.id]).map((g) => g.label);
    const lines = [
      `# Plan brief: ${plan.project || "Untitled bridge plan"}`, "",
      `- Bridge: ${b ? b.name : plan.bridge === "other" ? "Another idea" : "Not chosen yet"}`,
      `- General area: ${plan.place || "Not given"}`,
      `- Next community review: ${plan.review ? fmtDate(plan.review) : "Not set"}`,
      `- Prepared: ${fmtDate(today())} with Regenerative Peace Bridges ${D.meta.version}`, "",
      "## Readiness", "",
      `Overall: ${r.verdict.title} (${r.answered} of ${r.total} questions answered)`, "",
      ...r.dims.map((d) => `- ${d.label}: ${d.blocked ? "blocked" : `${d.got} of ${d.max} points`}`), ""
    ];
    if (r.blockers.length) lines.push("### Blockers to resolve first", "", ...r.blockers.map((q) => `- ${q.text}`), "");
    if (r.unsure.length) lines.push("### Essentials still to confirm", "", ...r.unsure.map((q) => `- ${q.text}`), "");
    lines.push("## Who is in the room", "",
      `- Heard from: ${groups("met").join("; ") || "none yet"}`,
      `- Planned: ${groups("planned").join("; ") || "none"}`,
      `- Not yet: ${[...groups("missing"), ...unchecked].join("; ") || "none"}`, "");
    if (plan.dividers.length) lines.push("## What divides people", "", ...plan.dividers.map((x) => `- ${x}`), "");
    if (plan.connectors.length) lines.push("## What connects people", "", ...plan.connectors.map((x) => `- ${x}`), "");
    const measures = [...plan.measures, ...plan.customMeasures];
    if (measures.length) lines.push("## What to measure", "", ...measures.map((x) => `- ${x}`), "");
    if (b) lines.push("## Smaller, safer first step", "", b.firstStep, "");
    if (plan.notes.trim()) lines.push("## Notes and local validation questions", "", plan.notes.trim(), "");
    lines.push("---", "",
      "Every bridge is a proposal until the community has been consulted, risks have been checked and results have been measured.",
      "Zero Harm and Anti-Coercion: do not use this plan to identify, locate, profile, pressure or target anyone. Aid is never conditional on participation.");
    void label;
    return lines.join("\n");
  }

  part("planner", async () => {
    const mount = $("#plannerMount");
    let ws = { schema: 2, plan: emptyPlan(), history: [], updated: null };
    let dirty = false;
    let saveState = "";
    const TAB = Math.random().toString(36).slice(2);
    const channel = "BroadcastChannel" in window ? new BroadcastChannel("rpb-v2") : null;
    const storeMode = await Store.init().catch(() => "memory");

    // ----- Load, migrate from version 1, and apply auto-delete -----
    try {
      const saved = await Store.get("workspace");
      if (saved && saved.schema === 2) {
        ws = { schema: 2, plan: sanitizePlan(saved.plan), history: Array.isArray(saved.history) ? saved.history.slice(0, 5).map((v) => ({ at: v.at, plan: sanitizePlan(v.plan) })) : [], updated: saved.updated || null };
      } else {
        let v1 = null, migrated = false;
        try { v1 = JSON.parse(localStorage.getItem("rpb_draft") || "null"); migrated = localStorage.getItem("rpb_v1_migrated") === "1"; } catch (e) { /* ignore */ }
        if (v1 && v1.schema === 1 && !migrated) {
          ws.plan = sanitizePlan({ project: v1.project, place: v1.place, notes: v1.notes });
          ws.updated = new Date().toISOString();
          await Store.set("workspace", ws);
          try { localStorage.setItem("rpb_v1_migrated", "1"); } catch (e) { /* ignore */ }
          setTimeout(() => toast("Your version 1 draft is now in the new planner.", { ms: 7000 }), 600);
        }
      }
      const ttl = Number(App.prefs().ttl) || 0;
      if (ttl > 0 && ws.updated && Date.now() - Date.parse(ws.updated) > ttl * 86400000) {
        await Store.del("workspace");
        ws = { schema: 2, plan: emptyPlan(), history: [], updated: null };
        setTimeout(() => toast(`Your plan was deleted automatically after ${ttl} days without changes, as you asked.`, { sticky: true }), 600);
      }
    } catch (e) {
      ws = { schema: 2, plan: emptyPlan(), history: [], updated: null };
    }
    let plan = ws.plan;

    // ----- Build the form -----
    const field = (id, label, control, hint) => {
      if (hint) control.setAttribute("aria-describedby", id + "-hint");
      return h("div", { class: "field" }, h("label", { for: id }, label), control, hint ? h("p", { class: "field__hint", id: id + "-hint" }, hint) : null);
    };
    const inProject = h("input", { type: "text", id: "plProject", maxlength: LIMITS.short, autocomplete: "off", placeholder: "For example: Community-led water restoration" });
    const inBridge = h("select", { id: "plBridge" }, h("option", { value: "" }, "Choose a bridge (optional)"), D.bridges.map((b) => h("option", { value: b.id }, b.short)), h("option", { value: "other" }, "Another idea"));
    const inPlace = h("input", { type: "text", id: "plPlace", maxlength: LIMITS.short, autocomplete: "off", placeholder: "A district, province or region", "aria-describedby": "plPlace-warn" });
    const inReview = h("input", { type: "date", id: "plReview" });
    const inNotes = h("textarea", { id: "plNotes", rows: 7, maxlength: LIMITS.notes, placeholder: "What did people say? What still needs checking locally?" });

    const stepBasics = h("fieldset", { class: "pstep", id: "pl-basics" },
      h("legend", null, h("span", { class: "pstep__num" }, "1"), "The basics"),
      h("div", { class: "grid-2" },
        field("plProject", "Plan name", inProject),
        field("plBridge", "Bridge", inBridge),
        h("div", { class: "field" }, h("label", { for: "plPlace" }, "General area (optional)"), inPlace,
          h("p", { class: "warnline", id: "plPlace-warn" }, "Use a district, province or region. Never enter coordinates, addresses, or the locations of homes, schools, shelters or water points.")),
        field("plReview", "Next community review", inReview, "When will the community look at this plan again?")));

    const readiness = h("fieldset", { class: "pstep", id: "pl-readiness" },
      h("legend", null, h("span", { class: "pstep__num" }, "2"), "Readiness check"),
      h("p", { class: "pstep__intro" }, "Answer honestly, ideally together with community representatives. Questions marked ", h("span", { class: "q__flag" }, "Essential"), " must be “Yes” or “Not applicable” before any pilot."));
    for (const dim of D.readiness) {
      const box = h("div", { class: "dim", id: "dim-" + dim.id }, h("h3", { class: "dim__title" }, dim.label, h("span", { class: "dim__score", id: "dimScore-" + dim.id })));
      for (const q of dim.questions) {
        const pr = practiceById.get(q.practice);
        box.append(h("fieldset", { class: "q", id: "q-" + q.id },
          h("legend", null, q.critical ? h("span", { class: "q__flag" }, "Essential") : null, q.text),
          h("div", { class: "pills" }, ANSWERS.map(([v, label]) => h("label", { class: "pill" }, h("input", { type: "radio", name: "ans-" + q.id, value: v }), h("span", null, label)))),
          pr ? h("p", { class: "q__help" }, "Help with this: ", h("a", { href: "#practice-" + pr.id, "data-practice": pr.id }, pr.name)) : null));
      }
      readiness.append(box);
    }

    const who = h("fieldset", { class: "pstep", id: "pl-who" },
      h("legend", null, h("span", { class: "pstep__num" }, "3"), "Who is in the room?"),
      h("p", { class: "pstep__intro" }, "Record groups, never named individuals. Hearing from children needs child-safe methods, trained facilitators and caregivers’ consent."),
      h("div", { class: "who" }, D.stakeholders.map((g) => h("div", { class: "who__row" },
        h("span", { id: "who-l-" + g.id }, g.label),
        h("div", { class: "pills", role: "radiogroup", "aria-labelledby": "who-l-" + g.id }, WHO.map(([v, label]) => h("label", { class: "pill" }, h("input", { type: "radio", name: "who-" + g.id, value: v }), h("span", null, label))))))));

    function listEditor(key, label, hint, placeholder) {
      const ul = h("ul");
      const input = h("input", { type: "text", maxlength: LIMITS.item, id: "le-" + key, placeholder, autocomplete: "off" });
      const addBtn = h("button", { type: "button", class: "btn btn--quiet btn--small" }, "Add");
      const draw = () => {
        ul.replaceChildren(...plan[key].map((t, i) => h("li", null, h("span", null, t),
          h("button", { type: "button", class: "btn btn--quiet btn--small", "aria-label": `Remove “${t}”`, onclick: () => { plan[key].splice(i, 1); draw(); changed(); } }, "Remove"))));
      };
      const add = () => {
        const v = input.value.trim();
        if (!v) return;
        if (plan[key].length >= LIMITS.items) { toast(`You can list up to ${LIMITS.items} items here.`); return; }
        plan[key].push(v.slice(0, LIMITS.item));
        input.value = "";
        draw();
        changed();
      };
      addBtn.addEventListener("click", add);
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); add(); } });
      const el = h("div", { class: "listedit" }, h("label", { for: "le-" + key, class: "field__label" }, label), hint ? h("p", { class: "field__hint" }, hint) : null, ul, h("div", { class: "listedit__add" }, input, addBtn));
      el.redraw = draw;
      return el;
    }
    const edDividers = listEditor("dividers", "What divides people here?", "Issues and tensions, not people. For example: disputes over a well in the dry season.", "Add something that divides");
    const edConnectors = listEditor("connectors", "What connects people here?", "Shared places, habits or values. For example: the weekly market both groups use.", "Add something that connects");
    const dnh = h("fieldset", { class: "pstep", id: "pl-dnh" },
      h("legend", null, h("span", { class: "pstep__num" }, "4"), "Dividers and connectors"),
      h("p", { class: "pstep__intro" }, "From the Do No Harm method. Your project should weaken what divides and strengthen what connects. ", h("a", { href: "#practice-do-no-harm", "data-practice": "do-no-harm" }, "How to do this")),
      h("div", { class: "grid-2" }, edDividers, edConnectors));

    const measuresBox = h("div", { class: "checks", id: "plMeasures" });
    const edCustom = listEditor("customMeasures", "Your own measures", "Add what the community said matters.", "Add a measure");
    const measures = h("fieldset", { class: "pstep", id: "pl-measures" },
      h("legend", null, h("span", { class: "pstep__num" }, "5"), "What to measure"),
      h("p", { class: "pstep__intro" }, "Choose a few measures and take a baseline before work starts. Report only combined figures that can’t identify anyone."),
      measuresBox, edCustom);
    const GENERAL_MEASURES = ["The community’s own description of success", "Complaints raised and resolved", "Disputes reported and resolved", "Who benefits, by group and gender"];
    function drawMeasures() {
      const b = bridgeById.get(plan.bridge);
      const options = [...new Set([...(b ? b.measures : GENERAL_MEASURES), ...plan.measures])];
      measuresBox.replaceChildren(h("p", { class: "field__label" }, b ? `Suggested for ${b.short}` : "General suggestions"),
        ...options.map((m, i) => h("label", { class: "check" }, h("input", { type: "checkbox", value: m, id: "ms-" + i, checked: plan.measures.includes(m) }), h("span", null, m))));
    }
    measuresBox.addEventListener("change", (e) => {
      const cb = e.target;
      if (cb.type !== "checkbox") return;
      if (cb.checked && !plan.measures.includes(cb.value)) plan.measures.push(cb.value);
      if (!cb.checked) plan.measures = plan.measures.filter((m) => m !== cb.value);
      changed();
    });

    const notes = h("fieldset", { class: "pstep", id: "pl-notes" },
      h("legend", null, h("span", { class: "pstep__num" }, "6"), "Notes and local validation questions"),
      field("plNotes", "Notes", inNotes, "Write about issues, not individuals. Don’t record names, phone numbers or exact locations."));

    // Side panel: bridge strength picture, verdict, gaps and actions.
    const strengthSvg = s("svg", { viewBox: "0 0 300 128", role: "img", "aria-labelledby": "strengthTitle", class: "strength__svg" },
      s("title", { id: "strengthTitle" }, "Bridge strength: one plank for each readiness area"),
      s("rect", { x: 0, y: 84, width: 300, height: 44, class: "water" }),
      s("path", { d: "M0 128V62h38l14 8 6 58Z", class: "bank" }),
      s("path", { d: "M300 128V62h-38l-14 8-6 58Z", class: "bank" }),
      s("path", { d: "M52 68Q150 0 248 68", class: "cable" }));
    const plankW = 196 / 6;
    const planks = D.readiness.map((dim, i) => {
      const x = 52 + i * plankW;
      const cx = x + plankW / 2;
      const u = (cx - 150) / 98;
      strengthSvg.append(s("path", { d: `M${cx} ${68 - 68 * (1 - u * u) * 0.5 + 2}V${66}`, class: "cable" }));
      const r = s("rect", { x: x + 1, y: 66, width: plankW - 2, height: 9, rx: 2, class: "plank plank--0" }, s("title", null, dim.label));
      strengthSvg.append(r);
      return r;
    });
    const strengthList = h("ul", { class: "gaps", id: "strengthList" });
    const verdict = h("div", { class: "verdict", id: "verdict", "aria-live": "polite" });
    const gaps = h("div", { id: "gaps" });
    const savestate = h("p", { class: "savestate", id: "saveState", role: "status" });
    const fileInput = h("input", { type: "file", id: "plImport", accept: "application/json,.json", class: "sr-only", tabindex: "-1", "aria-label": "Choose a plan backup file to import" });
    const actions = h("div", { class: "side-actions" },
      h("button", { type: "button", class: "btn btn--dawn btn--wide", id: "plSave" }, "Save now"),
      h("button", { type: "button", class: "btn btn--quiet", id: "plExportJson" }, "Export backup"),
      h("button", { type: "button", class: "btn btn--quiet", id: "plImportBtn" }, "Import backup"),
      h("button", { type: "button", class: "btn btn--quiet", id: "plExportMd" }, "Export brief"),
      h("button", { type: "button", class: "btn btn--quiet", id: "plCopy" }, "Copy brief"),
      canPrint() ? h("button", { type: "button", class: "btn btn--quiet", id: "plPrint" }, "Print brief") : null,
      h("button", { type: "button", class: "btn btn--quiet", id: "plVersions" }, "Saved versions"),
      h("button", { type: "button", class: "btn btn--danger btn--wide", id: "plDelete" }, "Delete this plan"),
      fileInput);
    const side = h("section", { class: "planner__side", "aria-label": "Plan summary and actions" },
      h("div", { class: "side-card" }, h("h3", null, "Bridge strength"), h("div", { class: "strength" }, strengthSvg), strengthList, verdict, gaps,
        h("p", { class: "note" }, "A complete bridge means you asked the right questions. It does not mean the project is safe: only the people affected can judge that, and conditions change.")),
      h("div", { class: "side-card" }, h("h3", null, "Save and share"), savestate, actions,
        h("p", { class: "note" }, storeMode === "memory" ? "This browser is blocking storage, so your plan will be lost when you close the page. Export a backup to keep it." : "Saved only on this device. Before anything leaves it, a safety check looks for details that could identify people.")));
    const brief = h("section", { class: "brief", id: "brief", "aria-labelledby": "briefTitle" });
    mount.replaceChildren(h("div", { class: "planner" }, h("div", { class: "planner__main" }, stepBasics, readiness, who, dnh, measures, notes), side), brief);

    // ----- Fill the form from the plan -----
    function fill() {
      inProject.value = plan.project;
      inBridge.value = plan.bridge;
      inPlace.value = plan.place;
      inReview.value = plan.review;
      inNotes.value = plan.notes;
      for (const q of allQuestions()) for (const r of $$(`input[name="ans-${q.id}"]`, mount)) r.checked = plan.answers[q.id] === r.value;
      for (const g of D.stakeholders) for (const r of $$(`input[name="who-${g.id}"]`, mount)) r.checked = plan.who[g.id] === r.value;
      edDividers.redraw();
      edConnectors.redraw();
      edCustom.redraw();
      drawMeasures();
      refresh();
    }

    // ----- Live summary and brief -----
    function refresh() {
      const r = assess(plan);
      r.dims.forEach((d, i) => {
        planks[i].setAttribute("class", "plank plank--" + d.level);
        const score = $("#dimScore-" + d.id);
        if (score) score.textContent = d.blocked ? "Blocked" : d.answered ? `${d.got} of ${d.max} points` : "Not answered";
      });
      strengthList.replaceChildren(...r.dims.map((d) => h("li", null, `${d.label}: `, h("strong", null, d.blocked ? "blocked" : d.answered ? `${d.got} of ${d.max}` : "not answered"))));
      verdict.className = "verdict verdict--" + r.verdict.key;
      verdict.replaceChildren(h("p", { class: "verdict__title" }, r.verdict.title), h("p", null, r.verdict.text), h("p", { class: "note" }, `${r.answered} of ${r.total} questions answered.`));
      gaps.replaceChildren(
        r.blockers.length ? h("div", null, h("p", null, h("strong", null, "Blockers")), h("ul", { class: "gaps" }, r.blockers.map((q) => h("li", null, h("a", { href: "#q-" + q.id }, q.text))))) : "",
        r.answered && r.unsure.length ? h("div", null, h("p", null, h("strong", null, "Essentials to confirm")), h("ul", { class: "gaps" }, r.unsure.map((q) => h("li", null, h("a", { href: "#q-" + q.id }, q.text))))) : "");
      renderBrief(r);
    }
    function renderBrief(r) {
      const b = bridgeById.get(plan.bridge);
      const groups = (state) => D.stakeholders.filter((g) => plan.who[g.id] === state).map((g) => g.label);
      const notYet = [...groups("missing"), ...D.stakeholders.filter((g) => !plan.who[g.id]).map((g) => g.label)];
      const ms = [...plan.measures, ...plan.customMeasures];
      brief.replaceChildren();
      appendKids(brief, [
        h("h3", { id: "briefTitle" }, "Plan brief: ", plan.project || "Untitled bridge plan"),
        h("dl", { class: "brief__meta" },
          h("dt", null, "Bridge"), h("dd", null, b ? b.name : plan.bridge === "other" ? "Another idea" : "Not chosen yet"),
          h("dt", null, "General area"), h("dd", null, plan.place || "Not given"),
          h("dt", null, "Next review"), h("dd", null, plan.review ? fmtDate(plan.review) : "Not set"),
          h("dt", null, "Readiness"), h("dd", null, `${r.verdict.title} (${r.answered} of ${r.total} answered)`)),
        r.blockers.length ? [h("h4", null, "Blockers to resolve first"), h("ul", null, r.blockers.map((q) => h("li", null, q.text)))] : null,
        h("h4", null, "Who is in the room"),
        h("ul", null, h("li", null, "Heard from: ", groups("met").join("; ") || "none yet"), h("li", null, "Planned: ", groups("planned").join("; ") || "none"), h("li", null, "Not yet: ", notYet.join("; ") || "none")),
        plan.dividers.length ? [h("h4", null, "What divides people"), h("ul", null, plan.dividers.map((x) => h("li", null, x)))] : null,
        plan.connectors.length ? [h("h4", null, "What connects people"), h("ul", null, plan.connectors.map((x) => h("li", null, x)))] : null,
        ms.length ? [h("h4", null, "What to measure"), h("ul", null, ms.map((x) => h("li", null, x)))] : null,
        b ? [h("h4", null, "Smaller, safer first step"), h("p", null, b.firstStep)] : null,
        plan.notes.trim() ? [h("h4", null, "Notes and local validation questions"), h("p", { class: "brief__notes" }, plan.notes.trim())] : null,
        h("p", { class: "brief__foot" }, "Every bridge is a proposal until the community has been consulted, risks have been checked and results have been measured. Zero Harm and Anti-Coercion: do not use this plan to identify, locate, profile, pressure or target anyone.")]);
    }

    // ----- Saving -----
    function setSaveState(text) { saveState = text; savestate.textContent = text; }
    // The last saved state. When a save changes the plan, that earlier state
    // becomes a "saved version": on every manual save, and automatically
    // when the newest version is more than ten minutes old. Five are kept.
    let lastSaved = ws.updated ? JSON.stringify(ws.plan) : null;
    async function persist(manual) {
      const now = new Date().toISOString();
      const snapshot = JSON.stringify(plan);
      const newest = ws.history[0];
      if (lastSaved && lastSaved !== snapshot && (manual || !newest || Date.now() - Date.parse(newest.at) > 600000)
          && (!newest || JSON.stringify(newest.plan) !== lastSaved)) {
        ws.history.unshift({ at: ws.updated || now, plan: JSON.parse(lastSaved) });
        ws.history = ws.history.slice(0, 5);
      }
      lastSaved = snapshot;
      ws.plan = plan;
      ws.updated = now;
      try {
        await Store.set("workspace", JSON.parse(JSON.stringify(ws)));
        dirty = false;
        setSaveState(Store.mode === "memory" ? "Kept for this visit only. Export a backup to keep it." : `Saved on this device, ${fmtTime(now)}.`);
        if (channel) channel.postMessage({ type: "saved", tab: TAB, at: now });
      } catch (e) {
        setSaveState("Could not save on this device. Export a backup to keep your work.");
      }
      App.refreshInventory && App.refreshInventory();
    }
    const autosave = debounce(() => persist(false), 700);
    function changed() {
      dirty = true;
      setSaveState("Saving…");
      refresh();
      autosave();
    }

    // ----- Events -----
    const text = (el, key, max) => el.addEventListener("input", () => { plan[key] = el.value.slice(0, max); changed(); });
    text(inProject, "project", LIMITS.short);
    text(inPlace, "place", LIMITS.short);
    text(inNotes, "notes", LIMITS.notes);
    inReview.addEventListener("change", () => { plan.review = /^\d{4}-\d{2}-\d{2}$/.test(inReview.value) ? inReview.value : ""; changed(); });
    inBridge.addEventListener("change", () => { plan.bridge = inBridge.value; drawMeasures(); changed(); });
    mount.addEventListener("change", (e) => {
      const t = e.target;
      if (t.type !== "radio") return;
      if (t.name.startsWith("ans-")) plan.answers[t.name.slice(4)] = t.value;
      else if (t.name.startsWith("who-")) plan.who[t.name.slice(4)] = t.value;
      else return;
      changed();
    });
    mount.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-practice]");
      if (a) { e.preventDefault(); App.gotoPractice(a.getAttribute("data-practice")); return; }
      const q = e.target.closest('a[href^="#q-"]');
      if (q) { e.preventDefault(); const el = $(q.getAttribute("href")); if (el) reveal(el, $("input", el)); }
    });
    $("#plSave").addEventListener("click", () => persist(true));
    const backupJson = () => JSON.stringify({ schema: 2, app: "regenerative-peace-bridges", version: D.meta.version, exported: new Date().toISOString(), plan }, null, 2);
    $("#plExportJson").addEventListener("click", () => App.safetyGate(plan, () => download(`peace-bridges-plan-backup-${today()}.json`, backupJson(), "application/json")));
    $("#plExportMd").addEventListener("click", () => App.safetyGate(plan, () => download(`peace-bridges-plan-brief-${today()}.md`, briefMarkdown(plan), "text/markdown")));
    $("#plCopy").addEventListener("click", () => App.safetyGate(plan, () => copyText(briefMarkdown(plan), "Plan brief copied.")));
    const printBtn = $("#plPrint");
    if (printBtn) printBtn.addEventListener("click", () => App.safetyGate(plan, () => {
      document.body.classList.add("print-brief");
      const done = () => { document.body.classList.remove("print-brief"); window.removeEventListener("afterprint", done); };
      window.addEventListener("afterprint", done);
      window.print();
      setTimeout(done, 1500);
    }));
    $("#plImportBtn").addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", async () => {
      const f = fileInput.files && fileInput.files[0];
      fileInput.value = "";
      if (!f) return;
      if (f.size > LIMITS.importBytes) { toast("That file is larger than 200 KB, so it can’t be a plan backup."); return; }
      let incoming, parsed;
      try { parsed = JSON.parse(await f.text()); }
      catch (e) { toast("That file isn’t a readable backup (it is not valid JSON)."); return; }
      try { incoming = planFromBackup(parsed); }
      catch (e) { toast(e && e.message ? e.message : "That file isn’t a valid plan backup."); return; }
      const ok = await confirmDialog({ title: "Replace your current plan?", text: "The imported plan will replace the one in the planner. Your current plan will be kept under Saved versions.", ok: "Replace plan", danger: false });
      if (!ok) return;
      if (ws.updated) { ws.history.unshift({ at: new Date().toISOString(), plan: JSON.parse(JSON.stringify(plan)) }); ws.history = ws.history.slice(0, 5); }
      plan = incoming;
      fill();
      await persist(false);
      toast("Backup imported.");
    });
    $("#plDelete").addEventListener("click", async () => {
      const ok = await confirmDialog({ title: "Delete this plan?", text: "This deletes your plan and its saved versions from this device. It can’t be undone. Export a backup first if you might need it.", ok: "Delete plan" });
      if (!ok) return;
      try { await Store.del("workspace"); } catch (e) { /* ignore */ }
      try { localStorage.setItem("rpb_v1_migrated", "1"); } catch (e) { /* ignore */ }
      ws = { schema: 2, plan: emptyPlan(), history: [], updated: null };
      plan = ws.plan;
      lastSaved = null;
      fill();
      setSaveState("Plan deleted from this device.");
      if (channel) channel.postMessage({ type: "saved", tab: TAB, at: new Date().toISOString() });
      App.refreshInventory && App.refreshInventory();
    });
    // Saved versions
    const vDlg = $("#dlgVersions");
    $("#plVersions").addEventListener("click", (e) => {
      const list = $("#versionsList");
      list.replaceChildren(...(ws.history.length ? ws.history.map((v, i) => h("li", null,
        h("span", null, h("strong", null, v.plan.project || "Untitled plan"), " ", h("span", { class: "note" }, fmtTime(v.at))),
        h("button", { type: "button", class: "btn btn--quiet btn--small", "data-restore": i }, "Restore"))) : [h("li", null, "No earlier versions yet. Versions are kept when you press Save now, and every ten minutes while you work.")]));
      openDialog(vDlg, e.currentTarget);
    });
    $("#versionsList").addEventListener("click", async (e) => {
      const b = e.target.closest("[data-restore]");
      if (!b) return;
      const v = ws.history[Number(b.dataset.restore)];
      if (!v) return;
      ws.history.splice(Number(b.dataset.restore), 1);
      ws.history.unshift({ at: new Date().toISOString(), plan: JSON.parse(JSON.stringify(plan)) });
      ws.history = ws.history.slice(0, 5);
      plan = sanitizePlan(v.plan);
      fill();
      closeDialog(vDlg);
      await persist(false);
      toast("Earlier version restored. Your previous plan is under Saved versions.");
    });
    // Another tab saved a change: offer to load it instead of overwriting.
    const reloadFromStore = async () => {
      const saved = await Store.get("workspace").catch(() => null);
      if (saved && saved.schema === 2) { ws = { schema: 2, plan: sanitizePlan(saved.plan), history: (saved.history || []).slice(0, 5), updated: saved.updated }; }
      else ws = { schema: 2, plan: emptyPlan(), history: [], updated: null };
      plan = ws.plan;
      lastSaved = ws.updated ? JSON.stringify(plan) : null;
      fill();
      setSaveState("Loaded the latest version.");
    };
    if (channel) channel.addEventListener("message", (e) => {
      if (!e.data || e.data.tab === TAB || e.data.type !== "saved") return;
      toast("This plan was changed in another tab.", { sticky: true, action: { label: "Load latest", fn: reloadFromStore } });
    });
    window.addEventListener("beforeunload", (e) => { if (dirty) { persist(false); } void e; });

    // ----- Shared functions -----
    App.planBridge = (id) => {
      plan.bridge = bridgeById.has(id) ? id : plan.bridge;
      inBridge.value = plan.bridge;
      drawMeasures();
      changed();
      reveal($("#pl-basics"), inProject);
      toast(`“${bridgeById.get(id).short}” is now the bridge in your plan.`);
    };
    App.getWorkspace = () => ws;
    App.resetPlanner = () => { ws = { schema: 2, plan: emptyPlan(), history: [], updated: null }; plan = ws.plan; lastSaved = null; fill(); setSaveState(""); };
    App.storeMode = storeMode;
    fill();
    setSaveState(ws.updated ? `Saved on this device, ${fmtTime(ws.updated)}.` : "Not saved yet. Your plan saves automatically as you type.");
    void saveState;
    if (App.refreshInventory) App.refreshInventory();
    if (location.hash.startsWith("#pl-") || location.hash.startsWith("#q-")) { const el = $(location.hash); if (el) el.scrollIntoView(); }
  });

  /* ------------------------------------------------------------------
     13 SAFETY SCAN
     Before a plan is exported, copied or printed, look for details that
     could identify or locate people. The person decides what to do: the
     scan explains and never blocks.
     ------------------------------------------------------------------ */
  part("safety-scan", () => {
    const PATTERNS = [
      { label: "an email address", re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi },
      { label: "map coordinates", re: /-?\d{1,2}\.\d{3,}\s*[,;]?\s*-?\d{1,3}\.\d{3,}/g },
      { label: "map coordinates", re: /\d{1,3}\s*°\s*\d{1,2}\s*['′]\s*(?:\d{1,2}(?:\.\d+)?\s*["″])?\s*[NSEW]/gi },
      { label: "a map link", re: /\b(?:maps\.google|google\.[a-z.]+\/maps|goo\.gl\/maps|maps\.app\.goo\.gl|openstreetmap\.org|maps\.apple\.com|what3words)\S*/gi },
      { label: "a location code", re: /\b[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3}\b/g },
      { label: "a location code", re: /\/\/\/[a-z]+\.[a-z]+\.[a-z]+/gi },
      { label: "a phone number", re: /\+?\d[\d\s().-]{7,}\d/g, check: (m) => m.replace(/\D/g, "").length >= 9 && !/^\d{4}\s*[-–]\s*\d{4}$/.test(m.trim()) },
      { label: "a long ID number", re: /\b\d{8,}\b/g }
    ];
    function scan(plan) {
      const fields = [["Plan name", plan.project], ["General area", plan.place], ["Notes", plan.notes],
        ...plan.dividers.map((t) => ["Dividers", t]), ...plan.connectors.map((t) => ["Connectors", t]), ...plan.customMeasures.map((t) => ["Your own measures", t])];
      const found = [];
      const seen = new Set();
      for (const [where, value] of fields) {
        if (!value) continue;
        for (const p of PATTERNS) {
          p.re.lastIndex = 0;
          let m;
          while ((m = p.re.exec(value))) {
            const hit = m[0].trim();
            if (p.check && !p.check(hit)) continue;
            const key = where + "|" + hit;
            if (seen.has(key)) continue;
            seen.add(key);
            found.push({ where, label: p.label, hit: hit.length > 48 ? hit.slice(0, 45) + "…" : hit });
          }
        }
      }
      return found;
    }
    App.scanPlan = scan;
    const dlg = $("#dlgSafety");
    let pending = null;
    $("#dlgSafetyEdit").addEventListener("click", () => { pending = null; closeDialog(dlg); const f = $("#plNotes") || $("#plProject"); if (f) reveal($("#pl-notes") || f, f); });
    $("#dlgSafetyContinue").addEventListener("click", () => { const go = pending; pending = null; closeDialog(dlg); if (go) setTimeout(go, 40); });
    App.safetyGate = (plan, go) => {
      const found = scan(plan);
      if (!found.length) { go(); return; }
      pending = go;
      $("#safetyFindings").replaceChildren(...found.map((f) => h("li", null, `${f.where}: looks like ${f.label}: `, h("code", null, f.hit))));
      openDialog(dlg);
      $("#dlgSafetyEdit").focus();
    };
  });

  /* ------------------------------------------------------------------
     14 YOUR DATA PANEL
     ------------------------------------------------------------------ */
  part("data-panel", () => {
    const inv = $("#inventory");
    const est = $("#storageEstimate");
    const modeText = { indexeddb: "this browser’s database (IndexedDB)", local: "this browser’s local storage", memory: "memory only, because this browser blocks storage" };
    App.refreshInventory = async () => {
      const ws = App.getWorkspace ? App.getWorkspace() : null;
      inv.replaceChildren(
        h("li", null, "Your display settings: theme, reading level, text size, spacing, animation and surfaces."),
        h("li", null, ws && ws.updated ? `Your bridge plan, last saved ${fmtTime(ws.updated)}, with ${ws.history.length} earlier saved version${ws.history.length === 1 ? "" : "s"}.` : "No bridge plan is saved on this device."),
        h("li", null, `Where it’s kept: ${modeText[App.storeMode || Store.mode] || "this browser"}.`),
        h("li", null, BUILD.mode === "bundle" && /^https?:$/.test(location.protocol) ? "An offline copy of this app’s own files (no personal data)." : "No offline copy in this mode."));
      if (navigator.storage && navigator.storage.estimate) {
        try {
          const { usage } = await navigator.storage.estimate();
          if (typeof usage === "number") est.textContent = `This site uses about ${(usage / 1048576).toFixed(usage > 10485760 ? 0 : 1)} MB on this device, most of it the app’s offline files.`;
        } catch (e) { /* ignore */ }
      }
    };
    App.renderHealth = () => {
      let line = $("#appHealth");
      if (!line) { line = h("p", { class: "note", id: "appHealth" }); inv.after(line); }
      line.textContent = health.failed.length ? `App health: ${health.failed.length} part${health.failed.length === 1 ? "" : "s"} did not start (${health.failed.join(", ")}). Everything else works. Reloading may help.` : `App health: all ${health.started.length} parts started normally.`;
    };
    $("#dataActions").hidden = false;
    $("#ttlField").hidden = false;
    $("#btnExportCsv").hidden = false;
    $("#btnExportCsv").addEventListener("click", () => App.exportCsv && App.exportCsv());
    const ttl = $("#ttlSelect");
    ttl.value = String(App.prefs().ttl || 0);
    ttl.addEventListener("change", () => {
      const p = App.prefs();
      p.ttl = Number(ttl.value) || 0;
      try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch (e) { /* ignore */ }
      toast(p.ttl ? `Your plan will be deleted after ${p.ttl} days without changes.` : "Automatic deletion is off.");
    });
    $("#btnExportAll").addEventListener("click", () => {
      const ws = App.getWorkspace ? App.getWorkspace() : null;
      const go = () => download(`peace-bridges-everything-${today()}.json`, JSON.stringify({ schema: 2, app: "regenerative-peace-bridges", version: D.meta.version, exported: new Date().toISOString(), preferences: App.prefs(), workspace: ws }, null, 2), "application/json");
      if (ws && App.safetyGate) App.safetyGate(ws.plan, go); else go();
    });
    const persistBtn = $("#btnPersist");
    if (!(navigator.storage && navigator.storage.persist)) persistBtn.hidden = true;
    else persistBtn.addEventListener("click", async () => {
      try {
        const ok = await navigator.storage.persist();
        toast(ok ? "Protected: this browser won’t clear your data automatically." : "This browser chose not to protect the data. Export a backup to be safe.");
      } catch (e) { toast("This browser doesn’t allow protected storage here. Export a backup to be safe."); }
    });
    $("#btnWipe").addEventListener("click", async () => {
      const ok = await confirmDialog({ title: "Delete everything on this device?", text: "This deletes your plan, its saved versions, any version 1 draft and your display settings from this browser. The app’s own offline files stay so it keeps working; they hold none of your data. This can’t be undone.", ok: "Delete everything" });
      if (!ok) return;
      await Store.clearAll();
      prefs = { ...PREF_DEFAULTS };
      applyPrefs();
      App.syncPrefsForm && App.syncPrefsForm();
      ttl.value = "0";
      App.resetPlanner && App.resetPlanner();
      await App.refreshInventory();
      toast("Everything was deleted from this device.");
    });
    App.refreshInventory();
  });

  /* ------------------------------------------------------------------
     15 OFFLINE APP: service worker, updates, install, status
     ------------------------------------------------------------------ */
  part("offline-app", () => {
    const pill = $("#netStatus");
    const status = $("#offlineStatus");
    const isWeb = /^https?:$/.test(location.protocol);
    const setPill = (state, text) => { pill.dataset.state = state; pill.textContent = text; };
    const refreshPill = () => {
      if (BUILD.mode === "preview") return setPill("local", "Preview");
      if (!isWeb) return setPill("local", "Opened from a file");
      const ready = navigator.serviceWorker && navigator.serviceWorker.controller;
      if (!navigator.onLine) return setPill("offline", ready ? "Offline, saved copy" : "Offline");
      setPill(ready ? "ready" : "online", ready ? "Offline-ready" : "Online");
    };
    window.addEventListener("online", refreshPill);
    window.addEventListener("offline", refreshPill);
    if (BUILD.mode === "preview") {
      status.textContent = "This is an embedded preview. Offline use, installing, downloads and printing work in the downloadable version of the app.";
    } else if (BUILD.mode === "single") {
      status.textContent = "This single-file version works offline as it is: keep the file and open it in any browser. Installing as an app needs the full folder version served from a website.";
    } else if (!isWeb) {
      status.textContent = "Opened directly from a folder: everything works, but the offline copy and installing need the app to be served from a website (or from a local server).";
    }
    refreshPill();
    if (BUILD.mode !== "bundle" || !isWeb || !("serviceWorker" in navigator)) return;

    let askedToUpdate = false;
    const offerUpdate = (worker) => toast("A new version of this app is ready.", { sticky: true, action: { label: "Reload", fn: () => { askedToUpdate = true; worker.postMessage({ type: "SKIP_WAITING" }); } } });
    navigator.serviceWorker.register("./sw.js").then((reg) => {
      if (reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg.waiting);
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener("statechange", () => {
          if (nw.state === "installed" && navigator.serviceWorker.controller) offerUpdate(nw);
          if (nw.state === "activated") { refreshPill(); status.textContent = "Offline copy ready: this app will open without a connection."; }
        });
      });
      if (navigator.serviceWorker.controller) status.textContent = "Offline copy ready: this app will open without a connection.";
    }).catch(() => {
      status.textContent = "This browser didn’t allow an offline copy here. Everything else works while you’re online.";
    });
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      refreshPill();
      if (askedToUpdate) { askedToUpdate = false; location.reload(); }
    });
    // Install button appears only when the browser offers installation.
    let deferred = null;
    const installBtn = $("#btnInstall");
    window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; installBtn.hidden = false; });
    installBtn.addEventListener("click", async () => {
      if (!deferred) return;
      deferred.prompt();
      try { await deferred.userChoice; } catch (e) { /* ignore */ }
      deferred = null;
      installBtn.hidden = true;
    });
    window.addEventListener("appinstalled", () => { installBtn.hidden = true; toast("Installed. Open it from your apps."); });
  });

  /* ------------------------------------------------------------------
     16 KEYBOARD SHORTCUTS AND LINKS INTO THE PAGE
     ------------------------------------------------------------------ */
  part("shortcuts-and-links", () => {
    document.addEventListener("keydown", (e) => {
      const t = e.target;
      const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
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
