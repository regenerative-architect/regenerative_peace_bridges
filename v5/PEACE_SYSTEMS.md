# Peace Systems Mapping — version 3.4.1

Open **Evidence web → System relationships**, or use a bridge's **Map peace systems** action. This extends the existing Evidence Web section; there is no separate systems section or planner tab. Switch back to **Sources and bridges** to explore the original institutional evidence diagram. The Local plan and Bridge selectors in Evidence Web share the planner's active selection. Each bridge has its own map within each local plan. Older plans start with empty maps. Maps are saved using the existing device storage, saved versions, duplication, private backups and offline support.

## Build and explore a map

1. Add nodes with a label and local definition. The nine requested types are Water, Food, Education, Health, Land Rights, Governance, Women Leadership, Youth Participation and Restoration. A tenth **Peace / other outcome** type accommodates Social Stability, Reduced Tension and other locally defined outcomes.
2. Add a directed relationship between two different nodes. Explain its mechanism and local conditions, including alternative explanations. Record an expected delay where known. A node can link to an impact indicator; a relationship can link to a community account and an institutional source.
3. Use **Same direction (+)** when increases in one variable may increase the other (and decreases may decrease it), **Opposite direction (−)** for the reverse, or **Direction uncertain (?)**. These are qualitative signs, not effect sizes or good/bad judgments. Define node labels carefully: “Tension” and “Reduced tension” have different meanings.
4. Keep **Proposed relationship** until there is local support to describe. **Locally supported account** and **Contested relationship** require a support/disagreement note. Neither is causal certification. A linked source alone cannot justify either status. Look for absent perspectives and confounding conditions.
5. Search and filter the diagram and text list by node type and relationship status. Choose a start and destination to trace one directed path through the filtered graph. The map highlights all relationships participating in a feedback loop in the full map. It does not assign reinforcing/balancing classifications or calculate loop gain, causal impact, stability, prediction or a peace score.
6. Click a diagram node, use Enter/Space on it, or use **All nodes — keyboard editing** to edit it. The complete relationship text view provides equivalent controls and full labels. Deleting a node also removes its incident relationships after confirmation.

Short maps use a vertical layout; larger maps use a deterministic grid, not geographic placement. Longer labels are shortened visually; full labels remain in accessible names, tooltips and text controls. It is not a drag-and-drop layout editor. The diagram scrolls within its own region on small screens. New controls are explicitly marked English within the existing multilingual application.

## Five illustrative maps

- **Restoration Diplomacy:** shared ecological work → joint monitoring and review → trust → sustained cooperation, with maintenance feedback and the risk that unequal benefits weaken trust.
- **Water → School Attendance → Social Stability → Reduced Tension:** the requested learning pathway, with possible mechanisms to challenge locally.
- **Restoration, water and food feedback:** restoration → water retention → food security → shared stewardship → restoration.
- **Inclusive land and resource decisions:** all nine requested types, showing possible connections among women/youth participation, governance, land rights, restoration, water, health, education and food.
- **Restoration benefits and land disputes:** a possible negative effect on crop production alongside contested ownership and resource tension.

Examples are invented hypotheses. Loading one requires confirmation, replaces the current map and keeps the previous state in history. Adapt the context and proposed mechanisms; loading an example does not count as evidence or promote a bridge's lifecycle maturity.

## History, sharing and exchange

Every saved change retains the preceding map state with timestamp and a description of the action. The latest **20 previous states per bridge** are retained. Restore requires confirmation and makes the restored map local-only. Private backups include all retained history. Unsaved form drafts are discarded when switching bridges, plans, languages or editor records.

Maps start **Local only**. Explicit permission for the exact current map is required before it enters Markdown/printed briefs, bridge text copies or dedicated map exports. Any subsequent edit resets that permission. **Make map local-only** withdraws it from future shared summaries; existing copies cannot be recalled. The local map and history remain in private plan/device backups. General device search can find local map text.

Available exports:

| Export | Contents |
|---|---|
| Map JSON | Current approved nodes, relationships and permission; no history or community account text |
| Relationships CSV | Endpoints, signs, status, mechanism, context, support/disagreement, delay, source/account references and sharing agreement |
| Diagram SVG | Standalone vector overview with labels, signs, status line styles, arrowheads and feedback markers; use JSON/CSV for full relationship details |
| Private plan/device JSON | All current maps and retained histories, including local-only text |

Local-only or withdrawn community account IDs are removed from shared map exchange. Account text is never automatically copied into a map export. A community account can be withdrawn independently, so links may become unavailable. A user who manually copies sensitive text into a node or relationship must review that text before approving map sharing. Export safety checks include current map text and retained history, as they do for other planner data.

Import a dedicated map JSON to replace the map in the selected bridge after a preview/confirmation. Imports are validated before any mutation, preserve the prior local state in history, start local-only and clear community account references (IDs from another plan are not portable evidence). Imported relationship status is a source claim, not independent verification. Files do not authenticate authors, merge automatically or synchronize across devices. Use existing plan imports for full private backup restoration.

## Schema and limits

The existing plan schema remains 3 with additive `systems: {schema: 1, maps: { [bridgeId]: map }}`. A missing systems field migrates to an empty collection. Invalid present data is rejected through the existing backup validation flow.

Each map contains `nodes`, `edges`, `sharing`, `permission`, and `history`. Nodes contain `id`, `type`, `label`, `description`, `metricId`. Relationships contain `id`, `from`, `to`, `polarity`, `status`, `mechanism`, `context`, `evidence`, `delay`, `knowledgeId`, `docId`. History records contain `at`, `reason` and the previous `graph` (without recursive history).

Limits: 30 nodes, 60 relationships, 20 previous states per map; 2 MB serialized systems data per plan; 2 MB dedicated import files. IDs must be unique within their collections; endpoints must exist; self-links and duplicate directed pairs are rejected. Opposite-direction relationships are allowed, including cycles. Text lengths and enum/reference values are validated; history dates must be chronological. Bounds keep offline rendering, storage and exchange manageable.

Run `node tests/systems-test.mjs` and `node tests/browser-test.mjs --only Systems` alongside the full regression suite. No external graph library, server, font service or network call was added.
