# Regenerative Peace Bridges — version 3.0.0

An offline-first guide, meeting kit and planner for bringing proven regenerative, healing and peacebuilding work to communities recovering from conflict, safely and with their consent.

It does six things:

1. **Evidence library.** 49 publications from UN agencies, research institutes, standard-setters and peer-reviewed journals. Each one says what kind of source it is, how strong its evidence is and what it cannot tell you. Every link was checked by hand on 21 October 2026.
2. **Solution bridges.** Thirteen proposed pathways (for example farmer-managed natural regeneration, solar power for clinics, zaï pits, safe land release, wetland restoration) with what must be true first, what could go wrong, how to prevent harm, a smaller and safer first step, and what to measure.
3. **Healing and peace practices.** Fifteen well-established ways of working, from Do No Harm and psychological first aid to scalable psychological help (PM+ and Self-Help Plus), listening to people on the receiving end of aid, and safe access to cooking fuel.
4. **Community meeting kit.** A 90-minute listening session guide, a consent script to read aloud, safeguards for children's participation, fifteen picture cards, shape-coded voting cards and a complaints poster, all ready to print.
5. **Bridge planner.** Several plans side by side, each with a readiness check, "who is in the room", a timeline, a budget with integrity checks, a risk register and a consent log, which together produce a one-page brief. Everything stays on the device.
6. **Language packs.** Draft French, Spanish and Arabic interfaces, right-to-left layouts, and tools so communities can translate, review and share their own packs.

Built by Foster + Navi / Planetary Restoration Archive.

---

## Open it

There are three ways, depending on what you need.

| You want to… | Do this |
|---|---|
| Just read and plan on this computer | Double-click `index.html`. Everything works except the offline copy and installing as an app. |
| Use it offline on any device, or install it like an app | Put the whole folder on a website (see "Publish it" below), open it once with a connection, then it works offline. |
| Share it by USB stick, email or a messaging app | Send `share/regenerative-peace-bridges.html`. It is one self-contained file, with the language packs inside, that opens offline in any modern browser. |

To try the full offline version on your own computer, run this inside the folder and open `http://localhost:8000`:

```
python3 -m http.server 8000
```

### Publish it

Any static web host works, because the app is plain files with no server code. On GitHub Pages: create a repository, upload the folder's contents, then turn on Pages under Settings → Pages. Readers' plans are never sent to the host.

---

## How to use it in real life

- **Community members:** choose your language and turn on *Plain language* under Display, read the bridges, look at each "smaller, safer first step", and use the meeting kit and the planner's questions in your own meetings. Your community decides what happens on its land.
- **Facilitators:** print the meeting kit (*Print the kit* prints only the kit), read the consent script aloud, use the picture and voting cards so people who don't read can take part, and put up the complaints poster. *Add this session to my plan* puts the session on your plan's timeline.
- **Organisations and funders:** check each source's evidence strength and limits, answer the readiness check honestly with community representatives, budget for fair pay, safeguarding, monitoring and maintenance, record every group's consent decision, and make the Zero Harm and Anti-Coercion covenant a condition of support.
- **Researchers and builders:** every source has its limits stated and a copyable citation. The library and every planner table export to CSV. All content lives in `data.js`; all interface words can be translated.

The five steps the page recommends, in order: listen first, check safety, find evidence, start small, measure and share back.

---

## The community meeting kit

The kit is for a first listening session, before any project is proposed.

- **Session guide (about 90 minutes):** before the day; welcome and consent; what matters most; what divides and what connects; ideas and worries; closing; after the session. Each step has points to cover and questions you could ask.
- **Consent script:** seven short lines to read aloud, ending with "Do you agree to continue?". Taking part is a choice; saying no, or leaving, will not change any help a family receives; names are not written down. Translate it with people from the community and have someone else translate it back to check the meaning.
- **If children take part:** five safeguards: only facilitators trained in child protection; caregivers' consent and each child's own choice; a safe, visible place with at least two trained adults; play, drawing and picture cards, never questions about violence or painful events; and a known child-protection referral route.
- **Picture cards:** fifteen simple drawings (water, trees, seeds, farming, animals and grazing, school, health care, cooking fuel, safe land, market, work and income, wellbeing, speak up, pause, check results) so people can point to what matters.
- **Voting cards:** yes is a circle, not sure is a triangle, no is a square. Shapes as well as colours, so they work for colour-blind people and in black-and-white printing.
- **Complaints poster:** "Something wrong? Tell us safely", with blanks to fill in by hand (who to talk to, where, when, other ways to reach us, and where concerns about staff go) and the promise that nobody has to give their name and that raising a concern never affects help.

