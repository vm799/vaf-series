# VAF AM Series — Production Orchestrator & Dashboard

**TL;DR:** One command runs your entire 9-step pipeline, generates an interactive dashboard, and delivers insights to Slack/Telegram.

---

## Quick Start (2 minutes)

### 1. Install dependencies

```bash
pip install httpx python-dotenv pydantic
```

### 2. Configure delivery channels (optional)

Create/update `.env` in the root directory:

```bash
# Slack (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Telegram (optional)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

> **No .env?** Dashboard and pipeline still work fine. Slack/Telegram just won't send.

### 3. Run the pipeline

```bash
# Full pipeline + dashboard generation
python orchestrator.py run --mode with-dashboard

# Just the pipeline (no dashboard)
python orchestrator.py run --mode full

# Just ingestion (test run)
python orchestrator.py run --mode ingestion-only
```

### 4. View the dashboard

```bash
# Open in your browser
open outputs/dashboard.html
```

That's it. ✨

---

## What Each Command Does

### Run Pipeline

```bash
python orchestrator.py run --mode [full|ingestion-only|with-dashboard]
```

**Modes:**
- `full` — Runs all 9 builds sequentially, logs results
- `ingestion-only` — Runs only Build 01 (quick test)
- `with-dashboard` — Runs all 9 builds + generates HTML dashboard

**Output:** `outputs/pipeline_results.json`

### Check Status

```bash
python orchestrator.py show-status
```

Shows which builds are ready to run:
```
📋 VAF AM Series Build Status
════════════════════════════════════════════════════
  ✅ Ready [1] Ingestion            (vaf-am-build-01-ingestion)
  ✅ Ready [2] Sanitisation          (vaf-am-build-02-sanitisation)
  ...
```

### Export Results

```bash
# As JSON
python orchestrator.py export --format json

# As Markdown report
python orchestrator.py export --format markdown
```

---

## Sending Insights via Delivery Handler

The `delivery_handler.py` is designed to be used **inside your Council agents** (Build 06) to automatically send findings to Slack/Telegram.

### Example: From Your Council Agent

```python
from delivery_handler import DeliveryHandler, ContentType, Severity
import asyncio

async def send_compliance_alert():
    handler = DeliveryHandler()

    # This will automatically route to Slack + Telegram + Dashboard
    await handler.deliver(
        content="""
XYZ Holdings exposed to new FCA Rule 2026-042.
Regulatory impact: £2M estimated portfolio impact.
Action: Review prospectuses within 30 days.
        """,
        content_type="compliance_alert",  # Determines routing
        severity="HIGH",                   # Determines alerting
        title="FCA Rule 2026-042 — XYZ Impact",
        metadata={
            "ticker": "XYZ",
            "estimated_impact": "£2M",
            "deadline": "2026-04-23"
        }
    )

asyncio.run(send_compliance_alert())
```

### Content Types & Routing

| Type | Slack | Telegram | Dashboard |
|------|-------|----------|-----------|
| `morning_brief` | - | ✅ | ✅ |
| `research_note` | ✅ | - | ✅ |
| `compliance_alert` | ✅ | ✅ | ✅ |
| `risk_alert` | ✅ | ✅ | ✅ |
| `earnings_signal` | ✅ | - | ✅ |
| `regulatory_update` | - | ✅ | ✅ |
| `system_status` | - | - | ✅ |

**Critical Override:** If severity = `CRITICAL`, sends to ALL channels.

---

## Dashboard Features

The auto-generated dashboard shows:

- **KPIs:** Builds completed, total duration, documents processed, failures
- **Pipeline Timeline:** Visual timeline of all 9 steps with status badges
- **Duration Chart:** Bar chart showing execution time per build
- **Status Overview:** Doughnut chart of complete/failed/running builds
- **Data Quality Metrics:** Success rate, error rate, integrity checks
- **Live Refresh:** Auto-refreshes every 5 seconds while processing

The dashboard reads from `outputs/pipeline_results.json` — completely self-contained HTML, no backend needed.

### How Dashboard Works

```
orchestrator.py runs all builds
          ↓
    Logs results → outputs/pipeline_results.json
          ↓
    You open outputs/dashboard.html
          ↓
    Dashboard.js loads JSON + renders charts
          ↓
    Auto-refreshes every 5 seconds
```

---

## Architecture

### Three Pieces Working Together

```
┌─────────────────────────────────────────────────────────┐
│  Your 9-Step Pipeline                                   │
│  (Build 01 → Build 09)                                  │
└──────────────┬──────────────────────────────────────────┘
               │
               ↓ (output)
