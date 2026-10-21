/* =====================================================================
   early.js — applies saved display settings before the page is drawn,
   so a reader who chose Dark or Larger text never sees a flash of the
   default look. It only reads this browser's own storage and never
   sends anything anywhere. If storage is blocked, defaults apply.
   ===================================================================== */
(function () {
  try {
    var saved = JSON.parse(localStorage.getItem("rpb_prefs_v2") || "null");
    // Version 1 stored only the theme, under a different key.
    if (!saved) {
      var v1 = localStorage.getItem("rpb_theme");
      if (v1 === "dark" || v1 === "light") saved = { theme: v1 };
      else return;
    }
    var root = document.documentElement;
    if (saved.theme === "light" || saved.theme === "dark") root.setAttribute("data-theme", saved.theme);
    if (saved.level === "plain") root.setAttribute("data-level", "plain");
    if (saved.text === "large") root.setAttribute("data-text", "large");
    if (saved.spacing === "relaxed") root.setAttribute("data-spacing", "relaxed");
    if (saved.surface === "solid") root.setAttribute("data-surface", "solid");
  } catch (e) {
    /* Storage unavailable (private window, blocked site data): use defaults. */
  }
})();