*Copy the session guide* and *Copy the consent script* give plain text for messages or documents.

---

## The bridge planner

Keep up to 20 plans on one device and switch between them at the top of the planner. *New plan*, *Duplicate* and *Delete this plan* each act on one plan only.

Each plan has five tabs:

| Tab | What it is for |
|---|---|
| Readiness | Basics, 19 questions across six areas (consent, safety, rights, ecology, ownership, measuring) with essential gates, "who is in the room", what divides and connects people, measures and notes. |
| Timeline | Milestones with dates and status. *Add this bridge's steps* starts you off from the chosen bridge. |
| Budget | Budget lines by category, a total in your chosen currency, and integrity checks: fair pay for local workers, safeguarding and complaints, monitoring and sharing back, maintenance after the project, and at least 5% for contingency. *Add the essential lines* adds one line for each. |
| Risks | What could go wrong, how likely and how serious it is, who watches it (a role, never a person's name) and what will reduce it. A 3 × 3 grid shows where the risks sit. *Add this bridge's risks* starts you off. |
| Consent log | Each group's decision, how it was reached, any conditions, and when to check again. **If a group's latest decision is no, or a withdrawal, the plan's verdict becomes "Pause" for that group.** Help never depends on agreeing. |

The brief at the bottom updates as you work and can be copied, downloaded as Markdown or printed on its own. Every table downloads as CSV, with any spreadsheet formulas made harmless.

Plans save automatically on this device. *Save now* also keeps a saved version (five per plan), and *Saved versions* lets you restore one. If you work in two tabs, saves take turns, plans made in either tab are kept, and the newest copy of each plan wins, so a tab left open in the background never overwrites newer work.

---

## Language packs

### For everyone

Open **Language** at the top of the page and choose a language. The page switches at once, remembers your choice on this device, and works offline in every language.

A bar under the header always says which pack you are using and whether it is a **draft** or **reviewed**:

- **Draft packs** translate the interface only: buttons, labels, headings and messages. The built-in French, Spanish and Arabic packs are drafts made with AI assistance and not yet checked by speakers of those languages.
- **Safety guidance, consent text, legal text and all content** (sources, bridges, practices, the meeting kit) stay in English until a pack has been **reviewed** by people who speak the language, ideally from the communities who will use it. English text inside another language is marked so screen readers pronounce it correctly.
- With a reviewed pack you can still choose *Show sources, bridges, practices and the meeting kit in English*.

Arabic and other right-to-left languages turn the whole layout around: reading order, the evidence web diagram, the hero scene, the planner's tabs and arrow keys.

### For translators

1. Open **Language** and choose **Download a translation template**. It lists every phrase and every piece of content, with instructions at the top.
2. Fill in the empty values. Keep words in `{curly brackets}` exactly as they are: the app fills them in. Leave anything you are unsure about empty, and the English will show there instead.
3. Set `"lang"` (for example `"sw"` or `"fr-CA"`), `"name"` (the language's own name), `"englishName"` and `"dir"` (`"rtl"` for right-to-left scripts).
4. Choose **Import a language pack** to try it. The app reports anything it skipped.
5. Set `"status": "reviewed"` only after speakers of the language have checked every safety and consent text, and fill in `"review"` with who reviewed it (an organisation or group, not a private person) and the date.
6. Share the file, and use **Export this language pack** to pass it on.

Every pack shows a **fingerprint** (16 characters from a SHA-256 hash of its text). The same pack always has the same fingerprint, so people can confirm they hold identical text, for example before using a consent script in a meeting.

### Pack format (technical)

```json
{
  "format": "rpb-language-pack",
  "formatVersion": 1,
  "lang": "sw",
  "name": "Kiswahili",
  "englishName": "Swahili",
  "dir": "ltr",
  "status": "draft",
  "review": { "by": "", "date": "", "notes": "" },
  "strings": { "Search": "Tafuta", "{n} sources": { "one": "chanzo {n}", "other": "vyanzo {n}" } },
  "content": { "bridges.water.name": { "en": "Solar-powered community water…", "text": "…" } }
}
```

- **Keys are the English text.** `strings` holds interface phrases; those listed under `reviewedOnly` in the template are used only when `status` is `reviewed`.
- **Plurals** use the forms of `Intl.PluralRules`: `zero`, `one`, `two`, `few`, `many`, `other`.
- **Placeholders:** a translation must keep every `{placeholder}` except `{n}` (some languages say "one source" instead of "1 source") and may add none of its own. Entries that break this rule are skipped and reported.
- **Content** entries are keyed by path (for example `bridges.water.plain` or `kit.consent.lines.3`) and carry the English they were translated from. A translation is used only while that English is still current: if the source text changes, the English shows again until the translation is updated. The app reports these as "made from older English text".
- **Safety:** packs are plain text only and are never inserted as HTML. Control characters and invisible direction overrides are removed. Files are limited to 3 MB. Imported packs are stored only on this device.

### Adding a built-in language (developers)

Most people should import packs through the Language dialog; no code is needed. To ship a pack with the app:

1. Add `lang/xx.js`, following `lang/fr.js` (it pushes the pack onto `window.RPB_PACKS`).
2. Add `<script src="lang/xx.js" defer></script>` to `index.html` before `app.js`, add the file to `CORE` in `sw.js`, and to `LANG_FILES` in `tools/build-single.mjs`.
3. Run the checks below. `tests/check-data.mjs` validates every built-in pack.

If you change or add interface text in `index.html` or `app.js`, run `node tools/i18n-extract.mjs` to refresh `lang/catalog.js`, the list of translatable phrases.

---

## What is in this folder

| File | What it does |
|---|---|
| `index.html` | The page: structure, static text, and a readable version of all content that works without JavaScript. |
| `styles.css` | All visual design: colours, type, layout, light and dark themes, right-to-left layouts, print styles. |
| `data.js` | **All editable content**: sources, bridges, practices, the meeting kit, readiness questions, glossary. |
| `app.js` | The interactive layer: languages, search, filters, evidence web, meeting kit, planner, safety scan, storage, offline app. Numbered sections with plain comments. |
| `early.js` | Applies saved display and language settings before the page is drawn, to avoid a flash. |
| `lang/` | `content-paths.js` (names every translatable piece of content), `catalog.js` (every translatable interface phrase, generated), and the draft packs `fr.js`, `es.js`, `ar.js`. |
| `sw.js` | Service worker: keeps an offline copy of the app's own files. Never stores other websites or anything you type. |
| `manifest.webmanifest`, `icon*.png`, `icon.svg`, `apple-touch-icon.png` | Lets the app be installed, with icons and shortcuts. |
| `offline.html` | Shown if a page is opened offline before the app has saved its files. |
| `fonts/` | Fraunces and Atkinson Hyperlegible Next, bundled locally (no requests to font services), with their licences. Arabic uses the device's own fonts. |
| `share/regenerative-peace-bridges.html` | The single-file version for sharing. Rebuild it after edits (see below). |
| `tools/` | `prerender.mjs` (updates the no-JavaScript fallback), `i18n-extract.mjs` (rebuilds the phrase catalogue), `build-single.mjs` (rebuilds the single file), `make-icons.mjs` (rebuilds PNG icons). |
| `tests/` | `check-data.mjs` (content, language and wiring checks) and `browser-test.mjs` (29 end-to-end browser tests). |

---

## Editing the content

Open `data.js` in any text editor. The top of the file explains every field.

**To add a source:** copy an existing entry in `documents`, give it a new unique `id`, fill every field, and set `checked` to the date you yourself opened the link. Use `grade` only for studies, reviews, evaluations, case studies and listening studies (`"A"`, `"B"` or `"C"`); leave it `null` for guidance, standards, law and situation reports.

**To add a bridge or practice:** copy an existing one and keep every field. A bridge's `docs` list must use ids from the library.

**To change the meeting kit:** edit `kit` in `data.js`. Each picture card's `id` needs a drawing in `KIT_ICONS` in `app.js` (simple shapes on a 64 × 64 grid); the checks will tell you if one is missing.

**After editing**, if you have Node.js 18 or newer, run these from the folder:

```
node tools/prerender.mjs        # refresh the no-JavaScript fallback in index.html
node tools/i18n-extract.mjs     # refresh the list of translatable phrases
node tools/build-single.mjs     # rebuild share/regenerative-peace-bridges.html
node tests/check-data.mjs       # check fields, references, languages and unsafe content
```

Then change `VERSION` at the top of `sw.js` (for example `rpb-core-v3.0.1`), so readers who installed the app are offered the update.

Changing English content does not break translations: reviewed packs simply show the English for that piece until a translator updates it.

**Safety rule for editors:** never add precise locations of homes, schools, shelters, clinics or water points, and never name private individuals or armed groups. Describe places at country or province level, as the original publication does.

---

## Evidence: how the sources were checked

Every source was opened on 21 October 2026, and its title, publisher, date and key figures were confirmed against the publisher's own page (or, where a publisher blocks automated reading, against an official news release and search records).

**Grades are editorial labels written for this tool, not an independent systematic appraisal.** The scale:

- **A Strong:** several independent, rigorous studies agree.
- **B Moderate:** a rigorous study, a large-data analysis, or a review of many studies.
- **C Emerging:** before-and-after results, case studies or programme experience, without a comparison group.
- **D Untested here:** a proposal. Every bridge is D until tested where it is used.
- **How-to:** guidance, standards and law. They say how to act well, not whether something works.
- **Context:** situation reports. They describe a problem and do not test solutions.

### Eighteen sources added in version 3

- **Psychological help:** WHO's Problem Management Plus (PM+) manual; the randomised trial of PM+ in a conflict-affected area of Pakistan (JAMA, 2016); the cluster randomised trial of Self-Help Plus with South Sudanese refugee women in Uganda (The Lancet Global Health, 2020); WHO's *Doing What Matters in Times of Stress*.
- **Livelihoods and cash:** Bastagli and colleagues' review of the evidence on cash transfers in low- and middle-income countries (Journal of Social Policy, 2019).
- **Dryland restoration:** Sendzimir and colleagues on re-greening in Maradi and Zinder, Niger (Ecology and Society, 2011); WOCAT's record of zaï and tassa planting pits in Niger.
- **Mine action:** GICHD and UNDP, *Leaving No One Behind: Mine Action and the Sustainable Development Goals*; Landmine Monitor 2025 (as summarised by UN News).
- **Energy for health:** WHO, World Bank, IRENA and SEforALL, *Energizing Health*; UNDP's Solar for Health programme.
- **Wetlands:** UNEP's support for the Iraqi marshlands (2004–2009); Richardson and Hussain's ecological assessment of the marshes of Iraq (BioScience, 2006); IUCN's World Heritage Outlook for the Ahwar of Southern Iraq (2025).
- **Cooking fuel:** WHO's fact sheet on household air pollution; the Women's Refugee Commission's SAFE (Safe Access to Fuel and Energy) resources.
- **School meals:** Wang and colleagues' systematic review and meta-analysis of school feeding (Journal of Global Health, 2021).
- **Listening:** CDA's *Time to Listen: Hearing People on the Receiving End of International Aid* (a new "listening study" source type).

Version 2's checks of the version 1 sources still stand (three unconfirmable sources were replaced, the WRI link was corrected, and several grades were lowered). See `CHANGELOG.md`.

Re-check links every few months. Publishers move pages.

---

## Privacy, safety and the Zero Harm and Anti-Coercion covenant

- **No accounts, analytics, trackers or third-party code.** Fonts are bundled. The page loads nothing from other websites; `index.html` enforces this with a Content Security Policy.
- **Everything typed stays on the device**, in the browser's own storage (IndexedDB, falling back to local storage, then to memory with a warning). "Your data and offline use" shows exactly what is stored and offers *Delete everything* (plans, imported language packs and settings), optional *auto-delete after 7, 30 or 90 days without changes*, and *protect from automatic clean-up*.
- **What is stored:** your plans with their saved versions; a short list of deleted plans (ids and dates only, never content, so another open tab can't bring one back); any language packs you imported; your display and language settings; and, if you used version 2, a copy of your old plan kept after the upgrade so nothing is lost.
- **Safety scan before sharing.** Before a plan, its brief or a table is exported, copied or printed, every part of it (including the timeline, budget, risks and consent log) is checked for email addresses, phone numbers, map coordinates, map links, location codes and long ID numbers. The person sees what was found and where, and decides; *Go back and edit* opens the right tab. The scan never blocks.
- **Location minimisation by design.** The planner asks for a general area, warns against exact locations, records groups rather than individuals, asks for roles rather than names in the risk register, and the content never includes maps of vulnerable people or places.
- **Consent is built in.** A recorded "no" or withdrawal pauses the plan for that group, and the meeting kit's script says plainly that help never depends on taking part.
- **Anti-coercion.** The covenant (on the page and in every brief) states that aid is never conditional on participation, loyalty, labour or information about others, that nothing may reach armed actors, and that land work waits for mine action clearance.
- **Translations can't quietly change safety text.** Draft packs cannot replace safety, consent or legal text. Reviewed packs name their reviewer, show a fingerprint before they are used, and show their status on every page.
- **Safe rendering.** Imported files are size-limited, validated field by field, and always shown as text, never as HTML. CSV downloads neutralise spreadsheet formulas.

---

## Accessibility

Skip link, landmarks and headings; full keyboard use with visible focus; dialogs that trap and return focus; tabs that follow the reading direction with the arrow keys; live announcements for saving, verdicts and notices; a plain-language reading mode; larger text and relaxed spacing (helpful for dyslexia); light and dark themes; reduced motion (animation starts off when the device asks); solid surfaces instead of glass for reduced transparency; high-contrast and forced-colour support; status shown by text and shape as well as colour (including the voting cards); 44-pixel touch targets. The `lang` and `dir` of the page and of any English passages inside another language are set correctly for screen readers. The body typeface, Atkinson Hyperlegible Next, was designed by the Braille Institute for low-vision readers.

An automated audit with axe-core (WCAG 2.1 A and AA, plus best practices) reported no violations in English, French and Arabic, in light and dark themes, at desktop and phone widths, across every planner tab and dialog. Automated audits catch only part of what matters: testing with screen-reader users and community members is still needed.

---

## Features applied from the Feature Fusion Foundry

| Foundry area | Applied here |
|---|---|
| Storage and local data | IndexedDB with fallbacks, schema migration from versions 1 and 2 (with a rollback copy of the old data), several plans per device, portable JSON backups, automatic saved versions, storage estimate, persistent-storage request |
| Workers and cross-tab coordination | Web Locks so tabs take turns to save, newest-copy-wins merging, deletion records, BroadcastChannel notice with "Load latest" |
| Resilience and graceful degradation | Fail-safe startup (each part isolated, health shown in the page), no-JavaScript fallback content, capability fallback ladder, sanitised recovery from damaged data |
| Privacy and data sovereignty | Local-only mode, data inventory, selective and total deletion, retention controls, personal-detail detection before export |
| Security engineering | Content Security Policy, safe rendering, schema validation, upload size limits, CSV formula guard, removal of hidden direction overrides, https-only links, no-referrer policy |
| Evidence, provenance and integrity | Claim–evidence links (evidence web, "Supports"), evidence quality fields, citation copying, link-checked dates, SHA-256 fingerprints for language packs, draft and reviewed status labels |
| Internationalisation | Phrase catalogue extracted from the code, plural rules, locale-aware dates, numbers, money and sorting, right-to-left layouts, stale-translation detection |
| Search and knowledge | Site-wide search across sources, bridges, practices, the kit and the glossary (press / or Ctrl+K), faceted library filters, weighted ranking |
| Accessibility-first interaction | See the section above |
| Advanced visualisation | Canvas particles with depth of field and bokeh, volumetric light shafts, reflections, glass surfaces, adaptive quality, SVG evidence web, risk grid, budget bars, picture-card pictograms |
| Advanced PWA integration | Installable manifest with maskable icons and shortcuts, versioned service worker, update notice with Reload, offline page, install button only when offered |
| Decision support and systems thinking | Readiness check with essential gates, "who is in the room", dividers and connectors, budget integrity checks, risk register and matrix, consent log that pauses plans, smaller safer first steps |
| Gamification tied to real work | Bridge-strength planks with an explicit note that a complete bridge is not proof of safety (no points, streaks or scores) |
| File and OS integration | Downloads with copy fallback, clipboard with manual fallback, print-ready brief and kit, CSV for every table, single shareable file |
| Testing and self-verification | 8,069 content, language and wiring checks; 29 end-to-end tests (including offline, update, migration, import, two tabs, languages and right to left); accessibility audit; in-page app health line |

**Deliberately not adopted:** in-browser AI models and machine translation at runtime (large downloads, unreliable on low-end devices, and unreviewed AI text has no place in safety guidance), live multiplayer rooms and peer-to-peer connections (they could expose participants in conflict settings), a blocking splash screen (field users need instant access), maps and geolocation (location data risk), and any analytics.

---

## Testing

```
node tests/check-data.mjs
npm install playwright && npx playwright install chromium
node tests/browser-test.mjs
node tests/browser-test.mjs --only "Planner"    # run some tests only
```

`check-data.mjs` runs 8,069 checks: unique ids, required fields, https links, valid dates and grades, every bridge and practice pointing to a real source, the meeting kit complete with a drawing for every card, no contact details or coordinates in content, every element the script uses existing in the page, every offline file existing, the phrase catalogue up to date, every built-in language pack valid and complete, and the no-JavaScript fallback in step with `data.js`.

`browser-test.mjs` drives Chromium through 29 scenarios and fails on any console error or warning: loading at phone width without sideways scrolling; keyboard skip link; library filters and CSV; evidence web tracing; bridges; practices and glossary; search (including the kit); display settings; French (interface only, persisting across reloads); Arabic (right to left, mirrored diagram, arrow keys); importing a reviewed pack with fingerprint, stale-content and bad-file handling; readiness verdicts, autosave and saved versions; several plans; the timeline, budget checks, risk matrix, consent log and CSV formula guard; the brief, print and Markdown export; the safety scan across every tab; imports of version 1 and 2 backups; upgrading stored version 2 data; migration of a version 1 draft; auto-delete; delete everything; two tabs saving without overwriting each other; the meeting kit and its print layout; offline reopening and the update prompt; opening from disk; the single file; the embedded preview; and the hero's animated and still modes.

Not yet verified: other browser engines (Firefox and Safari), assistive technologies used by real people, slow or old devices in the field, and the draft translations by native speakers.

---

## Future extensions

These are planned and not built. The page marks them the same way.

- Reviewed language packs made with communities, starting with languages requested by users.
- Audio recordings of the consent script, made by native speakers, for people who don't read.
- Sharing a plan directly between two devices, only with both people's consent and with encryption.
- Coarse, location-minimised map layers for district-level planning.

---

## Licences and credits

- Application code and editorial summaries: © 2026 Foster + Navi / Planetary Restoration Archive, MIT licence (see `LICENSE`).
- The built-in French, Spanish and Arabic interface packs are unreviewed drafts made with AI assistance, released under the same licence. Please review and improve them.
- Fonts: Fraunces and Atkinson Hyperlegible Next, SIL Open Font License 1.1 (see `fonts/`).
- Linked publications remain the property of their authors and publishers. Links and summaries transfer no rights, and no source documents are redistributed. Listing a publication does not mean its publisher endorses this tool.
- Evidence is not endorsement.
