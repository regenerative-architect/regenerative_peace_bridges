# Community Knowledge Capture — version 3.3.0

Community knowledge is a first-class local evidence source alongside the institutional library. The **Community knowledge** planner tab captures three kinds of account:

- **Community observations:** what people noticed, experienced or monitored in a stated context.
- **Lessons learned:** what participants think helped, failed or should change, with alternative explanations and differing views.
- **Unexpected outcomes:** unanticipated benefits, trade-offs, exclusion, disputes or other consequences that should inform adaptation.

The system does not turn an account into a verified finding, raise an evidence grade, change a maturity level or calculate an impact number automatically. Community review is a recorded local process, not external certification.

## Capture and use an account

1. Choose the bridge in **Readiness**, then open **Community knowledge**, or use the matching button on its bridge card.
2. Choose a record type and write the account in the contributors' own language where appropriate. Record a broad local context, collective source/role, gathering method, observation or discussion date and period covered. Oral histories can use the date of the discussion and describe the historical period separately.
3. Include limitations, missing perspectives, differing accounts and what should be explored next. Avoid treating a before/after account as proof of causation. Linking an institutional source does not verify the account.
4. Choose **Not yet community-reviewed**, **Community-reviewed account**, or **Different views / disputed**. Reviewed and disputed accounts require an explanation of the review process and differing views.
5. Keep the account **Local only**, or explicitly record how the community approved sharing the current version and any conditions.
6. Save the account. It becomes part of this bridge in this plan, using the existing device-only autosave, saved versions and storage-status messages.

Draft form entries are not saved until the save button is used. Switching plans, bridges, records or languages discards draft entries. The date, source and context are required. Use collective roles rather than private names; do not record precise locations, individual attendance or traumatic personal testimony.

An account can link to one impact indicator and one institutional source. The corresponding buttons open the related material. Approved accounts can draft an **impact learning review** or **lifecycle review**. These are editable drafts that require the usual save/review action; they never change maturity automatically. Only approved-for-sharing accounts offer these draft actions, because learning and lifecycle text can appear in shared briefs.

## The 69 examples are prompts, not data

Every one of the twenty-three bridges has three illustrative examples: an observation, a lesson and an unexpected outcome. They cover natural regeneration, grazing agreements, solar water, school meals, healing landscapes, restoration payments, seeds, monitoring, clinic power, zaï pits, land release, wetlands, cooking fuel, regenerative governance and all five Digital Peace Infrastructure pathways and all four Restoration Diplomacy pathways.

The examples include the requested scenarios:

> Grazing corridor agreement remained stable for 18 months.

> Committee elections reduced conflict.

> Tree ownership became contentious after crop prices rose.

All examples are invented illustrations, not claims about actual communities. The committee-election prompt specifically asks about other changes and differing accounts rather than assuming causation. Other examples examine maintenance burdens, price changes, time use, representation, seed diversity, access routes and supply constraints.

**Use this as a discussion prompt** shows the example and a follow-up question, selects the appropriate record type, and leaves the actual account blank. It does not create evidence, invent a source or imply permission. The complete examples also appear in the no-JavaScript planner and in [COMMUNITY_KNOWLEDGE_EXAMPLES.md](COMMUNITY_KNOWLEDGE_EXAMPLES.md).

## Local access, review and permission boundaries

| Surface | Included knowledge |
|---|---|
| Community knowledge tab | Current local accounts; withdrawn accounts appear only when requested; local revision history remains available |
| Bridge cards | Count of active accounts and a link to the tab |
| Bridge/global search | Current active accounts in the active local plan, including local-only accounts |
| Markdown/printed plan brief and bridge text copy | Current accounts explicitly approved for sharing, with context, source, review status, limitations and sharing conditions |
| Community exchange JSON/CSV | Current approved versions only; no withdrawn accounts or private revision history |
| Private plan JSON and whole-device backups | All knowledge, including local-only accounts, withdrawn accounts, revisions and imported provenance |

Permissions are recorded assertions, not encryption or digital-rights controls. Shared conditions must be read and respected by the recipient. Someone with access to this browser can see local records; screenshots or whole-page printing can capture what is on screen. The existing safety scanner examines knowledge text, including older versions and imported source text, before exports. CSV formula protection and safe text-only rendering apply.

## Revision, dissent and withdrawal

Revising an account appends a timestamped version and requires a reason. Earlier versions remain in the local record and private backups. The editor resets **review** and **sharing** to unreviewed/local-only for the revision, requiring a fresh decision for new wording. A disputed account may be shared if the community explicitly approves that version; its disputed status and review explanation travel with it.

Use **Withdraw this account from use and future sharing** to append a withdrawal reason. The account becomes local-only and is excluded from current summaries, searches and future community exports. Its history remains accessible through **Include withdrawn accounts**. Restoring it requires a new revision and renewed review/sharing decisions.

