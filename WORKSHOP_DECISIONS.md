# Interactive workshop decisions and risk matrix — 3.22.0

Open **Planner → Risks**. The decision tree appears above the existing risk register and matrix; no new main section is added. It supports facilitated discussion during a live workshop and remains available offline and in the standalone HTML edition.

## One question at a time

Choose **Yes / concern present**, **No / reviewed and not identified**, or **Not sure / disagreement remains**. Supply a non-sensitive explanation before saving. Previous/next controls and the question selector allow revisiting a step. Skipping a question does not answer it. Saved answers persist locally; reopening begins at the first question, with saved answers and statuses visible in the selector.

Eight core prompts cover immediate danger, water effects, unresolved consent/inclusion, land rights, resource allocation, sensitive knowledge/data, supply dependencies and ecological/livelihood effects. Water concerns open a downstream-conflict question. A downstream concern opens a question about risks from joint meetings or mediation. “Not sure” follows the same precautionary branches as “Yes” and remains unresolved.

For example:

1. Could the plan change water availability, flow, quality or access? **Yes**.
2. Could downstream communities across a conflict line be affected? **Yes** or **Not sure**.
3. The planner proposes safe upstream/downstream consultation, a mutually acceptable independent mediation process, monitoring, water-sharing conditions and a grievance route.
4. Could joint meetings expose participants to pressure, retaliation or exclusion? **Yes** or **Not sure** generates an additional safeguard: avoid unsafe joint meetings, consider safe separate channels and defer engagement where necessary.

These are authored discussion prompts, not validated predictions or a complete catalogue of local risks. A facilitator and affected groups must identify additional concerns. Do not compel participation or treat a workshop majority as consent from absent or dissenting groups.

## Safeguards and readiness

Triggered safeguards explain which answer activated them. Record a responsible role, verification reference/conditions and differing views, a review deadline and either planned or locally reviewed status. A checked status is a local claim, not independent authentication.

Unanswered/uncertain questions, missing or expired safeguard reviews, and a recorded immediate danger concern keep a started workshop unresolved. The main readiness verdict cannot advance through an unresolved workshop; existing hazard and consent holds continue to apply and are never cleared by this flow. A completed workshop means only that its recorded checks are complete. An unstarted workshop is explicitly labelled as such and does not silently change the existing planner's readiness scoring.

Changing any answer resets safeguard verification for the current review. A branch made irrelevant by a parent “No” is removed from active answers and safeguards, while its earlier values remain in history. Changes to bridge, general area, timeline activity titles or portfolio activity titles/bridge IDs invalidate the active review and require fresh answers. Restore/imported histories are evaluated against the current context. Renaming activities can deliberately require re-review; the app cannot detect every substantive change in real-world conditions, so facilitators must revisit answers when circumstances change.

Shortcuts connect safeguards to existing consent, hazard, stewardship, Traditional Knowledge, portfolio, impact, commons and systems tools. They do not create consent entries, graph dependencies, clearance declarations or evidence-maturity changes automatically.

## Interactive matrix and risk drafts

Every cell in the existing likelihood × impact matrix is a keyboard-operable button with an accessible count and selected state. Select a cell to list its open risks and jump to their existing editors. Closed risks stay outside the matrix. The full risk register remains visible, including closed risks, so the drilldown does not conceal unresolved entries elsewhere.

Ratings are ordinal community judgments, not probabilities. A low score never cancels a safety or consent hold. Matrix colors are accompanied by labels and numeric counts.

**Add generic draft to risk register** copies the question and generic safeguard only. It does not copy private answer notes, responsible roles or verification notes. Initial likelihood and impact are both 2, matching the existing register defaults; participants must review these placeholder ratings. Exact matching drafts are not duplicated. Existing risk entries are not silently edited, closed or deleted when workshop answers change. Review their continuing relevance manually. Edited draft titles may require manual duplicate review.

Ordinary risk CSV, brief and print exports include these drafts using the existing risk-register behavior. Choosing to add a draft therefore makes its generic concern visible in those outputs.

## Local records, privacy and compatibility

Answers, context and safeguard revisions are stored in `plan.decisions = {schema:1,reviews:[]}`. Private plan/workspace exports, saved versions and JSON/CSV transfer bundles retain the history. Use existing encrypted backup when needed. Public Markdown and print briefs include only a status and counts, not the workshop explanations or verification details. Local storage and plaintext backups are not access-controlled repositories: omit private identities, precise conflict-line locations and restricted knowledge.

Old plans receive an empty decision history without invented answers. Forks and duplicates start with empty workshop reviews, because the new plan needs its own contextual judgments. The source remains intact. Limits are 200 saved answer/action revisions and 2 MB per plan; a full register requires a preserved backup and a new reviewed plan, not silent history truncation. There is no synchronization, automatic notification or authenticated audit trail.

New controls use English with an explicit language attribute and support keyboard operation, narrow screens and surrounding right-to-left layouts. They do not claim reviewed translations.

## Sources and verification

The conditional rules are application-authored facilitation aids informed by [CDA's Do No Harm Project Workbook](https://www.cdacollaborative.org/publication/do-no-harm-project-workbook/) and [FAO's negotiation and mediation guidance](https://www.fao.org/4/a0032e/a0032e09.htm), consulted 27 October 2026. These sources support attention to intergroup relationships, resource effects, stakeholder participation and mediation; they do not validate this specific decision tree or endorse the app.

Model and browser checks cover branch activation/pruning, uncertainty, required explanations, context invalidation, safeguard expiry, immediate-danger holds, immutable history, exports, risk-draft deduplication, keyboard matrix drilldown, offline persistence, mobile RTL, migration and standalone operation. See VERIFICATION.md for release results.
