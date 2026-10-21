# Regenerative Peace Bridges — version 2.0.0

An offline-first guide and planner for bringing proven regenerative, healing and peacebuilding work to communities recovering from conflict, safely and with their consent.

It does four things:

1. **Evidence library.** 31 publications from UN agencies, research institutes, standard-setters and peer-reviewed journals. Each one says what kind of source it is, how strong its evidence is and what it cannot tell you. Every link was checked by hand on 21 October 2026.
2. **Solution bridges.** Eight proposed pathways (for example farmer-managed natural regeneration, solar community water, home-grown school meals) with what must be true first, what could go wrong, how to prevent harm, a smaller and safer first step, and what to measure.
3. **Healing and peace practices.** Twelve well-established ways of working: Do No Harm, psychological first aid, layers of mental health support, free prior and informed consent, land rights, explosive ordnance safety, safe schools, women's and young people's leadership, accountability, restoration principles and positive peace.
4. **Bridge planner.** A readiness check, a "who is in the room" step, dividers and connectors, measures and notes, which together produce a one-page brief. Everything stays on the device.

Built by Foster + Navi / Planetary Restoration Archive.

---

## Open it

There are three ways, depending on what you need.

| You want to… | Do this |
|---|---|
| Just read and plan on this computer | Double-click `index.html`. Everything works except the offline copy and installing as an app. |
| Use it offline on any device, or install it like an app | Put the whole folder on a website (see "Publish it" below), open it once with a connection, then it works offline. |
| Share it by USB stick, email or a messaging app | Send `share/regenerative-peace-bridges.html`. It is one self-contained file that opens offline in any modern browser. |

To try the full offline version on your own computer, run this inside the folder and open `http://localhost:8000`:

```
python3 -m http.server 8000
```

### Publish it

Any static web host works, because the app is plain files with no server code. On GitHub Pages: create a repository, upload the folder's contents, then turn on Pages under Settings → Pages. Readers' plans are never sent to the host.

---

## How to use it in real life

- **Community members:** turn on *Plain language* under Display, read the bridges, look at each "smaller, safer first step", and use the planner's questions in your own meetings. Your community decides what happens on its land.
- **Organisations and funders:** check each source's evidence strength and limits, answer the readiness check honestly with community representatives, and make the Zero Harm and Anti-Coercion covenant a condition of support.
- **Researchers and builders:** every source has its limits stated and a copyable citation. The library exports to CSV. All content lives in `data.js`.

The five steps the page recommends, in order: listen first, check safety, find evidence, start small, measure and share back.

---

## What is in this folder

| File | What it does |
|---|---|
| `index.html` | The page: structure, static text, and a readable version of all content that works without JavaScript. |
| `styles.css` | All visual design: colours, type, layout, light and dark themes, print styles. |
| `data.js` | **All editable content**: sources, bridges, practices, readiness questions, glossary. |
| `app.js` | The interactive layer: search, filters, evidence web, planner, safety scan, storage, offline app. Numbered sections with plain comments. |
| `early.js` | Applies saved display settings before the page is drawn, to avoid a flash. |
| `sw.js` | Service worker: keeps an offline copy of the app's own files. Never stores other websites or anything you type. |
| `manifest.webmanifest`, `icon*.png`, `icon.svg`, `apple-touch-icon.png` | Lets the app be installed, with icons and shortcuts. |
| `offline.html` | Shown if a page is opened offline before the app has saved its files. |
| `fonts/` | Fraunces and Atkinson Hyperlegible Next, bundled locally (no requests to font services), with their licences. |
| `share/regenerative-peace-bridges.html` | The single-file version for sharing. Rebuild it after edits (see below). |
| `tools/` | `prerender.mjs` (updates the no-JavaScript fallback), `build-single.mjs` (rebuilds the single file), `make-icons.mjs` (rebuilds PNG icons). |
| `tests/` | `check-data.mjs` (content and wiring checks) and `browser-test.mjs` (22 end-to-end browser tests). |

---

## Editing the content

Open `data.js` in any text editor. The top of the file explains every field.

**To add a source:** copy an existing entry in `documents`, give it a new unique `id`, fill every field, and set `checked` to the date you yourself opened the link. Use `grade` only for studies, reviews, evaluations and case studies (`"A"`, `"B"` or `"C"`); leave it `null` for guidance, standards, law and situation reports.

**To add a bridge or practice:** copy an existing one and keep every field. A bridge's `docs` list must use ids from the library.

**After editing**, if you have Node.js 18 or newer, run these from the folder:

```
node tools/prerender.mjs      # refresh the no-JavaScript fallback in index.html
node tools/build-single.mjs   # rebuild share/regenerative-peace-bridges.html
node tests/check-data.mjs     # check for missing fields, broken references, unsafe content
```

Then change `VERSION` at the top of `sw.js` (for example `rpb-core-v2.0.1`), so readers who installed the app are offered the update.

**Safety rule for editors:** never add precise locations of homes, schools, shelters, clinics or water points, and never name private individuals or armed groups. Describe places at country or province level, as the original publication does.

