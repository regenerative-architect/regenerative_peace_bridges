# Indigenous & Traditional Knowledge

Open **Planner → Community knowledge → Indigenous & Traditional Knowledge**, or the link in the Evidence library. This framework sits alongside institutional publications without assigning TK an A–C grade. Holder-led knowledge, its ecological/cultural context and its value do not depend on publication or endorsement by scientific institutions. Cross-references are relationships to consider, not a hierarchy or proof of equivalence.

## Community authority comes first

Knowledge holders determine whether an account should be documented at all, who can speak for it, and what may be retained or shared. The form requires an explicit confirmation and reference for permission to record and store the particular account on this device. It captures the permission date and a retention-review date. The app records these declarations; it cannot authenticate a representative, establish rights, resolve disputes over authority or replace a community's own decision process.

Choosing not to document is valid. Do not enter secret, sacred, location-sensitive or otherwise restricted material. “Local only” is a sharing setting, **not encryption or access control**. The ordinary description, metadata and history are plaintext in local device storage and private backups. This feature is for authorized documentation, not a repository for restricted cultural knowledge. The existing encrypted transfer bundle can protect a file in transit, but does not encrypt ordinary restored data. Other people with device access may be able to read it.

## What a record can contain

- A self-described knowledge tradition: Indigenous ecological knowledge, traditional local practice or community ecological practice. These categories are not ranks or identity verification.
- An authorized description; holder collective/cultural authority role; requested attribution context; and language code.
- Ecological, cultural and seasonal context; ways the knowledge is maintained, transmitted or locally assessed; limitations and different interpretations.
- Community protocols, allowed audiences and uses, restrictions, responsibilities, reciprocity and benefit-sharing arrangements.
- Recording/storage permission, a holder-led review account and retention review date.
- Up to four links to existing institutional sources, practices or bridges, each with a relationship and explanation.

Relationships may describe related context, complementarity, differing accounts/conditions, or a question for joint inquiry. There is no “scientifically certified” relation. A disagreement does not delete or downgrade an account; distinct records can coexist. Nothing automatically changes an institutional grade, bridge evidence maturity, causal model or hazard prerequisite.

Ten optional discussion prompts cover seasonal indicators, seed care, soils, water sharing, mixed cultivation, regeneration, wetlands, pollinator relationships, terrace maintenance and collective governance. They are generic invitations, not examples attributed to an Indigenous people, evidence claims or practices automatically added to a plan. Use them only if holders wish to discuss the subject.

## Sharing is a separate decision

Records default to local-only. A shared summary requires all of the following:

1. Permission to document/store the account and a retention-review date that has not passed.
2. Holder-led review, including room for different perspectives.
3. Separate approval/reference for the exact public summary, credit, use terms and intended audience/use, with an expiry date.
4. Public title, summary, credit/anonymity wording and terms, plus recorded benefit/reciprocity arrangements.

Public use terms should state the audience, permitted use, restrictions, relevant benefit arrangements and how further engagement with holders should occur. This is not an automatic open license. The public summary export and public plan brief contain only the separately approved fields. Private practice descriptions, collective metadata, internal protocols, permission references, relationship explanations and revision history are excluded.

An additional explicit choice permits exporting linked source/practice/bridge IDs and relationship types. Relationship notes always remain private. Exported expiry uses the earlier of sharing expiry and retention review. Dates are evaluated using the app's UTC calendar date; check community-specific timing and restrictions yourself. Sharing eligibility is recomputed for exports and briefs, including before printing. A form cannot enforce every customary restriction; the operator remains responsible for complying with the stated protocol.

Revisions default back to local-only and require renewed confirmation of recording permission. Public sharing must be deliberately reapproved for the revised account. Previous public revisions are not included in current summary exports or briefs.

**Withdraw from further sharing** adds a local withdrawal event without duplicating the account's content, including when ordinary revisions have reached their limit. It stops sharing from the current record in this plan. It does not recall exports, withdraw another plan's copy, or rewrite saved plan versions; coordinate those copies separately. A withdrawn account remains withdrawn in this editor. Fresh permission can support a new account rather than silently reviving the old one.

**Remove from current plan** removes that record and its internal revisions from the current plan after confirmation. Saved versions, imported copies, external backups and other devices may retain data. This is not guaranteed complete erasure. Retention expiry prompts review and prevents sharing; it does not automatically destroy history or enforce arbitrary free-text retention terms.

## Local Contexts

The optional Local Contexts project URL is a reference to a community-managed project. The app does not fetch it, verify ownership, create labels, copy label icons, certify or apply TK/BC Labels. Community authority over their labels remains with the holders and the Local Contexts process. A URL alone is not permission.

## Integration and offline use

- The evidence library explains the distinction between institutional grades and TK. Source cards link back to relevant TK accounts for the active plan and bridge; the reader can filter by that relationship. Institutional library CSV exports remain institutional records only.
- Bridge cards show a local TK account count and an entry point to the framework. Global/local search can find authorized local accounts and revisions. Ordinary library exports and cached public evidence archives never acquire private TK records.
- Public plan briefs include only currently eligible approved summaries and terms. The private export safety scanner includes TK fields.
- Whole-plan/device JSON, saved versions and encrypted/plaintext transfer bundles preserve local accounts, protocols, withdrawals and revisions. These are private copies, not publishing permission. Public summary JSON is a disclosure format, not a full restore file or an automatically trusted consent grant.
- Forks and duplicates start without TK records or permissions; the source plan retains them. Imported private backups retain their declarations and dates, which must be reviewed locally. Legacy plans and transfer bundles default to an empty TK collection; no traditions, consents or holder identities are invented.
- Everything works offline and in the standalone HTML. External reference links are optional. New controls are marked English; account text and language identifiers are community-provided.

The current plan supports 100 accounts, 20 ordinary revisions per account, four cross-references per revision and a 2 MB ordinary TK payload. A small additional allowance is reserved for withdrawal metadata so capacity does not prevent withdrawing accounts. Preserve community-authorized backups before starting another plan when limits are reached.

## Sources and implementation

Framework references reviewed 27 October 2026:

- [Local Contexts: About the Labels](https://localcontexts.org/labels/about-the-labels/) — community-defined provenance, protocols and permissions.
- [CBD guidance on prior informed consent and traditional knowledge](https://www.cbd.int/doc/recommendations/wg8j-10/wg8j-10-rec-02-en.pdf) — holder participation, the right to decline and informed decisions about access/use.

These references inform the design; they do not establish a community's authorization or imply that this app is endorsed by those organizations. Actual protocols and authority remain community-specific.

Implementation: `traditional_knowledge.js`, `traditional-knowledge-ui.js`, and existing planner/library integrations. Plan schema 3 gains optional `traditionalKnowledge: {schema: 1, records: [...]}`; older plans default to an empty collection. Tests: `node tests/traditional-knowledge-test.mjs` and `node tests/browser-test.mjs --only 'TK:'`.
