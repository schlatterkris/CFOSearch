# Startup Guide — macOS

Step-by-step guide for a brand new Mac user with no prerequisites installed.

---

## 1. Install Homebrew

Homebrew is the macOS package manager. Open **Terminal** (Finder > Applications > Utilities > Terminal) and run:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the on-screen prompts. It may ask for your password.

After installation, run the two lines it prints at the end (they add Homebrew to your PATH), or do:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Verify it worked:

```bash
brew --version
```

---

## 2. Install Node.js and npm

```bash
brew install node
```

Verify:

```bash
node --version   # Should show v18 or later
npm --version
```

---

## 3. Install Go

```bash
brew install go
```

Verify:

```bash
go version
```

---

## 4. Install Ollama

Ollama runs local LLMs on your Mac.

```bash
brew install ollama
```

Start the Ollama service:

```bash
ollama serve
```

Open a **second Terminal window** and pull a model (this downloads ~4-7 GB):

```bash
ollama pull llama3.2
```

You can also try smaller/faster models:

```bash
ollama pull phi3
ollama pull mistral
```

Keep `ollama serve` running in the background.

---

## 5. Install opencode

```bash
brew install opencode
```

If not yet in Homebrew, install via npm:

```bash
npm install -g @opencode/cli
```

Verify:

```bash
opencode --version
```

---

## 6. Install Playwright

Playwright is needed for PDF generation and portal scanning.

```bash
npx playwright install chromium
```

---

## 7. Clone the Project

Replace `YOUR_USERNAME` below:

```bash
git clone https://github.com/schlatterkris/CFOSearch
cd CFOSearch
```

Install npm dependencies:

```bash
npm install
```

---

## 8. Verify Setup

```bash
npm run doctor
```

This checks that all files and dependencies are in place. If anything is missing, the output will tell you what to fix.

---

## 9. Validate Your Profile
I preconfigured the profile and your CV for you so it should be good to start.  You can view and verify it at
:

```bash
config/profile.yml
cv.md
```

Edit `cv.md` with any other actual experience.


## 10. Start Using opencode

```bash
cd career-ops
opencode
```

This launches the interactive CLI. Type your requests directly — for example:

- "Evaluate this job URL: https://..."
- "Run a batch scan of all portals"
- "Show me my pipeline summary"

Using opencode allows you to interact in a natural way so instead of remembering the commands below you can just ask it to "run a scan" "Start the web dashboard" etc.  This with ollama will allow you to interact with it like you would a person.  Just start a command line screen -> navigate to the CFOSearch folder with everything in it -> type opencode.  Now you can just ask it questions in no particular format.

---

## Data Layers

The project separates your personal data from system files so updates never overwrite your work.

**User Layer** (never touched by updates) — your CV, profile, tracker entries, reports, PDFs, and any file you customize:

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

**System Layer** (safe to auto-update) — scripts, templates, modes, dashboard, and docs. These can be safely replaced with new versions from the upstream repo.

**The golden rule:** User files are never read, modified, or deleted by any update process. See [`DATA_CONTRACT.md`](DATA_CONTRACT.md) for the full list.

---


## 11. Run a Scan

```bash
npm run scan
```

This will scan all configured job portals and add matching results to your pipeline.

---

## 12. View the Dashboard

Build and start the web dashboard:

```bash
cd dashboard
go build -o web ./cmd/web/
./web -port 8080
```

Open your browser to **http://localhost:8080**.

---

## 13. Generate a PDF CV

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
Restart your Terminal after installing via Homebrew, or run `eval "$(/opt/homebrew/bin/brew shellenv)"`.

**Port 8080 already in use**
Use a different port: `./web -port 8081`

**Ollama not responding**
Make sure `ollama serve` is running in the background.

**Playwright errors**
Run `npx playwright install chromium` again.

**Permission errors with npm**
Do not use `sudo`. Install node via Homebrew (it handles permissions correctly).