---

## Evidence: how the sources were checked

Every link in version 1 and every new source was opened on 21 October 2026, and its title, publisher, date and key figures were confirmed against the publisher's own page (or, where a publisher blocks automated reading, against an official news release and search records).

**Grades are editorial labels written for this tool, not an independent systematic appraisal.** The scale:

- **A Strong:** several independent, rigorous studies agree.
- **B Moderate:** a rigorous study, a large-data analysis, or a review of many studies.
- **C Emerging:** before-and-after results, case studies or programme experience, without a comparison group.
- **D Untested here:** a proposal. Every bridge is D until tested where it is used.
- **How-to:** guidance, standards and law. They say how to act well, not whether something works.
- **Context:** situation reports. They describe a problem and do not test solutions.

### Changes to the version 1 sources

| Version 1 entry | What was found | What changed |
|---|---|---|
| UNDP, Programming for Climate, Peace and Security | Confirmed (26 May 2026; 15 projects, 28 countries) | Kept. Grade B → C: it reviews programme experience, not controlled comparisons. |
| UNDP, From Crisis to Resilience | Confirmed (14 January 2026; ten country cases) | Kept. Grade B → C (case studies). Countries listed. |
| UNICEF, shock-responsive social protection | Confirmed (6 July 2026) | Kept. Marked How-to: it is guidance, not a measurement of results. |
| WRI, "Land Restoration From Planting to Proof" | v1 linked to WRI Africa's general research listing | Now links to the guidebook itself (12 January 2026, DOI 10.46830/wrigb.24.00067). Marked How-to. |
| Nature Food, armed conflict and cropland loss | Confirmed (24 September 2026, DOI 10.1038/s43016-026-01436-8) | Kept. Grade A → B: one rigorous study, not independently replicated. Key figures added. |
| Farmer–herder peacebuilding article (DOI 10.1080/19439342.2026.2713143) | Could not be confirmed: no search records, and the publisher blocks automated reading | **Replaced** by the UN Peacebuilding Fund's endline assessment of the same Sierra Leone–Guinea cross-border project (June 2024), a primary source with mixed results reported honestly. |
| Frontiers, Climate Security Sensitivity Tool (DOI 10.3389/fsufs.2026.1765880) | Could not be opened (the reading service was rate-limited) and no search records were found | **Replaced** by CGIAR's official profile of the tool (October 2024). |
| Journal of Agriculture and Food Research, conflict and smallholder agriculture (DOI 10.1016/j.jafr.2026.103205) | The DOI resolves, but the article page could not be read to confirm its title and details | **Replaced** by the open-access ConAg scoping review with the same 85-publication scope (September 2025). Add the journal version once you have confirmed it. |
| UNDP/ITC, Sudan agri-food analysis | Confirmed; the link is a press release (4 August 2026) about the analysis | Relabelled as a press release (Context), with its figures. |
| WMO, State of the Climate in Africa 2025 | Confirmed (18 June 2026) | Kept (Context). |
| UNDP, Service Delivery and Non-State Actors | Confirmed (12 January 2026, with the Folke Bernadotte Academy) | Kept. Grade B → C (qualitative cases). |
| UNOCA, Eastern Chad | Confirmed; a news story (6 October 2026) announcing the assessment | Kept, labelled as such (Context). |

### Nineteen sources added

CDA's Do No Harm framework; WHO's Psychological First Aid guide; the IASC mental health and psychosocial support guidelines; FAO's free, prior and informed consent manual; the Voluntary Guidelines on the Responsible Governance of Tenure; the Sphere Handbook; the Core Humanitarian Standard (2024); UNICEF's Water Under Fire, volume 3; WFP's State of School Feeding Worldwide 2024; the Safe Schools Declaration; the FMNR Hub account of farmer-managed natural regeneration in Niger; the UN Decade principles for ecosystem restoration; the International Mine Action Standards; ICRC's guidelines on protecting the natural environment in armed conflict; UNEP's From Conflict to Peacebuilding; Security Council resolutions 1325 and 2250; the Institute for Economics & Peace's pillars of Positive Peace; and the Global Report on Food Crises 2026.

Re-check links every few months. Publishers move pages.

---

## Privacy, safety and the Zero Harm and Anti-Coercion covenant

- **No accounts, analytics, trackers or third-party code.** Fonts are bundled. The page loads nothing from other websites; `index.html` enforces this with a Content Security Policy.
- **Everything typed stays on the device**, in the browser's own storage (IndexedDB, falling back to local storage, then to memory with a warning). "Your data and offline use" shows exactly what is stored and offers *Delete everything*, optional *auto-delete after 7, 30 or 90 days without changes*, and *protect from automatic clean-up*.
- **Safety scan before sharing.** Before a plan is exported, copied or printed, it is checked for email addresses, phone numbers, map coordinates, map links, location codes and long ID numbers. The person sees what was found and decides; the scan never blocks.
- **Location minimisation by design.** The planner asks for a general area, warns against exact locations, records groups rather than individuals, and the content never includes maps of vulnerable people or places.
- **Anti-coercion.** The covenant (on the page and in every brief) states that aid is never conditional on participation, loyalty, labour or information about others, that nothing may reach armed actors, and that land work waits for mine action clearance.
- **Safe rendering.** Imported files are size-limited, validated field by field, and always shown as text, never as HTML.

