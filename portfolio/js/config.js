/**
 * VAF Series — Portfolio Configuration
 * Single source of truth. Update this daily as builds complete.
 *
 * Status values:
 *   "live"    — Build complete, results available
 *   "running" — Build in progress today
 *   "queued"  — Coming soon (visible but greyed)
 *   "hidden"  — Not yet visible
 */
const CONFIG = {
  series: {
    title: "The VAF Series",
    subtitle: "Enterprise AI Pipeline",
    tagline: "9 production modules. 5 days. Built in public.",
    author: "Vaishali Mehmi",
    year: 2026,
    description:
      "A fully functional AI-powered data intelligence platform — designed, built and shipped as a public demonstration of enterprise-grade engineering. Every module is production-ready code with security validation, compliance checks and audit trails.",
  },

  // Change this each day: 1 = Monday, 2 = Tuesday, ... 5 = Friday
  currentDay: 1,

  builds: [
    {
      id: "01",
      name: "Data Ingestion",
      shortName: "Ingestion",
      day: 1,
      status: "live",
      icon: "↓",
      accent: "#00E5FF",
      dataFile: "data/build_01.json",
      tags: ["asyncio", "RSS", "PDF", "Web Scraping", "SQLite", "Claude AI"],
    },
    {
      id: "02",
      name: "Security Validation",
      shortName: "Sanitisation",
      day: 1,
      status: "live",
      icon: "⛊",
      accent: "#FF6B6B",
      dataFile: "data/build_02.json",
      tags: [
        "OWASP",
        "PII Redaction",
        "Injection Detection",
        "Audit Logging",
      ],
    },
    {
      id: "03",
      name: "Identity & Persona",
      shortName: "Identity",
      day: 2,
      status: "queued",
      icon: "◉",
      accent: "#A78BFA",
      dataFile: null,
      tags: ["Persona Loading", "Brand Voice", "Compliance Rules", "Pydantic"],
    },
    {
      id: "04",
      name: "RAG Pipeline",
      shortName: "RAG",
      day: 2,
      status: "queued",
      icon: "⊞",
      accent: "#34D399",
      dataFile: null,
      tags: [
        "Embeddings",
        "Vector Search",
        "Source Citations",
        "Chunking",
        "Claude AI",
      ],
    },
    {
      id: "05",
      name: "Self-Evolving Prompts",
      shortName: "Self-Evolving",
      day: 3,
      status: "queued",
      icon: "∞",
      accent: "#FBBF24",
      dataFile: null,
      tags: ["Meta-Agent", "Prompt Store", "Append-Only", "Auto-Improvement"],
    },
    {
      id: "06",
      name: "Multi-Agent Council",
      shortName: "Council",
      day: 3,
      status: "queued",
      icon: "⬡",
      accent: "#F472B6",
      dataFile: null,
      tags: [
        "3 Agents",
        "Parallel Execution",
        "Synthesis",
        "Research Notes",
        "Claude AI",
      ],
      featured: true,
    },
    {
      id: "07",
      name: "Compliance Engine",
      shortName: "Compliance",
      day: 4,
      status: "queued",
      icon: "✓",
      accent: "#6EE7B7",
      dataFile: null,
      tags: [
        "Regulatory Rules",
        "Violation Detection",
        "Audit Trail",
        "Rewriting",
      ],
    },
    {
      id: "08",
      name: "Executive Synthesis",
      shortName: "Synthesis",
      day: 4,
      status: "queued",
      icon: "◈",
      accent: "#38BDF8",
      dataFile: null,
      tags: [
        "Briefing Generator",
        "Multi-Source",
        "Word Limit",
        "Action Items",
      ],
    },
    {
      id: "09",
      name: "Multi-Channel Output",
      shortName: "Output",
      day: 5,
      status: "queued",
      icon: "⇒",
      accent: "#C084FC",
      dataFile: null,
      tags: ["Telegram", "Slack", "Delivery Log", "Dry Run", "Chunking"],
    },
  ],

  days: [
    { num: 1, label: "MON", name: "Foundation", builds: ["01", "02"] },
    { num: 2, label: "TUE", name: "Intelligence", builds: ["03", "04"] },
    { num: 3, label: "WED", name: "Orchestration", builds: ["05", "06"] },
    { num: 4, label: "THU", name: "Governance", builds: ["07", "08"] },
    { num: 5, label: "FRI", name: "Delivery", builds: ["09"] },
  ],
};
