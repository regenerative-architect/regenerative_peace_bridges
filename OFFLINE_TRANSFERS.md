# Offline JSON / CSV Transfer Bundles

Open **Offline JSON / CSV transfer bundles** above the planner tabs. Existing Export backup, Export everything and section CSV exports remain available. This panel adds complete private transfers for USB drives, air-gapped tablets and trusted local mesh file-sharing without a server, account, automatic upload or centralized dependency.

## Export
Choose the active plan or all local plans. Every selected plan includes all current model fields and up to five saved versions. Optionally include the **entire device Knowledge Vault**, which may contain unrelated private notes. Unsaved editor drafts are not included; save specialized module editors first. Current planner values already entered into the plan are captured even if its autosave is pending.

- **Encrypted JSON bundle:** encrypts all selected content, including titles, ordinary notes, saved versions, optional vault, CSV tables and inner manifest. The outer envelope contains only format/cryptographic parameters and ciphertext. Enter a matching passphrase of 12–500 characters. No password is saved. Loss of the password means the file cannot be recovered by the app.
- **Plaintext JSON bundle:** portable versioned files with SHA-256 integrity hashes and an authoritative `snapshot.json` inside the bundle.
- **Plaintext ZIP:** an ordinary store-only ZIP containing `manifest.json`, `snapshot.json`, a README and CSV review tables. ZIP files are **not encrypted**. Use encrypted JSON when confidentiality is needed.

CSV files cover plans, timeline, budget, risks, consent, module components and optional current vault records. Nested components are retained as JSON cells; full saved versions and vault revision history remain in the authoritative snapshot. Cells are quoted and formula-like string prefixes are neutralized with an apostrophe. Spreadsheet edits are not imported as plan changes. Standalone CSV cannot represent every nested plan field and is not a full restore format. The original app ZIP or JSON bundle is needed for integrity-checked restore.

The safety scanner reviews selected plans, their histories and vault content before download. A private transfer does not authorize public publication or reuse of accounts. Share only with intended recipients and under applicable community permissions. Encrypted stewardship notes remain separately encrypted inside the transfer, requiring their original passphrases after restore; whole-bundle encryption does not decrypt or remove those protections.

## Encryption and integrity
Whole-bundle encryption uses AES-256-GCM with fresh random 16-byte salt and 12-byte IV, PBKDF2-SHA-256 (310,000 iterations), and authenticated fixed format/version parameters. Web Crypto is required, including for SHA-256 integrity checks. Unsupported contexts fail closed rather than silently producing plaintext. Use the downloaded app on a supported browser, or a locally served secure context. No remote cryptographic service is used.

The 12-character minimum is not a password-strength guarantee. Use a strong unique passphrase and communicate it by a separate trusted route. Encryption protects the transferred file, not the destination's ordinary local storage, unlocked screen, compromised device or malicious extension. After restore, ordinary plan/vault fields have the app's usual local-storage behavior. Protected stewardship notes retain their own encryption.

Inspection shows a SHA-256 fingerprint of the validated inner bundle. Compare it with the sender through a trusted channel if authenticity matters. Hashes catch accidental corruption and mismatched files; they do **not** authenticate an author, publisher or consent claim. Anyone able to edit a plaintext bundle can recompute hashes. AES-GCM authentication detects changed ciphertext but does not identify the sender beyond possession of the passphrase. Passphrase fields clear after use and window blur; hiding the tab, printing or clearing inspection also discards the pending decrypted preview. No plaintext contents are written by inspection.

## Restore
1. Choose the JSON or original app ZIP. For encrypted JSON, enter the passphrase.
2. Select Inspect transfer. The app verifies integrity and validates every current plan, saved version and vault record before offering restore. Review counts and fingerprint. No import occurs at this step.
3. Choose whether to restore the included vault. Confirm addition of new local plan copies. Existing plans and settings remain unchanged.

New local workspace IDs avoid overwriting plans. Portable plan attribution IDs and lineage remain unchanged, so this is a transferred copy, not a new fork or automated merge. Repeated imports intentionally create additional copies. Use plan comparison/forking to reconcile separately edited field copies. There is no automatic consensus or synchronization.

All selected plans are restored or none are: capacity limits do not silently truncate a transfer. Malformed/unsupported plan fields or versions are refused rather than dropped. Vault IDs that are byte-equivalent after normal validation are skipped; an ID with different content aborts the combined import so changes are not silently overwritten. Preserve both copies and resolve the conflict explicitly.

In IndexedDB, workspace and vault restoration use one read/write transaction including conflict checks. Quota errors or transaction aborts roll back the import. In localStorage/memory fallback, plan-only restoration uses a single workspace write; combined plan/vault restoration is refused before mutation because cross-key atomicity is unavailable. Uncheck vault restoration and use Export included vault separately, then the existing vault importer, if needed. Memory-mode plans are not durable after closing the app. Restore does not change display preferences, language packs or retention settings.

## Limits and portability
The transfer bundle, including review CSVs, is limited to 25 MiB. Incoming files are capped at 40 MiB (to allow encrypted base64 overhead). Existing plan, history and vault limits still apply. Export fewer plans when over the limit. ZIP restore deliberately accepts only the app's original store-only ZIP structure and verifies checksums, membership and metadata; no filesystem paths are extracted and no compressed data is expanded. Repacked/modified ZIP archives are refused. Use the separately exported JSON bundle instead.

Source and recipient should use compatible app versions. The importer refuses unknown/truncated fields rather than claiming a lossless import. Legacy v1/v2/v3 plaintext backups still use the original planner import controls. New bundles use this panel; CSV is for reading, while the inner snapshot is authoritative. No archive URL or federated publishing endpoint is configured by this feature. A broader federated resource registry can build on the offline portability layer separately.

Tests: `node tests/transfer-test.mjs`, `node tests/check-data.mjs`, and `node tests/browser-test.mjs --only Transfer` (Playwright required). This is functional verification, not an independent security audit.
