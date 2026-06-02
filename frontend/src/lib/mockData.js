// src/lib/mockData.js

export const MOCK_ARTICLES = [
  {
    id: 1,
    title: "Anthropic Skyrockets to a $965 Billion Valuation Following Landmark $65 Billion Funding Round, Overtaking OpenAI",
    category: "technology",
    region: "World",
    published_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    url: "https://example.com/tech/anthropic-valuation-2026",
    ai_summary: "Anthropic has achieved a record-breaking $965 billion valuation following an unprecedented $65 billion funding round, officially surpassing OpenAI as the world's most valuable independent artificial intelligence company. This massive capital injection highlights the aggressive financial bets global tech institutions and venture capitals are making on frontier generative AI models. Analysts view this development as a decisive shift in the AI market layout, positioning Anthropic's flagship Claude models as the premier enterprise choice. The funding will heavily subsidize the colossal computing costs required to develop next-generation systems.",
    key_drivers: "The primary driver behind this historic funding round is the rapid corporate adoption of Anthropic's Claude models, particularly for large-scale enterprise deployments requiring high security. Furthermore, the immense capital requirements to secure cutting-edge compute infrastructure have forced developers to seek unprecedented backing.",
    broader_context: "This milestone signalizes that AI development is shifting away from a startup race and merging into a highly consolidated infrastructure war. Approaching a trillion-dollar valuation positions a private AI developer on par with legacy software giants.",
    potential_outcomes: "In the short term, expect an aggressive talent poaching surge and massive hardware acquisition orders. Long term, this massive valuation gap will squeeze mid-tier AI startups, accelerating rapid market consolidation.",
    ai_insight: "Anthropic’s meteoric rise underscores that enterprise buyers heavily favor compliance, data safety, and predictability over raw development speed. The massive $65 billion runway provides them the distinct luxury to prioritize alignment."
  },
  {
    id: 2,
    title: "Assam Legislative Assembly Officially Passes the Historic Uniform Civil Code Bill 2026 Amid Intense Debate",
    category: "politics",
    region: "India",
    published_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    url: "https://example.com/politics/assam-ucc-bill-2026",
    ai_summary: "The Assam Legislative Assembly has officially passed the Uniform Civil Code (UCC) Bill, 2026 via a voice vote, establishing a common civil framework across the state. Supported strongly by the ruling administration, the legislation introduces standardized legal codes governing marriage, divorce, asset inheritance, and live-in relationships. Notably, the Bill explicitly excludes the Scheduled Tribes population to respect existing indigenous traditions. This milestone marks Assam as the third state in India to implement a comprehensive civil framework, trailing previous legislative passages enacted in Uttarakhand and Gujarat.",
    key_drivers: "The passage of the Bill stems from a coordinated political push to implement uniform legal standards nationwide. Rising administrative complexities arising from overlapping customary laws prompted the state administration to streamline civil judicature into a single, comprehensive legal framework.",
    broader_context: "This development represents a major step in the ongoing nationwide shift toward codifying civil liberties and standardizing family law. By executing this bill, Assam aligns itself with an evolving national legislative trend.",
    potential_outcomes: "Immediate outcomes will involve the setting up of dedicated registration authorities to track civil relationships, including live-in agreements. Longer-term impacts may involve legal challenges regarding state jurisdictional boundaries versus fundamental religious freedoms.",
    ai_insight: "The deliberate exclusion of Scheduled Tribes reveals a tactical legislative compromise designed to mitigate tribal resistance while achieving core policy objectives. This will likely serve as the definitive blueprint for other ethnically diverse states."
  }
];