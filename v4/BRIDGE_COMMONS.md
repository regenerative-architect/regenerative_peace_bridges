# Bridge Marketplace — solutions commons (3.5.0)

The Bridge Marketplace is a **non-financial solutions commons**. Communities can describe needs and offers, review potential connections and exchange notices through channels they choose. There are no prices, payments, bidding, rankings, automated commitments or messages.

## Categories

| Needed | Offered |
|---|---|
| Water | Knowledge |
| Food | Volunteers |
| Restoration | Seeds |
| Mediation | Training |
| Monitoring | Equipment |

An offered listing also identifies which needs it can address. For example, equipment or training might address water and monitoring. The board includes ten explicitly invented discussion prompts, one for each category. They never become real listings automatically.

## Create and share a notice

1. Open **Bridge Marketplace** in the contents, or **Solutions commons** from a bridge card. Select a local plan/commons board. This selector uses the same active plan as the planner; each listing can reference a different bridge.
2. Choose Needed or Offered, category and bridge. Describe the title, request/offer, community group or collective role and broad area (or remote availability). Add capacity in your own units, conditions, availability dates and a community-approved contact route. No contact is sent automatically.
3. Choose the needs addressed. Needed listings must include their own topic. For offers, select the needs the offer can actually support. Explain scope, local suitability, care and responsibilities rather than assuming compatibility.
4. Save a **Draft** locally, or set it **Open** when the group is ready. Other states are **Paused**, **Fulfilled** and **Withdrawn**. An open listing becomes **Expired** after its review/expiry date; it then stops appearing in potential matches. Dates use UTC calendar days. Future availability can still be matched when the two date ranges overlap.
5. To prepare a notice for sharing, select **Community approved this version for sharing**. A non-draft status, permission explanation, community contact route and review/expiry date are required. Sharing an open listing requires a current expiry date. Save, then export a JSON exchange file, CSV or readable plain-text bulletin.

Approval is permission to share, not publication to a server. **Nothing is uploaded.** This release remains offline-first and has no public hosting, accounts, geographic service, messaging or shared live database. Distribute files or bulletin text through an existing community-chosen channel. A publicly hosted multi-user board would require an additional backend and governance design.

Every revision requires a reason and resets the form's sharing choice to local-only. Reaffirm permission if the revised notice should circulate. To communicate closure, approve the revised fulfilled/withdrawn notice for sharing and send an updated file. Making a notice local-only prevents future exports but does not recall earlier copies. Recipients must receive and import updates.

## Find potential matches

Search by title, description, group, broad area, capacity, conditions or contact route. Filter by Needed/Offered, category, need addressed and status. Global search also indexes local listing text.

**Find potential matches** compares opposite listing types on the selected local board. It requires at least one common need addressed, overlapping date ranges and open, unexpired status. It can suggest listings associated with different bridges. Draft, paused, fulfilled, withdrawn and expired listings are excluded. Local-only open listings may participate in local planning matches.

Suggestions are not endorsements, agreements, capacity reservations or geographic matches. Discuss suitability, distance, accessibility, timing, available quantities, responsibility and consent with the community through its stated route. There is no automatic outreach or assignment of volunteers, seeds or equipment. A relationship is not marked fulfilled automatically.

## Receive notices and updates

Import a commons JSON exchange file. Validation and a preview happen before confirmation. Received notices retain their reported source ID, revision, timestamp and sharing agreement but are read-only, local-only records. They are not automatically redistributed by commons exports. To respond, create your own listing and contact the source through its chosen route.

- Identical source revisions and older revisions are skipped.
- A newer revision with a consistent bridge and non-decreasing source timestamp updates the received listing and retains the earlier local revision. This includes closure notices, so an old offer is no longer matched after its withdrawal update arrives.
- Different content for the same revision, bridge changes and backwards timestamps are reported as conflicts and skipped. They never silently replace the local copy.
- Imported copies of a locally authored ID do not overwrite that local listing.

Source IDs, community names, permissions and revisions are claims, not authentication. There is no digital signature or central identity authority. Verify the source through a trusted community channel before relying on a notice. Keep a single publishing copy for an authored notice: duplicating a private plan preserves notice IDs and can create competing revisions if both copies are edited independently.

## Privacy, backups and retention

Shared exports contain only the current approved versions of locally authored notices, including current closure/expiry notices. They exclude drafts, local-only records, received notices and revision histories. CSV records the source status and expiry date separately; consumers must check both. Plain-text bulletins label expired open notices explicitly.

Bridge copies and plan briefs include approved local notices for the selected bridge, with availability and status. They do not automatically distribute received notices. Device search and the local board can display private drafts. This is device-local privacy, not user-account access control on a shared device.

Private plan/device JSON backups include all listings, origins and histories. Existing saved versions, duplication, import/export, auto-expiry and plan/device deletion include commons data. Deleting a plan does not erase copies held elsewhere. Export safety checks scan current listings, imported source text and retained revisions. Prefer collective roles, broad locations and an existing approved liaison process over personal identifiers.

## Data and verification

Plan schema remains 3. `commons: {schema: 1, listings: []}` is additive; older plans receive an empty commons. A listing has `id`, `bridgeId`, optional `origin` and `versions`. Each version stores `at`, `reason` and a validated snapshot containing type/category, themes, title/description, community/area, capacity, conditions, route, start/end, status, sharing and permission. Origin records retain the latest received source ID, bridge, revision, timestamp and snapshot.

Limits: 200 listings per plan, 20 revisions per listing, 2 MB of serialized commons data per plan, 2 MB exchange input files. A listing reaching 20 revisions must be preserved in a backup; create a new listing with an explicit cross-reference if ongoing work requires more revisions. Imports that exceed limits fail atomically. Text lengths, categories, themes, date ordering, permissions, bridge IDs, source revisions and timestamp ordering are validated. No additional network dependency is used.

New commons controls are marked English within the multilingual application. They use labeled fields, status announcements, keyboard-accessible controls and responsive cards. The offline and self-contained HTML editions include the commons. Run `node tests/commons-test.mjs` and `node tests/browser-test.mjs --only Commons`, alongside the existing full suite.
