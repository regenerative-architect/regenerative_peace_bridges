# Changelog

## 2.0.0 — 21 October 2026

### Evidence
- Re-checked every version 1 link and its title, publisher and date.
- Replaced three sources that could not be confirmed with verified primary sources (UN Peacebuilding Fund endline assessment; CGIAR Climate Security Sensitivity Tool profile; ConAg scoping review).
- Fixed the WRI entry, which pointed to a general listing page instead of the guidebook.
- Corrected grades: Nature Food A → B; three UNDP entries B → C; guidance, standards and law now marked "How-to"; situation reports marked "Context".
- Added nineteen foundational sources on healing, peace, rights, safety, restoration, school meals, water and food crises (31 in total).
- Each source now states its type, evidence strength, key findings, limits ("Keep in mind"), link-checked date and the bridges it supports.

### Content
- Bridges expanded from four short cards to eight full sheets: origin, who it could help, what must be true first, how a pilot could start, what could go wrong, how to prevent harm, a smaller and safer first step, what to measure, what it can connect, and its evidence.
- New: twelve healing and peace practices, a "Start here" guide with five ordered steps, an expanded Zero Harm and Anti-Coercion covenant, a "what this tool will never do" list, data ethics and location minimisation methods, and a 28-term glossary.
- Added explosive ordnance safety (mine action checks before land work) as an essential condition throughout.

### Tools
- Bridge planner: readiness check across six areas with essential gates and a verdict, bridge-strength diagram, "who is in the room", dividers and connectors, measures, notes, live one-page brief.
- Saved versions (five), autosave, JSON backup and import (version 1 and 2), Markdown brief, copy, print-ready brief.
- Safety scan before anything leaves the device.
- Evidence web diagram with a list alternative; site-wide search; faceted library filters with CSV export; citation copying.
- Display settings: theme, plain language, larger text, relaxed spacing, animation, glass or solid surfaces.
- Your data panel: inventory, delete everything, auto-delete, persistent storage, app health.

### Platform
- Dawn hero scene on canvas (particles with depth of field, light shafts, reflections) that adapts to the device and respects reduced motion.
- Versioned service worker with an update prompt, offline fallback page, installable manifest with PNG and maskable icons and shortcuts.
- Content Security Policy, no-referrer policy, local fonts, no third-party requests.
- IndexedDB storage with fallbacks and automatic migration of version 1 drafts and theme.
- No-JavaScript fallback content generated from `data.js`.
- Single shareable file build (`share/`).
- Tests: 878 content and wiring checks, 22 end-to-end browser tests, axe-core accessibility audit with no violations.

### Fixed from version 1
- Library and bridges were empty without JavaScript; now readable without it.
- Browser `confirm()` pop-ups replaced with in-page confirmations (pop-ups are blocked in some embedded views).
- The manifest had no icons, so the app could not be installed.
- Emoji section markers replaced with text headings for screen readers.

## 1.0.0
- First release: twelve-source library, four proposed bridges, methods, local draft with JSON backup, offline shell.
