# Replication & Failure Intelligence

Open **Replication & Failure Intelligence** above the planner tabs. Each saved plan contains a registry of up to 200 separate reports. Earlier plans default to an empty registry. Studies, programme reports and permissioned community accounts have equal ability to be recorded; the app does not assume equal evidential strength or automatically rank them.

## Outcome classifications
- **Successful:** the report says the stated objective was achieved.
- **Mixed:** benefits, shortfalls or harms differ across outcomes or groups.
- **Failed:** the report says its objective was not achieved.
- **Interrupted:** implementation stopped before adequate completion or assessment.
- **Inconclusive:** evidence is insufficient or unresolved for an outcome determination.

These are classifications of reports, not validated causal effects or an overall verdict on a bridge. State success criteria, period, measures and denominators in each account. Interruption does not imply failure. Unmeasured adverse effects do not imply no harm. Counts are not success rates: this registry has no representative sampling denominator and cannot resolve publication bias.

## Information recorded
Each report has an intervention/replication-family name, optional catalogue bridge, source type/reference, follow-up period, objective and context, local conditions, implementation fidelity, findings, adverse effects and limitations. Document intended versus actual delivery, adaptations, delays, exclusion, dose, exposure and competing explanations. Use explicit “unknown” or “unassessed” when information is unavailable instead of leaving required narratives blank.

Costs have an optional nonnegative amount, a currency/unit and required basis describing price year, period, coverage, in-kind contributions and exclusions. Blank amount means unknown; zero means reported zero. Different currencies, price years and scopes are not aggregated or treated as comparable.

Verification states are unverified, self-reported, independent and disputed. Independent/disputed claims require reviewer role or organization, a dated reference and scope, and an independence/conflict statement. These are recorded claims, not authentication performed by the application. No report automatically advances evidence maturity, verifies a portfolio edge or calibrates a scenario.

## Contradictions, corrections and withdrawal
Reports remain separate even when their family names match. Explicit directed links can mark contradicts, supports, replicates or corrects. Describe *what* differs and relevant contextual explanations in Findings and Limitations. Both outgoing and incoming links are displayed. Matching titles or interventions are never deduplication keys, and no consensus or pooled effect is calculated. Opposing classifications need not mean true disagreement if objectives, exposure or contexts differ; users make the relationship explicit.

The editor appends reports rather than overwriting saved findings. Add a linked correction to revise an account. Withdrawals need a reason and remove reports from default registry results while retaining them in backups, exports and linked histories; enable “Include withdrawn” to inspect them. Local global search also indexes retained records. Withdrawal does not recall exported copies. A saved-plan version restore can restore an earlier registry state; the data is not a cryptographic audit log. Existing plan deletion/retention and device-wide deletion apply.

## Search and exchange
Search report text and filter by outcome, source type, verification claim and bridge. Filters combine. Search Everything indexes the active plan's registry. A registry is local to one plan; import exported registries to bring together evidence from other plans/devices. Forks preserve source-context reports and links; they do not turn inherited studies into local replication evidence. Portfolio, scenario and Evidence Web data remain separate.

Registry JSON exports contain *all* reports, including withdrawn records and reasons, through the existing safety gate. Review permissions and use collective roles instead of identifying vulnerable people. Imports accept the explicit versioned registry format, are limited to 16 MB, validate all fields/references, merge new IDs, skip identical IDs and refuse the entire import if an existing ID has different content. Source exports may therefore conflict after a withdrawal: they are not silently reconciled. Preserve both private backups and resolve intent explicitly rather than dropping a withdrawal or replacing an account. Required relation targets must be included in the imported registry. Normal plan/device backups and saved versions retain the full registry. Public briefs omit it.

## Examples and operation
The optional empty-registry example contains five clearly invented seed-intervention reports: reported improved access, uneven benefits with resentment, missed objectives during dry conditions, access-related interruption and insufficient follow-up evidence. One community account explicitly contradicts the positive study example. All are unverified, with unknown costs; none are actual evidence.

The module uses local plan storage with the existing fallback behavior. English-marked controls, explicit labels, keyboard controls, expandable text details and live status work in the offline cached app and standalone HTML. Imported text is rendered literally, and source references are plain text rather than executed links. Limits include 20 related reports per record and bounded text fields.

Verification: `node tests/replication-test.mjs` and `node tests/browser-test.mjs --only Replication` (Playwright required), plus the existing regression suite.

The existing 2 MB fork-comparison baseline limit applies to the combined plan design, including copied registry records. Very large registries may need separate registry exports instead of additional plan forks.
