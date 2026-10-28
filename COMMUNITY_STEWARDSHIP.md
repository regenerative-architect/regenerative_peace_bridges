# Community Assets & Legitimacy

Open the stewardship panel above the planner tabs. Inventory six strengths: local expertise, cultural knowledge, institutions, infrastructure, ecological assets and existing collaborations. Describe capacities and relationships rather than identifying people or sensitive sites. Each asset has a fixed neutral title/summary, affected stakeholder groups, optional encrypted notes and an append-only process history. Retire an obsolete asset and add a corrected entry, with fresh permissions.

## Inclusion, consent and accountability
Affected groups link to the existing Readiness inclusion records and Consent log. The asset review displays their consent histories and permits navigation to the original planner controls. Refresh after editing those controls; export always checks the current records independently of what the panel last displayed.

Append events for disclosure granted/withheld/withdrawn, inclusion, grievance opening/response/closure, accountable decisions or retirement. Each event needs an accountable role, neutral rationale and a permissioned reference. Inclusion notes can document accessibility barriers, representation, missing voices and actions; they never automatically mark a group as heard from. Decisions should record authority/mandate, alternatives, dissent, reasons, feedback and an appeal route, with a review date. These are self-reported process records, not a legitimacy score or proof of consent authenticity.

A grievance has a coded event ID, accountable owner and response deadline. Responses/closure reference that open grievance. The registry records first-response days (rounded upward from elapsed time), late response, unanswered overdue cases and unresolved cases separately. Closing a case records a rationale/reference; it does not establish complainant satisfaction. Do not put identifying allegations in ordinary process fields. Deadlines and export checks use UTC calendar dates.

## Deliberate public disclosure
No asset summary appears in public briefs automatically. The dedicated public export includes only category, neutral title and summary for eligible assets. It excludes asset/plan IDs, group membership, timestamps, process history, references, protected notes and ciphertext. Eligibility requires:

- Every affected group is marked heard from in Readiness.
- Every affected group has dated, unconditional planner consent with a current review date. A conditional, refused, withdrawn, future-dated, undated or expired entry is insufficient. Latest entries are chosen by consent date, then log order for ties.
- The latest asset-specific disclosure decision for every affected group grants permission for this exact neutral summary, with an unexpired review date. Hearing from a group or general consent alone does not authorize disclosure.
- Any whole-community consent entry is also current and unconditional.
- An accountable asset-use/disclosure decision is recorded and its review is current.
- No asset grievance remains open and the asset has not been retired.

These are conservative application gates, not a determination that disclosure is ethically or legally safe. Only the declared affected groups can be checked; identify all relevant rights holders. A numeric or textual entry cannot authenticate consent. Explicit permission needs a real, accessible local process. Permission expiry applies through the end of its UTC date. Withdrawals block subsequent public exports; existing exported copies cannot be recalled. The existing safety scanner also runs before export, and eligibility is checked again after the scanner completes.

## Protecting sensitive information
Names, precise locations, restricted cultural knowledge and identifying grievance details belong only in **protected notes**, and only when recording is necessary and permissioned. Protected notes use AES-256-GCM with a fresh random 16-byte salt and 12-byte IV, PBKDF2-SHA-256 with 310,000 iterations, and the asset ID as authenticated associated data. The passphrase is neither stored nor recoverable. Choose a strong, unique passphrase; the 12-character minimum is not a strength guarantee. Store recovery arrangements outside this app under community control.

Protected notes are saved as ciphertext and omitted from search and public exports. To read them, enter the passphrase for a temporary on-screen reveal. Sensitive input and revealed fields clear on window blur, hiding the tab, before printing, closing the panel, refreshing/switching the plan, manual locking, or two minutes after a successful reveal. Keys are not cached by the app. Web Crypto must be available; encryption fails closed if it is unavailable. A protected-note save is explicit; other planner saves do not capture its draft.

**Only protected notes are encrypted.** Neutral titles, summaries, group IDs and process metadata remain plaintext in local storage and private backups. Do not put identifying details there. This is not user authentication, access control against someone already using an unlocked device, protection against malicious extensions/scripts, remote backup encryption or a guarantee against screenshots. People with a full backup can see plaintext metadata and attempt offline passphrase guessing. Store full backups privately. Browser/developer tools and OS memory are outside the app's protection. The UI avoids displaying or indexing protected material until explicitly unlocked.

## Persistence, forks and limits
The existing IndexedDB/local-storage fallback, saved versions, private plan JSON imports/exports and full-device backups retain the inventory and ciphertext. Imports validate schema, group IDs, bounded metadata, chronology, grievance links and encryption envelope shape; a valid envelope is only authenticated during decryption. Earlier plans start empty. Public summary JSON is a sharing report, not a restore format; use private plan backups to restore encrypted notes and process records.

Ordinary plan duplication preserves local data. New forks deliberately start with no stewardship records, encrypted notes or permissions; these are excluded from design comparisons and frozen fork baselines. Do not treat copied permissions or source-context participation as authorization for a new community.

Limits: 100 assets, 100 events per asset, 500 events per plan, 10,000 characters per protected note. Asset/event metadata is bounded. A retired asset remains in private records and backups. Existing plan deletion and device-wide deletion remove current local data; saved/exported copies require separate handling. Restoring an old plan version can restore an earlier process history; this is not a tamper-proof audit log.

Neutral-text search, labeled keyboard controls and status feedback work offline and in the standalone edition. The panel is marked English in translated interfaces. No server receives the data and no automatic publication or network synchronization is added.

## Examples
Record repair skills without naming individual practitioners; permissioned seasonal knowledge without exposing restricted teachings; a council's remit without listing private members; a learning space's capabilities without coordinates; watershed-restoration capacity without a sensitive resource location; or a partnership's general purpose without exposing negotiators. Record broad grievances such as “access arrangements need review”, preserving any necessary identifying detail in encrypted notes.

Verification: `node tests/stewardship-test.mjs` checks the model, disclosure gates and cryptography; `node tests/browser-test.mjs --only Stewardship` checks real UI, storage, export, offline and privacy behavior. These are functional checks, not an independent security audit.

