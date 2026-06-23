# Startup Guide - macOS (No Sudo)

Step-by-step guide for a brand new Mac user with **no prerequisites and no sudo required**.

Everything installs to your home directory only. No password prompts.

---

## 1. Install Node.js and npm (via nvm)

nvm (Node Version Manager) installs Node in your home directory - no sudo needed.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
```

Restart your terminal (or run `source ~/.zshrc`), then:

```bash
nvm install 22
nvm alias default 22
```

Verify:

```bash
node --version   # Should show v22 or later
npm --version
```

> **If you already have Homebrew:** `brew install node` also works but may ask for your password once.

---

## 2. Install Go (manual, no sudo)

Download and extract Go to your home directory:

```bash
# Apple Silicon (M1/M2/M3/M4):
curl -LO https://go.dev/dl/go1.24.4.darwin-arm64.tar.gz

# Intel Mac:
# curl -LO https://go.dev/dl/go1.24.4.darwin-amd64.tar.gz

mkdir -p ~/.local
tar -C ~/.local -xzf go1.24.4.darwin-arm64.tar.gz

# Add to PATH:
echo 'export PATH=$HOME/.local/go/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

Verify:

```bash
go version
```

> **If you already have Homebrew:** `brew install go` also works.

---

## 3. Install Ollama (no sudo)

Download and install to your Applications folder:

```bash
curl -LO https://ollama.ai/download/Ollama-darwin.zip
unzip -q Ollama-darwin.zip -d ~/Applications/
```

Launch Ollama:

```bash
open ~/Applications/Ollama.app
```

Or start the CLI server in the background:

```bash
ollama serve &
```

Pull a model (this downloads ~4-7 GB):

```bash
ollama pull llama3.2
```

You can also try smaller/faster models:

```bash
ollama pull phi3
ollama pull mistral
```

Keep `ollama serve` running in the background while using the project.

> **If you already have Homebrew:** `brew install ollama` also works.

---

## 4. Install opencode (via npm, no sudo)

First, configure npm to install globally to your home directory (avoids sudo):

```bash
mkdir -p ~/.npm-global
npm config set prefix ~/.npm-global
echo 'export PATH=$HOME/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

Then install opencode:

```bash
npm install -g @opencode/cli
```

Verify:

```bash
opencode --version
```

> **If you already have Homebrew:** `brew install opencode` also works.

---

## 5. Clone the Project

```bash
git clone https://github.com/schlatterkris/CFOSearch
cd CFOSearch
```

Install npm dependencies:

```bash
npm install
```

---

## 6. Install Playwright

Playwright is needed for PDF generation and portal scanning.
Installs to `~/Library/Caches/ms-playwright` - no sudo needed.

```bash
npx playwright install chromium
```

---

## 7. Verify Setup

```bash
npm run doctor
```

This checks that all files and dependencies are in place. If anything is missing, the output will tell you what to fix.

---

## 8. Validate Your Profile

I preconfigured the profile and your CV for you so it should be good to start. You can view and verify it at:

```bash
config/profile.yml
cv.md
```

Edit `cv.md` with any other actual experience.

---

## 9. Start Using opencode

```bash
opencode
```

This launches the interactive CLI. Type your requests directly - for example:

- "Evaluate this job URL: https://..."
- "Run a batch scan of all portals"
- "Show me my pipeline summary"

Using opencode allows you to interact in a natural way so instead of remembering the commands below you can just ask it to "run a scan" "Start the web dashboard" etc. This with ollama will allow you to interact with it like you would a person. Just start a command line screen -> navigate to the CFOSearch folder with everything in it -> type opencode. Now you can just ask it questions in no particular format.

---

## Data Layers

The project separates your personal data from system files so updates never overwrite your work.

**User Layer** (never touched by updates) - your CV, profile, tracker entries, reports, PDFs, and any file you customize:

| File | Purpose |
|------|---------|
| `cv.md` | Your CV |
| `config/profile.yml` | Your identity, targets, comp range |
| `portals.yml` | Your customized company list |
| `data/applications.md` | Application tracker |
| `data/pipeline.md` | URL inbox |
| `data/scan-history.tsv` | Scan history |
| `reports/*` | Evaluation reports |
| `output/*` | Generated PDFs |
| `jds/*` | Saved job descriptions |
| `interview-prep/*` | Interview prep materials |

**System Layer** (safe to auto-update) - scripts, templates, modes, dashboard, and docs. These can be safely replaced with new versions from the upstream repo.

**The golden rule:** User files are never read, modified, or deleted by any update process. See [`DATA_CONTRACT.md`](DATA_CONTRACT.md) for the full list.

---

## 10. Run a Scan

```bash
npm run scan
```

This will scan all configured job portals and add matching results to your pipeline.

---

## 11. View the Dashboard

Build and start the web dashboard:

```bash
cd dashboard
go build -o web ./cmd/web/
./web -port 8080
```

Open your browser to **http://localhost:8080**.

---

## 12. Generate a PDF CV

```bash
npm run pdf
```

Creates an ATS-optimized PDF in the `output/` directory.

---

## Common Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run scan` | Scan job portals |
| `npm run doctor` | Validate setup |
| `npm run verify` | Pipeline health check |
| `npm run normalize` | Normalize statuses |
| `npm run dedup` | Dedup tracker |
| `npm run pdf` | Generate ATS PDF |
| `cd dashboard && go build -o web ./cmd/web/ && ./web -port 8080` | Launch web dashboard |

---

## Troubleshooting

**"command not found: go/node/npm"**
Restart your Terminal after installation, or run `source ~/.zshrc`.

**Port 8080 already in use**
Use a different port: `./web -port 8081`

**Ollama not responding**
Make sure `ollama serve` is running in the background.

**Playwright errors**
Run `npx playwright install chromium` again.

**npm global install requires sudo**
You forgot to set the npm prefix. Run:
```bash
mkdir -p ~/.npm-global
npm config set prefix ~/.npm-global
echo 'export PATH=$HOME/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

**Why no Homebrew?**
Homebrew is a great package manager, but its installer requires sudo to create `/opt/homebrew/`. This guide uses only user-local installs so nothing ever asks for a password. If you prefer Homebrew, all `brew install` commands are noted as alternatives.
