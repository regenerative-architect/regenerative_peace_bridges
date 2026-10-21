/* =====================================================================
   Regenerative Peace Bridges — data.js (content registry, schema 2)
   ---------------------------------------------------------------------
   Everything the app displays as content lives in this one file, so
   people who don't write code can update it safely.

     RPB.meta          version and the date links were last checked
     RPB.topics        topic labels used for filtering the library
     RPB.types         what kind of source each document is
     RPB.grades        the evidence-strength scale (A–D)
     RPB.documents     the evidence library (every link checked by hand)
     RPB.bridges       proposed solution bridges (always "D": untested here)
     RPB.practices     healing, peace, rights and safety practices
     RPB.readiness     questions used by the planner's readiness check
     RPB.stakeholders  groups for the planner's "Who is in the room?" step
     RPB.glossary      plain-language definitions

   HOW TO ADD A SOURCE
   1. Copy an existing entry in RPB.documents and give it a new unique id.
   2. Fill every field. `grade` is only for studies, reviews, evaluations
      and case studies; leave it as null for guidance, standards, law and
      situation reports.
   3. Set `checked` to the date YOU opened the link and confirmed the
      title, publisher and date. Only https links are shown.
   4. Optional: run `node tools/prerender.mjs` so the no-JavaScript
      fallback in index.html shows your new entry too.

   SAFETY RULE FOR EDITORS (non-negotiable)
   Never add precise locations of homes, schools, shelters, clinics or
   water points, and never name private individuals or armed groups.
   Describe places at country or province level, as the original
   publication does. Bridges never name a target community: they are
   offered only to communities that ask, through representatives they
   choose themselves.
   ===================================================================== */
