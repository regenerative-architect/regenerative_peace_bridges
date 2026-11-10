# Hazard & Demining Prerequisite

Open **Hazard & Demining Prerequisite — before field work** above the planner tabs. Mine/UXO safety is a prerequisite to physical intervention, not a readiness score to average against other benefits. The app does not inspect land, authenticate clearance documents, dispatch responders or authorize work.

## Immediate concern

Stop work. Do not approach, touch, move or disturb suspected mines or unexploded ordnance. Do not enter suspected areas to inspect, mark or photograph hazards. Follow local emergency guidance and contact the competent mine-action service from a safe location. Only appropriately qualified, authorized organizations conduct survey, clearance and disposal. No detection, handling or clearance instructions are provided.

## Checklist and review

Existing and new plans start **unresolved**. A legacy “yes” or “not applicable” on the general land-safety question cannot substitute for this review or produce a ready-for-pilot verdict.

A documented prerequisite review requires:

- Selected bridge and general location, plus a description/reference for the exact authority-reviewed work scope. Do not enter precise coordinates or hazard locations.
- Competent authority or accredited mine-action organization and a dated assessment/land-release reference. Do not assume that clearance for another area, hazard type or intended use covers this work.
- Applicable restrictions and conditions, responsible local role, assessment date, next review date and rationale.
- All six checklist entries: qualified assessment, matching scope, access/boundaries, appropriate risk education, local stop-work/reporting/emergency arrangements, and residual-risk monitoring/review triggers.

Completing the form means **prerequisite records complete — not a clearance certificate**. References and checkboxes remain locally entered claims. They do not independently establish that land is safe. The relevant authority's scope, national standards, restrictions and ongoing risk management govern any work. Other readiness and consent blockers still apply.

The gate blocks field recommendations when no review exists, a stop-work concern remains, a review is future-dated/overdue, the bridge or general location changes, or timeline activity titles / portfolio activity titles or bridge assignments change. Changing dates or progress alone does not define a new work scope. The authority's specific work scope cannot be inferred from generic plan text: manually obtain a new review for any other material change, even if the app cannot detect it. Renewed conflict, suspicious items, flooding/erosion, changed routes, methods or intended use are reasons to stop and refer back for review.

**Record stop-work concern** appends an unresolved review and clears checklist confirmations. It can be used without completing the review form; a neutral reason and unassigned role are recorded if those fields are blank. It records a local hold, not a report to authorities. Up to 100 ordinary reviews are retained, with one reserved final stop-work slot so a full history cannot prevent suspension. Export the history before beginning a fresh plan when capacity is reached.

## Desk-only scope

A narrowly scoped desk-only review is available for community archives, local knowledge, resilience portals and governance planning. It requires an explicit non-field scope, conditions, rationale, role and next review. It cannot exempt a biophysical bridge or a portfolio with field/unspecified activities. It does not authorize site visits, assembly access, installation or ground work. Moving from desk planning to field activity requires a new authority-based review.

## Integration and privacy

- Readiness cannot become ready/almost-ready while the hazard gate is unresolved. A selected bridge shows the pause prominently. An unselected, incomplete plan can retain its general “not started” or “groundwork” label, but its separate hazard status remains STOP.
- Bridge cards, copied bridge summaries and no-script fallback pages show the prerequisite before pilot steps. Published bridge descriptions remain educational proposals, not field instructions.
- Plan briefs replace a blocked bridge's recommended first step with prerequisite resolution. They include status and limitations but omit private authority references, work-scope details and review history.
- Timeline entries remain editable planning placeholders; no timeline progress label authorizes physical work. Portfolio “dependency-ready” describes graph conditions only and displays the separate hazard gate. This app cannot prevent real-world actions or verify documents.
- Local search includes review references and rationale. Existing export safety scanning includes these fields. Use roles and controlled document references instead of names, hazard coordinates or device descriptions.
- Private JSON backups, encrypted transfer bundles, saved versions and whole-device exports retain reviews. Imports retain declarations with their original context and dates; the app re-evaluates the gate but cannot verify the source. Legacy plans and bundles without this field migrate to unresolved.
- Duplicating a plan or creating a fork resets the hazard prerequisite. The source record remains intact. A transferred copy keeps the same declarations for the same context; it is not proof of current clearance.
- The feature works offline and in the standalone HTML. All safety guidance needed for the checklist is bundled; external source links are optional. Newly added controls are marked English.

## Sources and build

Reviewed 26 October 2026:

- [IMAS 07.11: Land release](https://www.mineactionstandards.org/standards/07-11/) — qualified, nationally governed land-release processes, scope and residual contamination.
- [IMAS 07.14: Risk management in mine action](https://www.mineactionstandards.org/standards/07-14/) — residual risk and accountable risk management.
- [UNMAS Landmines, Explosive Remnants of War and IED Safety Handbook](https://unmas.org/sites/default/files/handbook_english.pdf) — civilian avoidance and safety guidance.

These are safety references, not authorization for a local project. The app's existing IMAS source entry remains available in the library.

Implementation: `hazard.js` (validation, history and gate), `hazard-ui.js` (checklist), planner/brief/portfolio/card integration. Plan schema 3 gains optional `hazard: {schema: 1, reviews: [...]}`; absence migrates to an empty history. Transfer validation allows this explicit missing-field migration while retaining strict checks for other data loss. Tests: `node tests/hazard-test.mjs` and `node tests/browser-test.mjs --only Hazard`.