┌──────────────────────────────────────────────────────────┐
│  orchestrator.py                                          │
│  • Runs all builds sequentially                          │
│  • Captures results in JSON                              │
│  • Handles errors gracefully                             │
└──────────┬─────────────────────────────────┬─────────────┘
           │                                 │
           ↓ (JSON)                          ↓ (Generate)
    pipeline_results.json        outputs/dashboard.html
           │                                 │
           └─────────────────────────┬───────┘
                                     ↓
                           (browser opens dashboard)


┌──────────────────────────────────────────────────────────┐
│  delivery_handler.py (used by Build 06/08)              │
│  • Takes insights from Council agents                    │
│  • Routes to Slack/Telegram/Dashboard                   │
│  • Maintains audit log                                   │
└──────────────────────────────────────────────────────────┘
```

---

## Output Files

After running `python orchestrator.py run --mode with-dashboard`:

```
outputs/
├── pipeline_results.json          ← Raw results (consumed by dashboard)
├── pipeline_export.json           ← Same as above (for external systems)
├── pipeline_report.md             ← Markdown export
├── dashboard.html                 ← Interactive dashboard (OPEN THIS)
├── deliveries.json                ← All insights sent via delivery_handler
└── delivery_audit.json            ← Audit log of all deliveries
```

---

## Integration with Your Builds

### In Build 06 (Council Agents)

Your `counsel.py` should **use `delivery_handler.py`** to send its findings:

```python
# In src/council.py or src/agents/synthesis_agent.py

from delivery_handler import DeliveryHandler
import asyncio

class SynthesisAgent:
    def __init__(self):
        self.handler = DeliveryHandler()

    async def synthesize(self, documents):
        # ... your synthesis logic ...

        # Send high-confidence findings
        if confidence > 0.8:
            await self.handler.deliver(
                content=synthesis_result,
                content_type="risk_alert" if is_risk else "earnings_signal",
                severity="HIGH" if is_critical else "MEDIUM",
                title=short_title,
                metadata={"confidence": confidence, "doc_count": len(documents)}
            )

        return synthesis_result
```

### In Build 09 (Output)

Your output layer can **read from** `deliveries.json` to render everything:

```python
# In vaf-am-build-09-output/src/formatter.py

import json

def format_for_terminal():
    with open("outputs/deliveries.json") as f:
        deliveries = json.load(f)

    # Format and display in terminal/CLI
    for d in deliveries:
        print(f"[{d['severity']}] {d['title']}")
        print(f"   {d['content'][:100]}...")
```

---

## Production Checklist

- [ ] All 9 builds pass individually (`python orchestrator.py show-status`)
- [ ] `orchestrator.py run --mode ingestion-only` completes without errors
- [ ] Dashboard opens without errors in browser (`outputs/dashboard.html`)
- [ ] Slack/Telegram credentials in `.env` (or skipped intentionally)
- [ ] `delivery_handler.py` wired into Build 06 (Council agents)
- [ ] Verify `outputs/` directory is in `.gitignore` (don't commit results)
- [ ] Test one full run: `python orchestrator.py run --mode with-dashboard`

---

## Troubleshooting

**Q: "Build directory not found"**
A: Make sure all 9 `vaf-am-build-XX-*` directories exist with `run.py` files.

**Q: Dashboard opens but shows "No pipeline results yet"**
A: Run `python orchestrator.py run --mode full` to generate `outputs/pipeline_results.json`.

**Q: Slack/Telegram not sending messages**
A: Check `.env` file has `SLACK_WEBHOOK_URL` and/or `TELEGRAM_BOT_TOKEN`. Without them, messages go to dashboard only (which is fine).

**Q: One build fails, but I want to continue**
A: The orchestrator already does this! Failed builds don't halt the pipeline. Check `outputs/pipeline_results.json` for which build failed.

**Q: How do I add a 10th build?**
A: Add to `BUILDS` dict in `orchestrator.py`, then it'll run automatically. Update routing rules in `delivery_handler.py` if needed.

---

## Next Steps (For Your Portfolio)

1. **Run full pipeline end-to-end:** `python orchestrator.py run --mode with-dashboard`
2. **Screenshot the dashboard** — this is your visual proof of the system working
3. **Add real insights** — modify Build 06 (Council agents) to output specific findings (regulatory risk, earnings signals, etc.)
4. **Create press material** — use dashboard + delivery_handler results in your press pack
5. **Deliver via Slack/Telegram** — wire up credentials and let the system auto-notify

This is **production-ready**. Ship it. 🚀

---

## Files

- `orchestrator.py` — Main CLI tool (run this)
- `delivery_handler.py` — Insight delivery (use this in Build 06/08)
- `outputs/dashboard.html` — Interactive dashboard (view this)
- `ORCHESTRATOR_README.md` — This file

---

Built with Claude AI + Anthropic Agents | VAF AM Series
