/* Impact Metrics Layer: local indicator definitions, validation and calculations.
   Plain script, no network or dependencies; also loaded by the Node test suite.
   Values are community-recorded observations, never causal impact estimates. */
(() => {
  "use strict";
  const metrics = [
    { id: "trees", domain: "Ecological", name: "Trees surviving", unit: "trees", kind: "count", definition: "Count living trees in the same defined planting or regeneration cohort and area. State cohort, assessment age and counting method; do not mix new planting into the original cohort." },
    { id: "soil", domain: "Ecological", name: "Soil cover", unit: "%", kind: "rate", numerator: "Covered sample points", denominator: "All assessed sample points", definition: "Record points with the locally agreed protective cover (vegetation, litter or mulch) out of all sampled points. Repeat the same transect, season and cover definition." },
    { id: "water", domain: "Ecological", name: "Water retention", unit: "mm", kind: "number", definition: "Record retained water depth in millimetres using one consistent field protocol. Define soil depth, area, interval after wetting, rainfall and instrument. Do not substitute infiltration rate or compare incompatible methods." },
    { id: "biodiversity", domain: "Ecological", name: "Biodiversity observations", unit: "distinct taxa", kind: "count", definition: "Count distinct species or consistently identified taxonomic groups observed in a fixed survey area and effort. Record season, duration and identification limits. This is observed richness, not a complete biodiversity index." },
    { id: "participation", domain: "Community", name: "Participation rate", unit: "%", kind: "rate", numerator: "Unique people participating", denominator: "Eligible people in the agreed group", definition: "Count unique consenting participants against the agreed eligible group for the same period. Define participation and eligibility; repeat attendees count once. Keep only aggregate totals." },
    { id: "women", domain: "Community", name: "Women leadership %", unit: "%", kind: "rate", numerator: "Leadership positions held by women", denominator: "All assessed leadership positions", definition: "Use community-agreed meaningful decision-making positions. Count positions consistently and report vacancies and representation limits in notes. Representation alone does not demonstrate influence." },
    { id: "youth", domain: "Community", name: "Youth leadership %", unit: "%", kind: "rate", numerator: "Leadership positions held by youth", denominator: "All assessed leadership positions", definition: "Define the local youth age range and meaningful leadership roles. Count the same positions over time. Youth and women can overlap; these percentages must not be added together." },
    { id: "trust", domain: "Community", name: "Community trust indicators", unit: "%", kind: "rate", numerator: "Positive responses to the agreed trust question", denominator: "Valid voluntary responses", definition: "Choose one locally reviewed, anonymous trust question and a fixed positive-response rule. Record wording, response scale, sampling and non-response. This is a local proxy, not a validated universal trust score." },
    { id: "disputes", domain: "Peace", name: "Disputes resolved", unit: "disputes", kind: "count", definition: "Count disputes considered resolved by the parties through a voluntary process in a defined reporting period. State the follow-up rule and recurrence. More resolutions may reflect more disputes; do not interpret the count alone as more peace." },
    { id: "projects", domain: "Peace", name: "Shared projects created", unit: "projects", kind: "count", definition: "Count distinct projects jointly initiated by the locally defined groups during the reporting period. Define what qualifies as shared and created; do not double-count a project across groups." },
    { id: "institutions", domain: "Peace", name: "Connector institutions strengthened", unit: "institutions", kind: "count", definition: "Count institutions meeting locally agreed evidence criteria for stronger cooperation, such as joint decisions, inclusive access and accountable shared resources. Record the criteria and review process; attendance alone is insufficient." },
    { id: "food", domain: "Wellbeing", name: "Food security", unit: "%", kind: "rate", numerator: "Households reporting sufficient food under the agreed question", denominator: "Households giving valid voluntary responses", definition: "Use a fixed locally reviewed food-sufficiency question and recall period, for example the previous seven days. Record wording and season. This local proxy is not a clinical assessment or a standardized food-security classification." },
    { id: "school", domain: "Wellbeing", name: "School attendance", unit: "%", kind: "rate", numerator: "Attended learner-days", denominator: "Expected learner-days while school was open", definition: "Use aggregate attendance for the same eligible learner group and reporting period. Document closures and exclusions. Do not store children's names or individual attendance records." },
    { id: "services", domain: "Wellbeing", name: "Service access", unit: "%", kind: "rate", numerator: "Households able to access the specified service", denominator: "Eligible households assessed", definition: "Choose one specified service, eligibility rule and recall period. Define accessible, affordable and usable with the community. Do not combine unrelated services or record facility locations." }
  ];
  const byId = new Map(metrics.map(m => [m.id, m]));
  const domains = ["Ecological", "Community", "Peace", "Wellbeing"];
  const empty = () => ({ schema: 1, bridges: {} });
  const emptyBridge = () => ({ metrics: {}, reviews: [] });
  const emptyMetric = () => ({ scope: "", method: "", owner: "", cadence: "monthly", nextReview: "", target: null, targetDate: "", observations: [] });
  const fail = text => { throw Error(text); };
  const text = (value, max = 1000) => {
    if (typeof value !== "string" || value.length > max) fail("Impact text is missing or exceeds its length limit.");
    return value.trim();
  };
  const date = value => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) fail("Use a valid calendar date.");
    return value;
  };
  const stamp = value => {
    if (typeof value !== "string" || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) fail("Invalid impact recording timestamp.");
    return value;
  };
  const number = (v, max = 1e9, integer = false) => {
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > max || (integer && !Number.isInteger(v))) fail("Enter a finite, non-negative number in the allowed range" + (integer ? " (whole numbers only)." : "."));
    return v;
  };
  const valueFor = (m, raw) => m.kind === "rate" ? (() => {
    const n = number(raw.numerator, 1e9, true), d = number(raw.denominator, 1e9, true);
    if (!d || n > d) fail("The denominator must be greater than zero and at least the numerator.");
    return 100 * n / d;
  })() : number(raw.value, 1e9, m.kind === "count");
  const active = record => {
    const replaced = new Set(record.observations.map(o => o.replaces).filter(Boolean));
    return record.observations.filter(o => !replaced.has(o.id)).sort((a, b) => a.date.localeCompare(b.date) || a.at.localeCompare(b.at));
  };
  function cleanMetric(id, raw) {
    const m = byId.get(id);
    if (!m || !raw || typeof raw !== "object" || !Array.isArray(raw.observations) || raw.observations.length > 150) fail("Invalid impact metric or too many observations.");
    const out = emptyMetric();
    for (const key of ["scope", "method", "owner"]) out[key] = text(raw[key], key === "owner" ? 120 : 1000);
    if (!["weekly", "monthly", "quarterly", "seasonal", "annual", "as-agreed"].includes(raw.cadence)) fail("Choose a valid review frequency.");
    out.cadence = raw.cadence;
    out.nextReview = raw.nextReview ? date(raw.nextReview) : "";
    out.target = raw.target === null ? null : number(raw.target, m.kind === "rate" ? 100 : 1e9, m.kind === "count");
    out.targetDate = raw.targetDate ? date(raw.targetDate) : "";
    if ((out.target === null) !== !out.targetDate) fail("A target needs both a value and a due date; leave both empty if not agreed.");
    const seen = new Map(), replaced = new Set();
    for (const x of raw.observations) {
      if (!x || typeof x.id !== "string" || !/^[a-z0-9-]{1,60}$/.test(x.id) || seen.has(x.id)) fail("Invalid or duplicate observation ID.");
      if (!["baseline", "followup"].includes(x.kind) || !["low", "medium", "high"].includes(x.confidence)) fail("Invalid observation kind or confidence.");
      const o = { id: x.id, kind: x.kind, date: date(x.date), at: stamp(x.at), value: valueFor(m, x), numerator: m.kind === "rate" ? x.numerator : null, denominator: m.kind === "rate" ? x.denominator : null, confidence: x.confidence,
        source: text(x.source, 500), note: text(x.note), scope: text(x.scope), method: text(x.method), replaces: x.replaces || "" };
      if (o.date > o.at.slice(0,10)) fail("An observation cannot be dated after it was recorded.");
      if (!o.source || !o.scope || !o.method) fail("Record the source, scope and method for each observation.");
      if (o.replaces) {
        const prior = seen.get(o.replaces);
        if (!prior || replaced.has(o.replaces) || prior.kind !== o.kind || o.at < prior.at || !o.note) fail("A correction must replace a current observation of the same kind and explain why.");
        replaced.add(o.replaces);
      }
      out.observations.push(o); seen.set(o.id, o);
    }
    const current = active(out), baselines = current.filter(o => o.kind === "baseline");
    if (baselines.length > 1) fail("Keep one baseline; correct the existing baseline instead of adding another.");
    if (baselines.length && current.some(o => o.kind === "followup" && o.date < baselines[0].date)) fail("Follow-ups cannot predate the baseline.");
    const dates = new Set();
    for (const o of current) { const key = o.kind + ":" + o.date; if (dates.has(key)) fail("An observation already exists for that date. Use a correction."); dates.add(key); }
    return out;
  }
  function clean(raw) {
    if (raw == null) return empty();
    if (raw.schema !== 1 || !raw.bridges || typeof raw.bridges !== "object" || Array.isArray(raw.bridges)) fail("Invalid impact data schema.");
    const out = empty(), bridges = new Set([...window.RPB.bridges.map(b => b.id), "other"]);
    let total = 0;
    for (const [id, b] of Object.entries(raw.bridges)) {
      if (!bridges.has(id) || !b || !b.metrics || typeof b.metrics !== "object" || Array.isArray(b.metrics) || !Array.isArray(b.reviews) || b.reviews.length > 50) fail("Invalid impact bridge or learning reviews.");
      const target = emptyBridge();
      for (const [key, r] of Object.entries(b.metrics)) { target.metrics[key] = cleanMetric(key, r); total += r.observations.length; }
      for (const r of b.reviews) {
        const review = { date: date(r.date), at: stamp(r.at), finding: text(r.finding), action: text(r.action), nextReview: r.nextReview ? date(r.nextReview) : "" };
        if (!review.finding || !review.action || review.date > review.at.slice(0,10) || (review.nextReview && review.nextReview < review.date)) fail("Learning reviews need a finding, action and valid dates.");
        target.reviews.push(review);
      }
      out.bridges[id] = target;
    }
    if (total > 500) fail("A plan can contain at most 500 impact observations. Export your work before starting another plan.");
    return out;
  }
  function summary(record) {
    const points = active(record), baseline = points.find(o => o.kind === "baseline") || null;
    const latest = points.filter(o => o.kind === "followup").at(-1) || null;
    const comparable = !!(baseline && latest && baseline.scope === latest.scope && baseline.method === latest.method);
    const change = comparable ? latest.value - baseline.value : null;
    const progress = comparable && record.target !== null && record.target !== baseline.value ? 100 * (latest.value - baseline.value) / (record.target - baseline.value) : null;
    const targetMet = comparable && record.target !== null ? (record.target >= baseline.value ? latest.value >= record.target : latest.value <= record.target) : null;
    return { baseline, latest, points, comparable, change, progress, targetMet };
  }
  function saveMetric(raw, bridgeId, metricId, record) {
    const out = clean(raw);
    out.bridges[bridgeId] ||= emptyBridge();
    out.bridges[bridgeId].metrics[metricId] = cleanMetric(metricId, record);
    return clean(out);
  }
  function observe(raw, bridgeId, metricId, settings, observation) {
    const current = raw.bridges[bridgeId]?.metrics[metricId] || emptyMetric();
    return saveMetric(raw, bridgeId, metricId, { ...settings, observations: [...current.observations, { ...observation, scope: settings.scope, method: settings.method }] });
  }
  function review(raw, bridgeId, entry) {
    const out = clean(raw); out.bridges[bridgeId] ||= emptyBridge(); out.bridges[bridgeId].reviews.push(entry); return clean(out);
  }
  const bridge = (raw, id) => raw?.bridges?.[id] || emptyBridge();
  const formatted = value => value === null || value === undefined ? "Not recorded" : new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value);
  function lines(raw, id) {
    const b = bridge(raw, id), out = [];
    for (const m of metrics) {
      const r = b.metrics[m.id]; if (!r) continue;
      const q = summary(r);
      out.push(m.domain + " / " + m.name + ": baseline " + formatted(q.baseline?.value) + (q.baseline ? " (" + q.baseline.date + ")" : "") + "; latest " + formatted(q.latest?.value) + (q.latest ? " (" + q.latest.date + ")" : "") + "; target " + formatted(r.target) + " " + m.unit + (r.targetDate ? " by " + r.targetDate : "") + "; change " + (q.change === null ? "not comparable or not yet measured" : formatted(q.change) + (m.kind === "rate" ? " percentage points" : " " + m.unit)) + ".");
    }
    for (const r of b.reviews) out.push("Learning review " + r.date + ": " + r.finding + " Action: " + r.action + (r.nextReview ? " Review again: " + r.nextReview : ""));
    return out;
  }
  const texts = raw => Object.values(raw?.bridges || {}).flatMap(b => [...Object.values(b.metrics).flatMap(r => [r.scope, r.method, r.owner, ...r.observations.flatMap(o => [o.source, o.note, o.scope, o.method])]), ...b.reviews.flatMap(r => [r.finding, r.action])]);
  window.RPB_IMPACT = { metrics, domains, byId, empty, emptyBridge, emptyMetric, clean, cleanMetric, active, summary, saveMetric, observe, review, bridge, lines, texts, formatted };
})();
