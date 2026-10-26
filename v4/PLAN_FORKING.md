# Plan Forking — version 3.9.0

The planner now supports independent forks, adaptation, comparison and retained attribution. Create a plan with **New plan**, or open a bridge with **Plan this bridge**. Open **Plan forking, attribution and comparison** above the planner tabs.

1. Record a community or organization in **Plan attribution** and an adaptation note or reuse conditions. Avoid private names. Save attribution, or fork directly to save the entered attribution with the source.
2. Choose **Fork this plan** and review the copy scope. The source remains a separate plan. The fork receives a new portable identity, its source attribution chain and a frozen design baseline.
3. Rename and adapt the fork using the existing planner. Add your own attribution and explain the adaptation. The inherited attribution chain remains visible.
4. Choose **Compare now** against the frozen source design or another local plan. Before is the selected source; after is the active design. Refresh the comparison after edits. Arrays are shown as changed lists rather than line-by-line or row-matching edits. Values display up to 5,000 characters; comparison JSON contains complete changed values.
5. Export a backup to transfer the editable plan, full lineage and baseline. Import it through **Import backup**, then fork to make an adaptation with a new identity. Briefs and printouts include attribution and adaptation notes, but not the private comparison baseline.

## What a fork carries

The design includes name, broad area, selected bridge, dividers/connectors, measures, notes, timeline, budget, risks and systems maps. Timeline entries become planned; risks reopen; the next review date clears. Map history and sharing permission clear, relationship claims become hypotheses, and local support/account links clear. Institutional source links and explanatory context remain for review.

Readiness answers, participation status, consent decisions, lifecycle maturity, impact data, community knowledge records and commons notices start empty. They belong to the source context and must not become evidence or authorization for a new community. Review inherited notes, schedules and map descriptions for context-specific claims. The frozen baseline is the copied design **after these resets**, so the comparison shows subsequent adaptation rather than the reset operation itself.

The original **Duplicate** action remains available for an ordinary full local copy. It preserves existing lineage if present but does not record the copied plan as a new parent. Use **Fork** for a new attributed adaptation. Both create new plan identities. Backups imported as copies preserve the portable identity; local workspace IDs are separate.

## Lineage, limits and privacy

Plan schema remains 3 with an additive `forking` object (schema 1): portable ID, current credit/note, up to 20 ancestors and one parent baseline. Each ancestor records source identity, title, credit, note and fork timestamp. Baselines contain design fields only, never recursively embedded lineage. Baselines are bounded to 2 MB; the existing limit of 20 local plans and five saved versions remains in force. Further forking at the ancestry limit is refused instead of silently dropping attribution. Validation rejects invalid IDs, dates, cycles, parent mismatch, nested baseline fields and excessive sizes.

Old plans receive empty lineage and an identity; existing content is preserved. Saved versions include lineage, so restoring a version also restores its attribution state. Source edits or deletion do not alter a fork's baseline. Deleting the source does not erase retained copies in forks or exported files; delete those separately when required. Editing attribution in the source does not retroactively change existing fork credits.

Attribution and timestamps are self-reported metadata, not signatures, verified authorship, a licence grant or community consent. This is a local adaptation workflow: it does not provide hosted collaboration, pull requests, automatic merging or synchronization. Existing storage conflict checks still apply to multiple browser tabs.

Private backups include the frozen design, which may contain old notes no longer present in the active plan. Comparison JSON may reveal both designs. Export safety checks cover attribution, the retained baseline and any compared local plan; review permission before sharing. A baseline is retained unchanged; if it contains information that must not be retained, remove that fork and its backups rather than presenting a redacted snapshot as the original. No automatic publishing or messages are sent.

## Offline and accessibility

The feature uses the existing device storage, service-worker cache and self-contained HTML edition. New controls are explicitly English, with visible labels, keyboard-operable buttons and details, status announcements and wrapping comparison text for narrow screens. Existing language packs remain available. Comparison values are rendered as text rather than HTML.

Run `node tests/forking-test.mjs`, the other model suites, `node tests/check-data.mjs` and `node tests/browser-test.mjs`. Rebuild the sharing edition with `node tools/build-single.mjs` after edits.

Contribution provenance is also retained when forking, labeled as inherited and reset to local-only sharing. It is historical attribution, not transferred local evidence maturity. See CONTRIBUTION_PROVENANCE.md.
