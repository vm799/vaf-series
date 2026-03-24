# VAF AM Series — Command Center Design Spec
**Date:** 2026-03-23
**Author:** Vaishali Mehmi
**Status:** Approved for implementation

---

## Overview

A static HTML Command Center dashboard for the VAF AM Series — a 9-build, 5-day public sprint building an AI-powered asset management intelligence system.

**Two purposes:**
1. **Day 1 demo** — prove business value of Build 01 (multi-source data ingestion) by showing real output: documents ingested, Claude AI summaries, audit log, time saved
2. **Progressive infrastructure** — each daily build plugs in as it ships; the dashboard evolves with the series across the full week

**Audience:** Asset managers, potential employers, LinkedIn followers, Skool community

---

## Design Decisions (locked)

| Decision | Choice | Reason |
|---|---|---|
| Visual style | Clean Enterprise (white, cards, shadows) | Trusted by enterprise buyers, clear, not polarising |
| Layout | Hero + Kanban combined | Sprint narrative top-level, current build featured |
| Tech stack | Static HTML + vanilla JS + JSON files | No server needed, shareable, portable |
| Voice | Jake van Clief storytelling style | Audience is AI learners, business-first, teaches without lecturing |

---

## Architecture — What We're Building

### File Structure

```
_COMMAND_CENTER/
├── index.html              ← Main dashboard (the deliverable)
├── status.json             ← Config: which builds are live/queued/done
└── data/
    └── build_01.json       ← Build 01 output (sourced from ingestion_report.json)
```

### How "Plug In Per Day" Works

`status.json` controls the state of each build:

```json
{
  "current_day": 1,
  "builds": [
    { "id": "01", "name": "Ingestion",     "day": 1, "status": "live",   "data": "data/build_01.json" },
    { "id": "02", "name": "Sanitisation",  "day": 1, "status": "queued", "data": null },
    { "id": "03", "name": "Identity",      "day": 2, "status": "queued", "data": null },
    { "id": "04", "name": "RAG",           "day": 2, "status": "queued", "data": null },
    { "id": "05", "name": "Self-Evolving", "day": 3, "status": "queued", "data": null },
    { "id": "06", "name": "Council",       "day": 3, "status": "queued", "data": null, "featured": true },
    { "id": "07", "name": "Compliance",    "day": 4, "status": "queued", "data": null },
    { "id": "08", "name": "Synthesis",     "day": 4, "status": "queued", "data": null },
    { "id": "09", "name": "Output",        "day": 5, "status": "queued", "data": null }
  ]
}
```

Each day: run the build → confirm it works → change `status` to `"live"` → add path to `data` → dashboard updates automatically.

### Data Flow

```
vaf-am-build-01-ingestion/reports/ingestion_report.json
    → copy/symlink → _COMMAND_CENTER/data/build_01.json
    → status.json points to it
    → index.html reads it via fetch()
    → dashboard shows real documents + summaries
```

---

## Dashboard Layout

### Section 1 — Stats Row (top)
Four metric cards across the top:
- **Builds Live** (count, blue)
- **Queued** (count, amber)
- **Complete %** (percentage, green)
- **Day X of 5** (current day, purple)

All values driven by `status.json`. Update automatically as builds ship.

### Section 2 — Hero Card (middle)
Large featured card showing the **current day's active build**:
- Build number + name
- One-line description of the problem it solves
- Tech stack tags (RSS, PDF, Claude AI, SQLite, etc.)
- Status badge (● LIVE)
- Estimated build time
- Pain point solved (one sentence, bold)

Hero card **shifts each day** — Monday shows Build 01, Tuesday shifts to Build 03, etc. Determined by `current_day` in `status.json`.

### Section 3 — 5-Day Kanban (below hero)
Five columns: MON · TUE · WED · THU · FRI

Each column contains the build cards for that day:
- **Active day**: column header bold blue, build cards have blue border
- **Live builds**: green ● status badge, full colour
- **Queued builds**: muted, greyed out, opacity reduced
- **Done builds**: green checkmark, stays visible (does not disappear)
- **Build 06 (Council ⭐)**: amber border, FEATURED badge — pre-flagged as showpiece

### Section 4 — Build 01 Expanded Demo Panel
Triggered when user clicks on Build 01 hero card. Contains:

**a) Business Value Banner**
Full-width blue gradient. Four stats:
- 30s pipeline runtime
- 90 min analyst manual time (struck through)
- 3 sources in parallel
- FCA-grade audit trail

**b) E2E Pipeline Diagram**
Horizontal flow:
```
[RSS FEED] ─┐
[PDF UPLOAD]─┼─→ asyncio.gather() → NORMALISE → CLAUDE AI → SQLITE → REPORT
[WEB SCRAPE]─┘
```
Each node is a coloured card. Arrow connectors between. Label underneath: "All 3 sources run in parallel."

