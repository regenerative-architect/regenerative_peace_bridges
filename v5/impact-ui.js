/* Accessible local impact editor. UI dependencies are supplied by app.js. */
window.RPB_IMPACT_UI = function (api) {
  "use strict";
  const { h, s, getPlan, changed, download, csvOf, safetyGate, confirmDialog, lifecycle, schedule } = api;
  const I = window.RPB_IMPACT;
  let selected = "trees", domain = "", mount;
  const now = () => new Date().toISOString();
  const today = () => now().slice(0, 10);
  const num = I.formatted;
  const inputNumber = el => el.value.trim() === "" ? null : Number(el.value);
  const field = (id, label, control, hint = "") => h("div", { class: "field" }, h("label", { for: id }, label), control, hint ? h("p", { class: "field__hint", id: id + "-help" }, hint) : null);
  const input = (id, type = "text", value = "", attrs = {}) => {
    const el = h("input", { id, type, ...attrs }); el.value = value ?? ""; return el;
  };
  const area = (id, value = "", max = 1000) => { const el = h("textarea", { id, rows: 3, maxlength: max, dir: "auto" }); el.value = value; return el; };
  const select = (id, pairs, value) => { const el = h("select", { id }, pairs.map(([v, label]) => h("option", { value: v }, label))); el.value = value; return el; };
  const button = (id, label, fn) => h("button", { id, type: "button", class: "btn btn--quiet", onclick: fn }, label);
  function chart(m, record) {
    const q = I.summary(record), last = q.points.at(-1);
    if (!last) return null;
    const points = q.points.filter(o => o.scope === last.scope && o.method === last.method);
    if (points.length < 2) return h("p", { class: "note" }, "A trend needs at least two observations using the same scope and method.");
    const start = Date.parse(points[0].date), end = Date.parse(points.at(-1).date);
    const low = Math.min(...points.map(o => o.value)), high = Math.max(...points.map(o => o.value));
    const x = o => 65 + 455 * (end === start ? 0.5 : (Date.parse(o.date) - start) / (end - start));
    const y = o => 145 - 110 * (high === low ? 0.5 : (o.value - low) / (high - low));
    return h("figure", { class: "impact-chart" },
      s("svg", { viewBox: "0 0 570 190", role: "img", "aria-labelledby": "impactChartTitle impactChartDesc" },
        s("title", { id: "impactChartTitle" }, m.name + " over time"),
        s("desc", { id: "impactChartDesc" }, "Latest method and scope only. " + points.map(o => o.date + ": " + num(o.value) + " " + m.unit).join("; ") + ". Exact values and sources are in the observation history."),
        s("path", { d: "M65 25V150H530", fill: "none", stroke: "currentColor" }),
        s("text", { x: 60, y: 35, "text-anchor": "end" }, num(high)),
        s("text", { x: 60, y: 145, "text-anchor": "end" }, num(low)),
        s("text", { x: 65, y: 175 }, points[0].date), s("text", { x: 520, y: 175, "text-anchor": "end" }, points.at(-1).date),
        s("polyline", { points: points.map(o => x(o) + "," + y(o)).join(" "), fill: "none", stroke: "currentColor", "stroke-width": 2 }),
        points.map(o => s("circle", { cx: x(o), cy: y(o), r: 4, fill: "currentColor" }))),
      h("figcaption", null, "Observed " + m.unit + "; latest scope and method only. Lines connect observations, not estimates for unmeasured dates. Read the source and confidence alongside the trend."));
  }
  function render(target, message = "") {
    mount = target;
    const plan = getPlan(), bridgeId = plan.bridge, b = I.bridge(plan.impact, bridgeId);
    mount.replaceChildren(h("h3", null, "Impact Metrics Layer"));
    if (!bridgeId) { mount.append(h("p", null, "Choose a bridge in Readiness to start tracking its impact.")); return; }
    const bridgeName = window.RPB.bridges.find(x => x.id === bridgeId)?.short || "Another idea";
    const metric = I.byId.get(selected), r = b.metrics[selected] || I.emptyMetric();
    const status = h("p", { id: "impactStatus", role: "status", "aria-live": "polite" }, message);
    const run = fn => { try { fn(); } catch (e) { status.textContent = e.message; } };
    const commit = (data, message) => { plan.impact = data; changed(); render(mount, message); };
    const reviewedCount = Object.values(b.metrics).filter(r => I.summary(r).latest).length;
    mount.append(h("p", { class: "impact-context" }, (plan.project || "Untitled plan") + " · " + bridgeName),
      h("p", null, "Track observed change, test assumptions and decide what to adapt together. These are local observations, not proof that the bridge caused a change. No combined impact score is calculated."),
      h("p", { class: "note" }, "Save the measurement plan or record an observation before switching indicators, bridges or plans. Keep aggregates only; avoid private names and precise locations. Counts across reporting periods are not summed automatically."), status,
      h("p", { class: "impact-coverage" }, reviewedCount + " of " + I.metrics.length + " indicators have follow-up observations. Missing values are not zero."));
    const domainSelect = select("impactDomain", [["", "All domains"], ...I.domains.map(x => [x,x])], domain);
    domainSelect.addEventListener("change", () => { domain = domainSelect.value; if (domain && metric.domain !== domain) selected = I.metrics.find(m => m.domain === domain).id; render(mount); document.getElementById("impactDomain").focus(); });
    mount.append(field("impactDomain", "Impact domain", domainSelect));
    const filtered = I.metrics.filter(m => !domain || m.domain === domain);
    const indicator = select("impactMetric", filtered.map(m => [m.id, m.domain + " — " + m.name]), selected);
    indicator.addEventListener("change", () => { selected = indicator.value; render(mount); document.getElementById("impactMetric").focus(); });
    mount.append(field("impactMetric", "Indicator to record", indicator));
    const table = h("table", { class: "impact-table" }, h("caption", null, "Impact dashboard for this bridge and plan"),
      h("thead", null, h("tr", null, ["Indicator / unit", "Baseline", "Latest follow-up", "Target", "Change", "Review"].map(x => h("th", { scope: "col" }, x)))),
      h("tbody", null, filtered.map(m => {
        const record = b.metrics[m.id] || I.emptyMetric(), q = I.summary(record);
        const observed = o => o ? num(o.value) + " · " + o.date : "Not recorded";
        return h("tr", null, h("th", { scope: "row" }, m.name + " (" + m.unit + ")"), h("td", null, observed(q.baseline)), h("td", null, observed(q.latest)),
          h("td", null, record.target === null ? "Not agreed" : num(record.target) + " by " + record.targetDate),
          h("td", null, q.change === null ? (q.baseline && q.latest ? "Method/scope changed" : "Not yet comparable") : (q.change > 0 ? "+" : "") + num(q.change) + (m.kind === "rate" ? " pp" : " " + m.unit)),
          h("td", null, record.nextReview ? (record.nextReview < today() ? "Overdue: " : "Due: ") + record.nextReview : "Not scheduled"));
      })));
    mount.append(h("div", { class: "impact-scroll", tabindex: "0", role: "region", "aria-label": "Impact dashboard table, scroll horizontally if needed" }, table));
    mount.append(h("h4", null, metric.name), h("p", { id: "impactDefinition" }, metric.definition));
    const scope = area("impactScope", r.scope), method = area("impactMethod", r.method), owner = input("impactOwner", "text", r.owner, { maxlength: 120, dir: "auto" });
    const cadence = select("impactCadence", ["weekly", "monthly", "quarterly", "seasonal", "annual", "as-agreed"].map(x => [x, x]), r.cadence);
    const nextReview = input("impactNextReview", "date", r.nextReview), targetValue = input("impactTarget", "number", r.target, { min: 0, max: metric.kind === "rate" ? 100 : 1e9, step: metric.kind === "count" ? 1 : "any" }), targetDate = input("impactTargetDate", "date", r.targetDate);
    const settings = () => ({ ...r, scope: scope.value, method: method.value, owner: owner.value, cadence: cadence.value, nextReview: nextReview.value, target: inputNumber(targetValue), targetDate: targetDate.value });
    mount.append(h("fieldset", { class: "impact-editor" }, h("legend", null, "Measurement plan"), h("div", { class: "grid-2" },
      field("impactScope", "Scope and reporting period", scope, "Required for observations: define the cohort/group, broad area, season and period. Keep this consistent for comparisons."),
      field("impactMethod", "Method and sampling protocol", method, "Required for observations: define the question or instrument, sampling and what qualifies. Changing scope or method disables baseline comparison."),
      field("impactOwner", "Responsible role or organisation", owner), field("impactCadence", "Review frequency", cadence),
      field("impactNextReview", "Next measurement review", nextReview), field("impactTarget", "Agreed target (" + metric.unit + ")", targetValue), field("impactTargetDate", "Target due date", targetDate)),
      button("impactSaveSettings", "Save measurement plan", () => run(() => { commit(I.saveMetric(plan.impact, bridgeId, selected, settings()), "Measurement plan saved."); document.getElementById("impactSaveSettings").focus(); }))));
    const current = I.active(r), q = I.summary(r);
    const kind = select("impactKind", [["baseline", "Baseline"], ["followup", "Follow-up"]], q.baseline ? "followup" : "baseline");
    const observationDate = input("impactDate", "date", today(), { max: today() });
    const value = input("impactValue", "number", "", { min: 0, max: 1e9, step: metric.kind === "count" ? 1 : "any", "aria-describedby": "impactDefinition" });
    const numerator = input("impactNumerator", "number", "", { min: 0, max: 1e9, step: 1 }), denominator = input("impactDenominator", "number", "", { min: 1, max: 1e9, step: 1 });
    const source = area("impactSource", "", 500), note = area("impactNote"), confidence = select("impactConfidence", [["low", "Low — limited or uncertain observations"], ["medium", "Medium — consistent method, some limitations"], ["high", "High — checked method and source"]], "low");
    const correction = select("impactCorrection", [["", "New observation"], ...current.map(o => [o.id, "Correct " + o.kind + " · " + o.date + " · " + num(o.value)])], "");
    correction.addEventListener("change", () => { const old = current.find(o => o.id === correction.value); if (old) { kind.value = old.kind; observationDate.value = old.date; value.value = old.value; numerator.value = old.numerator ?? ""; denominator.value = old.denominator ?? ""; source.value = old.source; confidence.value = old.confidence; scope.value = old.scope; method.value = old.method; } });
    mount.append(h("fieldset", { class: "impact-editor" }, h("legend", null, "Record an observation"), h("div", { class: "grid-2" },
      field("impactKind", "Observation type", kind), field("impactDate", "Measurement date", observationDate), field("impactCorrection", "New observation or correction", correction),
      metric.kind === "rate" ? [field("impactNumerator", metric.numerator, numerator), field("impactDenominator", metric.denominator, denominator)] : field("impactValue", "Observed value (" + metric.unit + ")", value),
      field("impactConfidence", "Self-assessed confidence", confidence), field("impactSource", "Source or evidence reference (required)", source),
      field("impactNote", "Context, limitations or correction reason", note)),
      h("p", { class: "note" }, "Recording saves the measurement plan too. Corrections retain the original observation and require an explanation. Zero is valid; an empty value is not. Confidence is not independently verified."),
      button("impactRecord", "Record observation", () => run(() => {
        const data = I.observe(plan.impact, bridgeId, selected, settings(), { id: "i-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,10), kind: kind.value, date: observationDate.value, at: now(), value: inputNumber(value), numerator: inputNumber(numerator), denominator: inputNumber(denominator), source: source.value, note: note.value, confidence: confidence.value, replaces: correction.value });
        commit(data, "Observation recorded. Review the updated dashboard and history."); document.getElementById("impactRecord").focus();
      }))));
    if (q.progress !== null) mount.append(h("p", null, "Progress from baseline toward the agreed target: " + num(q.progress) + "%. This is not an impact score. Values can be negative or exceed 100%."));
    if (q.targetMet !== null) mount.append(h("p", null, q.targetMet ? "Latest comparable observation meets the agreed numeric target; review context and confidence." : "Latest comparable observation has not yet met the agreed numeric target."));
    const plot = chart(metric, r); if (plot) mount.append(plot);
    mount.append(h("h4", null, "Observation history"));
    if (!r.observations.length) mount.append(h("p", null, "No observations recorded for this indicator."));
    const activeIds = new Set(current.map(o => o.id));
    mount.append(h("ol", { class: "impact-history" }, [...r.observations].reverse().map(o => h("li", null,
      h("strong", null, o.date + " · " + o.kind + " · " + num(o.value) + " " + metric.unit + (activeIds.has(o.id) ? "" : " · Replaced by correction")),
      h("p", null, (metric.kind === "rate" ? o.numerator + " / " + o.denominator + ". " : "") + "Confidence: " + o.confidence + ". Recorded: " + o.at),
      h("p", { dir: "auto" }, "Source: " + o.source), h("p", { dir: "auto" }, o.note),
      h("details", null, h("summary", null, "Scope and method at measurement"), h("p", { dir: "auto" }, o.scope), h("p", { dir: "auto" }, o.method))))));
    const reviewDate = input("impactLearningDate", "date", today(), { max: today() }), finding = area("impactFinding"), action = area("impactAction"), next = input("impactLearningNext", "date");
    mount.append(h("fieldset", { class: "impact-editor" }, h("legend", null, "Learning review across this bridge's indicators"),
      field("impactLearningDate", "Review date", reviewDate), field("impactFinding", "What changed, for whom, and what remains uncertain?", finding),
      field("impactAction", "What will the community keep, adapt, stop or test next?", action), field("impactLearningNext", "Review this learning again on", next),
      button("impactSaveLearning", "Save learning review", () => run(() => { commit(I.review(plan.impact, bridgeId, { date: reviewDate.value, at: now(), finding: finding.value, action: action.value, nextReview: next.value }), "Learning review saved."); document.getElementById("impactSaveLearning").focus(); }))));
    mount.append(h("ol", { class: "impact-history" }, [...b.reviews].reverse().map(r => h("li", null, h("strong", null, r.date), h("p", { dir: "auto" }, r.finding), h("p", { dir: "auto" }, "Next action: " + r.action), r.nextReview ? h("p", null, "Review again: " + r.nextReview + (r.nextReview < today() ? " (overdue)" : "")) : null))));
    mount.append(h("div", { class: "impact-actions" },
      button("impactLifecycle", "Use impact summary in a lifecycle review", () => lifecycle(I.lines(plan.impact, bridgeId).join("\n") || "No impact observations recorded yet. Review evidence before changing maturity.")),
      button("impactSchedule", "Add a learning review to the timeline", () => schedule("Impact learning review: " + bridgeName)),
      button("impactCsv", "Export impact observations CSV", () => safetyGate(plan, () => {
        const rows = [];
        for (const [id, data] of Object.entries(b.metrics)) {
          const m = I.byId.get(id), ids = new Set(I.active(data).map(o => o.id));
          for (const o of data.observations) rows.push([bridgeId, m.domain, id, m.name, m.unit, o.id, o.kind, o.date, o.value, o.numerator, o.denominator, o.confidence, o.source, o.note, o.scope, o.method, o.at, o.replaces, ids.has(o.id) ? "current" : "replaced", data.target, data.targetDate]);
        }
        download("bridge-impact-observations-" + today() + ".csv", csvOf(["Bridge", "Domain", "Metric ID", "Indicator", "Unit", "Observation ID", "Type", "Date", "Value", "Numerator", "Denominator", "Confidence", "Source", "Notes", "Scope", "Method", "Recorded at", "Replaces", "Status", "Current target", "Target date"], rows), "text/csv");
      })),
      button("impactSummaryCsv", "Export impact summary CSV", () => safetyGate(plan, () => download("bridge-impact-summary-" + today() + ".csv", csvOf(["Bridge", "Domain", "Indicator", "Unit", "Baseline", "Baseline date", "Latest follow-up", "Follow-up date", "Target", "Target date", "Comparable change", "Review due", "Scope", "Method", "Responsible role"], I.metrics.map(m => { const r = b.metrics[m.id] || I.emptyMetric(), q = I.summary(r); return [bridgeId, m.domain, m.name, m.unit, q.baseline?.value ?? "", q.baseline?.date ?? "", q.latest?.value ?? "", q.latest?.date ?? "", r.target ?? "", r.targetDate, q.change ?? "", r.nextReview, r.scope, r.method, r.owner]; })), "text/csv"))),
      button("impactLearningCsv", "Export learning reviews CSV", () => safetyGate(plan, () => download("bridge-impact-learning-" + today() + ".csv", csvOf(["Bridge", "Date", "Recorded at", "Finding", "Next action", "Next review"], b.reviews.map(r => [bridgeId, r.date, r.at, r.finding, r.action, r.nextReview])), "text/csv"))),
      button("impactClear", "Clear this bridge's impact data", async () => {
        if (!await confirmDialog({ title: "Clear impact data for this bridge?", text: "This removes measurement plans, observations and learning reviews from the active plan. Export a backup first. Other bridges and lifecycle histories stay unchanged. Saved plan versions can still contain this data.", ok: "Clear impact data", danger: true })) return;
        const data = I.clean(plan.impact); delete data.bridges[bridgeId]; commit(data, "This bridge's impact data was cleared.");
      })));
  }
  return { render, selectMetric: (id, target) => { if (I.byId.has(id)) { selected = id; domain = ""; render(target); } } };
};
