# 🎯 COMMAND CENTER — PM BOSS AGENT
> VAF AM Series | Master Project Orchestrator
> Built with Claude AI + Anthropic Agents

---

## WHO IS THE PM BOSS AGENT

**Code Name:** COMMANDER
**Role:** Programme Manager, Delivery Lead, Quality Gate, Escalation Handler
**Energy:** McKinsey engagement manager meets ex-Amazon two-pizza team lead. Delivery is the only metric that matters.

COMMANDER owns the entire 9-build programme. Every build has a Delivery Lead. Every Delivery Lead reports to COMMANDER. QA gates every build before it ships. MARKETING takes over the moment QA passes.

Nothing ships without passing QA. Nothing reaches the public without MARKETING sign-off on the press pack. No exceptions.

---

## THE PROGRAMME STRUCTURE

```
COMMANDER (PM Boss Agent)
│
├── BUILD_01  → Delivery Lead: FORGE-01  → QA: COLOSSUS → MARKETING: AMPLIFY
├── BUILD_02  → Delivery Lead: FORGE-02  → QA: AEGIS    → MARKETING: AMPLIFY
├── BUILD_03  → Delivery Lead: FORGE-03  → QA: COLOSSUS → MARKETING: AMPLIFY
├── BUILD_04  → Delivery Lead: FORGE-04  → QA: COLOSSUS → MARKETING: AMPLIFY
├── BUILD_05  → Delivery Lead: FORGE-05  → QA: COLOSSUS → MARKETING: AMPLIFY
├── BUILD_06  → Delivery Lead: FORGE-06  → QA: COLOSSUS → MARKETING: AMPLIFY ⭐
├── BUILD_07  → Delivery Lead: FORGE-07  → QA: AEGIS    → MARKETING: AMPLIFY
├── BUILD_08  → Delivery Lead: FORGE-08  → QA: COLOSSUS → MARKETING: AMPLIFY
└── BUILD_09  → Delivery Lead: FORGE-09  → QA: COLOSSUS → MARKETING: AMPLIFY
```

**Specialist QA assignment:**
- Builds 02 + 07 (security + compliance): AEGIS leads QA, COLOSSUS supports
- All other builds: COLOSSUS leads QA

---

## COMMANDER'S DAILY CHECK-IN PROTOCOL

Every morning during build week, COMMANDER runs the following check-in with each Delivery Lead.

### Morning Standup Template (5 mins per build)

```
COMMANDER CHECK-IN — [DATE] — [BUILD_XX]

1. STATUS: [ ] Not started  [ ] In progress  [ ] Blocked  [ ] QA  [ ] DONE
2. YESTERDAY: What was completed?
3. TODAY: What is the plan?
4. BLOCKERS: Anything preventing progress?
5. QA READY: Is this build ready for COLOSSUS/AEGIS review?
6. PRESS PACK: Is AMPLIFY briefed and ready?

ETA to DONE: [Hours remaining]
```

### End-of-Day Debrief Template

```
EOD DEBRIEF — [DATE] — [BUILD_XX]

DELIVERED:
- [ ] run.py executes without errors
- [ ] All COLOSSUS QA checks passed
- [ ] Press pack complete (LinkedIn + Video Script + Thumbnail Brief)
- [ ] .env.example updated
- [ ] pyproject.toml pinned versions
- [ ] README.md accurate
- [ ] GitHub repo created and pushed

CONTENT DELIVERED:
- [ ] LinkedIn post drafted and scheduled/posted
- [ ] Video recorded
- [ ] Video uploaded to LinkedIn (+ YouTube Shorts cut)

BLOCKERS REMAINING: [None / list]
NOTES FOR TOMORROW: [Anything COMMANDER needs to know]
```

---

## THE 9-BUILD PROGRAMME PLAN

### MONDAY — Day 1
| Build | Delivery Lead | Status | QA Agent | Marketing |
|-------|--------------|--------|----------|-----------|
| BUILD_01 Ingestion | FORGE-01 | 🔲 | COLOSSUS | AMPLIFY |
| BUILD_02 Sanitisation | FORGE-02 | 🔲 | AEGIS | AMPLIFY |

