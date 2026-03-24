# 📋 DELIVERY LEADS — Sprint Cards for All 9 Builds
> One card per build. Each Delivery Lead owns their build end-to-end.
> Report to COMMANDER at standup + EOD debrief.

---

## BUILD_01 — INGESTION | Delivery Lead: FORGE-01
**Day:** Monday AM | **Target Ship:** Monday 18:00

### Sprint Card
```
GOAL: Working parallel ingestion from 3 sources. Clean JSON output.

TASKS:
[ ] Create repo: vaf-am-build-01-ingestion
[ ] Copy README.md from VAF_AM_SERIES package
[ ] Implement src/ingesters/rss.py (feedparser)
[ ] Implement src/ingesters/pdf.py (pdfplumber)
[ ] Implement src/ingesters/web.py (httpx + bs4)
[ ] Implement src/normaliser.py (DocumentNormaliser)
[ ] Implement src/summariser.py (ClaudeSummariser)
[ ] Implement src/store.py (SQLiteDocumentStore)
[ ] Write run.py (full pipeline)
[ ] Add sample_earnings.pdf to data/
[ ] Write tests/test_rss.py + tests/test_pipeline.py
[ ] Clean clone test: uv sync + uv run python run.py
[ ] Push to GitHub (public)
[ ] QA: COLOSSUS sign-off

DONE CRITERIA: run.py executes, 3 sources ingest, JSON report created
COLOSSUS GATE: ✅ Pass before pushing public
```

---

## BUILD_02 — SANITISATION | Delivery Lead: FORGE-02
**Day:** Monday PM | **Target Ship:** Monday 20:00

### Sprint Card
```
GOAL: Deterministic sanitisation with audit log. All 8 injection patterns caught.

TASKS:
[ ] Create repo: vaf-am-build-02-sanitisation
[ ] Implement src/sanitiser.py (SanitisationPipeline)
[ ] Implement filters: injection_filter.py, pii_redactor.py, html_stripper.py
[ ] Implement src/audit_log.py (append-only SQLite)
[ ] Write run.py (demo: clean doc + injection attempt + PII doc)
[ ] Write tests/test_injection_filter.py (test all 8 patterns)
[ ] Write tests/test_pii_redactor.py (email, phone, sort code, NI)
[ ] Verify audit log is truly append-only
[ ] Clean clone test
[ ] Push to GitHub (public)
[ ] QA: AEGIS sign-off (security build)

DONE CRITERIA: All 3 demo inputs produce correct output + audit log populated
AEGIS GATE: ✅ All 8 injection patterns tested. Audit log verified append-only.
```

---

## BUILD_03 — IDENTITY | Delivery Lead: FORGE-03
**Day:** Tuesday AM | **Target Ship:** Tuesday 11:00

### Sprint Card
```
GOAL: PersonaLoader working. Demo shows clear output difference with/without files.

TASKS:
[ ] Create repo: vaf-am-build-03-identity
[ ] Create identity_files/identity.md (AM firm template)
[ ] Create identity_files/compliance_rules.md (FCA rules template)
[ ] Implement src/persona_loader.py (PersonaLoader with cache)
[ ] Write run.py (side-by-side demo: generic vs branded output)
[ ] Write tests/test_persona_loader.py
[ ] Clean clone test
[ ] Push to GitHub (public)
[ ] QA: COLOSSUS sign-off

DONE CRITERIA: Demo clearly shows different output quality. PersonaLoader cached.
```

---

## BUILD_04 — RAG | Delivery Lead: FORGE-04
**Day:** Tuesday PM | **Target Ship:** Tuesday 19:00

### Sprint Card
```
GOAL: Ingest 3 documents. Answer 3 AM questions with citations. "Not found" works.

TASKS:
[ ] Create repo: vaf-am-build-04-rag
[ ] Implement src/chunker.py (sentence-boundary chunking)
[ ] Implement src/embedder.py (Claude Embeddings API)
[ ] Implement src/vector_store.py (SQLiteVectorStore with sqlite-vec)
[ ] Implement src/retriever.py (cosine search, top-k)
[ ] Implement src/answerer.py (RAG answer + citations)
[ ] Write ingest.py (one-time setup script)
[ ] Write query.py (CLI query interface)
[ ] Add 3 sample AM documents to data/docs/
[ ] Write tests/test_retriever.py + test_answerer.py
[ ] Clean clone test: ingest → query → see citation
[ ] Push to GitHub (public)
[ ] QA: COLOSSUS sign-off

DONE CRITERIA: 3 questions answered with citations. 1 out-of-scope question returns "not found".
COLOSSUS GATE: Idempotent ingest verified. "Not found" tested explicitly.
```