**c) Live Output — Documents Ingested**
Three document cards (one per source type), each showing:
- Source badge (RSS / PDF / WEB) with colour coding
- Document title
- Date
- Claude AI summary (3 sentences, purple left-border block)

**d) Audit Log**
Dark terminal-style block. Timestamped log lines:
- Each ingester completing
- Normaliser validating
- Claude summarising
- SQLite storing
- Final completion line: `X documents · Y seconds · 0 failures`

### Section 5 — Architecture Layers
Five numbered layers, each with:
- Layer number + label (coloured badge)
- Layer name + component name
- **WHAT IT DOES** — plain technical description
- **WHY IT EXISTS** — Jake van Clief storytelling voice (italic, purple left-border)

Layer copy (finalised):

| # | Name | What | Why (Jake voice) |
|---|------|------|-----------------|
| 01 | Ingesters | 3 specialised readers: RSS, PDF, Web — each pulls clean text from its source | "The world's intelligence doesn't arrive in one format... If your system can only read one of those, you're already behind." |
| 02 | asyncio.gather() | All 3 ingesters fire simultaneously — not one after another | "A human can only read one thing at a time. That's not a flaw — that's just biology. But software doesn't have that constraint..." |
| 03 | DocumentNormaliser | Every document shaped into the same Pydantic schema, tokens capped at 8000 | "You can't build intelligence on chaos. An RSS feed gives you HTML soup... This layer is the translator." |
| 04 | ClaudeSummariser | Each doc sent to Claude: 3-sentence AM-specific summary, numbers + company names required | "Raw text isn't intelligence — it's noise waiting to be processed... This is where the pipeline stops being a data tool and becomes a thinking tool." |
| 05 | SQLiteDocumentStore | Every document written to structured SQLite with full indexing + JSON export | "In finance, if it wasn't logged, it didn't happen... That's the difference between a cool tool and a production system." |

Layer 04 (Claude) gets a **THE MAGIC LAYER** badge — visual peak of the architecture story.

---

## Day 1 Demo Flow

**What you need running:**
```bash
cd /Users/mcmehmios/Developer/VAF_AM_Series/vaf-am-build-01-ingestion
uv run python run.py
# → 30 seconds → reports/ingestion_report.json written
```

**Then:**
```bash
cp reports/ingestion_report.json ../_COMMAND_CENTER/data/build_01.json
# Open the dashboard
open ../_COMMAND_CENTER/index.html
# (or: python -m http.server 8080 from _COMMAND_CENTER/ then open localhost:8080)
```

**Demo narrative:**
1. Show terminal: `uv run python run.py` → watch 3 sources ingest in parallel → 30 seconds → done
2. Flip to browser → Command Center loads → Build 01 hero card is live
3. Click hero card → expanded demo panel opens
4. Walk through: Business Value Banner → Pipeline Diagram → Real Documents with Claude summaries → Audit Log
5. Scroll to Architecture Layers → walk the 5 layers in Jake's voice
6. Close: *"Tomorrow this pipeline feeds into Build 02 — the sanitisation layer. Every document that came in today gets cleaned, de-identified, and made FCA-safe before it touches another AI agent."*

---

## Progressive Plugging In — Daily Workflow

Each day after shipping a build:

1. Run the build: `uv run python run.py` in that build's directory
2. Copy its report: `cp reports/output.json ../_COMMAND_CENTER/data/build_XX.json`
3. Edit `status.json`: change status from `"queued"` → `"live"`, add data path
4. Refresh the dashboard — new build card lights up, hero shifts to current day

No code changes needed. One JSON edit per build. The dashboard self-updates.

---

## What Is NOT In Scope (v1)

- Live auto-refresh (polling) — static HTML, manual refresh is fine
- Authentication or login
- Responsive mobile layout — desktop demo only for now
- Dark mode
- Connecting to live APIs or Telegram
- Any build beyond Build 01 data (builds 02–09 are UI placeholders until those days)

---

## Success Criteria

- [ ] Command Center opens from `open index.html` with no server (or `python -m http.server`)
- [ ] Stats row reflects `status.json` correctly
- [ ] Build 01 hero card shows with LIVE status
- [ ] Click expands full demo panel (business value + pipeline + docs + audit log)
- [ ] Architecture layers section renders with all 5 layers + Jake van Clief copy
- [ ] 5-day kanban shows Monday active, all other days greyed
- [ ] Build 06 shows amber FEATURED badge
- [ ] Swapping `status.json` to mark Build 02 live → dashboard updates correctly on refresh
- [ ] Real `ingestion_report.json` data loads into the live output document cards