window.RPB = {
  meta: {
    version: "2.0.0",
    linksChecked: "2026-10-21",
    schema: 2
  },

  /* Topic ids are used in documents[].topics. Labels are what people see. */
  topics: [
    { id: "peace", label: "Peace and conflict sensitivity" },
    { id: "climate", label: "Climate and environment" },
    { id: "land", label: "Land, farming and food" },
    { id: "water", label: "Water" },
    { id: "children", label: "Children and education" },
    { id: "healing", label: "Healing and wellbeing" },
    { id: "rights", label: "Rights, consent and law" },
    { id: "safety", label: "Safety and protection" },
    { id: "measure", label: "Measuring and accountability" }
  ],

  /* "role" decides whether an evidence grade makes sense for this type. */
  types: {
    study:      { label: "Peer-reviewed study", role: "evidence" },
    review:     { label: "Evidence review", role: "evidence" },
    evaluation: { label: "Programme evaluation", role: "evidence" },
    cases:      { label: "Case studies", role: "evidence" },
    guidance:   { label: "Practical guidance", role: "howto" },
    standard:   { label: "Standard or principles", role: "howto" },
    law:        { label: "Law, rights or commitment", role: "howto" },
    situation:  { label: "Situation report", role: "context" }
  },

  /* The evidence ladder. Grades are editorial labels written for this
     tool, not an independent systematic appraisal. */
  grades: {
    A: { label: "Strong", plain: "Several independent, rigorous studies agree." },
    B: { label: "Moderate", plain: "A rigorous study, a large-data analysis, or a review of many studies." },
    C: { label: "Emerging", plain: "Before-and-after results, case studies or programme experience, without a comparison group." },
    D: { label: "Untested here", plain: "An idea or proposal. No measured results yet in this context." }
  },

  /* ------------------------------------------------------------------
     EVIDENCE LIBRARY
     Fields: id, short (label for diagrams), title, org, authors?, date
     (YYYY, YYYY-MM or YYYY-MM-DD; "" if undated), type, grade (A–C or
     null), topics[], summary, key? (key findings), limits (what it can't
     tell you), url (https), doi?, checked (YYYY-MM-DD).
     ------------------------------------------------------------------ */
  documents: [
    {
      id: "undp-cps-2026",
      short: "UNDP climate–peace review",
      title: "Programming for Climate, Peace and Security: Thematic Review and Guidance Note",
      org: "UNDP",
      date: "2026-05-26",
      type: "review",
      grade: "C",
      topics: ["peace", "climate"],
      summary: "Reviews 15 climate, peace and security projects across 28 countries, with cases from Africa, Central Asia, the Pacific, Latin America and the Middle East, and turns them into guidance on risk assessment, design, stakeholder engagement and monitoring.",
      limits: "Draws on programme experience rather than controlled comparisons, so it shows what practitioners learned, not proven effect sizes.",
      url: "https://www.undp.org/publications/programming-climate-peace-and-security-thematic-review-and-guidance-note",
      checked: "2026-10-21"
    },
    {
      id: "undp-positive-peace-2026",
      short: "UNDP climate solutions cases",
      title: "From Crisis to Resilience: Climate Solutions for Positive Peacebuilding",
      org: "UNDP",
      date: "2026-01-14",
      type: "cases",
      grade: "C",
      topics: ["peace", "climate"],
      summary: "Ten country cases (Colombia, DR Congo, Ghana, Iraq, Jordan, Kenya, the Philippines, Sierra Leone, Timor-Leste and Uzbekistan) showing how climate adaptation, mitigation and finance can support peace in fragile settings, across water, energy, land, livelihoods, gender and data.",
      limits: "Cases were chosen to illustrate approaches. They are not compared with places that had no programme.",
      url: "https://www.undp.org/publications/crisis-resilience-climate-solutions-positive-peacebuilding",
      checked: "2026-10-21"
    },
    {
      id: "unicef-srsp-2026",
      short: "UNICEF shock-responsive social protection",
      title: "Programme Guidance and Operational Notes: Strengthening Shock-Responsive Social Protection Systems",
      org: "UNICEF",
      date: "2026-07-06",
      type: "guidance",
      grade: null,
      topics: ["children", "safety"],
      summary: "Updates UNICEF’s 2019 guidance on preparing social protection, including cash transfers, for shocks such as conflict, climate change, displacement and pandemics. Three operational notes cover climate, forced displacement and conflict settings.",
      limits: "Guidance on how to design systems. It does not measure results.",
      url: "https://www.unicef.org/documents/programme-guidance-and-operational-notes-strengthening-shock-responsive-social-protection",
      checked: "2026-10-21"
    },
    {
      id: "wri-mrv-2026",
      short: "WRI restoration monitoring guide",
      title: "Land Restoration From Planting to Proof: A Guide to Monitoring, Reporting, and Verification",
      org: "World Resources Institute",
      date: "2026-01-12",
      type: "guidance",
      grade: null,
      topics: ["measure", "land"],
      summary: "A 120-page guidebook, co-created and field-tested with more than 200 locally led restoration projects. It tracks nine biophysical, socioeconomic and financial indicator categories and uses high-resolution satellite imagery with an AI tree-counting model for verification.",
      key: "WRI reports that satellite-based verification cut costs by up to 98% compared with field inventories for its first 198 TerraFund projects.",
      limits: "Built for restoration portfolios. Satellite and location data need extra privacy protection in conflict settings.",
      url: "https://www.wri.org/research/land-restoration-planting-proof-guide-monitoring-reporting-and-verification",
      doi: "10.46830/wrigb.24.00067",
      checked: "2026-10-21"
    },
    {
      id: "nature-food-2026",
      short: "Conflict and cropland loss (Nature Food)",
      title: "Armed Conflict Accelerates Cropland Loss and Food Insecurity Worldwide",
      org: "Nature Food",
      authors: "Research team at the Institute of Geographic Sciences and Natural Resources Research, Chinese Academy of Sciences",
      date: "2026-09-24",
      type: "study",
      grade: "B",
      topics: ["land", "peace"],
      summary: "Combines annual 30-metre global cropland maps (2000–2020) with more than 460,000 conflict events in 155 countries. Using difference-in-differences and propensity score matching, it finds that conflict-affected areas lost 23.7% more cropland than comparable areas, with losses lasting for years.",
      key: "The cropland lost could have met the minimum dietary energy needs of about 255 million people a year. The authors stress this is lost production potential, not measured hunger. Losses were smaller where governance was stronger, and areas moving into peace showed no clear continued decline.",
      limits: "One global study of land within 5 km of conflict events. It measures association with careful controls; it cannot explain every local cause.",
      url: "https://www.nature.com/articles/s43016-026-01436-8",
      doi: "10.1038/s43016-026-01436-8",
      checked: "2026-10-21"
    },
    {
      id: "pbf-sl-gn-2024",
      short: "Sierra Leone–Guinea farmer–herder project",
      title: "Building Cross-Border Peace and Strengthening Sustainable Livelihoods of Cattle Herders and Crop Farmers in Sierra Leone and Guinea: Endline Assessment",
      org: "UN Peacebuilding Fund",
      authors: "Independent external consultant",
      date: "2024-06",
      type: "evaluation",
      grade: "C",
      topics: ["peace", "land"],
      summary: "Endline assessment of a USD 4.55 million project (2021–2024) run by WFP, IOM and Talking Drum Studio with both governments in Falaba (Sierra Leone) and Faranah (Guinea). Households reporting a farmer–herder dispute in the past year fell from 41% to 8.6%, and 96.5% of reported disputes were resolved.",
      key: "Results were mixed. Only 20.4% of Sierra Leone respondents said local Cattle Settlement Committees work for everyone equally (the target was 80%). Planted grass died on all five Sierra Leone ranches in the dry season, solar irrigation was finished too late to help, and some monitoring stopped when incentives ended.",
      limits: "A before-and-after survey with no comparison group and some convenience sampling, so not every improvement can be credited to the project.",
      url: "https://www.un.org/peacebuilding/sites/www.un.org.peacebuilding/files/documents/pbf_cross-border_sl-gui_assessment_report.pdf",
      checked: "2026-10-21"
    },
    {
      id: "cgiar-csst-2024",
      short: "CGIAR climate security sensitivity tool",
      title: "Climate Security Sensitivity Tool: IPSR Innovation Profile",
      org: "CGIAR (Alliance of Bioversity International and CIAT)",
      authors: "Sarzana, C.; Pacillo, G.",
      date: "2024-10",
      type: "guidance",
      grade: null,
      topics: ["peace", "climate"],
      summary: "A two-step assessment for judging the peace potential of climate adaptation work. It checks whether a climate programme fits the conflict context where it operates and recommends changes to improve that fit.",
      limits: "A design tool. On its own it does not show that adjusted programmes reduce conflict.",
      url: "https://alliancebioversityciat.org/publications-data/climate-security-sensitivity-tool",
      checked: "2026-10-21"
    },
    {
      id: "conag-review-2025",
      short: "Conflict and smallholder farming review",
      title: "The Impact of Violent Conflict on Smallholder Agriculture: A Scoping Review",
      org: "ConAg Network (University College Dublin and University of Ibadan)",
      authors: "Otekunrin, O. A.; Dowd, C.; Anetor, I. I.; Adekoya, A. E.",
      date: "2025-09",
      type: "review",
      grade: "B",
      topics: ["land", "peace"],
      summary: "Maps 85 publications (2000–2024) on how violent conflict harms smallholder farming: destruction and looting of crops, tools and irrigation; theft of livestock; abandonment and displacement; seed insecurity; and broken markets, inputs and labour.",
      key: "Farming systems were most vulnerable when they relied on a single crop, bought-in inputs, insecure land tenure and limited water. Women and marginalised groups are under-studied: gender is treated in depth in only 14 of the 85 publications.",
      limits: "A scoping review maps what has been studied. It does not weigh study quality or pool results.",
      url: "https://www.ucd.ie/cpcr/t4media/ConAg%20Project%20-%202025%20-%20The%20impact%20of%20violent%20conflict%20on%20smallholder%20agriculture%20-%20Scoping%20review.pdf",
      checked: "2026-10-21"
    },
    {
      id: "undp-itc-sudan-2026",
      short: "Sudan farm and market analysis",
      title: "Almost 90% of Sudanese Farmers See Yields Fall, but Agriculture Still Key to Boosting Food Security",
      org: "UNDP Sudan",
      authors: "Press release on the UNDP and International Trade Centre Sudan Agri-food and Market Resilience Analysis",
      date: "2026-08-04",
      type: "situation",
      grade: null,
      topics: ["land"],
      summary: "Summarises a UNDP and International Trade Centre analysis of Sudan’s farm and market systems since the conflict began in April 2023. Almost 90% of farmers and producer groups report lower productivity, more than half cannot harvest safely, and food prices in some areas are more than double pre-conflict levels.",
      key: "Covers seven value chains (sesame, sorghum, soybeans, groundnuts, hibiscus, gum arabic and livestock) and more than 80 consultations. Over 70% of farmers and small businesses cannot get agricultural finance.",
      limits: "A press release about the analysis. Read the full report for methods before using the figures.",
      url: "https://www.undp.org/sudan/press-releases/almost-90-sudanese-farmers-see-yields-fall-agriculture-still-key-boosting-food-security",
      checked: "2026-10-21"
    },
    {
      id: "wmo-africa-2025",
      short: "State of the Climate in Africa 2025",
      title: "State of the Climate in Africa 2025",
      org: "World Meteorological Organization",
      date: "2026-06-18",
      type: "situation",
      grade: null,
      topics: ["climate"],
      summary: "Africa is warming faster than the global average. Floods made up more than half of reported extreme weather events in 2025, and drought affected more than 8.5 million people in East Africa.",
      limits: "A climate assessment. It does not evaluate programmes.",
      url: "https://wmo.int/resources/publication-series/state-of-climate-africa/state-of-climate-africa-2025",
      checked: "2026-10-21"
    },
    {
      id: "undp-fba-nonstate-2026",
      short: "UNDP non-state actors lessons",
      title: "Service Delivery and Non-State Actors: Lessons for Engagement in Fragile and Conflict-Affected Settings",
      org: "UNDP with the Folke Bernadotte Academy",
      date: "2026-01-12",
      type: "cases",
      grade: "C",
      topics: ["peace", "rights"],
      summary: "Examines how international engagement with non-state actors (civil society, customary and religious leaders, youth groups) shapes politics and norms, using cases from the Liptako-Gourma region of the Sahel, Myanmar, Syria and Ukraine, and proposes a framework that links engagement to rights-based governance and the social contract.",
      limits: "Qualitative case analysis. Useful for judging partnerships, not for predicting outcomes.",
      url: "https://www.undp.org/publications/service-delivery-and-non-state-actors-lessons-engagement-fragile-and-conflict-affected-settings",
      checked: "2026-10-21"
    },
    {
      id: "unoca-chad-2026",
      short: "Eastern Chad climate–peace assessment",
      title: "Climate, Peace and Security in Eastern Chad: Understanding Risks, Strengthening Resilience and Building Lasting Peace",
      org: "UNOCA with UNDP Chad",
      date: "2026-10-06",
      type: "situation",
      grade: null,
      topics: ["climate", "peace"],
      summary: "Announces an assessment of Ouaddaï, Sila, Wadi Fira and Ennedi East provinces, supported by the UN Climate Security Mechanism. It describes climate change as a risk multiplier where it combines with poverty, weak governance, displacement and competition over natural resources.",
      key: "Recommends conflict prevention, inclusive natural resource management and social cohesion, with attention to women, youth, refugees and host communities.",
      limits: "A news story about the report. Consult the full assessment for methods and details.",
      url: "https://unoca.unmissions.org/en/news/climate-peace-and-security-in-eastern-chad-understanding-risks-strengthening-resilience",
      checked: "2026-10-21"
    },
    {
      id: "cda-dnh",
      short: "Do No Harm framework",
      title: "Do No Harm (Local Capacities for Peace) Framework",
      org: "CDA Collaborative Learning",
      date: "1993",
      ongoing: true,
      type: "guidance",
      grade: null,
      topics: ["peace", "safety"],
      summary: "A widely used way to check how aid and development work affects conflict. It asks what divides people and what connects them, how a project’s actions and staff behaviour strengthen or weaken each, and what small changes would do better.",
      limits: "An analysis method. Its value depends on honest, inclusive local analysis, repeated as things change.",
      url: "https://www.cdacollaborative.org/cdaproject/the-do-no-harm-project/",
      checked: "2026-10-21"
    },
    {
      id: "who-pfa-2011",
      short: "Psychological first aid (WHO)",
      title: "Psychological First Aid: Guide for Field Workers",
      org: "WHO, War Trauma Foundation and World Vision International",
      date: "2011-10-02",
      type: "guidance",
      grade: null,
      topics: ["healing"],
      summary: "Humane, practical support for people after extremely distressing events, built around three action principles (look, listen and link) and centred on people’s dignity, culture and abilities.",
      limits: "Psychological first aid is basic support. It is not counselling or treatment, and it should connect people to specialised care when they need it.",
      url: "https://www.who.int/publications/i/item/9789241548205",
      checked: "2026-10-21"
    },
    {
      id: "iasc-mhpss-2007",
      short: "IASC mental health and psychosocial support",
      title: "IASC Guidelines on Mental Health and Psychosocial Support in Emergency Settings",
      org: "Inter-Agency Standing Committee",
      date: "2007",
      type: "standard",
      grade: null,
      topics: ["healing", "safety"],
      summary: "Sets six core principles (human rights and equity, participation, do no harm, building on available resources and capacities, integrated support systems, and multi-layered supports) and a four-layer pyramid that runs from basic services and security up to specialised services.",
      limits: "Global guidelines. They must be adapted to local culture, services and language.",
      url: "https://www.afro.who.int/sites/default/files/2017-06/guidelines_iasc_mental_health_psychosocial.pdf",
      checked: "2026-10-21"
    },
    {
      id: "fao-fpic-2016",
      short: "Free, prior and informed consent (FAO)",
      title: "Free Prior and Informed Consent: An Indigenous Peoples’ Right and a Good Practice for Local Communities",
      org: "FAO",
      date: "2016",
      type: "guidance",
      grade: null,
      topics: ["rights"],
      summary: "A manual for project practitioners. Consent must be free of coercion, sought before activities begin, informed in local languages and formats, and decided through the community’s own processes, with the right to say yes, no, or yes with conditions, and to withdraw later.",
      key: "Six steps: identify rights-holders and their chosen representatives; document land and resource use through participatory mapping; communicate and discuss; reach consent and agree a feedback and complaints mechanism; monitor together; document lessons with the community.",
      limits: "A practice manual. Applying it well takes time, local facilitators and a willingness to accept a ‘no’.",
      url: "https://www.fao.org/3/I6190E/i6190e.pdf",
      checked: "2026-10-21"
    },
    {
      id: "fao-vggt",
      short: "Tenure guidelines (VGGT)",
      title: "Voluntary Guidelines on the Responsible Governance of Tenure of Land, Fisheries and Forests (VGGT)",
      org: "FAO and the Committee on World Food Security",
      date: "2012",
      type: "standard",
      grade: null,
      topics: ["rights", "land"],
      summary: "The global reference for responsible land, fisheries and forest tenure. It aims to promote secure tenure rights and fair access, and covers public, private, communal, Indigenous, customary and informal tenure.",
      limits: "Voluntary guidelines. They guide good practice but are not binding law in themselves.",
      url: "https://www.fao.org/tenure/resources/collections/voluntary-guidelines/en",
      checked: "2026-10-21"
    },
    {
      id: "sphere-2018",
      short: "Sphere Handbook",
      title: "The Sphere Handbook: Humanitarian Charter and Minimum Standards in Humanitarian Response",
      org: "Sphere",
      date: "2018",
      type: "standard",
      grade: null,
      topics: ["water", "safety", "measure"],
      summary: "Minimum standards for water supply, sanitation and hygiene; food security and nutrition; shelter and settlement; and health, built on a rights-based Humanitarian Charter. The 2018 edition is current and a 2026–2028 revision is under way.",
      limits: "Minimum standards for crisis response. Recovery work should aim higher where it can.",
      url: "https://spherestandards.org/handbook",
      checked: "2026-10-21"
    },
    {
      id: "chs-2024",
      short: "Core Humanitarian Standard",
      title: "Core Humanitarian Standard on Quality and Accountability (2024 edition)",
      org: "CHS Alliance, Groupe URD and Sphere",
      date: "2024-03",
      type: "standard",
      grade: null,
      topics: ["measure", "rights"],
      summary: "Nine commitments that any person or organisation supporting people in crisis can use to make their work people-centred and accountable, recognising the leading role of communities in finding local solutions.",
      limits: "A voluntary standard. It helps only if feedback actually changes decisions.",
      url: "https://corehumanitarianstandard.org/",
      checked: "2026-10-21"
    },
    {
      id: "unicef-water-under-fire-3",
      short: "Water Under Fire (UNICEF)",
      title: "Water Under Fire, Volume 3: Attacks on Water and Sanitation Services in Armed Conflict and the Impacts on Children",
      org: "UNICEF",
      date: "2021-05-24",
      type: "situation",
      grade: null,
      topics: ["water", "children"],
      summary: "Shows that in many conflicts more children die from diseases linked to unsafe water than from direct violence, with case studies from Iraq, the State of Palestine, Syria, Ukraine and Yemen. It calls for attacks on water and sanitation services and staff to stop.",
      limits: "An advocacy and situation report. It does not evaluate specific water programmes.",
      url: "https://www.unicef.org/reports/water-under-fire-volume3",
      checked: "2026-10-21"
    },
    {
      id: "wfp-school-feeding-2024",
      short: "State of School Feeding 2024",
      title: "State of School Feeding Worldwide 2024",
      org: "World Food Programme",
      date: "2024",
      type: "situation",
      grade: null,
      topics: ["children", "land"],
      summary: "WFP’s biennial global report. At least 466 million children now receive school meals, almost 80 million more than four years earlier, with Africa adding 20 million children in two years. It also discusses links to local food systems and procurement.",
      limits: "A global coverage report. Check programme evaluations before relying on specific benefits in a conflict setting.",
      url: "https://publications.wfp.org/2024/state-of-school-feeding/",
      checked: "2026-10-21"
    },
    {
      id: "ssd-2015",
      short: "Safe Schools Declaration",
      title: "Safe Schools Declaration",
      org: "Global Coalition to Protect Education from Attack",
      date: "2015-05",
      type: "law",
      grade: null,
      topics: ["children", "safety"],
      summary: "An inter-governmental political commitment, opened for endorsement in Oslo in May 2015, to protect students, teachers, schools and universities from the worst effects of armed conflict, including by applying the Guidelines for Protecting Schools and Universities from Military Use. The official site lists 123 endorsing states.",
      limits: "A political commitment. Check whether the country you work in has endorsed it.",
      url: "https://ssd.protectingeducation.org/",
      checked: "2026-10-21"
    },
    {
      id: "fmnr-niger-2025",
      short: "FMNR in Niger",
      title: "How Niger’s FMNR Experience Has Inspired a Global Scaling Movement",
      org: "FMNR Hub (World Vision Australia)",
      authors: "Rinaudo, T.",
      date: "2025-11-13",
      type: "cases",
      grade: "C",
      topics: ["land", "climate"],
      summary: "Describes farmer-managed natural regeneration: regrowing trees from living stumps, roots and seeds already in the ground. In Niger an estimated 200 million trees regrew across about 5 million hectares of farmland, spreading mostly from farmer to farmer between the mid-1980s and the mid-2000s.",
      limits: "Area estimates come from a 2008 WRI report and the author’s own communications. The post gives few measured yield or income figures, and its scale-up targets are goals, not results.",
      url: "https://fmnrhub.com.au/blog-post-how-nigers-fmnr-experience-has-inspired-a-global-scaling-movement/",
      checked: "2026-10-21"
    },
    {
      id: "un-decade-principles-2021",
      short: "UN Decade restoration principles",
      title: "Principles for Ecosystem Restoration to Guide the United Nations Decade 2021–2030",
      org: "FAO, IUCN Commission on Ecosystem Management and Society for Ecological Restoration",
      date: "2021",
      type: "standard",
      grade: null,
      topics: ["land", "climate"],
      summary: "Ten principles for restoration during the UN Decade, including inclusive and participatory governance from the start, drawing on all types of knowledge, fitting the local ecological, cultural and socio-economic context, and monitoring and adapting beyond a project’s lifetime.",
      limits: "High-level principles. Each project still needs locally specific targets and methods.",
      url: "https://www.decadeonrestoration.org/publications/principles-ecosystem-restoration-guide-united-nations-decade-2021-2030",
      checked: "2026-10-21"
    },
    {
      id: "imas",
      short: "International Mine Action Standards",
      title: "International Mine Action Standards (IMAS)",
      org: "UN Mine Action Service, coordinated by GICHD",
      date: "",
      ongoing: true,
      type: "standard",
      grade: null,
      topics: ["safety", "land"],
      summary: "The international standards for mine action, maintained by the UN Mine Action Service with GICHD coordinating on its behalf. They guide national standards, procedures and training to improve safety, efficiency and quality, including for survey, clearance and explosive ordnance risk education.",
      limits: "Technical standards for accredited mine action organisations. Restoration teams use them to know whom to ask, never to do clearance themselves.",
      url: "https://www.gichd.org/our-response/mine-action-standards/international-mine-action-standards/",
      checked: "2026-10-21"
    },
    {
      id: "icrc-environment-2020",
      short: "ICRC environment-in-war guidelines",
      title: "Guidelines on the Protection of the Natural Environment in Armed Conflict",
      org: "International Committee of the Red Cross",
      date: "2020",
      type: "law",
      grade: null,
      topics: ["rights", "climate"],
      summary: "Compiles the rules and recommendations of international humanitarian law that protect the natural environment in war, each with commentary, to help states and parties to conflict apply them in military manuals and national policy.",
      limits: "Addressed mainly to states and parties to conflict. Useful for advocacy and understanding obligations.",
      url: "https://icrc.org/en/document/guidelines-protection-natural-environment-armed-conflict-rules-and-recommendations-relating",
      checked: "2026-10-21"
    },
    {
      id: "unep-c2p-2009",
      short: "UNEP From Conflict to Peacebuilding",
      title: "From Conflict to Peacebuilding: The Role of Natural Resources and the Environment",
      org: "UN Environment Programme",
      date: "2009",
      type: "review",
      grade: "B",
      topics: ["peace", "climate"],
      summary: "A foundational policy report on environmental peacebuilding. It reports that at least 40% of intrastate conflicts over the previous sixty years were linked to natural resources, and sets out how resources and the environment can both drive conflict and support peace.",
      limits: "Published in 2009. Pair it with recent studies for current figures.",
      url: "https://wedocs.unep.org/20.500.11822/7867",
      checked: "2026-10-21"
    },
    {
      id: "unscr-1325",
      short: "Resolution 1325: women, peace and security",
      title: "Security Council Resolution 1325 (2000) on Women, Peace and Security",
      org: "UN Security Council",
      date: "2000-10-31",
      type: "law",
      grade: null,
      topics: ["rights", "peace"],
      summary: "Calls for more women in conflict prevention and peace decision-making, a larger role for women in UN field missions, and protection of women and girls from sexual and gender-based violence.",
      limits: "A Security Council resolution. Local practice depends on national action plans and on women’s organisations themselves.",
      url: "https://digitallibrary.un.org/record/426075",
      checked: "2026-10-21"
    },
    {
      id: "unscr-2250",
      short: "Resolution 2250: youth, peace and security",
      title: "Security Council Resolution 2250 (2015) on Youth, Peace and Security",
      org: "UN Security Council",
      date: "2015-12-09",
      type: "law",
      grade: null,
      topics: ["rights", "peace"],
      summary: "Urges states to include young people in decisions at all levels, and sets out five pillars: participation, protection, prevention, partnerships, and disengagement and reintegration.",
      limits: "The link opens the UN press summary, which includes the resolution text.",
      url: "https://press.un.org/en/2015/sc12149.doc.htm",
      checked: "2026-10-21"
    },
    {
      id: "iep-positive-peace",
      short: "Eight pillars of Positive Peace",
      title: "The Eight Pillars of Positive Peace",
      org: "Institute for Economics & Peace",
      date: "",
      type: "guidance",
      grade: null,
      topics: ["peace"],
      summary: "Defines Positive Peace as the attitudes, institutions and structures that create and sustain peaceful societies, through eight pillars: well-functioning government, sound business environment, equitable distribution of resources, acceptance of the rights of others, good relations with neighbours, free flow of information, high levels of human capital, and low levels of corruption.",
      limits: "A national-level framework. Its indices are not designed to measure a single project.",
      url: "https://www.visionofhumanity.org/the-eight-pillars-of-positive-peace/",
      checked: "2026-10-21"
    },
    {
      id: "grfc-2026",
      short: "Global Report on Food Crises 2026",
      title: "Global Report on Food Crises 2026",
      org: "Global Network Against Food Crises and partners",
      date: "2026-04-24",
      type: "situation",
      grade: null,
      topics: ["land", "children"],
      summary: "266 million people in 47 countries and territories faced high levels of acute food insecurity in 2025, and 35.5 million children were acutely malnourished. Ten countries accounted for two-thirds of people facing acute hunger, and conflict remains the main driver.",
      key: "In 2025, for the first time, famine was confirmed in two separate contexts in the same year. The report warns that an apparent fall in totals mainly reflects weaker data: 18 countries and territories lacked comparable data.",
      limits: "Totals depend on which countries have data each year, so compare years with care.",
      url: "https://fscluster.org/publication/2026-global-report-food-crises",
      checked: "2026-10-21"
    }
  ],

  /* ------------------------------------------------------------------
     SOLUTION BRIDGES
     A bridge links something documented elsewhere (origin) to a place
     that asks for it. Every bridge is a proposal: grade "D" until a
     community has been consulted, risks checked and results measured.
     ------------------------------------------------------------------ */
  bridges: [
    {
      id: "regeneration",
      short: "Natural regeneration",
      name: "Farmer-managed natural regeneration for land and livelihood recovery",
      plain: "Help trees regrow from living stumps and roots already in farmers’ fields, so tired land recovers at low cost and families gain shade, fodder, firewood and better harvests.",
      origin: "Farmer-led regreening in Niger, where an estimated 200 million trees regrew across about 5 million hectares of farmland, spreading from farmer to farmer over two decades.",
      helps: "Degraded farmland where living stumps and roots remain, where the community has asked for support, and where the people doing the work can keep the benefits of the trees.",
      needs: [
        "Clear, fair agreement on who owns and benefits from regrown trees, including women and tenant farmers.",
        "Agreement with herders on grazing, livestock corridors and dry-season access.",
        "Confirmation from a mine action authority that the land is safe to work, wherever fighting took place.",
        "Rainfall, soil and rootstock that can support regrowth, checked with local knowledge."
      ],
      steps: [
        "Farmer-to-farmer exchange visits, so people can see regrowth with their own eyes.",
        "Volunteer farmers try it on a small part of their own fields.",
        "Farmers and herders write simple community rules on cutting, pruning and grazing together.",
        "Count tree survival and harvests together after each season."
      ],
      risks: [
        "Disputes over who owns regrown trees, or land grabs as land values rise.",
        "Blocked livestock routes that raise farmer–herder tension.",
        "Women losing access to trees, fodder or firewood they relied on.",
        "Injuries from explosive remnants of war when land is worked."
      ],
      safeguards: [
        "Run free, prior and informed consent on the community’s own terms, and respect a ‘no’.",
        "Recognise customary and informal rights before any work starts.",
        "Include pastoralists in writing the rules, and keep corridors open.",
        "Set up a complaint and dispute route that people trust."
      ],
      firstStep: "Start with demonstration plots on volunteers’ land and exchange visits. Change nobody’s land rights, and ask for no labour beyond what volunteers offer.",
      measures: [
        "Trees surviving per hectare, counted by farmers and checked with imagery",
        "Crop yields and household food security",
        "Land and tree disputes raised, and how many were resolved",
        "Women’s access to tree products"
      ],
      connectors: "Shared rules and work parties across groups, and less competition over firewood and fodder.",
      docs: ["fmnr-niger-2025", "conag-review-2025", "wri-mrv-2026", "fao-vggt", "un-decade-principles-2021", "imas", "undp-cps-2026"]
    },
    {
      id: "water",
      short: "Solar water",
      name: "Solar-powered community water for families and schools",
      plain: "Use solar pumps to give families and schools reliable, safe water, run by a committee that fairly represents everyone who uses it.",
      origin: "Decentralised solar water systems used in humanitarian and rural settings, and water cases in UNDP’s climate solutions for peacebuilding.",
      helps: "Neighbourhoods, settlements and schools where water services were damaged or never existed, and where residents ask for a shared, fairly governed supply.",
      needs: [
        "A survey of how much water the source can safely give, and water-quality testing.",
        "A water committee with women, displaced families and host residents in real decision-making roles.",
        "Spare parts, trained local technicians and a maintenance fund for at least three years.",
        "Safe siting away from military positions, with safe, well-lit paths, especially for women and girls."
      ],
      steps: [
        "Repair or upgrade an existing water point before building a new one.",
        "Agree opening hours, fair-use rules and a maintenance plan with users.",
        "Train local technicians, including women.",
        "Test water quality regularly and share the results in simple terms."
      ],
      risks: [
        "Armed actors seizing control of the water point or taxing access.",
        "Over-pumping that dries wells or springs other people rely on.",
        "Some groups being excluded, sparking conflict between host and displaced communities.",
        "Unsafe journeys to water, including the risk of gender-based violence.",
        "Breakdowns with no parts or funds, leaving people worse off than before."
      ],
      safeguards: [
        "Follow Sphere minimum standards for water quantity, quality and access.",
        "Run a Do No Harm analysis of who could gain power by controlling water.",
        "Never publish exact locations of water points in conflict areas.",
        "Offer a confidential complaint channel that bypasses the committee."
      ],
      firstStep: "Add solar power to one existing, working borehole with an inclusive committee in place, and measure uptime, queues and fairness for six months before expanding.",
      measures: [
        "Days per month the system works (uptime)",
        "Litres per person per day, against Sphere’s minimum of 15",
        "Queue time and distance for women, girls and people with disabilities",
        "Water quality test results",
        "Complaints raised and resolved"
      ],
      connectors: "A shared, fairly run service gives groups a reason to cooperate and a place to meet.",
      docs: ["sphere-2018", "unicef-water-under-fire-3", "undp-positive-peace-2026", "chs-2024", "cda-dnh", "wmo-africa-2025"]
    },
    {
      id: "agropeace",
      short: "Farmer–herder cooperation",
      name: "Shared land agreements and agroforestry for farmer–herder cooperation",
      plain: "Bring farmers and herders together to agree on land, water and routes, plant trees and fodder that benefit both, and train local mediators to settle disputes early.",
      origin: "Cross-border peacebuilding between Sierra Leone and Guinea, where reported farmer–herder disputes fell sharply but local committees and planted grass had mixed results, plus CGIAR’s climate security assessment tool.",
      helps: "Communities where farming and herding overlap and both groups ask for help to reduce clashes.",
      needs: [
        "Consent from both farmers and pastoralists, through representatives each group chooses.",
        "Recognised livestock corridors and access to water points.",
        "Trusted local mediators, including women.",
        "Seasonal calendars of planting, harvest and herd movements."
      ],
      steps: [
        "Hold separate listening sessions with each group, then joint meetings.",
        "Agree corridors, crop-damage rules and compensation in writing.",
        "Plant drought-hardy fodder and trees in places both groups agree on.",
        "Set up an early-warning route so crop damage is reported before it escalates."
      ],
      risks: [
        "Committees captured by one group or by local elites. In Sierra Leone only 20.4% said committees work for everyone equally.",
        "Planted fodder failing in the dry season, as it did on all five Sierra Leone ranches.",
        "Monitoring stopping when outside incentives end.",
        "Published route maps exposing herders to raids or theft."
      ],
      safeguards: [
        "Track the fairness of committees separately for each group, and act on the results.",
        "Choose species with proven dry-season survival in the area.",
        "Budget for monitoring after the project ends, owned by local institutions.",
        "Keep route maps with the communities, and don’t publish them."
      ],
      firstStep: "Start with mediated dialogue and a written agreement on one shared corridor or water point, before any planting or construction.",
      measures: [
        "Households reporting a farmer–herder dispute in the past year",
        "Share of disputes resolved, and how they were resolved",
        "Perceived fairness of committees, by group and gender",
        "Fodder and tree survival through the dry season",
        "Incomes for both farmers and herders"
      ],
      connectors: "Markets, shared water and exchanges of manure and crop residues already link these groups, and can be strengthened.",
      docs: ["pbf-sl-gn-2024", "cgiar-csst-2024", "conag-review-2025", "unoca-chad-2026", "cda-dnh", "fao-vggt"]
    },
    {
      id: "school",
      short: "School meals",
      name: "Home-grown school meals for child-centred recovery",
      plain: "Serve school meals made with food bought from local farmers, so children eat and learn while nearby farms gain a steady market.",
      origin: "School meal programmes that now reach at least 466 million children worldwide, many of them linked to local food purchasing.",
      helps: "Schools that are open and safe, in communities that want meals and have farmers able to supply them.",
      needs: [
        "Safe school buildings that are not used for military purposes.",
        "Clean water, hygiene, and safe food storage and cooking.",
        "A child safeguarding policy and trained staff.",
        "Fair, transparent purchasing from local farmers and women’s groups."
      ],
      steps: [
        "Start in a few schools that have water and safe access.",
        "Form a food committee with parents, teachers and farmers.",
        "Buy from local farmers through small, transparent contracts.",
        "Plan menus with nutrition advice and local foods."
      ],
      risks: [
        "Schools becoming targets, or meals drawing children into unsafe journeys.",
        "Food diverted or sold, or corruption in purchasing.",
        "Out-of-school, displaced or disabled children being left out.",
        "Firewood for cooking driving tree loss.",
        "Meals stopping suddenly when funding ends."
      ],
      safeguards: [
        "Follow the Safe Schools Declaration: schools are never used for military purposes.",
        "Offer take-home rations for children who can’t attend.",
        "Use fuel-efficient stoves and plant woodlots.",
        "Run child-friendly, confidential complaint channels."
      ],
      firstStep: "Pilot in a few safe schools that already have water, buy a few staple foods locally, and plan with the community from day one for when outside funding ends.",
      measures: [
        "School days with meals served, against days planned",
        "Attendance and retention for girls and boys",
        "Dietary diversity of meals",
        "Share of food bought from local farmers, including women farmers",
        "Food safety incidents and safeguarding reports handled"
      ],
      connectors: "Schools gather families from different groups around something everyone shares: their children.",
      docs: ["wfp-school-feeding-2024", "ssd-2015", "unicef-srsp-2026", "grfc-2026", "sphere-2018"]
    },
    {
      id: "healing",
      short: "Healing landscapes",
      name: "Healing landscapes: psychosocial support woven into restoration work",
      plain: "Combine community restoration work, like tree nurseries, gardens and water care, with basic psychosocial support, so people can recover together while repairing their surroundings.",
      origin: "The IASC’s layered model of mental health and psychosocial support, which treats community and family supports as a core layer, and WHO’s psychological first aid.",
      helps: "Communities that want shared, practical activities, where trained people can offer basic support and referrals.",
      evidenceNote: "Evidence on combining restoration with psychosocial support in conflict settings is limited. Treat this as an idea to test carefully.",
      needs: [
        "Facilitators trained in psychological first aid.",
        "A referral list for specialised mental health care that actually works.",
        "Voluntary participation, with no pressure to share experiences.",
        "Separate groups where needed (women, men, youth), and child-friendly spaces run by trained staff."
      ],
      steps: [
        "Start a community nursery or garden group that meets regularly.",
        "Train group facilitators in psychological first aid: look, listen, link.",
        "Agree group rules on confidentiality and respect.",
        "Link each group to health and protection services for referrals."
      ],
      risks: [
        "Pushing people to talk about painful events, which can cause harm.",
        "Labelling people as ‘traumatised’ or creating stigma.",
        "Unpaid work presented as therapy.",
        "Raising expectations of care that isn’t available."
      ],
      safeguards: [
        "Make no clinical claims. This is support, not treatment.",
        "Pay fairly for work, and keep support activities voluntary.",
        "Use only validated, locally adapted wellbeing measures, with ethical review.",
        "Protect privacy: no names or stories shared without informed consent."
      ],
      firstStep: "Begin with one nursery or garden group led by trained local facilitators and backed by a tested referral route, before adding any structured wellbeing activities.",
      measures: [
        "Voluntary participation and retention",
        "Referrals made and completed",
        "Plants and trees surviving",
        "Participants’ own sense of connection and wellbeing (validated, locally adapted tools only)"
      ],
      connectors: "Shared work and shared results rebuild trust and routine, which the IASC model treats as core support.",
      docs: ["iasc-mhpss-2007", "who-pfa-2011", "un-decade-principles-2021", "chs-2024"]
    },
    {
      id: "cash",
      short: "Cash for restoration",
      name: "Shock-responsive cash for community-chosen restoration",
      plain: "Pay fair wages, through trusted social protection systems, for restoration work the community chooses, so families can buy food while land and water systems recover.",
      origin: "UNICEF’s 2026 guidance on shock-responsive social protection, and climate–peace programme experience reviewed by UNDP.",
      helps: "Households facing hunger or lost income where cash can be delivered safely and local markets still work.",
      needs: [
        "Safe payment channels that armed actors can’t tax or control.",
        "Fair selection rules that people understand and can challenge.",
        "Wages equal to local rates, and no work for children below the legal working age.",
        "Support for people who can’t do physical work, such as older people, people with disabilities and pregnant women."
      ],
      steps: [
        "Let the community choose projects, such as water-harvesting bunds, tree nurseries or soil conservation.",
        "Use existing social protection systems where they are safe and trusted.",
        "Collect only the personal data needed for payments, and protect it.",
        "Publish the selection rules and a complaint route."
      ],
      risks: [
        "Local elites capturing the beneficiary lists.",
        "Payments seen as favouring one group, fuelling tension.",
        "Unsafe work on contaminated land.",
        "Personal data on beneficiaries exposed or misused.",
        "Price rises if local markets can’t supply goods."
      ],
      safeguards: [
        "Check that markets can supply goods before using cash.",
        "Run explosive ordnance checks before any land work.",
        "Minimise payment data, protect it, and delete it when no longer needed.",
        "Watch for tensions and adjust selection with the community."
      ],
      firstStep: "Start with one small, community-chosen project and a short payment cycle, with clear rules and an independent complaint route.",
      measures: [
        "Payments made on time and in full",
        "Household food consumption",
        "Restoration works still maintained after 12 months",
        "Complaints raised and resolved, and inclusion or exclusion errors",
        "Protection incidents linked to payments (the target is none)"
      ],
      connectors: "Visible, fair, shared works can become a common project across divided groups.",
      docs: ["unicef-srsp-2026", "undp-cps-2026", "chs-2024", "imas", "grfc-2026"]
    },
    {
      id: "seeds",
      short: "Community seeds",
      name: "Community seed systems for food sovereignty after displacement",
      plain: "Help farmers recover diverse, locally adapted seed and share it fairly, so families can replant after losing harvests, tools and seed stocks.",
      origin: "Research showing that conflict destroys crops, seed stocks and markets, and that cropland loss can last for years without recovery support.",
      helps: "Farming communities returning to their land, or hosting displaced farmers, who say seed is what stops them replanting.",
      needs: [
        "An assessment, with farmers, of whether the problem is seed availability, money to buy it, or seed quality.",
        "Varieties farmers know and can save and replant.",
        "Working local markets and traders, where they exist.",
        "Safe access to fields."
      ],
      steps: [
        "Ask farmers what seed they need and why they lack it.",
        "Support local seed fairs or vouchers that buy from local traders.",
        "Help farmer groups set up community seed banks with shared rules.",
        "Return seed to the bank after harvest so stocks grow."
      ],
      risks: [
        "Unsuitable or non-local seed that fails or can’t be saved.",
        "Free handouts undercutting local seed traders.",
        "Women farmers excluded from seed fairs or banks.",
        "Seed banks controlled by a few powerful people."
      ],
      safeguards: [
        "Prefer local varieties that farmers choose.",
        "Buy locally where markets work.",
        "Make sure women and displaced farmers have a voice and access.",
        "Keep seed bank records simple, open and local."
      ],
      firstStep: "Hold a seed needs discussion with farmers, then one community seed fair buying from local suppliers, before any large distribution.",
      measures: [
        "Farmers with enough seed of the varieties they prefer",
        "Number of crops and varieties grown",
        "Area replanted",
        "Women farmers’ access to seed",
        "Seed returned to the community bank"
      ],
      connectors: "Seed exchange is an old practice of give-and-take between neighbouring communities.",
      docs: ["conag-review-2025", "nature-food-2026", "undp-itc-sudan-2026", "grfc-2026", "fao-vggt"]
    },
    {
      id: "monitoring",
      short: "Community monitoring",
      name: "Community-led restoration monitoring for shared, trusted proof",
      plain: "Let communities measure restoration themselves, with simple indicators they choose, checked against satellite images, so results are trusted and owned locally.",
      origin: "WRI’s monitoring, reporting and verification approach, field-tested with more than 200 locally led restoration projects.",
      helps: "Any community running restoration that wants to show results to itself, funders and authorities without giving up control of its data.",
      needs: [
        "Community agreement on what to measure and who may see the data.",
        "Simple tools that work offline.",
        "A data protection plan: what is collected, where it is stored, who can see it and when it is deleted.",
        "Clear rules for location data in conflict areas."
      ],
      steps: [
        "Agree indicators with the community, for example trees alive, water flowing, harvests.",
        "Train and pay local monitors, including women and young people.",
        "Combine field counts with satellite checks at a coarse scale.",
        "Share results in community meetings before anyone else sees them."
      ],
      risks: [
        "Precise maps or photos revealing homes, people or assets to armed actors.",
        "Data used for land grabs or surveillance.",
        "Outsiders taking the data and the credit.",
        "Monitoring turning into box-ticking for funders."
      ],
      safeguards: [
        "Publish only combined, coarse-resolution data.",
        "No people, faces or homes in photos without consent, and never children’s faces.",
        "Written data agreements that keep the community in control.",
        "Keep raw data on local devices and delete what isn’t needed."
      ],
      firstStep: "Choose three community-defined indicators and fixed photo points without people, and report results only at village or district level.",
      measures: [
        "Indicators reported on time",
        "Community satisfaction with the process",
        "Data incidents (the target is none)",
        "Decisions changed because of monitoring results"
      ],
      connectors: "Shared evidence lets groups settle disagreements with facts they produced together.",
      docs: ["wri-mrv-2026", "un-decade-principles-2021", "chs-2024", "fao-fpic-2016"]
    }
  ],

  /* ------------------------------------------------------------------
     PRACTICES — healing, peace, rights, safety, regenerative, accountability
     kind: one of healing | peace | rights | safety | regenerative | accountability
     source: a document id from the library above.
     ------------------------------------------------------------------ */
  practices: [
    {
      id: "do-no-harm",
      kind: "peace",
      name: "Do No Harm: dividers and connectors",
      plain: "Before and during any project, look at what pulls people apart and what holds them together, and make sure your work strengthens the second.",
      when: "At the start of every bridge, and again whenever the situation changes.",
      steps: [
        "List the dividers: tensions, grievances, unfair access and anything that separates groups.",
        "List the connectors: markets, water points, shared values, schools and people who bridge groups.",
        "Look at your project’s actions (who gets what, who decides, who is hired) and your team’s behaviour.",
        "Ask how each action affects dividers and connectors, then change what makes things worse."
      ],
      care: "Write about issues, not individuals. Don’t name people or armed groups, or record where they are.",
      source: "cda-dnh"
    },
    {
      id: "pfa",
      kind: "healing",
      name: "Psychological first aid: look, listen, link",
      plain: "Simple, humane support anyone can learn to offer people in distress, without forcing them to talk.",
      when: "Whenever you meet people who have just been through something frightening or painful.",
      steps: [
        "Look: check for safety, urgent basic needs and people who are very distressed.",
        "Listen: approach gently, ask what people need and what worries them, and help them feel calm.",
        "Link: help people meet basic needs, get information, and connect with loved ones and services."
      ],
      care: "Never press anyone to describe what happened. Don’t promise what you can’t deliver. Know where to refer people.",
      source: "who-pfa-2011"
    },
    {
      id: "mhpss-layers",
      kind: "healing",
      name: "Layers of support for mental health and wellbeing",
      plain: "Healing happens in layers: safety and basic services for everyone, community and family support for many, and specialised care for some.",
      when: "When planning how a bridge can support wellbeing as well as land, water or food.",
      steps: [
        "Basic services and security, delivered in ways that protect dignity.",
        "Community and family supports, such as group activities and restored routines.",
        "Focused, non-specialised supports from trained workers.",
        "Specialised services, with referral routes that work."
      ],
      care: "Most people recover with good community support. Don’t label people, and don’t start clinical work without qualified staff.",
      source: "iasc-mhpss-2007"
    },
    {
      id: "fpic",
      kind: "rights",
      name: "Free, prior and informed consent",
      plain: "People decide for themselves, with full information and no pressure, whether a project goes ahead on their land, and they can say no.",
      when: "Before any activity that affects land, territories or resources that Indigenous Peoples or local communities use, and as good practice everywhere.",
      steps: [
        "Identify the rights-holders and the representatives they choose.",
        "Map land and resource use together, through participatory mapping.",
        "Share information in local languages and formats, and discuss it over time.",
        "Reach consent through the community’s own process, and agree a complaints mechanism.",
        "Monitor the agreement together and record lessons with the community."
      ],
      care: "Consent is not a signature. It can be given in stages, given with conditions, or withdrawn.",
      source: "fao-fpic-2016"
    },
    {
      id: "tenure-first",
      kind: "rights",
      name: "Land and tree rights first",
      plain: "Make sure the people who restore land keep the benefits, and that no one loses land or access because of the project.",
      when: "Before planting, building water systems or changing how land is used.",
      steps: [
        "Recognise all legitimate tenure, including customary, informal and communal rights and women’s use rights.",
        "Consult everyone whose rights may be affected before decisions are made.",
        "Agree in writing who benefits from regrown trees, crops and water.",
        "Provide a fair route to resolve disputes."
      ],
      care: "Restoration can raise land values and attract land grabs. Watch for this from the start.",
      source: "fao-vggt"
    },
    {
      id: "safe-ground",
      kind: "safety",
      name: "Safe ground: explosive ordnance checks before land work",
      plain: "Land where fighting took place may hide mines or unexploded weapons. Find out before anyone digs, plants or drills.",
      when: "Before any digging, planting, clearing, drilling or construction in a place affected by conflict.",
      steps: [
        "Ask the national mine action authority or an accredited mine action organisation whether the area has been surveyed.",
        "Arrange explosive ordnance risk education for workers and families before work starts.",
        "Never touch, move or burn suspicious objects. Mark the place and report it.",
        "Stop work immediately if anything suspicious is found."
      ],
      care: "Restoration teams never carry out clearance themselves. Only accredited organisations do.",
      source: "imas"
    },
    {
      id: "safe-schools",
      kind: "safety",
      name: "Keep schools safe for learning",
      plain: "Schools are for children. Keep them free from military use and plan school activities so they don’t put children at risk.",
      when: "When a bridge involves schools, school meals or school gardens.",
      steps: [
        "Keep schools for learning, never for military or armed security purposes.",
        "Plan safe routes and times for children.",
        "Have a safety and safeguarding plan for every school-based activity.",
        "Report attacks on schools or their military use through appropriate channels."
      ],
      care: "Don’t publish school locations or children’s photos from conflict areas.",
      source: "ssd-2015"
    },
    {
      id: "women-lead",
      kind: "peace",
      name: "Women in decision-making",
      plain: "Women have the right to shape decisions about peace and recovery, not just to be consulted at the end.",
      when: "Throughout, from the first listening session to the governance of what is built.",
      steps: [
        "Hold separate sessions with women at times and places that are safe and convenient, with childcare.",
        "Give women decision-making roles on committees, not token seats.",
        "Check who controls the benefits: water, trees, cash, land.",
        "Partner with local women’s organisations."
      ],
      care: "Assess with women themselves whether taking part could expose them to backlash, and plan for it.",
      source: "unscr-1325"
    },
    {
      id: "youth-peace",
      kind: "peace",
      name: "Young people as peacebuilders",
      plain: "Young people are partners in building peace, with ideas, energy and a stake in the future.",
      when: "When planning roles, jobs and leadership in a bridge.",
      steps: [
        "Invite young people into planning, with real roles and real responsibility.",
        "Create paid, skilled work in restoration, such as nurseries, monitoring and water maintenance.",
        "Support youth-led organisations.",
        "Make reintegration and livelihoods open to young people affected by conflict."
      ],
      care: "Don’t treat young people as a security threat, and don’t use them as unpaid labour.",
      source: "unscr-2250"
    },
    {
      id: "accountability",
      kind: "accountability",
      name: "Accountability to the people you serve",
      plain: "People affected by a project should be able to give feedback, complain safely, and see that it changes things.",
      when: "From the start, before anything is delivered.",
      steps: [
        "Ask people how they want to receive information and give feedback.",
        "Set up safe, confidential complaint channels, including for children and for sexual exploitation and abuse.",
        "Respond to every complaint and show what changed.",
        "Share information about the project, its budget and its limits in local languages."
      ],
      care: "Complaints about staff misconduct need a protected route that bypasses the staff involved.",
      source: "chs-2024"
    },
    {
      id: "restore-well",
      kind: "regenerative",
      name: "Restore with people, not for them",
      plain: "Good restoration is planned and led with local people, uses every kind of knowledge, and is cared for long after the project ends.",
      when: "When designing any land, water or ecosystem work.",
      steps: [
        "Bring in inclusive, participatory decision-making from the very start.",
        "Combine local, Indigenous and scientific knowledge.",
        "Fit the work to the local ecology, culture and economy, and to the wider landscape.",
        "Monitor and adapt during and after the project."
      ],
      care: "Planting numbers are not success. Survival, fairness and local ownership are.",
      source: "un-decade-principles-2021"
    },
    {
      id: "positive-peace",
      kind: "peace",
      name: "Positive peace lens",
      plain: "Peace is more than the absence of violence. It is built by fair institutions, shared resources and trust.",
      when: "When asking what lasting difference a bridge could make.",
      steps: [
        "Use the eight pillars as a checklist: which could this bridge strengthen?",
        "Ask which pillars it could weaken, for example through corruption in purchasing.",
        "Choose one or two local signs of change to track over time."
      ],
      care: "National peace indices are not designed to judge a single project.",
      source: "iep-positive-peace"
    }
  ],

  /* ------------------------------------------------------------------
     READINESS CHECK (planner)
     critical: true means a "No" answer pauses the plan.
     practice: links to the practice that helps answer the question.
     ------------------------------------------------------------------ */
  readiness: [
    {
      id: "consent",
      label: "Consent and voice",
      questions: [
        { id: "c1", critical: true, practice: "fpic", text: "Has the community, through representatives it chose itself, asked for or agreed to this idea?" },
        { id: "c2", critical: true, practice: "fpic", text: "Can people say no, or withdraw later, without losing any aid or services?" },
        { id: "c3", critical: false, practice: "women-lead", text: "Have women, young people, displaced families and other often-excluded groups been heard in ways that are safe for them?" }
      ]
    },
    {
      id: "safety",
      label: "Safety and do no harm",
      questions: [
        { id: "s1", critical: true, practice: "safe-ground", text: "Has a mine action authority or accredited organisation confirmed the land is safe to work, or that it was never contaminated?" },
        { id: "s2", critical: true, practice: "do-no-harm", text: "Have you checked that no money, food, water or control will reach armed actors?" },
        { id: "s3", critical: false, practice: "do-no-harm", text: "Have you mapped what divides and what connects people here, and how this project could affect both?" },
        { id: "s4", critical: false, practice: "accountability", text: "Is there a safe, confidential way for anyone, including children, to raise a complaint?" }
      ]
    },
    {
      id: "rights",
      label: "Land, water and rights",
      questions: [
        { id: "r1", critical: true, practice: "tenure-first", text: "Are land, tree and water rights clear enough that the people doing the work will keep the benefits?" },
        { id: "r2", critical: false, practice: "fpic", text: "If Indigenous Peoples are affected, has a free, prior and informed consent process started on their terms?" },
        { id: "r3", critical: false, practice: "tenure-first", text: "Do herders, farmers and other users of the same land or water agree on access and routes?" }
      ]
    },
    {
      id: "ecology",
      label: "Ecological fit",
      questions: [
        { id: "e1", critical: false, practice: "restore-well", text: "Has someone with local knowledge confirmed that rainfall, soil and water can support this?" },
        { id: "e2", critical: false, practice: "restore-well", text: "Will you use native or locally proven species and avoid invasive ones?" },
        { id: "e3", critical: false, practice: "restore-well", text: "Is there a water budget showing the project won’t drain wells or springs that others rely on?" }
      ]
    },
    {
      id: "ownership",
      label: "Local ownership and upkeep",
      questions: [
        { id: "o1", critical: false, practice: "restore-well", text: "Is there a local group, not only an outside organisation, that will run and maintain this?" },
        { id: "o2", critical: false, practice: "restore-well", text: "Are spare parts, skills and money for upkeep planned for at least three years?" },
        { id: "o3", critical: false, practice: "restore-well", text: "Could this start small and grow only if it works?" }
      ]
    },
    {
      id: "measuring",
      label: "Measuring and sharing back",
      questions: [
        { id: "m1", critical: false, practice: "accountability", text: "Has the community described what success looks like, in its own words?" },
        { id: "m2", critical: false, practice: "accountability", text: "Will you take a starting measurement (a baseline) before work begins?" },
        { id: "m3", critical: false, practice: "accountability", text: "Will results be shared back with the community in a usable form, without exposing anyone’s identity or exact location?" }
      ]
    }
  ],

  /* Groups for "Who is in the room?" — groups, never individuals. */
  stakeholders: [
    { id: "women", label: "Women" },
    { id: "children", label: "Girls and boys (through child-safe methods, with caregivers’ consent)" },
    { id: "youth", label: "Young people" },
    { id: "elders", label: "Older people" },
    { id: "disability", label: "People with disabilities" },
    { id: "displaced", label: "Displaced families" },
    { id: "host", label: "Host community" },
    { id: "farmers", label: "Farmers" },
    { id: "herders", label: "Herders and pastoralists" },
    { id: "indigenous", label: "Indigenous Peoples (where present)" },
    { id: "minorities", label: "Language, religious or ethnic minorities" },
    { id: "authorities", label: "Local authorities" },
    { id: "leaders", label: "Traditional and faith leaders" },
    { id: "local-orgs", label: "Local organisations, including women’s groups" }
  ],

  /* Plain-language glossary. Keep definitions short and jargon-free. */
  glossary: [
    { term: "Agroforestry", def: "Growing trees together with crops or livestock on the same land, so each helps the other." },
    { term: "Baseline", def: "A measurement taken before work starts, so you can see later what changed." },
    { term: "Bridge (in this tool)", def: "A proposal to adapt something that worked in one place for a community elsewhere that asks for it. It stays a proposal until it has been tested there." },
    { term: "Conflict sensitivity", def: "Understanding the conflict around you and making sure your work reduces tension rather than adding to it." },
    { term: "Connectors and dividers", def: "Connectors bring people together, like shared markets or values. Dividers pull them apart, like unfair access or old grievances." },
    { term: "Do No Harm", def: "A method for checking how help can accidentally fuel conflict, and for changing course so it builds peace instead." },
    { term: "Elite capture", def: "When a few powerful people take control of a project’s benefits meant for everyone." },
    { term: "Evidence strength", def: "How much weight you can put on a source’s main claims. This tool uses A (strong) to D (untested here)." },
    { term: "Explosive ordnance", def: "Mines, unexploded bombs, shells and other explosive remnants of war that can stay dangerous for decades." },
    { term: "Explosive ordnance risk education", def: "Teaching people how to recognise, avoid and report explosive hazards." },
    { term: "FMNR", def: "Farmer-managed natural regeneration: helping trees regrow from living stumps, roots and seeds already in the soil." },
    { term: "FPIC", def: "Free, prior and informed consent: people’s right to decide, without pressure and with full information, whether a project affecting their land goes ahead." },
    { term: "Grievance mechanism", def: "A safe way for people to raise complaints and get a response." },
    { term: "Home-grown school feeding", def: "School meals made with food bought from local farmers." },
    { term: "International humanitarian law", def: "The rules of war that protect civilians, people no longer fighting, and the natural environment." },
    { term: "Land tenure", def: "The rules, written or customary, about who can use land, for how long and under what conditions." },
    { term: "Location minimisation", def: "Recording places only as precisely as you truly need, so data can’t be used to find or target people." },
    { term: "MHPSS", def: "Mental health and psychosocial support: any support that protects or improves people’s wellbeing and mental health." },
    { term: "MRV", def: "Monitoring, reporting and verification: measuring results, sharing them and checking they are true." },
    { term: "Pastoralism", def: "Raising livestock on open land, often moving herds with the seasons to find water and grazing." },
    { term: "Positive peace", def: "The attitudes, institutions and structures that create and sustain peaceful societies." },
    { term: "Psychological first aid", def: "Humane, practical support for people in distress: look, listen and link them to help." },
    { term: "Remote sensing", def: "Measuring changes on the ground, such as tree cover, from satellite or aerial images." },
    { term: "Safeguarding", def: "Everything an organisation does to keep children and adults safe from harm, abuse and exploitation by its staff and activities." },
    { term: "Shock-responsive social protection", def: "Support systems, such as cash transfers, designed to scale up quickly when a crisis hits." },
    { term: "Transhumance", def: "The seasonal movement of herders and livestock between grazing areas." },
    { term: "Value chain", def: "All the steps a product goes through, from farm to buyer." },
    { term: "Water budget", def: "An estimate of how much water an area receives and how much can be used without running out." }
  ]
};