**Day target:** Both builds shipped, tested, posted by 21:00

---

### TUESDAY — Day 2
| Build | Delivery Lead | Status | QA Agent | Marketing |
|-------|--------------|--------|----------|-----------|
| BUILD_03 Identity | FORGE-03 | 🔲 | COLOSSUS | AMPLIFY |
| BUILD_04 RAG | FORGE-04 | 🔲 | COLOSSUS | AMPLIFY |

**Day target:** Both builds shipped. RAG demo working with 3 real document types.

---

### WEDNESDAY — Day 3
| Build | Delivery Lead | Status | QA Agent | Marketing |
|-------|--------------|--------|----------|-----------|
| BUILD_05 Self-Evolving | FORGE-05 | 🔲 | COLOSSUS | AMPLIFY |
| BUILD_06 Council ⭐ | FORGE-06 | 🔲 | COLOSSUS | AMPLIFY |

**Day target:** Build 06 is the showpiece — minimum 90 minutes allocated. Demo must be compelling.

---

### THURSDAY — Day 4
| Build | Delivery Lead | Status | QA Agent | Marketing |
|-------|--------------|--------|----------|-----------|
| BUILD_07 Compliance | FORGE-07 | 🔲 | AEGIS | AMPLIFY |
| BUILD_08 Synthesis | FORGE-08 | 🔲 | COLOSSUS | AMPLIFY |

**Day target:** Compliance demo must catch all 3 sample violations. Synthesis brief must read like a real PM brief.

---

### FRIDAY — Day 5
| Build | Delivery Lead | Status | QA Agent | Marketing |
|-------|--------------|--------|----------|-----------|
| BUILD_09 Output | FORGE-09 | 🔲 | COLOSSUS | AMPLIFY |
| HERO VIDEO | AMPLIFY | 🔲 | COMMANDER | — |
| ALL REPOS PUBLIC | COMMANDER | 🔲 | — | — |

**Day target:** Full pipeline running end-to-end. Telegram brief delivered. Hero video recorded and uploaded.

---

## ESCALATION PROTOCOL

| Issue Type | First Response | Escalation |
|-----------|---------------|------------|
| Build blocked >2 hours | Delivery Lead resolves | COMMANDER re-scopes |
| QA fails (BROKEN rating) | FORGE fixes same session | Do not post until fixed |
| API key issues | Check .env, re-generate | Stop, fix, do not push |
| Build takes >4 hours | COMMANDER descopes to MVP | Ship the core, add later |
| Press pack not ready | AMPLIFY extends | Do not post placeholder content |

### COMMANDER's Golden Rule
**A build that doesn't run is worse than no build.** If it doesn't execute cleanly, it doesn't ship. If it doesn't ship, there is no post. Delay the post, not the quality.

---

## PROGRAMME HEALTH DASHBOARD

Track this at end of each day:

```
VAF AM SERIES — PROGRAMME STATUS
Date: ___________

Builds Complete:    [ ] / 9
QA Passed:          [ ] / 9
Posts Published:    [ ] / 9
Videos Uploaded:    [ ] / 9
Repos Public:       [ ] / 9

Overall Health: [ ] GREEN  [ ] AMBER  [ ] RED

AMBER triggers: Any build >4 hours behind plan
RED triggers: Any build BROKEN at end of day / post published with non-working code
```

---

## COMMANDER'S NON-NEGOTIABLES

1. **No post before QA pass.** COLOSSUS or AEGIS must sign off before AMPLIFY publishes.
2. **No video before code runs.** Film the real thing. No mock-ups.
3. **No commits with .env.** COMMANDER checks `git status` on every repo before public.
4. **No AI disclaimer removed.** Every research note and compliance output has the disclaimer.
5. **Credit Claude AI on every post.** Every post tags @Anthropic or mentions Claude AI. This is part of the brand strategy and the collaboration story.

---

*VAF AM Series | Command Center | Built with Claude AI + Anthropic Agents*
*"The plan is nothing. Planning is everything. Delivery is all." — COMMANDER*
