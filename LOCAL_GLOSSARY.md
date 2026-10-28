# Community languages and local dialects

Open **Glossary → Community language & dialect glossary**. Choose the active local plan, select an original glossary term (or a custom reference), and record the community's wording and meaning. The original glossary remains available below the editor and through each entry's original-term link.

## A workshop workflow

1. Agree what may be recorded. Use collective or anonymous attribution and avoid private identities, sacred/restricted knowledge, exact sensitive locations or other material the holders do not permit storing.
2. Record the language's own name, language tag, dialect or community variant, expression, explanation, pronunciation/transliteration, context and recording-permission reference. Tags such as `sw`, `ar`, `fr-CA` and `und-x-local` are accepted; dialect labels need not be standardized. Tag syntax validation does not certify a language or translation.
3. Preserve different meanings as separate entries. A reviewed entry requires a reviewing role/collective, process note, review date and review-again date. Disputed entries require an explanation of differing views. Review is a community claim, not external certification.
4. Revise entries with a reason. Revisions reset review and exchange permission in the editor. Earlier wording remains in private history and backups. Entries whose original definition changes or review expires are marked for review and excluded from glossary exchange.
5. Search native words, context or revision history and filter by language. Text direction can be automatic, left-to-right or right-to-left. Forms and actions are labeled for keyboard and assistive technology use.

Useful capture prompts include: a seasonal water-sharing term whose meaning differs upstream and downstream; a local seed-variety name with a pronunciation note; a council term whose authority differs by village; a word for collective stewardship that must not imply individual land ownership; or competing interpretations of a mediation term. These are discussion prompts, not supplied translations or permission to record community knowledge.

## Local ownership and exchange

Everything is stored with the active plan using the existing local save system. No translation API or network service is called. Ordinary plan JSON, saved versions and workspace backups preserve the entire glossary, including private history and permission references. Use the existing encrypted offline transfer for sensitive private backups. Device/browser clearing still requires an external backup for recovery.

**Export approved glossary entries** creates a portable `rpb-local-glossary` schema-1 JSON exchange. It includes only current entries with separate, unexpired sharing permission and no stale reference/review. The included fields are reference term/definition, language, dialect, direction, local wording, explanation, pronunciation, context, credit, claimed review status/dates, public use terms and sharing expiry. Read the export description carefully: these fields are public within the permitted audience. Private recording references, reviewer identities/roles, review notes and earlier revisions are excluded.

Import previews every entry and its public use terms, then requires permission to store. Accepted entries receive new local identifiers, retain source attribution and origin ID, and become separate local drafts with no permission to reshare. Repeated imports remain separate variants. Imported claims and permission statements are not cryptographically authenticated. Respect the declared scope; this application cannot enforce restrictions on recipients.

**Stop sharing current entry** excludes an entry from future glossary exchanges, even at the revision limit. It cannot recall earlier files. Restoring an old backup/version can restore old permission state; review permissions again after restoration. Removal deletes the entry from the current plan only. Forked and duplicated plans begin with an empty glossary so holder permissions are not inherited.

## Boundaries and schema

Community annotations never replace interface translations, original definitions, evidence grades, safety instructions or consent wording. Continue to use the existing reviewed language-pack import for interface/content localization. Public bridge briefs and workshop PDFs do not include local glossary records.

`plan.localGlossary = {schema: 1, records: [...]}` defaults to an empty register for older plans. Each record has an `id`, up to 30 immutable `versions` (`at`, `reason`, `values`), optional import `origin`, and a current `withdrawn` flag. The current values include source snapshot, language/meaning metadata, review and separately scoped permissions. There are at most 200 entries per plan and a bounded serialized size. Failed validation does not partially import entries. Strict offline-transfer validation recognizes the field and adds defaults to older bundles.

The model is `local_glossary.js`; the editor is `local-glossary-ui.js`. Both are cached with the app release and included in the standalone HTML. Model and browser tests cover Unicode, permissions, expiry, reference changes, independent imports, private/public separation, revision capacity, offline persistence and standalone use.
