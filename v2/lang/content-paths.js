/* =====================================================================
   lang/content-paths.js — names every translatable piece of content in
   data.js with a stable "path", such as "bridges.water.plain" or
   "kit.consent.lines.2". Language packs use these paths to translate
   content. The app and the tests share this one list, so they always
   agree on what can be translated.

   Paths that end in a number point to a position in a list. If you
   reorder a list in data.js, reviewed language packs will show English
   for the moved items until they are updated (each translation records
   the English it was made from, so a mismatch is detected, never shown).
   ===================================================================== */
(function () {
  "use strict";

  // "Problem Management Plus (PM+)" -> "problem-management-plus-pm"
  function slug(text) {
    return String(text).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  // Returns [[path, englishText], ...] in a fixed order.
  function contentPaths(D) {
    const out = [];
    const add = (path, value) => { if (typeof value === "string" && value.trim()) out.push([path, value]); };
    const addList = (path, list) => { if (Array.isArray(list)) list.forEach((v, i) => add(path + "." + i, v)); };

    for (const x of D.topics || []) add("topics." + x.id, x.label);
    for (const [k, v] of Object.entries(D.types || {})) add("types." + k, v.label);
    for (const [k, v] of Object.entries(D.grades || {})) { add("grades." + k + ".label", v.label); add("grades." + k + ".plain", v.plain); }
    // Titles, publishers and authors stay as published, so citations still match.
    for (const d of D.documents || []) for (const f of ["short", "summary", "key", "limits"]) add("documents." + d.id + "." + f, d[f]);
    for (const b of D.bridges || []) {
      for (const f of ["short", "name", "plain", "origin", "helps", "evidenceNote", "firstStep", "connectors"]) add("bridges." + b.id + "." + f, b[f]);
      for (const f of ["needs", "steps", "risks", "safeguards", "measures"]) addList("bridges." + b.id + "." + f, b[f]);
    }
    for (const p of D.practices || []) {
      for (const f of ["name", "plain", "when", "care"]) add("practices." + p.id + "." + f, p[f]);
      addList("practices." + p.id + ".steps", p.steps);
    }
    for (const dim of D.readiness || []) {
      add("readiness." + dim.id + ".label", dim.label);
      for (const q of dim.questions) add("readiness." + dim.id + "." + q.id, q.text);
    }
    for (const g of D.stakeholders || []) add("stakeholders." + g.id, g.label);
    for (const g of D.glossary || []) { const k = slug(g.term); add("glossary." + k + ".term", g.term); add("glossary." + k + ".def", g.def); }

    const K = D.kit;
    if (K) {
      add("kit.intro", K.intro);
      add("kit.session.title", K.session.title);
      add("kit.session.length", K.session.length);
      for (const st of K.session.steps) {
        add("kit.session." + st.id + ".title", st.title);
        addList("kit.session." + st.id + ".points", st.points);
        addList("kit.session." + st.id + ".prompts", st.prompts);
      }
      add("kit.consent.title", K.consent.title);
      add("kit.consent.note", K.consent.note);
      addList("kit.consent.lines", K.consent.lines);
      add("kit.consent.question", K.consent.question);
      add("kit.children.title", K.children.title);
      addList("kit.children.points", K.children.points);
      for (const c of K.cards) { add("kit.cards." + c.id + ".label", c.label); add("kit.cards." + c.id + ".hint", c.hint); }
      add("kit.votes.note", K.votes.note);
      for (const v of K.votes.options) add("kit.votes." + v.id, v.label);
      for (const f of ["title", "lead", "promise", "note"]) add("kit.poster." + f, K.poster[f]);
      addList("kit.poster.fields", K.poster.fields);
    }
    return out;
  }

  const api = { contentPaths: contentPaths, slug: slug };
  if (typeof window !== "undefined") window.RPB_I18N = api;
})();
