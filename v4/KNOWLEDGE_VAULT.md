# IndexedDB Knowledge Vault — version 3.10.0

Open **Local Knowledge Vault** from the contents menu, inside **Your data and offline use**. The four record types are research notes, community observations, lessons learned and bridge adaptations. Records remain on this device; the application sends no notes to a server.

## Capture, find and revise

Choose a type and add a title and note. Optional fields hold context/limitations, a plain-text source or citation and a related bridge. Save explicitly: unsaved form entries are drafts. Search the vault by text or filter by type and bridge. Global search also finds current vault records. Open **Edit note** to revise a record; its last ten previous revisions remain available for inspection and private backup. Deleting a note removes its history too.

Under **Capture from the active bridge plan**, explicitly copy active observations and lessons from the currently selected bridge. Their original account metadata, including source permission, context and limitations, is retained in the private note. Repeating capture skips the same source revision. Capturing a later source revision creates a separate snapshot. Unexpected outcomes remain in Community Knowledge Capture and can be recorded manually in the vault if needed.

**Capture current bridge adaptation** stores the active plan's notes, attribution and, for forks, a design comparison with its frozen baseline. It links to the portable plan identity. It is a snapshot, not a live link or a new claim of consent, maturity or verified impact. Captures do not change their source plans or community records. Later source edits, withdrawal or deletion do not remove independent vault copies. Review retention with contributors and delete copies when appropriate.

## Actual local storage

The application already stores plans and community accounts in IndexedDB. The vault uses the same `rpb` database and `kv` object store, under the separate `knowledge-vault` key. No database version upgrade or migration of existing plans is required. Existing plan knowledge is preserved in place; it is not silently duplicated into the vault.

Vault read–modify–write operations use a single IndexedDB transaction, including the revision check. Concurrent new notes are retained even without Web Locks. Editing or deleting an outdated revision is rejected rather than overwriting another tab's work. A tab receives a change notice without losing its draft; use **Reload records**, then reopen the desired note to edit its latest revision. Failed writes, including quota failures, leave the draft available and do not claim a successful save.

If IndexedDB is blocked, the visible storage status reports localStorage fallback or memory-only operation. Memory-only notes disappear when the page closes. When IndexedDB becomes available and no database vault exists, a validated localStorage vault is copied into IndexedDB; the fallback copy is retained. Cross-tab serialization in localStorage relies on Web Locks where available; the stronger transaction guarantee applies to IndexedDB.

Storage is scoped to browser profile and origin. A different browser, website address or standalone file may have a different vault. Browser cleanup, private browsing and device loss can remove local data. The vault is not encrypted and has no user authentication. Use the existing storage-protection request if useful, and keep private backups of important work.

## Backup, import and deletion

**Export vault backup** includes every record and its retained history, regardless of filters. **Export everything** also includes the vault. Import either file through the vault's import control. Plans and vault records are restored separately: planner import restores plans and directs you to the vault control for the remaining portion of an Export everything backup.

Imports validate the entire vault before writing. New IDs are added; identical records are skipped; conflicting IDs keep the local version and are counted in the result. Imports do not authenticate attribution or automatically promote evidence maturity. Review conflicts manually from the source backup; there is no silent overwrite or automatic merge. Importing a previously deleted record from a backup can restore it after confirmation.

Exports are private backups, not publication approval. Existing export safety checks scan current notes, source fields and retained history. **Delete vault contents** removes only the vault. **Delete everything on this device** clears it together with plans and other application data. Plan-specific deletion and plan expiry do not delete independent vault records. Exported files and source-plan copies remain until removed separately.

## Bounds and verification

Vault schema 1 supports up to 500 records, titles of 200 characters, bodies of 20,000 characters, context of 2,000 characters, sources of 1,000 characters and ten previous revisions per record. The vault backup is bounded to 20 million JSON characters; input files are limited to 64 MB. Oversized content is rejected rather than silently truncated, except for the displayed title of a captured community account; its full statement is retained in the body.

New controls are explicitly English, use visible labels and status messages, and render user content as text. The service worker and self-contained HTML include the vault modules. Run `node tests/vault-test.mjs`, `node tests/check-data.mjs` and `node tests/browser-test.mjs` alongside the existing model checks. Browser coverage inspects IndexedDB directly and exercises conflicts, aborted writes, capture, history, backups, deletion, offline use, fallback storage and mobile RTL layouts.

Adaptation snapshots also include the current contribution-provenance summary. Full contribution timelines remain in private plan backups; see CONTRIBUTION_PROVENANCE.md.
