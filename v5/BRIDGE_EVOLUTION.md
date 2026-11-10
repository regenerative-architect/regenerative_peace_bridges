# Bridge Evolution System — version 3.1.0

Choose a bridge in the planner's Readiness tab. In **Bridge Evolution System**, choose both maturity levels, write a rationale with context and evidence references, and select **Record lifecycle review**. A timestamped transition is saved automatically. Reviews can advance, move back, or retain the same levels. Corrections are new reviews, so earlier decisions remain visible.

| Evidence maturity | Meaning |
|---|---|
| Conceptual | Plausible idea; no local outcome assessment recorded |
| Emerging | Early observations suggest potential; uncertainty remains |
| Tested | Documented test with measured outcomes in the stated context |
| Replicated | Results reproduced in more than one test or setting |
| Context-specific Best Practice | Repeated evidence and local review support the practice within stated limits; not universal certification |

| Community maturity | Meaning |
|---|---|
| Proposed | Offered for voluntary consideration |
| Reviewed | Community representatives reviewed the proposal and concerns |
| Adapted | Changed through community input to fit the context |
| Implemented | Agreed implementation has begun |
| Locally Owned | Local people hold meaningful decisions, resources and stewardship |

These are recorded assessments, not automatically verified claims. Maturity does not override readiness, consent, safety, source grades, or the right to withdraw. An FMNR plan may be recorded as Tested / Adapted when its reviewers supply the supporting rationale. The catalogue does not assert that status without a local review.

## Where it appears

- Bridge summaries show both levels for the **active plan**. Expanded details show its three most recent reviews; the planner shows the complete history, newest first.
- Bridge filters combine evidence level, community level and text search (including review notes). The global search also indexes maturity and notes. Opening a bridge from a search or link clears bridge filters so the target is visible.
- Each plan keeps independent histories keyed by bridge ID. Changing bridges preserves previous histories. New plans begin unassessed; duplicates and saved-version restores copy the lifecycle with the rest of the plan.
- Printed and Markdown briefs include the selected bridge's lifecycle history. Bridge text copies include history. Lifecycle CSV includes previous and current levels; the existing formula protection and safety scan apply.
- Plan JSON and whole-workspace backups include all bridge histories. Import supports existing versions 1–3 and the additive lifecycle extension. Export to version 3.1.0 or newer: older app versions do not understand lifecycle fields and may discard them on import.
- The usual device-only storage, offline service worker, single HTML file, automatic saving, deletion and expiry rules apply. No new service or network dependency is added.

## Data and validation

The existing workspace and plan container schema remains 3. Each plan has an optional `evolution` object keyed by known bridge IDs (or `other`). Each value has its own `schema: 1`, `evidence`, `community` and `history`. Events contain `at` (ISO timestamp), `from` (previous levels), both new levels, and `note`.

Missing lifecycle fields migrate to Conceptual / Proposed with an empty history. No past dates or assessments are invented. Catalogue bridges have the same conservative defaults in `data.js`. Source grades A–D remain distinct.

The validator checks exact level membership, timestamps, transition continuity, rationale length and agreement between the current status and final event. Invalid lifecycle imports are refused rather than promoted or partially imported. There are at most 200 reviews per plan, each with at most 1,000 rationale characters. At the limit, export a backup and create a new plan. Backup uploads are capped at 64 MB to accommodate workspace saved versions. Local browser storage quotas still apply; watch the existing save status and retain backups.

History is an editable-device record, not a cryptographically signed audit log. Restoring a saved plan also restores that point in its history. Multiple-tab conflicts retain the existing newest-plan-wins behavior.

## Accessibility and language

Levels use explicit text, not color alone. Controls have visible labels, native keyboard behavior, linked guidance and live save/error feedback. Review text is inserted as text, never HTML. Layout uses logical spacing for right-to-left pages. The no-JavaScript page shows default levels; recording requires JavaScript.

The new lifecycle interface and definitions are English, explicitly marked `lang="en"` within other language interfaces. Existing French, Spanish and Arabic interfaces remain available. Lifecycle translations are not yet included in the translation-pack catalogue.

## Verification

Run from the project folder with Node.js 18+:

```sh
node tools/prerender.mjs
node tools/i18n-extract.mjs
node tools/build-single.mjs
node tests/check-data.mjs
node tests/evolution-test.mjs
node tests/browser-test.mjs
```

Browser tests require Playwright and Chromium. `PLAYWRIGHT_MODULE` can point to an existing Playwright installation; `BROWSER_EXECUTABLE` can point to an installed Chrome executable. The new browser scenario exercises required rationale, levels, cards, filters, history search, bridge/plan isolation, reload persistence, JSON import/export, CSV, Markdown and offline corrections.
