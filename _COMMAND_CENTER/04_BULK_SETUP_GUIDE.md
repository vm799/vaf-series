# ⚡ BULK SETUP GUIDE — Do This NOW Before You Write One Line of Code
> VAF AM Series | Pre-Build Infrastructure
> Complete this in one sitting. ~45 minutes. Then building is frictionless.

---

## STEP 1 — CREATE ALL 9 GITHUB REPOSITORIES

### Option A: GitHub CLI (fastest — do this)
```bash
# Install GitHub CLI if not already installed
brew install gh

# Authenticate
gh auth login

# Create all 9 repos in one script — run this entire block
for repo in \
  "vaf-am-build-01-ingestion" \
  "vaf-am-build-02-sanitisation" \
  "vaf-am-build-03-identity" \
  "vaf-am-build-04-rag" \
  "vaf-am-build-05-self-evolving" \
  "vaf-am-build-06-council" \
  "vaf-am-build-07-compliance" \
  "vaf-am-build-08-synthesis" \
  "vaf-am-build-09-output"; do
    gh repo create vm799/$repo \
      --public \
      --description "VAF AM Series — Built with Claude AI + Anthropic Agents" \
      --clone
    echo "✓ Created: $repo"
done
```

### Option B: Manual (if CLI not available)
Go to https://github.com/new and create each repo:

| Repo Name | Description |
|-----------|-------------|
| `vaf-am-build-01-ingestion` | VAF AM Series: Multi-Source Data Ingestion — Built with Claude AI |
| `vaf-am-build-02-sanitisation` | VAF AM Series: Deterministic Sanitisation — Built with Claude AI |
| `vaf-am-build-03-identity` | VAF AM Series: Identity & Persona Files — Built with Claude AI |
| `vaf-am-build-04-rag` | VAF AM Series: RAG + Vector Memory — Built with Claude AI |
| `vaf-am-build-05-self-evolving` | VAF AM Series: Self-Evolving Loop — Built with Claude AI |
| `vaf-am-build-06-council` | VAF AM Series: Parallel Investment Research Council — Built with Claude AI |
| `vaf-am-build-07-compliance` | VAF AM Series: FCA Compliance Checker — Built with Claude AI |
| `vaf-am-build-08-synthesis` | VAF AM Series: PM Morning Brief Synthesis — Built with Claude AI |
| `vaf-am-build-09-output` | VAF AM Series: Output Channels (Telegram + Slack) — Built with Claude AI |

**Settings for every repo:**
- ✅ Public
- ✅ Add README (will be overwritten)
- ✅ Add .gitignore → Python
- ✅ License: MIT

---

## STEP 2 — GET YOUR API KEYS (all in one session)

### Anthropic API Key (required for ALL builds)
1. Go to: https://console.anthropic.com/settings/keys
2. Click "Create Key"
3. Name it: `VAF-AM-Series`
4. Copy immediately — you only see it once
5. Save to: 1Password / Keychain as `ANTHROPIC_API_KEY_VAF_AM`

### Telegram Bot Token (required for Build 09)
1. Open Telegram → search `@BotFather`
2. Send: `/newbot`
3. Name: `VAF AM Series Bot`
4. Username: `vaf_am_series_bot` (or similar)
5. Copy the token → save as `TELEGRAM_BOT_TOKEN`
6. Get your Chat ID:
   - Message your bot once
   - Visit: `https://api.telegram.org/bot{YOUR_TOKEN}/getUpdates`
   - Find `"chat":{"id":XXXXXXXX}` → that's your `TELEGRAM_CHAT_ID`

### Slack Bot Token (optional for Build 09)
1. Go to: https://api.slack.com/apps → Create New App
2. Name: `VAF AM Series`
3. From scratch → select your workspace
4. OAuth & Permissions → Bot Token Scopes → add: `chat:write`, `chat:write.public`
5. Install to workspace → copy `Bot User OAuth Token` (starts with `xoxb-`)
6. Save as `SLACK_BOT_TOKEN`
7. Get Channel ID: right-click channel → View channel details → copy ID (starts with C)
8. Save as `SLACK_CHANNEL_ID`

---

## STEP 3 — SET UP SHARED .env MASTER FILE

Create this file on your Mac (NOT in any Git repo):
`~/Documents/VAF_AM_Series/.env.master`

```bash
mkdir -p ~/Documents/VAF_AM_Series
cat > ~/Documents/VAF_AM_Series/.env.master << 'EOF'
# VAF AM Series — Master Environment
# Source this or copy to each build as needed

ANTHROPIC_API_KEY=sk-ant-...paste-here...
TELEGRAM_BOT_TOKEN=...paste-here...
TELEGRAM_CHAT_ID=...paste-here...
SLACK_BOT_TOKEN=xoxb-...paste-here...
SLACK_CHANNEL_ID=C...paste-here...
EOF
chmod 600 ~/Documents/VAF_AM_Series/.env.master
echo "Master .env created and secured"
```

Then for each build, symlink or copy:
```bash
# For each build folder (run before starting each build)
cp ~/Documents/VAF_AM_Series/.env.master ./builds/build_XX/.env
```

---

## STEP 4 — INSTALL uv (Python package manager)

```bash
# Install uv (faster than pip + venv combined)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Verify
uv --version
# Expected: uv 0.5.x or later
```

---

## STEP 5 — CLONE ALL REPOS AND SCAFFOLD

