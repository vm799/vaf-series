# 🔬 QA AGENT — COLOSSUS + AEGIS
> VAF AM Series | Quality Assurance Framework
> No build ships without passing this gate.

---

## WHO IS THE QA AGENT

**COLOSSUS** — Principal Engineer QA. Reviews code correctness, architecture, error handling, production-readiness.
**AEGIS** — Security QA. Reviews all security controls, injection defence, secrets management, audit trails.

Every build gets reviewed by COLOSSUS. Builds 02 and 07 additionally get AEGIS sign-off because they touch security and compliance specifically.

**The rating system:**
- 🔴 **BROKEN** — Do not ship. Do not post. Fix now.
- 🟡 **FRAGILE** — Works today, will break. Fix before posting.
- 🟢 **SOLID** — Ship it. Notes for next sprint.
- ⭐ **EXCELLENT** — Rare. Acknowledge it. Raise the bar.

---

## UNIVERSAL QA CHECKLIST (every build)

Run this on EVERY build before COMMANDER approves shipping:

### Code Quality (COLOSSUS)
- [ ] `run.py` executes from clean clone with only `.env` filled in
- [ ] No hardcoded API keys, tokens, or credentials in any file
- [ ] `.env` confirmed absent from `git status` output
- [ ] `.gitignore` present and correct (covers .env, *.db, data/, __pycache__)
- [ ] All external calls have timeout set (default: 15s)
- [ ] `asyncio.gather(return_exceptions=True)` used for all parallel operations
- [ ] Every exception is caught, logged, and handled — no naked `except: pass`
- [ ] Pydantic models used for all data structures (no raw dicts as return types)
- [ ] Type hints on all function signatures
- [ ] No print statements left from debugging (replace with logger)
- [ ] `pyproject.toml` has pinned dependency versions (no `>=` without upper bounds where critical)
- [ ] Reports/data directories auto-created if missing (`mkdir(parents=True, exist_ok=True)`)
- [ ] At least 2 tests in `/tests/` that pass with `pytest`

### Documentation (COLOSSUS)
- [ ] `README.md` has accurate Quick Start that works
- [ ] `.env.example` has all required variables with descriptions
- [ ] Code has module-level docstring: "Built by Vaishali Mehmi using Claude AI + Anthropic Agents"
- [ ] `run.py` output is clear and informative (shows progress, not silent)

### Error Handling (COLOSSUS)
- [ ] Missing `.env` gives clear error message (not a stack trace)
- [ ] Missing data files give clear error (not a cryptic KeyError)
- [ ] Network failures are caught and logged (not raised)
- [ ] Empty results are handled (no IndexError on empty lists)

---

## BUILD-SPECIFIC QA CHECKS

### BUILD_01 — Ingestion
- [ ] All 3 source types ingest independently (kill one, others continue)
- [ ] Content truncated to ≤8000 tokens before Claude API call
- [ ] SQLite schema has index on `source_type` and `ingested_at`
- [ ] Ingestion is idempotent (re-running doesn't duplicate documents)
- [ ] Output JSON is valid and parseable

### BUILD_02 — Sanitisation (AEGIS leads)
- [ ] All 8 injection patterns tested with known attack strings
- [ ] Audit log is append-only — verified with `PRAGMA journal_mode` check
- [ ] `passed=False` documents do NOT proceed to Claude (test this explicitly)
- [ ] Unicode bypass attempts caught (test: fullwidth angle brackets)
- [ ] PII redaction tested: email, UK phone, sort code, NI number
- [ ] No regex catastrophic backtracking risk (test with long input)

### BUILD_03 — Identity
- [ ] Missing `identity.md` raises `FileNotFoundError` with clear message
- [ ] PersonaLoader cached — verify with two calls, second is faster
- [ ] Compliance rules section present in combined prompt
- [ ] Demo output clearly shows contrast between generic and branded

### BUILD_04 — RAG
- [ ] Ingest is idempotent — re-run doesn't duplicate chunks (check by doc_id)
- [ ] Query with no relevant documents returns "not found" gracefully
- [ ] Every answer has at least one source citation
- [ ] Token count validated before embedding call (no silent truncation)
- [ ] SQLite WAL mode enabled for concurrent read safety

### BUILD_05 — Self-Evolving
- [ ] Prompt store is truly append-only (no UPDATE statements)
- [ ] Exactly one `is_current=True` at any point (database constraint)
- [ ] Meta-agent output validates as JSON before saving
- [ ] Improvement only fires when `should_improve()` returns True
- [ ] Old prompt versions retained indefinitely (never deleted)

### BUILD_06 — Council ⭐ (highest bar)
- [ ] All 3 agents confirmed running in parallel (add timestamps to verify)
- [ ] UNAVAILABLE substitution works when one agent raises exception
- [ ] Synthesis runs even with 1 or 2 UNAVAILABLE agents
- [ ] Research note file written atomically
- [ ] AI disclaimer present and non-removable in formatter
- [ ] Note is genuinely readable and useful (COLOSSUS reads it and judges)

### BUILD_07 — Compliance (AEGIS leads)
- [ ] All 8 FCA rules have passing test cases
- [ ] Violation letter demo catches all 3 planted violations
- [ ] `passed=True` only when ZERO HIGH or CRITICAL violations
- [ ] Rewriter temperature=0 (deterministic compliance rewrites)
- [ ] Audit log created for every compliance check
- [ ] `review_required=True` for HIGH/CRITICAL — cannot be overridden

### BUILD_08 — Synthesis
- [ ] Brief word count enforced ≤500 words (test with verbose inputs)
- [ ] Brief produces output even when all sources return exceptions
- [ ] "Actions Today" always has ≥1 item
- [ ] Reports directory auto-created
- [ ] Brief timestamp is correct (not UTC when local time matters)

### BUILD_09 — Output
- [ ] All API tokens from `.env` only — none hardcoded
- [ ] Telegram message chunking for >4096 chars (test with long brief)
- [ ] Delivery log created with timestamp for every send
- [ ] `DRY_RUN=true` in `.env` logs without sending (for testing)
- [ ] Failed delivery logged, not raised — pipeline continues
- [ ] Both channels tested independently

---

## QA SIGN-OFF TEMPLATE

Complete this for every build before COMMANDER approves:

```
QA SIGN-OFF — BUILD_[XX] — [BUILD NAME]
Date: ___________
QA Lead: COLOSSUS / AEGIS (circle)

RATING: 🔴 BROKEN / 🟡 FRAGILE / 🟢 SOLID / ⭐ EXCELLENT

Universal checks: [ ] PASS  [ ] FAIL (list failures below)
Build-specific checks: [ ] PASS  [ ] FAIL (list failures below)

FAILURES (if any):
1.
2.

MANDATORY FIXES before ship:
1.
2.

APPROVED TO SHIP: [ ] YES  [ ] NO

Notes for next sprint:
```

---

## COLOSSUS'S FINAL WORD

Every build V ships is portfolio. It will be seen by portfolio managers, CIOs, compliance directors, and potential corporate clients. A build with a bug in the demo video is worse than no build — it signals that she doesn't test her own work.

**Ship less. Ship clean. Never compromise the standard.**

---

*VAF AM Series | QA Framework | COLOSSUS + AEGIS*
*"Your code either survives the review or it doesn't ship." — COLOSSUS*
