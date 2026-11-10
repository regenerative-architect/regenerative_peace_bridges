# Regenerative Peace Bridges — v1

An evidence-oriented, child-centered, country-neutral offline-first website. Built by Foster + Navi / Planetary Restoration Archive.

## Run
- Open `index.html` directly for reading, search, drafts and JSON backup. On `file://`, service workers are unavailable.
- For installable offline PWA behavior, host over HTTPS, or run `python3 -m http.server 8000` from this folder and open `http://localhost:8000`.
- Load once online to precache the local application shell. External source pages and PDFs are **not** cached or mirrored.
- No accounts, analytics, third-party scripts or network calls are made by the app itself; clicking external sources opens their websites.

## Architecture
- `index.html`: accessible UI, guidance, responsive styles, no-JS reading content.
- `data.js`: editable evidence registry and proposed bridges.
- `app.js`: DOM rendering, filtering, theme, local draft storage and import/export.
- `sw.js`: same-origin cache-first shell for offline use.
- `manifest.webmanifest`: PWA metadata.

## Language and country neutrality
- Data records use stable IDs rather than country-specific routing or flag assumptions.
- English is the only complete interface translation in v1. Source links may provide other languages; this bundle does not claim universal translation.
- Add translated strings and `lang`/`dir` switching before claiming multilingual coverage. Do not auto-translate legal or safety guidance without review.

## Evidence caveats
- Evidence grades are preliminary editorial labels, **not** independent systematic quality appraisal.
- All bridges are proposals and require ecological transferability, safeguarding, conflict sensitivity, land rights, community consultation and verification.
- Publication dates are not dates of observed impacts. Verify live sources before operational decisions.

## Test checklist (manual; not claimed complete)
- Open via file://; filter documents; inspect links; save/export/import/reset draft.
- Host via HTTPS or localhost; load once; disconnect; reload and verify cached shell.
- Verify screen-reader labels, keyboard focus, reduced motion, mobile layout, and CSP in deployed environment.
- Verify third-party source URLs and publication metadata periodically.

## Licenses
- Original app code and editorial summaries: released under MIT (see LICENSE).
- Linked research and institutional publications retain their respective licenses and copyrights. No source PDFs redistributed.