```bash
# Create local working directory
mkdir -p ~/Developer/VAF_AM_Series
cd ~/Developer/VAF_AM_Series

# Clone all repos
gh repo clone vm799/vaf-am-build-01-ingestion
gh repo clone vm799/vaf-am-build-02-sanitisation
gh repo clone vm799/vaf-am-build-03-identity
gh repo clone vm799/vaf-am-build-04-rag
gh repo clone vm799/vaf-am-build-05-self-evolving
gh repo clone vm799/vaf-am-build-06-council
gh repo clone vm799/vaf-am-build-07-compliance
gh repo clone vm799/vaf-am-build-08-synthesis
gh repo clone vm799/vaf-am-build-09-output

echo "All repos cloned"
ls -la
```

---

## STEP 6 — COPY PRESS PACK ASSETS TO EACH REPO

```bash
# From wherever you have the VAF_AM_SERIES folder:
for i in 01 02 03 04 05 06 07 08 09; do
  BUILD_NAMES=(
    "INGESTION" "SANITISATION" "IDENTITY" "RAG"
    "SELF_EVOLVING" "COUNCIL" "COMPLIANCE" "SYNTHESIS" "OUTPUT"
  )
  # Copy README and press_pack to each repo
  echo "Copy BUILD_${i} assets to repo"
done
```

---

## STEP 7 — SET UP SCREEN RECORDING

For video demos you need:
- **QuickTime Player** (built in) — File → New Screen Recording
- Or **Screenflow** / **OBS** for more control

**Settings:**
- Resolution: 1920×1080 minimum
- Terminal theme: Dark (iTerm2 → Profiles → Colors → Dark Background)
- Terminal font size: 18pt (legibility on mobile)
- Hide desktop icons: `defaults write com.apple.finder CreateDesktop false && killall Finder`

---

## STEP 8 — LINKEDIN + YOUTUBE PRE-SETUP

### LinkedIn
- [ ] Profile updated to reflect "AI Builder + Educator | Asset Management"
- [ ] Featured section ready to add series content
- [ ] Creator Mode enabled (Settings → Visibility → Creator mode)
- [ ] Post scheduling tool ready (Buffer or LinkedIn native scheduler)

### YouTube (for hero video + Shorts)
- [ ] Channel created or verified: `Vaishali Mehmi` or `V AgentForce`
- [ ] Channel description updated: "Finance professional building AI systems for asset management."
- [ ] Upload defaults set to Unlisted until ready to publish

---

## STEP 9 — SAMPLE DATA FILES

Download/create these before Monday:

| File | Source | Used In |
|------|--------|---------|
| Sample earnings transcript PDF | Any public earnings call transcript (GSK, AZN on investor pages) | Builds 01, 04 |
| Sample fund factsheet PDF | Any public fund factsheet (Schroders, Fidelity public docs) | Build 04 |
| Sample compliance letter (with violations) | Create yourself using the template in BUILD_07 | Build 07 |

```bash
# Create the violation letter sample for Build 07 demo
mkdir -p ~/Developer/VAF_AM_Series/vaf-am-build-07-compliance/data
cat > ~/Developer/VAF_AM_Series/vaf-am-build-07-compliance/data/violation_letter.txt << 'EOF'
Dear Mr Smith,

Following our meeting last week, I am pleased to present our UK Equity Fund
as an exciting guaranteed opportunity for your portfolio.

Our fund has delivered strong past performance and we are confident you will
see similar returns going forward. There is minimal risk to your capital and
we recommend an immediate investment of £50,000.

Regards,
Investment Team
EOF
echo "Sample violation letter created"
```

---

## KEY LINKS — BOOKMARK THESE NOW

| Resource | URL |
|----------|-----|
| Anthropic Console (API keys) | https://console.anthropic.com/settings/keys |
| Anthropic Docs | https://docs.anthropic.com |
| Claude Models reference | https://docs.anthropic.com/en/docs/about-claude/models |
| GitHub (your profile) | https://github.com/vm799 |
| GitHub New Repo | https://github.com/new |
| Telegram BotFather | https://t.me/BotFather |
| Slack API Apps | https://api.slack.com/apps |
| uv docs | https://docs.astral.sh/uv |
| sqlite-vec docs | https://alexgarcia.xyz/sqlite-vec |
| feedparser docs | https://feedparser.readthedocs.io |
| pdfplumber docs | https://github.com/jsvine/pdfplumber |

---

## PRE-WEEK SANITY CHECK

Run this the Sunday night before you start:

```bash
# Verify everything is ready
echo "=== VAF AM Series Pre-Build Check ==="

# Python version
python3 --version  # Expect: Python 3.11+

# uv installed
uv --version  # Expect: uv 0.5+

# GitHub CLI
gh auth status  # Expect: Logged in as vm799

# Repos exist
gh repo list vm799 --limit 20 | grep vaf-am

# Env file exists
ls ~/Documents/VAF_AM_Series/.env.master && echo "✓ .env.master present"

# Test Anthropic key
python3 -c "
import anthropic, os
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path.home() / 'Documents/VAF_AM_Series/.env.master')
c = anthropic.Anthropic()
r = c.messages.create(model='claude-sonnet-4-5', max_tokens=10,
    messages=[{'role':'user','content':'ping'}])
print('✓ Anthropic API key working')
"

echo "=== Pre-Build Check Complete ==="
```

---

**Complete all 9 steps above before Monday 07:00. Building then becomes the only job.**

---

*VAF AM Series | Bulk Setup Guide | github.com/vm799*
*Built with Claude AI + Anthropic Agents*