---

## Accessibility

Skip link, landmarks and headings; full keyboard use with visible focus; dialogs that trap and return focus; live announcements for saving, verdicts and notices; a plain-language reading mode; larger text and relaxed spacing (helpful for dyslexia); light and dark themes; reduced motion (animation starts off when the device asks); solid surfaces instead of glass for reduced transparency; high-contrast and forced-colour support; status shown by text and shape as well as colour; 44-pixel touch targets. The body typeface, Atkinson Hyperlegible Next, was designed by the Braille Institute for low-vision readers.

An automated audit with axe-core (WCAG 2.1 A and AA, plus best practices) reported no violations in light and dark themes at desktop and phone widths. Automated audits catch only part of what matters: testing with screen-reader users and community members is still needed.

---

## Features applied from the Feature Fusion Foundry

| Foundry area | Applied here |
|---|---|
| Storage and local data | IndexedDB with fallbacks, schema migration from version 1, portable JSON backups, automatic saved versions, storage estimate, persistent-storage request |
| Workers and cross-tab coordination | BroadcastChannel notice when another tab changes the plan, with "Load latest" |
| Resilience and graceful degradation | Fail-safe startup (each part isolated), no-JavaScript fallback content, capability fallback ladder, sanitised recovery from damaged data |
| Privacy and data sovereignty | Local-only mode, data inventory, selective and total deletion, retention controls, personal-detail detection before export |
| Security engineering | Content Security Policy, safe rendering, schema validation, upload size limits, https-only links, no-referrer policy |
| Search and knowledge | Site-wide search (press / or Ctrl+K), faceted library filters, weighted ranking, evidence-strength classification |
| Evidence, provenance and integrity | Claim–evidence links (evidence web, "Supports"), evidence quality fields, citation copying, link-checked dates |
| Accessibility-first interaction | See the section above |
| Advanced visualisation | Canvas particles with depth of field and bokeh, volumetric light shafts, reflections, glass surfaces, adaptive quality, SVG evidence web |
| Advanced PWA integration | Installable manifest with maskable icons and shortcuts, versioned service worker, update notice with Reload, offline page, install button only when offered |
| Decision support and systems thinking | Readiness check with essential gates, "who is in the room" (who-is-missing), dividers and connectors, smaller safer first steps |
| Gamification tied to real work | Bridge-strength planks with an explicit note that a complete bridge is not proof of safety (no points, streaks or scores) |
| File and OS integration | Downloads with copy fallback, clipboard with manual fallback, print-ready brief, single shareable file |
| Testing and self-verification | Content checks, 22 end-to-end tests (including offline, update, migration, import, cross-tab), accessibility audit, in-page app health line |

**Deliberately not adopted:** in-browser AI models (large downloads, unreliable on low-end devices, and AI-written text has no place in an evidence library), live multiplayer rooms and peer-to-peer connections (they could expose participants in conflict settings), a blocking splash screen (field users need instant access), maps and geolocation (location data risk), and any analytics.

---

## Testing

```
node tests/check-data.mjs
npm install playwright && npx playwright install chromium
node tests/browser-test.mjs
```

`check-data.mjs` runs 878 checks: unique ids, required fields, https links, valid dates and grades, every bridge and practice pointing to a real source, no contact details or coordinates in content, every element the script uses existing in the page, every offline file existing, and the no-JavaScript fallback in step with `data.js`.

`browser-test.mjs` drives Chromium through 22 scenarios and fails on any console error or warning: loading at phone width without sideways scrolling, keyboard skip link, library filters and CSV, evidence web tracing, bridges, practices, search, display settings, readiness verdicts, autosave across reloads, saved versions, the brief and print layout, the safety scan, imports of version 1 and 2 backups and a damaged file, migration of a version 1 draft, auto-delete, delete everything, two-tab updates, offline reopening and the update prompt, opening from disk, the single file, the embedded preview, and the hero's animated and still modes.

Not yet verified: other browser engines (Firefox and Safari), assistive technologies used by real people, and slow or old devices in the field.

---

## Future extensions

These are planned and not built. The page marks them the same way.

- Community-reviewed translations. Safety and legal guidance will not be machine-translated without review.
- Sharing a plan directly between two devices, only with both people's consent and with encryption.
- Coarse, location-minimised map layers for district-level planning.

---

## Licences and credits

- Application code and editorial summaries: © 2026 Foster + Navi / Planetary Restoration Archive, MIT licence (see `LICENSE`).
- Fonts: Fraunces and Atkinson Hyperlegible Next, SIL Open Font License 1.1 (see `fonts/`).
- Linked publications remain the property of their authors and publishers. Links and summaries transfer no rights, and no source documents are redistributed. Listing a publication does not mean its publisher endorses this tool.
- Evidence is not endorsement.
