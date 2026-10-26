# Impact Metrics Layer — version 3.2.0

The Impact tab turns a bridge plan into a record of observations, learning and adaptation. It works on the device, offline, without accounts or external services. No measurements or targets are prefilled, and a missing observation never becomes zero.

## A practical learning cycle

1. Choose a bridge in **Readiness**, then open **Impact** (or use **Track impact** on a bridge card).
2. Choose a domain and indicator. Agree the scope, reporting period and repeatable measurement method with community representatives. Record the responsible role, review frequency and next review date. An optional target needs both a value and a due date.
3. Record a dated **Baseline**, its source/reference, confidence and limitations. For percentage indicators, enter the numerator and denominator; the percentage is calculated.
4. Repeat as **Follow-up** observations. Review baseline-to-latest change, the dated trend and progress toward the target. Keep scope, method, season and sampling comparable.
5. Use **Learning review** to discuss what changed, for whom, what remains uncertain and what to keep, adapt, stop or test next. Set a date to review the learning again.
6. **Use impact summary in a lifecycle review** drafts a rationale in the Bridge Evolution System. Review it and choose maturity levels yourself. Nothing automatically promotes a bridge. **Add a learning review to the timeline** creates a planned milestone; set its date in Timeline.

**Save measurement plan** and **Record observation** are explicit save actions. Unsaved form entries are drafts and are discarded when switching indicators, bridges, plans or languages. After saving, the existing planner autosave and storage-status feedback apply. Settings can be saved before any measurements exist.

## The fourteen indicators

These are transparent, editable-in-source operational definitions for local monitoring, not externally certified evaluation standards. Each indicator has its full definition in the app.

| Domain | Indicator | Unit / calculation |
|---|---|---|
| Ecological | Trees surviving | Whole living-tree count in a defined cohort |
| Ecological | Soil cover | Covered sample points / assessed sample points × 100 |
| Ecological | Water retention | Retained water depth in mm under a defined, repeated protocol |
| Ecological | Biodiversity observations | Distinct observed taxa under a fixed survey effort |
| Community | Participation rate | Unique participants / agreed eligible population × 100 |
| Community | Women leadership % | Leadership positions held by women / assessed positions × 100 |
| Community | Youth leadership % | Leadership positions held by youth / assessed positions × 100 |
| Community | Community trust indicators | Positive responses to a fixed, locally reviewed question / valid responses × 100 |
| Peace | Disputes resolved | Disputes considered resolved by the parties in a defined period |
| Peace | Shared projects created | Distinct qualifying shared projects created in a defined period |
| Peace | Connector institutions strengthened | Institutions meeting agreed cooperation-strengthening criteria |
| Wellbeing | Food security | Households reporting sufficient food under a fixed question and recall period / valid responding households × 100 |
| Wellbeing | School attendance | Attended learner-days / expected learner-days while school was open × 100 |
| Wellbeing | Service access | Households accessing a specified service / eligible households assessed × 100 |

Trust and food-security measures are local proxies. They are not universal scores, clinical assessments or standardized classifications. Youth and women can overlap. More disputes resolved does not, by itself, mean fewer disputes. Biodiversity observations depend on survey effort and season. Water retention must not be confused with infiltration rate. The app explains these limits alongside each indicator.

## Interpreting the dashboard

- Dashboard rows show baseline and latest follow-up **with dates**, the target and due date, absolute change and the next measurement review. Past review dates are marked overdue.
- Rate changes are **percentage points**, not relative percent change. Moving from 20% to 30% is +10 pp.
- Progress toward a target is `(latest − baseline) / (target − baseline) × 100`. It can be negative or above 100%. A target equal to the baseline has no progress percentage; the numeric target check still works. Lower targets are supported.
- Baseline comparison requires the baseline and latest follow-up to have identical saved scope and method. If either changes, the app withholds the comparison. Matching text is only a minimum check: facilitators must still judge seasonality, sampling and real comparability.
- The chart uses dated observations with the latest observation's scope and method. Its accessible description and history contain the exact values. Lines join observations; they do not fill missing dates. The vertical scale follows the observed range.
- Confidence is the recorder's own low/medium/high assessment, not a calculated statistical confidence interval. The history preserves confidence, sources and limitations.
- Counts and rates are not summed across indicators, periods, bridges or plans. There is no overall impact score or automatic causal claim. Numeric target attainment does not override consent, readiness, risk or community decisions.

## Corrections and review history

Choose an existing current observation under **New observation or correction**, edit it, and explain the correction. The new record points to the original, which remains visible as replaced. Calculations use only current records. A correction must be the same observation type. Correct a baseline rather than adding another one. Follow-ups cannot precede the baseline; duplicate observations of the same type on the same date must be corrected rather than added.

