# Changelog

## 3.0.0 — 21 October 2026

### Evidence and content
- Eighteen newly checked sources (49 in total), including two randomised trials of scalable psychological help (PM+ in Pakistan; Self-Help Plus with South Sudanese refugee women in Uganda), a review of cash transfer evidence, a meta-analysis of school feeding, CDA's *Time to Listen*, and sources on zaï pits, re-greening, mine action, energy for health facilities, the Iraqi marshes and household air pollution.
- New topics (energy; livelihoods) and a new source type (listening study).
- Five new bridges: solar power for clinics and maternity care; zaï pits and water harvesting; safe land release so families can farm again; restoring wetlands and marshes; safer cooking fuel and stoves for displaced families (13 in total).
- Three new practices: listen first, and keep listening; scalable psychological help (PM+ and Self-Help Plus); safe access to fuel and energy (15 in total).
- Two more groups in "who is in the room" (fishers and wetland users; health workers) and eight new glossary terms (36 in total).

### Community meeting kit (new section)
- A 90-minute listening session guide in seven steps, with questions to ask.
- A seven-line consent script to read aloud, and safeguards for when children take part.
- Fifteen picture cards drawn as simple pictograms, and voting cards coded by shape (circle, triangle, square) as well as colour.
- A complaints poster to fill in by hand.
- Print only the kit, copy the guide or script as text, and add the session to a plan's timeline.

### Planner
- Several plans side by side (up to 20): new, duplicate, switch and delete.
- New tabs: timeline; budget with category totals and integrity checks (fair pay, safeguarding, monitoring, maintenance, contingency of at least 5%); risk register with a likelihood and impact grid; consent log.
- A group's "no" or withdrawal in the consent log pauses the plan for that group.
- Starter rows from the chosen bridge (its steps and known risks) and essential budget lines.
- CSV download for every table, with spreadsheet formulas made harmless.
- The brief, Markdown export and safety scan now cover every tab; "Go back and edit" opens the tab where something was found.
- Saving across tabs: Web Locks so saves take turns, plans made in any tab are kept, deleted plans stay deleted, and the newest copy of each plan wins.

### Languages
- Every interface phrase is translatable, with plural rules and locale-aware dates, numbers, money and sorting.
- Draft French, Spanish and Arabic interface packs, made with AI assistance and clearly labelled as unreviewed.
- Right-to-left layout for Arabic and other right-to-left languages, including the hero scene, the evidence web, tabs and arrow keys.
- Import, export, remove and template tools; SHA-256 fingerprints; draft and reviewed status shown on every page.
- Safety, consent and legal text and all content change only with a reviewed pack, and a content translation is used only while the English it was made from is current.
- English passages inside another language are marked for screen readers.

### Platform
- Stored data upgrades automatically from version 2 (the old plan is kept as a backup) and from version 1.
- Language packs work offline, from disk and in the single shareable file.
- `tools/i18n-extract.mjs` builds the phrase catalogue; `tests/check-data.mjs` now runs 8,069 checks, including every built-in pack; `tests/browser-test.mjs` runs 29 end-to-end tests (with `--only` to run some).
- Accessibility audit with axe-core: no violations in English, French and Arabic, light and dark, desktop and phone.

### Fixed from version 2
- The Install button, a checkbox and a remove button could show when they should have been hidden (a style overrode the `hidden` attribute). They now stay hidden until they work.
- The "Copy to clipboard" button in the copy-instead-of-download dialog did nothing. It now copies, with a fallback for older browsers.

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