---

## BUILD_05 — SELF-EVOLVING | Delivery Lead: FORGE-05
**Day:** Wednesday AM | **Target Ship:** Wednesday 12:00

### Sprint Card
```
GOAL: Feedback loop working. Seeded demo shows before/after prompt improvement.

TASKS:
[ ] Create repo: vaf-am-build-05-self-evolving
[ ] Implement src/feedback_store.py
[ ] Implement src/prompt_store.py (append-only)
[ ] Implement src/meta_agent.py (MetaAgent — Claude reviews feedback)
[ ] Write feedback.py CLI
[ ] Write improve.py CLI
[ ] Write run.py (FULL DEMO: seed 5 feedback items → improve → compare outputs)
[ ] Seed script: creates 5 realistic feedback items showing "too verbose" pattern
[ ] Write tests/test_feedback_store.py + test_meta_agent.py
[ ] Verify prompt store is truly append-only
[ ] Clean clone test
[ ] Push to GitHub (public)
[ ] QA: COLOSSUS sign-off

DONE CRITERIA: Seeded demo shows measurable improvement in prompt version 2 vs version 1
```

---

## BUILD_06 — COUNCIL ⭐ | Delivery Lead: FORGE-06
**Day:** Wednesday PM | **Target Ship:** Wednesday 19:00
**⚠️ PRIORITY BUILD — Minimum 90 minutes allocated**

### Sprint Card
```
GOAL: Bull + Bear + Risk running in parallel. GSK research note produced in <90 seconds.

TASKS:
[ ] Create repo: vaf-am-build-06-council
[ ] Implement src/agents/base_agent.py (BaseAnalystAgent ABC)
[ ] Implement src/agents/bull_agent.py
[ ] Implement src/agents/bear_agent.py
[ ] Implement src/agents/risk_agent.py
[ ] Implement src/agents/synthesis_agent.py
[ ] Implement src/council.py (InvestmentCouncil with asyncio.gather)
[ ] Implement src/formatter.py (ResearchNoteFormatter with disclaimer)
[ ] Write run.py (--company flag, output to reports/research/)
[ ] Add timestamps to prove parallel execution in terminal output
[ ] Write tests/test_council.py (test UNAVAILABLE agent handling)
[ ] Test with: GSK, HSBA, AZN — all 3 must produce readable notes
[ ] Strengthen AI disclaimer in formatter
[ ] Clean clone test: uv run python run.py --company GSK
[ ] Push to GitHub (public)
[ ] QA: COLOSSUS sign-off

DONE CRITERIA: GSK note produced, parallel execution visible in terminal, disclaimer present
COLOSSUS GATE: UNAVAILABLE substitution tested. Note quality reviewed by COLOSSUS personally.
```

---

## BUILD_07 — COMPLIANCE | Delivery Lead: FORGE-07
**Day:** Thursday AM | **Target Ship:** Thursday 12:00

### Sprint Card
```
GOAL: Violation letter demo catches all 3 FCA violations. Compliant rewrite produced.

TASKS:
[ ] Create repo: vaf-am-build-07-compliance
[ ] VERIFY FCA rule references against handbook.fca.org.uk ← MANDATORY FIRST STEP
[ ] Implement src/rules/fca_rules.py (8 rules with verified references)
[ ] Implement src/rules/mifid_rules.py
[ ] Implement src/checker.py (ComplianceChecker)
[ ] Implement src/rewriter.py (Claude API rewriter, temperature=0)
[ ] Implement src/audit_log.py
[ ] Create data/violation_letter.txt (3 deliberate violations)
[ ] Create data/compliant_letter.txt (passes all checks — for comparison)
[ ] Write run.py (--input flag, shows violations + rewrite)
[ ] Write tests/test_fca_rules.py (all 8 rules have passing tests)
[ ] Clean clone test
[ ] Push to GitHub (public)
[ ] QA: AEGIS sign-off (compliance/security build)

DONE CRITERIA: violation_letter.txt triggers 3 violations. Rewrite is genuinely compliant.
AEGIS GATE: All 8 FCA rules tested. Audit log verified. FCA citations verified against handbook.
```

