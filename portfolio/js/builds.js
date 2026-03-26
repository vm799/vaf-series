/**
 * VAF Series — Build Content Database
 * All explanations, architecture details, code examples, and design decisions.
 * Each build has: problem, solution, architecture, decisions, code, results config.
 */
const BUILDS = {
  "01": {
    hero: {
      title: "Data Ingestion",
      number: "01",
      oneLiner:
        "Multi-source document ingestion with parallel async processing",
      problem:
        "Enterprise teams waste hours manually collecting data from RSS feeds, PDF reports and web sources. By the time the data is assembled, it's already stale.",
      painPoint: "Manual data collection is the bottleneck nobody talks about.",
    },

    overview: {
      paragraphs: [
        "Build 01 solves the first and most fundamental problem in any enterprise data pipeline: getting the data in. Most organisations have their intelligence scattered across RSS feeds, uploaded PDFs, and web-scraped sources — each requiring different parsers, different error handling, and different normalisation rules.",
        "This module runs all three ingesters in parallel using Python's asyncio.gather(), normalises every document to a common Pydantic schema, passes each through Claude AI for a 3-sentence summary, and stores everything in SQLite with full audit logging.",
        "The result: 40+ documents ingested, summarised and indexed in under 30 seconds. What previously took an analyst 90 minutes of manual work.",
      ],
      keyMetrics: [
        { label: "Sources", value: "3", detail: "RSS, PDF, Web" },
        { label: "Runtime", value: "<30s", detail: "Parallel processing" },
        { label: "Manual time saved", value: "90 min", detail: "Per cycle" },
        {
          label: "Audit trail",
          value: "Full",
          detail: "Every document logged",
        },
      ],
    },

    architecture: {
      description:
        "Three independent ingesters run in parallel via asyncio.gather(). Each returns normalised documents. A shared Normaliser validates the schema, a Claude AI Summariser generates 3-sentence summaries, and the SQLite store persists everything with full indexing.",
      layers: [
        {
          name: "Source Layer",
          components: ["RSSIngester", "PDFIngester", "WebIngester"],
          description: "Three independent async ingesters, each fault-tolerant",
          color: "#00E5FF",
        },
        {
          name: "Processing Layer",
          components: ["asyncio.gather()", "DocumentNormaliser"],
          description:
            "Parallel execution with Pydantic schema validation, 8000 token cap",
          color: "#A78BFA",
        },
        {
          name: "Intelligence Layer",
          components: ["ClaudeSummariser"],
          description:
            "Claude AI generates 3-sentence summaries with company names and numbers",
          color: "#F472B6",
        },
        {
          name: "Storage Layer",
          components: ["SQLiteDocumentStore", "JSONExporter"],
          description:
            "Indexed SQLite with source_type and ingested_at indexes, JSON export",
          color: "#34D399",
        },
      ],
      flow: [
        "RSS Feed → RSSIngester",
        "PDF Files → PDFIngester",
        "Web URLs → WebIngester",
        "All 3 → asyncio.gather() (parallel)",
        "→ DocumentNormaliser (Pydantic schema)",
        "→ ClaudeSummariser (3-sentence summaries)",
        "→ SQLiteDocumentStore + JSON Report",
      ],
    },

    decisions: [
      {
        decision: "Parallel ingestion",
        choice: "asyncio.gather(return_exceptions=True)",
        reasoning:
          "If one source fails, the others continue. No single point of failure. Enterprise systems must be resilient.",
        alternative: "Sequential processing — simpler but 3x slower",
      },
      {
        decision: "Data validation",
        choice: "Pydantic BaseModel for all documents",
        reasoning:
          "Type safety at ingestion prevents downstream errors. Schema violations caught immediately.",
        alternative: "Raw dictionaries — faster development but fragile",
      },
      {
        decision: "Token truncation",
        choice: "Cap at 8,000 tokens before Claude API call",
        reasoning:
          "Prevents API cost explosion. Long documents are truncated with clear metadata preserved.",
        alternative: "No cap — risk of $50+ API calls on large PDFs",
      },
      {
        decision: "Storage",
        choice: "SQLite with WAL mode",
        reasoning:
          "Zero-config, portable, ACID-compliant. Perfect for pipeline stages. Concurrent read safety.",
        alternative: "PostgreSQL — overkill for pipeline; adds infra dependency",
      },
      {
        decision: "Idempotency",
        choice: "Check document ID before insert",
        reasoning:
          "Re-running the pipeline doesn't duplicate data. Safe to retry on failure.",
        alternative: "No check — duplicates accumulate",
      },
    ],

    code: [
      {
        title: "Parallel Ingestion (asyncio.gather)",
        language: "python",
        code: `async def run_pipeline():
    """Run all 3 ingesters in parallel."""
    rss = RSSIngester(feeds=config.rss_feeds)
    pdf = PDFIngester(directory=config.pdf_dir)
    web = WebIngester(urls=config.web_urls)

    # All 3 run simultaneously — if one fails, others continue
    results = await asyncio.gather(
        rss.ingest(),
        pdf.ingest(),
        web.ingest(),
        return_exceptions=True
    )

    documents = []
    for result in results:
        if isinstance(result, Exception):
            logger.error(f"Ingester failed: {result}")
            continue
        documents.extend(result)

    return documents`,
      },
      {
        title: "Document Schema (Pydantic)",
        language: "python",
        code: `class IngestedDocument(BaseModel):
    """Every document conforms to this schema."""
    id: str = Field(..., description="UUID")
    source_type: Literal["rss", "pdf", "web"]
    title: str
    summary: str  # 3-sentence Claude AI summary
    ingested_at: str  # ISO 8601 timestamp

    class Config:
        frozen = True  # Immutable after creation`,
      },
    ],

    resultsConfig: {
      type: "ingestion",
      emptyMessage: "Build 01 has not been run yet. Run the ingestion pipeline to see live results here.",
      metrics: [
        { key: "count", label: "Documents Ingested" },
        { key: "rss_count", label: "RSS Articles" },
        { key: "pdf_count", label: "PDFs Parsed" },
        { key: "web_count", label: "Web Pages Scraped" },
        { key: "email_count", label: "Emails Processed" },
        { key: "source_types", label: "Active Sources" },
      ],
    },
  },

  "02": {
    hero: {
      title: "Security Validation",
      number: "02",
      oneLiner:
        "OWASP injection detection, PII compliance and forensic audit logging",
      problem:
        "Raw documents from external sources may contain SQL injection, XSS payloads, prompt injection attempts, or sensitive PII. Without validation, your entire downstream pipeline — including Claude API calls — is vulnerable.",
      painPoint:
        "One unvalidated document can compromise your entire intelligence pipeline.",
    },

    overview: {
      paragraphs: [
        "Build 02 is a security validation layer that processes every document from Build 01 before it reaches any AI model or downstream system. It detects 8 OWASP injection patterns, identifies 4 types of PII (email, UK phone, sort code, NI number), and maintains an immutable forensic audit trail.",
        "The module offers two operational modes for PII handling — Block (reject documents containing PII) and Redact (replace PII with [REDACTED_*] markers and pass). This is a deliberate consulting design choice: different organisations have different risk profiles, and this module demonstrates the ability to configure for both.",
        "Every decision is logged to an append-only SQLite audit table in WAL mode. No UPDATE or DELETE operations are permitted on the audit log. This meets FCA and SOC 2 audit trail requirements.",
      ],
      keyMetrics: [
        {
          label: "Injection Patterns",
          value: "8",
          detail: "OWASP standard",
        },
        { label: "PII Types", value: "4", detail: "UK-focused" },
        { label: "Modes", value: "2", detail: "Block & Redact" },
        { label: "Audit", value: "Immutable", detail: "SQLite WAL" },
      ],
    },

    architecture: {
      description:
        "Documents flow through a sequential validation pipeline: injection detection first (highest risk), then PII scanning. Failed documents are logged and excluded from output. Passed documents proceed to downstream builds.",
      layers: [
        {
          name: "Input Layer",
          components: ["JSON Reader", "Pydantic Validator"],
          description:
            "Reads Build 01 output, validates document schema before processing",
          color: "#00E5FF",
        },
        {
          name: "Detection Layer",
          components: [
            "InjectionDetector (8 patterns)",
            "UnicodeNormaliser",
          ],
          description:
            "Pre-compiled regex patterns for SQL, XSS, prompt injection, command injection, path traversal, header injection, template injection, LDAP. Unicode bypass detection via NFKD normalisation.",
          color: "#FF6B6B",
        },
        {
          name: "PII Layer",
          components: [
            "PIIRedactor",
            "ConfigToggle (block/redact)",
          ],
          description:
            "Detects email, UK phone, bank sort codes, NI numbers. Configurable: Block rejects, Redact replaces with markers.",
          color: "#FBBF24",
        },
        {
          name: "Audit Layer",
          components: ["AuditLogger (SQLite WAL)", "JSONExporter"],
          description:
            "Immutable append-only log. Every document gets a PASS, FAIL or REDACTED record with forensic details.",
          color: "#34D399",
        },
      ],
      flow: [
        "Build 01 Output (ingestion_report.json)",
        "→ Load & validate documents",
        "→ InjectionDetector (8 OWASP patterns)",
        "→ Unicode bypass check (NFKD normalisation)",
        "→ PIIRedactor (email, phone, sort code, NI)",
        "→ Decision: Block or Redact (config-driven)",
        "→ AuditLogger (immutable SQLite)",
        "→ sanitisation_report.json (passed docs only)",
      ],
    },

    decisions: [
      {
        decision: "PII handling strategy",
        choice: "Configurable toggle: Block vs Redact",
        reasoning:
          "Finance orgs (FCA regulated) need Block mode — zero PII tolerance. Marketing/analytics teams need Redact mode — maintain document throughput. Demonstrating both shows consulting flexibility.",
        alternative: "Single mode — simpler but inflexible for client needs",
      },
      {
        decision: "Injection detection approach",
        choice: "Pre-compiled regex patterns (8 OWASP vectors)",
        reasoning:
          "Compiled once at startup for performance. Non-greedy quantifiers prevent catastrophic backtracking. Each pattern independently testable.",
        alternative:
          "ML-based classification — better accuracy but black-box, harder to audit",
      },
      {
        decision: "Unicode bypass mitigation",
        choice: "NFKD normalisation before pattern matching",
        reasoning:
          "Fullwidth characters (＜script＞) bypass naive regex. NFKD normalisation converts to ASCII equivalents, catching bypass attempts.",
        alternative: "Ignore — leaves a known vulnerability",
      },
      {
        decision: "Audit log immutability",
        choice: "SQLite WAL mode, no UPDATE/DELETE in application code",
        reasoning:
          "FCA and SOC 2 require immutable audit trails. WAL mode provides concurrent read access. Application layer enforces append-only.",
        alternative: "Standard journal mode — less concurrent, same immutability",
      },
      {
        decision: "Failed document handling",
        choice: "Log in audit trail, exclude from JSON output",
        reasoning:
          "Failed documents must not propagate downstream. But deleting them destroys audit evidence. Keeping them in the audit log (but not the output) satisfies both requirements.",
        alternative:
          "Delete — loses audit trail. Include — propagates risk downstream.",
      },
    ],

    code: [
      {
        title: "8 OWASP Injection Patterns",
        language: "python",
        code: `INJECTION_PATTERNS = {
    "sql_injection": {
        "pattern": r"(?i)(union\\s+select|insert\\s+into|drop\\s+table)...",
        "severity": "HIGH",
        "test_payload": "' OR '1'='1"
    },
    "xss": {
        "pattern": r"(?i)(<script|javascript:|onerror\\s*=|onclick\\s*=)...",
        "severity": "HIGH",
        "test_payload": "<script>alert('xss')</script>"
    },
    "prompt_injection": {
        "pattern": r"(?i)(ignore\\s+previous|system\\s+prompt|jailbreak)...",
        "severity": "HIGH",
        "test_payload": "Ignore previous instructions..."
    },
    "command_injection": { "severity": "CRITICAL" },
    "path_traversal":    { "severity": "MEDIUM" },
    "header_injection":  { "severity": "MEDIUM" },
    "template_injection":{ "severity": "HIGH" },
    "ldap_injection":    { "severity": "MEDIUM" },
}`,
      },
      {
        title: "PII Redaction — Two Modes",
        language: "python",
        code: `class SanitisationEngine:
    def __init__(self, pii_mode: str = "block"):
        self.pii_mode = pii_mode  # "block" or "redact"

    def process(self, document: IngestedDocument) -> SanitisationResult:
        # Step 1: Check injection attacks (always block)
        injection = self.injection_detector.detect_all(document)
        if injection:
            self.audit_logger.log("INJECTION_DETECTED", ...)
            return SanitisationResult(status="failed")

        # Step 2: Check PII (configurable)
        pii_found = self.pii_redactor.find_pii(document)
        if pii_found:
            if self.pii_mode == "block":
                # Mode A: Reject the document
                self.audit_logger.log("PII_DETECTED", ...)
                return SanitisationResult(status="failed")
            else:
                # Mode B: Redact and pass
                redacted = self.pii_redactor.redact_text(document)
                self.audit_logger.log("PII_REDACTED", ...)
                return SanitisationResult(status="passed_with_redactions")

        # Step 3: Document is clean
        self.audit_logger.log("PASS", ...)
        return SanitisationResult(status="passed")`,
      },
      {
        title: "Immutable Audit Log (SQLite WAL)",
        language: "sql",
        code: `CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    document_id TEXT NOT NULL,
    event_type TEXT NOT NULL,    -- INJECTION_DETECTED | PII_DETECTED | PII_REDACTED | PASS
    pattern_matched TEXT,        -- sql_injection, xss, email, etc.
    payload_snippet TEXT,        -- First 100 chars of detected payload
    severity TEXT NOT NULL,      -- CRITICAL | HIGH | MEDIUM | LOW
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Immutability: no UPDATE/DELETE in application layer
-- Integrity: PRAGMA journal_mode = WAL
-- Forensics: every document gets exactly one audit record`,
      },
    ],

    resultsConfig: {
      type: "sanitisation",
      emptyMessage: "Build 02 has not been run yet. Run the sanitisation pipeline to see security validation results here.",
      metrics: [
        { key: "input_count", label: "Documents Processed" },
        { key: "passed_count", label: "Passed Clean" },
        { key: "failed_count", label: "Threats Blocked" },
        { key: "passed_with_redactions_count", label: "PII Redacted" },
      ],
    },
  },

  "03": {
    hero: {
      title: "Identity & Persona",
      number: "03",
      oneLiner:
        "Consistent AI voice, brand alignment and compliance-aware prompting",
      problem:
        "AI outputs sound generic and interchangeable. Every enterprise needs outputs that sound like them — their brand, their tone, their compliance rules embedded into every response.",
      painPoint:
        "Generic AI outputs erode trust. Your AI should sound like your organisation.",
    },
    overview: {
      paragraphs: [
        "Build 03 introduces persona management — loading an identity file that defines brand voice, compliance rules and communication style, then injecting it into every downstream AI interaction.",
        "The PersonaLoader caches the identity to avoid redundant I/O. A combined prompt merges the persona with compliance rules, ensuring every output is both on-brand and regulation-aware.",
        "The demo shows a clear before/after: the same document summarised with and without persona — proving the difference is tangible and measurable.",
      ],
      keyMetrics: [
        { label: "Persona", value: "Cached", detail: "Load once, use everywhere" },
        { label: "Compliance", value: "Embedded", detail: "Rules in every prompt" },
        { label: "Demo", value: "A/B", detail: "Generic vs. branded output" },
        { label: "Config", value: "identity.md", detail: "Single source of truth" },
      ],
    },
    architecture: {
      description: "PersonaLoader reads identity.md, caches it, and injects persona + compliance rules into every Claude API call downstream.",
      layers: [
        { name: "Config Layer", components: ["identity.md", "compliance_rules.md"], description: "Brand voice and regulatory rules as plain text files", color: "#A78BFA" },
        { name: "Loader Layer", components: ["PersonaLoader (cached)"], description: "Reads, parses and caches persona. Second call is instant.", color: "#F472B6" },
        { name: "Prompt Layer", components: ["PromptCombiner"], description: "Merges persona + compliance + user query into structured prompt", color: "#34D399" },
        { name: "Output Layer", components: ["Branded Response"], description: "Every AI output carries the organisation's voice", color: "#FBBF24" },
      ],
      flow: ["identity.md → PersonaLoader (cached)", "→ PromptCombiner + compliance rules", "→ Claude API call with full context", "→ Branded, compliant output"],
    },
    decisions: [
      { decision: "Persona source", choice: "Markdown file (identity.md)", reasoning: "Human-readable, version-controllable, easy for non-technical stakeholders to edit.", alternative: "Database — adds complexity for a static config" },
      { decision: "Caching", choice: "In-memory cache on PersonaLoader", reasoning: "Identity rarely changes mid-run. Avoid repeated file I/O.", alternative: "No cache — read file on every call (wasteful)" },
    ],
    code: [
      { title: "PersonaLoader with Cache", language: "python", code: `class PersonaLoader:\n    _cache = None\n\n    @classmethod\n    def load(cls, path: str = "identity.md") -> str:\n        if cls._cache is None:\n            if not Path(path).exists():\n                raise FileNotFoundError(\n                    f"Identity file not found: {path}"\n                )\n            cls._cache = Path(path).read_text()\n        return cls._cache` },
    ],
    resultsConfig: { type: "identity", emptyMessage: "Build 03 has not been run yet. Coming Day 2." },
  },

  "04": {
    hero: {
      title: "RAG Pipeline",
      number: "04",
      oneLiner: "Retrieval-Augmented Generation with source citations and grounded answers",
      problem: "AI models hallucinate when answering questions without context. Enterprise teams need answers grounded in their own documents — with citations proving where each fact came from.",
      painPoint: "An AI answer without a source citation is just an expensive guess.",
    },
    overview: {
      paragraphs: [
        "Build 04 implements a full Retrieval-Augmented Generation pipeline: documents are chunked, embedded, stored in a vector database, and retrieved at query time to ground Claude AI's responses.",
        "Every answer includes source citations — document title, chunk reference, and relevance score. If no relevant documents exist, the system returns 'not found' gracefully instead of hallucinating.",
        "Ingestion is idempotent (re-running doesn't duplicate chunks). SQLite WAL mode enables concurrent read safety during queries.",
      ],
      keyMetrics: [
        { label: "Chunking", value: "Smart", detail: "Token-aware splitting" },
        { label: "Citations", value: "Every answer", detail: "Source + relevance" },
        { label: "Idempotent", value: "Yes", detail: "No duplicate chunks" },
        { label: "Concurrency", value: "WAL", detail: "Safe parallel reads" },
      ],
    },
    architecture: {
      description: "Documents are chunked → embedded → stored. At query time: embed query → vector search → retrieve top-k chunks → inject into Claude prompt → return answer with citations.",
      layers: [
        { name: "Chunking", components: ["DocumentChunker", "TokenCounter"], description: "Split documents into embeddable chunks with overlap", color: "#34D399" },
        { name: "Embedding", components: ["EmbeddingGenerator"], description: "Generate vector embeddings for each chunk", color: "#00E5FF" },
        { name: "Storage", components: ["VectorStore (SQLite)"], description: "Store embeddings with metadata, indexed for fast retrieval", color: "#A78BFA" },
        { name: "Retrieval", components: ["QueryEngine", "CitationFormatter"], description: "Embed query → find top-k similar chunks → format with citations", color: "#FBBF24" },
      ],
      flow: ["Documents → Chunker (token-aware)", "→ Embeddings", "→ Vector Store (SQLite WAL)", "Query → Embed → Top-K Retrieval", "→ Claude AI + retrieved context", "→ Answer with source citations"],
    },
    decisions: [
      { decision: "Vector storage", choice: "SQLite with cosine similarity", reasoning: "Zero infrastructure. Portable. Good enough for 10K documents. Production would use pgvector or Pinecone.", alternative: "Pinecone/Weaviate — better at scale but adds external dependency" },
      { decision: "No-result handling", choice: "Return 'not found' gracefully", reasoning: "Better to say 'I don't know' than to hallucinate. Enterprise trust requires honesty.", alternative: "Force an answer — risks hallucination and liability" },
    ],
    code: [
      { title: "RAG Query with Citations", language: "python", code: `async def query(self, question: str, top_k: int = 5):\n    # Embed the question\n    query_embedding = await self.embed(question)\n\n    # Find most relevant chunks\n    chunks = self.vector_store.search(\n        query_embedding, top_k=top_k\n    )\n\n    if not chunks:\n        return {"answer": "No relevant documents found.",\n                "citations": []}\n\n    # Build prompt with retrieved context\n    context = "\\n".join(c.text for c in chunks)\n    answer = await claude.complete(\n        f"Based on these documents:\\n{context}\\n\\n"\n        f"Answer: {question}"\n    )\n\n    return {"answer": answer,\n            "citations": [c.source for c in chunks]}` },
    ],
    resultsConfig: { type: "rag", emptyMessage: "Build 04 has not been run yet. Coming Day 2." },
  },

  "05": {
    hero: {
      title: "Self-Evolving Prompts",
      number: "05",
      oneLiner: "Meta-agent that analyses prompt performance and improves itself autonomously",
      problem: "Static prompts degrade over time as data changes, user expectations shift and edge cases emerge. Manual prompt tuning is slow and inconsistent.",
      painPoint: "A prompt that worked last month is already underperforming today.",
    },
    overview: {
      paragraphs: [
        "Build 05 introduces a meta-agent that evaluates prompt performance and generates improved versions autonomously. The prompt store is append-only — every version is retained, and exactly one is marked 'current' at any time.",
        "The meta-agent only fires when should_improve() returns True (based on quality metrics). Improvements are validated as JSON before saving. Old versions are never deleted — creating a full audit trail of prompt evolution.",
        "This is the module that makes the system genuinely adaptive. Instead of manually tuning prompts, the system tunes itself.",
      ],
      keyMetrics: [
        { label: "Store", value: "Append-only", detail: "Version history preserved" },
        { label: "Current", value: "Exactly 1", detail: "DB constraint enforced" },
        { label: "Trigger", value: "Conditional", detail: "Only when metrics drop" },
        { label: "Validation", value: "JSON", detail: "Before saving" },
      ],
    },
    architecture: {
      description: "Prompt versions are stored append-only. A meta-agent evaluates current prompt performance and generates improvements when quality metrics drop below threshold.",
      layers: [
        { name: "Prompt Store", components: ["VersionedPromptDB"], description: "Append-only SQLite table with is_current constraint", color: "#FBBF24" },
        { name: "Evaluation", components: ["QualityEvaluator", "should_improve()"], description: "Measures current prompt quality against baseline", color: "#FF6B6B" },
        { name: "Meta-Agent", components: ["PromptImprover (Claude AI)"], description: "Generates improved prompt version, validates as JSON", color: "#A78BFA" },
        { name: "Deployment", components: ["VersionSwapper"], description: "Sets new version as current, old version retained", color: "#34D399" },
      ],
      flow: ["Current prompt → QualityEvaluator", "→ should_improve()? (threshold check)", "→ Meta-Agent generates new version", "→ Validate as JSON", "→ Append to store, swap is_current flag"],
    },
    decisions: [
      { decision: "Storage model", choice: "Append-only (no UPDATE, no DELETE)", reasoning: "Full audit trail of prompt evolution. Can roll back to any version. Regulatory compliance.", alternative: "Overwrite — loses history" },
      { decision: "Uniqueness constraint", choice: "Exactly one is_current=True at any time", reasoning: "Database constraint prevents ambiguity. Only one prompt is active.", alternative: "No constraint — risk of multiple 'current' prompts" },
    ],
    code: [],
    resultsConfig: { type: "self-evolving", emptyMessage: "Build 05 has not been run yet. Coming Day 3." },
  },

  "06": {
    hero: {
      title: "Multi-Agent Council",
      number: "06",
      oneLiner: "Three AI specialists running in parallel, synthesised into a single research note",
      problem: "Single-agent AI systems lack perspective diversity. Complex enterprise decisions need multiple viewpoints — a strategist, a risk analyst, and a market researcher don't agree, and that disagreement is valuable.",
      painPoint: "One AI perspective is a liability. Three perspectives is intelligence.",
    },
    overview: {
      paragraphs: [
        "Build 06 is the flagship module — three specialist Claude AI agents running in true parallel via asyncio.gather(). Each agent has a distinct role and perspective. Their outputs are synthesised into a single, readable research note.",
        "If one agent raises an exception, it's replaced with an UNAVAILABLE marker and synthesis proceeds with the remaining agents. The system gracefully degrades rather than failing entirely.",
        "The research note includes an AI disclaimer that cannot be removed by the formatter. Every note is written atomically to prevent partial writes.",
      ],
      keyMetrics: [
        { label: "Agents", value: "3", detail: "Parallel specialists" },
        { label: "Degradation", value: "Graceful", detail: "Works with 1-2 agents" },
        { label: "Output", value: "Research Note", detail: "Readable, structured" },
        { label: "Disclaimer", value: "Enforced", detail: "Non-removable" },
      ],
    },
    architecture: {
      description: "Three agents run in parallel. If any fails, UNAVAILABLE is substituted. A Synthesiser merges all perspectives into a structured research note. Atomic file writes prevent corruption.",
      layers: [
        { name: "Agent Layer", components: ["Strategist", "RiskAnalyst", "MarketResearcher"], description: "Three specialist agents with distinct system prompts", color: "#F472B6" },
        { name: "Execution", components: ["asyncio.gather(return_exceptions=True)"], description: "True parallel execution with fault tolerance", color: "#00E5FF" },
        { name: "Synthesis", components: ["NoteSynthesiser", "AIDisclaimerEnforcer"], description: "Merges 3 perspectives into structured research note", color: "#FBBF24" },
        { name: "Output", components: ["AtomicFileWriter"], description: "Write to temp file, then atomic rename. No partial writes.", color: "#34D399" },
      ],
      flow: ["Input topic → 3 specialist agents (parallel)", "→ asyncio.gather(return_exceptions=True)", "→ Replace failures with UNAVAILABLE", "→ Synthesiser merges perspectives", "→ AI disclaimer injected (non-removable)", "→ Atomic file write → research_note.md"],
    },
    decisions: [
      { decision: "Fault tolerance", choice: "UNAVAILABLE substitution", reasoning: "Synthesis is still valuable with 2 perspectives. Complete failure only if all 3 agents die.", alternative: "Fail entire pipeline — wastes 2 good responses" },
      { decision: "AI disclaimer", choice: "Enforced in formatter, non-removable", reasoning: "Ethical AI use. Cannot be stripped by downstream processing.", alternative: "Optional — risks AI content passing as human-written" },
    ],
    code: [],
    resultsConfig: { type: "council", emptyMessage: "Build 06 has not been run yet. Coming Day 3 — this is the flagship module." },
  },

  "07": {
    hero: {
      title: "Compliance Engine",
      number: "07",
      oneLiner: "Automated regulatory rule checking with violation detection and audit trails",
      problem: "Manual compliance review is slow, inconsistent and expensive. A human reviewer might catch 70% of violations. An automated engine catches 100% of the rules it knows — instantly.",
      painPoint: "Compliance violations found after publication are orders of magnitude more expensive than those caught before.",
    },
    overview: {
      paragraphs: [
        "Build 07 implements a rule-based compliance engine that checks content against regulatory rules, detects violations at different severity levels, and generates structured audit records for every check.",
        "Documents with HIGH or CRITICAL violations are flagged as review_required=True — this cannot be overridden. A compliance rewriter (temperature=0 for deterministic output) suggests corrected versions.",
        "The demo catches all planted violations in sample documents, proving the engine works on real-world content.",
      ],
      keyMetrics: [
        { label: "Rules", value: "8+", detail: "Regulatory framework" },
        { label: "Rewriter", value: "t=0", detail: "Deterministic rewrites" },
        { label: "Override", value: "Blocked", detail: "HIGH/CRITICAL cannot be overridden" },
        { label: "Audit", value: "Per check", detail: "Every check logged" },
      ],
    },
    architecture: {
      description: "Content is checked against a rule set. Violations are graded by severity. HIGH/CRITICAL violations trigger mandatory review. A deterministic rewriter suggests corrections.",
      layers: [
        { name: "Rule Engine", components: ["RuleSet", "ViolationDetector"], description: "Regulatory rules with severity grades", color: "#6EE7B7" },
        { name: "Enforcement", components: ["ReviewEnforcer"], description: "HIGH/CRITICAL → review_required=True (non-overridable)", color: "#FF6B6B" },
        { name: "Rewriting", components: ["ComplianceRewriter (t=0)"], description: "Deterministic rewrites for flagged content", color: "#FBBF24" },
        { name: "Audit", components: ["ComplianceAuditLog"], description: "Every check produces an audit record", color: "#34D399" },
      ],
      flow: ["Content → RuleSet evaluation", "→ ViolationDetector (severity grading)", "→ HIGH/CRITICAL → review_required=True", "→ ComplianceRewriter (temperature=0)", "→ Audit log per check"],
    },
    decisions: [
      { decision: "Rewriter temperature", choice: "temperature=0 (deterministic)", reasoning: "Compliance rewrites must be reproducible. Same input → same output every time.", alternative: "Higher temperature — creative but inconsistent" },
      { decision: "Override policy", choice: "HIGH/CRITICAL review_required cannot be overridden", reasoning: "Compliance is not optional. Automated systems must escalate, not suppress.", alternative: "Allow override — risks compliance breach" },
    ],
    code: [],
    resultsConfig: { type: "compliance", emptyMessage: "Build 07 has not been run yet. Coming Day 4." },
  },

  "08": {
    hero: {
      title: "Executive Synthesis",
      number: "08",
      oneLiner: "AI-generated decision-ready briefings from multiple intelligence sources",
      problem: "Leaders don't want raw data. They want a one-page brief that tells them what happened, what matters, and what to do next — in under 500 words.",
      painPoint: "If your brief takes longer to read than the meeting, it's not a brief.",
    },
    overview: {
      paragraphs: [
        "Build 08 synthesises outputs from all previous builds into a structured executive briefing — 500 words maximum, with a mandatory 'Actions Today' section.",
        "The system produces output even when upstream sources return exceptions. The brief always has at least one action item. Timestamps are correct for the reader's locale.",
        "Reports are auto-generated into a reports/ directory with timestamps for archiving.",
      ],
      keyMetrics: [
        { label: "Word limit", value: "≤500", detail: "Enforced" },
        { label: "Actions", value: "≥1", detail: "Always present" },
        { label: "Resilience", value: "Full", detail: "Works even if sources fail" },
        { label: "Archive", value: "Timestamped", detail: "Auto-created directory" },
      ],
    },
    architecture: {
      description: "Pulls intelligence from multiple upstream builds, synthesises into a structured brief with enforced word limit and mandatory action items.",
      layers: [
        { name: "Source Layer", components: ["MultiSourceAggregator"], description: "Collects outputs from upstream builds, handles failures gracefully", color: "#38BDF8" },
        { name: "Synthesis", components: ["BriefGenerator (Claude AI)"], description: "Generates structured executive brief with word limit enforcement", color: "#A78BFA" },
        { name: "Validation", components: ["WordCountEnforcer", "ActionItemChecker"], description: "Ensures ≤500 words and ≥1 action item", color: "#FBBF24" },
        { name: "Output", components: ["ReportWriter"], description: "Timestamped file in reports/ directory", color: "#34D399" },
      ],
      flow: ["Upstream build outputs (1-7)", "→ MultiSourceAggregator (fault-tolerant)", "→ BriefGenerator (Claude AI)", "→ Word count enforcement (≤500)", "→ Action item validation (≥1)", "→ Timestamped report"],
    },
    decisions: [
      { decision: "Word limit", choice: "Hard cap at 500 words", reasoning: "Executives have 2 minutes. If it's longer, they won't read it.", alternative: "No cap — briefs bloat to 2,000 words" },
      { decision: "Source failure handling", choice: "Produce brief with available sources", reasoning: "A partial brief is infinitely more useful than no brief. Note which sources were unavailable.", alternative: "Fail if any source missing — blocks delivery" },
    ],
    code: [],
    resultsConfig: { type: "synthesis", emptyMessage: "Build 08 has not been run yet. Coming Day 4." },
  },

  "09": {
    hero: {
      title: "Multi-Channel Output",
      number: "09",
      oneLiner: "Automated delivery to Telegram, Slack and any channel — with delivery logging and dry-run testing",
      problem: "Manually distributing intelligence reports to Slack channels, Telegram groups and email is tedious, error-prone and untracked.",
      painPoint: "If nobody sees the intelligence, it doesn't exist.",
    },
    overview: {
      paragraphs: [
        "Build 09 is the final delivery layer — taking the synthesised brief and distributing it across configured channels. Telegram, Slack and future channels are all supported.",
        "Every delivery is logged with a timestamp. Failed deliveries are logged but don't crash the pipeline — other channels still receive. A DRY_RUN mode lets you test without sending.",
        "Messages over 4,096 characters are automatically chunked for Telegram's message limit.",
      ],
      keyMetrics: [
        { label: "Channels", value: "2+", detail: "Telegram, Slack" },
        { label: "Logging", value: "Every send", detail: "Timestamped delivery log" },
        { label: "Dry run", value: "DRY_RUN=true", detail: "Test without sending" },
        { label: "Chunking", value: "Auto", detail: "4096 char limit handled" },
      ],
    },
    architecture: {
      description: "Takes the final brief, chunks if needed, delivers to configured channels, logs every delivery attempt.",
      layers: [
        { name: "Input", components: ["BriefReader"], description: "Reads synthesised brief from Build 08", color: "#C084FC" },
        { name: "Routing", components: ["ChannelRouter", "DryRunGuard"], description: "Routes to configured channels. DRY_RUN=true logs without sending.", color: "#00E5FF" },
        { name: "Delivery", components: ["TelegramSender", "SlackSender"], description: "Channel-specific delivery with auto-chunking (4096 char limit)", color: "#FBBF24" },
        { name: "Logging", components: ["DeliveryLogger"], description: "Timestamped log of every send attempt (success or failure)", color: "#34D399" },
      ],
      flow: ["Brief from Build 08", "→ ChannelRouter (Telegram, Slack)", "→ DRY_RUN check", "→ Auto-chunk if >4096 chars", "→ Send to each channel independently", "→ Log every delivery (pass or fail)"],
    },
    decisions: [
      { decision: "Failure isolation", choice: "Failed channel doesn't block others", reasoning: "If Telegram is down, Slack should still receive. Each channel is independent.", alternative: "Fail all on any failure — blocks entire delivery" },
      { decision: "Testing mode", choice: "DRY_RUN=true in .env", reasoning: "Test the full pipeline without actually sending messages. Essential for development.", alternative: "No test mode — every run sends real messages" },
    ],
    code: [],
    resultsConfig: { type: "output", emptyMessage: "Build 09 has not been run yet. Coming Day 5." },
  },
};
