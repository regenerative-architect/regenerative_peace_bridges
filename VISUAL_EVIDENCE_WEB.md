# Visual Evidence Web — 3.23.0

Open **Evidence web → Climate & restoration pathways**. The new view sits inside the existing Evidence Web, alongside **Sources and bridges** and the editable **System relationships** view. Neither existing view is replaced.

## Explore a pathway

Choose drought, flooding/shared watersheds, disrupted farm access/seed systems, or all pathways. The map contains 15 nodes and 20 illustrative relationships across four labelled groups: pressures, ecological/access conditions, possible livelihood/social effects and proposed bridges.

Select a node to see its explanation and incoming/outgoing relationships. Select a relationship in the detail panel or text list to see its discussion question, proposed direction, relationship type, related publications and their limitations. Related sources open the existing library; bridge details open the existing bridge card.

- **Whole pathway** retains the overview and highlights direct connections to the selected node.
- **Selected node + direct connections** reduces the diagram to its immediate neighborhood.
- **Follow arrows from selected node** follows the displayed directions through the chosen story. It is graph traversal, not a causal simulation; a terminal node can have no outgoing arrows. Proposed bridges pointing into a pressure pathway do not appear as downstream consequences of that pressure.
- **Search** finds nodes within the selected story, using names, descriptions and types. The result buttons provide a full text alternative even when the diagram is narrowed. Choose “All illustrative pathways” to search across all stories.
- **Zoom**, **Fit overview**, native horizontal/vertical scrolling and **Reset view** help navigate the map. On narrow screens the canvas scrolls within its own frame, rather than widening the whole page. Fit retains a minimum readable scale; it does not force the entire diagram into a phone-width thumbnail.

Keyboard users can Tab through node buttons, select with Enter/Space, and move among visible nodes with arrow keys or Home/End. Relationships and source links are ordinary text buttons. Text, labels, arrowheads and a legend supplement color. The map has no force animation, dragging requirement or motion dependency. New controls are English with explicit language/direction; surrounding right-to-left layouts remain supported.

## What the arrows mean

Orange arrows mean **may worsen**, green arrows **may help address**, and purple dotted arrows **possible trade-off**. All relationships are illustrative and dashed. They have no assigned causal certainty, probability, effect size or A–C grade. Publication grades describe those publications, not the arrows.

The drought example follows possible water and soil pressures toward crop/livelihood losses and food access pressures. It also asks about resource tensions without treating scarcity or climate stress as inevitable causes of violence. Governance, power, historical relationships, markets, cooperation and local resilience matter. “Agricultural collapse” is a severe possible outcome to investigate, not a predicted result.

Proposed responses include soil-water work, natural regeneration, watershed care, wetland restoration, community seed banks and farmer–herder cooperation. Responses can also introduce costs or harms: watershed changes can disadvantage other users; seed allocation can exclude growers or reduce valued diversity. Discussion questions explicitly invite alternative explanations, local observations and adverse outcomes.

Related readings provide context, methods or findings from their own settings. A source link does not verify an individual arrow, prove a local causal effect, establish suitability or authorize intervention. Review source limitations, bridge safeguards, consent, land/hazard prerequisites and community knowledge before action.

## Local plans and ownership

Exploring, searching, tracing and downloading the built-in map do not change plans, evidence maturity, impact metrics or private community maps. **Choose this bridge in the local planner** explicitly selects that bridge through the existing planner action. **Open local System relationships** opens the existing editor, where users can develop their own map with evidence, uncertainty, history and sharing permission. Nothing is automatically copied over or overwritten.

This release introduces no new private plan fields and requires no plan-data migration. Old plans, backups and locally authored systems graphs retain their existing behavior. Explorer view choices are temporary and reset after a page reload; they are not synchronized or added to private backups.

## Diagram sharing and offline operation

**Download this diagram (SVG)** exports the currently displayed built-in view, including labels, arrowheads, legend and an explicit illustrative-status warning. The file uses embedded graphical attributes and has no scripts or required external images/fonts. Its metadata contains the displayed nodes, relationships and related-reading titles, URLs and limitations; it contains no local plan or community records. The SVG is a static diagram, not an editable local-systems import file.

The explorer modules and content are included in the offline service-worker cache and standalone HTML edition. No remote graph library, telemetry, live map tile or network request is required to explore it. Reading the publication summaries in the bundled library works offline; opening publishers’ original documents still requires connectivity unless users have saved them separately.

## Content basis and limits

These are application-authored discussion pathways, not extracted or verified causal graphs. The existing registry supplies source titles, grades and limitations. Sources consulted during this upgrade include [UNESCO’s transboundary cooperation overview](https://www.unesco.org/reports/wwdr/en/2024/transboundary-cooperation), [UN Decade restoration principles](https://www.decadeonrestoration.org/publications/principles-ecosystem-restoration-guide-united-nations-decade-2021-2030), and [FAO’s community seed-bank facilitator guide](https://www.fao.org/fileadmin/user_upload/fao_ilo/pdf/Other_docs/FAO/Community_Seed_Banks.pdf). Other related readings retain their existing registry check dates; no claim is made that all external links were reverified in this release. These organizations do not endorse this application or these specific pathways.

Software checks cover graph integrity, story connectivity, neighborhood and directed traversal, trade-offs, references, keyboard navigation, privacy/non-mutation, source/bridge navigation, valid SVG download, offline use, mobile RTL and standalone operation. Visual review checked card legibility and routed long return arrows around intervening cards to avoid implying false connections. See VERIFICATION.md for release results.