---

## BUILD_08 — SYNTHESIS | Delivery Lead: FORGE-08
**Day:** Thursday PM | **Target Ship:** Thursday 19:00

### Sprint Card
```
GOAL: Morning brief produced from 3 sources in <60 seconds. Readable. Actions Today present.

TASKS:
[ ] Create repo: vaf-am-build-08-synthesis
[ ] Create data/mock_portfolio.json (5 positions + 2 risk alerts)
[ ] Implement src/sources/news_source.py (reads Build 01 output)
[ ] Implement src/sources/portfolio_source.py (reads mock JSON)
[ ] Implement src/sources/rag_source.py (queries Build 04 if available, else stub)
[ ] Implement src/assembler.py (ContextAssembler)
[ ] Implement src/synthesiser.py (SynthesisAgent — Claude API)
[ ] Implement src/formatter.py (MorningBriefFormatter)
[ ] Write run.py (--pm flag, --speak optional)
[ ] Word count enforcement: ≤500 words tested
[ ] Write tests/test_assembler.py + test_synthesiser.py
[ ] Clean clone test
[ ] Push to GitHub (public)
[ ] QA: COLOSSUS sign-off

DONE CRITERIA: Brief produced, <500 words, ≥3 sections, ≥1 action item
```

---

## BUILD_09 — OUTPUT | Delivery Lead: FORGE-09
**Day:** Friday AM | **Target Ship:** Friday 14:00
**⭐ HERO BUILD — Full pipeline demo here**

### Sprint Card
```
GOAL: Morning brief delivered to Telegram before markets open. Slack working.

TASKS:
[ ] Create repo: vaf-am-build-09-output
[ ] Implement src/channels/telegram_channel.py (httpx, no heavy SDK)
[ ] Implement src/channels/slack_channel.py (slack-sdk)
[ ] Implement src/router.py (ChannelRouter with routing rules)
[ ] Implement src/delivery_log.py (SQLite delivery audit)
[ ] Write run.py (delivers brief + research note + compliance alert demo)
[ ] Add DRY_RUN mode to .env.example
[ ] Test Telegram: message chunking for >4096 chars
[ ] Test Slack: blocks format renders correctly
[ ] Test both channels independently
[ ] Full pipeline integration: wire Build 01+06+07+08 outputs as inputs
[ ] Clean clone test
[ ] Push to GitHub (public)
[ ] QA: COLOSSUS sign-off

DONE CRITERIA: Telegram message received on phone. Slack message in channel. Delivery log populated.

HERO VIDEO TASKS (after QA):
[ ] Full pipeline run recorded
[ ] Telegram notification captured on phone
[ ] Video edited with intro/outro
[ ] Uploaded to LinkedIn + YouTube
```

---

## PROGRAMME COMPLETION CHECKLIST

Run this Friday evening before closing:

```
VAF AM SERIES — COMPLETION CHECK
Date: ___________

BUILDS:
[ ] BUILD_01 — public repo, runs clean, QA passed
[ ] BUILD_02 — public repo, runs clean, QA passed
[ ] BUILD_03 — public repo, runs clean, QA passed
[ ] BUILD_04 — public repo, runs clean, QA passed
[ ] BUILD_05 — public repo, runs clean, QA passed
[ ] BUILD_06 — public repo, runs clean, QA passed ⭐
[ ] BUILD_07 — public repo, runs clean, QA passed
[ ] BUILD_08 — public repo, runs clean, QA passed
[ ] BUILD_09 — public repo, runs clean, QA passed

CONTENT:
[ ] 5 LinkedIn posts published
[ ] 5 videos uploaded
[ ] Hero video live
[ ] All press packs archived in Obsidian

COMMERCIAL:
[ ] Workshop CTA in Friday comments
[ ] Pricing visible in CTA
[ ] DMs responded to within 24 hours

NONE OF THE ABOVE = DONE. All 9. All posts. All videos. All repos public.
```

---

*VAF AM Series | Delivery Lead Sprint Cards | Built with Claude AI + Anthropic Agents*
