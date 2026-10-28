# Portfolio & Dependency Intelligence

Open **Portfolio & Dependency Intelligence** above the planner tabs. Each saved plan holds one portfolio of up to 100 activities and 300 relationships. Activities can link to different catalogue bridges or represent enabling work (such as safe land access). This complements the Evidence Web's systems hypotheses: it does not move or replace that section.

## Planning workflow
1. Add activities, optional bridge links, owners and self-reported statuses.
2. Add directed relationships. **Required dependency** means the source must be complete and the edge requirement verified before the target is ready. **Possible beneficial interaction** and **Possible tension / trade-off** describe hypotheses and never affect sequence or readiness.
3. Every relationship needs an owner, low/medium/high confidence, a verification requirement and a contingency. Verified relationships require a dated evidence/review reference. These are local claims, not authenticated findings. No evidence maturity is automatically promoted.
4. Review sequence waves, blocked activities, low-confidence requirements, cycles, status inconsistencies and bottlenecks. Completion does not automatically verify an edge. Resolve conflicting prerequisites before acting.
5. Update activities and review references as circumstances change. Edits to endpoints, relationship type or requirement reset verification in the editor. Reverify in a subsequent save. Recheck other context changes yourself.

Waves are a topological ordering of required dependencies, not a calendar or duration-based critical path. All activities (including completed ones) remain in the structural sequence. Cycles are saved so they can be repaired; their members and all downstream unscheduled activities are distinguished. Bottlenecks rank unresolved sources by reachable downstream activity count, then unresolved outgoing requirements; this is a structural signal, not an impact score. Readiness checks direct prerequisites. Active or completed activities with unmet direct requirements are explicitly flagged; completion is not retroactively erased.

The empty-portfolio example is illustrative: safe land access → seed distribution → food production → school feeding. Placeholder owners require local assignment; all example links start at low confidence and unverified. Additional use cases include water access enabling an education hub, stewardship agreement enabling restoration, and joint monitoring potentially strengthening trust. Record that last relationship as a possible benefit unless a true prerequisite is established. A contested seed allocation might create a tension with a mediation activity; a tension is not an automatic blocking edge.

## Storage, sharing and compatibility
Portfolios use the existing plan store and autosave, with IndexedDB and the existing storage fallbacks. Earlier plans default to an empty portfolio. Private plan exports, saved versions, workspace backups and imports retain portfolios. Imported IDs, endpoints, enums, text limits, bridge references and mandatory fields are validated; unknown future schemas are rejected. Delete relationships before deleting connected activities, avoiding accidental cascades.

Forks preserve portfolio design and owner roles, resetting all activities to planned and all requirements to unverified with empty review references. Adapt inherited owners and contingencies to the new context. Portfolio changes appear in fork comparisons. Ordinary duplication keeps state, as it does elsewhere in the app.

The explicit portfolio JSON export includes all saved portfolio text, current analysis, plan ID and export time and passes through the existing safety gate. It is a report, not an import format: use plan JSON backups for restoration. Public bridge briefs do not include private portfolio text. Search Everything finds saved portfolio text in the active plan. Forms use explicit labels, keyboard controls, live status and text-based graph/sequence lists. The new panel is marked as English within translated interfaces. The service worker and standalone HTML bundle both include the engine and UI; no network service or library is required.

## Verification
Run `node tests/portfolio-test.mjs`, the existing model checks, `node tests/check-data.mjs`, and `node tests/browser-test.mjs --only Portfolio` (Playwright required). Full browser regression also includes the new scenarios.
