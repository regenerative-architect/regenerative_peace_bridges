# Scenario & Causal Reasoning Engine

All outputs are **SIMULATIONS — not forecasts or verified causal effects**. The module explores what follows from declared assumptions; it does not infer those assumptions from observational evidence. Nothing is promoted to measured impact, verified dependencies, or evidence maturity.

## Use
Open the scenario panel above the planner tabs. Each plan has one model, five parameters, up to 20 outcomes, and up to 10 named scenarios. Use outcome titles to identify bridges or portfolio activities; there is no automatic propagation along portfolio or Evidence Web edges. Earlier plans receive an unconfigured model, not simulated claims.

Specify context, one common planning period, and parameter units, baseline, minimum, maximum and rationale. Parameters are rainfall, population, funding, security and institutional capacity. Rainfall/population/funding have nonnegative ranges in locally chosen units. Security and capacity use locally defined indices bounded by 0–100; document their anchors and construction. No index is claimed to be objective. Explain sources, omitted variables, uncertainty and feasibility. All baseline and scenario values must lie within the declared ranges.

For each outcome specify its unit, baseline, five signed response coefficients, and the rationale for the signs/magnitudes. Explicit zero means the model assumes no response to that driver. Negative signs are permitted. Enter named scenarios and compare them with the common baseline. Save each editor separately; results and exports use saved data only. Changing a parameter range changes normalization: review the coefficients afterward. Range edits that would invalidate saved cases are rejected. Delete or edit those cases first.

## Deterministic method
`Y = Y0 + Σ wi × (xi − bi) / (maxi − mini)`

`wi` is the assumed output-unit change over the full span of parameter i; it is not an elasticity or a regression coefficient. No executable expressions or external code are accepted. Contributions sum to the change from the outcome baseline. Every output uses the same chosen horizon; no time evolution is modeled.

Sensitivity varies each parameter over its declared range while all others stay at baseline. Ranking by absolute swing reflects both chosen ranges and assumed coefficients, not causal importance. Full-box extrema sum the minimum and maximum contributions. They are exact extrema for this linear model, not confidence intervals, percentiles or probability bounds. Simultaneous extremes may be infeasible where inputs are correlated. There are no distributions, Monte Carlo sampling, interactions, thresholds, saturation, lags or feedback. Negative simulated outputs remain visible with a warning rather than being silently clipped. This simple model may be unsuitable for some outcomes; revise the assumptions rather than interpreting numerical precision as validity.

The example is a deliberately invented food-production exercise, not evidence. Its coefficients are +40 rainfall, −20 population, +30 funding, +20 security and +20 capacity illustrative tonnes per full span, from a baseline of 100. The lower-rainfall/lower-funding case produces 82.5 illustrative tonnes under those assumptions. The example loads only into an unconfigured model and never overwrites established work.

## Causal reasoning discipline
Record the proposed mechanism, supporting and contradicting evidence, rival explanations, confounders, contextual limits and plausible sign reversals in the assumption fields. Editing a coefficient is a hypothetical intervention in this calculation, not identification of an intervention's real-world causal effect. Input correlations and selection bias cannot be resolved by this engine. Probabilistic extensions are deliberately absent; they would require defensible distributional data, dependence assumptions, calibration and separate validation before being introduced.

## Persistence and sharing
The existing local plan store, storage fallbacks, saved versions, private plan JSON imports/exports and full-device backups retain the model. Forks copy assumptions and scenarios as design fields and include them in comparisons; local review is required before reuse. Models stay out of public briefs. Search Everything indexes the active model's saved text. Explicit simulation JSON exports include the full model, coefficients, inputs, method, simulation label and computed results through the existing safety gate. They are reports, not import files: restore from plan backups.

English-marked controls use labels, keyboard navigation and live save/error status. Text results and ranked sensitivity lists remain accessible without a graphical chart. Both service-worker offline mode and the standalone HTML include the model. No server or network dependency is introduced.

Run `node tests/scenario-test.mjs` and `node tests/browser-test.mjs --only Scenario` (Playwright required). Model checks include hand-calculated outputs, signed/zero coefficients, all 32 corners, sensitivity, finite numbers, bounds, missing assumptions, schema/ID validation and round trips.
