/* =====================================================================
   Regenerative Peace Bridges — data.js (content registry, schema 3)
   ---------------------------------------------------------------------
   Everything the app displays as content lives in this one file, so
   people who don't write code can update it safely. Interface words
   (buttons, labels) live in app.js and the language packs in lang/.

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
     RPB.kit           the community meeting kit (session guide, consent
                       script, picture cards, voting cards, poster)

   TRANSLATING CONTENT
   Content is translated only by language packs marked "reviewed" by a
   community or organisation. Download a template from the Language
   menu; each piece of content has a path such as "bridges.water.plain".

   HOW TO ADD A SOURCE
   1. Copy an existing entry in RPB.documents and give it a new unique id.
   2. Fill every field. `grade` is only for studies, reviews, evaluations,
      case studies and listening studies; leave it as null for guidance,
      standards, law and situation reports.
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
    version: "3.11.0",
    linksChecked: "2026-10-21",
    schema: 3
  },

  /* Topic ids are used in documents[].topics. Labels are what people see. */
  topics: [
    {id:"diplomacy",label:"Restoration Diplomacy"},
    { id: "digital", label: "Digital Peace Infrastructure" },
    { id: "governance", label: "Regenerative Governance" },
    { id: "peace", label: "Peace and conflict sensitivity" },
    { id: "climate", label: "Climate and environment" },
    { id: "land", label: "Land, farming and food" },
    { id: "water", label: "Water" },
    { id: "energy", label: "Energy" },
    { id: "children", label: "Children and education" },
    { id: "healing", label: "Healing and wellbeing" },
    { id: "livelihoods", label: "Livelihoods and cash" },
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
    listening:  { label: "Listening study", role: "evidence" },
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
  "id": "unesco-water-cooperation-2024",
  "short": "Transboundary water cooperation",
  "title": "The role of transboundary cooperation",
  "org": "UNESCO / UN World Water Development Report",
  "date": "2024",
  "url": "https://www.unesco.org/reports/wwdr/en/2024/transboundary-cooperation",
  "summary": "Discusses shared-water cooperation, inclusive institutions and examples of collaboration across jurisdictions.",
  "key": "Examine shared benefits, representation and arrangements for resolving disagreements.",
  "limits": "Report overview and examples, not proof that a proposed local watershed collaboration will reduce conflict.",
  "type": "guidance",
  "grade": null,
  "topics": [
    "diplomacy",
    "peace",
    "governance"
  ],
  "checked": "2026-10-25"
},
{
  "id": "unccd-peace-forest",
  "short": "Peace Forest Initiative",
  "title": "Peace Forest Initiative",
  "org": "UNCCD",
  "date": "",
  "url": "https://www.unccd.int/our-work/flagship-initiatives/peace-forest-initiative",
  "summary": "Introduces an initiative connecting transboundary ecosystem restoration with cooperation and confidence building.",
  "key": "Consider ecosystem restoration alongside relationships, governance and shared benefits.",
  "limits": "Programme description, not an independent evaluation or authorization for cross-border activity.",
  "type": "guidance",
  "grade": null,
  "topics": [
    "diplomacy",
    "peace",
    "governance"
  ],
  "checked": "2026-10-25"
},
{
  "id": "fao-community-seed-banks-2014",
  "short": "FAO community seed banks",
  "title": "Community seed banks: Junior Farmer Field and Life School – Facilitator’s guide",
  "org": "FAO",
  "date": "2014",
  "url": "https://www.fao.org/fileadmin/user_upload/fao_ilo/pdf/Other_docs/FAO/Community_Seed_Banks.pdf",
  "summary": "Facilitator guidance on seed diversity, local knowledge and community seed-bank management, including seed fairs.",
  "key": "Start with locally preferred diversity and community stewardship of seed.",
  "limits": "Practical learning guidance; it does not establish peace effects or permission to transfer seed across borders.",
  "type": "guidance",
  "grade": null,
  "topics": [
    "diplomacy",
    "peace",
    "governance"
  ],
  "checked": "2026-10-25"
},
{
  "id": "kolibri-offline",
  "short": "Kolibri offline learning",
  "title": "About Kolibri",
  "org": "Learning Equality",
  "date": "",
  "url": "https://learningequality.org/kolibri/about-kolibri/",
  "summary": "Describes an offline-first learning platform with locally distributed educational resources and educator support.",
  "key": "Review content, languages, hardware and facilitator needs before a pilot.",
  "limits": "Product description, not independent evidence of improved learning or peace outcomes.",
  "type": "guidance",
  "grade": null,
  "topics": [
    "digital",
    "governance",
    "rights"
  ],
  "checked": "2026-10-24"
},
{
  "id": "unesco-documentary-heritage",
  "short": "UNESCO documentary heritage",
  "title": "World’s documentary heritage: an asset for all, a responsibility for all",
  "org": "UNESCO",
  "date": "2016-06-20",
  "url": "https://www.unesco.org/en/articles/worlds-documentary-heritage-asset-all-responsibility-all",
  "summary": "Introduces the 2015 recommendation on preserving and providing access to documentary heritage, including digital material.",
  "key": "Plan long-term preservation and appropriate access together.",
  "limits": "Overview of a recommendation; not a technical backup specification or permission to publish community knowledge.",
  "type": "guidance",
  "grade": null,
  "topics": [
    "digital",
    "governance",
    "rights"
  ],
  "checked": "2026-10-24"
},
{
  "id": "gida-care",
  "short": "CARE Indigenous data governance",
  "title": "CARE Principles for Indigenous Data Governance",
  "org": "Global Indigenous Data Alliance",
  "date": "",
  "url": "https://www.gida-global.org/careprinciples",
  "summary": "People- and purpose-oriented principles addressing Indigenous Peoples’ rights and interests in data and knowledge.",
  "key": "Let relevant knowledge holders determine control, benefit and appropriate reuse.",
  "limits": "An Indigenous data governance framework, not a universal consent form or proof of local authorization.",
  "type": "guidance",
  "grade": null,
  "topics": [
    "digital",
    "governance",
    "rights"
  ],
  "checked": "2026-10-24"
},
{
  "id": "isoc-community-networks",
  "short": "Community network toolkit",
  "title": "Community Network Do-It-Yourself Toolkit",
  "org": "Internet Society",
  "date": "",
  "url": "https://www.internetsociety.org/resources/community-network-diy-toolkit/",
  "summary": "Planning resources for community networks, covering services, governance, technology, regulation and financial sustainability.",
  "key": "Agree the service and maintenance model before selecting equipment.",
  "limits": "General planning guidance; does not guarantee coverage, secure messaging, Internet access or emergency availability.",
  "type": "guidance",
  "grade": null,
  "topics": [
    "digital",
    "governance",
    "rights"
  ],
  "checked": "2026-10-24"
},
{
  "id": "oecd-participation-2022",
  "short": "OECD citizen participation guidelines",
  "title": "OECD Guidelines for Citizen Participation Processes",
  "org": "OECD",
  "date": "2022-09",
  "type": "guidance",
  "grade": null,
  "topics": [
    "governance",
    "measure",
    "rights"
  ],
  "summary": "Practical guidance on designing and evaluating participation, including participatory budgeting, open meetings and representative deliberation. It emphasizes clear influence over decisions, accessible participation, feedback and evaluation.",
  "key": "Use an explicit decision mandate and explain how community input affected the outcome.",
  "limits": "Guidance, not an evaluation proving that this proposed bridge will improve peace or project survival in a particular community.",
  "url": "https://www.oecd.org/en/publications/2022/09/oecd-guidelines-for-citizen-participation-processes_63b34541.html",
  "checked": "2026-10-24"
},
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
      topics: ["children", "safety", "livelihoods"],
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
      topics: ["land", "livelihoods"],
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
    },

    /* ---- Added in version 3 ---- */
    {
      id: "who-pm-plus-2018",
      short: "Problem Management Plus (WHO)",
      title: "Problem Management Plus (PM+): Individual Psychological Help for Adults Impaired by Distress in Communities Exposed to Adversity",
      org: "World Health Organization",
      date: "2018",
      type: "guidance",
      grade: null,
      topics: ["healing"],
      summary: "A scalable psychological programme for adults whose daily lives are affected by distress, adapted from cognitive behavioural therapy so it can be used where few specialists are available. It addresses depression, anxiety and stress, whatever their cause.",
      limits: "A manual for trained and supervised helpers. It does not replace specialised care for severe conditions.",
      url: "https://www.who.int/publications/i/item/problem-management-plus-(-pm-)-individual-psychological-help-for-adults-impaired-by-distress-in-communities-exposed-to-adversity",
      checked: "2026-10-21"
    },
    {
      id: "rahman-2016-pmplus",
      short: "PM+ trial in Peshawar (JAMA)",
      title: "Effect of a Multicomponent Behavioral Intervention in Adults Impaired by Psychological Distress in a Conflict-Affected Area of Pakistan: A Randomized Clinical Trial",
      org: "JAMA",
      authors: "Rahman, A.; Hamdani, S. U.; Awan, N. R.; et al.",
      date: "2016",
      type: "study",
      grade: "B",
      topics: ["healing", "peace"],
      summary: "A randomised trial with 346 adults in three primary care centres in Peshawar, Pakistan. Nine local lay health workers delivered five weekly sessions of Problem Management Plus. At three months, anxiety and depression were lower than with enhanced usual care.",
      key: "WHO reports that depression fell from 94% to 27% in the PM+ group, against 90% to 59% in the comparison group.",
      limits: "One trial in one region, with three months of follow-up. Results depend on training, supervision and local adaptation.",
      url: "https://www.gov.uk/research-for-development-outputs/effect-of-a-multicomponent-behavioral-intervention-in-adults-impaired-by-psychological-distress-in-a-conflict-affected-area-of-pakistan",
      doi: "10.1001/jama.2016.17165",
      checked: "2026-10-21"
    },
    {
      id: "tol-2020-shplus",
      short: "Self-Help Plus trial in Uganda (Lancet)",
      title: "Guided Self-Help to Reduce Psychological Distress in South Sudanese Female Refugees in Uganda: A Cluster Randomised Trial",
      org: "The Lancet Global Health",
      authors: "Tol, W. A.; Leku, M. R.; et al.",
      date: "2020-02",
      type: "study",
      grade: "B",
      topics: ["healing"],
      summary: "A cluster randomised trial with 694 South Sudanese refugee women in 14 villages in northern Uganda. Self-Help Plus, a facilitator-guided group course, led to stronger improvements in psychological distress three months later than enhanced usual care.",
      key: "The effect was modest (a standardised difference of 0.26). 613 women (88%) completed all assessments.",
      limits: "Women only, in one setting, with short follow-up and a small to moderate effect.",
      url: "https://www.gov.uk/research-for-development-outputs/guided-self-help-to-reduce-psychological-distress-in-south-sudanese-female-refugees-in-uganda",
      doi: "10.1016/S2214-109X(19)30504-2",
      checked: "2026-10-21"
    },
    {
      id: "who-dwm-2020",
      short: "Doing What Matters (WHO)",
      title: "Doing What Matters in Times of Stress: An Illustrated Guide",
      org: "World Health Organization",
      date: "2020-04-29",
      type: "guidance",
      grade: null,
      topics: ["healing"],
      summary: "An illustrated stress-management guide with self-help techniques that take a few minutes a day, for anyone experiencing stress. It can be used alone or with audio exercises and is available in about 50 languages.",
      limits: "Self-help for stress. People with severe distress need further support.",
      url: "https://www.who.int/publications/i/item/9789240003927",
      checked: "2026-10-21"
    },
    {
      id: "bastagli-2019-cash",
      short: "Cash transfers evidence review",
      title: "The Impact of Cash Transfers: A Review of the Evidence from Low- and Middle-Income Countries",
      org: "Journal of Social Policy",
      authors: "Bastagli, F.; Hagen-Zanker, J.; Harman, L.; Barca, V.; Sturge, G.; Schmidt, T.",
      date: "2019-07",
      type: "review",
      grade: "A",
      topics: ["livelihoods", "children"],
      summary: "Reviews 165 studies (2000–2015) of cash transfers that recipients do not pay into, across six areas: monetary poverty, education, health and nutrition, savings and production, work, and empowerment. Most studies found that cash transfers contributed to progress, with limited evidence of unintended effects such as people working less.",
      limits: "The strength of evidence varies by outcome, and the review predates many programmes in conflict settings.",
      url: "https://www.cambridge.org/core/journals/journal-of-social-policy/article/abs/impact-of-cash-transfers-a-review-of-the-evidence-from-low-and-middleincome-countries/F8273371A30A504CBDCAFA32BF6F2EAD",
      doi: "10.1017/S0047279418000715",
      checked: "2026-10-21"
    },
    {
      id: "sendzimir-2011",
      short: "Regreening in Niger (Ecology and Society)",
      title: "Rebuilding Resilience in the Sahel: Regreening in the Maradi and Zinder Regions of Niger",
      org: "Ecology and Society",
      authors: "Sendzimir, J.; Reij, C. P.; Magnuszewski, P.",
      date: "2011-09",
      type: "study",
      grade: "C",
      topics: ["land", "climate"],
      summary: "A systems analysis of regreening across more than 5 million hectares in the Maradi and Zinder regions over two decades. It finds no single cause: decline reversed when governance changed first, then livelihoods, and then the land itself.",
      limits: "An analysis of one region that explains how change happened, rather than measuring it against a comparison area.",
      url: "https://doaj.org/article/19a817e92c254e5282f5404f2ea3ade9",
      checked: "2026-10-21"
    },
    {
      id: "wocat-zai-niger",
      short: "Zaï planting pits (WOCAT)",
      title: "Zai or Tassa Planting Pits (Niger)",
      org: "WOCAT (World Overview of Conservation Approaches and Technologies)",
      date: "2012-07",
      type: "cases",
      grade: "C",
      topics: ["land", "water", "climate"],
      summary: "Field documentation of zaï pits: about 10,000 small pits per hectare, dug across the slope and filled with compost, to catch rain and nutrients and bring degraded land back into use. Plots with pits and fertiliser averaged 409 kg of millet per hectare, against 195 kg on control plots.",
      key: "Digging by hand takes 40 to 60 person-days per hectare (about 7 with an animal-drawn plough). The technique does not suit sandy soils or valley bottoms and is meant for areas with less than 800 mm of rain a year.",
      limits: "Field records and the compilers’ estimates, not a controlled trial. Heavy labour can exclude households short of workers.",
      url: "https://qcat.wocat.net/en/wocat/technologies/view/permalink/1220",
      checked: "2026-10-21"
    },
    {
      id: "gichd-undp-sdg-2017",
      short: "Mine action and the SDGs (GICHD, UNDP)",
      title: "Leaving No One Behind: Mine Action and the Sustainable Development Goals",
      org: "GICHD and UNDP",
      date: "2017-06-08",
      type: "guidance",
      grade: null,
      topics: ["safety", "land"],
      summary: "A study of how mine action supports the Sustainable Development Goals, with guidance for policymakers, mine action authorities and donors. It describes making living environments safe again as a precondition for other development work.",
      key: "It notes that the benefits of mine action do not always reach all members of society equally.",
      limits: "A policy study. It argues for the links between clearance and development rather than measuring them.",
      url: "https://www.gichd.org/publications-resources/publications/leaving-no-one-behind-mine-action-and-the-sustainable-development-goals/",
      checked: "2026-10-21"
    },
    {
      id: "landmine-monitor-2025",
      short: "Landmine Monitor 2025",
      title: "Landmine Monitor 2025",
      org: "International Campaign to Ban Landmines (summary by UN News)",
      date: "2025-12",
      type: "situation",
      grade: null,
      topics: ["safety", "children"],
      summary: "Recorded 6,279 casualties from mines and explosive remnants of war in 2024, the highest in four years. Civilians were 90% of casualties and children almost half. Anti-personnel mines contaminate at least 57 states and other areas.",
      limits: "Recorded casualties undercount the real toll. The link opens a UN News summary of the report.",
      url: "https://news.un.org/en/story/2025/12/1166476",
      checked: "2026-10-21"
    },
    {
      id: "who-energizing-health-2023",
      short: "Electricity in health facilities (WHO)",
      title: "Energizing Health: Accelerating Electricity Access in Health-Care Facilities",
      org: "WHO, World Bank, IRENA and SEforALL",
      date: "2023-01-14",
      type: "situation",
      grade: null,
      topics: ["energy", "healing"],
      summary: "Close to 1 billion people in low- and lower-middle-income countries are served by health facilities with unreliable electricity or none. In South Asia and sub-Saharan Africa more than 1 in 10 facilities have no electricity, and in sub-Saharan Africa power is unreliable for half of all facilities.",
      key: "About US$4.9 billion is urgently needed to bring facilities to a minimum standard. Decentralised solar is described as cost-effective, clean and quick to install.",
      limits: "A global assessment. The link opens WHO’s news release about the report.",
      url: "https://www.who.int/news/item/14-01-2023-close-to-one-billion-people-globally-are-served-by-health-care-facilities-with-no-electricity-access-or-with-unreliable-electricity",
      checked: "2026-10-21"
    },
    {
      id: "undp-solar-health",
      short: "Solar for Health (UNDP)",
      title: "Solar for Health",
      org: "UNDP",
      date: "2017",
      ongoing: true,
      type: "cases",
      grade: "C",
      topics: ["energy", "healing"],
      summary: "A UNDP initiative, launched in 2017, that has put solar power into some 1,000 health centres and storage facilities in 15 countries, including 405 facilities in Zimbabwe and 150 health centres in Chad, so they can keep vaccines cold, run medical devices and retire diesel generators.",
      key: "UNDP estimates the investment pays for itself within 2 to 3.5 years on average, and trains women as solar technicians.",
      limits: "Programme reporting by the implementer, not an independent evaluation.",
      url: "https://www.undp.org/energy/our-flagship-initiatives/solar-for-health",
      checked: "2026-10-21"
    },
    {
      id: "unep-iraq-marshes-2009",
      short: "Iraqi Marshlands project (UNEP)",
      title: "Support for Environmental Management of the Iraqi Marshlands 2004–2009",
      org: "UN Environment Programme",
      date: "2009",
      type: "cases",
      grade: "C",
      topics: ["water", "climate", "peace"],
      summary: "Completion report of one of the largest environmental projects under the UN Iraq Trust Fund. It monitored the marshlands, trained Iraqi decision makers, and piloted drinking water, sanitation and wetland management using environmentally sound technologies.",
      limits: "A report by the implementer. Read it alongside independent assessments of outcomes.",
      url: "https://wedocs.unep.org/20.500.11822/7823",
      checked: "2026-10-21"
    },
    {
      id: "richardson-hussain-2006",
      short: "Marshes of Iraq assessment (BioScience)",
      title: "Restoring the Garden of Eden: An Ecological Assessment of the Marshes of Iraq",
      org: "BioScience",
      authors: "Richardson, C. J.; Hussain, N. A.",
      date: "2006-06",
      type: "study",
      grade: "C",
      topics: ["water", "climate"],
      summary: "Field surveys by scientists from Duke University and the University of Basrah found that more than 40% of the drained marshes had been reflooded by September 2005, with native plants, fish, invertebrates and birds well on the way to recovery and generally good water quality.",
      key: "The authors warned that recovery depends on upstream water, reconnecting the fragmented marshes and protection from oil extraction.",
      limits: "A snapshot from 2005. Later assessments show the marshes under severe stress again (see the IUCN outlook).",
      url: "https://doi.org/10.1641/0006-3568(2006)56[477:RTGOEA]2.0.CO;2",
      doi: "10.1641/0006-3568(2006)56[477:RTGOEA]2.0.CO;2",
      checked: "2026-10-21"
    },
    {
      id: "iucn-ahwar-2025",
      short: "Ahwar of Southern Iraq outlook (IUCN)",
      title: "The Ahwar of Southern Iraq: Refuge of Biodiversity and the Relict Landscape of the Mesopotamian Cities",
      org: "IUCN World Heritage Outlook",
      date: "2025-10-11",
      type: "situation",
      grade: null,
      topics: ["water", "climate"],
      summary: "IUCN rates the conservation outlook of this World Heritage site, inscribed in 2016, as critical in its 2025 assessment, down from significant concern in 2017 and 2020. Very high threats include water scarcity (a fifth consecutive dry year), upstream dams and irrigation, drought and oil expansion.",
      limits: "A conservation assessment of one site. It does not evaluate restoration programmes.",
      url: "https://worldheritageoutlook.iucn.org/node/1193",
      checked: "2026-10-21"
    },
    {
      id: "who-hap-2025",
      short: "Household air pollution (WHO)",
      title: "Household Air Pollution",
      org: "World Health Organization",
      date: "2025-12-16",
      type: "situation",
      grade: null,
      topics: ["energy", "healing", "children"],
      summary: "About 2.1 billion people cook with open fires or inefficient stoves burning wood, dung, charcoal, coal or kerosene. Household air pollution caused an estimated 2.9 million deaths in 2021, including over 309,000 children under five. Women and children bear the greatest burden.",
      key: "Gathering fuel takes women and children considerable time, and they can face injury and violence while collecting it in insecure areas.",
      limits: "A global fact sheet. Local fuels, habits and risks vary.",
      url: "https://www.who.int/news-room/fact-sheets/detail/household-air-pollution-and-health",
      checked: "2026-10-21"
    },
    {
      id: "wrc-safe-2014",
      short: "Safe Access to Fuel and Energy (WRC)",
      title: "SAFE: Safe Access to Fuel and Energy",
      org: "Women’s Refugee Commission",
      date: "2014",
      type: "guidance",
      grade: null,
      topics: ["energy", "safety"],
      summary: "Explains why cooking fuel is a protection issue in displacement: women and girls risk rape, beatings and killings while collecting firewood, camps strip nearby land and strain relations with host communities, and families sometimes sell food to buy fuel. It sets out the SAFE approach of assessing energy needs and risks and pressing for policy change.",
      limits: "A 2014 advocacy fact sheet. Its figures date from then.",
      url: "https://interagencystandingcommittee.org/sites/default/files/migrated/2016-02/safe-fuel-and-energy-fact-sheet.pdf",
      checked: "2026-10-21"
    },
    {
      id: "wang-2021-school-feeding",
      short: "School feeding meta-analysis (J Glob Health)",
      title: "Impacts of School Feeding on Educational and Health Outcomes of School-Age Children and Adolescents in Low- and Middle-Income Countries: A Systematic Review and Meta-Analysis",
      org: "Journal of Global Health",
      authors: "Wang, D.; Shinde, S.; Young, T.; Fawzi, W. W.",
      date: "2021-09-04",
      type: "review",
      grade: "B",
      topics: ["children", "land"],
      summary: "Reviews 57 studies (44 randomised trials and 13 controlled before-and-after studies). School feeding increased the share of school days attended by 2.6%, and over 12 months raised weight by 0.58 kg and height by 0.32 cm compared with control groups.",
      limits: "Most included studies had a high risk of bias, and effects on learning and nutrition need better research.",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8442580",
      doi: "10.7189/jogh.11.04051",
      checked: "2026-10-21"
    },
    {
      id: "cda-time-to-listen-2012",
      short: "Time to Listen (CDA)",
      title: "Time to Listen: Hearing People on the Receiving End of International Aid",
      org: "CDA Collaborative Learning",
      authors: "Anderson, M. B.; Brown, D.; Jean, I.",
      date: "2012-11",
      type: "listening",
      grade: "B",
      topics: ["peace", "measure"],
      summary: "Based on conversations with nearly 6,000 people in 20 countries over five years. People generally appreciated aid but said it was not achieving its purpose: very few asked for more aid, most wanted smarter aid that builds on local capacity, and many felt too much came too fast.",
      limits: "Qualitative listening, not a measurement of programme effects.",
      url: "https://library.alnap.org/system/files/content/resource/files/main/time-to-listen-book.pdf",
      checked: "2026-10-21"
    }
  ],

  /* ------------------------------------------------------------------
     SOLUTION BRIDGES
     A bridge links something documented elsewhere (origin) to a place
     that asks for it. Every bridge is a proposal: grade "D" until a
     community has been consulted, risks checked and results measured.
     ------------------------------------------------------------------ */
  bridgeCategories: [{id:"diplomacy",label:"Restoration Diplomacy"},{id:"digital",label:"Digital Peace Infrastructure"},{id:"governance",label:"Regenerative Governance"}],
  bridges: [
{
  "category": "diplomacy",
  "evidenceNote": "An exploratory Restoration Diplomacy pathway. Ecological cooperation may support peacebuilding, but outcomes depend on power, rights, context and sustained relationships. Start at Conceptual / Proposed and assess ecological and peace outcomes separately.",
  "connectors": "Repeated, voluntary cooperation on a shared ecological concern may build reciprocal expectations and trusted institutions. Test this locally; meetings, agreements and restored hectares alone do not demonstrate reduced tension.",
  "id": "shared-watersheds",
  "short": "Shared watersheds",
  "name": "Shared watersheds: upstream and downstream cooperation",
  "plain": "Bring willing water users together to understand a shared watershed, agree small restoration tasks and review how benefits and burdens are distributed.",
  "origin": "A proposed cooperation pathway informed by the UN World Water Development Report and conflict-sensitive resource governance guidance.",
  "helps": "Upstream and downstream communities seeking fairer cooperation around erosion, water retention, water quality and seasonal access.",
  "needs": [
    "Voluntary participation from upstream and downstream users, including less powerful and seasonally absent groups.",
    "Trusted facilitation, relevant basin institutions and clarity about each participant’s authority.",
    "An agreed baseline, ecological advice and resources for maintenance and dialogue."
  ],
  "steps": [
    "Listen separately to different users before a joint discussion; record priorities and disagreements without identifying individuals.",
    "Describe the shared water problem at a broad scale and distinguish observations from contested claims.",
    "Agree a small restoration action, responsibilities, cost sharing and how downstream effects will be reviewed.",
    "Set common observation methods and seasonal comparison periods; include water access and ecological effects.",
    "Establish a complaint route, drought review trigger and a process for revising unfair arrangements.",
    "Review ecological changes and whether cooperation continued through disagreement before extending the agreement."
  ],
  "risks": [
    "Upstream interventions shift costs downstream or reduce access for other users.",
    "Dominant users control the discussion and present consultation as consent.",
    "Seasonal rainfall changes are mistaken for project effects.",
    "A technical agreement is interpreted as deciding water rights or territorial claims."
  ],
  "safeguards": [
    "Include affected users on all sides and review distribution of benefits and burdens.",
    "Do not treat this plan as authority to allocate water rights or change existing agreements.",
    "Compare seasons and document uncertainty; seek appropriate hydrological advice before physical works.",
    "Allow separate feedback, refusal and independent review when parties disagree."
  ],
  "firstStep": "Hold facilitated listening sessions with willing upstream and downstream groups, then agree one reversible erosion-monitoring or maintenance trial with a review date.",
  "measures": [
    "Water retention or soil cover measured with a shared method and comparable seasonal baseline.",
    "Agreed maintenance tasks completed by each participating group, with reasons for delay.",
    "Participation and meaningful influence of upstream, downstream and underrepresented users.",
    "Disputes addressed through the agreed process, distinguishing unresolved cases from mutually accepted resolution.",
    "Voluntary trust feedback and perceived fairness of water access, including dissent."
  ],
  "docs": [
    "unesco-water-cooperation-2024",
    "cda-dnh",
    "fao-vggt",
    "chs-2024"
  ]
},
{
  "category": "diplomacy",
  "evidenceNote": "An exploratory Restoration Diplomacy pathway. Ecological cooperation may support peacebuilding, but outcomes depend on power, rights, context and sustained relationships. Start at Conceptual / Proposed and assess ecological and peace outcomes separately.",
  "connectors": "Repeated, voluntary cooperation on a shared ecological concern may build reciprocal expectations and trusted institutions. Test this locally; meetings, agreements and restored hectares alone do not demonstrate reduced tension.",
  "id": "shared-seed-systems",
  "short": "Shared seed systems",
  "name": "Shared seed systems: reciprocal learning and diversity",
  "plain": "Connect willing seed stewards across communities to exchange learning, support locally adapted diversity and negotiate fair arrangements for any permitted seed sharing.",
  "origin": "A proposed intercommunity cooperation pathway informed by FAO community seed-bank guidance and community-controlled knowledge principles.",
  "helps": "Communities who want reciprocal support for seed diversity while respecting local preferences, seed health and knowledge-holder authority.",
  "needs": [
    "Seed stewards and growers who choose to participate, including women and youth with meaningful decision roles.",
    "Local agronomic support, seed-quality checks and clear rules for access, benefit sharing and knowledge reuse.",
    "Confirmation of applicable requirements before any seed movement, especially across borders."
  ],
  "steps": [
    "Compare seed needs and local growing conditions without assuming that varieties suitable in one place suit another.",
    "Begin with knowledge exchange and agree what information and material may be shared.",
    "Have qualified partners review seed health, suitability and applicable movement requirements before an exchange.",
    "Trial small permitted quantities with voluntary growers and retain diverse local options.",
    "Agree fair access, storage, replenishment and responses to crop failure without coercive repayment.",
    "Review germination, access, reciprocal support and disagreements with all participating groups."
  ],
  "risks": [
    "Seed movement spreads pests or introduces unsuitable material.",
    "Exchange rules override farmers’ preferences or knowledge-holder rights.",
    "A failed harvest creates debt, blame or obligations that deepen tension.",
    "Benefits concentrate with established seed traders or powerful stewards."
  ],
  "safeguards": [
    "Start with learning exchange; move material only after appropriate technical and regulatory checks.",
    "Respect local diversity, farmers’ choices and permission for knowledge reuse.",
    "Use transparent, voluntary arrangements with agreed crop-failure provisions.",
    "Assess who gains access and who bears storage, transport and care costs."
  ],
  "firstStep": "Convene a voluntary exchange of seed-stewardship knowledge; agree a small, technically reviewed trial only if all relevant permissions and safeguards are satisfied.",
  "measures": [
    "Locally preferred varieties accessible to participating growers, with gaps recorded.",
    "Germination and survival for each trial cohort, with conditions and failures reported.",
    "Fair access and decision influence of women, youth and less-resourced growers.",
    "Reciprocal learning or support commitments completed and maintained across seasons.",
    "Disagreements about access or obligations resolved by mutual agreement, alongside voluntary trust feedback."
  ],
  "docs": [
    "fao-community-seed-banks-2014",
    "gida-care",
    "fao-fpic-2016",
    "cda-dnh"
  ]
},
{
  "category": "diplomacy",
  "evidenceNote": "An exploratory Restoration Diplomacy pathway. Ecological cooperation may support peacebuilding, but outcomes depend on power, rights, context and sustained relationships. Start at Conceptual / Proposed and assess ecological and peace outcomes separately.",
  "connectors": "Repeated, voluntary cooperation on a shared ecological concern may build reciprocal expectations and trusted institutions. Test this locally; meetings, agreements and restored hectares alone do not demonstrate reduced tension.",
  "id": "cross-border-restoration",
  "short": "Cross-border restoration",
  "name": "Cross-border restoration: cooperating across shared landscapes",
  "plain": "Help willing communities and authorized institutions coordinate restoration across an ecological landscape while respecting jurisdiction, tenure and different local priorities.",
  "origin": "An exploratory pathway informed by UNCCD’s Peace Forest Initiative and ecosystem restoration principles.",
  "helps": "Communities and institutions seeking complementary restoration efforts across administrative or national boundaries.",
  "needs": [
    "Community mandates and authorized institutional partners on each side, with agreed limits to their roles.",
    "Tenure and access review, appropriate ecological expertise and a conflict-sensitive feasibility assessment.",
    "A shared maintenance and benefit-sharing plan that can continue despite funding or leadership changes."
  ],
  "steps": [
    "Clarify mandates, community priorities and unresolved tenure concerns before defining a joint activity.",
    "Agree complementary ecological objectives and document where priorities differ.",
    "Choose a modest pilot with appropriate permissions; parallel activities can begin without crossing a border.",
    "Agree responsibilities, costs, maintenance and an accessible process for concerns.",
    "Use comparable monitoring while keeping sensitive locations and personal records out of shared reports.",
    "Review ecological outcomes, benefit distribution and continuity of dialogue; pause or adapt if activities increase tension."
  ],
  "risks": [
    "Restoration is used to assert territorial or tenure claims.",
    "Access restrictions exclude customary users or displace livelihoods.",
    "Visible collaboration exposes participants to retaliation or political pressure.",
    "Different resources or funding cycles create unequal obligations and abandoned maintenance."
  ],
  "safeguards": [
    "Do not imply recognition of boundaries or settle territorial claims through a project plan.",
    "Confirm local consent, land rights and necessary permissions with appropriate partners.",
    "Use broad-area summaries and allow safe separate or remote participation.",
    "Agree pause criteria, independent review and funded maintenance before scaling."
  ],
  "firstStep": "With willing communities and authorized partners, compare existing non-sensitive restoration priorities and design two small complementary pilots with shared review criteria.",
  "measures": [
    "Trees surviving, soil cover or biodiversity observations using agreed cohort and sampling methods.",
    "Maintenance commitments completed on each side and outstanding resource gaps.",
    "Distribution of benefits and access restrictions reported by different user groups.",
    "Joint projects sustained through a review cycle, not merely announced.",
    "Continuity of dialogue during disagreement, voluntary trust indicators and unresolved concerns."
  ],
  "docs": [
    "unccd-peace-forest",
    "un-decade-principles-2021",
    "fao-vggt",
    "fao-fpic-2016",
    "cda-dnh"
  ]
},
{
  "category": "diplomacy",
  "evidenceNote": "An exploratory Restoration Diplomacy pathway. Ecological cooperation may support peacebuilding, but outcomes depend on power, rights, context and sustained relationships. Start at Conceptual / Proposed and assess ecological and peace outcomes separately.",
  "connectors": "Repeated, voluntary cooperation on a shared ecological concern may build reciprocal expectations and trusted institutions. Test this locally; meetings, agreements and restored hectares alone do not demonstrate reduced tension.",
  "id": "joint-monitoring",
  "short": "Joint monitoring",
  "name": "Joint monitoring: shared observation and accountable interpretation",
  "plain": "Create a jointly agreed way to observe ecological change, compare interpretations and use findings for shared decisions without turning monitoring into surveillance.",
  "origin": "A proposed cooperation workflow informed by restoration principles, accountability and environmental peacebuilding guidance.",
  "helps": "Groups who share ecological concerns but lack trusted observations or disagree about what existing measurements mean.",
  "needs": [
    "An agreed question, representative monitoring roles and voluntary participation.",
    "Comparable methods, calibrated tools where needed and a budget for training and repeat observations.",
    "Data permissions, review responsibilities and a safe route to contest interpretations."
  ],
  "steps": [
    "Choose one ecological question and agree what decisions the observations could inform.",
    "Define a baseline, units, sampling effort, observation dates and how missing data will be recorded.",
    "Train observers from participating groups and compare measurements on a non-sensitive trial sample.",
    "Record uncertainty and disagreements; retain an audit trail when correcting data.",
    "Interpret results together and allow separate accounts when agreement is not reached.",
    "Share only approved summaries and review whether findings changed decisions or strengthened cooperation."
  ],
  "risks": [
    "Different sampling effort produces misleading comparisons and accusations.",
    "Monitoring identifies vulnerable people, sensitive sites or resource users.",
    "One partner controls instruments, interpretation or publication.",
    "Jointly signed data is mistaken for proof of peace or universal agreement."
  ],
  "safeguards": [
    "Agree methods in advance and report missing data, calibration limits and alternative explanations.",
    "Collect only necessary ecological data; omit precise sensitive locations and personal identifiers.",
    "Give all partners a meaningful review role and preserve contested interpretations.",
    "Separate ecological findings from claims about trust or reduced conflict; allow withdrawal from participation."
  ],
  "firstStep": "Agree one non-sensitive indicator, compare observations from two voluntary teams, and discuss measurement differences before publishing any joint conclusion.",
  "measures": [
    "Observations meeting the agreed method divided by observations attempted, including missing samples.",
    "Differences between observers and the proportion examined through joint review.",
    "Corrections documented and contested interpretations retained.",
    "Shared decisions that explicitly used findings, with reasons and follow-up dates.",
    "Connector institutions’ review and response capacity, alongside voluntary accounts of trust and fairness."
  ],
  "docs": [
    "un-decade-principles-2021",
    "unep-c2p-2009",
    "chs-2024",
    "cda-dnh"
  ]
},
{
  "category": "digital",
  "evidenceNote": "A proposed Digital Peace Infrastructure pathway, not a locally tested intervention. Guidance supports design choices but does not establish peace impacts. Begin at Conceptual / Proposed; record local observations and review before changing maturity.",
  "connectors": "Shared access and community stewardship may create opportunities for cooperation across groups. Check who benefits, who is excluded and whether trust changes; usage alone is not evidence of reduced tension.",
  "id": "offline-education",
  "short": "Offline education hubs",
  "name": "Offline education hubs: learning through connection gaps",
  "plain": "Create a locally maintained learning hub with useful lessons available without a continuing Internet connection, supported by educators and accessible non-digital alternatives.",
  "origin": "A proposed community learning pathway informed by Learning Equality’s Kolibri approach and existing accountability guidance.",
  "helps": "Learners and educators who request dependable access to learning material where connectivity is costly or intermittent.",
  "needs": [
    "Community and educator agreement on learning priorities, languages and suitable content rights.",
    "Maintainable devices, local storage, safe power and a budget for repair and replacement.",
    "Facilitators with time to support learners; accessible materials and fair device-sharing arrangements."
  ],
  "steps": [
    "Agree learning goals with educators, caregivers and learners using age-appropriate participation.",
    "Review a small, licensed content collection for language, accessibility, relevance and accuracy.",
    "Prepare the local hub and test lessons with the Internet disconnected; document which functions still need a connection.",
    "Trial a fair access schedule with supported sessions and printed or spoken alternatives.",
    "Train at least two maintenance roles, test backup recovery and schedule content reviews.",
    "Review learning progress and exclusion with participants before extending the hub."
  ],
  "risks": [
    "Devices or charging costs exclude the people the hub is intended to serve.",
    "Inappropriate or outdated material displaces local teaching priorities.",
    "Learner records expose children or become a basis for ranking groups.",
    "Hardware breaks after initial funding ends; educators inherit unpaid maintenance work."
  ],
  "safeguards": [
    "Use inclusive scheduling and accessible formats; never make device ownership a condition of learning.",
    "Keep identifiable learner records out of this planner and shared exports.",
    "Obtain appropriate content permissions and community review before distribution.",
    "Maintain a repair budget, supported educators and a non-digital fallback; never assume an offline platform includes all content."
  ],
  "firstStep": "Trial one locally chosen lesson with a small voluntary group, disconnect the Internet, and review usability, learning support and access barriers before buying more equipment.",
  "measures": [
    "Sessions successfully completed offline divided by sessions attempted, with period and failure reasons.",
    "Voluntary participation rate using an agreed eligible population and recording access barriers.",
    "Aggregate learning-goal completion against a baseline; do not equate screen time with learning.",
    "School attendance where appropriate, using school-open days and comparable periods.",
    "Repair downtime, maintenance costs and number of supported local maintenance roles."
  ],
  "docs": [
    "kolibri-offline",
    "chs-2024",
    "cda-dnh"
  ]
},
{
  "category": "digital",
  "evidenceNote": "A proposed Digital Peace Infrastructure pathway, not a locally tested intervention. Guidance supports design choices but does not establish peace impacts. Begin at Conceptual / Proposed; record local observations and review before changing maturity.",
  "connectors": "Shared access and community stewardship may create opportunities for cooperation across groups. Check who benefits, who is excluded and whether trust changes; usage alone is not evidence of reduced tension.",
  "id": "community-archives",
  "short": "Community archives",
  "name": "Community archives: preserving shared memory with consent",
  "plain": "Build a community-governed archive of restoration histories, practices and shared learning, with clear rules about what may be kept, who may access it and what may be shared.",
  "origin": "A proposed archival pathway informed by UNESCO documentary heritage guidance and, where relevant, Indigenous data governance principles.",
  "helps": "Communities wishing to preserve memory across generations and steward material that they choose to retain.",
  "needs": [
    "A community-selected stewardship group and consent process respecting knowledge-holder authority.",
    "A minimal catalogue, accessible formats, suitable storage and tested backup arrangements.",
    "Agreed access, retention, correction, withdrawal and succession rules before collection begins."
  ],
  "steps": [
    "Agree the archive purpose and identify material that must remain unrecorded or restricted.",
    "Trial a small collection with permission for recording, storage, access and reuse treated as separate decisions.",
    "Catalogue broad context, language, provenance, permissions and review dates without sensitive identifying details.",
    "Maintain at least two appropriately protected copies on separate media and test restoration.",
    "Offer accessible listening or reading sessions and invite corrections without forcing disclosure.",
    "Review access and retention with knowledge holders and hand over stewardship through a documented process."
  ],
  "risks": [
    "Public preservation exposes sacred knowledge, private experiences or contested histories.",
    "Copies circulate beyond agreed audiences and cannot reliably be recalled.",
    "A single custodian, device or proprietary format becomes a point of failure.",
    "One group’s account is presented as the only legitimate community history."
  ],
  "safeguards": [
    "Allow refusal and non-recording; public benefit does not override knowledge-holder permissions.",
    "Separate public descriptions from restricted source material; this planner is not a secure archive repository.",
    "Preserve differing accounts with context and uncertainty; provide correction and withdrawal routes.",
    "Test readable recovery and format migration; explain limits on withdrawing already distributed copies."
  ],
  "firstStep": "Co-design a catalogue for three non-sensitive, voluntarily offered items; agree access and retention, then restore a test copy before collecting further material.",
  "measures": [
    "Items with explicit access and reuse permission divided by items retained.",
    "Successful restore checks and time needed to recover a usable copy.",
    "Requested corrections or withdrawals addressed by the agreed review date.",
    "Languages and accessible formats available, with gaps identified by participants.",
    "Voluntary accounts of whether stewardship represents different groups fairly."
  ],
  "docs": [
    "unesco-documentary-heritage",
    "gida-care",
    "cda-time-to-listen-2012"
  ]
},
{
  "category": "digital",
  "evidenceNote": "A proposed Digital Peace Infrastructure pathway, not a locally tested intervention. Guidance supports design choices but does not establish peace impacts. Begin at Conceptual / Proposed; record local observations and review before changing maturity.",
  "connectors": "Shared access and community stewardship may create opportunities for cooperation across groups. Check who benefits, who is excluded and whether trust changes; usage alone is not evidence of reduced tension.",
  "id": "local-knowledge",
  "short": "Local knowledge systems",
  "name": "Local knowledge systems: community evidence in its own context",
  "plain": "Maintain a community-reviewed collection of observations, lessons and unexpected outcomes in local languages, preserving context and the authority of people who share knowledge.",
  "origin": "A proposed learning pathway informed by community listening and the CARE Principles where Indigenous knowledge and data are involved.",
  "helps": "Restoration groups and communities who want local experience to inform decisions without losing control of their knowledge.",
  "needs": [
    "Knowledge holders who choose whether and how to participate; recognition of relevant collective authority.",
    "Facilitators or interpreters, accessible formats and a process for disagreement and corrections.",
    "Local custodians, review dates and permission rules for exchange with other communities."
  ],
  "steps": [
    "Agree a practical learning question and what knowledge should not be recorded.",
    "Capture observations, lessons and unexpected outcomes with broad context, period, method and limitations.",
    "Return accounts to contributors in their preferred language and record differing interpretations.",
    "Link learning to relevant bridge, impact indicator and proposed system relationship without automatically claiming causation.",
    "Share only approved summaries through existing knowledge exchange; retain provenance and revise permissions after changes.",
    "Review what changed in practice and whether contributors benefited; withdraw or correct material when needed."
  ],
  "risks": [
    "Translation removes local meaning or implies agreement that was never given.",
    "Knowledge is extracted for outsiders’ benefit without reciprocal value.",
    "A vivid account is mistaken for replicated evidence or universal best practice.",
    "Restricted knowledge is copied into public exports or loses its provenance."
  ],
  "safeguards": [
    "Respect individual and collective authority and Indigenous data governance where applicable.",
    "Record uncertainty and dissent; examples are prompts, not findings.",
    "Keep sharing local by default and review permission for every revised account.",
    "Return useful findings to contributors and preserve context rather than ranking communities."
  ],
  "firstStep": "Invite a voluntary group to review one non-sensitive restoration observation in its own language, record uncertainty and decide whether it should remain local.",
  "measures": [
    "Accounts returned to contributors for review divided by accounts recorded.",
    "Approved summaries with context, method and limitations recorded.",
    "Corrections incorporated and disagreements retained without identifying individuals.",
    "Community decisions informed by learning, with an explanation of how it was used.",
    "Voluntary trust and perceived-benefit feedback, including missing perspectives."
  ],
  "docs": [
    "gida-care",
    "cda-time-to-listen-2012",
    "chs-2024"
  ]
},
{
  "category": "digital",
  "evidenceNote": "A proposed Digital Peace Infrastructure pathway, not a locally tested intervention. Guidance supports design choices but does not establish peace impacts. Begin at Conceptual / Proposed; record local observations and review before changing maturity.",
  "connectors": "Shared access and community stewardship may create opportunities for cooperation across groups. Check who benefits, who is excluded and whether trust changes; usage alone is not evidence of reduced tension.",
  "id": "mesh-communication",
  "short": "Mesh communication",
  "name": "Mesh communication: locally governed connection pathways",
  "plain": "Explore a maintainable local communication network that can connect community services across nearby nodes, with realistic coverage, power, privacy and operating expectations.",
  "origin": "A proposed local networking pathway informed by Internet Society’s community-network planning toolkit. Mesh is one possible topology, not a universal solution.",
  "helps": "Communities that request local communication or access to shared learning resources during unreliable connectivity.",
  "needs": [
    "A community mandate and a qualified local technical partner to assess suitability and applicable requirements.",
    "A clear service scope: local resource access, messaging or Internet connection are different capabilities.",
    "Lifecycle funding for power, repairs, updates and trained operators, with agreed ownership and access rules."
  ],
  "steps": [
    "Agree the intended service and compare mesh with simpler local networking or non-digital options.",
    "Have a qualified partner assess feasibility, applicable radio requirements and permissions before installation.",
    "Choose equipment for maintainability and test a small authorized pilot with non-sensitive traffic.",
    "Test power loss, node failure and Internet disconnection; record actual service limits.",
    "Review privacy, authentication, software updates and safe operator handover; do not assume mesh means encryption.",
    "Practise fallback communication and review costs, exclusion and reliability before expanding."
  ],
  "risks": [
    "Terrain, interference or node failure prevents reliable coverage.",
    "Power and replacement costs exceed the community’s maintenance capacity.",
    "Traffic or device identifiers expose users; connectivity is mistaken for secure communication.",
    "Dependence on a pilot creates false confidence during emergencies."
  ],
  "safeguards": [
    "Use qualified installation and current local requirements; do not publish node locations or security configurations in shared plans.",
    "State tested limits and distinguish local reach from Internet connectivity.",
    "Minimize traffic logging and review security before any sensitive use.",
    "Keep established fallback channels and avoid promises of emergency availability."
  ],
  "firstStep": "With qualified support, test one agreed non-sensitive local service on a small authorized network; document failure conditions and who will maintain it before expansion.",
  "measures": [
    "Successful test messages or resource requests divided by attempts during a defined test period.",
    "Service availability during planned tests, with power and node failures recorded.",
    "Recovery time and unresolved maintenance tasks after a simulated outage.",
    "Operating and replacement costs compared with committed funds.",
    "Access barriers and voluntary user feedback; avoid identifying traffic logs."
  ],
  "docs": [
    "isoc-community-networks",
    "chs-2024",
    "cda-dnh"
  ]
},
{
  "category": "digital",
  "evidenceNote": "A proposed Digital Peace Infrastructure pathway, not a locally tested intervention. Guidance supports design choices but does not establish peace impacts. Begin at Conceptual / Proposed; record local observations and review before changing maturity.",
  "connectors": "Shared access and community stewardship may create opportunities for cooperation across groups. Check who benefits, who is excluded and whether trust changes; usage alone is not evidence of reduced tension.",
  "id": "resilience-portals",
  "short": "Resilience information portals",
  "name": "Resilience information portals: trusted information through disruption",
  "plain": "Organize locally relevant restoration and service information in an accessible portal with offline copies, clear source dates, correction routes and a plan for outdated information.",
  "origin": "A proposed information-stewardship workflow informed by community accountability and listening guidance, alongside community-network planning resources.",
  "helps": "Communities seeking a dependable place to find agreed public information when connectivity and service availability change.",
  "needs": [
    "Trusted editorial roles and a source-verification and correction process.",
    "A deliberately limited public information scope, local languages and accessible offline formats.",
    "Update responsibilities, review dates, distribution channels and a fallback when information cannot be verified."
  ],
  "steps": [
    "Ask residents which non-sensitive information is useful and which channels they can actually access.",
    "Agree sources, editorial responsibilities and how conflicting or unverified information is handled.",
    "Publish concise entries with source, last-verified date, review or expiry date and an accessible correction route.",
    "Test offline copies and clearly label their age; remove or flag expired information instead of presenting it as current.",
    "Provide print or spoken alternatives and a procedure for circulating corrections across copies.",
    "Review usefulness, missing audiences and update workload with residents before adding more content."
  ],
  "risks": [
    "An old offline copy is mistaken for current service or hazard information.",
    "Rumours or unverified claims acquire authority through the portal.",
    "A portal excludes people who cannot read its language or use its devices.",
    "Publishing personal contacts or sensitive locations exposes people; maintainers become overloaded."
  ],
  "safeguards": [
    "Use verified public information and clearly separate uncertainty from confirmed updates.",
    "Show dates and expiry prominently; direct time-critical questions to established local channels.",
    "Publish no private contacts, precise sensitive locations or individual case records.",
    "Maintain accessible alternatives and named collective editorial roles with succession and correction responsibilities."
  ],
  "firstStep": "Trial a small page of non-sensitive information, ask residents to find and understand it offline, and practise correcting an expired item across all trial copies.",
  "measures": [
    "Published entries reviewed within their agreed interval divided by entries due for review.",
    "Time from verified correction to replacement of distributed copies where reachable.",
    "Successful information-finding tasks in each offered language or format.",
    "Voluntary reports of service access barriers before and after the pilot, with other explanations recorded.",
    "Outdated entries found in spot checks and unresolved information gaps."
  ],
  "docs": [
    "chs-2024",
    "cda-time-to-listen-2012",
    "isoc-community-networks"
  ]
},
{
  "id": "regenerative-governance",
  "category": "governance",
  "short": "Regenerative Governance",
  "name": "Regenerative Governance: shared decisions and accountable stewardship",
  "plain": "Agree how people make decisions, allocate shared resources, oversee ecological care and challenge unfair choices, so projects can survive leadership changes and disputes.",
  "origin": "A proposed local combination of participatory budgeting, community assemblies, stewardship councils and transparent decision-making. OECD participation guidance and existing restoration, accountability and conflict-sensitivity sources inform the design; this combined bridge has not been tested locally.",
  "helps": "Communities planning or maintaining shared water, food, restoration or other projects, especially where unclear authority, exclusion, disputed budgets or unaccountable leadership threaten continuity.",
  "needs": [
    "A voluntary community mandate defining which decisions are genuinely open, who holds resources, and who can pause or revise the process.",
    "An affected-groups map, including women, young people, displaced people, customary users and people who cannot attend meetings; participation must be accessible and safe.",
    "Agreement with existing legitimate institutions about the scope of the process, without treating a new council as a substitute for rights or an elected authority.",
    "A realistic resource envelope and maintenance commitment; no consultation about funds or choices that participants cannot actually influence.",
    "A trusted complaint and appeal route outside the immediate decision-makers, with confidential options and no retaliation."
  ],
  "steps": [
    "Participatory budgeting: agree a small, real allocation, eligibility rules and public assessment criteria; invite proposals and cost maintenance before choosing priorities.",
    "Community assemblies: share options in accessible local formats, allow small-group and non-meeting input, record disagreement and agree quorum and decision rules before deliberation.",
    "Stewardship councils: choose accountable representatives by a community-agreed process; define duties, term lengths, rotation, removal, succession and a review date.",
    "Transparent decision-making: record the options, criteria, reasons, declared interests, recusals, responsible collective role and review date; explain proposals not selected.",
    "Separate proposal selection, spending approval and expenditure checking where feasible; reconcile planned and actual costs in the existing budget and share an aggregate account.",
    "Use the consent log for conditions and concerns, the risk register for exclusion or retaliation, and the timeline for budget reviews, council rotation and maintenance handover.",
    "Hold a return meeting to examine participation, decisions implemented, unresolved concerns and ecological consequences; revise rules when the process excludes people.",
    "Pause contested or coercive decisions, protect confidential feedback, and seek an agreed independent review before continuing."
  ],
  "risks": [
    "Elite capture: established leaders or funders control proposals, information or representative selection.",
    "Token participation: assemblies are held after decisions have already been made, or participants lack real authority.",
    "Majority decisions override minority access, tenure or other rights; attendance is mistaken for consent.",
    "Opaque procurement, undeclared conflicts of interest or maintenance money diverted from its agreed purpose.",
    "Meeting fatigue, unpaid work and inaccessible formats disproportionately burden women, youth or people with disabilities.",
    "A stewardship council becomes permanent, cannot be removed, or competes with existing institutions.",
    "Public records expose complainants or create retaliation risks; a low complaint count is mistaken for trust."
  ],
  "safeguards": [
    "Publish the scope of authority and available resources before inviting proposals; distinguish decisions from advice and feedback.",
    "Provide multiple accessible participation routes and meaningful decision power; do not equate a seat or attendance with influence.",
    "Agree representation, quorum, recusal, term limits, recall and succession rules before appointing a council.",
    "Publish aggregate budgets and decision reasons in formats people can use, while withholding personal complaints and sensitive identities.",
    "Protect dissent and refusal; keep an independent appeal route and review unresolved concerns without compulsory disclosure.",
    "Do not treat a vote or this planning tool as legal authorization, proof of consent, or authority to alter land rights."
  ],
  "firstStep": "With community agreement, trial one reversible maintenance decision using a small disclosed resource envelope. Record the options, participation barriers, chosen criteria, rationale and review date; evaluate the process before expanding its mandate.",
  "measures": [
    "Participation rate: participants divided by the locally agreed eligible population, with accessible non-meeting contributions counted consistently.",
    "Women and youth in roles with actual decision authority, alongside their own accounts of whether they influenced outcomes.",
    "Share of the agreed budget decided through the process, and planned versus actual expenditure with explanations for variance.",
    "Proportion of decisions with accessible reasons and a recorded response to objections; time taken to report back.",
    "Stewardship actions completed by their agreed review date and maintenance obligations still unfunded.",
    "Community trust indicators gathered voluntarily, with limitations and missing perspectives reported.",
    "Concerns raised, response time and outcomes; distinguish unresolved concerns from resolved disputes and never interpret fewer complaints alone as success."
  ],
  "connectors": "Shared responsibility for resources and transparent reasons may support cooperation across groups. Test that proposition locally; a council, meeting or budget vote is not evidence of peace by itself.",
  "evidenceNote": "Implementation guidance and a proposed local workflow, not a causal claim that assemblies, budgeting or councils prevent project failure. Start at Conceptual / Proposed and update maturity only after a documented local review.",
  "docs": [
    "oecd-participation-2022",
    "un-decade-principles-2021",
    "chs-2024",
    "cda-dnh",
    "fao-vggt",
    "cda-time-to-listen-2012"
  ]
},
    {
      id: "regeneration",
      short: "Natural regeneration",
      name: "Farmer-managed natural regeneration for land and livelihood recovery",
      plain: "Help trees regrow from living stumps and roots already in farmers’ fields, so tired land recovers at low cost and families gain shade, fodder, firewood and better harvests.",
      origin: "Farmer-led regreening in Niger, where an estimated 200 million trees regrew across about 5 million hectares of farmland, spreading from farmer to farmer over two decades. An analysis of the Maradi and Zinder regions found that the turnaround began with changes in governance, then livelihoods, and only then the land.",
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
      docs: ["fmnr-niger-2025", "sendzimir-2011", "conag-review-2025", "wri-mrv-2026", "fao-vggt", "un-decade-principles-2021", "imas", "undp-cps-2026"]
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
      origin: "School meal programmes that now reach at least 466 million children worldwide, many of them linked to local food purchasing. A review of 57 studies found modest gains in attendance and growth, though most studies had a high risk of bias.",
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
      docs: ["wfp-school-feeding-2024", "wang-2021-school-feeding", "ssd-2015", "unicef-srsp-2026", "grfc-2026", "sphere-2018"]
    },
    {
      id: "healing",
      short: "Healing landscapes",
      name: "Healing landscapes: psychosocial support woven into restoration work",
      plain: "Combine community restoration work, like tree nurseries, gardens and water care, with basic psychosocial support, so people can recover together while repairing their surroundings.",
      origin: "The IASC’s layered model of mental health and psychosocial support, which treats community and family supports as a core layer; WHO’s psychological first aid; and WHO’s scalable programmes, Problem Management Plus and Self-Help Plus, which trained and supervised non-specialists delivered in trials in Pakistan and Uganda.",
      helps: "Communities that want shared, practical activities, where trained people can offer basic support and referrals.",
      evidenceNote: "Trials show that structured help delivered by trained, supervised non-specialists can reduce distress (PM+ in Pakistan, Self-Help Plus in Uganda). Combining that help with restoration work has not been tested. Treat the combination as an idea to test carefully.",
      needs: [
        "Facilitators trained in psychological first aid.",
        "If you offer a structured programme such as PM+ or Self-Help Plus: helpers trained in it, regular supervision, and materials adapted to the local language and culture.",
        "A referral list for specialised mental health care that actually works.",
        "Voluntary participation, with no pressure to share experiences.",
        "Separate groups where needed (women, men, youth), and child-friendly spaces run by trained staff."
      ],
      steps: [
        "Start a community nursery or garden group that meets regularly.",
        "Train group facilitators in psychological first aid: look, listen, link.",
        "Agree group rules on confidentiality and respect.",
        "Link each group to health and protection services for referrals.",
        "Where distress is affecting daily life, offer PM+ or Self-Help Plus through trained, supervised helpers, always as a free choice."
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
      docs: ["iasc-mhpss-2007", "who-pfa-2011", "who-pm-plus-2018", "rahman-2016-pmplus", "tol-2020-shplus", "who-dwm-2020", "un-decade-principles-2021", "chs-2024"]
    },
    {
      id: "cash",
      short: "Cash for restoration",
      name: "Shock-responsive cash for community-chosen restoration",
      plain: "Pay fair wages, through trusted social protection systems, for restoration work the community chooses, so families can buy food while land and water systems recover.",
      origin: "UNICEF’s 2026 guidance on shock-responsive social protection; a review of 165 studies in which most found that cash transfers contributed to progress on poverty, schooling and health; and climate–peace programme experience reviewed by UNDP.",
      helps: "Households facing hunger or lost income where cash can be delivered safely and local markets still work.",
      evidenceNote: "Cash transfers in general have strong evidence. Paying for community-chosen restoration work in conflict settings has much less, so measure carefully.",
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
      docs: ["unicef-srsp-2026", "bastagli-2019-cash", "undp-cps-2026", "chs-2024", "imas", "grfc-2026"]
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
    },

    /* ---- Added in version 3 ---- */
    {
      id: "clinic-power",
      short: "Solar for clinics",
      name: "Solar power for clinics and maternity care",
      plain: "Give health centres reliable solar power, so they can keep vaccines cold, light night-time births and run basic equipment, with local people trained to look after it.",
      origin: "WHO and partners found that close to 1 billion people are served by health facilities with unreliable electricity or none. UNDP’s Solar for Health has installed solar power in some 1,000 health centres and storage facilities in 15 countries.",
      helps: "Health centres and maternity units with no power or frequent outages, where the health authority and the community ask for support and trained staff are in place.",
      evidenceNote: "The need is well documented. Evidence on health results after clinics switch to solar comes mostly from programme reporting, not independent evaluations.",
      needs: [
        "An energy check with health staff: which equipment needs power, when, and for how long.",
        "Agreement with the health authority on who owns the system, who maintains it and who pays for new batteries.",
        "Trained local technicians, including women, with spare parts and a maintenance fund for at least five years.",
        "Secure installation that does not make the clinic a target for theft."
      ],
      steps: [
        "Start with the essentials: the vaccine refrigerator, lights for night-time births, and a few sockets for basic devices.",
        "Install and train together, so staff and local technicians understand the system.",
        "Keep a simple log of faults, repairs and battery health.",
        "Add equipment only once the system has worked reliably for a full season."
      ],
      risks: [
        "Systems failing within a few years for lack of maintenance or batteries, leaving clinics worse off than before.",
        "Panels or batteries stolen, or armed actors trying to take control of the power supply.",
        "Power diverted from health care to other uses.",
        "Old batteries dumped where they pollute land and water."
      ],
      safeguards: [
        "Budget for maintenance and battery replacement from the start, with the health authority.",
        "Keep the clinic open to everyone, whichever group they belong to.",
        "Don’t publish exact clinic locations in conflict areas.",
        "Plan safe recycling of batteries and panels before installing them."
      ],
      firstStep: "Power the vaccine refrigerator and maternity lighting at one clinic, with trained local technicians, and track hours of power and repairs for six months before expanding.",
      measures: [
        "Hours per day with power, and outages per month",
        "Days the vaccine refrigerator stays within its safe temperature range",
        "Night-time births attended with good light",
        "Repairs done by local technicians, and time taken to repair",
        "Diesel use avoided"
      ],
      connectors: "A clinic serves everyone. Reliable care is something all groups share and can protect together.",
      docs: ["who-energizing-health-2023", "undp-solar-health", "sphere-2018", "chs-2024", "cda-dnh"]
    },
    {
      id: "zai",
      short: "Zaï pits",
      name: "Zaï pits and water harvesting to bring dry land back into use",
      plain: "Dig small planting pits filled with compost to catch rain and nutrients, so crops and trees can grow again on hard, degraded dryland fields.",
      origin: "A traditional technique from the Sahel. Field records from Niger, compiled by WOCAT, show plots with pits and fertiliser yielding about 409 kg of millet per hectare, against 195 kg on control plots.",
      helps: "Hard, degraded dryland fields with less than about 800 mm of rain a year, where households want to farm again and can share the heavy work.",
      evidenceNote: "The yield figures come from field records, not controlled trials, and depend on rainfall, compost and labour.",
      needs: [
        "Soils that suit pits (not sandy soils or valley bottoms), checked with local farmers.",
        "Enough compost or manure, which may mean agreements with herders.",
        "Clear rights, so the people who dig and improve the land keep the benefits.",
        "Confirmation from a mine action authority that the land is safe to dig, wherever fighting took place."
      ],
      steps: [
        "Farmer-to-farmer visits to see working pits.",
        "Volunteer households try pits on a small part of their own fields before the rains.",
        "Organise shared work groups, so households short of workers are not left out.",
        "Compare harvests from pit plots and nearby fields together after each season."
      ],
      risks: [
        "Heavy digging (40 to 60 person-days per hectare by hand) excluding households short of workers, or falling unfairly on women and children.",
        "Improved land attracting claims from more powerful people.",
        "Competition with herders for manure and crop residues.",
        "Injuries from explosive remnants of war when land is dug."
      ],
      safeguards: [
        "Pay fairly or share the work, and never use child labour.",
        "Agree in writing who keeps the land and the harvests before work begins.",
        "Include herders in agreements on manure and crop residues.",
        "Run explosive ordnance checks and risk education before any digging."
      ],
      firstStep: "Demonstrate pits on a small area of volunteers’ land, with shared tools and work, and compare harvests with neighbouring plots after one season.",
      measures: [
        "Area brought back into use",
        "Crop yields on pit plots and comparison plots",
        "Who did the work: hours by women, men and young people",
        "Land disputes raised and resolved"
      ],
      connectors: "Shared work groups, and exchanges of manure for crop residues between farmers and herders.",
      docs: ["wocat-zai-niger", "sendzimir-2011", "fmnr-niger-2025", "conag-review-2025", "imas", "fao-vggt"]
    },
    {
      id: "land-release",
      short: "Safe land release",
      name: "Safe land release so families can farm again",
      plain: "Work with accredited mine action organisations to confirm which land is safe, so families can return to their fields, with farming support ready when land is handed back.",
      origin: "The International Mine Action Standards, and GICHD and UNDP analysis that describes safe land as a precondition for development. A global study found that conflict-affected areas lost 23.7% more cropland than comparable areas, with losses lasting for years.",
      helps: "Communities whose farmland, grazing or water points can’t be used because of suspected explosive hazards, and who ask for help to return to them.",
      evidenceNote: "The links between land release and recovery come mostly from analysis and case studies. Measure who actually uses released land.",
      needs: [
        "A national mine action authority or accredited organisation leading all survey and clearance.",
        "Community knowledge of where accidents happened, shared only with mine action teams.",
        "Agreement on land rights before release, so land returns to the people who used it.",
        "Farming support (seed, tools, water) planned to start as land is released."
      ],
      steps: [
        "Ask the mine action authority what survey has been done and what is planned.",
        "Arrange risk education for families, especially children and people who collect firewood or water.",
        "Agree with the community which land matters most for food and water.",
        "Link released land to seed, tools and farming support."
      ],
      risks: [
        "Released land taken by more powerful people instead of returning to its users.",
        "People going back onto land before it has been surveyed.",
        "Benefits not reaching everyone equally, as GICHD and UNDP warn.",
        "Expecting quick results: survey and clearance can take a long time."
      ],
      safeguards: [
        "Only accredited organisations survey and clear land. Restoration teams never do.",
        "Agree land rights and priorities with the community before release.",
        "Track who benefits from released land, by gender and group.",
        "Keep risk education going after land is released."
      ],
      firstStep: "Ask the mine action authority about survey plans for land the community has prioritised, and run risk education, before any farming support starts.",
      measures: [
        "Area released for use, as reported by the mine action authority",
        "Released land actually farmed or grazed within a year",
        "Who uses released land, by gender and group",
        "Explosive ordnance accidents (the target is none)"
      ],
      connectors: "Safety from explosive hazards is a need everyone shares. Planning land use together can bring groups to the same table.",
      docs: ["imas", "gichd-undp-sdg-2017", "landmine-monitor-2025", "nature-food-2026", "conag-review-2025", "fao-vggt"]
    },
    {
      id: "wetlands",
      short: "Wetland restoration",
      name: "Restoring wetlands and marshes for water, food and shared livelihoods",
      plain: "Help drained or damaged wetlands recover where water can be secured, so fish, reeds, grazing and clean water return for the people who depend on them.",
      origin: "The Mesopotamian Marshes of Iraq, where more than 40% of the drained marshes were reflooded by 2005 and native species began to return, followed by UNEP-supported monitoring and pilot water and sanitation projects.",
      helps: "Communities that depend on wetlands for fishing, reeds, grazing or water, and ask for help to restore them, where enough water can be secured.",
      evidenceNote: "The marshes began to recover quickly once water returned, but IUCN’s 2025 outlook rates them as critical because water is scarce again. Secure water first.",
      needs: [
        "A water budget showing that enough water can reach the wetland in dry years, agreed with upstream users.",
        "Agreement among fishers, herders, farmers and other users on access and rules.",
        "Water-quality testing before people drink the water or eat the fish.",
        "Confirmation from a mine action authority that the area is safe, wherever fighting took place."
      ],
      steps: [
        "Map, with users, who depends on the wetland and how. Keep the map with the community.",
        "Agree access rules and seasons with fishers, herders and farmers.",
        "Start with small reconnections or water-holding works where water is secured.",
        "Monitor water levels, water quality and returning species with local people."
      ],
      risks: [
        "Restoration failing because upstream dams, drought or irrigation take the water.",
        "Disputes between upstream and downstream users, or between user groups.",
        "Pollution from oil, waste or sewage harming health.",
        "Some users, such as women or displaced families, losing access."
      ],
      safeguards: [
        "Secure water first: make no restoration promises without a realistic water budget.",
        "Run a Do No Harm analysis of who could gain power by controlling water flows.",
        "Share benefits fairly among user groups, with a dispute route they trust.",
        "Test water and share the results in simple terms."
      ],
      firstStep: "Agree a water budget and user rules for one small area, then restore it and monitor water, fish and plants with local users for a full year before expanding.",
      measures: [
        "Area holding water through the dry season",
        "Water-quality test results",
        "Fish catches and reed or fodder harvests reported by users",
        "Disputes between user groups raised and resolved"
      ],
      connectors: "A wetland feeds many groups at once. Shared rules can turn competition into cooperation.",
      docs: ["richardson-hussain-2006", "unep-iraq-marshes-2009", "iucn-ahwar-2025", "un-decade-principles-2021", "icrc-environment-2020", "cda-dnh"]
    },
    {
      id: "clean-cooking",
      short: "Safer cooking",
      name: "Safer cooking fuel and stoves for displaced families",
      plain: "Provide stoves and fuel chosen with the families who use them, so fewer people breathe smoke, fewer risky trips are made to collect firewood, and less pressure falls on nearby trees.",
      origin: "WHO’s evidence on household air pollution, and the Women’s Refugee Commission’s work on safe access to fuel and energy in displacement.",
      helps: "Displaced and host families who cook on open fires, where collecting firewood is risky or is straining relations with neighbours.",
      evidenceNote: "The harm smoke does to health is well established. Evidence that stoves alone make fuel collection safer is limited, so plan protection separately.",
      needs: [
        "Conversations with women and girls, held separately and safely, about cooking, fuel and the risks of collecting it.",
        "Stoves and fuels that suit local food and that local markets can supply.",
        "A fuel supply that can last, such as briquettes, local woodlots or gas, planned with host communities.",
        "A way to check that stoves are used, and what families spend on fuel."
      ],
      steps: [
        "Ask families how they cook, what they burn and what worries them.",
        "Test a few stove and fuel options with families before choosing.",
        "Plant community woodlots or buy fuel from host communities, so they benefit too.",
        "Train local people to make, sell or repair stoves."
      ],
      risks: [
        "Stoves that don’t suit local cooking going unused.",
        "Families selling food or rations to buy fuel.",
        "Tension with host communities over trees and firewood.",
        "Claims that stoves alone prevent violence, which they cannot."
      ],
      safeguards: [
        "Plan safe access to fuel with protection staff. Never rely on stoves alone to reduce violence.",
        "Involve host communities so they benefit from the fuel supply.",
        "Choose cleaner fuels where possible, because many wood stoves still produce harmful smoke.",
        "Keep information about anyone harmed while collecting fuel confidential, and refer only with consent."
      ],
      firstStep: "Hold listening sessions with women and girls, test two or three stove and fuel options with a few volunteer households, and track use, smoke and fuel costs for three months.",
      measures: [
        "Households still using the stove after six months",
        "Time spent collecting fuel, by women, men, girls and boys",
        "Money or rations spent on fuel",
        "Protection incidents linked to fuel collection (the target is none)",
        "Smoke in the home, as families report it"
      ],
      connectors: "Buying fuel from host communities and planting shared woodlots gives both groups a stake.",
      docs: ["who-hap-2025", "wrc-safe-2014", "sphere-2018", "cda-dnh"]
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
    },

    /* ---- Added in version 3 ---- */
    {
      id: "listen-first",
      kind: "accountability",
      name: "Listen first, and keep listening",
      plain: "Before planning anything, ask people what they need and how they want to be involved. People often ask for smarter help, not more help.",
      when: "Before any bridge is proposed, and at regular points throughout.",
      steps: [
        "Hold open conversations without a ready-made project to sell.",
        "Ask how people want help delivered, how fast, and who should decide.",
        "Record what you heard in people’s own words, without names.",
        "Report back what you heard and what you will change, and say plainly what you can’t do."
      ],
      care: "Listening raises expectations. Be honest about limits, and never collect stories you won’t use or can’t protect.",
      source: "cda-time-to-listen-2012"
    },
    {
      id: "scalable-help",
      kind: "healing",
      name: "Scalable psychological help: PM+ and Self-Help Plus",
      plain: "Short, structured WHO programmes that trained non-specialists can deliver, helping adults manage stress, practical problems and low mood.",
      when: "When distress is affecting many people’s daily lives and few specialists are available.",
      steps: [
        "Adapt the materials to the local language and culture, with local people.",
        "Train helpers, and give them regular supervision.",
        "Offer PM+ one to one or Self-Help Plus in groups, always as a free choice.",
        "Refer anyone who needs specialised care, including anyone at risk of harm, through a referral route that works."
      ],
      care: "These programmes need training, supervision and working referrals. They are not treatment for severe conditions, and taking part must never be a condition for receiving aid.",
      source: "who-pm-plus-2018"
    },
    {
      id: "safe-fuel",
      kind: "safety",
      name: "Safe access to fuel and energy",
      plain: "Collecting firewood can expose women and girls to violence. Plan fuel, stoves and energy with them, so cooking puts no one at risk.",
      when: "Wherever displaced or host families depend on collecting firewood.",
      steps: [
        "Ask women and girls, safely and separately, about fuel needs and risks.",
        "Reduce the need for trips: efficient stoves, cleaner fuels, fuel distributions or local purchase.",
        "Agree safer arrangements with the community, such as going in groups at safer times.",
        "Work with host communities on woodlots and shared rules for using trees."
      ],
      care: "Never assume a stove solves a protection problem. Keep survivors’ information confidential, and refer only with their consent.",
      source: "wrc-safe-2014"
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
    { id: "fishers", label: "Fishers and wetland users" },
    { id: "health-workers", label: "Health workers" },
    { id: "indigenous", label: "Indigenous Peoples (where present)" },
    { id: "minorities", label: "Language, religious or ethnic minorities" },
    { id: "authorities", label: "Local authorities" },
    { id: "leaders", label: "Traditional and faith leaders" },
    { id: "local-orgs", label: "Local organisations, including women’s groups" }
  ],

  /* Plain-language glossary. Keep definitions short and jargon-free.
     The app sorts terms alphabetically for display, so order here
     doesn't matter. */
  glossary: [
{"term":"Participatory budgeting","def":"A process in which people affected by a project help decide how an agreed portion of its resources will be used. The scope, eligibility and decision rules should be clear before proposals are invited."},
{"term":"Community assembly","def":"An accessible forum for affected people to discuss choices, hear different views and make or advise decisions under agreed rules. Attendance alone is not consent."},
{"term":"Stewardship council","def":"A community-mandated group responsible for ongoing care of shared resources, with defined duties, review dates, accountability and a way to replace its members."},
{"term":"Decision record","def":"A short account of the options considered, reasons for a choice, responsible role and review date. It should communicate decisions without exposing confidential complaints or personal identities."},
    { term: "Clean cooking", def: "Cooking with fuels and stoves that produce little harmful smoke, such as electricity, gas, biogas or solar." },
    { term: "Consent log", def: "A record of when a group agreed, agreed with conditions, paused or said no, and when to check again. It records groups, never named individuals." },
    { term: "Contingency", def: "Money set aside in a budget for things that go wrong or cost more than expected." },
    { term: "Land release", def: "The process, run by mine action organisations, of confirming through survey or clearance that land is safe and handing it back for use." },
    { term: "Problem Management Plus (PM+)", def: "A WHO programme of five sessions in which trained non-specialists help adults manage stress and practical problems." },
    { term: "Risk register", def: "A list of what could go wrong, how likely and how serious each risk is, who watches it and what will reduce it." },
    { term: "Self-Help Plus", def: "A WHO group course for managing stress, using recorded audio and an illustrated guide, led by trained facilitators." },
    { term: "Zaï pits", def: "Small planting pits filled with compost that catch rain and nutrients on hard, dry soils." },
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
  ],

  /* ------------------------------------------------------------------
     COMMUNITY MEETING KIT
     A printable kit for a listening session where not everyone reads,
     writes or speaks the same language. The pictures for the cards are
     drawn in app.js (look for KIT_ICONS); here you only edit the words.
     The consent script and the children's note are "reviewed-only":
     a language pack can translate them only when it is marked reviewed.
     ------------------------------------------------------------------ */
  kit: {
    intro: "Everything a facilitator needs to run one listening session with a community that has asked to talk: a session guide, a consent script, picture cards for people who don’t read, voting cards, and a poster that explains how to raise concerns safely. Print it, or copy the text into your own language.",
    session: {
      title: "Listening session",
      length: "About 90 minutes",
      steps: [
        {
          id: "before",
          title: "Before the day",
          minutes: 0,
          points: [
            "Agree the date, time and place with representatives the community chose itself. Pick a place everyone can reach safely, including women, older people and people with disabilities.",
            "Plan separate sessions where people may not speak freely together, for example women, young people, or displaced and host families.",
            "Bring a trained interpreter, the printed cards, something to count with (stones, beans or pens) and the complaints poster, already filled in.",
            "Know where to refer anyone who needs help before you start, and check that the referral route works.",
            "If fighting took place nearby, ask the mine action authority whether the meeting place and the way to it are safe."
          ]
        },
        {
          id: "welcome",
          title: "Welcome and consent",
          minutes: 10,
          points: [
            "Introduce yourselves and your organisation honestly, including what you can’t offer.",
            "Read the consent script aloud. Anyone may stay silent, pass or leave at any time.",
            "Agree simple ground rules together: one voice at a time, no names of other people, and respect for anyone who passes."
          ]
        },
        {
          id: "matters",
          title: "What matters most",
          minutes: 20,
          points: [
            "Lay the picture cards on the ground or a table. Explain each one aloud.",
            "Each person places three stones or marks on the cards that matter most to them. People may place them privately, one at a time.",
            "Count the marks out loud together, so everyone sees the result."
          ],
          prompts: [
            "What would make daily life easier?",
            "What already works well here that we should protect?",
            "What would you like your children to have?"
          ]
        },
        {
          id: "connects",
          title: "What divides, what connects",
          minutes: 20,
          points: [
            "Ask what brings people together here, such as markets, water points, schools or celebrations, and what causes tension.",
            "Talk about issues, not individuals. Don’t ask for, or write down, names, homes or exact locations.",
            "If the talk becomes heated or painful, hold up the Pause card, take a break and move on."
          ]
        },
        {
          id: "ideas",
          title: "Ideas and worries",
          minutes: 20,
          points: [
            "Describe one or two ideas simply, including what could go wrong and what it would ask of people.",
            "People vote with the shape cards: circle for yes, triangle for not sure, square for no. If people prefer, they can vote privately by dropping a card into a bag.",
            "A ‘no’ is respected. You may ask what would need to change, but never push."
          ]
        },
        {
          id: "closing",
          title: "Closing",
          minutes: 10,
          points: [
            "Say honestly what happens next, and when you will come back to report.",
            "Explain the ways to raise a concern, and point to the poster.",
            "Thank people, and make sure everyone can leave safely."
          ]
        },
        {
          id: "after",
          title: "After the session",
          minutes: 0,
          points: [
            "Record what groups said, never who said it. Use the planner’s consent log for the group’s decision.",
            "Don’t keep names. If any notes include names by mistake, destroy them.",
            "Report back to the community, in the way it asked for, before sharing anything with anyone else."
          ]
        }
      ]
    },
    consent: {
      title: "Consent script",
      note: "Read this aloud in the local language. Translate it with people from the community, then have someone else translate it back to check the meaning.",
      lines: [
        "Thank you for coming. We are here to listen, not to decide for you.",
        "Taking part is your choice. You can stay silent, pass, or leave at any time.",
        "Saying no, or leaving, will not change any help or services you or your family receive.",
        "We will not write down your name. We will record what the group says, not who said it.",
        "Please don’t name other people or say where anyone lives.",
        "We will come back to tell you what we heard and what happens next.",
        "You can raise any concern safely, including about us. The poster shows how."
      ],
      question: "Do you agree to continue?"
    },
    children: {
      title: "If children take part",
      points: [
        "Only facilitators trained in child protection run sessions with children.",
        "Ask caregivers for consent, and ask each child whether they want to take part. A child’s ‘no’ is respected.",
        "Meet in a safe place that others can see, with at least two trained adults present.",
        "Use play, drawing and the picture cards. Never ask children about violence or painful events.",
        "Know the child protection referral route before the session."
      ]
    },
    /* Picture cards. group "need" = things people may want;
       group "process" = cards that help run the meeting. */
    cards: [
      { id: "water", group: "need", label: "Water", hint: "Safe water for drinking, cooking, washing and farming" },
      { id: "trees", group: "need", label: "Trees", hint: "Trees for shade, fruit, fodder and firewood" },
      { id: "seeds", group: "need", label: "Seeds", hint: "Seeds to plant again" },
      { id: "farming", group: "need", label: "Farming", hint: "Fields, crops and tools" },
      { id: "herding", group: "need", label: "Animals and grazing", hint: "Grazing, water and routes for animals" },
      { id: "school", group: "need", label: "School", hint: "Safe learning for children" },
      { id: "clinic", group: "need", label: "Health care", hint: "A clinic or health worker nearby" },
      { id: "cooking", group: "need", label: "Cooking fuel", hint: "Safe fuel and stoves for cooking" },
      { id: "safe-land", group: "need", label: "Safe land", hint: "Land free from explosive hazards" },
      { id: "market", group: "need", label: "Market", hint: "A place to buy and sell" },
      { id: "jobs", group: "need", label: "Work and income", hint: "Fair paid work and income" },
      { id: "wellbeing", group: "need", label: "Wellbeing", hint: "Feeling calm, supported and connected" },
      { id: "complaint", group: "process", label: "Speak up", hint: "A safe way to raise a concern" },
      { id: "pause", group: "process", label: "Pause", hint: "Stop, or take a break" },
      { id: "measure", group: "process", label: "Check results", hint: "Measure together what changed" }
    ],
    /* Voting cards. Shapes, not colours, carry the meaning. */
    votes: {
      note: "Shapes, not colours, carry the meaning, so the cards work in black-and-white print and for people who see colours differently. The kit avoids thumbs and other hand gestures, which are rude in some cultures.",
      options: [
        { id: "yes", label: "Yes", shape: "circle" },
        { id: "unsure", label: "Not sure", shape: "triangle" },
        { id: "no", label: "No", shape: "square" }
      ]
    },
    poster: {
      title: "Something wrong? Tell us safely.",
      lead: "You can raise any worry or complaint, including about our staff.",
      fields: [
        "You can talk to:",
        "Where:",
        "When:",
        "Other ways to reach us:",
        "Concerns about our staff go to:"
      ],
      promise: "You don’t have to give your name. Raising a concern will never affect the help you receive.",
      note: "Fill in the blanks by hand after printing. Use an organisation’s contact details, never a staff member’s personal phone number."
    }
  }
};

// Lifecycle schema 1 is an additive extension of the version 3 plan schema.
// Catalogue defaults describe an unassessed local application, not source grades.
window.RPB.evolution = {
  schema: 1,
  evidence: ["Conceptual", "Emerging", "Tested", "Replicated", "Context-specific Best Practice"],
  community: ["Proposed", "Reviewed", "Adapted", "Implemented", "Locally Owned"],
  definitions: {
    "Conceptual": "A plausible idea; no local outcome assessment recorded.",
    "Emerging": "Early observations suggest potential; uncertainty remains.",
    "Tested": "A documented test has measured outcomes in the stated context.",
    "Replicated": "Documented results have been reproduced in more than one test or setting.",
    "Context-specific Best Practice": "Repeated evidence and local review support this practice within explicitly stated limits. It is not universal certification.",
    "Proposed": "An idea offered for consideration; participation is voluntary.",
    "Reviewed": "Community representatives have reviewed the proposal and concerns.",
    "Adapted": "The approach has been changed through community input for this context.",
    "Implemented": "The community has agreed to and begun implementation.",
    "Locally Owned": "Local people hold meaningful decision-making, resources and ongoing stewardship."
  }
};
for (const bridge of window.RPB.bridges) bridge.evolution = { schema: 1, evidence: "Conceptual", community: "Proposed", history: [] };
// Shared pure validation: imported data must never silently claim a higher maturity.
window.RPB_EVOLUTION = (() => {
  const spec = window.RPB.evolution;
  const initial = () => ({ schema: 1, evidence: spec.evidence[0], community: spec.community[0], history: [] });
  const validPair = x => x && spec.evidence.includes(x.evidence) && spec.community.includes(x.community);
  const clean = x => {
    const out = initial();
    if (x == null) return out;
    if (x.schema !== 1 || !validPair(x) || !Array.isArray(x.history) || x.history.length > 200) throw Error("Invalid bridge lifecycle record.");
    let last = out;
    for (const event of x.history) {
      if (!validPair(event) || !validPair(event.from) || event.from.evidence !== last.evidence || event.from.community !== last.community || typeof event.at !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(event.at) || !Number.isFinite(Date.parse(event.at)) || new Date(event.at).toISOString() !== event.at || typeof event.note !== 'string' || !event.note.trim() || event.note.length > 1000 || (last.at && event.at < last.at)) throw Error("Invalid bridge lifecycle history.");
      out.history.push({ at: event.at, from: { evidence: last.evidence, community: last.community }, evidence: event.evidence, community: event.community, note: event.note.trim() });
      last = out.history[out.history.length - 1];
    }
    if (x.evidence !== last.evidence || x.community !== last.community) throw Error("Lifecycle status does not match its history.");
    out.evidence = x.evidence; out.community = x.community;
    return out;
  };
  const record = (current, evidence, community, note, at = new Date().toISOString()) => {
    const out = clean(current);
    if (!spec.evidence.includes(evidence) || !spec.community.includes(community)) throw Error("Choose valid maturity levels.");
    if (typeof note !== 'string' || !note.trim() || note.length > 1000) throw Error("Add a rationale, context and evidence reference (up to 1,000 characters).");
    if (out.history.length >= 200) throw Error("This lifecycle has reached 200 entries. Export a backup and start a new plan to continue.");
    out.history.push({ at, from: { evidence: out.evidence, community: out.community }, evidence, community, note: note.trim() });
    out.evidence = evidence; out.community = community;
    return clean(out);
  };
  return { initial, clean, record };
})();

