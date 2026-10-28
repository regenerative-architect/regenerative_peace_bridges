# Seed sovereignty, community banks and local nurseries — 3.21.0

Choose **Seed Sovereignty & Local Propagation** in Solution bridges, then plan the new **Community seed sovereignty, seed banks and local propagation** bridge. Its register is also available to every bridge under **Planner → Community knowledge**. Bridge cards link directly to it. The existing shared-seed diplomacy bridge remains available.

## Community control first

Record only information authorized for this device: a non-sensitive custodian role, source, variety/material, permission reference, use/exchange terms and obligations. Community-controlled material is distinct from documented open-source seed. A donation, absence of a patent claim, or a user-selected status does not establish an open-source pledge. The app does not assign OSSI labels or verify legal rights. Retain the actual pledge/license and downstream obligations, obtain appropriate community permissions, and review applicable plant-health and seed-transfer requirements before movement.

Use the Traditional Knowledge framework for knowledge-holder protocols, attribution, separate sharing permission and differing accounts. The seed register does not grant permission to publish or repurpose associated traditional knowledge. Its shortcut opens that framework; it does not copy knowledge or infer consent.

## Lots, stock and propagation

- Create separate lots for different varieties, provenance, material types or units. Material type and unit are immutable after creation. Stocks are never summed across incompatible units.
- Each lot starts at zero stock. Append receipts, produced material, issues, losses, consumption or explained corrections. Record actual historical movements even when reviews are unresolved; a movement is not distribution authorization.
- Quantities must be positive and finite, with up to six decimal places. Outgoing movements cannot make the recorded balance negative. Prior movements remain in history; corrections require new entries with reasons.
- Metadata changes require renewed confirmation of permission and an explanation. Earlier values remain visible in revision history. Local timestamps and attribution are user/device claims, not independently authenticated audit evidence.
- Nursery records distinguish units started, established/germinated, surviving and ready. Counts must be whole numbers with ready ≤ surviving ≤ established ≤ started. Establishment uses started units as its denominator; survival uses established units. Zero denominators display “not measured.” Use a separate lot for a separate cohort or observation scope.
- Nursery counts do not create inventory automatically. Record physically verified outputs separately, avoiding duplicate counting of parent and propagated stock. The app does not infer yield, planting suitability or peace effects.

Each lot records a seed/plant health state, review method and limitations, review deadline, supply prerequisites with owner/verification notes, confidence and a contingency. Warnings identify unknown rights, quality holds or missing reviews, overdue review, uncertain supplies and zero stock. These are review prompts, not certification or a comprehensive risk assessment.

Use **Portfolio dependencies** to model the actual prerequisite graph, owners, verification and contingencies. The register's prerequisite notes are not automatically converted into graph edges. Use **Hazard and land-access prerequisites** before field or nursery work. Seed records cannot override the hazard system or establish clearance.

## Privacy, portability and offline operation

The register is local and works in the installed offline application and the single-file sharing edition. Do not record exact bank locations, transport routes, private identities, sacred knowledge or restricted cultural material. Device storage and ordinary private backups contain plaintext; choose the existing encrypted transfer bundle when appropriate. Local storage is not an access-control system.

Private plan exports, workspace backups, saved plan versions and JSON/CSV transfer bundles preserve `seeds`, including its histories and stock movements. Public Markdown/print briefs, library exports and cached evidence archives do not publish the seed inventory. No synchronization or external seed sharing is performed. Exporting a private backup shares everything it contains with its recipient.

Existing plans migrate to an empty `{schema:1,lots:[]}`. Forks and duplicates start with empty seed registers to avoid copying physical-stock or community-permission claims. Their source plans and source backups remain intact. There is no automatic reconciliation between air-gapped copies: compare provenance and histories before manually recording a reconciled stock movement. Importing a backup does not prove it is the latest inventory.

Limits: 100 lots per plan, 30 metadata revisions and 300 stock movements per lot, 2 MB total register. When limits are reached, retain a private backup and establish a new reviewed register; do not silently discard history. No new network request is required to use this module.

## Examples and evidence boundaries

The UI includes planning prompts for rebuilding seed reserves, nursery water and container dependencies, disrupted supplies, documented open-source exchanges and equitable access to diverse varieties. Three additional community-learning examples distinguish an observation, a lesson and an unexpected diversity outcome. They are explicitly illustrative, not reports about an actual community. The new bridge starts at Conceptual / Proposed; stock records do not automatically increase evidence maturity.

Primary references consulted 27 October 2026:

- [FAO: Community seed banks](https://www.fao.org/fileadmin/user_upload/fao_ilo/pdf/Other_docs/FAO/Community_Seed_Banks.pdf) — community seed-bank learning and continuity of suitable seed supplies.
- [FAO: Farmers’ Rights FAQs](https://www.fao.org/plant-treaty/areas-of-work/farmers-rights/faqs/en) — participation, traditional knowledge, benefit sharing and seed rights in their legal context.
- [Open Source Seed Initiative FAQs](https://osseeds.org/ossi-faqs/) — documented pledges and downstream obligations; open source concerns freedom of use, not zero price.

These sources inform the framework; they do not endorse the application or verify local entries.
