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
git clone https://github.com/YOUR_USERNAME/career-ops.git
cd career-ops
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

## 9. Configure Your Profile

Copy the example profile and edit it with your details:

```bash
cp config/profile.example.yml config/profile.yml
```

Open the file and fill in your name, email, location, compensation targets, and preferences.

Then create your CV:

```bash
# Create cv.md with your resume in markdown format
# You can use the example as a starting point:
cp examples/cv-example.md cv.md
```

Edit `cv.md` with your actual experience.

---

## 10. Configure Portals

Copy the portal configuration:

```bash
cp templates/portals.example.yml portals.yml
```

Edit `portals.yml` to add/remove companies you want to scan.

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

## 14. Start Using opencode

```bash
cd career-ops
opencode
```

This launches the interactive CLI. Type your requests directly — for example:

- "Evaluate this job URL: https://..."
- "Run a batch scan of all portals"
- "Show me my pipeline summary"

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
