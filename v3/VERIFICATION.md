# Verification — 22 October 2026

Verified release: 3.2.0. Environment: Windows, Node.js 24.19.0, Playwright with installed Google Chrome.

- JavaScript syntax check passed.
- 8,077 content, language and wiring checks passed.
- 30 lifecycle model checks passed (defaults, all levels, forward/backward changes, required rationale, bounds, invalid states, transition continuity and JSON round-trip).
- 80 impact model checks passed, covering all indicator definitions, zero/missing distinctions, rates and denominators, numeric and date limits, chronology, corrections, incomparable methods, lower/equal targets, import round-trip, learning reviews and record limits.
- All 32 browser tests passed, with no console warnings/errors or failed HTTP resource responses. The impact scenarios were rerun successfully after adding duplication and invalid-import assertions.
- Browser coverage includes existing library/search, bridge actions, planner tables, readiness/consent, saved versions, backups/migrations, two-tab saves, deletion/expiry, French/Arabic layouts, keyboard access, mobile overflow, offline caching/updates, file-based use and the single-file/embedded builds.
- The new lifecycle browser scenario verifies required rationale, five levels on each axis, live card updates, evidence filtering, history-note search, bridge and plan isolation, reload persistence, JSON export/import, CSV, Markdown and offline downward reassessment.
- Impact browser scenarios verify fourteen indicators/four domains, required denominators, zero baselines, targets, trend charts, retained corrections, learning reviews, three CSV exports, Markdown, lifecycle draft linkage without automatic promotion, bridge/plan isolation, duplication, reload, valid/invalid JSON imports, confirmed deletion, offline observations, export safety checks, mobile Arabic layout and the self-contained HTML edition.
- No-script content, language catalogue and single-file sharing HTML were rebuilt.

This is automated functional verification, not a full accessibility certification or human translation review. New lifecycle and impact text is English; see BRIDGE_EVOLUTION.md and IMPACT_METRICS.md for limits and data semantics.
