# Contribution Provenance — version 3.11.0

Open **Contribution provenance — authors, adaptations, evidence and assumptions** above the planner tabs, or select **Review contributions** on a bridge card. The ledger belongs to the selected bridge in the active local plan. Another plan or bridge has a separate record.

## Record a contribution

1. Enter the bridge's author credit where known and the group or organization responsible for adaptation. Unknown authors remain unrecorded; the app does not infer authors from institutional publishers or invent historical contributors.
2. Describe the evidence account, including community references, limitations and disagreement. Select up to twenty institutional sources if relevant. **Use catalogue evidence links in draft** copies the existing source references for review; it does not claim that they validate the local application.
3. Record the assumptions: context, dependencies, access conditions and uncertainties that underpin the design.
4. Enter who is recording the contribution and why it changed. **Preview changes** shows each changed field's before/after values. **Record contribution** saves a dated event and its source plan identity. Unchanged submissions are refused.

Every event records author-credit changes, adaptation-credit changes, evidence text changes, added/removed source links and assumption changes separately. The timeline preserves previous values and rationales. Correct a mistake through a new contribution; past events cannot be edited through this interface. Blank author or adapter fields mean unknown/unrecorded, not anonymous verification. Prefer collective roles or organizations to private identities.

The ledger is an explicit review record, not automatic monitoring of every keystroke or document update. Changing a plan note, impact observation, community account, lifecycle level or library item does not silently rewrite the contribution record. Record the relevant evidence or assumption change explicitly. Conversely, editing this ledger does not modify the global catalogue, certify evidence, promote maturity or grant community consent.

## Attribution through adaptation

Forks retain the source contribution history, original event plan IDs and an inherited-from marker. Sharing approval resets. Inherited evidence and assumptions describe the source context; the fork's lifecycle and other local assessments still start fresh. The adapter records their own credit, changed assumptions and rationale as a new event. Existing plan attribution remains distinct from bridge-specific provenance.

Duplicate, saved versions, private backups and imports retain provenance using the existing plan lifecycle. Restoring a saved version restores that version's ledger too; it is not an immutable audit service. Forks and exported files retain their own copies after a source is edited or deleted. Attribution and dates are self-reported, not cryptographically signed, authenticated or independently verified.

## Local access, sharing and export

Cards and local searches show the active plan's contribution account. Searches include prior contributors and historical text. Provenance is local-only initially. Private plan/device backups always include its full history. Approve sharing only after recording permission for **the entire history**, including earlier credits, evidence, assumptions and rationales. Any new contribution resets approval. Making it local again cannot recall previously exported copies.

Approved summaries appear in plan briefs, printouts and bridge text copies. Dedicated JSON and CSV exports provide the complete approved history and before/after changes. Restore editable records with the existing private plan backup importer; the dedicated provenance report is an exchange/report artifact, not a merge format. Imports validate chain continuity, event identities, dates, source references and current-state consistency before accepting a plan.

The local Knowledge Vault's adaptation capture includes the current provenance summary, clearly as an independent snapshot. Full historical provenance stays in the plan and private plan backup. Export safety checks inspect provenance history as well as current text; return-to-edit opens the provenance controls.

## Storage and limits

Plan schema remains 3 with an additive `provenance` schema-1 object. Old plans default to an empty ledger. Each bridge stores a current snapshot, event history, immediate inherited source plan ID and sharing permission. Each event stores ID, timestamp, actor, rationale, source plan ID and before/after snapshots. A plan supports at most 200 events and 2 million JSON characters of provenance. Credits and contributor fields support 200 characters, reasons 1,000, evidence and assumptions 4,000 each and sharing permission 500. Limits refuse a save rather than silently removing history.

The existing IndexedDB storage and offline single-file build include this feature. New controls are marked English and use labels, status announcements, keyboard-operable details and wrapping before/after text. Unsaved provenance drafts are discarded when switching plans or bridges, loading a saved version or rebuilding the interface for a language change.

Run `node tests/provenance-test.mjs`, all other model suites, `node tests/check-data.mjs` and `node tests/browser-test.mjs`. Rebuild the sharing edition with `node tools/build-single.mjs` after edits.