Withdrawal cannot recall files already shared, nor remove text already copied into notes, impact reviews or lifecycle histories. Communicate withdrawals to recipients and revise those downstream copies explicitly. There is no automatic remote revocation or background synchronization. Full deletion uses the existing plan/device deletion controls; duplicates, saved versions and exported files can retain earlier copies.

## Decentralized file exchange

There is no central server, account or upload service. Communities choose their own transfer channel, such as a USB device or messaging service.

**Export approved accounts for this bridge** creates a `rpb-community-knowledge` JSON packet. It contains the current approved versions and their record IDs, revision numbers, dates, source statements, context, review notes and permission statements. CSV provides a human-readable table of the same current approved accounts.

**Import a community knowledge exchange file** validates the complete file and previews how many accounts and bridges it contains before adding anything. Imported accounts:

- Start **local-only and unreviewed**, regardless of the source's claimed review status.
- Retain the source's original approved snapshot, ID and revision as provenance in the private record.
- Preserve reported earlier source-version links when reshared through several communities. These links are not authenticated signatures.
- Remain assigned to the bridge named in the packet, even when another bridge is currently selected. The confirmation states how many bridges are affected.
- Do not overwrite locally written or edited accounts. An identical source ID/revision/content is skipped. Different wording or a different version of an already encountered source record is kept separately and marked as related/conflicting. It must not be treated as independent corroboration.

The recipient must review authenticity, context and permission locally before relying on or resharing an import. Source review status is shown separately from local review status. Automated reconciliation, contact with source communities and institutional verification are outside this offline layer.

## Schema, migration and limits

The outer plan/workspace schema remains 3. Plans gain an additive field:

```json
{
  "knowledge": {
    "schema": 1,
    "records": []
  }
}
```

Each record contains `id`, `bridgeId`, `createdAt`, optional imported `origin`, and `versions`. Each version has `at`, a revision `reason`, and a `snapshot`. Snapshots contain:

```text
kind, statement, context, source, method, date, period, language,
limitations, action, review, reviewNote, sharing, permissionNote,
metricId, docId, withdrawn
```

Record kinds are `observation`, `lesson`, `unexpected`; review states are `unreviewed`, `reviewed`, `disputed`; sharing is `local` or `shared`. Imported `origin` preserves the source snapshot and revision, receipt time and reported provenance links. Exchange packets have `format: "rpb-community-knowledge"`, `schema: 1`, `exported` and current approved `records`; no private versions are included.

Missing knowledge fields in older plans become an empty collection. No examples or historical accounts are silently inserted. Existing private backup imports, plan duplication and saved-version restores preserve the new field. Use **3.3.0 or later** to import private backups containing knowledge; older releases do not understand the field and may discard it.

Validation rejects unknown bridges, source/metric IDs, enums or schemas; invalid dates/timestamps; future observation dates relative to recording; duplicate record IDs; incomplete context/source/account fields; missing review or sharing explanations; and invalid revision/provenance structures. Text is never executed as HTML.

Limits are explicit: 200 accounts per plan, 20 versions per account, 20 prior exchange links, and a 2-million-character serialized knowledge limit per plan. Statements allow 1,500 characters; context, limitations, actions and review notes allow 1,000; permission notes and revision reasons 500; source roles and periods 240. Exchange uploads are capped at 5 MB. Over-limit data is refused rather than truncated. Private backups keep the existing 64 MB upload limit; export individual plans if a very large whole-device backup exceeds it. Browser storage quotas still apply.

## Accessibility, offline use and verification

Native labeled controls, fieldsets, keyboard-accessible tabs, live feedback, text-based status labels and bidirectional account text are included. The account's declared language is applied to its statement. New interface text remains English and is marked as such in the existing French/Spanish/Arabic interfaces; it is not yet in the translation-pack catalogue.

`knowledge.js` contains validation and exchange logic; `knowledge-ui.js` the editor; `knowledge-examples.js` the illustrative prompts. All are included in service-worker caching and the self-contained sharing HTML. No new framework, package or remote service is required.

Run:

```sh
node tools/prerender.mjs
node tools/i18n-extract.mjs
node tools/build-single.mjs
node tests/check-data.mjs
node tests/evolution-test.mjs
node tests/impact-test.mjs
node tests/knowledge-test.mjs
node tests/browser-test.mjs
```

Model and browser tests cover example separation, all record types, required context, review/permission boundaries, revision and withdrawal, import validation, duplicate/conflict handling, provenance, search, private backups, linked review drafts, literal text rendering, offline operation, mobile RTL and the single-file build. See [VERIFICATION.md](VERIFICATION.md) for release results.
