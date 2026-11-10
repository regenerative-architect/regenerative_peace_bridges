# Installation, storage and stable archives

Open **Your data and offline use → Installation, storage and stable evidence archives**. These controls work locally. Installation and service-worker caching require the folder edition served over HTTPS or localhost; the standalone HTML remains usable directly from a file.

## Installation and connection

The existing Install as an app button appears when the browser offers installation. It opens the browser prompt only after a click, resets after dismissal, and hides after installation. Where no prompt is offered, use the browser installation menu; on iPhone/iPad use Share → Add to Home Screen. Availability remains browser-controlled. Installation does not protect data from explicit deletion.

The connection indicator reflects the browser's network signal, not a successful internet connectivity probe. **Verify offline copy and storage** checks that every required file of the selected app release is present in its cache. The detailed status distinguishes a verified offline release, incomplete cache, unavailable verification and file-only use. It displays the running app version and serving cache version. Verification is a presence check, not a cryptographic authenticity check.

## Pinning and updates

**Pin this app release** records the verified serving cache as the release to keep using. This is an explicit local preference, stored separately from plans. A later worker continues serving the pinned cache after activation. **Unpin and use available app release** releases the pin and reloads the installed/currently waiting worker. The existing new-version Reload action also clears the pin. Both first try to save the current plan and refuse a version change if it cannot be saved or is only in memory. Save specialized module editor drafts before updating; those drafts are not yet part of a plan.

Pinning freezes application assets and built-in evidence, not editable plans, language preferences or community records. It also delays fixes; periodically review available releases. **Check for an update** does not itself remove a pin. Without a pin, browser service-worker lifecycle rules may activate an installed update after all app windows close.

The worker serves each app page and its core files from one release cache. It does not replace individual cached files with network responses from another release. A missing core file returns a clear recovery message instead of mixing versions. Installation uses an all-files cache operation; a failed installation removes its incomplete new cache and leaves earlier caches alone. Releases must always have a new worker VERSION when their files change; never redeploy different assets with the same version.

Old release caches are retained. **Remove selected older release to free space** requires confirmation and refuses the current worker's release, the serving/pinned release, an update in progress, or removal while another app window is open. It only deletes an explicitly selected release cache, never IndexedDB plans or the vault. Export older evidence or retain the release ZIP before removal. Releases predating 3.18 lack the evidence snapshot and do not appear in the reader/removal selector.

## Evidence archive version switcher

Each new release includes a generated `evidence-archive.json` containing the built-in public content registry, including source metadata and review dates. The reader lists locally cached snapshots and provides text search, full record details and JSON export. It does not fetch remote sources, run older JavaScript, import evidence into plans, or change the main library. The main library and planner always use the running app version. The snapshot is not a downloaded copy of externally linked papers or websites.

The switcher is deliberately a **read-only evidence version switcher**, not an executable app downgrade tool. This avoids exposing newer saved plans to older migrations or sanitizers. Archive selection is local to the open reader; the separate release pin persists. An exported public evidence JSON contains no private plans or vault records. Keep the release ZIP/standalone HTML to retain a runnable copy; JSON alone is not the application.

## Storage and recovery

The panel reports approximate usage/quota, persistence status and low-space warnings (80% used or under 10 MiB estimated free). Estimates may be unavailable, and limits vary by browser/device. Persistence can be requested explicitly; refusal or unsupported APIs are reported without claiming protection. The app does not silently delete plans or old releases to make space. Existing save/restore failure handling preserves drafts and reports errors; new planner failures also surface recovery guidance in this panel. Transactional plan/vault imports continue to roll back on quota failure.

**No PWA can preserve browser-held plans or cached evidence after all browser/site storage is deliberately cleared.** Persistent storage reduces automatic eviction when granted; it does not prevent explicit clearing, device loss or private-session cleanup. A pin is stored in the same browser and is not an external backup. If the pin/cache is erased, its previous state cannot reliably be inferred or reconstructed.

Before field work:

1. Keep the release ZIP or standalone HTML on a separate device/USB drive.
2. Export an encrypted plan/workspace bundle, optionally including the entire Knowledge Vault. Store its passphrase separately.
3. Request persistent storage and verify the complete offline copy.
4. Test reopening offline and restoring a backup on a separate device before relying on it.

After clearing or loss, reopen the retained release copy (or download it again), then inspect and restore the external JSON bundle. If a cached release is incomplete, a new complete app update or an external release copy is needed; checking for an unchanged worker does not repair missing files. Do not clear browser data to resolve a quota problem before exporting private records. Removing an unused older release or freeing other device files is preferable.

## Build and verification

Run `node tools/build-archive.mjs` after editing the public registry. `node tools/build-single.mjs` also refreshes the snapshot automatically. Keep worker VERSION and `data.js` metadata aligned. Checks: `node tests/pwa-test.mjs`, `node tests/check-data.mjs`, and `node tests/browser-test.mjs --only PWA` (Playwright/Chrome).

The new panel is marked English; existing installation/offline controls retain the app's localization. Browser behavior and limits follow the [Storage Standard](https://storage.spec.whatwg.org/) and [StorageManager.persist documentation](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist), reviewed 26 October 2026. This is functional verification, not a guarantee against device or browser data loss.