The source, scope and method are saved with each observation. Later changes to the measurement plan do not rewrite those snapshots. Numeric targets and review settings represent the current agreement; they are not versioned individually. The planner's saved versions preserve earlier plan-wide settings. Learning reviews are dated additions; use a subsequent review to explain a revised conclusion.

## Persistence, exports and privacy

- Every bridge has separate impact records within each plan, including **Another idea**. Switching bridges retains previous records; new plans start empty. Duplicating a plan copies impact data. Restoring a saved version restores its impact data too.
- Existing JSON plan backups and whole-workspace backups carry all impact data. Imports preserve impact and learning data, and invalid impact records reject the import. Legacy plans without `impact` migrate to an empty layer.
- **Observations CSV** contains current and replaced observations, raw numerator/denominator, computed value, sources, limitations, scope/method snapshots, recording timestamp and correction links. Target columns represent the current target, not a historical target.
- **Summary CSV** includes all fourteen indicators, including empty rows, baseline/latest dates, target, comparable change, review date and measurement settings. **Learning reviews CSV** contains findings, actions and review dates.
- The selected bridge's impact summary and learning reviews appear in Markdown/printed plan briefs, bridge text copies, bridge filtering and global search. Bridge cards show the number of indicators with follow-ups and the latest measurement date. Full measurement records remain in the Impact tab and exports.
- All impact free text, including superseded records, passes through the existing safety scan before exporting or copying. CSV formula protection applies. The scanner is a reminder, not a guarantee of anonymity; use aggregate data and avoid private names or precise locations.
- The app's device storage fallbacks, deletion/expiry, backup and newest-plan-wins multi-tab behavior remain in force. **Clear this bridge's impact data** requires confirmation and affects only that bridge's current plan data. Saved versions and copies can retain older data; use the existing plan/device deletion controls if those must also be removed.
- Use version **3.2.0 or newer** to import impact backups. Older versions do not recognize these fields and may discard them.

## Schema and limits

The outer workspace/plan schema stays at 3. The additive field is:

```json
{
  "impact": {
    "schema": 1,
    "bridges": {
      "bridge-id": {
        "metrics": {
          "soil": {
            "scope": "Same sample plots, monthly",
            "method": "Fixed transect of ten points",
            "owner": "Community monitoring group",
            "cadence": "monthly",
            "nextReview": "2026-11-22",
            "target": 80,
            "targetDate": "2027-01-01",
            "observations": []
          }
        },
        "reviews": []
      }
    }
  }
}
```

Observations store `id`, `kind` (`baseline` or `followup`), measurement `date`, recording `at`, numeric `value`, rate `numerator`/`denominator` (otherwise null), `confidence`, `source`, `note`, saved `scope`/`method`, and `replaces` (empty for new observations). Learning reviews store `date`, `at`, `finding`, `action` and `nextReview`.

Validation checks known IDs/schema, finite non-negative numbers, whole-number counts, rates bounded 0–100, positive denominators, valid real dates, no future measurements, unique IDs, correction references, baseline chronology, source/method/scope requirements and text limits. Imported percentages are recomputed from raw counts. Zero is accepted; empty numeric entries are refused.

Limits: 150 observations per indicator, 500 observations per plan, 50 learning reviews per bridge. Scope, method, observation notes and review findings/actions allow 1,000 characters each; sources allow 500; responsible roles allow 120. Numeric counts are bounded at one billion. No records are silently truncated at these limits. Export data and start a new plan when a limit is reached. JSON backup uploads retain the existing 64 MB limit; very large whole-workspace backups may need individual plan exports. Browser storage quotas may be smaller, so keep external backups and watch save-status messages.

## Accessibility, offline use and maintenance

Native labeled controls, fieldsets, keyboard tabs, live feedback, table headers/captions, text-backed charts and right-to-left layout support are included. New Impact text is English and is marked `lang="en"` inside other language interfaces; it is not yet in the translation-pack catalogue. Without JavaScript, the planner still shows the indicator definitions for use on paper.

`impact.js` holds indicator definitions, schema validation and pure calculations. `impact-ui.js` contains the editor; `app.js` supplies the existing planner/storage/export helpers. Both scripts are cached by the service worker and embedded in the single-file sharing build. No framework, server, package or remote dependency was added.

After edits, rebuild the no-script page and single-file edition, then run:

```sh
node tools/prerender.mjs
node tools/i18n-extract.mjs
node tools/build-single.mjs
node tests/check-data.mjs
node tests/evolution-test.mjs
node tests/impact-test.mjs
node tests/browser-test.mjs
```
